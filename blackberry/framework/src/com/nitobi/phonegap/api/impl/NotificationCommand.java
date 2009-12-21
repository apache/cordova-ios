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

import net.rim.device.api.system.Alert;

import com.nitobi.phonegap.api.Command;

/**
 * Vibrates the phone if able.
 *
 * @author Jose Noheda
 *
 */
public class NotificationCommand implements Command {

	private static final int VIBRATE_COMMAND = 0;
	private static final int BEEP_COMMAND = 1;
	private static final int DURATION = 5;
	private static final String CODE = "PhoneGap=notification"; 

	private static final short A = 440; //440.00
	private static final short NOTE_DURATION = 500;
	private static final short PAUSE_DURATION = 50;
	private static final int TUNE_LENGTH = 4;
	private static final short[] TUNE = new short[]
	{		
	    A, NOTE_DURATION, 0, PAUSE_DURATION
	};
	/**
	 * Determines whether the specified instruction is accepted by the command. 
	 * @param instruction The string instruction passed from JavaScript via cookie.
	 * @return true if the Command accepts the instruction, false otherwise.
	 */
	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}

	public String execute(String instruction) {
		switch (getCommand(instruction)) {
			case VIBRATE_COMMAND:
				if (Alert.isVibrateSupported()) Alert.startVibrate(getVibrateDuration(instruction));
				break;
			case BEEP_COMMAND:
				if (Alert.isAudioSupported()) Alert.startAudio(getTune(instruction), 99);
				break;
		}
		return null;
	}
	private int getCommand(String instruction) {
		String command = instruction.substring(CODE.length()+1);
		if (command.startsWith("beep")) return BEEP_COMMAND;
		if (command.startsWith("vibrate")) return VIBRATE_COMMAND;
		return -1;
	}
	/**
	 * Parses the vibrate instruction and tries to extract the specified duration. Returns the default duration if there are issues parsing.
	 * @param instruction The instruction called from the JS.
	 * @return The number of seconds the vibration should last.
	 */
	private int getVibrateDuration(String instruction) {
		try {
			return Integer.parseInt(instruction.substring(instruction.lastIndexOf('/') + 1));
		} catch(Exception ex) {
			return DURATION;
		}
	}
	private short[] getTune(String instruction) {
		String beepParam = instruction.substring(CODE.length()+1);
		int param = 1;
		try {
			param = Integer.parseInt(beepParam.substring(beepParam.indexOf('/')+1));
		} catch(Exception e) {
			param = 1;
		}
		short[] theTune = new short[TUNE_LENGTH * param];
		if (param == 1)
			return TUNE;
		else {
			for (int i = 0; i < param; i++) {
				System.arraycopy(TUNE, 0, theTune, i*TUNE_LENGTH, TUNE_LENGTH);
			}
		}
		return theTune;
	}
}