import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart3 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.yTicks = 6;
    this.yAxisTickFormat = format('d');
    this.xAxisTickFormat = (d) => this.getTranslation(d);
    this.xAxisTickRows = 2;
  }

  getFigurePrefix() {
    return 'waterpipe-2';
  }

  onTranslationsLoaded() {
    this.yLabel = this.getTranslation('Tobacco Users That Used Waterpipe (%)');
    this.legendItems = [
      { label: this.getTranslation('Women'), value: 'women' },
      { label: this.getTranslation('Men'), value: 'men' },
    ];
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('waterpipe-2.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.men = +d.Men * 100;
          d.women = +d.Women * 100;
          d.country = d.Country;
          d.iso = d.ISO3;
          return d;
        }));
      });
    });
  }

  createXScale() {
    const values = set(this.data.map(d => d.country)).values();
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 2;

    barGroups.append('rect')
      .classed('bar women', true)
      .attr('x', d => this.x(d.country))
      .attr('width', barWidth)
      .attr('y', d => this.y(d.women))
      .attr('height', d => this.chartHeight - this.y(d.women))
      .attr('fill', d => this.colors('women'));

    barGroups.append('rect')
      .classed('bar men', true)
      .attr('x', d => this.x(d.country) + barWidth)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.men))
      .attr('height', d => this.chartHeight - this.y(d.men))
      .attr('fill', d => this.colors('men'));
  }

  createYScale() {
    const values = this.data.map(d => d.men).concat(this.data.map(d => d.women));
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

  tooltipContent(d, bar) {
    const value = bar.classed('women') ? d.women : d.men;
    const description = this.getTranslation(bar.classed('women') ? 'Women' : 'Men');
    let content = `<div class="header">${this.getTranslation(d.Country)} - ${description}</div>`;
    const numberFormat = format('.1f');
    content += `<div class="data">${numberFormat(value)}% ${this.getTranslation('of tobacco users used waterpipe')}</div>`;
    return content;
  }
}
