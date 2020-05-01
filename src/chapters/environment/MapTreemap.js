import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import TreeMap from '../../maps/TreeMap';

export default class MapTreemap extends TreeMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategoryProblemMap);
    this.colorScaleType = 'ordinal';
    this.figurePrefix = 'environment-map';
    this.valueField = 'Packaging & Butt Waste';
    this.keyCodeField = 'Key Code';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('environment-map.csv'), (csvData) => {
        const filteredData = csvData.filter(d => d[this.keyCodeField] !== '');
        const domain = set(filteredData.map(d => d[this.keyCodeField])).values().sort();
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
    let content = `<div class="country-name">${this.getCountryName(d)}</div>`;
    const tonnesFormat = format(',d');
    if (d.data.joined) {
      content += `<div class="data">${tonnesFormat(d.data.joined['Packaging & Butt Waste'])} ${this.getTranslation('total tonnes of waste')}</div>`;
      content += `<div class="data">${tonnesFormat(d.data.joined['Packaging Waste'])} ${this.getTranslation('tonnes of waste due to packaging')}</div>`;
      content += `<div class="data">${tonnesFormat(d.data.joined['Butt Waste'])} ${this.getTranslation('tonnes of waste due to cigarette butts')}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
