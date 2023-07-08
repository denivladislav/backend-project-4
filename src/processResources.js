import path from 'path';
import axios from 'axios';
import { writeFile } from 'node:fs/promises';
import Listr from 'listr';
import { getNameFromPath } from './utils/utils.js';

export default ({
  $,
  resourcesTagsToDownload,
  mainOrigin,
  dirpath,
  resourcesDirname,
  debug,
}) => {
  const urls = [];
  const filenames = [];

  resourcesTagsToDownload.forEach((tag) => {
    const isImg = tag === 'img';
    $(tag.tag).each(function () {
      const urlFromAttr = $(this).attr(tag.attr);
      if (!urlFromAttr) {
        return;
      }
      const {
        href, host, pathname, origin,
      } = new URL(urlFromAttr, mainOrigin);
      // only local links and scripts are downloaded
      if (!isImg && origin !== mainOrigin) {
        return;
      }
      const filename = getNameFromPath(path.join(host, pathname));
      $(this).attr(tag.attr, path.join(resourcesDirname, filename));
      urls.push(href);
      filenames.push(filename);
    });
  });

  const tasks = new Listr(
    urls.map((url, index) => {
      debug(`loading resource: ${url}`);
      return {
        title: `Downloading resource: ${url}`,
        task: () => axios
          .get(url, { responseType: 'arraybuffer' })
          .then((response) => {
            debug(`resource downloaded: ${url}`);
            return writeFile(
              path.join(dirpath, resourcesDirname, filenames[index]),
              response.data,
              { encoding: 'utf-8' },
            );
          })
          .catch(() => {
            const downloadError = new Error();
            downloadError.url = url;
            return Promise.reject(downloadError);
          }),
      };
    }),
    { concurrent: true },
  );

  return tasks.run().catch((error) => {
    debug(`resource download failed: ${error.downloadError}`);
    // console.error(`Couldn't download resource: ${url}`);
  });
};
