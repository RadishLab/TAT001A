import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.colorScale = scaleOrdinal(schemeCategorySolutionMap)
      .domain([
        'Sales Permitted, Regulated',
        'Market Authorization Required',
        'Nicotine Ban',
        'Comp Sales Ban'
      ]);
    this.colorScaleType = 'ordinal';
    this.valueField = 'Map Code';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('16-map.csv'), (csvData) => {
        const filteredData = csvData.filter(d => d[this.valueField] !== '' && d[this.valueField] !== 'Unclear/ No Explicit Policy');
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
