import path from 'path';
import { getNameFromPath } from './utils/utils.js';
import axios from 'axios';
import { writeFile } from 'node:fs/promises';

export const download = ({
  $,
  tag,
  attr,
  mainOrigin,
  dirpath,
  resourcesDirname,
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
    if (!isImg && origin !== mainOrigin) {
      return;
    }
    const filename = getNameFromPath(path.join(host, pathname));
    $(this).attr(attr, path.join(resourcesDirname, filename));
    urls.push(href);
    filenames.push(filename);
  });

  return Promise.all(urls.map((url) => axios.get(url, { responseType }))).then(
    (responses) =>
      Promise.all(
        responses.map((response, index) =>
          writeFile(
            path.join(dirpath, resourcesDirname, filenames[index]),
            response.data
          )
        )
      )
  );
};
