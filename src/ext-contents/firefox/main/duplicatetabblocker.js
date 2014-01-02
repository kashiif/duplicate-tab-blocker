'use strict;'

/*********************************************************************************
* Author: Kashif Iqbal Khan
* Email: kashiif@gmail.com
* Mozilla Developer profile: https://addons.mozilla.org/en-US/firefox/user/1803731/
* Copyright (c) Kashif Iqbal Khan 2013-2014
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

  /**
  * Initialization function of extension core module. Called once at the start-up/extension activation/extension upgrade
  */
	init: function() {
		var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                            .getService(Components.interfaces.nsIConsoleService);
    // temporary function
		this.debug = function (message) {
			consoleService.logStringMessage("Duplicate Tab Blocker: " + message);
		}
  
    Components.utils.import("resource://duplicate-tab-blocker/ext-contents/firefox/lib/common.jsm", this);

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
	
    this._restoreOriginalFunctions(window, gBrowser);
	
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
		
    
    this.overrideDefaultFunctions(window, gBrowser);
    
	},

  // @ifdef PrefManager
  handlePrefChanged: function(prefName, newValue) {
  },
  // @endif
	
	log : function (message) {
	},

	debug : function (message) {
	},

	error : function (message) {
	},


  /****************************************** Overrides ****************************************/
	/*********************************************************************************************/
  findTabForHref: function(href) {
    var uri = this.utils.makeURI(href);
    return this.xulUtils.findTabForURI(uri);
  },  

  selectTab: function(tab) {
    var win = tab.ownerDocument.defaultView;
    // focus tab and containing window
    win.getBrowser().selectedTab = tab;

    if(win != this.xulUtils.getWindow()) {
      win.setTimeout(function(){win.focus();}, 50); //async because sync doesn't work all the time
    }
  },

  _switchToTab: function(aUri) {
    var tab = this.xulUtils.findTabForURI(aUri);
    if(tab) {
      this.selectTab(tab);
      return true;
    }
    
    return false;
  },

  overrideDefaultFunctions: function (window, gBrowser) {
  
    // Most of the functions use gBrowser.AddTab to open a new tab, e.g. bookmarks or histroy items
    // Open in New Tab
    gBrowser.addTabCopyByDuplicateTabBlocker = gBrowser.addTab;
    gBrowser.addTab = function( aURI ) {

      // When UndoCloseTab, aURI is ""
      duplicateTabBlocker.debug("gBrowser.addTab: " + aURI);
      if (aURI && aURI != "about:newtab") {
        var tab = duplicateTabBlocker.findTabForHref(aURI);

        if(tab) {
          duplicateTabBlocker.selectTab(tab);
          return tab;
        }
      }

      return gBrowser.addTabCopyByDuplicateTabBlocker.apply(this, arguments);
    }
    
    
    // Open New Window
    window.openLinkInCopyByDuplicateTabBlocker = window.openLinkIn;
    window.openLinkIn = function(url, where) {
        if (where == "window") {
          var tab = duplicateTabBlocker.findTabForHref( url );
          duplicateTabBlocker.debug("window.openLinkInCopyByDuplicateTabBlocker: " + tab + " " + url);

          if(tab) {
            duplicateTabBlocker.selectTab(tab);
            return tab.ownerDocument.defaultView;
          }
        }

        return window.openLinkInCopyByDuplicateTabBlocker.apply(this, arguments);
      };

    // Prevent clicking a link to load a duplicate url.
    window.handleLinkClickCopyByDuplicateTabBlocker = window.handleLinkClick;    
    window.handleLinkClick = function handleLinkClick(event, href, linkNode) {
    
      if (event.button == 0 || event.button == 1) {
        var aUri = duplicateTabBlocker.utils.makeURI(href)
        var success = duplicateTabBlocker._switchToTab(aUri);
        duplicateTabBlocker.debug("handleLinkClick: " + success);
        if(success) {
          event.preventDefault();
          return true;
        }
      }
      return window.handleLinkClickCopyByDuplicateTabBlocker.apply(this, arguments);
    };

  },  
  
  _restoreOriginalFunctions: function(win, gBrowser) {
    win.handleLinkClick = win.handleLinkClickCopyByDuplicateTabBlocker;
    win.handleLinkClickCopyByDuplicateTabBlocker = null;
    
    gBrowser.addTab = gBrowser.addTabCopyByDuplicateTabBlocker;
    gBrowser.addTabCopyByDuplicateTabBlocker = null;

    win.openLinkIn = win.openLinkInCopyByDuplicateTabBlocker;
    win.openLinkInCopyByDuplicateTabBlocker = null;

  },

  
};