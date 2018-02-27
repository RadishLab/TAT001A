import { max } from 'd3-array';
import { set } from 'd3-collection';
import { geoPath } from 'd3-geo';
import { geoGinzburg5 } from 'd3-geo-projection';
import { json as d3json } from 'd3-request';
import { event as currentEvent, select } from 'd3-selection';
import * as topojson from 'topojson-client';

import { mapNoData, mapCircleOverlay } from '../colors';
import { loadCachedData } from '../dataService';
import BaseMap from './BaseMap';

export default class WorldMap extends BaseMap {
  constructor(parent, options) {
    super(parent, options);
    this.parent.classed('world-map', true);
    const defs = this.parent.append('defs');
    defs
      .append('pattern')
        .attr('id', 'dots')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', this.options.web ? 6 : 2)
        .attr('height', this.options.web ? 6 : 2)
      .append('circle')
        .attr('cx', this.options.web ? 3 : 2)
        .attr('cy', this.options.web ? 3 : 2)
        .attr('r', this.options.web ? 0.75 : 0.22)
        .attr('fill', mapCircleOverlay);
    defs
      .append('pattern')
        .attr('id', 'dots-legend')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', this.options.web ? 6 : 2)
        .attr('height', this.options.web ? 6 : 2)
      .append('circle')
        .attr('cx', this.options.web ? 3 : 2)
        .attr('cy', this.options.web ? 3 : 2)
        .attr('r', this.options.web ? 0.75 : 0.22)
        .attr('fill', '#aaa');

    this.projection = geoGinzburg5();
    this.path = geoPath()
      .projection(this.projection);
    this.root = this.parent.append('g');

    this.noDataColor = mapNoData;
    this.noDataLabel = this.getTranslation('No data');
    this.loadData();

    this.mouseoverStroke = '#555';
    this.defaultStroke = 'none';
    this.tooltip
      .classed('tooltip-country', true);
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

  countryFill(d) {
    if (d.properties.joined) {
      const value = d.properties.joined[this.valueField];
      if (this.colorScaleType && this.colorScaleType === 'ordinal') {
        return this.colorScale(value);
      }

      if (value == null) return this.noDataColor;
      return this.colorScale(value / this.maxValue);
    }
    return this.noDataColor;
  }

  renderPaths() {
    const smallCountryThreshold = 20000;

    this.countries = this.root.append('g');
    const country = this.countries.selectAll('.country')
      .data(this.countriesGeojson.features)
      .enter()
        .append('g')
        .classed('country', true);

    country
      .on('mouseover', (d, i, nodes) => {
        const overCountry = select(nodes[i]);
        overCountry.style('stroke', this.mouseoverStroke);
        overCountry.node().parentNode.appendChild(overCountry.node());

        if (this.tooltipContent) {
          let x = currentEvent.layerX,
            y = currentEvent.layerY

          // If layerX or layerY not set, assume they're not supported, find
          // another way
          if (!x && !y) {
            const rect = this.root.node().getBoundingClientRect();
            x = currentEvent.clientX - rect.left;
            y = currentEvent.clientY - rect.top;
          }
          this.tooltip
            .html(this.tooltipContent(d))
            .classed('visible', true)
            .style('top', `${y + 10}px`)
            .style('left', `${x + 10}px`);
        }
      })
      .on('mouseout', (d, i, nodes) => {
        select(nodes[i]).style('stroke', this.defaultStroke);

        if (this.tooltipContent) {
          this.tooltip.classed('visible', false);
        }
      });

    let largeCountries = country.filter(d => d.properties.areakm >= smallCountryThreshold);
    if (largeCountries.empty()) {
      largeCountries = country;
    }
    largeCountries.append('path')
      .classed('country-fill', true)
      .style('fill', this.countryFill.bind(this))
      .attr('d', d => this.path(d));

    largeCountries.append('path')
      .classed('country-symbol', true)
      .style('fill', d => (d.properties.joined && d.properties.joined[this.symbolField]) ? 'url(#dots)' : 'none')
      .attr('d', d => this.path(d));

    if (this.widthCategory !== 'narrowest') {
      const smallCountries = country.filter(d => d.properties.areakm < smallCountryThreshold && d.properties.TA6_COUNTRY);
      smallCountries.append('circle')
        .classed('country-fill', true)
        .style('fill', this.countryFill.bind(this))
        .attr('r', this.options.web ? 4 : 1)
        .attr('cx', d => this.path.centroid(d)[0])
        .attr('cy', d => this.path.centroid(d)[1]);

      smallCountries.append('circle')
        .classed('country-symbol', true)
        .style('fill', d => (d.properties.joined && d.properties.joined[this.symbolField]) ? 'url(#dots)' : 'none')
        .attr('r', this.options.web ? 4 : 1)
        .attr('cx', d => this.path.centroid(d)[0])
        .attr('cy', d => this.path.centroid(d)[1]);
    }

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

  getFilteredKeyCodeDomain(data) {
    let values = [];
    this.filterColumns.forEach(filter => {
      values = values.concat(data.map(d => d[filter.keyCode]));
    });
    return set(values).values().filter(d => d !== '').sort();
  }

  updateFilters(selectedFilter) {
    // Update filter state and buttons
    this.filterState = { ...this.filterState, ...selectedFilter };
    this.filtersContainer.selectAll('button')
      .classed('selected', d => this.filterState[d.group] === d.value);

    // Look for columns that should be associated with the given filter state
    const matchingColumn = this.filterColumns.filter(column => {
      return Object.keys(this.filterState).every(key => this.filterState[key] === column[key]);
    })[0];

    // Update fill with the matching filters
    if (matchingColumn && matchingColumn.keyCode) {
      this.countries.selectAll('.country .country-fill')
        .transition().duration(300)
        .style('fill', d => {
          if (!d.properties.joined) return this.noDataColor;
          return this.colorScale(d.properties.joined[matchingColumn.keyCode]);
        });
    }

    // Update symbol (overlay) with the matching filters
    if (matchingColumn && matchingColumn.symbol) {
      this.countries.selectAll('.country .country-symbol')
        .transition().duration(300)
        .style('fill', d => {
          if (d.properties.joined && d.properties.joined[matchingColumn.symbol] === 'Yes') {
            return 'url(#dots)';
          }
          return 'none';
        });
    }
  }
}
