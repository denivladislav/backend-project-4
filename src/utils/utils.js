export const getFilename = (url) => {
  const currentUrl = new URL(url);
  const { host, pathname, search, hash } = currentUrl;
  return `${host}${pathname}${search}${hash}`
    .replace(/[^\w]/g, '-')
    .concat('.html');
};
