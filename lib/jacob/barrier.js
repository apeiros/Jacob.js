/*--
  Copyright 2009-2010 by Stefan Rusterholz.
  All rights reserved.
  See LICENSE.txt for permissions.
--*/

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
