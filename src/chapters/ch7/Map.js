import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategoryProblemMap);
    this.colorScaleType = 'ordinal';
    this.figurePrefix = '7-map';
    this.valueField = 'Key Code';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('7-map.csv'), (csvData) => {
        const filteredData = csvData.filter(d => d[this.valueField]);
        const domain = set(filteredData.map(d => d[this.valueField])).values().sort();
        this.colorScale.domain(domain);
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

  tooltipContent(d) {
    let content = `<div class="country-name">${d.properties.NAME}</div>`;
    const percentFormat = d => format('.1f')(d * 100);
    if (d.properties.joined) {
      content += `<div class="data">${percentFormat(d.properties.joined['Percent of TB Cases Due to Smoking'])}% ${this.getTranslation('of tuberculosis-related deaths due to tobacco')}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
