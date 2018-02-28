import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChartVertical from '../../charts/BarChartVertical';

export default class Chart5 extends BarChartVertical {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '4-inset5';
    this.xLabel = this.getTranslation('Daily Smokers (millions)');
    this.yLabel = null;
    this.legendItems = [
      { label: this.getTranslation('Male'), value: 'male' },
      { label: this.getTranslation('Female'), value: 'female' },
    ];
    this.xAxisTickFormat = format('d');
    this.yAxisTickFormat = this.getTranslation.bind(this);

    if (this.widthCategory === 'narrowest') {
      this.xAxisTickArguments = 6;
    }
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('4-5.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.country = d.Country;
          d.male = +d.Male;
          d.female = +d.Female;
          return d;
        }));
      });
    });
  }

  createMargin() {
    const margin = super.createMargin();
    margin.left = this.options.web ? 100 : 50;
    if (this.options.web) {
      margin.right = 10;

      if (this.widthCategory === 'narrowest') {
        margin.left = 70;
      }
    }
    return margin;
  }

  createXScale() {
    const values = this.data.map(d => d.male + d.female);
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

  xTicks() {
    return this.x.ticks();
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barHeight = this.y.bandwidth();

    barGroups.append('rect')
      .classed('bar male', true)
      .attr('x', 0)
      .attr('width', d => this.x(d.male))
      .attr('y', d => this.y(d.country))
      .attr('height', barHeight)
      .attr('fill', d => this.colors('male'));

    barGroups.append('rect')
      .classed('bar female', true)
      .attr('x', d => this.x(d.male))
      .attr('width', d => this.x(d.female))
      .attr('y', d => this.y(d.country))
      .attr('height', barHeight)
      .attr('fill', d => this.colors('female'));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem).domain(['male', 'female']);
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${d.country}</div>`;
    let value;
    let gender;
    if (bar.classed('male')) {
      value = d.male;
      gender = this.getTranslation('male');
    }
    if (bar.classed('female')) {
      value = d.female;
      gender = this.getTranslation('female');
    }
    content += `<div>${this.yAxisTickFormat(value)} ${this.getTranslation('million')} ${gender} ${this.getTranslation('daily smokers')}</div>`;
    return content;
  }
}
