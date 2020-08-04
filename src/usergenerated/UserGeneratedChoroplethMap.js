import { extent, max, min } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv, json as d3json } from 'd3-request';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { select } from 'd3-selection';
import * as topojson from 'topojson-client';

import { schemeCategoryProblemMap, schemeCategorySolutionMap } from '../colors';
import WorldMap from '../maps/WorldMap';

export default class UserGeneratedChoroplethMap extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.options = options;

    this.colorScheme = this.options.colorScheme || 'problems';
    this.colorScaleType = this.options.colorScaleType || 'ordinal';
    this.iso3Column = this.options.iso3Column;
    this.symbolField = this.options.symbolColumn;
    this.valueField = this.options.keycodeColumn || this.options.valueColumn;
    this.tooltipColumn = this.options.tooltipColumn;
  }

  createColorScale(domain) {
    let scale;
    const scheme = this.colorScheme === 'problems'
      ? schemeCategoryProblemMap
      : schemeCategorySolutionMap;
    if (this.colorScaleType === 'ordinal') {
      scale = scaleOrdinal(scheme)
        .domain(domain);
    }
    else {
      scale = scaleLinear()
        .domain(domain)
        .range([
          scheme[0],
          scheme.slice(-1)[0],
        ]);
    }
    return scale;
  }

  formatExtent() {
    return this.domain
      .map(d => format('.1f')(d))
      .map(d => d === '0.0' ? '0' : d);
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
          if (this.valueField) {
            d[this.valueField] = +d[this.valueField];
          }
          if (this.keyField) {
            d[this.keyField] = +d[this.keyField];
          }
          return d;
        });
        if (this.colorScaleType === 'ordinal') {
          this.domain = set(csvData.map(d => d[this.valueField])).values().sort();
        }
        else if (this.colorScaleType === 'linear') {
          this.domain = this.getDomain(csvData);
        }
        this.colorScale = this.createColorScale(this.domain);
        resolve(csvData);
      });
    });
  }

  getDomain(data) {
    return extent(
      data
        .map(d => d[this.valueField])
        .filter(d => d && d !== 0)
    );
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
      if (value !== null) return this.colorScale(value);
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
