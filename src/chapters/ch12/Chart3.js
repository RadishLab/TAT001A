import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';
import { timeFormat, timeParse } from 'd3-time-format';

import { schemeCategorySolution } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart3 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '12-3';
    this.xAxisTickFormat = (d) => timeFormat('%Y')(new Date(d));
    this.yLabel = this.getTranslation('Sales (millions)');
    this.yTicks = 6;
    this.legendItems = [
      { label: this.getTranslation('Cigarette sales'), value: 'cigarette' },
      { label: this.getTranslation('Roll-your-own tobacco sales'), value: 'rollyourown' },
    ];
    this.yAxisTickFormat = d => format('.2')(d / 1000000);
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('12-3.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.cigarette = +d['cigarette sales'];
          d.rollyourown = +d['roll-your-own sales'];
          d.year = timeParse('%Y')(d.year);
          return d;
        }));
      });
    });
  }

  createXScale() {
    const values = set(this.data.map(d => d.year)).values();
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 2;

    barGroups.append('rect')
      .classed('bar cigarette', true)
      .attr('x', d => this.x(d.year))
      .attr('width', barWidth)
      .attr('y', d => this.y(d.cigarette))
      .attr('height', d => this.chartHeight - this.y(d.cigarette))
      .attr('fill', d => this.colors('cigarette'));

    barGroups.append('rect')
      .classed('bar rollyourown', true)
      .attr('x', d => this.x(d.year) + barWidth)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.rollyourown))
      .attr('height', d => this.chartHeight - this.y(d.rollyourown))
      .attr('fill', d => this.colors('rollyourown'));
  }

  createYScale() {
    const values = this.data.map(d => d.cigarette).concat(this.data.map(d => d.rollyourown));
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createZScale() {
    const colors = schemeCategorySolution.slice();
    colors[1] = '#00a792';
    return scaleOrdinal(colors);
  }

  tooltipContent(d, bar) {
    const numberFormat = format(',d');
    const yearFormat = timeFormat('%Y');
    let content = `<div class="header">${yearFormat(d.year)}</div>`;
    const value = bar.classed('cigarette') ? d.cigarette : d.rollyourown;
    const description = this.getTranslation(bar.classed('cigarette') ? 'cigarette' : 'roll-your-own tobacco');
    content += `<div class="data">${numberFormat(value)} ${this.getTranslation('USD')} ${description} ${this.getTranslation('sales')}</div>`;
    return content;
  }
}
