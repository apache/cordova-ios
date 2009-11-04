#ifndef NOTIFICATION_H
#define NOTIFICATION_H
#include <QObject>

class Notification : public QObject
{
    Q_OBJECT

public:
    Notification();
public slots:
    void alert(QString message, QString title, QString buttonLabel);
};

#endif // NOTIFICATION_H

