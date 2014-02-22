
var SysLogger = require('ain2'),
    _         = require('underscore')

var debug, dumpMessages
var syslog, tags
var formats = {
  'message-only': function(message, severity) {
    return new Buffer(message)
  }
}

exports.init = function(config) {
  debug = config.debug
  dumpMessages = config.dumpMessages
  config = _.defaults(config.syslog || {}, {
    type: 'udp',
    facility: 'user',
    tags: {},
  })

  tags = config.tags
  syslog = new SysLogger({
    transport: type_to_transport(config.type),
    tag: 'cloudwatchd',
    facility: config.facility,
    address: config.host,
    port: config.port,
  })

  if (config.format) {
    var formatter = formats[config.format]
    if (formatter) {
      syslog.setMessageComposer(formatter)
    }
  }

  return syslog ? 1 : 0
}

function type_to_transport(type) {
  return type == 'unix' ? 'unix_dgram' : 'UDP'
}

exports.send = function(time, metric, value) {
  var message = {
    time: time.toISOString(),
    Namespace:  metric.Namespace,
    MetricName: metric.MetricName,
    Unit:       metric.Unit,
    Statistic:  metric.Statistic,
    Value:      value,
  }

  _.each(metric.Dimensions, function(d) {
    message[d.Name] = d.Value
  })

  _.each(tags, function(value, name) {
    if (!message[name]) message[name] = value
  })

  if (dumpMessages)
    console.log(message)

  syslog.log(JSON.stringify(message))
}
