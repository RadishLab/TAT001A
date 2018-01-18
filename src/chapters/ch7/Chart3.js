import { extent } from 'd3-array';
import { nest } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { curveBasis, line } from 'd3-shape';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart3 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '7-inset3';
    this.xLabel = this.getTranslation('Age');
    this.xAxisTickFormat = format('d');
    this.yLabel = this.getTranslation('Life Years Lost');
    this.yAxisTickFormat = format('.1s');
    this.legendItems = [
      { label: this.getTranslation('Smoking'), value: 'smoking' },
      { label: this.getTranslation('HIV-related'), value: 'HIV' }
    ];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('7-3.csv'), (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.age = +row.age
            row.value = +row['life years lost'];
            return row;
          });
        const nestedData = nest()
          .key(d => d.cause)
          .entries(mappedData);
        resolve(nestedData);
      });
    });
  }

  onDataLoaded(data) {
    this.x = this.createXScale();
    this.y = this.createYScale();
    this.colors = this.createZScale();
    this.line = line()
      .curve(curveBasis)
      .x(this.lineXAccessor.bind(this))
      .y(this.lineYAccessor.bind(this));
    this.render();
  }

  createMargin() {
    const margin = super.createMargin();
    margin.bottom = this.legendOrientation() === 'horizontal' ? 45 : 60;
    margin.right = 5;
    return margin;
  }

  lineXAccessor(d) {
    return this.x(d.age);
  }

  lineYAccessor(d) {
    return this.y(d.value);
  }

  createXScale() {
    const values = this.data.reduce((valueArray, value) => valueArray.concat(value.values), []);
    return scaleTime()
      .range([0, this.chartWidth])
      .domain(extent(values, d => d.age));
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
}
