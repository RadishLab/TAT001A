import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblemMap, schemeCategorySolutionMap } from '../../colors';
import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.colorScale = scaleOrdinal()
      .range([
        schemeCategoryProblemMap.slice(-1),
        schemeCategorySolutionMap.slice(0, 1),
        schemeCategoryProblemMap.slice(-1)
      ])
      .domain(['suing government', 'suing industry', 'both']);
    this.colorScaleType = 'ordinal';
    this.valueField = 'value';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('18-map.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          const suingGovernment = d['Industry/Individual suing Government'] === '1';
          const suingIndustry = d['Gov/indiv. Suing tobacco industry'] === '1';
          if (suingGovernment && suingIndustry) {
            d[this.valueField] = 'both';
          } else if (suingGovernment) {
            d[this.valueField] = 'suing government';
          } else if (suingIndustry) {
            d[this.valueField] = 'suing industry';
          } else {
            d[this.valueField] = null;
          }
          return d;
        });
        const filteredData = mappedData.filter(d => d[this.valueField]);
        resolve(filteredData);
      });
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData.filter(row => row.ISO3 === feature.properties.iso_a3);
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }
}
