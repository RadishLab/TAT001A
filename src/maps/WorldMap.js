import { max } from 'd3-array';
import { geoPath } from 'd3-geo';
import { geoGinzburg5 } from 'd3-geo-projection';
import { json as d3json } from 'd3-request';
import { scaleSequential } from 'd3-scale';
import { interpolateOranges } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import * as topojson from 'topojson-client';

import { loadCachedData } from '../dataService';

export default class WorldMap {
  constructor(parent, width, height) {
    this.parent = select(parent)
      .attr('height', height)
      .attr('width', width);
    this.projection = geoGinzburg5();
    this.path = geoPath()
      .projection(this.projection);
    this.root = this.parent.append('g');

    // TODO color ramps
    this.colorScale = scaleSequential(interpolateOranges);

    Promise.all([this.loadCountries(), this.loadJoinData()])
      .then(([countries, joinData]) => {
        this.countriesGeojson = this.join(countries, joinData);
        this.maxValue = max(this.countriesGeojson.features, d => d.properties.joined ? parseFloat(d.properties.joined.value) : undefined);
        this.render();
      });
  }

  loadCountries() {
    return new Promise((resolve, reject) => {
      loadCachedData(d3json, 'countries-dots.topojson', (data) => {
        resolve(topojson.feature(data, data.objects['-']));
      });
    });
  }

  renderPaths() {
    this.countries = this.root.append('g');
    this.countries.selectAll('path')
      .data(this.countriesGeojson.features)
      .enter().append('path')
        .style('fill', d => {
          if (d.properties.joined) {
            return this.colorScale(d.properties.joined.value / this.maxValue);
          }
          return 'lightgray';
        })
        .attr('d', this.path);
  }

  renderLabels() {
    this.labels = this.root.append('g');
    this.labels.selectAll('text')
      .data(this.countriesGeojson.features)
      .enter().append('text')
        .text(d => d.properties.name)
        .attr('font-size', '10px')
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${this.path.centroid(d)})`);
  }

  renderLegend() {
    // TODO
  }

  render() {
    this.projection.fitExtent([
      [0, 0],
      [this.parent.node().clientWidth, this.parent.node().clientHeight]
    ], this.countriesGeojson);

    this.renderPaths();
    //this.renderLabels();
    this.renderLegend();
  }
}
