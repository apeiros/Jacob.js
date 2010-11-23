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
