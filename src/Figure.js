import React, { Component } from 'react';

const widths = {
  wide: 340,
  narrow: 188,
  'chart-vertical': 178,
  map: 500,
  'map-europe': 250
};

const heights = {
  wide: 178,
  narrow: 158,
  'chart-vertical': 340,
  map: 300,
  'map-europe': 300
};

export default class Figure extends Component {
  componentDidMount() {
    const { figureClass, size } = this.props;
    new figureClass(this.svg, widths[size], heights[size]);
  }

  render() {
    const { id } = this.props;
    return (
      <svg id={id} ref={(svg) => this.svg = svg}></svg>
    );
  }
}
