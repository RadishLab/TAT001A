import { max, min } from 'd3-array';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export class Chart3 extends BarChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.yLabel = 'Smoking Prevalence';
    this.yTicks = 6;
    this.legendItems = [
      { label: 'Lowest Wealth Group', value: 'Lowest Wealth Group' },
      { label: 'Highest Wealth Group', value: 'Highest Wealth Group' },
    ];
    this.yAxisTickFormat = (d => `${d}%`);
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/9-3.csv', (csvData) => {
        resolve(csvData.map(d => {
          d['Lowest Wealth Group'] = +d['Lowest Wealth Group'];
          d['Highest Wealth Group'] = +d['Highest Wealth Group'];
          return d;
        }));
      });
    });
  }

  createXScale() {
    const values = this.data.map(d => d['Country']);
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
        .attr('x', d => this.x(d['Country']))
        .attr('width', barWidth)
        .attr('y', d => this.y(d['Lowest Wealth Group']))
        .attr('height', d => this.chartHeight - this.y(d['Lowest Wealth Group']))
        .attr('fill', this.colors('Lowest Wealth Group'));

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(d['Country']) + barWidth + 2)
        .attr('width', barWidth)
        .attr('y', d => this.y(d['Highest Wealth Group']))
        .attr('height', d => this.chartHeight - this.y(d['Highest Wealth Group']))
        .attr('fill', this.colors('Highest Wealth Group'));
  }

  createYScale() {
    const values = this.data.reduce((valueArray, d) => valueArray.concat([d['Lowest Wealth Group'], d['Highest Wealth Group']]), []);
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