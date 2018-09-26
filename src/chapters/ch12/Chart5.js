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
    this.xAxisTickFormat = this.getTranslation.bind(this);
    this.xAxisTickRows = 2;
    this.yAxisTickFormat = format('.2');
  }

  getFigurePrefix() {
    return '12-5';
  }

  onTranslationsLoaded() {
    this.yLabel = this.getTranslation('Tax Benefits (% of Pre-tax Income)');
    this.legendItems = [
      { label: this.getTranslation('Tax'), value: 'tax' },
      { label: this.getTranslation('Tax + Health'), value: 'tax + health' },
    ];
    super.onTranslationsLoaded();
  }

  createMargin() {
    const margin = super.createMargin();
    margin.top = 5;
    return margin;
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('12-5.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.xValue = d.quintile
          d.tax = +d.Tax;
          d.taxHealth = +d['Tax + Health'];
          return d;
        }));
      });
    });
  }

  createXScale() {
    const values = this.data.map(d => d.xValue);
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 2;

    barGroups.append('rect')
      .classed('bar tax', true)
      .attr('x', d => this.x(d.xValue))
      .attr('width', barWidth)
      .attr('y', d => this.y(Math.max(0, d.tax)))
      .attr('height', d => {
        if (d.tax > 0) {
          return this.chartHeight - this.y(d.tax);
        }
        return this.y(d.tax) - this.y(0);
      })
      .attr('fill', this.colors('tax'));

    barGroups.append('rect')
      .classed('bar tax-health', true)
      .attr('x', d => this.x(d.xValue) + barWidth)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.taxHealth))
      .attr('height', d => this.y(0) - this.y(d.taxHealth))
      .attr('fill', this.colors('tax + health'));
  }

  createYScale() {
    const values = this.data.map(d => d.tax).concat(this.data.map(d => d.taxHealth));
    const yExtent = [min(values), max(values)];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createZScale() {
    return scaleOrdinal(schemeCategorySolution);
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${this.getTranslation(d.quintile)}</div>`;
    const numberFormat = format('.1f');
    const value = bar.classed('tax') ? d.tax : d.taxHealth;
    const description = this.getTranslation(bar.classed('tax') ? 'tax benefits' : 'tax plus health benefits');
    content += `<div class="data">${numberFormat(value)} ${description}</div>`;
    return content;
  }
}
