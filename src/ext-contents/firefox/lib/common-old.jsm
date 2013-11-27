'use strict';
var EXPORTED_SYMBOLS = ['_prefManager', 'utils', 'xulUtils', 'domUtils', 'chromeUtils', 'dateUtils', 'logger', 'unloadCommonJsm'];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import('resource://duplicate-tab-blocker/ext-contents/firefox/lib/kashiif-shared.jsm');
Cu.import('resource://duplicate-tab-blocker/ext-contents/firefox/lib/prefmanager.jsm');

PrefManager.init('extensions.duplicatetabblocker.', 'resource://duplicate-tab-blocker/ext-contents/defaults/preferences/defaults.js');

var _prefManager = PrefManager;

var unloadCommonJsm = function() {
  Cu.unload('resource://duplicate-tab-blocker/ext-contents/firefox/lib/kashiif-shared.jsm');
  Cu.unload('resource://duplicate-tab-blocker/ext-contents/firefox/lib/prefmanager.jsm');  
};


// Add functions to any imported module that are needed in both extension module and options module
utils.commonFunction1 = function() {
};

utils.commonFunction2 = function() {
};

