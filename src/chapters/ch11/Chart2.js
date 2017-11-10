import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategorySolution } from '../../colors';
import BarChartVertical from '../../charts/BarChartVertical';

export default class Chart2 extends BarChartVertical {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.yLabel = null;
    this.legendItems = [
      { label: '% of current smokers who intend to quit', value: 'intend' },
      { label: '% of current smokers who attempted to quit in past 12 months', value: 'attempted' },
    ];
    this.xAxisTickFormat = (d => `${d}%`);
    this.yAxisTickFormat = (d => d);
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/11-2.csv', (csvData) => {
        resolve(csvData.map(d => {
          d.country = d['Country and Year'];
          d.intendToQuit = +d['% of current smokers who intend to quit'];
          d.attemptedToQuit = d['% of current smokers who attempted to quit in past 12 months'];
          return d;
        }));
      });
    });
  }

  createMargin() {
    const margin = super.createMargin();
    margin.left = 70;
    margin.bottom = 38;
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
      .classed('bar', true)
      .attr('x', 0)
      .attr('width', d => this.chartWidth - this.x(d.intendToQuit))
      .attr('y', d => this.y(d.country))
      .attr('height', barHeight)
      .attr('fill', d => this.colors('intend'));

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', 0)
      .attr('width', d => this.chartWidth - this.x(d.attemptedToQuit))
      .attr('y', d => this.y(d.country) + barHeight)
      .attr('height', barHeight)
      .attr('fill', d => this.colors('attempted'));
  }

  createZScale() {
    return scaleOrdinal(schemeCategorySolution);
  }
}
