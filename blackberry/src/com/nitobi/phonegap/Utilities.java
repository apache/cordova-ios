package com.nitobi.phonegap;

import java.io.IOException;
import java.io.OutputStream;

import javax.microedition.io.Connector;
import javax.microedition.io.HttpConnection;

import net.rim.device.api.io.http.HttpHeaders;
import net.rim.device.api.io.http.HttpProtocolConstants;
import net.rim.device.api.util.StringUtilities;




/**
 * 
 */
public class Utilities {
    
    public static HttpConnection makeConnection(String url, HttpHeaders requestHeaders, byte[] postData) {
        
        HttpConnection conn = null;
        OutputStream out = null;
        
        try {
            conn = (HttpConnection) Connector.open(url);           

            if (requestHeaders != null) {
                // From
                // http://www.w3.org/Protocols/rfc2616/rfc2616-sec15.html#sec15.1.3
                //
                //     Clients SHOULD NOT include a Referer header
                //     field in a (non-secure) HTTP request if the
                //     referring page was transferred with a secure
                //     protocol.
                String referer = requestHeaders.getPropertyValue("referer");
                boolean sendReferrer = true;
                if (referer != null && StringUtilities.startsWithIgnoreCase(referer, "https:") && !StringUtilities.startsWithIgnoreCase(url, "https:")) {             
                    sendReferrer = false;
                }
                
                int size = requestHeaders.size();
                for (int i = 0; i < size;) {                    
                    String header = requestHeaders.getPropertyKey(i);
                    
                    // remove referer header if needed
                    if ( !sendReferrer && header.equals("referer")) {
                        requestHeaders.removeProperty(i);
                        --size;
                        continue;
                    }
                    
                    String value = requestHeaders.getPropertyValue( i++ );
                    if (value != null) {
                        conn.setRequestProperty( header, value);
                    }
                }                
            }                          
            
            if (postData == null) {
                conn.setRequestMethod(HttpConnection.GET);
            } else {
                conn.setRequestMethod(HttpConnection.POST);

                conn.setRequestProperty(
                    HttpProtocolConstants.HEADER_CONTENT_LENGTH,
                    String.valueOf(postData.length));

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
}
