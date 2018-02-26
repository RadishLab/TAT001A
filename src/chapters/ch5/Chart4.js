import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart4 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '5-inset4';
    this.yLabel = this.getTranslation('Prevalence (%)');
    this.yTicks = 6;
    this.legendItems = [
      { label: this.getTranslation('No university degree'), value: 'Below university' },
      { label: this.getTranslation('University'), value: 'University' }
    ];
    this.xAxisTickFormat = this.getTranslation.bind(this);
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('5-4.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.Cigarettes = +d.Cigarettes;
          d.Waterpipe = +d.Waterpipe;
          d.Either = +d.Either;
          return d;
        }));
      });
    });
  }

  createXScale() {
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(['Cigarettes', 'Waterpipe', 'Either']);
  }

  createYScale() {
    const values = this.data.reduce((valueArray, d) => valueArray.concat([
      d.Cigarettes,
      d.Waterpipe,
      d.Either
    ]), []);
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 2;

    ['Cigarettes', 'Waterpipe', 'Either'].forEach(category => {
      barGroups.append('rect')
        .classed(`bar ${category.toLowerCase()}`, true)
        .attr('x', d => {
          let x = this.x(category);
          if (d.education === 'University') {
            x += barWidth;
          }
          return x;
        })
        .attr('width', barWidth)
        .attr('y', d => this.y(d[category]))
        .attr('height', d => this.chartHeight - this.y(d[category]))
        .attr('fill', d => this.colors(d.education));
    });
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  tooltipContent(d, bar) {
    let content = '';
    const numberFormat = format('d');
    if (bar.classed('cigarettes')) {
      content += `<div class="header">${this.getTranslation('Cigarettes')}</div>`;
      content += `<div class="data">${numberFormat(d.Cigarettes)}% ${this.getTranslation('prevalence')}</div>`;
    }
    if (bar.classed('waterpipe')) {
      content += `<div class="header">${this.getTranslation('Waterpipe')}</div>`;
      content += `<div class="data">${numberFormat(d.Waterpipe)}% ${this.getTranslation('prevalence')}</div>`;
    }
    if (bar.classed('either')) {
      content += `<div class="header">${this.getTranslation('Cigarettes and Waterpipe')}</div>`;
      content += `<div class="data">${numberFormat(d.Either)}% ${this.getTranslation('prevalence')}</div>`;
    }

    content += `<div class="data">${d.education === 'Below university' ? this.getTranslation('No university degree') : this.getTranslation('University degree')}</div>`;
    return content;
  }
}
