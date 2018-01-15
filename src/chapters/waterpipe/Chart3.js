import { extent } from 'd3-array';
import { nest } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { timeYear } from 'd3-time';
import { timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart3 extends LineChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.figurePrefix = 'waterpipe-inset3';
    this.xAxisTickArguments = timeYear.every(1);
    this.yLabel = this.getTranslation('Ever Use of Waterpipe (%)');
    this.yTicks = 6;
    this.legendItems = [
      { label: this.getTranslation('Jordanian Boys'), value: 'Jordanian Boys' },
      { label: this.getTranslation('Jordanian Girls'), value: 'Jordanian Girls' },
      { label: this.getTranslation('Florida Boys and Girls'), value: 'Florida Boys and Girls' },
    ];
    this.yAxisTickFormat = format('d');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/waterpipe-3.csv', (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.year);
            row.value = +row.value;
            return row;
          });
        const nestedData = nest()
          .key(d => d.group)
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
    margin.right = 10;
    margin.top = 5;
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
}
