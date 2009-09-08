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
import java.util.Vector;

import javax.microedition.io.Connection;
import javax.microedition.io.Connector;
import javax.microedition.io.HttpConnection;
import javax.microedition.io.InputConnection;

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
	private static final byte[] DATA_URL_HTML = (ConnectionManager.DATA + ":text/html" + URI_SUFFIX).getBytes();
	private static final byte[] DATA_URL_JS = (ConnectionManager.DATA + ":text/javascript" + URI_SUFFIX).getBytes();
	private static final byte[] DATA_URL_IMG_JPG = (ConnectionManager.DATA + ":image/jpeg" + URI_SUFFIX).getBytes();
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
		if ((url != null) && (url.trim().length() > 0)) {
			conn = isInternal(url) ? getDataProtocolConnection(url) : getExternalConnection(url);
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
			String referer = requestHeaders.getPropertyValue("referer");
			boolean sendReferrer = true;

			if (referer != null	&& StringUtilities.startsWithIgnoreCase(referer,"https:") && !StringUtilities.startsWithIgnoreCase(url, "https:")) {
				sendReferrer = false;
			}

			int size = requestHeaders.size();
			for (int i = 0; i < size;) {
				String header = requestHeaders.getPropertyKey(i);

				// Remove referer header if needed.
				if (!sendReferrer && header.equals("referer")) {
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
	public static boolean isInternal(String url) {
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

	private static HttpConnection getDataProtocolConnection(String url) {
		String dataUrl = url.startsWith(ConnectionManager.DATA_PROTOCOL) ? url.substring(ConnectionManager.DATA_PROTOCOL.length() - 1) : url; 
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		try {
			if (dataUrl.endsWith(".html") || dataUrl.endsWith(".htm")) {
				output.write(ConnectionManager.DATA_URL_HTML);
			} else if (dataUrl.endsWith(".js")) {
				output.write(ConnectionManager.DATA_URL_JS);
			} else if (dataUrl.endsWith(".jpg") || dataUrl.endsWith(".jpeg")) {
				output.write(ConnectionManager.DATA_URL_IMG_JPG);
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
			Connection outputCon = Connector.open(output.toString());
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
