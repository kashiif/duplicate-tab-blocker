'use strict;'

/*********************************************************************************
* Author: Kashif Iqbal Khan
* Email: kashiif@gmail.com
* Mozilla Developer profile: https://addons.mozilla.org/en-US/firefox/user/1803731/
*********************************************************************************/

var EXPORTED_SYMBOLS = ["duplicateTabBlocker"];
/*************************************************************************************
* The core module for Duplicate Tab Blocker.
* Workflow:
*   bootstrap.startup() --------------------------------> duplicateTabBlocker.init()
*                       ---(for all existing windows)---> duplicateTabBlocker.bind()
*         window.load() --------------------------------> duplicateTabBlocker.bind()
*         window.unload() ------------------------------> duplicateTabBlocker.unbind()
*   bootstrap.shutdown() -------------------------------> duplicateTabBlocker.uninit()
**************************************************************************************/



var duplicateTabBlocker = {
  _propertyFile: null,

  /**
  * Initialization function of extension core module. Called once at the start-up/extension activation/extension upgrade
  */
	init: function(propertyFile) {
		var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                            .getService(Components.interfaces.nsIConsoleService);
    // temporary function
		this.debug = function (message) {
			consoleService.logStringMessage("Duplicate Tab Blocker: " + message);
		}
  
    Components.utils.import("resource://duplicate-tab-blocker/ext-contents/firefox/lib/common.jsm", this);

    this._propertyFile = propertyFile;
    this.logger.init("Duplicate Tab Blocker");

		// __debug__ // /* 
    // The code block between __debug__ will be removed by build script
		this.log = function (message) {
			this.logger.log(message);
		}
		this.debug = function (message) {
			this.logger.debug(message);
		}
		this.error = function (message) {
			this.logger.error(message);
		}
		// __debug__ // */

    // @ifdef PrefManager
    this._prefManager.watch(this.handlePrefChanged);
    // @endif

     
    this.debug("init complete");
  },

  /**
  * destructor function of extension core module. Called once at the extension deactivation
  */
	uninit: function() {

    this.debug("Uninit called. Extension is either disabled or uninstalled.");

    this._propertyFile.destroy();
    this.logger.destroy();

    // unloadCommonJsm comes from common.jsm module
    this.unloadCommonJsm();

    // unload whatever we loaded
    Components.utils.unload("resource://duplicate-tab-blocker/ext-contents/firefox/lib/common.jsm");
  },

	bind: function (window) {
		window.setTimeout(function() { duplicateTabBlocker._handleLoad(window); }, 500);		
	},
	
	unbind : function (window) {
		var document = window.document;
	
		// unbind gBrowser  event
		var gBrowser = document.getElementById("content");
	
	
	},

  /**
  * The delayed load handler for the windows
  */
	_handleLoad: function (window) {
		var document = window.document;

		// bind window event
		//window.addEventListener("some-window-event", duplicateTabBlocker._handleWindowEvent, false); 

		// bind gBrowser event
		var gBrowser = document.getElementById("content");
		//gBrowser.addEventListener("DOMContentLoaded", duplicateTabBlocker._handleDOMContentLoaded, false);
		
	},

  handlePrefChanged: function(prefName, newValue) {
  },
	
	log : function (message) {
	},

	debug : function (message) {
	},

	error : function (message) {
	},


};