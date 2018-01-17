import Chart1 from './Chart1';
import Chart2 from './Chart2';
import Map from './Map';

export const figures = [
  {
    name: 'map',
    figureClass: Map,
    type: 'map'
  },
  {
    dimensions: [500, 190],
    name: 'inset1',
    figureClass: Chart1,
    type: 'chart'
  },
  {
    name: 'inset2',
    figureClass: Chart2,
    type: 'chart'
  }
];
