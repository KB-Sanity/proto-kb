import { pickFile } from '../lib/pickFile';

export interface UtilsAPI {
  pickFile: (accept?: string) => Promise<File>;
}

export default <UtilsAPI>{
  get pickFile() {
    return pickFile;
  },
};
