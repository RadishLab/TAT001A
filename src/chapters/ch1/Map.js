import { csv } from 'd3-request';
import { scaleSequential } from 'd3-scale';
import { interpolateOranges } from 'd3-scale-chromatic';

import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map1 extends WorldMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.colorScale = scaleSequential(interpolateOranges);
    this.valueField = 'value';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('1-map.csv'), (csvData) => {
        resolve(csvData);
      });
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData.filter(row => row.iso3code === feature.properties.iso_a3);
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }
}
