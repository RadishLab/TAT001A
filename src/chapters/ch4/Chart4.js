import { max, min } from 'd3-array';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export class Chart4 extends BarChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.yLabel = 'Cigarette Consumption';
    this.yTicks = 6;
    this.legendItems = [
      { label: '1980', value: '1980' },
      { label: '2016', value: '2016' },
    ];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/4-4.csv', (csvData) => {
        resolve(csvData.map(d => {
          d['1980'] = +d['1980'];
          d['2016'] = +d['2016'];
          return d;
        }));
      });
    });
  }

  createXScale() {
    const values = this.data.map(d => d['region']);
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
        .attr('x', d => this.x(d['region']))
        .attr('width', barWidth)
        .attr('y', d => this.y(d['1980']))
        .attr('height', d => this.chartHeight - this.y(d['1980']))
        .attr('fill', this.colors('1980'));

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(d['region']) + barWidth)
        .attr('width', barWidth)
        .attr('y', d => this.y(d['2016']))
        .attr('height', d => this.chartHeight - this.y(d['2016']))
        .attr('fill', this.colors('2016'));
  }

  createYScale() {
    const values = this.data.reduce((valueArray, d) => valueArray.concat([d['1980'], d['2016']]), []);
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
