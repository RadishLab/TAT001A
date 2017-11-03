import { Chart1 } from './Chart1';
import { Chart3 } from './Chart3';
import { Chart4 } from './Chart4';
import Map from './Map';

export const figures = [
  {
    name: 'map',
    figureClass: Map,
    type: 'map'
  },
  {
    name: 'inset1',
    figureClass: Chart1,
    type: 'chart'
  },
  {
    name: 'inset3',
    figureClass: Chart3,
    type: 'chart'
  },
  {
    name: 'inset4',
    figureClass: Chart4,
    type: 'chart'
  }
];
