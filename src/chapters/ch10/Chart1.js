import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategorySolution } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart1 extends BarChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.yLabel = 'Number of Countries';
    this.yTicks = 6;
    this.legendItems = [
      { label: '2007', value: '2007' },
      { label: '2014', value: '2014' },
    ];
    this.yAxisTickFormat = format('d');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/10-1.csv', (csvData) => {
        resolve(csvData.map(d => {
          d.value = +d['Number of countries'];
          d.policy = d['Policies'];
          return d;
        }));
      });
    });
  }

  createMargin() {
    const margin = super.createMargin();
    margin.bottom = this.legendOrientation() === 'horizontal' ? 45 : 60;
    return margin;
  }

  createXScale() {
    const values = set(this.data.map(d => d.policy)).values();
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
        .attr('x', d => {
          let x = this.x(d.policy);
          if (d.Year === '2014') x += barWidth;
          return x;
        })
        .attr('width', barWidth)
        .attr('y', d => this.y(d.value))
        .attr('height', d => this.chartHeight - this.y(d.value))
        .attr('fill', d => this.colors(d.Year));
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
    return scaleOrdinal(schemeCategorySolution);
  }
}
