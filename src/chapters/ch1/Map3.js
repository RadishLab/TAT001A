import { extent } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';
import noUiSlider from 'nouislider';

import { schemeCategoryProblemMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

/*
 * Yield per country with year slider
 */
export default class Map3 extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '1-map3';
    this.colorScale = scaleOrdinal(schemeCategoryProblemMap);
    this.colorScaleType = 'ordinal';
    this.valueField = 'Yield - Keycode';

    this.parentContainer.style('padding-top', '25px');

    this.noDataColor = schemeCategoryProblemMap[0];
  }

  getLegendItems() {
    return Object.entries(this.legend).reverse();
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('1-map3.csv'), (csvData) => {
        const domain = set(csvData.map(d => d[this.valueField])).values().filter(d => d !== '').sort();
        this.colorScale.domain(domain);
        this.yearRange = extent(csvData, d => +d['Year']);
        this.filterState = { year: this.yearRange[1] };
        resolve(csvData);
      });
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData.filter(row => row.iso3code === this.getISO3(feature));
      if (countryData.length > 0) {
        feature.properties.joined = countryData.map(d => {
          let value = parseInt(d['Yield'], 10);
          if (isNaN(value)) value = null;
          return {
            keycode: d[this.valueField],
            value,
            year: +d['Year']
          }
        });
      }
    });
    return countries;
  }

  countryFill(d) {
    if (d.properties.joined) {
      const matchingYears = d.properties.joined.filter(joinedData => joinedData.year === this.filterState.year);
      if (matchingYears && matchingYears[0]) {
        const keycode = matchingYears[0].keycode;
        if (!keycode) return this.noDataColor;
        return this.colorScale(keycode);
      }
    }
    return this.noDataColor;
  }

  renderFilters() {
    this.filtersContainer = this.parentContainer.append('div')
      .classed('ta-visualization-filters', true)
      .lower();

    this.filtersContainer.append('span').text(this.getTranslation('Filters:', null, 'Visualization'));

    const yearInput = this.filtersContainer
      .append('div').classed('filter-group', true)
      .append('div')
        .classed('filter-year', true);

    const yearInputNode = yearInput.node();
    noUiSlider.create(yearInputNode, {
      start: this.yearRange[1],
      range: {
        min: this.yearRange[0],
        max: this.yearRange[1]
      },
      step: 1,
      tooltips: true,
      format: {
        to: d => d,
        from: d => parseInt(d, 10)
      },
      pips: {
        mode: 'steps',
        filter: d => d % 10 === 0,
        density: 5
      }
    });

    yearInputNode.noUiSlider.on('update', (values) => {
      this.updateFilters({ year: values[0] });
    });

    // On init select initial key
    this.updateFilters(this.filterState);
  }

  updateFilters(selectedFilter) {
    // Update filter state
    this.filterState = { ...this.filterState, ...selectedFilter };

    // Update fills
    this.countries.selectAll('.country .country-fill')
      .transition().duration(300)
      .style('fill', this.countryFill.bind(this));
  }

  render() {
    super.render();
    this.renderFilters();
  }

  tooltipContent(d) {
    let content = `<div class="country-name">${this.getCountryName(d)}</div>`;
    const valueFormat = format(',d');
    let value;
    if (d.properties.joined) {
      const matchingYears = d.properties.joined.filter(joinedData => joinedData.year === this.filterState.year);
      if (matchingYears && matchingYears[0]) {
        value = matchingYears[0].value;
      }
    }

    // Treat 0 different from null/undefined
    if (value === 0) {
      content += `<div class="data">${this.getTranslation('No reported production')}</div>`;
    }
    else if (!value) {
      content += `<div class="data">${this.getTranslation('No reported production')}</div>`;
    }
    else {
      content += `<div class="data">${valueFormat(value)} ${this.getTranslation('hectograms per hectare')}</div>`;
    }
    return content;
  }
}
