#ifndef COMMANDMANAGER_H
#define COMMANDMANAGER_H

#include <QObject>
#include <QApplication>
#include <QWidget>
#include <QWebView>
#include <QWebPage>
#include <QtNetwork/QNetworkRequest>
#include <QtNetwork/QNetworkReply>
#include <QMessageBox>
#include <QFile>
#include <QTextStream>
#include <QWebFrame>

#include "basecommand.h"

class PGNetworkAccessManager : public QNetworkAccessManager
{
    Q_OBJECT

    public:
        PGNetworkAccessManager(QWebView *webview);
        ~PGNetworkAccessManager();

    protected:
        /*
        QNetworkReply *createRequest(Operation op, const QNetworkRequest &request,
                                         QIODevice *outgoingData = 0)
        {
            std::cout << "createRequest:" << request.url().scheme().toAscii().data() << std::endl;
            std::cout << "createRequest:" << request.url().toString().toAscii().data() << std::endl;
            std::cout << "createRequest:" << request.url().path().remove(0,1).toAscii().data() << std::endl;

            // The scheme is 'gap<command>
            PGBaseCommand command = iCommandMap.value( request.url().scheme() );
            if( command.id != -1 )
            {
                command.execute();
            }
            else if ( request.url().scheme() == QString::fromAscii("file",4) )
            {
                qDebug("Running JS");
                QFile file(request.url().path().remove(0,1) );
                if (file.open(QIODevice::ReadOnly | QIODevice::Text))
                {
                    QTextStream in(&file);
                    iWebView->page()->mainFrame()->evaluateJavaScript(in.readAll());
                }
            }

            // TODO: How to make the response ourself
            return QNetworkAccessManager::createRequest(op, request, outgoingData);
        }
        */

    private:

        PGBaseCommand *iCommand;

        // Scheme to command mapping
        QHash<QString, PGBaseCommand> iCommandMap;

        // Reference to the web view
        QWebView *iWebView;

    public:
        void initCommandMap();

    public slots:
        void initJavascript();
};

#endif // COMMANDMANAGER_H
