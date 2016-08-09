'use strict';


/**
 * Helper static class
 * @namespace
 */
var Helper = function () {

	throw 'This class can only be used as static class.';

};


/**
 * Remove space characters
 * @param  {String} str Source string
 * @return {String}     Processed string
 */
Helper.removeSpaces = function (str) {

	return str.replace(new RegExp(/(\s|&nbsp;)/g), '');

};


/**
 * Convert the time string to seconds
 * @param {String} str  Source string
 * @param {Number} seconds
 */
Helper.convertTimeStrToSeconds = function (str) {

	if (str.match(/(\d+)時間(\d+)分/)) {

		var h = RegExp.$1;
		var m = RegExp.$2;

		return (h * 60 * 60) + (m * 60);

	}

	return 0;

};


// ----


module.exports = Helper;
