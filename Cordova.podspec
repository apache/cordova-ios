Pod::Spec.new do |s|
  s.name         = "Cordova"
  s.version      = "5.1.0"
  s.summary      = "Cordova for iOS"
  s.homepage     = "https://github.com/apache/cordova-ios"
  s.license      = { :type => "Apache 2.0", :file => "LICENSE" }
  s.author       = { "Bharath Hariharan" => "bhariharan@salesforce.com" }
  s.platform     = :ios, "11.0"
  s.source       = { :git => "https://github.com/apache/cordova-ios.git",
                     :tag => "{s.version}",
                     :submodules => true }
  s.requires_arc = true
  s.default_subspec  = 'Cordova'
  s.subspec 'Cordova' do |cordova|
      cordova.source_files = 'CordovaLib/Classes/**/*.{h,m}', 'CordovaLib/Cordova/Cordova.h'
      cordova.public_header_files = 'CordovaLib/Classes/Public/CDV.h', 'CordovaLib/Classes/Public/CDVAppDelegate.h', 'CordovaLib/Classes/Public/CDVAvailability.h', 'CordovaLib/Classes/Public/CDVAvailabilityDeprecated.h', 'CordovaLib/Classes/Public/CDVCommandDelegate.h', 'CordovaLib/Classes/Public/CDVCommandDelegateImpl.h', 'CordovaLib/Classes/Public/CDVCommandQueue.h', 'CordovaLib/Classes/Public/CDVConfigParser.h', 'CordovaLib/Classes/Public/CDVInvokedUrlCommand.h', 'CordovaLib/Classes/Public/CDVPlugin+Resources.h', 'CordovaLib/Classes/Public/CDVPlugin.h', 'CordovaLib/Classes/Public/CDVPluginResult.h', 'CordovaLib/Classes/Public/CDVScreenOrientationDelegate.h', 'CordovaLib/Classes/Public/CDVTimer.h', 'CordovaLib/Classes/Public/CDVURLProtocol.h', 'CordovaLib/Classes/Public/CDVUserAgentUtil.h', 'CordovaLib/Classes/Public/CDVViewController.h', 'CordovaLib/Classes/Public/CDVWebViewEngineProtocol.h', 'CordovaLib/Classes/Public/CDVWhitelist.h', 'CordovaLib/Classes/Public/NSDictionary+CordovaPreferences.h', 'CordovaLib/Classes/Public/NSMutableArray+QueueAdditions.h', 'CordovaLib/Classes/Private/Plugins/CDVUIWebViewEngine/CDVUIWebViewDelegate.h', 'CordovaLib/Cordova/Cordova.h'
      cordova.prefix_header_contents = ''
      cordova.requires_arc = true
  end
end

#
# ATTENTION: 
#
# This file needs to be updated manually whenever a Cordova upgrade is performed.
# Sections that need to be updated:
#   1. {s.version} should be the latest version of Cordova.
#   2. {s.platform} should be updated if the minimum version of iOS has changed.
#   3. {cordova.source_files} should be updated if the path of the library has changed.
#   4. {cordova.public_header_files} should be updated, by removing the public headers
#      that have been removed and adding the public headers that have been added.
#