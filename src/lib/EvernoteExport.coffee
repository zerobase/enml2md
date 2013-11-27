fs = require 'graceful-fs'
mkdirp = require 'mkdirp'
Parser = require('./Parser').Parser

class EvernoteExport

  constructor: (filename) ->
    this.filename = filename
    this.count = 0
    this.done = false
  
  export: (exportDirectory, cbDone) ->
    enex = this
    mkdirp this._resourceDirectory(exportDirectory), (err) ->
      # make export directory (foo) and resource directory (foo/resources) at the same time
      throw err if err
      eachProc = (note) ->
        enex._exportNote exportDirectory, note
        enex._exportAttachments exportDirectory, note
      doneProc = () ->
        enex.done = true
        cbDone() if cbDone
      enex.each eachProc, doneProc

  _exportNote: (exportDirectory, note) ->
    path = exportDirectory + '/' + note.filename()
    fs.writeFileSync path, note.toString()

  _exportAttachments: (exportDirectory, note) ->
    for hash, attachment of note.attachments
      resourceDirectory = this._resourceDirectory exportDirectory
      attachmentDirectory = resourceDirectory + '/' + hash
      file = attachmentDirectory + '/' + attachment.fileName
      fs.mkdirSync attachmentDirectory
      fs.writeFileSync file, attachment.data

  _resourceDirectory: (exportDirectory) ->
    exportDirectory + '/resources'
  
  each: (cbEach, cbEnd) ->
    parser = new Parser this, cbEach, cbEnd
    parser.parse this.filename

exports.EvernoteExport = EvernoteExport
