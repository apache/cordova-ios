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
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Vector;

import javax.microedition.io.Connection;
import javax.microedition.io.Connector;
import javax.microedition.io.HttpConnection;
import javax.microedition.io.InputConnection;

import net.rim.device.api.browser.field.RequestedResource;
import net.rim.device.api.io.Base64OutputStream;
import net.rim.device.api.io.http.HttpHeaders;
import net.rim.device.api.io.http.HttpProtocolConstants;
import net.rim.device.api.system.Application;
import net.rim.device.api.util.StringUtilities;

/**
 * Manages all HTTP connections.
 *
 * @author Jose Noheda
 *
 */
public final class ConnectionManager {

	public static final String DATA = "data";
	public static final String DATA_PROTOCOL = DATA + ":///";
	public static final String URI_SUFFIX = ";charset=utf-8;base64,";
	public static final String REFERRER_KEY = "referer";
	public static Hashtable dirHash = new Hashtable();
	private static final byte[] DATA_URL_HTML = (ConnectionManager.DATA + ":text/html" + URI_SUFFIX).getBytes();
	private static final byte[] DATA_URL_JS = (ConnectionManager.DATA + ":text/javascript" + URI_SUFFIX).getBytes();
	private static final byte[] DATA_URL_IMG_JPG = (ConnectionManager.DATA + ":image/jpeg" + URI_SUFFIX).getBytes();
	private static final byte[] DATA_URL_IMG_PNG = (ConnectionManager.DATA + ":image/png" + URI_SUFFIX).getBytes();
	private static final byte[] DATA_URL_CSS = (ConnectionManager.DATA + ":text/css" + URI_SUFFIX).getBytes();
	private static final byte[] DATA_URL_PLAIN = (ConnectionManager.DATA + ":text/plain" + URI_SUFFIX).getBytes();

	/**
	 * Creates a connection and returns it. Calling this method without care may saturate BB capacity.
	 *
	 * @param url a http:// or data:// URL
	 */
	public static HttpConnection getUnmanagedConnection(String url,	HttpHeaders requestHeaders, byte[] postData) {
		HttpConnection conn = null;
		OutputStream out = null;
		boolean internalReferrer = false;
		String referrer = "";
		// Check if the HttpHeaders are null. If not, dive into them to see if the referrer is internal or not.
		if (requestHeaders != null) {
			referrer = requestHeaders.getPropertyValue(REFERRER_KEY);
			if (referrer != null && referrer.length() > 0) {
				if (referrer.startsWith(DATA + ":text")) {
					internalReferrer = true;
				}
			}
		}
		if ((url != null) && (url.trim().length() > 0)) {
			if (internalReferrer && !url.startsWith("http")) {
				conn = getDataProtocolConnection(url, referrer);
			} else {
				conn = isInternal(url,null) ? getDataProtocolConnection(url, null) : getExternalConnection(url);
			}
		} else {
			return conn;
		}
		try {
			//conn = setConnectionRequestHeaders(url, requestHeaders, conn);
			if (postData == null) {
				conn.setRequestMethod(HttpConnection.GET);
			} else {
				conn.setRequestMethod(HttpConnection.POST);
				conn.setRequestProperty(HttpProtocolConstants.HEADER_CONTENT_LENGTH, String.valueOf(postData.length));
				out = conn.openOutputStream();
				out.write(postData);
			}
		} catch (IOException e1) {
		} finally {
			if (out != null) {
				try {
					out.close();
				} catch (IOException e2) {
				}
			}
		}
		return conn;
	}
	public static HttpConnection setConnectionRequestHeaders(String url, HttpHeaders requestHeaders, HttpConnection conn) {
		HttpConnection returnConn = conn;
		if (requestHeaders != null) {
			// From
			// http://www.w3.org/Protocols/rfc2616/rfc2616-sec15.html#sec15.1.3
			//
			// Clients SHOULD NOT include a Referer header field in a
			// (non-secure) HTTP
			// request if the referring page was transferred with a secure
			// protocol.
			String referer = requestHeaders.getPropertyValue(REFERRER_KEY);
			boolean sendReferrer = true;

			if (referer != null	&& StringUtilities.startsWithIgnoreCase(referer,"https:") && !StringUtilities.startsWithIgnoreCase(url, "https:")) {
				sendReferrer = false;
			}

			int size = requestHeaders.size();
			for (int i = 0; i < size;) {
				String header = requestHeaders.getPropertyKey(i);

				// Remove referer header if needed.
				if (!sendReferrer && header.equals(REFERRER_KEY)) {
					requestHeaders.removeProperty(i);
					--size;
					continue;
				}

				String value = requestHeaders.getPropertyValue(i++);
				if (value != null) {
					try {
						returnConn.setRequestProperty(header, value);
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}
		}
		return returnConn;
	}
	/**
	 * Loads an external URL and provides a connection that holds the array of bytes. Internal
	 * URLs (data://) simply pass through.
	 *
	 * @param url a http:// or data:// URL 
	 */
	public InputConnection getPreLoadedConnection(String url) {
		InputConnection connection = getUnmanagedConnection(url, null, null);
		if ((connection != null) && (!isInternal(url, null))) {
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
	 * @param resource 
	 */
	public static boolean isInternal(String url, RequestedResource resource) {
		if (resource != null) {
			if (resource.getRequestHeaders() != null) {
				String referrer = resource.getRequestHeaders().getPropertyValue(REFERRER_KEY);
				Hashtable hash = resource.getRequestHeaders().toHashtable();
				if (referrer != null && referrer.length() > 0) {
					if (referrer.startsWith("data:text") && !url.startsWith("http")) {
						return true;
					}
				}
			}
		}
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
			HttpConnection con = (HttpConnection)Connector.open(url);
			return con;
		} catch (Exception ex) {
			return null;
		}
	}

	private static HttpConnection getDataProtocolConnection(String url, String referrer) {
		String dataUrl = url.startsWith(ConnectionManager.DATA_PROTOCOL) ? url.substring(ConnectionManager.DATA_PROTOCOL.length() - 1) : url;
		// Clean up the URL from BB's weird bullshit.
		if (dataUrl.startsWith("data://text/")) {
			dataUrl = dataUrl.substring(12);
		}
		// Save local directory.
		int slashPos = dataUrl.lastIndexOf('/');
		String directory = dataUrl.substring(0,slashPos+1);
		// Check whether the referrer has already been processed (ignore if URL uses an absolute path reference).
		if (referrer != null && !dataUrl.startsWith("/")) {
			if (dirHash.containsKey(referrer)) {
				String referrerDirectory = ((String) dirHash.get(referrer));
				dataUrl = referrerDirectory + dataUrl;
				directory = referrerDirectory + directory;
			}
		}
		// Read internal resource and encode as Base64, then return as HttpConnection object.
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		try {
			if (dataUrl.endsWith(".html") || dataUrl.endsWith(".htm")) {
				output.write(ConnectionManager.DATA_URL_HTML);
			} else if (dataUrl.endsWith(".js")) {
				output.write(ConnectionManager.DATA_URL_JS);
			} else if (dataUrl.endsWith(".jpg") || dataUrl.endsWith(".jpeg")) {
				output.write(ConnectionManager.DATA_URL_IMG_JPG);
			} else if (dataUrl.endsWith(".png")) {
				output.write(ConnectionManager.DATA_URL_IMG_PNG);
			} else if (dataUrl.endsWith(".css")) {
				output.write(ConnectionManager.DATA_URL_CSS);
			} else {
				output.write(ConnectionManager.DATA_URL_PLAIN);
			}
			Base64OutputStream boutput = new Base64OutputStream(output);
			InputStream theResource = Application.class.getResourceAsStream(dataUrl);
			byte[] resourceBytes = read(theResource);
			boutput.write(resourceBytes);
			boutput.flush();
			boutput.close();
			output.flush();
			output.close();
			String outString = output.toString();
			Connection outputCon = Connector.open(outString);
			if (!dirHash.containsKey(outString)) {
				dirHash.put(outString, directory);
			}
			HttpConnection outputHttp = (HttpConnection) outputCon;
			return outputHttp; 
		} catch (IOException ex) {
			return null;
		}
	}

	public static byte[] read(InputStream input) throws IOException {
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
