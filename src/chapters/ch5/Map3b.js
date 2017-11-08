import { csv } from 'd3-request';
import { scaleLinear } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import { dataUrl } from '../../dataService';
import EuropeMap from '../../maps/EuropeMap';

export default class Map3a extends EuropeMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.colorScale = scaleLinear()
      .domain([0, 1])
      .range([
        schemeCategoryProblemMap[0],
        schemeCategoryProblemMap.slice(-1)[0],
      ]);
    this.valueField = 'value';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('5-3.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.iso3code = d['ISO Code'];
          d.value = +d['Restaurant (%)'];
          return d;
        }));
      });
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData.filter(row => row.iso3code === feature.properties.ADM0_A3_IS);
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }
}
