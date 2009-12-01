PhoneGap BlackBerry
=============================================================
Allows developers to create BlackBerry applications using HTML, 
CSS and JavaScript, and bridge into device functionality like 
geolocation, SMS, device information, accelerometer, etc. via
a JavaScript API.

Pre-requisites
-------------------------------------------------------------
Your best bet is to check the PhoneGap wiki for detailed
installation and setup instructions: 
http://phonegap.pbworks.com/Getting+Started+with+PhoneGap+(BlackBerry)

Create a PhoneGap project with Eclipse
-------------------------------------------------------------
1. Launch Eclipse, go to File->Import->Existing BlackBerry project.
2. Navigate over to where you cloned the git repo, and point it to the phonegap.jdp file located in blackberry/framework/.
3. Modify the contents of the "www" directory to add your own HTML, CSS and Javascript.
4. Before running, right-click on project root and make sure 'Activate for BlackBerry' is checked.
5. Run or debug from Eclipse as desired.
6. When you are satisfied with the application, make sure you sign it! (BlackBerry menu -> Request Signatures)
   This step needs to be done every time you change your source code. If you are running in simulator, you do not need
   to sign your binaries - it is only necessary for deployment to actual devices.
7. A few ways to deploy to device:
   a) Right-click on the project root in Eclipse and click on 'Generate ALX file.' You can then use this
      file in RIM's Desktop Manager software to load the binaries directly onto the device.
   b) Use the javaloader.exe program that comes with the JDE component packs to load directly onto device. Usage:
      javaloader -u load path/to/codfile.cod
	  The -u parameter specifies loading via USB.
   c) Over-the-air installation. Set up your application .jad, .jar and .cod files onto a web server. See RIM's documentation
      for more details or this succinct PDF for info: http://assets.handango.com/marketing/developerTeam/BlackBerryOTADeployment.pdf

Building PhoneGap BlackBerry Projects with Apache Ant
-------------------------------------------------------------
You'll need all the prerequisites listed by BB Ant Tools (http://bb-ant-tools.sourceforge.net/).
1. Once you have cloned the PhoneGap repository, put your HTML, CSS and JavaScript application files in the phonegap/blackberry/framework/src/www folder.
2. Edit the build.xml file in phonegap/blackberry/framework and set the paths at the top of the file, in the <property> elements, to match
   your environment setup.
3. Open up a command-line and, assuming you have Ant on your system PATH, cd over to phonegap/blackberry/framework directory.
4. Run 'ant' from the command-line. It'll default to the 'build' task, which will build your binaries. You can also explicitly specify other tasks to run:
   a) 'ant sign': 			Runs the 'build' task first, and then runs the signature tool on the compiled binary. Make sure to specify the 'password'
							property at the top of the build.xml file, otherwise the signature tool will fail!
   b) 'ant load-simulator': Runs the 'sign' task first, then copies the signed binaries over to the simulator directory you specified at the top of the
							build.xml. When you run the simulator, you should see your application under the BB Menu -> Downloads.
   c) 'ant load-device':	Runs the 'sign' task first, then executes the javaloader tool to load the signed binaries onto an attached (via USB) device.