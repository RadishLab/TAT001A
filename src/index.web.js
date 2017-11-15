import { select } from 'd3-selection';

import figures from './chapters/Figures';

const prefix = 'ta-visualization';

/*
 * Index for web version of visualizations. Bundles together all of the figures
 * and initializes them if it finds the appropriate element on the page.
 */
Object.keys(figures).forEach(key => {
  const visualizationRoot = select(`#${prefix}-${key}`);
  if (visualizationRoot.node()) {
    const figureClass = figures[key].figureClass;
    new figureClass(
      visualizationRoot.node(),
      visualizationRoot.attr('width'),
      visualizationRoot.attr('height')
    );
  }
});
