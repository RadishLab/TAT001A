import { extent } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { curveBasis, line } from 'd3-shape';
import { timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart2 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = 'illicit-inset2';
    this.yLabel = this.getTranslation('Cartons or carton equivalent (thousands)');
    this.yAxisTickFormat = d => format('d')(d / 1000);
    this.legendItems = [];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('illicit-2.csv'), (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.year);
            row.value = +row['Cartons or carton equivalent'];
            return row;
          });
        resolve([{ key: 'cartons', values: mappedData }]);
      });
    });
  }

  onDataLoaded(data) {
    this.x = this.createXScale();
    this.y = this.createYScale();
    this.colors = this.createZScale();
    this.line = line()
      .curve(curveBasis)
      .x(this.lineXAccessor.bind(this))
      .y(this.lineYAccessor.bind(this));
    this.render();
  }

  render() {
    super.render();
    this.renderBanLine();
  }

  renderBanLine() {
    const lineCreator = line()
      .x(d => this.x(d[0]))
      .y(d => this.y(d[1]));

    const banYear = new Date(2015, 0, 1);
    const yExtent = this.getYExtent();
    const lineSelection = this.root.selectAll('.line.ban')
      .data([[
        [banYear, yExtent[0]],
        [banYear, yExtent[1]]
      ]])
      .enter().append('g')
        .classed('line ban', true);

    lineSelection.append('path')
      .style('stroke', '#585857')
      .style('fill', 'none')
      .style('stroke-dasharray', '5,5')
      .style('stroke-width', 0.75)
      .attr('d', d => lineCreator(d));

    lineSelection.append('text')
      .text(this.getTranslation('Menthol ban'))
      .attr('x', this.x(banYear) + 3)
      .attr('y', 10)
      .style('fill', '#585858')
      .style('font-size', '10px');
  }

  createMargin() {
    const margin = super.createMargin();
    margin.bottom = this.legendOrientation() === 'horizontal' ? 45 : 60;
    margin.right = 20;
    margin.top = 5;
    return margin;
  }

  lineXAccessor(d) {
    return this.x(d.year);
  }

  lineYAccessor(d) {
    return this.y(d.value);
  }

  createXScale() {
    const values = this.data.reduce((valueArray, value) => valueArray.concat(value.values), []);
    return scaleTime()
      .range([0, this.chartWidth])
      .domain(extent(values, d => d.year));
  }

  getYExtent() {
    const values = this.data.reduce((valueArray, value) => valueArray.concat(value.values), []);
    let yExtent = extent(values, d => d.value);
    yExtent[0] = Math.min(0, yExtent[0]);
    return yExtent;
  }

  createYScale() {
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(this.getYExtent());
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }
}
