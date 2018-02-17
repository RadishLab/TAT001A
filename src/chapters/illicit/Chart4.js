import { sum } from 'd3-array';
import { format } from 'd3-format';
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
        const mappedData = csvData.map(d => {
          d.color = d.type;
          d.value = +d.value;
          return d;
        });

        this.total = sum(mappedData, d => d.value);

        resolve(mappedData.map(d => {
          d.percent = d.value / this.total;
          return d;
        }));
      });
    });
  }

  createZScale() {
    return scaleOrdinal(schemeCategoryProblem);
  }

  tooltipContent(d) {
    const percentFormat = format('.1%');
    const cigaretteFormat = format(',d');
    let content = `<div class="header">${d.data.type}</div>`;
    content += `<div>${percentFormat(d.data.percent)} ${this.getTranslation('of cigarettes')}</div>`;
    content += `<div>${cigaretteFormat(d.data.value)} ${this.getTranslation('cigarettes')}</div>`;
    return content;
  }
}
