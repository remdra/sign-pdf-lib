import * as fs from 'fs-extra';

export class JsonAssetFile {

  private _content: any | undefined = undefined;

  constructor(
    private path: string
  ) {
  }
  
  get content(): Buffer {
    this._content = fs.readJsonSync(this.path);

    return this._content!;
  }
}
