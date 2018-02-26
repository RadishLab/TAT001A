import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export class Chart3 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '9-inset3';
    this.yLabel = this.getTranslation('Smoking Prevalence (%)');
    this.yTicks = 6;
    this.legendItems = [
      { label: this.getTranslation('Lowest Wealth Group'), value: 'Lowest Wealth Group' },
      { label: this.getTranslation('Highest Wealth Group'), value: 'Highest Wealth Group' },
    ];
    this.xAxisTickFormat = this.getTranslation.bind(this);
    this.yAxisTickFormat = format('d')
    this.xAxisTickRows = 3;
  }

  createMargin() {
    const margin = super.createMargin();
    margin.top = 5;
    return margin;
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('9-3.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d['Lowest Wealth Group'] = +d['Lowest Wealth Group'];
          d['Highest Wealth Group'] = +d['Highest Wealth Group'];
          return d;
        }));
      });
    });
  }

  createXScale() {
    const values = this.data.map(d => d['Country']);
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 2;

    barGroups.append('rect')
      .classed('bar lowest', true)
      .attr('x', d => this.x(d['Country']))
      .attr('width', barWidth)
      .attr('y', d => this.y(d['Lowest Wealth Group']))
      .attr('height', d => this.chartHeight - this.y(d['Lowest Wealth Group']))
      .attr('fill', this.colors('Lowest Wealth Group'));

    barGroups.append('rect')
      .classed('bar highest', true)
      .attr('x', d => this.x(d['Country']) + barWidth + 2)
      .attr('width', barWidth)
      .attr('y', d => this.y(d['Highest Wealth Group']))
      .attr('height', d => this.chartHeight - this.y(d['Highest Wealth Group']))
      .attr('fill', this.colors('Highest Wealth Group'));
  }

  createYScale() {
    const values = this.data.reduce((valueArray, d) => valueArray.concat([d['Lowest Wealth Group'], d['Highest Wealth Group']]), []);
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
    let content = `<div class="header">${d.Country}</div>`;
    const value = bar.classed('lowest') ? d['Lowest Wealth Group'] : d['Highest Wealth Group'];
    const numberFormat = format('.1f');
    content += `<div class="data">${numberFormat(value)}% ${this.getTranslation('smoking prevalence among')} ${this.getTranslation(d.Gender.toLowerCase())}</div>`;
    return content;
  }
}
