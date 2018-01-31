import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import PieChart from '../../charts/PieChart';

export default class Chart4 extends PieChart {
  constructor(parent, options) {
    super(parent, options);
    this.figurePrefix = 'illicit-inset4';
    this.legendItems = [
      { label: this.getTranslation('Counterfeit'), value: 'Counterfeit' },
      { label: this.getTranslation('All other illicit'), value: 'All other illicit' }
    ];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('illicit-4.csv'), (csvData) => {
        resolve(csvData.map(d => {
          d.color = d.type;
          d.value = +d.value;
          return d;
        }));
      });
    });
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }
}
