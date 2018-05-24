import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force';
import { geoPath } from 'd3-geo';
import { geoGinzburg5 } from 'd3-geo-projection';
import { json as d3json } from 'd3-request';
import { event as currentEvent } from 'd3-selection';
import * as topojson from 'topojson-client';

import { mapNoData } from '../colors';
import { loadCachedData } from '../dataService';
import BaseMap from './BaseMap';

export default class PointMap extends BaseMap {
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

    this.forceOptions = {
      decayRate: 0.3,
      forceStrength: 0.002,
      radius: 5
    };
    this.pointRadius = this.options.web ? 7 : 3;
  }

  loadCountries() {
    return new Promise((resolve, reject) => {
      loadCachedData(d3json, this.baseDataUrl + 'countries-simplified.topojson', (data) => {
        resolve(topojson.feature(data, data.objects['-']));
      });
    });
  }

  spreadPoints(features) {
    // Set x and y to initial layer coordinates from lat lng
    features = features.map(d => {
      [d.x, d.y] = this.projection([d.Longitude, d.Latitude]);
      return d;
    });

    var simulation = forceSimulation(features)
      .velocityDecay(this.forceOptions.decayRate)
      .force('x', forceX()
        .x(d => d.x)
        .strength(this.forceOptions.forceStrength))
      .force('y', forceY()
        .y(d => d.y)
        .strength(this.forceOptions.forceStrength))
      .force('collide', forceCollide().radius(this.forceOptions.radius).iterations(2));

    // Make simulation run now rather than running dynamically
    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
      simulation.tick();
    }

    return features;
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
      .data(this.spreadPoints(this.pointData))
      .enter()
        .append('g')
        .classed('point', true);
    point.append('circle')
      .style('fill', d => this.colorScale(d[this.categoryField]))
      .attr('r', this.pointRadius)
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .on('mouseover', (d) => {
        if (this.tooltipContent) {
          const content = this.tooltipContent(d);
          if (!content) return;

          this.tooltip
            .html(content)
            .classed('visible', true);

          this.positionTooltip(currentEvent.layerX, currentEvent.layerY);
        }
      })
      .on('mouseout', (d) => {
        this.tooltip.classed('visible', false);
      });
  }

  render() {
    const parentRect = this.parent.node().getBoundingClientRect();
    const extentYOffset = (this.widthCategory === 'narrowest') ? this.width / 6 : 0;

    this.projection.fitExtent([
      [0 - extentYOffset, 0],
      [parentRect.width - extentYOffset, parentRect.height]
    ], this.countriesGeojson);

    this.renderPaths();
    this.renderLegend();
  }
}
