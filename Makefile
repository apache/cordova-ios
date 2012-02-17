#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#

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
CDV_VER = $(shell head -1 CordovaLib/VERSION)
GIT = $(shell which git)
COMMIT_HASH=$(shell git describe --tags)	
PKG_ERROR_LOG=pkg_error_log
BUILD_BAK=_build.bak
CERTIFICATE = 'Cordova Support'

all :: installer

cordova-lib: clean-cordova-lib
	@echo "Packaging Cordova Javascript..."
	@$(MKPATH) $(BUILD_BAK)
	@$(CP) -f CordovaLib/VERSION $(BUILD_BAK)
	@$(MAKE) -C CordovaLib > /dev/null
	@if [ -e "$(GIT)" ]; then \
		echo -e '\n$(COMMIT_HASH)' >> CordovaLib/VERSION; \
	fi	
	@echo "Done."

xcode3-template: clean-xcode3-template
	@$(MKPATH) $(BUILD_BAK)
	@$(CP) -Rf Cordova-based\ Application/www $(BUILD_BAK)
	@cd Cordova-based\ Application/www; find . | xargs grep 'src[ 	]*=[ 	]*[\\'\"]cordova-*.*.js[\\'\"]' -sl | xargs -L1 sed -i "" "s/src[ 	]*=[ 	]*[\\'\"]cordova-*.*.js[\\'\"]/src=\"cordova-${CDV_VER}.js\"/g"
	@cd ..
	@cp CordovaLib/javascripts/cordova-*.js Cordova-based\ Application/www

xcode4-template: clean-xcode4-template
	@$(CP) Cordova-based\ Application/___PROJECTNAME___.xcodeproj/TemplateIcon.icns Cordova-based\ Application.xctemplate
	@$(CP) -R Cordova-based\ Application/Classes Cordova-based\ Application.xctemplate
	@$(CP) -R Cordova-based\ Application/Plugins Cordova-based\ Application.xctemplate
	@$(CP) -R Cordova-based\ Application/Resources Cordova-based\ Application.xctemplate
	@$(CP) Cordova-based\ Application/___PROJECTNAMEASIDENTIFIER___-Info.plist Cordova-based\ Application.xctemplate/___PACKAGENAME___-Info.plist
	@$(CP) Cordova-based\ Application/___PROJECTNAMEASIDENTIFIER___-Prefix.pch Cordova-based\ Application.xctemplate/___PACKAGENAME___-Prefix.pch
	@$(CP) Cordova-based\ Application/main.m Cordova-based\ Application.xctemplate
	@$(CP) Cordova-based\ Application/Cordova.plist Cordova-based\ Application.xctemplate
	@sed -i "" 's/com\.yourcompany\.___PROJECTNAMEASIDENTIFIER___/___VARIABLE_bundleIdentifierPrefix:bundleIdentifier___\.___PROJECTNAMEASIDENTIFIER___/g' Cordova-based\ Application.xctemplate/___PACKAGENAME___-Info.plist

clean-xcode4-template: clean-xcode3-template
	@$(RM_RF) _tmp
	@$(MKPATH) _tmp
	@$(CP) Cordova-based\ Application.xctemplate/TemplateInfo.plist _tmp
	@$(CP) Cordova-based\ Application.xctemplate/README _tmp
	@$(CP) -Rf Cordova-based\ Application.xctemplate ~/.Trash
	@$(RM_RF) Cordova-based\ Application.xctemplate
	@$(MV) _tmp Cordova-based\ Application.xctemplate 

clean-xcode3-template:
	@if [ -d "$(BUILD_BAK)/www" ]; then \
		$(CP) -Rf "Cordova-based Application/www" ~/.Trash; \
		$(RM_RF) "Cordova-based Application/www"; \
		$(MV) $(BUILD_BAK)/www/ "Cordova-based Application/www"; \
	fi	
	@$(RM_RF) Cordova-based\ Application/build/
	@$(RM_RF) Cordova-based\ Application/___PROJECTNAME___.xcodeproj/xcuserdata
	@$(RM_RF) Cordova-based\ Application/___PROJECTNAME___.xcodeproj/project.xcworkspace
	@$(RM_F) Cordova-based\ Application/___PROJECTNAME___.xcodeproj/*.mode1v3
	@$(RM_F) Cordova-based\ Application/___PROJECTNAME___.xcodeproj/*.perspectivev3
	@$(RM_F) Cordova-based\ Application/___PROJECTNAME___.xcodeproj/*.pbxuser
	@$(RM_F) Cordova-based\ Application/www/cordova-*.js

clean-cordova-framework:
	@$(RM_RF) Cordova.framework

clean-markdown:
	@$(RM_RF) CordovaInstaller/docs/readme.html
	@$(RM_RF) CordovaInstaller/docs/cleaver.html
	@$(RM_RF) CordovaInstaller/docs/upgrade.html

clean-installer:
	@$(RM_F) CordovaInstaller/docs/*.rtf
	@$(RM_F) CordovaInstaller/docs/*.pdf
	@$(RM_F) CordovaInstaller/docs/*.html

clean-cordova-lib:
	@if [ -e "$(BUILD_BAK)/VERSION" ]; then \
		$(CP) -Rf "CordovaLib/VERSION" ~/.Trash; \
		$(RM_RF) "CordovaLib/VERSION"; \
		$(MV) $(BUILD_BAK)/VERSION "CordovaLib/VERSION"; \
	fi	
	@$(RM_RF) CordovaLib/build/
	@$(RM_F) CordovaLib/CordovaLib.xcodeproj/*.mode1v3
	@$(RM_F) CordovaLib/CordovaLib.xcodeproj/*.perspectivev3
	@$(RM_F) CordovaLib/CordovaLib.xcodeproj/*.pbxuser
	@$(RM_F) CordovaLib/javascripts/cordova-*.js

cordova-framework: cordova-lib clean-cordova-framework
	@echo "Building Cordova.framework..."
	@cd CordovaLib;$(XC) -target UniversalFramework > /dev/null;
	@cd ..
	@echo "Done."
	@$(CP) -R CordovaLib/build/Release-universal/Cordova.framework .
	@$(CP) -R Cordova-based\ Application/www/index.html Cordova.framework/www
	@find "Cordova.framework/www" | xargs grep 'src[ 	]*=[ 	]*[\\'\"]cordova-*.*.js[\\'\"]' -sl | xargs -L1 sed -i "" "s/src[ 	]*=[ 	]*[\\'\"]cordova-*.*.js[\\'\"]/src=\"cordova-${CDV_VER}.js\"/g"
	@if [ -e "$(GIT)" ]; then \
	echo -e '\n$(COMMIT_HASH)' >> Cordova.framework/VERSION; \
	fi	
	@$(CP) -R Cordova-based\ Application/Resources/Capture.bundle/ Cordova.framework/Capture.bundle

clean: clean-installer clean-cordova-lib clean-xcode3-template clean-xcode4-template clean-cordova-framework clean-markdown
	@if [ -e "$(PKG_ERROR_LOG)" ]; then \
		$(MV) $(PKG_ERROR_LOG) ~/.Trash; \
		$(RM_F) $(PKG_ERROR_LOG); \
	fi
	@$(RM_RF) $(BUILD_BAK)

checkos:
	@if [ "$$OSTYPE" != "darwin11" ]; then echo "Error: You need to package the installer on a Mac OS X 10.7 Lion system."; exit 1; fi

installer: clean markdown cordova-lib xcode3-template xcode4-template cordova-framework
	@# remove the dist folder
	@if [ -d "dist" ]; then \
		$(CP) -Rf dist ~/.Trash; \
		$(RM_RF) dist; \
	fi		
	@# backup markdown files for version replace
	@$(MV) -f CordovaInstaller/docs/releasenotes.md CordovaInstaller/docs/releasenotes.md.bak 
	@$(MV) -f CordovaInstaller/docs/finishup.md CordovaInstaller/docs/finishup.md.bak 
	@$(CAT) CordovaInstaller/docs/finishup.md.bak | sed 's/{VERSION}/${CDV_VER}/' > CordovaInstaller/docs/finishup.md
	@$(CAT) CordovaInstaller/docs/releasenotes.md.bak | sed 's/{VERSION}/${CDV_VER}/' > CordovaInstaller/docs/releasenotes.md
	@# generate releasenotes html from markdown
	@echo '<html><body style="font-family: Helvetica Neue;">' >	 CordovaInstaller/docs/releasenotes.html
	@perl Markdown_1.0.1/Markdown.pl CordovaInstaller/docs/releasenotes.md >> CordovaInstaller/docs/releasenotes.html
	@echo '</body></html>'  >> CordovaInstaller/docs/releasenotes.html
	@# generate finishup html from markdown
	@echo '<html><body style="font-family: Helvetica Neue;">' >	 CordovaInstaller/docs/finishup.html
	@perl Markdown_1.0.1/Markdown.pl CordovaInstaller/docs/finishup.md >> CordovaInstaller/docs/finishup.html
	@echo '</body></html>'  >> CordovaInstaller/docs/finishup.html
	@# convert all the html files to rtf
	@textutil -convert rtf -font 'Helvetica' CordovaInstaller/docs/*.html
	@# build the .pkg file
	@echo "Building Cordova-${CDV_VER}.pkg..."	
	@$(MKPATH) dist/files
	@$(PACKAGEMAKER) -d CordovaInstaller/CordovaInstaller.pmdoc -o dist/files/Cordova-${CDV_VER}.pkg > /dev/null 2> $(PKG_ERROR_LOG)
	@# create the applescript uninstaller
	@osacompile -o ./dist/files/Uninstall\ Cordova.app Uninstall\ Cordova.applescript > /dev/null 2>> $(PKG_ERROR_LOG)
	@# convert the html docs to rtf, concatenate
	@textutil -convert rtf  CordovaInstaller/docs/releasenotes.html -output dist/files/ReleaseNotes.rtf
	@textutil -convert rtf -font 'Courier New' LICENSE -output CordovaInstaller/docs/LICENSE.rtf
	@$(CONVERTPDF) -f CordovaInstaller/docs/cleaver.html -o 'dist/files/How to Use Cordova as a Component.pdf'
	@$(CONVERTPDF) -f CordovaInstaller/docs/upgrade.html -o 'dist/files/Cordova Upgrade Guide.pdf'
	@textutil -cat rtf CordovaInstaller/docs/finishup.rtf CordovaInstaller/docs/readme.rtf CordovaInstaller/docs/LICENSE.rtf -output dist/files/Readme.rtf
	@# restore backed-up markdown files
	@$(MV) -f CordovaInstaller/docs/releasenotes.md.bak CordovaInstaller/docs/releasenotes.md 
	@$(MV) -f CordovaInstaller/docs/finishup.md.bak CordovaInstaller/docs/finishup.md
	@# sign the .pkg : must be run under one line to get return code
	@-security find-certificate -c $(CERTIFICATE) > /dev/null 2>> $(PKG_ERROR_LOG); \
	if [ $$? -eq 0 ] ; then \
		$(PACKAGEMAKER) --certificate $(CERTIFICATE) --sign dist/files/Cordova-${CDV_VER}.pkg;  \
	fi
	@# create the .dmg	
	@hdiutil create ./dist/Cordova-${CDV_VER}.dmg -srcfolder ./dist/files/ -ov -volname Cordova-${CDV_VER}
	@cd dist;openssl sha1 Cordova-${CDV_VER}.dmg > Cordova-${CDV_VER}.dmg.SHA1;cd -;
	@echo "Done."
	@make clean

install: installer	
	@open dist/files/Cordova-${CDV_VER}.pkg

uninstall:
	@$(RM_RF) ~/Library/Application\ Support/Developer/Shared/Xcode/Project\ Templates/Cordova
	@$(RM_RF) ~/Library/Developer/Xcode/Templates/Project\ Templates/Application/Cordova-based\ Application.xctemplate
	@read -p "Delete all files in ~/Documents/CordovaLib/?: " ; \
	if [ "$$REPLY" == "y" ]; then \
	$(RM_RF) ~/Documents/CordovaLib/ ; \
	else \
	echo "" ; \
	fi	
	@read -p "Delete the Cordova framework /Users/Shared/Cordova/Frameworks/Cordova.framework?: " ; \
	if [ "$$REPLY" == "y" ]; then \
	$(RM_RF) /Users/Shared/Cordova/Frameworks/Cordova.framework/ ; $(RM_RF) ~/Library/Frameworks/Cordova.framework ; \
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
	@echo '<html><body style="font-family: Helvetica Neue; font-size:10pt;">' >	 CordovaInstaller/docs/readme.html
	@perl Markdown_1.0.1/Markdown.pl README.md >> CordovaInstaller/docs/readme.html
	@echo '</body></html>'  >> CordovaInstaller/docs/readme.html
	@# generate 'How to Use Cordova as a Component' html from markdown
	@echo '<html><body style="font-family: Helvetica Neue; font-size:10pt;">' >	 CordovaInstaller/docs/cleaver.html
	@perl Markdown_1.0.1/Markdown.pl 'How to Use Cordova as a Component.md' >> CordovaInstaller/docs/cleaver.html
	@echo '</body></html>'  >> CordovaInstaller/docs/cleaver.html
	@# generate 'Cordova Upgrade Guide' html from markdown
	@echo '<html><body style="font-family: Helvetica Neue;font-size:10pt;">' >	 CordovaInstaller/docs/upgrade.html
	@perl Markdown_1.0.1/Markdown.pl 'Cordova Upgrade Guide.md' >> CordovaInstaller/docs/upgrade.html
	@echo '</body></html>'  >> CordovaInstaller/docs/upgrade.html
