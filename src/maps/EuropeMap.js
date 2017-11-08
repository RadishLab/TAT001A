import { max } from 'd3-array';
import { json as d3json } from 'd3-request';
import * as topojson from 'topojson-client';

import { loadCachedData } from '../dataService';
import WorldMap from './WorldMap';

export default class EuropeMap extends WorldMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.padding = 20;

    // We crop to the extent of the SVG because we don't want countries outside
    // our viewable area saved in the final output
    const defs = this.parent.select('defs');
    defs.append('rect')
      .attr('id', 'viewboxClipRect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'none')
      .attr('stroke', 'none');
    defs.append('clipPath')
      .attr('id', 'viewboxClip')
      .append('use')
        .attr('xlink:href', '#viewboxClipRect');

    this.root.attr('clip-path', 'url(#viewboxClip)');
  }

  loadData() {
    return Promise.all([this.loadCountries(), this.loadJoinData(), this.loadEurope()])
      .then(([countries, joinData, europe]) => {
        this.countriesGeojson = this.join(countries, joinData);
        this.europeGeojson = europe;
        this.maxValue = max(this.countriesGeojson.features, d => d.properties.joined ? parseFloat(d.properties.joined[this.valueField]) : undefined);
        this.render();
      });
  }

  loadCountries() {
    return new Promise((resolve, reject) => {
      loadCachedData(d3json, 'countries-50m.topojson', (data) => {
        resolve(topojson.feature(data, data.objects['-']));
      });
    });
  }

  loadEurope() {
    return new Promise((resolve, reject) => {
      loadCachedData(d3json, 'europe.topojson', (data) => {
        resolve(topojson.feature(data, data.objects['-']));
      });
    });
  }

  render() {
    this.projection.fitExtent([
      [this.padding, this.padding],
      [this.parent.node().clientWidth - this.padding, this.parent.node().clientHeight - this.padding]
    ], this.europeGeojson);
    this.renderPaths();
  }
}
