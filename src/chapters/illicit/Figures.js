import Chart1 from './Chart1';
import Chart2 from './Chart2';
import Map from './Map';
import Chart4 from './Chart4';

export const figures = [
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
    name: 'map',
    figureClass: Map,
    type: 'map'
  },
  {
    name: '4',
    figureClass: Chart4,
    type: 'chart-pie'
  }
];
