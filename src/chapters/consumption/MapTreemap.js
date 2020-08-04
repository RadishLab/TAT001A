import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { mapCircleOverlay, schemeCategoryProblemMap } from '../../colors';
import TreeMap from '../../maps/TreeMap';

export default class MapTreemap extends TreeMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategoryProblemMap);
    this.colorScaleType = 'ordinal';
    this.figurePrefix = 'consumption-map';
    this.symbolField = 'Symbol';
    this.keyCodeField = 'Key code';
    this.valueField = 'Cigarette consumption';
  }

  loadJoinData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('consumption-map.csv'), (csvData) => {
        const domain = set(csvData.map(d => d[this.keyCodeField])).values().sort();
        this.colorScale.domain(domain);
        resolve(csvData);
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

  tooltipContent(d) {
    let content = `<div class="country-name">${this.getCountryName(d)}</div>`;
    const cigaretteFormat = d => format(',d')(parseFloat(d, 10));
    if (d.value !== undefined) {
      content += `<div class="data">${cigaretteFormat(d.value)} ${this.getTranslation('cigarettes smoked per person per year')}</div>`;
    }
    else {
      content += `<div class="data no-data">${this.getTranslation('No data')}</div>`;
    }
    return content;
  }

  renderTreeSegments() {
    super.renderTreeSegments();

    // This is the only treemap with symbols--add them here
    if (this.symbolField) {
      this.parent.selectAll('.leaf-symbol').remove();

      const symbolLeaves = this.countries.selectAll(".leaf")
        .filter(d => {
          return d.data.joined[this.symbolField] !== '';
        })

      symbolLeaves.selectAll('.leaf-shape')
        .clone(true)
        .classed('leaf-shape', false)
        .classed('leaf-symbol', true)
        .attr('pointer-events', 'none')
        .style('fill', 'url(#cartogram-dots)');

      const defs = this.parent.insert('defs', '#root');
      defs
        .append('pattern')
          .attr('id', 'cartogram-dots')
          .attr('patternUnits', 'userSpaceOnUse')
          .attr('width', this.options.web ? 6 : 2)
          .attr('height', this.options.web ? 6 : 2)
        .append('circle')
          .attr('cx', this.options.web ? 3 : 2)
          .attr('cy', this.options.web ? 3 : 2)
          .attr('r', this.options.web ? 1 : 0.22)
          .attr('opacity', 0.3)
          .attr('fill', mapCircleOverlay);
    }
  }
}
