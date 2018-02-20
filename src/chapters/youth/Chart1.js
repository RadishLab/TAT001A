import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart1 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = 'youth-inset1';
    this.yLabel = this.getTranslation('Prevalence (%)');
    this.yTicks = 6;
    this.legendItems = [
      { label: this.getTranslation('Adult Male'), value: 'adult male' },
      { label: this.getTranslation('Adult Female'), value: 'adult female' },
      { label: this.getTranslation('Youth Male'), value: 'youth male' },
      { label: this.getTranslation('Youth Female'), value: 'youth female' },
    ];
    this.yAxisTickFormat = format('d');
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('youth-1.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.adultMale = +d['Adult Male'];
          d.adultFemale = +d['Adult Female'];
          d.youthMale = +d['Youth Male'];
          d.youthFemale = +d['Youth Female'];
          d.country = d.Country;
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
    const barWidth = this.x.bandwidth() / 4;

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', d => this.x(d.country))
      .attr('width', barWidth)
      .attr('y', d => this.y(d.adultMale))
      .attr('height', d => this.chartHeight - this.y(d.adultMale))
      .attr('fill', d => this.colors('adult male'));

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', d => this.x(d.country) + barWidth)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.adultFemale))
      .attr('height', d => this.chartHeight - this.y(d.adultFemale))
      .attr('fill', d => this.colors('adult female'));

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', d => this.x(d.country) + barWidth * 2)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.youthMale))
      .attr('height', d => this.chartHeight - this.y(d.youthMale))
      .attr('fill', d => this.colors('youth male'));

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', d => this.x(d.country) + barWidth * 3)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.youthFemale))
      .attr('height', d => this.chartHeight - this.y(d.youthFemale))
      .attr('fill', d => this.colors('youth female'));
  }

  createYScale() {
    const values = this.data.map(d => d.adultMale)
      .concat(this.data.map(d => d.adultFemale))
      .concat(this.data.map(d => d.youthMale))
      .concat(this.data.map(d => d.youthFemale));
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
