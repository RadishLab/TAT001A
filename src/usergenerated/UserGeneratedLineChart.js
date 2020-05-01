import { ascending, extent, merge, sum } from 'd3-array';
import { nest, set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand, scalePoint, scaleTime } from 'd3-scale';
import { select } from 'd3-selection';
import { timeFormat, timeParse } from 'd3-time-format';
import { voronoi } from 'd3-voronoi';

import { schemeCategoryProblem, schemeCategorySolution } from '../colors';
import LineChart from '../charts/LineChart';

export default class UserGeneratedLineChart extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.options = options;

    this.groupColumn = this.options.groupColumn;

    this.legendItems = [];

    this.xAxisColumn = this.options.xAxisColumn;
    this.xLabel = this.options.xAxisLabel;
    this.interpretXAxisValuesAsDates = true;
    if (this.options.interpretXAxisValuesAsDates) {
      this.interpretXAxisValuesAsDates = (this.options.interpretXAxisValuesAsDates === 'true');
    }

    this.yAxisColumn = this.options.yAxisColumn;
    this.yLabel = this.options.yAxisLabel;
    this.yTicks = 6;
  }

  createMargin() {
    const margin = super.createMargin();
    margin.right = 20;
    margin.top = 15;
    return margin;
  }

  render() {
    let legendColumns;

    // Render y axis, update margin, remove y axis
    this.renderYAxis();
    const yAxisGroup = this.parent.select('.axis-y')
    this.margin.left = yAxisGroup.node().getBBox().width;
    yAxisGroup.node().parentNode.removeChild(yAxisGroup.node());

    // Render x axis, update margin, remove x axis
    this.renderXAxis();
    this.renderLegend(legendColumns);
    const xAxisGroup = this.parent.select('.axis-x').node();
    let legendGroup = this.parent.select('.legend').node();
    this.margin.bottom = xAxisGroup.getBBox().height + legendGroup.getBBox().height + this.legendYPadding;

    // If legend is too wide, break it up into columns
    while (legendGroup.getBBox().width > this.width && (!legendColumns || legendColumns > 1)) {
      legendColumns = legendColumns ? legendColumns - 1 : 2;
      legendGroup.parentNode.removeChild(legendGroup);
      this.renderLegend(legendColumns);
      legendGroup = this.parent.select('.legend').node();
      this.margin.bottom = xAxisGroup.getBBox().height + legendGroup.getBBox().height + this.legendYPadding;
    }
    xAxisGroup.parentNode.removeChild(xAxisGroup);
    legendGroup.parentNode.removeChild(legendGroup);

    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;

    this.root
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.createScales();
    this.renderYAxis();
    this.renderXAxis();
    this.renderLegend(legendColumns);
    this.renderGuidelines();
    this.renderLines();

    this.voronoiGenerator = voronoi()
      .x(this.voronoiXAccessor.bind(this))
      .y(this.voronoiYAccessor.bind(this))
      .extent([
        [0, 0],
        [this.width, this.height - this.margin.bottom]
      ]);
    this.addInteractivity();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.options.dataUrl, (csvData) => {
        const mappedData = csvData.map(d => {
          d.value = +d[this.yAxisColumn];
          d.xValue = d[this.xAxisColumn];
          if (this.interpretXAxisValuesAsDates) {
            d.year = timeParse('%Y')(d.xValue);
          }
          return d;
        });

        this.groups = set(mappedData.map(d => d[this.groupColumn])).values();
        this.legendItems = this.groups.map(d => {
          return { label: d, value: d };
        });

        let nestedData = nest()
          .key(d => d[this.groupColumn])
          .key(d => {
            if (this.interpretXAxisValuesAsDates) {
              return d.year;
            }
            return d.xValue;
          })
            .rollup(leaves => sum(leaves, d => d.value))
          .entries(mappedData);
        resolve(nestedData);
      });
    });
  }

  lineXAccessor(d) {
    const xValue = this.interpretXAxisValuesAsDates ? new Date(d.key) : d.key;
    return this.x(xValue);
  }

  lineYAccessor(d) {
    return this.y(d.value);
  }

  getXValues() {
    let values = this.data.reduce((valueArray, value) => valueArray.concat(value.values), []);
    values = set(values, d => d.key).values();

    if (this.interpretXAxisValuesAsDates) {
      values = values.map(d => new Date(d));
      values.sort(ascending);
    }
    return values;
  }

  createXScale() {
    const scale = this.interpretXAxisValuesAsDates ? scaleTime : scalePoint;
    const domain = this.interpretXAxisValuesAsDates ? extent(this.getXValues()) : this.getXValues();
    return scale()
      .range([0, this.chartWidth])
      .domain(domain);
  }

  getYValues() {
    return this.data.reduce((valueArray, value) => valueArray.concat(value.values), []);
  }

  createYScale() {
    const values = this.getYValues();
    let yExtent = extent(values, d => d.value);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
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

  createZScale() {
    let scheme;
    if (this.options.colorScheme === 'problems') {
      scheme = schemeCategoryProblem;
    }
    else if (this.options.colorScheme === 'solutions') {
      scheme = schemeCategorySolution;
    }
    return scaleOrdinal(scheme);
  }

  getVoronoiData() {
    return merge(this.data.map(d => {
      return d.values.map(value => {
        return {
          category: d.key,
          xValue: value.key,
          value: value.value
        };
      })
    }));
  }

  voronoiXAccessor(d) {
    if (this.interpretXAxisValuesAsDates) {
      return this.x(new Date(d.xValue));
    }
    return this.x(d.xValue);
  }

  tooltipContent(d, line) {
    const yearFormat = timeFormat('%Y');
    const valueFormat = format('.1f');
    let content = `<div class="header">${d.category}</div>`;
    if (this.interpretXAxisValuesAsDates) {
      content += `<div class="data">${yearFormat(new Date(d.xValue))}</div>`;
    }
    else {
      content += `<div class="data">${d.xValue}</div>`;
    }
    content += `<div class="data">${valueFormat(d.value)}</div>`;
    return content;
  }
}
