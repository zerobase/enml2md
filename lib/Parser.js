var sax = require("sax"),
  Note = require('./Note').Note

var Parser = function (enex, cbEach, cbEnd) {
  var strict = true // sax.parser: set to false for html-mode
  var parser = sax.parser(strict, {trim: false, normalize: false})
  
  parser.note_composers = {
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
      parser.note.attachments.push(text) // base64 string
    }
  }
  parser.onopentag = function (node) {
    if (node.name == 'note') {
      this.note = new Note
    } else {
      this.current_element = node.name
    }
  }
  parser.ontext = function (text) {
    var note_composer = this.note_composers[this.current_element]
    if (typeof note_composer == 'function') {
      note_composer(text)
    }
  }
  parser.onopencdata = function () {
    this.cdata = ''
  }
  parser.oncdata = function (text) {
    this.cdata = text
  }
  parser.onclosecdata = function () {
    this.note.content = Note.parseENMLContent(this.cdata)
    // TODO: parse inside CDATA to obtain attachments
  }
  parser.onclosetag = function (nodeName) {
    if (nodeName == 'note') {
      enex.count = enex.count + 1
      if (cbEach) cbEach(this.note)
    } else {
      // ignore
    }
  }
  parser.onend = function () {
    if (cbEnd) cbEnd()
  }
  
  return parser
}

exports.Parser = Parser