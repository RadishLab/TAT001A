import { mapNoData } from '../../colors';
import Map from './Map';

export default class MapBorderless extends Map {
  renderPaths() {
    super.renderPaths();
    this.countries.selectAll('.country')
      .attr('stroke', mapNoData)
      .attr('stroke-width', 1);
  }
}
