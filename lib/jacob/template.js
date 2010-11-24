/*--
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.
--*/

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


/**
 *    class Jacob.Template.KeyError
 *
 *    ## Summary
 *
 *    Useful for custom missing and superfluous key handlers.
 *    It automatically calculates missing keys, superfluous keys, expected keys
 *    and given keys.
 *
 **/

/**
 *    Jacob.Template.KeyError#template -> template (Jacob.Template)
 **/

/**
 *    Jacob.Template.KeyError#expectedKeys -> expectedKeys (Array)
 **/

/**
 *    Jacob.Template.KeyError#givenKeys -> givenKeys (Array)
 **/

/**
 *    Jacob.Template.KeyError#missingKeys -> missingKeys (Array)
 **/

/**
 *    Jacob.Template.KeyError#superfluousKeys -> superfluousKeys (Array)
 **/

/**
 *    new Jacob.Template.KeyError(template, variables[, message])
 **/
Jacob.Template.KeyError = function Jacob__Template__KeyError(template, variables, message) {
  this.template        = template;
  this.expectedKeys    = template.identifiers();
  this.givenKeys       = Jacob.Util.ownPropertyNames(variables);
  this.missingKeys     = Jacob.Util.arraySubtract(this.expectedKeys, this.givenKeys);
  this.superfluousKeys = Jacob.Util.arraySubtract(this.givenKeys, this.expectedKeys);

  if (!message) {
    if (this.missingKeys > 0) {
      var given   = "'"+this.givenKeys.join("', '")+"'";
      var missing = "'"+this.missingKeys.join("', '")+"'";
      this.message = "Missing keys "+missing+", given: "+given;
    } else if (this.superfluousKeys.length > 0) {
      var expected    = "'"+this.expectedKeys.join("', '")+"'";
      var superfluous = "'"+this.superfluousKeys.join("', '")+"'";
      this.message = "Superfluous keys "+superfluous+", expected: "+expected;
    } else {
      this.message = "Key error"
    }
  }
}


/**
 *    Jacob.Template.MissingKeyHandler = (Function)
 *
 *    ## Summary
 *
 *    MissingKeyHandler is the default callback for missing keys.
 *    It throws an error.
 *
 **/
Jacob.Template.MissingKeyHandler = function Jacob__Template__MissingKeyHandler(template, missingKey, options, variables) {
  throw(new Jacob.Template.KeyError(template, variables));
}


/**
 *    Jacob.Template.SuperfluousKeysHandler = (Function)
 *
 *    ## Summary
 *
 *    SuperfluousKeysHandler is a callback for superfluous keys. The default is
 *    none, though.
 *    SuperfluousKeysHandler throws an error.
 *
 **/
Jacob.Template.SuperfluousKeysHandler = function Jacob__Template__MissingKeyHandler(template, superfluousKeys, options, variables) {
  throw(new Jacob.Template.KeyError(template, variables));
}


/** 
 *  Jacob.Template.interpolate(templateString[, options], variables) -> String
 *  - templateString (String): The template string to interpolate the variables into.
 *  - options (Object):        Same options as the Jacob.Template constructor accepts.
 *  - variables (Object):      The variables to interpolate into the template.
 *
 *  ## Summary
 *
 *  This function is a shortcut for:
 *      (new Jacob.Template(templateString, option)).interpolate(variables);
 *  In consequence it can throw all the same errors as Jacob.Template#interpolate.
 *
 *
 *  ## Synopsis
 *
 *      Jacob.Template.interpolate("%{predicate} %{subject}", {}, {predicate: "Hello", subject: "World"});
 *      // => "Hello World"
 **/
Jacob.Template.interpolate = function Jacob__Template__interpolate(templateString, options, variables) {
  if (arguments.length == 2) {
    variables = options;
    options   = {};
  }
  var template = new this(templateString, options);

  return template.interpolate(variables);
};


/** 
 *  Jacob.Template#identifiers() -> identifiers (Array)
 *
 *  ## Summary
 *
 *  Returns all identifiers which can be replaced by variables.
 *
 *
 *  ## Synopsis
 *
 *      var template = new Jacob.Template("%{predicate} %{subject}");
 *      template.identifiers() // => ["predicate", "subject"]
 **/
Jacob.Template.prototype.identifiers = function Jacob_Template___identifiers() {
  var identifiers = this._templateString.match(/%\{\w+\}/g);
  var i           = identifiers.length;
  while(i--) identifiers[i] = identifiers[i].substr(2,identifiers[i].length-3);

  return identifiers;
}




/** 
 *  Jacob.Template#interpolate(variables) -> interpolated (String)
 *
 *  ## Summary
 *
 *  Returns the template string with all identifiers replaced by the
 *  values of the given variables.
 *
 *  Depending on the options, this function can throw errors on missing- and
 *  superfluous keys. The default is to ignore superfluous keys but throw a
 *  Jacob.Template.KeyError on missing keys.
 *
 *  Also see: Jacob.Template.MissingKeyHandler and Jacob.Template.SuperfluousKeyHandler
 *
 *
 *  ## Synopsis
 *
 *      var template = new Jacob.Template("%{predicate} %{subject}");
 *      template.interpolate({predicate: "Hello", subject: "World"});
 *      // => "Hello World"
 **/
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
