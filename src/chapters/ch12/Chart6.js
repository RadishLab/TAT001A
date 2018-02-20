import { extent } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeParse } from 'd3-time-format';

import { schemeCategorySolution } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart6 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '12-inset6';
    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Price per Pack (Colombian peso)');
    this.yLabelRight = this.getTranslation('Relative income price (%)');
    this.yAxisRightTickFormat = d => format('.2')(d * 100);
    this.legendItems = [
      { label: this.getTranslation('Cigarette price per pack'), value: 'price' },
      { label: this.getTranslation('Inflation-adjusted cigarette price per pack'), value: 'price-inflation' },
      { label: this.getTranslation('Cigarette affordability'), value: 'affordability' },
    ];
    this.yTicks = 6;
    this.yAxisTickFormat = format('d');
  }

  createMargin() {
    const margin = super.createMargin();
    margin.right = 30;
    margin.bottom = this.legendOrientation() === 'horizontal' ? 42 : 60;
    margin.top = 5;
    if (this.options.web) {
      margin.bottom = 80;
      margin.right = 60;
    }
    return margin;
  }

  onDataLoaded(data) {
    this.yRight = this.createAffordabilityScale();
    super.onDataLoaded(data);
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
      .data([this.data.map(d => ({ year: d.year, value: d.price }))])
      .enter().append('g')
        .classed('line price', true);

    lineSelection.append('path')
      .style('stroke', this.colors('price'))
      .attr('d', d => lineCreator(d));

    // Price, inflation-adjusted
    lineCreator = line()
      .x(this.lineXAccessor.bind(this))
      .y(this.lineYAccessor.bind(this));

    lineSelection = this.root.selectAll('.line.price-inflation')
      .data([this.data.map(d => ({ year: d.year, value: d.priceInflation }))])
      .enter().append('g')
        .classed('line price', true);

    lineSelection.append('path')
      .style('stroke', this.colors('price-inflation'))
      .attr('d', d => lineCreator(d));

    // Affordability
    lineCreator = line()
      .x(this.lineXAccessor.bind(this))
      .y(this.lineY2Accessor.bind(this));

    lineSelection = this.root.selectAll('.line.affordability')
      .data([this.data.map(d => ({ year: d.year, value: d.affordability }))])
      .enter().append('g')
        .classed('line affordability', true);

    lineSelection.append('path')
      .style('stroke', this.colors('affordability'))
      .attr('d', d => lineCreator(d));
  }
}
