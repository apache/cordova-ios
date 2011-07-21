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
CONVERTPDF = /System/Library/Printers/Libraries/convert
COMBINEPDF = /System/Library/Automator/Combine\ PDF\ Pages.action/Contents/Resources/join.py
DOXYGEN = 
IPHONE_DOCSET_TMPDIR = docs/iphone/tmp
DEVELOPER = $(shell xcode-select -print-path)
PACKAGEMAKER = '$(DEVELOPER)/Applications/Utilities/PackageMaker.app/Contents/MacOS/PackageMaker'
XC = xcodebuild
PGVER = $(shell head -1 PhoneGapLib/VERSION)
GIT = $(shell which git)
COMMIT_HASH=$(shell git describe --tags)	
PKG_ERROR_LOG=pkg_error_log
BUILD_BAK=_build.bak

all :: installer

phonegap-lib: clean-phonegap-lib
	@echo "Packaging PhoneGap Javascript..."
	@$(MKPATH) $(BUILD_BAK)
	@$(CP) -f PhoneGapLib/VERSION $(BUILD_BAK)
	@$(MAKE) -C PhoneGapLib > /dev/null
	@if [ -e "$(GIT)" ]; then \
		echo -e '\n$(COMMIT_HASH)' >> PhoneGapLib/VERSION; \
	fi	
	@echo "Done."

xcode3-template: clean-xcode3-template
	@$(MKPATH) $(BUILD_BAK)
	@$(CP) -Rf PhoneGap-based\ Application/www $(BUILD_BAK)
	@cd PhoneGap-based\ Application/www; find . | xargs grep 'src[ 	]*=[ 	]*[\\'\"]phonegap-*.*.js[\\'\"]' -sl | xargs -L1 sed -i "" "s/src[ 	]*=[ 	]*[\\'\"]phonegap-*.*.js[\\'\"]/src=\"phonegap-${PGVER}.js\"/g"
	@cd ..
	@cp PhoneGapLib/javascripts/phonegap-*.js PhoneGap-based\ Application/www

xcode4-template: clean-xcode4-template
	@$(CP) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/TemplateIcon.icns PhoneGap-based\ Application.xctemplate
	@$(CP) -R PhoneGap-based\ Application/Classes PhoneGap-based\ Application.xctemplate
	@$(CP) -R PhoneGap-based\ Application/Plugins PhoneGap-based\ Application.xctemplate
	@$(CP) -R PhoneGap-based\ Application/Resources PhoneGap-based\ Application.xctemplate
	@$(CP) PhoneGap-based\ Application/___PROJECTNAMEASIDENTIFIER___-Info.plist PhoneGap-based\ Application.xctemplate/___PACKAGENAME___-Info.plist
	@$(CP) PhoneGap-based\ Application/___PROJECTNAMEASIDENTIFIER___-Prefix.pch PhoneGap-based\ Application.xctemplate/___PACKAGENAME___-Prefix.pch
	@$(CP) PhoneGap-based\ Application/main.m PhoneGap-based\ Application.xctemplate
	@$(CP) PhoneGap-based\ Application/PhoneGap.plist PhoneGap-based\ Application.xctemplate
	@sed -i "" 's/com\.yourcompany\.___PROJECTNAMEASIDENTIFIER___/___VARIABLE_bundleIdentifierPrefix:bundleIdentifier___\.___PROJECTNAMEASIDENTIFIER___/g' PhoneGap-based\ Application.xctemplate/___PACKAGENAME___-Info.plist

clean-xcode4-template: clean-xcode3-template
	@$(RM_RF) _tmp
	@$(MKPATH) _tmp
	@$(CP) PhoneGap-based\ Application.xctemplate/TemplateInfo.plist _tmp
	@$(CP) PhoneGap-based\ Application.xctemplate/README _tmp
	@$(CP) -Rf PhoneGap-based\ Application.xctemplate ~/.Trash
	@$(RM_RF) PhoneGap-based\ Application.xctemplate
	@$(MV) _tmp PhoneGap-based\ Application.xctemplate 

clean-xcode3-template:
	@if [ -d "$(BUILD_BAK)/www" ]; then \
		$(CP) -Rf "PhoneGap-based Application/www" ~/.Trash; \
		$(RM_RF) "PhoneGap-based Application/www"; \
		$(MV) $(BUILD_BAK)/www/ "PhoneGap-based Application/www"; \
	fi	
	@$(RM_RF) PhoneGap-based\ Application/build/
	@$(RM_F) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/*.mode1v3
	@$(RM_F) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/*.perspectivev3
	@$(RM_F) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/*.pbxuser
	@$(RM_F) PhoneGap-based\ Application/www/phonegap-*.js

clean-phonegap-framework:
	@$(RM_RF) PhoneGap.framework

clean-installer:
	@$(RM_F) PhoneGapInstaller/docs/*.rtf
	@$(RM_F) PhoneGapInstaller/docs/*.pdf
	@$(RM_F) PhoneGapInstaller/docs/LICENSE.html
	@$(RM_F) PhoneGapInstaller/docs/combined.html

clean-phonegap-lib:
	@if [ -e "$(BUILD_BAK)/VERSION" ]; then \
		$(CP) -Rf "PhoneGapLib/VERSION" ~/.Trash; \
		$(RM_RF) "PhoneGapLib/VERSION"; \
		$(MV) $(BUILD_BAK)/VERSION "PhoneGapLib/VERSION"; \
	fi	
	@$(RM_RF) PhoneGapLib/build/
	@$(RM_F) PhoneGapLib/PhoneGapLib.xcodeproj/*.mode1v3
	@$(RM_F) PhoneGapLib/PhoneGapLib.xcodeproj/*.perspectivev3
	@$(RM_F) PhoneGapLib/PhoneGapLib.xcodeproj/*.pbxuser
	@$(RM_F) PhoneGapLib/javascripts/phonegap-*.js

phonegap-framework: phonegap-lib clean-phonegap-framework
	@echo "Building PhoneGap.framework..."
	@cd PhoneGapLib;$(XC) -target UniversalFramework > /dev/null;
	@cd ..
	@echo "Done."
	@$(CP) -R PhoneGapLib/build/Release-universal/PhoneGap.framework .
	@$(CP) -R PhoneGap-based\ Application/www/index.html PhoneGap.framework/www
	@find "PhoneGap.framework/www" | xargs grep 'src[ 	]*=[ 	]*[\\'\"]phonegap-*.*.js[\\'\"]' -sl | xargs -L1 sed -i "" "s/src[ 	]*=[ 	]*[\\'\"]phonegap-*.*.js[\\'\"]/src=\"phonegap-${PGVER}.js\"/g"
	@if [ -e "$(GIT)" ]; then \
	echo -e '\n$(COMMIT_HASH)' >> PhoneGap.framework/VERSION; \
	fi	
	@$(CP) -R PhoneGap-based\ Application/Resources/Capture.bundle/ PhoneGap.framework/Capture.bundle

clean: clean-installer clean-phonegap-lib clean-xcode3-template clean-xcode4-template clean-phonegap-framework
	@if [ -e "$(PKG_ERROR_LOG)" ]; then \
		$(MV) $(PKG_ERROR_LOG) ~/.Trash; \
		$(RM_F) $(PKG_ERROR_LOG); \
	fi
	@$(RM_RF) $(BUILD_BAK)

installer: clean phonegap-lib xcode3-template xcode4-template phonegap-framework
	@$(MV) -f PhoneGapInstaller/docs/releasenotes.html PhoneGapInstaller/docs/releasenotes.html.bak 
	@$(MV) -f PhoneGapInstaller/docs/finishup.html PhoneGapInstaller/docs/finishup.html.bak 
	@$(CAT) PhoneGapInstaller/docs/finishup.html.bak | sed 's/{VERSION}/${PGVER}/' >> PhoneGapInstaller/docs/finishup.html
	@$(CAT) PhoneGapInstaller/docs/releasenotes.html.bak | sed 's/{VERSION}/${PGVER}/' >> PhoneGapInstaller/docs/releasenotes.html
	@textutil -convert rtf PhoneGapInstaller/docs/*.html
	@echo "Building PhoneGap-${PGVER}.pkg..."	
	@$(MKPATH) dist
	@$(PACKAGEMAKER) -d PhoneGapInstaller/PhoneGapInstaller.pmdoc -o dist/PhoneGap-${PGVER}.pkg > /dev/null 2> $(PKG_ERROR_LOG)
	@osacompile -o ./dist/Uninstall\ PhoneGap.app Uninstall\ PhoneGap.applescript > /dev/null 2>> $(PKG_ERROR_LOG)
	@$(CONVERTPDF) -f PhoneGapInstaller/docs/releasenotes.html -o ./dist/ReleaseNotes.pdf > /dev/null 2>> $(PKG_ERROR_LOG)
	@textutil -convert html -font 'Courier New' LICENSE -output PhoneGapInstaller/docs/LICENSE.html
	@textutil -cat html PhoneGapInstaller/docs/finishup.html PhoneGapInstaller/docs/readme.html PhoneGapInstaller/docs/LICENSE.html -output PhoneGapInstaller/docs/combined.html
	@$(CONVERTPDF) -f PhoneGapInstaller/docs/combined.html -o dist/Readme.pdf > /dev/null 2>> $(PKG_ERROR_LOG)
	@$(MV) -f PhoneGapInstaller/docs/releasenotes.html.bak PhoneGapInstaller/docs/releasenotes.html 
	@$(MV) -f PhoneGapInstaller/docs/finishup.html.bak PhoneGapInstaller/docs/finishup.html 
	@hdiutil create ./dist/PhoneGap-${PGVER}.dmg -srcfolder ./dist/ -ov -volname PhoneGap-${PGVER}
	@echo "Done."
	@make clean

install: installer
	@open dist/PhoneGap-${PGVER}.pkg

uninstall:
	@$(RM_RF) ~/Library/Application\ Support/Developer/Shared/Xcode/Project\ Templates/PhoneGap
	@$(RM_RF) ~/Library/Developer/Xcode/Templates/Project\ Templates/Application/PhoneGap-based\ Application.xctemplate
	@read -p "Delete all files in ~/Documents/PhoneGapLib/?: " ; \
	if [ "$$REPLY" == "y" ]; then \
	$(RM_RF) ~/Documents/PhoneGapLib/ ; \
	else \
	echo "" ; \
	fi	
	@read -p "Delete the PhoneGap framework /Users/Shared/PhoneGap/Frameworks/PhoneGap.framework?: " ; \
	if [ "$$REPLY" == "y" ]; then \
	$(RM_RF) /Users/Shared/PhoneGap/Frameworks/PhoneGap.framework/ ; $(RM_RF) ~/Library/Frameworks/PhoneGap.framework ; \
	else \
	echo "" ; \
	fi	
