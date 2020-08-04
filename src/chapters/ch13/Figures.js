import Chart1 from './Chart1';
import Chart5 from './Chart5';
import Map from './Map';
import MapCartogram from './MapCartogram';
import Map2 from './Map2';
import Map2Borderless from './Map2Borderless';

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
    name: 'map2',
    figureClass: Map2,
    type: 'map'
  },
  {
    name: 'map2borderless',
    figureClass: Map2Borderless,
    type: 'map'
  },
  {
    name: '1',
    figureClass: Chart1,
    type: 'chart'
  },
  {
    name: '5',
    figureClass: Chart5,
    type: 'chart'
  }
];
