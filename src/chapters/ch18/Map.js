import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorPositive = '#1b70b2';
    this.colorBoth = '#00a792';
    this.colorWorst = '#f89d1d';
    this.colorScale = scaleOrdinal()
      .range([this.colorWorst, this.colorPositive, this.colorBoth])
      .domain(['suing government', 'suing industry', 'both']);
    this.colorScaleType = 'ordinal';
    this.valueField = 'value';
  }

  getFigurePrefix() {
    return '18-map';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('18-map.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          const suingGovernment = d['Industry/Individual suing Government'] === '1';
          const suingIndustry = d['Gov/indiv. Suing tobacco industry'] === '1';
          if (suingGovernment && suingIndustry) {
            d[this.valueField] = 'both';
          } else if (suingGovernment) {
            d[this.valueField] = 'suing government';
          } else if (suingIndustry) {
            d[this.valueField] = 'suing industry';
          } else {
            d[this.valueField] = null;
          }
          return d;
        });
        const filteredData = mappedData.filter(d => d[this.valueField]);
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
      if (d.properties.joined[this.valueField] === 'both') {
        content += `<div class="data">${this.getTranslation('Industry suing government and government suing industry')}</div>`;
      }
      if (d.properties.joined[this.valueField] === 'suing government') {
        content += `<div class="data">${this.getTranslation('Industry suing government')}</div>`;
      }
      if (d.properties.joined[this.valueField] === 'suing industry') {
        content += `<div class="data">${this.getTranslation('Government suing industry')}</div>`;
      }
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
