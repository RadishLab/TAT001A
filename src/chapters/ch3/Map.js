import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.colorScale = scaleOrdinal(schemeCategoryProblemMap);
    this.colorScaleType = 'ordinal';
    this.valueField = 'Key Code';
    this.symbolField = 'TA6 Symbol';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('3-map.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d.outlined = d[this.symbolField] === '2';
          d[this.symbolField] = d[this.symbolField] === '1';
          return d;
        });
        const filteredData = mappedData.filter(d => d[this.valueField] !== '5' && d[this.valueField] !== '');
        const domain = set(filteredData.map(d => d[this.valueField])).values().sort();
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
      .style('stroke', '#585857')
      .style('stroke-width', 0.5);
    outlinedCountries.each((d, i, nodes) => {
      nodes[i].parentNode.appendChild(nodes[i]);
    });
    return country;
  }
}
