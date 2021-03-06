JACOB
=====

Install
-------

1. Copy javascripts/jacob.js to your projects javascripts directory and link to it.
2. There's no step 2.

Note: jacob.js is a compilation of all files contained in the lib/jacob
directory and is therefore all you need. The jacob-dev.js file is the same
but before minification.


Summary
-------

Jacob is a library, or rather a set of libraries, which will help you with
all kinds of tasks related to javascript.

The sublibraries are the following:

* Jacob.I18n:
  Translate strings by key, localize dates, arrays and other
  objects.
* Jacob.Template:
  Interpolate variables in strings like "Hello %{name}"
* Jacob.HTTP:
  Handle ajax-requests and websockets


Examples
--------

Here a couple of examples, for live examples, take a look at the examples/
directory.

    i18n    = new Jacob.I18n('en');
    barrier = new Jacob.Barrier();
    i18n.load('locales/en.js', barrier.wait());
    i18n.load('locales/en-US.js', barrier.wait());
    barrier.release(function() { // we have to wait for the locales to be loaded
      // assuming the keys 'sites/index/title' and '/greeting' are defined in your locales files
      i18n.translate('/sites/index/title');                                // => "Welcome to CompuGlobalHyperMegaNet!"
      i18n.translate('/sites/%{site}/title', {segments: {site: 'value'}}); // => "Welcome to CompuGlobalHyperMegaNet!"
      i18n.translate('/greeting');                                         // => "Hello %{first_name}!"
      i18n.translate('/greeting', {variables: {first_name: 'Homer'}});     // => "Hello Homer!"
      i18n.localize((new Date()), {format: 'date_only'});                  // => "Sunday, 23. September 2010"
      i18n.localize(123456.78);                                            // => "123.456,78"
      i18n.localize(123456.78, {translator: 'Currency', currency: 'CHF'}); // => "USD 123.456,78"
      i18n.localize([1,2,3]);                                              // => "1, 2 and 3"
      i18n.localize([1,2,3], {connector: 'or'});                           // => "1, 2 or 3"
    });


Version
-------

This is to be considered an early alpha version of Jacob.


External Dependencies
---------------------

Some of Jacobs sub-libraries currently depend on jQuery for some functionality:
* Jacob.HTTP
* Jacob.JSON


License
-------

You can choose between MIT and BSD-3-Clause license.
License file will be added later.
