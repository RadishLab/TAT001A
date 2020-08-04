import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategorySolution } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart3 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.yTicks = 6;
    this.legendItems = [];
    this.xAxisTickFormat = d => {
      let label = d;
      if (label === 'Americas' && this.widthCategory === 'narrowest') label = 'Amer.';
      return this.getTranslation(label);
    };
    this.xAxisTickRows = 3;
    this.yAxisTickFormat = d => format('d')(d / 1000);
  }

  getFigurePrefix() {
    return '10-3';
  }

  onTranslationsLoaded() {
    this.yLabel = this.getTranslation('Revenue growth (in Billion 2014 PPP dollars)');
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('10-3.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.value = +d['Revenue growth (in Million 2014 PPP dollars)'];
          d.region = d['Annual Excise Revenue (Million International Dollars PPP)'];
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
      .attr('fill', this.colors(1));
  }

  createZScale() {
    return scaleOrdinal(schemeCategorySolution);
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${this.getTranslation(d.region)}</div>`;
    const numberFormat = d => format(',d')(d / 1000);
    content += `<div class="data">${numberFormat(d.value)} ${this.getTranslation('billion 2014 PPP dollars revenue growth')}</div>`;
    return content;
  }
}
