import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map2 extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategorySolutionMap);
    this.colorScaleType = 'ordinal';
    this.figurePrefix = '11-map2';
    this.valueField = 'Key Code';

    this.criteria = [
      {
        header: 'Officially identified person in government or contracted by government  who is responsible for tobacco dependence treatment',
        label: this.getTranslation('Officially identified person in government or contracted by government who is responsible for tobacco dependence treatment'),
      },
      {
        header: 'Clearly identified budget for tobacco dependence treatment',
        label: this.getTranslation('Clearly identified budget for tobacco dependence treatment'),
      },
      {
        header: 'Official national tobacco treatment guidelines',
        label: this.getTranslation('Official national tobacco treatment guidelines')
      },
      {
        header: 'Mass media campaigns promoting cessation',
        label: this.getTranslation('Mass media campaigns promoting cessation')
      },
      {
        header: 'Offers help to healthcare workers and other relevant groups to stop using tobacco',
        label: this.getTranslation('Offers help to healthcare workers and other relevant groups to stop using tobacco')
      },
      {
        header: 'Mandatory record of patients’ tobacco use in medical notes',
        label: this.getTranslation('Mandatory record of patients’ tobacco use in medical notes')
      },
      {
        header: 'Free, national telephone tobacco quitline',
        label: this.getTranslation('Free, national telephone tobacco quitline')
      },
      {
        header: 'Specialised tobacco dependence treatment services (experts or units/clinics) offering individual or group support delivered by trained professionals',
        label: this.getTranslation('Specialised tobacco dependence treatment services (experts or units/clinics) offering individual or group support delivered by trained professionals')
      }
    ];
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('11-map2.csv'), (csvData) => {
        let mappedData = csvData.map(d => {
          d[this.valueField] = d['Key Code'];
          return d;
        });
        mappedData = mappedData.filter(d => d[this.valueField] && d[this.valueField] !== '');
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
    let country = d.properties.NAME;
    if (country === 'United Kingdom') country = 'UK (England and Scotland only)';
    let content = `<div class="country-name">${country}</div>`;
    if (d.properties.joined) {
      content += '<ul class="tooltip-list tooltip-list-11-map2">';
      this.criteria.forEach(criterion => {
        if (d.properties.joined[criterion.header] === '1') {
          content += `<li>${criterion.label}</li>`;
        }
        if (d.properties.joined[criterion.header] === '0.5') {
          content += `<li>${criterion.label} (${this.getTranslation('partial')})</li>`;
        }
      });
      content += '</ul>';
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
