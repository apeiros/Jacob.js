/*--
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.
--*/



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
  switch(typeof(source)) {
    case "object":
      if (source instanceof Array) {
        return source.slice();
      } else {
        return Jacob.Util.extend({}, source);
      }
    case "string":
    case "number":
    default:
      return source;
  }
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


/** 
 *  Jacob.Util.ownPropertyNames(object) -> Object
 *  - object (Object): The object from which to get the property names.
 *
 *  ## Summary
 *
 *  Returns all property names that belong to the given object only
 *
 *
 *  ## Synopsis
 *
 *      Jacob.Util.ownPropertyNames({a: 1, b: 2}) -> ['a', 'b']
 *
 **/
Jacob.Util.ownPropertyNames = function Jacob__Util__ownPropertyNames(object) {
  var names=[];
  for(propertyName in object) {
    if (object.hasOwnProperty(propertyName)) names.push(propertyName);
  }

  return names;
}


/** 
 *  Jacob.Util.arraySubtract(arrayA, arrayB) -> diff (Array)
 *  - arrayA (Array): The minuend.
 *  - arrayB (Array): The subtrahend.
 *
 *  ## Summary
 *
 *  Returns all values of ArrayA that are not in ArrayB.
 *
 *
 *  ## Synopsis
 *
 *      Jacob.Util.ownPropertyNames([1, 2, 3], [3, 4, 5]) -> ["1"]
 *
 *
 *  ## Warning
 *
 *  Since this function uses an object as a hash to perform the subtraction,
 *  all keys are treated as strings.
 *
 **/
Jacob.Util.arraySubtract = function Jacob__Util__arraySubtract(arrayA, arrayB) {
  var diffSet={}
  for(var i=0; i < arrayA.length; i++) diffSet[arrayA[i]] = true;
  for(var i=0; i < arrayB.length; i++) delete diffSet[arrayB[i]];

  return Jacob.Util.ownPropertyNames(diffSet);
}


/** 
 *  Jacob.Util.backtrace(ignoreFirstNLevels, limitToNLevels) -> backtrace (Array)
 *  - ignoreFirstNLevels (Integer): Don't report the first N levels of the backtrace.
 *  - limitToNLevels (Integer): Report N levels at max.
 *
 *  ## Summary
 *
 *  Returns an array of function names in order of their invocation nesting.
 *
 *
 *  ## Synopsis
 *
 *      function outer() { return inner(); }
 *      function inner() { return Jacob.Util.backtrace(); }
 *      // => ["Jacob__Util__backtrace", "inner", "outer"]
 *
 **/
Jacob.Util.backtrace = function Jacob__Util__backtrace(ignoreFirstNLevels, limitToNLevels) {
  var callee = arguments.callee;
  var trace  = [callee.name];
  var callee = callee.caller;
  while (callee) {
    trace.push(callee.name || "<anonymous>");
    callee = callee.caller;
  }
  limitToNLevels = limitToNLevels || trace.length;

  return trace.slice(ignoreFirstNLevels || 0, limitToNLevels);
}


/** 
 *  Jacob.Util.dateToISO8601(date) -> isoDate (String)
 *  - date (Date): The date to serialize in ISO8601 format.
 *
 *  ## Summary
 *
 *  Returns a date in ISO8601 format.
 *
 *
 *  ## Synopsis
 *
 *      Jacob.Util.dateToISO8601(new Date()); // => "2010-12-31T12:34:56"
 *
 **/
Jacob.Util.dateToISO8601 = function Jacob__Util__dateToISO8601(date) {
  var y = date.getFullYear().toString();
  var m = (date.getMonth()+1).toString();
  var d = date.getDate().toString();
  var H = date.getHours().toString();
  var M = date.getMinutes().toString();
  var S = date.getSeconds().toString();
  switch(y.length) {
    case 1:   y = "000"+y; break;
    case 2:   y =  "00"+y; break;
    case 3:   y =   "0"+y; break;
  }
  if (m.length == 1) m = "0"+m;
  if (d.length == 1) d = "0"+d;
  if (H.length == 1) H = "0"+H;
  if (M.length == 1) M = "0"+M;
  if (S.length == 1) S = "0"+S;

  return y+"-"+m+"-"+d+"T"+H+":"+M+":"+S;
}

/** 
 *  Jacob.Util.isEmpty(obj) -> (Boolean)
 *  - obj (Object): The object to test for emptiness.
 *
 *  ## Summary
 *
 *  Returns whether the given object is empty.
 *  If an object responds to isEmpty and isEmpty is a function, then that is
 *  used to determine emptiness. Otherwise only {}, [], "" and 0 are empty.
 *
 *
 *  ## Synopsis
 *
 *      Jacob.Util.isEmpty({});        // => true
 *      Jacob.Util.isEmpty({a: 1});    // => false
 *      Jacob.Util.isEmpty([]);        // => true
 *      Jacob.Util.isEmpty([1]);       // => false
 *      Jacob.Util.isEmpty("");        // => true
 *      Jacob.Util.isEmpty("hello");   // => false
 *      Jacob.Util.isEmpty(0);         // => true
 *      Jacob.Util.isEmpty(1);         // => false
 *      Jacob.Util.isEmpty(new Foo()); // => false
 *
 **/
Jacob.Util.isEmpty = function Jacob__Util__isEmpty(obj) {
  if (typeof(obj.isEmpty) == "function") {
    return obj.isEmpty();
  } else {
    switch(typeof(obj)) {
      case "object":
        if (obj instanceof Array) {
          return obj.length == 0;
        } else if (obj.constructor == Object) {
          isEmpty = true;
          for(property in obj) {
            if (obj.hasOwnProperty(property)) {
              isEmpty = false;
              break;
            }
          }
          return isEmpty;
        } else {
          return false;
        }
      case "string":
        return obj === "";
      case "number":
        return obj === 0;
      default:
        return false;
    }
  }
}
