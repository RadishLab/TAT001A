import { max } from 'd3-array';
import { geoPath } from 'd3-geo';
import { geoGinzburg5 } from 'd3-geo-projection';
import { json as d3json } from 'd3-request';
import { select } from 'd3-selection';
import * as topojson from 'topojson-client';

import { mapNoData, mapCircleOverlay } from '../colors';
import { loadCachedData } from '../dataService';

export default class WorldMap {
  constructor(parent, width, height) {
    this.parent = select(parent)
      .attr('height', height)
      .attr('width', width);
    this.parent
      .append('defs')
      .append('pattern')
        .attr('id', 'dots')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 2)
        .attr('height', 2)
      .append('circle')
        .attr('cx', 2)
        .attr('cy', 2)
        .attr('r', 0.22)
        .attr('fill', mapCircleOverlay);
    this.projection = geoGinzburg5();
    this.path = geoPath()
      .projection(this.projection);
    this.root = this.parent.append('g');

    this.loadData();
  }

  loadData() {
    return Promise.all([this.loadCountries(), this.loadJoinData()])
      .then(([countries, joinData]) => {
        this.countriesGeojson = this.join(countries, joinData);
        this.maxValue = max(this.countriesGeojson.features, d => d.properties.joined ? parseFloat(d.properties.joined[this.valueField]) : undefined);
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
    const country = this.countries.selectAll('.country')
      .data(this.countriesGeojson.features)
      .enter()
        .append('g')
        .classed('country', true);

    country.append('path')
      .style('fill', d => {
        if (d.properties.joined) {
          const value = d.properties.joined[this.valueField];
          if (this.colorScaleType && this.colorScaleType === 'ordinal') {
            return this.colorScale(value);
          }
          return this.colorScale(value / this.maxValue);
        }
        return mapNoData;
      })
      .attr('d', this.path);

    country.append('path')
      .style('fill', d => {
        if (d.properties.joined) {
          if (d.properties.joined[this.symbolField]) {
            return 'url(#dots)';
          }
        }
        return 'none';
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
