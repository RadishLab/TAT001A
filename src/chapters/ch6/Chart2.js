import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart2 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.yTicks = 6;
    this.legendItems = [];
    this.xAxisTickFormat = (d) => this.getTranslation(d);
    this.yAxisTickFormat = format('d');
  }

  getFigurePrefix() {
    return '6-2';
  }

  onTranslationsLoaded() {
    this.yLabel = this.getTranslation('Percent of Total DALYs');
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('6-2.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.age = d.Age;
          d.value = +d['Percent of DALYs From Tobacco'];
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
    const values = this.data.map(d => d.value);
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  getXValue(d) {
    return d.age;
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
        .attr('fill', this.colors('percent'));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  render() {
    super.render();
    this.root.selectAll('.axis-x .tick')
      .style('font-size', () => {
        if (this.widthCategory === 'narrowest') return '.4rem';
        return '10px';
      });

    this.root.selectAll('.axis-x tspan')
      .style('font-weight', 'bold');
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${this.getTranslation(d.age)}</div>`;
    const numberFormat = format('.1f');
    content += `<div class="data">${numberFormat(d.value)}% ${this.getTranslation('of total DALYs')}</div>`;
    return content;
  }
}
