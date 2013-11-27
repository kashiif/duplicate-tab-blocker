"use strict";

/**************************************
* Author: Kashif Iqbal Khan
* Email: kashiif@gmail.com
* License: MIT
* Copyright (c) 2013 Kashif Iqbal Khan
**************************************/
var distdir = "dist/",
    tempDir = distdir + "temp/";

var dirs = {
  temp: tempDir,
  includeTags: true
};

    
module.exports = function(grunt) {

  var path  = require("path");

  var pkg = grunt.file.readJSON("package.json"),
      srcDir = "src/",  // Path of directory where source code resides
      versionForFileSystem = pkg.version.replace(/\./g, "-");

  // Project configuration.
  grunt.initConfig({
  dirs: dirs,
	pkg: pkg,
	
	clean: {
		prod: ["<%=dirs.temp%>"]
	},
	
	// Copy files to tempDir, and only change things in there
	copy: {
		fxcommon: { /* To be used with firefox specific targets i.e. firefox and babelzilla */
			files: [
				{expand: true, cwd: srcDir, src : ["chrome.manifest" ],  dest: "<%=dirs.temp%>" },
				{expand: true, cwd: srcDir, src : ["**/*.css","**/*.js","**/*.jsm", "**/*.xul", "**/*.png","**/*.jpg",
                                            "!**/ext-contents/chromium/**",
                                            "!**/ext-contents/firefox/**",
                                            "!**/ext-contents/common/content/*-dev.*"
                                          ],
                                    dest: "<%=dirs.temp%>" }
			]
		},
		chrome: {
			files: [
				{expand: true, cwd: srcDir, src : ["manifest.json"],  dest: "<%=dirs.temp%>" },
				{expand: true, cwd: srcDir + "ext-contents/", src : ["**/chromium/**", "**/common/**", "!**/common/content/*-dev.*"],  dest: "<%=dirs.temp%>" }
			]
		},
		"chrome-dev": {
			files: [
				{expand: true, cwd: srcDir + "ext-contents/", src : ["**/common/content/*-dev.js"],  dest: "<%=dirs.temp%>" }
			]
		},
		firefox: {
			files: [
          //{expand: true, cwd: srcDir, src : ["**/*.dtd", "**/*.properties", "!**/*_amo_*.dtd"],  dest: "<%=dirs.temp%>" },
          {expand: true, cwd: srcDir, src : [
                                             "**/ext-contents/firefox/main/**",
                                             "!**/ext-contents/firefox/main/options.*",
                                            ],
                                      dest: "<%=dirs.temp%>" },
          {expand: true, cwd: srcDir, src : ["**/ext-contents/firefox/lib/common.jsm"], dest: "<%=dirs.temp%>", ext: ".jsm.js" }
			]
		},
		babelzilla: {
			files: [
				{expand: true, cwd: srcDir, src : ["**/*.dtd", "**/*.properties", "**/cue_translator.txt"],  dest: "<%=dirs.temp%>" }
			]
		}
	},
  
  "concat": {
    "options": {
      banner: "(function(){\n",
      footer: "\n})();\n"
    },
    "common" : {
      src: ["src/ext-contents/common/content/lib-dev.js", "src/ext-contents/common/content/dom-construction-dev.js"],
      dest: '<%=dirs.versionDir%>common/content/common-content.js',
      nonull: true
    }
  },
	
	"string-replace": {
	  install_rdf: { /* Task to replace tokens in install.rdf */
      options: {
        replacements: [
          {
            pattern: /\<em\:name\>.+\<\/em\:name\>/g,
            replacement: "<em:name>" + pkg.name + "</em:name>"
          },
          {
            pattern: /\<em\:creator\>.+\<\/em\:creator\>/g,
            replacement: "<em:creator>" + pkg.author.name + "</em:creator>"
          },
          {
            pattern: /\<em\:homepageURL\>.*\<\/em\:homepageURL\>/g,
            replacement: "<em:homepageURL>" + pkg.homepage + "</em:homepageURL>"
          },		  
          {
            pattern: /\<em\:description\>.*\<\/em\:description\>/g,
            replacement: "<em:description>" + pkg.description + "</em:description>"
          }
        ]
      },
      src: srcDir + "install.rdf",
      dest: "<%=dirs.temp%>" + "install.rdf"
	  },
	
	  manifest_json: { /* Task to replace tokens in install.rdf */
      options: {
        replacements: [
          {
            pattern: /ext-contents\//g,
            replacement: ""
          },
          {
            pattern: /"name"\: ".*"/g,
            replacement: '"name": "' + pkg.name + '"'
          },
          {
            pattern: /"version"\: ".+"/g,
            replacement: '"version": "' + pkg.version + '"'
          },
          {
            pattern: /\<em\:creator\>.+\<\/em\:creator\>/g,
            replacement: "<em:creator>" + pkg.author.name + "</em:creator>"
          },
          {
            pattern: /\<em\:homepageURL\>.*\<\/em\:homepageURL\>/g,
            replacement: "<em:homepageURL>" + pkg.homepage + "</em:homepageURL>"
          },
          {
            pattern: /"description"\: ".*"/g,
            replacement: '"description": "' + pkg.description + '"'
          },
          {
            pattern: /"version"\: ".*"/g,
            replacement: '"version": "' + pkg.version + '"'
          }          
        ]
      },
      src: srcDir + "manifest.json",
      dest: "<%=dirs.temp%>" + "manifest.json"
	  },

	  all_files: { /* Task to replace tokens in all files */
      options: {
        replacements: [{
          pattern: /___version___/g,
          replacement: pkg.version
        },
        {
          pattern: /ext\-contents\//g,
          replacement: versionForFileSystem + "/"
        },
        {
          pattern: /__coupons_server_url__/g, /* Url of server to request coupon from */
          replacement: "http://test.coupns.com.au/wp-admin/admin-ajax.php?action=getcoupons&domain="
        }]
      },
      files: [
        {expand: true, dest: "<%=dirs.temp%>", cwd: "<%=dirs.temp%>", src : ["**/*.*", "!**/*.png", "!**/*.jpg", "!**/*.jpeg", "!**/*.gif"] }
      ]
	  }
	},
  
  preprocess: {
    options: {
      // NOTE that if context is defined in the task, it will replace the global context, (not merge it)
      // This looks like a grunt bug where deep merging is not performed for options
      context : {
      }
    },
    prod: {
      options: {
        inline: true,
      },
      src : [ "<%=dirs.temp%>/**/*.js"] 
    }
    
  },
	
	compress: { 
		prod: { 
			options: {
			  archive: "<%=dirs.dist%>" + pkg.name + "-" + pkg.version + ".xpi",
			  mode: "zip"
			},
			files: [ { expand: true, cwd: "<%=dirs.temp%>", src: "**/**" }]
		} 
	}
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-string-replace");
  grunt.loadNpmTasks("grunt-contrib-compress");
  
  grunt.loadNpmTasks("grunt-preprocess");

  // $: grunt bump
  grunt.loadNpmTasks("grunt-bump");


  grunt.registerTask("renameVersionDir", "renames the ext-contents directory", function() {
      // Force task into async mode and grab a handle to the "done" function.
      var done = this.async();

      var fs    = require("fs");


      var oldName = path.resolve(path.join(dirs.temp, "ext-contents/firefox/lib/common.jsm.js")),
            newName = path.resolve(path.join(dirs.temp, "ext-contents/firefox/lib/common.jsm"));

      fs.rename(oldName, newName, function(error) {

        if (error) {
            grunt.fail.fatal(error);
            done();
            return;
        }

        // rename <ext-contents> to <version number>
        oldName = path.resolve(path.join(dirs.temp, "ext-contents"));
        newName = path.resolve(path.join(dirs.temp, versionForFileSystem));
   
        if (fs.existsSync(oldName)) {
          //setTimeout(function() {
            fs.rename(oldName, newName, function(error){ 
                if (error) {
                    grunt.fail.fatal(error);
                }
                done(); 
              });
            //}, 500);
        }
      });

    });

  grunt.registerTask("firefox-build", "", function() {
      dirs.dist = distdir + "firefox/"
      dirs.temp = dirs.dist + "temp/";
      dirs.versionDir = dirs.temp + "ext-contents/";
    });
  
  /*
  grunt.registerTask("chrome-build", "", function() {
      dirs.dist = distdir + "chrome/"
      dirs.temp = dirs.dist;
      dirs.versionDir = dirs.temp;
    });

  grunt.registerTask("chrome-devbuild", "", function() {
      dirs.dist = distdir + "chrome/"
      dirs.temp = dirs.dist;
      dirs.versionDir = dirs.temp;
    });
  */

    // Default task(s).
  grunt.registerTask("firefox",   ["firefox-build",   "clean", "copy:fxcommon", "copy:firefox", "concat", "string-replace:install_rdf",   "string-replace:all_files", "preprocess:prod", "renameVersionDir", "compress"]);
  //grunt.registerTask("chrome",    ["chrome-build",    "clean", "copy:chrome",                   "concat", "string-replace:manifest_json", "string-replace:all_files", "preprocess:prod"]);
  //grunt.registerTask("chromedev", ["chrome-devbuild", "clean", "copy:chrome", "copy:chrome-dev",          "string-replace:manifest_json", "string-replace:all_files"]);
  grunt.registerTask("default", ["firefox"/*, "chrome"*/]);
  
};