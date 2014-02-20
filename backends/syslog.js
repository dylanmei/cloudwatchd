
var bunyan = require('bunyan'),
    syslog = require('bunyan-syslog'),
    _      = require('underscore')

var log 

exports.init = function(config) {
  config = _.defaults(config.syslog || {}, {
    type:     'udp',
    host:     '127.0.0.1',
    port:     514,
    facility: 'local0',
  })

  log = bunyan.createLogger({
    name: 'cloudwatch',
    streams: [{
      level: 'info',
      type: 'raw',
      stream: syslog.createBunyanStream({
        type: config.type,
        facility: syslog[config.facility],
        host: config.host,
        port: Number(config.port)
      })
    }]
  })

  return log ? 1 : 0
}

exports.send = function(time, metric, value) {
  console.log('[syslog]', time, metric.MetricName, value)

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

  log.info(message)
}
