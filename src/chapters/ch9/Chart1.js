import { extent } from 'd3-array';
import { nest } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { timeParse } from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export class Chart1 extends LineChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '9-inset1';
    this.xLabel = this.getTranslation('Year');
    this.yLabel = this.getTranslation('Smokers (millions)');
    this.legendItems = [
      { label: this.getTranslation('Low HDI'), value: 'Low HDI' },
      { label: this.getTranslation('Medium HDI'), value: 'Medium HDI' },
      { label: this.getTranslation('High HDI'), value: 'High HDI' },
      { label: this.getTranslation('Very High HDI'), value: 'Very High HDI' },
    ];
    this.yAxisTickFormat = format('d');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('9-1.csv'), (csvData) => {
        const mappedData = csvData
          .map(row => {
            row.year = timeParse('%Y')(row.Year);
            row.value = +row.Smokers / 1000000;
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
