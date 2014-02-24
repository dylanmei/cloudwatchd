## cloudwatchd

A CloudWatch metric collection daemon.

[![wercker status](https://app.wercker.com/status/5ead0be72bd499019f0742d7d72ace66/m/ "wercker status")](https://app.wercker.com/project/bykey/5ead0be72bd499019f0742d7d72ace66)

## Configuration

Add the following basic configuration information to the StatsD configuration file.

```
{
  debug: true,
  dumpMessages: true,
  region: 'us-west-2',
  accessKeyId: 'ABC',
  secretAccessKey: 'XYZ123',
  period: 60,
  metrics: [{
    "Namespace": "AWS/EC2",
    "MetricName": "CPUUtilization",
    "Statistic": "Average",
    "Unit": "Percent",
    "Dimensions": [{ "Name": "InstanceId", "Value": "i-abc123" }]
  }],
  backends: ['./backends/syslog'],
  syslog: {
    facility: 'local0',
    transport: 'unix',
    vars: {
      'Environment': 'test',
    },
  }
}
```

- `region` is required
- `period` defaults to 60 and must be a multiple of 60
- `metrics` is an array of strings that match the JSON *params* described in the [AWS CloudWatch JavaScript SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#getMetricStatistics-property)
- `accessKeyId` and `secretAccessKey` values are required unless
  - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are available as environment variables
  -  the process is running on an EC2 instance configured with an instance-profile with permissions to read statistics from CloudWatch.

Additionally, check out the puppet module: [dylanmei/puppet-cloudwatchd](https://github.com/dylanmei/puppet-cloudwatchd)
