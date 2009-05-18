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
public class InitializationCommand implements Command {

	private static final String CODE = "gap://initialize";

	/**
	 * Able to run the <i>initialize</i> command (usually onLoad).
	 */
	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}

	/**
	 * Fills the JS variable Device with:
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
		StringBuffer deviceInfo = new StringBuffer(";Device.model = '");
		deviceInfo.append(DeviceInfo.getDeviceName()).append("';Device.flash = ");
		deviceInfo.append(DeviceInfo.getTotalFlashSize()).append(";Device.platform = '");
		deviceInfo.append(DeviceInfo.getPlatformVersion()).append("';Device.vendor = '");
		deviceInfo.append(DeviceInfo.getManufacturerName()).append("';Device.battery = ");
		deviceInfo.append(DeviceInfo.getBatteryLevel()).append(";Device.version = '");
		deviceInfo.append(DeviceInfo.getSoftwareVersion()).append("';Device.isSimulator = ");
		deviceInfo.append(DeviceInfo.isSimulator()).append(";Device.hasCamera = ");
		deviceInfo.append(DeviceInfo.hasCamera()).append(";Device.uuid = ");
		deviceInfo.append(DeviceInfo.getDeviceId()).append(";");
		return deviceInfo.toString();
	}

}
