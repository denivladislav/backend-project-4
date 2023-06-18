import { beforeEach } from '@jest/globals';
import { mkdtemp, readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import prettier from 'prettier';
import nock from 'nock';
import os from 'os';
import pageLoad from '../src/index.js';
import {
  getFilename,
  getImageFilename,
  getResourcesDirname,
} from '../src/utils/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) =>
  path.join(__dirname, '..', '__fixtures__', filename);

const readFixture = (filename) =>
  readFileSync(getFixturePath(filename), 'utf-8');

const htmlPage = readFixture('htmlPage.html');
const htmlPageResult = readFixture('htmlPageResult.html');
const img = readFixture('image.png');

const url = 'https://ru.hexlet.io/courses';
const imgSrc = '/assets/professions/nodejs.png';

const currentUrl = new URL(url);
const { protocol, host, pathname } = currentUrl;
const filename = getFilename(url);
const resourcesDirname = getResourcesDirname(url);
const imageFilename = getImageFilename(host, imgSrc);

nock(`${protocol}//${host}`).get(pathname).reply(200, htmlPage);
nock(`${protocol}//${host}`).get(imgSrc).reply(200, img);

let currentDirpath;

beforeEach(async () => {
  currentDirpath = await mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('successful load', async () => {
  await pageLoad({ url, dirpath: currentDirpath });

  const htmlFilecontent = await readFile(
    path.join(currentDirpath, filename),
    'utf-8'
  );
  const formattedFilecontent = prettier.format(htmlFilecontent, {
    parser: 'html',
  });
  const formattedHtmlPageResult = prettier.format(htmlPageResult, {
    parser: 'html',
  });
  expect(formattedFilecontent).toEqual(formattedHtmlPageResult);

  const imageFilecontent = await readFile(
    path.join(currentDirpath, resourcesDirname, imageFilename),
    'utf-8'
  );
  expect(imageFilecontent).toEqual(img);
});
