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
})();
