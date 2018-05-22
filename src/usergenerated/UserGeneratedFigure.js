import { select } from 'd3-selection';

import UserGeneratedBarChart from './UserGeneratedBarChart';
import UserGeneratedCategoryMap from './UserGeneratedCategoryMap';
import UserGeneratedChoroplethMap from './UserGeneratedChoroplethMap';
import UserGeneratedLineChart from './UserGeneratedLineChart';
import UserGeneratedPointMap from './UserGeneratedPointMap';

const visualizationTypes = {
  'bar chart': UserGeneratedBarChart,
  'category map': UserGeneratedCategoryMap,
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
