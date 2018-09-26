import { extent } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeFormat, timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart1 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.yAxisTickFormat = format('d');
    this.yAxisRightTickFormat = format('d');
  }

  getFigurePrefix() {
    return 'illicit-1';
  }

  onTranslationsLoaded() {
    this.yLabel = this.getTranslation('Price (£)');
    this.yLabelRight = this.getTranslation('Cigarettes (billions)');
    this.legendItems = [
      { label: this.getTranslation('Price per pack, inflation-adjusted'), value: 'price' },
      { label: this.getTranslation('Illicit consumption'), value: 'consumption' }
    ];
    super.onTranslationsLoaded();
  }

  createMargin() {
    const margin = super.createMargin();
    margin.top = 2;
    return margin;
  }

  createScales() {
    super.createScales();
    this.yRight = this.createConsumptionYScale();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('illicit-1.csv'), (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.year);
            row.consumption = +row['Illicit consumption'];
            row.price = +row['Price per pack, inflation-adjusted'];
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
    const values = this.data.map(d => d.price);
    let yExtent = extent(values);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createConsumptionYScale() {
    const values = this.data.map(d => d.consumption);
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
    // Price
    let lineCreator = line()
      .x(this.lineXAccessor.bind(this))
      .y(this.lineYAccessor.bind(this));

    let lineSelection = this.root.selectAll('.line.price')
      .data([{
        key: 'price',
        values: this.data.map(d => ({ year: d.year, value: d.price }))
      }])
      .enter().append('g')
        .classed('line price', true);

    lineSelection.append('path')
      .style('stroke', d => this.colors('price'))
      .attr('d', d => lineCreator(d.values));

    // Consumption
    lineSelection = this.root.selectAll('.line.consumption')
      .data([{
        key: 'consumption',
        values: this.data.map(d => ({ year: d.year, value: d.consumption }))
      }])
      .enter().append('g')
        .classed('line consumption', true);

    lineCreator = line()
      .x(this.lineXAccessor.bind(this))
      .y(this.lineY2Accessor.bind(this));

    lineSelection.append('path')
      .style('stroke', d => this.colors('consumption'))
      .attr('d', d => lineCreator(d.values));
  }

  getVoronoiData() {
    const voronoiData = [];
    this.data.forEach(row => {
      ['consumption', 'price'].forEach(variable => {
        voronoiData.push({
          category: variable,
          value: row[variable],
          year: row.year
        });
      });
    });
    return voronoiData;
  }

  voronoiYAccessor(d) {
    if (d.category === 'consumption') return this.lineY2Accessor(d);
    return this.lineYAccessor(d);
  }

  tooltipContent(d, line) {
    const yearFormat = timeFormat('%Y');
    const title = this.legendItems.filter(item => item.value === d.category)[0].label;

    let content = `<div class="header">${title}</div>`;
    content += `<div class="data">${yearFormat(d.year)}</div>`;

    if (d.category === 'price') {
      const valueFormat = format('.2f');
      content += `<div class="data">£${valueFormat(d.value)}</div>`;
    }
    if (d.category === 'consumption') {
      const valueFormat = format('.1f');
      content += `<div class="data">${valueFormat(d.value)} billion cigarettes</div>`;
    }
    return content;
  }
}
