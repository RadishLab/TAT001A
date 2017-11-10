import { line } from 'd3-shape';

import Chart from './Chart';

/*
 * A vertically-oriented bar chart (where the bars run horizontally).
 */
export default class BarChartVertical extends Chart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.parent
      .classed('bar-chart', true);
  }

  onDataLoaded(data) {
    this.x = this.createXScale();
    this.y = this.createYScale();
    this.colors = this.createZScale();
    this.render();
  }

  createBarGroups() {
    return this.root.selectAll('.bar')
      .data(this.data)
      .enter().append('g');
  }

  renderBars() {
    this.createBarGroups();
  }

  renderGuidelines() {
    const xGuideLine = line()
      .x(d => d[0])
      .y(d => d[1]);
    const xGuideLines = this.root.append('g');
    const xGuideLineGroup = xGuideLines.selectAll('.x-guide-line')
      .data(this.x.ticks(this.xTicks).map(tick => [
        [this.x(tick), 0],
        [this.x(tick), this.chartHeight]
      ]))
      .enter().append('g').classed('x-guide-line', true);
    xGuideLineGroup.append('path')
      .attr('d', d => xGuideLine(d));
  }

  renderLegend() {
    super.renderLegend();
    this.parent.select('.legend')
      .attr('transform', () => {
        const xOffset = 5;
        const yOffset = this.chartHeight + 25;
        return `translate(${xOffset}, ${yOffset})`;
      });
  }

  render() {
    super.render();
    this.renderBars();
  }
}
