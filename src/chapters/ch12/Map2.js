import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';
import 'd3-transition';

import { schemeCategorySolutionMap } from '../../colors';
import WorldMap from '../../maps/WorldMap';

export default class Map2 extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategorySolutionMap);
    this.colorScaleType = 'ordinal';

    this.filters = [
      {
        group: 'measure',
        values: [
          { label: this.getTranslation('price'), value: 'price' },
          { label: this.getTranslation('tax'), value: 'tax' },
          { label: this.getTranslation('affordability'), value: 'afford' }
        ]
      },
      {
        group: 'year',
        values: [
          { label: '2008', value: '2008' },
          { label: '2010', value: '2010' },
          { label: '2012', value: '2012' },
          { label: '2014', value: '2014' },
          { label: '2016', value: '2016' },
        ]
      }
    ];

    this.filterColumns = [
      {
        measure: 'price',
        year: '2008',
        keyCode: '2008 price key',
        tooltipColumn: '2008 price of 20-cigarette pack of the most-sold brand in US dollars; adjusted for purchasing power of national currencies'
      },
      {
        measure: 'price',
        year: '2010',
        keyCode: '2010 price key',
        tooltipColumn: '2010 price of 20-cigarette pack of the most-sold brand in US dollars; adjusted for purchasing power of national currencies'
      },
      {
        measure: 'price',
        year: '2012',
        keyCode: '2012 price key',
        tooltipColumn: '2012 price of 20-cigarette pack of the most-sold brand in US dollars; adjusted for purchasing power of national currencies'
      },
      {
        measure: 'price',
        year: '2014',
        keyCode: '2014 price key',
        tooltipColumn: '2014 price of 20-cigarette pack of the most-sold brand in US dollars; adjusted for purchasing power of national currencies'
      },
      {
        measure: 'price',
        year: '2016',
        keyCode: '2016 price key',
        tooltipColumn: '2016 price of 20-cigarette pack of the most-sold brand in US dollars; adjusted for purchasing power of national currencies'
      },
      {
        measure: 'tax',
        year: '2008',
        keyCode: '2008 tax key',
        tooltipColumn: '2008 total excise tax as a % of price of the most sold brand'
      },
      {
        measure: 'tax',
        year: '2010',
        keyCode: '2010 tax key',
        tooltipColumn: '2010 total excise tax as a % of price of the most sold brand'
      },
      {
        measure: 'tax',
        year: '2012',
        keyCode: '2012 tax key',
        tooltipColumn: '2012 total excise tax as a % of price of the most sold brand'
      },
      {
        measure: 'tax',
        year: '2014',
        keyCode: '2014 tax key',
        tooltipColumn: '2014 total excise tax as a % of price of the most sold brand'
      },
      {
        measure: 'tax',
        year: '2016',
        keyCode: '2016 tax key',
        tooltipColumn: '2016 total excise tax as a % of price of the most sold brand'
      },
      {
        measure: 'afford',
        year: '2008',
        keyCode: '2008 afford key',
        tooltipColumn: '2008 affordability of cigarettes;  % of GDP per capita required to purchase 2000 cigarettes of the most popular brand'
      },
      {
        measure: 'afford',
        year: '2010',
        keyCode: '2010 afford key',
        tooltipColumn: '2010 affordability of cigarettes;  % of GDP per capita required to purchase 2000 cigarettes of the most popular brand'
      },
      {
        measure: 'afford',
        year: '2012',
        keyCode: '2012 afford key',
        tooltipColumn: '2012 affordability of cigarettes;  % of GDP per capita required to purchase 2000 cigarettes of the most popular brand'
      },
      {
        measure: 'afford',
        year: '2014',
        keyCode: '2014 afford key',
        tooltipColumn: '2014 affordability of cigarettes;  % of GDP per capita required to purchase 2000 cigarettes of the most popular brand'
      },
      {
        measure: 'afford',
        year: '2016',
        keyCode: '2016 afford key',
        tooltipColumn: '2016 affordability of cigarettes;  % of GDP per capita required to purchase 2000 cigarettes of the most popular brand'
      },
    ];
    this.filterState = { measure: 'price', year: '2016' };

    this.legends = {
      price: {
        '1': '< $2',
        '2': '$2 - $3.99',
        '3': '$4 - $5.99',
        '4': '$6 - $7.99',
        '5': '$8 - $9.99',
        '6': '$10+',
      },
      tax: {
        '1': '0%',
        '2': '1% - 15%',
        '3': '16% - 30%',
        '4': '31% - 45%',
        '5': '46% - 60%',
        '6': '61%+',
      },
      afford: {
        '1': '0% - 0.015%',
        '2': '0.016% - 0.035%',
        '3': '0.036% - 0.055%',
        '4': '0.056% - 0.075%',
        '5': '0.076% - 0.095%',
        '6': '0.096%+',
      }
    }
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('12-map2.csv'), (csvData) => {
        const filteredData = csvData.filter(d => {
          return this.filterColumns.some(filter => d[filter.keyCode] !== '');
        });

        this.colorScale.domain(this.getFilteredKeyCodeDomain(filteredData));
        resolve(filteredData);
      });
    });
  }

  join(countries, joinData) {
    countries.features.forEach(feature => {
      const countryData = joinData.filter(row => row['ISO3 CODE'] === this.getISO3(feature));
      if (countryData.length > 0) {
        feature.properties.joined = countryData[0];
      }
    });
    return countries;
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

    // Different legend by selected measure
    const legendItems = Object.entries(this.legends[matchingColumn.measure]);
    legendItems.unshift([ null, this.getTranslation('No data') ]);
    this.renderLegendWithItems(legendItems.reverse());

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

  tooltipContent(d) {
    let content = `<div class="country-name">${d.properties.NAME}</div>`;

    const matchingColumn = this.filterColumns.filter(column => {
      return Object.keys(this.filterState).every(key => this.filterState[key] === column[key]);
    })[0];

    const formatters = {
      price: d => `$${format('.2f')(d)}`,
      tax: d => `${format('.1f')(d * 100)}%`,
      afford: d => `${format('.2f')(d)}%`,
    };

    const labels = {
      price: this.getTranslation('Price of a pack of cigarettes'),
      tax: this.getTranslation('Tax as percent of price'),
      afford: this.getTranslation('Percent of GDP per capita to buy 2000 cigarettes'),
    };

    if (d.properties.joined && matchingColumn) {
      content += `<div class="data">${labels[matchingColumn.measure]}: ${formatters[matchingColumn.measure](d.properties.joined[matchingColumn.tooltipColumn])}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }

  render() {
    super.render();
    const legendItems = Object.entries(this.legends.price);
    legendItems.unshift([ null, this.getTranslation('No data') ]);
    this.renderLegendWithItems(legendItems);
    this.renderFilters();
  }
}
