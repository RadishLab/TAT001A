import React, { Component } from 'react';

import Chart1 from './chapters/ch1/Chart1';
import GrowingMap from './components/GrowingMap';

class App extends Component {
  componentDidMount() {
    this.line = new Chart1(this.svgRootLine, 600, 1000);
    this.lineSmall = new Chart1(this.svgRootLineSmall, 400, 600);
    this.lineSmaller = new Chart1(this.svgRootLineSmaller, 200, 300);
  }

  render() {
    return (
      <div className="App">
        <GrowingMap height={600} width={1000} />
        <svg id='1-inset1' ref={(svg) => { this.svgRootLine = svg; }} style={{ height: '600px', width: '1000px' }} width='1000' height='600'></svg>
        <svg id='1-inset1-small' ref={(svg) => { this.svgRootLineSmall = svg; }} width='600' height='400'></svg>
        <svg id='1-inset1-smaller' ref={(svg) => { this.svgRootLineSmaller = svg; }} width='300' height='200'></svg>
      </div>
    );
  }
}

export default App;
