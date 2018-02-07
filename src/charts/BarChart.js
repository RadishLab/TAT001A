import { event as currentEvent, select } from 'd3-selection';

import Chart from './Chart';

export default class BarChart extends Chart {
  constructor(parent, options) {
    super(parent, options);
    this.parent
      .classed('bar-chart', true);
    this.mouseoverStroke = '#555';
    this.defaultStroke = 'none';
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

  render() {
    super.render();
    this.renderBars();
    this.root.selectAll('.bar')
      .on('mouseover', (d, i, nodes) => {
        const overBar = select(nodes[i]);
        overBar.style('stroke', this.mouseoverStroke);

        if (this.tooltipContent) {
          this.tooltip
            .html(this.tooltipContent(d, overBar))
            .classed('visible', true)
            .style('top', `${currentEvent.layerY - 10}px`)
            .style('left', `${currentEvent.layerX + 10}px`);
        }
      })
      .on('mouseout', (d, i, nodes) => {
        const outBar = select(nodes[i]);
        outBar.style('stroke', this.defaultStroke);

        if (this.tooltipContent) {
          this.tooltip.classed('visible', false);
        }
      });
  }
}
