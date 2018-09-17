import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export class Chart3 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '8-3';
    this.yLabel = this.getTranslation('Countries');
    this.yTicks = 6;
    this.legendItems = [
      { label: '0-9.9%', value: 'Deaths: 0-9.9%' },
      { label: '10-19.9%', value: 'Deaths: 10-19.9%' },
      { label: '20%+', value: 'Deaths: 20%+' }
    ];
    this.xAxisTickFormat = this.getTranslation.bind(this);
    this.yAxisTickFormat = format('d');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('8-3.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d['Deaths: 0-9.9%'] = +d['Deaths: 0-9.9%'];
          d['Deaths: 10-19.9%'] = +d['Deaths: 10-19.9%'];
          d['Deaths: 20%+'] = +d['Deaths: 20%+'];
          return d;
        }));
      });
    });
  }

  createMargin() {
    const margin = super.createMargin();
    margin.top = 10;
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
    const values = this.data.reduce((valueArray, d) => valueArray.concat([
      d['Deaths: 0-9.9%'],
      d['Deaths: 10-19.9%'],
      d['Deaths: 20%+']
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
    return d['WHO Region']
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 3;

    barGroups.append('rect')
      .classed('bar low', true)
      .attr('x', d => this.x(this.getXValue(d)))
      .attr('width', barWidth)
      .attr('y', d => this.y(d['Deaths: 0-9.9%']))
      .attr('height', d => this.chartHeight - this.y(d['Deaths: 0-9.9%']))
      .attr('fill', this.colors('Deaths: 0-9.9%'));

    barGroups.append('rect')
      .classed('bar medium', true)
      .attr('x', d => this.x(this.getXValue(d)) + barWidth)
      .attr('width', barWidth)
      .attr('y', d => this.y(d['Deaths: 10-19.9%']))
      .attr('height', d => this.chartHeight - this.y(d['Deaths: 10-19.9%']))
      .attr('fill', this.colors('Deaths: 10-19.9%'));

    barGroups.append('rect')
      .classed('bar high', true)
      .attr('x', d => this.x(this.getXValue(d)) + barWidth * 2)
      .attr('width', barWidth)
      .attr('y', d => this.y(d['Deaths: 20%+']))
      .attr('height', d => this.chartHeight - this.y(d['Deaths: 20%+']))
      .attr('fill', this.colors('Deaths: 20%+'));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${d['WHO Region']}</div>`;
    const numberFormat = format(',d');

    let value;
    let description;
    if (bar.classed('low')) {
      value = d['Deaths: 0-9.9%'];
      description = this.getTranslation('0 to 9.9%');
    }
    if (bar.classed('medium')) {
      value = d['Deaths: 10-19.9%'];
      description = this.getTranslation('10 to 19.9%');
    }
    if (bar.classed('high')) {
      value = d['Deaths: 20%+'];
      description = this.getTranslation('20% or more');
    }
    let countries = this.getTranslation('countries');
    if (value === 1) countries = this.getTranslation('country');
    content += `<div class="data">${numberFormat(value)} ${countries} ${this.getTranslation('with')} ${description} ${this.getTranslation('of deaths attributable to tobacco use')}</div>`;
    return content;
  }
}
