import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.colorScale = scaleOrdinal(['#fd9426', '#fc0d1b'])
      .domain(['Friend', 'Member']);
    this.colorScaleType = 'ordinal';
    this.valueField = 'value';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('15-map.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d[this.valueField] = d['Prevent20 Status (Members = #fc0d1b; Friends = #fd9426)'];
          return d;
        });
        const filteredData = mappedData.filter(d => d[this.valueField]);
        resolve(filteredData);
      });
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData.filter(row => row.ISO3 === feature.properties.iso_a3);
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }
}
