import Chart1 from './Chart1';
import Chart3 from './Chart3';
import Chart4 from './Chart4';
import Map from './Map';
import Map2 from './Map2';
import Map2Treemap from './Map2Treemap';
import Map3 from './Map3';
import Map3Cartogram from './Map3Cartogram';
import Map4 from './Map4';
import Map4Treemap from './Map4Treemap';

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
    name: 'map3',
    figureClass: Map3,
    type: 'map'
  },
  {
    name: 'map4',
    figureClass: Map4,
    type: 'map'
  },
  {
    name: '1',
    figureClass: Chart1,
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
  },
  {
    name: 'map2treemap',
    figureClass: Map2Treemap,
    type: 'map'
  },
  {
    name: 'map3cartogram',
    figureClass: Map3Cartogram,
    type: 'map'
  },
  {
    name: 'map4treemap',
    figureClass: Map4Treemap,
    type: 'map'
  }
];
