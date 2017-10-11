import { csv as d3csv } from 'd3-request';

import { dataUrl } from '../dataService';
import WorldMap from './WorldMap';

export default class GrowingMap extends WorldMap {
  loadJoinData() {
    d3csv(dataUrl('growing.csv'), (csvData) => {
      // Just get 2014 production rows 
      const filteredCsvData = csvData.filter(row => row.year === '2014' && row.element === 'Production');
      this.setState({ joinData: filteredCsvData });
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
