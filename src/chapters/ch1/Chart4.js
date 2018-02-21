import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scalePoint } from 'd3-scale';
import { line } from 'd3-shape';

import { schemeCategoryProblem } from '../../colors';
import Chart from '../../charts/Chart';

export default class Chart4 extends Chart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '1-inset4';
    this.xLabel = this.getTranslation('Region');
    this.yLabel = this.getTranslation('Crop');
    this.parent
      .classed('circle-chart', true);
    this.legendItems = [
      { label: this.getTranslation('Farmers who stopped growing tobacco'), value: 'former' },
      { label: this.getTranslation('Farmers still growing tobacco'), value: 'current' },
    ];
    this.xAxisTickFormat = label => {
      let capitalized = label.charAt(0).toUpperCase() + label.slice(1);
      return this.getTranslation(capitalized);
    };
    this.yAxisTickFormat = (label) => {
      if (label === 'Other') label = 'Mixed/Other';
      return this.getTranslation(label);
    }
    this.legendYOffset = 0;
    this.legendYPadding = 30;
  }

  createMargin() {
    const margin = super.createMargin();
    margin.left = this.options.web ? 200 : 80;
    margin.top = 10;
    margin.bottom = this.legendOrientation() === 'horizontal' ? 30 : 40;
    if (this.options.web) margin.bottom = 75;
    return margin;
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('1-4.csv'), (csvData) => {
        const filteredData = csvData.filter(d => d.Sales !== '');
        resolve(filteredData.map(d => {
          d.crop = d.Crop;
          d.sales = +d.Sales;
          d.season = d['Dry/wet'].trim().toLowerCase();
          d.when = d['Current/Former'].trim().toLowerCase();
          d.where = d['Up/low-land'].trim().toLowerCase();
          return d;
        }));
      });
    });
  }

  onDataLoaded(data) {
    this.x = this.createXScale();
    this.y = this.createYScale();
    this.sizes = this.createSizeScale();
    this.colors = this.createColorScale();
    this.render();
  }

  createXScale() {
    return scalePoint()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(['upland-dry', 'lowland-dry', 'upland-wet', 'lowland-wet']);
  }

  createYScale() {
    return scalePoint()
      .range([this.chartHeight, 0])
      .domain(set(this.data.map(d => d.crop)).values().sort().reverse());
  }

  createSizeScale() {
    const values = this.data.map(d => d.sales);
    return scaleLinear()
      .domain([
        min(values.concat(0)),
        max(values)
      ])
      .range(this.options.web ? [5, 25] : [1, 15]);
  }

  createColorScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  renderCircles() {
    const circleGroups = this.root.selectAll('.circle')
      .data(this.data)
      .enter().append('g');

    circleGroups.append('circle')
      .attr('fill', 'none')
      .attr('stroke', d => this.colors(d.when))
      .attr('stroke-width', 2)
      .attr('cx', d => this.x(`${d.where}-${d.season}`))
      .attr('cy', d => this.y(d.crop))
      .attr('r', d => {
        const size = this.sizes(d.sales);
        if (!size) return 0;
        return size;
      });
  }

  renderGuidelines() {
    const yGuideLine = line()
      .x(d => d[0])
      .y(d => d[1]);
    const yGuideLines = this.root.append('g');
    const yGuideLineGroup = yGuideLines.selectAll('.y-guide-line')
      .data(set(this.data.map(d => d.crop)).values().map(tick => [
        [0, this.y(tick)],
        [this.chartWidth, this.y(tick)]
      ]))
      .enter().append('g').classed('y-guide-line', true);
    yGuideLineGroup.append('path')
      .attr('d', d => yGuideLine(d));
  }

  renderYLabel(axisGroup) {
    axisGroup.append('text')
      .classed('axis-title', true)
      .attr('transform', `translate(-${(this.margin.left - (this.options.web ? 16 : 6))}, ${this.chartHeight / 2}) rotate(-90)`)
      .text(this.yLabel);
  }

  render() {
    super.render();
    this.renderCircles();
  }
}
