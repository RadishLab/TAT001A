import { csv } from 'd3-request';
import { scaleLinear } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.valueField = 'Percent of DALYs due to tobacco';
    this.colorScale = scaleLinear()
      .domain([0, 1])
      .range([
        schemeCategoryProblemMap[0],
        schemeCategoryProblemMap.slice(-1)[0],
      ]);
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('6-map.csv'), (csvData) => {
        resolve(csvData);
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
