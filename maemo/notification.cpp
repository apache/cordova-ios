#include <QMessageBox>
#include "notification.h"

Notification::Notification()
{
}


void Notification::alert(QString message, QString title, QString buttonLabel)
{
    QMessageBox msgBox;
    msgBox.setText(message);
    msgBox.setWindowTitle(title);
    msgBox.setButtonText(0,buttonLabel);
    msgBox.exec();
}
