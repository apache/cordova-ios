This README contains instructions how to get PhoneGap running on Maemo environment.

Restructured text (reST) format is used for rich-text formatting in this file.

.. contents ::

Introduction
------------

PhoneGap is a application development framework which 
enabled you to build cross-platform mobile applications using Javascript.

Maemo port is a project to bring Maemo (Nokia N900) platform support for PhoneGap. 

This insructions cover building and running PhoneGap on Maemo (Fremantle)
emulator only. The actual build and deployment for the target device is left
as an excercise for the reader. 

Maemo uses emulation and build environment called scrachbox.
Pay careful attentation whether you should execute commands under
your normal Linux user or inside scratchbox environment.

HTML documentation
------------------

HTML version of this document is available at `Twinapex blog <http://blog.twinapex.fi/phonegap-on-maemo/>`_.

Author
------

PhoneGap Maemo port was initiated by `Twinapex <http://www.twinapex.com>` 
as proof-of-concept and for client demostrations.

The work (PhoneGap for Maemo) is licensed under MIT license. See LICENSE.txt for more information.

For community support use PhoneGap Google Group.
For inquiries regarding development team and technology, contact `Twinapex team <mailto:info@twinapex.com>`.

List of contributors
====================

* Jussi Toivola (jtoivola)

* Mikko Ohtamaa (miohtama)


Prerequisitements
-----------------

You need one of the following operating systems:

- Linux (Debian/Ubuntu flavour preferred)

Installation instructions how to come to the light side can be `found here <http://www.ubuntu.com/>`_.

Setup scratchbox environment with

- `Maemo 5 <http://maemo.org/development/>`_

- `QT libs installed <http://wiki.maemo.org/Qt4Hildon#Fremantle>`_

Also install following extra packages under scratchbox environment::

	fakeroot apt-get install libqt4-phonon libqt4-opengl libqt4-opengl-dev libqt4-sql-sqlite 

Install git::

   sudo apt-get install git-core

Checkout phonegap, Maemo branch::

   cd /scratchbox/users/<you>/home/<you>/phonegap/maemo

   git clone git://github.com/jtoivola/phonegap.git

Build instructions
------------------

Assuming you have checked out the project to your Scratchbox home dir::

  /scratchbox/users/<you>/home/<you>/phonegap/maemo

Scratchbox shell can be started::

  /scratchbox/login

To build your *phonegap* application binary, run the following commands under scratchbox::

	qmake
	make

Run instructions
----------------

Setup Xephyr X server for the emulator before running.
For installation instructions and details consult Maemo documentation.

Under non-scratchbox shell::

	Xephyr :2 -host-cursor -screen 800x480x16 -dpi 96 -ac -kb

Set up X display under scratchbox shell::

	export DISPLAY=:2

Start PhoneGap under scratchbox using Maemo emulator bootstrap script::

	run-standalone.sh ./phonegap

You can stop application by sending CTRL+C keystroke to scratchbox shell.

Updating PhoneGap Javascript application
----------------------------------------

The project uses advanced software construction tool 
`Scons <http://www.scons.org/>`_ to manage PhoneGap application packaging.
Scons is Python based framework to create complex build recipes.

Application packaging has the following features 

* Compressing Javascript files

* Merging Javascript files

Please verify your Javascripts are syntatically correct
before merging them. Use tool like `jslint <http://www.jslint.com/>`_.

The phonegap javascript libraries are packaged with an SCons script.
Install scons outside Scratchbox::

	sudo apt-get install scons

Enter phonegap application directory in non-scratchbox shell (example user moo) ::

	cd /scratchbox/users/moo/home/moo/phonegap/maemo

Run::

	scons

This will create compressed app.js which contains all the application Javascript code packaged in
one file.

Now deploy application to the run-time target path::
  
	cp app.js www

Architecture
------------

QWebView (WebKit) Qt widget is used as the primary web rendering interface.
Note that this differs from Maemo Nokia Browser which is Gecko based.
Other PhoneGap platfoms use WebKit also, so this should ensure maximum compatibility.

Maemo Qt libraries are rich in functionality, including QWebView, so 
direct Javascript-to-C++ API calls and other goodies are possible.

index.html is bootstrapped by main.cpp in QWebView.

Resources
---------

* GitHub homepage: http://github.com/jtoivola/phonegap

* `Company homepage <http://www.twinapex.com>`_

* `Twinapex company blog <http://blog.twinapex.fi>`_ - please follow to get the latest news regarding this project

HTML generation
---------------

This documentcan be converted to HTML using `rst2wp by Matthias Friedrich <http://unmaintainable.wordpress.com/2008/03/22/using-rst-with-wordpress/>`_.

To convert this file to content HTML, these instructions can be run under non-scratchbox::

    wget http://users.musicbrainz.org/~matt/scripts/rst2wp
    sudo apt-get install python-docutils
    python rst2wp README.txt > README.html ; gedit README.html &
    
You can copy-paste the resulting HTML code to your favorite HTML WYSIWYG editor.

Known-issues
------------

2009-11-04
==========

* Lots of features missing.

* Initial Accelerometer code is there but it gives warnings.
