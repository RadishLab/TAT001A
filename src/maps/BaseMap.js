import { select } from 'd3-selection';
import tinycolor from 'tinycolor2';

import Visualization from '../Visualization';
import wrap from '../wrap';

export default class BaseMap extends Visualization {
  constructor(parent, options) {
    super(parent, options);
    this.legend = options.legend;

    this.symbolOutlineColor = '#585857';
    this.legendOptions = {
      width: this.width / 7,
      height: 18,
      padding: 3,
    };

    if (this.widthCategory === 'narrowest') {
      this.legendOptions.width = this.width / 4;
    }
  }

  getLegendItems() {
    let legendItemList = [];
    if (this.legend) {
      legendItemList = Object.entries(this.legend)
        .sort((a, b) => {
          let aKey = a[0],
            bKey = b[0],
            aKeyInt = parseInt(aKey, 10),
            bKeyInt = parseInt(bKey, 10);
          // Lowest key code goes at the bottom
          if (!(isNaN(aKeyInt) || isNaN(bKeyInt))) return bKeyInt - aKeyInt;
          return bKey - aKey;
        });

      // Very rarely the key code is reversed--lowest key goes at the top
      if (this.keyCodeReversed) legendItemList = legendItemList.reverse();
    }

    ['symbol-1', 'symbol-2'].forEach(symbolName => {
      if (this.options[symbolName]) {
        legendItemList.push([symbolName, this.options[symbolName]]);
      }
    });

    // Either way put No Data at the end
    legendItemList.push([ null, this.noDataLabel ]);
    return legendItemList;
  }

  renderLegend() {
    this.legendGroup = this.root.append('g')
      .classed('legend', true)
      .attr('transform', `translate(${this.width - this.legendOptions.width}, 0)`);

    if (this.colorScaleType === 'linear') {
      this.renderLinearLegend();
      this.renderLegendWithItems(this.getLegendItems());
      return;
    }
    if (!this.legend) return;
    this.renderLegendWithItems(this.getLegendItems());
  }

  sortLegendItems(items) {
    // NOOP, implement in subclass as needed
    return items;
  }

  renderLegendWithItems(items) {
    const legendItemFill = d => {
      const keyCode = d[0];
      if (keyCode === 'symbol-1') return 'url(#dots-legend)';
      if (keyCode === 'symbol-2') return 'none';
      return keyCode !== null ? this.colorScale(keyCode) : this.noDataColor;
    };

    const legendItemsSelection = this.legendGroup.selectAll('g.legend-item')
      .data(items, d => `${d[0]}:${d[1]}`)
    
    let legendItems = legendItemsSelection.enter().append('g')
      .classed('legend-item', true);

    legendItemsSelection.exit().remove();

    legendItems.append('rect')
      .attr('width', this.legendOptions.width)
      .attr('height', this.legendOptions.height)
      .attr('fill', legendItemFill)
      .attr('stroke', d => {
        if (d[0] === 'symbol-2') return this.symbolOutlineColor;
        return 'none';
      });

    legendItems.append('text')
      .attr('y', (this.widthCategory === 'narrowest') ? 10 : 15)
      .attr('dy', 0)
      .text(d => d[1])
      .style('fill', d => {
        // If symbol, treat as a light background
        if (d[0] && d[0].indexOf('symbol-') === 0) {
          return this.textColors.lightBackground;
        }

        // Otherwise find the fill color and ask tinycolor if it is dark
        const fillColor = tinycolor(legendItemFill(d));
        if (fillColor.isDark()) {
          return this.textColors.darkBackground;
        }
        return this.textColors.lightBackground;
      })
      .call(wrap, this.legendOptions.width, this.rtl);

    legendItems.selectAll('text tspan')
      .attr('x', 4);

    legendItems.each((d, i, nodes) => {
      const legendItem = select(nodes[i])
      legendItem.select('rect')
        .attr('height', legendItem.select('text').node().getBBox().height + 3);
    });

    legendItems = legendItems.merge(legendItemsSelection);

    legendItems = this.sortLegendItems(legendItems);

    legendItems
      .attr('transform', (d, i, nodes) => {
        let y = 0;

        // There might be a linear legend, add room for it if so
        const linearLegend = this.legendGroup.select('.linear-legend');
        if (!linearLegend.empty()) {
          y += linearLegend.node().getBBox().height + this.legendOptions.padding;
        }

        // Else look for all previous nodes, add room for those
        for (let index = 0; index < i; index++) {
          const node = nodes[index];
          if (node) {
            y += node.getBBox().height + this.legendOptions.padding;
          }
        }
        return `translate(0, ${y})`;
      });
  }

  renderLinearLegend() {
    // Add a linear gradient to the svg
    let defs = this.parent.select('defs');
    if (defs.empty()) {
      defs = this.parent.append('defs');
    }
    const gradientId = 'fill-linear-legend';
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId);
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', this.colorScale.range()[0]);
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', this.colorScale.range()[1]);

    const linearLegend = this.legendGroup.append('g').classed('linear-legend', true);

    // Add a rect with our gradient
    linearLegend.append('rect')
      .attr('width', this.legendOptions.width)
      .attr('height', this.legendOptions.height)
      .attr('fill', `url(#${gradientId})`);

    // Add labels
    const extent = this.formatExtent();
    linearLegend.append('text')
      .text(extent[0])
      .attr('transform', `translate(2, ${this.legendOptions.height - 4})`);
    linearLegend.append('text')
      .text(extent[1])
      .style('text-anchor', 'end')
      .style('fill', this.textColors.darkBackground)
      .attr('transform', `translate(${this.legendOptions.width - 2}, ${this.legendOptions.height - 4})`);
  }
}
