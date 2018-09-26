import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import PointMap from '../../maps/PointMap';

export default class Map2 extends PointMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(['#356CB9', '#F79311', '#38AC90', '#505152'])
      .domain(['N', 'S', 'C', '0']);
    this.categoryField = 'Smokefree';

    this.forceOptions.radius = 6;

    if (this.widthCategory === 'narrowest') {
      this.pointRadius = 5;
      this.forceOptions.radius = 3;
    }
  }

  getFigurePrefix() {
    return '13-map2';
  }

  onTranslationsLoaded() {
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
    super.onTranslationsLoaded();
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

  getLegendItems() {
    const legendItemList = super.getLegendItems();
    legendItemList.pop();
    return legendItemList;
  }

  tooltipContent(d) {
    let content = `<div class="header">${d.City}</div>`;
    content += `<div class="data">${this.categories[d[this.categoryField]].tooltip}</div>`;
    return content;
  }

  render() {
    super.render();
    this.renderLegend();
  }
}
