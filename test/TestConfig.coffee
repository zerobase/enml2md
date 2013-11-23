exports.fixtures =
  '1': './test/fixtures/fixture1.enex'
  '2': './test/fixtures/fixture2.enex'
  'note': './test/fixtures/note.enex'
  'image': './test/fixtures/fixture_image.enex'
  'pngImage': './test/fixtures/fixture_image.png'

# TZOffsetMinutes: Time zone offsets in minutes, to make tests free from time zone dependency, especially for Travis-CI.
exports.TZOffsetMinutes = (new Date).getTimezoneOffset()
