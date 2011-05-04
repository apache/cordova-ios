SHELL = /bin/bash
CHMOD = chmod
CP = cp
MV = mv
NOOP = $(SHELL) -c true
RM_F = rm -f
RM_IR = rm -iR
RM_RF = rm -rf
TEST_F = test -f
TOUCH = touch
UMASK_NULL = umask 0
DEV_NULL = > /dev/null 2>&1
MKPATH = mkdir -p
CAT = cat
MAKE = make
OPEN = open
ECHO = echo
ECHO_N = echo -n
JAVA = java
DOXYGEN = 
IPHONE_DOCSET_TMPDIR = docs/iphone/tmp
PACKAGEMAKER = /Developer/Applications/Utilities/PackageMaker.app/Contents/MacOS/PackageMaker
XC = xcodebuild

all :: installer

PhoneGapLib/javascripts/phonegap-min.js: phonegap-js-core
	$(JAVA) -jar util/yuicompressor-2.4.2.jar --charset UTF-8 -o $@ PhoneGapLib/javascripts/phonegap.js
	
phonegap-js-core:
	$(MAKE) -C PhoneGapLib

xcode4-template: clean
	$(CP) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/TemplateIcon.icns PhoneGap-based\ Application.xctemplate
	$(CP) -R PhoneGap-based\ Application/Classes PhoneGap-based\ Application.xctemplate
	$(CP) -R PhoneGap-based\ Application/Plugins PhoneGap-based\ Application.xctemplate
	$(CP) -R PhoneGap-based\ Application/Resources PhoneGap-based\ Application.xctemplate
	$(CP) PhoneGap-based\ Application/___PROJECTNAMEASIDENTIFIER___-Info.plist PhoneGap-based\ Application.xctemplate/___PACKAGENAME___-Info.plist
	$(CP) PhoneGap-based\ Application/___PROJECTNAMEASIDENTIFIER___-Prefix.pch PhoneGap-based\ Application.xctemplate/___PACKAGENAME___-Prefix.pch
	$(CP) PhoneGap-based\ Application/main.m PhoneGap-based\ Application.xctemplate
	$(CP) PhoneGap-based\ Application/PhoneGap.plist PhoneGap-based\ Application.xctemplate
	
clean-xcode4-template:
	$(RM_RF) _tmp
	$(MKPATH) _tmp
	$(CP) PhoneGap-based\ Application.xctemplate/TemplateInfo.plist _tmp
	$(CP) PhoneGap-based\ Application.xctemplate/README _tmp
	$(CP) -Rf PhoneGap-based\ Application.xctemplate ~/.Trash
	$(RM_RF) PhoneGap-based\ Application.xctemplate
	$(MV) _tmp PhoneGap-based\ Application.xctemplate 
	
phonegap-framework:
	cd PhoneGapLib;$(XC) -target UniversalFramework;cd -;
	$(CP) -R PhoneGapLib/build/Release-universal/PhoneGap.framework .
	$(CP) -R PhoneGap-based\ Application/www PhoneGap.framework
	
clean: clean-xcode4-template
	$(RM_RF) PhoneGapLib/build/
	$(RM_F) PhoneGapLib/PhoneGapLib.xcodeproj/*.mode1v3
	$(RM_F) PhoneGapLib/PhoneGapLib.xcodeproj/*.perspectivev3
	$(RM_F) PhoneGapLib/PhoneGapLib.xcodeproj/*.pbxuser
	$(RM_F) PhoneGapLib/javascripts/phonegap.*.js
	$(RM_RF) PhoneGap-based\ Application/build/
	$(RM_F) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/*.mode1v3
	$(RM_F) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/*.perspectivev3
	$(RM_F) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/*.pbxuser
	$(RM_F) PhoneGap-based\ Application/www/phonegap.*.js
	$(RM_RF) PhoneGap.framework
	
installer: xcode4-template phonegap-framework
	$(PACKAGEMAKER) -d PhoneGapLibInstaller/PhoneGapLibInstaller.pmdoc -o PhoneGapLibInstaller.pkg

install: installer
	open PhoneGapLibInstaller.pkg
	
uninstall:
	$(RM_RF) ~/Library/Application Support/Developer/Shared/Xcode/Project Templates/PhoneGap
	$(RM_RF) ~/Library/Developer/Xcode/Templates/Project\ Templates/Application/PhoneGap-based\ Application.xctemplate
	@read -p "Delete all files in ~/Documents/PhoneGapLib/?: " ; \
	if [ "$$REPLY" == "y" ]; then \
	$(RM_RF) ~/Documents/PhoneGapLib/ ; \
	else \
	echo "" ; \
	fi	
	@read -p "Delete the PhoneGap framework /Users/Shared/Frameworks/PhoneGap.framework?: " ; \
	if [ "$$REPLY" == "y" ]; then \
	$(RM_RF) /Users/Shared/Frameworks/PhoneGap.framework/ ; $(RM_RF) ~/Library/Frameworks/PhoneGap.framework ; \
	else \
	echo "" ; \
	fi	
