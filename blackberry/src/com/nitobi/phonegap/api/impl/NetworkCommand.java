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

import net.rim.device.api.system.RadioInfo;

import com.nitobi.phonegap.api.Command;

/**
 * Vibrates the phone if able.
 *
 * @author Jose Noheda
 *
 */
public class NetworkCommand implements Command {

	private static final int REACHABLE_COMMAND = 0;
	private static final String CODE = "PhoneGap=network";
	private static final int NOT_REACHABLE = 0;
	private static final int REACHABLE_VIA_CARRIER_DATA_NETWORK = 1;
	private static final int REACHABLE_VIA_WIFI_NETWORK = 2;

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
			case REACHABLE_COMMAND:
				if (RadioInfo.isDataServiceOperational()) {
					// Data services available - determine what service to use.
					int service = RadioInfo.getNetworkType();
					int reachability = NOT_REACHABLE;
					if ((service & RadioInfo.NETWORK_802_11) != 0) {
						reachability = REACHABLE_VIA_WIFI_NETWORK;
					}
					if ((service & RadioInfo.NETWORK_GPRS) != 0 || (service & RadioInfo.NETWORK_UMTS) != 0 ) {
						reachability = REACHABLE_VIA_CARRIER_DATA_NETWORK;
					}
					return ";navigator.network.lastReachability = "+reachability+";if (navigator.network.isReachable_success) navigator.network.isReachable_success("+reachability+");";
				} else {
					// No data services - unreachable.
					return ";navigator.network.lastReachability = NetworkStatus.NOT_REACHABLE;if (navigator.network.isReachable_success) navigator.network.isReachable_success(NetworkStatus.NOT_REACHABLE);";
				}
		}
		return null;
	}
	private int getCommand(String instruction) {
		String command = instruction.substring(CODE.length()+1);
		if (command.startsWith("reach")) return REACHABLE_COMMAND;
		return -1;
	}
	
}