/*--
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.
--*/



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
