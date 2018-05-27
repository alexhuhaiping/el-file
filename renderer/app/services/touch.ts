import { FSService, Operation, OperationResult } from './fs';

import { formatDate } from '@angular/common';

/**
 * Touch
 */

export class TouchOperation extends Operation {

  /** Make a rename operation */
  static makeInstance(paths: string[],
                      fsSvc: FSService): TouchOperation {
    const origs = fsSvc.lstats(paths).map(stat => stat.mtime);
    const times = origs.map(orig => new Date());
    return new TouchOperation(paths, times, origs);
  }

  /** ctor */
  constructor(private paths: string[],
              private times: Date[],
                      origs: Date[],
                      original = true) {
    super(original);
    if (original)
      this.undo = new TouchOperation(paths, origs, times, false);
  }

  /** @override */
  runImpl(fsSvc: FSService): OperationResult {
    const result = fsSvc.touchFiles(this.paths, this.times);
    if (result && result.partial && this.undo) {
      (<TouchOperation>this.undo).paths = result.partial;
      (<TouchOperation>this.undo).times.length = result.partial.length;
    }
    return result;
  }

  /** @override */
  toStringImpl(fsSvc: FSService): string {
    const basename = fsSvc.path.basename;
    // @see http://www.linfo.org/touch.html
    const path = this.paths[0];
    const time = this.times[0];
    const ts = formatDate(time, 'yyyyMMddHHmm.ss', 'en_US');
    return (this.paths.length === 1)?
      `touch -f -t '${ts}' ${basename(path)}` :
      `touch -f -t '${ts}' ${basename(path)} and ${this.paths.length - 1} other(s)`;
  }

}
