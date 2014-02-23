
var AWS      = require('aws-sdk'),
    Timespan = require('./lib/timespan'),
    fs       = require('fs'),
    _        = require('underscore');

var ts, config = _.defaults(eval('c='+fs.readFileSync(process.argv[2])), {
  metrics:  [],
  backends: [],
  period: 60,
})

if (!config.region) {
  console.error('[cloudwatchd] config is missing "region"')
  process.exit(1)
}

AWS.config.update(config)
AWS.config.apiVersions = {
  cloudwatch: '2010-08-01',
}
var cloudwatch = new AWS.CloudWatch()
var backends = _.map(config.backends, function(spec, i) {
  backend = require(spec)
  if (!backend.init(config)) {
    console.error('[cloudwatchd] failed to load backend', spec)
    process.exit(1)
  }
  console.log('[cloudwatchd] loaded backend', spec)
  return backend
})

function run() {
  var start = ts.start()
  var end = ts.end(start)

  if (config.debug) {
    console.log('[cloudwatchd] pulling for time period:',
      start.toISOString(), '-', end.toISOString())
  }

  _.each(config.metrics, function(m) {
    run_metric(m, start, end)
  })
}

function run_metric(metric, start, end) {
  var params = {
    Namespace:  metric.Namespace,
    MetricName: metric.MetricName,
    StartTime:  start.toISOString(),
    EndTime:    end.toISOString(),
    Statistics: [metric.Statistic],
    Dimensions: metric.Dimensions || [],
    Period:     ts.period,
    Unit:       metric.Unit,
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
    console.log('[cloudwatchd] exiting')
})

ts = new Timespan(config.period)
console.log('[cloudwatchd] running at', ts.period, 'second intervals')

run() || setInterval(run, ts.ticks)
