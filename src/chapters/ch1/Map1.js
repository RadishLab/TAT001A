import { csv } from 'd3-request';

import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map1 extends WorldMap {
  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('growing.csv'), (csvData) => {
        // Just get 2014 production rows 
        const filteredCsvData = csvData.filter(row => row.year === '2014' && row.element === 'Production');
        resolve(filteredCsvData);
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
