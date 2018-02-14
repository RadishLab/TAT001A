import { select } from 'd3-selection';
import i18next from 'i18next';

import figures from './chapters/Figures';

const prefix = 'ta-visualization';

/*
 * Index for web version of visualizations. Bundles together all of the figures
 * and initializes them if it finds the appropriate element on the page.
 */

function initializeTranslations() {
  i18next.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: {
        translation: {}
      }
    }
  });
}

function createOptions(containerNode) {
  const options = { web: true };

  // Collect data- attributes
  const containerDataset = containerNode.dataset;
  for (const key in containerDataset) {
    options[key] = containerDataset[key];
  }

  // Add dimensions
  const width = containerNode.offsetWidth;
  let height = containerNode.offsetHeight;
  if (options.aspect) {
    options.aspect = JSON.parse(options.aspect);
    height = width * (options.aspect[1] / options.aspect[0]);
  }
  options.width = width;
  options.height = height;

  if (options.legend) {
    options.legend = JSON.parse(options.legend);
  }

  return options;
}

function initializeVisualizations() {
  Object.keys(figures).forEach(key => {
    const container = select(`#${prefix}-${key}`);
    if (container.empty()) return;

    container.classed('ta-visualization ta-visualization-standalone', true);
    const figureClass = figures[key].figureClass;
    new figureClass(container.append('svg').node(), createOptions(container.node()));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initializeTranslations();
  initializeVisualizations();
});
