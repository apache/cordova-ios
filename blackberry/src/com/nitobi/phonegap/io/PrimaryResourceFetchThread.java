package com.nitobi.phonegap.io;

import javax.microedition.io.HttpConnection;

import net.rim.device.api.browser.field.Event;
import net.rim.device.api.io.http.HttpHeaders;

import com.nitobi.phonegap.PhoneGap;

public class PrimaryResourceFetchThread extends Thread 
{
    private PhoneGap _application;
    private Event _event;
    private byte[] _postData;
    private HttpHeaders _requestHeaders;
    private String _url;
    
    public PrimaryResourceFetchThread(String url, HttpHeaders requestHeaders, byte[] postData, 
                                  Event event, PhoneGap application) 
    {
        _url = url;
        _requestHeaders = requestHeaders;
        _postData = postData;
        _application = application;
        _event = event;
    }

    public void run() 
    {
    	HttpConnection connection = null;
    	if (_url.startsWith(PhoneGap.PHONEGAP_PROTOCOL)) {
    		connection = _application._currentConnection;
    	} else {
    		connection = ConnectionManager.getUnmanagedConnection(_url, _requestHeaders, _postData);
    	}
        _application.processConnection(connection, _event);        
    }
}
