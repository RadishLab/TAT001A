import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force';
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

  spreadPoints(features) {
    // Settings for forces
    const decayRate = 0.3;
    const forceStrength = 0.002;
    const radius = 5;

    // Set x and y to initial layer coordinates from lat lng
    features = features.map(d => {
      [d.x, d.y] = this.projection([d.Longitude, d.Latitude]);
      return d;
    });

    var simulation = forceSimulation(features)
      .velocityDecay(decayRate)
      .force('x', forceX()
        .x(d => d.x)
        .strength(forceStrength))
      .force('y', forceY()
        .y(d => d.y)
        .strength(forceStrength))
      .force('collide', forceCollide().radius(radius).iterations(2));

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
      .attr('r', this.options.web ? 7 : 3)
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
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
