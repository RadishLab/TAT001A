import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';
import { line } from 'd3-shape';

import { schemeCategoryProblem } from '../../colors';
import BarChart from '../../charts/BarChart';

export default class Chart3 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = '1-inset3';
    this.yLabel = this.getTranslation('Annual Profit per Acre (USD)');
    this.yTicks = 6;
    this.legendItems = [
      { label: this.getTranslation('Contractor'), value: 'contractor-adjusted' },
      { label: this.getTranslation('Contractor'), value: 'contractor-unadjusted' },
      { label: this.getTranslation('Independent'), value: 'independent-adjusted' },
      { label: this.getTranslation('Independent'), value: 'independent-unadjusted' },
    ];
    this.xAxisTickFormat = this.getTranslation.bind(this);
    this.yAxisTickFormat = format('d');
  }

  getLegendRowsCount() {
    return 3;
  }

  createMargin() {
    const margin = super.createMargin();
    margin.bottom += 5;
    if (this.options.web) {
      margin.left = 80;
      if (this.widthCategory === 'narrowest') margin.left = 50;
    }
    return margin;
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('1-3.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.profitType = d['Profit Type (per Acre)'].indexOf('Adjusted') >= 0 ? 'adjusted' : 'unadjusted';
          d.employmentType = d['Contract versus Independent'].trim().toLowerCase();
          d.legendType = `${d.employmentType}-${d.profitType}`;
          d.value = +d['Profit Per Acre - USD'];
          return d;
        }));
      });
    });
  }

  createXScale() {
    const values = this.data.map(d => d['Country']);
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  renderLegend() {
    const legendLine = line()
      .x(d => d[0])
      .y(d => d[1]);

    const legend = this.createLegendRoot();
    const lineWidth = this.options.web ? 20 : 10;

    let xOffset = 0,
      yOffset = 0;
    const legendLeft = legend.append('g')
      .attr('transform', 'translate(0, 0)');
    const legendLeftItems = [];
    legendLeftItems.push(this.legendItems[0]);
    legendLeftItems.push(this.legendItems[2]);

    let legendItem = legendLeft.append('g')
      .attr('transform', `translate(${xOffset}, ${yOffset})`);
      legendItem.append('text')
        .text(this.getTranslation('Adjusted for labor costs'))
        .attr('transform', `translate(0, 0)`);

    yOffset += legendItem.node().getBBox().height + 1;

    const appendLegendItem = (container, label, value) => {
      const legendItem = container.append('g')
        .attr('transform', `translate(${xOffset}, ${yOffset})`);
      legendItem.append('text')
        .text(label)
        .attr('transform', `translate(${lineWidth + 2.5}, 0)`);

      const legendItemHeight = legendItem.node().getBBox().height;
      legendItem.append('path')
        .datum([[0, 0], [lineWidth, 0]])
        .style('stroke', this.colors(value))
        .attr('transform', `translate(0, -${legendItemHeight / 3})`)
        .attr('d', d => legendLine(d));
      yOffset += legendItem.node().getBBox().height + 1;
    };

    legendLeftItems.forEach(({ label, value }) => appendLegendItem(legendLeft, label, value));

    xOffset = 0;
    yOffset = 0;
    const legendRight = legend.append('g')
      .attr('transform', `translate(${legendLeft.node().getBBox().width + 10}, 0)`);
    const legendRightItems = [];
    legendRightItems.push(this.legendItems[1]);
    legendRightItems.push(this.legendItems[3]);

    legendItem = legendRight.append('g')
      .attr('transform', `translate(${xOffset}, ${yOffset})`);
      legendItem.append('text')
        .text(this.getTranslation('Not adjusted for labor costs'))
        .attr('transform', `translate(0, 0)`);

    yOffset += legendItem.node().getBBox().height + 1;

    legendRightItems.forEach(({ label, value }) => appendLegendItem(legendRight, label, value));
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    const barWidth = this.x.bandwidth() / 4;

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', d => {
        let x = this.x(d['Country']);
        if (d.employmentType === 'independent') {
          x += (2 * barWidth);
        }
        if (d.profitType === 'unadjusted') {
          x += barWidth;
        }
        return x;
      })
      .attr('width', barWidth)
      .attr('y', d => {
        if (d.value < 0) return this.y(0);
        return this.y(d.value);
      })
      .attr('height', d => Math.abs(this.y(0) - this.y(d.value)))
      .attr('fill', d => this.colors(d.legendType));
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
    return scaleOrdinal(schemeCategoryProblem);
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${d.Country}</div>`;
    const numberFormat = format(',d');
    content += `<div class="data">${numberFormat(d.value)} ${this.getTranslation('USD profit per acre')}</div>`;
    content += `<div class="data">${this.getTranslation(d['Contract versus Independent'])}</div>`;
    if (d.profitType === 'adjusted') {
      content += `<div class="data">${this.getTranslation('Adjusted for labor costs')}</div>`;
    }
    else if (d.profitType === 'unadjusted') {
      content += `<div class="data">${this.getTranslation('Not adjusted for labor costs')}</div>`;
    }
    return content;
  }
}
