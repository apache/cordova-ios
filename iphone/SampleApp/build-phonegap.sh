#!/bin/sh
set -x
PHONEGAP_LIB="$TARGET_BUILD_DIR/$CONTENTS_FOLDER_PATH/www/phonegap.js"

cd "$PROJECT_DIR/.."
[ -f Makefile ] || ./configure
make iphone
cp lib/iphone/phonegap-min.js "$PHONEGAP_LIB"
