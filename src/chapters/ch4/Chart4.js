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
    this.legendItems = [
      { label: '1980', value: '1980' },
      { label: '2016', value: '2016' },
    ];
    this.xAxisTickFormat = this.getTranslation.bind(this);
    this.xAxisTickRows = 3;
    this.yAxisTickFormat = format('.2');
  }

  getFigurePrefix() {
    return '4-4';
  }

  onTranslationsLoaded() {
    this.yLabel = this.getTranslation('Cigarette Consumption (trillions)');
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('4-4.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d['1980'] = +d['1980'] / 1000000000000;
          d['2016'] = +d['2016'] / 1000000000000;
          d.change = +d['% of change'];
          return d;
        }));
      });
    });
  }

  createXScale() {
    const values = this.data.map(d => d['region']);
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  createMargin() {
    const margin = super.createMargin();
    margin.top = 15;
    return margin;
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 2;

    barGroups.append('rect')
        .classed('bar year-1980', true)
        .attr('x', d => this.x(d['region']))
        .attr('width', barWidth)
        .attr('y', d => this.y(d['1980']))
        .attr('height', d => this.chartHeight - this.y(d['1980']))
        .attr('fill', this.colors('1980'));

    barGroups.append('rect')
        .classed('bar year-2016', true)
        .attr('x', d => this.x(d['region']) + barWidth)
        .attr('width', barWidth)
        .attr('y', d => this.y(d['2016']))
        .attr('height', d => this.chartHeight - this.y(d['2016']))
        .attr('fill', this.colors('2016'));

    barGroups.append('text')
      .text(d => `${format('+d')(d.change * 100)}%`)
      .attr('transform', d => `translate(${this.x(d.region) + barWidth * 1.5}, ${this.y(d['2016']) - 2})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', this.options.web ? '14px' : '4px');
  }

  createYScale() {
    const values = this.data.reduce((valueArray, d) => valueArray.concat([d['1980'], d['2016']]), []);
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
    const year = bar.classed('year-1980') ? '1980' : '2016';
    let content = `<div class="header">${d.region} (${year})</div>`;
    const numberFormat = format('.2f');
    const percentFormat = d => format('+.1f')(d * 100);
    content += `<div>${numberFormat(d[year])} ${this.getTranslation('trillion cigarettes')}</div>`;
    if (bar.classed('year-2016')) {
      content += `<div>${percentFormat(d.change)}% ${this.getTranslation('compared to 1980')}</div>`;
    }
    return content;
  }
}
