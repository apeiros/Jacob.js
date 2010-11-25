/*--
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.
--*/

/**
 *    class Jacob.Struct
 *
 *    ## Summary
 *
 *    Struct lets you create classes with specified accessors quickly.
 *    The advantage is that it verifies data passed to the constructor, so
 *    You can avoid typos.
 *
 *
 *    ## Synopsis
 *
 *        Person = Jacob.Struct.create('Person', 'firstName', 'lastName', 'age');
 *        parker = new Person('Peter', 'Parker', 28);
 *        kent   = Person.from({firstName: 'Clark', lastName: 'Kent', age: 28});
 *        kent.firstName;  // => "Clark"
 *        kent.toObject(); // => {firstName: 'Clark', lastName: 'Kent', age: 28}
 *        kent.inspect();  // => "#<Person firstName: \"Clark\", lastName: \"Kent\", age: 28>"
 **/


Jacob.Struct = {}


/**
 *    new Jacob.Struct()
 *
 *    ## Summary
 *
 *    Creates a new Struct constructor.
 **/
Jacob.Struct.create = function Jacob__Struct(name) {
  var members     = Array.prototype.slice.call(arguments, 1);
  var struct      = new Function(name, "this.initialize.apply(this, arguments);");
  struct.__defineSetter__("members", function() { throw("Modifying members is not allowed."); });
  struct.__defineGetter__("members", function() { return members; });

  return struct;
};
