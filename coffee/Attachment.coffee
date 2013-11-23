crypto = require "crypto"

class Attachment
  constructor: () ->
    @data = null # data string (base64)
    @hash = null
    @extention = 'png'

  loadData: (data) ->
    @data = data
    md5 = crypto.createHash "md5"
    md5.setEncoding "hex"
    md5.write @data
    md5.end()
    @hash = md5.read()

exports.Attachment = Attachment
