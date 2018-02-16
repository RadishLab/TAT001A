import { extent } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { curveBasis, line } from 'd3-shape';
import { timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart1 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = 'illicit-1';
    this.yLabel = this.getTranslation('Price (£)');
    this.yLabelRight = this.getTranslation('Deaths Caused by Smoking (%)');
    this.yAxisTickFormat = format('d');
    this.yAxisRightTickFormat = format('d');
    this.legendItems = [
      { label: this.getTranslation('Price per pack, inflation-adjusted'), value: 'price' },
      { label: this.getTranslation('Illicit consumption'), value: 'consumption' }
    ];
  }

  createMargin() {
    const margin = super.createMargin();
    margin.right = 30;
    margin.bottom = this.legendOrientation() === 'horizontal' ? 50 : 50;
    if (this.options.web) margin.bottom = 70;
    margin.right = this.options.web ? 50 : 30;
    margin.top = 2;
    return margin;
  }

  onDataLoaded(data) {
    this.yRight = this.createConsumptionYScale();
    super.onDataLoaded(data);
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('illicit-1.csv'), (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.year);
            row.consumption = +row['Illicit consumption'];
            row.price = +row['Price per pack, inflation-adjusted'];
            return row;
          });
        resolve(mappedData);
      });
    });
  }

  lineXAccessor(d) {
    return this.x(d.year);
  }

  lineYAccessor(d) {
    return this.y(d.price);
  }

  lineY2Accessor(d) {
    return this.yRight(d.consumption);
  }

  createXScale() {
    return scaleTime()
      .range([0, this.chartWidth])
      .domain(extent(this.data, d => d.year));
  }

  createYScale() {
    const values = this.data.map(d => d.price);
    let yExtent = extent(values);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createConsumptionYScale() {
    const values = this.data.map(d => d.consumption);
    let yExtent = extent(values);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  renderLines() {
    // Price
    let lineCreator = line()
      .curve(curveBasis)
      .x(this.lineXAccessor.bind(this))
      .y(d => this.y(d.price));

    let lineSelection = this.root.selectAll('.line.price')
      .data([this.data])
      .enter().append('g')
        .classed('line price', true);

    lineSelection.append('path')
      .style('stroke', d => this.colors('price'))
      .attr('d', d => lineCreator(d));

    // Consumption
    lineSelection = this.root.selectAll('.line.consumption')
      .data([this.data])
      .enter().append('g')
        .classed('line consumption', true);

    lineCreator = line()
      .curve(curveBasis)
      .x(this.lineXAccessor.bind(this))
      .y(this.lineY2Accessor.bind(this));

    lineSelection.append('path')
      .style('stroke', d => this.colors('consumption'))
      .attr('d', d => lineCreator(d));
  }
}
