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
    super.onDataLoaded(data);
    this.colors = this.createZScale();
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
        .classed('visible', true)
        .style('top', `${currentEvent.layerY - 10}px`)
        .style('left', `${currentEvent.layerX + 10}px`);
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
