import { mapNoData } from '../../colors';
import Map2 from './Map2';

export default class Map2Borderless extends Map2 {
  renderPaths() {
    super.renderPaths();
    this.countries.selectAll('.country')
      .attr('stroke', mapNoData)
      .attr('stroke-width', 1);
  }
}
