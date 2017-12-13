import { extent, sum } from 'd3-array';
import { nest } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart1 extends LineChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.figurePrefix = '1-inset1';

    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Tonnes');
    this.legendItems = [
      { label: this.getTranslation('Low Income Countries'), value: 'LOW' },
      { label: this.getTranslation('Middle Income Countries'), value: 'MIDDLE' },
      { label: this.getTranslation('High Income Countries'), value: 'HIGH' },
      { label: this.getTranslation('China'), value: 'MED' },
    ];
  }

  createMargin() {
    const margin = super.createMargin();
    margin.bottom = this.legendOrientation() === 'horizontal' ? 40 : 65;
    return margin;
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/1-1.csv', (csvData) => {
        const filteredData = csvData
          .map(row => {
            row.value = +row.Tonnes;
            row.year = timeParse('%Y')(row.Year);
            return row;
          });
        const nestedData = nest()
          .key(d => d.incomegroup)
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

  createXScale() {
    const values = this.data.reduce((valueArray, value) => valueArray.concat(value.values), []);
    return scaleTime()
      .range([0, this.chartWidth])
      .domain(extent(values, d => new Date(d.key)));
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
