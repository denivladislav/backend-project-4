import axios from 'axios';
import path from 'path';
import { writeFile, stat, mkdir } from 'node:fs/promises';
import {
  getFilename,
  getHost,
  getImageFilename,
  getResourcesDirname,
} from './utils/utils.js';
import { trim } from 'lodash-es';
import * as cheerio from 'cheerio';

const pageLoad = ({ url, dirpath }) => {
  const imageUrls = [];
  const imageFilenames = [];

  const host = getHost(url);
  const resourcesDirname = getResourcesDirname(url);
  const HTMLPageFilename = getFilename(url);

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
        const imageSrc = trim($(this).attr('src'), '/');
        const imageUrl = imageSrc.startsWith('http')
          ? imageSrc
          : `https://${path.join(host, imageSrc)}`;

        const imageFilename = getImageFilename(host, imageSrc);
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
