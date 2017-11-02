import { axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { line } from 'd3-shape';
import isDate from 'lodash.isdate';
import isNumber from 'lodash.isnumber';
import isString from 'lodash.isstring';

import Chart from './Chart';

export default class LineChart extends Chart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.parent
      .classed('line-chart', true)
    this.loadData()
      .then(data => this.data = data)
      .then(data => this.onDataLoaded(data));
  }

  onDataLoaded(data) {
    this.x = this.createXScale();
    this.y = this.createYScale();
    this.colors = this.createZScale();
    this.line = line()
      .x(this.lineXAccessor.bind(this))
      .y(this.lineYAccessor.bind(this));
    this.render();
  }

  createMargin() {
    return {
      top: 0,
      right: 0,
      bottom: this.legendOrientation() === 'horizontal' ? 40 : 60,
      left: 30
    };
  }

  renderAxes() {
    const xAxis = axisBottom(this.x);
    const xAxisGroup = this.root.append('g')
      .classed('axis axis-x', true);
    xAxisGroup
      .attr('transform', `translate(0, ${this.chartHeight})`)
      .call(xAxis);

    this.parent.select('.axis-x .domain');
    this.parent.select('.axis-x').selectAll('.tick')
      .attr('transform', (d, e) => `translate(${this.x(d)}, 5)`)
      .classed('date', d => isDate(d))
      .classed('number', d => isNumber(d))
      .classed('text', d => isString(d));
    this.parent.select('.axis-x').selectAll('.tick text')
      .attr('transform', (d, i, nodes) => {
        return `translate(0, -${nodes[i].getBBox().height / 2})`;
      });

    let xAxisHeight = this.parent.select('.axis-x .tick').node().getBBox().width + 15;
    xAxisGroup.append('text')
      .classed('axis-title', true)
      .text(this.xLabel)
      .attr('transform', `translate(${this.chartWidth / 2}, ${xAxisHeight})`);

    const yAxis = axisLeft(this.y)
      .ticks(5)
      .tickFormat(this.yAxisTickFormat ? this.yAxisTickFormat : format('.2s'));
    const yAxisGroup = this.root.append('g')
      .classed('axis axis-y', true);
    yAxisGroup
      .call(yAxis)
      .append('text')
        .classed('axis-title', true)
        .attr('transform', `translate(-${(this.margin.left - 6)}, ${this.chartHeight / 2}) rotate(-90)`)
        .text(this.yLabel);
    this.parent.select('.axis-y').selectAll('.tick')
      .classed('date', d => isDate(d))
      .classed('number', d => isNumber(d))
      .classed('text', d => isString(d));

    const yGuideLine = line()
      .x(d => this.x(d[0]))
      .y(d => this.y(d[1]));
    const yGuideLines = this.root.append('g');
    const yGuideLineGroup = yGuideLines.selectAll('.y-guide-line')
      .data(this.y.ticks(5).map(tick => [[this.x.domain()[0], tick], [this.x.domain()[1], tick]]))
      .enter().append('g').classed('y-guide-line', true);
    yGuideLineGroup.append('path')
      .attr('d', d => yGuideLine(d));
  }

  renderLines() {
    const line = this.root.selectAll('.line')
      .data(this.data)
      .enter().append('g')
        .classed('line', true);

    line.append('path')
      .style('stroke', d => this.colors(d.key))
      .attr('d', d => this.line(d.values));
  }

  legendOrientation() {
    return (this.width < 200 ? 'vertical' : 'horizontal');
  }

  renderLegend() {
    const legendLine = line()
      .x(d => d[0])
      .y(d => d[1]);
    const legend = this.parent.append('g')
      .classed('legend', true)
      .attr('transform', () => {
        let xOffset = 15;
        let yOffset = this.chartHeight + 40; // TODO generalize
        return `translate(${xOffset}, ${yOffset})`;
      });

    const lineWidth = 10;
    let xOffset = 0,
      yOffset = 0;

    this.legendItems.forEach(({ label, value }) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${xOffset}, ${yOffset})`);
      legendItem.append('text')
        .text(label)
        .attr('transform', `translate(${lineWidth + 5}, 0)`);
      legendItem.append('path')
        .datum([[0, 0], [lineWidth, 0]])
        .style('stroke', this.colors(value))
        .attr('transform', 'translate(0, -2)')
        .attr('d', d => legendLine(d));

      if (this.legendOrientation() === 'horizontal') {
        xOffset += legendItem.node().getBBox().width + 5;
      } else {
        yOffset += legendItem.node().getBBox().height + 1;
      }
    });
  }

  render() {
    super.render();
    this.renderLines();
  }
}
