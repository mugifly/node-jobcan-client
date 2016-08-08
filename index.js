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
 * Constructor
 * @param {Object} options  Options
 */
var Client = function (options) {

	this.BASE_URL = 'https://ssl.jobcan.jp';

	if (options === undefined) options = {};

	this.defaultHttpHeaders = options.defaultHttpHeaders || {};
	this.defaultHttpHeaders['User-Agent'] = this.defaultHttpHeaders['User-Agent'] || 'NodeJobcanClient';

};


/**
 * Execution of authentication
 * @param  {String} company_id       [description]
 * @param  {String} group_manager_id [description]
 * @param  {String} password         [description]
 * @param  {Function} callback	- Callback function (error, session_id)
 */
Client.prototype.auth = function (company_id, group_manager_id, password, callback) {

	var self = this;

	request.post({
		url: self.BASE_URL + '/login/client/try',
		formData: {
			client_login_id: company_id,
			client_manager_login_id: group_manager_id,
			client_login_password: password,
			url: '/client',
			login_type: 2
		},
		followRedirect: false,
		headers: self.defaultHttpHeaders,
		jar: true
	}, function (err, res, body) {

		if (err) return callback(err, null);

		var cookies = {};
		var cookies_header = res.headers['set-cookie'].toString().split(/;/);
		cookies_header.forEach(function (data) {

			var d = data.split('=');
			var key = d[0];
			cookies[key] = d[1];

		});

		if (!cookies['sid']) return callback(new Error('Could not get session id'), null);

		callback(null, cookies['sid']);

	});



};


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


Client.prototype.getWorkSummariesInPerm = function (start_date, end_date, opt_options, callback) {

	this.getWorkSummariesInPeriod(start_date, end_date, opt_options, callback);

};


Client.prototype.getWorkSummariesInPeriod = function (start_date, end_date, opt_options, callback) {

	var self = this;

	var options = extend({}, opt_options || {});
	options['fromYear'] = start_date.getFullYear();
	options['fromMonth'] = start_date.getMonth() + 1;
	options['fromDate'] = start_date.getDate();
	options['toYear'] = end_date.getFullYear();
	options['toMonth'] = end_date.getMonth() + 1;
	options['toDate'] = end_date.getDate();

	return self.getWorkSummaries(options, callback);

};


Client.prototype.getWorkSummariesInThisMonth = function (opt_options, callback) {

	var self = this;

	var date = new Date();
	var start_date = new Date(date.getFullYear(), date.getMonth(), 1);
	var end_date = new Date(date.getFullYear(), date.getMonth() + 1, 0);

	return self.getWorkSummariesInPeriod(start_date, end_date, opt_options, callback);

};


// ----

module.exports = Client;
