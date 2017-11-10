import { axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { select } from 'd3-selection';
import { line } from 'd3-shape';
import isDate from 'lodash.isdate';
import isNumber from 'lodash.isnumber';
import isString from 'lodash.isstring';

import wrap from '../wrap';

export default class Chart {
  constructor(parent, width, height) {
    this.width = width;
    this.height = height;
    this.parent = select(parent)
      .attr('height', this.height)
      .attr('width', this.width)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    this.margin = this.createMargin();
    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;
    this.root = this.parent.append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.loadData()
      .then(data => this.data = data)
      .then(this.onDataLoaded.bind(this));
  }

  createMargin() {
    // TODO if legend is vertical, make bottom margin larger based on the number
    // of legend items
    return {
      top: 0,
      right: 0,
      bottom: this.legendOrientation() === 'horizontal' ? 40 : 60,
      left: 30
    };
  }

  legendOrientation() {
    return (this.width < 200 ? 'vertical' : 'horizontal');
  }

  loadData() {
    // noop, must be implemented by subclass
  }

  renderAxes() {
    this.renderXAxis();
    this.renderYAxis();
  }

  renderXAxis() {
    const xAxis = axisBottom(this.x);
    if (this.xAxisTickFormat) {
      xAxis.tickFormat(this.xAxisTickFormat);
    }
    const xAxisGroup = this.root.append('g')
      .classed('axis axis-x', true);
    xAxisGroup
      .attr('transform', `translate(0, ${this.chartHeight})`)
      .call(xAxis);

    this.parent.select('.axis-x .domain');
    this.parent.select('.axis-x').selectAll('.tick')
      .attr('transform', (d, e) => {
        let x = this.x(d);
        if (this.x.bandwidth) {
          x += (this.x.bandwidth() / 2);
        }
        return `translate(${x}, 5)`;
      })
      .classed('date', d => isDate(d))
      .classed('number', d => isNumber(d))
      .classed('text', d => isString(d));
    const tickText = this.parent.select('.axis-x').selectAll('.tick text')
      .attr('transform', (d, i, nodes) => {
        return `translate(0, -${nodes[i].getBBox().height / 2})`;
      });
    if (this.x.bandwidth) {
      tickText.call(wrap, this.x.bandwidth())
    }

    if (this.xLabel) {
      let xAxisHeight = this.parent.select('.axis-x .tick').node().getBBox().width + 15;
      xAxisGroup.append('text')
        .classed('axis-title', true)
        .text(this.xLabel)
        .attr('transform', `translate(${this.chartWidth / 2}, ${xAxisHeight})`);
    }
  }

  renderYAxis() {
    const yAxis = axisLeft(this.y)
      .ticks(this.yTicks)
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
  }

  renderGuidelines() {
    const yGuideLine = line()
      .x(d => d[0])
      .y(d => d[1]);
    const yGuideLines = this.root.append('g');
    const yGuideLineGroup = yGuideLines.selectAll('.y-guide-line')
      .data(this.y.ticks(this.yTicks).map(tick => [
        [0, this.y(tick)],
        [this.chartWidth, this.y(tick)]
      ]))
      .enter().append('g').classed('y-guide-line', true);
    yGuideLineGroup.append('path')
      .attr('d', d => yGuideLine(d));
  }

  renderXGuidelines() {
    const xGuideLine = line()
      .x(d => d[0])
      .y(d => d[1]);
    const xGuideLines = this.root.append('g');
    const xGuideLineGroup = xGuideLines.selectAll('.x-guide-line')
      .data(this.xTicks().map(tick => [
        [this.x(tick), 0],
        [this.x(tick), this.chartHeight]
      ]))
      .enter().append('g').classed('x-guide-line', true);
    xGuideLineGroup.append('path')
      .attr('d', d => xGuideLine(d));
  }

  xTicks() {
    return this.x.ticks(this.xTicks);
  }

  renderLegend() {
    const legendLine = line()
      .x(d => d[0])
      .y(d => d[1]);
    const legend = this.parent.append('g')
      .classed('legend', true)
      .attr('transform', () => {
        let xOffset = 15;
        let yOffset = this.chartHeight + 40;
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
    this.renderAxes();
    this.renderGuidelines();
    this.renderLegend();
  }
}
