import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export class Chart2 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '8-inset2';
    this.yLabel = this.getTranslation('Deaths (thousands)');
    this.yTicks = 6;
    this.legendItems = [
      { label: this.getTranslation('Male deaths'), value: 'Males' },
      { label: this.getTranslation('Female deaths'), value: 'Females' },
    ];
    this.yAxisTickFormat = format('.2');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('8-2.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d['Number of Deaths'] = +d['Number of Deaths'] / 1000;
          d['Percent (%)'] = +d['Percent (%)'];
          return d;
        }));
      });
    });
  }

  createXScale() {
    const values = this.data.map(this.getXValue);
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  createYScale() {
    const values = this.data.map(d => d['Number of Deaths']);
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  getXValue(d) {
    return `${d['Sex']}:${d['Causes']}`;
  }

  xAxisTickFormat(d) {
    return this.getTranslation(d.split(':')[1]);
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth();

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(this.getXValue(d)))
        .attr('width', barWidth)
        .attr('y', d => this.y(d['Number of Deaths']))
        .attr('height', d => this.chartHeight - this.y(d['Number of Deaths']))
        .attr('fill', d => this.colors(d['Sex']));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }
}
