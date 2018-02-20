import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { csv, json as d3json  } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';
import { event as currentEvent } from 'd3-selection';
import * as topojson from 'topojson-client';

import { mapNoData, schemeCategoryProblem } from '../../colors';
import { loadCachedData } from '../../dataService';
import PointMap from '../../maps/PointMap';

export default class Map extends PointMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategoryProblem);
    this.projection = geoNaturalEarth1();
    this.path = geoPath()
      .projection(this.projection);
  }

  loadPointData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('illicit-3.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.Latitude = +d.latitude;
          d.Longitude = +d.longitude;
          return d;
        }));
      });
    });
  }

  loadCountries() {
    return new Promise((resolve, reject) => {
      loadCachedData(d3json, this.baseDataUrl + 'countries-50m.topojson', (data) => {
        resolve(topojson.feature(data, data.objects['-']));
      });
    });
  }

  render() {
    const margin = 15;
    this.projection.fitExtent([
      [margin, margin],
      [this.parent.node().clientWidth - margin, this.parent.node().clientHeight - margin],
    ],
      this.countriesGeojson.features.filter(f => f.properties.NAME === 'Mexico')[0]
    );
    this.renderPaths();
  }

  renderPaths() {
    this.countries = this.root.append('g');
    const country = this.countries.selectAll('.country')
      .data(this.countriesGeojson.features.sort((a, b) => {
        // Put Mexico at the end so it appears on top
        if (a.properties.NAME === 'Mexico') return 1;
        if (b.properties.NAME === 'Mexico') return -1;
        return 0;
      }))
      .enter()
        .append('g')
        .classed('country', true);

    country.append('path')
      .style('fill', mapNoData)
      .style('stroke', d => {
        if (d.properties.NAME === 'Mexico') {
          return 'black';
        }
        return null;
      })
      .attr('d', this.path);

    this.points = this.root.append('g');
    const point = this.points.selectAll('.point')
      .data(this.pointData)
      .enter()
        .append('g')
        .classed('point', true);
    point.append('circle')
      .style('fill', d => this.colorScale(d[this.categoryField]))
      .attr('r', 8)
      .attr('transform', d => `translate(${this.projection([d.Longitude, d.Latitude])})`)
      .on('mouseover', d => {
        this.tooltip
          .html(this.tooltipContent(d))
          .classed('visible', true)
          .style('top', `${currentEvent.layerY + 10}px`)
          .style('left', `${currentEvent.layerX + 10}px`);
      })
      .on('mouseout', d => {
        this.tooltip.classed('visible', false);
      });
  }

  tooltipContent(d) {
    let content = `<div class="header">${d.city}</div>`;
    return content;
  }
}
