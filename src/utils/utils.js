import { trim } from 'lodash-es';
import path from 'path';

export const getHostFromUrl = (url) => {
  const currentUrl = new URL(url);
  const { host } = currentUrl;
  return host;
};

export const getNameFromUrl = (url, suffix) => {
  const currentUrl = new URL(url);
  const { host, pathname, search } = currentUrl;
  return trim(
    path.join(host, pathname, search).replace(/[^\w]/g, '-'),
    '-'
  ).concat(suffix);
};

export const getNameFromPath = (pathname, host) => {
  const { dir, name, ext } = path.parse(pathname);
  return trim(path.join(host, dir, name).replace(/[^\w]/g, '-'), '-').concat(
    ext
  );
};
