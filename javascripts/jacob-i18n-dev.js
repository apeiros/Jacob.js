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
/* File jacob/barrier.js */
/**
 *    class Jacob.Barrier
 *
 *    ## Summary
 *
 *    Barrier lets you invoke multiple asynchronous functions waiting for all to
 *    complete. This is useful in situations where you have to resolve
 *    dependencies first.
 *
 *
 *    ## Synopsis
 *
 *        barrier = new Jacob.Barrier();
 *        i18n = new Jacob.I18n('de-CH');
 *        i18n.load('locale1', barrier.wait());
 *        i18n.load('locale2', barrier.wait());
 *        i18n.load('locale3', barrier.wait());
 *        barrier.release(function() {
 *          // executed after locale1, locale2 and locale3 have been loaded
 *        })
 *
 *
 *    ## Warning
 *
 *    This library assumes no true concurrency in the javascript interpreter.
 *    At the time of writing, no javascript interpreter actually offers true
 *    concurrency, so this is not (yet) an issue. In future, it might be.
 **/



/**
 *    new Jacob.Barrier()
 *
 *    ## Summary
 *
 *    Creates a new Barrier.
 **/
Jacob.Barrier = function Jacob__Barrier() {
  this.length     = 0;
  this._waiterID  = 0;
  this._waiters   = {};
  this._releasers = [];
};


/**
 *    Jacob.Barrier#wait([id]) -> Object
 *    - id: An optional identifier. If none is given, a numerical one is
 *      generated. You SHOULD NOT manually pass in numeric IDs. Use e.g. strings
 *      instead.
 *
 *    ## Summary
 *
 *    Blocks the barrier until the returned function is invoked.
 *
 *
 *    ## Synopsis
 *
 *        barrier = new Jacob.Barrier();
 *        waiter  = barrier.wait();
 *        barrier.release(function() { alert("released!"); });
 *        waiter(); // all waiters have been called, "released!" is displayed
 **/
Jacob.Barrier.prototype.wait = function Jacob__Barrier___wait(id) {
  var barrier = this;
  var id      = this.block(id);
  var waiter  = function() { barrier.clear(id) };

  return waiter;
};


/**
 *    Jacob.Barrier#block([id]) -> Integer | id
 *    - id: An optional identifier. If none is given, a numerical one is
 *      generated. You SHOULD NOT manually pass in numeric IDs. Use e.g. strings
 *      instead.
 *
 *    ## Summary
 *
 *    Blocks the barrier until the id is cleared using Jacob.Barrier#clear(id).
 *
 *
 *    ## Synopsis
 *
 *        barrier  = new Jacob.Barrier();
 *        block_id = barrier.block();
 *        barrier.release(function() { alert("released!"); });
 *        barrier.clear(block_id); // all waiters have been called, "released!" is displayed
 **/
Jacob.Barrier.prototype.block = function Jacob__Barrier___block(id) {
  var id      = id || this.nextID();
  if (!this._waiters[id]) {
    this.length++;
    this._waiters[id] = true;
  }

  return id;
};


/* INTERNAL
 *    Jacob.Barrier#nextID() -> Integer
 *
 *    ## Summary
 *
 *    Generates a new unused ID to be used by block.
 *
 *
 *    ## Synopsis
 *
 *        barrier  = new Jacob.Barrier();
 *        block_id = barrier.nextID();
 **/
Jacob.Barrier.prototype.nextID = function Jacob__Barrier___nextID() {
  var id = this._waiterID;
  this._waiterID++;

  return id;
};


/**
 *    Jacob.Barrier#clear([id]) -> Object
 *    - id: An optional identifier. If none is given, all blockers are cleared.
 *
 *    ## Summary
 *
 *    Clears a block in the barrier, if it was the last one blocking, it
 *    also invokes Jacob.Barrier#triggerRelease().
 *    Note: if all blocks are cleared, invoking clear will have no effect.
 *
 *
 *    ## Synopsis
 *
 *        barrier  = new Jacob.Barrier();
 *        block_id = barrier.block();
 *        barrier.release(function() { alert("released!"); });
 *        barrier.clear(block_id); // all waiters have been called, "released!" is displayed
 **/
Jacob.Barrier.prototype.clear = function Jacob__Barrier___clear(id) {
  if (this._waiters[id]) {
    this.length--;
    delete this._waiters[id];
    if (!this.length) this.triggerRelease();
  }

  return this;
};

/* INTERNAL
 *    Jacob.Barrier#triggerRelease() -> this
 *
 *    ## Summary
 *
 *    Invokes all release callbacks.
 *
 *
 *    ## Synopsis
 *
 *        barrier  = new Jacob.Barrier();
 *        barrier.release(function() { alert("released!"); });
 *        barrier.triggerRelease(); // "released!" is displayed
 **/
Jacob.Barrier.prototype.triggerRelease = function Jacob__Barrier___triggerRelease() {
  for(var i=0; i<this._releasers.length; i++) this._releasers[i]();

  return this;
};


/**
 *    Jacob.Barrier#release(callback) -> this
 *    - callback (Function): A function that should be invoked when all blocks
 *      in the barrier are cleared.
 *
 *    ## Summary
 *
 *    Clears a block in the barrier, if it was the last one blocking, it
 *    also invokes Jacob.Barrier#triggerRelease().
 *
 *
 *    ## Synopsis
 *
 *        barrier  = new Jacob.Barrier();
 *        barrier.release(function() { alert("released!"); });
 *        barrier.clear(barrier.block()) // all waiters have been called, "released!" is displayed
 **/
Jacob.Barrier.prototype.release = function Jacob__Barrier___release(releaser) {
  this._releasers.push(releaser);

  return this;
};



/* File jacob/i18n.js */
/**
 *    class Jacob.I18n
 *
 *    ## Summary
 *
 *    I18n handles translation of strings and localization of objects, like
 *    dates, numbers, monetary expressions, arrays etc.
 *
 *
 *    ## Synopsis
 *
 *        i18n    = new Jacob.I18n('en');
 *        barrier = new Jacob.Barrier();
 *        i18n.load('locales/en.js', barrier.wait());
 *        i18n.load('locales/en-US.js', barrier.wait());
 *        barrier.release(function() { // we have to wait for the locales to be loaded
 *          // assuming the keys 'sites/index/title' and '/greeting' are defined in your locales files
 *
 *          i18n.translate('/sites/index/title');
 *          // => "Welcome to CompuGlobalHyperMegaNet!"
 *
 *          // create a shortcut
 *          t = i18n.t();
 *          t('/sites/index/title');
 *          // => "Welcome to CompuGlobalHyperMegaNet!"
 *          t('/sites/%{site}/title', {segments: {site: 'value'}});
 *          // => "Welcome to CompuGlobalHyperMegaNet!"
 *          t('/greeting');
 *          // => "Hello %{first_name}!"
 *          t('/greeting', {variables: {first_name: 'Homer'}});
 *          // => "Hello Homer!"
 *          i18n.localize((new Date()), {format: 'date_only'});
 *          // => "Sunday, 23. September 2010"
 *
 *          // create a shortcut
 *          l = i18n.l()
 *          l((new Date()), {format: 'date_only'});
 *          // => "Sunday, 23. September 2010"
 *          l(123456.78);
 *          // => "123.456,78"
 *          l(123456.78, {translator: 'Currency', currency: 'CHF'});
 *          // => "USD 123.456,78"
 *          l([1,2,3]);
 *          // => "1, 2 and 3"
 *          l([1,2,3], {connector: 'or'});
 *          // => "1, 2 or 3"
 *        });
 *
 *
 *    ## Done
 *
 *    * variables in keys
 *    * variables in translations
 *    * translations
 *    * localizations
 *    * fallbacks
 *    * locale cascading (e.g. de-CH -> de -> generic)
 *    * merge loading
 *    * scope
 *    * count (pluralization)
 *
 *
 *    ## ToDo
 *
 *    * i18n.withOptions(options, function() { i18n.translate(...); ... });
 *    * Options:
 *      * locale
 *      * exception
 **/



/**
 *    new Jacob.I18n([locale])
 *    - locale (String): A locale-string, e.g. "de" or "de-CH". As default the
 *      following values are tried in order: Jacob.I18n.defaultLocale, the
 *      xml:lang attribute of the html tag, the lang attribute in the html tag,
 *      'generic'
 *
 *    ## Summary
 *
 *    Creates new Jacob.I18n instance. The given locale is automatically
 *    cascaded.
 *
 *
 *    ## Synopsis
 *
 *        var i18n = new Jacob.I18n();
 **/
Jacob.I18n = function Jacob__I18n(locale) {
  this._translators  = {};
  this._translations = {};
  var htmlTag        = document.getElementsByTagName("html")[0]

  if (!locale) locale = this.constructor.defaultLocale;
  if (!locale) locale = htmlTag.getAttribute('xml:lang');
  if (!locale) locale = htmlTag.getAttribute('lang');
  if (!locale) locale = 'generic';

  this.locale(locale || this.constructor.defaultLocale);
  this.scope('/');
  this.loadLocale(Jacob.I18n.builtIn);
};


/**
 *    Jacob.I18n.t([options]) -> Function
 *    - options (Object): An options hash, which is passed on to
 *      Jacob.I18n#translate after merging it with the
 *
 *    ## Summary
 *
 *    Creates a shortcut function for Jacob.I18n#translate
 *
 *
 *    ## Synopsis
 *
 *        var t    = i18n.t({scope: 'pages/index');
 *        t('title') // Same i18n.translate('pages/index/title');
 *
 *
 *    ## WARNING
 *
 *    The options parameter is currently not implemented and therefore ignored.
 *
 **/
Jacob.I18n.prototype.t = function Jacob__I18n___t() {
  var i18n      = this;
  var translate = this.translate;

  return function() { return translate.apply(i18n, arguments); }
};


/**
 *    Jacob.I18n#l([options]) -> Function
 *    - options (Object): An options-hash. See Options.
 *
 *    ## Summary
 *
 *    Creates a shortcut function for Jacob.I18n#localize
 *
 *
 *    ## Synopsis
 *
 *        var l = i18n.l({locale: 'en');
 *        l(new Date()) // => Same i18n.localize((new Date()), {locale: 'en'});
 *
 *    ## WARNING
 *
 *    The options parameter is currently not implemented and therefore ignored.
 *
 **/
Jacob.I18n.prototype.l = function Jacob__I18n___l() {
  var i18n     = this;
  var localize = this.localize;
  return function() {
    return localize.apply(i18n, arguments);
  }
};



/**
 *    Jacob.I18n#cascadeLocales([locale=this.locale()]) -> Array
 *    - locale (Object): The locale to calculate the cascade of.
 *
 *    ## Summary
 *
 *    Calculates the locale cascade for a given locale and returns it.
 *    E.g. for 'en-US', the cascade is ['en-US', 'en', 'generic']. Jacob.I18n
 *    tries those locales in that order to resolve a given key.
 *
 *
 *    ## Synopsis
 *
 *        var i18n    = i18n.l({locale: 'en');
 *        l(new Date()) // => Same i18n.localize((new Date()), {locale: 'en'});
 *
 *    ## WARNING
 *
 *    The options parameter is currently not implemented and therefore ignored.
 *
 **/
Jacob.I18n.prototype.cascadeLocales = function Jacob__I18n___cascadeLocales(locale) {
  locale      = locale || this._locale;
  var cascade = [locale]
  var part    = locale.match(/^[^-]+(?=-)/)
  if (part) cascade.push(part[0]);
  if (locale != 'generic') cascade.push('generic');

  return cascade;
};


/**
 *    Jacob.I18n#locale([locale]) -> current locale (String)
 *    - locale (String): The locale to set this I18n instance to.
 *
 *    ## Summary
 *
 *    Gets or sets the locale of this Jacob.I18n instance.
 *    If a locale argument is given, the locale is set to that.
 *    Returns the locale on which this Jacob.I18n is set.
 *
 *
 *    ## Synopsis
 *
 *        i18n.locale();        // => 'en-US'
 *        i18n.locale('en-GB'); // => 'en-GB'
 *        i18n.locale();        // => 'en-GB'
 *
 **/
Jacob.I18n.prototype.locale = function Jacob__I18n___locale(setLocale) {
  if (setLocale !== undefined) {
    this._locale          = setLocale;
    this._cascadedLocales = this.cascadeLocales();
  }
  return this._locale;
};


/**
 *    Jacob.I18n#scope([newScope]) -> current scope (String)
 *    - scope (String): The scope to set this I18n instance to.
 *
 *    ## Summary
 *
 *    Gets or sets the scope (see Scope) of this Jacob.I18n instance.
 *    If a scope argument is given and begins with a '/', then scope is set to
 *    that. If a scope argument is given and does not begin with a '/', then
 *    The scope is built by joining the current scope with the argument.
 *    Returns the scope on which this Jacob.I18n is set.
 *    You should be careful about setting the scope as it influences all
 *    lookups.
 *
 *
 *    ## Synopsis
 *
 *        i18n.scope();        // => '/'
 *        i18n.scope('sites'); // => '/sites'
 *        i18n.scope('index'); // => '/sites/index'
 *        i18n.scope('/');     // => '/sites/index'
 *
 *
 *    ## Scope
 *
 *    The scope is used when resolving relative keys, the absolute key is then
 *    built by joining the scope and the key, e.g. with a scope of '/sites' and
 *    a key 'current/title', the resulting absolute key would be
 *    '/sites/current/title'.
 *    The standard scope of Jacob.I18n is '/'.
 *
 **/
Jacob.I18n.prototype.scope = function Jacob__I18n___scope(setScope) {
  if (setScope !== undefined) {
    if (setScope.substr( 0, 1) != '/') throw("Invalid scope, must be absolute");
    if (setScope.substr(-1, 1) != '/') setScope = setScope + '/';
    this._scope = setScope;
  }
  return this._scope;
};


/**
 *    Jacob.I18n#translations() -> Object
 *
 *    ## Summary
 *
 *    Returns a hash containing all locales and the corresponding flattened
 *    hash of all keys and their translations in that locale.
 *    Flattened means that - no matter how deep the hashes have been when the
 *    locales were loaded - there are no nested hashes in it.
 *
 *
 *    ## Synopsis
 *
 *        i18n.translations(); // => {"generic": {"/some/key": "value"}, "en": {}}
 *
 **/
Jacob.I18n.prototype.translations = function Jacob__I18n___translations() {
  return this._translations;
};


/* INTERNAL
 *    Jacob.I18n#lookup() -> Object
 *
 *    ## Summary
 *
 *    Returns a hash containing all locales and the corresponding flattened
 *    hash of all keys and their translations in that locale.
 *    Flattened means that - no matter how deep the hashes have been when the
 *    locales were loaded - there are no nested hashes in it.
 *
 *
 *    ## Synopsis
 *
 *        i18n.translations(); // => {"generic": {"/some/key": "value"}, "en": {}}
 *
 **/
Jacob.I18n.prototype.lookup = function Jacob__I18n___lookup(container, cascadedLocales, key) {
  for(var i=0; i < cascadedLocales.length; i++) {
    var translations = container[cascadedLocales[i]]
    var translation  = translations ? translations[key] : undefined;
    if (translation) return translation;
  }
};


/**
 *    Jacob.I18n#hasKey([options]) -> false | Object
 *    - options (Object): The same options hash as for Jacob.I18n#translate
 *
 *    ## Summary
 *
 *    If a key exists, it returns an object with the locale and the absolute key
 *    in the form {locale: ..., key: ...}. If the key can't be found, it returns
 *    false. The options hash accepted is the same as for Jacob.I18n#translate.
 *
 *
 *    ## Synopsis
 *
 *        i18n.hasKey('some/%{kind}/key', {segments: {kind: 'existing'}});
 *        // => {key: '/some/existing/key', locale: "en-US"}
 *        i18n.hasKey('some/%{kind}/key', {segments: {kind: 'unknown'}});
 *        // => false
 *
 **/
Jacob.I18n.prototype.hasKey    = function Jacob__I18n___hasKey(key, options) {
  key = this.normalizeKey(key, options);
  var cascadedLocales = this._cascadedLocales;
  for(var i=0; i < cascadedLocales.length; i++) {
    var translations = container[cascadedLocales[i]]
    var translation  = translations ? translations[key] : undefined;
    if (translation) return({locale: cascadedLocales[i], key: key});
  }
  return false;
}


/* INTERNAL
 *    Jacob.I18n#interpolateKey(key[, variables={}[, scope=this.scope()]]) -> key (String)
 *    - key (String): The key to interpolate, possibly containing variables and
 *      being relative.
 *    - variables (Object): A hash with variables to interpolate in the key.
 *      Superfluous variables are silently ignored.
 *    - scope (String): The scope to prefix relative keys with.
 *      See Jacob.I18n#scope.
 *
 *    ## Summary
 *
 *    Returns a completly interpolated key, regardless of whether that key actually
 *    can be found in an actual lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.interpolate('%{which}/key', {kind: 'any'}, '/base');
 *        // => "/base/any/key"
 *
 **/
 Jacob.I18n.prototype.interpolateKey = function Jacob__I18n___interpolateKey(key, variables, scope) {
  if (key.substr(0,1) != '/') { // absolute keys ignore scope
    scope = scope || this._scope;
    if (scope.substr( 0, 1) != '/') scope = this.interpolateKey(scope);
    if (scope.substr(-1, 1) != '/') scope + '/';
    key = scope+key;
  }
  if (variables) key = Jacob.Template.interpolate(key, undefined, variables);
  do {
    old_key = key;
    key     = old_key.replace(/[^\/.]+\/\.\.\//, '');
  } while (old_key != key);
  if (key.match(/\.\.\//)) throw("Invalid key, could not clean parent switches");

  return key;
};


/* INTERNAL
 *    Jacob.I18n#interpolateKey(key[, variables={}[, scope=this.scope()]]) -> key (String)
 *    - key (String): The key to interpolate, possibly containing variables and
 *      being relative.
 *    - variables (Object): A hash with variables to interpolate in the key.
 *      Superfluous variables are silently ignored.
 *    - scope (String): The scope to prefix relative keys with.
 *      See Jacob.I18n#scope.
 *
 *    ## Summary
 *
 *    Returns a completly interpolated key, regardless of whether that key actually
 *    can be found in an actual lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.interpolate('%{which}/key', {kind: 'any'}, '/base');
 *        // => "/base/any/key"
 *
 **/
Jacob.I18n.prototype.normalizeKey = function (key, options) {
  if (options.count !== undefined) {
    key = key+'/'+this.localize(options.count, {translator: 'GrammarNumerus'});;
    if (options.variables) {
      options.variables.count = options.count;
    } else {
      options.variables = {count: options.count};
    }
  }
  return this.interpolateKey(key, (options && options.segments), (options && options.scope));
}


/* INTERNAL
 *    Jacob.I18n#interpolateKey(key[, variables={}[, scope=this.scope()]]) -> key (String)
 *    - key (String): The key to interpolate, possibly containing variables and
 *      being relative.
 *    - variables (Object): A hash with variables to interpolate in the key.
 *      Superfluous variables are silently ignored.
 *    - scope (String): The scope to prefix relative keys with.
 *      See Jacob.I18n#scope.
 *
 *    ## Summary
 *
 *    Returns a completly interpolated key, regardless of whether that key actually
 *    can be found in an actual lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.interpolate('%{which}/key', {kind: 'any'}, '/base');
 *        // => "/base/any/key"
 *
 **/
Jacob.I18n.prototype.translate = function Jacob__I18n___translate(key, options) {
  var translation;
  options = options || {};

  key         = this.normalizeKey(key, options);
  translation = this.lookup(this._translations, this._cascadedLocales, key)
  if (!translation) translation = (typeof(options.fallback) == 'function' ? options.fallback() : options.fallback);
  if (translation && options.variables) translation = Jacob.Template.interpolate(translation, undefined, options.variables);

  return translation;
};


/* INTERNAL
 *    Jacob.I18n#interpolateKey(key[, variables={}[, scope=this.scope()]]) -> key (String)
 *    - key (String): The key to interpolate, possibly containing variables and
 *      being relative.
 *    - variables (Object): A hash with variables to interpolate in the key.
 *      Superfluous variables are silently ignored.
 *    - scope (String): The scope to prefix relative keys with.
 *      See Jacob.I18n#scope.
 *
 *    ## Summary
 *
 *    Returns a completly interpolated key, regardless of whether that key actually
 *    can be found in an actual lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.interpolate('%{which}/key', {kind: 'any'}, '/base');
 *        // => "/base/any/key"
 *
 **/
Jacob.I18n.prototype.localize = function Jacob__I18n___localize(value, options) {
  options        = options || {};
  var name       = options.translator || value.constructor.name
  var translator = this.lookup(this._translators, this._cascadedLocales, name);

  return translator.localize.apply(this, [value, options]);
};


/* INTERNAL
 *    Jacob.I18n#interpolateKey(key[, variables={}[, scope=this.scope()]]) -> key (String)
 *    - key (String): The key to interpolate, possibly containing variables and
 *      being relative.
 *    - variables (Object): A hash with variables to interpolate in the key.
 *      Superfluous variables are silently ignored.
 *    - scope (String): The scope to prefix relative keys with.
 *      See Jacob.I18n#scope.
 *
 *    ## Summary
 *
 *    Returns a completly interpolated key, regardless of whether that key actually
 *    can be found in an actual lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.interpolate('%{which}/key', {kind: 'any'}, '/base');
 *        // => "/base/any/key"
 *
 **/
Jacob.I18n.prototype.load = function Jacob__I18n___load(locale, callback) {
  var locale = locale || this._locale;
  var i18n   = this;
  var uri    = (locale.match(/^\w+:\/\/|^\/|.js$|.json$/) ? locale : 'locales/'+locale+'.js');
  Jacob.HTTP.get(uri, {
    success: function(data) {
      if (data) {
        i18n.loadLocale(Jacob.JSON.parse(data));
        if (callback) callback();
      }
    },
    error: function() {
      throw("Failed to load '"+uri+"'");
    }
  });
};


/* INTERNAL
 *    Jacob.I18n#interpolateKey(key[, variables={}[, scope=this.scope()]]) -> key (String)
 *    - key (String): The key to interpolate, possibly containing variables and
 *      being relative.
 *    - variables (Object): A hash with variables to interpolate in the key.
 *      Superfluous variables are silently ignored.
 *    - scope (String): The scope to prefix relative keys with.
 *      See Jacob.I18n#scope.
 *
 *    ## Summary
 *
 *    Returns a completly interpolated key, regardless of whether that key actually
 *    can be found in an actual lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.interpolate('%{which}/key', {kind: 'any'}, '/base');
 *        // => "/base/any/key"
 *
 **/
Jacob.I18n.prototype.loadLocale = function Jacob__I18n___loadLocale(data) {
  this.addTranslators(data.locale, data.translators);
  this.addTranslations(data.locale, data.translations);
};


/* INTERNAL
 *    Jacob.I18n#interpolateKey(key[, variables={}[, scope=this.scope()]]) -> key (String)
 *    - key (String): The key to interpolate, possibly containing variables and
 *      being relative.
 *    - variables (Object): A hash with variables to interpolate in the key.
 *      Superfluous variables are silently ignored.
 *    - scope (String): The scope to prefix relative keys with.
 *      See Jacob.I18n#scope.
 *
 *    ## Summary
 *
 *    Returns a completly interpolated key, regardless of whether that key actually
 *    can be found in an actual lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.interpolate('%{which}/key', {kind: 'any'}, '/base');
 *        // => "/base/any/key"
 *
 **/
Jacob.I18n.prototype.addTranslators = function Jacob__I18n___addTranslators(locale, translators) {
  if (!this._translators[locale]) {
    this._translators[locale] = translators;
  } else {
    var storedTranslators = this._translators[locale];
    for(var key in translators) storedTranslators[key] = translators[key];
  }
  return true;
};


/* INTERNAL
 *    Jacob.I18n#interpolateKey(key[, variables={}[, scope=this.scope()]]) -> key (String)
 *    - key (String): The key to interpolate, possibly containing variables and
 *      being relative.
 *    - variables (Object): A hash with variables to interpolate in the key.
 *      Superfluous variables are silently ignored.
 *    - scope (String): The scope to prefix relative keys with.
 *      See Jacob.I18n#scope.
 *
 *    ## Summary
 *
 *    Returns a completly interpolated key, regardless of whether that key actually
 *    can be found in an actual lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.interpolate('%{which}/key', {kind: 'any'}, '/base');
 *        // => "/base/any/key"
 *
 **/
Jacob.I18n.prototype.addTranslations = function Jacob__I18n___addTranslations(locale, translations) {
  var flattened = this.flattenLocales(translations);
  if (!this._translations[locale]) {
    this._translations[locale] = flattened;
  } else {
    var storedTranslations = this._translations[locale];
    for(var key in flattened) storedTranslations[key] = flattened[key];
  }
  return true;
};


/* INTERNAL
 *    Jacob.I18n#interpolateKey(key[, variables={}[, scope=this.scope()]]) -> key (String)
 *    - key (String): The key to interpolate, possibly containing variables and
 *      being relative.
 *    - variables (Object): A hash with variables to interpolate in the key.
 *      Superfluous variables are silently ignored.
 *    - scope (String): The scope to prefix relative keys with.
 *      See Jacob.I18n#scope.
 *
 *    ## Summary
 *
 *    Returns a completly interpolated key, regardless of whether that key actually
 *    can be found in an actual lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.interpolate('%{which}/key', {kind: 'any'}, '/base');
 *        // => "/base/any/key"
 *
 **/
Jacob.I18n.prototype.flattenLocales = function Jacob__I18n___flattenLocales(hash, stack, flattened) {
  stack     = stack     || '';
  flattened = flattened || {};
  for (var key in hash) {
    var value   = hash[key];
    var fullKey = stack+'/'+key;
    if (typeof(value) === "string") {
      flattened[fullKey] = value;
    } else {
      this.flattenLocales(value, fullKey, flattened);
    }
  }

  return flattened;
};


/* INTERNAL
 *    Jacob.I18n#interpolateKey(key[, variables={}[, scope=this.scope()]]) -> key (String)
 *    - key (String): The key to interpolate, possibly containing variables and
 *      being relative.
 *    - variables (Object): A hash with variables to interpolate in the key.
 *      Superfluous variables are silently ignored.
 *    - scope (String): The scope to prefix relative keys with.
 *      See Jacob.I18n#scope.
 *
 *    ## Summary
 *
 *    Returns a completly interpolated key, regardless of whether that key actually
 *    can be found in an actual lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.interpolate('%{which}/key', {kind: 'any'}, '/base');
 *        // => "/base/any/key"
 *
 **/
Jacob.I18n.defaultLocale = null;


/* INTERNAL
 *    Jacob.I18n#interpolateKey(key[, variables={}[, scope=this.scope()]]) -> key (String)
 *    - key (String): The key to interpolate, possibly containing variables and
 *      being relative.
 *    - variables (Object): A hash with variables to interpolate in the key.
 *      Superfluous variables are silently ignored.
 *    - scope (String): The scope to prefix relative keys with.
 *      See Jacob.I18n#scope.
 *
 *    ## Summary
 *
 *    Returns a completly interpolated key, regardless of whether that key actually
 *    can be found in an actual lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.interpolate('%{which}/key', {kind: 'any'}, '/base');
 *        // => "/base/any/key"
 *
 **/
Jacob.I18n.builtIn = {
  'locale':       'generic',
  'translators': {
    'GrammarNumerus': {
      // should return 'one' or 'other'
      'localize': function(value, options) { return value == 1 ? 'one' : 'other'; }
    },
    'Number': {
      'localize': function(value, options) {
        options                = options || {};
        var precision          = options.precision;
        var thousandsSeparator = this.translate('/translators/Number/thousandsSeparator');
        var decimalSeparator   = this.translate('/translators/Number/decimalSeparator');
        if (precision) value = Math.round(value * Math.pow(10, Math.abs(precision)))/Math.pow(10, Math.abs(precision))
        var parts              = value.toString().split('.');
        var sign               = '';
        var integer            = parts[0];
        if (options.precision === 0) {
          var fraction = undefined;
        } else {
          var fraction = parts[1] || '';
          if (precision) while (fraction.length < precision) fraction += '0';
        }
        var result             = fraction ? decimalSeparator+fraction : '';
        if (integer.match(/^[+-]/)) {
          sign    = integer.slice(0,1);
          integer = integer.slice(1);
        }
        if (options.translateSign) {
          if (sign == '-') {
            sign = this.translate('/translators/Number/negativeSign');
          } else {
            sign = this.translate('/translators/Number/positiveSign');
          }
        }
        for(var index=integer.length-3; index >= 1; index-=3) {
          result = thousandsSeparator+integer.substr(index, 3)+result;
        }
        result = sign+integer.substr(0, index+3)+result;

        return result;
      }
    },
    'Currency': {
      'localize': function(value, options) {
        options = options || {};
        if (!options.precision) options.precision = this.translate('/translators/Currency/defaultPrecision');
        options.precision = options.precision ? parseInt(options.precision) : 2
        if (value % 1) { // has a fraction
          var hasFraction   = true;
          var number        = this.localize(value, {precision: options.precision});
        } else {
          var hasFraction   = false;
          var number        = this.localize(value, {precision: 0});
          var separator     = this.localize(1.2).replace(/[12]/g, '');
        }
        var currency = options.currency || this.translate('/translators/Currency/defaultCurrency');
        currency = this.translate('/translators/Currency/currencies/'+currency, {fallback: currency});
        if (this.translate('/translators/Currency/zeroesRepeat') == 'yes') {
          var zeroes = '';
          for(var i=0; i < options.precision; i++) zeroes += this.translate('/translators/Currency/zeroes');
        } else {
          var zeroes = this.translate('/translators/Currency/zeroes');
        }
        if (!hasFraction) number = number+separator+zeroes;

        return this.translate('/translators/Currency/format', {variables: {'currency': currency, 'value': number}})
      }
    },
    'Duration': {
    },
    'Date': {
      'localize': function(value, options) {
        options = options || {};
        if (!options.format) options.format = 'default';
        return Jacob.I18n.strftime(value, this.translate('/translators/Date/formats/'+options.format, {fallback: options.format}), this);
      }
    },
    'Array': {
      'localize': function(value, options) {
        options = options || {};
        var intermediateConnector = this.translate('/translators/Array/intermediateConnector/'+(
          options.intermediateConnector ||
          options.connector ||
          'and'
        ));
        var terminalConnector     = this.translate('/translators/Array/terminalConnector/'+(
          options.terminalConnector ||
          options.connector ||
          'and'
        ));
        switch(value.length) {
          case 0:  return "";
          case 1:  return value[0];
          case 2:  return ""+value[0]+terminalConnector+value[1];
          default: return value.slice(0,-1).join(intermediateConnector)+terminalConnector+value[value.length-1]
        }
      }
    }
  },
  'translations': {
    'translators': {
      'Array': {
        'intermediateConnector.and': ', ',
        'terminalConnector.and':     ' and ',
        'intermediateConnector.or':  ', ',
        'terminalConnector.or':      ' or ',
      },
      'Currency': {
        'defaultPrecision': '2',
        'zeroes':           '0',
        'zeroesRepeat':     'yes',
        'format':           '%{currency} %{value}',
        'defaultCurrency':  'USD'
      },
      'Number': {
        'thousandsSeparator':      ',',
        'decimalSeparator':        '.',
        'positiveSign':            '+',
        'negativeSign':            '-',
        '-':                       'minus',
        '+':                       'plus',
        '1':                       'zero',
        '1':                       'one',
        '2':                       'two',
        '3':                       'three',
        '4':                       'four',
        '5':                       'five',
        '6':                       'six',
        '7':                       'seven',
        '8':                       'eight',
        '9':                       'nine',
        '10':                      'ten',
      },
      'Date': {
        'formats': {
          'default':   '%Y-%m-%d, %H:%M',
          'date_only': '%Y-%m-%d',
          'time_only': '%H:%M',
        },
        'meridiemIndicator': {
          'am':                    'am',
          'pm':                    'pm',
        },
        'dayOfWeek': {
          '0':                     'Sunday',
          '1':                     'Monday',
          '2':                     'Tuesday',
          '3':                     'Wednesday',
          '4':                     'Thursday',
          '5':                     'Friday',
          '6':                     'Saturday',
        },
        'month': {
          '1':                     'January',
          '2':                     'February',
          '3':                     'March',
          '4':                     'April',
          '5':                     'May',
          '6':                     'June',
          '7':                     'July',
          '8':                     'August',
          '9':                     'September',
          '10':                    'October',
          '11':                    'November',
          '12':                    'December',
        },
        'abbreviatedDayOfWeek': {
          '0':                     'Sun',
          '1':                     'Mon',
          '2':                     'Tue',
          '3':                     'Wed',
          '4':                     'Thu',
          '5':                     'Fri',
          '6':                     'Sat',
        },
        'abbreviatedMonth': {
          '1':                     'Jan',
          '2':                     'Feb',
          '3':                     'Mar',
          '4':                     'Apr',
          '5':                     'May',
          '6':                     'Jun',
          '7':                     'Jul',
          '8':                     'Aug',
          '9':                     'Sep',
          '10':                    'Oct',
          '11':                    'Nov',
          '12':                    'Dec',
        }
      }
    }
  }
};



/* File jacob/i18n/datetime.js */
/* Utilities */
var DaysUntilMonthNormal = [0,31,59,90,120,151,181,212,243,273,304,334,365];
var DaysUntilMonthLeap   = [0,31,60,91,121,152,182,213,244,274,305,335,366];

function padLeft(string, padding, size) {
  string = string.toString();
  while(size-string.length > 0) string = padding+string;
  return string;
}
function t(i18n, key, options) {
  return i18n.translate('/translators/Date/'+key, options);
}
function isLeapYear(year) {
  return !(year%400 && (!(year%100) || year%4));
}
function dayOfYear(date) {
  var daysInMonth = isLeapYear(date.getFullYear()) ? DaysUntilMonthLeap : DaysUntilMonthNormal;

  return daysInMonth[date.getMonth()]+date.getDate();
}
function ISO8601Week(date) {
  var doy  = dayOfYear(date);
  var fwd  = (date.getDay()-doy)%7 // calculate weekday of first day in year
  if (fwd < 0) fwd+=7;

  if (doy <= 3 && doy <= 7-fwd) { // last week of last year
    switch(fwd) {
      case 6:  return 52;
      case 5:  return isLeapYear(date.getFullYear()-1) ? 53 : 52;
      case 4:  return 53;
      default: return 1;
    }
  } else { // calculate week number
    var off  = (10-fwd)%7-2;   // calculate offset of the first week
    if (off < 0) off+=7;
    var week = Math.floor((doy-off)/7)+1;
    if (week > 52) {
      week = (fwd == 3 || (isLeapYear(date.getFullYear()) && fwd == 2)) ? 53 : 1;
    }
    return week;
  }
}
function ISO8601WeekYear(date) {
  var isoWeek = ISO8601Week(date);
  var doy     = dayOfYear(date);
  if (isoWeek == 1 && doy > 14) {
    return date.getFullYear()+1;
  } else if (isoWeek > 51 && doy < 14) {
    return date.getFullYear()-1;
  } else {
    return date.getFullYear();
  }
}

/* The strftime function */
Jacob.I18n.strftime = function(date, format, i18n) {
  i18n = i18n || (new Jacob.I18n());
  var mapping   = Jacob.I18n.Datetime.mapping;
  var functions = Jacob.I18n.Datetime.functions;
  var oldFormat;

  // break up composites (e.g. %D -> %m/%d/%y)
  do {
    oldFormat = format
    format    = oldFormat.replace(Jacob.I18n.Datetime.compositeRegex, function(match) {
      return Jacob.I18n.Datetime.composite[match];
    })
  } while(format != oldFormat);

  format = format.replace(/%[^\{%tn]|%\{\w+\}/g, function(match) {
    var mapper  = mapping[match];
    return mapper ? functions[mapper](date, i18n) : match;
  });
  format = format.replace(/%t/, "\t").replace(/%n/, "\n").replace(/%%/, '%');

  return format;
}

/* Translation routines */
Jacob.I18n.Datetime = {};
Jacob.I18n.Datetime.functions = {
  'dateAndTime':                        function(date, i18n) { throw('Not implemented'); },
  'date':                               function(date, i18n) { throw('Not implemented'); },
  'time':                               function(date, i18n) { throw('Not implemented'); },
  'dateTimeAndTimezone':                function(date, i18n) { throw('Not implemented'); },

  'abbreviatedMonthName':               function(date, i18n) { return t(i18n, 'abbreviatedMonth/%{month}', {segments: {month: date.getMonth()+1}}); },
  'abbreviatedWeekdayName':             function(date, i18n) { return t(i18n, 'abbreviatedDayOfWeek/%{weekday}', {segments: {weekday: date.getDay()}}); },
  'fullMonthName':                      function(date, i18n) { return t(i18n, 'month/%{month}', {segments: {month: date.getMonth()+1}}); },
  'fullWeekdayName':                    function(date, i18n) { return t(i18n, 'dayOfWeek/%{weekday}', {segments: {weekday: date.getDay()}}); },
  // Monday as the first day of the week, 1-7
  'iso8601DayOfWeek':                   function(date, i18n) { return(date.getDay() || 7); },
  'meridiemIndicator':                  function(date, i18n) { return t(i18n, 'meridiemIndicator/%{value}', {segments: {value: date.getHours() < 12 ? 'am' : 'pm'}}); },
  'secondsSinceEpoch':                  function(date, i18n) { return Math.floor(date.getTime()); },
  'timezoneName':                       function(date, i18n) { throw('Not implemented'); },
  'timezoneUTCOffset':                  function(date, i18n) {
    var offset=date.getTimezoneOffset();
    return((offset > 0 ? '-' : '+')+padLeft(Math.round(Math.abs(offset)/60), '0', 2)+padLeft(Math.abs(offset)%60, '0', 2));
  },

  // (ISO 8601) This year is the one that contains the greater part of the week (Monday as the first day of the week).
  'zeroPaddedFourDigitISO8601WeekYear': function(date, i18n) { return padLeft(ISO8601WeekYear(date), '0', 4); },
  // (ISO 8601)
  'zeroPaddedTwoDigitISO8601WeekYear':  function(date, i18n) { return padLeft(ISO8601WeekYear(date)%100, '0', 2); },
  'zeroPaddedDayOfYear':                function(date, i18n) { return padLeft(dayOfYear(date), '0', 3); },
  // Sunday as the first day of the week, 00-53
  'zeroPaddedSundayBasedWeek':          function(date, i18n) { throw('Not implemented'); },
  // (ISO 8601) Monday as the first day of the week, 01-53. If the week
  // containing January 1 has four or more days in the new year, then it is
  // week 1 otherwise it is the last week of the previous year, and the next
  // week is week 1.
  'zeroPaddedWeek':                     function(date, i18n) { return padLeft(ISO8601Week(date), '0', 2); },
  // Monday as the first day of the week, 00-53
  'zeroPaddedMondayBasedWeek':          function(date, i18n) { throw('Not implemented'); },
  // Sunday as the first day of the week, 0-6.
  'zeroBasedDayOfWeek':                 function(date, i18n) { return date.getDay(); },

  'spacePaddedDayOfMonth':              function(date, i18n) { return padLeft(date.getDate(), ' ', 2); },
  'spacePadded24hHour':                 function(date, i18n) { return padLeft(date.getHours(), ' ', 2); },
  'spacePadded12hHour':                 function(date, i18n) { var hour=(date.getHours() % 12); return padLeft(hour || 12, ' ', 2); },

  'zeroPaddedDayOfMonth':               function(date, i18n) { return padLeft(date.getDate(), '0', 2); },
  'zeroPaddedNumericMonth':             function(date, i18n) { return padLeft(date.getMonth(), '0', 2); },
  'zeroPaddedFourDigitYear':            function(date, i18n) { return padLeft(date.getFullYear(), '0', 4); },
  'zeroPaddedTwoDigitYear':             function(date, i18n) { return padLeft(date.getFullYear() % 100, '0', 2); },
  'zeroPadded24hHour':                  function(date, i18n) { return padLeft(date.getHours(), '0', 2); },
  'zeroPadded12hHour':                  function(date, i18n) { var hour=(date.getHours() % 12); return padLeft(hour || 12, '0', 2); },
  'zeroPaddedMinute':                   function(date, i18n) { return padLeft(date.getMinutes(), '0', 2); },
  'zeroPaddedSecond':                   function(date, i18n) { return padLeft(date.getSeconds(), '0', 2); },
  'zeroPaddedMillisecond':              function(date, i18n) { return padLeft(date.getMilliseconds(), '0', 3); },
  'zeroPaddedCentury':                  function(date, i18n) { return padLeft(Math.floor(date.getFullYear()/100), '0', 2); },
  //'percent':                 function(date, i18n) { return '%%'; },
}
Jacob.I18n.Datetime.composite = {
  '%D': '%m/%d/%y',
  '%F': '%Y-%m-%d',
  '%R': '%H:%M',
  '%r': '%I:%M:%S %p',
  '%T': '%H:%M:%S',
  '%v': '%e-%b-%Y',
  '%h': '%b'
}
Jacob.I18n.Datetime.compositeRegex = /%[DFRrTvh]/g
Jacob.I18n.Datetime.mapping = {
  '%A': 'fullWeekdayName',
  '%a': 'abbreviatedWeekdayName',
  '%B': 'fullMonthName',
  '%b': 'abbreviatedMonthName',
  '%C': 'zeroPaddedCentury',
  '%c': 'dateAndTime',
  '%d': 'zeroPaddedDayOfMonth',
  '%H': 'zeroPadded24hHour',
  '%I': 'zeroPadded12hHour',
  '%M': 'zeroPaddedMinute',
  '%k': 'spacePadded24hHour',
  '%l': 'spacePadded12hHour',
  '%m': 'zeroPaddedNumericMonth',
  '%p': 'meridiemIndicator',
  '%Y': 'zeroPaddedFourDigitYear',
  '%y': 'zeroPaddedTwoDigitYear',
  '%S': 'zeroPaddedSecond',
  '%e': 'spacePaddedDayOfMonth',
  '%G': 'zeroPaddedFourDigitISO8601WeekYear',
  '%g': 'zeroPaddedTwoDigitISO8601WeekYear',
  '%j': 'zeroPaddedDayOfYear',
  '%s': 'secondsSinceEpoch',
  '%U': 'zeroPaddedSundayBasedWeek',
  '%u': 'iso8601DayOfWeek',
  '%V': 'zeroPaddedWeek',
  '%W': 'zeroPaddedMondayBasedWeek',
  '%w': 'zeroBasedDayOfWeek',
  '%X': 'time',
  '%x': 'date',
  '%Z': 'timezoneName',
  '%z': 'timezoneUTCOffset',
  '%+': 'dateTimeAndTimezone',

  '%{ms}': 'zeroPaddedMillisecond',
  //'%%': 'percent'
  //'%t': 'tab'
  //'%n': 'newline'
}



/* File jacob/json.js */
/**
 *  mixin Jacob.JSON
 *
 *  ## Summary
 *
 *    Parse JSON Strings to objects and dump objects to JSON Strings
 *
 *
 *  ## Synopsis
 *
 *      Jacob.JSON.parse(string) -> Object
 *      Jacob.JSON.dump(object)  -> String
 *
 *
 *  ## External Dependencies
 *
 *  Jacob.JSON currently depends on jQuery.
 **/



Jacob.JSON = {name: 'Jacob__JSON'};

Jacob.JSON.parse = jQuery.parseJSON;
Jacob.JSON.dump  = function Jacob__JSON__dump() {
  throw("Not yet implemented");
};



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



/* File jacob/util.js */
/**
 *    mixin Jacob.Util
 *
 *    # Summary
 *
 *    Provides some utility functions.
 **/
Jacob.Util = {};


/** 
 *  Jacob.Util.clone(source) -> Object
 *  - source (Object): The object to clone.
 *
 *  ## Summary
 *
 *  Copies an object, copying all its properties. The copy is shallow.
 **/
Jacob.Util.clone  = function Jacob__Util__clone(source) {
  return Jacob.Util.extend({}, source);
}

/** 
 *  Jacob.Util.extend(target, source) -> Object
 *  - source (Object): The object from which to copy the properties.
 *  - target (Object): The object which to extend with the properties from
 *    source.
 *
 *  ## Summary
 *
 *  Copies all properties from one object (source) to another (target).
 **/
Jacob.Util.extend = function Jacob__Util__extend(target, source) {
  for (var property in source ) {
    var getter = source.__lookupGetter__(property)

    if (getter) {
      target.__defineGetter__(property, getter);
    } else {
      var setter = source.__lookupSetter__(property);
      if (setter) {
        target.__defineSetter__(property, setter);
      } else {
        target[property] = source[property];
      }
    }
  }

  return target;
}
})();
