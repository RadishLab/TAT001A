import { extent } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import Cartogram from '../../maps/Cartogram';

export default class Map extends Cartogram {
  constructor(parent, options) {
    super(parent, options);
    this.valueField = 'Average score for POWER';
    this.symbolField = 'Symbol - prevalence decline in the highest-performing countries';
    this.colorScaleType = 'linear';
    this.colorScale = scaleLinear()
      .domain([0, 1])
      .range([
        schemeCategorySolutionMap[0],
        schemeCategorySolutionMap.slice(-1)[0],
      ]);
  }

  getFigurePrefix() {
    return '19-map';
  }

  formatExtent() {
    const valueExtent = extent(this.countriesGeojson.features.filter(d => d.properties.joined), d => d.properties.joined[this.valueField]);
    return valueExtent
      .map(d => format('.1f')(d));
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('19-map.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d[this.valueField] = +d[this.valueField];
          return d;
        });
        resolve(mappedData);
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

  percentChangeText(d) {
    if (!d || d === 'n/a') return this.getTranslation('unknown');
    const percent = parseFloat(d, 10);
    return `${format('+.1f')(percent)}%`;
  }

  tooltipContent(d) {
    let content = `<div class="country-name">${this.getCountryName(d)}</div>`;
    const powerScoreFormat = d => format('.1f')(parseFloat(d, 10));
    if (d.properties.joined) {
      content += `<div class="data">${this.getTranslation('Average POWER score')}: ${powerScoreFormat(d.properties.joined['Average score for POWER'])}</div>`;
      content += `<div class="data">${this.getTranslation('Smoking prevalence change (2005 - 2015)')}: ${this.percentChangeText(d.properties.joined['Smoking Prevalence Change (2005 - 2015, Age 15+) '])}</div>`;
      content += `<div class="data">${this.getTranslation('Number of policies at highest level')}: ${d.properties.joined['Number of Policies at Highest Level']}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
