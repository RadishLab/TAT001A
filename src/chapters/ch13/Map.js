import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.colorScale = scaleOrdinal(schemeCategorySolutionMap.slice(-1));
    this.colorScaleType = 'ordinal';
    this.valueField = 'value';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('13-map.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d[this.valueField] = d['Highest level of smoke-free legisation: Y/N'] === 'Y';
          return d;
        });
        const filteredData = mappedData.filter(d => d[this.valueField]);
        this.colorScale.domain([true]);
        resolve(filteredData);
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
