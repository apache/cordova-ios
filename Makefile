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
CERTIFICATE = 'PhoneGap Support'

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
	@$(RM_RF) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/xcuserdata
	@$(RM_RF) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/project.xcworkspace
	@$(RM_F) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/*.mode1v3
	@$(RM_F) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/*.perspectivev3
	@$(RM_F) PhoneGap-based\ Application/___PROJECTNAME___.xcodeproj/*.pbxuser
	@$(RM_F) PhoneGap-based\ Application/www/phonegap-*.js

clean-phonegap-framework:
	@$(RM_RF) PhoneGap.framework

clean-markdown:
	@$(RM_RF) PhoneGapInstaller/docs/readme.html

clean-installer:
	@$(RM_F) PhoneGapInstaller/docs/*.rtf
	@$(RM_F) PhoneGapInstaller/docs/*.pdf
	@$(RM_F) PhoneGapInstaller/docs/*.html

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

clean: clean-installer clean-phonegap-lib clean-xcode3-template clean-xcode4-template clean-phonegap-framework clean-markdown
	@if [ -e "$(PKG_ERROR_LOG)" ]; then \
		$(MV) $(PKG_ERROR_LOG) ~/.Trash; \
		$(RM_F) $(PKG_ERROR_LOG); \
	fi
	@$(RM_RF) $(BUILD_BAK)

checkos:
	@if [ "$$OSTYPE" != "darwin11" ]; then echo "Error: You need to package the installer on a Mac OS X 10.7 Lion system."; exit 1; fi
	
installer: clean markdown phonegap-lib xcode3-template xcode4-template phonegap-framework
	@# remove the dist folder
	@if [ -d "dist" ]; then \
		$(CP) -Rf dist ~/.Trash; \
		$(RM_RF) dist; \
	fi		
	@# backup markdown files for version replace
	@$(MV) -f PhoneGapInstaller/docs/releasenotes.md PhoneGapInstaller/docs/releasenotes.md.bak 
	@$(MV) -f PhoneGapInstaller/docs/finishup.md PhoneGapInstaller/docs/finishup.md.bak 
	@$(CAT) PhoneGapInstaller/docs/finishup.md.bak | sed 's/{VERSION}/${PGVER}/' > PhoneGapInstaller/docs/finishup.md
	@$(CAT) PhoneGapInstaller/docs/releasenotes.md.bak | sed 's/{VERSION}/${PGVER}/' > PhoneGapInstaller/docs/releasenotes.md
	@# generate releasenotes html from markdown
	@echo '<html><body style="font-family: Helvetica Neue;">' >	 PhoneGapInstaller/docs/releasenotes.html
	@perl Markdown_1.0.1/Markdown.pl PhoneGapInstaller/docs/releasenotes.md >> PhoneGapInstaller/docs/releasenotes.html
	@echo '</body></html>'  >> PhoneGapInstaller/docs/releasenotes.html
	@# generate finishup html from markdown
	@echo '<html><body style="font-family: Helvetica Neue;">' >	 PhoneGapInstaller/docs/finishup.html
	@perl Markdown_1.0.1/Markdown.pl PhoneGapInstaller/docs/finishup.md >> PhoneGapInstaller/docs/finishup.html
	@echo '</body></html>'  >> PhoneGapInstaller/docs/finishup.html
	@# convert all the html files to rtf
	@textutil -convert rtf -font 'Helvetica' PhoneGapInstaller/docs/*.html
	@# build the .pkg file
	@echo "Building PhoneGap-${PGVER}.pkg..."	
	@$(MKPATH) dist/files
	@$(PACKAGEMAKER) -d PhoneGapInstaller/PhoneGapInstaller.pmdoc -o dist/files/PhoneGap-${PGVER}.pkg > /dev/null 2> $(PKG_ERROR_LOG)
	@# create the applescript uninstaller
	@osacompile -o ./dist/files/Uninstall\ PhoneGap.app Uninstall\ PhoneGap.applescript > /dev/null 2>> $(PKG_ERROR_LOG)
	@# convert the html docs to rtf, concatenate
	@textutil -convert rtf  PhoneGapInstaller/docs/releasenotes.html -output dist/files/ReleaseNotes.rtf
	@textutil -convert rtf -font 'Courier New' LICENSE -output PhoneGapInstaller/docs/LICENSE.rtf
	@textutil -cat rtf PhoneGapInstaller/docs/finishup.rtf PhoneGapInstaller/docs/readme.rtf PhoneGapInstaller/docs/LICENSE.rtf -output dist/files/Readme.rtf
	@# restore backed-up markdown files
	@$(MV) -f PhoneGapInstaller/docs/releasenotes.md.bak PhoneGapInstaller/docs/releasenotes.md 
	@$(MV) -f PhoneGapInstaller/docs/finishup.md.bak PhoneGapInstaller/docs/finishup.md
	@# sign the .pkg : must be run under one line to get return code
	@-security find-certificate -c $(CERTIFICATE) > /dev/null 2>> $(PKG_ERROR_LOG); \
	if [ $$? -eq 0 ] ; then \
		$(PACKAGEMAKER) --certificate $(CERTIFICATE) --sign dist/files/PhoneGap-${PGVER}.pkg;  \
	fi
	@# create the .dmg	
	@hdiutil create ./dist/PhoneGap-${PGVER}.dmg -srcfolder ./dist/files/ -ov -volname PhoneGap-${PGVER}
	@cd dist;openssl sha1 PhoneGap-${PGVER}.dmg > PhoneGap-${PGVER}.dmg.SHA1;cd -;
	@echo "Done."
	@make clean

install: installer	
	@open dist/files/PhoneGap-${PGVER}.pkg

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

markdown:
	@# download markdown if necessary
	@if [[ ! -d "Markdown_1.0.1" ]]; then \
		echo "Downloading Markdown 1.0.1..."; \
		curl -L http://daringfireball.net/projects/downloads/Markdown_1.0.1.zip > Markdown_1.0.1.zip; \
		unzip Markdown_1.0.1.zip -d . > /dev/null; \
	fi
	@# generate readme html from markdown
	@echo '<html><body style="font-family: Helvetica Neue;">' >	 PhoneGapInstaller/docs/readme.html
	@perl Markdown_1.0.1/Markdown.pl README.md >> PhoneGapInstaller/docs/readme.html
	@echo '</body></html>'  >> PhoneGapInstaller/docs/readme.html
