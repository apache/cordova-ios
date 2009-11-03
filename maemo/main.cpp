#include <iostream>

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


PGBaseCommand::PGBaseCommand(QObject* parent) : QObject(parent)
{
}

void PGBaseCommand::execute()
{
    std::cout << "Executing hello" << std::endl;

    QMessageBox msgBox;
    msgBox.setText("Hello world!");
    msgBox.exec();
}


#include "commandmanager.h"

void PGNetworkAccessManager::initJavascript( )
{
    std::cout << "initJavaScript" << std::endl;
    this->iWebView->page()->mainFrame()->addToJavaScriptWindowObject(QString::fromAscii("Hello"), iCommand );

}


void PGNetworkAccessManager::initCommandMap()
{
    // Create and bind the commands to javascript
    iCommand = new PGBaseCommand(this->iWebView);
    connect(this->iWebView->page()->mainFrame(), SIGNAL(javaScriptWindowObjectCleared()), this, SLOT(initJavascript() ));
}

PGNetworkAccessManager::PGNetworkAccessManager(QWebView *webview)
{
    this->iWebView = webview;
    initCommandMap();
}

PGNetworkAccessManager::~PGNetworkAccessManager()
{
    delete iCommand;
}

/** Custom QWebPage which prints the javascript errors to console */
class PGWebPage : public QWebPage
{
    public:

    void javaScriptConsoleMessage(const QString& message, int lineNumber, const QString& sourceID)
    {
        std::cout << lineNumber << ":" << sourceID.toAscii().data() << " " << message.toAscii().data() << std::endl;
    }
};

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    QWidget window;       

    window.resize(250, 150);
    window.setWindowTitle("Simple example");
    window.show();

    // Construct the web view components
    QWebView *view = new QWebView(&window);

    // Set our custom page with better error reporting
    // Has to be dynamically allocated because the QWebView deletes this.
    PGWebPage* page = new PGWebPage();
    view->setPage(page);

    // Enable JS
    view->settings()->setAttribute(QWebSettings::JavascriptEnabled, TRUE);

    PGNetworkAccessManager mymanager(view);
    page->setNetworkAccessManager(&mymanager);

    QFile file("index.html");
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text))
         return 0;

    QTextStream in(&file);

    view->setHtml( in.readAll(), QUrl("file:///index.html") );
    view->show();

    return app.exec();
}
