import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export class Chart1 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.yTicks = 6;
    this.xAxisTickFormat = d => {
      let capitalized = d.charAt(0).toUpperCase() + d.slice(1);
      return this.getTranslation(capitalized);
    };
    this.yAxisTickFormat = format('.2');
  }

  getFigurePrefix() {
    return '4-1';
  }

  onTranslationsLoaded() {
    this.yLabel = this.getTranslation('Daily Smokers (%)');
    this.legendItems = [
      { label: this.getTranslation('Low HDI'), value: 'Low' },
      { label: this.getTranslation('Medium HDI'), value: 'Medium' },
      { label: this.getTranslation('High HDI'), value: 'High' },
      { label: this.getTranslation('Very High HDI'), value: 'Very High' },
    ];
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('4-1.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.male = parseFloat(d.Male) * 100;
          d.female = parseFloat(d.Female) * 100;
          return d;
        }));
      });
    });
  }

  createXScale() {
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(['male', 'female']);
  }

  createYScale() {
    const values = this.data.reduce((valueArray, d) => valueArray.concat([d.male, d.female]), []);
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
    const barWidth = this.x.bandwidth() / 4;

    barGroups.append('rect')
        .classed('bar male', true)
        .attr('x', d => {
          let x = this.x('male');
          if (d['HDI Category'] === 'Low') {
          }
          if (d['HDI Category'] === 'Medium') {
            x += barWidth;
          }
          if (d['HDI Category'] === 'High') {
            x += (barWidth * 2);
          }
          if (d['HDI Category'] === 'Very High') {
            x += (barWidth * 3);
          }
          return x;
        })
        .attr('width', barWidth)
        .attr('y', d => this.y(d.male))
        .attr('height', d => this.chartHeight - this.y(d.male))
        .attr('fill', d => this.colors(d['HDI Category']));

    barGroups.append('rect')
        .classed('bar female', true)
        .attr('x', d => {
          let x = this.x('female');
          if (d['HDI Category'] === 'Low') {
          }
          if (d['HDI Category'] === 'Medium') {
            x += barWidth;
          }
          if (d['HDI Category'] === 'High') {
            x += (barWidth * 2);
          }
          if (d['HDI Category'] === 'Very High') {
            x += (barWidth * 3);
          }
          return x;
        })
        .attr('width', barWidth)
        .attr('y', d => this.y(d.female))
        .attr('height', d => this.chartHeight - this.y(d.female))
        .attr('fill', d => this.colors(d['HDI Category']));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${this.getTranslation(d['HDI Category'] + ' HDI')}</div>`;
    if (bar.classed('male')) {
      content += `<div>${this.yAxisTickFormat(d.male)}%</div>`;
    }
    if (bar.classed('female')) {
      content += `<div>${this.yAxisTickFormat(d.female)}%</div>`;
    }
    return content;
  }
}
