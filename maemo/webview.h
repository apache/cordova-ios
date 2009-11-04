#ifndef WEBVIEW_H
#define WEBVIEW_H

#include <QObject>
#include <QWebView>
#include <QWidget>

#include "utils.h"
#include "deviceinfo.h"
#include "debug.h"

namespace PhoneGap {

class WebView : public QWebView
{
    Q_OBJECT

public:
    WebView(QWidget*);
    ~WebView();

    void initPhoneGapAPI();

public slots:
    void initJavascript();

private:
     DeviceInfo *iDeviceInfo;
     Debug *iDebug;
};

}

#endif // WEBVIEW_H
