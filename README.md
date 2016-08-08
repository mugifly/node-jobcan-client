# node-jobcan-client

Node.js module of an unofficial client library for [JobCan](http://jobcan.ne.jp/).

[![npm](https://img.shields.io/npm/v/jobcan-client.svg?maxAge=2592000)](https://www.npmjs.com/package/jobcan-client)


----


## Notice

* This is an unofficial library for convenience of users and managers.
* We don't guarantee about this library.
* We don't have relationship with the company of [JobCan](http://jobcan.ne.jp/).


----


## Get Started

You can install with using npm:
``$ npm install --save jobcan-client``

The following is an example code.

```js
var JobCan = require('jobcan-client');
var client = new JobCan();

// Execute authentication
client.auth(YOUR_COMPANY_ID, YOUR_GROUP_MANAGER_ID, YOUR_PASSWORD, function (error, session_id) {

	if (error) throw error;

	// Get a work summary of all employees in this month
	client.getWorkSummariesInThisMonth(function (error, employees) {

		if (error) throw error;

		employees.forEach(function (employee, index) {
			console.log(employee.name);
		});

	});

});
```


----


## Methods

### getWorkSummariesInThisMonth(opt_options, callback)

Get a work summary of all employees in this month.

#### Arguments

* **{Object} opt_options**:  Option parameters. (Optional)
* **{Function} callback**:  Callback function. ``function (error, items)``

#### Callback

It's same with getWorkSummaries(...) method.


### getWorkSummariesInPerm(start_date, end_date, opt_options, callback)

Get a work summary of all employees in the period.

#### Arguments

* **{Date} start_date**
* **{Date} end_date**
* **{Object} opt_options**:  Option parameters. (Optional)
* **{Function} callback**:  Callback function. ``function (error, items)``

#### Callback

It's same with getWorkSummaries(...) method.


### getWorkSummaries(opt_options, callback)

Get the work summaries.

#### Arguments

* **{Object} opt_options**:  Option parameters. (Optional)
* **{Function} callback**:  Callback function. ``function (error, items)``

#### Callback

* **{Error} error** - Error object (If something happened)
* **{Array} items** - Array of [Work Summary object](#workSummaryObject).


----


## Objects

### <a id="workSummaryObject">Work Summary</a>

Example:

```
{
    name: 'Taro Tanaka',
    groupName: 'Head Office',
    workTime: 28800,
    breakTime: 3600,
    allowanceYen: 10500
}
```


----


## License

```
The MIT License (MIT)
Copyright (c) 2016 Masanori Ohgita
```
