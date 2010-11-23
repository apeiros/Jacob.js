/*
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.

  jacob-barrier is a compilation of the following files:
  * jacob/barrier.js
*/


/**
 *     Jacob
 *
 *    JACOB
 *    =====
 *    
 *    Install
 *    -------
 *    
 *    1. Copy javascripts/jacob.js to your projects javascripts directory and link to it.
 *    2. There's no step 2.
 *    
 *    Note: jacob.js is a compilation of all files contained in the lib/jacob
 *    directory and is therefore all you need. The jacob-dev.js file is the same
 *    but before minification.
 *    
 *    
 *    Summary
 *    -------
 *    
 *    Jacob is a library, or rather a set of libraries, which will help you with
 *    all kinds of tasks related to javascript.
 *    
 *    The sublibraries are the following:
 *    
 *    * Jacob.I18n:
 *      Translate strings by key, localize dates, arrays and other
 *      objects.
 *    * Jacob.Template:
 *      Interpolate variables in strings like "Hello %{name}"
 *    * Jacob.HTTP:
 *      Handle ajax-requests and websockets
 *    
 *    
 *    Examples
 *    --------
 *    
 *    Here a couple of examples, for live examples, take a look at the examples/
 *    directory.
 *    
 *        i18n    = new Jacob.I18n('en');
 *        barrier = new Jacob.Barrier();
 *        i18n.load('locales/en.js', barrier.wait());
 *        i18n.load('locales/en-US.js', barrier.wait());
 *        barrier.release(function() { // we have to wait for the locales to be loaded
 *          // assuming the keys 'sites/index/title' and '/greeting' are defined in your locales files
 *          i18n.translate('/sites/index/title');                                // => "Welcome to CompuGlobalHyperMegaNet!"
 *          i18n.translate('/sites/%{site}/title', {segments: {site: 'value'}}); // => "Welcome to CompuGlobalHyperMegaNet!"
 *          i18n.translate('/greeting');                                         // => "Hello %{first_name}!"
 *          i18n.translate('/greeting', {variables: {first_name: 'Homer'}});     // => "Hello Homer!"
 *          i18n.localize((new Date()), {format: 'date_only'});                  // => "Sunday, 23. September 2010"
 *          i18n.localize(123456.78);                                            // => "123.456,78"
 *          i18n.localize(123456.78, {translator: 'Currency', currency: 'CHF'}); // => "USD 123.456,78"
 *          i18n.localize([1,2,3]);                                              // => "1, 2 and 3"
 *          i18n.localize([1,2,3], {connector: 'or'});                           // => "1, 2 or 3"
 *        });
 *    
 *    
 *    Version
 *    -------
 *    
 *    This is to be considered an early alpha version of Jacob.
 *    
 *    
 *    External Dependencies
 *    ---------------------
 *    
 *    Some of Jacobs sub-libraries currently depend on jQuery for some functionality:
 *    * Jacob.HTTP
 *    * Jacob.JSON
 *    
 *    
 *    License
 *    -------
 *    
 *    You can choose between MIT and BSD-3-Clause license.
 *    License file will be added later.
 **/

if (!window.Jacob) window.Jacob = {};
Jacob = window.Jacob;

(function() {
/* File jacob/template.js */
/** 
 *  class Jacob.Template
 *
 *
 *  ## Summary
 *
 *  Jacob.Template replaces sequences in strings by identifier or position.
 *
 *
 *  ## Synopsis
 *
 *      template = new Jacob.Template('Hello %{entity}!');
 *      template.identifiers()                     // => ['entity']
 *      template.interpolate({'entity': 'World'}); // => 'Hello World!'
 *      Jacob.Template.interpolate('Hello %{entity}!');
 **/


/**
 *    new Jacob.Template(templateString, options)
 *
 *    - templateString (String): A string to interpolate. Variables use the
 *      sequence %{variablename}. Example: "Hello %{firstName}". In this string,
 *      firstName is a variable that can be interpolated.
 *    - options (Object): A hash with options. Valid options are:
 *      * missingKey: A function that is invoked upon a missing key.
 *      * superfluousKey: A function that is invoked upon a superfluous key.
 *
 **/
Jacob.Template = function Jacob__Template(templateString, options) {
  if (typeof(templateString) !== 'string') throw("ArgumentError, Invalid template ("+typeof(templateString)+")");

  this._templateString = templateString;
  this._options        = options || {}
  if (this._options.missingKey === undefined)      this._options.missingKey      = Jacob.Template.MissingKeyHandler;
  if (this._options.superfluousKeys === undefined) this._options.superfluousKeys = Jacob.Template.SuperfluousKeysHandler;
}


Jacob.Template.MissingKeyHandler = function Jacob__Template__MissingKeyHandler(template, missingKey, options, variables) {
  var givenKeys = [];
  for(var key in variables) givenKeys.push(key);
  throw("Missing key '"+missingKey+"', given: '"+givenKeys.join("', '")+"'");
}
Jacob.Template.SuperfluousKeysHandler = function Jacob__Template__MissingKeyHandler(template, superfluousKeys, options, variables) {
  throw("Superfluous keys '"+superfluousKeys.join("', '")+"'");
}


/** 
 *  Jacob.Template.interpolate(templateString[, options], variables) -> String
 *  - templateString (String): The template string to interpolate the variables into.
 *  - options (Object):        Same options as the Jacob.Template constructor accepts.
 *  - variables (Object):      The variables to interpolate into the template.
 **/
Jacob.Template.interpolate = function Jacob__Template__interpolate(templateString, options, variables) {
  if (arguments.length == 2) {
    variables = options;
    options   = {};
  }
  var template = new this(templateString, options);

  return template.interpolate(variables);
};

Jacob.Template.prototype.identifiers = function Jacob_Template___identifiers() {
  var identifiers = this._templateString.match(/%\{\w+\}/g);
  var i           = identifiers.length;
  while(i--) identifiers[i] = identifiers[i].substr(2,identifiers[i].length-3);

  return identifiers;
}
Jacob.Template.prototype.interpolate = function Jacob_Template___interpolate(variables, options) {
  var self            = this; // for the various closures
  options             = options || {};
  variables           = variables || {};

  for(var key in this._options) if (options[key] === undefined) options[key] = this._options[key];

  // store all keys to detect superfluous keys later
  var superfluousKeys = {};
  for(var key in variables) superfluousKeys[key] = true;

  var replaced = this._templateString.replace(/%\{\w+\}/g, function(match) {
    var identifier = match.substr(2,match.length-3);

    if (variables[identifier] !== undefined) {
      return variables[identifier];
    } else if (options.missingKey) {
      return options.missingKey(self, identifier, options, variables);
    }
  });
  if (superfluousKeys.length > 0 && options.superfluousKeys) {
    var superfluousKeysArray = [];
    for(var key in superfluousKeys) superfluousKeysArray.push(key);
    options.superfluousKeys(self, superfluousKeysArray, options, variables);
  }

  return replaced;
}
})();
