var sax = require("sax"),
  Note = require('./Note').Note,
  Attachment = require('./Attachment').Attachment

var Parser = function (enex, cbEach, cbEnd) {
  var strict = true // sax.parser: set to false for html-mode
  var parser = sax.parser(strict, {trim: false, normalize: false})
  
  parser.ontextHandlers = {
    'title': function (text) {
      parser.note.title = text
    },
    'created': function (text) {
      parser.note.created = Note.parseENMLDate(text)
    },
    'updated': function (text) {
      parser.note.updated = Note.parseENMLDate(text)
    },
    'tag': function (text) {
      parser.note.tags.push(text)
    },
    'data': function (text) {
      attachment = new Attachment
      attachment.data = text
      parser.note.attachments.push(attachment) // base64 string
    }
  }
  parser.onopentag = function (node) {
    this.currentElement = node.name
    if (node.name == 'note') {
      this.note = new Note
    }
  }
  parser.onclosetag = function (nodeName) {
    if (nodeName == 'note') {
      enex.count = enex.count + 1
      if (cbEach) cbEach(this.note)
    }
  }
  parser.ontext = function (text) {
    var handler = this.ontextHandlers[this.currentElement]
    if (typeof handler == 'function') {
      handler(text)
    }
  }
  parser.oncdata = function (text) {
    this.cdata = text
  }
  parser.onclosecdata = function () {
    this.note.content = Note.parseENMLContent(this.cdata)
    // TODO: parse inside CDATA to obtain attachments
  }
  parser.onend = function () {
    if (cbEnd) cbEnd()
  }
  
  return parser
}

exports.Parser = Parser