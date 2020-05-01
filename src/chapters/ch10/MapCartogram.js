import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import Cartogram from '../../maps/Cartogram';

export default class MapCartogram extends Cartogram {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategorySolutionMap);
    this.colorScaleType = 'ordinal';
    this.figurePrefix = '10-map';
    this.valueField = 'Key Code';
    this.symbolField = 'Symbol';
    this.keyCodeReversed = true;
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('10-map.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d.Symbol = d.Symbol === '1';
          return d;
        });
        const filteredData = mappedData.filter(d => d[this.valueField] !== '');
        const domain = set(filteredData.map(d => d[this.valueField])).values().sort().reverse();
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
    const percentFormat = format('.1f');
    if (d.properties.joined) {
      content += `<div class="data">${percentFormat(d.properties.joined['Share of deaths due to NCDs (%)'])}% ${this.getTranslation('of deaths due to NCDs')}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
