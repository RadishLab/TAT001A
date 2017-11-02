import { max, min } from 'd3-array';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export class Chart4 extends BarChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.yLabel = 'Lung cancer mortality rate (per 100k)';
    this.yTicks = 6;
    this.legendItems = [
      { label: 'Poland (2011)', value: 'Poland (2011)' },
      { label: 'United States, non-Hispanic whites (2010)', value: 'United States, non-Hispanic whites (2010)' },
    ];
  }

  createMargin() {
    const margin = super.createMargin();
    margin.bottom = 40;
    return margin;
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/8-4.csv', (csvData) => {
        resolve(csvData.map(d => {
          d['Mortality rate'] = +d['Mortality rate'];
          return d;
        }));
      });
    });
  }

  createXScale() {
    const values = this.data.map(this.getXValue);
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  createYScale() {
    const values = this.data.map(d => d['Mortality rate']);
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  getXValue(d) {
    return `${d['Country']}:${d['Education level']}`;
  }

  xAxisTickFormat(d) {
    return d.split(':')[1];
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth();

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(this.getXValue(d)))
        .attr('width', barWidth)
        .attr('y', d => this.y(d['Mortality rate']))
        .attr('height', d => this.chartHeight - this.y(d['Mortality rate']))
        .attr('fill', d => this.colors(d['Country']));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }
}
