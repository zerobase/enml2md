var EventEmitter = require('events').EventEmitter;
var util = require('util');
var xml = require("node-xml");

var EvernoteExport = function(enml_filename) {
  
  this.enml_filename = enml_filename;
  
  this.notesCount = function() { // returns an EventEmitter.
    var count = 0;
    var ev = new EventEmitter;
    var parser = new xml.SaxParser(function(cb) {
      cb.onStartElementNS(function(element, attributes, prefix, uri, namespaces) {
        if (element == 'note') {
          count = count + 1;
        }
      });
      cb.onWarning(function(msg) {
        ev.emit('warning', msg);
      });
      cb.onError(function(msg) {
        ev.emit('error', msg);
      });
      cb.onEndDocument(function() {
        ev.emit('done', count);
      });
    });
    parser.parseFile(this.enml_filename);
    return ev;
  };
};

module.exports.EvernoteExport = EvernoteExport;
