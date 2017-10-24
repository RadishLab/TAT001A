import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { line } from 'd3-shape';

export default class LineChart {
  constructor(parent, width, height) {
    this.width = width;
    this.height = height;
    this.parent = select(parent)
      .attr('height', this.height)
      .attr('width', this.width)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);
    this.margin = {
      top: 0,
      right: 0,
      bottom: this.legendOrientation() === 'horizontal' ? 40 : 64,
      left: 45
    };
    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;
    this.root = this.parent.append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.loadData()
      .then(data => this.data = data)
      .then(() => {
        this.x = this.createXScale();
        this.y = this.createYScale();
        this.colors = this.createZScale();
        this.line = line()
          .x(this.lineXAccessor.bind(this))
          .y(this.lineYAccessor.bind(this));
        this.render();
      });
  }

  loadData() {
    // noop, must be implemented by subclass
  }

  renderAxes() {
    const xAxis = axisBottom(this.x);
    const xAxisGroup = this.root.append('g')
      .attr('class', 'axis axis-x');
    xAxisGroup
      .attr('transform', `translate(0, ${this.chartHeight})`)
      .call(xAxis);

    this.parent.select('.axis-x .domain')
      .attr('stroke', 'none');
    this.parent.select('.axis-x').selectAll('.tick line').remove();
    this.parent.select('.axis-x').selectAll('.tick')
      .attr('text-anchor', 'middle')
      .attr('transform', (d, e) => `translate(${this.x(d)}, 5)`);
    this.parent.select('.axis-x').selectAll('.tick text')
      .style('font-size', '6px')
      .attr('transform', (d, i, nodes) => {
        return `translate(0, -${nodes[i].getBBox().height / 2})`;
      });

    let xAxisHeight = this.parent.select('.axis-x .tick').node().getBBox().width + 15;
    xAxisGroup.append('text')
      .text(this.xLabel)
      .attr('transform', `translate(${this.chartWidth / 2}, ${xAxisHeight})`)
      .style('font-size', '6px')
      .style('fill', 'red');

    const yAxis = axisLeft(this.y)
      .ticks(5);
    const yAxisGroup = this.root.append('g')
      .attr('class', 'axis axis-y');
    yAxisGroup
      .call(yAxis)
      .append('text')
        .attr('class', 'axis-title')
        .attr('transform', `translate(-${this.margin.left * .8}, ${this.chartHeight / 2}) rotate(-90)`)
        .style('text-anchor', 'middle')
        .style('font-size', '6px')
        .style('fill', 'red')
        .text(this.yLabel);

    this.parent.select('.axis-y .domain')
      .attr('stroke', 'none');
    this.parent.select('.axis-y').selectAll('.tick line').remove();
    this.parent.select('.axis-y').selectAll('.tick text')
      .style('font-size', '6px');

    const yGuideLine = line()
      .x(d => this.x(d[0]))
      .y(d => this.y(d[1]));
    const yGuideLines = this.root.append('g');
    const yGuideLineGroup = yGuideLines.selectAll('.y-guide-line')
      .data(this.y.ticks(5).map(tick => [[this.x.domain()[0], tick], [this.x.domain()[1], tick]]))
      .enter().append('g').attr('class', 'y-guide-line');
    yGuideLineGroup.append('path')
        .style('fill', 'none')
        .style('stroke', '#EDE7DF')
        .style('stroke-width', 1)
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
      .style('stroke-width', 1)
      .attr('d', d => this.line(d.values));
  }

  legendOrientation() {
    return (this.width < 200 ? 'vertical' : 'horizontal');
  }

  renderLegend() {
    const legendLine = line()
      .x(d => d[0])
      .y(d => d[1]);
    const legend = this.parent.append('g')
      .attr('class', 'legend')
      .attr('transform', () => {
        let xOffset = 10;
        let yOffset = this.chartHeight + 40; // TODO generalize
        return `translate(${xOffset}, ${yOffset})`;
      });

    const lineWidth = 10;
    let xOffset = 0,
      yOffset = 0;

    this.legendItems.forEach(({ label, value }) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${xOffset}, ${yOffset})`);
      legendItem.append('text')
        .text(label)
        .style('font-size', '6px')
        .attr('transform', `translate(${lineWidth + 5}, 0)`);
      legendItem.append('path')
        .datum([[0, 0], [lineWidth, 0]])
        .style('stroke', this.colors(value))
        .style('stroke-width', 2)
        .attr('transform', 'translate(0, -2)')
        .attr('d', d => legendLine(d));

      if (this.legendOrientation() === 'horizontal') {
        xOffset += legendItem.node().getBBox().width + 5;
      } else {
        yOffset += legendItem.node().getBBox().height + 1;
      }
    });
  }

  render() {
    this.renderAxes();
    this.renderLines();
    this.renderLegend();
  }
}
