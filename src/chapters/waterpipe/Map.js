import { extent } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScaleType = 'linear';
    this.colorScale = scaleLinear()
      .domain([0, 1])
      .range([
        schemeCategoryProblemMap[0],
        schemeCategoryProblemMap.slice(-1)[0],
      ]);
    this.figurePrefix = 'waterpipe-map';
    this.valueField = 'value';
  }

  formatExtent() {
    const valueExtent = extent(this.countriesGeojson.features.filter(d => d.properties.joined), d => d.properties.joined[this.valueField]);
    return valueExtent
      .map(d => format('.1%')(d))
      .map(d => d === '0.0%' ? '0%' : d);
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('waterpipe-map.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.iso3code = d['ISO3'];

          let value = d['TA6 Data'];
          if (value && value !== '') {
            d.value = +value;
          }
          else {
            d.value = null;
          }
          return d;
        }));
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
    let content = `<div class="country-name">${d.properties.NAME}</div>`;
    const percentFormat = d => format('.1f')(d * 100);
    if (d.properties.joined && d.properties.joined[this.valueField] !== null) {
      content += `<div class="data">${percentFormat(d.properties.joined[this.valueField])}% ${this.getTranslation('of adults using water pipes')}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
