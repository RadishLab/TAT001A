import { extent } from 'd3-array';
import { nest } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart2 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = 'consumption-inset2';
    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Cigarette Consumption (trillions)');
    this.yTicks = 6;
    this.legendItems = [
      { label: this.getTranslation('AFRO'), value: 'AFRO' },
      { label: this.getTranslation('AMRO'), value: 'AMRO' },
      { label: this.getTranslation('China'), value: 'China' },
      { label: this.getTranslation('EMRO'), value: 'EMRO' },
      { label: this.getTranslation('EURO'), value: 'EURO' },
      { label: this.getTranslation('SEARO'), value: 'SEARO' },
      { label: this.getTranslation('WPRO (excluding China)'), value: 'WPRO (excluding China)' },
    ];
    this.yAxisTickFormat = format('.2');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/consumption-2.csv', (csvData) => {
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
