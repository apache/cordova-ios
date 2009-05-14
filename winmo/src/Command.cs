using System;
using System.Collections.Generic;
using System.Text;

namespace PhoneGap {

    public interface Command {
        String execute(String instruction);
        Boolean accept(String instruction);
    }

}
