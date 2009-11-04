#ifndef DEVICEINFO_H
#define DEVICEINFO_H

#include <QObject>
class QString;

namespace PhoneGap {
    class DeviceInfo : public QObject
    {

        Q_OBJECT
        Q_PROPERTY(QString platform READ platform )
        Q_PROPERTY(QString version READ version )
        Q_PROPERTY(QString uuid READ uuid )
        Q_PROPERTY(QString model READ model )

        public:
            DeviceInfo();

            QString platform() const;
            QString version() const;
            QString uuid() const;
            QString model() const;

        /*
            this.platform = DeviceInfo.platform;
            this.version  = DeviceInfo.version;
            this.name     = DeviceInfo.name;
            this.gap      = DeviceInfo.gap;
            this.uuid     = DeviceInfo.uuid;

        public slots:
            void ();
            */
    };
}

#endif // DEVICEINFO_H
