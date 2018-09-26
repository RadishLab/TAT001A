import { format } from 'd3-format';
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

    this.filterColumns = [
      {
        gender: 'male',
        keyCode: 'Male-KeyCode'
      },
      {
        gender: 'female',
        keyCode: 'Female-KeyCode'
      }
    ];
    this.filterState = { gender: 'male' };
  }

  getFigurePrefix() {
    return '8-map2';
  }

  onTranslationsLoaded() {
    this.filters = [
      {
        group: 'gender',
        values: [
          { label: this.getTranslation('male'), value: 'male' },
          { label: this.getTranslation('female'), value: 'female' }
        ]
      }
    ];
    super.onTranslationsLoaded();
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('8-map2.csv'), (csvData) => {
        const filteredData = csvData.filter(d => {
          return this.filterColumns.some(filter => d[filter.keyCode] !== '');
        });

        this.colorScale.domain(this.getFilteredKeyCodeDomain(filteredData));
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
    const deathFormat = format(',d');
    const percentFormat = format('.1f');
    if (d.properties.joined) {
      content += `<div class="data">${this.getTranslation('Male')}: ${deathFormat(d.properties.joined['Male-No. Tobacco-related Deaths'])} ${this.getTranslation('deaths')} (${percentFormat(d.properties.joined['Male-% Tobacco-related Deaths'])}%)</div>`;
      content += `<div class="data">${this.getTranslation('Female')}: ${deathFormat(d.properties.joined['Female-No. Tobacco-related Deaths'])} ${this.getTranslation('deaths')} (${percentFormat(d.properties.joined['Female-% Tobacco-related Deaths'])}%)</div>`;
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
