exports.fixtures =
  '1': 'js/test/fixtures/fixture1.enex'
  '2': 'js/test/fixtures/fixture2.enex'
  '3': 'js/test/fixtures/fixture3.enex'
  '4': 'js/test/fixtures/fixture4.enex'
  'note': 'js/test/fixtures/note.enex'
  'image': 'js/test/fixtures/fixture_image.enex'
  'pngImage': 'js/test/fixtures/fixture_image.png'

# TZOffsetMinutes: Time zone offsets in minutes, to make tests free from time zone dependency, especially for Travis-CI.
exports.TZOffsetMinutes = (new Date).getTimezoneOffset()
