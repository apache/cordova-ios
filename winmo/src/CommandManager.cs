using System;
using System.Collections.Generic;
using System.Text;

namespace PhoneGap {

    class CommandManager {

        private Command[] commands = new Command[1];

        public CommandManager() {
            commands[0] = new InitializationCommand();
        }

        public String processInstruction(String instruction) {
            for (int index = 0; index < commands.Length; index++) {
			    Command command = (Command) commands[index]; 
			    if (command.accept(instruction))
			        try {
				        return command.execute(instruction);
			        } catch(Exception e) {
				        
			        }
		    }
		    return null;
        }
    }

}
