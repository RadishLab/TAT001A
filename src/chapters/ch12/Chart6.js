import { extent } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeFormat, timeParse } from 'd3-time-format';

import { schemeCategorySolution } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart6 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.yTicks = 6;
    this.yAxisTickFormat = format('d');
    this.legendYOffset = 0;
    this.legendYPadding = 35;
  }

  getFigurePrefix() {
    return '12-6';
  }

  onTranslationsLoaded() {
    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Price per Pack (Colombian peso)');
    this.yLabelRight = this.getTranslation('Relative income price (%)');
    this.yAxisRightTickFormat = d => format('.2')(d * 100);
    this.legendItems = [
      { label: this.getTranslation('Cigarette price per pack'), value: 'price' },
      { label: this.getTranslation('Inflation-adjusted cigarette price per pack'), value: 'priceInflation' },
      { label: this.getTranslation('Cigarette affordability'), value: 'affordability' },
    ];
    super.onTranslationsLoaded();
  }

  createMargin() {
    const margin = super.createMargin();
    margin.right = 30;
    margin.top = 5;
    if (this.options.web) {
      margin.right = 60;
      margin.left = 80;
      margin.top = 10;

      if (this.widthCategory === 'narrowest') {
        margin.left = 60;
        margin.right = 50;
      }
    }
    return margin;
  }

  createScales() {
    super.createScales();
    this.yRight = this.createAffordabilityScale();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('12-6.csv'), (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.Year);
            row.price = +row['Price per pack'];
            row.priceInflation = +row['Inflation-adjusted cigarette price per pack'];
            row.affordability = +row['Cigarette affordability (relative income price)'];
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
    const values = this.data.map(d => d.price).concat(this.data.map(d => d.priceInflation));
    let yExtent = extent(values);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createAffordabilityScale() {
    const values = this.data.map(d => d.affordability);
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
      .data([{
        key: 'price',
        values: this.data.map(d => ({ year: d.year, value: d.price }))
      }])
      .enter().append('g')
        .classed('line price', true);

    lineSelection.append('path')
      .style('stroke', this.colors('price'))
      .attr('d', d => lineCreator(d.values));

    // Price, inflation-adjusted
    lineCreator = line()
      .x(this.lineXAccessor.bind(this))
      .y(this.lineYAccessor.bind(this));

    lineSelection = this.root.selectAll('.line.priceInflation')
      .data([{
        key: 'priceInflation',
        values: this.data.map(d => ({ year: d.year, value: d.priceInflation }))
      }])
      .enter().append('g')
        .classed('line price', true);

    lineSelection.append('path')
      .style('stroke', this.colors('priceInflation'))
      .attr('d', d => lineCreator(d.values));

    // Affordability
    lineCreator = line()
      .x(this.lineXAccessor.bind(this))
      .y(this.lineY2Accessor.bind(this));

    lineSelection = this.root.selectAll('.line.affordability')
      .data([{
        key: 'affordability',
        values: this.data.map(d => ({ year: d.year, value: d.affordability }))
      }])
      .enter().append('g')
        .classed('line affordability', true);

    lineSelection.append('path')
      .style('stroke', this.colors('affordability'))
      .attr('d', d => lineCreator(d.values));
  }

  getVoronoiData() {
    const voronoiData = [];
    this.data.forEach(row => {
      ['affordability', 'priceInflation', 'price'].forEach(variable => {
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
    if (d.category === 'affordability') return this.lineY2Accessor(d);
    return this.lineYAccessor(d);
  }

  tooltipContent(d, line) {
    const yearFormat = timeFormat('%Y');
    const title = this.legendItems.filter(item => item.value === d.category)[0].label;

    let content = `<div class="header">${title}</div>`;
    content += `<div class="data">${yearFormat(d.year)}</div>`;

    if (d.category === 'price' || d.category === 'priceInflation') {
      const valueFormat = format('d');
      content += `<div class="data">${valueFormat(d.value)} ${this.getTranslation('Colombian pesos')}</div>`;
    }
    if (d.category === 'affordability') {
      const valueFormat = d => format('.1f')(d * 100);
      content += `<div class="data">${valueFormat(d.value)}% ${this.getTranslation('relative income price')}</div>`;
    }
    return content;
  }
}
