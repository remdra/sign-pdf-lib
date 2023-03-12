import { testSettings } from '../../_settings/test-settings';
import * as fs from 'fs-extra';

export class JsonAssetFile {

  private _content: any | undefined = undefined;

  constructor(
    private path: string
  ) {
  }
  
  get content(): Buffer {
    if(!this._content || testSettings.generate) {
      this._content = fs.readJsonSync(this.path);
    }

    return this._content!;
  }
}
