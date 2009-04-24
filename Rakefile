LIBPATH = File.expand_path(File.dirname(__FILE__)) + File::SEPARATOR
  
#
# builds and tests
#
desc 'writes lib/phonegap.js and lib/phonegap-min.js and runs docs'
task :default do
  build
  doc
end

task :doc do
  doc
end

def doc
  puts 'writing the full interface source for documentation into tmp/phonegap.js'
  final = "#{ LIBPATH }tmp#{ File::SEPARATOR }phonegap.js"
  js = ""
  interfaces_to_build.each do |lib|
    js << import("#{ LIBPATH }javascripts#{ File::SEPARATOR }#{ lib }.js")
  end
  FileUtils.mkdir_p "#{ LIBPATH }tmp"
  open(final,'w'){|f| f.puts( js )}
  sh "java -jar util#{ File::SEPARATOR }jsdoc-toolkit#{ File::SEPARATOR }jsrun.jar util#{ File::SEPARATOR }jsdoc-toolkit#{ File::SEPARATOR }app#{ File::SEPARATOR }run.js -a -d=javascripts/docs -t=util#{ File::SEPARATOR }jsdoc-toolkit#{ File::SEPARATOR }templates#{ File::SEPARATOR }jsdoc tmp#{ File::SEPARATOR }phonegap.js"
end

def build
  puts 'writing the full JS file to lib/phonegap.js'
  platforms_to_build.each do |platform|
    final = "#{ LIBPATH }lib#{ File::SEPARATOR }#{ platform }#{ File::SEPARATOR }phonegap.js"
    js = ""
    
    interfaces_to_build.each do |interface|
      js << import("#{ LIBPATH }javascripts#{ File::SEPARATOR }#{ interface }.js")
      begin
        js << import("#{ LIBPATH }javascripts#{ File::SEPARATOR }#{ platform }#{ File::SEPARATOR }#{ interface }.js")
      rescue
      end
    end
  
    FileUtils.mkdir_p "#{ LIBPATH }lib#{ File::SEPARATOR }#{ platform }"
    open(final,'w'){|f| f.puts( js )} 
  end

  min
end

# the sub libraries used by xui
def interfaces_to_build
  %w(device acceleration accelerometer media camera contact uicontrols debugconsole file geolocation map notification orientation position sms telephony)
end 

# the sub libraries used by xui
def platforms_to_build
  %w(android blackberry iphone)
end 

# helper for build_sub_libaries
def import(lib)
  s = ""
  r = ""
  open(lib) { |f| s << "\n#{f.read}\n\n" }
  s.each_line {|l| r << "    #{l}"}
  r
end

# creates lib/xui-min.js (tho not obfuscates)
def min
  puts 'minifying js'
  platforms_to_build.each do |platform|
    min_file = "#{ LIBPATH }lib#{ File::SEPARATOR }#{ platform }#{ File::SEPARATOR }phonegap-min.js"
    doc_file = "#{ LIBPATH }lib#{ File::SEPARATOR }#{ platform }#{ File::SEPARATOR }phonegap.js"
    sh "java -jar #{LIBPATH}#{ File::SEPARATOR }util#{ File::SEPARATOR }yuicompressor-2.4.2.jar --charset UTF-8 -o #{min_file} #{doc_file}"
  end
end 
 
# opens up the specs
def spec
  puts 'running automated test suite'
  #sh "open -a WebKit file://#{ LIBPATH }/spec/index.html"
  #sh "open -a '/Developer/Platforms/iPhoneSimulator.platform/Developer/Applications/iPhone Simulator.app' file://#{ LIBPATH }/spec/index.html"
end
