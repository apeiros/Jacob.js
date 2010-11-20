/**
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.



  Jacob.Template

  Jacob.Template replaces sequences in strings by identifier or position.

  Examples:
    template = new Jacob.Template('Hello %{entity}!');
    template.identifiers()                     // => ['entity']
    template.interpolate({'entity': 'World'}); // => 'Hello World!'
    Jacob.Template.interpolate('Hello %{entity}!');
**/

if (!window.Jacob) window.Jacob = {};
Jacob = window.Jacob;

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
Jacob.Template.interpolate = function Jacob__Template__interpolate(templateString, options, variables) {
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
