import { extent } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import EuropeMap from '../../maps/EuropeMap';

export default class Map3a extends EuropeMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScaleType = 'linear';
    this.colorScale = scaleLinear()
      .domain([0, 1])
      .range([
        schemeCategoryProblemMap[0],
        schemeCategoryProblemMap.slice(-1)[0],
      ]);
    this.valueField = 'value';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('5-map3a.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.iso3code = d['ISO Code'];
          d.value = +d['Bar (%)'];
          return d;
        }));
      });
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData.filter(row => row.iso3code === feature.properties.ADM0_A3_IS);
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }

  formatExtent() {
    const valueExtent = extent(this.countriesGeojson.features.filter(d => d.properties.joined), d => d.properties.joined[this.valueField]);
    return valueExtent
      .map(d => `${format('.1f')(d)}%`)
      .map(d => d === '0.0%' ? '0%' : d);
  }

  tooltipContent(d) {
    let content = `<div class="country-name">${d.properties.NAME}</div>`;
    if (d.properties.joined) {
      content += `<div class="data">${d.properties.joined[this.valueField]}% ${this.getTranslation('prevalance of secondhand exposure in bars')}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
