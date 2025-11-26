import * as fs from 'fs';


export class TextAssetFile {

  private _content: string | undefined = undefined;

  constructor(
    private path: string
  ) {
  }
  
  get content(): string {
    this._content = fs.readFileSync(this.path, 'ascii');

    return this._content!;
  }
}
