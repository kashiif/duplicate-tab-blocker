'use strict';

/******************************************************************
* Encapsulates reading from .properties file for localization.
* 
******************************************************************/

var EXPORTED_SYMBOLS = ['PropertyFile'];

var StringBundleService = Components.classes['@mozilla.org/intl/stringbundle;1'].
                              getService(Components.interfaces.nsIStringBundleService);

function PropertyFile(src) {
  this.src = src;
  this.bundle = null;
}

PropertyFile.prototype.getString = function(msg, args){ 
  if (!this.bundle) {
    this.bundle = StringBundleService.createBundle(this.src);
  }

  //get localised message
  if (args){
    args = Array.prototype.slice.call(arguments, 1);
    return this.bundle.formatStringFromName(msg,args,args.length);
  } else {
    return this.bundle.GetStringFromName(msg);
  }
};

PropertyFile.prototype.destroy = function() {
  StringBundleService.flushBundles();
};