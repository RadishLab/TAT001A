import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart5 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '5-inset5';
    this.yLabel = this.getTranslation('Secondhand smoke exposure (%)');
    this.yTicks = 6;
    this.legendItems = [
      { label: this.getTranslation('Home'), value: 'home' },
      { label: this.getTranslation('Work'), value: 'work' },
      { label: this.getTranslation('Restaurant'), value: 'restaurant' },
    ];
    this.yAxisTickFormat = format('.2');
    this.xAxisTickRows = 2;
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('5-5.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.country = d.Country;
          d.home = parseFloat(d.Home) || 0;
          d.work = parseFloat(d.Work) || 0;
          d.restaurant = parseFloat(d.Restaurant) || 0;
          return d;
        }));
      });
    });
  }

  createXScale() {
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(this.data.map(d => d.country));
  }

  createYScale() {
    const values = this.data.reduce((valueArray, d) => valueArray.concat([d.home, d.work, d.restaurant]), []);
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent);
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 3;

    barGroups.append('rect')
      .classed('bar home', true)
      .attr('x', d => this.x(d.country))
      .attr('width', barWidth)
      .attr('y', d => this.y(d.home))
      .attr('height', d => this.chartHeight - this.y(d.home))
      .attr('fill', d => this.colors('home'));

    barGroups.append('rect')
      .classed('bar work', true)
      .attr('x', d => this.x(d.country) + barWidth)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.work))
      .attr('height', d => this.chartHeight - this.y(d.work))
      .attr('fill', d => this.colors('work'));

    barGroups.append('rect')
      .classed('bar restaurant', true)
      .attr('x', d => this.x(d.country) + 2 * barWidth)
      .attr('width', barWidth)
      .attr('y', d => this.y(d.restaurant))
      .attr('height', d => this.chartHeight - this.y(d.restaurant))
      .attr('fill', d => this.colors('restaurant'));
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${d.country}</div>`;
    if (bar.classed('home')) {
      content += `<div>${this.getTranslation('Home exposure')}: ${this.yAxisTickFormat(d.home)}%</div>`;
    }
    if (bar.classed('work')) {
      content += `<div>${this.getTranslation('Work exposure')}: ${this.yAxisTickFormat(d.work)}%</div>`;
    }
    if (bar.classed('restaurant')) {
      content += `<div>${this.getTranslation('Restaurant exposure')}: ${this.yAxisTickFormat(d.restaurant)}%</div>`;
    }
    return content;
  }

  render() {
    super.render();

    if (this.options.web) {
      let fontSize = '12px';
      if (this.widthCategory === 'narrowest') fontSize = '.4rem';
      this.root.selectAll('.axis-x .tick')
        .style('font-size', fontSize);
    }
  }
}
