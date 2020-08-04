import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map2 extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '2-map2';
    this.colorScale = scaleOrdinal(schemeCategoryProblem);
    this.colorScaleType = 'ordinal';
    this.valueField = 'Key';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('2-map2.csv'), (csvData) => {
        const filteredData = csvData.filter(d => d[this.valueField] !== '');
        const domain = set(filteredData.map(d => d[this.valueField])).values().sort();
        this.colorScale.domain(domain);
        resolve(filteredData);
      });
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData.filter(row => row['ISO3 CODE'] === this.getISO3(feature));
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }

  tooltipContent(d) {
    let content = `<div class="country-name">${this.getCountryName(d)}</div>`;
    if (d.properties.joined) {
      const marketLeader = d.properties.joined['Market Leader (Company Name)'];
      if (marketLeader) {
        content += `<div class="data">${this.getTranslation('Market leader')}: ${marketLeader}</div>`;
      }
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
