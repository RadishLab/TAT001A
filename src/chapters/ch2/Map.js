import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import PointMap from '../../maps/PointMap';

export default class Map extends PointMap {
  constructor(parent, options) {
    super(parent, options);
    this.colorScale = scaleOrdinal(schemeCategoryProblem);
    this.categoryField = 'Products';
    this.figurePrefix = '2-map';
  }

  loadPointData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('2-map.csv'), (csvData) => {
        resolve(csvData);
      });
    });
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
    return legendItemList;
  }

  tooltipContent(d) {
    let content = `<div class="header">${d.Company}</div>`;
    content += `<div class="data">${this.getTranslation('Products')}: ${d.Products}</div>`;
    content += `<div class="data">${this.getTranslation('City')}: ${d.City}</div>`;
    return content;
  }
}
