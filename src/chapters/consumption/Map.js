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
    this.figurePrefix = 'consumption-map';
    this.symbolField = 'Symbol';
    this.valueField = 'Key code';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('consumption-map.csv'), (csvData) => {
        const domain = set(csvData.map(d => d[this.valueField])).values().sort();
        this.colorScale.domain(domain);
        resolve(csvData);
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
    const cigaretteFormat = d => format(',d')(parseFloat(d, 10));
    if (d.properties.joined) {
      content += `<div class="data">${cigaretteFormat(d.properties.joined['Cigarette consumption'])} ${this.getTranslation('cigarettes smoked per person per year')}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
