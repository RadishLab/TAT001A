import { max, median, min } from 'd3-array';
import { nest, set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scalePoint } from 'd3-scale';
import { line } from 'd3-shape';
import { event as currentEvent, select } from 'd3-selection';

import { schemeCategoryProblem } from '../../colors';
import Chart from '../../charts/Chart';

export default class Chart1 extends Chart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = 'smokeless-inset1';
    this.yLabel = this.getTranslation('Prevalence of smokeless tobacco use among youth (%)');
    this.legendItems = [];
    this.yAxisTickFormat = format('d');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('smokeless-1.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d.country = d['Country'];
          d.region = d['WHO Region'];
          d.boys = parseFloat(d['TA6 Boys']);
          d.girls = parseFloat(d['TA6 Girls']);
          d.children = parseFloat(d['TA6 Children']);
          return d;
        });

        const nested = nest()
          .key(d => d.region)
          .rollup(values => {
            return {
              boys: {
                max: max(values, d => d.boys),
                median: median(values, d => d.boys),
                min: min(values, d => d.boys),
              },
              girls: {
                max: max(values, d => d.girls),
                median: median(values, d => d.girls),
                min: min(values, d => d.girls),
              },
              children: {
                max: max(values, d => d.children),
                median: median(values, d => d.children),
                min: min(values, d => d.children),
              }
            };
          })
          .entries(mappedData);

        resolve(nested);
      });
    });
  }

  onDataLoaded(data) {
    this.x = this.createXScale();
    this.y = this.createYScale();
    this.colors = this.createZScale();
    this.render();
  }

  createMargin() {
    const margin = super.createMargin();
    margin.left = this.options.web ? 60 : 80;
    margin.bottom = this.options.web ? 40 : 38;
    return margin;
  }

  createXScale() {
    const values = set(this.data.map(d => d.key)).values().sort();
    return scalePoint()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  createYScale() {
    const values = this.data.map(d => d.value.boys.max).concat(this.data.map(d => d.value.girls.max)).concat(this.data.map(d => d.value.children.max));
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
        [this.x(d.key), this.y(d.value.children.min)],
        [this.x(d.key), this.y(d.value.children.max)]
      ]));

    whisker.append('circle')
      .attr('r', 10)
      .attr('cx', d => this.x(d.key))
      .attr('cy', d => this.y(d.value.children.median))
      .style('fill', 'none')
      .style('stroke-width', 2)
      .style('stroke', this.colors('smokeless'));

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
    let content = `<div class="header">${d.key}</div>`;
    content += `<div class="data">${this.getTranslation('Median')}: ${d.value.children.median}%</div>`;
    content += `<div class="data">${this.getTranslation('Range')}: ${d.value.children.min}% - ${d.value.children.max}%</div>`;
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
