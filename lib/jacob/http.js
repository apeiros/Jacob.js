/*--
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.
--*/

/**
 *    class Jacob.HTTP
 *
 *    ## Summary
 *
 *    Handles http connections. Currently it is a wrapper around jQuery and
 *    exists only for the purpose to let Jacob users not depend on jQuery
 *    themselves.
 *
 *
 *    ## Synopsis
 *
 *        Jacob.HTTP.get('/foo', {success: function() { ... }});
 *
 *
 *    ## External Dependencies
 *
 *    Jacob.HTTP currently depends on jQuery.
 **/



Jacob.HTTP = function Jacob__HTTP() {
};


/**
 *    Jacob.HTTP.get(url[, options]) -> undefined
 *    - url (String):     The URL from which to request data using GET.
 *    - options (Object): An options hash, see Options
 *
 *    ## Summary
 *
 *    Performs a get request.
 *
 *
 *    ## Options
 *
 *    * success (Function): A callback to invoke upon success (HTTP Status 200).
 *    * error (Function): A callback to invoke upon failure (No response or HTTP Status 3xx).
 *
 *
 *    ## Synopsis
 *
 *        Jacob.HTTP.get('/foo', {success: function() { ... }});
 **/
Jacob.HTTP.get = function Jacob__HTTP___get(url, options) {
  options = Jacob.Util.clone(options);
  options.url = url;
  jQuery.ajax(options);
}
