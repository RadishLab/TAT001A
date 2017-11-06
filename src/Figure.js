import React, { Component } from 'react';

const widths = {
  wide: 340,
  narrow: 188,
  map: 500
};

const heights = {
  wide: 178,
  narrow: 158,
  map: 300
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