import { ascending, extent, merge, sum } from 'd3-array';
import { nest, set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { timeFormat, timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart1 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '1-1';

    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Metric tons (millions)');
    this.legendItems = [
      { label: this.getTranslation('Low HDI'), value: 'Low-HDI' },
      { label: this.getTranslation('Medium HDI'), value: 'Medium-HDI' },
      { label: this.getTranslation('High HDI (excl. China)'), value: 'High-HDI (excl. China)' },
      { label: this.getTranslation('Very high HDI'), value: 'Very high-HDI' },
      { label: this.getTranslation('China'), value: 'China' },
    ];
    this.yAxisTickFormat = format('.2');
    this.legendYOffset = 0;
    this.legendYPadding = 45;
  }

  createMargin() {
    const margin = super.createMargin();
    margin.bottom = this.legendOrientation() !== 'horizontal' ? 65 : margin.bottom;
    if (this.options.web) {
      margin.top = 15;
    }
    return margin;
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('1-1.csv'), (csvData) => {
        const filteredData = csvData
          .map(row => {
            row.value = +row.tonnes / 1000000.0;
            row.year = timeParse('%Y')(row.year);
            return row;
          });
        const nestedData = nest()
          .key(d => d['category description'])
          .key(d => d.year)
            .rollup(leaves => sum(leaves, d => d.value))
          .entries(filteredData);
        resolve(nestedData);
      });
    });
  }

  lineXAccessor(d) {
    return this.x(new Date(d.key));
  }

  lineYAccessor(d) {
    return this.y(d.value);
  }

  getXValues() {
    const values = this.data.reduce((valueArray, value) => valueArray.concat(value.values), []);
    const dates = set(values, d => d.key).values().map(d => new Date(d));
    dates.sort(ascending);
    return dates;
  }

  createXScale() {
    return scaleTime()
      .range([0, this.chartWidth])
      .domain(extent(this.getXValues()));
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
          year: new Date(value.key),
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
    content += `<div class="data">${valueFormat(d.value)} million metric tons</div>`;
    return content;
  }
}
