exports.fixtures =
  '1': 'test/fixtures/fixture1.enex'
  '2': 'test/fixtures/fixture2.enex'
  '3': 'test/fixtures/fixture3.enex'
  '4': 'test/fixtures/fixture4.enex'
  '5': 'test/fixtures/fixture5.enex'
  'note': 'test/fixtures/note.enex'
  'image': 'test/fixtures/fixture_image.enex'
  'pngImage': 'test/fixtures/fixture_image.png'
  'ce332.png': 'test/fixtures/ce33294de7e0db8c113933fcafffc3d2.png'

# TZOffsetMinutes: Time zone offsets in minutes, to make tests free from time zone dependency, especially for Travis-CI.
exports.TZOffsetMinutes = (new Date).getTimezoneOffset()
