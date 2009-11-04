#ifndef __PGBASECOMMAND__
#define __PGBASECOMMAND__
#include <QObject>

class PGBaseCommand : public QObject
{

    Q_OBJECT
    public:
        PGBaseCommand(QObject *parent );

    public slots:
        void execute();

};

#endif
