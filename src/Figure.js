import React, { Component } from 'react';

const widths = {
  wide: 340,
  narrow: 188,
  'chart-pie': 200,
  'chart-vertical': 178,
  map: 500,
  'map-europe': 250
};

const heights = {
  wide: 178,
  narrow: 158,
  'chart-pie': 250,
  'chart-vertical': 340,
  map: 300,
  'map-europe': 300
};

export default class Figure extends Component {
  componentDidMount() {
    const { figureClass, size, dimensions } = this.props;
    let width, height;
    if (dimensions) {
      [width, height] = dimensions;
    } else {
      width = widths[size];
      height = heights[size];
    }
    new figureClass(this.svg, { width, height });
  }

  render() {
    const { id } = this.props;
    return (
      <svg id={id} ref={(svg) => this.svg = svg}></svg>
    );
  }
}
