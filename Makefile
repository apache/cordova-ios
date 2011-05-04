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

all :: installer

PhoneGapLib/javascripts/phonegap-min.js: phonegap-js-core
	$(JAVA) -jar util/yuicompressor-2.4.2.jar --charset UTF-8 -o $@ PhoneGapLib/javascripts/phonegap.js
	
phonegap-js-core:
	$(MAKE) -C PhoneGapLib

xcode4-template: clean
	$(CP) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/TemplateIcon.icns PhoneGap.xctemplate
	$(CP) -R PhoneGap-based\ Application/Classes PhoneGap.xctemplate
	$(CP) -R PhoneGap-based\ Application/Plugins PhoneGap.xctemplate
	$(CP) -R PhoneGap-based\ Application/Resources PhoneGap.xctemplate
	$(CP) PhoneGap-based\ Application/___PROJECTNAMEASIDENTIFIER___-Info.plist PhoneGap.xctemplate/___PACKAGENAME___-Info.plist
	$(CP) PhoneGap-based\ Application/___PROJECTNAMEASIDENTIFIER___-Prefix.pch PhoneGap.xctemplate/___PACKAGENAME___-Prefix.pch
	$(CP) PhoneGap-based\ Application/main.m PhoneGap.xctemplate
	$(CP) PhoneGap-based\ Application/PhoneGap.plist PhoneGap.xctemplate
	
clean:
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
	
installer: xcode4-template
	$(PACKAGEMAKER) -d PhoneGapLibInstaller/PhoneGapLibInstaller.pmdoc -o PhoneGapLibInstaller.pkg

uninstall:
	$(RM_RF) ~/Library/Application Support/Developer/Shared/Xcode/Project Templates/PhoneGap
	@read -p "Delete all files in ~/Documents/PhoneGapLib/?: " ; \
	if [ "$$REPLY" == "y" ]; then \
	$(RM_RF) ~/Documents/PhoneGapLib/ ; \
	else \
	echo "" ; \
	fi	
