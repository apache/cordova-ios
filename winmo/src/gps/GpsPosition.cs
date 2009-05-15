//
// Copyright (c) Microsoft Corporation.  All rights reserved.
//
//
// Use of this source code is subject to the terms of the Microsoft end-user
// license agreement (EULA) under which you licensed this SOFTWARE PRODUCT.
// If you did not accept the terms of the EULA, you are not authorized to use
// this source code. For a copy of the EULA, please see the LICENSE.RTF on your
// install media.
//
#region Using directives

using System;
using System.Runtime.InteropServices;
using System.Collections;

#endregion

namespace Microsoft.WindowsMobile.Samples.Location
{
    #region Internal Native Structures
    [StructLayout(LayoutKind.Sequential)]
    internal struct SystemTime
    {
        internal short year;
        internal short month;
        internal short dayOfWeek;
        internal short day;
        internal short hour;
        internal short minute;
        internal short second;
        internal short millisecond;
    }

    [StructLayout(LayoutKind.Sequential)]
    internal struct SatelliteArray
    {
        int a, b, c, d, e, f, g, h, i, j, k, l;

        public int Count
        {
            get { return 12; }
        }

        public int this[int value]
        {
            get
            {
                if (value == 0) return a;
                else if (value == 1) return b;
                else if (value == 2) return c;
                else if (value == 3) return d;
                else if (value == 4) return e;
                else if (value == 5) return f;
                else if (value == 6) return g;
                else if (value == 7) return h;
                else if (value == 8) return i;
                else if (value == 9) return j;
                else if (value == 10) return k;
                else if (value == 11) return l;
                else throw new ArgumentOutOfRangeException("value must be 0 - 11");
            }
        }
    }
    #endregion
    
    enum FixQuality : int
    {
        Unknown = 0,
        Gps,
        DGps
    }
    enum FixType : int
    {
        Unknown = 0,
        XyD,
        XyzD
    }

    enum FixSelection : int
    {
        Unknown = 0,
        Auto,
        Manual
    }

    public class Satellite
    {
        public Satellite() { }
        public Satellite(int id, int elevation, int azimuth, int signalStrength)
        {
            this.id = id;
            this.elevation = elevation;
            this.azimuth = azimuth;
            this.signalStrength = signalStrength;
        }

        int id;
        /// <summary>
        /// Id of the satellite
        /// </summary>
        public int Id
        {
            get
            {
                return id;
            }
            set
            {
                id = value;
            }
        }


        int elevation;
        /// <summary>
        /// Elevation of the satellite
        /// </summary>
        public int Elevation
        {
            get
            {
                return elevation;
            }
            set
            {
                elevation = value;
            }
        }


        int azimuth;
        /// <summary>
        /// Azimuth of the satellite
        /// </summary>
        public int Azimuth
        {
            get
            {
                return azimuth;
            }
            set
            {
                azimuth = value;
            }
        }


        int signalStrength;
        /// <summary>
        /// SignalStrenth of the satellite
        /// </summary>
        public int SignalStrength
        {
            get
            {
                return signalStrength;
            }
            set
            {
                signalStrength = value;
            }
        }

    }

    [StructLayout(LayoutKind.Sequential)]
    public class GpsPosition
    {
        internal GpsPosition() { }
        internal static int GPS_VALID_UTC_TIME = 0x00000001;
        internal static int GPS_VALID_LATITUDE = 0x00000002;
        internal static int GPS_VALID_LONGITUDE = 0x00000004;
        internal static int GPS_VALID_SPEED = 0x00000008;
        internal static int GPS_VALID_HEADING = 0x00000010;
        internal static int GPS_VALID_MAGNETIC_VARIATION = 0x00000020;
        internal static int GPS_VALID_ALTITUDE_WRT_SEA_LEVEL = 0x00000040;
        internal static int GPS_VALID_ALTITUDE_WRT_ELLIPSOID = 0x00000080;
        internal static int GPS_VALID_POSITION_DILUTION_OF_PRECISION = 0x00000100;
        internal static int GPS_VALID_HORIZONTAL_DILUTION_OF_PRECISION = 0x00000200;
        internal static int GPS_VALID_VERTICAL_DILUTION_OF_PRECISION = 0x00000400;
        internal static int GPS_VALID_SATELLITE_COUNT = 0x00000800;
        internal static int GPS_VALID_SATELLITES_USED_PRNS = 0x00001000;
        internal static int GPS_VALID_SATELLITES_IN_VIEW = 0x00002000;
        internal static int GPS_VALID_SATELLITES_IN_VIEW_PRNS = 0x00004000;
        internal static int GPS_VALID_SATELLITES_IN_VIEW_ELEVATION = 0x00008000;
        internal static int GPS_VALID_SATELLITES_IN_VIEW_AZIMUTH = 0x00010000;
        internal static int GPS_VALID_SATELLITES_IN_VIEW_SIGNAL_TO_NOISE_RATIO = 0x00020000;


        internal int dwVersion = 1;             // Current version of GPSID client is using.
        internal int dwSize = 0;                // sizeof(_GPS_POSITION)

        // Not all fields in the structure below are guaranteed to be valid.  
        // Which fields are valid depend on GPS device being used, how stale the API allows
        // the data to be, and current signal.
        // Valid fields are specified in dwValidFields, based on GPS_VALID_XXX flags.
        internal int dwValidFields = 0;

        // Additional information about this location structure (GPS_DATA_FLAGS_XXX)
        internal int dwFlags = 0;

        //** Time related
        internal SystemTime stUTCTime = new SystemTime(); 	//  UTC according to GPS clock.

        //** Position + heading related
        internal double dblLatitude = 0.0;            // Degrees latitude.  North is positive
        internal double dblLongitude = 0.0;           // Degrees longitude.  East is positive
        internal float flSpeed = 0.0f;                // Speed in knots
        internal float flHeading = 0.0f;              // Degrees heading (course made good).  True North=0
        internal double dblMagneticVariation = 0.0;   // Magnetic variation.  East is positive
        internal float flAltitudeWRTSeaLevel = 0.0f;  // Altitute with regards to sea level, in meters
        internal float flAltitudeWRTEllipsoid = 0.0f; // Altitude with regards to ellipsoid, in meters

        //** Quality of this fix
        // Where did we get fix from?
        internal FixQuality fixQuality = FixQuality.Unknown;        
        // Is this 2d or 3d fix?
        internal FixType fixType = FixType.Unknown;      
        // Auto or manual selection between 2d or 3d mode
        internal FixSelection selectionType = FixSelection.Unknown;     
        // Position Dilution Of Precision
        internal float flPositionDilutionOfPrecision = 0.0f;
        // Horizontal Dilution Of Precision
        internal float flHorizontalDilutionOfPrecision = 0.0f; 
        // Vertical Dilution Of Precision
        internal float flVerticalDilutionOfPrecision = 0.0f;   

        //** Satellite information
        // Number of satellites used in solution
        internal int dwSatelliteCount = 0;               
        // PRN numbers of satellites used in the solution
        internal SatelliteArray rgdwSatellitesUsedPRNs = new SatelliteArray();
        // Number of satellites in view.  From 0-GPS_MAX_SATELLITES
        internal int dwSatellitesInView = 0;                      	                   
        // PRN numbers of satellites in view
        internal SatelliteArray rgdwSatellitesInViewPRNs = new SatelliteArray();                
        // Elevation of each satellite in view
        internal SatelliteArray rgdwSatellitesInViewElevation = new SatelliteArray();           
        // Azimuth of each satellite in view
        internal SatelliteArray rgdwSatellitesInViewAzimuth = new SatelliteArray();             
        // Signal to noise ratio of each satellite in view
        internal SatelliteArray rgdwSatellitesInViewSignalToNoiseRatio = new SatelliteArray();  

        /// <summary>
        /// UTC according to GPS clock.
        /// </summary>
        public DateTime Time
        {
            get
            {
                DateTime time = new DateTime(stUTCTime.year, stUTCTime.month, stUTCTime.day, stUTCTime.hour, stUTCTime.minute, stUTCTime.second, stUTCTime.millisecond);
                return time;
            }

        }
        /// <summary>
        /// True if the Time property is valid, false if invalid
        /// </summary>
        public bool TimeValid
        {
            get { return (dwValidFields & GPS_VALID_UTC_TIME) != 0; }
        }


        /// <summary>
        /// Satellites used in the solution
        /// </summary>
        /// <returns>Array of Satellites</returns>
        public Satellite[] GetSatellitesInSolution()
        {
            Satellite[] inViewSatellites = GetSatellitesInView();
            ArrayList list = new ArrayList();
            for (int index = 0; index < dwSatelliteCount; index++)
            {
                Satellite found = null;
                for (int viewIndex = 0; viewIndex < inViewSatellites.Length && found == null; viewIndex++)
                {
                    if (rgdwSatellitesUsedPRNs[index] == inViewSatellites[viewIndex].Id)
                    {
                        found = inViewSatellites[viewIndex];
                        list.Add(found);
                    }
                }
            }

            return (Satellite[])list.ToArray(typeof(Satellite));
        }
        /// <summary>
        /// True if the SatellitesInSolution property is valid, false if invalid
        /// </summary>
        public bool SatellitesInSolutionValid
        {
            get { return (dwValidFields & GPS_VALID_SATELLITES_USED_PRNS) != 0; }
        }



        /// <summary>
        /// Satellites in view
        /// </summary>
        /// <returns>Array of Satellites</returns>
        public Satellite[] GetSatellitesInView()
        {
            Satellite[] satellites = null;
            if (dwSatellitesInView != 0)
            {
                satellites = new Satellite[dwSatellitesInView];
                for (int index = 0; index < satellites.Length; index++)
                {
                    satellites[index] = new Satellite();
                    satellites[index].Azimuth = rgdwSatellitesInViewAzimuth[index];
                    satellites[index].Elevation = rgdwSatellitesInViewElevation[index];
                    satellites[index].Id = rgdwSatellitesInViewPRNs[index];
                    satellites[index].SignalStrength = rgdwSatellitesInViewSignalToNoiseRatio[index];
                }
            }

            return satellites;
        }
        /// <summary>
        /// True if the SatellitesInView property is valid, false if invalid
        /// </summary>
        public bool SatellitesInViewValid
        {
            get { return (dwValidFields & GPS_VALID_SATELLITES_IN_VIEW) != 0; }
        }


        /// <summary>
        /// Number of satellites used in solution
        /// </summary>
        public int SatelliteCount
        {
            get { return dwSatelliteCount; }
        }
        /// <summary>
        /// True if the SatelliteCount property is valid, false if invalid
        /// </summary>
        public bool SatelliteCountValid
        {
            get { return (dwValidFields & GPS_VALID_SATELLITE_COUNT) != 0; }
        }

        /// <summary>
        /// Number of satellites in view.  
        /// </summary>
        public int SatellitesInViewCount
        {
            get { return dwSatellitesInView; }
        }
        /// <summary>
        /// True if the SatellitesInViewCount property is valid, false if invalid
        /// </summary>
        public bool SatellitesInViewCountValid
        {
            get { return (dwValidFields & GPS_VALID_SATELLITES_IN_VIEW) != 0; }
        }

        /// <summary>
        /// Speed in knots
        /// </summary>
        public float Speed
        {
            get { return flSpeed; }
        }
        /// <summary>
        /// True if the Speed property is valid, false if invalid
        /// </summary>
        public bool SpeedValid
        {
            get { return (dwValidFields & GPS_VALID_SPEED) != 0; }
        }

        /// <summary>
        /// Altitude with regards to ellipsoid, in meters
        /// </summary>
        public float EllipsoidAltitude
        {
            get { return flAltitudeWRTEllipsoid; }
        }
        /// <summary>
        /// True if the EllipsoidAltitude property is valid, false if invalid
        /// </summary>
        public bool EllipsoidAltitudeValid
        {
            get { return (dwValidFields & GPS_VALID_ALTITUDE_WRT_ELLIPSOID) != 0; }
        }

        /// <summary>
        /// Altitute with regards to sea level, in meters
        /// </summary>
        public float SeaLevelAltitude
        {
            get { return flAltitudeWRTSeaLevel; }
        }
        /// <summary>
        /// True if the SeaLevelAltitude property is valid, false if invalid
        /// </summary>
        public bool SeaLevelAltitudeValid
        {
            get { return (dwValidFields & GPS_VALID_ALTITUDE_WRT_SEA_LEVEL) != 0; }
        }

        /// <summary>
        /// Latitude in decimal degrees.  North is positive
        /// </summary>
        public double Latitude
        {
            get { return ParseDegreesMinutesSeconds(dblLatitude).ToDecimalDegrees(); }
        }
        /// <summary>
        /// Latitude in degrees, minutes, seconds.  North is positive
        /// </summary>
        public DegreesMinutesSeconds LatitudeInDegreesMinutesSeconds
        {
            get { return ParseDegreesMinutesSeconds(dblLatitude); }
        }

        /// <summary>
        /// True if the Latitude property is valid, false if invalid
        /// </summary>
        public bool LatitudeValid
        {
            get { return (dwValidFields & GPS_VALID_LATITUDE) != 0; }
        }

        /// <summary>
        /// Longitude in decimal degrees.  East is positive
        /// </summary>
        public double Longitude
        {
            get { return ParseDegreesMinutesSeconds(dblLongitude).ToDecimalDegrees(); }
        }

        /// <summary>
        /// Longitude in degrees, minutes, seconds.  East is positive
        /// </summary>
        public DegreesMinutesSeconds LongitudeInDegreesMinutesSeconds
        {
            get { return ParseDegreesMinutesSeconds(dblLongitude); }
        }
        /// <summary>
        /// True if the Longitude property is valid, false if invalid
        /// </summary>
        public bool LongitudeValid
        {
            get { return (dwValidFields & GPS_VALID_LONGITUDE) != 0; }
        }

        /// <summary>
        /// Degrees heading (course made good).  True North=0
        /// </summary>
        public float Heading
        {
            get { return flHeading; }
        }
        /// <summary>
        /// True if the Heading property is valid, false if invalid
        /// </summary>
        public bool HeadingValid
        {
            get { return (dwValidFields & GPS_VALID_HEADING) != 0; }
        }

        /// <summary>
        /// Position Dilution Of Precision
        /// </summary>
        public float PositionDilutionOfPrecision
        {
            get { return flPositionDilutionOfPrecision; }
        }
        /// <summary>
        /// True if the PositionDilutionOfPrecision property is valid, false if invalid
        /// </summary>
        public bool PositionDilutionOfPrecisionValid
        {
            get { return (dwValidFields & GPS_VALID_POSITION_DILUTION_OF_PRECISION) != 0; }
        }

        /// <summary>
        /// Horizontal Dilution Of Precision
        /// </summary>
        public float HorizontalDilutionOfPrecision
        {
            get { return flHorizontalDilutionOfPrecision; }
        }
        /// <summary>
        /// True if the HorizontalDilutionOfPrecision property is valid, false if invalid
        /// </summary>
        public bool HorizontalDilutionOfPrecisionValid
        {
            get { return (dwValidFields & GPS_VALID_HORIZONTAL_DILUTION_OF_PRECISION) != 0; }
        }

        /// <summary>
        /// Vertical Dilution Of Precision
        /// </summary>
        public float VerticalDilutionOfPrecision
        {
            get { return flVerticalDilutionOfPrecision; }
        }
        /// <summary>
        /// True if the VerticalDilutionOfPrecision property is valid, false if invalid
        /// </summary>
        public bool VerticalDilutionOfPrecisionValid
        {
            get { return (dwValidFields & GPS_VALID_VERTICAL_DILUTION_OF_PRECISION) != 0; }
        }

        /// <summary>
        /// Parses out the degrees, minutes, seconds from the double format returned by
        /// the NMEA GPS device
        /// </summary>
        /// <param name="val">degrees, minutes, seconds as a double</param>
        /// <returns>DegreesMinutesSeconds structure</returns>
        private DegreesMinutesSeconds ParseDegreesMinutesSeconds(double val)
        {
            double degrees = (val / 100.0);
            double minutes = (Math.Abs(degrees) - Math.Abs((double)(int)(degrees))) * 100;
            double seconds = (Math.Abs(val) - Math.Abs((double)(int)val)) * 60.0;

            return new DegreesMinutesSeconds((int)degrees, (int)minutes, seconds);
        }
    }

}
