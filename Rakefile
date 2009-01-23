require 'rubygems'
require "hpricot"

PHONEGAP_WEB_PATH = "iphone/www"

namespace :iphone do
  task :default => [:import] do
  end

  desc 'reverts file back to original form'
  task :revert do
    back = open("#{PHONEGAP_WEB_PATH}/index.back.html").read
    File.open("#{PHONEGAP_WEB_PATH}/index.html", "w") {|f| f.puts back}
  end

  desc 'backups index.html file'
  task :backup do
    puts "creating backup file (if needed)"
    index = open("#{PHONEGAP_WEB_PATH}/index.html").read
    File.open("#{PHONEGAP_WEB_PATH}/index.back.html", "w") {|f| f.write index} unless index.include?("RAKED::")
  end

  desc 'puts external javascript and css content into index page'
  task :import => :backup do
    #open backup file
    doc = Hpricot(open("#{PHONEGAP_WEB_PATH}/index.back.html"))
  
    #find and import stylesheets
    (doc/"head/link[@rel='stylesheet']").remove.each do |elem|
      path = file elem.attributes['href']
      puts "  importing stylesheet: #{path}"
      css_content = open("#{PHONEGAP_WEB_PATH}/#{path}").read
      elem.after("<style type=\"text/css\" media=\"screen\">\n/*RAKED::css file::#{path} */\n" + css_content + "\n</style>\n")
    end
  
    #find and import javascripts
    doc.search("head/script").remove.each do |elem|
      path = file elem.attributes['src']
      puts "  importing javascript: #{path}"
      js_content = open("#{PHONEGAP_WEB_PATH}/#{path}").read
      elem.after( "<script type=\"text/javascript\" charset=\"utf-8\">\n//RAKED::javascript file::#{path}\n" + js_content + "\n</script>\n\n")
    end
  
    #write and save as index.html
    open("#{PHONEGAP_WEB_PATH}/index.html", "w") { |f| f.write doc}
  end
end



