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
      return Jacob.Util.extend({}, source);
    case "array":
    case "string":
      return source.slice();
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
