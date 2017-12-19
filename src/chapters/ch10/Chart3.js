import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategorySolution } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart3 extends BarChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.figurePrefix = '10-inset3';
    this.yLabel = this.getTranslation('Revenue growth (in Billion 2014 PPP dollars)');
    this.yTicks = 6;
    this.legendItems = [];
    this.xAxisTickFormat = this.getTranslation.bind(this);
    this.yAxisTickFormat = d => format('d')(d / 1000);
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/10-3.csv', (csvData) => {
        resolve(csvData.map(d => {
          d.value = +d['Revenue growth (in Million 2014 PPP dollars)'];
          d.region = d['Annual Excise Revenue (Million International Dollars PPP)'];
          return d;
        }));
      });
    });
  }

  createMargin() {
    const margin = super.createMargin();
    margin.bottom = this.legendOrientation() === 'horizontal' ? 30 : 30;
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
    const values = this.data.map(d => d.value);
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  getXValue(d) {
    return d.region;
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth();

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(this.getXValue(d)))
        .attr('width', barWidth)
        .attr('y', d => this.y(d.value))
        .attr('height', d => this.chartHeight - this.y(d.value))
        .attr('fill', this.colors(1));
  }

  createZScale() {
    return scaleOrdinal(schemeCategorySolution);
  }
}
