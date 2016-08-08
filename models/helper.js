module.exports = {


	removeSpaces: function (str) {

		return str.replace(new RegExp(/(\s|&nbsp;)/g), '');

	},


	convertTimeStrToSeconds: function (str) {

		if (str.match(/(\d+)時間(\d+)分/)) {

			var h = RegExp.$1;
			var m = RegExp.$2;

			return (h * 60 * 60) + (m * 60);

		}

		return 0;

	}
	

};
