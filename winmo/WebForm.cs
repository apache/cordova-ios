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
        // TODO: Shouldn't create the HTML to display from resources all in memory. Should create a file and send html/js/css resources to the file.
        // Less memory used.
        public WebForm() {
            // use this for certain file/audio i/o operations - grab embedded resources and add
            // dynamically to the manifestmodule. Cool hack - thanks Ran!
            //string s = Assembly.GetExecutingAssembly().ManifestModule.FullyQualifiedName;

            InitializeComponent();
            commandManager = new CommandManager();
            webBrowser.ScriptErrorsSuppressed = false;
            webBrowser.DocumentText = parseDataProtocol(readEmbedded("/www/index.html"));
        }

        private void webBrowser_Navigating(object sender, WebBrowserNavigatingEventArgs e) {
            if (e.Url.Host.Equals("gap.exec")) {
                e.Cancel = true;
                String res = commandManager.processInstruction(e.Url.AbsolutePath);
                webBrowser.Navigate(new Uri("javascript:" + res + ";abc.x=1;//JS error!"));
            }
        }
        private String readEmbedded(String fileName)
        {
            Assembly assembly = Assembly.GetExecutingAssembly();
            String path = assembly.GetName().Name + ".www." + (fileName.StartsWith("/www/") ? fileName.Substring(5) : fileName).Replace("/", ".");
            Stream stream = assembly.GetManifestResourceStream(path);
            StreamReader reader = new StreamReader(stream, Encoding.GetEncoding("UTF-8"));
            return reader.ReadToEnd();
        }

        private String parseDataProtocol(String documentText) {
            string toMatch = "<script src=\"data://";
            int matchLength = toMatch.Length;
            int position = documentText.IndexOf("<script src=\"data://");
            if (position > 0) {
                String parsedText = documentText.Substring(position + matchLength);
                int endName = parsedText.IndexOf("type");
                int endScript = documentText.IndexOf("</script>",position);
                int scriptTagLength = endScript + "</script>".Length - position;
                String jsName = parsedText.Substring(0, endName - 2);
                parsedText = documentText.Remove(position, scriptTagLength);
                parsedText = parsedText.Insert(position, "<script type='text/javascript'>\n" + readEmbedded(jsName) + "</script>");
                return parseDataProtocol(parsedText);
            }
            return documentText;
        }
    }

}