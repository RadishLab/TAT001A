import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import PointMap from '../../maps/PointMap';

export default class Map2 extends PointMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(['#356CB9', '#F79311', '#38AC90', '#505152'])
      .domain(['N', 'S', 'C', '0']);
    this.categoryField = 'Smokefree';

    this.categories = {
      '0': {
        tooltip: this.getTranslation('No comprehensive policy'),
        legend: this.getTranslation('No policy')
      },
      'N': {
        tooltip: this.getTranslation('Covered by national policy'),
        legend: this.getTranslation('National policy')
      },
      'S': {
        tooltip: this.getTranslation('Covered by state/province policy'),
        legend: this.getTranslation('State/province policy')
      },
      'C': {
        tooltip: this.getTranslation('Covered by municipal policy'),
        legend: this.getTranslation('Municipal policy')
      }
    };

    this.forceOptions.radius = 6;
  }

  loadPointData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('13-map2.csv'), (csvData) => {
        const mappedData = csvData
          .map(d => {
            d.Latitude = +d._y;
            d.Longitude = +d._x;
            return d;
          })
          .filter(d => d.Latitude && d.Longitude);
        resolve(mappedData);
      });
    });
  }

  renderLegend() {
    const legendWidth = this.width / 7;
    const legendHeight = 18;
    const legendPadding = 3;
    const legendItemList = Object.entries(this.categories);
    const legendItemCount = legendItemList.length;

    this.legendGroup = this.root.append('g')
      .classed('legend', true)
      .attr('transform', `translate(${this.width - legendWidth}, 0)`);

    const legendItems = this.legendGroup.selectAll('rect')
      .data(legendItemList)
      .enter().append('g')
      .attr('transform', (d, i) => {
        const y = (legendHeight + legendPadding) * (legendItemCount - i);
        return `translate(0, ${y})`;
      });

    legendItems.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', d => {
        const keyCode = d[0];
        return keyCode !== null ? this.colorScale(keyCode) : this.noDataColor;
      });

    legendItems.append('text')
      .attr('x', 4)
      .attr('y', 15)
      .style('fill', '#e8e8e8')
      .text(d => d[1].legend);
  }

  tooltipContent(d) {
    console.log(d);
    let content = `<div class="header">${d.City}</div>`;
    content += `<div class="data">${this.categories[d[this.categoryField]].tooltip}</div>`;
    return content;
  }

  render() {
    super.render();
    this.renderLegend();
  }
}
