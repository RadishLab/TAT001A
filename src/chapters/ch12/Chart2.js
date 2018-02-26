import { extent } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { curveBasis, line } from 'd3-shape';
import { timeFormat, timeParse } from 'd3-time-format';

import { schemeCategorySolution } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart2 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '12-inset2';
    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Price / Tax Index');
    this.yLabelRight = this.getTranslation('Smoking Prevalence (%)');
    this.yAxisRightTickFormat = d => format('d')(d * 100);
    this.legendItems = [
      { label: this.getTranslation('Price'), value: 'price' },
      { label: this.getTranslation('Tax'), value: 'tax' },
      { label: this.getTranslation('Prevalence'), value: 'prevalence' },
    ];
    this.yAxisTickFormat = format('.2');
  }

  createMargin() {
    const margin = super.createMargin();
    margin.right = this.options.web ? 60 : 30;
    if (this.options.web) {
      margin.top = 10;
    }
    return margin;
  }

  createScales() {
    super.createScales();
    this.yRight = this.createPrevalenceScale();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('12-2.csv'), (csvData) => {
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
    return this.yRight(d.value);
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
      .data([{
        key: 'price',
        values: this.data.map(d => ({ year: d.year, value: d.price }))
      }])
      .enter().append('g')
        .classed('line price', true);

    lineSelection.append('path')
      .style('stroke', this.colors('price'))
      .attr('d', d => lineCreator(d.values));

    // Tax
    lineSelection = this.root.selectAll('.line.tax')
      .data([{
        key: 'tax',
        values: this.data.map(d => ({ year: d.year, value: d.tax }))
      }])
      .enter().append('g')
        .classed('line tax', true);

    lineSelection.append('path')
      .style('stroke', this.colors('tax'))
      .attr('d', d => lineCreator(d.values));

    // Prevalence
    lineCreator = line()
      .curve(curveBasis)
      .x(this.lineXAccessor.bind(this))
      .y(this.lineY2Accessor.bind(this));

    lineSelection = this.root.selectAll('.line.prevalence')
      .data([{
        key: 'prevalence',
        values: this.data.map(d => ({ year: d.year, value: d.prevalence }))
      }])
      .enter().append('g')
        .classed('line prevalence', true);

    lineSelection.append('path')
      .style('stroke', this.colors('prevalence'))
      .attr('d', d => lineCreator(d.values));
  }

  getVoronoiData() {
    const voronoiData = [];
    this.data.forEach(row => {
      ['prevalence', 'tax', 'price'].forEach(variable => {
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
    if (d.category === 'prevalence') return this.lineY2Accessor(d);
    return this.lineYAccessor(d);
  }

  tooltipContent(d, line) {
    const yearFormat = timeFormat('%Y');
    const title = d.category[0].toUpperCase() + d.category.slice(1);

    let content = `<div class="header">${title}</div>`;
    content += `<div class="data">${yearFormat(d.year)}</div>`;

    if (d.category === 'tax' || d.category === 'price') {
      const valueFormat = format('.1f');
      content += `<div class="data">${valueFormat(d.value)} ${this.getTranslation('price/tax index')}</div>`;
    }
    else if (d.category === 'prevalence') {
      const valueFormat = d => format('.1f')(d * 100);
      content += `<div class="data">${valueFormat(d.value)}% ${this.getTranslation('smoking prevalence')}</div>`;
    }
    return content;
  }
}
