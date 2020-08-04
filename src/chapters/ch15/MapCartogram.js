import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import Cartogram from '../../maps/Cartogram';

export default class MapCartogram extends Cartogram {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(['#00a792', '#1b70b2'])
      .domain(['Friend', 'Member']);
    this.colorScaleType = 'ordinal';
    this.valueField = 'value';
  }

  getFigurePrefix() {
    return '15-map';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('15-map.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d[this.valueField] = d['Prevent20 Status (Members = #fc0d1b; Friends = #fd9426)'];
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
    let status = this.getTranslation('none');
    if (d.properties.joined) {
      status = d.properties.joined['Prevent20 Status (Members = #fc0d1b; Friends = #fd9426)'].toLowerCase();
    }
    content += `<div class="data">${this.getTranslation('Prevent20 status')}: ${status}</div>`;
    return content;
  }
}
