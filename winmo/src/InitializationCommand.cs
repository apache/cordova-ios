using System;
using System.Text;
using System.Runtime.InteropServices;

namespace PhoneGap {

    internal partial class PInvoke {

        [DllImport("Coredll.dll", EntryPoint = "SystemParametersInfoW", CharSet = CharSet.Unicode)]
        static extern int SystemParametersInfo4Strings(uint uiAction, uint uiParam, StringBuilder pvParam, uint fWinIni);

        public enum SystemParametersInfoActions : uint {
            SPI_GETPLATFORMTYPE = 257, // this is used elsewhere for Smartphone/PocketPC detection
            SPI_GETOEMINFO = 258,
        }

        public static string GetOemInfo() {
            StringBuilder oemInfo = new StringBuilder(50);
            if (SystemParametersInfo4Strings((uint)SystemParametersInfoActions.SPI_GETOEMINFO,
                (uint)oemInfo.Capacity, oemInfo, 0) == 0)
                throw new Exception("Error getting OEM info.");
            return oemInfo.ToString();
        }

    }

    internal partial class PlatformDetection {
        private const string MicrosoftEmulatorOemValue = "Microsoft DeviceEmulator";
        public static bool IsEmulator() {
            return PInvoke.GetOemInfo() == MicrosoftEmulatorOemValue;
        }
    }

    class InitializationCommand : Command {

        #region Command Members

        Boolean Command.accept(String instruction) {
            return "/initialize".Equals(instruction);
        }

        String Command.execute(string instruction) {
            return ";Device.model = '" + PInvoke.GetOemInfo() + "';";
        }

        #endregion
    }

}
