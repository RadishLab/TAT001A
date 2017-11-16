import { max, min } from 'd3-array';
import { csv } from 'd3-request';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';

import { schemeCategorySolution } from '../../colors';
import BarChart from '../../charts/BarChart';
import wrap from '../../wrap';

export default class Chart1 extends BarChart {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.xLabel = 'Cause of Death';
    this.yLabel = 'Deaths (millions)';
    this.yTicks = 6;
    this.yAxisTickFormat = d => d / 1000000;
    this.legendItems = [
      { label: 'Not tobacco-related', value: 'other' },
      { label: 'Tobacco-related', value: 'tobacco' },
    ];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      csv('data/6-1.csv', (csvData) => {
        const mappedData = csvData.map(d => {
          d.tobaccoRelated = +d['tobacco-related'];
          d.notTobaccoRelated = +d['other'];
          d.otherTobaccoRelated = +d['other tobacco-related'];
          return d;
        });

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
    margin.bottom = 50;
    margin.right = 30;
    margin.top = 5;
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
    const barGroups = this.createBarGroups().filter(d => d.disease !== 'tobacco use');
    const barWidth = this.x.bandwidth();

    // TODO stack tobacco use deaths
    //  * aggregate tobacco use by disease, stack those

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(this.getXValue(d)))
        .attr('width', barWidth)
        .attr('y', d => this.y(d.notTobaccoRelated))
        .attr('height', d => this.chartHeight - this.y(d.notTobaccoRelated))
        .attr('fill', this.colors('other'));

    barGroups.append('rect')
        .classed('bar', true)
        .attr('x', d => this.x(this.getXValue(d)))
        .attr('width', barWidth)
        .attr('y', d => this.y(d.tobaccoRelated + d.notTobaccoRelated))
        .attr('height', d => this.chartHeight - this.y(d.tobaccoRelated))
        .attr('fill', this.colors('tobacco'));

    // Get tobacco use related deaths by disease
    const tobaccoUseDeaths = this.data.filter(d => d.disease !== '' && d.disease !== 'tobacco use');
    tobaccoUseDeaths.push({
      disease: 'other',
      tobaccoRelated: this.data.filter(d => d.disease === 'tobacco use')[0].otherTobaccoRelated
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
      .classed('bar', true)
      .attr('x', this.x('tobacco use'))
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
          [this.x('tobacco use') + 0.25, y],
          [this.x('tobacco use') + barWidth - 0.25, y]
        ]);
      });

    tobaccoUseDeathBars.append('text')
      .attr('dy', 0)
      .attr('transform', d => {
        const x = this.x('tobacco use') + barWidth + 2;
        let y = this.y(d.deathsUnder) - (this.chartHeight - this.y(d.tobaccoRelated)) / 2;
        if (d.disease === 'tuberculosis') {
          y += 1;
        }
        return `translate(${x}, ${y})`;
      })
      .attr('font-size', 4)
      .attr('fill', '#585857')
      .text(d => d.disease);

    tobaccoUseDeathBars.selectAll('text')
      .call(wrap, barWidth * 2);
  }

  createZScale() {
    return scaleOrdinal(schemeCategorySolution);
  }

  render() {
    super.render();
    this.parent.select('.legend')
      .attr('transform', () => {
        let xOffset = 15;
        let yOffset = this.chartHeight + 52;
        return `translate(${xOffset}, ${yOffset})`;
      });

    console.log(this.root.select('.axis-x').node().getBBox());
  }
}
