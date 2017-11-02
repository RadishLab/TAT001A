import { max, min } from 'd3-array';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export class Chart3 extends BarChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.yLabel = 'Percentage with Monitoring';
    this.yTicks = 6;
    this.legendItems = [];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/4-3.csv', (csvData) => {
        resolve(csvData.map(d => {
          d['With monitoring'] = +d['With monitoring'];
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
      d['With monitoring'],
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
    return d['Row Labels']
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth();

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(this.getXValue(d)))
        .attr('width', barWidth)
        .attr('y', d => this.y(d['With monitoring']))
        .attr('height', d => this.chartHeight - this.y(d['With monitoring']))
        .attr('fill', this.colors('With monitoring'));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }
}
