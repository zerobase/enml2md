(function() {
  var Attachment, crypto;

  crypto = require("crypto");

  Attachment = (function() {
    function Attachment() {
      this.data = null;
      this.hash = null;
      this.fileName = null;
      this.extention = "png";
    }

    Attachment.prototype.loadData = function(data) {
      var md5;
      this.data = data;
      md5 = crypto.createHash("md5");
      md5.setEncoding("hex");
      md5.write(this.data);
      md5.end();
      return this.hash = md5.read();
    };

    Attachment.prototype.setFileName = function(fileName) {
      var split;
      this.fileName = fileName;
      split = fileName.split(".");
      return this.extention = split[split.length - 1];
    };

    Attachment.prototype.exportFileName = function() {
      return this.getHash() + '.' + this.getExtention();
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

    return Attachment;

  })();

  exports.Attachment = Attachment;

}).call(this);
