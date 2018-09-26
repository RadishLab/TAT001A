import { csv } from 'd3-request';
import { select } from 'd3-selection';
import i18next from 'i18next';

import { isIE } from './common/browsers';

const languageShortNames = {
  arabic: 'ar',
  chinese: 'zh',
  english: 'en',
  portuguese: 'pt',
  spanish: 'es'
};

export default class Visualization {
  constructor(parent, options) {
    this.options = options;
    this.width = options.width;
    this.height = options.height;
    this.parent = select(parent);
    this.parentContainer = select(this.parent.node().parentNode);

    this.dataLoaded = false;

    if (this.options.language && this.options.translationUrl) {
      if (languageShortNames[this.options.language]) {
        this.options.language = languageShortNames[this.options.language];
      }

      this.translationsLoaded = false;
      this.loadTranslations(this.options.translationUrl);
      i18next.changeLanguage(this.options.language);
    }
    else {
      this.translationsLoaded = true;
    }

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

      // IE isn't great at scaling SVGs, let's do it manually
      if (isIE()) {
        this.parent
          .style('height', `${this.height}px`)
          .style('max-width', '100%');

        select(window)
          .on('resize', () => {
            const newHeight = this.parent.node().clientWidth * (options.aspect[1] / options.aspect[0]);
            this.parent
              .style('height', `${newHeight}px`);
          });
      }
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

  loadTranslations(url) {
    csv(url, translations => {
      const bundles = {};

      translations.forEach(translation => {
        Object.keys(languageShortNames).forEach(language => {
          const translatedPhrase = translation[language];
          if (translatedPhrase) {
            if (!bundles[languageShortNames[language]]) {
              bundles[languageShortNames[language]] = {};
            }
            bundles[languageShortNames[language]][`${translation.figure}|${translation.english.replace(/\./g, '-')}`] = translatedPhrase;
          }
        });
      });

      Object.keys(languageShortNames).forEach(language => {
        i18next.addResourceBundle(languageShortNames[language], 'tat', bundles[languageShortNames[language]]);
      });
      i18next.setDefaultNamespace('tat');
      this.onTranslationsLoaded();
    });
  }

  getFigurePrefix() {
    return this.figurePrefix;
  }

  onDataLoaded() {
    this.dataLoaded = true;
  }

  onTranslationsLoaded() {
    this.translationsLoaded = true;
  }

  getTranslation(text, defaultPrefix) {
    let prefix = this.getFigurePrefix();
    if (prefix === undefined && defaultPrefix) {
      prefix = defaultPrefix;
    }
    if (!text || text === '' || !text.replace) return text;
    return i18next.t(`${prefix}|${text.replace(/\./g, '-')}`, text);
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

  positionTooltip(x, y) {
    let tooltipY = y - 10;
    let tooltipX = x + 20;

    const tooltipHeight = this.tooltip.node().offsetHeight;
    const tooltipWidth = this.tooltip.node().offsetWidth;

    if (tooltipY < 0) tooltipY = 0;
    if (tooltipY + tooltipHeight > this.height) {
      tooltipY = this.height - tooltipHeight - 25;
    }
    this.tooltip
      .style('top', `${tooltipY}px`);

    if (tooltipX + tooltipWidth < this.width) {
      this.tooltip
        .style('right', 'inherit')
        .style('left', `${tooltipX}px`);
    }
    else {
      this.tooltip
        .style('left', 'inherit')
        .style('right', `${this.width - x + 20}px`);
    }
  }
}
