import { max, min } from 'd3-array';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart2 extends BarChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.yLabel = 'Secondhand smoke exposure (%)';
    this.yTicks = 6;
    this.legendItems = [
      { label: 'Home', value: 'home' },
      { label: 'Work', value: 'work' },
      { label: 'Restaurant', value: 'restaurant' }
    ];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/5-2.csv', (csvData) => {
        resolve(csvData.map(d => {
          d.Home = +d.Home;
          d.Work = +d.Work;
          d.Restaurant = +d.Restaurant;
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
    const values = this.data.reduce((valueArray, d) => valueArray.concat([
      d.Home,
      d.Work,
      d.Restaurant
    ]), []);
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  getXValue(d) {
    return d['Country']
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 3;

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(this.getXValue(d)))
        .attr('width', barWidth)
        .attr('y', d => this.y(d.Home))
        .attr('height', d => this.chartHeight - this.y(d.Home))
        .attr('fill', this.colors('home'));

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(this.getXValue(d)) + barWidth)
        .attr('width', barWidth)
        .attr('y', d => this.y(d.Work))
        .attr('height', d => this.chartHeight - this.y(d.Work))
        .attr('fill', this.colors('work'));

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(this.getXValue(d)) + barWidth * 2)
        .attr('width', barWidth)
        .attr('y', d => this.y(d.Restaurant))
        .attr('height', d => this.chartHeight - this.y(d.Restaurant))
        .attr('fill', this.colors('restaurant'));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }
}
