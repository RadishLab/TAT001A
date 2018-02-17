import { geoPath } from 'd3-geo';
import { geoGinzburg5 } from 'd3-geo-projection';
import { json as d3json } from 'd3-request';
import { event as currentEvent } from 'd3-selection';
import * as topojson from 'topojson-client';

import { mapNoData } from '../colors';
import { loadCachedData } from '../dataService';
import Visualization from '../Visualization';

export default class PointMap extends Visualization {
  constructor(parent, options) {
    super(parent, options);
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

    this.tooltip
      .classed('tooltip-point', true);
  }

  loadCountries() {
    return new Promise((resolve, reject) => {
      loadCachedData(d3json, this.baseDataUrl + 'countries-simplified.topojson', (data) => {
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
      .attr('r', this.options.web ? 7 : 3)
      .attr("transform", d => `translate(${this.projection([d.Longitude, d.Latitude])})`)
      .on('mouseover', (d) => {
        if (this.tooltipContent) {
          this.tooltip
            .html(this.tooltipContent(d))
            .classed('visible', true)
            .style('top', `${currentEvent.layerY + 10}px`)
            .style('left', `${currentEvent.layerX + 10}px`);
        }
      })
      .on('mouseout', (d) => {
        this.tooltip.classed('visible', false);
      });
  }

  render() {
    const parentRect = this.parent.node().getBoundingClientRect();
    this.projection.fitExtent([
      [0, 0],
      [parentRect.width, parentRect.height]
    ], this.countriesGeojson);

    this.renderPaths();
  }
}
