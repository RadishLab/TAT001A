import Chart from './Chart';

/*
 * A vertically-oriented bar chart (where the bars run horizontally).
 */
export default class BarChartVertical extends Chart {
  constructor(parent, options) {
    super(parent, options);
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
    this.renderXGuidelines();
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
