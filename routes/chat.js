
/*
 * GET home page.
 */

exports.index = function(req, res) {
	var templateVars = {
		title: 'Chat'
	};
	res.render('chat', templateVars);
};