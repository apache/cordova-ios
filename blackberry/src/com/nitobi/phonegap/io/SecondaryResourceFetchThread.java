/*
 * SecondaryResourceFetchThread.java
 *
 * Copyright © 1998-2008 Research In Motion Ltd.
 * 
 * Note: For the sake of simplicity, this sample application may not leverage
 * resource bundles and resource strings.  However, it is STRONGLY recommended
 * that application developers make use of the localization features available
 * within the BlackBerry development platform to ensure a seamless application
 * experience across a variety of languages and geographies.  For more information
 * on localizing your application, please refer to the BlackBerry Java Development
 * Environment Development Guide associated with this release.
 */

package com.nitobi.phonegap.io;

import java.util.Vector;

import javax.microedition.io.HttpConnection;

import net.rim.device.api.browser.field.BrowserContent;
import net.rim.device.api.browser.field.RequestedResource;


public class SecondaryResourceFetchThread extends Thread 
{

    /**
     * Callback browser field.
     */
    private BrowserContent _browserField;
    
    /**
     * Images to retrieve.
     */
    private Vector _imageQueue;
    
    /**
     * True is all images have been enqueued.
     */
    private boolean _done;
    
    /**
     * Sync object.
     */
    private static Object _syncObject = new Object();
    
    /**
     * Secondary thread.
     */
    private static SecondaryResourceFetchThread _currentThread;
    
    
    /**
     * Enqueues secondary resource for a browser field.
     * 
     * @param resource - resource to retrieve.
     * @param referrer - call back browsr field.
     */
    public static void enqueue(RequestedResource resource, BrowserContent referrer) 
    {
        if (resource == null) 
        {
            return;
        }
        
        synchronized( _syncObject ) 
        {
            
            // Create new thread.
            if (_currentThread == null) 
            {
                _currentThread = new SecondaryResourceFetchThread();
                _currentThread.start();
            } 
            else 
            {
                // If thread alread is running, check that we are adding images for the same browser field.
                if (referrer != _currentThread._browserField) 
                {  
                    synchronized( _currentThread._imageQueue) 
                    {
                        // If the request is for a different browser field,
                        // clear old elements.
                        _currentThread._imageQueue.removeAllElements();
                    }
                }
            }   
            
            synchronized( _currentThread._imageQueue) 
            {
                _currentThread._imageQueue.addElement(resource);
            }
            
            _currentThread._browserField = referrer;
        }
    }
    
    /**
     * Constructor
     *
     */
    private SecondaryResourceFetchThread() 
    {
        _imageQueue = new Vector();        
    }
    
    /**
     * Indicate that all images have been enqueued for this browser field.
     */
    static void doneAddingImages() 
    {
        synchronized( _syncObject ) 
        {
            if (_currentThread != null) 
            {
                _currentThread._done = true;
            }
        }
    }
    
    public void run() 
    {
        while (true) 
        {
            if (_done) 
            {
                // Check if we are done requesting images.
                synchronized( _syncObject ) 
                {
                    synchronized( _imageQueue ) 
                    {
                        if (_imageQueue.size() == 0) 
                        {
                            _currentThread = null;   
                            break;
                        }
                    }
                }
            }
            
            RequestedResource resource = null;
                              
            // Request next image.
            synchronized( _imageQueue ) 
            {
                if (_imageQueue.size() > 0) 
                {
                    resource = (RequestedResource)_imageQueue.elementAt(0);
                    _imageQueue.removeElementAt(0);
                }
            }
            
            if (resource != null) 
            {
                
                HttpConnection connection = ConnectionManager.getUnmanagedConnection(resource.getUrl(), resource.getRequestHeaders(), null);
                resource.setHttpConnection(connection);
                
                // Signal to the browser field that resource is ready.
                if (_browserField != null) 
                {            
                    _browserField.resourceReady(resource);
                }
            }
        }       
    }   
    
}
