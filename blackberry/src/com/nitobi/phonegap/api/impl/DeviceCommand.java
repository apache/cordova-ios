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

import com.nitobi.phonegap.api.Command;
import net.rim.device.api.system.DeviceInfo;

/**
 * Configures the Device API.
 *
 * @author Jose Noheda [jose.noheda@gmail.com]
 *
 */
public class DeviceCommand implements Command {

	private static final String CODE = "PhoneGap=initialize";

	/**
	 * Determines whether the specified instruction is accepted by the command. 
	 * @param instruction The string instruction passed from JavaScript via cookie.
	 * @return true if the Command accepts the instruction, false otherwise.
	 */
	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}

	/**
	 * Fills the JS variable 'device' with:
	 *   Model
	 *   Flash memory available
	 *   Platform
	 *   Vendor
	 *   Battery
	 *   Software version
	 *   Camera support
	 *   ID
	 *   Simulator
	 * 
	 */
	public String execute(String instruction) {
		StringBuffer deviceInfo = new StringBuffer(";device.name = '");
		deviceInfo.append(DeviceInfo.getDeviceName()).append("';device.flash = ");
		deviceInfo.append(DeviceInfo.getTotalFlashSize()).append(";device.platform = '");
		deviceInfo.append(DeviceInfo.getPlatformVersion().length()>0?DeviceInfo.getPlatformVersion():"Emulator").append("';device.vendor = '");
		deviceInfo.append(DeviceInfo.getManufacturerName()).append("';device.battery = ");
		deviceInfo.append(DeviceInfo.getBatteryLevel()).append(";device.version = '");
		deviceInfo.append(DeviceInfo.getSoftwareVersion()).append("';device.isSimulator = ");
		deviceInfo.append(DeviceInfo.isSimulator()).append(";device.hasCamera = ");
		deviceInfo.append(DeviceInfo.hasCamera()).append(";device.uuid = ");
		deviceInfo.append(DeviceInfo.getDeviceId()).append(";");
		return deviceInfo.toString();
	}

}
