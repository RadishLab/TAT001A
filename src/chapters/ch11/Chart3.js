import { max, min } from 'd3-array';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scalePoint } from 'd3-scale';

import { schemeCategorySolution } from '../../colors';
import Chart from '../../charts/Chart';

export default class Chart3 extends Chart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '11-inset3';
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
  }

  createMargin() {
    const margin = super.createMargin();
    margin.top = 15;
    margin.left = 35;
    margin.bottom = this.legendOrientation() === 'horizontal' ? 30 : 40;
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
    this.x = this.createXScale();
    this.y = this.createYScale();
    this.colors = this.createZScale();
    this.render();
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
      .attr('fill', 'none')
      .attr('stroke', d => this.colors(1))
      .attr('cx', d => this.x(d.age))
      .attr('cy', d => this.y(d.value))
      .attr('r', 10);
  }

  renderGuidelines() {
    this.renderXGuidelines();
  }

  render() {
    super.render();
    this.renderCircles();

    let xAxisHeight = this.parent.select('.axis-x .tick').node().getBBox().height + 20;
    this.parent.select('.axis-x .axis-title')
      .attr('transform', `translate(${this.chartWidth / 2}, ${xAxisHeight})`);
  }
}
