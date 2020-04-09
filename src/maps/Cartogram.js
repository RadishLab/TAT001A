import { max } from 'd3-array';
import { xml } from 'd3-request';
import { event as currentEvent, select, selectAll } from 'd3-selection';

import WorldMap from './WorldMap';

export default class Cartogram extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.mouseoverStroke = '#555';
    this.defaultStroke = 'white';
    this.loadData();
  }

  loadData() {
    return Promise.all([this.loadCartogramTiles(), this.loadCountries(), this.loadJoinData()])
      .then(([cartogramTiles, countries, joinData]) => {
        this.cartogramTiles = cartogramTiles;
        this.countriesGeojson = this.join(countries, joinData);
        this.maxValue = max(this.countriesGeojson.features, d => d.properties.joined ? parseFloat(d.properties.joined[this.valueField]) : undefined);
        this.render();
      });
  }

  loadCartogramTiles() {
    return new Promise((resolve, reject) => {
      xml(this.baseDataUrl + 'cartogram-tiles.svg', data => {
        resolve(data.documentElement);
      });
    });
  }

  onTranslationsLoaded() {
    super.onTranslationsLoaded();
    if (this.dataLoaded) {
      this.render();
    }
  }

  getCountryName(d) {
    return this.getTranslation(d.properties.NAME, 'WorldMap', 'WorldMap');
  }

  getMatchingCountry(a3) {
    if (a3 === 'TUV') {
      return {
        geometry: {},
        type: 'Feature',
        properties: {
          ISO_A3: 'TUV',
          NAME: 'Tuvalu'
        }
      };
    }
    return this.countriesGeojson.features.filter(f => this.getISO3(f) === a3)[0];
  }

  countryFill(d) {
    // NB: Subclasses should implement
    return this.noDataColor;
  }

  updateCountryFills(duration = 0) {
    this.parent.selectAll('polygon')
      .transition()
      .duration(duration)
      .style('fill', d => this.countryFill(d));
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
      this.parent.selectAll('polygon')
        .transition().duration(300)
        .style('fill', d => {
          if (!d || !d.properties) return this.noDataColor;
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

  renderCartogram() {
    const n = select(this.parent.node().parentElement);
    if (!this.cartogramInjected) {
      n.select('svg').remove();
      n.node().append(this.cartogramTiles);
      n.select('svg').classed('cartogram', true);
      n.select('#labels').attr('pointer-events', 'none');
      n.selectAll('polygon')
        .style('fill', 'gray')
        .style('stroke', 'white')
        .style('stroke-width', 0.5)
        .datum((d, i, nodes) => this.getMatchingCountry(nodes[i].dataset.iso3code))
        .on('mouseover', (d, i, nodes) => {
          // Remove hover state on previous country
          selectAll('.country-hover')
            .classed('country-hover', false);

          const overCountry = select(nodes[i]);
          overCountry
            .style('stroke', this.mouseoverStroke)
            .classed('country-hover', true);
          overCountry.node().parentNode.appendChild(overCountry.node());

          if (this.tooltipContent) {
            let x = currentEvent.layerX,
              y = currentEvent.layerY;

            // If layerX or layerY not set, assume they're not supported, find
            // another way
            if (!x && !y) {
              const rect = this.root.node().getBoundingClientRect();
              x = currentEvent.clientX - rect.left;
              y = currentEvent.clientY - rect.top;
            }

            this.tooltip
              .html(this.tooltipContent(d))
              .classed('visible', true);
            this.positionTooltip(x + 10, y + 10);
          }
        })
        .on('mouseout', this.onCountryMouseout.bind(this));

      this.parent = n.select('svg');
      this.root = this.parent.select('g#root');
      this.cartogramInjected = true;
    }

    this.updateCountryFills();
  }

  render() {
    this.renderCartogram();
    if (!this.legendGroup) {
      const svgWidth = parseFloat(this.parent.node().getAttribute('viewBox').split(' ')[2]);
      this.renderLegend();
      this.legendGroup
        .attr('transform', `translate(${svgWidth - this.legendOptions.width}, 0)`);
    }
  }

}
