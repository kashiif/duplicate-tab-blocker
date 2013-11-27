'use strict;'
var duplicateTabBlockerOptions = {
	_consoleService: null,
	
	log : function (message) {
	},

	handleLoad: function (evt) {
    window.removeEventListener("load", duplicateTabBlockerOptions.handleLoad);
    window.setTimeout(function() {
        duplicateTabBlockerOptions.init();
      }, 200);		
	},

	init: function() {

		// __debug__ // /* 
		this._consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
		this.log = function (message) {
			this._consoleService.logStringMessage('duplicateTabBlocker: ' + message);
		}
		// __debug__ // */
	},



};

window.addEventListener("load", duplicateTabBlockerOptions.handleLoad, false);
