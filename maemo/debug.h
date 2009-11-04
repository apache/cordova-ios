#ifndef DEBUG_H
#define DEBUG_H

#include <QObject>
#include <QString>

namespace PhoneGap {

class Debug : public QObject
{
    Q_OBJECT
public:
    Debug();
public slots:
    void log(QString);
    void processMessage(QString);
};
}

#endif // DEBUG_H
