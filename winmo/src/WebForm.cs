using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using System.IO;
using System.Reflection;

namespace PhoneGap {

    public partial class WebForm : Form {

        public WebForm() {
            InitializeComponent();
            commandManager = new CommandManager();
            webBrowser.ScriptErrorsSuppressed = true;
            webBrowser.DocumentText = parseDataProtocol(readEmbedded("/www/index.html"));
        }

        private void webBrowser_Navigating(object sender, WebBrowserNavigatingEventArgs e) {
            if (e.Url.Host.Equals("gap.exec")) {
                e.Cancel = true;
                String res = commandManager.processInstruction(e.Url.AbsolutePath);
                webBrowser.Navigate(new Uri("javascript:" + res + ";abc.x=1;//JS error!"));
            }
        }

        private String readEmbedded(String fileName) {
            Assembly assembly = Assembly.GetExecutingAssembly();
            String path = "PhoneGap.www." + (fileName.StartsWith("/www/") ? fileName.Substring(5) : fileName).Replace("/", ".");
            Stream stream = assembly.GetManifestResourceStream(path);
            StreamReader reader = new StreamReader(stream, Encoding.GetEncoding("UTF-8"));
            return reader.ReadToEnd();
        }

        private String parseDataProtocol(String documentText) {
            int position = documentText.IndexOf("data://");
            if (position > 0) {
                String parsedText = documentText.Substring(position + 7);
                int endName = parsedText.IndexOf("type");
                int endScript = parsedText.IndexOf("</script>");
                String jsName = parsedText.Substring(0, endName - 2);
                parsedText = documentText.Remove(position - 13, endScript + 13 + 7);
                parsedText = parsedText.Insert(position - 13, "<script type='text/javascript'>\n" + readEmbedded(jsName));
                return parseDataProtocol(parsedText);
            }
            return documentText;
        }

    }

}