import { max, min, sum } from 'd3-array';
import { format } from 'd3-format';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';
import { line } from 'd3-shape';

import BarChart from '../../charts/BarChart';
import { schemeCategoryProblem } from '../../colors';
import wrap from '../../wrap';

export default class Chart1 extends BarChart {
  constructor(parent, options) {
    super(parent, options);
    this.yTicks = 6;
    this.xAxisTickFormat = (d) => this.getTranslation(d);
    this.yAxisTickFormat = d => d / 1000000;
    this.xAxisTickRows = 3;
    if (this.widthCategory === 'narrowest') {
      this.xAxisTickRows = 3.5;
    }
  }

  getFigurePrefix() {
    return '6-1';
  }

  onTranslationsLoaded() {
    this.xLabel = this.getTranslation('Cause of Death');
    this.yLabel = this.getTranslation('Deaths (millions)');
    this.legendItems = [
      { label: this.getTranslation('Not tobacco-related'), value: 'other' },
      { label: this.getTranslation('Tobacco-related'), value: 'tobacco' },
    ];
    super.onTranslationsLoaded();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv(this.dataFileUrl('6-1.csv'), (csvData) => {
        const mappedData = csvData.map(d => {
          d.tobaccoRelated = +d['tobacco-related'];
          d.notTobaccoRelated = +d['other'];
          d.otherTobaccoRelated = +d['other tobacco-related'];
          d.deaths = d.tobaccoRelated + d.notTobaccoRelated;
          d.percentTobaccoRelated = d.tobaccoRelated / d.deaths;
          d.percentNotTobaccoRelated = 1 - d.percentTobaccoRelated;
          return d;
        });

        this.totalTobaccoRelated = sum(mappedData, d => d.tobaccoRelated + d.otherTobaccoRelated);

        // Pop tobacco use off, add an empty bar before it
        const tobaccoUse = mappedData.pop();
        mappedData.push({
          tobaccoRelated: 0,
          notTobaccoRelated: 0,
          otherTobaccoRelated: 0,
          disease: ''
        });
        mappedData.push(tobaccoUse);
        resolve(mappedData);
      });
    });
  }

  createMargin() {
    const margin = super.createMargin();
    margin.right = 30;
    margin.top = 5;

    if (this.options.web) {
      margin.top = 10;
    }
    if (this.widthCategory === 'narrowest') {
      margin.right = 0;
    }
    return margin;
  }

  createXScale() {
    const values = this.data.map(this.getXValue);
    return scaleBand()
      .range([0, this.chartWidth])
      .padding(0.5)
      .domain(values);
  }

  createYScale() {
    const values = this.data.map(d => d.tobaccoRelated + d.notTobaccoRelated + d.otherTobaccoRelated);
    const yExtent = [
      min(values.concat(0)),
      max(values)
    ];
    return scaleLinear()
      .range([this.chartHeight, 0])
      .domain(yExtent)
      .nice();
  }

  getXValue(d) {
    return d.disease;
  }

  renderBars() {
    const barGroups = this.createBarGroups().filter(d => d.disease !== 'Tobacco use');
    const barWidth = this.x.bandwidth();

    barGroups.append('rect')
        .classed('bar not-tobacco-related', true)
        .attr('x', d => this.x(this.getXValue(d)))
        .attr('width', barWidth)
        .attr('y', d => this.y(d.notTobaccoRelated))
        .attr('height', d => this.chartHeight - this.y(d.notTobaccoRelated))
        .attr('fill', this.colors('other'));

    barGroups.append('rect')
        .classed('bar tobacco-related', true)
        .attr('x', d => this.x(this.getXValue(d)))
        .attr('width', barWidth)
        .attr('y', d => this.y(d.tobaccoRelated + d.notTobaccoRelated))
        .attr('height', d => this.chartHeight - this.y(d.tobaccoRelated))
        .attr('fill', this.colors('tobacco'));

    // Get tobacco use related deaths by disease
    const tobaccoUseDeaths = this.data.filter(d => d.disease !== '' && d.disease !== 'Tobacco use');
    tobaccoUseDeaths.push({
      disease: 'Other',
      tobaccoRelated: this.data.filter(d => d.disease === 'Tobacco use')[0].otherTobaccoRelated
    });
    tobaccoUseDeaths.forEach((d, i) => {
      // Since we are stacking these vertically, find number of deaths that will
      // vertically be under each bar
      d.deathsUnder = 0;
      for (let j = i + 1; j < tobaccoUseDeaths.length; j++) {
        d.deathsUnder += tobaccoUseDeaths[j].tobaccoRelated;
      }
    });

    const tobaccoUseDeathBars = this.root.selectAll('.bar-tobacco-use')
      .data(tobaccoUseDeaths)
      .enter()
        .append('g')
        .classed('bar-tobacco-use', true);

    tobaccoUseDeathBars.append('rect')
      .classed('bar tobacco-use', true)
      .attr('x', this.x('Tobacco use'))
      .attr('width', barWidth)
      .attr('y', d => this.y(d.tobaccoRelated + d.deathsUnder))
      .attr('height', d => this.chartHeight - this.y(d.tobaccoRelated))
      .attr('fill', this.colors('tobacco'));

    const lineCreator = line();
    tobaccoUseDeathBars.filter(d => d.deathsUnder !== 0).append('path')
      .classed('line', true)
      .style('stroke', 'white')
      .style('stroke-width', 0.5)
      .attr('d', d => {
        const y = this.y(d.deathsUnder);
        return lineCreator([
          [this.x('Tobacco use') + 0.25, y],
          [this.x('Tobacco use') + barWidth - 0.25, y]
        ]);
      });

    if (!this.options.web) {
      tobaccoUseDeathBars.append('text')
        .attr('dy', 0)
        .attr('transform', d => {
          const x = this.x('Tobacco use') + barWidth + 2;
          let y = this.y(d.deathsUnder) - (this.chartHeight - this.y(d.tobaccoRelated)) / 2;
          if (d.disease === 'tuberculosis') {
            y += 1;
          }
          return `translate(${x}, ${y})`;
        })
        .attr('font-size', this.options.web ? 12 : 4)
        .attr('fill', '#585857')
        .text(d => this.getTranslation(d.disease));

      tobaccoUseDeathBars.selectAll('text')
        .call(wrap, barWidth * 2, this.rtl);
    }
  }

  createZScale() {
    return scaleOrdinal([schemeCategoryProblem[1], schemeCategoryProblem[0]])
      .domain(['other', 'tobacco']);
  }

  renderLinesBetweenBars() {
    const tobaccoLines = [];
    this.root.selectAll('.bar.tobacco-related').each(d => {
      if (d.disease) {
        tobaccoLines.push([
          {
            disease: d.disease,
            x: this.x(d.disease) + this.x.bandwidth(),
            y: this.y(d.notTobaccoRelated + d.tobaccoRelated / 2)
          },
          {
            disease: d.disease,
            x: this.x('Tobacco use'),
            y: this.y(d.tobaccoRelated + d.deathsUnder - (d.tobaccoRelated / 2))
          }
        ]);
      }
    });

    const lineCreator = line()
      .x(d => d.x)
      .y(d => d.y);

    const lineGroup = this.root.append('g').classed('tobacco-death-lines', true);
    lineGroup.selectAll('.line')
      .data(tobaccoLines).enter().append('path')
      .classed('line', true)
      .style('stroke', this.colors('tobacco'))
      .style('stroke-width', 1)
      .attr('d', lineCreator);
  }

  onMouseOverBar(d, bar) {
    super.onMouseOverBar(d, bar);

    if (bar.classed('tobacco-related') || bar.classed('tobacco-use')) {
      this.root.selectAll('.tobacco-death-lines .line')
        .style('opacity', d => d[0].disease === bar.data()[0].disease ? 1 : 0.2);
    }
  }

  onMouseOutBar(d, bar) {
    super.onMouseOutBar(d, bar);
    this.root.selectAll('.tobacco-death-lines .line')
      .style('opacity', 1);
  }

  render() {
    super.render();

    if (this.options.web) {
      this.renderLinesBetweenBars();
    }

    const yOffset = this.root.node().getBoundingClientRect().height + this.margin.top + 10;
    this.parent.select('.legend')
      .attr('transform', () => {
        let xOffset = 15;
        return `translate(${xOffset}, ${yOffset})`;
      });
  }

  tooltipContent(d, bar) {
    let content = `<div class="header">${this.getTranslation(d.disease)}</div>`;
    const deathsFormat = format(',d');
    const percentFormat = format('.1%');

    if (!bar.classed('tobacco-use')) {
      content += `<div class="data">${this.getTranslation('Deaths')}: ${deathsFormat(d.deaths)}</div>`;
    }
    if (bar.classed('tobacco-related')) {
      content += `<div class="data">${this.getTranslation('Tobacco-related')}: ${deathsFormat(d.tobaccoRelated)} (${percentFormat(d.percentTobaccoRelated)})</div>`;
    }
    if (bar.classed('not-tobacco-related')) {
      content += `<div class="data">${this.getTranslation('Not tobacco-related')}: ${deathsFormat(d.notTobaccoRelated)} (${percentFormat(d.percentNotTobaccoRelated)})</div>`;
    }
    if (bar.classed('tobacco-use')) {
      content += `<div class="data">${this.getTranslation('Deaths')}: ${deathsFormat(d.tobaccoRelated)}</div>`;
      content += `<div class="data">${percentFormat(d.tobaccoRelated / this.totalTobaccoRelated)} ${this.getTranslation('of tobacco-related deaths')}</div>`;
    }
    return content;
  }
}
