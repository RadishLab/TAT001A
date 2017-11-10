import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblemMap, schemeCategorySolutionMap } from '../../colors';
import { dataUrl } from '../../dataService';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.colorPositive = schemeCategorySolutionMap.slice(0, 1);
    this.colorNegative = schemeCategoryProblemMap.slice(-1);
    this.colorScale = scaleOrdinal()
      .range([this.colorNegative, this.colorPositive, this.colorNegative])
      .domain(['suing government', 'suing industry', 'both']);
    this.colorScaleType = 'ordinal';
    this.valueField = 'value';

    this.parent.select('defs')
      .append('pattern')
        .attr('id', 'diagonalHatch')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 4)
        .attr('height', 4)
      .append('path')
        .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
        .attr('stroke', this.colorPositive)
        .attr('stroke-width', 1);
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('18-map.csv'), (csvData) => {
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
      const countryData = joinData.filter(row => row.ISO3 === feature.properties.iso_a3);
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }

  renderPaths() {
    super.renderPaths().append('path')
      .style('fill', d => {
        if (d.properties.joined && d.properties.joined[this.valueField] === 'both') {
          return 'url(#diagonalHatch)';
        }
        return 'none';
      })
      .attr('d', this.path);
  }
}
