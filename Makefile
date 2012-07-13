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

##   You can set these environment variables: 
##         XC_APP (path to your Xcode.app)
##         PM_APP (path to your PackageMaker app)
##         PKG_ERROR_LOG (error log)
##         DEVELOPER (path to your Developer folder)
##              - don't need to set this if  you use 'xcode-select'
##              - in Xcode 4.3, this is within your app bundle: Xcode.app/Contents/Developer

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
DEVELOPER ?= '$(shell xcode-select -print-path)'
PM_APP ?= '$(shell mdfind "kMDItemFSName=='PackageMaker.app' && kMDItemKind=='Application'" | head -1)'
XC_APP ?= '$(shell mdfind "kMDItemFSName=='Xcode.app' && kMDItemKind=='Application'" | head -1)'
PACKAGEMAKER = '$(PM_APP)/Contents/MacOS/PackageMaker'
XC = $(DEVELOPER)/usr/bin/xcodebuild
CDV_VER = $(shell head -1 CordovaLib/VERSION)
GIT = $(shell which git)
COMMIT_HASH=$(shell git describe --tags)	
PKG_ERROR_LOG ?= pkg_error_log
BUILD_BAK=_build.bak
CERTIFICATE = 'Cordova Support'
WKHTMLTOPDF = wkhtmltopdf/wkhtmltopdf --dpi 300 --encoding utf-8 --page-size Letter --footer-font-name "Helvetica" --footer-font-size 10 --footer-spacing 10 --footer-right "[page]/[topage]" -B 1in -L 0.5in -R 0.5in -T 0.5in
MARKDOWN = markdown

all :: installer

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
	@$(RM_F) CordovaLib/javascript/cordova-*.js

clean: clean-installer clean-markdown
	@if [ -e "$(PKG_ERROR_LOG)" ]; then \
		$(MV) $(PKG_ERROR_LOG) ~/.Trash; \
		$(RM_F) $(PKG_ERROR_LOG); \
	fi
	@$(RM_RF) $(BUILD_BAK)

check-os:
	@if [ "$$OSTYPE" != "darwin11" ]; then echo "Error: You need to package the installer on a Mac OS X 10.7 Lion system."; exit 1; fi

check-utils:
		@if [[ ! -e $(XC_APP) ]]; then \
			echo -e '\033[31mError: Xcode.app at "$(XC_APP)" was not found. Please download from the Mac App Store.\033[m'; exit 1;  \
		fi
		@if [[ ! -d $(DEVELOPER) ]]; then \
			echo -e '\033[31mError: The Xcode folder at "$(DEVELOPER)" was not found. Please set it to the proper one using xcode-select. For Xcode >= 4.3.1, set it using "sudo xcode-select -switch /Applications/Xcode.app/Contents/Developer".\033[m'; exit 1;  \
		fi
		@if [[ ! -e $(PM_APP) ]]; then \
			echo -e '\033[31mError: PackageMaker.app was not found. You need to download the Xcode Auxiliary Tools: https://developer.apple.com/downloads/index.action?name=auxiliary\033[m'; exit 1; \
		fi
		@echo -e "Xcode.app: \t\t\033[33m$(XC_APP)\033[m";
		@echo -e "Using Developer folder: \033[33m$(DEVELOPER)\033[m";
		@echo -e "Using PackageMaker app: \033[33m$(PM_APP)\033[m";

installer: check-utils clean check-wkhtmltopdf md-to-html
	@# remove the dist folder
	@if [ -d "dist" ]; then \
		$(CP) -Rf dist ~/.Trash; \
		$(RM_RF) dist; \
	fi		
	@# backup markdown files for version replace
	@$(MV) -f RELEASENOTES.md RELEASENOTES.md.bak 
	@$(MV) -f CordovaInstaller/docs/finishup.md CordovaInstaller/docs/finishup.md.bak 
	@$(CAT) CordovaInstaller/docs/finishup.md.bak | sed 's/{VERSION}/${CDV_VER}/' > CordovaInstaller/docs/finishup.md
	@$(CAT) RELEASENOTES.md.bak | sed 's/{VERSION}/${CDV_VER}/' > CordovaInstaller/docs/RELEASENOTES.md
	@# generate releasenotes html from markdown
	@echo '<html><body style="font-family: Helvetica Neue;">' >	 CordovaInstaller/docs/releasenotes.html
	@$(MARKDOWN) CordovaInstaller/docs/RELEASENOTES.md >> CordovaInstaller/docs/releasenotes.html
	@echo '</body></html>'  >> CordovaInstaller/docs/releasenotes.html
	@# generate finishup html from markdown
	@echo '<html><body style="font-family: Helvetica Neue;">' >	 CordovaInstaller/docs/finishup.html
	@$(MARKDOWN) CordovaInstaller/docs/finishup.md >> CordovaInstaller/docs/finishup.html
	@echo '</body></html>'  >> CordovaInstaller/docs/finishup.html
	@# convert all the html files to rtf (for PackageMaker)
	@textutil -convert rtf -font 'Helvetica' CordovaInstaller/docs/*.html
	@# build the .pkg file
	@echo -n "Building Cordova-${CDV_VER}.pkg..."	
	@$(MKPATH) dist/files/Guides
	@'$(PACKAGEMAKER)' -d CordovaInstaller/CordovaInstaller.pmdoc -o dist/files/Cordova-${CDV_VER}.pkg > /dev/null 2> $(PKG_ERROR_LOG)
	@# create the applescript uninstaller
	@osacompile -o ./dist/files/Uninstall\ Cordova.app Uninstall\ Cordova.applescript > /dev/null 2>> $(PKG_ERROR_LOG)
	@# convert the html docs to pdf, concatenate readme and license
	@$(WKHTMLTOPDF) --footer-center "Cordova ${CDV_VER} Release Notes" CordovaInstaller/docs/releasenotes.html dist/files/ReleaseNotes.pdf > /dev/null 2>> $(PKG_ERROR_LOG)
	@$(WKHTMLTOPDF) --footer-center "Cordova ${CDV_VER} Plugin Upgrade Guide" CordovaInstaller/docs/plugin_upgrade.html 'dist/files/Guides/Cordova Plugin Upgrade Guide.pdf' > /dev/null 2>> $(PKG_ERROR_LOG)
	@$(WKHTMLTOPDF) --footer-center "Cordova ${CDV_VER} Settings File" CordovaInstaller/docs/settings_file.html 'dist/files/Guides/Cordova Settings File.pdf' > /dev/null 2>> $(PKG_ERROR_LOG)
	@$(WKHTMLTOPDF) --footer-center "Cordova ${CDV_VER} JavaScript Exception Logging" CordovaInstaller/docs/exception_logging.html 'dist/files/Guides/Cordova JavaScript Exception Logging.pdf' > /dev/null 2>> $(PKG_ERROR_LOG)
	@$(WKHTMLTOPDF) --footer-center "Cordova ${CDV_VER} Custom URL Scheme Handling" CordovaInstaller/docs/custom_url_scheme.html 'dist/files/Guides/Cordova Custom URL Scheme Handling.pdf' > /dev/null 2>> $(PKG_ERROR_LOG)
	@textutil -convert html -font 'Courier New' LICENSE -output CordovaInstaller/docs/LICENSE.html > /dev/null 2>> $(PKG_ERROR_LOG)
	@textutil -cat html CordovaInstaller/docs/finishup.html CordovaInstaller/docs/readme.html CordovaInstaller/docs/LICENSE.html -output dist/files/Readme.html > /dev/null 2>> $(PKG_ERROR_LOG)
	@$(WKHTMLTOPDF) --footer-center "Cordova ${CDV_VER} Readme" dist/files/Readme.html dist/files/Readme.pdf > /dev/null 2>> $(PKG_ERROR_LOG)
	@$(RM_F) dist/files/Readme.html
	@# restore backed-up markdown files
	@$(MV) -f RELEASENOTES.md.bak RELEASENOTES.md 
	@$(MV) -f CordovaInstaller/docs/finishup.md.bak CordovaInstaller/docs/finishup.md
	@# sign the .pkg : must be run under one line to get return code
	@-security find-certificate -c $(CERTIFICATE) > /dev/null 2>> $(PKG_ERROR_LOG); \
	if [ $$? -eq 0 ] ; then \
		'$(PACKAGEMAKER)' --certificate $(CERTIFICATE) --sign dist/files/Cordova-${CDV_VER}.pkg;  \
	fi
	@# create the .dmg	
	@hdiutil create ./dist/Cordova-${CDV_VER}_temp.dmg -srcfolder ./dist/files/ -ov -volname Cordova-${CDV_VER} -format UDRW > /dev/null 2>> $(PKG_ERROR_LOG)
	@# set the volume icon
	@hdiutil attach -readwrite -noverify -noautoopen ./dist/Cordova-${CDV_VER}_temp.dmg > /dev/null 2>> $(PKG_ERROR_LOG)
	@cp "bin/templates/project/__TESTING__.xcodeproj/TemplateIcon.icns" /Volumes/Cordova-${CDV_VER}/.VolumeIcon.icns
	@SetFile -c icnC /Volumes/Cordova-${CDV_VER}/.VolumeIcon.icns > /dev/null 2>> $(PKG_ERROR_LOG)
	@SetFile -a C /Volumes/Cordova-${CDV_VER}/ > /dev/null 2>> $(PKG_ERROR_LOG)
	@hdiutil detach /Volumes/Cordova-${CDV_VER}/ > /dev/null 2>> $(PKG_ERROR_LOG)
	@# compress dmg
	@hdiutil convert ./dist/Cordova-${CDV_VER}_temp.dmg -format UDZO -imagekey zlib-level=9 -o ./dist/Cordova-${CDV_VER}.dmg > /dev/null 2>> $(PKG_ERROR_LOG)
	@$(RM_F) ./dist/Cordova-${CDV_VER}_temp.dmg
	@# generate sha1
	@openssl sha1 dist/Cordova-${CDV_VER}.dmg > dist/Cordova-${CDV_VER}.dmg.SHA1;
	@# done
	@echo -e "\t\033[32mok.\033[m"
	@echo -e "Build products are in: \033[33m$(PWD)/dist\033[m";
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

check-brew:
	@if [[ ! -e `which brew` ]]; then \
		echo -e '\033[31mError: brew was not found, or not on your path. To install brew, follow the instructions here: https://github.com/mxcl/homebrew/wiki/installation or "make install-brew"\033[m'; exit 1; \
	fi

install-brew:
	@/usr/bin/curl -fsSL https://raw.github.com/mxcl/homebrew/master/Library/Contributions/install_homebrew.rb | /usr/bin/ruby
	@/usr/local/bin/brew update

install-wkhtmltopdf:
	@# download wkhtmltopdf if necessary
	@echo "Downloading http://wkhtmltopdf.googlecode.com/files/wkhtmltopdf-0.9.9-OS-X.i368..."; 
	@curl -L http://wkhtmltopdf.googlecode.com/files/wkhtmltopdf-0.9.9-OS-X.i368 > wkhtmltopdf_temp;
	@$(MKPATH) wkhtmltopdf;
	@mv wkhtmltopdf_temp wkhtmltopdf/wkhtmltopdf;
	@chmod 755 wkhtmltopdf/wkhtmltopdf;
	@echo "wkhtmltopdf v0.9.9 downloaded."

check-wkhtmltopdf:
	@if [[  ! -d "wkhtmltopdf" ]]; then \
		echo -e '\033[31mError: wkhtmltopdf was not found, or not on your path. To install wkhtmltopdf, download and install v0.9.9 by running the command "make install-wkhtmltopdf"\033[m'; exit 1;\
	fi

check-markdown: check-brew
	@if [[ ! -e `which markdown` ]]; then \
		echo -e '\033[31mError: markdown was not found, or not on your path. To install markdown, Install it from homebrew: "brew install markdown" or "make install-markdown"\033[m'; exit 1; \
	fi

install-markdown: check-brew
	@brew install markdown

md-to-html: check-markdown
	@# generate readme html from markdown
	@echo '<html><body style="font-family: Helvetica Neue; font-size:10pt;">' >	 CordovaInstaller/docs/readme.html
	@$(MARKDOWN) README.md >> CordovaInstaller/docs/readme.html
	@echo '</body></html>'  >> CordovaInstaller/docs/readme.html
	@# generate 'Cordova Plugin Upgrade Guide' html from markdown
	@echo '<html><body style="font-family: Helvetica Neue;font-size:10pt;">' >	 CordovaInstaller/docs/plugin_upgrade.html
	@$(MARKDOWN) 'guides/Cordova Plugin Upgrade Guide.md' >> CordovaInstaller/docs/plugin_upgrade.html
	@echo '</body></html>'  >> CordovaInstaller/docs/plugin_upgrade.html
	@# generate 'Cordova Settings File' html from markdown
	@echo '<html><body style="font-family: Helvetica Neue;font-size:10pt;">' >	 CordovaInstaller/docs/settings_file.html
	@$(MARKDOWN) 'guides/Cordova Settings File.md' >> CordovaInstaller/docs/settings_file.html
	@echo '</body></html>'  >> CordovaInstaller/docs/settings_file.html
	@# generate 'Cordova JavaScript Exception Logging' html from markdown
	@echo '<html><body style="font-family: Helvetica Neue;font-size:10pt;">' >	 CordovaInstaller/docs/exception_logging.html
	@$(MARKDOWN) 'guides/Cordova JavaScript Exception Logging.md' >> CordovaInstaller/docs/exception_logging.html
	@echo '</body></html>'  >> CordovaInstaller/docs/exception_logging.html
	@# generate 'Cordova Custom URL Scheme Handling' html from markdown
	@echo '<html><body style="font-family: Helvetica Neue;font-size:10pt;">' >	 CordovaInstaller/docs/custom_url_scheme.html
	@$(MARKDOWN) 'guides/Cordova Custom URL Scheme Handling.md' >> CordovaInstaller/docs/custom_url_scheme.html
	@echo '</body></html>'  >> CordovaInstaller/docs/custom_url_scheme.html
