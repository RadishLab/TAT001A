import { extent } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeFormat, timeParse } from 'd3-time-format';

import { schemeCategorySolution } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart4 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '12-inset4';
    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Price (£)');
    this.yLabelRight = this.getTranslation('Cigarettes (billions)');
    this.yAxisRightTickFormat = format('d');
    this.legendItems = [
      { label: this.getTranslation('Price per pack, inflation-adjusted'), value: 'price' },
      { label: this.getTranslation('Tax-paid consumption'), value: 'taxpaid' },
      { label: this.getTranslation('Illicit consumption'), value: 'illicit' },
    ];
    this.yAxisTickFormat = format('.2');
  }

  createMargin() {
    const margin = super.createMargin();
    if (this.options.web) {
      margin.top = 10;
    }
    return margin;
  }

  createScales() {
    super.createScales();
    this.yRight = this.createCigaretteScale();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('12-4.csv'), (csvData) => {
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

  createCigaretteScale() {
    const values = this.data.map(d => d.taxpaid).concat(this.data.map(d => d.illicit));
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

    // Tax-paid
    lineCreator = line()
      .x(this.lineXAccessor.bind(this))
      .y(this.lineY2Accessor.bind(this));

    lineSelection = this.root.selectAll('.line.taxpaid')
      .data([{
        key: 'taxpaid',
        values: this.data.map(d => ({ year: d.year, value: d.taxpaid }))
      }])
      .enter().append('g')
        .classed('line taxpaid', true);

    lineSelection.append('path')
      .style('stroke', this.colors('taxpaid'))
      .attr('d', d => lineCreator(d.values));

    // Illicit
    lineSelection = this.root.selectAll('.line.illicit')
      .data([{
        key: 'illicit',
        values: this.data.map(d => ({ year: d.year, value: d.illicit }))
      }])
      .enter().append('g')
        .classed('line illicit', true);

    lineSelection.append('path')
      .style('stroke', this.colors('illicit'))
      .attr('d', d => lineCreator(d.values));
  }

  getVoronoiData() {
    const voronoiData = [];
    this.data.forEach(row => {
      ['illicit', 'taxpaid', 'price'].forEach(variable => {
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
    if (d.category === 'illicit' || d.category === 'taxpaid') return this.lineY2Accessor(d);
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
    else if (d.category === 'illicit' || d.category === 'taxpaid') {
      const valueFormat = format('.1f');
      content += `<div class="data">${valueFormat(d.value)} ${this.getTranslation('billion cigarettes')}</div>`;
    }
    return content;
  }
}
