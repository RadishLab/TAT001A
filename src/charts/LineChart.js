import { select } from 'd3-selection';
import { line } from 'd3-shape';
import { voronoi } from 'd3-voronoi';

import Chart from './Chart';

export default class LineChart extends Chart {
  constructor(parent, options) {
    super(parent, options);
    this.parent
      .classed('line-chart', true);

    if (this.widthCategory === 'narrowest') {
      this.xAxisTickArguments = 4;
    }
  }

  voronoiXAccessor(d) {
    return this.x(new Date(d.year));
  }

  voronoiYAccessor(d) {
    return this.y(d.value);
  }

  createScales() {
    super.createScales();
    this.colors = this.createZScale();
  }

  getLineGenerator() {
    return line()
      .x(this.lineXAccessor.bind(this))
      .y(this.lineYAccessor.bind(this));
  }

  onDataLoaded(data) {
    super.onDataLoaded(data);
    this.line = this.getLineGenerator();

    this.voronoiGenerator = voronoi()
      .x(this.voronoiXAccessor.bind(this))
      .y(this.voronoiYAccessor.bind(this))
      .extent([
        [0, 0],
        [this.width, this.height - this.margin.bottom]
      ]);

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

  onVoronoiMouseOver(d) {
    this.root.selectAll('.line')
      .filter((d, i, nodes) => !select(nodes[i]).classed('not-data'))
      .style('stroke-opacity', lineData => {
        return lineData.key === d.data.category ? 1 : 0.2;
      });

    const x = this.voronoiXAccessor(d.data);
    const y = this.voronoiYAccessor(d.data);
    this.mouseOverCircle
      .attr('cx', x)
      .attr('cy', y);

    if (this.tooltipContent) {
      this.tooltip
        .html(this.tooltipContent(d.data))
        .classed('visible', true);
      this.positionTooltip(x + this.margin.left, y + this.margin.top);
    }
  }

  onVoronoiMouseOut(d) {
    this.root.selectAll('.line')
      .filter((d, i, nodes) => !select(nodes[i]).classed('not-data'))
      .style('stroke-opacity', 1);
    this.tooltip
      .classed('visible', false);
    this.mouseOverCircle
      .attr('cx', -100)
      .attr('cy', -100);
  }

  addInteractivity() {
    if (this.getVoronoiData && this.tooltipContent) {
      this.mouseOverCircle = this.root.append('circle')
        .classed('mouseover-circle', true)
        .style('stroke', 'black')
        .style('stroke-width', 2)
        .style('fill', 'transparent')
        .attr('r', 7)
        .attr('cx', -100)
        .attr('cy', -100);

      this.voronoi = this.root.append('g')
        .classed('voronoi', true);
      this.voronoi.selectAll('path')
        .data(this.voronoiGenerator.polygons(this.getVoronoiData()))
        .enter().append('path')
          .attr('d', d => d ? `M${d.join('L')}Z` : null)
          .style('stroke', 'none')
          .style('fill', 'transparent')
          .on('mouseover', this.onVoronoiMouseOver.bind(this))
          .on('mouseout', this.onVoronoiMouseOut.bind(this));

      this.root.selectAll('.voronoi path')
        .each(d => {
          if (d && d.data) {
            this.tooltipContent(d.data);
          }
        });
    }
  }

  render() {
    super.render();
    this.renderLines();
    this.addInteractivity();
  }
}
