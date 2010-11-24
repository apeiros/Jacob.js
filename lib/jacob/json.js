/*--
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.
--*/

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
 *
 *
 *  ## External Dependencies
 *
 *  Jacob.JSON currently depends on jQuery.
 **/



Jacob.JSON = {name: 'Jacob__JSON'};


/**
 *  Jacob.JSON.parse(string) -> deserialized (Object)
 *
 *  ## Summary
 *
 *    Parse JSON Strings and convert it to the corresponding object.
 *
 *
 *  ## Synopsis
 *
 *      Jacob.JSON.parse('{"a": 1}'); // => {a: 1}
 **/
Jacob.JSON.parse = function() {
  return jQuery.parseJSON.apply(jQuery, arguments);
}


/* UNIMPLEMENTED
 *  Jacob.JSON.dump(object) -> serialized (String)
 *
 *  ## Summary
 *
 *    Serialize objects to JSON Strings.
 *
 *
 *  ## Synopsis
 *
 *      Jacob.JSON.dump({a: 1}); // => "{\"a\": 1}"
 **/
Jacob.JSON.dump  = function Jacob__JSON__dump() {
  throw("Not yet implemented");
};
