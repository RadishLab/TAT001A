import { event as currentEvent, select } from 'd3-selection';

import Chart from './Chart';

/*
 * A vertically-oriented bar chart (where the bars run horizontally).
 */
export default class BarChartVertical extends Chart {
  constructor(parent, options) {
    super(parent, options);
    this.parent
      .classed('bar-chart', true);
    this.mouseoverStroke = '#555';
    this.defaultStroke = 'none';
  }

  createScales() {
    super.createScales();
    this.colors = this.createZScale();
  }

  onDataLoaded() {
    super.onDataLoaded();
    this.render();
  }

  createBarGroups() {
    return this.root.selectAll('.bar')
      .data(this.data)
      .enter().append('g');
  }

  onMouseOverBar(d, bar) {
    bar.style('stroke', this.mouseoverStroke);
    if (this.tooltipContent) {
      this.tooltip
        .html(this.tooltipContent(d, bar))
        .classed('visible', true);
      this.positionTooltip(currentEvent.layerX, currentEvent.layerY);
    }
  }

  onMouseOutBar(d, bar) {
    bar.style('stroke', this.defaultStroke);

    if (this.tooltipContent) {
      this.tooltip.classed('visible', false);
    }
  }

  renderBars() {
    this.createBarGroups();
  }

  renderGuidelines() {
    this.renderXGuidelines();
  }

  render() {
    super.render();
    this.renderBars();
    this.root.selectAll('.bar')
      .on('mouseover', (d, i, nodes) => {
        this.onMouseOverBar(d, select(nodes[i]));
      })
      .on('mouseout', (d, i, nodes) => {
        this.onMouseOutBar(d, select(nodes[i]));
      });
  }
}
