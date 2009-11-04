#include <iostream>

#include <QWebFrame>
#include "webview.h"

using namespace PhoneGap;

WebView::WebView(QWidget* aWidget) : QWebView(aWidget)
{
}


void WebView::initJavascript( )
{
    QWebFrame *frame =  page()->mainFrame();

    std::cout << "initJavaS" << std::endl;
    // Create and bind the commands to javascript
    iDeviceInfo = new DeviceInfo();
    frame->addToJavaScriptWindowObject(s("DeviceInfo"), iDeviceInfo );
}


void WebView::initPhoneGapAPI()
{
    std::cout << "initPhoneGapAPI" << std::endl;
    connect(this->page()->mainFrame(), SIGNAL(javaScriptWindowObjectCleared()), this, SLOT(initJavascript() ));
}

WebView::~WebView()
{
    delete iDeviceInfo;
}

