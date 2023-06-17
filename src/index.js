import axios from 'axios';
import { writeFile, stat } from 'node:fs/promises';
import { getFilename } from './utils/utils.js';

const pageLoad = ({ url, dirpath }) =>
  stat(dirpath)
    .then((stats) => {
      if (!stats.isDirectory()) {
        throw new Error(`Path ${dirpath} is not a directory`);
      }
      return;
    })
    .then(() => axios.get(url))
    .then((response) => {
      const filename = getFilename(url);
      return writeFile(`${dirpath}/${filename}`, response.data);
    })
    .catch((error) => {
      console.error(error);
    });

export default pageLoad;
