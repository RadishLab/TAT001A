import Chart1 from './Chart1';
import Chart3 from './Chart3';
import Map from './Map';
import MapCartogram from './MapCartogram';

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
    name: '1',
    figureClass: Chart1,
    type: 'chart'
  },
  {
    name: '3',
    figureClass: Chart3,
    type: 'chart'
  }
];
