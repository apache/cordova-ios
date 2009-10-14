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
package com.nitobi.phonegap.api;

import com.nitobi.phonegap.PhoneGap;
import com.nitobi.phonegap.api.impl.CameraCommand;
import com.nitobi.phonegap.api.impl.ContactsCommand;
import com.nitobi.phonegap.api.impl.DeviceCommand;
import com.nitobi.phonegap.api.impl.GeoLocationCommand;
import com.nitobi.phonegap.api.impl.MediaCommand;
import com.nitobi.phonegap.api.impl.NetworkCommand;
import com.nitobi.phonegap.api.impl.NotificationCommand;
import com.nitobi.phonegap.api.impl.TelephonyCommand;

/**
 * Given a execution request detects matching {@link Command} and executes it.
 *
 * @author Jose Noheda
 *
 */
public final class CommandManager {

	// List of installed Commands
	private Command[] commands = new Command[8]; 

	public CommandManager(PhoneGap phoneGap) {
		commands[0] = new CameraCommand(phoneGap);
		commands[1] = new ContactsCommand();
		commands[2] = new NotificationCommand();
		commands[3] = new TelephonyCommand();
		commands[4] = new GeoLocationCommand();
		commands[5] = new DeviceCommand();	
		commands[6] = new MediaCommand();
		commands[7] = new NetworkCommand();
	}

	/**
	 * Receives a request for execution and fulfills it as long as one of
	 * the configured {@link Command} can understand it. Command precedence
	 * is important (just one of them will be executed).
	 *
	 * @param instruction any API command
	 * @return JS code to execute by the client or null
	 */
	public String processInstruction(String instruction) {
		for (int index = 0; index < commands.length; index++) {
			Command command = (Command) commands[index]; 
			if (command.accept(instruction))
				try {
					return command.execute(instruction);
				} catch(Exception e) {
					System.out.println("Exception executing command [" + instruction + "]: " + e.getMessage());
				}
		}
		return null;
	}

}
