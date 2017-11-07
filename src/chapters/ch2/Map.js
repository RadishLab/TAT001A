import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import { dataUrl } from '../../dataService';
import PointMap from '../../maps/PointMap';

export default class Map extends PointMap {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.colorScale = scaleOrdinal(schemeCategoryProblem);
    this.categoryField = 'Products';
  }

  loadPointData() {
    return new Promise((resolve, reject) => {
      csv(dataUrl('2-map.csv'), (csvData) => {
        resolve(csvData);
      });
    });
  }
}
