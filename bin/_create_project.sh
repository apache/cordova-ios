#!/bin/bash

# ############################################################################
# 
# MIT licensed 
#	http://www.opensource.org/licenses/mit-license.php
#
# Script to create a new PhoneGap project from the PhoneGap Template.
# 	You need to install PhoneGapLib first (through the installer) 
#	before this script can work.
#
# Make sure you set the executable bit on this script. In Terminal.app, type:
# 	chmod 755 create_project.sh 
#
# Usage:
#  ./create_project.sh <PROJECT_NAME> <PATH_TO_PUT_NEW_PROJECT>
#		<PROJECT_NAME> - the name of the project (cannot have spaces in it)
#		<PATH_TO_PUT_NEW_PROJECT> - the path to put the new project folder in
#
# 	Written by Shazron Abdullah (2011)
#
# ############################################################################

set -o pipefail

function checkExitCode {
	rc=$?
    if [ $rc != 0 ] ; then
		echo "Error $rc, exiting."
		cleanUp
		exit $rc
	fi
}

function cleanUp {
	echo 'Cleaning up...'
	cd -
	rm -rf $TEMP_PROJECT_DIR_PATH
}

PHONEGAP_TEMPLATE_PATH="$HOME/Library/Application Support/Developer/Shared/Xcode/Project Templates/PhoneGap/PhoneGap-based Application/"

# ##############################################
# SCRIPT ARGUMENTS
# ##############################################

# 1st argument: name of the project
PROJECT_NAME=$1

# 2nd argument: path to put new project
NEW_PROJECT_PATH=$2

# ##############################################
# CHECKS
# ##############################################

if [ ! -d "$PHONEGAP_TEMPLATE_PATH" ]; then
	read -p "PhoneGapLib is not installed. Download the iOS PhoneGap installer from http://phonegap.com. Go there now (y/n)? "
	[ "$REPLY" == "y" ] && open http://www.phonegap.com/download/
	exit 1
fi

if [ ! -d "$NEW_PROJECT_PATH" ]; then
    echo "The target folder '$NEW_PROJECT_PATH' does not exist."
	exit 1
fi

NEW_PROJECT_PATH=`cd $NEW_PROJECT_PATH; pwd`

# ##############################################
# TEMPORARY WORKING DIRECTORY
# ##############################################

# create temporary working directory
TEMP_PROJECT_DIR_PATH=`mktemp -d -t 'phonegap'`
trap "{ cd - ; rm -rf $TEMP_PROJECT_DIR_PATH; exit 255; }" SIGINT
cd $TEMP_PROJECT_DIR_PATH

# ##############################################
# TEMPLATE COPY, FIND/REPLACE
# ##############################################

# copy PHONEGAP_TEMPLATE_PATH into TEMP_PROJECT_DIR_PATH
cp -r "$PHONEGAP_TEMPLATE_PATH" "$TEMP_PROJECT_DIR_PATH"

checkExitCode

# replace file contents of ___PROJECTNAME___ token
find "$TEMP_PROJECT_DIR_PATH" | xargs grep '___PROJECTNAME___' -sl | xargs -L1 sed -i "" "s/___PROJECTNAME___/${PROJECT_NAME}/g"

checkExitCode

# replace file contents of ___PROJECTNAMEASIDENTIFIER___ token
find "$TEMP_PROJECT_DIR_PATH" | xargs grep '___PROJECTNAMEASIDENTIFIER___' -sl | xargs -L1 sed -i "" "s/___PROJECTNAMEASIDENTIFIER___/${PROJECT_NAME}/g"

checkExitCode

# replace filenames that have ___PROJECTNAME___ token
cd "$TEMP_PROJECT_DIR_PATH";find . -d -name "*___PROJECTNAME___*" | awk '{print("mv "$1 " " $1)}' | sed "s/\(.*\)___PROJECTNAME___/\1${PROJECT_NAME}/g" | sh;

checkExitCode

# replace filenames that have ___PROJECTNAMEASIDENTIFIER___ token
cd "$TEMP_PROJECT_DIR_PATH";find . -d -name "*___PROJECTNAMEASIDENTIFIER___*" | awk '{print("mv "$1" "$1)}' | sed "s/\(.*\)___PROJECTNAMEASIDENTIFIER___/\1${PROJECT_NAME}/g" | sh;

checkExitCode

# copy PHONEGAP_TEMPLATE_PATH into NEW_PROJECT_PATH
mkdir -p "$NEW_PROJECT_PATH/$PROJECT_NAME"
cp -r "$TEMP_PROJECT_DIR_PATH/" "$NEW_PROJECT_PATH/$PROJECT_NAME"

checkExitCode

exit 0
