import { select } from 'd3-selection';

import UserGeneratedBarChart from './UserGeneratedBarChart';
import UserGeneratedLineChart from './UserGeneratedLineChart';

const visualizationTypes = {
  'bar chart': UserGeneratedBarChart,
  'line chart': UserGeneratedLineChart,
};

export default class UserGeneratedFigure {
  constructor(parent, options) {
    this.options = options;
    new visualizationTypes[options.visualizationType](parent, options);
  }
}
