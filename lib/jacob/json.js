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
