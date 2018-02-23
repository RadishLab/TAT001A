import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart5 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = 'illicit-inset5';
    this.yLabel = this.getTranslation('Millions of £');
    this.yTicks = 6;
    this.yAxisTickFormat = d => format('d')(d / 1000000);
    this.legendItems = [];
    this.xAxisTickFormat = this.getTranslation.bind(this);
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('illicit-5.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.value = +d.value;
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
    return d.type;
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
        .attr('fill', d => this.colors(this.getXValue(d)));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${d.type}</div>`;
    const numberFormat = format(',d');
    content += `<div class="data">${numberFormat(d.value)}£</div>`;
    return content;
  }
}
