import { Chart1 } from './Chart1';
import { Chart2 } from './Chart2';
import { Chart3 } from './Chart3';
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
    name: 'inset2',
    figureClass: Chart2,
    type: 'chart'
  },
  {
    name: 'inset3',
    figureClass: Chart3,
    type: 'chart'
  }
];
