
if(!window.Jacob)window.Jacob={};Jacob=window.Jacob;(function(){Jacob.Util={};Jacob.Util.clone=function Jacob__Util__clone(source){return Jacob.Util.extend({},source);}
Jacob.Util.extend=function Jacob__Util__extend(target,source){for(var property in source){var getter=source.__lookupGetter__(property)
if(getter){target.__defineGetter__(property,getter);}else{var setter=source.__lookupSetter__(property);if(setter){target.__defineSetter__(property,setter);}else{target[property]=source[property];}}}
return target;}})();