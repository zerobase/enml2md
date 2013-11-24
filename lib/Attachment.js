(function() {
  var Attachment, crypto;

  crypto = require("crypto");

  Attachment = (function() {
    function Attachment() {
      this.data = null;
      this.hash = null;
      this.fileName = null;
      this.extention = null;
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
      var split;
      this.fileName = fileName;
      split = fileName.split(".");
      return this.extention = split[split.length - 1];
    };

    Attachment.prototype.exportFileName = function() {
      return this.getHash() + '/' + this.fileName;
    };

    Attachment.prototype.getHash = function() {
      if (!this.hash) {
        throw "Data should be loaded before.";
      }
      return this.hash;
    };

    Attachment.prototype.getExtention = function() {
      if (!this.extention) {
        throw "File extention should be set before.";
      }
      return this.extention;
    };

    Attachment.prototype.toString = function() {
      return "fileName: " + this.fileName + ", @hash: " + this.hash + ", @extention: " + this.extention + ", @data.length: " + this.data.length;
    };

    return Attachment;

  })();

  exports.Attachment = Attachment;

}).call(this);
