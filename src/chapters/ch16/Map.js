import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategorySolutionMap.slice(2))
      .domain([
        'Sales Permitted, Regulated',
        'Market Authorization Required',
        'Nicotine Ban',
        'Comp Sales Ban'
      ]);
    this.colorScaleType = 'ordinal';
    this.figurePrefix = '16-map';
    this.valueField = 'Map Code';
  }

  getFigurePrefix() {
    return '16-map';
  }

  onTranslationsLoaded() {
    this.noDataLabel = this.getTranslation('Unclear or No Explicit Policy');
    super.onTranslationsLoaded();
  }

  getLegendItems() {
    return [
      ['Comp Sales Ban', this.getTranslation('Complete Sales Ban')],
      ['Nicotine Ban', this.getTranslation('Nicotine Ban')],
      ['Market Authorization Required', this.getTranslation('Market Authorization Required')],
      ['Sales Permitted, Regulated', this.getTranslation('Sales Permitted, Regulated')],
      [null, this.noDataLabel]
    ];
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('16-map.csv'), (csvData) => {
        const filteredData = csvData.filter(d => d[this.valueField] !== '' && d[this.valueField] !== 'Unclear/ No Explicit Policy');
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
      content += `<div class="data">${this.getTranslation('Marketing regulations')}: ${this.getTranslation(d.properties.joined['Marketing Regulations'])}</div>`;
      content += `<div class="data">${this.getTranslation('Public use regulations')}: ${this.getTranslation(d.properties.joined['Public Use Regulations'])}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.noDataLabel}</div>`;
    }
    return content;
  }
}
