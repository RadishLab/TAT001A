import { extent, merge } from 'd3-array';
import { nest } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { timeFormat, timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart2 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.yTicks = 6;
    this.yAxisTickFormat = format('.2');

    this.legendYOffset = 0;
    this.legendYPadding = 30;
  }

  getFigurePrefix() {
    return 'consumption-2';
  }

  onTranslationsLoaded() {
    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Cigarette Consumption (trillions)');
    this.legendItems = [
      { label: this.getTranslation('AFRO'), value: 'AFRO' },
      { label: this.getTranslation('AMRO'), value: 'AMRO' },
      { label: this.getTranslation('China'), value: 'China' },
      { label: this.getTranslation('EMRO'), value: 'EMRO' },
      { label: this.getTranslation('EURO'), value: 'EURO' },
      { label: this.getTranslation('SEARO'), value: 'SEARO' },
      { label: this.getTranslation('WPRO (excluding China)'), value: 'WPRO (excluding China)' },
    ];
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('consumption-2.csv'), (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.year);
            row.value = +row.value / 1000000000000;
            return row;
          });
        const nestedData = nest()
          .key(d => d.region)
          .entries(mappedData);
        resolve(nestedData);
      });
    });
  }

  lineXAccessor(d) {
    return this.x(d.year);
  }

  lineYAccessor(d) {
    return this.y(d.value);
  }

  createMargin() {
    const margin = super.createMargin();
    margin.top = this.options.web ? 10 : 5;
    margin.right = 25;
    return margin;
  }

  createXScale() {
    const values = this.data.reduce((valueArray, value) => valueArray.concat(value.values), []);
    return scaleTime()
      .range([0, this.chartWidth])
      .domain(extent(values, d => d.year));
  }

  createYScale() {
    const values = this.data.reduce((valueArray, value) => valueArray.concat(value.values), []);
    let yExtent = extent(values, d => d.value);
    yExtent[0] = Math.min(0, yExtent[0]);
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  getVoronoiData() {
    return merge(this.data.map(d => {
      return d.values.map(value => {
        return {
          category: d.key,
          year: new Date(value.year),
          value: value.value
        };
      })
    }));
  }

  tooltipContent(d, line) {
    const yearFormat = timeFormat('%Y');
    const valueFormat = format('.1f');
    let content = `<div class="header">${d.category}</div>`;
    content += `<div class="data">${yearFormat(d.year)}</div>`;
    content += `<div class="data">${valueFormat(d.value)} ${this.getTranslation('trillion cigarettes')}</div>`;
    return content;
  }
}
