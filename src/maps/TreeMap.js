import { max } from 'd3-array';
import { hierarchy, treemap, treemapBinary } from 'd3-hierarchy';
import { event as currentEvent, select, selectAll } from 'd3-selection';

import WorldMap from './WorldMap';

/*
 * Resize labels to fit within the rectangles they are attached to.
 */
const resizeLabel = (selection, minSize, maxSize) => {
  selection.each((d, i, nodes) => {
    const label = select(nodes[i]);
    const labelParent = select(nodes[i].parentNode);
    let currentFontSize = parseInt(label.style('font-size'), 10);

    const virtualLabel = select(nodes[i].cloneNode(true))
      .attr('opacity', 0)
      .classed('virtual', true);
    labelParent.insert(() => virtualLabel.node());

    while (currentFontSize <= maxSize) {
      const labelRect = virtualLabel.node().getBBox();
      if (labelRect.width < Math.abs(d.x0 - d.x1) &&
        labelRect.height < Math.abs(d.y0 - d.y1)) {
        currentFontSize += 1;
        virtualLabel.style('font-size', currentFontSize);
      }
      else {
        break;
      }
    }

    while (currentFontSize > minSize) {
      const labelRect = virtualLabel.node().getBBox();
      if (labelRect.width > Math.abs(d.x0 - d.x1) ||
        labelRect.height > Math.abs(d.y0 - d.y1)) {
        currentFontSize -= 1;
        virtualLabel.style('font-size', currentFontSize);
      }
      else {
        break;
      }
    }

    label
      .style('font-size', currentFontSize)
      .classed('hidden', () => currentFontSize < minSize +1);

    labelParent.selectAll('.virtual').remove();
  });
};

export default class TreeMap extends WorldMap {
  constructor(parent, options) {
    super(parent, options);
    this.parent
      .classed('treemap-chart', true);
    this.root = this.parent.append('g');
    this.mouseoverStroke = '#555';
    this.defaultStroke = 'none';

    this.treemapMargin = { left: 60, top: 100, right: 220 };

    this.treemapGenerator = treemap()
      .size([
        this.width - this.treemapMargin.left - this.treemapMargin.right,
        this.height - this.treemapMargin.top
      ])
      .tile(treemapBinary)
      .padding(0)
      .round(true)

    this.loadData();
  }

  loadData() {
    return Promise.all([this.loadCountries(), this.loadJoinData()])
      .then(([countries, joinData]) => {
        this.countriesGeojson = this.join(
          this.getDistinctCountries(countries),
          joinData
        );

        this.maxValue = max(this.countriesGeojson.features, d => d.properties.joined ? parseFloat(d.properties.joined[this.valueField]) : undefined);
        this.render();
      });
  }

  /*
   * Get distinct countries by ISO3. There are some duplicate ISO3 values in the
   * map data that we don't want to appear multiple times in the treemap.
   */
  getDistinctCountries(countriesGeojson) {
    const excludedCountryNames = [
      'Arunachal Pradesh'
    ];

    const featuresHash = {};
    countriesGeojson.features.forEach(f => {
      if (excludedCountryNames.indexOf(f.properties.NAME) >= 0) return;
      featuresHash[this.getISO3(f)] = f;
    });
    return {
      ...countriesGeojson,
      features: Object.values(featuresHash)
    };
  }

  onTranslationsLoaded() {
    super.onTranslationsLoaded();
    if (this.dataLoaded) {
      this.render();
    }
  }

  getCountryName(d) {
    return this.getTranslation(d.data.name, 'WorldMap', 'WorldMap');
  }

  renderTreeSegments() {
    this.countries = this.root.selectAll('.leaf-container')
      .data([true])
      .join(enter => (
        enter
          .append('g')
          .classed('leaf-container', true)
          .attr('transform', `translate(${this.treemapMargin.left}, ${this.treemapMargin.top})`)
      ));

    const countriesHierarchy = hierarchy({
      children: (
        this.countriesGeojson.features
          .map(f => {
            let value;
            let keycode = 0;

            if (f.properties.joined && f.properties.joined.length) {
              const yearData = f.properties.joined
                .filter(row => row.year === this.filterState.year)[0];
              if (yearData) {
                value = yearData.value;
                keycode = yearData.keycode;
              }
            }
            else if (f.properties.joined) {
              value = f.properties.joined[this.valueField];
              keycode = f.properties.joined[this.keyCodeField];
            }

            return {
              joined: f.properties.joined,
              keycode,
              name: f.properties.NAME,
              value
            };
          })
          .filter(d => d.value > 0)
      )
    });
    countriesHierarchy
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    this.treemapGenerator(countriesHierarchy);

    this.countries.selectAll(".leaf")
      .data(countriesHierarchy.leaves(), d => d.data.name)
      .join(
        enter => {
          const leafGroup = enter.append("g").classed('leaf', true);
          const leafShape = leafGroup.append("rect").classed('leaf-shape', true);

          leafGroup
            .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

          const leafLabel = leafGroup
            .append('text')
            .classed('leaf-label', true)
            .attr('transform', d => {
              let x = (d.x1 - d.x0) / 2;
              let y = (d.y1 - d.y0) / 2;
              return `translate(${x}, ${y})`;
            });

          leafLabel.append('tspan')
            .classed('leaf-label-country', true)
            .text(d => this.getTranslation(d.data.name, 'WorldMap', 'WorldMap'));

          leafLabel.append('tspan')
            .classed('leaf-label-content', true)
            .text(this.leafContent)
            .attr('x', 0)
            .attr('dy', '1.1em');

          leafShape
            .attr("fill-opacity", 1)
            .attr("fill", d => this.colorScale(d.data.keycode))
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0);

          leafGroup
            .on('mouseover', (d, i, nodes) => {
              // Remove hover state on previous country
              selectAll('.country-hover')
                .classed('country-hover', false);

              const overCountry = select(nodes[i]);
              overCountry
                .classed('country-hover', true);
              overCountry.node().parentNode.appendChild(overCountry.node());

              if (this.tooltipContent) {
                let x = currentEvent.layerX,
                  y = currentEvent.layerY

                // If layerX or layerY not set, assume they're not supported, find
                // another way
                if (!x && !y) {
                  const rect = this.root.node().getBoundingClientRect();
                  x = currentEvent.clientX - rect.left;
                  y = currentEvent.clientY - rect.top;
                }

                this.tooltip
                  .html(this.tooltipContent(d))
                  .classed('visible', true);
                this.positionTooltip(x + 10, y + 10, this.width - this.treemapMargin.left - this.treemapMargin.right);
              }
            })
            .on('mouseout', this.onCountryMouseout.bind(this));

          leafGroup.selectAll('.leaf-label')
            .call(resizeLabel, 5, 15);

          return leafGroup;
        },
        update => {
          update
            .transition()
            .duration(500)
            .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

          update.select('.leaf-shape')
            .transition()
            .duration(500)
            .attr("fill", d => this.colorScale(d.data.keycode))
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0);

          update.select('.leaf-label')
            .call(resizeLabel, 5, 15)
            .transition()
            .duration(500)
            .attr('transform', d => {
              let x = (d.x1 - d.x0) / 2;
              let y = (d.y1 - d.y0) / 2;
              return `translate(${x}, ${y})`;
            });

          update.select('.leaf-label-content')
            .text(this.leafContent);
        }
      );

    let hiddenLabels = [...this.countries.selectAll('.leaf-label.hidden').data()];
    const availableHeight = this.height - (this.legendGroup.node().getBBox().height + 20);

    this.renderSmallCountryLabels(hiddenLabels);
    let smallCountriesHeight = this.smallCountries.node().getBBox().height;

    while (smallCountriesHeight > availableHeight) {
      hiddenLabels = hiddenLabels
        .sort((a, b) => a.value - b.value)
        .slice(0, -1);
      this.renderSmallCountryLabels(hiddenLabels);
      smallCountriesHeight = this.smallCountries.node().getBBox().height;
    }
  }

  renderSmallCountryLabels(labels) {
    const sortedLabels = labels
      .sort((a, b) => a.data.name.localeCompare(b.data.name))
      .filter(d => {
        const width = Math.abs(d.x0 - d.x1);
        const height = Math.abs(d.y0 - d.y1);
        return width < 10 || height < 10;
      })
      .map((d, i) => ({ ...d, i }))

    this.smallCountries = this.root.selectAll('.small-countries-container')
      .data([true])
      .join(enter => (
        enter
          .append('g')
          .classed('small-countries-container', true)
          .attr('transform', () => {
            const x = this.width - this.treemapMargin.right + 50;
            const y = this.legendGroup.node().getBBox().height + 20;
            return `translate(${x}, ${y})`
          })
      ));

    this.smallCountries.selectAll('.small-country')
      .data(sortedLabels, d => d.data.name)
      .join(
        enter => (
          enter
            .append('g')
            .attr('transform', d => `translate(0, ${d.i * 12})`)
            .classed('small-country', true)
            .append('text')
              .text(d => this.getTranslation(d.data.name, 'WorldMap', 'WorldMap'))
            .style('font-size', 12)
            .on('mouseenter', d => {
              this.countries.selectAll('.leaf')
                .filter(dLeaf => dLeaf.data.name === d.data.name)
                .attr('stroke', 'black')
              this.tooltip
                .html(this.tooltipContent(d))
                .classed('visible', true);

              this.positionTooltip(
                d.x1 + this.treemapMargin.left,
                d.y1 + this.treemapMargin.top,
                this.width - this.treemapMargin.left - this.treemapMargin.right
              );
            })
            .on('mouseleave', d => {
              this.countries.selectAll('.leaf').attr('stroke', null);
            })
        ),
        update => update.attr('transform', d => `translate(0, ${d.i * 12})`)
      );
  }

  render() {
    if (!this.legendGroup) {
      this.renderLegend();
    }
    this.renderTreeSegments();
  }

}
