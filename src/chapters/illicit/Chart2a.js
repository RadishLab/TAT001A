import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart2a extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.yTicks = 6;
    this.yAxisTickFormat = d => format('d')(d * 100);
    this.xAxisTickFormat = (d) => this.getTranslation(d);
    this.xAxisTickRows = 2;
  }

  getFigurePrefix() {
    return 'illicit-2a';
  }

  onTranslationsLoaded() {
    this.yLabel = this.getTranslation('Illicit cigarette trade (%)');
    this.legendItems = [
      { label: this.getTranslation('Academic study estimate'), value: 'Academic study' },
      { label: this.getTranslation('Industry estimate'), value: 'Industry estimate' }
    ];
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('illicit-2a.csv'), (csvData) => {
        const mapped = csvData
          .map(d => {
            d.value = +d.value;
            return d;
          })
          .filter(d => d.value > 0);
        resolve(mapped);
      });
    });
  }

  createXScale() {
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(this.data.map(d => d.location));
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

  renderBars() {
    const barGroups = this.createBarGroups();
    const getLocationBars = d => this.data.filter(row => row.location === d.location);
    const getBarWidth = d => this.x.bandwidth() / getLocationBars(d).length;

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', d => {
        const locationBars = getLocationBars(d);
        const index = locationBars.map(bar => bar.value).indexOf(d.value);
        return this.x(d.location) + (index * getBarWidth(d));
      })
      .attr('width', getBarWidth)
      .attr('y', d => this.y(d.value))
      .attr('height', d => this.chartHeight - this.y(d.value))
      .attr('fill', d => this.colors(d.type));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${this.getTranslation(d.location)}</div>`;
    const percentFormat = d => format('.1f')(d * 100);
    content += `<div class="data">${percentFormat(d.value)}% ${this.getTranslation('illicit trade')}</div>`;
    content += `<div class="data">${this.getTranslation(d.type)} (${d.year})</div>`;
    content += `<div class="data">${this.getTranslation(d.description)}</div>`;
    return content;
  }
}
