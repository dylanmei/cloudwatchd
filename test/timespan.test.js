var expect = require('chai').expect,
    Timespan = require('../lib/timespan')

describe('period validation', function() {
  it('should reject periods that are not a multiple of 60', function() {
    expect(function() { new Timespan(61) })
      .to.throw(RangeError)
  })
})

describe('60s period', function() {
  var ts = new Timespan(60)

  describe('executed at 12:00:01', function() {
    var start = ts.start(new Date('2014-02-23T12:00:01.000Z')),
        end   = ts.end(start)

    it ('should start at 11:58', function() {
      expect(start.toISOString()).to.equal('2014-02-23T11:58:00.000Z')
    })

    it ('should end at 11:59', function() {
      expect(end.toISOString()).to.equal('2014-02-23T11:59:00.000Z')
    })
  })

  describe('executed at 12:01:01', function() {
    var start = ts.start(new Date('2014-02-23T12:01:01.000Z')),
        end   = ts.end(start)

    it ('should start at 11:59', function() {
      expect(start.toISOString()).to.equal('2014-02-23T11:59:00.000Z')
    })

    it ('should end at 12:00', function() {
      expect(end.toISOString()).to.equal('2014-02-23T12:00:00.000Z')
    })
  })
})

describe('300s period', function() {
  var ts = new Timespan(300)

  describe('executed at 12:00:01', function() {
    var start = ts.start(new Date('2014-02-23T12:00:01.000Z')),
        end   = ts.end(start)

    it ('should start at 11:50', function() {
      expect(start.toISOString()).to.equal('2014-02-23T11:50:00.000Z')
    })

    it ('should end at 11:55', function() {
      expect(end.toISOString()).to.equal('2014-02-23T11:55:00.000Z')
    })
  })

  describe('executed at 12:01:01', function() {
    var start = ts.start(new Date('2014-02-23T12:01:01.000Z')),
        end   = ts.end(start)

    it ('should start at 11:50', function() {
      expect(start.toISOString()).to.equal('2014-02-23T11:50:00.000Z')
    })

    it ('should end at 11:55', function() {
      expect(end.toISOString()).to.equal('2014-02-23T11:55:00.000Z')
    })
  })

  describe('executed at 12:31:01', function() {
    var start = ts.start(new Date('2014-02-23T12:31:01.000Z')),
        end   = ts.end(start)

    it ('should start at 12:20', function() {
      expect(start.toISOString()).to.equal('2014-02-23T12:20:00.000Z')
    })

    it ('should end at 12:25', function() {
      expect(end.toISOString()).to.equal('2014-02-23T12:25:00.000Z')
    })
  })

  describe('executed at 00:06:01', function() {
    var start = ts.start(new Date('2014-02-23T00:06:01.000Z')),
        end   = ts.end(start)

    it ('should start the day before at 11:55', function() {
      expect(start.toISOString()).to.equal('2014-02-22T23:55:00.000Z')
    })

    it ('should end at midnight', function() {
      expect(end.toISOString()).to.equal('2014-02-23T00:00:00.000Z')
    })
  })
})

describe('600s period', function() {
  var ts = new Timespan(600)

  describe('executed at 12:00:01', function() {
    var start = ts.start(new Date('2014-02-23T12:00:01.000Z')),
        end   = ts.end(start)

    it ('should start at 11:45', function() {
      expect(start.toISOString()).to.equal('2014-02-23T11:45:00.000Z')
    })

    it ('should end at 11:55', function() {
      expect(end.toISOString()).to.equal('2014-02-23T11:55:00.000Z')
    })
  })

  describe('executed at 12:01:01', function() {
    var start = ts.start(new Date('2014-02-23T12:01:01.000Z')),
        end   = ts.end(start)

    it ('should start at 11:45', function() {
      expect(start.toISOString()).to.equal('2014-02-23T11:45:00.000Z')
    })

    it ('should end at 11:55', function() {
      expect(end.toISOString()).to.equal('2014-02-23T11:55:00.000Z')
    })
  })

  describe('executed at 00:06:01', function() {
    var start = ts.start(new Date('2014-02-23T00:06:11.000Z')),
        end   = ts.end(start)

    it ('should start the day before at 11:50', function() {
      expect(start.toISOString()).to.equal('2014-02-22T23:50:00.000Z')
    })

    it ('should end at midnight', function() {
      expect(end.toISOString()).to.equal('2014-02-23T00:00:00.000Z')
    })
  })
})
