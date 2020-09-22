/* global Module */

/* Magic Mirror
 * Module: MMM-expenditures
 *
 * By dangrie158
 * MIT Licensed.
 */
var NodeHelper = require("node_helper");
const { head } = require("request");
var request = require("request");


module.exports = NodeHelper.create({
	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function (notification, payload) {
		var self = this;

		if (notification === "GET_EXPENDITURES") {
			self.updateExpenditures(payload.config);

			setInterval(function () { self.updateExpenditures(payload.config); }, payload.config.reloadInterval);
		}
	},

	updateExpenditures: function (config) {
		var self = this;
		var expenditures_url = config.host + '/api/expenditures?limit=' + config.lastExpenditures;
		var balanceUrl = config.host + '/api/current-status';
		var auth = "Basic " + Buffer.from(config.username + ":" + config.password).toString("base64");
		var headers = {
			"Authorization": auth
		}
		request({ url: expenditures_url, headers: headers }, function (error, response, expendituresBody) {
			if (!error && response.statusCode == 200) {
				request({ url: balanceUrl, headers: headers }, function (error, response, balanceBody) {
					if (!error && response.statusCode == 200) {
						let payload = {
							expenditures: JSON.parse(expendituresBody),
							balance: JSON.parse(balanceBody)
						}
						self.sendSocketNotification("NEW_EXPENDITURES", payload);
					}
				});
			}
		});
	}
});
