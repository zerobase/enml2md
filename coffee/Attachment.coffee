crypto = require "crypto"

class Attachment
  constructor: () ->
    @data = null # data string (base64)
    @hash = null # MD5 hash string
    @fileName = null # file basename string
    @extention = null # file extention string

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
  
  exportFileName: () ->
    @getHash() + '/' + @fileName

  getHash: () ->
    unless @hash
      throw "Data should be loaded before."
    @hash

  getExtention: () ->
    unless @extention
      throw "File extention should be set before."
    @extention

  toString: () ->
    "fileName: #{@fileName}, @hash: #{@hash}, @extention: #{@extention}, @data.length: #{@data.length}"

exports.Attachment = Attachment
