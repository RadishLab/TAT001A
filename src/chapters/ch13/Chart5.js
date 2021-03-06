import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategorySolution } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart5 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.yTicks = 6;
    this.legendItems = [];
    this.xAxisTickFormat = (d) => this.getTranslation(d);
  }

  getFigurePrefix() {
    return '13-5';
  }

  onTranslationsLoaded() {
    this.yLabel = [
      this.getTranslation('Proportion of countries implementing'),
      this.getTranslation('smokefree laws at recommended level (%)')
    ];
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('13-5.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.region = d.Region;
          d.value = parseFloat(d['Percent (%)'], 10);
          return d;
        }));
      });
    });
  }

  createMargin() {
    const margin = super.createMargin();
    if (this.widthCategory === 'narrowest') {
      margin.left = 50;
      margin.bottom = 20;
    }
    return margin;
  }

  createXScale() {
    const values = this.data.map(this.getXValue);
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  createYScale() {
    const values = this.data.map((d) => d.value);
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
        .attr('fill', this.colors('percent'));
  }

  createZScale() {
    return scaleOrdinal(schemeCategorySolution);
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${d.region}</div>`;
    const numberFormat = format('.1f');
    content += `<div class="data">${numberFormat(d.value)}% ${this.getTranslation('of countries implementing smokefree laws at recommended level')}</div>`;
    return content;
  }
}
