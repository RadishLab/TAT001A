import { extent } from 'd3-array';
import { axisRight } from 'd3-axis';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { curveBasis, line } from 'd3-shape';
import { timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart4 extends LineChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.xLabel = 'Year';
    this.yLabel = 'Number of Factories';
    this.legendItems = [
      { label: 'Factories', value: 'factories' },
      { label: 'Share Dividend', value: 'dividend' },
    ];
    this.yAxisTickFormat = format('.2s');
  }

  createMargin() {
    const margin = super.createMargin();
    margin.right = 30;
    return margin;
  }

  onDataLoaded(data) {
    this.dividendScale = this.createDividendScale();
    super.onDataLoaded(data);
  }

  render() {
    super.render();
    this.renderRightAxis();
  }

  renderRightAxis() {
    const yAxis = axisRight(this.dividendScale)
      .ticks(5);
    const yAxisGroup = this.root.append('g')
      .classed('axis axis-y', true);
    yAxisGroup
      .attr('transform', `translate(${this.chartWidth}, 0)`)
      .call(yAxis)
      .append('text')
        .classed('axis-title', true)
        .attr('transform', `translate(27, ${this.chartHeight / 2}) rotate(-90)`)
        .text('Dividend per Share (£)');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/2-4.csv', (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.year);
            row.factories = +row.Factories;
            row.dividend = +row['Share Dividend']
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
    return this.y(d.factories);
  }

  lineY2Accessor(d) {
    return this.dividendScale(d.dividend);
  }

  createXScale() {
    return scaleTime()
      .range([0, this.chartWidth])
      .domain(extent(this.data, d => d.year));
  }

  createYScale() {
    const prevalenceValues = this.data
      .map(d => d.factories);
    let yExtent = extent(prevalenceValues);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createDividendScale() {
    const values = this.data.map(d => d.dividend);
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
    // Factories
    let lineCreator = line()
      .curve(curveBasis)
      .x(this.lineXAccessor.bind(this))
      .y(this.lineYAccessor.bind(this));

    let lineSelection = this.root.selectAll('.line.factories')
      .data([this.data])
      .enter().append('g')
        .classed('line factories', true);

    lineSelection.append('path')
      .style('stroke', d => this.colors('factories'))
      .attr('d', d => lineCreator(d));

    // Dividend
    lineSelection = this.root.selectAll('.line.dividend')
      .data([this.data])
      .enter().append('g')
        .classed('line dividend', true);

    lineCreator = line()
      .curve(curveBasis)
      .x(this.lineXAccessor.bind(this))
      .y(this.lineY2Accessor.bind(this));

    lineSelection.append('path')
      .style('stroke', d => this.colors('dividend'))
      .attr('d', d => lineCreator(d));
  }
}