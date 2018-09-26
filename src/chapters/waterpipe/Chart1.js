import { extent } from 'd3-array';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { curveBasis, line } from 'd3-shape';
import { timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart1 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.legendItems = [];
  }

  getFigurePrefix() {
    return 'waterpipe-1';
  }

  onTranslationsLoaded() {
    this.xLabel = this.getTranslation('Year of Initiation');
    this.yLabel = this.getTranslation('Number of Smokers');
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('waterpipe-1.csv'), (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row['Year of Initiation']);
            row.value = +row['Number of Smokers'];
            return row;
          });
        resolve([{ values: mappedData }]);
      });
    });
  }

  createScales() {
    super.createScales();
    this.colors = this.createZScale();
  }

  getLineGenerator() {
    return line()
      .curve(curveBasis)
      .x(this.lineXAccessor.bind(this))
      .y(this.lineYAccessor.bind(this));
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
}
