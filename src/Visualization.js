import { select } from 'd3-selection';
import i18next from 'i18next';

export default class Visualization {
  constructor(parent, options) {
    this.width = options.width;
    this.height = options.height;
    this.parent = select(parent);

    if (options.aspect) {
      this.parent
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${this.width} ${this.height}`);

      // Cribbed from https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js#25978286

      const parentContainer = select(this.parent.node().parentNode);
      parentContainer
        .style('padding-bottom', (d) => {
          // TODO handle when width not set as %
          const paddingBottom = parseFloat(parentContainer.style('width'), 10) * (options.aspect[1] / options.aspect[0]) + '%';
          return paddingBottom;
        });
    }
    else {
      this.parent
        .attr('height', this.height)
        .attr('width', this.width);
    }

    this.baseDataUrl = options.baseDataUrl || '/';
    if (this.baseDataUrl.charAt(this.baseDataUrl.length - 1) !== '/') {
      this.baseDataUrl += '/';
    }

    this.dataOverrideUrl = options.dataOverrideUrl;
  }

  getTranslation(text) {
    if (!text || text === '') return text;
    return i18next.t(`${this.figurePrefix}.${text}`, text);
  }

  dataFileUrl(filename) {
    if (this.dataOverrideUrl) return this.dataOverrideUrl;
    return this.baseDataUrl + filename;
  }

  renderFilters() {
    if (!this.filters) return;

    const parentContainer = select(this.parent.node().parentNode);
    this.filtersContainer = parentContainer.append('div')
      .classed('visualization-filters', true);

    this.filtersContainer.append('span').text(this.getTranslation('Filters:'));

    const filterButtons = this.filtersContainer
      .append('div').classed('filter-button-group', true)
      .selectAll('button')
      .data(this.filters)
      .enter().append('button');

    filterButtons
      .text(d => d.label)
      .on('click', (d) => this.updateFilters(d));

    // On init select initial key
    this.updateFilters(this.filters[this.initialFilterIndex]);
  }
}
