import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategorySolutionMap.slice(2))
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
      csv(this.dataFileUrl('16-map.csv'), (csvData) => {
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
