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
    this.valueField = 'Total economic cost (2016 PPP$ million)';
    this.keyCodeField = 'Key Code';
    this.symbolField = 'Symbol (Total economic cost>10000 PPP$ million)';
    this.keyCodeReversed = true;
  }

  getFigurePrefix() {
    return '9-map';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('9-map.csv'), (csvData) => {
        const filteredData = csvData.filter(d => d[this.keyCodeField] !== '');
        const mappedData = filteredData.map(d => {
          d[this.symbolField] = false;
          return d;
        });
        const domain = set(mappedData.map(d => d[this.keyCodeField])).values().sort().reverse();
        this.colorScale.domain(domain);
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

  tooltipContent(d) {
    let content = `<div class="country-name">${this.getCountryName(d)}</div>`;
    const valueFormat = format(',d');
    if (d.data.joined) {
      content += `<div class="data">${valueFormat(d.data.joined['Total economic cost (2016 PPP$ million)'])} ${this.getTranslation('million USD')}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
