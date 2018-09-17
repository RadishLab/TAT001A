import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategorySolutionMap.slice(-1));
    this.colorScaleType = 'ordinal';
    this.figurePrefix = '13-map';
    this.valueField = 'value';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('13-map.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d[this.valueField] = d['Highest level of smoke-free legisation: Y/N'] === 'Y';
          return d;
        });
        const filteredData = mappedData.filter(d => d[this.valueField]);
        this.colorScale.domain([true]);
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

  getLegendItems() {
    let legendItemList = [];
    if (this.legend) {
      legendItemList = Object.entries(this.legend)
        .sort((a, b) => {
          let aKey = a[0],
            bKey = b[0],
            aKeyInt = parseInt(aKey, 10),
            bKeyInt = parseInt(bKey, 10);
          // Lowest key code goes at the bottom
          if (!(isNaN(aKeyInt) || isNaN(bKeyInt))) return bKeyInt - aKeyInt;
          return bKey - aKey;
        });
    }

    return legendItemList;
  }

  tooltipContent(d) {
    let content = `<div class="country-name">${d.properties.NAME}</div>`;
    if (d.properties.joined && d.properties.joined[this.valueField]) {
      content += `<div class="data">${this.getTranslation('Has highest level of smoke-free legislation')}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('Does not have highest level of smoke-free legislation')}</div>`;
    }
    return content;
  }
}
