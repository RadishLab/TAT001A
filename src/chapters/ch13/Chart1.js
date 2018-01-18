import { axisRight } from 'd3-axis';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';
import { line } from 'd3-shape';
import { timeFormat, timeParse } from 'd3-time-format';

import { schemeCategorySolution } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart3 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '13-inset3';
    this.xAxisTickFormat = (d) => timeFormat('%Y')(new Date(d));
    this.yLabel = this.getTranslation('Population protected (billions)');
    this.yTicks = 6;
    this.legendItems = [
      { label: this.getTranslation('Countries'), value: 'countries' },
      { label: this.getTranslation('Population'), value: 'population' },
    ];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/13-1.csv', (csvData) => {
        const mappedData = csvData.map(d => {
          d.countries = +d['Total number of countries'];
          d.population = +d['Population protected (in billions)'];
          d.year = timeParse('%Y')(d.Year);
          return d;
        });
        resolve(mappedData);
      });
    });
  }

  onDataLoaded(data) {
    this.countryScale = this.createCountryScale();
    super.onDataLoaded(data);
  }

  createMargin() {
    const margin = super.createMargin();
    margin.bottom = this.legendOrientation() === 'horizontal' ? 32 : 40;
    margin.right = 30;
    margin.top = 10;
    return margin;
  }

  createXScale() {
    const values = this.data.map(this.getXValue);
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  createYScale() {
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain([0, 8]);
  }

  createCountryScale() {
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain([0, 195]);
  }

  getXValue(d) {
    return d.year;
  }

  lineAccessor(d) {
    return this.countryScale(d.value);
  }

  render() {
    super.render();
    this.renderRightAxis();
    this.renderLines();
    this.renderPopulationLine();
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth();

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(this.getXValue(d)))
        .attr('width', barWidth)
        .attr('y', d => this.y(d.population))
        .attr('height', d => this.chartHeight - this.y(d.population))
        .attr('fill', this.colors('population'));
  }

  renderLines() {
    let lineCreator = line()
      .x(d => this.x(d.year) + this.x.bandwidth() / 2)
      .y(d => this.countryScale(d.value));

    let lineSelection = this.root.selectAll('.line.country')
      .data([this.data.map(d => ({ year: d.year, value: d.countries }))])
      .enter().append('g')
        .classed('line country', true);

    lineSelection.append('path')
      .style('stroke', this.colors('countries'))
      .style('fill', 'none')
      .attr('d', d => lineCreator(d));
  }

  renderPopulationLine() {
    let lineCreator = line()
      .x(d => { console.log(d); return d[0]; })
      .y(d => { console.log(this.y(d[1])); return this.y(d[1]) });

    let lineSelection = this.root.selectAll('.line.global-population')
      .data([[
        [0, 7.6],
        [this.chartWidth, 7.6]
      ]])
      .enter().append('g')
        .classed('line global-population', true);

    lineSelection.append('path')
      .style('stroke', '#585857')
      .style('fill', 'none')
      .style('stroke-dasharray', '5,5')
      .style('stroke-width', 0.25)
      .attr('d', d => lineCreator(d));
  }

  renderRightAxis() {
    const yAxis = axisRight(this.countryScale)
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
        .text(this.getTranslation('Countries'));
  }

  createZScale() {
    const colors = schemeCategorySolution.slice();
    colors[1] = '#00a792';
    return scaleOrdinal(colors);
  }
}
