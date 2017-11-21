import { csv } from 'd3-request';
import { scaleLinear } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.valueField = 'Average score for POWER';
    this.symbolField = 'Symbol - prevalence decline in the highest-performing countries';
    this.colorScale = scaleLinear()
      .domain([0, 1])
      .range([
        schemeCategorySolutionMap.slice(-1)[0],
        schemeCategorySolutionMap[0],
      ]);
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('19-map.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d[this.valueField] = +d[this.valueField];
          return d;
        }));
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
