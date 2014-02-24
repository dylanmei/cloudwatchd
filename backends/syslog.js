
var SysLogger = require('ain2'),
    _         = require('underscore')

var debug, dumpMessages
var syslog, vars
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
    vars: {},
  })

  var addr = addr_to_array(config.addr)
  var host = config.host || addr[0]
  var port = config.port || addr[1]
  var transport = type_to_transport(config.type)

  if (transport == 'UDP') {
    if (!host || !port) {
      console.log('[cloudwatchd] no host:port defined for udp transport')
      return 0
    }
  }

  vars = config.vars
  syslog = new SysLogger({
    transport: type_to_transport(config.type),
    tag: 'cloudwatchd',
    facility: config.facility,
    address: host,
    port: port,
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

function addr_to_array(addr) {
  var m = (addr || '').match(/([\w\.]+):([\d]+)/)
  return m ? m.slice(1) : []
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

  _.each(vars, function(value, name) {
    if (!message[name]) message[name] = value
  })

  if (dumpMessages)
    console.log(message)

  syslog.log(JSON.stringify(message))
}
