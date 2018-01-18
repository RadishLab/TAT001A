import { select } from 'd3-selection';

export default class Visualization {
  constructor(parent, options) {
    this.width = options.width;
    this.height = options.height;
    this.parent = select(parent)
      .attr('height', this.height)
      .attr('width', this.width)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    this.baseDataUrl = options.baseDataUrl || '/';
    if (this.baseDataUrl.charAt(this.baseDataUrl.length - 1) !== '/') {
      this.baseDataUrl += '/';
    }

    this.dataOverrideUrl = options.dataOverrideUrl;
  }

  dataFileUrl(filename) {
    if (this.dataOverrideUrl) return this.dataOverrideUrl;
    return this.baseDataUrl + filename;
  }
}
