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
package com.nitobi.phonegap.api.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.microedition.io.Connector;
import javax.microedition.io.file.FileConnection;

import net.rim.blackberry.api.invoke.CameraArguments;
import net.rim.blackberry.api.invoke.Invoke;
import net.rim.device.api.io.Base64OutputStream;
import net.rim.device.api.io.file.FileSystemJournal;
import net.rim.device.api.io.file.FileSystemJournalEntry;
import net.rim.device.api.io.file.FileSystemJournalListener;
import net.rim.device.api.system.Characters;
import net.rim.device.api.system.ControlledAccessException;
import net.rim.device.api.system.EventInjector;
import net.rim.device.api.ui.UiApplication;

import com.nitobi.phonegap.PhoneGap;
import com.nitobi.phonegap.api.Command;

/**
 * Switches current application to the camera to take a photo.
 *
 * @author Jose Noheda
 *
 */
public class CameraCommand implements Command {

	private static final int PICTURE_COMMAND = 0;
	private static final String CODE = "PhoneGap=camera"; 
	private static final String CAMERA_ERROR_CALLBACK = ";if (navigator.camera.onError) { navigator.camera.onError(); }";

	private long lastUSN = 0;
	private String photoPath;
	private String returnVal;
	private FileSystemJournalListener listener;
	private PhoneGap berryGap;

	public CameraCommand(PhoneGap phoneGap) {
		berryGap = phoneGap;
		listener = new FileSystemJournalListener() {
			public void fileJournalChanged() {
				long USN = FileSystemJournal.getNextUSN();
				for (long i = USN - 1; i >= lastUSN; --i) {
					FileSystemJournalEntry entry = FileSystemJournal.getEntry(i);
					if (entry != null) {
						if (entry.getEvent() == FileSystemJournalEntry.FILE_CHANGED) {
							if (entry.getPath().indexOf(".jpg") != -1) {
								lastUSN = USN;
								photoPath = entry.getPath();
								
								InputStream theImage;
								byte[] imageBytes;
								Base64OutputStream base64OutputStream = null;
								try {
									FileConnection fconn = (FileConnection)Connector.open("file://" + photoPath);
									imageBytes = new byte[(int) fconn.fileSize()];
									theImage = fconn.openInputStream();
									theImage.read(imageBytes);
									ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream( imageBytes.length );
							    	base64OutputStream = new Base64OutputStream( byteArrayOutputStream );
							    	base64OutputStream.write(imageBytes);
							    	base64OutputStream.flush();
							    	base64OutputStream.close();
							    	byteArrayOutputStream.flush();
							    	byteArrayOutputStream.close();
							    	//int sizeofbase64 = byteArrayOutputStream.toString().length();
							    	returnVal = ";if (navigator.camera.onSuccess) { navigator.camera.onSuccess('"+byteArrayOutputStream.toString()+"'); }";
								} catch (IOException e) {
									e.printStackTrace();
									returnVal = CAMERA_ERROR_CALLBACK;
								}
								berryGap.pendingResponses.addElement(returnVal);
						        closeCamera();
							}
				        }
					}
				}
				lastUSN = USN;
			}
		};
	}
	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}

	/**
	 * Invokes internal camera application.
	 */
	public String execute(String instruction) {
		switch (getCommand(instruction)) {
			case PICTURE_COMMAND:
				photoPath = null;
				returnVal = null;
				UiApplication.getUiApplication().addFileSystemJournalListener(listener);
				Invoke.invokeApplication(Invoke.APP_TYPE_CAMERA, new CameraArguments());
				return "";
		}
		return null;
	}

	private int getCommand(String instruction) {
		String command = instruction.substring(instruction.lastIndexOf('/') + 1);
		if ("picture".equals(command)) return PICTURE_COMMAND;
		return -1;
	}

	public void closeCamera() {
		try {
			UiApplication.getUiApplication().removeFileSystemJournalListener(listener);
			EventInjector.KeyEvent inject = new EventInjector.KeyEvent(EventInjector.KeyEvent.KEY_DOWN, Characters.ESCAPE, 0);
			inject.post();
			inject.post();
		} catch (ControlledAccessException ex) {
            // Don't allow key injection - figure out what to do
        }
	}

}
