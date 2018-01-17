import { arc, pie } from 'd3-shape';

import Chart from './Chart';

export default class PieChart extends Chart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.parent
      .classed('pie-chart', true);
    this.radius = 100;
    this.margin = this.createMargin();
    this.root
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.chartWidth = 2 * this.radius;
    this.chartHeight = 2 * this.radius;
  }

  createMargin() {
    const margin = super.createMargin();
    margin.left = this.radius || 0;
    margin.top = this.radius || 0;
    return margin;
  }

  onDataLoaded(data) {
    this.pie = pie()
      .value(this.valueAccessor)(data);
    this.colors = this.createZScale();
    this.render();
  }

  colorAccessor(d) {
    return d.data.color;
  }

  labelAccessor(d) {
    return d.data.label;
  }

  valueAccessor(d) {
    return d.value;
  }

  renderArcs() {
    const arcGenerator = arc()
      .innerRadius(0)
      .outerRadius(this.radius);
    const arcEnter = this.root.selectAll('.arc')
      .data(this.pie)
      .enter();

    arcEnter
      .append('path')
        .classed('arc', true)
        .attr('d',  arcGenerator)
        .style('fill', d => this.colors(this.colorAccessor(d)));

    arcEnter
      .append('text')
        .classed('arc-label', true)
        .text(this.labelAccessor)
        .attr('x', d => arcGenerator.centroid(d)[0])
        .attr('y', d => arcGenerator.centroid(d)[1]);
  }

  render() {
    this.renderArcs();
    this.renderLegend();
  }
}
