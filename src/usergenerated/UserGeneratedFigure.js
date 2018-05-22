import { select } from 'd3-selection';

import UserGeneratedBarChart from './UserGeneratedBarChart';
import UserGeneratedChoroplethMap from './UserGeneratedChoroplethMap';
import UserGeneratedLineChart from './UserGeneratedLineChart';
import UserGeneratedPointMap from './UserGeneratedPointMap';

const visualizationTypes = {
  'bar chart': UserGeneratedBarChart,
  'choropleth map': UserGeneratedChoroplethMap,
  'line chart': UserGeneratedLineChart,
  'point map': UserGeneratedPointMap,
};

export default class UserGeneratedFigure {
  constructor(parent, options) {
    this.options = options;
    new visualizationTypes[options.visualizationType](parent, options);
  }
}
