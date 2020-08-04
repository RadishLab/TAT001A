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
    this.figurePrefix = '4-map2';

    this.filters = [
      {
        group: 'gender',
        values: [
          { label: this.getTranslation('male'), value: 'male' },
          { label: this.getTranslation('female'), value: 'female' }
        ]
      }
    ];

    this.filterColumns = [
      {
        gender: 'male',
        keyCode: 'Male-Key Code',
        symbol: 'Male-Symbol'
      },
      {
        gender: 'female',
        keyCode: 'Female-Key Code',
        symbol: 'Female-Symbol'
      }
    ];
    this.filterState = { gender: 'male' };
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('4-map2.csv'), (csvData) => {
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
    let content = `<div class="country-name">${this.getCountryName(d)}</div>`;
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
