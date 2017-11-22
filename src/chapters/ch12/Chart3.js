import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';
import { timeFormat, timeParse } from 'd3-time-format';

import { schemeCategorySolution } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart3 extends BarChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.xAxisTickFormat = (d) => timeFormat('%Y')(new Date(d));
    this.yLabel = 'Sales';
    this.yTicks = 6;
    this.legendItems = [
      { label: 'cigarette sales', value: 'cigarette' },
      { label: 'roll-your-own tobacco sales', value: 'rollyourown' },
    ];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/12-3.csv', (csvData) => {
        resolve(csvData.map(d => {
          d.cigarette = +d['cigarette sales'];
          d.rollyourown = +d['roll-your-own sales'];
          d.year = timeParse('%Y')(d.year);
          return d;
        }));
      });
    });
  }

  createMargin() {
    const margin = super.createMargin();
    margin.bottom = this.legendOrientation() === 'horizontal' ? 43 : 50;
    return margin;
  }

  createXScale() {
    const values = set(this.data.map(d => d.year)).values();
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 2;

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', d => this.x(d.year))
      .attr('width', barWidth)
      .attr('y', d => this.y(d.cigarette))
      .attr('height', d => this.chartHeight - this.y(d.cigarette))
      .attr('fill', d => this.colors('cigarette'));

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', d => this.x(d.year) + barWidth)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.rollyourown))
      .attr('height', d => this.chartHeight - this.y(d.rollyourown))
      .attr('fill', d => this.colors('rollyourown'));
  }

  createYScale() {
    const values = this.data.map(d => d.cigarette).concat(this.data.map(d => d.rollyourown));
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createZScale() {
    return scaleOrdinal(schemeCategorySolution);
  }
}