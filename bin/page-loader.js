#!/usr/bin/env node
import { Command } from 'commander';
import pageLoad from '../src/index.js';
import process from 'node:process';
const program = new Command();

program
  .name('page-loader')
  .description(
    'Downloads an internet page and saves it and its resouruces to a directory'
  )
  .version('1.0.0', '-V, --version', 'output the version number');

program
  .argument('<url>')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, { output }) =>
    pageLoad(url, output)
      .then(({ HTMLPageDirpath, resourcesDirpath }) => {
        console.log(`Page was downloaded into ${HTMLPageDirpath}`);
        console.log(`Resources were downloaded into ${resourcesDirpath}`);
      })
      .catch((error) => {
        console.error(error);
        console.log(`Exit with code: 1`);
        process.exit(1);
      })
  );

program.parse();
