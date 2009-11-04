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
            }

            return QNetworkAccessManager::createRequest(op, request, outgoingData);
        }


    private:
        // Reference to the web view
        QWebView *iWebView;

};

#endif // COMMANDMANAGER_H
