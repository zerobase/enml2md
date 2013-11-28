(function() {
  var Attachment, crypto, mime;

  crypto = require("crypto");

  mime = require('mime');

  Attachment = (function() {
    function Attachment() {
      this.data = null;
      this.hash = null;
      this.fileName = null;
      this.type = null;
    }

    Attachment.prototype.loadData = function(data) {
      this.data = data;
      return this.hash = this._hash(data);
    };

    Attachment.prototype._hash = function(data) {
      var hash, md5;
      md5 = crypto.createHash("md5");
      md5.setEncoding("hex");
      md5.write(this.data);
      md5.end();
      return hash = md5.read();
    };

    Attachment.prototype.setFileName = function(fileName) {
      if (fileName) {
        return this.fileName = fileName;
      }
    };

    Attachment.prototype.exportFileName = function() {
      if (this.fileName != null) {
        return this.getHash() + '/' + this.fileName;
      } else {
        return this.getHash() + '.' + this.getExtension();
      }
    };

    Attachment.prototype.getHash = function() {
      if (!this.hash) {
        throw "Data should be loaded before.";
      }
      return this.hash;
    };

    Attachment.prototype.getExtension = function() {
      var split;
      if (this.fileName) {
        split = this.fileName.split(".");
        return split[split.length - 1];
      } else {
        return mime.extension(this.type);
      }
    };

    Attachment.prototype.toString = function() {
      return "fileName: " + this.fileName + ", @hash: " + this.hash + ", @extension: " + this.extension + ", @data.length: " + this.data.length;
    };

    return Attachment;

  })();

  exports.Attachment = Attachment;

}).call(this);

/*
//@ sourceMappingURL=Attachment.js.map
*/