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
