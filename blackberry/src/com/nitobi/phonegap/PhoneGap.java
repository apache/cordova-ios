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

import java.util.Vector;

import javax.microedition.io.HttpConnection;

import net.rim.device.api.browser.field.BrowserContent;
import net.rim.device.api.browser.field.BrowserContentManager;
import net.rim.device.api.browser.field.Event;
import net.rim.device.api.browser.field.RedirectEvent;
import net.rim.device.api.browser.field.RenderingApplication;
import net.rim.device.api.browser.field.RenderingOptions;
import net.rim.device.api.browser.field.RequestedResource;
import net.rim.device.api.browser.field.UrlRequestedEvent;
import net.rim.device.api.system.Display;
import net.rim.device.api.ui.Screen;
import net.rim.device.api.ui.UiApplication;
import net.rim.device.api.ui.container.MainScreen;

import com.nitobi.phonegap.api.CommandManager;
import com.nitobi.phonegap.io.AsynchronousResourceFetcher;
import com.nitobi.phonegap.io.Callback;
import com.nitobi.phonegap.io.ConnectionManager;
import com.nitobi.phonegap.io.QueueResourceFetcher;

/**
 * Bridges HTML/JS/CSS to a native Blackberry application.
 *
 * @author Jose Noheda
 *
 */
public class PhoneGap extends UiApplication implements RenderingApplication {

	public static final String PHONEGAP_PROTOCOL = "gap://";
	private static final String DEFAULT_INITIAL_URL = "file:///www/test/vibration.html";

	private Screen mainScreen;
	private Vector pendingResponses = new Vector();
	private QueueResourceFetcher queueResourceFetcher;
	private CommandManager commandManager = new CommandManager();
	private ConnectionManager connectionManager = new ConnectionManager();
	private BrowserContentManager _browserContentManager = new BrowserContentManager(0);

	/**
	 * Launches the application. Accepts up to one parameter, an URL to the index page. 
	 */
	public static void main(String[] args) {
		PhoneGap bridge = args.length > 0 ? new PhoneGap(args[0]) : new PhoneGap();
		bridge.enterEventDispatcher();
	}

	/**
	 * By default, the main page is set to data:///www/test/index.html
	 */
	public PhoneGap() {
		init(DEFAULT_INITIAL_URL);
	}

	/**
	 * Launches the application with a custom index page.
	 *
	 * @param url a http:// or data:// string
	 */
	public PhoneGap(final String url) {
		init((url != null) && (url.trim().length() > 0) ? url : DEFAULT_INITIAL_URL);
	}

	private void init(final String url) {
		RenderingOptions renderingOptions = _browserContentManager.getRenderingSession().getRenderingOptions();
		renderingOptions.setProperty(RenderingOptions.CORE_OPTIONS_GUID, RenderingOptions.JAVASCRIPT_ENABLED, true);
		renderingOptions.setProperty(RenderingOptions.CORE_OPTIONS_GUID, RenderingOptions.JAVASCRIPT_LOCATION_ENABLED, true);
		renderingOptions.setProperty(RenderingOptions.CORE_OPTIONS_GUID, 17000, true);
		mainScreen = new MainScreen();
		mainScreen.add(_browserContentManager);
        pushScreen(mainScreen);
        queueResourceFetcher = new QueueResourceFetcher(this, connectionManager);
        loadUrl(url);
        invokeLater(queueResourceFetcher);
	}

	private void loadUrl(String url) {
		invokeAndWait(new AsynchronousResourceFetcher(url, new Callback() {
			public void execute(final Object input) {
				// setContent here causes Blackberry to freeze - leads to two calls: handleNewContent and finishLoading.
				// finishLoading then calls Object.wait(), which is likely the cause for the freeze? Help!
				_browserContentManager.setContent((HttpConnection) input, PhoneGap.this, null);
			}
        }, connectionManager));
	}

	public Object eventOccurred(final Event event) {
		if (event instanceof RedirectEvent) {
			RedirectEvent command = (RedirectEvent) event;
			String url = command.getLocation();
			if (url.startsWith(PHONEGAP_PROTOCOL)) {
				String response = commandManager.processInstruction(url);
				if ((response != null) && (response.trim().length() > 0)) pendingResponses.addElement(response);
			}
		}
		if (event instanceof UrlRequestedEvent) {
			final String url = ((UrlRequestedEvent) event).getURL();
			new Thread(new AsynchronousResourceFetcher(url, new Callback() {
				public void execute(final Object input) {
					_browserContentManager.setContent((HttpConnection) input, PhoneGap.this, null);
				}
	        }, connectionManager)).start();
		}
		return null;
	}

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
		return 0; // No support
	}

	public HttpConnection getResource(RequestedResource resource, BrowserContent referrer) {
		if ((resource != null) && (resource.getUrl() != null) && !resource.isCacheOnly()) {
			String url = resource.getUrl().trim();
			if ((referrer == null) || (connectionManager.isInternal(url)))
				return connectionManager.getUnmanagedConnection(url);
			else
				queueResourceFetcher.enqueue(resource, referrer);
		}
		return null;
	}

	public void invokeRunnable(Runnable runnable) {
		invokeLater(runnable);
	}

}
