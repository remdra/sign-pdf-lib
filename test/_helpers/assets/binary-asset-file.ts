import * as fs from 'fs';


export class BinaryAssetFile {

  private _content: Buffer | undefined = undefined;

  constructor(
    private path: string
  ) {
  }
  
  get content(): Buffer {
    this._content = fs.readFileSync(this.path);

    return this._content!;
  }
}
