import { extent } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart1 extends LineChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.xLabel = 'Year';
    this.yLabel = '% Global Population Covered';
    this.legendItems = [
      { label: 'FCTC Compliant GHW', value: 'fctc' },
      { label: 'POS AdBan', value: 'pos' },
      { label: 'Internet AdBan', value: 'internet' },
    ];
    this.yAxisTickFormat = format('.0%');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/3-1.csv', (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.year);
            row.fctc = +row['FCTC Compliant GHW'];
            row.pos = +row['POS AdBan'];
            row.internet = +row['Internet AdBan'];
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
}
