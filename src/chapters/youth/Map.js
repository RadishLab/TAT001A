import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategoryProblemMap);
    this.colorScaleType = 'ordinal';

    // Columns in the data that are associated with each filter combination
    this.filterColumns = [
      {
        gender: 'boys',
        measure: 'cigarette',
        keyCode: 'Boys-Cigarette Key code'
      },
      {
        gender: 'boys',
        measure: 'tobacco',
        keyCode: 'Boys- Tobacco Key code'
      },
      {
        gender: 'girls',
        measure: 'cigarette',
        keyCode: 'Girls-Cigarette Key code'
      },
      {
        gender: 'girls',
        measure: 'tobacco',
        keyCode: 'Girls- Tobacco Key code'
      }
    ];

    // Start with this filter state
    this.filterState = { gender: 'boys', measure: 'cigarette' };
  }

  getFigurePrefix() {
    return 'youth-map';
  }

  onTranslationsLoaded() {
    // All possible filters, these are what we make buttons for
    this.filters = [
      {
        group: 'gender',
        values: [
          { label: this.getTranslation('boys'), value: 'boys' },
          { label: this.getTranslation('girls'), value: 'girls' }
        ]
      },
      {
        group: 'measure',
        values: [
          { label: this.getTranslation('cigarette'), value: 'cigarette' },
          { label: this.getTranslation('tobacco'), value: 'tobacco' }
        ]
      }
    ];
    super.onTranslationsLoaded();
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('youth-map.csv'), (csvData) => {
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
      const countryData = joinData.filter(row => row.iso3code === this.getISO3(feature));
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }

  tooltipContent(d) {
    let content = `<div class="country-name">${this.getCountryName(d)}</div>`;
    if (d.properties.joined) {
      content += `<div class="data">${this.getTranslation('Boys cigarette prevalence')}: ${d.properties.joined['Boys-Cigarette Prevalence']}%</div>`;
      content += `<div class="data">${this.getTranslation('Boys tobacco prevalence')}: ${d.properties.joined['Boys- Tobacco Prevalence %']}%</div>`;
      content += `<div class="data">${this.getTranslation('Girls cigarette prevalence')}: ${d.properties.joined['Girls-Cigarette Prevalence']}%</div>`;
      content += `<div class="data">${this.getTranslation('Girls tobacco prevalence')}: ${d.properties.joined['Girls-Tobacco Prevalence %']}%</div>`;
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
