import { set } from 'd3-collection';
import { csv, json as d3json } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';
import * as topojson from 'topojson-client';

import { schemeCategoryProblem, schemeCategorySolution } from '../colors';
import PointMap from '../maps/PointMap';

export default class UserGeneratedPointMap extends PointMap {
  constructor(parent, options) {
    super(parent, options);
    this.options = options;

    this.colorScheme = this.options.colorScheme || 'problems';
    this.categoryField = this.options.categoryColumn;
    this.latitudeField = this.options.latitudeColumn;
    this.longitudeField = this.options.longitudeColumn;
    this.valueField = this.options.keycodeColumn || this.options.valueColumn;
    this.tooltipColumn = this.options.tooltipColumn;
  }

  createColorScale(domain) {
    const scheme = this.colorScheme === 'problems'
      ? schemeCategoryProblem
      : schemeCategorySolution;
    return scaleOrdinal(scheme)
      .domain(domain);
  }

  loadCountries() {
    return new Promise((resolve, reject) => {
      d3json(this.options.countriesTopojsonUrl, (data) => {
        resolve(topojson.feature(data, data.objects['-']));
      });
    });
  }

  loadPointData() {
    return new Promise((resolve, reject) => {
      csv(this.options.dataUrl, (csvData) => {
        csvData = csvData.map(d => {
          d.Latitude = +d[this.latitudeField];
          d.Longitude = +d[this.longitudeField];
          return d;
        });
        this.domain = set(csvData.map(d => d[this.categoryField])).values().sort();
        this.colorScale = this.createColorScale(this.domain);
        resolve(csvData);
      });
    });
  }

  getLegendItems() {
    let legendItemList = Object.entries(this.legend)
      .sort((a, b) => {
        let aKey = a[0],
          bKey = b[0],
          aKeyInt = parseInt(aKey, 10),
          bKeyInt = parseInt(bKey, 10);
        // Lowest key code goes at the bottom
        if (!(isNaN(aKeyInt) || isNaN(bKeyInt))) return bKeyInt - aKeyInt;
        return bKey - aKey;
      });
    return legendItemList;
  }

  tooltipContent(d) {
    let content = '';
    let details;
    if (this.tooltipColumn) {
      details = d[this.tooltipColumn];
      content += `<div>${details ? details : this.getTranslation('No data')}</div>`;
    }
    return content;
  }
}
