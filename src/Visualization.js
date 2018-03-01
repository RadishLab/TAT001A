import { select } from 'd3-selection';
import i18next from 'i18next';

export default class Visualization {
  constructor(parent, options) {
    this.options = options;
    this.width = options.width;
    this.height = options.height;
    this.parent = select(parent);
    this.parentContainer = select(this.parent.node().parentNode);

    const parentContainerWidth = this.parentContainer.node().getBoundingClientRect().width;
    this.widthCategory = 'large';
    if (parentContainerWidth < 400) {
      this.widthCategory = 'narrowest';
    }
    else if (parentContainerWidth < 650) {
      this.widthCategory = 'narrow';
    }
    this.parentContainer.classed(`ta-visualization-${this.widthCategory}`, true);

    if (options.aspect) {
      this.parent
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${this.width} ${this.height}`);
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

    this.tooltip = this.parentContainer.append('div')
      .classed('ta-visualization-tooltip', true)
      .on('mouseover', () => this.tooltip.classed('visible', true))
      .on('mouseleave', () => this.tooltip.classed('visible', false));
    this.parentContainer
      .on('mouseleave', () => this.tooltip.classed('visible', false));

    this.textColors = {
      lightBackground: '#2d2d2d',
      darkBackground: '#e8e8e8'
    };
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

    this.filtersContainer = this.parentContainer.append('div')
      .classed('ta-visualization-filters', true)
      .lower();

    this.filtersContainer.append('span').text(this.getTranslation('Filters:'));

    this.filters.forEach(filter => {
      const filterValues = filter.values.map(f => ({ ...f, ...{ group: filter.group } }));
      const filterButtons = this.filtersContainer
        .append('div').classed('filter-button-group', true)
        .selectAll('button')
        .data(filterValues)
        .enter().append('button');

      filterButtons
        .text(d => d.label)
        .on('click', (d) => this.updateFilters({
          [filter.group]: d.value
        }));
    });

    // On init select initial key
    this.updateFilters(this.filterState);
  }
}
