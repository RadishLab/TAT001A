import React, { Component } from 'react';

import Chart1 from './chapters/ch1/Chart1';
import { Chart1 as Ch4Chart1 } from './chapters/ch4/Chart1';
import { Chart3 as Ch4Chart3 } from './chapters/ch4/Chart3';
import { Chart4 as Ch4Chart4 } from './chapters/ch4/Chart4';
import { Chart1 as Ch8Chart1 } from './chapters/ch8/Chart1';
import { Chart2 as Ch8Chart2 } from './chapters/ch8/Chart2';
import { Chart3 as Ch8Chart3 } from './chapters/ch8/Chart3';
import { Chart4 as Ch8Chart4 } from './chapters/ch8/Chart4';
import Map1 from './chapters/ch1/Map1';
import Map9 from './chapters/ch9/Map9';
import { Chart1 as Ch9Chart1 } from './chapters/ch9/Chart1';
import { Chart2 as Ch9Chart2 } from './chapters/ch9/Chart2';
import { Chart3 as Ch9Chart3 } from './chapters/ch9/Chart3';

class App extends Component {
  componentDidMount() {
    const mapWidth = 500;
    const mapHeight = 300;
    const wideChartWidth = 340;
    const wideChartHeight = 178;
    const narrowChartWidth = 188;
    const narrowChartHeight = 158;

    new Map1(this.svg1map, mapWidth, mapHeight);
    new Chart1(this.svg1inset1wide, wideChartWidth, wideChartHeight);
    new Chart1(this.svg1inset1narrow, narrowChartWidth, narrowChartHeight);

    new Ch4Chart1(this.svg4inset1wide, wideChartWidth, wideChartHeight);
    new Ch4Chart1(this.svg4inset1narrow, narrowChartWidth, narrowChartHeight);
    new Ch4Chart3(this.svg4inset3wide, wideChartWidth, wideChartHeight);
    new Ch4Chart3(this.svg4inset3narrow, narrowChartWidth, narrowChartHeight);
    new Ch4Chart4(this.svg4inset4wide, wideChartWidth, wideChartHeight);
    new Ch4Chart4(this.svg4inset4narrow, narrowChartWidth, narrowChartHeight);

    new Ch8Chart1(this.svg8inset1wide, wideChartWidth, wideChartHeight);
    new Ch8Chart1(this.svg8inset1narrow, narrowChartWidth, narrowChartHeight);
    new Ch8Chart2(this.svg8inset2wide, wideChartWidth, wideChartHeight);
    new Ch8Chart2(this.svg8inset2narrow, narrowChartWidth, narrowChartHeight);
    new Ch8Chart3(this.svg8inset3wide, wideChartWidth, wideChartHeight);
    new Ch8Chart3(this.svg8inset3narrow, narrowChartWidth, narrowChartHeight);
    new Ch8Chart4(this.svg8inset4wide, wideChartWidth, wideChartHeight);
    new Ch8Chart4(this.svg8inset4narrow, narrowChartWidth, narrowChartHeight);

    new Map9(this.svg9map, mapWidth, mapHeight);
    new Ch9Chart1(this.svg9inset1wide, wideChartWidth, wideChartHeight);
    new Ch9Chart1(this.svg9inset1narrow, narrowChartWidth, narrowChartHeight);
    new Ch9Chart2(this.svg9inset2wide, wideChartWidth, wideChartHeight);
    new Ch9Chart2(this.svg9inset2narrow, narrowChartWidth, narrowChartHeight);
    new Ch9Chart3(this.svg9inset3wide, wideChartWidth, wideChartHeight);
    new Ch9Chart3(this.svg9inset3narrow, narrowChartWidth, narrowChartHeight);
  }

  render() {
    return (
      <div>
        <section>
          <h1>Chapter 1</h1>
          <svg id='1-map' ref={(svg) => { this.svg1map = svg; }}></svg>
          <svg id='1-inset1-wide' ref={(svg) => { this.svg1inset1wide = svg; }}></svg>
          <svg id='1-inset1-narrow' ref={(svg) => { this.svg1inset1narrow = svg; }}></svg>
        </section>
        <section>
          <h1>Chapter 4</h1>
          <svg id='4-inset1-wide' ref={(svg) => { this.svg4inset1wide = svg; }}></svg>
          <svg id='4-inset1-narrow' ref={(svg) => { this.svg4inset1narrow = svg; }}></svg>
          <svg id='4-inset3-wide' ref={(svg) => { this.svg4inset3wide = svg; }}></svg>
          <svg id='4-inset3-narrow' ref={(svg) => { this.svg4inset3narrow = svg; }}></svg>
          <svg id='4-inset4-wide' ref={(svg) => { this.svg4inset4wide = svg; }}></svg>
          <svg id='4-inset4-narrow' ref={(svg) => { this.svg4inset4narrow = svg; }}></svg>
        </section>
        <section>
          <h1>Chapter 8</h1>
          <svg id='8-inset1-wide' ref={(svg) => { this.svg8inset1wide = svg; }}></svg>
          <svg id='8-inset1-narrow' ref={(svg) => { this.svg8inset1narrow = svg; }}></svg>
          <svg id='8-inset2-wide' ref={(svg) => { this.svg8inset2wide = svg; }}></svg>
          <svg id='8-inset2-narrow' ref={(svg) => { this.svg8inset2narrow = svg; }}></svg>
          <svg id='8-inset3-wide' ref={(svg) => { this.svg8inset3wide = svg; }}></svg>
          <svg id='8-inset3-narrow' ref={(svg) => { this.svg8inset3narrow = svg; }}></svg>
          <svg id='8-inset4-wide' ref={(svg) => { this.svg8inset4wide = svg; }}></svg>
          <svg id='8-inset4-narrow' ref={(svg) => { this.svg8inset4narrow = svg; }}></svg>
        </section>
        <section>
          <h1>Chapter 9</h1>
          <svg id='9-map' ref={(svg) => { this.svg9map = svg; }}></svg>
          <svg id='9-inset1-wide' ref={(svg) => { this.svg9inset1wide = svg; }}></svg>
          <svg id='9-inset1-narrow' ref={(svg) => { this.svg9inset1narrow = svg; }}></svg>
          <svg id='9-inset2-wide' ref={(svg) => { this.svg9inset2wide = svg; }}></svg>
          <svg id='9-inset2-narrow' ref={(svg) => { this.svg9inset2narrow = svg; }}></svg>
          <svg id='9-inset3-wide' ref={(svg) => { this.svg9inset3wide = svg; }}></svg>
          <svg id='9-inset3-narrow' ref={(svg) => { this.svg9inset3narrow = svg; }}></svg>
        </section>
      </div>
    );
  }
}

export default App;
