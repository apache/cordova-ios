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

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.microedition.io.Connection;
import javax.microedition.io.Connector;
import javax.microedition.io.HttpConnection;
import javax.microedition.io.InputConnection;

import net.rim.device.api.io.Base64OutputStream;
import net.rim.device.api.system.Application;

/**
 * Manages all HTTP connections.
 *
 * @author Jose Noheda
 *
 */
public final class ConnectionManager {

	public static final String DATA = "data";
	public static final String DATA_PROTOCOL = DATA + "://";
	private static final byte[] DATA_URL = (ConnectionManager.DATA + ":text/html;base64,").getBytes();

	/**
	 * Creates a connection and returns it. Calling this method without care may saturate BB capacity.
	 *
	 * @param url a http:// or data:// URL
	 */
	public HttpConnection getUnmanagedConnection(String url) {
		if ((url != null) && (url.trim().length() > 0))
			return isInternal(url) ? getDataProtocolConnection(url) : getExternalConnection(url);
		return null;
	}

	/**
	 * Loads an external URL and provides a connection that holds the array of bytes. Internal
	 * URLs (data://) simply pass through.
	 *
	 * @param url a http:// or data:// URL 
	 */
	public InputConnection getPreLoadedConnection(String url) {
		InputConnection connection = getUnmanagedConnection(url);
		if ((connection != null) && (!isInternal(url))) {
			try {
				final byte[] data = read(connection.openInputStream());
				close(connection);
				if (data != null) {
					connection = new InputConnection() {
						public DataInputStream openDataInputStream() throws IOException {
							return new DataInputStream(openInputStream());
						}

						public InputStream openInputStream() throws IOException {
							return new ByteArrayInputStream(data);
						}

						public void close() throws IOException {
							return;
						}
					};
				}
			} catch(IOException ioe) {
				close(connection);
				System.out.println("Problems reading an external URL");
			}
		}
		return connection;
	}

	/**
	 * Detects data:// URLs
	 */
	public boolean isInternal(String url) {
		return (url != null) && url.startsWith(ConnectionManager.DATA_PROTOCOL);
	}

	public HttpConnection asHttpConnection(String url) {
		return null;
	}

	private static void close(Connection connection) {
		if (connection != null) {
			try {
				connection.close();
			} catch(Exception ioe) {
				System.out.println("Problem closing a connection");
			}
		}
	}

	private static HttpConnection getExternalConnection(String url) {
		try {
			return (HttpConnection) Connector.open(url);
		} catch (Exception ex) {
			return null;
		}
	}

	private static HttpConnection getDataProtocolConnection(String url) {
		String dataUrl = url.startsWith(ConnectionManager.DATA_PROTOCOL) ? url.substring(7) : url; 
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		try {
			output.write(ConnectionManager.DATA_URL);
			Base64OutputStream boutput = new Base64OutputStream(output);
			boutput.write(read(Application.class.getResourceAsStream(dataUrl)));
			boutput.flush();
			boutput.close();
			output.flush();
			output.close();
			return (HttpConnection) Connector.open(output.toString());
		} catch (IOException ex) {
			return null;
		}
	}

	private static byte[] read(InputStream input) throws IOException {
		ByteArrayOutputStream bytes = new ByteArrayOutputStream();
		try {
			int bytesRead = -1;
			byte[] buffer = new byte[1024];
			while ((bytesRead = input.read(buffer)) != -1) bytes.write(buffer, 0, bytesRead);
		} finally {
			try {
				input.close();
			} catch (IOException ex) {}
		}
		return bytes.toByteArray();
    }

}
