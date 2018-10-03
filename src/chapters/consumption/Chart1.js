import { sum } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleOrdinal } from 'd3-scale';

import { schemeCategoryProblem } from '../../colors';
import PieChart from '../../charts/PieChart';

export default class Chart1 extends PieChart {
  getFigurePrefix() {
    return 'consumption-1';
  }

  onTranslationsLoaded() {
    this.legendItems = [
      { label: this.getTranslation('Low HDI'), value: 'Low' },
      { label: this.getTranslation('Medium HDI'), value: 'Medium' },
      { label: this.getTranslation('High HDI'), value: 'High' },
      { label: this.getTranslation('Very High HDI'), value: 'Very high' },
    ];
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('consumption-1.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d.color = d['HDI'];
          d.value = +d['Consumption'];
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
    let content = `<div class="header">${this.getTranslation(d.data.location)}</div>`;
    content += `<div>${this.getTranslation(d.data.HDI + ' HDI')}</div>`;
    content += `<div>${percentFormat(d.data.percent)} ${this.getTranslation('of cigarettes')}</div>`;
    content += `<div>${cigaretteFormat(d.data.value)} ${this.getTranslation('cigarettes')}</div>`;
    return content;
  }
}
