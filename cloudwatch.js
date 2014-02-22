
var AWS = require('aws-sdk'),
    fs  = require('fs'),
    _   = require('underscore')

var timestamp = 0, lag = 60
var config = _.defaults(eval('c='+fs.readFileSync(process.argv[2])), {
  metrics:  [],
  backends: [],
  interval: 60,
})

AWS.config.update(config)
AWS.config.apiVersions = {
  cloudwatch: '2010-08-01',
}
var cloudwatch = new AWS.CloudWatch()
var backends = _.map(config.backends, function(spec, i) {
  backend = require(spec)
  if (!backend.init(config)) {
    console.log('[cloudwatchd] failed to load backend', spec)
    process.exit(1)
  }
  return backend
})

function run() {
  var now = new Date(new Date().getTime() - lag * 1000)
  var start = timestamp
    ? new Date(timestamp)
    : new Date(now.getTime() - (config.interval * 1000))
  timestamp = now.getTime()

  _.each(config.metrics, function(m) {
    run_metric(m, start, now)
  })
}

function run_metric(metric, start, end) {
  var params = {
    Namespace: metric.Namespace,
    MetricName: metric.MetricName,
    StartTime: start.toISOString(),
      EndTime: end.toISOString(),
    Statistics: [metric.Statistic],
    Dimensions: metric.Dimensions || [],
    Period: '60',
    Unit: metric.Unit
  }

  if (config.dumpMessages)
    console.log(params)

  cloudwatch.getMetricStatistics(params, function(error, response) {
    if (error) {
      return console.error("[cloudwatchd] error:", error)
    }

    if (config.dumpMessages)
      console.log(response)

    _.each(response.Datapoints, function(dp) {
      if (config.debug) {
        console.log('[cloudwatchd]', dp.Timestamp,
          metric.Namespace, metric.MetricName, dp[metric.Statistic])
      }

      send_datapoint_to_backends(metric, dp)
    })
  })
}

function send_datapoint_to_backends(metric, dp) {
  var time = new Date(dp.Timestamp)
  var value = dp[metric.Statistic]

  _.each(backends, function(b) {
    b.send(time, metric, value)
  })
}

process.title = 'cloudwatchd'
process.on('exit', function() {
  if (config.debug)
    console.log('exiting')
})

run() || setInterval(run, config.interval * 1000)
