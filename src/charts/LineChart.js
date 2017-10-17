import * as d3axis from 'd3-axis';
import * as d3selection from 'd3-selection';
import * as d3shape from 'd3-shape';

export default class LineChart {
  constructor(parent, height, width) {
    this.parent = d3selection.select(parent);
    this.margin = {top: 20, right: 20, bottom: 150, left: 100};
    this.width = width - this.margin.left - this.margin.right;
    this.height = height - this.margin.top - this.margin.bottom;
    this.root = this.parent.append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.loadData()
      .then(data => this.data = data)
      .then(() => {
        this.x = this.createXScale();
        this.y = this.createYScale();
        this.colors = this.createZScale();
        this.line = d3shape.line()
          .x(d => this.x(new Date(d.key)))
          .y(d => this.y(d.value));
        this.render();
      });
  }

  loadData() {
    // noop, must be implemented by subclass
  }

  renderAxes() {
    const xAxis = d3axis.axisBottom(this.x);
    const xAxisGroup = this.root.append('g')
      .attr('class', 'axis axis-x');
    xAxisGroup
      .attr('transform', `translate(0,${this.height})`)
      .call(xAxis);

    this.parent.select('.axis-x .domain')
      .attr('stroke', 'none');
    this.parent.select('.axis-x').selectAll('.tick line').remove();
    this.parent.select('.axis-x').selectAll('.tick')
      .attr('text-anchor', 'end')
      .attr('transform', (d, e) => `translate(${this.x(d)}, 15) rotate(-90)`);

    xAxisGroup.append('text')
      .text(this.xLabel)
      .attr('transform', `translate(${this.width / 2}, 70)`)
      .style('font-size', '16px')
      .style('fill', 'red');

    const yAxis = d3axis.axisLeft(this.y);
    const yAxisGroup = this.root.append('g')
      .attr('class', 'axis axis-y');
    yAxisGroup
      .call(yAxis)
      .append('text')
        .attr('class', 'axis-title')
      .attr('transform', `translate(-${this.margin.left * .7}, ${this.height / 2}) rotate(-90)`)
        .style('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', 'red')
        .text(this.yLabel);

    this.parent.select('.axis-y .domain')
      .attr('stroke', 'none');
    this.parent.select('.axis-y').selectAll('.tick line').remove();

    const yGuideLine = d3shape.line()
      .x(d => this.x(d[0]))
      .y(d => this.y(d[1]));
    const yGuideLines = this.root.append('g');
    const yGuideLineGroup = yGuideLines.selectAll('.y-guide-line')
      .data(this.y.ticks().map(tick => [[this.x.domain()[0], tick], [this.x.domain()[1], tick]]))
      .enter().append('g').attr('class', 'y-guide-line');
    yGuideLineGroup.append('path')
        .style('fill', 'none')
        .style('stroke', '#EDE7DF')
        .style('stroke-width', 2)
      .attr('d', d => yGuideLine(d));
  }

  renderLines() {
    const line = this.root.selectAll('.line')
      .data(this.data)
      .enter().append('g')
        .attr('class', 'line');

    line.append('path')
      .style('fill', 'none')
      .style('stroke', d => this.colors(d.key))
      .style('stroke-width', 3)
      .attr('d', d => this.line(d.values));
  }

  renderLegend() {
    const legendLine = d3shape.line()
      .x(d => d[0])
      .y(d => d[1]);
    const legend = this.root.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(0, ${this.height + 100})`);

    const lineWidth = 25;
    let xOffset = 0;

    this.legendItems.forEach(({ label, value }) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${xOffset}, 0)`);
      legendItem.append('text')
        .text(label)
        .style('font-size', '12px')
        .style('font-family', 'Arial')
        .attr('transform', `translate(${lineWidth + 5}, 0)`);
      legendItem.append('path')
        .datum([[0, 0], [lineWidth, 0]])
        .style('stroke', this.colors(value))
        .style('stroke-width', 5)
        .attr('transform', 'translate(0, -5)')
        .attr('d', d => legendLine(d));
      xOffset += legendItem.node().getBBox().width + 5;
    });
  }

  render() {
    this.renderAxes();
    this.renderLines();
    this.renderLegend();
  }
}
