import { fileToText, pickFile, saveFile } from '../lib/file';

export interface UtilsAPI {
  pickFile: (accept?: string) => Promise<File>;
  saveFile: (content: string, fileName: string) => void;
  fileToText: (file: File) => Promise<string | ArrayBuffer>;
}

export const utilsAPI: UtilsAPI = {
  get pickFile() {
    return pickFile;
  },
  get saveFile() {
    return saveFile;
  },
  get fileToText() {
    return fileToText;
  },
};
