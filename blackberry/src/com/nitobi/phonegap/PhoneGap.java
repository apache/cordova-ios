/**
 * The MIT License
 * -------------------------------------------------------------
 * Copyright (c) 2008, Rob Ellis, Brock Whitten, Brian Leroux, Joe Bowser, Dave Johnson, Nitobi
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package com.nitobi.phonegap;

import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;
import java.util.Vector;

import javax.microedition.io.HttpConnection;

import net.rim.device.api.browser.field.BrowserContent;
import net.rim.device.api.browser.field.BrowserContentChangedEvent;
import net.rim.device.api.browser.field.Event;
import net.rim.device.api.browser.field.RedirectEvent;
import net.rim.device.api.browser.field.RenderingApplication;
import net.rim.device.api.browser.field.RenderingException;
import net.rim.device.api.browser.field.RenderingOptions;
import net.rim.device.api.browser.field.RenderingSession;
import net.rim.device.api.browser.field.RequestedResource;
import net.rim.device.api.browser.field.SetHttpCookieEvent;
import net.rim.device.api.browser.field.UrlRequestedEvent;
import net.rim.device.api.io.http.HttpHeaders;
import net.rim.device.api.system.Application;
import net.rim.device.api.system.Characters;
import net.rim.device.api.system.Display;
import net.rim.device.api.system.KeyListener;
import net.rim.device.api.ui.Field;
import net.rim.device.api.ui.UiApplication;
import net.rim.device.api.ui.component.Status;
import net.rim.device.api.ui.container.MainScreen;

import com.nitobi.phonegap.api.CommandManager;
import com.nitobi.phonegap.io.ConnectionManager;
import com.nitobi.phonegap.io.PrimaryResourceFetchThread;
import com.nitobi.phonegap.io.SecondaryResourceFetchThread;

/**
 * Bridges HTML/JS/CSS to a native Blackberry application.
 * @author Jose Noheda
 * @author Fil Maj
 * @author Dave Johnson
 */
public class PhoneGap extends UiApplication implements RenderingApplication {

	public static final String PHONEGAP_PROTOCOL = "PhoneGap=";
	private static final String DEFAULT_INITIAL_URL = "data:///www/index.html";
	private static final String REFERER = "referer";  
	private static final String REDIRECT_MSG = "You are being redirected to a different page...";
	public Vector pendingResponses = new Vector();
	private CommandManager commandManager;
	private RenderingSession _renderingSession;   
    public HttpConnection  _currentConnection;
    private MainScreen _mainScreen;
    private Timer refreshTimer;

	/**
	 * Launches the application. Accepts up to one parameter, a URL to the index page. 
	 */
	public static void main(String[] args) {
		PhoneGap bridge = args.length > 0 ? new PhoneGap(args[0]) : new PhoneGap();
		bridge.enterEventDispatcher();
	}

	public PhoneGap() {
		init(DEFAULT_INITIAL_URL);
	}

	/**
	 * Launches the application with a custom index page.
	 *
	 * @param url a http:// or data:// string
	 */
	public PhoneGap(final String url) {
		if ((url != null) && (url.trim().length() > 0)) {
			init(url);
		} else {
			init(DEFAULT_INITIAL_URL);
		}
	}

	private void init(final String url) {
		commandManager = new CommandManager(this);
		_mainScreen = new MainScreen();
		_mainScreen.addKeyListener(new PhoneGapKeyListener(this));
		pushScreen(_mainScreen);
		// Set up the browser/renderer.
        _renderingSession = RenderingSession.getNewInstance();
        _renderingSession.getRenderingOptions().setProperty(RenderingOptions.CORE_OPTIONS_GUID, RenderingOptions.JAVASCRIPT_ENABLED, true);
        _renderingSession.getRenderingOptions().setProperty(RenderingOptions.CORE_OPTIONS_GUID, RenderingOptions.JAVASCRIPT_LOCATION_ENABLED, true);
        // Enable nice-looking BlackBerry browser field.
        _renderingSession.getRenderingOptions().setProperty(RenderingOptions.CORE_OPTIONS_GUID, 17000, true);
        PrimaryResourceFetchThread thread = new PrimaryResourceFetchThread(url, null, null, null, this);
        thread.start();
        refreshTimer = new Timer();
        refreshTimer.scheduleAtFixedRate(new TimerRefresh(), 500, 500);
	}
	public Object eventOccurred(final Event event) 
    {
        int eventId = event.getUID();
        switch (eventId) {
		case Event.EVENT_REDIRECT: {
			RedirectEvent e = (RedirectEvent) event;
			String referrer = e.getSourceURL();
			switch (e.getType()) {
			case RedirectEvent.TYPE_SINGLE_FRAME_REDIRECT:
				// Show redirect message.
				Application.getApplication().invokeAndWait(new Runnable() {
					public void run() {
						Status.show(REDIRECT_MSG);
					}
				});
				break;

			case RedirectEvent.TYPE_JAVASCRIPT:
				break;

			case RedirectEvent.TYPE_META:
				// MSIE and Mozilla don't send a Referer for META Refresh.
				referrer = null;
				break;

			case RedirectEvent.TYPE_300_REDIRECT:
				// MSIE, Mozilla, and Opera all send the original request's Referer as the Referer for the new request.
				Object eventSource = e.getSource();
				if (eventSource instanceof HttpConnection) {
					referrer = ((HttpConnection) eventSource).getRequestProperty(REFERER);
				}
				eventSource = null;
				break;
			}
			// Create the request, populate header with referrer and fire off the request.
			HttpHeaders requestHeaders = new HttpHeaders();
			requestHeaders.setProperty(REFERER, referrer);
			PrimaryResourceFetchThread thread = new PrimaryResourceFetchThread(e.getLocation(), requestHeaders, null, event, this);
			thread.start();
			e = null;
			referrer = null;
			requestHeaders = null;
			break;
		}
		case Event.EVENT_URL_REQUESTED: {
			UrlRequestedEvent urlRequestedEvent = (UrlRequestedEvent) event;
			String url = urlRequestedEvent.getURL();
			HttpHeaders header = urlRequestedEvent.getHeaders();
			PrimaryResourceFetchThread thread = new PrimaryResourceFetchThread(
					url, header, urlRequestedEvent.getPostData(), event, this);
			thread.start();
			urlRequestedEvent = null;
			url = null;
			header = null;
			break;
		}
		case Event.EVENT_BROWSER_CONTENT_CHANGED: {
			// Browser field title might have changed update title.
			BrowserContentChangedEvent browserContentChangedEvent = (BrowserContentChangedEvent) event;
			if (browserContentChangedEvent.getSource() instanceof BrowserContent) {
				BrowserContent browserField = (BrowserContent) browserContentChangedEvent.getSource();
				String newTitle = browserField.getTitle();
				if (newTitle != null) {
					synchronized (getAppEventLock()) {
						_mainScreen.setTitle(newTitle);
					}
				}
				browserField = null;
				newTitle = null;
			}
			browserContentChangedEvent = null;
			break;
		}
		case Event.EVENT_CLOSE:
			// TODO: close the application
			break;

		case Event.EVENT_SET_HEADER: // No cache support.
		case Event.EVENT_SET_HTTP_COOKIE:
			String cookie = ((SetHttpCookieEvent) event).getCookie();
			if (cookie.startsWith(PHONEGAP_PROTOCOL)) {
				String response = commandManager.processInstruction(cookie);
				if ((response != null) && (response.trim().length() > 0)) {
					pendingResponses.addElement(response);
				}
				response = null;
			}
			cookie = null;
			break;
		case Event.EVENT_HISTORY: // TODO: No history support.. but we added our own history stack implementation in ConnectionManager. Can we hook it up - then we'd have access to window.history :o
		case Event.EVENT_EXECUTING_SCRIPT: // No progress bar is supported.
		case Event.EVENT_FULL_WINDOW: // No full window support.
		case Event.EVENT_STOP: // No stop loading support.
		default:
		}
        
        return null;
    }
	
	/**
	 * Catch the 'get' cookie event, aggregate PhoneGap API responses that haven't been flushed and return.
	 **/
	public String getHTTPCookie(String url) {
		StringBuffer responseCode = new StringBuffer();
		synchronized (pendingResponses) {
			for (int index = 0; index < pendingResponses.size(); index++)
				responseCode.append(pendingResponses.elementAt(index));
			pendingResponses.removeAllElements();
		}
		return responseCode.toString();
	}

	public int getAvailableHeight(BrowserContent browserContent) {
		return Display.getHeight();
	}

	public int getAvailableWidth(BrowserContent browserContent) {
		return Display.getWidth();
	}

	public int getHistoryPosition(BrowserContent browserContent) {
		return 0; // TODO: No support... but should try hooking it up to our own implementation of the history stack and see what happens.
	}
	
	public HttpConnection getResource(RequestedResource resource, BrowserContent referrer) {
		if ((resource != null) && (resource.getUrl() != null) && !resource.isCacheOnly()) {
			String url = resource.getUrl().trim();
			if ((referrer == null) || (ConnectionManager.isInternal(url, resource))) {
				return ConnectionManager.getUnmanagedConnection(url, resource.getRequestHeaders(), null);
			} else {
				SecondaryResourceFetchThread.enqueue(resource, referrer);
			}
			url = null;
		}
		return null;
	}
	/**
	 * Processes a new HttpConnection object to instantiate a new browser Field (aka WebView) object, and then resets the screen to the newly-created Field.
	 * @param connection
	 * @param e
	 */
    public void processConnection(HttpConnection connection, Event e) 
    {
        // Cancel previous request.
        if (_currentConnection != null) 
        {
            try 
            {
                _currentConnection.close();
            } 
            catch (IOException e1) 
            {
            }
        }
        // Clear out pending responses.
        synchronized(pendingResponses) {
        	pendingResponses.removeAllElements();
        }
        // Cancel any XHRs happening.
        commandManager.stopXHR();
        _currentConnection = connection;
        BrowserContent browserContent = null;
        Field field = null;
        try 
        {
            browserContent = _renderingSession.getBrowserContent(connection, this, e);
            if (browserContent != null) 
            {
                field = browserContent.getDisplayableContent();
                if (field != null) 
                {
                    synchronized (Application.getEventLock()) 
                    {
                    	_mainScreen.deleteAll();
                        _mainScreen.add(field);
                    }
                }
                browserContent.finishLoading();
            }
        } 
        catch (RenderingException re) 
        {
        }
        finally {
        	browserContent = null;
			field = null;
			// Manually call the garbage collector to clean up all of leftover objects and free up the nulled object handles.
        	System.gc();
        }
    }
    public void invokeRunnable(Runnable runnable) 
    {       
        (new Thread(runnable)).start();
    }
    public static final String joinString(final String[] data, final char joinChar) {
    	StringBuffer b = new StringBuffer();
    	int nums = data.length;
    	for (int i = 0; i < nums; i++) {
    		b.append(data[i]);
    		b.append(joinChar);
    	}
    	if (b.length() > 0) b.deleteCharAt(b.length()-1);
    	return b.toString();
    }
    public static final String[] splitString(final String data, final char splitChar, final boolean allowEmpty)
    {
        Vector v = new Vector();

        int indexStart = 0;
        int indexEnd = data.indexOf(splitChar);
        if (indexEnd != -1)
        {
            while (indexEnd != -1)
            {
                String s = data.substring(indexStart, indexEnd);
                if (allowEmpty || s.length() > 0)
                {
                    v.addElement(s);
                }
                s = null;
                indexStart = indexEnd + 1;
                indexEnd = data.indexOf(splitChar, indexStart);
            }

            if (indexStart != data.length())
            {
                // Add the rest of the string
                String s = data.substring(indexStart);
                if (allowEmpty || s.length() > 0)
                {
                    v.addElement(s);
                }
                s = null;
            }
        }
        else
        {
            if (allowEmpty || data.length() > 0)
            {
                v.addElement(data);
            }
        }

        String[] result = new String[v.size()];
        v.copyInto(result);
        v = null;
        return result;
    }
    private class TimerRefresh extends TimerTask
    {
    	public void run()   
    	{
    		UiApplication.getUiApplication().invokeLater(new Runnable() 
    		{
    			public void run() 
    			{
    				int numFields = _mainScreen.getFieldCount();
    				for (int i = 0; i < numFields; i++) {
    					Field field = _mainScreen.getField(i);
    					field.getManager().invalidate();
    					field = null;
    				}
    				_mainScreen.doPaint();
    			}
    		});
    	}
    }
    private class PhoneGapKeyListener implements KeyListener {
    	private PhoneGap phoneGap;
    	public PhoneGapKeyListener(PhoneGap pg) {
    		phoneGap = pg;
    	}
    
    	public boolean keyChar(char arg0, int arg1, int arg2) {
    		// Catch BlackBerry's back key, pop history URL stack and initiate HTTP request to it.
    		if (ConnectionManager.history.size() > 1 && arg0 == Characters.ESCAPE) {
    			ConnectionManager.history.pop();
    			PrimaryResourceFetchThread thread = new PrimaryResourceFetchThread((String)ConnectionManager.history.pop(), null, null, null, this.phoneGap);
    			thread.start();
    			return true;
    		}
    		return false;
    	}

    	public boolean keyDown(int keycode, int time) {
    		return false;
    	}

    	public boolean keyRepeat(int keycode, int time) {
    		return false;
    	}

    	public boolean keyStatus(int keycode, int time) {
    		return false;
    	}

    	public boolean keyUp(int keycode, int time) {
    		return false;
    	}
    }
}