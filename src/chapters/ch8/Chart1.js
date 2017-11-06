import { max, min } from 'd3-array';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export class Chart1 extends BarChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.yLabel = 'Deaths';
    this.yTicks = 6;
    this.legendItems = [
      { label: 'Male deaths', value: 'Male deaths' },
      { label: 'Female deaths', value: 'Female deaths' },
    ];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/8-1.csv', (csvData) => {
        resolve(csvData.map(d => {
          d['Male deaths'] = +d['Male deaths'];
          d['Female deaths'] = +d['Female deaths'];
          return d;
        }));
      });
    });
  }

  createXScale() {
    const values = this.data.map(d => d['WHO Region']);
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 2;

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(d['WHO Region']))
        .attr('width', barWidth)
        .attr('y', d => this.y(d['Male deaths']))
        .attr('height', d => this.chartHeight - this.y(d['Male deaths']))
        .attr('fill', this.colors('Male deaths'));

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(d['WHO Region']) + barWidth + 2)
        .attr('width', barWidth)
        .attr('y', d => this.y(d['Female deaths']))
        .attr('height', d => this.chartHeight - this.y(d['Female deaths']))
        .attr('fill', this.colors('Female deaths'));
  }

  createYScale() {
    const values = this.data.reduce((valueArray, d) => valueArray.concat([d['Male deaths'], d['Female deaths']]), []);
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }
}