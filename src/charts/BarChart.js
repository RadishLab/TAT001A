import Chart from './Chart';

export default class BarChart extends Chart {
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

  render() {
    super.render();
    this.renderBars();
  }
}
