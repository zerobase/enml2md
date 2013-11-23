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
    fs.writeFile path, note.toString(), (err) ->
      throw err if err

  _exportAttachments: (exportDirectory, note) ->
    enex = this
    for hash, attachment of note.attachments
      path = enex._exportAttachmentPath exportDirectory, attachment
      fs.writeFile path, attachment.data, (err) ->
        throw err if err

  _resourceDirectory: (exportDirectory) ->
    exportDirectory + '/resources'
  
  _exportAttachmentPath: (exportDirectory, attachment) ->
    this._resourceDirectory(exportDirectory) + '/' + attachment.hash + '.' + attachment.extention
    # TODO: correct file name

  each: (cbEach, cbEnd) ->
    parser = new Parser this, cbEach, cbEnd
    parser.parse this.filename

exports.EvernoteExport = EvernoteExport
