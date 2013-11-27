'use strict';
/******************************************************************
* Encapsulates Preference load and update mechanism for bootstraped 
* extensions.
* 
* PrefManager is singleton and its init() function should be called
* before using any other function.
******************************************************************/

var EXPORTED_SYMBOLS = ["PrefManager"];

const Ci = Components.interfaces;
const Cc = Components.classes;
const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

XPCOMUtils.defineLazyGetter(
  this, 'gPrefBranch', function ()
    Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch(null));


var prefsService = null;


// That's why I'm lovin' restartless.
function loadDefaultPrefs (branch, defaultPrefsUrl) {
  let prefs = Services.prefs.QueryInterface(Ci.nsIPrefBranch);
  // All code below shamelessly stolen from the SDK
  let branch = prefs.getDefaultBranch("");
  let prefLoaderScope = {
    pref: function(key, val) {
      switch (typeof val) {
        case "boolean":
          branch.setBoolPref(key, val);
          break;
        case "number":
          branch.setIntPref(key, val);
          break;
        case "string":
          branch.setCharPref(key, val);
          break;
      }
    }
  };

  /*
  let uri = Services.io.newURI(
      "__version__/defaults/preferences/defaults.js",
      null,
      Services.io.newURI("resource://webextract/", null, null));
  */
  
  var uri = Services.io.newURI(defaultPrefsUrl, null, null);
      
  // setup default prefs
  try {
    Services.scriptloader.loadSubScript(uri.spec, prefLoaderScope);
  } catch (e) {
    dump("Error loading default preferences at "+uri.spec+": "+e+"\n");
  }
}

/*******************************************************
* Gets the value of a pref with its correct data type
*
* @param prefBrach Instance of nsIPrefBranch
* @param prefKey The name of pref relative to prefBranch
*
********************************************************/
function getPrefValue(prefBrach, prefKey) {
  switch(prefBrach.getPrefType(prefKey)) {
    case Ci.nsIPrefBranch.PREF_STRING:
      return prefBrach.getCharPref(prefKey);
    case Ci.nsIPrefBranch.PREF_INT:
      return prefBrach.getIntPref(prefKey);
    case Ci.nsIPrefBranch.PREF_BOOL:
      return prefBrach.getBoolPref(prefKey);
  }
  Cu.reportError('Returning null');
  return null;
}

// PrefManager is a singleton.
let PrefManager = {
  init: function(extBranch, defaultPrefsUrl) {
    prefsService = Cc["@mozilla.org/preferences-service;1"]
      .getService(Ci.nsIPrefService)
      .getBranch(extBranch);

    loadDefaultPrefs(extBranch, defaultPrefsUrl);

    // https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIPrefBranch#getChildList()
    // children is an array of keys
    var self = this,
        children = prefsService.getChildList('',{});
    
    children.forEach(function(key){
        self[key] = getPrefValue(prefsService, key);
      });
    
    this.watchers = [];

    this.register();
  },

  split: function (s) Array.map(s.split(","), String.trim).filter(String.trim).map(String.toLowerCase),

  watch: function (watcher) this.watchers.push(watcher),

  register: function mpo_register (observer) {
    prefsService.QueryInterface(Ci.nsIPrefBranch);
    if (observer)
      prefsService.addObserver("", observer, false);
    else
      prefsService.addObserver("", this, false);
  },

  unregister: function mpo_unregister () {
    if (!prefsService)
      return;
    prefsService.removeObserver("", this);
  },

  observe: function mpo_observe (aSubject, aTopic, aData) {
    if (aTopic != "nsPref:changed")
      return;

    // Don't proceed if it is not our preference branch, but this should never happen
    if (aSubject != prefsService)
      return;

    let v = getPrefValue(prefsService, aData)
    this[aData] = v;
    
    // Notify all watchers of the change
    [x(aData, v) for each (x in this.watchers)];    
  },

  hasPref: function (p) {
    return (gPrefBranch.getPrefType(p) != Ci.nsIPrefBranch.PREF_INVALID);
  },

  getChar: function (p) {
    return gPrefBranch.getCharPref(p);
  },

  getInt: function (p) {
    return gPrefBranch.getIntPref(p);
  },

  getBool: function (p) {
    return gPrefBranch.getBoolPref(p);
  },

  getString: function (p) {
    return gPrefBranch.getComplexValue(p, Ci.nsISupportsString).data;
  },

  setChar: function (p, v) {
    return gPrefBranch.setCharPref(p, v);
  },

  setInt: function (p, v) {
    return gPrefBranch.setIntPref(p, v);
  },

  setBool: function (p, v) {
    return gPrefBranch.setBoolPref(p, v);
  },

  setString: function (p, v) {
    let str = Cc["@mozilla.org/supports-string;1"]
              .createInstance(Ci.nsISupportsString);
    str.data = v;
    return gPrefBranch.setComplexValue(p, Ci.nsISupportsString, str);
  },
  
  destroy: function() {
    this.unregister();
    delete this.watchers;
    prefsService = null;
    prefBranch = null;
  },
}

