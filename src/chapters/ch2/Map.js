import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import PointMap from '../../maps/PointMap';

export default class Map extends PointMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategoryProblem);
    this.categoryField = 'Products';
  }

  loadPointData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('2-map.csv'), (csvData) => {
        resolve(csvData);
      });
    });
  }

  tooltipContent(d) {
    let content = `<div class="header">${d.Company}</div>`;
    content += `<div class="data">${this.getTranslation('Products')}: ${d.Products}</div>`;
    content += `<div class="data">${this.getTranslation('City')}: ${d.City}</div>`;
    return content;
  }
}
