import React, { Component } from 'react';

import './App.css';
import LineChart from './charts/LineChart';
import GrowingMap from './components/GrowingMap';

class App extends Component {
  componentDidMount() {
    this.line = new LineChart(this.svgRootLine, 600, 1000);
    this.lineSmall = new LineChart(this.svgRootLineSmall, 400, 600);
  }

  render() {
    return (
      <div className="App">
        <GrowingMap height={600} width={1000} />
        <svg id='1-inset1' ref={(svg) => { this.svgRootLine = svg; }} style={{ height: '600px', width: '1000px' }} width='1000' height='600'></svg>
        <svg id='1-inset1-small' ref={(svg) => { this.svgRootLineSmall = svg; }} width='600' height='400'></svg>
      </div>
    );
  }
}

export default App;
