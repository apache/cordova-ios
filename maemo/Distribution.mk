#
# Build target .deb for Maemo
#
# See also: http://madabar.com/techblog/2007/07/15/manually-creating-a-deb-package-for-maemo/
#
#
#
# ARMEL binary name we are going to distribute
# This must also match one compiled into main.cpp
BINARY=phonegapdemo
PACKAGE = phonegapdemo

# Binary name after compilation
COMPILED_BINARY=phonegap

VERSION=1.0.0

VERSION = 1.0.0
ARCH = i386
# Set to armel to build on the target
#ARCH = armel
SECTION = user/other
PRIORITY = optional
MAINTAINER = Mikko Ohtamaa <mikko.ohtamaa@twinapex.com>
# todo: For python2.4 it also needs python2.4-elementtree and python2.4-sqlite
DEPENDS = libqt4-phonon,libqt4-sql-sqlite 

# Which file contains .deb description
DESCRIPTION=${BINARY}.txt

# PyPackager target
DISTRIBUTION_FOLDER=distribution/data
# Must be absolute
PACKAGE_DIR = /scratchbox/users/moo/home/moo/phonegap/maemo/distribution
DISTRIBUTION_GZ=${BINARY}-${VERSION}.tar.gz
FULLNAME=Mikko Ohtamaa
EMAIL=mikko.ohtamaa@twinapex.com
MAINTAINER=${FULLNAME} <${EMAIL}>

# Where to build .deb package
SOURCE_DIR = ${DISTRIBUTION_FOLDER}

# Which icon use for .deb
ICON_SOURCE = ${DISTRIBUTION_FOLDER}/usr/share/icons/hicolor/26x26/hildon/${BINARY}.png

all: clean dist deb

# Create/update distribution structure
${PACKAGE_DIR}/data: 
	install -d ${DISTRIBUTION_FOLDER}
	install -d ${DISTRIBUTION_FOLDER}/usr/bin
	install -d ${DISTRIBUTION_FOLDER}/usr/share/applications/hildon
	install -d ${DISTRIBUTION_FOLDER}/usr/share/icons/hicolor/26x26/hildon
	install -d ${DISTRIBUTION_FOLDER}/usr/share/icons/hicolor/scalable/hildon
	install -d ${DISTRIBUTION_FOLDER}/usr/share/icons/pixmaps
	install -d ${DISTRIBUTION_FOLDER}/usr/share/${BINARY}
	
	cp ${BINARY}.desktop ${DISTRIBUTION_FOLDER}/usr/share/applications/hildon

	# Create icons
	cp ${BINARY}_26x26.png ${DISTRIBUTION_FOLDER}/usr/share/icons/hicolor/26x26/hildon/${BINARY}.png
	cp ${BINARY}_48x48.png ${DISTRIBUTION_FOLDER}/usr/share/icons/hicolor/scalable/hildon/${BINARY}.png
	cp ${BINARY}_48x48.png ${DISTRIBUTION_FOLDER}/usr/share/icons/pixmaps/${BINARY}.png

	cp -r www ${DISTRIBUTION_FOLDER}/usr/share/${BINARY}/www

	cp ${COMPILED_BINARY} ${DISTRIBUTION_FOLDER}/usr/bin/${BINARY}
	chmod 0755 ${DISTRIBUTION_FOLDER}/usr/bin/${BINARY}

dist: ${PACKAGE_DIR}/data

clean:
	rm -rf ${PACKAGE_DIR}

# Upload package to the test server from where you can dpkg -i it in the device
upload:
	

include deb_hand.mak  

