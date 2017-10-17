import * as d3array from 'd3-array';
import * as d3axis from 'd3-axis';
import * as d3collection from 'd3-collection';
import { csv as d3csv } from 'd3-request';
import * as d3scale from 'd3-scale';
import * as d3selection from 'd3-selection';
import * as d3shape from 'd3-shape';
import * as d3timeFormat from 'd3-time-format';

import { schemeCategoryProblem } from '../colors';

export default class LineChart {
  constructor(parent, height, width) {
    this.parent = d3selection.select(parent);
    this.margin = {top: 20, right: 20, bottom: 150, left: 100};
    this.width = width - this.margin.left - this.margin.right;
    this.height = height - this.margin.top - this.margin.bottom;
    this.root = this.parent.append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.x = d3scale.scaleTime()
      .range([0, this.width]);

    this.y = d3scale.scaleLinear()
      .range([this.height, 0]);

    this.colors = d3scale.scaleOrdinal(schemeCategoryProblem);

    this.line = d3shape.line()
      .x(d => this.x(new Date(d.key)))
      .y(d => this.y(d.value));

    d3csv('data/growing.csv', (csvData) => {
      const filteredData = csvData
        .filter(row => row.element === 'Production')
        .map(row => {
          row.year = d3timeFormat.timeParse('%Y')(row.year);
          return row;
        });
      const nest = d3collection.nest()
        .key(d => d.incomegroup)
        .key(d => d.year)
          .rollup(leaves => d3array.sum(leaves, d => d.value))
        .entries(filteredData);
      this.data = nest;

      // Flatten nest to get extents
      const values = this.data.reduce((valueArray, value) => valueArray.concat(value.values), []);
      this.x.domain(d3array.extent(values, d => new Date(d.key)));

      let yExtent = d3array.extent(values, d => d.value);
      yExtent[0] = Math.min(0, yExtent[0]);
      this.y.domain(yExtent);

      this.render();
    });
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
      .text('Year')
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
        .text('Tonnes');

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

    const legendItems = [
      { label: 'Low Income Countries', value: 'LOW' },
      { label: 'Middle Income Countries', value: 'MIDDLE' },
      { label: 'High Income Countries', value: 'HIGH' },
    ];

    legendItems.forEach(({ label, value }) => {
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
