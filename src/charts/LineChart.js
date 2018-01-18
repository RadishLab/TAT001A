import { line } from 'd3-shape';

import Chart from './Chart';

export default class LineChart extends Chart {
  constructor(parent, options) {
    super(parent, options);
    this.parent
      .classed('line-chart', true);
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

  renderLines() {
    const line = this.root.selectAll('.line')
      .data(this.data)
      .enter().append('g')
        .classed('line', true);

    line.append('path')
      .style('stroke', d => this.colors(d.key))
      .attr('d', d => this.line(d.values));
  }

  render() {
    super.render();
    this.renderLines();
  }
}
