import axios from 'axios';
import path from 'path';
import { writeFile, stat, mkdir } from 'node:fs/promises';
import { getNameFromUrl, getOriginFromUrl } from './utils/utils.js';
import * as cheerio from 'cheerio';
import { downloadResource } from './downloadResource.js';

const pageLoad = ({ url, dirpath }) => {
  let $ = null;

  const downloadedResourcesTags = [
    { tag: 'img', attr: 'src' },
    { tag: 'link', attr: 'href' },
    { tag: 'script', attr: 'src' },
  ];

  const mainOrigin = getOriginFromUrl(url);
  const HTMLPageFilename = getNameFromUrl(url, '.html');
  const resourcesDirname = getNameFromUrl(url, '_files');

  return stat(dirpath)
    .then((stats) => {
      if (!stats.isDirectory()) {
        throw new Error(`Path ${dirpath} is not a directory`);
      }

      return Promise.resolve();
    })
    .then(() => axios.get(url))
    .then((response) => {
      $ = cheerio.load(response.data);
      return mkdir(path.join(dirpath, resourcesDirname));
    })
    .then(() =>
      Promise.all(
        downloadedResourcesTags.map(({ tag, attr }) =>
          downloadResource({
            $,
            tag,
            attr,
            mainOrigin,
            dirpath,
            resourcesDirname,
          })
        )
      )
    )
    .then(() => writeFile(`${path.join(dirpath, HTMLPageFilename)}`, $.html()))
    .catch((error) => {
      console.error(error);
    });
};

export default pageLoad;
