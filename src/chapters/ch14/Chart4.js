import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategorySolution } from '../../colors';
import BarChartVertical from '../../charts/BarChartVertical';

export default class Chart4 extends BarChartVertical {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '14-4';
    this.yLabel = null;
    this.xLabel = this.getTranslation('Number of Facebook users (millions)');
    this.xAxisTickFormat = format('d');
    this.yAxisTickFormat = this.getTranslation.bind(this);
    this.legendItems = [];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('14-4.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.country = d['Countries with the most Facebook users, January 2018'];
          d.value = +d['Number of Facebook users in millions'];
          return d;
        }));
      });
    });
  }

  createMargin() {
    const margin = super.createMargin();
    margin.left = this.options.web ? 150 : 80;
    margin.bottom = this.options.web ? 50 : 38;
    return margin;
  }

  createXScale() {
    const values = this.data.map(d => d.value);
    const xExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([0, this.chartWidth])
      .domain(xExtent);
  }

  createYScale() {
    const values = set(this.data.map(d => d.country)).values().reverse();
    return scaleBand()
      .range([this.chartHeight, 0])
      .padding(0.5)
      .domain(values);
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barHeight = this.y.bandwidth();

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', 0)
      .attr('width', d => this.x(d.value))
      .attr('y', d => this.y(d.country))
      .attr('height', barHeight)
      .attr('fill', d => this.colors('facebook users'));
  }

  createZScale() {
    return scaleOrdinal(schemeCategorySolution).domain(['facebook users']);
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${d.country}</div>`;
    const numberFormat = format(',d');
    content += `<div class="data">${numberFormat(d.value)} ${this.getTranslation('million Facebook users')}</div>`;
    return content;
  }
}
