import * as fse from 'fs-extra';

import { testSettings } from '../_settings/test-settings';


const generate = testSettings.generate;

const generateJsonAsync = async (file: string, json: any) => {
    if(!generate) return;
   
    await fse.outputJson(file, json, { spaces: 2 });
};

const generateTextAsync = async (file: string, text: string) => {
    if(!generate) return;
   
    await fse.outputFile(file, text, 'utf-8');
};

const generateBinaryAsync = async (file: string, binary: Buffer) => {
    if(!generate) return;
   
    await fse.outputFile(file, binary);
};

const deleteFolderAsync = async (folder: string) => {
    if(!generate) return;

    await fse.remove(folder)
}


export const generateAsset = {
    generateJsonAsync,
    generateTextAsync,
    generateBinaryAsync,
    deleteFolderAsync
};
