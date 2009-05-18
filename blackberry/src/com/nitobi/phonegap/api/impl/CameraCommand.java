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

import net.rim.blackberry.api.invoke.CameraArguments;
import net.rim.blackberry.api.invoke.Invoke;
import net.rim.device.api.io.file.FileSystemJournal;
import net.rim.device.api.io.file.FileSystemJournalEntry;
import net.rim.device.api.io.file.FileSystemJournalListener;
import net.rim.device.api.system.Characters;
import net.rim.device.api.system.ControlledAccessException;
import net.rim.device.api.system.EventInjector;
import net.rim.device.api.ui.UiApplication;

import com.nitobi.phonegap.api.Command;

/**
 * Switchs current application to the camera.
 *
 * @author Jose Noheda
 *
 */
public class CameraCommand implements Command {

	private static final int INVOKE_COMMAND = 0;
	private static final int PICTURE_COMMAND = 1;
	private static final String CODE = "gap://camera"; 

	private long lastUSN = 0;
	private String photoPath;
	private FileSystemJournalListener listener;

	public CameraCommand() {
		listener = new FileSystemJournalListener() {
			public void fileJournalChanged() {
				long USN = FileSystemJournal.getNextUSN();
				for (long i = USN - 1; i >= lastUSN; --i) {
					FileSystemJournalEntry entry = FileSystemJournal.getEntry(i);
					if (entry != null) {
						if (entry.getEvent() == FileSystemJournalEntry.FILE_ADDED || entry.getEvent() == FileSystemJournalEntry.FILE_CHANGED || entry.getEvent() == FileSystemJournalEntry.FILE_RENAMED) {
							if (entry.getPath().indexOf(".jpg") != -1) {
								lastUSN = USN;
								photoPath = entry.getPath();
						        closeCamera();
							}
				        }
					}
				}
				lastUSN = USN;
			}
		};
	}

	/**
	 * Able to run the <i>camera</i> command. Ex: gap://camera/obtain
	 */
	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}

	/**
	 * Invokes internal camera application.
	 */
	public String execute(String instruction) {
		switch (getCommand(instruction)) {
			case PICTURE_COMMAND:
				UiApplication.getUiApplication().removeFileSystemJournalListener(listener);
				return "navigator.camera.picture = '" + photoPath + "'";
			case INVOKE_COMMAND:
				photoPath = null;
				UiApplication.getUiApplication().addFileSystemJournalListener(listener);
				Invoke.invokeApplication(Invoke.APP_TYPE_CAMERA, new CameraArguments());
		}
		return null;
	}

	private int getCommand(String instruction) {
		String command = instruction.substring(instruction.lastIndexOf('/') + 1);
		if ("obtain".equals(command)) return INVOKE_COMMAND;
		if ("picture".equals(command)) return PICTURE_COMMAND;
		return -1;
	}

	public void closeCamera() {
		try {
			EventInjector.KeyEvent inject = new EventInjector.KeyEvent(EventInjector.KeyEvent.KEY_DOWN, Characters.ESCAPE, 0);
			inject.post();
			inject.post();
		} catch (ControlledAccessException ex) {
            // Don't allow key injection - figure out what to do
        }
	}

}
