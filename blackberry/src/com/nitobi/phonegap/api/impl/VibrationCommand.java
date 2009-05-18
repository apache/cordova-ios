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
public class VibrationCommand implements Command {

	private static final int DURATION = 5;
	private static final String CODE = "gap://vibrate"; 

	/**
	 * Able to run the <i>vibrate</i> command. Ex: gap://vibrate/10
	 */
	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}

	/**
	 * Checks if the phone has the require vibration module and
	 * activates it (by default, for 5 seconds).
	 */
	public String execute(String instruction) {
		if (Alert.isVibrateSupported()) Alert.startVibrate(getVibrateDuration(instruction));
		return null;
	}

	private int getVibrateDuration(String instruction) {
		try {
			return Integer.parseInt(instruction.substring(instruction.lastIndexOf('/') + 1));
		} catch(Exception ex) {
			return DURATION;
		}
	}

}