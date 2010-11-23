/*--
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.



  This is part of Jacob.I18n. It is responsible for localizing dates.
--*/



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
