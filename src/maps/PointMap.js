import { geoPath } from 'd3-geo';
import { geoGinzburg5 } from 'd3-geo-projection';
import { json as d3json } from 'd3-request';
import { select } from 'd3-selection';
import * as topojson from 'topojson-client';

import { mapNoData } from '../colors';
import { loadCachedData } from '../dataService';

export default class PointMap {
  constructor(parent, width, height) {
    this.parent = select(parent)
      .attr('height', height)
      .attr('width', width);
    this.projection = geoGinzburg5();
    this.path = geoPath()
      .projection(this.projection);
    this.root = this.parent.append('g');

    Promise.all([this.loadCountries(), this.loadPointData()])
      .then(([countries, pointData]) => {
        this.countriesGeojson = countries;
        this.pointData = pointData;
        this.render();
      });
  }

  loadCountries() {
    return new Promise((resolve, reject) => {
      loadCachedData(d3json, 'countries-simplified.topojson', (data) => {
        resolve(topojson.feature(data, data.objects['-']));
      });
    });
  }

  renderPaths() {
    this.countries = this.root.append('g');
    const country = this.countries.selectAll('.country')
      .data(this.countriesGeojson.features)
      .enter()
        .append('g')
        .classed('country', true);

    country.append('path')
      .style('fill', mapNoData)
      .attr('d', this.path);

    this.points = this.root.append('g');
    const point = this.points.selectAll('.point')
      .data(this.pointData)
      .enter()
        .append('g')
        .classed('point', true);
    point.append('circle')
      .style('fill', d => this.colorScale(d[this.categoryField]))
      .attr('r', 3)
      .attr("transform", d => `translate(${this.projection([d.Longitude, d.Latitude])})`);
  }

  render() {
    this.projection.fitExtent([
      [0, 0],
      [this.parent.node().clientWidth, this.parent.node().clientHeight]
    ], this.countriesGeojson);

    this.renderPaths();
  }
}
