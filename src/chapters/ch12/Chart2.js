import { extent } from 'd3-array';
import { axisRight } from 'd3-axis';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { curveBasis, line } from 'd3-shape';
import { timeParse } from 'd3-time-format';

import { schemeCategorySolution } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart2 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '12-inset2';
    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Price / Tax Index');
    this.legendItems = [
      { label: this.getTranslation('Price'), value: 'price' },
      { label: this.getTranslation('Tax'), value: 'tax' },
      { label: this.getTranslation('Prevalence'), value: 'prevalence' },
    ];
    this.yAxisTickFormat = format('.2');
  }

  createMargin() {
    const margin = super.createMargin();
    margin.right = 30;
    return margin;
  }

  onDataLoaded(data) {
    this.prevalenceScale = this.createPrevalenceScale();
    super.onDataLoaded(data);
  }

  render() {
    super.render();
    this.renderRightAxis();
  }

  renderRightAxis() {
    const yAxis = axisRight(this.prevalenceScale)
      .ticks(5)
      .tickFormat(d => format('d')(d * 100));
    const yAxisGroup = this.root.append('g')
      .classed('axis axis-y', true);
    yAxisGroup
      .attr('transform', `translate(${this.chartWidth}, 0)`)
      .call(yAxis)
      .append('text')
        .classed('axis-title', true)
        .attr('transform', `translate(27, ${this.chartHeight / 2}) rotate(-90)`)
        .text(this.getTranslation('Smoking Prevalence (%)'));
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/12-2.csv', (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.year);
            row.price = +row['price (index)'];
            row.tax = +row['tax (index)'];
            row.prevalence = +row['prevalence'];
            return row;
          });
        resolve(mappedData);
      });
    });
  }

  lineXAccessor(d) {
    return this.x(d.year);
  }

  lineYAccessor(d) {
    return this.y(d.value);
  }

  lineY2Accessor(d) {
    return this.prevalenceScale(d.value);
  }

  createXScale() {
    return scaleTime()
      .range([0, this.chartWidth])
      .domain(extent(this.data, d => d.year));
  }

  createYScale() {
    const values = this.data.map(d => d.price).concat(this.data.map(d => d.tax));
    let yExtent = extent(values);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createPrevalenceScale() {
    const values = this.data.map(d => d.prevalence);
    let yExtent = extent(values);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createZScale() {
    const colors = schemeCategorySolution.slice();
    colors[1] = '#585857';
    return scaleOrdinal(colors);
  }

  renderLines() {
    // Price
    let lineCreator = line()
      .curve(curveBasis)
      .x(this.lineXAccessor.bind(this))
      .y(this.lineYAccessor.bind(this));

    let lineSelection = this.root.selectAll('.line.price')
      .data([this.data.map(d => ({ year: d.year, value: d.price }))])
      .enter().append('g')
        .classed('line price', true);

    lineSelection.append('path')
      .style('stroke', this.colors('price'))
      .attr('d', d => lineCreator(d));

    // Tax
    lineSelection = this.root.selectAll('.line.tax')
      .data([this.data.map(d => ({ year: d.year, value: d.tax }))])
      .enter().append('g')
        .classed('line tax', true);

    lineSelection.append('path')
      .style('stroke', this.colors('tax'))
      .attr('d', d => lineCreator(d));

    // Prevalence
    lineCreator = line()
      .curve(curveBasis)
      .x(this.lineXAccessor.bind(this))
      .y(this.lineY2Accessor.bind(this));

    lineSelection = this.root.selectAll('.line.prevalence')
      .data([this.data.map(d => ({ year: d.year, value: d.prevalence }))])
      .enter().append('g')
        .classed('line prevalence', true);

    lineSelection.append('path')
      .style('stroke', this.colors('prevalence'))
      .attr('d', d => lineCreator(d));
  }
}
