import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategorySolutionMap.reverse());
    this.colorScaleType = 'ordinal';
    this.valueField = 'Key Code';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('11-map.csv'), (csvData) => {
        let mappedData = csvData.map(d => {
          d[this.valueField] = d['CESSATION INDEX'];
          return d;
        });
        mappedData = mappedData.filter(d => d[this.valueField] !== '1' && d[this.valueField] !== '');
        const domain = set(mappedData.map(d => d[this.valueField])).values().sort();
        this.colorScale.domain(domain);
        resolve(mappedData);
      });
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData.filter(row => row.ISO3CODE === this.getISO3(feature));
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }
}
