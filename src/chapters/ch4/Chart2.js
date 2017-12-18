import { extent } from 'd3-array';
import { nest } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart2 extends LineChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.figurePrefix = '4-inset2';
    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Smoking Prevalence (%)');
    this.legendItems = [
      { label: this.getTranslation('Niger'), value: 'Niger' },
      { label: this.getTranslation('Congo'), value: 'Congo' },
      { label: this.getTranslation('Lesotho'), value: 'Lesotho' },
      { label: this.getTranslation('Mauritania'), value: 'Mauritania' },
    ];
    this.yAxisTickFormat = format('.2d');
  }

  createMargin() {
    const margin = super.createMargin();
    margin.top = 10;
    margin.right = 10;
    margin.bottom = this.legendOrientation() === 'horizontal' ? 32 : 58;
    return margin;
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/4-2.csv', (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.year);
            row.value = +row.value;
            return row;
          });
        this.flatData = mappedData;

        const nestedData = nest()
          .key(d => d.country)
          .entries(mappedData);
        resolve(nestedData);
      });
    });
  }

  lineXAccessor(d) {
    return this.x(d.year);
  }

  lineYAccessor(d) {
    return this.y(d.value);
  }

  createXScale() {
    return scaleTime()
      .range([0, this.chartWidth])
      .domain(extent(this.flatData, d => d.year));
  }

  createYScale() {
    let yExtent = extent(this.flatData, d => d.value);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  renderCircles() {
    const circleGroups = this.root.selectAll('.circle')
      .data(this.flatData)
      .enter().append('g');

    circleGroups.append('circle')
      .attr('cx', d => this.x(d.year))
      .attr('cy', d => this.y(d.value))
      .attr('r', 1.5);
  }

  render() {
    super.render();
    this.renderCircles();

    let xAxisHeight = this.parent.select('.axis-x .tick').node().getBBox().height + 18;
    this.parent.select('.axis-x .axis-title')
      .attr('transform', `translate(${this.chartWidth / 2}, ${xAxisHeight})`);
  }
}
