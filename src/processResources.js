import path from 'path';
import { getNameFromPath } from './utils/utils.js';
import axios from 'axios';
import { writeFile } from 'node:fs/promises';
import Listr from 'listr';

export const processResources = ({
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
    const responseType = isImg ? 'arraybuffer' : 'json';
    $(tag.tag).each(function () {
      const urlFromAttr = $(this).attr(tag.attr);
      if (!urlFromAttr) {
        return;
      }
      const { href, host, pathname, origin } = new URL(urlFromAttr, mainOrigin);
      // only local links and scripts are downloaded
      if (!isImg && origin !== mainOrigin) {
        return;
      }
      const filename = getNameFromPath(path.join(host, pathname));
      $(this).attr(tag.attr, path.join(resourcesDirname, filename));
      urls.push({ url: href, responseType });
      filenames.push(filename);
    });
  });

  const tasks = new Listr(
    urls.map(({ url, responseType }, index) => {
      debug(`loading resource: ${url}`);
      return {
        title: `Downloading resource: ${url}`,
        task: () =>
          axios
            .get(url, { responseType })
            .then((response) => {
              debug(`resource downloaded: ${url}`);
              console.log('response.data', `_${response.data}_`);
              return writeFile(
                path.join(dirpath, resourcesDirname, filenames[index]),
                response.data
              );
            })
            .catch(() => {
              return Promise.reject({ url });
            }),
      };
    }),
    { concurrent: true }
  );

  return tasks.run().catch(({ url }) => {
    debug(`resource download failed: ${url}`);
    // console.error(`Couldn't download resource: ${url}`);
  });
};
