import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart3 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.yTicks = 6;
    this.xAxisTickFormat = (d) => this.getTranslation(d);
    this.yAxisTickFormat = format('d');
  }

  getFigurePrefix() {
    return 'consumption-3';
  }

  onTranslationsLoaded() {
    this.yLabel = this.getTranslation('Average Number of Cigarettes per Person');
    this.legendItems = [
      { label: this.getTranslation('Lowest'), value: 'lowest' },
      { label: this.getTranslation('Low'), value: 'low' },
      { label: this.getTranslation('Middle'), value: 'middle' },
      { label: this.getTranslation('High'), value: 'high' },
      { label: this.getTranslation('Highest'), value: 'highest' }
    ];
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('consumption-3.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.lowest = +d['Lowest'];
          d.low = +d['Low'];
          d.middle = +d['Middle'];
          d.high = +d['High'];
          d.highest = +d['Highest'];
          return d;
        }));
      });
    });
  }

  createMargin() {
    const margin = super.createMargin();
    margin.left = 80;
    margin.top = 10;
    margin.bottom = 90;

    if (this.widthCategory === 'narrowest') {
      margin.left = 60;
    }
    return margin;
  }

  createXScale() {
    const values = this.data.map(this.getXValue);
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  createYScale() {
    const values = this.data.reduce((valueArray, d) => valueArray.concat([
      d.lowest, d.low, d.middle, d.high, d.highest
    ]), []);
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  getXValue(d) {
    return d['Country']
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 5;
    const barLabels = this.legendItems.map(d => d.value);

    barLabels.forEach((label, index) => {
      barGroups.append('rect')
        .classed(`bar ${label}`, true)
        .attr('x', d => this.x(this.getXValue(d)) + barWidth * index)
        .attr('width', barWidth)
        .attr('y', d => this.y(d[label]))
        .attr('height', d => this.chartHeight - this.y(d[label]))
        .attr('fill', this.colors(label));
    });
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  tooltipContent(d, bar) {
    const numberFormat = format(',d');
    const label = this.legendItems.filter(d => bar.classed(d.value))[0].value;
    let content = `<div class="header">${this.getTranslation(d.Country)} - ${this.getTranslation(label)} ${this.getTranslation('socioeconomic group')}</div>`;
    content += `<div class="data">${numberFormat(d[label])} ${this.getTranslation('cigarettes per person')}</div>`;
    return content;
  }
}
