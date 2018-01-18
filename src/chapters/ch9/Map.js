import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map9 extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategoryProblemMap);
    this.colorScaleType = 'ordinal';
    this.valueField = 'Key Code';
    this.symbolField = 'Symbol (Total economic cost>10000 PPP$ million)';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('9-map.csv'), (csvData) => {
        const filteredData = csvData.filter(d => d[this.valueField] !== '');
        const mappedData = filteredData.map(d => {
          d[this.symbolField] = false;
          return d;
        });
        const domain = set(mappedData.map(d => d[this.valueField])).values().sort().reverse();
        this.colorScale.domain(domain);
        resolve(mappedData);
      });
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData.filter(row => row.ISO3 === this.getISO3(feature));
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }
}
