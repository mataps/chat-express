
/*
 * GET home page.
 */

exports.index = function(req, res) {
	var templateVars = {
		title: 'TapzTestSite'
	};
	res.render('index', templateVars);
};