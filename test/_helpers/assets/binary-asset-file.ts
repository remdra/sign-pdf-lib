import { testSettings } from '../../_settings/test-settings';
import * as fs from 'fs';


export class BinaryAssetFile {

  private _content: Buffer | undefined = undefined;

  constructor(
    private path: string
  ) {
  }
  
  get content(): Buffer {
    if(!this._content || testSettings.generate) {
      this._content = fs.readFileSync(this.path);
    }

    return this._content!;
  }
}
