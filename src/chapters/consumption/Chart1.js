import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import PieChart from '../../charts/PieChart';

export default class Chart1 extends PieChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.figurePrefix = 'consumption-inset1';
    this.legendItems = [
      { label: this.getTranslation('Low HDI'), value: 'Low' },
      { label: this.getTranslation('Medium HDI'), value: 'Medium' },
      { label: this.getTranslation('High HDI'), value: 'High' },
      { label: this.getTranslation('Very High HDI'), value: 'Very high' },
    ];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/consumption-1.csv', (csvData) => {
        resolve(csvData.map(d => {
          d.color = d['HDI'];
          d.label = d['location'];
          d.value = +d['Consumption'];
          return d;
        }));
      });
    });
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }
}
