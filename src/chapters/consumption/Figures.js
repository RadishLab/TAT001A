import Map from './Map';
import Chart1 from './Chart1';
import Chart2 from './Chart2';

export const figures = [
  {
    name: 'map',
    figureClass: Map,
    type: 'map'
  },
  {
    name: 'inset1',
    figureClass: Chart1,
    type: 'chart-pie'
  },
  {
    name: 'inset2',
    figureClass: Chart2,
    type: 'chart'
  }
];
