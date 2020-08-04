import Map from './Map';
import MapTreemap from './MapTreemap';
import Chart1 from './Chart1';
import Chart2 from './Chart2';
import Chart3 from './Chart3';

export const figures = [
  {
    name: 'map',
    figureClass: Map,
    type: 'map'
  },
  {
    name: 'maptreemap',
    figureClass: MapTreemap,
    type: 'map'
  },
  {
    name: '1',
    figureClass: Chart1,
    type: 'chart-pie'
  },
  {
    name: '2',
    figureClass: Chart2,
    type: 'chart'
  },
  {
    name: '3',
    figureClass: Chart3,
    type: 'chart'
  }
];
