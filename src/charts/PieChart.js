import { event as currentEvent, select } from 'd3-selection';
import { arc, pie } from 'd3-shape';

import Chart from './Chart';

export default class PieChart extends Chart {
  constructor(parent, options) {
    super(parent, options);
    this.parent
      .classed('pie-chart', true);
    this.radius = this.options.web ? 200 : 100;
    this.margin = this.createMargin();
    this.root
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.chartWidth = 2 * this.radius;
    this.chartHeight = 2 * this.radius;

    this.height = this.radius * 2 + 100;
    this.parent
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    this.mouseoverStroke = '#555';
  }

  createMargin() {
    const margin = super.createMargin();
    margin.left = this.parent.node().getBoundingClientRect().width / 2;
    if (this.radius) {
      margin.top = this.radius + 5;
    }
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

    const arcGroup = arcEnter.append('g').classed('arc-group', true);

    arcGroup
      .append('path')
        .classed('arc', true)
        .attr('d',  arcGenerator)
        .style('stroke-width', 2)
        .style('stroke', d => this.colors(this.colorAccessor(d)))
        .style('fill', d => this.colors(this.colorAccessor(d)));

    arcGroup
      .append('text')
        .classed('arc-label', true)
        .text(this.labelAccessor)
        .attr('x', d => arcGenerator.centroid(d)[0])
        .attr('y', d => arcGenerator.centroid(d)[1]);

    arcGroup
      .on('mouseover', (d, i, nodes) => {
        const over = select(nodes[i]);
        over.select('path').style('stroke', this.mouseoverStroke);
        over.node().parentNode.appendChild(over.node());

        if (this.tooltipContent) {
          this.tooltip
            .html(this.tooltipContent(d, over))
            .classed('visible', true)
            .style('top', `${currentEvent.layerY - 10}px`)
            .style('left', `${currentEvent.layerX + 10}px`);
        }
      })
      .on('mouseout', (d, i, nodes) => {
        select(nodes[i]).select('path')
          .style('stroke', d => this.colors(this.colorAccessor(d)));

        if (this.tooltipContent) {
          this.tooltip.classed('visible', false);
        }
      });
  }

  render() {
    this.renderArcs();
    this.renderLegend();
    const legend = this.parent.select('.legend');
    legend
      .attr('transform', () => {
        let xOffset = (this.width / 2) - (legend.node().getBoundingClientRect().width / 2);
        let yOffset = this.chartHeight + this.legendYOffset;
        return `translate(${xOffset}, ${yOffset})`;
      });
  }
}
