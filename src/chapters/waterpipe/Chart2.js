import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart3 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = 'waterpipe-inset2';
    this.yLabel = this.getTranslation('Tobacco Users That Used Waterpipe (%)');
    this.yTicks = 6;
    this.legendItems = [
      { label: this.getTranslation('Women'), value: 'women' },
      { label: this.getTranslation('Men'), value: 'men' },
    ];
    this.yAxisTickFormat = format('d');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('waterpipe-2.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.men = +d.Men * 100;
          d.women = +d.Women * 100;
          d.country = d.ISO3;
          return d;
        }));
      });
    });
  }

  createMargin() {
    const margin = super.createMargin();
    margin.bottom = this.legendOrientation() === 'horizontal' ? 43 : 50;
    if (this.options.web) margin.bottom = 80;
    return margin;
  }

  createXScale() {
    const values = set(this.data.map(d => d.country)).values();
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 2;

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', d => this.x(d.country))
      .attr('width', barWidth)
      .attr('y', d => this.y(d.women))
      .attr('height', d => this.chartHeight - this.y(d.women))
      .attr('fill', d => this.colors('women'));

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', d => this.x(d.country) + barWidth)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.men))
      .attr('height', d => this.chartHeight - this.y(d.men))
      .attr('fill', d => this.colors('men'));
  }

  createYScale() {
    const values = this.data.map(d => d.men).concat(this.data.map(d => d.women));
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }
}
