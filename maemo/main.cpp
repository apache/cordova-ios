#include <iostream>

#include <QApplication>
#include <QWidget>
#include <QWebPage>
#include <QtNetwork/QNetworkRequest>
#include <QtNetwork/QNetworkReply>
#include <QMessageBox>
#include <QFile>
#include <QTextStream>
#include <QWebFrame>

#include "deviceinfo.h"
#include "commandmanager.h"
#include "webview.h"

using namespace PhoneGap;

/** Custom QWebPage which prints the javascript errors to console */
class PGWebPage : public QWebPage
{
    public:

    void javaScriptConsoleMessage(const QString& message, int lineNumber, const QString& sourceID)
    {
        std::cout << lineNumber << ":" << sourceID.toAscii().data() << " " << message.toAscii().data() << std::endl;
    }
};

PGNetworkAccessManager::PGNetworkAccessManager(QWebView *webview)
{
    this->iWebView = webview;
}

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    QWidget window;       

    window.resize(800, 480);
    window.setWindowTitle("Simple example");
    window.show();

    // Construct the web view components
    WebView *view = new WebView(&window);

    // Set our custom page with better error reporting
    // Has to be dynamically allocated because the QWebView deletes this.
    PGWebPage* page = new PGWebPage();
    view->setPage(page);

    // Enable JS
    view->settings()->setAttribute(QWebSettings::JavascriptEnabled, TRUE);

    PGNetworkAccessManager mymanager(view);
    page->setNetworkAccessManager(&mymanager);

    // Initialize PhoneGap APIs
    view->initPhoneGapAPI();

    QFile file("www/index.html");
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text))
         return 0;

    QTextStream in(&file);

    view->setHtml( in.readAll(), QUrl("file:///www/index.html") );
    view->show();

    return app.exec();
}
