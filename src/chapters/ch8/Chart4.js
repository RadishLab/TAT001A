import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export class Chart4 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.yTicks = 6;
    this.legendYOffset = 0;
    this.yLabelOffset = 10;
  }

  getFigurePrefix() {
    return '8-4';
  }

  onTranslationsLoaded() {
    this.xLabel = this.getTranslation('Education Level Attained');
    this.yLabel = this.getTranslation('Lung cancer mortality rate (per 100,000)');
    this.legendItems = [
      { label: this.getTranslation('Poland (2011)'), value: 'Poland (2011)' },
      { label: this.getTranslation('United States, non-Hispanic whites (2010)'), value: 'United States, non-Hispanic whites (2010)' },
    ];
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('8-4.csv'), (csvData) => {
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

  createMargin() {
    const margin = super.createMargin();
    margin.bottom = this.legendOrientation() === 'horizontal' ? 52 : 60;
    if (this.options.web) {
      margin.bottom = 130;
      if (this.widthCategory === 'narrowest') {
        margin.bottom = 95;
      }
    }
    return margin;
  }

  getXValue(d) {
    return `${d['Country']}:${d['Education level']}`;
  }

  xAxisTickFormat(d) {
    return this.getTranslation(d.split(':')[1]);
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

  tooltipContent(d, bar) {
    let content = `<div class="header">${d.Country}</div>`;
    const numberFormat = format('.1f');
    content += `<div class="data">${this.getTranslation('Education level attained:')} ${this.getTranslation(d['Education level'])}</div>`;
    content += `<div class="data">${numberFormat(d['Mortality rate'])} ${this.getTranslation('lung cancer mortality per 100,000')}</div>`;
    return content;
  }
}
