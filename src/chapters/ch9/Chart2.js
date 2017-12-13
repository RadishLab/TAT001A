import { extent } from 'd3-array';
import { axisRight } from 'd3-axis';
import { nest } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { curveBasis, line } from 'd3-shape';
import { timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export class Chart2 extends LineChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.figurePrefix = '9-inset2';
    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Smoking Prevalence');
    this.legendItems = [
      { label: this.getTranslation('Male'), value: 'male' },
      { label: this.getTranslation('Female'), value: 'female' },
    ];
    this.yAxisTickFormat = format('.0%');
  }

  createMargin() {
    const margin = super.createMargin();
    margin.right = 30;
    return margin;
  }

  onDataLoaded(data) {
    this.deathRateScale = this.createDeathRateYScale();
    super.onDataLoaded(data);
  }

  render() {
    super.render();
    this.renderRightAxis();
  }

  renderRightAxis() {
    const yAxis = axisRight(this.deathRateScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);
    const yAxisGroup = this.root.append('g')
      .classed('axis axis-y', true);
    yAxisGroup
      .attr('transform', `translate(${this.chartWidth}, 0)`)
      .call(yAxis)
      .append('text')
        .classed('axis-title', true)
        .attr('transform', `translate(27, ${this.chartHeight / 2}) rotate(-90)`)
        .text('Deaths Caused by Smoking');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/9-2.csv', (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.year);
            row.value = +row.value;
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
    return this.deathRateScale(d.value);
  }

  createXScale() {
    return scaleTime()
      .range([0, this.chartWidth])
      .domain(extent(this.data, d => d.year));
  }

  createYScale() {
    const prevalenceValues = this.data
      .filter(d => d.variable === 'male smoking prevalence' || d.variable === 'female smoking prevalence')
      .map(d => d.value);
    let yExtent = extent(prevalenceValues);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createDeathRateYScale() {
    const values = this.data
      .filter(d => d.variable === 'male lung cancer death rate' || d.variable === 'female lung cancer death rate')
      .map(d => d.value);
    let yExtent = extent(values);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  renderLines() {
    const nested = nest()
      .key(d => d.variable)
      .entries(this.data);

    // Prevalence
    let lineCreator = line()
      .curve(curveBasis)
      .x(this.lineXAccessor.bind(this))
      .y(d => this.y(d.value));

    let lineSelection = this.root.selectAll('.line.prevalence')
      .data(nested.filter(d => d.key.indexOf('prevalence') >= 0))
      .enter().append('g')
        .classed('line prevalence', true);

    lineSelection.append('path')
      .style('stroke', d => {
        const gender = d.key.indexOf('female') >= 0 ? 'female' : 'male';
        return this.colors(gender);
      })
      .attr('d', d => lineCreator(d.values));

    // Death rate
    lineSelection = this.root.selectAll('.line.death-rate')
      .data(nested.filter(d => d.key.indexOf('death rate') >= 0))
      .enter().append('g')
        .classed('line death-rate', true);

    lineCreator = line()
      .curve(curveBasis)
      .x(this.lineXAccessor.bind(this))
      .y(this.lineY2Accessor.bind(this));

    lineSelection.append('path')
      .style('stroke', d => {
        const gender = d.key.indexOf('female') >= 0 ? 'female' : 'male';
        return this.colors(gender);
      })
      .style('stroke-dasharray', '5,5')
      .attr('d', d => lineCreator(d.values.filter(row => row.value > 0)));
  }
}
