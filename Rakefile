namespace :jacob do
  # Compute the dependencies
  task :resolve do
    require 'yaml'

    dependencies = YAML.load_file('dependencies.yaml')
    resolved     = {}                                                               # libname => [[files..], ...]
    complete     = {}                                                               # libname => true -- most recently completed deps
    incomplete   = {}                                                               # libname => [libnames it depends upon]
    dependants   = Hash[dependencies.keys.zip(Array.new(dependencies.size) { [] })] # libname => [libnames that depend upon it]

    dependencies.each do |lib, deps|
      if deps['libs'] then
        incomplete[lib] = deps['libs']
        deps['libs'].each do |dep|
          dependants[dep] << lib
        end
      else
        complete[lib] = true
      end
      resolved[lib]   = deps['globs'] ? deps['globs'].map { |glob| Dir[glob] } : []
    end
    missing = dependants.keys-dependencies.keys
    abort("dependencies.yaml is missing the following keys: #{missing.inspect[1..-2]}") unless missing.empty?

    last_size = nil
    until incomplete.empty? || last_size == incomplete.size
      last_size        = incomplete.size
      current_complete = complete.dup
      complete         = {}
      current_complete.each_key do |completed|
        abort("Error on #{completed}") unless dependants[completed]
        dependants.delete(completed).each do |dependant|
          incomplete[dependant].delete(completed)
          resolved[dependant].concat(resolved[completed])
          if incomplete[dependant].empty? then
            incomplete.delete(dependant)
            complete[dependant] = true
          end
        end
      end
    end
    unless incomplete.empty? then
      puts "\nDependants:"
      pp dependants
      puts "\nComplete:"
      pp complete
      puts "\nIncomplete:"
      pp incomplete
      puts "\nResolved:"
      pp resolved

      raise "Circular dependency"
    end

    resolved.each do |lib, file_sets|
      resolved[lib] = file_sets.inject { |set_a, set_b| set_a | set_b }.sort_by { |path| path.tr('/', "\xff") }
    end

    $JACOB_RESOLVED = resolved
  end

  desc 'Shows what sublib depends on what files'
  task :resolution => :resolve do
    $JACOB_RESOLVED.sort.each do |lib, files|
      puts lib, *files.map { |file| "* #{file}" }
      puts
    end
  end

  # Cleans the javascripts/ directory
  task :clobber do
    rm_r 'javascripts'
    mkdir 'javascripts'
  end

  # Copy files from external/ to javascripts/
  task :copy_externals do
    Dir.glob('external/**/*') do |external|
      copied = external.sub(/^external/, 'javascripts')
      mkdir_p(File.dirname(copied))
      cp(external, copied)
    end
  end

  task :targets => :resolve do
    #$JACOB_TARGETS = $JACOB_RESOLVED
    $JACOB_TARGETS = {'jacob', $JACOB_RESOLVED['jacob']}
  end

  desc "Generate the compiled -dev.js libraries in javascripts/"
  task :compile => [:clobber, :copy_externals, :targets] do
    require 'enumerator' # each_cons

    jacob_doc = File.read('README.markdown').gsub(/^/, ' *    ').chomp

    header   = <<-HEADER
      /*
        Copyright 2009-2010 by Stefan Rusterholz.
        All rights reserved.
        See LICENSE.txt for permissions.

        __FILE__ is a compilation of the following files:
        __FILELIST__
      */


      /**
       *     Jacob
       *
      __JACOB__
       **/

      if (!window.Jacob) window.Jacob = {};
      Jacob = window.Jacob;

      (function() {
    HEADER
    footer    = <<-FOOTER
      })();
    FOOTER

    indent    = header[/\A */]
    header.gsub!(/^#{indent}/, '')
    header.gsub!(/^__JACOB__/, jacob_doc)
    indent    = footer[/\A */]
    footer.gsub!(/^#{indent}/, '')

    $JACOB_TARGETS.each do |lib, files|
      file_list = files.map { |file| file.sub(%r{^lib/}, '') }
      header    = header.
        gsub(/__FILE__/, lib).
        gsub(/^(.*)__FILELIST__/) {  "#{$1}* #{file_list.join("\n#{$1}* ")}" } #.
        #gsub(/^(.*)__DEPENDENCIES__/) {  "#{$1}* #{dependencies.join("\n#{$1}* ")}" }

      File.open("javascripts/#{lib}-dev.js", 'wb') do |compilation|
        compilation.write(header)
        (files+[nil]).each_cons(2) do |file, next_file|
          compilation.write("/* File #{file.sub(%r{^lib/}, '')} */\n")
          compilation.puts(File.read(file).gsub(%r{/\*--.*?--\*/\n?}m, '').sub(/\A[ \t\n]+/, ''))
          compilation.write("\n\n\n") if next_file
        end
        compilation.write(footer)
      end
    end
  end

  desc "Generate the minified .js libraries in javascripts/"
  task :minify => [:clobber, :targets, :compile] do
    require 'jsmin'
    $JACOB_TARGETS.each_key do |lib|
      development = "javascripts/#{lib}-dev.js"
      minified    = "javascripts/#{lib}.js"
      File.open(minified, 'wb') do |file|
        file.write(JSMin.minify(File.read(development)))
      end
    end
  end

  desc "Builds the documentation"
  task :doc do
    require 'pdoc'
    require 'cgi'

    #mkdir 'api-docs'
    PDoc.run({
      :source_files       => ["javascripts/jacob-dev.js"],
      :destination        => 'api-docs',
      :syntax_highlighter => :coderay, #:pygments,
      :markdown_parser    => nil, #:maruku,
      :pretty_urls        => false,
      :bust_cache         => false,
      :name               => 'Jacob',
      :short_name         => 'Jacob',
      :home_url           => '',
      :doc_url            => '',
      :version            => "0.0.1",
      :copyright_notice   => 'See License.txt' 
    })
  end

  # desc "Run all tests" # TODO: implement tests
  task :test => :minify do
    warn "Tests not yet implemented."
  end

  desc "Builds the compiled javascripts, the minified versions and the documentation and runs all tests at the end."
  task :all => [:compile, :minify, :doc, :test]
end

task :default => 'jacob:all'