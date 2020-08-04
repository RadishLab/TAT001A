import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import Cartogram from '../../maps/Cartogram';

export default class MapCartogram extends Cartogram {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategorySolutionMap.slice(1));
    this.colorScaleType = 'ordinal';
    this.valueField = 'W-MM_Group_16';
  }

  getFigurePrefix() {
    return '14-map';
  }

  onTranslationsLoaded() {
    this.keyCodeText = {
      '1': this.getTranslation('Data not reported'),
      '2': this.getTranslation('No national campaign implemented between July 2016 and June 2018 with duration of at least three weeks'),
      '3': this.getTranslation('Campaign conducted with one to four appropriate characteristics'),
      '4': this.getTranslation('Campaign conducted with five to six appropriate characteristics, or with seven characteristics excluding airing on television and/or radio'),
      '5': this.getTranslation('Campaign conducted with at least seven appropriate characteristics including airing on television and/or radio')
    };
    super.onTranslationsLoaded();
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('14-map.csv'), (csvData) => {
        const filteredData = csvData.filter(d => d[this.valueField] !== '1');
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
    let content = `<div class="country-name">${this.getCountryName(d)}</div>`;
    if (d.properties.joined) {
      content += `<div class="data">${this.keyCodeText[d.properties.joined[this.valueField]]}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
