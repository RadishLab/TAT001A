import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategorySolution } from '../../colors';
import BarChartVertical from '../../charts/BarChartVertical';

export default class Chart2 extends BarChartVertical {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '11-2';
    this.yLabel = null;
    this.xAxisTickFormat = format('d');
    this.yAxisTickFormat = (d) => this.getTranslation(d);
    this.legendYOffset = 0;
    this.legendYPadding = 15;
  }

  getFigurePrefix() {
    return '11-2';
  }

  onTranslationsLoaded() {
    this.legendItems = [
      { label: this.getTranslation('% of current smokers who intend to quit'), value: 'intend' },
      { label: this.getTranslation('% of current smokers who attempted to quit in past 12 months'), value: 'attempted' },
    ];
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('11-2.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.country = d['Country and Year'].toUpperCase();
          d.intendToQuit = +d['% of current smokers who intend to quit'];
          d.attemptedToQuit = +d['% of current smokers who attempted to quit in past 12 months'];
          return d;
        }));
      });
    });
  }

  createMargin() {
    const margin = super.createMargin();
    margin.left = this.options.web ? 200 : 80;
    if (this.widthCategory === 'narrowest') {
      margin.left = 100;
    }
    return margin;
  }

  createXScale() {
    const values = this.data.map(d => d.intendToQuit).concat(this.data.map(d => d.attemptedToQuit));
    const xExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([0, this.chartWidth])
      .domain(xExtent);
  }

  createYScale() {
    const values = set(this.data.map(d => d.country)).values().sort().reverse();
    return scaleBand()
      .range([this.chartHeight, 0])
      .padding(0.5)
      .domain(values);
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barHeight = this.y.bandwidth() / 2;

    barGroups.append('rect')
      .classed('bar intend', true)
      .attr('x', 0)
      .attr('width', d => this.x(d.intendToQuit))
      .attr('y', d => this.y(d.country))
      .attr('height', barHeight)
      .attr('fill', d => this.colors('intend'));

    barGroups.append('rect')
      .classed('bar attempted', true)
      .attr('x', 0)
      .attr('width', d => this.x(d.attemptedToQuit))
      .attr('y', d => this.y(d.country) + barHeight)
      .attr('height', barHeight)
      .attr('fill', d => this.colors('attempted'));
  }

  createZScale() {
    const colors = schemeCategorySolution.slice();
    colors[1] = '#00a792';
    return scaleOrdinal(colors).domain(['attempted', 'intend']);
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${this.getTranslation(d['Country and Year'])}</div>`;
    const numberFormat = format('.1f');
    const value = bar.classed('intend') ? d.intendToQuit : d.attemptedToQuit;
    const description = bar.classed('intend') ? this.getTranslation('intend to quit') : this.getTranslation('attempted to quit in past 12 months');
    content += `<div class="data">${numberFormat(value)}% ${description}</div>`;
    return content;
  }

  render() {
    super.render();
    if (this.widthCategory === 'narrowest') {
      this.root.selectAll('.axis-x .tick')
        .style('font-size', '.5rem');
      this.root.selectAll('.axis-y .tick')
        .style('font-size', '.4rem');
    }
  }
}
