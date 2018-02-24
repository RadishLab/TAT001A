import { select } from 'd3-selection';
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
  }

  getLegendItems() {
    let legendItemList = Object.entries(this.legend)
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

    ['symbol-1', 'symbol-2'].forEach(symbolName => {
      if (this.options[symbolName]) {
        legendItemList.push([symbolName, this.options[symbolName]]);
      }
    });

    console.log(legendItemList);

    // Either way put No Data at the end
    legendItemList.push([ null, this.noDataLabel ]);
    return legendItemList;
  }

  renderLegend() {
    if (this.colorScaleType === 'linear') {
      this.renderLinearLegend();
      return;
    }
    if (!this.legend) return;
    this.renderLegendWithItems(this.getLegendItems());
  }

  renderLegendWithItems(items) {
    this.legendGroup = this.root.append('g')
      .classed('legend', true)
      .attr('transform', `translate(${this.width - this.legendOptions.width}, 0)`);

    const legendItems = this.legendGroup.selectAll('rect')
      .data(items)
      .enter().append('g');

    legendItems.append('rect')
      .attr('width', this.legendOptions.width)
      .attr('height', this.legendOptions.height)
      .attr('fill', d => {
        const keyCode = d[0];
        if (keyCode === 'symbol-1') return 'url(#dots-legend)';
        if (keyCode === 'symbol-2') return 'none';
        return keyCode !== null ? this.colorScale(keyCode) : this.noDataColor;
      })
      .attr('stroke', d => {
        if (d[0] === 'symbol-2') return this.symbolOutlineColor;
        return 'none';
      });

    legendItems.append('text')
      .attr('y', 15)
      .attr('dy', 0)
      .text(d => d[1])
      .style('fill', this.textColors.lightBackground)
      .call(wrap, this.legendOptions.width);

    legendItems.selectAll('text tspan')
      .attr('x', 4);

    legendItems.each((d, i, nodes) => {
      const legendItem = select(nodes[i])
      legendItem.select('rect')
        .attr('height', legendItem.select('text').node().getBBox().height + 3);
    });

    legendItems
      .attr('transform', (d, i, nodes) => {
        let y = 0;
        for (let index = 0; index < i; index++) {
          y += select(nodes[index]).node().getBBox().height + this.legendOptions.padding;
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

    // Add a rect with our gradient
    this.legendGroup = this.root.append('g')
      .classed('legend', true)
      .attr('transform', `translate(${this.width - this.legendOptions.width}, 10)`);
    this.legendGroup.append('rect')
      .attr('width', this.legendOptions.width)
      .attr('height', 25)
      .attr('fill', `url(#${gradientId})`);

    // Add labels
    const extent = this.formatExtent();
    this.legendGroup.append('text')
      .text(extent[0])
      .attr('transform', 'translate(2, 18)');
    this.legendGroup.append('text')
      .text(extent[1])
      .style('text-anchor', 'end')
      .style('fill', this.textColors.darkBackground)
      .attr('transform', `translate(${this.legendOptions.width - 2}, 18)`);
  }
}
