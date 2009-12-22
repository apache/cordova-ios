#/bin/bash

cd ..
git submodule init

cd iphone
cd PhoneGapLibTest/www
git remote update
git merge origin/master

