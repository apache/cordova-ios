#/bin/bash


git submodule init

cd PhoneGapLibTest/www
git remote update
git merge origin/master

cd -
git submodule update
