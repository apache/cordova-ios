#region Using directives

using System;

#endregion

namespace Microsoft.WindowsMobile.Samples.Location
{
    /// <summary>
    /// Event args used for LocationChanged events.
    /// </summary>
    public class LocationChangedEventArgs: EventArgs
    {
        public LocationChangedEventArgs(GpsPosition position)
        {
            this.position = position;
        }

        /// <summary>
        /// Gets the new position when the GPS reports a new position.
        /// </summary>
        public GpsPosition Position
        {
            get 
            {
                return position;
            }
        }

        private GpsPosition position;

    }
}
