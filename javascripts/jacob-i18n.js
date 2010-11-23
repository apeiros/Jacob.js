
if(!window.Jacob)window.Jacob={};Jacob=window.Jacob;(function(){Jacob.Barrier=function Jacob__Barrier(){this.length=0;this._waiterID=0;this._waiters={};this._releasers=[];};Jacob.Barrier.prototype.wait=function Jacob__Barrier___wait(id){var barrier=this;var id=this.block(id);var waiter=function(){barrier.clear(id)};return waiter;};Jacob.Barrier.prototype.block=function Jacob__Barrier___block(id){var id=id||this.nextID();if(!this._waiters[id]){this.length++;this._waiters[id]=true;}
return id;};Jacob.Barrier.prototype.nextID=function Jacob__Barrier___nextID(){var id=this._waiterID;this._waiterID++;return id;};Jacob.Barrier.prototype.clear=function Jacob__Barrier___clear(id){if(this._waiters[id]){this.length--;delete this._waiters[id];if(!this.length)this.triggerRelease();}
return this;};Jacob.Barrier.prototype.triggerRelease=function Jacob__Barrier___triggerRelease(){for(var i=0;i<this._releasers.length;i++)this._releasers[i]();return this;};Jacob.Barrier.prototype.release=function Jacob__Barrier___release(releaser){this._releasers.push(releaser);return this;};Jacob.I18n=function Jacob__I18n(locale){this._translators={};this._translations={};var htmlTag=document.getElementsByTagName("html")[0]
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