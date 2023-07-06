import path from 'path';
import { getNameFromPath } from './utils/utils.js';
import axios from 'axios';
import { writeFile } from 'node:fs/promises';

export const downloadResource = ({
  $,
  tag,
  attr,
  mainOrigin,
  dirpath,
  resourcesDirname,
  debug,
}) => {
  const urls = [];
  const filenames = [];

  const isImg = tag === 'img';
  const responseType = isImg ? 'arraybuffer' : 'json';

  $(tag).each(function () {
    const urlFromAttr = $(this).attr(attr);
    if (!urlFromAttr) {
      return;
    }
    const { href, host, pathname, origin } = new URL(urlFromAttr, mainOrigin);
    // only local links and scripts are downloaded
    if (!isImg && origin !== mainOrigin) {
      return;
    }
    const filename = getNameFromPath(path.join(host, pathname));
    $(this).attr(attr, path.join(resourcesDirname, filename));
    urls.push(href);
    filenames.push(filename);
  });

  const getResourcePromises = urls.map((url) => {
    debug(`loading resource: ${url}`);
    return axios
      .get(url, { responseType })
      .then((response) => {
        debug(`resource downloaded: ${url}`);
        return { result: 'success', value: response };
      })
      .catch((error) => {
        debug(`resource download failed: ${url}`);
        console.error(`Couldn't download resource: ${url}`);
        return { result: 'error', value: error };
      });
  });

  return Promise.all(getResourcePromises).then((responses) =>
    Promise.all(
      responses
        .filter((response) => response.result === 'success')
        .map((response, index) =>
          writeFile(
            path.join(dirpath, resourcesDirname, filenames[index]),
            response.value.data
          )
        )
    )
  );
};
