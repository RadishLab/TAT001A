import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scalePoint } from 'd3-scale';
import { line } from 'd3-shape';
import { event as currentEvent, select } from 'd3-selection';

import { schemeCategoryProblem } from '../../colors';
import Chart from '../../charts/Chart';

export default class Chart2 extends Chart {
  constructor(parent, options) {
    super(parent, options);
    this.legendItems = [];
    this.xAxisTickFormat = (d) => this.getTranslation(d);
    this.yAxisTickFormat = format('d');
  }

  getFigurePrefix() {
    return 'smokeless-2';
  }

  onTranslationsLoaded() {
    this.yLabel = this.getTranslation('Tobacco-Specific Nitrosamines (ng/g)');
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('smokeless-2.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d.type = d['Tobacco Type'];
          d.min = parseInt(d['Low TSNA'], 10);
          d.max = parseInt(d['High TSNA'], 10);
          return d;
        });
        resolve(mappedData);
      });
    });
  }

  createScales() {
    super.createScales();
    this.colors = this.createZScale();
  }

  onDataLoaded(data) {
    super.onDataLoaded(data);
    this.render();
  }

  createMargin() {
    const margin = super.createMargin();
    margin.left = this.options.web ? 90 : 80;
    if (this.widthCategory === 'narrowest') margin.left = 60;
    return margin;
  }

  createXScale() {
    const values = set(this.data.map(d => d.type)).values().sort();
    return scalePoint()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  createYScale() {
    const values = this.data.map(d => d.max).concat(this.data.map(d => d.min));
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  renderWhiskers() {
    const whisker = this.root.selectAll('.whisker')
      .data(this.data)
      .enter().append('g').classed('whisker', true);

    const lineCreator = line();
    whisker.append('path')
      .style('stroke-opacity', 0.5)
      .style('stroke-width', 5)
      .style('stroke', 'black')
      .attr('d', d => lineCreator([
        [this.x(d.type), this.y(d.min)],
        [this.x(d.type), this.y(d.max)]
      ]));

    whisker
      .on('mouseover', (d, i, nodes) => {
        this.onMouseOverWhisker(d, select(nodes[i]));
      })
      .on('mouseout', (d, i, nodes) => {
        this.onMouseOutWhisker(d, select(nodes[i]));
      });
  }

  onMouseOverWhisker(d, whisker) {
    whisker.select('path')
      .style('stroke-opacity', 1);
    if (this.tooltipContent) {
      this.tooltip
        .html(this.tooltipContent(d, whisker))
        .classed('visible', true)
        .style('top', `${currentEvent.layerY - 10}px`)
        .style('left', `${currentEvent.layerX + 10}px`);
    }
  }

  onMouseOutWhisker(d, whisker) {
    whisker.select('path')
      .style('stroke-opacity', 0.5);
    if (this.tooltipContent) {
      this.tooltip.classed('visible', false);
    }
  }

  tooltipContent(d, whisker) {
    let content = `<div class="header">${d.type}</div>`;
    const numberFormat = format(',d');
    content += `<div class="data">${this.getTranslation('Tobacco-Specific Nitrosamines')}: ${numberFormat(d.min)} ${this.getTranslation('to')} ${numberFormat(d.max)} ng/g</div>`;
    return content;
  }

  render() {
    super.render();
    this.renderWhiskers();
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }
}
