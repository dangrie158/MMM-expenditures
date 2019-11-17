/* global Module */

/* Magic Mirror
 * Module: MMM-expenditures
 *
 * By dangrie158
 * MIT Licensed.
 */
var NodeHelper = require("node_helper");
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
			self.updateExpenditures(payload.config.host);

			setInterval(function () { self.updateExpenditures(payload.config.host, payload.config.lastExpenditures); }, payload.config.reloadInterval);
		}
	},

	updateExpenditures: function (host, limit) {
		var self = this;
		var expenditures_url = host + '/api/expenditures?limit=' + limit;
		var balanceUrl = host + '/api/current-status';

		request(expenditures_url, function (error, response, expendituresBody) {
			if (!error && response.statusCode == 200) {
				request(balanceUrl, function (error, response, balanceBody) {
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