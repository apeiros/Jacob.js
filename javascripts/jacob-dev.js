/*
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.

  jacob is a compilation of the following files:
  * jacob/barrier.js
  * jacob/codec.js
  * jacob/codec/base64.js
  * jacob/codec/gzip.js
  * jacob/http.js
  * jacob/i18n.js
  * jacob/i18n/datetime.js
  * jacob/json.js
  * jacob/log.js
  * jacob/template.js
  * jacob/util.js
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
/* File jacob/barrier.js */
/**
 *    class Jacob.Barrier
 *
 *    ## Summary
 *
 *    Barrier lets you invoke multiple asynchronous functions waiting for all to
 *    complete. This is useful in situations where you have to resolve
 *    dependencies first.
 *
 *
 *    ## Synopsis
 *
 *        barrier = new Jacob.Barrier();
 *        i18n = new Jacob.I18n('de-CH');
 *        i18n.load('locale1', barrier.wait());
 *        i18n.load('locale2', barrier.wait());
 *        i18n.load('locale3', barrier.wait());
 *        barrier.release(function() {
 *          // executed after locale1, locale2 and locale3 have been loaded
 *        })
 *
 *
 *    ## Warning
 *
 *    This library assumes no true concurrency in the javascript interpreter.
 *    At the time of writing, no javascript interpreter actually offers true
 *    concurrency, so this is not (yet) an issue. In future, it might be.
 **/



/**
 *    new Jacob.Barrier()
 *
 *    ## Summary
 *
 *    Creates a new Barrier.
 **/
Jacob.Barrier = function Jacob__Barrier() {
  this.length     = 0;
  this._waiterID  = 0;
  this._waiters   = {};
  this._releasers = [];
};


/**
 *    Jacob.Barrier#wait([id]) -> Object
 *    - id: An optional identifier. If none is given, a numerical one is
 *      generated. You SHOULD NOT manually pass in numeric IDs. Use e.g. strings
 *      instead.
 *
 *    ## Summary
 *
 *    Blocks the barrier until the returned function is invoked.
 *
 *
 *    ## Synopsis
 *
 *        barrier = new Jacob.Barrier();
 *        waiter  = barrier.wait();
 *        barrier.release(function() { alert("released!"); });
 *        waiter(); // all waiters have been called, "released!" is displayed
 **/
Jacob.Barrier.prototype.wait = function Jacob__Barrier___wait(id) {
  var barrier = this;
  var id      = this.block(id);
  var waiter  = function() { barrier.clear(id) };

  return waiter;
};


/**
 *    Jacob.Barrier#block([id]) -> Integer | id
 *    - id: An optional identifier. If none is given, a numerical one is
 *      generated. You SHOULD NOT manually pass in numeric IDs. Use e.g. strings
 *      instead.
 *
 *    ## Summary
 *
 *    Blocks the barrier until the id is cleared using Jacob.Barrier#clear(id).
 *
 *
 *    ## Synopsis
 *
 *        barrier  = new Jacob.Barrier();
 *        block_id = barrier.block();
 *        barrier.release(function() { alert("released!"); });
 *        barrier.clear(block_id); // all waiters have been called, "released!" is displayed
 **/
Jacob.Barrier.prototype.block = function Jacob__Barrier___block(id) {
  var id      = id || this.nextID();
  if (!this._waiters[id]) {
    this.length++;
    this._waiters[id] = true;
  }

  return id;
};


/* INTERNAL
 *    Jacob.Barrier#nextID() -> Integer
 *
 *    ## Summary
 *
 *    Generates a new unused ID to be used by block.
 *
 *
 *    ## Synopsis
 *
 *        barrier  = new Jacob.Barrier();
 *        block_id = barrier.nextID();
 **/
Jacob.Barrier.prototype.nextID = function Jacob__Barrier___nextID() {
  var id = this._waiterID;
  this._waiterID++;

  return id;
};


/**
 *    Jacob.Barrier#clear([id]) -> Object
 *    - id: An optional identifier. If none is given, all blockers are cleared.
 *
 *    ## Summary
 *
 *    Clears a block in the barrier, if it was the last one blocking, it
 *    also invokes Jacob.Barrier#triggerRelease().
 *    Note: if all blocks are cleared, invoking clear will have no effect.
 *
 *
 *    ## Synopsis
 *
 *        barrier  = new Jacob.Barrier();
 *        block_id = barrier.block();
 *        barrier.release(function() { alert("released!"); });
 *        barrier.clear(block_id); // all waiters have been called, "released!" is displayed
 **/
Jacob.Barrier.prototype.clear = function Jacob__Barrier___clear(id) {
  if (this._waiters[id]) {
    this.length--;
    delete this._waiters[id];
    if (!this.length) this.triggerRelease();
  }

  return this;
};

/* INTERNAL
 *    Jacob.Barrier#triggerRelease() -> this
 *
 *    ## Summary
 *
 *    Invokes all release callbacks.
 *
 *
 *    ## Synopsis
 *
 *        barrier  = new Jacob.Barrier();
 *        barrier.release(function() { alert("released!"); });
 *        barrier.triggerRelease(); // "released!" is displayed
 **/
Jacob.Barrier.prototype.triggerRelease = function Jacob__Barrier___triggerRelease() {
  for(var i=0; i<this._releasers.length; i++) this._releasers[i]();

  return this;
};


/**
 *    Jacob.Barrier#release(callback) -> this
 *    - callback (Function): A function that should be invoked when all blocks
 *      in the barrier are cleared.
 *
 *    ## Summary
 *
 *    Clears a block in the barrier, if it was the last one blocking, it
 *    also invokes Jacob.Barrier#triggerRelease().
 *
 *
 *    ## Synopsis
 *
 *        barrier  = new Jacob.Barrier();
 *        barrier.release(function() { alert("released!"); });
 *        barrier.clear(barrier.block()) // all waiters have been called, "released!" is displayed
 **/
Jacob.Barrier.prototype.release = function Jacob__Barrier___release(releaser) {
  this._releasers.push(releaser);

  return this;
};



/* File jacob/codec.js */
/**
 *  mixin Jacob.Codec
 *
 *  ## Summary
 *
 *    Decode and encode Strings from and to various formats.
 *
 *
 *  ## Synopsis
 *
 *      Jacob.Codec.gunzip(string)       // => Object
 *      Jacob.Codec.base64Encode(string) // => String
 *      Jacob.Codec.base64Decode(string) // => String
 **/

Jacob.Codec = {name: 'Jacob__Codec'};


/** alias of: Jacob.Codec.GZip.gunzip
 *  Jacob.Codec.GZipDecode(string) -> unzipped (String)
 *
 *  ## Summary
 *
 *    Unzips a gzipped string.
 *    See Jacob.Codec.GZip.gunzip for more information.
 *
 *
 *  ## Synopsis
 *
 *      Jacob.Codec.GZipDecode(string)   // => Object
 **/
Jacob.Codec.GZipDecode = function() { return Jacob.Codec.GZip.gunzip.apply(Jacob.Codec.GZip, arguments); }


/** alias of: Jacob.Codec.Base64.encode
 *  Jacob.Codec.base64Encode(string) -> base64 encoded (String)
 *
 *  ## Summary
 *
 *    Decodes a base64 encoded string.
 *    See Jacob.Codec.Base64.encode for more information.
 *
 *
 *  ## Synopsis
 *
 *      Jacob.Codec.base64Encode(string)   // => base64 encoded (String)
 **/
Jacob.Codec.base64Encode = function() { return Jacob.Codec.Base64.encode.apply(Jacob.Codec.Base64, arguments); }


/** alias of: Jacob.Codec.Base64.decode
 *  Jacob.Codec.base64Decode(string) -> base64 decoded (String)
 *
 *  ## Summary
 *
 *    Decodes a base64 decoded string.
 *    See Jacob.Codec.Base64.decode for more information.
 *
 *
 *  ## Synopsis
 *
 *      Jacob.Codec.base64Decode(string)   // => decoded (String)
 **/
Jacob.Codec.base64Decode = function() { return Jacob.Codec.Base64.decode.apply(Jacob.Codec.Base64, arguments); }



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
Jacob.Codec.Base64 = {name: 'Jacob__Codec__Base64'};


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



/* File jacob/codec/gzip.js */
/**
 *  class Jacob.Codec.GZip
 *
 *  ## Summary
 *
 *  GZip decompression
 *
 *
 *  ## Synopsis
 *
 *      Jacob.Codec.GZip.gunzip(string) // => String
 *
 *
 *  ## ToDo
 *
 *  Find the library this was derived from to give proper credit.
 **/



/**
 *  new Jacob.Codec.GZip()
 *  - data (Array | String): The bytestream to decompress
 *
 *  ## Summary
 *
 *  See Jacob.Codec.GZip.gunzip.
 **/
Jacob.Codec.GZip = function Jacob__GZip(data) {
  this.data            = data;

  this.debug           = false;
  this.gpflags         = undefined;
  this.files           = 0;
  this.unzipped        = [];
  this.buf32k          = new Array(32768);
  this.bIdx            = 0;
  this.modeZIP         = false;
  this.bytepos         = 0;
  this.bb              = 1;
  this.bits            = 0;
  this.nameBuf         = [];
  this.fileout         = undefined;
  this.literalTree     = new Array(Jacob.Codec.GZip.LITERALS);
  this.distanceTree    = new Array(32);
  this.treepos         = 0;
  this.Places          = null;
  this.len             = 0;
  this.fpos            = new Array(17);
  this.fpos[0]         = 0;
  this.flens           = undefined;
  this.fmax            = undefined;
}


/**
 *  Jacob.Codec.GZip.gunzip(data) -> String
 *  - data (Array | String): The bytestream to decompress. Either an array of
 *    Integers between 0 and 255, or a String.
 *
 *  ## Summary
 *
 *  Unzips the gzipped data of the 'data' argument.
 **/
Jacob.Codec.GZip.gunzip = function(string) {
  if (string.constructor === Array) {
  } else if (string.constructor === String) {
  }
  var gzip = new Jacob.Codec.GZip(string);
  return gzip.gunzip()[0][0];
}

Jacob.Codec.GZip.HufNode = function() {
  this.b0      = 0;
  this.b1      = 0;
  this.jump    = null;
  this.jumppos = -1;
};



/* Constants */
Jacob.Codec.GZip.LITERALS   = 288;
Jacob.Codec.GZip.NAMEMAX    = 256;

Jacob.Codec.GZip.bitReverse = [
  0x00, 0x80, 0x40, 0xc0, 0x20, 0xa0, 0x60, 0xe0,
  0x10, 0x90, 0x50, 0xd0, 0x30, 0xb0, 0x70, 0xf0,
  0x08, 0x88, 0x48, 0xc8, 0x28, 0xa8, 0x68, 0xe8,
  0x18, 0x98, 0x58, 0xd8, 0x38, 0xb8, 0x78, 0xf8,
  0x04, 0x84, 0x44, 0xc4, 0x24, 0xa4, 0x64, 0xe4,
  0x14, 0x94, 0x54, 0xd4, 0x34, 0xb4, 0x74, 0xf4,
  0x0c, 0x8c, 0x4c, 0xcc, 0x2c, 0xac, 0x6c, 0xec,
  0x1c, 0x9c, 0x5c, 0xdc, 0x3c, 0xbc, 0x7c, 0xfc,
  0x02, 0x82, 0x42, 0xc2, 0x22, 0xa2, 0x62, 0xe2,
  0x12, 0x92, 0x52, 0xd2, 0x32, 0xb2, 0x72, 0xf2,
  0x0a, 0x8a, 0x4a, 0xca, 0x2a, 0xaa, 0x6a, 0xea,
  0x1a, 0x9a, 0x5a, 0xda, 0x3a, 0xba, 0x7a, 0xfa,
  0x06, 0x86, 0x46, 0xc6, 0x26, 0xa6, 0x66, 0xe6,
  0x16, 0x96, 0x56, 0xd6, 0x36, 0xb6, 0x76, 0xf6,
  0x0e, 0x8e, 0x4e, 0xce, 0x2e, 0xae, 0x6e, 0xee,
  0x1e, 0x9e, 0x5e, 0xde, 0x3e, 0xbe, 0x7e, 0xfe,
  0x01, 0x81, 0x41, 0xc1, 0x21, 0xa1, 0x61, 0xe1,
  0x11, 0x91, 0x51, 0xd1, 0x31, 0xb1, 0x71, 0xf1,
  0x09, 0x89, 0x49, 0xc9, 0x29, 0xa9, 0x69, 0xe9,
  0x19, 0x99, 0x59, 0xd9, 0x39, 0xb9, 0x79, 0xf9,
  0x05, 0x85, 0x45, 0xc5, 0x25, 0xa5, 0x65, 0xe5,
  0x15, 0x95, 0x55, 0xd5, 0x35, 0xb5, 0x75, 0xf5,
  0x0d, 0x8d, 0x4d, 0xcd, 0x2d, 0xad, 0x6d, 0xed,
  0x1d, 0x9d, 0x5d, 0xdd, 0x3d, 0xbd, 0x7d, 0xfd,
  0x03, 0x83, 0x43, 0xc3, 0x23, 0xa3, 0x63, 0xe3,
  0x13, 0x93, 0x53, 0xd3, 0x33, 0xb3, 0x73, 0xf3,
  0x0b, 0x8b, 0x4b, 0xcb, 0x2b, 0xab, 0x6b, 0xeb,
  0x1b, 0x9b, 0x5b, 0xdb, 0x3b, 0xbb, 0x7b, 0xfb,
  0x07, 0x87, 0x47, 0xc7, 0x27, 0xa7, 0x67, 0xe7,
  0x17, 0x97, 0x57, 0xd7, 0x37, 0xb7, 0x77, 0xf7,
  0x0f, 0x8f, 0x4f, 0xcf, 0x2f, 0xaf, 0x6f, 0xef,
  0x1f, 0x9f, 0x5f, 0xdf, 0x3f, 0xbf, 0x7f, 0xff
];
Jacob.Codec.GZip.cplens = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
];
Jacob.Codec.GZip.cplext = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
  3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99
]; /* 99==invalid */
Jacob.Codec.GZip.cpdist = [
  0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d,
  0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1,
  0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01,
  0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001
];
Jacob.Codec.GZip.cpdext = [
  0,  0,  0,  0,  1,  1,  2,  2,
  3,  3,  4,  4,  5,  5,  6,  6,
  7,  7,  8,  8,  9,  9, 10, 10,
  11, 11, 12, 12, 13, 13
];
Jacob.Codec.GZip.border = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];



/* Instance methods */
Jacob.Codec.GZip.prototype.gunzip = function() {
  this.outputArr = [];

  //convertToByteArray(input);
  //if (this.debug) alert(this.data);

  this.nextFile();
  return this.unzipped;
}

Jacob.Codec.GZip.prototype.readByte = function() {
  this.bits+=8;
  if (this.bytepos < this.data.length) {
    //return this.data[this.bytepos++]; // Array
    return this.data.charCodeAt(this.bytepos++);
  } else {
    return -1;
  }
};

Jacob.Codec.GZip.prototype.byteAlign = function(){
  this.bb = 1;
};

Jacob.Codec.GZip.prototype.readBit = function(){
  var carry;
  this.bits++;
  carry = (this.bb & 1);
  this.bb >>= 1;
  if (this.bb==0){
    this.bb = this.readByte();
    carry = (this.bb & 1);
    this.bb = (this.bb>>1) | 0x80;
  }
  return carry;
};

Jacob.Codec.GZip.prototype.readBits = function(a) {
  var res = 0,
      i   = a;

  while(i--) res = (res<<1) | this.readBit();
  if (a) res = Jacob.Codec.GZip.bitReverse[res]>>(8-a);

  return res;
};

Jacob.Codec.GZip.prototype.flushBuffer = function(){
  this.bIdx = 0;
};

Jacob.Codec.GZip.prototype.addBuffer = function(a){
  this.buf32k[this.bIdx++] = a;
  this.outputArr.push(String.fromCharCode(a));
  if (this.bIdx==0x8000) this.bIdx=0;
};

Jacob.Codec.GZip.prototype.IsPat = function() {
  while (1) {
    if (this.fpos[this.len] >= this.fmax)       return -1;
    if (this.flens[this.fpos[this.len]] == this.len) return this.fpos[this.len]++;
    this.fpos[this.len]++;
  }
};

Jacob.Codec.GZip.prototype.Rec = function() {
  var curplace = this.Places[this.treepos];
  var tmp;
  //if (this.debug) document.write("<br>len:"+this.len+" treepos:"+this.treepos);
  if (this.len==17) { //war 17
    return -1;
  }
  this.treepos++;
  this.len++;

  tmp = this.IsPat();
  //if (this.debug) document.write("<br>IsPat "+tmp);
  if(tmp >= 0) {
    curplace.b0 = tmp;    /* leaf cell for 0-bit */
    //if (this.debug) document.write("<br>b0 "+curplace.b0);
  } else {
    /* Not a Leaf cell */
    curplace.b0 = 0x8000;
    //if (this.debug) document.write("<br>b0 "+curplace.b0);
    if (this.Rec()) return -1;
  }
  tmp = this.IsPat();
  if(tmp >= 0) {
    curplace.b1 = tmp;    /* leaf cell for 1-bit */
    //if (this.debug) document.write("<br>b1 "+curplace.b1);
    curplace.jump = null;    /* Just for the display routine */
  } else {
    /* Not a Leaf cell */
    curplace.b1 = 0x8000;
    //if (this.debug) document.write("<br>b1 "+curplace.b1);
    curplace.jump = this.Places[this.treepos];
    curplace.jumppos = this.treepos;
    if (this.Rec()) return -1;
  }
  this.len--;
  return 0;
}

Jacob.Codec.GZip.prototype.CreateTree = function(currentTree, numval, lengths, show) {
  var i;
  /* Create the Huffman decode tree/table */
  //if (this.debug) document.write("currentTree "+currentTree+" numval "+numval+" lengths "+lengths+" show "+show);
  this.Places  = currentTree;
  this.treepos =0;
  this.flens   = lengths;
  this.fmax    = numval;
  for (i=0;i<17;i++) this.fpos[i] = 0;
  this.len = 0;
  if(this.Rec()) {
    //if (this.debug) alert("invalid huffman tree\n");
    return -1;
  }
  // if (this.debug) {
  //   document.write('<br>Tree: '+this.Places.length);
  //   for (var a=0;a<32;a++){
  //     document.write("Places["+a+"].b0="+this.Places[a].b0+"<br>");
  //     document.write("Places["+a+"].b1="+this.Places[a].b1+"<br>");
  //   }
  // }

  return 0;
};

Jacob.Codec.GZip.prototype.DecodeValue = function(currentTree) {
  var len, i,
    xtreepos=0,
    X = currentTree[xtreepos],
    b;

  /* decode one symbol of the data */
  while(1) {
    b=this.readBit();
    // if (this.debug) document.write("b="+b);
    if (b) {
      if (!(X.b1 & 0x8000)){
        // if (this.debug) document.write("ret1");
        return X.b1;    /* If leaf node, return data */
      }
      X = X.jump;
      len = currentTree.length;
      for (i=0;i<len;i++){
        if (currentTree[i]===X){
          xtreepos=i;
          break;
        }
      }
    } else {
      if(!(X.b0 & 0x8000)){
        // if (this.debug) document.write("ret2");
        return X.b0;    /* If leaf node, return data */
      }
      xtreepos++;
      X = currentTree[xtreepos];
    }
  }
  // if (this.debug) document.write("ret3");

  return -1;
};

Jacob.Codec.GZip.prototype.DeflateLoop = function() {
  var last, c, type, i, len;

  do {
    last = this.readBit();
    type = this.readBits(2);
    // switch(type) {
    //   case 0:
    //     // if (this.debug) alert("Stored\n");
    //     break;
    //   case 1:
    //     // if (this.debug) alert("Fixed Huffman codes\n");
    //     break;
    //   case 2:
    //     // if (this.debug) alert("Dynamic Huffman codes\n");
    //     break;
    //   case 3:
    //     // if (this.debug) alert("Reserved block type!!\n");
    //     break;
    //   default:
    //     // if (this.debug) alert("Unexpected value %d!\n", type);
    //     break;
    // }

    if(type==0) {
      var blockLen, cSum;

      // Stored
      this.byteAlign();
      blockLen = this.readByte();
      blockLen |= (this.readByte()<<8);

      cSum = this.readByte();
      cSum |= (this.readByte()<<8);

      if(((blockLen ^ ~cSum) & 0xffff)) {
        document.write("BlockLen checksum mismatch\n"); // FIXME: use throw
      }
      while(blockLen--) {
        c = this.readByte();
        this.addBuffer(c);
      }
    } else if(type==1) {
      var j;

      /* Fixed Huffman tables -- fixed decode routine */
      while(1) {
        /*
          256    0000000        0
          :   :     :
          279    0010111        23
          0   00110000    48
          :    :      :
          143    10111111    191
          280 11000000    192
          :    :      :
          287 11000111    199
          144    110010000    400
          :    :       :
          255    111111111    511

          Note the bit order!
        */
        j = (Jacob.Codec.GZip.bitReverse[this.readBits(7)]>>1);
        if(j > 23) {
          j = (j<<1) | this.readBit();     /* 48..255 */

          if (j > 199) {              /* 200..255 */
            j -= 128;                 /*  72..127 */
            j = (j<<1) | this.readBit();   /* 144..255 << */
          } else {                    /*  48..199 */
            j -= 48;                  /*   0..151 */
            if(j > 143) {
              j = j+136;              /* 280..287 << */
                                      /*   0..143 << */
            }
          }
        } else {                      /*   0..23 */
          j += 256;                   /* 256..279 << */
        }
        if (j < 256) {
          this.addBuffer(j);
        } else if(j == 256) {
          /* EOF */
          break; // FIXME: make this the loop-condition
        } else {
          var len, dist;

          j -= 256 + 1;    /* bytes + EOF */
          len = this.readBits(Jacob.Codec.GZip.cplext[j]) + Jacob.Codec.GZip.cplens[j];

          j = Jacob.Codec.GZip.bitReverse[this.readBits(5)]>>3;
          if(Jacob.Codec.GZip.cpdext[j] > 8) {
            dist = this.readBits(8);
            dist |= (this.readBits(Jacob.Codec.GZip.cpdext[j]-8)<<8);
          } else {
            dist = this.readBits(Jacob.Codec.GZip.cpdext[j]);
          }
          dist += Jacob.Codec.GZip.cpdist[j];

          for(j=0;j<len;j++) {
            var c = this.buf32k[(this.bIdx - dist) & 0x7fff];
            this.addBuffer(c);
          }
        }
      } // while

    } else if (type==2) {
      var j, n, literalCodes, distCodes, lenCodes;
      var ll = new Array(288+32);    // "static" just to preserve stack

      // Dynamic Huffman tables

      literalCodes = 257 + this.readBits(5);
      distCodes = 1 + this.readBits(5);
      lenCodes = 4 + this.readBits(4);
      for(j=0; j<19; j++) {
        ll[j] = 0;
      }

      // Get the decode tree code lengths

      for(j=0; j<lenCodes; j++) {
        ll[Jacob.Codec.GZip.border[j]] = this.readBits(3);
      }
      len = this.distanceTree.length;
      for (i=0; i<len; i++) this.distanceTree[i] = new Jacob.Codec.GZip.HufNode();
      if(this.CreateTree(this.distanceTree, 19, ll, 0)) {
        this.flushBuffer();
        return 1;
      }
      // if (this.debug) {
      //   document.write("<br>distanceTree");
      //   for(var a=0;a<this.distanceTree.length;a++){
      //     document.write("<br>"+this.distanceTree[a].b0+" "+this.distanceTree[a].b1+" "+this.distanceTree[a].jump+" "+this.distanceTree[a].jumppos);
      //   }
      // }

      //read in literal and distance code lengths
      n = literalCodes + distCodes;
      i = 0;
      var z=-1;
      // if (this.debug) document.write("<br>n="+n+" bits: "+this.bits+"<br>");
      while(i < n) {
        z++;
        j = this.DecodeValue(this.distanceTree);
        // if (this.debug) document.write("<br>"+z+" i:"+i+" decode: "+j+"    bits "+this.bits+"<br>");
        if (j<16) {    // length of code in bits (0..15)
          ll[i++] = j;
        } else if(j==16) {    // repeat last length 3 to 6 times
          var l;
          j = 3 + this.readBits(2);
          if(i+j > n) {
            this.flushBuffer();
            return 1;
          }
          l = i ? ll[i-1] : 0;
          while(j--) {
            ll[i++] = l;
          }
        } else {
          if(j==17) {        // 3 to 10 zero length codes
            j = 3 + this.readBits(3);
          } else {        // j == 18: 11 to 138 zero length codes
            j = 11 + this.readBits(7);
          }
          if(i+j > n) {
            this.flushBuffer();
            return 1;
          }
          while(j--) {
            ll[i++] = 0;
          }
        }
      } // while

      // Can overwrite tree decode tree as it is not used anymore
      len = this.literalTree.length;
      for (i=0; i<len; i++)
        this.literalTree[i]=new Jacob.Codec.GZip.HufNode();
      if(this.CreateTree(this.literalTree, literalCodes, ll, 0)) {
        this.flushBuffer();
        return 1;
      }
      len = this.literalTree.length;
      for (i=0; i<len; i++) this.distanceTree[i]=new Jacob.Codec.GZip.HufNode();
      var ll2 = new Array();
      for (i=literalCodes; i <ll.length; i++) ll2[i-literalCodes]=ll[i];
      if (this.CreateTree(this.distanceTree, distCodes, ll2, 0)) {
        this.flushBuffer();
        return 1;
      }
      // if (this.debug) document.write("<br>literalTree");
      while(1) {
        j = this.DecodeValue(this.literalTree);
        if(j >= 256) {        // In C64: if carry set
          var len, dist;
          j -= 256;
          if(j == 0) {
            // EOF
            break;
          }
          j--;
          len = this.readBits(Jacob.Codec.GZip.cplext[j]) + Jacob.Codec.GZip.cplens[j];

          j = this.DecodeValue(this.distanceTree);
          if(Jacob.Codec.GZip.cpdext[j] > 8) {
            dist = this.readBits(8);
            dist |= (this.readBits(Jacob.Codec.GZip.cpdext[j]-8)<<8);
          } else {
            dist = this.readBits(Jacob.Codec.GZip.cpdext[j]);
          }
          dist += Jacob.Codec.GZip.cpdist[j];
          while(len--) {
            var c = this.buf32k[(this.bIdx - dist) & 0x7fff];
            this.addBuffer(c);
          }
        } else {
          this.addBuffer(j);
        }
      } // while
    }
  } while(!last);
  this.flushBuffer();

  this.byteAlign();
  return 0;
};

Jacob.Codec.GZip.prototype.unzipFile = function(name) {
  var i;
  this.gunzip();
  for (i=0;i<this.unzipped.length;i++){
    if(this.unzipped[i][1]==name) {
      return this.unzipped[i][0];
    }
  }
};

Jacob.Codec.GZip.prototype.nextFile = function(){
  // if (this.debug) alert("NEXTFILE");

  this.outputArr = [];
  this.modeZIP   = false;

  var tmp = [];
  tmp[0]  = this.readByte();
  tmp[1]  = this.readByte();
  // if (this.debug) alert("type: "+tmp[0]+" "+tmp[1]);

  if (tmp[0] == 0x78 && tmp[1] == 0xda) { //GZIP
    // if (this.debug) alert("GEONExT-GZIP");
    this.DeflateLoop();
    // if (this.debug) alert(this.outputArr.join(''));
    this.unzipped[this.files] = [this.outputArr.join(''), "geonext.gxt"];
    this.files++;
  }
  if (tmp[0] == 0x1f && tmp[1] == 0x8b) { //GZIP
    // if (this.debug) alert("GZIP");
    this.skipdir();
    // if (this.debug) alert(this.outputArr.join(''));
    this.unzipped[this.files]    = [this.outputArr.join(''), "file"];
    this.files++;
  }
  if (tmp[0] == 0x50 && tmp[1] == 0x4b) { //ZIP
    this.modeZIP = true;
    tmp[2] = this.readByte();
    tmp[3] = this.readByte();
    if (tmp[2] == 0x03 && tmp[3] == 0x04) {
      //MODE_ZIP
      tmp[0] = this.readByte();
      tmp[1] = this.readByte();
      // if (this.debug) alert("ZIP-Version: "+tmp[1]+" "+tmp[0]/10+"."+tmp[0]%10);

      this.gpflags  = this.readByte();
      this.gpflags |= (this.readByte()<<8);
      // if (this.debug) alert("gpflags: "+this.gpflags);

      var method = this.readByte();
      method |= (this.readByte()<<8);
      // if (this.debug) alert("method: "+method);

      this.readByte();
      this.readByte();
      this.readByte();
      this.readByte();

//       var crc = this.readByte();
//       crc |= (this.readByte()<<8);
//       crc |= (this.readByte()<<16);
//       crc |= (this.readByte()<<24);

      var compSize = this.readByte();
      compSize |= (this.readByte()<<8);
      compSize |= (this.readByte()<<16);
      compSize |= (this.readByte()<<24);

      var size = this.readByte();
      size |= (this.readByte()<<8);
      size |= (this.readByte()<<16);
      size |= (this.readByte()<<24);

      // if (this.debug) alert("local CRC: "+crc+"\nlocal Size: "+size+"\nlocal CompSize: "+compSize);

      var filelen = this.readByte();
      filelen |= (this.readByte()<<8);

      var extralen = this.readByte();
      extralen |= (this.readByte()<<8);

      // if (this.debug) alert("filelen "+filelen);
      i = 0;
      this.nameBuf = [];
      while (filelen--){
        var c = this.readByte();
        if (c == "/" | c ==":") {
          i = 0;
        } else if (i < Jacob.Codec.GZip.NAMEMAX-1) {
          this.nameBuf[i++] = String.fromCharCode(c);
        }
      }
      // if (this.debug) alert("nameBuf: "+this.nameBuf);

      if (!this.fileout) this.fileout = this.nameBuf;

      var i = 0;
      while (i < extralen){
        c = this.readByte();
        i++;
      }

      // if (size = 0 && this.fileOut.charAt(this.fileout.length-1)=="/"){
      //   //skipdir
      //   // if (this.debug) alert("skipdir");
      // }
      if (method == 8){
        this.DeflateLoop();
        // if (this.debug) alert(this.outputArr.join(''));
        this.unzipped[this.files] = [this.outputArr.join(''), this.nameBuf.join('')];
        this.files++;
      }
      this.skipdir();
    }
  }
};

Jacob.Codec.GZip.prototype.skipdir = function(){
  var tmp = [];
  var compSize, size, os, i, c;

  if ((this.gpflags & 8)) {
    tmp[0] = this.readByte();
    tmp[1] = this.readByte();
    tmp[2] = this.readByte();
    tmp[3] = this.readByte();

//     if (tmp[0] == 0x50 && tmp[1] == 0x4b && tmp[2] == 0x07 && tmp[3] == 0x08) {
//       crc = this.readByte();
//       crc |= (this.readByte()<<8);
//       crc |= (this.readByte()<<16);
//       crc |= (this.readByte()<<24);
//     } else {
//       crc = tmp[0] | (tmp[1]<<8) | (tmp[2]<<16) | (tmp[3]<<24);
//     }

    compSize  = this.readByte();
    compSize |= (this.readByte()<<8);
    compSize |= (this.readByte()<<16);
    compSize |= (this.readByte()<<24);

    size  = this.readByte();
    size |= (this.readByte()<<8);
    size |= (this.readByte()<<16);
    size |= (this.readByte()<<24);
  }

  if (this.modeZIP) this.nextFile();

  tmp[0] = this.readByte();
  if (tmp[0] != 8) {
    // if (this.debug) alert("Unknown compression method!");
    return 0;
  }

  this.gpflags = this.readByte();
  // if (this.debug && (this.gpflags & ~(0x1f))) alert("Unknown flags set!");

  this.readByte();
  this.readByte();
  this.readByte();
  this.readByte();

  this.readByte();
  os = this.readByte();

  if ((this.gpflags & 4)){
    tmp[0] = this.readByte();
    tmp[2] = this.readByte();
    this.len = tmp[0] + 256*tmp[1];
    // if (this.debug) alert("Extra field size: "+this.len);
    for (i=0;i<this.len;i++)
      this.readByte();
  }

  if ((this.gpflags & 8)){
    i=0;
    this.nameBuf=[];
    while (c=this.readByte()){
      if(c == "7" || c == ":")
        i=0;
      if (i<Jacob.Codec.GZip.NAMEMAX-1)
        this.nameBuf[i++] = c;
    }
    //this.nameBuf[i] = "\0";
    // if (this.debug) alert("original file name: "+this.nameBuf);
  }

  if ((this.gpflags & 16)){
    while (c=this.readByte()){ // FIXME: looks like they read to the end of the stream, should be doable more efficiently
      //FILE COMMENT
    }
  }

  if ((this.gpflags & 2)){
    this.readByte();
    this.readByte();
  }

  this.DeflateLoop();

//   crc = this.readByte();
//   crc |= (this.readByte()<<8);
//   crc |= (this.readByte()<<16);
//   crc |= (this.readByte()<<24);

  size = this.readByte();
  size |= (this.readByte()<<8);
  size |= (this.readByte()<<16);
  size |= (this.readByte()<<24);

  if (this.modeZIP) this.nextFile();
};



/* File jacob/http.js */
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



/* File jacob/i18n.js */
/**
 *    class Jacob.I18n
 *
 *    ## Summary
 *
 *    I18n handles translation of strings and localization of objects, like
 *    dates, numbers, monetary expressions, arrays etc.
 *
 *
 *    ## Synopsis
 *
 *        i18n    = new Jacob.I18n('en');
 *        barrier = new Jacob.Barrier();
 *        i18n.load('locales/en.js', barrier.wait());
 *        i18n.load('locales/en-US.js', barrier.wait());
 *        barrier.release(function() { // we have to wait for the locales to be loaded
 *          // assuming the keys 'sites/index/title' and '/greeting' are defined in your locales files
 *
 *          i18n.translate('/sites/index/title');
 *          // => "Welcome to CompuGlobalHyperMegaNet!"
 *
 *          // create a shortcut
 *          t = i18n.t();
 *          t('/sites/index/title');
 *          // => "Welcome to CompuGlobalHyperMegaNet!"
 *          t('/sites/%{site}/title', {segments: {site: 'value'}});
 *          // => "Welcome to CompuGlobalHyperMegaNet!"
 *          t('/greeting');
 *          // => "Hello %{first_name}!"
 *          t('/greeting', {variables: {first_name: 'Homer'}});
 *          // => "Hello Homer!"
 *          i18n.localize((new Date()), {format: 'date_only'});
 *          // => "Sunday, 23. September 2010"
 *
 *          // create a shortcut
 *          l = i18n.l()
 *          l((new Date()), {format: 'date_only'});
 *          // => "Sunday, 23. September 2010"
 *          l(123456.78);
 *          // => "123.456,78"
 *          l(123456.78, {translator: 'Currency', currency: 'CHF'});
 *          // => "USD 123.456,78"
 *          l([1,2,3]);
 *          // => "1, 2 and 3"
 *          l([1,2,3], {connector: 'or'});
 *          // => "1, 2 or 3"
 *        });
 *
 *
 *    ## Done
 *
 *    * variables in keys
 *    * variables in translations
 *    * translations
 *    * localizations
 *    * fallbacks
 *    * locale cascading (e.g. de-CH -> de -> generic)
 *    * merge loading
 *    * scope
 *    * count (pluralization)
 *
 *
 *    ## ToDo
 *
 *    * i18n.withOptions(options, function() { i18n.translate(...); ... });
 *    * Options:
 *      * locale
 *      * exception
 **/



/**
 *    new Jacob.I18n([locale])
 *    - locale (String): A locale-string, e.g. "de" or "de-CH". As default the
 *      following values are tried in order: the xml:lang attribute of the
 *      <html> tag, the lang attribute of the <html> tag,
 *      Jacob.I18n.defaultLocale, 'generic'.
 *
 *    ## Summary
 *
 *    Creates new Jacob.I18n instance. The given locale is automatically
 *    cascaded.
 *
 *
 *    ## Synopsis
 *
 *        var i18n = new Jacob.I18n();
 **/
Jacob.I18n = function Jacob__I18n(locale) {
  this._translators   = {};
  this._translations  = {};
  this._loadedLocales = {};
  var htmlTag         = document.getElementsByTagName("html")[0]

  locale = locale ||
           htmlTag.getAttribute('xml:lang') ||
           htmlTag.getAttribute('lang') ||
           this.constructor.defaultLocale ||
           'generic';

  this.locale(locale);
  this.scope('/');
  this.loadLocale(Jacob.I18n.builtIn);
};


/** section: translate, related to: Jacob.I18n#translate
 *    Jacob.I18n#t([options]) -> Function
 *    - options (Object): An options hash, which is passed on to
 *      Jacob.I18n#translate after merging it with the
 *
 *    ## Summary
 *
 *    Creates a shortcut function for Jacob.I18n#translate
 *
 *
 *    ## Synopsis
 *
 *        var t    = i18n.t({scope: 'pages/index');
 *        t('title') // Same i18n.translate('pages/index/title');
 *
 *
 *    ## WARNING
 *
 *    The options parameter is currently not implemented and therefore ignored.
 *
 **/
Jacob.I18n.prototype.t = function Jacob__I18n___t() {
  var i18n      = this;
  var translate = this.translate;

  return function() { return translate.apply(i18n, arguments); }
};


/** section: localize, related to: Jacob.I18n#localize
 *    Jacob.I18n#l([options]) -> Function
 *    - options (Object): An options-hash. See Options.
 *
 *    ## Summary
 *
 *    Creates a shortcut function for Jacob.I18n#localize
 *
 *
 *    ## Synopsis
 *
 *        var l = i18n.l({locale: 'en');
 *        l(new Date()) // => Same i18n.localize((new Date()), {locale: 'en'});
 *
 *    ## WARNING
 *
 *    The options parameter is currently not implemented and therefore ignored.
 *
 **/
Jacob.I18n.prototype.l = function Jacob__I18n___l() {
  var i18n     = this;
  var localize = this.localize;
  return function() {
    return localize.apply(i18n, arguments);
  }
};



/**
 *    Jacob.I18n#cascadeLocales([locale=this.locale()]) -> Array
 *    - locale (Object): The locale to calculate the cascade of.
 *
 *    ## Summary
 *
 *    Calculates the locale cascade for a given locale and returns it.
 *    E.g. for 'en-US', the cascade is ['en-US', 'en', 'generic']. Jacob.I18n
 *    tries those locales in that order to resolve a given key.
 *
 *
 *    ## Synopsis
 *
 *        var i18n    = i18n.l({locale: 'en');
 *        l(new Date()) // => Same i18n.localize((new Date()), {locale: 'en'});
 *
 *    ## WARNING
 *
 *    The options parameter is currently not implemented and therefore ignored.
 *
 **/
Jacob.I18n.prototype.cascadeLocales = function Jacob__I18n___cascadeLocales(locale) {
  locale      = locale || this._locale;
  var cascade = [locale]
  var part    = locale.match(/^[^-]+(?=-)/)
  if (part) cascade.push(part[0]);
  if (locale != 'generic') cascade.push('generic');

  return cascade;
};


/**
 *    Jacob.I18n#locale([locale]) -> current locale (String)
 *    - locale (String): The locale to set this I18n instance to.
 *
 *    ## Summary
 *
 *    Gets or sets the locale of this Jacob.I18n instance.
 *    If a locale argument is given, the locale is set to that.
 *    Returns the locale on which this Jacob.I18n is set.
 *
 *
 *    ## Synopsis
 *
 *        i18n.locale();        // => 'en-US'
 *        i18n.locale('en-GB'); // => 'en-GB'
 *        i18n.locale();        // => 'en-GB'
 *
 **/
Jacob.I18n.prototype.locale = function Jacob__I18n___locale(setLocale) {
  if (setLocale !== undefined) {
    this._locale          = setLocale;
    this._cascadedLocales = this.cascadeLocales();
  }
  return this._locale;
};


/**
 *    Jacob.I18n#scope([newScope]) -> current scope (String)
 *    - scope (String): The scope to set this I18n instance to.
 *
 *    ## Summary
 *
 *    Gets or sets the scope (see Scope) of this Jacob.I18n instance.
 *    If a scope argument is given and begins with a '/', then scope is set to
 *    that. If a scope argument is given and does not begin with a '/', then
 *    The scope is built by joining the current scope with the argument.
 *    Returns the scope on which this Jacob.I18n is set.
 *    You should be careful about setting the scope as it influences all
 *    lookups.
 *
 *
 *    ## Synopsis
 *
 *        i18n.scope();        // => '/'
 *        i18n.scope('sites'); // => '/sites'
 *        i18n.scope('index'); // => '/sites/index'
 *        i18n.scope('/');     // => '/sites/index'
 *
 *
 *    ## Scope
 *
 *    The scope is used when resolving relative keys, the absolute key is then
 *    built by joining the scope and the key, e.g. with a scope of '/sites' and
 *    a key 'current/title', the resulting absolute key would be
 *    '/sites/current/title'.
 *    The standard scope of Jacob.I18n is '/'.
 *
 **/
Jacob.I18n.prototype.scope = function Jacob__I18n___scope(setScope) {
  if (setScope !== undefined) {
    if (setScope.substr( 0, 1) != '/') throw("Invalid scope, must be absolute");
    if (setScope.substr(-1, 1) != '/') setScope = setScope + '/';
    this._scope = setScope;
  }
  return this._scope;
};


/**
 *    Jacob.I18n#translations() -> Object
 *
 *    ## Summary
 *
 *    Returns a hash containing all locales and the corresponding flattened
 *    hash of all keys and their translations in that locale.
 *    Flattened means that - no matter how deep the hashes have been when the
 *    locales were loaded - there are no nested hashes in it.
 *
 *
 *    ## Synopsis
 *
 *        i18n.translations(); // => {"generic": {"/some/key": "value"}, "en": {}}
 *
 **/
Jacob.I18n.prototype.translations = function Jacob__I18n___translations() {
  return this._translations;
};


/* INTERNAL
 *    Jacob.I18n#lookup() -> Object
 *
 *    ## Summary
 *
 *    Returns a hash containing all locales and the corresponding flattened
 *    hash of all keys and their translations in that locale.
 *    Flattened means that - no matter how deep the hashes have been when the
 *    locales were loaded - there are no nested hashes in it.
 *
 *
 *    ## Synopsis
 *
 *        i18n.translations(); // => {"generic": {"/some/key": "value"}, "en": {}}
 *
 **/
Jacob.I18n.prototype.lookup = function Jacob__I18n___lookup(container, cascadedLocales, key) {
  for(var i=0; i < cascadedLocales.length; i++) {
    var translations = container[cascadedLocales[i]]
    var translation  = translations ? translations[key] : undefined;
    if (translation) return translation;
  }
};


/**
 *    Jacob.I18n#hasKey([options]) -> false | Object
 *    - options (Object): The same options hash as for Jacob.I18n#translate
 *
 *    ## Summary
 *
 *    If a key exists, it returns an object with the locale and the absolute key
 *    in the form {locale: ..., key: ...}. If the key can't be found, it returns
 *    false. The options hash accepted is the same as for Jacob.I18n#translate.
 *
 *
 *    ## Synopsis
 *
 *        i18n.hasKey('some/%{kind}/key', {segments: {kind: 'existing'}});
 *        // => {key: '/some/existing/key', locale: "en-US"}
 *        i18n.hasKey('some/%{kind}/key', {segments: {kind: 'unknown'}});
 *        // => false
 *
 **/
Jacob.I18n.prototype.hasKey    = function Jacob__I18n___hasKey(key, options) {
  key = this.normalizeKey(key, options);
  var cascadedLocales = this._cascadedLocales;
  for(var i=0; i < cascadedLocales.length; i++) {
    var translations = container[cascadedLocales[i]]
    var translation  = translations ? translations[key] : undefined;
    if (translation) return({locale: cascadedLocales[i], key: key});
  }
  return false;
}


/* INTERNAL
 *    Jacob.I18n#interpolateKey(key[, variables={}[, scope=this.scope()]]) -> key (String)
 *    - key (String): The key to interpolate, possibly containing variables and
 *      being relative.
 *    - variables (Object): A hash with variables to interpolate in the key.
 *      Superfluous variables are silently ignored.
 *    - scope (String): The scope to prefix relative keys with.
 *      See Jacob.I18n#scope.
 *
 *    ## Summary
 *
 *    Returns a completly interpolated key, regardless of whether that key actually
 *    can be found in an actual lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.interpolateKey('%{which}/key', {kind: 'any'}, '/base');
 *        // => "/base/any/key"
 *
 **/
 Jacob.I18n.prototype.interpolateKey = function Jacob__I18n___interpolateKey(key, variables, scope) {
  if (key.substr(0,1) != '/') { // absolute keys ignore scope
    scope = scope || this._scope;
    if (scope.substr( 0, 1) != '/') scope = this.interpolateKey(scope);
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
};


/**
 *    Jacob.I18n#normalizeKey(key, options) -> key (String)
 *    - key (String): The key to normalize, possibly containing variables and
 *      being relative.
 *    - options (Object): The same options hash as Jacob#I18n#translate takes.
 *
 *    ## Summary
 *
 *    Returns a normalized key, applying all options like segments, scope and
 *    count, regardless of whether that key actually can be found in an actual
 *    lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.normalizeKey('%{which}/key', {segments: {kind: 'any'}, count: 2, scope: '/base'});
 *        // => "/base/any/key/more"
 *
 **/
Jacob.I18n.prototype.normalizeKey = function Jacob__I18n___normalizeKey(key, options) {
  if (options.count !== undefined) {
    key = key+'/'+this.localize(options.count, {translator: 'GrammarNumerus'});;
    if (options.variables) {
      options.variables.count = options.count;
    } else {
      options.variables = {count: options.count};
    }
  }
  return this.interpolateKey(key, (options && options.segments), (options && options.scope));
}


/**
 *    Jacob.I18n#translate(key[, options={}]) -> translation (String) | undefined
 *    - key (String): The key to translate
 *    - options (Object): An options hash. See Options.
 *
 *    ## Summary
 *
 *    Translates the given key and applies all given options.
 *
 *
 *    ## Synopsis
 *
 *        i18n.translate('/key'); // "Translation"
 *
 *
 *    ## Options
 *
 *    * segments (Object): A hash of variables that the key is interpolated with
 *    * variables (Object): A hash of variable that the translation is interpolated with
 *    * count (Integer): Used for pluralization, also available as a variable
 *    * scope (String): The scope which a relative key should be prefixed with
 *    * fallback (Object): The value to return in case the key could not be found
 *    * lazyLoader (Function): Invoked after a failed lookup, expected to return
 *      ['retry'], ['use', translation], ['default'] or undefined (which is treated as ['retry'])
 *
 **/
Jacob.I18n.prototype.translate = function Jacob__I18n___translate(key, options) {
  var translation;
  options = options || {};

  key         = this.normalizeKey(key, options);
  translation = this.lookup(this._translations, this._cascadedLocales, key)
  if (!translation && options.lazyLoader) {
    var action = options.lazyLoader.apply(this, [key, options]) || ['retry'];
    if (action[0] == 'retry') {
      translation = this.lookup(this._translations, this._cascadedLocales, key)
    } else if (action[0] == 'use') {
      translation = action[1];
    } else if (action[0] != 'default') {
      throw("Invalid return value from lazy loader: '"+action[0]+"', expected retry, use or default")
    }
  }
  if (!translation) translation = (typeof(options.fallback) == 'function' ? options.fallback() : options.fallback);
  if (translation && options.variables) translation = Jacob.Template.interpolate(translation, undefined, options.variables);

  return translation;
};


/**
 *    Jacob.I18n#localize(object[, options]) -> translation (Object) | undefined
 *    - object (Object): The value to localize, e.g. a Date or Number.
 *    - options (Object): A hash with options that indicate how to localize the object.
 *
 *    ## Summary
 *
 *    Localizes arbitrary objects.
 *
 *
 *    ## Synopsis
 *
 *        i18n.localize(new Date()); // => "Saturday, 23. September"
 *
 **/
Jacob.I18n.prototype.localize = function Jacob__I18n___localize(value, options) {
  options        = options || {};
  var name       = options.translator || value.constructor.name
  var translator = this.lookup(this._translators, this._cascadedLocales, name);

  return translator.localize.apply(this, [value, options]);
};


/* INTERNAL
 *    Jacob.I18n#load(localeURI[, ignoreCache=false][, onLoadCallback]) -> undefined
 *    - localeURI (String): The URI of the locale to load.
 *    - onLoadCallback (Function): A callback that is invoked after loading the locale.
 *
 *    ## Summary
 *
 *    Loads a locale file and adds its contents to this Jacob.I18n instance.
 *    You may want to take a look at Jacob.Barrier as a help when you want to
 *    load multiple locale files.
 *
 *
 *    ## Synopsis
 *
 *        i18n.load("/locales/en-GB.js", function() {
 *          i18n.translate("/some/key");
 *        });
 *
 **/
Jacob.I18n.prototype.load = function Jacob__I18n___load(uri, ignoreCache, callback) {
  var i18n   = this; // for the closures
  if (typeof(ignoreCache) == 'function') {
    callback    = ignoreCache;
    ignoreCache = undefined;
  }

  if (!ignoreCache && i18n._loadedLocales[uri]) {
    if (callback) callback();
  } else {
    Jacob.HTTP.get(uri, {
      success: function(data) {
        i18n._loadedLocales[uri] = true;
        if (data) {
          i18n.loadLocale(Jacob.JSON.parse(data));
          if (callback) callback();
        }
      },
      error: function() {
        throw("Failed to load '"+uri+"'");
      }
    });
  }
};


/**
 *    Jacob.I18n#loadLocale(data) -> undefined
 *    - data (Object): A locale datastructure.
 *
 *    ## Summary
 *
 *    Adds the data in the data argument to this Jacob.I18n instance.
 *
 *
 *    ## Synopsis
 *
 *        i18n.loadLocale({locale: "en-GB", translations: {"/key": "value"}});
 *
 *
 *    ## Datastructure
 *
 *    The structure of the file should look like this:
 *        {
 *          "locale": "en-GB", // the locale of this data
 *          "translators": { // custom translators for #localize
 *            "Constructorname": {
 *              "localize": function(value, options)
 *            }
 *          }
 *          "translations": {  // translations for #translate
 *            "arbitrarily": {
 *              "deep": {
 *                "nesting": "Can be done"
 *              }
 *            }
 *          }
 *        }
 *    Notice that the nesting of the hash under "translations" can be arbitrarily
 *    deep. The example is equivalent to {"/arbitrarily/deep/nesting": "Can be done"}.
 *    Localization functions are executed in the context of this Jacob.I18n instance.
 *
 **/
Jacob.I18n.prototype.loadLocale = function Jacob__I18n___loadLocale(data) {
  this.addTranslators(data.locale, data.translators);
  this.addTranslations(data.locale, data.translations);
};


/**
 *    Jacob.I18n#addTranslators(locale, translators) -> true
 *    - locale (String): The locale to add the translators to.
 *    - translators (Object): The translators.
 *
 *    ## Summary
 *
 *    Adds translators to the given locale of this instance of Jacob.I18n.
 *    For the structure of the translators argument, see Jacob.I18n#loadLocale.
 *
 *
 *    ## Synopsis
 *
 *        i18n.addTranslators('en-GB', {Currency: {localize: enGBCurrencyLocalizer}});
 *
 **/
Jacob.I18n.prototype.addTranslators = function Jacob__I18n___addTranslators(locale, translators) {
  if (!this._translators[locale]) {
    this._translators[locale] = translators;
  } else {
    var storedTranslators = this._translators[locale];
    for(var key in translators) storedTranslators[key] = translators[key];
  }
  return true;
};


/**
 *    Jacob.I18n#addTranslations(locale, translations) -> true
 *    - locale (String): The locale to add the translations to.
 *    - translators (Object): The translations.
 *
 *    ## Summary
 *
 *    Adds translations to the given locale of this instance of Jacob.I18n.
 *    For the structure of the translators argument, see Jacob.I18n#loadLocale.
 *
 *
 *    ## Synopsis
 *
 *        i18n.addTranslations('en-GB', {"localizers.Currency.format": "%{amount} %{currency}"});
 *
 **/
Jacob.I18n.prototype.addTranslations = function Jacob__I18n___addTranslations(locale, translations) {
  var flattened = this.flattenLocales(translations);
  if (!this._translations[locale]) {
    this._translations[locale] = flattened;
  } else {
    var storedTranslations = this._translations[locale];
    for(var key in flattened) storedTranslations[key] = flattened[key];
  }
  return true;
};


/**
 *    Jacob.I18n#prepareNodeForAutomaticTranslation([node=document.body]) -> undefined
 *    - node (DOMElement): The root node to start translating from.
 *
 *    ## Summary
 *
 *    Gets all textnodes and adds them as key and value for the defaultLocale.
 *
 *
 *    ## Synopsis
 *
 *        i18n.prepareNodeForAutomaticTranslation();
 *
 *
 *    ## Warning
 *
 *    This function is experimental.
 *
 **/
Jacob.I18n.prototype.inferTranslationsFromNode = function Jacob__I18n___prepareNodeForAutomaticTranslation(node) {
  node = node || document.body;
  var locale       = Jacob.I18n.defaultLocale;
  var found        = [];
  var translations = {};
  var textnodesFinder = function(node, found) {
    if (node.nodeType == 3 && !node.data.match(/^[ \t\n\r\f\v\s]*$/)) found.push(node);
    for(var i=0; i<node.childNodes.length; i++) textnodesFinder(node.childNodes[i], found);
  }
  textnodesFinder(node, found);
  for(var i=0; i<found.length; i++) {
    var node   = found[i];
    var parent = node.parentNode;
    var text   = parent.innerText.replace(/^[\s\r\n]*|[\s\r\n]*$/g, ''); // strip
    translations[text] = text;
    parent.setAttribute("data-i18nKey", text);
  }
  this.addTranslations(locale, translations);
};


/**
 *    Jacob.I18n#translateNode([node=document.body][, loadLocaleCallback]) -> undefined
 *    - node (DOMElement): The root node to start translating from.
 *    - loadLocaleCallback (Function): A callback that is invoked if a translation can't be found.
 *
 *    ## Summary
 *
 *    Translates a DOM node and all its descendants. It starts with the current
 *    locale but respects any given 'lang' attribute on any of the nodes.
 *
 *
 *    ## Synopsis
 *
 *        i18n.translateNode();
 *
 *
 *    ## Warning
 *
 *    This function is experimental.
 *
 **/
Jacob.I18n.prototype.translateNode = function Jacob__I18n___translateNode(node, loadLocaleCallback) {
  if (typeof(node) == 'function') {
    loadLocaleCallback = node;
    node               = undefined;
  }
  node = node || document.body;

  var found           = [];
  var textnodesFinder = function(node, found) {
    if (node.nodeType == 3 && !node.data.match(/^[ \t\n\r\f\v\s]*$/)) found.push(node);
    for(var i=0; i<node.childNodes.length; i++) textnodesFinder(node.childNodes[i], found);
  }
  textnodesFinder(node, found);
  for(var i=0; i<found.length; i++) {
    var node         = found[i];
    var parent       = node.parentNode;
    var i18nKey      = parent.getAttribute('data-i18nKey');
    var translation  = this.translate(i18nKey, {lazyLoader: loadLocaleCallback, fallback: i18nKey});
    parent.innerText = translation;
  }
};


/* INTERNAL
 *    Jacob.I18n#flattenLocales(hash) -> flatLocales (Object)
 *    - hash (Object): The deeply nested translations hash to flatten.
 *
 *    ## Summary
 *
 *    Flattens the arbitrarily deep translations hash into a flat key-value hash.
 *
 *
 *    ## Synopsis
 *
 *        i18n.flattenLocales({"deeply": {"nested": "locales"}});
 *        // => {"/deeply/nested": "locales"}
 *
 **/
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
};


/* INTERNAL
 *    Jacob.I18n#interpolateKey(key[, variables={}[, scope=this.scope()]]) -> key (String)
 *    - key (String): The key to interpolate, possibly containing variables and
 *      being relative.
 *    - variables (Object): A hash with variables to interpolate in the key.
 *      Superfluous variables are silently ignored.
 *    - scope (String): The scope to prefix relative keys with.
 *      See Jacob.I18n#scope.
 *
 *    ## Summary
 *
 *    Returns a completly interpolated key, regardless of whether that key actually
 *    can be found in an actual lookup.
 *
 *
 *    ## Synopsis
 *
 *        i18n.interpolate('%{which}/key', {kind: 'any'}, '/base');
 *        // => "/base/any/key"
 *
 **/
Jacob.I18n.defaultLocale = null;


/**
 *    Jacob.I18n.builtIn = localeData
 *
 *    ## Summary
 *
 *    The preloaded locale data for the 'generic' locale which is always looked
 *    up last. It defines a couple of standard localizers.
 *
 **/
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
};



/* File jacob/i18n/datetime.js */
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



/* File jacob/json.js */
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



/* File jacob/log.js */
Jacob.Log = function Jacob__Log(options) {
  this._entries = [];
}
Jacob.Log.Entry = function Jacob__Log__Entry(message, options) {
  options        = options || {}
  this.time      = Date.now();
  this.message   = message;
  this.backtrace = Jacob.Util.backtrace(options.ignoreBacktraceLevels || 1);
}
Jacob.Log.Entry.prototype.toString = function Jacob__Log__Entry___toString() {
  var timeString = "["+Jacob.Util.dateToISO8601(new Date(this.time))+"]";

  return timeString+" "+this.message;
}
Jacob.Log.prototype.log = function Jacob__Log___log(message) {
  var entry = new Jacob.Log.Entry(message, {ignoreBacktraceLevels: 2});
  this._entries.push(entry);
}
Jacob.Log.prototype.toString = function Jacob__Log___toString() {
  this._entries.join("\n");
}



/* File jacob/template.js */
/** 
 *  class Jacob.Template
 *
 *
 *  ## Summary
 *
 *  Jacob.Template replaces sequences in strings by identifier or position.
 *
 *
 *  ## Synopsis
 *
 *      template = new Jacob.Template('Hello %{entity}!');
 *      template.identifiers()                     // => ['entity']
 *      template.interpolate({'entity': 'World'}); // => 'Hello World!'
 *      Jacob.Template.interpolate('Hello %{entity}!');
 **/


/**
 *    new Jacob.Template(templateString, options)
 *
 *    - templateString (String): A string to interpolate. Variables use the
 *      sequence %{variablename}. Example: "Hello %{firstName}". In this string,
 *      firstName is a variable that can be interpolated.
 *    - options (Object): A hash with options. Valid options are:
 *      * missingKey: A function that is invoked upon a missing key.
 *      * superfluousKey: A function that is invoked upon a superfluous key.
 *
 **/
Jacob.Template = function Jacob__Template(templateString, options) {
  if (typeof(templateString) !== 'string') throw("ArgumentError, Invalid template ("+typeof(templateString)+")");

  this._templateString = templateString;
  this._options        = options || {}
  if (this._options.missingKey === undefined)      this._options.missingKey      = Jacob.Template.MissingKeyHandler;
  if (this._options.superfluousKeys === undefined) this._options.superfluousKeys = Jacob.Template.SuperfluousKeysHandler;
}


/**
 *    Jacob.Template#options() -> options (Object)
 *
 *    ## Summary
 *
 *    Returns the options this Jacob.Template was created with.
 **/
Jacob.Template.prototype.options = function Jacob__Template___options() {
  return this._options;
}


/**
 *    Jacob.Template#templateString() -> templateString (String)
 *
 *    ## Summary
 *
 *    Returns the templateString this Jacob.Template was created with.
 **/
Jacob.Template.prototype.templateString = function Jacob__Template___templateString() {
  return this._templateString;
}


/**
 *    class Jacob.Template.KeyError
 *
 *    ## Summary
 *
 *    Useful for custom missing and superfluous key handlers.
 *    It automatically calculates missing keys, superfluous keys, expected keys
 *    and given keys.
 *
 **/

/**
 *    Jacob.Template.KeyError#template -> template (Jacob.Template)
 **/

/**
 *    Jacob.Template.KeyError#expectedKeys -> expectedKeys (Array)
 **/

/**
 *    Jacob.Template.KeyError#givenKeys -> givenKeys (Array)
 **/

/**
 *    Jacob.Template.KeyError#missingKeys -> missingKeys (Array)
 **/

/**
 *    Jacob.Template.KeyError#superfluousKeys -> superfluousKeys (Array)
 **/

/**
 *    new Jacob.Template.KeyError(template, variables[, message])
 **/
Jacob.Template.KeyError = function Jacob__Template__KeyError(template, variables, message) {
  this.template        = template;
  this.expectedKeys    = template.identifiers();
  this.givenKeys       = Jacob.Util.ownPropertyNames(variables);
  this.missingKeys     = Jacob.Util.arraySubtract(this.expectedKeys, this.givenKeys);
  this.superfluousKeys = Jacob.Util.arraySubtract(this.givenKeys, this.expectedKeys);

  if (message) {
    this.message = message;
  } else {
    if (this.missingKeys.length > 0) {
      var given   = this.givenKeys.length == 0 ? 'none' : "'"+this.givenKeys.join("', '")+"'";
      var missing = "'"+this.missingKeys.join("', '")+"'";
      this.message = "Missing keys "+missing+". Given: "+given;
    } else if (this.superfluousKeys.length > 0) {
      var expected    = this.expectedKeys.length == 0 ? 'none' : "'"+this.expectedKeys.join("', '")+"'";
      var superfluous = "'"+this.superfluousKeys.join("', '")+"'";
      this.message = "Superfluous keys "+superfluous+". Expected: "+expected;
    } else {
      this.message = "An error occurred while interpolating '"+template.templateString()+"'";
    }
  }
}
Jacob.Template.KeyError.prototype.toString = function Jacob__Template__KeyError___toString() {
  return this.message;
}


/**
 *    Jacob.Template.MissingKeyHandler = (Function)
 *
 *    ## Summary
 *
 *    MissingKeyHandler is the default callback for missing keys.
 *    It throws an error.
 *
 **/
Jacob.Template.MissingKeyHandler = function Jacob__Template__MissingKeyHandler(template, variables) {
  throw(new Jacob.Template.KeyError(template, variables));
}


/**
 *    Jacob.Template.SuperfluousKeysHandler = (Function)
 *
 *    ## Summary
 *
 *    SuperfluousKeysHandler is a callback for superfluous keys. The default is
 *    none, though.
 *    SuperfluousKeysHandler throws an error.
 *
 **/
Jacob.Template.SuperfluousKeysHandler = function Jacob__Template__MissingKeyHandler(template, variables) {
  throw(new Jacob.Template.KeyError(template, variables));
}


/** 
 *  Jacob.Template.interpolate(templateString[, options], variables) -> String
 *  - templateString (String): The template string to interpolate the variables into.
 *  - options (Object):        Same options as the Jacob.Template constructor accepts.
 *  - variables (Object):      The variables to interpolate into the template.
 *
 *  ## Summary
 *
 *  This function is a shortcut for:
 *      (new Jacob.Template(templateString, option)).interpolate(variables);
 *  In consequence it can throw all the same errors as Jacob.Template#interpolate.
 *
 *
 *  ## Synopsis
 *
 *      Jacob.Template.interpolate("%{predicate} %{subject}", {}, {predicate: "Hello", subject: "World"});
 *      // => "Hello World"
 **/
Jacob.Template.interpolate = function Jacob__Template__interpolate(templateString, options, variables) {
  if (arguments.length == 2) {
    variables = options;
    options   = {};
  }
  var template = new this(templateString, options);

  return template.interpolate(variables);
};


/** 
 *  Jacob.Template#identifiers() -> identifiers (Array)
 *
 *  ## Summary
 *
 *  Returns all identifiers which can be replaced by variables.
 *
 *
 *  ## Synopsis
 *
 *      var template = new Jacob.Template("%{predicate} %{subject}");
 *      template.identifiers() // => ["predicate", "subject"]
 **/
Jacob.Template.prototype.identifiers = function Jacob_Template___identifiers() {
  var identifiers = this._templateString.match(/%\{\w+\}/g);
  var i           = identifiers.length;
  while(i--) identifiers[i] = identifiers[i].substr(2,identifiers[i].length-3);

  return identifiers;
}




/** 
 *  Jacob.Template#interpolate(variables) -> interpolated (String)
 *
 *  ## Summary
 *
 *  Returns the template string with all identifiers replaced by the
 *  values of the given variables.
 *
 *  Depending on the options, this function can throw errors on missing- and
 *  superfluous keys. The default is to ignore superfluous keys but throw a
 *  Jacob.Template.KeyError on missing keys.
 *
 *  Also see: Jacob.Template.MissingKeyHandler and Jacob.Template.SuperfluousKeyHandler
 *
 *
 *  ## Synopsis
 *
 *      var template = new Jacob.Template("%{predicate} %{subject}");
 *      template.interpolate({predicate: "Hello", subject: "World"});
 *      // => "Hello World"
 **/
Jacob.Template.prototype.interpolate = function Jacob_Template___interpolate(variables, options) {
  var self            = this; // for the various closures
  options             = options   || {};
  variables           = variables || {};

  for(var key in this._options) if (!options.hasOwnProperty(key)) options[key] = this._options[key];

  // store all keys to detect superfluous keys later
  var superfluousKeys = {};
  for(var key in variables) superfluousKeys[key] = true;

  var replaced = this._templateString.replace(/%\{\w+\}/g, function(match) {
    var identifier = match.substr(2,match.length-3);

    if (variables[identifier] !== undefined) {
      delete superfluousKeys[identifier];
      return variables[identifier];
    } else if (options.missingKey) {
      return options.missingKey(self, variables);
    }
  });
  if (options.superfluousKeys && !Jacob.Util.isEmpty(superfluousKeys)) {
    options.superfluousKeys(this, variables);
  }

  return replaced;
}



/* File jacob/util.js */
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
})();
