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

class PGBaseCommand {

    public:
    PGBaseCommand(  ){
        id = -1;
    }

    ~PGBaseCommand(){}
    public:
        void setUrl(QUrl aUrl )
        {
            iUrl = aUrl;
        }
        void execute()
        {
            std::cout << "Executing hello" << std::endl;

            QMessageBox msgBox;
            msgBox.setText("Hello world!");
            msgBox.exec();
        }

        int id;
    private:
        QUrl iUrl;
};

class PGNetworkAccessManager : public QNetworkAccessManager
{
    public:
        PGNetworkAccessManager(QWebView *webview)
        {
            this->iWebView = webview;
            iCommand.id = 0;

            initCommandMap();
        }
        ~PGNetworkAccessManager()
        {
            iCommandMap.clear();
        }

        void initCommandMap()
        {
            iCommandMap.insert( QString().fromAscii("gaphello"), iCommand );
        }
    protected:
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

    private:

        PGBaseCommand iCommand;

        // Scheme to command mapping
        QHash<QString, PGBaseCommand> iCommandMap;
        
        // Reference to the web view
        QWebView *iWebView;

};


/** Custom QWebPage which prints the javascript errors to console */
class PGWebPage : public QWebPage
{
    public:

    virtual void javaScriptConsoleMessage(const QString& message, int lineNumber, const QString& sourceID)
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
    PGWebPage page;
    PGNetworkAccessManager mymanager(view);

    view->settings()->setAttribute(QWebSettings::JavascriptEnabled, TRUE);

    // Set our custom page with better error reporting
    view->setPage(&page);
    view->page()->setNetworkAccessManager(&mymanager);

    // To allow our 'gap' scheme
    view->page()->setForwardUnsupportedContent(TRUE);

    const QString path = QString::fromAscii("index.html");

    QFile file("index.html");
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text))
         return 0;

    QTextStream in(&file);
    
    //const char* html = "<html><body><a href='gap://hello?world'>HELLO!</a></body></html>";

    view->setHtml( in.readAll(), QUrl("file:///index.html") );

    view->show();

    return app.exec();
}
