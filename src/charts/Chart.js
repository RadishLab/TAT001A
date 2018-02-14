import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { format } from 'd3-format';
import { line } from 'd3-shape';
import isDate from 'lodash.isdate';
import isNumber from 'lodash.isnumber';
import isString from 'lodash.isstring';

import Visualization from '../Visualization';
import wrap from '../wrap';

export default class Chart extends Visualization {
  constructor(parent, options) {
    super(parent, options);

    // TODO make legend height dynamic (and over-rideable) based on the number
    // of items and orientation, subtract this from chartHeight

    this.legendHeight = 15;

    this.margin = this.createMargin();
    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom - this.legendHeight;
    this.root = this.parent.append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.loadData()
      .then(data => this.data = data)
      .then(this.onDataLoaded.bind(this));
    this.legendYOffset = 40;
    this.yLabelOffset = 0;
  }

  createMargin() {
    return {
      top: 0,
      right: 0,
      bottom: this.legendOrientation() === 'horizontal' ? 40 : 60,
      left: this.options.web ? 60 : 40
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
    if (this.yRight) {
      this.renderYAxisRight();
    }
  }

  renderXAxis() {
    const xAxis = axisBottom(this.x);
    if (this.xAxisTickArguments) {
      xAxis.ticks(this.xAxisTickArguments);
    }
    if (this.xAxisTickFormat) {
      xAxis.tickFormat(this.xAxisTickFormat.bind(this));
    }
    if (this.xAxisTickValues) {
      xAxis.tickValues(this.xAxisTickValues());
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
        return `translate(${x}, 2.5)`;
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
      let xAxisHeight = this.parent.select('.axis-x').node().getBBox().height + 10;
      xAxisGroup.append('text')
        .classed('axis-title', true)
        .text(this.xLabel)
        .attr('transform', `translate(${this.chartWidth / 2}, ${xAxisHeight})`);
    }
  }

  defaultYAxisTickFormat(d) {
    if (d === 0) return '0';
    return format('.2s')(d);
  }

  renderYLabel(axisGroup) {
    if (typeof this.yLabel === 'string') {
      axisGroup.append('text')
        .classed('axis-title', true)
        .attr('transform', `translate(${-(this.margin.left - 15)}, ${(this.chartHeight / 2) + this.yLabelOffset}) rotate(-90)`)
        .text(this.yLabel);
    }
    else if (Array.isArray(this.yLabel) && this.yLabel.length === 2) {
      axisGroup
        .append('text')
          .classed('axis-title', true)
          .text(this.yLabel[0])
          .attr('transform', `translate(-${(this.margin.left - 6)}, ${this.chartHeight / 2}) rotate(-90)`);
      axisGroup
        .append('text')
          .classed('axis-title', true)
          .text(this.yLabel[1])
          .attr('transform', `translate(-${(this.margin.left - 13)}, ${this.chartHeight / 2}) rotate(-90)`);
    }
  }

  renderYAxis() {
    // TODO x translate based on size of y-axis and y label rather than 25
    // (magic number)
    const yAxis = axisLeft(this.y)
      .ticks(this.yTicks)
      .tickFormat(this.yAxisTickFormat ? this.yAxisTickFormat : this.defaultYAxisTickFormat);
    const yAxisGroup = this.root.append('g')
      .classed('axis axis-y', true);
    yAxisGroup.call(yAxis);
    this.renderYLabel(yAxisGroup);
    this.parent.select('.axis-y').selectAll('.tick')
      .classed('date', d => isDate(d))
      .classed('number', d => isNumber(d))
      .classed('text', d => isString(d));
  }

  renderYAxisRight() {
    const yAxis = axisRight(this.yRight)
      .ticks(5)
      .tickFormat(this.yAxisRightTickFormat ? this.yAxisRightTickFormat : this.defaultYAxisTickFormat);
    const yAxisGroup = this.root.append('g')
      .classed('axis axis-y', true);
    yAxisGroup
      .attr('transform', `translate(${this.chartWidth}, 0)`)
      .call(yAxis)
      .append('text')
        .classed('axis-title', true)
        .attr('transform', `translate(27, ${this.chartHeight / 2}) rotate(-90)`)
        .text(this.yLabelRight);
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
    const xGuideLine = line();
    const xGuideLines = this.root.append('g');
    const xGuideLineGroup = xGuideLines.selectAll('.x-guide-line')
      .data(this.xTicks(this.xTicks).map(tick => [
        [this.x(tick), 0],
        [this.x(tick), this.chartHeight]
      ]))
      .enter().append('g').classed('x-guide-line', true);
    xGuideLineGroup.append('path')
      .attr('d', xGuideLine);
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
        let yOffset = this.chartHeight + this.legendYOffset;
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
        .attr('transform', `translate(${lineWidth + 2.5}, 0)`);
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
