import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart1 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.yTicks = 6;
    this.yAxisTickFormat = format('d');
    this.xAxisTickRows = 2;
  }

  getFigurePrefix() {
    return 'youth-1';
  }

  onTranslationsLoaded() {
    this.yLabel = this.getTranslation('Prevalence (%)');
    this.legendItems = [
      { label: this.getTranslation('Adult Male'), value: 'adult male' },
      { label: this.getTranslation('Adult Female'), value: 'adult female' },
      { label: this.getTranslation('Youth Male'), value: 'youth male' },
      { label: this.getTranslation('Youth Female'), value: 'youth female' },
    ];
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('youth-1.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.adultMale = +d['Adult Male'];
          d.adultFemale = +d['Adult Female'];
          d.youthMale = +d['Youth Male'];
          d.youthFemale = +d['Youth Female'];
          d.country = d.Country;
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
    const barWidth = this.x.bandwidth() / 4;

    barGroups.append('rect')
      .classed('bar adult-male', true)
      .attr('x', d => this.x(d.country))
      .attr('width', barWidth)
      .attr('y', d => this.y(d.adultMale))
      .attr('height', d => this.chartHeight - this.y(d.adultMale))
      .attr('fill', d => this.colors('adult male'));

    barGroups.append('rect')
      .classed('bar adult-female', true)
      .attr('x', d => this.x(d.country) + barWidth)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.adultFemale))
      .attr('height', d => this.chartHeight - this.y(d.adultFemale))
      .attr('fill', d => this.colors('adult female'));

    barGroups.append('rect')
      .classed('bar youth-male', true)
      .attr('x', d => this.x(d.country) + barWidth * 2)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.youthMale))
      .attr('height', d => this.chartHeight - this.y(d.youthMale))
      .attr('fill', d => this.colors('youth male'));

    barGroups.append('rect')
      .classed('bar youth-female', true)
      .attr('x', d => this.x(d.country) + barWidth * 3)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.youthFemale))
      .attr('height', d => this.chartHeight - this.y(d.youthFemale))
      .attr('fill', d => this.colors('youth female'));
  }

  createYScale() {
    const values = this.data.map(d => d.adultMale)
      .concat(this.data.map(d => d.adultFemale))
      .concat(this.data.map(d => d.youthMale))
      .concat(this.data.map(d => d.youthFemale));
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
    const numberFormat = format('.1f');
    let value;
    let description;
    if (bar.classed('adult-male')) {
      value = d.adultMale;
      description = 'adult males';
    }
    if (bar.classed('adult-female')) {
      value = d.adultFemale;
      description = 'adult females';
    }
    if (bar.classed('youth-male')) {
      value = d.youthMale;
      description = 'youth males';
    }
    if (bar.classed('youth-female')) {
      value = d.youthFemale;
      description = 'youth females';
    }

    let content = `<div class="header">${d.Country} - ${this.getTranslation(description)}</div>`;
    content += `<div class="data">${numberFormat(value)}% ${this.getTranslation('prevalence')}</div>`;
    return content;
  }
}
