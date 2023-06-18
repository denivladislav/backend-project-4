import { trim } from 'lodash-es';
import path from 'path';

export const getHost = (url) => {
  const currentUrl = new URL(url);
  const { host } = currentUrl;
  return host;
};

export const getFilename = (url, ext = '.html') => {
  const currentUrl = new URL(url);
  const { host, pathname, search } = currentUrl;
  const formattedName = `${host}${pathname}${search}`.replace(/[^\w]/g, '-');
  return trim(formattedName, '-').concat(ext);
};

export const getResourcesDirname = (url, suffix = '_files') => {
  const currentUrl = new URL(url);
  const { host, pathname, search } = currentUrl;
  const formattedName = `${host}${pathname}${search}`.replace(/[^\w]/g, '-');
  return trim(formattedName, '-').concat(suffix);
};

export const getImageFilename = (host, url) => {
  const { dir, name, ext } = path.parse(url);
  return path.join(host, dir, name).replace(/[^\w]/g, '-').concat(ext);
};
