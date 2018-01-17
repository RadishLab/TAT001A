import { max, min } from 'd3-array';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart6 extends BarChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.figurePrefix = '5-inset6';
    this.yLabel = this.getTranslation('Estimated Prevalence (%)');
    this.yTicks = 6;
    this.legendItems = [];
    this.xAxisTickFormat = this.getTranslation.bind(this);
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/5-6.csv', (csvData) => {
        resolve(csvData.map(d => {
          d.region = d['WHO Region'];
          d.value = +d['Estimated prevalence (%) for both sexes'];
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
      d.value,
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
    return d.region;
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth();

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(this.getXValue(d)))
        .attr('width', barWidth)
        .attr('y', d => this.y(d.value))
        .attr('height', d => this.chartHeight - this.y(d.value))
        .attr('fill', this.colors('With monitoring'));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }
}
