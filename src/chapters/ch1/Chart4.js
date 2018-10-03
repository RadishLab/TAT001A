import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scalePoint } from 'd3-scale';
import { line } from 'd3-shape';
import { event as currentEvent, select } from 'd3-selection';

import { schemeCategoryProblem } from '../../colors';
import Chart from '../../charts/Chart';

export default class Chart4 extends Chart {
  constructor(parent, options) {
    super(parent, options);
    this.parent
      .classed('circle-chart', true);
    this.xAxisTickFormat = label => {
      let capitalized = label.charAt(0).toUpperCase() + label.slice(1);
      return this.getTranslation(capitalized);
    };
    this.yAxisTickFormat = (label) => {
      if (label === 'Other') label = 'Mixed/Other';
      return this.getTranslation(label);
    }
  }

  getFigurePrefix() {
    return '1-4';
  }

  onTranslationsLoaded() {
    this.xLabel = this.getTranslation('Region');
    this.yLabel = this.getTranslation('Crop');
    this.legendItems = [
      { label: this.getTranslation('Farmers who stopped growing tobacco'), value: 'former' },
      { label: this.getTranslation('Farmers still growing tobacco'), value: 'current' },
    ];
    super.onTranslationsLoaded();
  }

  createMargin() {
    const margin = super.createMargin();
    margin.left = this.options.web ? 200 : 80;
    margin.top = 10;

    if (this.widthCategory === 'narrowest') {
      margin.left = 120;
    }
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

  createScales() {
    super.createScales();
    this.sizes = this.createSizeScale();
    this.colors = this.createColorScale();
  }

  onDataLoaded(data) {
    super.onDataLoaded(data);
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
      .range(this.options.web ? [3, 30] : [1, 15]);
  }

  createColorScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  renderCircles() {
    const circleGroups = this.root.selectAll('.circle')
      .data(this.data)
      .enter().append('g');

    let strokeWidth = this.options.web ? 4 : 2;
    if (this.widthCategory === 'narrowest') strokeWidth = 2;
    circleGroups.append('circle')
      .attr('fill', 'none')
      .attr('stroke', d => this.colors(d.when))
      .attr('stroke-width', strokeWidth)
      .attr('cx', d => this.x(`${d.where}-${d.season}`))
      .attr('cy', d => this.y(d.crop))
      .attr('r', d => {
        const size = this.sizes(d.sales);
        if (!size) return 0;
        return size;
      })
      .on('mouseover', (d, i, nodes) => {
        this.onMouseOver(d, select(nodes[i]));
      })
      .on('mouseout', (d, i, nodes) => {
        this.onMouseOut(d, select(nodes[i]));
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

  onMouseOver(d, selection) {
    this.root.selectAll('circle')
      .style('stroke-opacity', circleData => {
        return (
          circleData.crop === d.crop &&
          circleData.season === d.season &&
          circleData.when === d.when &&
          circleData.where === d.where
        ) ? 1 : 0.2;
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

  tooltipContent(d, selection) {
    const region = d.where[0].toUpperCase() + d.where.slice(1);
    const numberFormat = format('.1f');
    const farmers =  this.getTranslation(
      d.when === 'former' ?
        'Farmers who stopped growing tobacco' :
        'Farmers still growing tobacco'
    );
    let content = `<div class="header">${d.crop}</div>`;
    content += `<div>${this.getTranslation(region)}, ${this.getTranslation(d.season)} ${this.getTranslation('season')}</div>`;
    content += `<div>${farmers}</div>`;
    content += `<div>${this.getTranslation('Sales')}: ${numberFormat(d.sales)}</div>`;
    return content;
  }
}
