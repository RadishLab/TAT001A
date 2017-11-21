import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.colorScale = scaleOrdinal(schemeCategoryProblemMap);
    this.colorScaleType = 'ordinal';
    this.valueField = 'Key Code';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('7-map.csv'), (csvData) => {
        const filteredData = csvData.filter(d => d[this.valueField]);
        const domain = set(filteredData.map(d => d[this.valueField])).values().sort();
        this.colorScale.domain(domain);
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
