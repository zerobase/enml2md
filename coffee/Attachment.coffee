crypto = require "crypto"

class Attachment
  constructor: () ->
    @data = null # data string (base64)
    @hash = null # MD5 hash string
    @fileName = "image.png" # file basename string
    @extention = "png" # file extention string

  loadData: (data) ->
    @data = data
    md5 = crypto.createHash "md5"
    md5.setEncoding "hex"
    md5.write @data
    md5.end()
    @hash = md5.read()

  setFileName: (fileName) ->
    @fileName = fileName
    split = fileName.split(".")
    @extention = split[split.length - 1]

exports.Attachment = Attachment
