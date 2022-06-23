import dot from "dot";
import fs from "fs";

export const generateIndexHtml = (options = {}) => {
    const { args = {}, outputFile = 'index.html', inputFile = 'index.dot' } = options;
    return {
      name: 'copy-file',
      buildEnd: async () => {
        const template = (await fs.promises.readFile(inputFile)).toString('utf8');
        const compiled = dot.template(template);
        await fs.promises.writeFile(outputFile, compiled(args));
      }
    }
}