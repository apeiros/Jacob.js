/*--
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.
--*/

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
 *      following values are tried in order: the xml:lang attribute of the
 *      <html> tag, the lang attribute of the <html> tag,
 *      Jacob.I18n.defaultLocale, 'generic'.
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
  this._translators   = {};
  this._translations  = {};
  this._loadedLocales = {};
  var htmlTag         = document.getElementsByTagName("html")[0]

  locale = locale ||
           htmlTag.getAttribute('xml:lang') ||
           htmlTag.getAttribute('lang') ||
           this.constructor.defaultLocale ||
           'generic';

  this.locale(locale);
  this.scope('/');
  this.loadLocale(Jacob.I18n.builtIn);
};


/** section: translate, related to: Jacob.I18n#translate
 *    Jacob.I18n#t([options]) -> Function
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


/** section: localize, related to: Jacob.I18n#localize
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
 *        i18n.interpolateKey('%{which}/key', {kind: 'any'}, '/base');
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


/**
 *    Jacob.I18n#normalizeKey(key, options) -> key (String)
 *    - key (String): The key to normalize, possibly containing variables and
 *      being relative.
 *    - options (Object): The same options hash as Jacob#I18n#translate takes.
 *
 *    ## Summary
 *
 *    Returns a normalized key, applying all options like segments, scope and
 *    count, regardless of whether that key actually can be found in an actual
 *    lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.normalizeKey('%{which}/key', {segments: {kind: 'any'}, count: 2, scope: '/base'});
 *        // => "/base/any/key/more"
 *
 **/
Jacob.I18n.prototype.normalizeKey = function Jacob__I18n___normalizeKey(key, options) {
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


/**
 *    Jacob.I18n#translate(key[, options={}]) -> translation (String) | undefined
 *    - key (String): The key to translate
 *    - options (Object): An options hash. See Options.
 *
 *    ## Summary
 *
 *    Translates the given key and applies all given options.
 *
 *
 *    ## Synopsis
 *
 *        i18n.translate('/key'); // "Translation"
 *
 *
 *    ## Options
 *
 *    * segments (Object): A hash of variables that the key is interpolated with
 *    * variables (Object): A hash of variable that the translation is interpolated with
 *    * count (Integer): Used for pluralization, also available as a variable
 *    * scope (String): The scope which a relative key should be prefixed with
 *    * fallback (Object): The value to return in case the key could not be found
 *    * lazyLoader (Function): Invoked after a failed lookup, expected to return
 *      ['retry'], ['use', translation], ['default'] or undefined (which is treated as ['retry'])
 *
 **/
Jacob.I18n.prototype.translate = function Jacob__I18n___translate(key, options) {
  var translation;
  options = options || {};

  key         = this.normalizeKey(key, options);
  translation = this.lookup(this._translations, this._cascadedLocales, key)
  if (!translation && options.lazyLoader) {
    var action = options.lazyLoader.apply(this, [key, options]) || ['retry'];
    if (action[0] == 'retry') {
      translation = this.lookup(this._translations, this._cascadedLocales, key)
    } else if (action[0] == 'use') {
      translation = action[1];
    } else if (action[0] != 'default') {
      throw("Invalid return value from lazy loader: '"+action[0]+"', expected retry, use or default")
    }
  }
  if (!translation) translation = (typeof(options.fallback) == 'function' ? options.fallback() : options.fallback);
  if (translation && options.variables) translation = Jacob.Template.interpolate(translation, undefined, options.variables);

  return translation;
};


/**
 *    Jacob.I18n#localize(object[, options]) -> translation (Object) | undefined
 *    - object (Object): The value to localize, e.g. a Date or Number.
 *    - options (Object): A hash with options that indicate how to localize the object.
 *
 *    ## Summary
 *
 *    Localizes arbitrary objects.
 *
 *
 *    ## Synopsis
 *
 *        i18n.localize(new Date()); // => "Saturday, 23. September"
 *
 **/
Jacob.I18n.prototype.localize = function Jacob__I18n___localize(value, options) {
  options        = options || {};
  var name       = options.translator || value.constructor.name
  var translator = this.lookup(this._translators, this._cascadedLocales, name);

  return translator.localize.apply(this, [value, options]);
};


/* INTERNAL
 *    Jacob.I18n#load(localeURI[, ignoreCache=false][, onLoadCallback]) -> undefined
 *    - localeURI (String): The URI of the locale to load.
 *    - onLoadCallback (Function): A callback that is invoked after loading the locale.
 *
 *    ## Summary
 *
 *    Loads a locale file and adds its contents to this Jacob.I18n instance.
 *    You may want to take a look at Jacob.Barrier as a help when you want to
 *    load multiple locale files.
 *
 *
 *    ## Synopsis
 *
 *        i18n.load("/locales/en-GB.js", function() {
 *          i18n.translate("/some/key");
 *        });
 *
 **/
Jacob.I18n.prototype.load = function Jacob__I18n___load(uri, ignoreCache, callback) {
  var i18n   = this; // for the closures
  if (typeof(ignoreCache) == 'function') {
    callback    = ignoreCache;
    ignoreCache = undefined;
  }

  if (!ignoreCache && i18n._loadedLocales[uri]) {
    if (callback) callback();
  } else {
    Jacob.HTTP.get(uri, {
      success: function(data) {
        i18n._loadedLocales[uri] = true;
        if (data) {
          i18n.loadLocale(Jacob.JSON.parse(data));
          if (callback) callback();
        }
      },
      error: function() {
        throw("Failed to load '"+uri+"'");
      }
    });
  }
};


/**
 *    Jacob.I18n#loadLocale(data) -> undefined
 *    - data (Object): A locale datastructure.
 *
 *    ## Summary
 *
 *    Adds the data in the data argument to this Jacob.I18n instance.
 *
 *
 *    ## Synopsis
 *
 *        i18n.loadLocale({locale: "en-GB", translations: {"/key": "value"}});
 *
 *
 *    ## Datastructure
 *
 *    The structure of the file should look like this:
 *        {
 *          "locale": "en-GB", // the locale of this data
 *          "translators": { // custom translators for #localize
 *            "Constructorname": {
 *              "localize": function(value, options)
 *            }
 *          }
 *          "translations": {  // translations for #translate
 *            "arbitrarily": {
 *              "deep": {
 *                "nesting": "Can be done"
 *              }
 *            }
 *          }
 *        }
 *    Notice that the nesting of the hash under "translations" can be arbitrarily
 *    deep. The example is equivalent to {"/arbitrarily/deep/nesting": "Can be done"}.
 *    Localization functions are executed in the context of this Jacob.I18n instance.
 *
 **/
Jacob.I18n.prototype.loadLocale = function Jacob__I18n___loadLocale(data) {
  this.addTranslators(data.locale, data.translators);
  this.addTranslations(data.locale, data.translations);
};


/**
 *    Jacob.I18n#addTranslators(locale, translators) -> true
 *    - locale (String): The locale to add the translators to.
 *    - translators (Object): The translators.
 *
 *    ## Summary
 *
 *    Adds translators to the given locale of this instance of Jacob.I18n.
 *    For the structure of the translators argument, see Jacob.I18n#loadLocale.
 *
 *
 *    ## Synopsis
 *
 *        i18n.addTranslators('en-GB', {Currency: {localize: enGBCurrencyLocalizer}});
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


/**
 *    Jacob.I18n#addTranslations(locale, translations) -> true
 *    - locale (String): The locale to add the translations to.
 *    - translators (Object): The translations.
 *
 *    ## Summary
 *
 *    Adds translations to the given locale of this instance of Jacob.I18n.
 *    For the structure of the translators argument, see Jacob.I18n#loadLocale.
 *
 *
 *    ## Synopsis
 *
 *        i18n.addTranslations('en-GB', {"localizers.Currency.format": "%{amount} %{currency}"});
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


/**
 *    Jacob.I18n#prepareNodeForAutomaticTranslation([node=document.body]) -> undefined
 *    - node (DOMElement): The root node to start translating from.
 *
 *    ## Summary
 *
 *    Gets all textnodes and adds them as key and value for the defaultLocale.
 *
 *
 *    ## Synopsis
 *
 *        i18n.prepareNodeForAutomaticTranslation();
 *
 *
 *    ## Warning
 *
 *    This function is experimental.
 *
 **/
Jacob.I18n.prototype.inferTranslationsFromNode = function Jacob__I18n___prepareNodeForAutomaticTranslation(node) {
  node = node || document.body;
  var locale       = Jacob.I18n.defaultLocale;
  var found        = [];
  var translations = {};
  var textnodesFinder = function(node, found) {
    if (node.nodeType == 3 && !node.data.match(/^[ \t\n\r\f\v\s]*$/)) found.push(node);
    for(var i=0; i<node.childNodes.length; i++) textnodesFinder(node.childNodes[i], found);
  }
  textnodesFinder(node, found);
  for(var i=0; i<found.length; i++) {
    var node   = found[i];
    var parent = node.parentNode;
    var text   = parent.innerText.replace(/^[\s\r\n]*|[\s\r\n]*$/g, ''); // strip
    translations[text] = text;
    parent.setAttribute("data-i18nKey", text);
  }
  this.addTranslations(locale, translations);
};


/**
 *    Jacob.I18n#translateNode([node=document.body][, loadLocaleCallback]) -> undefined
 *    - node (DOMElement): The root node to start translating from.
 *    - loadLocaleCallback (Function): A callback that is invoked if a translation can't be found.
 *
 *    ## Summary
 *
 *    Translates a DOM node and all its descendants. It starts with the current
 *    locale but respects any given 'lang' attribute on any of the nodes.
 *
 *
 *    ## Synopsis
 *
 *        i18n.translateNode();
 *
 *
 *    ## Warning
 *
 *    This function is experimental.
 *
 **/
Jacob.I18n.prototype.translateNode = function Jacob__I18n___translateNode(node, loadLocaleCallback) {
  if (typeof(node) == 'function') {
    loadLocaleCallback = node;
    node               = undefined;
  }
  node = node || document.body;

  var found           = [];
  var textnodesFinder = function(node, found) {
    if (node.nodeType == 3 && !node.data.match(/^[ \t\n\r\f\v\s]*$/)) found.push(node);
    for(var i=0; i<node.childNodes.length; i++) textnodesFinder(node.childNodes[i], found);
  }
  textnodesFinder(node, found);
  for(var i=0; i<found.length; i++) {
    var node         = found[i];
    var parent       = node.parentNode;
    var i18nKey      = parent.getAttribute('data-i18nKey');
    var translation  = this.translate(i18nKey, {lazyLoader: loadLocaleCallback, fallback: i18nKey});
    parent.innerText = translation;
  }
};


/* INTERNAL
 *    Jacob.I18n#flattenLocales(hash) -> flatLocales (Object)
 *    - hash (Object): The deeply nested translations hash to flatten.
 *
 *    ## Summary
 *
 *    Flattens the arbitrarily deep translations hash into a flat key-value hash.
 *
 *
 *    ## Synopsis
 *
 *        i18n.flattenLocales({"deeply": {"nested": "locales"}});
 *        // => {"/deeply/nested": "locales"}
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


/**
 *    Jacob.I18n.builtIn = localeData
 *
 *    ## Summary
 *
 *    The preloaded locale data for the 'generic' locale which is always looked
 *    up last. It defines a couple of standard localizers.
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
