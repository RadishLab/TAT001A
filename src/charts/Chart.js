import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { format } from 'd3-format';
import { select } from 'd3-selection';
import { line } from 'd3-shape';
import isDate from 'lodash.isdate';
import isNumber from 'lodash.isnumber';
import isString from 'lodash.isstring';

import ellipsify from '../common/ellipsify';
import Visualization from '../Visualization';
import wrap from '../wrap';

export default class Chart extends Visualization {
  constructor(parent, options) {
    super(parent, options);

    this.xAxisTickRows = 1;
    this.legendRows = 0;

    this.loadData()
      .then(data => this.data = data)
      .then(this.onDataLoaded.bind(this));
  }

  getLegendRowsCount() {
    if (this.legendItems) return 1;
    return 0;
  }

  onDataLoaded(data) {
    let legendRowHeight = 20;
    if (this.widthCategory === 'narrowest') legendRowHeight = 10;
    this.legendHeight = this.getLegendRowsCount() * legendRowHeight;

    this.legendYOffset = this.options.web ? 85 : 40;

    this.legendYPadding = 10;
    this.yLabelOffset = 0;

    if (this.options.web) {
      this.legendYOffset = 0;
      this.legendYPadding = 25;
      if (this.widthCategory === 'narrowest') {
        this.legendYPadding = 15;
      }
    }

    this.margin = this.createMargin();
    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;

    this.root = this.parent.append('g')
      .classed('chart', true)
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.createScales();
  }

  createScales() {
    this.x = this.createXScale();
    this.y = this.createYScale();
  }

  createMargin() {
    let bottom = 40;
    let left = this.options.web ? 60 : 40;
    let right = 0;

    if (this.yLabelRight) {
      right = this.options.web ? 50 : 30;
    }

    if (this.options.web) {
      let xAxisTickRowHeight = 25;

      if (this.legendOrientation() === 'horizontal') {
        bottom = 40;
      }
      else {
        bottom = 120;
      }
      if (this.widthCategory === 'narrowest') {
        bottom = 25;
        left = 40;
        xAxisTickRowHeight = 10;

        if (this.yLabelRight) {
          right = 45;
        }
      }
      if (this.legendHeight > 0) {
        bottom = this.legendHeight + this.legendYPadding;
      }
      if (this.xLabel) {
        bottom += 25;
      }

      bottom += this.xAxisTickRows * xAxisTickRowHeight;
    }
    else if (this.legendOrientation() === 'horizontal') {
      bottom = 60;
    }

    return {
      top: 0,
      right,
      left,
      bottom
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

    let tickMarginTop = this.options.web ? 20 : 2.5;
    if (this.widthCategory === 'narrowest') {
      tickMarginTop = 5;
    }
    this.parent.select('.axis-x .domain');
    this.parent.select('.axis-x').selectAll('.tick')
      .attr('transform', (d, e) => {
        let x = this.x(d);
        if (this.x.bandwidth) {
          x += (this.x.bandwidth() / 2);
        }
        return `translate(${x}, ${tickMarginTop})`;
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
      let yOffset = this.parent.select('.axis-x').node().getBBox().height;
      let padding = (this.options.web ? 25 : 10);
      if (this.widthCategory === 'narrowest') padding = 15;
      yOffset += padding;
      xAxisGroup.append('text')
        .classed('axis-title', true)
        .text(this.xLabel)
        .attr('transform', () => `translate(${this.chartWidth / 2}, ${yOffset})`);
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
          .attr('transform', `translate(-${(this.margin.left - (this.options.web ? 15 : 6))}, ${this.chartHeight / 2}) rotate(-90)`);
      axisGroup
        .append('text')
          .classed('axis-title', true)
          .text(this.yLabel[1])
          .attr('transform', `translate(-${(this.margin.left - (this.options.web ? 30 : 13))}, ${this.chartHeight / 2}) rotate(-90)`);
    }

    axisGroup.selectAll('.axis-title')
      .each((d, i, nodes) => ellipsify(select(nodes[i]), this.chartHeight));
  }

  renderYAxis() {
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
        .attr('transform', () => {
          const yAxisWidth = yAxisGroup.node().getBBox().width;
          return `translate(${yAxisWidth + (this.options.web ? 16 : 10)}, ${this.chartHeight / 2}) rotate(-90)`;
        })
        .text(this.yLabelRight);

    yAxisGroup.selectAll('.axis-title')
      .each((d, i, nodes) => ellipsify(select(nodes[i]), this.chartHeight));
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

  createLegendRoot() {
    const legend = this.parent.append('g')
      .classed('legend', true)
      .attr('transform', () => {
        let xOffset = 15;
        let yOffset;
        if (this.legendYOffset) {
          yOffset = this.chartHeight + this.legendYOffset;
        }
        else {
          yOffset = this.margin.top + this.chartHeight + this.legendYPadding;
          const xAxis = this.root.select('.axis-x');
          if(xAxis.node()) yOffset += xAxis.node().getBBox().height;
        }
        return `translate(${xOffset}, ${yOffset})`;
      });
    return legend;
  }

  renderLegend(columns = null) {
    const legend = this.createLegendRoot();

    const legendLine = line()
      .x(d => d[0])
      .y(d => d[1]);

    const legendHeight = this.options.web ? 20 : 8;
    const lineWidth = this.options.web ? 20 : 10;
    const linePadding = this.options.web ? 5 : 2.5;
    let xOffset = 0,
      yOffset = 0;

    let currentColumn;
    let itemsPerColumn;
    let itemsAdded = 0;
    let columnXOffset = 0;
    if (columns) {
      itemsPerColumn = this.legendItems.length / columns;
    }

    this.legendItems.forEach(({ label, value }) => {
      let targetContainer = legend;
      if (columns) {
        if (itemsAdded % itemsPerColumn === 0) {
          if (currentColumn) {
            columnXOffset += currentColumn.node().getBBox().width;
          }
          currentColumn = legend.append('g')
            .classed('legend-column', true)
            .attr('transform', `translate(${columnXOffset}, 0)`);
          xOffset = yOffset = 0;
        }
        targetContainer = currentColumn;
      }

      const legendItem = targetContainer.append('g')
        .attr('transform', `translate(${xOffset}, ${yOffset})`);
      legendItem.append('text')
        .text(label)
        .attr('transform', `translate(${lineWidth + linePadding}, 0)`);
      legendItem.append('path')
        .datum([[0, 0], [lineWidth, 0]])
        .style('stroke', this.colors(value))
        .attr('transform', `translate(0, -${legendHeight / 4})`)
        .attr('d', d => legendLine(d));

      if (this.legendOrientation() === 'horizontal' && !columns) {
        xOffset += legendItem.node().getBBox().width + 5;
      }
      else {
        yOffset += legendItem.node().getBBox().height + 1;
      }
      itemsAdded++;
    });
  }

  render() {
    this.renderAxes();
    this.renderGuidelines();
    this.renderLegend();
  }
}
