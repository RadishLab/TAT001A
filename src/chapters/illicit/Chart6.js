import { extent } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';
import { line } from 'd3-shape';
import { timeFormat, timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart6 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.xAxisTickFormat = (d) => timeFormat('%Y')(new Date(d));
    this.yAxisTickFormat = d => format('.2')(d / 1000000000);
    this.yAxisRightTickFormat = format('d');
    this.yTicks = 6;
  }

  getFigurePrefix() {
    return 'illicit-6';
  }

  onTranslationsLoaded() {
    this.legendItems = [
      { label: this.getTranslation('Legal cigarette consumption'), value: 'legal-consumption' },
      { label: this.getTranslation('Industry-estimated illicit consumption'), value: 'illicit-consumption' },
      { label: this.getTranslation('Illicit market share'), value: 'illicit-share' }
    ];
    this.yLabel = this.getTranslation('Cigarettes consumed (billions)');
    this.yLabelRight = this.getTranslation('Illicit market share (%)');
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('illicit-6.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d.illicitConsumption = +d['Industry-estimated illegal consumption (includes contraband, counterfeit, illegal whites, duty free and crossborder purchasing)'];
          d.illicitShare = +d['Illicit market share'] * 100;
          d.legalConsumption = +d['Legal cigarette consumption'];
          d.year = timeParse('%Y')(d.year);
          return d;
        });
        resolve(mappedData);
      });
    });
  }

  createScales() {
    super.createScales();
    this.yRight = this.createShareScale();
  }

  createMargin() {
    const margin = super.createMargin();
    margin.right = this.options.web ? 50 : 30;
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
    const values = this.data.map(d => d.illicitConsumption).concat(this.data.map(d => d.legalConsumption));
    let yExtent = extent(values);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createShareScale() {
    let yExtent = extent(this.data.map(d => d.illicitShare));
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  getXValue(d) {
    return d.year;
  }

  lineAccessor(d) {
    return this.yRight(d.illicitShare);
  }

  render() {
    super.render();
    this.renderLines();
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 2;

    barGroups.append('rect')
      .classed('bar legal', true)
      .attr('x', d => this.x(this.getXValue(d)))
      .attr('width', barWidth)
      .attr('y', d => this.y(d.legalConsumption))
      .attr('height', d => this.chartHeight - this.y(d.legalConsumption))
      .attr('fill', this.colors('legal-consumption'));

    barGroups.append('rect')
      .classed('bar illicit', true)
      .attr('x', d => this.x(this.getXValue(d)) + barWidth)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.illicitConsumption))
      .attr('height', d => this.chartHeight - this.y(d.illicitConsumption))
      .attr('fill', this.colors('illicit-consumption'));
  }

  renderLines() {
    let lineCreator = line()
      .x(d => this.x(d.year) + this.x.bandwidth() / 2)
      .y(d => this.yRight(d.value));

    let lineSelection = this.root.selectAll('.line.illicit-share')
      .data([this.data.map(d => ({ year: d.year, value: d.illicitShare }))])
      .enter().append('g')
      .classed('line illicit-share', true);

    lineSelection.append('path')
      .style('stroke', this.colors('illicit-share'))
      .style('stroke-width', 2)
      .style('fill', 'none')
      .attr('d', d => lineCreator(d));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  tooltipContent(d, bar) {
    const yearFormat = timeFormat('%Y');
    const numberFormat = d => format('.1f')(d / 1000000000);
    const value = bar.classed('legal') ? d.legalConsumption : d.illicitConsumption;
    const description = this.getTranslation(bar.classed('legal') ? 'legal consumption' : 'illicit consumption');

    let content = `<div class="header">${yearFormat(d.year)} - ${description}</div>`;
    content += `<div class="data">${numberFormat(value)} ${this.getTranslation('billion cigarettes')}</div>`;
    return content;
  }
}
