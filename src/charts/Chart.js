import { select } from 'd3-selection';

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
  }

  createMargin() {
    return {
      top: 0,
      right: 0,
      bottom: 30,
      left: 30
    };
  }

  loadData() {
    // noop, must be implemented by subclass
  }

  render() {
    this.renderAxes();
    this.renderLegend();
  }
}
