using System;
using System.Collections.Generic;
using System.Windows.Forms;

namespace PhoneGap {

    static class Program {

        [MTAThread]
        static void Main() {
            Application.Run(new WebForm());
        }

    }

}