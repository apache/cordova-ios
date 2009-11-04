#include <iostream>
#include "debug.h"

using namespace PhoneGap;

Debug::Debug()
{
}

void Debug::log(QString string)
{
    std::cout << string.toAscii().data() << std::endl;
}

void Debug::processMessage(QString string)
{
    std::cout << string.toAscii().data() << std::endl;
}
