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
	private static final String CODE = "PhoneGap="; 

	// The TUNE (bar 1 and 2 of Islamey by Balakirev)
	 private static final short BFlat = 466;   //466.16
	 private static final short AFlat = 415;     //415.30
	 private static final short A = 440; //440.00
	 private static final short GFlat = 370;     //369.99
	 private static final short DFlat = 554;     //554.37
	 private static final short C = 523; //523.25
	 private static final short F = 349; //349.32
	 
	 private static final short TEMPO = 125;
	 
	 // Duration of a 16th note, arbitrary, in ms.
	 private static final short d16 = 1 * TEMPO;
	 
	 // Duration of an eighth note, arbitrary, in ms.
	 private static final short d8 = d16 << 1;
	 
	 // 10 ms pause.
	 private static final short dpause = 10;
	 
	 // Zero frequency pause.
	 private static final short pause = 0;
	 
	 private static final short[] TUNE = new short[]
	 {
	     BFlat, d16, pause, dpause,
	     BFlat, d16, pause, dpause,
	     BFlat, d16, pause, dpause,
	     BFlat, d16, pause, dpause,
	     A, d16, pause, dpause,
	     BFlat, d16, pause, dpause,
	     GFlat, d16, pause, dpause,
	     GFlat, d16, pause, dpause,
	     A, d16, pause, dpause,
	     BFlat, d16, pause, dpause,
	     DFlat, d16, pause, dpause,
	     C, d16, pause, dpause, //bar 1
	     AFlat, d16, pause, dpause,
	     AFlat, d16, pause, dpause,
	     AFlat, d16, pause, dpause,
	     AFlat, d16, pause, dpause,
	     F, d16, pause, dpause,
	     GFlat, d16, pause, dpause,
	     AFlat, d16, pause, dpause,
	     BFlat, d16, pause, dpause,
	     AFlat, d16, pause, dpause,
	     F, d8 + d16 //bar 2
	 };
	
	/**
	 * Able to run the <i>vibrate</i> command. Ex: PhoneGap=vibrate/10
	 */
	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}

	/**
	 * Checks if the phone has the require vibration module and
	 * activates it (by default, for 5 seconds).
	 */
	public String execute(String instruction) {
		switch (getCommand(instruction)) {
			case VIBRATE_COMMAND:
				if (Alert.isVibrateSupported()) Alert.startVibrate(getVibrateDuration(instruction));
				break;
			case BEEP_COMMAND:
				if (Alert.isAudioSupported()) Alert.startAudio(TUNE, 99);
				break;
		}
		return null;
	}
	private int getCommand(String instruction) {
		String command = instruction.substring(instruction.indexOf('/') + 1);
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

}