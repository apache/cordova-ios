#ifndef COMMANDMANAGER_H
#define COMMANDMANAGER_H

#include <iostream>

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
#include <QDebug>
#include <QDir>

#include "utils.h"
#include "basecommand.h"
#include "deviceinfo.h"

using namespace PhoneGap;

class PGNetworkAccessManager : public QNetworkAccessManager
{
    Q_OBJECT

    public:
        PGNetworkAccessManager(QWebView *webview);

    protected:

        QNetworkReply *createRequest(Operation op, const QNetworkRequest &request,
                                         QIODevice *outgoingData = 0)
        {

            //std::cout << "createRequest:" << request.url().scheme().toAscii().data() << std::endl;
            std::cout << "createRequest:" << request.url().toString().toAscii().data() << std::endl;
            qDebug() << QDir::currentPath();
            //std::cout << "createRequest:" << request.url().path().remove(0,1).toAscii().data() << std::endl;
            /*
            // The scheme is 'gap<command>
            PGBaseCommand command = iCommandMap.value( request.url().scheme() );
            if( command.id != -1 )
            {
                command.execute();
            }
            else
             */

            // Local files require absolute path
            if ( request.url().scheme() == s("file") )
            {
                QNetworkRequest localrequest;

                QString path;
                path.append(QDir::currentPath());
                path.append(request.url().path() );
                QUrl url(path);
                const_cast<QNetworkRequest&>(request).setUrl(path);

                qDebug("Loading local file:%s", request.url().path().toAscii().data() );

                /*
                qDebug("Running JS:%s", request.url().path().toAscii().data() );
                QFile file(request.url().path().remove(0,1) );
                if (file.open(QIODevice::ReadOnly | QIODevice::Text))
                {
                    QTextStream in(&file);
                    iWebView->page()->mainFrame()->evaluateJavaScript(in.readAll());
                }
                else
                {
                    qDebug("Failed to open");
                }
                */
            }

            // TODO: How to make the response ourself
            return QNetworkAccessManager::createRequest(op, request, outgoingData);
        }


    private:
        // Reference to the web view
        QWebView *iWebView;

};

#endif // COMMANDMANAGER_H
