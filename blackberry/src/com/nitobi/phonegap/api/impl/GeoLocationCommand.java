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

import javax.microedition.location.Location;
import javax.microedition.location.LocationException;
import javax.microedition.location.LocationListener;
import javax.microedition.location.LocationProvider;

import net.rim.blackberry.api.invoke.Invoke;
import net.rim.blackberry.api.invoke.MapsArguments;

import com.nitobi.phonegap.api.Command;
import com.nitobi.phonegap.model.Position;

/**
 * Wraps all GPS functions.
 *
 * @author Jose Noheda
 *
 */
public class GeoLocationCommand implements Command {

	private static final int MAP_COMMAND = 0;
	private static final int STOP_COMMAND = 1;
	private static final int START_COMMAND = 2;
	private static final int CHECK_COMMAND = 3;
	private static final int CAPTURE_INTERVAL = 5;
	private static final String CODE = "PhoneGap=location";

	private Position position;
	private boolean availableGPS = true;
	private LocationProvider locationProvider;

	public GeoLocationCommand() {
		try {
			locationProvider = LocationProvider.getInstance(null);
		} catch (LocationException e) {
			availableGPS = false;
		}
	}
	/**
	 * Determines whether the specified instruction is accepted by the command. 
	 * @param instruction The string instruction passed from JavaScript via cookie.
	 * @return true if the Command accepts the instruction, false otherwise.
	 */
	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}

	/**
	 * Deletes the last valid obtained position.
	 */
	public void clearPosition() {
		position = null;
	}

	/**
	 * Executes the following sub-commands:
	 *   START: Initializes the internal GPS module
	 *   STOP:  Stops GPS module (saving battery life)
	 *   CHECK: Reads latest position available
	 *   MAP:   Invokes the internal MAP application
	 */
	public String execute(String instruction) {
		if (!availableGPS) return ";alert('GPS not available');";
		switch (getCommand(instruction)) {
			case MAP_COMMAND:	if (position != null) Invoke.invokeApplication(Invoke.APP_TYPE_MAPS, new MapsArguments(MapsArguments.ARG_LOCATION_DOCUMENT, getLocationDocument()));
								break;
			case STOP_COMMAND:  clearPosition();
								locationProvider.setLocationListener(null, 0, 0, 0);
								return ";navigator.geolocation.started = false;navigator.geolocation.lastPosition = null;";
			case START_COMMAND: locationProvider.setLocationListener(new LocationListenerImpl(this), CAPTURE_INTERVAL, 1, 1);
								return ";navigator.geolocation.started = true;";
			case CHECK_COMMAND: if (position != null) return ";navigator.geolocation.lastPosition = " + position.toJavascript() + ";";
		}
		return null;
	}
	/**
	 * Parses the specified instruction and the parameters and determines what type of functional call is being made.
	 * @param instruction The string instruction passed from JavaScript via cookie.
	 * @return Integer representing action type.
	 */
	private int getCommand(String instruction) {
		String command = instruction.substring(instruction.lastIndexOf('/') + 1);
		if ("map".equals(command)) return MAP_COMMAND;
		if ("stop".equals(command)) return STOP_COMMAND;
		if ("start".equals(command)) return START_COMMAND;
		if ("check".equals(command)) return CHECK_COMMAND;
		return -1;
	}

	private void updateLocation(double lat, double lng, float speed, float heading, float altitude) {
		position = new Position();
		position.setLatitude(lat);
		position.setLongitude(lng);
		position.setVelocity(speed);
		position.setHeading(heading);
		position.setAltitude(altitude);
	}

	private String getLocationDocument() {
    	StringBuffer location = new StringBuffer("<location-document><location x=\"");
    	location.append(position.getLatitude()).append("\" y=\"");
    	location.append(position.getLongitude()).append("\" label=\"Here\" description=\"Unavailable\"");
    	location.append("/></location-document>");
    	return location.toString();
    }

	/**
     * Implementation of the LocationListener interface
     */
	private class LocationListenerImpl implements LocationListener {

		private GeoLocationCommand command;

		public LocationListenerImpl(GeoLocationCommand command) {
			this.command = command;
		}

		public void locationUpdated(LocationProvider provider, Location location) {
            if (location.isValid()) {
                float heading = location.getCourse();
                double longitude = location.getQualifiedCoordinates().getLongitude();
                double latitude = location.getQualifiedCoordinates().getLatitude();
                float altitude = location.getQualifiedCoordinates().getAltitude();
                float speed = location.getSpeed();
                command.updateLocation(latitude, longitude, speed, heading, altitude);
            } else command.clearPosition();
        }

        public void providerStateChanged(LocationProvider provider, int newState) {
        	switch (newState) {
        	case LocationProvider.AVAILABLE:
        		break;
        	case LocationProvider.OUT_OF_SERVICE:
        		// TODO: Should call fail() here.
        		break;
        	case LocationProvider.TEMPORARILY_UNAVAILABLE:
        		break;
        	}
        	
        }
    }

}
