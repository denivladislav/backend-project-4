import { trim } from 'lodash-es';
import path from 'path';

const REGEXP_ALL_NON_LETTERS = /[^\w]/g;

export const getOriginFromUrl = (url) => {
  const { origin } = new URL(url);
  return origin;
};

export const getNameFromUrl = (url, suffix) => {
  const { host, pathname, search } = new URL(url);
  return trim(
    path.join(host, pathname, search).replace(REGEXP_ALL_NON_LETTERS, '-'),
    '-',
  ).concat(suffix);
};

export const getNameFromPath = (pathname) => {
  const { dir, name, ext } = path.parse(pathname);
  return trim(
    path.join(dir, name).replace(REGEXP_ALL_NON_LETTERS, '-'),
    '-',
  ).concat(ext || '.html');
};
