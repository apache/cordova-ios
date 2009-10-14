package com.nitobi.phonegap.io;

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
        _application.processConnection(ConnectionManager.getUnmanagedConnection(_url, _requestHeaders, _postData), _event);        
    }
}
