# node-jobcan-client

Node.js module of an unofficial client library for [JobCan](http://jobcan.ne.jp/).

[![npm](https://img.shields.io/npm/v/jobcan-client.svg?maxAge=2592000)](https://www.npmjs.com/package/jobcan-client)
[![Build Status](https://travis-ci.org/mugifly/node-jobcan-client.svg?branch=master)](https://travis-ci.org/mugifly/node-jobcan-client)


----


## Notice

* This module is published under testing phase.
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

See documents: https://mugifly.github.io/node-jobcan-client/Client.html


----


## License

```
The MIT License (MIT)
Copyright (c) 2016 Masanori Ohgita
```
