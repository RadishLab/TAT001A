import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';
import 'd3-transition';

import { schemeCategoryProblemMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map2 extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategoryProblemMap);
    this.colorScaleType = 'ordinal';
    this.filters = [
      { label: 'male', keyCodeHeader: 'Male-Key Code', symbolHeader: 'Male-Symbol' },
      { label: 'female', keyCodeHeader: 'Female-Key Code', symbolHeader: 'Female-Symbol' }
    ];
    this.initialFilterIndex = 0;
    this.symbolField = 'Male-Symbol';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('4-map2.csv'), (csvData) => {
        const filteredData = csvData.filter(d => {
          return this.filters.some(filter => d[filter.keyCodeHeader] !== '');
        });
        let values = [];
        this.filters.forEach(filter => {
          values = values.concat(filteredData.map(d => d[filter.keyCodeHeader]));
        });
        const domain = set(values).values().filter(d => d !== '').sort();
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
    if (d.properties.joined) {
      content += `<div class="data">${this.getTranslation('Male prevalence')}: ${d.properties.joined['Male-Prevalence']}%</div>`;
      content += `<div class="data">${this.getTranslation('Female prevalence')}: ${d.properties.joined['Female-Prevalence']}%</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }

  render() {
    super.render();
    this.renderFilters();
  }
}
