require "json"

packageJson = JSON.parse(File.read(File.join(__dir__, "package.json")))
relVersion = package['version']
relSource  = { :git => "https://github.com/apache/cordova-ios.git",
            :tag => "rel/{relVersion}",
            :submodules => true }

Pod::Spec.new do |s|
  s.name         = "Cordova"
  s.version      = relVersion
  s.summary      = "Apache Cordova for iOS"
  s.homepage     = "https://github.com/apache/cordova-ios"
  s.license      = { :type => "Apache 2.0", :file => "LICENSE" }
  s.author       = { "Apache Software Foundation" }
  s.platform     = :ios, "11.0"
  s.source       = relSource
  s.requires_arc = true
  s.preserve_paths = 'CordovaLib/cordova.js', 'CordovaLib/VERSION'
  s.frameworks = 'AssetsLibrary', 'MobileCoreServices', 'AVFoundation', 'CoreLocation'
  s.default_subspec  = 'Cordova'
  s.subspec 'Cordova' do |cordova|
      cordova.source_files = 'CordovaLib/Classes/**/*.{h,m}', 'CordovaLib/Cordova/Cordova.h'
      cordova.public_header_files = 'CordovaLib/Classes/Public/CDV.h', 'CordovaLib/Classes/Public/CDVAppDelegate.h', 'CordovaLib/Classes/Public/CDVAvailability.h', 'CordovaLib/Classes/Public/CDVAvailabilityDeprecated.h', 'CordovaLib/Classes/Public/CDVCommandDelegate.h', 'CordovaLib/Classes/Public/CDVCommandDelegateImpl.h', 'CordovaLib/Classes/Public/CDVCommandQueue.h', 'CordovaLib/Classes/Public/CDVConfigParser.h', 'CordovaLib/Classes/Public/CDVInvokedUrlCommand.h', 'CordovaLib/Classes/Public/CDVPlugin+Resources.h', 'CordovaLib/Classes/Public/CDVPlugin.h', 'CordovaLib/Classes/Public/CDVPluginResult.h', 'CordovaLib/Classes/Public/CDVScreenOrientationDelegate.h', 'CordovaLib/Classes/Public/CDVTimer.h', 'CordovaLib/Classes/Public/CDVViewController.h', 'CordovaLib/Classes/Public/CDVWebViewEngineProtocol.h', 'CordovaLib/Classes/Private/Plugins/CDVWebViewEngine/CDVWebViewUIDelegate.h', 'CordovaLib/Classes/Public/CDVWhitelist.h', 'CordovaLib/Cordova/Cordova.h', 'CordovaLib/Classes/Public/NSDictionary+CordovaPreferences.h', 'CordovaLib/Classes/Public/NSMutableArray+QueueAdditions.h'
      cordova.prefix_header_contents = ''
      cordova.requires_arc = true
  end
end

#
# ATTENTION: 
#
# This file needs to be updated manually whenever a Cordova upgrade that bumps up min version of iOS is performed.
# The release version number and the list of public headers are automatically updated through scipts.
# Sections that need to be updated:
#   1. {s.platform} should be updated if the minimum version of iOS has changed.
#
