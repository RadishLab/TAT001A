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
    this.xAxisTickFormat = (d) => this.getTranslation(d);
  }

  getFigurePrefix() {
    return '5-2';
  }

  onTranslationsLoaded() {
    this.yLabel = this.getTranslation('Secondhand smoke exposure (%)');
    this.legendItems = [
      { label: this.getTranslation('Home'), value: 'home' },
      { label: this.getTranslation('Work'), value: 'work' },
      { label: this.getTranslation('Restaurant'), value: 'restaurant' }
    ];
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('5-2.csv'), (csvData) => {
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
      .classed('bar home', true)
      .attr('x', d => this.x(this.getXValue(d)))
      .attr('width', barWidth)
      .attr('y', d => this.y(d.Home))
      .attr('height', d => this.chartHeight - this.y(d.Home))
      .attr('fill', this.colors('home'));

    barGroups.append('rect')
      .classed('bar work', true)
      .attr('x', d => this.x(this.getXValue(d)) + barWidth)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.Work))
      .attr('height', d => this.chartHeight - this.y(d.Work))
      .attr('fill', this.colors('work'));

    barGroups.append('rect')
      .classed('bar restaurant', true)
      .attr('x', d => this.x(this.getXValue(d)) + barWidth * 2)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.Restaurant))
      .attr('height', d => this.chartHeight - this.y(d.Restaurant))
      .attr('fill', this.colors('restaurant'));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${this.getTranslation(d.Country)}</div>`;
    const percentFormat = format('.1f');

    if (bar.classed('home')) {
      content += `<div class="data">${percentFormat(d.Home)}% ${this.getTranslation('exposure at home')}</div>`;
    }
    if (bar.classed('restaurant')) {
      content += `<div class="data">${percentFormat(d.Restaurant)}% ${this.getTranslation('exposure in restaurants')}</div>`;
    }
    if (bar.classed('work')) {
      content += `<div class="data">${percentFormat(d.Work)}% ${this.getTranslation('exposure at work')}</div>`;
    }
    return content;
  }
}
