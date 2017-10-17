import * as d3array from 'd3-array';
import * as d3collection from 'd3-collection';
import { csv as d3csv } from 'd3-request';
import * as d3scale from 'd3-scale';
import * as d3timeFormat from 'd3-time-format';

import { schemeCategoryProblem } from '../../colors';
import LineChart from '../../charts/LineChart';

export default class Chart1 extends LineChart {
  constructor(parent, height, width) {
    super(parent, height, width);
    this.xLabel = 'Year';
    this.yLabel = 'Tonnes';
    this.legendItems = [
      { label: 'Low Income Countries', value: 'LOW' },
      { label: 'Middle Income Countries', value: 'MIDDLE' },
      { label: 'High Income Countries', value: 'HIGH' },
    ];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      d3csv('data/growing.csv', (csvData) => {
        const filteredData = csvData
          .filter(row => row.element === 'Production')
          .map(row => {
            row.year = d3timeFormat.timeParse('%Y')(row.year);
            return row;
          });
        const nest = d3collection.nest()
          .key(d => d.incomegroup)
          .key(d => d.year)
            .rollup(leaves => d3array.sum(leaves, d => d.value))
          .entries(filteredData);
        resolve(nest);
      });
    });
  }

  createXScale() {
    const values = this.data.reduce((valueArray, value) => valueArray.concat(value.values), []);
    return d3scale.scaleTime()
      .range([0, this.width])
      .domain(d3array.extent(values, d => new Date(d.key)));
  }

  createYScale() {
    const values = this.data.reduce((valueArray, value) => valueArray.concat(value.values), []);
    let yExtent = d3array.extent(values, d => d.value);
    yExtent[0] = Math.min(0, yExtent[0]);
    return d3scale.scaleLinear()
      .range([this.height, 0])
      .domain(yExtent);
  }

  createZScale() {
    return d3scale.scaleOrdinal(schemeCategoryProblem);
  }
}
