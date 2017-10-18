import React, { Component } from 'react';

import Chart1 from './chapters/ch1/Chart1';
import Map1 from './chapters/ch1/Map1';

class App extends Component {
  componentDidMount() {
    new Map1(this.svgRootMap, 1000, 600);
    this.lineSmall = new Chart1(this.svgRootLineSmall, 340, 178);
    this.lineSmaller = new Chart1(this.svgRootLineSmaller, 188, 158);
  }

  render() {
    return (
      <div className="app">
        <svg id='1-map' ref={(svg) => { this.svgRootMap = svg; }}></svg>
        <svg id='1-inset1-wide' ref={(svg) => { this.svgRootLineSmall = svg; }}></svg>
        <svg id='1-inset1-narrow' ref={(svg) => { this.svgRootLineSmaller = svg; }}></svg>
      </div>
    );
  }
}

export default App;
