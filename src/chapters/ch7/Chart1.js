import { extent } from 'd3-array';
import { nest } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { curveBasis, line } from 'd3-shape';
import { timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart1 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '7-1';
    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Tuberculosis mortality per 10,000');
    this.legendItems = [
      { label: this.getTranslation('Baseline scenario'), value: 'including smoking' },
      { label: this.getTranslation('Without smoking'), value: 'not including smoking' }
    ];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('7-1.csv'), (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.year);
            row.value = +row['tuberculosis mortality per 10,000'];
            return row;
          });
        const nestedData = nest()
          .key(d => d.scenario)
          .entries(mappedData);
        resolve(nestedData);
      });
    });
  }

  getLineGenerator() {
    return line()
      .curve(curveBasis)
      .x(this.lineXAccessor.bind(this))
      .y(this.lineYAccessor.bind(this));
  }

  createScales() {
    super.createScales();
    this.colors = this.createZScale();
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

  createMargin() {
    const margin = super.createMargin();
    margin.right = 10;
    return margin;
  }
}
