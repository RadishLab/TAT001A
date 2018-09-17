import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';
import { timeFormat, timeParse } from 'd3-time-format';

import { schemeCategorySolution } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart7 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '12-7';
    this.xAxisTickFormat = (d) => timeFormat('%Y')(new Date(d));
    this.yLabel = this.getTranslation('Price per Pack (Kenyan Shillings)');
    this.yTicks = 6;
    this.legendItems = [
      { label: this.getTranslation('Lowest-cost brand'), value: 'Lowest-cost brand' },
      { label: this.getTranslation('Most-sold brand'), value: 'Most-sold brand' },
    ];
    this.yAxisTickFormat = format('d');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('12-7.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.group = d['brand group'];
          d.year = timeParse('%Y')(d.year)
          d.value = +d.value;
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
      .classed('bar', true)
      .attr('x', d => {
        if (d.group === 'Most-sold brand') {
          return this.x(d.year) + barWidth;
        }
        return this.x(d.year);
      })
      .attr('width', barWidth)
      .attr('y', d => this.y(d.value))
      .attr('height', d => this.chartHeight - this.y(d.value))
      .attr('fill', d => this.colors(d.group));
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

  createZScale() {
    return scaleOrdinal(schemeCategorySolution);
  }

  tooltipContent(d, bar) {
    const yearFormat = timeFormat('%Y');
    let content = `<div class="header">${yearFormat(d.year)} - ${d.group}</div>`;
    const numberFormat = format(',d');
    content += `<div class="data">${numberFormat(d.value)} ${this.getTranslation('Kenyan shillings per pack')}</div>`;
    return content;
  }
}
