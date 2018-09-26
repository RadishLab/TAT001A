import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategorySolutionMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map2 extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScaleType = 'ordinal';

    this.filterColumns = [
      {
        measure: 'market access',
        keyCode: 'Map Code'
      },
      {
        measure: 'marketing regulations',
        keyCode: 'Marketing Regulations'
      },
      {
        measure: 'public use regulations',
        keyCode: 'Public Use Regulations'
      }
    ];

    this.filterState = { measure: 'market access' };
  }

  getFigurePrefix() {
    return '16-map2';
  }

  onTranslationsLoaded() {
    this.noDataLabel = this.getTranslation('Unclear or No Explicit Policy');

    this.filters = [
      {
        group: 'measure',
        values: [
          { label: this.getTranslation('Market Access'), value: 'market access' },
          { label: this.getTranslation('Marketing Regulations'), value: 'marketing regulations' },
          { label: this.getTranslation('Public Use Regulations'), value: 'public use regulations' }
        ]
      }
    ];

    this.legends = {
      'market access': [
        ['Unclear/ No Explicit Policy', this.getTranslation('Unclear or No Explicit Policy')],
        ['Sales Permitted, Regulated', this.getTranslation('Sales Permitted and Regulated')],
        ['Market Authorization Required', this.getTranslation('Market Authorization Required')],
        ['Nicotine Ban', this.getTranslation('E-cigarettes Containing Nicotine Banned')],
        ['Comp Sales Ban', this.getTranslation('E-cigarettes Banned')]
      ],
      'marketing regulations': [
        ['None', this.getTranslation('Unclear or No Explicit Policy')],
        ['Marketing Regulations Only', this.getTranslation('Marketing Regulations Only')],
        ['Sales Ban Only', this.getTranslation('Sales Ban Only')],
        ['Sales Ban and Marketing Regulations', this.getTranslation('Sales Ban and Marketing Regulations')]
      ],
      'public use regulations': [
        ['None', this.getTranslation('Unclear or No Explicit Policy')],
        ['Public Use Restricted Only', this.getTranslation('Public Use Restricted Only')],
        ['Sales Ban Only', this.getTranslation('Sales Ban Only')],
        ['Sales Ban, Public Use Restricted', this.getTranslation('Sales Ban, Public Use Restricted')],
        ['Complete Use and Sales Ban', this.getTranslation('Complete Use and Sales Ban')]
      ]
    };

    this.createColorScale();
    super.onTranslationsLoaded();
  }

  createColorScale() {
    const range = schemeCategorySolutionMap.slice(1);
    range.unshift(this.noDataColor);
    this.colorScale = scaleOrdinal()
      .range(range)
      .domain(this.legends[this.filterState.measure].map(d => d[0]));
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('16-map2.csv'), (csvData) => resolve(csvData));
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData.filter(row => row.ISO3 === this.getISO3(feature));
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
  }

  tooltipContent(d) {
    const matchingColumn = this.filterColumns.filter(column => {
      return Object.keys(this.filterState).every(key => this.filterState[key] === column[key]);
    })[0];

    let content = `<div class="country-name">${d.properties.NAME}</div>`;
    if (d.properties.joined && matchingColumn) {
      const matchingLegendEntry = this.legends[this.filterState.measure].filter(legendEntry => {
        return legendEntry[0] === d.properties.joined[matchingColumn.keyCode];
      })[0][1];
      content += `<div class="data">${matchingLegendEntry}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
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

    // Update color scale by selected measure
    this.createColorScale();

    // Update legend by selected measure
    const legendItems = this.legends[matchingColumn.measure];
    this.renderLegendWithItems(legendItems);

    // Update fill with the matching filters
    if (matchingColumn && matchingColumn.keyCode) {
      this.countries.selectAll('.country .country-fill')
        .transition().duration(300)
        .style('fill', d => {
          if (!d.properties.joined) return this.noDataColor;
          return this.colorScale(d.properties.joined[matchingColumn.keyCode]);
        });
    }
  }

  sortLegendItems(items) {
    const legendValues = this.legends[this.filterState.measure].map(d => d[1]);

    // Reverse sort based on the order in the legend
    return items.sort((a, b) => legendValues.indexOf(b[1]) - legendValues.indexOf(a[1]));
  }

  render() {
    super.render();
    const legendItems = this.legends['market access'];
    this.renderLegendWithItems(legendItems);
    this.renderFilters();
  }
}
