/* global Module */

/* Magic Mirror
 * Module: MMM-expenditures
 *
 * By dangrie158
 * MIT Licensed.
 */
Module.register("MMM-expenditures", {

	defaults: {
		host: undefined,
		reloadInterval: 1 * 60 * 1000, // every minute,
		lastExpenditures: 10
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	// Define required scripts.
	getStyles: function () {
		return ["MMM-expenditures.css"];
	},

	// Load translations files
	getTranslations: function() {
		return {
			en: "translations/en.json",
			de: "translations/de.json"
		};
	},

	// Overrides start function.
	start: function () {
		var self = this;
		Log.log("Starting module: " + self.name);

		self.balance = [["", 0], ["", 0]];
		self.expenditures = [];
		self.sendSocketNotification("GET_EXPENDITURES", { "config": self.config });
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		var self = this;

		if (notification === "NEW_EXPENDITURES") {
			self.balance = payload.balance;
			self.expenditures = payload.expenditures;
			self.updateDom();
		}
	},

	// Override dom generator.
	getDom: function () {
		var self = this;

		var wrapper = document.createElement("div");

		var headerWrappper = document.createElement("header");
		headerWrappper.innerHTML = self.translate("CURRENT_BALANCE")  + self.calculateBalance(self.balance);
		wrapper.appendChild(headerWrappper);

		var tableWrapper = document.createElement("table");
		tableWrapper.className = "expenditure";

		for (var i in self.expenditures) {

			Log.warn(self.expenditures[i]);

			var currentValue = self.departure[i];

			// Row
			var trWrapper = document.createElement("tr");

			// Reason
			var reasonWrapper = document.createElement("td");
			reasonWrapper.className = "reason";

			reasonWrapper.innerHTML = currentValue.reason
			trWrapper.appendChild(reasonWrapper);

			// User
			var userWrapper = document.createElement("td");
			userWrapper.className = "user";
			userWrapper.innerHTML = currentValue.username
			trWrapper.appendChild(userWrapper);

			// Amount
			var amountWrapper = document.createElement("td");
			amountWrapper.className = "amount";
			amountWrapper.innerHTML = self.toCurrency(currentValue.amount);
			trWrapper.appendChild(amountWrapper);

			trWrapper.className = "small dimmed";
			tableWrapper.appendChild(trWrapper);
		}

		wrapper.appendChild(tableWrapper);
		return wrapper;
	},

	calculateBalance(balanceData){
		let self = this;
		if( balanceData[0][1] > balanceData[1][1] ){
			let higherBalance = balanceData[0];
			let lowerBalance = balanceData[1];
		}else{
			let higherBalance = balanceData[1];
			let lowerBalance = balanceData[0];
		}
		return lowerBalance[0] + ": " + self.toCurrency(lowerBalance[1] - higherBalance[1]);
	},

	toCurrency(value){
		let self = this;
		return (value / 100).toLocaleString(undefined, {style: "currency", currency: self.config.currency})
	}
});
