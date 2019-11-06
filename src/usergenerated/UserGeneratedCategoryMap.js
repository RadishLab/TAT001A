import { set } from 'd3-collection';
import { csv, json as d3json } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';
import * as topojson from 'topojson-client';

import { schemeCategoryProblem, schemeCategorySolution } from '../colors';
import WorldMap from '../maps/WorldMap';

export default class UserGeneratedCategoryMap extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.options = options;

    this.colorScheme = this.options.colorScheme || 'problems';
    this.iso3Column = this.options.iso3Column;
    this.symbolField = this.options.symbolColumn;
    this.valueField = this.options.categoryColumn;
    this.tooltipColumn = this.options.tooltipColumn;
  }

  createColorScale(domain) {
    let scale;
    const scheme = this.colorScheme === 'problems'
      ? schemeCategoryProblem
      : schemeCategorySolution;
    scale = scaleOrdinal(scheme)
      .domain(domain);
    return scale;
  }

  loadCountries() {
    return new Promise((resolve, reject) => {
      d3json(this.options.countriesTopojsonUrl, (data) => {
        resolve(topojson.feature(data, data.objects['-']));
      });
    });
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.options.dataUrl, (csvData) => {
        csvData = csvData.map(d => {
          if (this.symbolField) {
            d[this.symbolField] = d[this.symbolField] && d[this.symbolField].toLowerCase() === 'yes';
          }
          return d;
        });
        this.domain = set(csvData.map(d => d[this.valueField])).values().sort();
        this.colorScale = this.createColorScale(this.domain);
        resolve(csvData);
      });
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData
        .filter(row => row[this.iso3Column] === this.getISO3(feature));
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }

  countryFill(d) {
    if (d.properties.joined) {
      const value = d.properties.joined[this.valueField];
      if (value && value !== '') return this.colorScale(value);
    }
    return this.noDataColor;
  }

  tooltipContent(d) {
    let content = `<div class="country-name">${this.getCountryName(d)}</div>`;
    if (this.tooltipColumn) {
      let details;
      if (d.properties.joined) {
        details = d.properties.joined[this.tooltipColumn];
      }
      content += `<div>${details ? details : this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
