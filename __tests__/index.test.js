import { beforeEach } from '@jest/globals';
import { mkdtemp } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import prettier from 'prettier';
import nock from 'nock';
import os from 'os';
import pageLoad from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) =>
  path.join(__dirname, '..', '__fixtures__', filename);

const readFixture = (filename) =>
  readFileSync(getFixturePath(filename), 'utf-8');

const formatizeHTMLFixture = (htmlFixtureContent) =>
  prettier.format(htmlFixtureContent, {
    parser: 'html',
  });

const readFile = (path) => readFileSync(path, 'utf-8');

const htmlPage = readFixture('htmlPage.html');
const htmlPageResult = readFixture('htmlPageResult.html');
const img = readFixture('image.png');

const url = 'https://ru.hexlet.io/courses';
const imgSrc = '/assets/professions/nodejs.png';
const links = ['/courses', '/assets/application.css'];
const scriptSrc = '/packs/js/runtime.js';

const currentUrl = new URL(url);
const { origin, pathname } = currentUrl;

const filename = 'ru-hexlet-io-courses.html';
const resourcesDirname = 'ru-hexlet-io-courses_files';
const imageFilename = 'ru-hexlet-io-assets-professions-nodejs.png';

nock(origin).get(pathname).reply(200, htmlPage);
nock(origin).get(imgSrc).reply(200, img);
links.forEach((link) => {
  nock(origin).get(link).reply(200);
});
nock(origin).get(scriptSrc).reply(200);

let currentDirpath;

beforeEach(async () => {
  currentDirpath = await mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('successful load', async () => {
  await pageLoad({ url, dirpath: currentDirpath });

  const htmlFileContent = readFile(path.join(currentDirpath, filename));
  const formatizedFileContent = formatizeHTMLFixture(htmlFileContent);
  const formatizedHtmlPageResult = formatizeHTMLFixture(htmlPageResult);

  expect(formatizedFileContent).toEqual(formatizedHtmlPageResult);

  const imageFilecontent = readFile(
    path.join(currentDirpath, resourcesDirname, imageFilename)
  );

  expect(imageFilecontent).toEqual(img);
});
