import { csv } from 'd3-request';
import { scaleLinear } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleLinear()
      .domain([0, 1])
      .range([
        schemeCategoryProblemMap[0],
        schemeCategoryProblemMap.slice(-1)[0],
      ]);
    this.valueField = 'TA6 Data';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('smokeless-map.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          const value = d[this.valueField] !== '' ? +d[this.valueField] : null;
          d[this.valueField] = value;
          return d;
        });
        resolve(mappedData);
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
