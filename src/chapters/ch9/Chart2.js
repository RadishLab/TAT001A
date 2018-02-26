import { extent } from 'd3-array';
import { nest } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeFormat, timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export class Chart2 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '9-inset2';
    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Smoking Prevalence (%)');
    this.yLabelRight = this.getTranslation('Deaths Caused by Smoking (%)');
    this.yAxisRightTickFormat = format('d');
    this.legendItems = [
      { label: this.getTranslation('Male'), value: 'male' },
      { label: this.getTranslation('Male'), value: 'male' },
      { label: this.getTranslation('Female'), value: 'female' },
      { label: this.getTranslation('Female'), value: 'female' },
    ];
    this.yAxisTickFormat = d => format('d')(d * 100);
    this.legendYOffset = 90;
  }

  createMargin() {
    const margin = super.createMargin();
    margin.right = this.options.web ? 60 : 40;
    margin.top = this.options.web ? 10 : 2;
    return margin;
  }

  createScales() {
    super.createScales();
    this.yRight = this.createDeathRateYScale();
  }

  getLegendRowsCount() {
    return 3;
  }

  renderLegend() {
    const legend = this.createLegendRoot();

    const legendLine = line()
      .x(d => d[0])
      .y(d => d[1]);

    const lineWidth = this.options.web ? 20 : 10;

    let xOffset = 0,
      yOffset = 0;
    const legendLeft = legend.append('g')
      .attr('transform', 'translate(0, 0)');
    const legendLeftItems = [];
    legendLeftItems.push(this.legendItems[0]);
    legendLeftItems.push(this.legendItems[2]);

    let legendItem = legendLeft.append('g')
      .attr('transform', `translate(${xOffset}, ${yOffset})`);
      legendItem.append('text')
        .text(this.getTranslation('Smoking prevalence'))
        .attr('transform', `translate(0, 0)`);

    yOffset += legendItem.node().getBBox().height + 1;

    legendLeftItems.forEach(({ label, value }) => {
      legendItem = legendLeft.append('g')
        .attr('transform', `translate(${xOffset}, ${yOffset})`);
      legendItem.append('text')
        .text(label)
        .attr('transform', `translate(${lineWidth + 2.5}, 0)`);
      const legendItemHeight = legendItem.node().getBBox().height;
      legendItem.append('path')
        .datum([[0, 0], [lineWidth, 0]])
        .style('stroke', this.colors(value))
        .attr('transform', 'translate(0, -2)')
        .attr('transform', `translate(0, -${legendItemHeight / 3})`)
        .attr('d', d => legendLine(d));
      yOffset += legendItem.node().getBBox().height + 1;
    });

    xOffset = 0;
    yOffset = 0;
    const legendRight = legend.append('g')
      .attr('transform', `translate(${legendLeft.node().getBBox().width + 10}, 0)`);
    const legendRightItems = [];
    legendRightItems.push(this.legendItems[1]);
    legendRightItems.push(this.legendItems[3]);

    legendItem = legendRight.append('g')
      .attr('transform', `translate(${xOffset}, ${yOffset})`);
      legendItem.append('text')
        .text(this.getTranslation('Deaths caused by smoking'))
        .attr('transform', `translate(0, 0)`);

    yOffset += legendItem.node().getBBox().height + 1;

    legendRightItems.forEach(({ label, value }) => {
      legendItem = legendRight.append('g')
        .attr('transform', `translate(${xOffset}, ${yOffset})`);
      legendItem.append('text')
        .text(label)
        .attr('transform', `translate(${lineWidth + 2.5}, 0)`);
      const legendItemHeight = legendItem.node().getBBox().height;
      legendItem.append('path')
        .datum([[0, 0], [lineWidth, 0]])
        .style('stroke', this.colors(value))
        .style('stroke-dasharray', '2,2')
        .attr('transform', 'translate(0, -2)')
        .attr('transform', `translate(0, -${legendItemHeight / 3})`)
        .attr('d', d => legendLine(d));
      yOffset += legendItem.node().getBBox().height + 1;
    });
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('9-2.csv'), (csvData) => {
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
    return this.yRight(d.value);
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

  getVoronoiData() {
    return this.data.map(d => {
      d.category = d.variable;
      d.valueType = d.variable.indexOf('death rate') >= 0 ? 'death rate' : 'prevalence';
      return d;
    });
  }

  voronoiYAccessor(d) {
    if (d.valueType === 'death rate') return this.lineY2Accessor(d);
    return this.lineYAccessor(d);
  }

  tooltipContent(d, line) {
    const yearFormat = timeFormat('%Y');
    const valueFormat = format('.1f');

    const title = d.variable[0].toUpperCase() + d.variable.slice(1);
    let content = `<div class="header">${title}</div>`;
    content += `<div class="data">${yearFormat(d.year)}</div>`;

    let value = d.value;
    if (d.valueType === 'prevalence') value *= 100;
    content += `<div class="data">${valueFormat(value)}%</div>`;
    return content;
  }
}
