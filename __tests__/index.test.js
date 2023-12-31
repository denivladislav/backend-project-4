import { afterEach, beforeEach } from '@jest/globals';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import prettier from 'prettier';
import nock from 'nock';
import os from 'os';
import pageLoad from '../src/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const readFixture = (filename) => readFileSync(getFixturePath(filename), 'utf-8');

const formatizeHTMLFixture = (htmlFixtureContent) => prettier.format(htmlFixtureContent, {
  parser: 'html',
});

const readFile = (filepath) => readFileSync(filepath, 'utf-8');

const htmlPage = readFixture('htmlPage.html');
const htmlPageResult = readFixture('htmlPageResult.html');
const img = readFixture('image.png');
const css = readFixture('style.css');

const url = 'https://ru.hexlet.io/courses';
const imgSrc = '/assets/professions/nodejs.png';
const cssSrc = '/assets/application.css';
const links = ['/courses', '/assets/application.css'];
const scriptSrc = '/packs/js/runtime.js';

const currentUrl = new URL(url);
const { origin, pathname } = currentUrl;

const filename = 'ru-hexlet-io-courses.html';
const resourcesDirname = 'ru-hexlet-io-courses_files';
const imageFilename = 'ru-hexlet-io-assets-professions-nodejs.png';
const cssFilename = 'ru-hexlet-io-assets-application.css';

let currentDirpath;

beforeEach(async () => {
  currentDirpath = await mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

afterEach(() => nock.cleanAll());

describe('fails', () => {
  test('dirpath does not exist', async () => {
    await expect(pageLoad(url, 'aaa')).rejects.toThrow(
      'No such file or directory',
    );
  });

  test('dirpath is not a directory', async () => {
    const filepath = path.join(currentDirpath, 'file');
    await writeFile(filepath, 'aaaa');

    await expect(pageLoad(url, filepath)).rejects.toThrow('Is not a directory');
  });

  test('directory already exists', async () => {
    await mkdir(path.join(currentDirpath, resourcesDirname));

    await expect(pageLoad(url, currentDirpath)).rejects.toThrow(
      'already exists',
    );
  });

  test('network error', async () => {
    nock(origin).get(pathname).reply(404);

    await expect(pageLoad(url, currentDirpath)).rejects.toThrow('404');
  });
});

describe('success', () => {
  test('successful load', async () => {
    nock(origin).get(pathname).reply(200, htmlPage);
    nock(origin).get(imgSrc).reply(200, img);
    nock(origin).get(cssSrc).reply(200, css);
    links.forEach((link) => {
      nock(origin).get(link).reply(200);
    });
    nock(origin).get(scriptSrc).reply(200);

    await pageLoad(url, currentDirpath);

    const htmlFileContent = readFile(path.join(currentDirpath, filename));
    const formatizedFileContent = formatizeHTMLFixture(htmlFileContent);
    const formatizedHtmlPageResult = formatizeHTMLFixture(htmlPageResult);

    expect(formatizedFileContent).toEqual(formatizedHtmlPageResult);

    const imageFilecontent = readFile(
      path.join(currentDirpath, resourcesDirname, imageFilename),
    );
    const cssFilecontent = readFile(
      path.join(currentDirpath, resourcesDirname, cssFilename),
    );

    expect(imageFilecontent).toEqual(img);
    expect(cssFilecontent).toEqual(css);
  });
});
