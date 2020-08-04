import { Chart1 } from './Chart1';
import { Chart2 } from './Chart2';
import { Chart3 } from './Chart3';
import { Chart4 } from './Chart4';
import Map from './Map';
import Map2 from './Map2';
import Map2Cartogram from './Map2Cartogram';

export const figures = [
  {
    name: 'map',
    figureClass: Map,
    type: 'map'
  },
  {
    name: 'map2',
    figureClass: Map2,
    type: 'map'
  },
  {
    name: 'map2cartogram',
    figureClass: Map2Cartogram,
    type: 'map'
  },
  {
    name: '1',
    figureClass: Chart1,
    type: 'chart'
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
  },
  {
    name: '4',
    figureClass: Chart4,
    type: 'chart'
  }
];
