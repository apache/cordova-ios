//#preprocess

package com.nitobi.phonegap;

import java.util.Enumeration;
import java.util.Vector;
import java.util.Hashtable;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;

import javax.microedition.pim.ContactList;
import javax.microedition.pim.PIM;
import javax.microedition.pim.PIMItem;
import javax.microedition.pim.Contact;
import javax.microedition.location.*;
import javax.microedition.io.*;
import javax.microedition.io.file.*;

import javax.wireless.messaging.MessageConnection;
import javax.wireless.messaging.TextMessage;

import net.rim.device.api.browser.field.*;
import net.rim.device.api.io.http.HttpHeaders;
import net.rim.device.api.system.Application;
import net.rim.device.api.ui.Field;
import net.rim.device.api.ui.UiApplication;
import net.rim.device.api.ui.component.*;
import net.rim.device.api.ui.container.MainScreen;
import net.rim.device.api.system.*;

import net.rim.device.api.system.Alert;
import net.rim.blackberry.api.invoke.*;

import org.json.me.*;

/**
 */

public class PhoneGap extends UiApplication implements RenderingApplication {
    
    //constants ----------------------------------------------------------------
    private static final int GRADE_INTERVAL=5; //seconds - represents the number of updates over which alt is calculated
    private static final long ID = 0x5d459971bb15ae7aL;
    private static final int CAPTURE_INTERVAL=5;  //we record a location every 5 seconds
    private static final int SENDING_INTERVAL=30; // the interval in seconds after which the information is sent to the server
    private static final String REFERER = "referer";

    private BrowserContentManager _browserContentManager;

    private MainScreen _mainScreen;

    // The URL of the PhoneGap application
    private String _url = "http://10.0.1.3/phonegap/test.html";
    
    // All the lat / lng stuff
    private LocationProvider _locationProvider;
    private int _interval = 10;
    private double _lat = 0;
    private double _lng = 0;
    
    // This hashtable holds the file data until the cookie is retrieved
    private Hashtable _fileContents = new Hashtable();

    // This flag gets set once a good location has been found and the lat and lng 
    // values have been set
    private boolean _locationReady = false;
    // This flag gets set when a setCookie event is fired and the cookie value 
    // specifies a lat / lng request. If true during a getHTTPCookie call the 
    // last valid lat / lng is returned
    private boolean _getLocation = false;

    private Hashtable cookies = new Hashtable();
    
    private HttpConnection  _currentConnection;       
    
    /***************************************************************************
     * Main.
     **************************************************************************/
    public static void main(String[] args) {
        PhoneGap app = new PhoneGap();
        app.enterEventDispatcher();
    }
    
    /**
     * Constructor.
     */
     private PhoneGap() {

        _browserContentManager = new BrowserContentManager( 0 );
        RenderingOptions renderingOptions = _browserContentManager.getRenderingSession().getRenderingOptions();

        renderingOptions.setProperty(RenderingOptions.CORE_OPTIONS_GUID, RenderingOptions.JAVASCRIPT_ENABLED, true);
        renderingOptions.setProperty(RenderingOptions.CORE_OPTIONS_GUID, RenderingOptions.JAVASCRIPT_LOCATION_ENABLED, true);
        
        _mainScreen = new MainScreen();

        _mainScreen.add(_browserContentManager);
        
        pushScreen(_mainScreen);
                
        PrimaryResourceFetchThread thread = new PrimaryResourceFetchThread(_url, null, null, null, this);
        thread.start();  
                
    }
    
     public void processConnection(HttpConnection connection, Event e) {               
        
         // cancel previous request
         if (_currentConnection != null) {
             try {
                 _currentConnection.close();
             } catch (IOException e1) {
                 System.out.println("IO Exception when trying to retrieve web page.");
             }
         }
         
         _currentConnection = connection;
         
        try {
            _browserContentManager.setContent(connection, this, e);
            System.out.println("The content of the web page has been set.");
        } catch(Exception ex) {
            System.out.println("oh noes problem setting the content of the web page!");
        } finally {
            SecondaryResourceFetchThread.doneAddingImages();
        }
    }
     
     /**
      * @see net.rim.device.api.browser.RenderingApplication#eventOccurred(net.rim.device.api.browser.Event)
      */
     public Object eventOccurred(Event event) {

         int eventId = event.getUID();

         switch (eventId) {

             case Event.EVENT_URL_REQUESTED : {

            	 // This may be a good place to hook into instead of the cookies?
            	 
                 UrlRequestedEvent urlRequestedEvent = (UrlRequestedEvent) event;    
                 String absoluteUrl = urlRequestedEvent.getURL();
     
                 HttpConnection conn = null;
                 PrimaryResourceFetchThread thread = new PrimaryResourceFetchThread(urlRequestedEvent.getURL(),
                                                                                          urlRequestedEvent.getHeaders(), 
                                                                                          urlRequestedEvent.getPostData(),
                                                                                          event, this);
                 thread.start();
     
                 break;

             } case Event.EVENT_BROWSER_CONTENT_CHANGED: {                

                 // browser field title might have changed update title
                 BrowserContentChangedEvent browserContentChangedEvent = (BrowserContentChangedEvent) event; 
             
                 if (browserContentChangedEvent.getSource() instanceof BrowserContent) { 
                     BrowserContent browserField = (BrowserContent) browserContentChangedEvent.getSource(); 
                     String newTitle = browserField.getTitle();
                     if (newTitle != null) {
                         _mainScreen.setTitle(newTitle);
                     }
                 }                   

                 break;                

             } case Event.EVENT_REDIRECT : {

                     RedirectEvent e = (RedirectEvent) event;
                     String referrer = e.getSourceURL();
                                         
                     switch (e.getType()) {

                         case RedirectEvent.TYPE_SINGLE_FRAME_REDIRECT :
                             // show redirect message
                             Application.getApplication().invokeAndWait(new Runnable() {
                                 public void run() {
                                     Status.show("You are being redirected to a different page...");
                                 }
                             });

                             break;

                         case RedirectEvent.TYPE_JAVASCRIPT :
                             break;
                         case RedirectEvent.TYPE_META :
                             // MSIE and Mozilla don't send a Referer for META Refresh.
                             referrer = null;     
                             break;
                         case RedirectEvent.TYPE_300_REDIRECT :
                             // MSIE, Mozilla, and Opera all send the original
                             // request's Referer as the Referer for the new
                             // request.
                             Object eventSource = e.getSource();
                             if (eventSource instanceof HttpConnection) {
                                 referrer = ((HttpConnection)eventSource).getRequestProperty(REFERER);
                             }
                             break;

                     }
                     
                     HttpHeaders requestHeaders = new HttpHeaders();
                     requestHeaders.setProperty(REFERER, referrer);
                     PrimaryResourceFetchThread thread = new PrimaryResourceFetchThread(e.getLocation(), requestHeaders,null, event, this);
                     thread.start();
                     break;

             } case Event.EVENT_CLOSE :
                 // TODO: close the appication
                 break;
             
             case Event.EVENT_SET_HEADER :        // no cache support
             case Event.EVENT_SET_HTTP_COOKIE :   // no cookie support
             {
                 // If the cookie value is one of our special values then we expect 
                 // to receive a call to getHTTPCookie immediate afterwards
                 SetHttpCookieEvent cookieEvent = ((SetHttpCookieEvent)event);
  
                 System.out.println("**** got a cookie set "+cookieEvent.getCookie());

                 int index = cookieEvent.getCookie().indexOf("=");

                 if (index <= 0)
                	 break;

                 String cookieName = cookieEvent.getCookie().substring(0,index);
                 String cookieValue = cookieEvent.getCookie().substring(index+1, cookieEvent.getCookie().length());

                 if (cookieName.compareTo("bb_command") != 0)
                 {
                	 // regular cookie set ... 
                	 System.out.println("**** cookie was not a phonegap cookie. '" + cookieName + "' : " + cookieValue);
                 }
                 else 
                 {
                	 System.out.println("**** cookie was a phonegap cookie. '" + cookieName + "' : " + cookieValue);
                	 
                	 // cookieValue should be a JSON object
                	 
                	 int command = -1;

                	 JSONObject args = null;
                	 
                	 try {
	                     JSONObject outer = new JSONObject(cookieValue); // the outer object
	                     if (outer != null) {
	                    	 // Get the command string
	                    	 command = outer.getInt("command");
	                         // Get the inner object and parse out the data
	                         args = outer.getJSONObject("args");
	                     }
                	 } catch (Exception ex) {
                		 // catch any JSON exceptions here
                	 }

                	 // Send SMS
                	 // Get contact list
                	 //  * call contact
                	 //  * sms contact
                	 // Add contact
                	 // Offline storage
                	 
                	 /*
AddressBookArguments 	Encapsulates arguments to pass to the Address Book application.
ApplicationArguments 	Base class for application arguments to be used for application invocation.
CalendarArguments 	Encapsulates arguments to pass to the Calendar application.
MemoArguments 	Encapsulates arguments to pass to the Memo Pad application.
Invoke.invokeApplication(Invoke.APP_TYPE_MEMOPAD, new MemoArguments(MemoArguments.ARG_NEW, <instance of net.rim.blackberry.api.pdap.BlackBerryMemo>));
MessageArguments 	Encapsulates arguments to pass to the Message application.
SearchArguments 	Encapsulates arguments to pass to the Search application.
TaskArguments 	Encapsulates arguments to pass to the Task application.
                	  */
                	 System.out.println("**** command: " + String.valueOf(command));
                     
                	 
	                 switch (command)
	                 {
	                     case 0:
	                        // Do location provider stuff here...
	                        System.out.println("**** before start location update");
	                        // Set flag so we know to return lat / lng in the next getHTTPCookie call
	                        this._getLocation = true;
	                        // Start the location updater to get a lat / lng
	                        this.startLocationUpdate();
	                        // TODO: If the GPS location cannot be retrieved then use opencellid to get a location
	                        break;
	                     case 1:
	                    	 System.out.println(getLocationDocument(args));
	                    	 // Show a map
	                    	 Invoke.invokeApplication(
	                    			 Invoke.APP_TYPE_MAPS, 
	                    			 new MapsArguments(MapsArguments.ARG_LOCATION_DOCUMENT, 
	                    					 getLocationDocument(args))); 
	                    	 break;
	                     case 2:
	                    	 Invoke.invokeApplication(Invoke.APP_TYPE_CAMERA, new CameraArguments());
	                    	 break;
	                     case 3:
	                    	 if (Alert.isVibrateSupported())
	                    		 Alert.startVibrate(getVibrateDuration(args));
	                    	 break;
	                     case 4:
/*
, : A comma directs the phone application to pause for 2 seconds before proceeding to process the rest of the contents of the dialing string.
! : An exclamation mark directs the phone application to wait for user input; the system presents a dialog with three choices:
- Proceed to dial the rest of the dialing string up to the next comma or exclamation mark
- Skip directly to the next comma or exlamation mark in the dialing string
- Cancel the call altogether
# and * : Generate "pound" and "star" DTMF tones.
0 - 9 : Generate numeric DTMF tones. 
 */
	                    	 try 
	                    	 {
	                    		 Invoke.invokeApplication(Invoke.APP_TYPE_PHONE, new PhoneArguments(PhoneArguments.ARG_CALL, getPhoneNumber(args)));
	                    	 }
	                    	 catch (Exception ex) {
	                    		 System.out.println("***** Error making phone call");
	                        	 ex.printStackTrace();
	                    	 }
	                    	 break;
	                     case 5: // Accelerometer
	                    	 
	                    	 break;
	                     case 6: // Contacts
	                    	 // implement contacts CRUD
	                         try {
	                             ContactList addressbook = (ContactList)(PIM.getInstance().openPIMList( PIM.CONTACT_LIST, PIM.READ_WRITE));
	                             Contact contact = null;
/*
 * 	                             // Each PIMItem — new or found — is associated with a particular PIMList.
	                             contact = addressbook.createContact();
	                             if(addressbook.isSupportedField(Contact.FORMATTED_NAME)) {
	                               contact.addString(Contact.FORMATTED_NAME, Contact.ATTR_NONE, "Lynn Hanson");
	                             }
	                             if(addressbook.isSupportedField(Contact.TEL)) {
	                               contact.addString(Contact.TEL, Contact.ATTR_HOME, "555-HOME-NUMBER");
	                               contact.addString(Contact.TEL, Contact.ATTR_MOBILE, "555-MOBILE-NUMBER");
	                             }

	                             // Here’s a quick search to see if this contact is already present in the addressbook:
	                             Enumeration matching = addressbook.items(contact);
	                             if(matching.hasMoreElements()) {
	                               System.out.println("found the first contact");
	                             } else {
	                               System.out.println("adding the first contact");
	                               contact.commit();
	                             }
 */

	                             // Now print the contents of the addressbook:
	                             Enumeration items = addressbook.items();
	                             while(items.hasMoreElements())
	                             {
	                            	 contact = (Contact)(items.nextElement());
	                            	 int[] fields = contact.getFields();
	                            	 for(int i = 0; i < fields.length; i++) {
	                            		 int fieldIndex = fields[i];
	                            		 System.out.println(" field " + fieldIndex + ": "
	                            				 + addressbook.getFieldLabel(fieldIndex));
	                            		 int dataType = addressbook.getFieldDataType(fieldIndex);
	                            		 System.out.println(" * data type: " + dataType);
	                            		 if(dataType == PIMItem.STRING) {
	                            			 for(int j = 0; j < contact.countValues(fieldIndex); j++) {
	                            				 int attr = contact.getAttributes(fieldIndex, j);
	                            				 System.out.print(" " + j + ". (");
	                            				 System.out.print(addressbook.getAttributeLabel(attr) + "): ");
	                            				 System.out.println(contact.getString(fieldIndex, j));
	                            			 }
	                            		 }
	                            	 }
	                             }
	                         } catch(Exception e) {
	                        	 System.out.println("**** Error getting contacts ");
	                        	 e.printStackTrace();
	                         }
	                    	 break;
	                     case 7:
	                    	 SMSArgs smsArgs = getSMSArgs(args);
	                    	 try {
		                    	 MessageConnection mc = (MessageConnection)Connector.open("sms://"+smsArgs.number);
		                    	 TextMessage sms = (TextMessage)mc.newMessage(MessageConnection.TEXT_MESSAGE);
		                    	 sms.setPayloadText(smsArgs.message);
		                    	 mc.send(sms);
		                    	 mc.close();
	                    	 } catch (Exception ex) {
	                        	 System.out.println("**** Error sending SMS ");
	                        	 ex.printStackTrace();
	                    	 }
	                    	 break;
	                     case 8:
	                    	 // read
	                    	 // Load the data out of persistent store
	                    	 try {
	                    		 String filename = args.getString("name");
	                    		 FileConnection fc = (FileConnection)Connector.open(filename);
	                    		 if (!fc.exists())
	                    			 break;
	                    		 InputStream is = fc.openInputStream();
	                    		 StringBuffer sb = new StringBuffer();
	                    		 int chars, i = 0;
	                    		 while ((chars = is.read()) != -1){
	                    			 sb.append((char)chars);
	                    		 }
	                    		 _fileContents.put(filename, sb.toString());
	                    	 } catch(Exception ex) {
	                    		 ex.printStackTrace();
	                    		 System.out.println("***** error in read");
	                    	 }
	                    	 break;
	                     case 9:
	                    	 // write
	                    	 try {
	                    		 FileArgs fa = getFileArgs(args);
	                    		 FileConnection fc = (FileConnection)Connector.open(fa.name, Connector.READ_WRITE);
	                    		 if (!fc.exists())
	                    			 fc.create();
	                    		 OutputStream os = fc.openOutputStream();
	                    		 os.write(fa.data.getBytes());
	                    		 os.flush();
	                    		 os.close();
	                    	 } catch(Exception ex) {
	                    		 System.out.println("***** error in write: " + ex.getMessage());
	                    	 }
	                    	 break;
	                     default:
	                 }
                 }
                 
                 break;
             }
             case Event.EVENT_HISTORY :           // no history support             
             case Event.EVENT_EXECUTING_SCRIPT :  // no progress bar is supported
             case Event.EVENT_FULL_WINDOW :       // no full window support
             case Event.EVENT_STOP :              // no stop loading support
             default :
         }

         return null;
     }


     /**
      * @see net.rim.device.api.browser.RenderingApplication#getAvailableHeight(net.rim.device.api.browser.BrowserContent)
      */
     public int getAvailableHeight(BrowserContent browserField) {
         // field has full screen
         return Display.getHeight();
     }

     /**
      * @see net.rim.device.api.browser.RenderingApplication#getAvailableWidth(net.rim.device.api.browser.BrowserContent)
      */
     public int getAvailableWidth(BrowserContent browserField) {
         // field has full screen
         return Display.getWidth();
     }

     /**
      * @see net.rim.device.api.browser.RenderingApplication#getHistoryPosition(net.rim.device.api.browser.BrowserContent)
      */
     public int getHistoryPosition(BrowserContent browserField) {
         // no history support
         return 0;
     }

     /**
      * @see net.rim.device.api.browser.RenderingApplication#getHTTPCookie(java.lang.String)
      */
     public String getHTTPCookie(String url) {
         // no cookie support
         // parse out the URL for special strings that are for Blackberry API things
    	 String cookie = "{";
    	 System.out.println("*** GetHTTPCookie - " + String.valueOf(this._locationReady));
    	 // If we have requested a location (getLocation==true) and the location is ready then return it
    	 if (_getLocation && _locationReady) {
    		 cookie += "geolocation: {lat:" + String.valueOf(this._lat) + ",lng:" + String.valueOf(this._lng)+"},";
    		 _locationReady = false;
             _locationProvider.reset();
             _locationProvider.setLocationListener(null, -1, -1, -1);
    	 }
    	 // Add new if statements to append any other data to the returned JSON object
    	 cookie += "readfile: [";
    	 Enumeration keys = _fileContents.keys();
    	 while (keys.hasMoreElements()) {
    		 String name = (String)keys.nextElement();
    		 String data = (String)_fileContents.get(name);
    		 cookie += "{name:'"+name+"',data:'"+data+"'},";
    	 }
    	 cookie += "],";
    	 _fileContents.clear();

    	 if (cookie.endsWith(",")) {
    		 // Strip off the 
    		 cookie = cookie.substring(0, cookie.length()-1);
    	 }
    	 cookie += "}";
    	 System.out.println("*** GetHTTPCookie - " + cookie);
    	 // TODO: support all the other cookies here as well
         return "bb_response=" + cookie;
     }

     /**
      * @see net.rim.device.api.browser.RenderingApplication#getResource(net.rim.device.api.browser.RequestedResource,
      *      net.rim.device.api.browser.BrowserContent)
      */
     public HttpConnection getResource( RequestedResource resource, BrowserContent referrer) {

         if (resource == null) {
             return null;
         }

         // check if this is cache-only request
         if (resource.isCacheOnly()) {
             // no cache support
             return null;
         }

         String url = resource.getUrl();

         if (url == null) {
             return null;
         }

         // if referrer is null we must return the connection
         if (referrer == null) {
             HttpConnection connection = Utilities.makeConnection(resource.getUrl(), resource.getRequestHeaders(), null);
             return connection;
             
         } else {
             
             // if referrer is provided we can set up the connection on a separate thread
             SecondaryResourceFetchThread.enqueue(resource, referrer);
             
         }

         return null;
     }

     /**
      * @see net.rim.device.api.browser.RenderingApplication#invokeRunnable(java.lang.Runnable)
      */
     public void invokeRunnable(Runnable runnable) {
         (new Thread(runnable)).run();
     }
    
    /*
    public void onClose() {
        if ( _locationProvider != null ) 
        {
            _locationProvider.reset();
            _locationProvider.setLocationListener(null, -1, -1, -1);
        }
    }
    */
    
        /**
     * Invokes the Location API with the default criteria.
     * 
     * @return True if the Location Provider was successfully started; false otherwise.
     */
    private boolean startLocationUpdate()
    {
        boolean retval = false;
        
        try {
            _locationProvider = LocationProvider.getInstance(null);
            
            if ( _locationProvider == null ) {
                // We would like to display a dialog box indicating that GPS isn't supported, but because
                // the event-dispatcher thread hasn't been started yet, modal screens cannot be pushed onto
                // the display stack.  So delay this operation until the event-dispatcher thread is running
                // by asking it to invoke the following Runnable object as soon as it can.
                Runnable showGpsUnsupportedDialog = new Runnable() {
                    public void run() {
                        Dialog.alert("GPS is not supported on this platform, exiting...");
                        System.exit( 1 );
                    }
                };
                invokeLater( showGpsUnsupportedDialog );  // ask event-dispatcher thread to display dialog ASAP
            } else {
                // only a single listener can be associated with a provider, and unsetting it involves the same
                // call but with null, therefore, no need to cache the listener instance
                // request an update every second
                System.out.println("**** setting the location listener");
                _locationProvider.setLocationListener(new LocationListenerImpl(), _interval, 1, 1);
                retval = true;
            }
        } catch (LocationException le) {
            System.err.println("Failed to instantiate the LocationProvider object, exiting...");
            System.err.println(le); 
            System.exit(0);
        }        
        return retval;
    }

    /**
     * Rounds off a given double to the provided number of decimal places
     * @param d the double to round off
     * @param decimal the number of decimal places to retain
     * @return a double with the number of decimal places specified
     */
    private static double round(double d, int decimal) 
    {
        double powerOfTen = 1;
        while (decimal-- > 0)
        {
            powerOfTen *= 10.0;
        }
        double d1 = d * powerOfTen;
        int d1asint = (int)d1; //clip the decimal portion away and cache the cast, this is a costly transformation
        double d2 = d1 - d1asint; //get the remainder of the double
        //is the remainder > 0.5? if so, round up, otherwise round down (lump in .5 with > case for simplicity)
        return ( d2 >= 0.5 ? (d1asint + 1)/powerOfTen : (d1asint)/powerOfTen);
    }
    
    private void updateLocation(double lat, double lng, float speed, float alt, float head)
    {
        System.out.println("**** update location: " + String.valueOf(lat) + ", " + String.valueOf(lng));
        this._lat = lat;
        this._lng = lng;
        this._locationReady = true;
    }
    
    private String getLocationDocument(JSONObject args)
    {
    	String locationDoc = "<location-document>";
    	try {
            JSONArray ja = args.getJSONArray("points");
            if (ja != null) {
                for (int i=0; i<ja.length(); i++) {
                    JSONObject o = (JSONObject)ja.get(i);
            		locationDoc += "<location x=\""+o.getString("lat")+"\" y=\""+o.getString("lng")+"\" label=\""+o.getString("label")+"\" description=\""+o.getString("description")+"\" />";
                }
            }
    	}
    	catch (Exception e) {}
    	locationDoc += "</location-document>";
    	return locationDoc;
    }
    
    private int getVibrateDuration(JSONObject args)
    {
    	int duration = 1;
    	try {
    		duration = args.getInt("duration");
    	} catch (Exception e) {
    	}
    	return duration;
    }
    
    private String getPhoneNumber(JSONObject args)
    {
    	String number = "";
    	try {
    		number = args.getString("number");
    	} catch (Exception e) {
    	}
    	return number;
    }
    
    private FileArgs getFileArgs(JSONObject args)
    {
    	String data = "";
    	String name = "";
    	try {
    		name = args.getString("name");
    		data = args.getString("data");
    	} catch (Exception e) {
    	}
    	return new FileArgs(name, data);
    }
    
    private SMSArgs getSMSArgs(JSONObject args)
    {
    	String message = "";
    	String number = "";
    	try {
    		message = args.getString("message");
    		number = args.getString("number");
    	} catch (Exception e) {
    	}
    	return new SMSArgs(number, message);
    }
    
    private class SMSArgs {
    	public String number;
    	public String message;
    	public SMSArgs(String _number, String _message)
    	{
    		number = _number;
    		message = _message;
    	}
    }

    private class FileArgs {
    	public String data;
    	public String name;
    	public FileArgs(String _name, String _data)
    	{
    		data = _data;
    		name = _name;
    	}
    }
    /**
     * Implementation of the LocationListener interface
     */
    private class LocationListenerImpl implements LocationListener
    {
        //members --------------------------------------------------------------
        private int captureCount;
        
        //methods --------------------------------------------------------------
        public void locationUpdated(LocationProvider provider, Location location)
        {
            System.out.println("**** checking for location");
            if(location.isValid())
            {
                System.out.println("**** got a valid location");
                float heading = location.getCourse();
                double longitude = location.getQualifiedCoordinates().getLongitude();
                double latitude = location.getQualifiedCoordinates().getLatitude();
                float altitude = location.getQualifiedCoordinates().getAltitude();
                float speed = location.getSpeed();

                captureCount += _interval;

                //if we're mod zero then it's time to record this data
                captureCount %= CAPTURE_INTERVAL;
                
                StringBuffer msg = new StringBuffer();
                // Information to be sent to the server
                if ( captureCount == 0 )
                {
                }

                synchronized(this)
                {
                    // Now set this somewhere and make it available to the JavaScript
                    PhoneGap.this.updateLocation(latitude, longitude, altitude, speed, heading);
                }
            }
        }
  
        public void providerStateChanged(LocationProvider provider, int newState) {}
    }
}

class PrimaryResourceFetchThread extends Thread {
    
    private PhoneGap _application;
    
    private Event _event;

    private byte[] _postData;

    private HttpHeaders _requestHeaders;

    private String _url;
    
    PrimaryResourceFetchThread(String url, HttpHeaders requestHeaders, byte[] postData, 
                                  Event event, PhoneGap application) {
        
        _url = url;
        _requestHeaders = requestHeaders;
        _postData = postData;
        _application = application;
        _event = event;
    }

    public void run() {
        HttpConnection connection = Utilities.makeConnection(_url, _requestHeaders, _postData);
        _application.processConnection(connection, _event);        
    }
}