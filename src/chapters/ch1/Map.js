import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map1 extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '1-map';
    this.colorScale = scaleOrdinal(schemeCategoryProblemMap);
    this.colorScaleType = 'ordinal';
    this.valueField = 'Key Code';
    this.noDataColor = schemeCategoryProblemMap[0];
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('1-map.csv'), (csvData) => {
        const domain = set(csvData.map(d => d[this.valueField])).values().sort();
        this.colorScale.domain(domain);
        resolve(csvData);
      });
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData.filter(row => row.iso3code === this.getISO3(feature));
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }
}
