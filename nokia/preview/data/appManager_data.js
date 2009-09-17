/**
 * SAPI Sample Data - AppManager
 */


(function(){  
	
    var data_apps = [
    {
        "Path": "C:\\private\\10282822\\com.nokia.forum.widget.accuwidget\\AccuWidget\\accuwidget.xhtml",
        "Uid": "0x2000dad2",
        "Caption": "AccuWidget",
        "ShortCaption": "AccuWidget"
    }, {
        "Path": "C:\\private\\10282822\\com.nokia.wrt.tools.sapi.CreatorWidget\\CreatorWidget\\index.html",
        "Uid": "0x2000dadb",
        "Caption": "Creator Widget",
        "ShortCaption": "Creator Widget"
	},{
        "Path": "Z:\\sys\\bin\\lcapp.exe",
        "Uid": "0x10283139",
        "Caption": "Location",
        "ShortCaption": "Location"
    }, {
        "Path": "Z:\\sys\\bin\\javadrmmanager.exe",
        "Uid": "0x1028246e",
        "Caption": "javadrmmanager",
        "ShortCaption": "javadrmmanager"
    }, {
        "Path": "Z:\\sys\\bin\\iaupdater.exe",
        "Uid": "0x2000f85d",
        "Caption": "iaupdater",
        "ShortCaption": "iaupdater"
    }, {
        "Path": "Z:\\sys\\bin\\iaupdate.exe",
        "Uid": "0x2000f85a",
        "Caption": "App. update",
        "ShortCaption": "App. update"
    }, {
        "Path": "Z:\\sys\\bin\\SAFlash.exe",
        "Uid": "0x101fd693",
        "Caption": "Flash Lite",
        "ShortCaption": "Flash Lite"
    }, {
        "Path": "Z:\\sys\\bin\\eswt.exe",
        "Uid": "0x101f9516",
        "Caption": "eswt",
        "ShortCaption": "eswt"
    }, {
        "Path": "Z:\\sys\\bin\\DRMRightsManager.exe",
        "Uid": "0x101f85c7",
        "Caption": "Licences",
        "ShortCaption": "Licences"
    }, {
        "Path": "Z:\\sys\\bin\\RoapApp.exe",
        "Uid": "0x10008d64",
        "Caption": "Licence download",
        "ShortCaption": "Licence download"
    }, {
        "Path": "Z:\\sys\\bin\\DdViewer.exe",
        "Uid": "0x10008d3f",
        "Caption": "Download",
        "ShortCaption": "Download"
	}, {
		"Path": "Z:\\sys\\bin\\MediaGallery2.exe",
		"Uid": "0x101f8599",
		"Caption": "Gallery",
		"ShortCaption": "Gallery"
    }, {
        "Path": "Z:\\sys\\bin\\CodViewer.exe",
        "Uid": "0x10008d4a",
        "Caption": "Download",
        "ShortCaption": "Download"
    }];
		
		
		
    var data_packages = [{
        "PackageName": "Mobiola Screen Capture",
        "Uid": "0x2000be16",
        "Version": "3:0",
        "Vendor": "Warelex LLC",
        "Drive": "E"
    }, {
        "PackageName": "Facebook",
        "Uid": "0x20011184",
        "Version": "1:0",
        "Vendor": "Nokia Corporation",
        "Drive": "C"
    }];
	
	
	/**
	 * register data!
	 */
	device.implementation.loadData('Service.AppManager', 'Application', data_apps);
	device.implementation.loadData('Service.AppManager', 'UserInstalledPackage', data_packages);

})()
