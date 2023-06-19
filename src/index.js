import axios from 'axios';
import path from 'path';
import { writeFile, stat, mkdir } from 'node:fs/promises';
import {
  getHostFromUrl,
  getNameFromPath,
  getNameFromUrl,
} from './utils/utils.js';
import * as cheerio from 'cheerio';

const pageLoad = ({ url, dirpath }) => {
  const imageUrls = [];
  const imageFilenames = [];

  const host = getHostFromUrl(url);
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
      const $ = cheerio.load(response.data);
      $('img').each(function () {
        const imageSrc = $(this).attr('src');
        const imageUrl = imageSrc.startsWith('http')
          ? imageSrc
          : `https://${path.join(host, imageSrc)}`;

        const imageFilename = getNameFromPath(imageSrc, host);
        $(this).attr('src', path.join(resourcesDirname, imageFilename));
        imageUrls.push(imageUrl);
        imageFilenames.push(imageFilename);
      });

      return Promise.all([
        writeFile(`${path.join(dirpath, HTMLPageFilename)}`, $.html()),
        mkdir(`${path.join(dirpath, resourcesDirname)}`),
      ]);
    })
    .then(() =>
      Promise.all(
        imageUrls.map((imageUrl) =>
          axios.get(imageUrl, { responseType: 'arraybuffer' })
        )
      )
    )
    .then((imageResponses) =>
      Promise.all(
        imageResponses.map((imageResponse, index) =>
          writeFile(
            path.join(dirpath, resourcesDirname, imageFilenames[index]),
            imageResponse.data
          )
        )
      )
    )
    .catch((error) => {
      console.error(error);
    });
};

export default pageLoad;
