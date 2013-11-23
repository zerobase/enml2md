(function() {
  var Attachment, crypto;

  crypto = require("crypto");

  Attachment = (function() {
    function Attachment() {
      this.data = null;
      this.hash = null;
      this.extention = 'png';
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

    return Attachment;

  })();

  exports.Attachment = Attachment;

}).call(this);
