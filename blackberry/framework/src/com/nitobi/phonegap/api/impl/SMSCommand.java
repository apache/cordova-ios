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
import net.rim.blackberry.api.invoke.MessageArguments;
import javax.microedition.io.Connector;
import java.io.IOException;
import javax.wireless.messaging.MessageConnection;
import javax.wireless.messaging.TextMessage;

import com.nitobi.phonegap.PhoneGap;
import com.nitobi.phonegap.api.Command;

/**
 * Sends a text message by switching to the internal application.
 *
 * @author Kerry Frey
 *
 */
public class SMSCommand implements Command {

	private static final String CODE = "PhoneGap=send"; 

	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}

	/**
	 * Invokes internal phone application.
	 */
	public String execute(String instruction) {
		String[] params = PhoneGap.splitString(instruction, '/', false);
		String message = params[2];
		if (params.length > 3) {
			for (int index = 3; index < params.length; index++)
			{
				if ( index < params.length)
					message += "/";
				message += params[index];
			}
		}
		MessageConnection mc = null;
		try {
			mc = (MessageConnection)Connector.open( "sms://" );
		} catch (IOException e) {
		// TODO Auto-generated catch block
			e.printStackTrace();
		}
		TextMessage m = ( TextMessage )mc.newMessage( MessageConnection.TEXT_MESSAGE );
		m.setAddress( "sms://" + params[1] );
		m.setPayloadText( message );
		Invoke.invokeApplication(Invoke.APP_TYPE_MESSAGES, new MessageArguments( m ) );
		return null;
	}

}
