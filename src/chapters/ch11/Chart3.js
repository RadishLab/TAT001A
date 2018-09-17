import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scalePoint } from 'd3-scale';
import { event as currentEvent, select } from 'd3-selection';

import { schemeCategorySolution } from '../../colors';
import Chart from '../../charts/Chart';

export default class Chart3 extends Chart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '11-3';
    this.xLabel = this.getTranslation('Age of Smokers at Quitting');
    this.yLabel = [
      this.getTranslation('Relative Risk of Death Before Age 65'),
      this.getTranslation('Compared to a Never Smoker')
    ];
    this.yTicks = 6;
    this.parent
      .classed('circle-chart', true);
    this.legendItems = [];
    this.xAxisTickFormat = (label) => label !== 'Never' ? label : this.getTranslation(label);
    this.yAxisTickFormat = format('d');
  }

  createMargin() {
    const margin = super.createMargin();
    margin.top = 15;
    margin.left = 35;
    margin.bottom = this.legendOrientation() === 'horizontal' ? 30 : 40;
    if (this.options.web) {
      margin.top = 25;
      margin.left = 65;
      margin.bottom = 50;

      if (this.widthCategory === 'narrowest') {
        margin.bottom = 40;
      }
    }
    return margin;
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('11-3.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.value = +d['Relative Risk of Death Before Age 65 Compared to a Never Smoker'];
          d.age = d['Age of Smokers at Quitting'];
          return d;
        }));
      });
    });
  }

  onDataLoaded(data) {
    super.onDataLoaded(data);
    this.render();
  }

  createScales() {
    super.createScales();
    this.colors = this.createZScale();
  }

  createXScale() {
    return scalePoint()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(this.data.map(d => d.age));
  }

  createYScale() {
    const values = this.data.map(d => d.value);
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createZScale() {
    return scaleOrdinal(schemeCategorySolution);
  }

  xTicks() {
    return this.data.map(d => d.age);
  }

  renderCircles() {
    const circleGroups = this.root.selectAll('.circle')
      .data(this.data)
      .enter().append('g');

    circleGroups.append('circle')
      .attr('fill', 'transparent')
      .attr('stroke', d => this.colors(1))
      .attr('stroke-width', this.options.web ? 4 : 2)
      .attr('cx', d => this.x(d.age))
      .attr('cy', d => this.y(d.value))
      .attr('r', () => {
        if (this.widthCategory === 'narrowest') return 10;
        return 20;
      })
      .on('mouseover', (d, i, nodes) => {
        this.onMouseOver(d, select(nodes[i]));
      })
      .on('mouseout', (d, i, nodes) => {
        this.onMouseOut(d, select(nodes[i]));
      });
  }

  onMouseOver(d, selection) {
    this.root.selectAll('circle')
      .style('stroke-opacity', circleData => {
        return circleData.age === d.age ? 1 : 0.2;
      });

    if (this.tooltipContent) {
      const x = currentEvent.layerX;
      this.tooltip
        .html(this.tooltipContent(d))
        .classed('visible', true)
        .style('top', `${currentEvent.layerY - 10}px`);

      if (x + 100 < this.width) {
        this.tooltip
          .style('right', 'inherit')
          .style('left', `${x + 20}px`);
      }
      else {
        this.tooltip
          .style('left', 'inherit')
          .style('right', `${this.width - x + 20}px`);
      }
    }
  }

  onMouseOut(d, selection) {
    this.root.selectAll('circle')
      .style('stroke-opacity', 1);

    if (this.tooltipContent) {
      this.tooltip.classed('visible', false);
    }
  }

  renderGuidelines() {
    this.renderXGuidelines();
  }

  render() {
    super.render();
    this.renderCircles();
  }

  tooltipContent(d, selection) {
    let ageLabel = d.age === 'Never' ? this.getTranslation('Never quitting') : `${this.getTranslation('Quitting at')} ${d.age}`;
    let content = `<div class="header">${ageLabel}</div>`;
    content += `<div>${d.value} ${this.getTranslation('times more likely to die before age 65')}</div>`;
    return content;
  }
}
