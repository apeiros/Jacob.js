/**
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.



  I18n
  I18n handles translation of strings and localization of objects, like
  dates, numbers, monetary expressions, arrays etc.

  Examples:
    i18n = new Jacob.I18n('de-CH');
    i18n.translate('relative/key');
    i18n.translate('../relative/key');
    i18n.translate('/absolute/key');
    i18n.translate('some/key', {variable: 'value'})
    i18n.translate('some/key', {option: value}, {variable: 'value'})      // => ?
    i18n.localize((new Date()), {format: 'date_only'})                    // => "Sonntag, 23. September 2010"
    i18n.localize(123456.78, {translator: 'Currency', currency: 'CHF'})   // => "CHF 123'456.78"
    i18n.localize(123456.78)                                              // => "123'456.78"
    i18n.localize([1,2,3])                                                // => "1, 2 und 3"
    i18n.localize([1,2,3], {connector: 'or'})                             // => "1, 2 oder 3"

    t = i18n.t()
    t('key')
    l = i18n.l()
    l(obj)

  DONE:
  * variables in keys
  * variables in translations
  * translations
  * localizations
  * fallbacks
  * locale cascading (e.g. de-CH -> de -> generic)
  * merge loading

  TODO:
  * i18n.withOptions(options, function() {
      i18n. ...
    });
  * Options:
    * scope
    * locale
    * exception
    * count (pluralization)
**/

if (!window.Jacob) window.Jacob = {};
Jacob = window.Jacob;

Jacob.I18n = function Jacob__I18n(locale) {
  this._translators  = {};
  this._translations = {};

  this.locale(locale || this.constructor.defaultLocale);
  this.scope('/');
  this.loadLocale(Jacob.I18n.builtIn);
}
Jacob.I18n.prototype.t = function Jacob__I18n___t() {
  var i18n      = this;
  var translate = this.translate;
  return function() {
    return translate.apply(i18n, arguments);
  }
}
Jacob.I18n.prototype.l = function Jacob__I18n___l() {
  var i18n     = this;
  var localize = this.localize;
  return function() {
    return localize.apply(i18n, arguments);
  }
}
Jacob.I18n.prototype.cascadeLocales = function Jacob__I18n___cascadeLocales(locale) {
  locale      = locale || this._locale;
  var cascade = [locale]
  var part    = locale.match(/^[^-]+(?=-)/)
  if (part) cascade.push(part[0]);
  if (locale != 'generic') cascade.push('generic');

  return cascade;
}
Jacob.I18n.prototype.locale = function Jacob__I18n___locale(setLocale) {
  if (setLocale !== undefined) {
    this._locale          = setLocale;
    this._cascadedLocales = this.cascadeLocales();
  }
  return this._locale;
}
Jacob.I18n.prototype.scope = function Jacob__I18n___scope(setScope) {
  if (setScope !== undefined) {
    if (setScope.substr( 0, 1) != '/') throw("Invalid scope, must be absolute");
    if (setScope.substr(-1, 1) != '/') setScope = setScope + '/';
    this._scope = setScope;
  }
  return this._scope;
}

Jacob.I18n.prototype.translations = function Jacob__I18n___translations() {
  return this._translations;
}
Jacob.I18n.prototype.lookup = function Jacob__I18n___lookup(container, cascadedLocales, key) {
  for(var i=0; i < cascadedLocales.length; i++) {
    var translations = container[cascadedLocales[i]]
    var translation  = translations ? translations[key] : undefined;
    if (translation) return translation;
  }
}
Jacob.I18n.prototype.resolveKey = function Jacob__I18n___resolveKey(key, variables, scope) {
  if (key.substr(0,1) != '/') { // absolute keys ignore scope
    scope = scope || this._scope;
    if (scope.substr( 0, 1) != '/') scope = this.resolveKey(scope);
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
}
Jacob.I18n.prototype.translate = function Jacob__I18n___translate(key, options) {
  var translation;
  options = options || {};

  if (options.count !== undefined) {
    key = key+'/'+this.localize(options.count, {translator: 'GrammarNumerus'});;
    if (options.variables) {
      options.variables.count = options.count;
    } else {
      options.variables = {count: options.count};
    }
  }
  key         = this.resolveKey(key, (options && options.segments), (options && options.scope));
  translation = this.lookup(this._translations, this._cascadedLocales, key) || (options && options.fallback);
  if (translation && options.variables) translation = Jacob.Template.interpolate(translation, undefined, options.variables);

  return translation;
}
Jacob.I18n.prototype.localize = function Jacob__I18n___localize(value, options) {
  options        = options || {};
  var name       = options.translator || value.constructor.name
  var translator = this.lookup(this._translators, this._cascadedLocales, name);

  return translator.localize.apply(this, [value, options]);
}
Jacob.I18n.prototype.load = function Jacob__I18n___load(locale, callback) {
  var locale = locale || this._locale;
  var i18n   = this;
  var uri    = (locale.match(/^\w+:\/\/|^\/|.js$|.json$/) ? locale : 'locales/'+locale+'.js');
  jQuery.ajax({
    url:     uri,
    success: function(data) {
      if (data) {
        i18n.loadLocale(jQuery.parseJSON(data));
        if (callback) callback();
      }
    },
    error: function() {
      throw("Failed to load '"+uri+"'");
    }
  });
}
Jacob.I18n.prototype.loadLocale = function Jacob__I18n___loadLocale(data) {
  this.addTranslators(data.locale, data.translators);
  this.addTranslations(data.locale, data.translations);
}
Jacob.I18n.prototype.addTranslators = function Jacob__I18n___addTranslators(locale, translators) {
  if (!this._translators[locale]) {
    this._translators[locale] = translators;
  } else {
    var storedTranslators = this._translators[locale];
    for(var key in translators) storedTranslators[key] = translators[key];
  }
  return true;
}
Jacob.I18n.prototype.addTranslations = function Jacob__I18n___addTranslations(locale, translations) {
  var flattened = this.flattenLocales(translations);
  if (!this._translations[locale]) {
    this._translations[locale] = flattened;
  } else {
    var storedTranslations = this._translations[locale];
    for(var key in flattened) storedTranslations[key] = flattened[key];
  }
  return true;
}
Jacob.I18n.prototype.addTranslations = function Jacob__I18n___addTranslations(locale, translations) {
  var flattened = this.flattenLocales(translations);
  if (!this._translations[locale]) {
    this._translations[locale] = flattened;
  } else {
    var translations = this._translations[locale];
    for(var key in flattened) translations[key] = flattened[key];
  }
  return true;
}
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
}


/* Built-in translations and translators */
Jacob.I18n.defaultLocale = 'en';
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
}
