/*
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.

  jacob-barrier is a compilation of the following files:
  * jacob/barrier.js
*/


/**
 *     Jacob
 *
 *    JACOB
 *    =====
 *    
 *    Install
 *    -------
 *    
 *    1. Copy javascripts/jacob.js to your projects javascripts directory and link to it.
 *    2. There's no step 2.
 *    
 *    Note: jacob.js is a compilation of all files contained in the lib/jacob
 *    directory and is therefore all you need. The jacob-dev.js file is the same
 *    but before minification.
 *    
 *    
 *    Summary
 *    -------
 *    
 *    Jacob is a library, or rather a set of libraries, which will help you with
 *    all kinds of tasks related to javascript.
 *    
 *    The sublibraries are the following:
 *    
 *    * Jacob.I18n:
 *      Translate strings by key, localize dates, arrays and other
 *      objects.
 *    * Jacob.Template:
 *      Interpolate variables in strings like "Hello %{name}"
 *    * Jacob.HTTP:
 *      Handle ajax-requests and websockets
 *    
 *    
 *    Examples
 *    --------
 *    
 *    Here a couple of examples, for live examples, take a look at the examples/
 *    directory.
 *    
 *        i18n    = new Jacob.I18n('en');
 *        barrier = new Jacob.Barrier();
 *        i18n.load('locales/en.js', barrier.wait());
 *        i18n.load('locales/en-US.js', barrier.wait());
 *        barrier.release(function() { // we have to wait for the locales to be loaded
 *          // assuming the keys 'sites/index/title' and '/greeting' are defined in your locales files
 *          i18n.translate('/sites/index/title');                                // => "Welcome to CompuGlobalHyperMegaNet!"
 *          i18n.translate('/sites/%{site}/title', {segments: {site: 'value'}}); // => "Welcome to CompuGlobalHyperMegaNet!"
 *          i18n.translate('/greeting');                                         // => "Hello %{first_name}!"
 *          i18n.translate('/greeting', {variables: {first_name: 'Homer'}});     // => "Hello Homer!"
 *          i18n.localize((new Date()), {format: 'date_only'});                  // => "Sunday, 23. September 2010"
 *          i18n.localize(123456.78);                                            // => "123.456,78"
 *          i18n.localize(123456.78, {translator: 'Currency', currency: 'CHF'}); // => "USD 123.456,78"
 *          i18n.localize([1,2,3]);                                              // => "1, 2 and 3"
 *          i18n.localize([1,2,3], {connector: 'or'});                           // => "1, 2 or 3"
 *        });
 *    
 *    
 *    Version
 *    -------
 *    
 *    This is to be considered an early alpha version of Jacob.
 *    
 *    
 *    External Dependencies
 *    ---------------------
 *    
 *    Some of Jacobs sub-libraries currently depend on jQuery for some functionality:
 *    * Jacob.HTTP
 *    * Jacob.JSON
 *    
 *    
 *    License
 *    -------
 *    
 *    You can choose between MIT and BSD-3-Clause license.
 *    License file will be added later.
 **/

if (!window.Jacob) window.Jacob = {};
Jacob = window.Jacob;

(function() {
/* File jacob/codec/base64.js */
/**
 *    mixin Jacob.Codec.Base64
 *
 *    ## Summary
 *
 *    Encode/Decode base64.
 *    Also take a look at Jacob.Codec.
 *
 *
 *    ## Synopsis
 *
 *        Jacob.Codec.Base64.encode("Some string")      // => "U29tZSBTdHJpbmc="
 *        Jacob.Codec.Base64.decode("U29tZSBTdHJpbmc=") // => "Some String"
 *
 *
 *    ## ToDo
 *
 *    * Find the library this was derived from to give proper credit.
 *    * Move the private functions to Jacob.Util.
 **/
Jacob.Codec.Base64 = {}


/* INTERNAL
 *    Jacob.Codec.Base64._keyStr = String
 **/
// private property
Jacob.Codec.Base64._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",


/**
 *    Jacob.Codec.Base64.encode(input) -> String
 *    - input (String): The string to encode in base64
 *
 *    ## Summary
 *
 *    Encodes a String in Base64 (http://en.wikipedia.org/wiki/Base64).
 *
 *
 *    ## Synopsis
 *
 *        Jacob.Codec.Base64.encode("Some string")      // => "U29tZSBTdHJpbmc="
 **/
Jacob.Codec.Base64.encode = function Jacob__Codec__Base64__encode(input) {
  var output = [];
  var i      = 0;
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;

  input = Jacob.Codec.Base64._utf8_encode(input);

  while (i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
        enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
        enc4 = 64;
    }

    output.push([this._keyStr.charAt(enc1),
                 this._keyStr.charAt(enc2),
                 this._keyStr.charAt(enc3),
                 this._keyStr.charAt(enc4)].join(''));
  }

  return output.join('');
};

/**
 *    Jacob.Codec.Base64.decode(input[, unicode=false]) -> String
 *    - input (String): The base64 encoded string to decode
 *    - unicode (Boolean): Whether the input string is in unicode
 *
 *    ## Summary
 *
 *    Decodes a base64 encoded String (http://en.wikipedia.org/wiki/Base64).
 *
 *
 *    ## Synopsis
 *
 *        Jacob.Codec.Base64.decode("U29tZSBTdHJpbmc=") // => "Some String"
 **/
Jacob.Codec.Base64.decode = function Jacob__Codec__Base64__decode(input, utf8) {
  var output = [],
      chr1, chr2, chr3,
      enc1, enc2, enc3, enc4,
      i = 0;

  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

  while (i < input.length) {
    enc1 = this._keyStr.indexOf(input.charAt(i++));
    enc2 = this._keyStr.indexOf(input.charAt(i++));
    enc3 = this._keyStr.indexOf(input.charAt(i++));
    enc4 = this._keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output.push(String.fromCharCode(chr1));

    if (enc3 != 64) {
      output.push(String.fromCharCode(chr2));
    }
    if (enc4 != 64) {
      output.push(String.fromCharCode(chr3));
    }
  }

  output = output.join(''); 

  if (utf8) {
    output = Jacob.Codec.Base64._utf8_decode(output);
  }

  return output;
};


/**
 *    Jacob.Codec.Base64._decodeAsArray(input) -> Array
 *    - input (String): The String to convert to an array of Integers
 *
 *    ## Summary
 *
 *    Converts an input string encoded in base64 to an array of integers whose
 *    values represent the decoded string's characters' bytes.
 *
 *
 *    ## Synopsis
 *
 *        var base64hello = Jacob.Codec.Base64.encode("Hello");
 *        Jacob.Codec.Base64._decodeAsArray(base64hello);
 *        // => [72, 101, 108, 108, 111]
 **/
Jacob.Codec.Base64.decodeAsArray = function Jacob__Codec__Base64___decodeAsArray(input){
  var dec = this.decode(input),
      ar = [], i;
  for (i=0;i<dec.length;i++){
    ar[i]=dec.charCodeAt(i);
  }

  return ar;
};


/* INTERNAL
 *    Jacob.Codec.Base64._utf8_encode(input) -> String
 *    - input (String): The String to convert multiple singlebyte characters to
 *      single multibyte characters.
 *
 *    ## Summary
 *
 *    Javascript can store the same multibyte characters byte sequences in
 *    multiple ways, either as many distinct characters consisting of a single
 *    byte (each having a charCode < 256) or as a single character consisting of
 *    multiple bytes (with charCode > 255).
 *    This function converts from multiple singlebyte characters to single
 *    multibyte characters.
 *
 *
 *    ## Synopsis
 *
 *        Jacob.Codec.Base64._utf8_encode("") // => ""
 **/
Jacob.Codec.Base64._utf8_encode = function Jacob__Codec__Base64___utf8_encode(string) {
  string = string.replace(/\r\n/g,"\n");
  var utftext = "";

  for (var n = 0; n < string.length; n++) {

    var c = string.charCodeAt(n);

    if (c < 128) {
      utftext += String.fromCharCode(c);
    }
    else if((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    }
    else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }

  return utftext;
};


/* INTERNAL
 *    Jacob.Codec.Base64._utf8_decode(input) -> String
 *    - input (String): The String to convert single multibyte characters to
 *      multiple singlebyte characters
 *
 *    ## Summary
 *
 *    Javascript can store the same multibyte characters byte sequences in
 *    multiple ways, either as many distinct characters consisting of a single
 *    byte (each having a charCode < 256) or as a single character consisting of
 *    multiple bytes (with charCode > 255).
 *    This function converts from single multibyte characters to multiple
 *    singlebyte characters.
 *
 *
 *    ## Synopsis
 *
 *        Jacob.Codec.Base64._utf8_decode("") // => ""
 **/
Jacob.Codec.Base64._utf8_decode = function Jacob__Codec__Base64___utf8_decode(utftext) {
  var string = [],
      i = 0,
      c = 0, c2 = 0, c3 = 0;

  while ( i < utftext.length ) {
    c = utftext.charCodeAt(i);
    if (c < 128) {
      string.push(String.fromCharCode(c));
      i++;
    }
    else if((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i+1);
      string.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
      i += 2;
    }
    else {
      c2 = utftext.charCodeAt(i+1);
      c3 = utftext.charCodeAt(i+2);
      string.push(String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
      i += 3;
    }
  }

  return string.join('');
};


/* INTERNAL
 *    Jacob.Codec.Base64._destrip(input) -> String
 *    - input (String): The String to destrip
 *
 *    ## Summary
 *
 *    FIXME
 *
 *
 *    ## Synopsis
 *
 *        Jacob.Codec.Base64._destrip("") // => ""
 **/
Jacob.Codec.Base64._destrip = function Jacob__Codec__Base64___destrip(stripped, wrap){
  var lines = [], lineno, i,
      destripped = [];
  
  if (wrap==null) wrap = 76;

  stripped.replace(/ /g, "");
  lineno = stripped.length / wrap;
  for (i = 0; i < lineno; i++) lines[i]=stripped.substr(i * wrap, wrap);
  if (lineno != stripped.length / wrap)
      lines[lines.length]=stripped.substr(lineno * wrap, stripped.length-(lineno * wrap));

  for (i = 0; i < lines.length; i++) destripped.push(lines[i]);

  return destripped.join('\n');
};
})();
