import { testSettings } from '../../_settings/test-settings';
import * as fs from 'fs';


export class TextAssetFile {

  private _content: string | undefined = undefined;

  constructor(
    private path: string
  ) {
  }
  
  get content(): string {
    if(!this._content || testSettings.generate) {
      this._content = fs.readFileSync(this.path, 'ascii');
    }

    return this._content!;
  }
}
