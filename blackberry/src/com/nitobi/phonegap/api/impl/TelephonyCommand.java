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

import net.rim.blackberry.api.invoke.Invoke;
import net.rim.blackberry.api.invoke.PhoneArguments;

import com.nitobi.phonegap.api.Command;

/**
 * Makes a telephone call by switching to the internal application.
 *
 * @author Jose Noheda
 *
 */
public class TelephonyCommand implements Command {

	private static final String CODE = "PhoneGap=call"; 

	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}

	/**
	 * Invokes internal phone application.
	 */
	public String execute(String instruction) {
		String number = getNumber(instruction);
		if (number != null)
			Invoke.invokeApplication(Invoke.APP_TYPE_PHONE, new PhoneArguments(PhoneArguments.ARG_CALL, number));
		return null;
	}

	private String getNumber(String instruction) {
		try {
			return instruction.substring(instruction.lastIndexOf('/') + 1);
		} catch(Exception ex) {
			return null;
		}
	}

}
