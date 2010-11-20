I18n
I18n handles translation of strings and localization of objects, like
dates, numbers, monetary expressions, arrays etc.

Examples:
  i18n = new Jacob.I18n('de-CH');
  i18n.translate('relative/key');
  i18n.translate('../relative/key');
  i18n.translate('/absolute/key');
  i18n.translate('some/key', {variable: 'value'})
  i18n.translate('some/key', {option: value}, {variable: 'value'})      // => "Translated value for /some/key"
  i18n.localize((new Date()), {format: 'date_only'})                    // => "Sonntag, 23. September 2010"
  i18n.localize(123456.78, {translator: 'Currency', currency: 'CHF'})   // => "CHF 123'456.78"
  i18n.localize(123456.78)                                              // => "123'456.78"
  i18n.localize([1,2,3])                                                // => "1, 2 und 3"
  i18n.localize([1,2,3], {connector: 'or'})                             // => "1, 2 oder 3"

  t = i18n.t()
  t('key')
  l = i18n.l()
  l(obj)

VERSION
  This is to be considered an early alpha version of Jacob.I18n.

DEPENDENCIES
  Jacob.I18n currently depends on jquery for some functionality (mainly
  I18n.load).

LICENSE
  You can choose between MIT and BSD-3-Clause license.
  License file will be added later.