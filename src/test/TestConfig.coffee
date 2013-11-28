# TZOffsetMinutes: Time zone offsets in minutes, to make tests free from time zone dependency, especially for Travis-CI.
exports.TZOffsetMinutes = tzOffs = (new Date).getTimezoneOffset()

exports.fixtures =
  '1_note.enex': 'test/fixtures/1_note.enex'
  '1_note.enex.created': new Date 2013, 10, 2, 10, 0-tzOffs, 55 # 20131102T100055Z
  '1_note.enex.updated': new Date 2013, 10, 2, 10, 3-tzOffs, 49 # 20131102T100349Z
  '2_notes.enex': 'test/fixtures/2_notes.enex'
  '2_notes.enex.fileName0': 'Enml2md test fixture note 1.md'
  '2_notes.enex.fileName1': 'Enml2md test fixture note 2.md'
  '2_attachments.enex': 'test/fixtures/2_attachments.enex'
  '2_attachments.enex.hash0': 'b1946ac92492d2347c6235b4d2611184'
  '2_attachments.enex.hash1': '591785b794601e212b260e25925636fd'
  'file-name.enex': 'test/fixtures/file-name.enex'
  'en-media_end_tag.enex': 'test/fixtures/en-media_end_tag.enex'
  'note.enex': 'test/fixtures/note.enex'
  'note.enex.created': new Date 2013, 10, 2, 10, 7-tzOffs, 9 # 20131102T100709Z
  'note.enex.updated': new Date 2013, 10, 2, 10, 7-tzOffs, 13  # 20131102T100713Z
  'image.enex': 'test/fixtures/image.enex'
  'image.png': 'test/fixtures/image.png'
  'image.png.hash': '095619d89dbbd6a0c5704d57e444f708'
  'ce332.png': 'test/fixtures/ce332.png'
  'ce332.png.hash': 'ce33294de7e0db8c113933fcafffc3d2'
