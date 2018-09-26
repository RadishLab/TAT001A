import { extent, merge } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { timeFormat, timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart1 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.yAxisTickFormat = format('d');
  }

  getFigurePrefix() {
    return '3-1';
  }

  onTranslationsLoaded() {
    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('% Global Population Covered');
    this.legendItems = [
      { label: this.getTranslation('FCTC Compliant GHW'), value: 'fctc' },
      { label: this.getTranslation('POS Ad Ban'), value: 'pos' },
      { label: this.getTranslation('Internet Ad Ban'), value: 'internet' },
    ];
    super.onTranslationsLoaded();
  }

  createMargin() {
    const margin = super.createMargin();
    margin.right = this.options.web ? 20 : 10;
    return margin;
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('3-1.csv'), (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.year);
            row.fctc = +row['FCTC Compliant GHW'] * 100;
            row.pos = +row['POS AdBan'] * 100;
            row.internet = +row['Internet AdBan'] * 100;
            return row;
          });
        const nestedData = ['fctc', 'pos', 'internet'].map(type => {
          return {
            key: type,
            values: mappedData.map(d => {
              return {
                value: d[type],
                year: d.year
              };
            })
          };
        });
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
    const description = this.legendItems.filter(item => item.value === d.category)[0].label;
    let content = `<div class="header">${description}</div>`;
    content += `<div class="data">${yearFormat(d.year)}</div>`;
    content += `<div class="data">${valueFormat(d.value)}% ${this.getTranslation('global population covered')}</div>`;
    return content;
  }
}
