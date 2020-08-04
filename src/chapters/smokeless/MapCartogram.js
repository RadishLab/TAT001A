import { extent } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear } from 'd3-scale';

import { schemeCategoryProblemMap } from '../../colors';
import Cartogram from '../../maps/Cartogram';

export default class MapCartogram extends Cartogram {
  constructor(parent, options) {
    super(parent, options);
    this.colorScaleType = 'linear';
    this.colorScale = scaleLinear()
      .domain([0, 1])
      .range([
        schemeCategoryProblemMap[0],
        schemeCategoryProblemMap.slice(-1)[0],
      ]);
    this.figurePrefix = 'smokeless-map';
    this.valueField = 'TA6 Data';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('smokeless-map.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          const value = d[this.valueField] !== '' ? +d[this.valueField] : null;
          d[this.valueField] = value;
          return d;
        });
        resolve(mappedData);
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

  formatExtent() {
    const valueExtent = extent(this.countriesGeojson.features.filter(d => d.properties.joined), d => d.properties.joined[this.valueField]);
    return valueExtent
      .map(d => format('.1%')(d))
      .map(d => d === '0.0%' ? '0%' : d);
  }

  countryFill(d) {
    if (d && d.properties && d.properties.joined) {
      const value = d.properties.joined[this.valueField];
      if (value == null) return this.noDataColor;
      return this.colorScale(value);
    }
    return this.noDataColor;
  }

  tooltipContent(d) {
    let content = `<div class="country-name">${this.getCountryName(d)}</div>`;
    const percentFormat = d => format('.1f')(d * 100);
    if (d.properties.joined) {
      content += `<div class="data">${this.getTranslation('Smokeless tobacco prevalence')}: ${percentFormat(d.properties.joined[this.valueField])}%</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
