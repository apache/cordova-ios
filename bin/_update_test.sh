#/bin/bash


git submodule init

cd PhoneGapLibTest/www
git remote update
git pull origin master

cd -
git submodule update
