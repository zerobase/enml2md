#!/usr/bin/env node

var path = require('path');
var fs   = require('fs');
var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');
var EvernoteExport = require(lib + '/EvernoteExport').EvernoteExport

var fileName = process.argv[2]
var dirPath = process.argv[3] || 'export'

enex = new EvernoteExport(fileName)
enex.export(dirPath)
