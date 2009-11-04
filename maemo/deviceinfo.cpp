#include "deviceinfo.h"
#include <QString>

using namespace PhoneGap;

DeviceInfo::DeviceInfo()
{

}

QString DeviceInfo::platform() const
{
    return QString::fromAscii("Maemo");
}

QString DeviceInfo::model() const
{
    // TODO: How to detect
    return QString::fromAscii("N900");
}

QString DeviceInfo::version() const
{
    // PhoneGap version
    return QString::fromAscii("0.8.0");
}

QString DeviceInfo::uuid() const
{
    // TODO: How to detect
    return QString::fromAscii("000000000");
}

