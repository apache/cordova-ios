package com.nitobi.phonegap;


import java.util.*;
import java.io.IOException;

import javax.microedition.location.*;
import javax.microedition.io.HttpConnection;

import net.rim.device.api.browser.field.*;
import net.rim.device.api.io.http.HttpHeaders;
import net.rim.device.api.system.Application;
import net.rim.device.api.ui.Field;
import net.rim.device.api.ui.UiApplication;
import net.rim.device.api.ui.component.*;
import net.rim.device.api.ui.container.MainScreen;
import net.rim.device.api.system.*;

/**
 */

public class PhoneGap extends UiApplication implements RenderingApplication {
    
    //constants ----------------------------------------------------------------
    private static final int GRADE_INTERVAL=5; //seconds - represents the number of updates over which alt is calculated
    private static final long ID = 0x5d459971bb15ae7aL;//com.rim.samples.device.gpsdemo.GPSDemo.ID
    private static final int CAPTURE_INTERVAL=5;  //we record a location every 5 seconds
    private static final int SENDING_INTERVAL=30; // the interval in seconds after which the information is sent to the server
    private static final String REFERER = "referer";   
    
    private BrowserContentManager _browserContentManager;

    private MainScreen _mainScreen;
    private LabelField _lf;
    
    private LocationProvider _locationProvider;
    private int _interval = 10;
    private double _lat = 0;
    private double _lng = 0;
    private boolean _locationReady = false;
    
    private Hashtable cookies = new Hashtable();
    
    private Vector _commands = new Vector();
    
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

        // Setup the hashtable of accepted commands from JavaScript cookies
        _commands.addElement("lat_lng");

        _browserContentManager = new BrowserContentManager( 0 );
        RenderingOptions renderingOptions = _browserContentManager.getRenderingSession().getRenderingOptions();

        // turn off images in html
        renderingOptions.setProperty(RenderingOptions.CORE_OPTIONS_GUID, RenderingOptions.JAVASCRIPT_ENABLED, true);
        renderingOptions.setProperty(RenderingOptions.CORE_OPTIONS_GUID, RenderingOptions.JAVASCRIPT_LOCATION_ENABLED, true);
        
        _mainScreen = new MainScreen();
        _lf = new LabelField("Label before the content", Field.FOCUSABLE);
        _mainScreen.add(_lf);

        _mainScreen.add(_browserContentManager);
        
        _mainScreen.add(new LabelField("Label after the content", Field.FOCUSABLE));                
        pushScreen(_mainScreen);
                
        PrimaryResourceFetchThread thread = new PrimaryResourceFetchThread("http://nitobi.com/temp/phone_gap.html", null, null, null, this);
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
                 System.out.println(cookieEvent.getCookie());
                 int command = Integer.parseInt(cookieEvent.getCookie());
                 cookies.put(cookieEvent.getURL(), cookieEvent.getCookie());

                 switch (command)
                 {
                     case 0:
                        // Do location provider stuff here...
                        System.out.println("**** before start location update");
                        this.startLocationUpdate();
                        break;
                     default:
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
    	 String cookie = "";
    	 System.out.println("*** GetHTTPCookie - " + String.valueOf(this._locationReady));
    	 if (_locationReady) {
    		 cookie = "geo_" + String.valueOf(this._lat) + "_" + String.valueOf(this._lng);
    		 _locationReady = false;
             _locationProvider.reset();
             _locationProvider.setLocationListener(null, -1, -1, -1);
    	 }
    	 System.out.println("*** GetHTTPCookie - " + cookie);
         return cookie;
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
