import { beforeEach } from '@jest/globals';
import { mkdtemp, readFile } from 'node:fs/promises';
import nock from 'nock';
import path from 'path';
import os from 'os';
import pageLoad from '../src/index.js';

const URL_HOST = 'https://user:pass@sub.example.com:8080';
const URL_PATHNAME_QUERY_HASH = '/p/a/t/h?query=string#hash';
const URL = `${URL_HOST}${URL_PATHNAME_QUERY_HASH}`;
const URL_FILENAME = 'sub-example-com-8080-p-a-t-h-query-string-hash.html';
const RESPONSE_DATA = '<!DOCTYPE>';

nock(URL_HOST).get(URL_PATHNAME_QUERY_HASH).reply(200, RESPONSE_DATA);

let currentDirpath;

beforeEach(async () => {
  currentDirpath = await mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('successful load', async () => {
  await pageLoad({ url: URL, dirpath: currentDirpath });
  const filecontent = await readFile(
    `${currentDirpath}/${URL_FILENAME}`,
    'utf-8'
  );
  expect(filecontent).toEqual(RESPONSE_DATA);
});
