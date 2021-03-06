/**
 * node-jobcan-client -  Unofficial client library for JobCan
 * https://github.com/mugifly/jobcan-webapi
 * (C) 2016 - mugifly; Released under MIT License.
 */

'use strict';

var querystring = require('querystring'), extend = require('util')._extend,
	cheerio = require('cheerio'), request = require('request');

var helper = require(__dirname + '/models/helper');


/**
 * Initialize an object of Client
 * @class JobCan Client
 * @constructor
 * @param {Object} [options]  Option parameters
 * @param {Object} [options.defaultHttpHeaders]   Default http headers
 */
var Client = function (options) {

	this.BASE_URL = 'https://ssl.jobcan.jp';

	if (options === undefined) options = {};

	this.defaultHttpHeaders = options.defaultHttpHeaders || {};
	this.defaultHttpHeaders['User-Agent'] = this.defaultHttpHeaders['User-Agent'] || 'NodeJobcanClient';

};


/**
 * Execution of authentication
 * @param  {String} company_id        Company ID of JobCan
 * @param  {String} group_manager_id  Group Manager ID of JobCan
 * @param  {String} password          Group Manager Password of JobCan
 * @param  {Client~authCallback} [callback]	  Callback function
 */
Client.prototype.auth = function (company_id, group_manager_id, password, callback) {

	var self = this;

	request.post({
		url: self.BASE_URL + '/login/client',
		formData: {
			client_login_id: company_id,
			client_manager_login_id: group_manager_id,
			client_login_password: password,
			url: 'https://ssl.jobcan.jp/client/',
			login_type: 2
		},
		followRedirect: false,
		headers: self.defaultHttpHeaders,
		jar: true
	}, function (err, res, body) {

		if (err && callback) return callback(err, null);
		if (err) throw err;

		var cookies = {};
		var cookies_header = res.headers['set-cookie'].toString().split(/;/);
		cookies_header.forEach(function (data) {

			var d = data.split('=');
			var key = d[0];
			cookies[key] = d[1];

		});

		if (!cookies['sid']) return callback(new Error('Could not get session id'), null);

		request.get({
			url: self.BASE_URL + '/login/client',
			followRedirect: false,
			headers: self.defaultHttpHeaders,
			jar: true
		}, function (err, res, body) {

			if (err) return callback(err, null);

			if (callback) callback(null, cookies['sid']);

		});

	});



};


/**
 * Get the work states.
 * @param  {Object}                   [Options]  Optinal parameters
 * @param  {Client~getWorkStatesCallback} callback   Callback function
 */
Client.prototype.getWorkStates = function (opt_options, callback) {

	var self = this;

	var options = extend({}, opt_options || {});
	options['submit_type'] = options['submit_type'] || 'today';
	options['searching'] = 1;
	options['list_type'] = 'normal';
	options['number_par_page'] = 30;
	options['group_where_type'] = 'both';
	options['adit_group_id'] = options['adit_group_id'] || 0; // All places
	options['retirement'] = options['retirement'] || 'work'; // Not retired
	options['work_kind%5B0%5D'] = 0;
	options['group_id'] = options['group_id'] || 0;
	options['year'] = options['year'] || null;
	options['month'] = options['month'] || null;
	options['day'] = options['day'] || null;

	request.get({
		url: self.BASE_URL + '/client/work-state/show/?' + querystring.stringify(options),
		followRedirect: false,
		headers: self.defaultHttpHeaders,
		jar: true
	}, function (err, res, body) {

		if (err) return callback(err, null);

		var $ = cheerio.load(body, {
			decodeEntities: false
		});

		var $result = $('#wrap-basic-shift-table');
		$result = $($result.find('table')[1]);

		var items = [];
		var $trs = $result.find('tr') || [];
		for (var i = 0, l = $trs.length; i < l; i++) {

			if (i == 0) continue;

			var $tds = $($trs[i]).children('td') || [];

			if ($($tds[0]).text().length == 0 || $($tds[0]).find('b').text().length == 0) continue;

			var come_time = helper.removeSpaces($($tds[4]).find('div').text().replace(new RegExp(/[^\d:]/g), ''));
			if (come_time == '') {
				come_time = null;
			}

			var out_time = helper.removeSpaces($($tds[5]).find('div').text().replace(new RegExp(/[^\d:]/g), ''));
			if (out_time == '') {
				out_time = null;
			}

			items.push({
				name: helper.removeSpaces($($tds[0]).find('b').text()),
				groupName: helper.removeSpaces($($tds[0]).find('font').text()),
				state: helper.removeSpaces($($tds[2]).text()),
				comeTime: come_time,
				outTime: out_time,
				workTime: helper.convertTimeStrToSeconds(helper.removeSpaces($($tds[6]).text())),
				breakTime: helper.convertTimeStrToSeconds(helper.removeSpaces($($tds[7]).text())),
				allowanceYen: (come_time == null) ? null : parseInt($($tds[8]).text().replace(new RegExp(/[^\d]/g), ''))
			});

		}

		callback(null, items);

	});

};


/**
 * Get the work summaries.
 * @param  {Object}                   [Options]  Optinal parameters
 * @param  {Client~getWorkSummariesCallback} callback   Callback function
 */
Client.prototype.getWorkSummaries = function (opt_options, callback) {

	var self = this;

	var options = extend({}, opt_options || {});
	options['submit_type'] = options['submit_type'] || 'term';
	options['searching'] = 1;
	options['list_type'] = 'normal';
	options['number_par_page'] = 180;
	options['group_where_type'] = 'both';
	options['adit_group_id'] = options['adit_group_id'] || 0; // All places
	options['retirement'] = options['retirement'] || 'work'; // Not retired
	options['work_kind%5B0%5D'] = 0;
	options['group_id'] = options['group_id'] || 0;
	options['fromYear'] = options['fromYear'] || null;
	options['fromMonth'] = options['fromMonth'] || null;
	options['fromDay'] = options['fromDay'] || null;
	options['toYear'] = options['toYear'] || null;
	options['toMonth'] = options['toMonth'] || null;
	options['toDay'] = options['toDay'] || null;

	request.get({
		url: self.BASE_URL + '/client/work-summary/show/?' + querystring.stringify(options),
		followRedirect: false,
		headers: self.defaultHttpHeaders,
		jar: true
	}, function (err, res, body) {

		if (err) return callback(err, null);

		var $ = cheerio.load(body, {
			decodeEntities: false
		});

		var $result = $('#wrap-basic-shift-table');
		$result = $($result.find('table')[1]);

		var items = [];
		var $trs = $result.find('tr') || [];
		for (var i = 0, l = $trs.length; i < l; i++) {

			if (i == 0) continue;

			var $tds = $($trs[i]).find('td') || [];
			if ($($tds[0]).text().length == 0) continue;

			items.push({
				name: helper.removeSpaces($($tds[0]).text()),
				groupName: helper.removeSpaces($($tds[2]).text()),
				workTime: helper.convertTimeStrToSeconds(helper.removeSpaces($($tds[3]).text())),
				breakTime: helper.convertTimeStrToSeconds(helper.removeSpaces($($tds[4]).text())),
				allowanceYen: ($($tds[5]).text() == '-') ? null : $($tds[5]).text().replace(new RegExp(/[^\d]/g), '')
			});

		}

		callback(null, items);

	});

};


/**
 * Get a work summary of all employees in the period
 * @deprecated Use {@link Client#getWorkSummariesInPeriod}
 * @param  {Date}   start_date    Start date
 * @param  {Date}   end_date      End date
 * @param  {Object}  [opt_options]  Optional paramters
 * @param  {Client~getWorkSummariesCallback} callback    Callback function
 */
Client.prototype.getWorkSummariesInPerm = function (start_date, end_date, opt_options, callback) {

	this.getWorkSummariesInPeriod(start_date, end_date, opt_options, callback);

};


/**
 * Get a work summary of all employees in the period
 * @param  {Date}   start_date    Start date
 * @param  {Date}   end_date      End date
 * @param  {Object}  [opt_options]  Optional paramters
 * @param  {Client~getWorkSummariesCallback} callback    Callback function
 */
Client.prototype.getWorkSummariesInPeriod = function (start_date, end_date, opt_options, callback) {

	var self = this;

	var options = extend({}, opt_options || {});
	options['fromYear'] = start_date.getFullYear();
	options['fromMonth'] = start_date.getMonth() + 1;
	options['fromDay'] = start_date.getDate();
	options['toYear'] = end_date.getFullYear();
	options['toMonth'] = end_date.getMonth() + 1;
	options['toDay'] = end_date.getDate();

	return self.getWorkSummaries(options, callback);

};


/**
 * Get a work summary of all employees in this month
 * @param  {Object}  [opt_options]  Optional paramters
 * @param  {Client~getWorkSummariesCallback} callback    Callback function
 */
Client.prototype.getWorkSummariesInThisMonth = function (opt_options, callback) {

	var self = this;

	var date = new Date();
	var start_date = new Date(date.getFullYear(), date.getMonth(), 1);
	var end_date = new Date(date.getFullYear(), date.getMonth() + 1, 0);

	return self.getWorkSummariesInPeriod(start_date, end_date, opt_options, callback);

};


/**
 * Get a work summary of all employees in this week
 * @param  {Object}  [opt_options]  Optional paramters
 * @param  {Client~getWorkSummariesCallback} callback    Callback function
 */
Client.prototype.getWorkSummariesInThisWeek = function (opt_options, callback) {

	var self = this;

	var date = new Date();
	var start_date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay(), 0, 0, 0);
	var end_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

	return self.getWorkSummariesInPeriod(start_date, end_date, opt_options, callback);

};


// ----

/**
 * Callback of auth(...) method
 * @callback Client~authCallback
 * @param {Error} error         Error object (If something happened)
 * @param {String} session_id   Session ID
 */

/**
 * Callback of getWorkStates(...) method
 * @callback Client~getWorkStatesCallback
 * @param {Error} error         Error object (If something happened)
 * @param {Object[]} work_states   Array of work states
 * @param {String} work_states[].name        Name of employee - e.g. 'Taro Tanaka'
 * @param {String} work_states[].groupName   Group name of employee - e.g. 'Head Office'
 * @param {String} work_states[].state   State of employee - e.g. '未出勤'
 * @param {String} work_states[].comeTime   Come time of employee - e.g. '10:00'
 * @param {String} work_states[].outTime   Out time of employee - e.g. '19:00'
 * @param {Number} work_states[].workTime    Working time (seconds) - e.g. 28800
 * @param {Number} work_states[].breakTime   Breaking time (seconds) - e.g. 3600
 * @param {Number} work_states[].allowanceYen  Allowance of employee (YEN) - e.g. 10500
 */

/**
 * Callback of getWorkSummaries(...) method
 * @callback Client~getWorkSummariesCallback
 * @param {Error} error         Error object (If something happened)
 * @param {Object[]} work_summaries   Array of work summaries
 * @param {String} work_summaries[].name        Name of employee - e.g. 'Taro Tanaka'
 * @param {String} work_summaries[].groupName   Group name of employee - e.g. 'Head Office'
 * @param {String} work_summaries[].workTime    Working time (seconds) - e.g. 28800
 * @param {String} work_summaries[].breakTime   Breaking time (seconds) - e.g. 3600
 * @param {Number} work_summaries[].allowanceYen  Allowance of employee (YEN) - e.g. 10500
 */

// ----

module.exports = Client;
