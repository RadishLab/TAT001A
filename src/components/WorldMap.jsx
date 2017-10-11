import { json as d3json } from 'd3-request';
import React, { Component } from 'react';
import * as topojson from 'topojson-client';

import { loadCachedData } from '../dataService';
import World from '../maps/World';

class WorldMap extends Component {
  componentWillMount() {
    this.loadJoinData();
    this.loadCountries();
  }

  componentWillUpdate(nextProps, nextState) {
    const { countries, joinData, joinedData } = nextState;
    if (countries && joinData && !joinedData) {
      const joinedData = this.join(countries, joinData);
      this.setState({ joinedData }, () => {
        this.svgRoot = new World(this.svgRoot, joinedData);
      });
    }
  }

  loadCountries() {
    loadCachedData(d3json, 'countries-dots.topojson', (data) => {
      const countriesGeojson = topojson.feature(data, data.objects['-']);
      this.setState({ countries: countriesGeojson });
    });
  }

  render() {
    return (
      <div className="world-map">
        <svg
          ref={(svg) => { this.svgRoot = svg; }}
          style={{ height: `${this.props.height}px`, width: `${this.props.width}` }}
          width={this.props.width}
          height={this.props.height}
        ></svg>
      </div>
    );
  }
}

export default WorldMap;
