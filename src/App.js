import React, { Component } from 'react';

import Chart1 from './chapters/ch1/Chart1';
import Map1 from './chapters/ch1/Map1';

class App extends Component {
  componentDidMount() {
    new Map1(this.svgRootMap, 1000, 600);
    new Chart1(this.svgRootLineSmall, 340, 178);
    new Chart1(this.svgRootLineSmaller, 188, 158);
  }

  render() {
    return (
      <div>
        <section>
          <h1>Chapter 1</h1>
          <svg id='1-map' ref={(svg) => { this.svgRootMap = svg; }}></svg>
          <svg id='1-inset1-wide' ref={(svg) => { this.svgRootLineSmall = svg; }}></svg>
          <svg id='1-inset1-narrow' ref={(svg) => { this.svgRootLineSmaller = svg; }}></svg>
        </section>
      </div>
    );
  }
}

export default App;
