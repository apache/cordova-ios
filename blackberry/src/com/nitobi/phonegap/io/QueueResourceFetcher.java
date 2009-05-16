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
package com.nitobi.phonegap.io;

import java.util.Vector;

import javax.microedition.io.InputConnection;

import net.rim.device.api.browser.field.BrowserContent;
import net.rim.device.api.browser.field.RequestedResource;
import net.rim.device.api.ui.UiApplication;

/**
 * Download manager for concurrent connections.
 *
 * @author Jose Noheda
 *
 */
public final class QueueResourceFetcher implements Runnable {

	private UiApplication main;
	private BrowserContent browser;
	private Vector queue = new Vector();
	private ConnectionManager connectionManager;

	public QueueResourceFetcher(UiApplication application, ConnectionManager connectionManager) {
		this.main = application;
		this.connectionManager = connectionManager;
	}

	/**
	 * Adds a new element to download.
	 */
	public void enqueue(RequestedResource resource, BrowserContent referrer) {
		if (browser != referrer) {
			queue.removeAllElements();
			browser = referrer;
		}
		queue.addElement(resource);
	}

	/**
	 * Downloads all queued resources.
	 */
	public void run() {
		if (!queue.isEmpty()) processResource();
		main.invokeLater(this, queue.isEmpty() ? 250 : 1, false);
	}

	private void processResource() {
		RequestedResource resource = null;
		synchronized (queue) {
			if (!queue.isEmpty()) {
				resource = (RequestedResource) queue.elementAt(0);
				queue.removeElementAt(0);
			}
		}
		if (resource != null) {
			InputConnection connection = connectionManager.getPreLoadedConnection(resource.getUrl());
			if (connection != null) {
				resource.setInputConnection(connection);
				browser.resourceReady(resource);
			}
		}
	}

}
