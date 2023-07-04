import axios from 'axios';
import path from 'path';
import { writeFile, stat, mkdir } from 'node:fs/promises';
import { getNameFromUrl, getOriginFromUrl } from './utils/utils.js';
import * as cheerio from 'cheerio';
import { downloadResource } from './downloadResource.js';
import Debug from 'debug';

const debug = Debug('info');

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
    .then(() => {
      debug(`get url ${url}`);
      return axios.get(url);
    })
    .then((response) => {
      debug('load html');
      $ = cheerio.load(response.data);
      return mkdir(path.join(dirpath, resourcesDirname));
    })
    .then(() => {
      debug('downloading resouces');
      return Promise.all(
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
      );
    })
    .then(() => {
      debug('writefile');
      return writeFile(`${path.join(dirpath, HTMLPageFilename)}`, $.html());
    })
    .then(() => {
      console.log(
        `Page was successfully downloaded into ${path.join(
          dirpath,
          HTMLPageFilename
        )}`
      );
      console.log(
        `Resources were successfully downloaded into ${path.join(
          dirpath,
          resourcesDirname
        )}`
      );
    })
    .catch((error) => {
      console.error(error);
    });
};

export default pageLoad;
