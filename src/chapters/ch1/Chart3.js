import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart3 extends BarChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.figurePrefix = '1-inset3';
    this.yLabel = this.getTranslation('Annual Profit per Acre (USD)');
    this.yTicks = 6;
    this.legendItems = [
      { label: this.getTranslation('Contractor (Adjusted)'), value: 'contractor-adjusted' },
      { label: this.getTranslation('Contractor (Unadjusted)'), value: 'contractor-unadjusted' },
      { label: this.getTranslation('Independent (Adjusted)'), value: 'independent-adjusted' },
      { label: this.getTranslation('Independent (Unadjusted)'), value: 'independent-unadjusted' },
    ];
    this.xAxisTickFormat = this.getTranslation.bind(this);
    this.yAxisTickFormat = format('d');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/1-3.csv', (csvData) => {
        resolve(csvData.map(d => {
          d.profitType = d['Profit Type (per Acre)'].indexOf('Adjusted') >= 0 ? 'adjusted' : 'unadjusted';
          d.employmentType = d['Contract versus Independent'].trim().toLowerCase();
          d.legendType = `${d.employmentType}-${d.profitType}`;
          d.value = +d['Profit Per Acre - USD'];
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
    const barWidth = this.x.bandwidth() / 4;

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', d => {
        let x = this.x(d['Country']);
        if (d.employmentType === 'independent') {
          x += (2 * barWidth);
        }
        if (d.profitType === 'unadjusted') {
          x += barWidth;
        }
        return x;
      })
      .attr('width', barWidth)
      .attr('y', d => {
        if (d.value < 0) return this.y(0);
        return this.y(d.value);
      })
      .attr('height', d => Math.abs(this.y(0) - this.y(d.value)))
      .attr('fill', d => this.colors(d.legendType));
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
    return scaleOrdinal(schemeCategoryProblem);
  }
}
