import { extent } from 'd3-array';
import { nest } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export class Chart1 extends LineChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.xLabel = 'Year';
    this.yLabel = 'Smokers';
    this.legendItems = [
      { label: 'Low HDI', value: 'Low HDI' },
      { label: 'Medium HDI', value: 'Medium HDI' },
      { label: 'High HDI', value: 'High HDI' },
      { label: 'Very High HDI', value: 'Very High HDI' },
    ];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/9-1.csv', (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.Year);
            row.value = +row.Smokers
            return row;
          });
        const nestedData = nest()
          .key(d => d.HDI)
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