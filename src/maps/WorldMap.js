import { max } from 'd3-array';
import { geoPath } from 'd3-geo';
import { geoGinzburg5 } from 'd3-geo-projection';
import { json as d3json } from 'd3-request';
import * as topojson from 'topojson-client';

import { mapNoData, mapCircleOverlay } from '../colors';
import { loadCachedData } from '../dataService';
import Visualization from '../Visualization';

export default class WorldMap extends Visualization {
  constructor(parent, options) {
    super(parent, options);
    this.legend = options.legend;
    this.parent.classed('world-map', true);
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

    this.noDataColor = mapNoData;
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
      loadCachedData(d3json, this.baseDataUrl + 'countries-simplified.topojson', (data) => {
        resolve(topojson.feature(data, data.objects['-']));
      });
    });
  }

  getISO3(feature) {
    // South Sudan
    if (feature.properties.ADM0_A3 === 'SDS') {
      return feature.properties.ISO_A3;
    }
    return feature.properties.ADM0_A3;
  }

  renderPaths() {
    const smallCountryThreshold = 20000;

    this.countries = this.root.append('g');
    const country = this.countries.selectAll('.country')
      .data(this.countriesGeojson.features)
      .enter()
        .append('g')
        .classed('country', true);

    const fill = (d => {
      if (d.properties.joined) {
        const value = d.properties.joined[this.valueField];
        if (this.colorScaleType && this.colorScaleType === 'ordinal') {
          return this.colorScale(value);
        }
        return this.colorScale(value / this.maxValue);
      }
      return this.noDataColor;
    });

    let largeCountries = country.filter(d => d.properties.areakm >= smallCountryThreshold);
    if (largeCountries.empty()) {
      largeCountries = country;
    }
    largeCountries.append('path')
      .style('fill', fill)
      .attr('d', d => this.path(d));

    largeCountries.filter(d => d.properties.joined && d.properties.joined[this.symbolField]).append('path')
      .style('fill', d => 'url(#dots)')
      .attr('d', d => this.path(d));

    const smallCountries = country.filter(d => d.properties.areakm < smallCountryThreshold);
    smallCountries.append('circle')
      .style('fill', fill)
      .attr('r', 1)
      .attr('cx', d => this.path.centroid(d)[0])
      .attr('cy', d => this.path.centroid(d)[1]);

    smallCountries.filter(d => d.properties.joined && d.properties.joined[this.symbolField]).append('path')
      .style('fill', d => 'url(#dots)')
      .attr('r', 1)
      .attr('cx', d => this.path.centroid(d)[0])
      .attr('cy', d => this.path.centroid(d)[1]);

    return country;
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

  getLegendItems() {
    const legendItemList = Object.entries(this.legend);
    legendItemList.unshift([ null, this.getTranslation('No data') ]);
    return legendItemList;
  }

  renderLegend() {
    if (!this.legend) return;

    const legendWidth = this.width / 7;
    const legendHeight = 15;
    const legendPadding = 3;
    const legendItemList = this.getLegendItems();
    const legendItemCount = legendItemList.length;

    this.legendGroup = this.root.append('g')
      .classed('legend', true)
      .attr('transform', `translate(${this.width - legendWidth}, 0)`);

    const legendItems = this.legendGroup.selectAll('rect')
      .data(legendItemList)
      .enter().append('g')
      .attr('transform', d => {
        const keyCode = d[0];
        const position = keyCode ? parseInt(keyCode, 10) : 0;
        const y = (legendHeight + legendPadding) * (legendItemCount - position);
        return `translate(0, ${y})`;
      });

    legendItems.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', d => {
        const keyCode = d[0];
        return keyCode !== null ? this.colorScale(keyCode) : this.noDataColor;
      });

    legendItems.append('text')
      .attr('x', 4)
      .attr('y', 11)
      .text(d => d[1]);
  }

  render() {
    const parentRect = this.parent.node().getBoundingClientRect();
    this.projection.fitExtent([
      [0, 0],
      [parentRect.width, parentRect.height]
    ], this.countriesGeojson);

    this.renderPaths();
    this.renderLegend();
  }
}
