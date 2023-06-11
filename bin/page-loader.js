#!/usr/bin/env node
import { Command } from 'commander';
import pageLoad from "../src";

const program =  new Command();

program
  .name('page-loader')
  .description("Downloads an internet page and saves it to a directory")
  .version('1.0.0', '-V, --version', 'output the version number');

program
  .argument("<url>")
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, { output }) => {
    pageLoad({url, dirpath: output });
  });   

program.parse();
