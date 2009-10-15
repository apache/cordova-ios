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
	private static final String EMULATOR = "Emulator";
	private static final String DEVICE_NAME = ";device.name = '";
	private static final String DEVICE_FLASH = "';device.flash = ";
	private static final String DEVICE_PLATFORM = ";device.platform = '";
	private static final String DEVICE_VENDOR = "';device.vendor = '";
	private static final String DEVICE_BATTERY = "';device.battery = ";
	private static final String DEVICE_VERSION = ";device.version = '";
	private static final String DEVICE_SIMULATOR = "';device.isSimulator = ";
	private static final String DEVICE_CAMERA = ";device.hasCamera = ";
	private static final String DEVICE_UUID = ";device.uuid = ";
	private static final String SEMI_COLON = ";device.uuid = ";

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
		StringBuffer deviceInfo = new StringBuffer(DEVICE_NAME);
		deviceInfo.append(DeviceInfo.getDeviceName()).append(DEVICE_FLASH);
		deviceInfo.append(DeviceInfo.getTotalFlashSize()).append(DEVICE_PLATFORM);
		deviceInfo.append(DeviceInfo.getPlatformVersion().length()>0?DeviceInfo.getPlatformVersion():EMULATOR).append(DEVICE_VENDOR);
		deviceInfo.append(DeviceInfo.getManufacturerName()).append(DEVICE_BATTERY);
		deviceInfo.append(DeviceInfo.getBatteryLevel()).append(DEVICE_VERSION);
		deviceInfo.append(DeviceInfo.getSoftwareVersion()).append(DEVICE_SIMULATOR);
		deviceInfo.append(DeviceInfo.isSimulator()).append(DEVICE_CAMERA);
		deviceInfo.append(DeviceInfo.hasCamera()).append(DEVICE_UUID);
		deviceInfo.append(DeviceInfo.getDeviceId()).append(SEMI_COLON);
		return deviceInfo.toString();
	}

}
