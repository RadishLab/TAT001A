import { extent } from 'd3-array';
import { axisRight } from 'd3-axis';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeParse } from 'd3-time-format';

import { schemeCategorySolution } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart4 extends LineChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.xLabel = 'Year';
    this.yLabel = 'Price (£)';
    this.legendItems = [
      { label: 'Price per pack, inflation-adjusted', value: 'price' },
      { label: 'Tax-paid consumption', value: 'taxpaid' },
      { label: 'Illicit consumption', value: 'illicit' },
    ];
    this.yAxisTickFormat = format('.2');
  }

  createMargin() {
    const margin = super.createMargin();
    margin.right = 30;
    margin.bottom = this.legendOrientation() === 'horizontal' ? 42 : 60;
    return margin;
  }

  onDataLoaded(data) {
    this.cigaretteScale = this.createCigaretteScale();
    super.onDataLoaded(data);
  }

  render() {
    super.render();
    this.renderRightAxis();
  }

  renderRightAxis() {
    const yAxis = axisRight(this.cigaretteScale)
      .ticks(5)
      .tickFormat(format('d'));
    const yAxisGroup = this.root.append('g')
      .classed('axis axis-y', true);
    yAxisGroup
      .attr('transform', `translate(${this.chartWidth}, 0)`)
      .call(yAxis)
      .append('text')
        .classed('axis-title', true)
        .attr('transform', `translate(27, ${this.chartHeight / 2}) rotate(-90)`)
        .text('Cigarettes (billions)');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/12-4.csv', (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.year);
            row.price = +row['Price per pack (GBP) inflation-adjusted'];
            row.taxpaid = +row['Tax-paid Consumption'];
            row.illicit = +row['Illicit Cigarette Market'];
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
    return this.cigaretteScale(d.value);
  }

  createXScale() {
    return scaleTime()
      .range([0, this.chartWidth])
      .domain(extent(this.data, d => d.year));
  }

  createYScale() {
    const values = this.data.map(d => d.price);
    let yExtent = extent(values);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createCigaretteScale() {
    const values = this.data.map(d => d.taxpaid).concat(this.data.map(d => d.illicit));
    let yExtent = extent(values);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createZScale() {
    return scaleOrdinal(schemeCategorySolution);
  }

  renderLines() {
    // Price
    let lineCreator = line()
      .x(this.lineXAccessor.bind(this))
      .y(this.lineYAccessor.bind(this));

    let lineSelection = this.root.selectAll('.line.price')
      .data([this.data.map(d => ({ year: d.year, value: d.price }))])
      .enter().append('g')
        .classed('line price', true);

    lineSelection.append('path')
      .style('stroke', this.colors('price'))
      .attr('d', d => lineCreator(d));

    // Tax-paid
    lineCreator = line()
      .x(this.lineXAccessor.bind(this))
      .y(this.lineY2Accessor.bind(this));

    lineSelection = this.root.selectAll('.line.taxpaid')
      .data([this.data.map(d => ({ year: d.year, value: d.taxpaid }))])
      .enter().append('g')
        .classed('line taxpaid', true);

    lineSelection.append('path')
      .style('stroke', this.colors('taxpaid'))
      .attr('d', d => lineCreator(d));

    // Illicit
    lineSelection = this.root.selectAll('.line.illicit')
      .data([this.data.map(d => ({ year: d.year, value: d.illicit }))])
      .enter().append('g')
        .classed('line illicit', true);

    lineSelection.append('path')
      .style('stroke', this.colors('illicit'))
      .attr('d', d => lineCreator(d));
  }
}
