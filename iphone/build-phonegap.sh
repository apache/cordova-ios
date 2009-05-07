#!/bin/sh
set -x
PHONEGAP_LIB=$TARGET_BUILD_DIR/$CONTENTS_FOLDER_PATH/www/phonegap.js
[ -f $PHONEGAP_LIB ] && exit 0

cd $PROJECT_DIR/..
[ -f Makefile ] || ./configure
make iphone
cp lib/iphone/phonegap-min.js $PHONEGAP_LIB
