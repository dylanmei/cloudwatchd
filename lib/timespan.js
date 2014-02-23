var _ = require('underscore')

var Timespan = module.exports = function(period) {
  if (period == 0 || period % 60 != 0)
    throw new RangeError('a "period" is least 60 seconds and a multiple of 60')

  this.period = period
  this.ticks = period * 1000
}

_.extend(Timespan.prototype, {
  start: function(now) {
    var time = under_five_minutes(this.period)
      ? round_to_nearest_1(now || new Date())
      : round_to_nearest_5(now || new Date())

    if (this.period == 60) {
      // add a 1-minute lag
      time.setMinutes(time.getMinutes()-1)
    }
    else {
      var pmins = this.period / 60
      // some metrics (DynamoDB) are only fully
      // updated every 5 minutes; add a 5-min lag
      time.setMinutes(time.getMinutes()-Math.min(5, pmins))
    }

    return new Date(time.getTime() - this.ticks)
  },

  end: function(start) {
    return new Date(start.getTime() + this.ticks)
  },
})

function under_five_minutes(p) {
  return p < 300
}

function round_to_nearest_1(v) {
  var time = new Date(v.getTime())
  time.setMilliseconds(0)
  time.setSeconds(0)
  return time
}

function round_to_nearest_5(v) {
  var time = round_to_nearest_1(v)
  time.setMinutes(Math.floor(time.getMinutes() / 5) * 5)
  return time
}

