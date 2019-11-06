import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategorySolutionMap);
    this.colorScaleType = 'ordinal';
    this.valueField = 'Key Code';
  }

  getFigurePrefix() {
    return '11-map';
  }

  onTranslationsLoaded() {
    super.onTranslationsLoaded();
    this.keyCodeMapping = {
      '1': this.getTranslation('Data not reported'),
      '2': this.getTranslation('None'),
      '3': this.getTranslation('Nicotine replacement therapy and/or some cessation services (neither cost-covered)'),
      '4': this.getTranslation('Nicotine replacement therapy and/or some cessation services (at least one cost-covered)'),
      '5': this.getTranslation('National quit line, and both nicotine replacement therapy and some cessation services cost-covered')
    };
    if (this.dataLoaded) {
      this.render();
    }
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('11-map.csv'), (csvData) => {
        let mappedData = csvData.map(d => {
          d[this.valueField] = d['CESSATION INDEX'];
          return d;
        });
        mappedData = mappedData.filter(d => d[this.valueField] !== '1' && d[this.valueField] !== '');
        const domain = set(mappedData.map(d => d[this.valueField])).values().sort();
        this.colorScale.domain(domain);
        resolve(mappedData);
      });
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData.filter(row => row.ISO3CODE === this.getISO3(feature));
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }

  tooltipContent(d) {
    let content = `<div class="country-name">${this.getCountryName(d)}</div>`;
    if (d.properties.joined) {
      content += `<div class="data">${this.keyCodeMapping[d.properties.joined[this.valueField]]}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
