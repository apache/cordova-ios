using System;
using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;

namespace PhoneGap
{
    // Need to invoke unmanaged mobile native code from .NET to play sounds. Woot!
    internal partial class PInvoke
    {
        private static IntPtr hSound = IntPtr.Zero; // Pointer/handle of currently-playing sound.
        const int SND_SCOPE_PROCESS = 0x1;
        private enum Flags
        {
            SND_SYNC = 0x0000,  /* play synchronously (default) */
            SND_ASYNC = 0x0001,  /* play asynchronously */
            SND_NODEFAULT = 0x0002,  /* silence (!default) if sound not found */
            SND_MEMORY = 0x0004,  /* pszSound points to a memory file */
            SND_LOOP = 0x0008,  /* loop the sound until next sndPlaySound */
            SND_NOSTOP = 0x0010,  /* don't stop any currently playing sound */
            SND_NOWAIT = 0x00002000, /* don't wait if the driver is busy */
            SND_ALIAS = 0x00010000, /* name is a registry alias */
            SND_ALIAS_ID = 0x00110000, /* alias is a predefined ID */
            SND_FILENAME = 0x00020000, /* name is file name */
            SND_RESOURCE = 0x00040004  /* name is resource name or atom */
        }


        [DllImport("aygshell.dll")]
        static extern uint SndOpen(string pszSoundFile, ref IntPtr phSound);

        [DllImport("aygshell.dll")]
        static extern uint SndPlayAsync(IntPtr hSound, uint dwFlags);

        [DllImport("aygshell.dll")]
        static extern uint SndClose(IntPtr hSound);

        [DllImport("aygshell.dll")]
        static extern uint SndStop(int SoundScope, IntPtr hSound);
        public static bool PlaySound(string path)
        {
            if (File.Exists(path))
            {
                SndOpen(path, ref hSound);
                SndPlayAsync(hSound, 0);
                return true;
            }
            else return false;
        }
        public static void StopSound()
        {
            SndClose(hSound);
            SndStop(SND_SCOPE_PROCESS, hSound);
            hSound = IntPtr.Zero;
        }
    }
    class MediaCommand : Command
    {
        private string soundFileName = "";
        private string soundExtension = "";
        Boolean Command.accept(String instruction)
        {
            Boolean retVal = false;
            if (instruction.StartsWith("/media"))
            {
                int firstSlash = instruction.IndexOf('/',5);
                soundFileName = instruction.Substring(firstSlash);
                soundExtension = soundFileName.Substring(soundFileName.LastIndexOf('.'));
                // TODO: Test what other sound file types work.
                switch (soundExtension)
                {
                    case ".wav":
                    case ".mp3":
                        retVal = true;
                        break;
                }
            }
            return retVal;            
        }
        String Command.execute(String instruction)
        {
            Assembly assembly = Assembly.GetExecutingAssembly();
            string path = "\\Program Files\\" + assembly.GetName().Name + "\\" + soundFileName.Substring(1).Replace("/","\\");
            if (PInvoke.PlaySound(path)) return "";
            else return ";alert(\"[PhoneGap Error] Could not find sound file with path '" + path + "'.\");";
        }
    }
}
