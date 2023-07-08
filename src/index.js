import axios from 'axios';
import path from 'path';
import { writeFile, stat, mkdir } from 'node:fs/promises';
import * as cheerio from 'cheerio';
import Debug from 'debug';
import { getNameFromUrl, getOriginFromUrl } from './utils/utils.js';
import processResources from './processResources.js';

const debug = Debug('info');

const pageLoad = (url, dirpath = process.cwd()) => {
  let $ = null;

  const resourcesTagsToDownload = [
    { tag: 'img', attr: 'src' },
    { tag: 'link', attr: 'href' },
    { tag: 'script', attr: 'src' },
  ];

  const mainOrigin = getOriginFromUrl(url);
  const HTMLPageFilename = getNameFromUrl(url, '.html');
  const resourcesDirname = getNameFromUrl(url, '_files');

  const HTMLPageDirpath = path.join(dirpath, HTMLPageFilename);
  const resourcesDirpath = path.join(dirpath, resourcesDirname);

  return stat(dirpath)
    .then((stats) => {
      debug(`checking dirpath ${dirpath}`);
      if (!stats.isDirectory()) {
        const error = new Error('Is not a directory');
        error.dirpathIsNotDirectory = true;
        throw error;
      }

      return Promise.resolve();
    })
    .then(() => {
      debug(`creating resources directory ${resourcesDirpath}`);
      return mkdir(resourcesDirpath);
    })
    .then(() => {
      debug(`getting url ${url}`);
      return axios.get(url);
    })
    .then((response) => {
      debug('loading html');
      $ = cheerio.load(response.data);

      debug('downloading resources');
      return processResources({
        $,
        resourcesTagsToDownload,
        mainOrigin,
        dirpath,
        resourcesDirname,
        debug,
      });
    })
    .then(() => {
      debug('write html');
      return writeFile(HTMLPageDirpath, $.html(), { encoding: 'utf-8' });
    })
    .then(() => ({ HTMLPageDirpath, resourcesDirpath }))
    .catch((error) => {
      let customError;
      if (error.errno === -2) {
        customError = new Error(`No such file or directory '${error.path}'`);
      } else if (error.errno === -17) {
        customError = new Error(
          `File or directory already exists '${error.path}'`,
        );
      } else if (error.dirpathIsNotDirectory) {
        customError = new Error(`Is not a directory '${dirpath}'`);
      } else if (error.isAxiosError) {
        const errorStatus = error.response.status || '';
        customError = new Error(`Network error ${errorStatus} '${url}'`);
      } else {
        customError = error;
      }
      return Promise.reject(customError);
    });
};

export default pageLoad;
