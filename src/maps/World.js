import * as d3array from 'd3-array';
import * as d3geo from 'd3-geo';
import * as d3scale from 'd3-scale';
import * as d3scaleChromatic from 'd3-scale-chromatic';
import * as d3selection from 'd3-selection';

export default class World {
  constructor(parent, countriesGeojson) {
    this.parent = d3selection.select(parent);
    this.countriesGeojson = countriesGeojson;
    this.projection = d3geo.geoNaturalEarth1();
    this.path = d3geo.geoPath()
      .projection(this.projection);
    this.root = this.parent.append('g');

    // TODO color ramps
    this.colorScale = d3scale.scaleSequential(d3scaleChromatic.interpolateOranges);

    this.maxValue = d3array.max(this.countriesGeojson.features, d => d.properties.joined ? parseFloat(d.properties.joined.value) : undefined);
    this.render();
  }

  renderPaths() {
    this.countries = this.root.append('g');
    this.countries.selectAll('path')
      .data(this.countriesGeojson.features)
      .enter().append('path')
        .style('fill', d => {
          if (d.properties.joined) {
            return this.colorScale(d.properties.joined.value / this.maxValue);
          }
          return 'lightgray';
        })
        .attr('d', this.path);
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

  renderLegend() {
    // TODO
  }

  render() {
    this.projection.fitExtent([
      [0, 0],
      [this.parent.node().clientWidth, this.parent.node().clientHeight]
    ], this.countriesGeojson);

    this.renderPaths();
    //this.renderLabels();
    this.renderLegend();
  }
}
