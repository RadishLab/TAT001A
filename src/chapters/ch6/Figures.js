import Chart1 from './Chart1';
import Chart2 from './Chart2';
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
    dimensions: [500, 190],
    name: '1',
    figureClass: Chart1,
    type: 'chart'
  },
  {
    name: '2',
    figureClass: Chart2,
    type: 'chart'
  }
];
