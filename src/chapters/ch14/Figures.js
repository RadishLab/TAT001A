import Map from './Map';
import MapCartogram from './MapCartogram';
import Chart4 from './Chart4';

export const figures = [
  {
    name: 'map',
    figureClass: Map,
    type: 'map'
  },
  {
    name: 'mapcartogram',
    figureClass: MapCartogram,
    type: 'map'
  },
  {
    name: '4',
    figureClass: Chart4,
    type: 'chart-vertical'
  }
];
