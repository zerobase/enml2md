(function() {
  var EvernoteExport, TestConfig, crypto, fs, mkdirp, should, temp, util;

  TestConfig = require("./TestConfig");

  EvernoteExport = require("../lib/EvernoteExport").EvernoteExport;

  should = require("should");

  fs = require("fs");

  util = require("util");

  crypto = require("crypto");

  mkdirp = require('mkdirp');

  temp = require("temp");

  temp.track();

  describe("EvernoteExport(enml_filename)", function() {
    describe("#export(directory, cbDone)", function() {
      it("creates an export directory", function(done) {
        return temp.mkdir("enml2md", function(err, dirPath) {
          var enex;
          enex = new EvernoteExport(TestConfig.fixtures['1']);
          return enex["export"](dirPath, function() {
            return fs.stat(dirPath, function(err, stats) {
              stats.isDirectory().should.be["true"];
              return done(err);
            });
          });
        });
      });
      it("creates exported files", function(done) {
        return temp.mkdir("enml2md", function(err, dirPath) {
          var enex;
          enex = new EvernoteExport(TestConfig.fixtures['2']);
          return enex["export"](dirPath, function() {
            return fs.stat(dirPath + "/Enml2md test fixture note 1.md", function(err, stats) {
              stats.isFile().should.be["true"];
              return fs.stat(dirPath + "/Enml2md test fixture note 2.md", function(err, stats) {
                stats.isFile().should.be["true"];
                return done(err);
              });
            });
          });
        });
      });
      it("creates an attachment direcotry", function(done) {
        return temp.mkdir("enml2md", function(err, dirPath) {
          var enex;
          enex = new EvernoteExport(TestConfig.fixtures['1']);
          return enex["export"](dirPath, function() {
            return fs.stat(dirPath + "/resources", function(err, stats) {
              stats.isDirectory().should.be["true"];
              return done(err);
            });
          });
        });
      });
      it("creates attachment files", function(done) {
        return temp.mkdir("enml2md", function(err, dirPath) {
          var enex, filePath, resourceDir;
          if (err) {
            throw err;
          }
          enex = new EvernoteExport(TestConfig.fixtures['image']);
          resourceDir = dirPath + "/resources";
          filePath = resourceDir + "/095619d89dbbd6a0c5704d57e444f708/foo.png";
          return enex["export"](dirPath, function() {
            var fd, md5;
            fs.statSync(filePath).isFile().should.be["true"];
            fd = fs.createReadStream(filePath);
            md5 = crypto.createHash("md5");
            md5.setEncoding("hex");
            fd.on("end", function() {
              md5.end();
              md5.read().should.equal("095619d89dbbd6a0c5704d57e444f708");
              return done(err);
            });
            return fd.pipe(md5);
          });
        });
      });
      return it("can be called without a callback", function(done) {
        return temp.mkdir("enml2md", function(err, dirPath) {
          var enex, testDone;
          enex = new EvernoteExport(TestConfig.fixtures['1']);
          enex["export"](dirPath);
          testDone = function() {
            enex.count.should.equal(1);
            if (enex.done) {
              return done();
            } else {
              return setTimeout(testDone, 10);
            }
          };
          return setTimeout(testDone, 10);
        });
      });
    });
    return describe("#each(cbEach, cbEnd)", function() {
      it("sets total @count at cbEnd()", function(done) {
        var cbEach, cbEnd, enex;
        enex = new EvernoteExport(TestConfig.fixtures['2']);
        cbEach = function(note) {};
        cbEnd = function() {
          enex.count.should.equal(2);
          return done();
        };
        return enex.each(cbEach, cbEnd);
      });
      it("calls cbEach(note)", function(done) {
        var cbEach, cbEnd, enex, expected_created, expected_updated;
        enex = new EvernoteExport(TestConfig.fixtures['1']);
        expected_created = new Date(2013, 10, 2, 10, 0 - TestConfig.TZOffsetMinutes, 55);
        expected_updated = new Date(2013, 10, 2, 10, 3 - TestConfig.TZOffsetMinutes, 49);
        cbEach = function(note) {
          note.title.should.equal("Enml2md test fixture note");
          note.created.should.eql(expected_created);
          note.updated.should.eql(expected_updated);
          note.tags.should.contain("markdown");
          note.tags.should.contain("evernote");
          note.tags.length.should.equal(2);
          return note.content.should.equal("fixture content\n\n");
        };
        cbEnd = function() {
          enex.count.should.equal(1);
          return done();
        };
        return enex.each(cbEach, cbEnd);
      });
      it("can be called without cbEach()", function(done) {
        var cbEnd, enex;
        enex = new EvernoteExport(TestConfig.fixtures['2']);
        cbEnd = function() {
          enex.count.should.equal(2);
          return done();
        };
        return enex.each(null, cbEnd);
      });
      return it("can be called without both beEach() and cbEnd()", function(done) {
        var enex, testDone;
        enex = new EvernoteExport(TestConfig.fixtures['2']);
        testDone = function() {
          enex.count.should.equal(2);
          return done();
        };
        setTimeout(testDone, 20);
        return enex.each(null, null);
      });
    });
  });

}).call(this);

/*
//@ sourceMappingURL=EvernoteExportTest.js.map
*/