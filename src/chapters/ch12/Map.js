
import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.colorScale = scaleOrdinal(schemeCategorySolutionMap);
    this.colorScaleType = 'ordinal';
    this.valueField = 'Key Code';
    this.symbolField = 'Symbol';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('12-map.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d[this.symbolField] = d[this.symbolField] === '1';
          return d;
        });
        const filteredData = mappedData.filter(d => d[this.valueField] !== '');
        const domain = set(filteredData.map(d => d[this.valueField])).values().sort();
        this.colorScale.domain(domain);
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
