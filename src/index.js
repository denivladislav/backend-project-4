import axios from 'axios';
import path from 'path';
import process from 'node:process';
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

  const HTMLPageDirpath = path.join(dirpath, HTMLPageFilename);
  const resourcesDirpath = path.join(dirpath, resourcesDirname);

  process.on('exit', (code) => {
    console.log(`Exit with code: ${code}`);
  });

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
      console.log('resourcesDirpath:', resourcesDirpath);
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
      return Promise.all(
        downloadedResourcesTags.map(({ tag, attr }) =>
          downloadResource({
            $,
            tag,
            attr,
            mainOrigin,
            dirpath,
            resourcesDirname,
            debug,
          })
        )
      );
    })
    .then(() => {
      debug('write html');
      return writeFile(HTMLPageDirpath, $.html());
    })
    .then(() => {
      console.log(`Page was downloaded into ${HTMLPageDirpath}`);
      console.log(`Resources were downloaded into ${resourcesDirpath}`);
    })
    .catch((error) => {
      if (error.errno === -2) {
        console.error(`Error: no such file or directory '${error.path}'`);
      } else if (error.errno === -17) {
        console.error(
          `Error: file or directory already exists '${error.path}'`
        );
      } else if (error.dirpathIsNotDirectory) {
        console.error(`Error: is not a directory '${dirpath}'`);
      } else if (error.isAxiosError) {
        console.error(`Error: network error '${url}'`);
      } else {
        console.error(error);
      }

      process.exitCode = 1;
      return Promise.reject(error);
    });
};

export default pageLoad;
