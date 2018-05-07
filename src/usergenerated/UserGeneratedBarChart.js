import { max, min } from 'd3-array';
import { set } from 'd3-collection';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';
import { select } from 'd3-selection';

import { schemeCategoryProblem, schemeCategorySolution } from '../colors';
import BarChart from '../charts/BarChart';

export default class UserGeneratedBarChart extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.options = options;

    this.barOrientation = this.options.barOrientation;
    if (!this.barOrientation) this.barOrientation = 'vertical';

    this.groupColumn = this.options.groupColumn;

    this.legendItems = [];

    this.xAxisColumn = this.options.xAxisColumn;
    this.xAxisTickFormat = this.getTranslation.bind(this);
    this.xLabel = this.options.xAxisLabel;

    this.yAxisColumn = this.options.yAxisColumn;
    if (this.barOrientation === 'horizontal') {
      this.yAxisTickFormat = this.getTranslation.bind(this);
    }
    this.yLabel = this.options.yAxisLabel;
    this.yTicks = 6;
  }

  render() {
    let legendColumns;

    // Render y axis, update margin, remove y axis
    this.renderYAxis();
    const yAxisGroup = this.parent.select('.axis-y')
    this.margin.left = yAxisGroup.node().getBBox().width;
    yAxisGroup.node().parentNode.removeChild(yAxisGroup.node());

    // Render x axis, update margin, remove x axis
    this.renderXAxis();
    this.renderLegend(legendColumns);
    const xAxisGroup = this.parent.select('.axis-x').node();
    let legendGroup = this.parent.select('.legend').node();
    this.margin.bottom = xAxisGroup.getBBox().height + legendGroup.getBBox().height + this.legendYPadding;

    // If legend is too wide, break it up into columns
    while (legendGroup.getBBox().width > this.width && (!legendColumns || legendColumns > 1)) {
      legendColumns = legendColumns ? legendColumns - 1 : 2;
      legendGroup.parentNode.removeChild(legendGroup);
      this.renderLegend(legendColumns);
      legendGroup = this.parent.select('.legend').node();
      this.margin.bottom = xAxisGroup.getBBox().height + legendGroup.getBBox().height + this.legendYPadding;
    }
    xAxisGroup.parentNode.removeChild(xAxisGroup);
    legendGroup.parentNode.removeChild(legendGroup);

    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;

    this.root
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.createScales();
    this.renderYAxis();
    this.renderXAxis();
    this.renderLegend(legendColumns);
    this.renderGuidelines();
    this.renderBars();
    this.root.selectAll('.bar')
      .on('mouseover', (d, i, nodes) => {
        this.onMouseOverBar(d, select(nodes[i]));
      })
      .on('mouseout', (d, i, nodes) => {
        this.onMouseOutBar(d, select(nodes[i]));
      });
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.options.dataUrl, (csvData) => {
        const mappedData = csvData.map(d => {
          if (this.barOrientation === 'vertical') {
            d[this.yAxisColumn] = +d[this.yAxisColumn];
          }
          else if (this.barOrientation === 'horizontal') {
            d[this.xAxisColumn] = +d[this.xAxisColumn];
          }
          return d;
        });

        if (this.groupColumn) {
          this.groups = set(mappedData.map(d => d[this.xAxisColumn])).values();
          this.legendItems = this.groups.map(d => {
            return { label: d, value: d };
          });
        }

        resolve(mappedData);
      });
    });
  }

  createXScale() {
    const values = this.data.map(this.getXValue.bind(this));

    if (this.barOrientation === 'vertical') {
      return scaleBand()
        .range([0, this.chartWidth])
        .padding(0.5)
        .domain(values);
    }
    else if (this.barOrientation === 'horizontal') {
      const xExtent = [
        min(values.concat(0)),
        max(values)
      ];
      return scaleLinear()
        .range([0, this.chartWidth])
        .domain(xExtent);
    }
  }

  getYValues() {
    return this.data.reduce((valueArray, d) => valueArray.concat([
      d[this.yAxisColumn],
    ]), []);
  }

  createYScale() {
    const values = this.getYValues();
    if (this.barOrientation === 'vertical') {
      const yExtent = [
        min(values.concat(0)),
        max(values)
      ];
      return scaleLinear()
        .range([this.chartHeight, 0])
        .domain(yExtent);
    }
    else if (this.barOrientation === 'horizontal') {
      return scaleBand()
        .range([this.chartHeight, 0])
        .padding(0.5)
        .domain(values.reverse());
    }
  }

  getXValue(d) {
    if (this.groups) return d[this.groupColumn];
    return d[this.xAxisColumn];
  }

  renderBars() {
    const barGroups = this.createBarGroups();
    let barWidth = this.barOrientation === 'vertical' ? this.x.bandwidth() : this.y.bandwidth();
    if (this.groups) {
      barWidth /= this.groups.length;
    }

    barGroups.append('rect')
      .classed('bar', true)
      .attr('x', d => {
        let x;
        if (this.barOrientation === 'vertical') {
          x = this.x(this.getXValue(d))
          if (this.groups) {
            x += (barWidth * this.groups.indexOf(d[this.xAxisColumn]));
          }
        }
        else if (this.barOrientation === 'horizontal') {
          x = Math.min(this.x(0), this.x(d[this.xAxisColumn]));
        }
        return x;
      })
      .attr('width', d => {
        if (this.barOrientation === 'vertical') return barWidth;
        return this.x(d[this.xAxisColumn]);
      })
      .attr('y', d => {
        if (this.barOrientation === 'vertical') {
          const value = d[this.yAxisColumn];
          if (value < 0) return this.y(0);
          return this.y(value);
        }
        else if (this.barOrientation === 'horizontal') {
          let y = this.y(d[this.yAxisColumn]);
          if (this.groups) {
            y += (barWidth * this.groups.indexOf(d[this.yAxisColumn]));
          }
          return y;
        }
      })
      .attr('height', d => {
        if (this.barOrientation === 'vertical') {
          return Math.abs(this.y(0) - this.y(d[this.yAxisColumn]));
        }
        else if (this.barOrientation === 'horizontal') {
          return barWidth;
        }
      })
      .attr('fill', d => {
        if (this.groups) {
          return this.colors(d[this.xAxisColumn]);
        }
        return this.colors(this.yAxisColumn);
      });
  }

  renderGuidelines() {
    if (this.barOrientation === 'vertical') {
      super.renderGuidelines();
    }
    else if (this.barOrientation === 'horizontal') {
      this.renderXGuidelines();
    }
  }

  createZScale() {
    let scheme;
    if (this.options.colorScheme === 'problems') {
      scheme = schemeCategoryProblem;
    }
    else if (this.options.colorScheme === 'solutions') {
      scheme = schemeCategorySolution;
    }
    return scaleOrdinal(scheme);
  }

  tooltipContent(d, bar) {
    let content;
    if (this.barOrientation === 'vertical') {
      content = `<div class="header">${d[this.xAxisColumn]}</div>`;
      content += `<div>${d[this.yAxisColumn]}</div>`;
    }
    else if (this.barOrientation === 'horizontal') {
      content = `<div class="header">${d[this.yAxisColumn]}</div>`;
      content += `<div>${d[this.xAxisColumn]}</div>`;
    }
    return content;
  }
}
