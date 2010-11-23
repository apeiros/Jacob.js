
if(!window.Jacob)window.Jacob={};Jacob=window.Jacob;(function(){Jacob.Barrier=function Jacob__Barrier(){this.length=0;this._waiterID=0;this._waiters={};this._releasers=[];};Jacob.Barrier.prototype.wait=function Jacob__Barrier___wait(id){var barrier=this;var id=this.block(id);var waiter=function(){barrier.clear(id)};return waiter;};Jacob.Barrier.prototype.block=function Jacob__Barrier___block(id){var id=id||this.nextID();if(!this._waiters[id]){this.length++;this._waiters[id]=true;}
return id;};Jacob.Barrier.prototype.nextID=function Jacob__Barrier___nextID(){var id=this._waiterID;this._waiterID++;return id;};Jacob.Barrier.prototype.clear=function Jacob__Barrier___clear(id){if(this._waiters[id]){this.length--;delete this._waiters[id];if(!this.length)this.triggerRelease();}
return this;};Jacob.Barrier.prototype.triggerRelease=function Jacob__Barrier___triggerRelease(){for(var i=0;i<this._releasers.length;i++)this._releasers[i]();return this;};Jacob.Barrier.prototype.release=function Jacob__Barrier___release(releaser){this._releasers.push(releaser);return this;};Jacob.Codec={name:'Jacob__Codec'};Jacob.Codec.GZipDecode=Jacob.GZip.gunzip;Jacob.Codec.base64Encode=Jacob.Base64.encode;Jacob.Codec.base64Decode=Jacob.Base64.decode;Jacob.Codec.Base64={}
Jacob.Codec.Base64._keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",Jacob.Codec.Base64.encode=function Jacob__Codec__Base64__encode(input){var output=[];var i=0;var chr1,chr2,chr3,enc1,enc2,enc3,enc4;input=Jacob.Codec.Base64._utf8_encode(input);while(i<input.length){chr1=input.charCodeAt(i++);chr2=input.charCodeAt(i++);chr3=input.charCodeAt(i++);enc1=chr1>>2;enc2=((chr1&3)<<4)|(chr2>>4);enc3=((chr2&15)<<2)|(chr3>>6);enc4=chr3&63;if(isNaN(chr2)){enc3=enc4=64;}else if(isNaN(chr3)){enc4=64;}
output.push([this._keyStr.charAt(enc1),this._keyStr.charAt(enc2),this._keyStr.charAt(enc3),this._keyStr.charAt(enc4)].join(''));}
return output.join('');};Jacob.Codec.Base64.decode=function Jacob__Codec__Base64__decode(input,utf8){var output=[],chr1,chr2,chr3,enc1,enc2,enc3,enc4,i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(i<input.length){enc1=this._keyStr.indexOf(input.charAt(i++));enc2=this._keyStr.indexOf(input.charAt(i++));enc3=this._keyStr.indexOf(input.charAt(i++));enc4=this._keyStr.indexOf(input.charAt(i++));chr1=(enc1<<2)|(enc2>>4);chr2=((enc2&15)<<4)|(enc3>>2);chr3=((enc3&3)<<6)|enc4;output.push(String.fromCharCode(chr1));if(enc3!=64){output.push(String.fromCharCode(chr2));}
if(enc4!=64){output.push(String.fromCharCode(chr3));}}
output=output.join('');if(utf8){output=Jacob.Codec.Base64._utf8_decode(output);}
return output;};Jacob.Codec.Base64.decodeAsArray=function Jacob__Codec__Base64___decodeAsArray(input){var dec=this.decode(input),ar=[],i;for(i=0;i<dec.length;i++){ar[i]=dec.charCodeAt(i);}
return ar;};Jacob.Codec.Base64._utf8_encode=function Jacob__Codec__Base64___utf8_encode(string){string=string.replace(/\r\n/g,"\n");var utftext="";for(var n=0;n<string.length;n++){var c=string.charCodeAt(n);if(c<128){utftext+=String.fromCharCode(c);}
else if((c>127)&&(c<2048)){utftext+=String.fromCharCode((c>>6)|192);utftext+=String.fromCharCode((c&63)|128);}
else{utftext+=String.fromCharCode((c>>12)|224);utftext+=String.fromCharCode(((c>>6)&63)|128);utftext+=String.fromCharCode((c&63)|128);}}
return utftext;};Jacob.Codec.Base64._utf8_decode=function Jacob__Codec__Base64___utf8_decode(utftext){var string=[],i=0,c=0,c2=0,c3=0;while(i<utftext.length){c=utftext.charCodeAt(i);if(c<128){string.push(String.fromCharCode(c));i++;}
else if((c>191)&&(c<224)){c2=utftext.charCodeAt(i+1);string.push(String.fromCharCode(((c&31)<<6)|(c2&63)));i+=2;}
else{c2=utftext.charCodeAt(i+1);c3=utftext.charCodeAt(i+2);string.push(String.fromCharCode(((c&15)<<12)|((c2&63)<<6)|(c3&63)));i+=3;}}
return string.join('');};Jacob.Codec.Base64._destrip=function Jacob__Codec__Base64___destrip(stripped,wrap){var lines=[],lineno,i,destripped=[];if(wrap==null)wrap=76;stripped.replace(/ /g,"");lineno=stripped.length/wrap;for(i=0;i<lineno;i++)lines[i]=stripped.substr(i*wrap,wrap);if(lineno!=stripped.length/wrap)
lines[lines.length]=stripped.substr(lineno*wrap,stripped.length-(lineno*wrap));for(i=0;i<lines.length;i++)destripped.push(lines[i]);return destripped.join('\n');};Jacob.GZip=function Jacob__GZip(data){this.data=data;this.debug=false;this.gpflags=undefined;this.files=0;this.unzipped=[];this.buf32k=new Array(32768);this.bIdx=0;this.modeZIP=false;this.bytepos=0;this.bb=1;this.bits=0;this.nameBuf=[];this.fileout=undefined;this.literalTree=new Array(Jacob.GZip.LITERALS);this.distanceTree=new Array(32);this.treepos=0;this.Places=null;this.len=0;this.fpos=new Array(17);this.fpos[0]=0;this.flens=undefined;this.fmax=undefined;}
Jacob.GZip.gunzip=function(string){if(string.constructor===Array){}else if(string.constructor===String){}
var gzip=new Jacob.GZip(string);return gzip.gunzip();}
Jacob.GZip.HufNode=function(){this.b0=0;this.b1=0;this.jump=null;this.jumppos=-1;};Jacob.GZip.LITERALS=288;Jacob.GZip.NAMEMAX=256;Jacob.GZip.bitReverse=[0x00,0x80,0x40,0xc0,0x20,0xa0,0x60,0xe0,0x10,0x90,0x50,0xd0,0x30,0xb0,0x70,0xf0,0x08,0x88,0x48,0xc8,0x28,0xa8,0x68,0xe8,0x18,0x98,0x58,0xd8,0x38,0xb8,0x78,0xf8,0x04,0x84,0x44,0xc4,0x24,0xa4,0x64,0xe4,0x14,0x94,0x54,0xd4,0x34,0xb4,0x74,0xf4,0x0c,0x8c,0x4c,0xcc,0x2c,0xac,0x6c,0xec,0x1c,0x9c,0x5c,0xdc,0x3c,0xbc,0x7c,0xfc,0x02,0x82,0x42,0xc2,0x22,0xa2,0x62,0xe2,0x12,0x92,0x52,0xd2,0x32,0xb2,0x72,0xf2,0x0a,0x8a,0x4a,0xca,0x2a,0xaa,0x6a,0xea,0x1a,0x9a,0x5a,0xda,0x3a,0xba,0x7a,0xfa,0x06,0x86,0x46,0xc6,0x26,0xa6,0x66,0xe6,0x16,0x96,0x56,0xd6,0x36,0xb6,0x76,0xf6,0x0e,0x8e,0x4e,0xce,0x2e,0xae,0x6e,0xee,0x1e,0x9e,0x5e,0xde,0x3e,0xbe,0x7e,0xfe,0x01,0x81,0x41,0xc1,0x21,0xa1,0x61,0xe1,0x11,0x91,0x51,0xd1,0x31,0xb1,0x71,0xf1,0x09,0x89,0x49,0xc9,0x29,0xa9,0x69,0xe9,0x19,0x99,0x59,0xd9,0x39,0xb9,0x79,0xf9,0x05,0x85,0x45,0xc5,0x25,0xa5,0x65,0xe5,0x15,0x95,0x55,0xd5,0x35,0xb5,0x75,0xf5,0x0d,0x8d,0x4d,0xcd,0x2d,0xad,0x6d,0xed,0x1d,0x9d,0x5d,0xdd,0x3d,0xbd,0x7d,0xfd,0x03,0x83,0x43,0xc3,0x23,0xa3,0x63,0xe3,0x13,0x93,0x53,0xd3,0x33,0xb3,0x73,0xf3,0x0b,0x8b,0x4b,0xcb,0x2b,0xab,0x6b,0xeb,0x1b,0x9b,0x5b,0xdb,0x3b,0xbb,0x7b,0xfb,0x07,0x87,0x47,0xc7,0x27,0xa7,0x67,0xe7,0x17,0x97,0x57,0xd7,0x37,0xb7,0x77,0xf7,0x0f,0x8f,0x4f,0xcf,0x2f,0xaf,0x6f,0xef,0x1f,0x9f,0x5f,0xdf,0x3f,0xbf,0x7f,0xff];Jacob.GZip.cplens=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0];Jacob.GZip.cplext=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,99,99];Jacob.GZip.cpdist=[0x0001,0x0002,0x0003,0x0004,0x0005,0x0007,0x0009,0x000d,0x0011,0x0019,0x0021,0x0031,0x0041,0x0061,0x0081,0x00c1,0x0101,0x0181,0x0201,0x0301,0x0401,0x0601,0x0801,0x0c01,0x1001,0x1801,0x2001,0x3001,0x4001,0x6001];Jacob.GZip.cpdext=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];Jacob.GZip.border=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];Jacob.GZip.prototype.gunzip=function(){this.outputArr=[];this.nextFile();return this.unzipped;}
Jacob.GZip.prototype.readByte=function(){this.bits+=8;if(this.bytepos<this.data.length){return this.data.charCodeAt(this.bytepos++);}else{return-1;}};Jacob.GZip.prototype.byteAlign=function(){this.bb=1;};Jacob.GZip.prototype.readBit=function(){var carry;this.bits++;carry=(this.bb&1);this.bb>>=1;if(this.bb==0){this.bb=this.readByte();carry=(this.bb&1);this.bb=(this.bb>>1)|0x80;}
return carry;};Jacob.GZip.prototype.readBits=function(a){var res=0,i=a;while(i--)res=(res<<1)|this.readBit();if(a)res=Jacob.GZip.bitReverse[res]>>(8-a);return res;};Jacob.GZip.prototype.flushBuffer=function(){this.bIdx=0;};Jacob.GZip.prototype.addBuffer=function(a){this.buf32k[this.bIdx++]=a;this.outputArr.push(String.fromCharCode(a));if(this.bIdx==0x8000)this.bIdx=0;};Jacob.GZip.prototype.IsPat=function(){while(1){if(this.fpos[this.len]>=this.fmax)return-1;if(this.flens[this.fpos[this.len]]==this.len)return this.fpos[this.len]++;this.fpos[this.len]++;}};Jacob.GZip.prototype.Rec=function(){var curplace=this.Places[this.treepos];var tmp;if(this.len==17){return-1;}
this.treepos++;this.len++;tmp=this.IsPat();if(tmp>=0){curplace.b0=tmp;}else{curplace.b0=0x8000;if(this.Rec())return-1;}
tmp=this.IsPat();if(tmp>=0){curplace.b1=tmp;curplace.jump=null;}else{curplace.b1=0x8000;curplace.jump=this.Places[this.treepos];curplace.jumppos=this.treepos;if(this.Rec())return-1;}
this.len--;return 0;}
Jacob.GZip.prototype.CreateTree=function(currentTree,numval,lengths,show){var i;this.Places=currentTree;this.treepos=0;this.flens=lengths;this.fmax=numval;for(i=0;i<17;i++)this.fpos[i]=0;this.len=0;if(this.Rec()){return-1;}
return 0;};Jacob.GZip.prototype.DecodeValue=function(currentTree){var len,i,xtreepos=0,X=currentTree[xtreepos],b;while(1){b=this.readBit();if(b){if(!(X.b1&0x8000)){return X.b1;}
X=X.jump;len=currentTree.length;for(i=0;i<len;i++){if(currentTree[i]===X){xtreepos=i;break;}}}else{if(!(X.b0&0x8000)){return X.b0;}
xtreepos++;X=currentTree[xtreepos];}}
return-1;};Jacob.GZip.prototype.DeflateLoop=function(){var last,c,type,i,len;do{last=this.readBit();type=this.readBits(2);if(type==0){var blockLen,cSum;this.byteAlign();blockLen=this.readByte();blockLen|=(this.readByte()<<8);cSum=this.readByte();cSum|=(this.readByte()<<8);if(((blockLen^~cSum)&0xffff)){document.write("BlockLen checksum mismatch\n");}
while(blockLen--){c=this.readByte();this.addBuffer(c);}}else if(type==1){var j;while(1){j=(Jacob.GZip.bitReverse[this.readBits(7)]>>1);if(j>23){j=(j<<1)|this.readBit();if(j>199){j-=128;j=(j<<1)|this.readBit();}else{j-=48;if(j>143){j=j+136;}}}else{j+=256;}
if(j<256){this.addBuffer(j);}else if(j==256){break;}else{var len,dist;j-=256+1;len=this.readBits(Jacob.GZip.cplext[j])+Jacob.GZip.cplens[j];j=Jacob.GZip.bitReverse[this.readBits(5)]>>3;if(Jacob.GZip.cpdext[j]>8){dist=this.readBits(8);dist|=(this.readBits(Jacob.GZip.cpdext[j]-8)<<8);}else{dist=this.readBits(Jacob.GZip.cpdext[j]);}
dist+=Jacob.GZip.cpdist[j];for(j=0;j<len;j++){var c=this.buf32k[(this.bIdx-dist)&0x7fff];this.addBuffer(c);}}}}else if(type==2){var j,n,literalCodes,distCodes,lenCodes;var ll=new Array(288+32);literalCodes=257+this.readBits(5);distCodes=1+this.readBits(5);lenCodes=4+this.readBits(4);for(j=0;j<19;j++){ll[j]=0;}
for(j=0;j<lenCodes;j++){ll[Jacob.GZip.border[j]]=this.readBits(3);}
len=this.distanceTree.length;for(i=0;i<len;i++)this.distanceTree[i]=new Jacob.GZip.HufNode();if(this.CreateTree(this.distanceTree,19,ll,0)){this.flushBuffer();return 1;}
n=literalCodes+distCodes;i=0;var z=-1;while(i<n){z++;j=this.DecodeValue(this.distanceTree);if(j<16){ll[i++]=j;}else if(j==16){var l;j=3+this.readBits(2);if(i+j>n){this.flushBuffer();return 1;}
l=i?ll[i-1]:0;while(j--){ll[i++]=l;}}else{if(j==17){j=3+this.readBits(3);}else{j=11+this.readBits(7);}
if(i+j>n){this.flushBuffer();return 1;}
while(j--){ll[i++]=0;}}}
len=this.literalTree.length;for(i=0;i<len;i++)
this.literalTree[i]=new Jacob.GZip.HufNode();if(this.CreateTree(this.literalTree,literalCodes,ll,0)){this.flushBuffer();return 1;}
len=this.literalTree.length;for(i=0;i<len;i++)this.distanceTree[i]=new Jacob.GZip.HufNode();var ll2=new Array();for(i=literalCodes;i<ll.length;i++)ll2[i-literalCodes]=ll[i];if(this.CreateTree(this.distanceTree,distCodes,ll2,0)){this.flushBuffer();return 1;}
while(1){j=this.DecodeValue(this.literalTree);if(j>=256){var len,dist;j-=256;if(j==0){break;}
j--;len=this.readBits(Jacob.GZip.cplext[j])+Jacob.GZip.cplens[j];j=this.DecodeValue(this.distanceTree);if(Jacob.GZip.cpdext[j]>8){dist=this.readBits(8);dist|=(this.readBits(Jacob.GZip.cpdext[j]-8)<<8);}else{dist=this.readBits(Jacob.GZip.cpdext[j]);}
dist+=Jacob.GZip.cpdist[j];while(len--){var c=this.buf32k[(this.bIdx-dist)&0x7fff];this.addBuffer(c);}}else{this.addBuffer(j);}}}}while(!last);this.flushBuffer();this.byteAlign();return 0;};Jacob.GZip.prototype.unzipFile=function(name){var i;this.gunzip();for(i=0;i<this.unzipped.length;i++){if(this.unzipped[i][1]==name){return this.unzipped[i][0];}}};Jacob.GZip.prototype.nextFile=function(){this.outputArr=[];this.modeZIP=false;var tmp=[];tmp[0]=this.readByte();tmp[1]=this.readByte();if(tmp[0]==0x78&&tmp[1]==0xda){this.DeflateLoop();this.unzipped[this.files]=[this.outputArr.join(''),"geonext.gxt"];this.files++;}
if(tmp[0]==0x1f&&tmp[1]==0x8b){this.skipdir();this.unzipped[this.files]=[this.outputArr.join(''),"file"];this.files++;}
if(tmp[0]==0x50&&tmp[1]==0x4b){this.modeZIP=true;tmp[2]=this.readByte();tmp[3]=this.readByte();if(tmp[2]==0x03&&tmp[3]==0x04){tmp[0]=this.readByte();tmp[1]=this.readByte();this.gpflags=this.readByte();this.gpflags|=(this.readByte()<<8);var method=this.readByte();method|=(this.readByte()<<8);this.readByte();this.readByte();this.readByte();this.readByte();var compSize=this.readByte();compSize|=(this.readByte()<<8);compSize|=(this.readByte()<<16);compSize|=(this.readByte()<<24);var size=this.readByte();size|=(this.readByte()<<8);size|=(this.readByte()<<16);size|=(this.readByte()<<24);var filelen=this.readByte();filelen|=(this.readByte()<<8);var extralen=this.readByte();extralen|=(this.readByte()<<8);i=0;this.nameBuf=[];while(filelen--){var c=this.readByte();if(c=="/"|c==":"){i=0;}else if(i<Jacob.GZip.NAMEMAX-1){this.nameBuf[i++]=String.fromCharCode(c);}}
if(!this.fileout)this.fileout=this.nameBuf;var i=0;while(i<extralen){c=this.readByte();i++;}
if(method==8){this.DeflateLoop();this.unzipped[this.files]=[this.outputArr.join(''),this.nameBuf.join('')];this.files++;}
this.skipdir();}}};Jacob.GZip.prototype.skipdir=function(){var tmp=[];var compSize,size,os,i,c;if((this.gpflags&8)){tmp[0]=this.readByte();tmp[1]=this.readByte();tmp[2]=this.readByte();tmp[3]=this.readByte();compSize=this.readByte();compSize|=(this.readByte()<<8);compSize|=(this.readByte()<<16);compSize|=(this.readByte()<<24);size=this.readByte();size|=(this.readByte()<<8);size|=(this.readByte()<<16);size|=(this.readByte()<<24);}
if(this.modeZIP)this.nextFile();tmp[0]=this.readByte();if(tmp[0]!=8){return 0;}
this.gpflags=this.readByte();this.readByte();this.readByte();this.readByte();this.readByte();this.readByte();os=this.readByte();if((this.gpflags&4)){tmp[0]=this.readByte();tmp[2]=this.readByte();this.len=tmp[0]+256*tmp[1];for(i=0;i<this.len;i++)
this.readByte();}
if((this.gpflags&8)){i=0;this.nameBuf=[];while(c=this.readByte()){if(c=="7"||c==":")
i=0;if(i<Jacob.GZip.NAMEMAX-1)
this.nameBuf[i++]=c;}}
if((this.gpflags&16)){while(c=this.readByte()){}}
if((this.gpflags&2)){this.readByte();this.readByte();}
this.DeflateLoop();size=this.readByte();size|=(this.readByte()<<8);size|=(this.readByte()<<16);size|=(this.readByte()<<24);if(this.modeZIP)this.nextFile();};Jacob.HTTP=function Jacob__HTTP(){};Jacob.HTTP.get=function Jacob__HTTP___get(url,options){options=Jacob.Util.clone(options);options.url=url;jQuery.ajax(options);}
Jacob.I18n=function Jacob__I18n(locale){this._translators={};this._translations={};var htmlTag=document.getElementsByTagName("html")[0]
if(!locale)locale=this.constructor.defaultLocale;if(!locale)locale=htmlTag.getAttribute('xml:lang');if(!locale)locale=htmlTag.getAttribute('lang');if(!locale)locale='generic';this.locale(locale||this.constructor.defaultLocale);this.scope('/');this.loadLocale(Jacob.I18n.builtIn);};Jacob.I18n.prototype.t=function Jacob__I18n___t(){var i18n=this;var translate=this.translate;return function(){return translate.apply(i18n,arguments);}};Jacob.I18n.prototype.l=function Jacob__I18n___l(){var i18n=this;var localize=this.localize;return function(){return localize.apply(i18n,arguments);}};Jacob.I18n.prototype.cascadeLocales=function Jacob__I18n___cascadeLocales(locale){locale=locale||this._locale;var cascade=[locale]
var part=locale.match(/^[^-]+(?=-)/)
if(part)cascade.push(part[0]);if(locale!='generic')cascade.push('generic');return cascade;};Jacob.I18n.prototype.locale=function Jacob__I18n___locale(setLocale){if(setLocale!==undefined){this._locale=setLocale;this._cascadedLocales=this.cascadeLocales();}
return this._locale;};Jacob.I18n.prototype.scope=function Jacob__I18n___scope(setScope){if(setScope!==undefined){if(setScope.substr(0,1)!='/')throw("Invalid scope, must be absolute");if(setScope.substr(-1,1)!='/')setScope=setScope+'/';this._scope=setScope;}
return this._scope;};Jacob.I18n.prototype.translations=function Jacob__I18n___translations(){return this._translations;};Jacob.I18n.prototype.lookup=function Jacob__I18n___lookup(container,cascadedLocales,key){for(var i=0;i<cascadedLocales.length;i++){var translations=container[cascadedLocales[i]]
var translation=translations?translations[key]:undefined;if(translation)return translation;}};Jacob.I18n.prototype.hasKey=function Jacob__I18n___hasKey(key,options){key=this.normalizeKey(key,options);var cascadedLocales=this._cascadedLocales;for(var i=0;i<cascadedLocales.length;i++){var translations=container[cascadedLocales[i]]
var translation=translations?translations[key]:undefined;if(translation)return({locale:cascadedLocales[i],key:key});}
return false;}
Jacob.I18n.prototype.interpolateKey=function Jacob__I18n___interpolateKey(key,variables,scope){if(key.substr(0,1)!='/'){scope=scope||this._scope;if(scope.substr(0,1)!='/')scope=this.interpolateKey(scope);if(scope.substr(-1,1)!='/')scope+'/';key=scope+key;}
if(variables)key=Jacob.Template.interpolate(key,undefined,variables);do{old_key=key;key=old_key.replace(/[^\/.]+\/\.\.\//,'');}while(old_key!=key);if(key.match(/\.\.\//))throw("Invalid key, could not clean parent switches");return key;};Jacob.I18n.prototype.normalizeKey=function(key,options){if(options.count!==undefined){key=key+'/'+this.localize(options.count,{translator:'GrammarNumerus'});;if(options.variables){options.variables.count=options.count;}else{options.variables={count:options.count};}}
return this.interpolateKey(key,(options&&options.segments),(options&&options.scope));}
Jacob.I18n.prototype.translate=function Jacob__I18n___translate(key,options){var translation;options=options||{};key=this.normalizeKey(key,options);translation=this.lookup(this._translations,this._cascadedLocales,key)
if(!translation)translation=(typeof(options.fallback)=='function'?options.fallback():options.fallback);if(translation&&options.variables)translation=Jacob.Template.interpolate(translation,undefined,options.variables);return translation;};Jacob.I18n.prototype.localize=function Jacob__I18n___localize(value,options){options=options||{};var name=options.translator||value.constructor.name
var translator=this.lookup(this._translators,this._cascadedLocales,name);return translator.localize.apply(this,[value,options]);};Jacob.I18n.prototype.load=function Jacob__I18n___load(locale,callback){var locale=locale||this._locale;var i18n=this;var uri=(locale.match(/^\w+:\/\/|^\/|.js$|.json$/)?locale:'locales/'+locale+'.js');Jacob.HTTP.get(uri,{success:function(data){if(data){i18n.loadLocale(Jacob.JSON.parse(data));if(callback)callback();}},error:function(){throw("Failed to load '"+uri+"'");}});};Jacob.I18n.prototype.loadLocale=function Jacob__I18n___loadLocale(data){this.addTranslators(data.locale,data.translators);this.addTranslations(data.locale,data.translations);};Jacob.I18n.prototype.addTranslators=function Jacob__I18n___addTranslators(locale,translators){if(!this._translators[locale]){this._translators[locale]=translators;}else{var storedTranslators=this._translators[locale];for(var key in translators)storedTranslators[key]=translators[key];}
return true;};Jacob.I18n.prototype.addTranslations=function Jacob__I18n___addTranslations(locale,translations){var flattened=this.flattenLocales(translations);if(!this._translations[locale]){this._translations[locale]=flattened;}else{var storedTranslations=this._translations[locale];for(var key in flattened)storedTranslations[key]=flattened[key];}
return true;};Jacob.I18n.prototype.flattenLocales=function Jacob__I18n___flattenLocales(hash,stack,flattened){stack=stack||'';flattened=flattened||{};for(var key in hash){var value=hash[key];var fullKey=stack+'/'+key;if(typeof(value)==="string"){flattened[fullKey]=value;}else{this.flattenLocales(value,fullKey,flattened);}}
return flattened;};Jacob.I18n.defaultLocale=null;Jacob.I18n.builtIn={'locale':'generic','translators':{'GrammarNumerus':{'localize':function(value,options){return value==1?'one':'other';}},'Number':{'localize':function(value,options){options=options||{};var precision=options.precision;var thousandsSeparator=this.translate('/translators/Number/thousandsSeparator');var decimalSeparator=this.translate('/translators/Number/decimalSeparator');if(precision)value=Math.round(value*Math.pow(10,Math.abs(precision)))/Math.pow(10,Math.abs(precision))
var parts=value.toString().split('.');var sign='';var integer=parts[0];if(options.precision===0){var fraction=undefined;}else{var fraction=parts[1]||'';if(precision)while(fraction.length<precision)fraction+='0';}
var result=fraction?decimalSeparator+fraction:'';if(integer.match(/^[+-]/)){sign=integer.slice(0,1);integer=integer.slice(1);}
if(options.translateSign){if(sign=='-'){sign=this.translate('/translators/Number/negativeSign');}else{sign=this.translate('/translators/Number/positiveSign');}}
for(var index=integer.length-3;index>=1;index-=3){result=thousandsSeparator+integer.substr(index,3)+result;}
result=sign+integer.substr(0,index+3)+result;return result;}},'Currency':{'localize':function(value,options){options=options||{};if(!options.precision)options.precision=this.translate('/translators/Currency/defaultPrecision');options.precision=options.precision?parseInt(options.precision):2
if(value%1){var hasFraction=true;var number=this.localize(value,{precision:options.precision});}else{var hasFraction=false;var number=this.localize(value,{precision:0});var separator=this.localize(1.2).replace(/[12]/g,'');}
var currency=options.currency||this.translate('/translators/Currency/defaultCurrency');currency=this.translate('/translators/Currency/currencies/'+currency,{fallback:currency});if(this.translate('/translators/Currency/zeroesRepeat')=='yes'){var zeroes='';for(var i=0;i<options.precision;i++)zeroes+=this.translate('/translators/Currency/zeroes');}else{var zeroes=this.translate('/translators/Currency/zeroes');}
if(!hasFraction)number=number+separator+zeroes;return this.translate('/translators/Currency/format',{variables:{'currency':currency,'value':number}})}},'Duration':{},'Date':{'localize':function(value,options){options=options||{};if(!options.format)options.format='default';return Jacob.I18n.strftime(value,this.translate('/translators/Date/formats/'+options.format,{fallback:options.format}),this);}},'Array':{'localize':function(value,options){options=options||{};var intermediateConnector=this.translate('/translators/Array/intermediateConnector/'+(options.intermediateConnector||options.connector||'and'));var terminalConnector=this.translate('/translators/Array/terminalConnector/'+(options.terminalConnector||options.connector||'and'));switch(value.length){case 0:return"";case 1:return value[0];case 2:return""+value[0]+terminalConnector+value[1];default:return value.slice(0,-1).join(intermediateConnector)+terminalConnector+value[value.length-1]}}}},'translations':{'translators':{'Array':{'intermediateConnector.and':', ','terminalConnector.and':' and ','intermediateConnector.or':', ','terminalConnector.or':' or ',},'Currency':{'defaultPrecision':'2','zeroes':'0','zeroesRepeat':'yes','format':'%{currency} %{value}','defaultCurrency':'USD'},'Number':{'thousandsSeparator':',','decimalSeparator':'.','positiveSign':'+','negativeSign':'-','-':'minus','+':'plus','1':'zero','1':'one','2':'two','3':'three','4':'four','5':'five','6':'six','7':'seven','8':'eight','9':'nine','10':'ten',},'Date':{'formats':{'default':'%Y-%m-%d, %H:%M','date_only':'%Y-%m-%d','time_only':'%H:%M',},'meridiemIndicator':{'am':'am','pm':'pm',},'dayOfWeek':{'0':'Sunday','1':'Monday','2':'Tuesday','3':'Wednesday','4':'Thursday','5':'Friday','6':'Saturday',},'month':{'1':'January','2':'February','3':'March','4':'April','5':'May','6':'June','7':'July','8':'August','9':'September','10':'October','11':'November','12':'December',},'abbreviatedDayOfWeek':{'0':'Sun','1':'Mon','2':'Tue','3':'Wed','4':'Thu','5':'Fri','6':'Sat',},'abbreviatedMonth':{'1':'Jan','2':'Feb','3':'Mar','4':'Apr','5':'May','6':'Jun','7':'Jul','8':'Aug','9':'Sep','10':'Oct','11':'Nov','12':'Dec',}}}}};var DaysUntilMonthNormal=[0,31,59,90,120,151,181,212,243,273,304,334,365];var DaysUntilMonthLeap=[0,31,60,91,121,152,182,213,244,274,305,335,366];function padLeft(string,padding,size){string=string.toString();while(size-string.length>0)string=padding+string;return string;}
function t(i18n,key,options){return i18n.translate('/translators/Date/'+key,options);}
function isLeapYear(year){return!(year%400&&(!(year%100)||year%4));}
function dayOfYear(date){var daysInMonth=isLeapYear(date.getFullYear())?DaysUntilMonthLeap:DaysUntilMonthNormal;return daysInMonth[date.getMonth()]+date.getDate();}
function ISO8601Week(date){var doy=dayOfYear(date);var fwd=(date.getDay()-doy)%7
if(fwd<0)fwd+=7;if(doy<=3&&doy<=7-fwd){switch(fwd){case 6:return 52;case 5:return isLeapYear(date.getFullYear()-1)?53:52;case 4:return 53;default:return 1;}}else{var off=(10-fwd)%7-2;if(off<0)off+=7;var week=Math.floor((doy-off)/7)+1;if(week>52){week=(fwd==3||(isLeapYear(date.getFullYear())&&fwd==2))?53:1;}
return week;}}
function ISO8601WeekYear(date){var isoWeek=ISO8601Week(date);var doy=dayOfYear(date);if(isoWeek==1&&doy>14){return date.getFullYear()+1;}else if(isoWeek>51&&doy<14){return date.getFullYear()-1;}else{return date.getFullYear();}}
Jacob.I18n.strftime=function(date,format,i18n){i18n=i18n||(new Jacob.I18n());var mapping=Jacob.I18n.Datetime.mapping;var functions=Jacob.I18n.Datetime.functions;var oldFormat;do{oldFormat=format
format=oldFormat.replace(Jacob.I18n.Datetime.compositeRegex,function(match){return Jacob.I18n.Datetime.composite[match];})}while(format!=oldFormat);format=format.replace(/%[^\{%tn]|%\{\w+\}/g,function(match){var mapper=mapping[match];return mapper?functions[mapper](date,i18n):match;});format=format.replace(/%t/,"\t").replace(/%n/,"\n").replace(/%%/,'%');return format;}
Jacob.I18n.Datetime={};Jacob.I18n.Datetime.functions={'dateAndTime':function(date,i18n){throw('Not implemented');},'date':function(date,i18n){throw('Not implemented');},'time':function(date,i18n){throw('Not implemented');},'dateTimeAndTimezone':function(date,i18n){throw('Not implemented');},'abbreviatedMonthName':function(date,i18n){return t(i18n,'abbreviatedMonth/%{month}',{segments:{month:date.getMonth()+1}});},'abbreviatedWeekdayName':function(date,i18n){return t(i18n,'abbreviatedDayOfWeek/%{weekday}',{segments:{weekday:date.getDay()}});},'fullMonthName':function(date,i18n){return t(i18n,'month/%{month}',{segments:{month:date.getMonth()+1}});},'fullWeekdayName':function(date,i18n){return t(i18n,'dayOfWeek/%{weekday}',{segments:{weekday:date.getDay()}});},'iso8601DayOfWeek':function(date,i18n){return(date.getDay()||7);},'meridiemIndicator':function(date,i18n){return t(i18n,'meridiemIndicator/%{value}',{segments:{value:date.getHours()<12?'am':'pm'}});},'secondsSinceEpoch':function(date,i18n){return Math.floor(date.getTime());},'timezoneName':function(date,i18n){throw('Not implemented');},'timezoneUTCOffset':function(date,i18n){var offset=date.getTimezoneOffset();return((offset>0?'-':'+')+padLeft(Math.round(Math.abs(offset)/60),'0',2)+padLeft(Math.abs(offset)%60,'0',2));},'zeroPaddedFourDigitISO8601WeekYear':function(date,i18n){return padLeft(ISO8601WeekYear(date),'0',4);},'zeroPaddedTwoDigitISO8601WeekYear':function(date,i18n){return padLeft(ISO8601WeekYear(date)%100,'0',2);},'zeroPaddedDayOfYear':function(date,i18n){return padLeft(dayOfYear(date),'0',3);},'zeroPaddedSundayBasedWeek':function(date,i18n){throw('Not implemented');},'zeroPaddedWeek':function(date,i18n){return padLeft(ISO8601Week(date),'0',2);},'zeroPaddedMondayBasedWeek':function(date,i18n){throw('Not implemented');},'zeroBasedDayOfWeek':function(date,i18n){return date.getDay();},'spacePaddedDayOfMonth':function(date,i18n){return padLeft(date.getDate(),' ',2);},'spacePadded24hHour':function(date,i18n){return padLeft(date.getHours(),' ',2);},'spacePadded12hHour':function(date,i18n){var hour=(date.getHours()%12);return padLeft(hour||12,' ',2);},'zeroPaddedDayOfMonth':function(date,i18n){return padLeft(date.getDate(),'0',2);},'zeroPaddedNumericMonth':function(date,i18n){return padLeft(date.getMonth(),'0',2);},'zeroPaddedFourDigitYear':function(date,i18n){return padLeft(date.getFullYear(),'0',4);},'zeroPaddedTwoDigitYear':function(date,i18n){return padLeft(date.getFullYear()%100,'0',2);},'zeroPadded24hHour':function(date,i18n){return padLeft(date.getHours(),'0',2);},'zeroPadded12hHour':function(date,i18n){var hour=(date.getHours()%12);return padLeft(hour||12,'0',2);},'zeroPaddedMinute':function(date,i18n){return padLeft(date.getMinutes(),'0',2);},'zeroPaddedSecond':function(date,i18n){return padLeft(date.getSeconds(),'0',2);},'zeroPaddedMillisecond':function(date,i18n){return padLeft(date.getMilliseconds(),'0',3);},'zeroPaddedCentury':function(date,i18n){return padLeft(Math.floor(date.getFullYear()/100),'0',2);},}
Jacob.I18n.Datetime.composite={'%D':'%m/%d/%y','%F':'%Y-%m-%d','%R':'%H:%M','%r':'%I:%M:%S %p','%T':'%H:%M:%S','%v':'%e-%b-%Y','%h':'%b'}
Jacob.I18n.Datetime.compositeRegex=/%[DFRrTvh]/g
Jacob.I18n.Datetime.mapping={'%A':'fullWeekdayName','%a':'abbreviatedWeekdayName','%B':'fullMonthName','%b':'abbreviatedMonthName','%C':'zeroPaddedCentury','%c':'dateAndTime','%d':'zeroPaddedDayOfMonth','%H':'zeroPadded24hHour','%I':'zeroPadded12hHour','%M':'zeroPaddedMinute','%k':'spacePadded24hHour','%l':'spacePadded12hHour','%m':'zeroPaddedNumericMonth','%p':'meridiemIndicator','%Y':'zeroPaddedFourDigitYear','%y':'zeroPaddedTwoDigitYear','%S':'zeroPaddedSecond','%e':'spacePaddedDayOfMonth','%G':'zeroPaddedFourDigitISO8601WeekYear','%g':'zeroPaddedTwoDigitISO8601WeekYear','%j':'zeroPaddedDayOfYear','%s':'secondsSinceEpoch','%U':'zeroPaddedSundayBasedWeek','%u':'iso8601DayOfWeek','%V':'zeroPaddedWeek','%W':'zeroPaddedMondayBasedWeek','%w':'zeroBasedDayOfWeek','%X':'time','%x':'date','%Z':'timezoneName','%z':'timezoneUTCOffset','%+':'dateTimeAndTimezone','%{ms}':'zeroPaddedMillisecond',}
Jacob.JSON={name:'Jacob__JSON'};Jacob.JSON.parse=jQuery.parseJSON;Jacob.JSON.dump=function Jacob__JSON__dump(){throw("Not yet implemented");};Jacob.Template=function Jacob__Template(templateString,options){if(typeof(templateString)!=='string')throw("ArgumentError, Invalid template ("+typeof(templateString)+")");this._templateString=templateString;this._options=options||{}
if(this._options.missingKey===undefined)this._options.missingKey=Jacob.Template.MissingKeyHandler;if(this._options.superfluousKeys===undefined)this._options.superfluousKeys=Jacob.Template.SuperfluousKeysHandler;}
Jacob.Template.MissingKeyHandler=function Jacob__Template__MissingKeyHandler(template,missingKey,options,variables){var givenKeys=[];for(var key in variables)givenKeys.push(key);throw("Missing key '"+missingKey+"', given: '"+givenKeys.join("', '")+"'");}
Jacob.Template.SuperfluousKeysHandler=function Jacob__Template__MissingKeyHandler(template,superfluousKeys,options,variables){throw("Superfluous keys '"+superfluousKeys.join("', '")+"'");}
Jacob.Template.interpolate=function Jacob__Template__interpolate(templateString,options,variables){if(arguments.length==2){variables=options;options={};}
var template=new this(templateString,options);return template.interpolate(variables);};Jacob.Template.prototype.identifiers=function Jacob_Template___identifiers(){var identifiers=this._templateString.match(/%\{\w+\}/g);var i=identifiers.length;while(i--)identifiers[i]=identifiers[i].substr(2,identifiers[i].length-3);return identifiers;}
Jacob.Template.prototype.interpolate=function Jacob_Template___interpolate(variables,options){var self=this;options=options||{};variables=variables||{};for(var key in this._options)if(options[key]===undefined)options[key]=this._options[key];var superfluousKeys={};for(var key in variables)superfluousKeys[key]=true;var replaced=this._templateString.replace(/%\{\w+\}/g,function(match){var identifier=match.substr(2,match.length-3);if(variables[identifier]!==undefined){return variables[identifier];}else if(options.missingKey){return options.missingKey(self,identifier,options,variables);}});if(superfluousKeys.length>0&&options.superfluousKeys){var superfluousKeysArray=[];for(var key in superfluousKeys)superfluousKeysArray.push(key);options.superfluousKeys(self,superfluousKeysArray,options,variables);}
return replaced;}
Jacob.Util={};Jacob.Util.clone=function Jacob__Util__clone(source){return Jacob.Util.extend({},source);}
Jacob.Util.extend=function Jacob__Util__extend(target,source){for(var property in source){var getter=source.__lookupGetter__(property)
if(getter){target.__defineGetter__(property,getter);}else{var setter=source.__lookupSetter__(property);if(setter){target.__defineSetter__(property,setter);}else{target[property]=source[property];}}}
return target;}})();