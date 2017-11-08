import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.colorScale = scaleOrdinal(schemeCategorySolutionMap);
    this.valueField = 'Key Code';
    this.symbolField = 'Symbol';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('10-map.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.Symbol = d.Symbol === '1';
          return d;
        }));
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
