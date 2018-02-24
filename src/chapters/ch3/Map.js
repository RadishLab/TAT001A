import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategoryProblemMap);
    this.colorScaleType = 'ordinal';
    this.valueField = 'Key Code';
    this.symbolField = 'TA6 Symbol';
    this.keyCodeReversed = true;
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('3-map.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d.outlined = d[this.symbolField] === '2';
          d[this.symbolField] = d[this.symbolField] === '1';
          return d;
        });
        const filteredData = mappedData.filter(d => d[this.valueField] !== '5' && d[this.valueField] !== '');
        const domain = set(filteredData.map(d => d[this.valueField])).values().sort().reverse();
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

  renderPaths() {
    const country = super.renderPaths();
    const outlinedCountries = country.filter(d => d.properties.joined && d.properties.joined.outlined);
    outlinedCountries.selectAll('path')
      .style('stroke', this.symbolOutlineColor)
      .style('stroke-width', 0.5);
    outlinedCountries.each((d, i, nodes) => {
      nodes[i].parentNode.appendChild(nodes[i]);
    });
    return country;
  }

  tooltipContent(d) {
    let content = `<div class="country-name">${d.properties.NAME}</div>`;
    if (d.properties.joined) {
      let label = this.getTranslation('bans on direct and indirect advertising');
      const count = parseInt(d.properties.joined['TA6 Data'], 10);
      if (count === 1) {
        label = this.getTranslation('ban on direct and indirect advertising');
      }
      content += `<div class="data">${count} ${label}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
