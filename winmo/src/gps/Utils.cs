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

#endregion

namespace Microsoft.WindowsMobile.Samples.Location
{
    /// <summary>
    /// Summary description for Utils.
    /// </summary>
    public class Utils
    {
        public Utils()
        {
        }

        public static IntPtr LocalAlloc(int byteCount)
        {
            IntPtr ptr = Win32.LocalAlloc(Win32.LMEM_ZEROINIT, byteCount);
            if (ptr == IntPtr.Zero)
            {
                throw new OutOfMemoryException();
            }

            return ptr;
        }

        public static void LocalFree(IntPtr hMem)
        {
            IntPtr ptr = Win32.LocalFree(hMem);
            if (ptr != IntPtr.Zero)
            {
                throw new ArgumentException();
            }
        }
    }

    public class Win32
    {
        public const int LMEM_ZEROINIT = 0x40;
        [System.Runtime.InteropServices.DllImport("coredll.dll", EntryPoint = "#33", SetLastError = true)]
        public static extern IntPtr LocalAlloc(int flags, int byteCount);

        [System.Runtime.InteropServices.DllImport("coredll.dll", EntryPoint = "#36", SetLastError = true)]
        public static extern IntPtr LocalFree(IntPtr hMem);
    }
}
