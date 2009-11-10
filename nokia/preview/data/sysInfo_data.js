/**
 * SAPI Sample Data - SysInfo
 */


(function(){  

var data_5800 = {
			"battery":{
				"batterystrength":{
					"Status":85,
					"Entity":"Battery",
					"Key":"BatteryStrength"
					},
				"chargingstatus":{
					"Status":0,
					"Entity":"Battery",
					"Key":"ChargingStatus"
					}
			},
			"connectivity":{
				"bluetooth":{
					"Status":1,
					"Entity":"Connectivity",
					"Key":"BlueTooth"
					},
				"infrared":{
					"Status":-1,
					"Entity":"Connectivity",
					"Key":"InfraRed"
					},
				"activeconnections":{
					"ConnectionList":[{
								"IAPID":5,
								"IAPName":"Browser",
								"IAPConnectionName":"",
								"NetworkName":"Browser",
								"ConnectionType":7,
								"ConnectionStatus":1
								},{
								"IAPID":1,
								"IAPName":"airtelgprs.com",
								"IAPConnectionName":"Mobile Office",
								"NetworkName":"GPRS",
								"ConnectionType":6,
								"ConnectionStatus":1
								}],
					"Entity":"Connectivity",
					"Key":"ActiveConnections"
				},					
				"wlanmacaddress":{
					"StringData":"00:21:fe:97:c5:27",
					"Entity":"Connectivity",
					"Key":"WLanMacAddress"
					}
			},
			"device":{
				"firmwareversion":{
					"StringData":"V 20.0.012 RnD\n04-03-09\nRM-356\n(c)NMP",
					"Entity":"Device",
					"Key":"FirmwareVersion"},
				"platformversion":{
					"MajorVersion":"5",
					"MinorVersion":"0",
					"Entity":"Device",
					"Key":"PlatformVersion"
					},
				"producttype":{
					"StringData":"RM-356",
					"Entity":"Device",
					"Key":"ProductType"
					},
				"manufacturer":{
					"StringData":"Nokia",
					"Entity":"Device",
					"Key":"Manufacturer"
					},
				"machineid":{
					"Status":536926806,
					"Entity":"Device",
					"Key":"MachineId"
					},
				"phonemodel":{
					"StringData":"5800 XpressMusic",
					"Entity":"Device",
					"Key":"PhoneModel"
					},
				"imei":{
					"StringData":"004401102480155",
					"Entity":"Device",
					"Key":"IMEI"
					}
			},
			"display":{
				"brightness":{
					"Status":50,
					"Entity":"Display",
					"Key":"Brightness"
					},
				"screensavertimeout":{
					"Status":15,
					"Entity":"Display",
					"Key":"ScreenSaverTimeout"
					},
				"keyguardtime":{
					"Status":60,
					"Entity":"Display",
					"Key":"KeyGuardTime"
					},
				"keyguardtime":{
					"Status":60,
					"Entity":"Display",
					"Key":"KeyGuardTime"
					},
				"autolocktime":{
					"Status":0,
					"Entity":"Display",
					"Key":"AutoLockTime"
					},
				"autolockstatus":{
					"Status":0,
					"Entity":"Display",
					"Key":"AutoLockStatus"
					},
				"lighttimeout":{
					"Status":45,
					"Entity":"Display",
					"Key":"LightTimeout"
					},
				"displayresolution":{
					"XPixels":640,
					"YPixels":360,
					"Entity":"Display",
					"Key":"DisplayResolution"
					},
				"displayorientation":{
					"Status":3,
					"Entity":"Display",
					"Key":"DisplayOrientation"
					},
				"wallpaper":{
					"StringData":"C://Data//Others//wallpaper.jpeg",
					"Entity":"Display",
					"Key":"Wallpaper"
					}
				
			},
			"features":{
				"bluetooth":{
					"Status":1,
					"Entity":"Features",
					"Key":"BlueTooth"
					},
				"infrared":{
					"Status":0,
					"Entity":"Features",
					"Key":"InfraRed"
					},
				"camera":{
					"Status":1,
					"Entity":"Features",
					"Key":"CAMERA"
					},
				"memorycard":{
					"Status":1,
					"Entity":"Features",
					"Key":"MemoryCard"
					},
				"fmradio":{
					"Status":1,
					"Entity":"Features",
					"Key":"FMRADIO"
					},
				"qwerty":{
					"Status":1,
					"Entity":"Features",
					"Key":"QWERTY"
					},
				"wlan":{
					"Status":1,
					"Entity":"Features",
					"Key":"WLAN"
					},
				"usb":{
					"Status":1,
					"Entity":"Features",
					"Key":"USB"
					},
				"pen":{
					"Status":1,
					"Entity":"Features",
					"Key":"Pen"
					},
				"led":{
					"Status":0,
					"Entity":"Features",
					"Key":"LED"
					},
				"coverui":{
					"Status":0,
					"Entity":"Features",
					"Key":"CoverUI"
					},
				"sidevolumekeys":{
					"Status":1,
					"Entity":"Features",
					"Key":"SideVolumeKeys"
					},
				"vibra":{
					"Status":1,
					"Entity":"Features",
					"Key":"Vibra"
					}
			},
			"general":{
				"connectedaccessories":{
					"AccessoryList":[{"AccessoryType":0,"AccessoryState":1}],
					"Entity":"General",
					"Key":"ConnectedAccessories"
					},
				"accessorystatus":{
					"AccessoryInfo":{"AccessoryType":0,"AccessoryState":0},
					"Entity":"General",
					"Key":"AccessoryStatus"
					},
				"inputlanguage":{
					"Status":1,
					"Entity":"General",
					"Key":"InputLanguage"
					},
				"supportedlanguages":{
					"LanguageList":[1,2,3,5,13,4],
					"Entity":"General",
					"Key":"SupportedLanguages"
					},
				"predictivetext":{
					"Status":0,
					"Entity":"General",
					"Key":"PredictiveText"
					},
				"vibraactive":{
					"Status":1,
					"Entity":"General",
					"Key":"VibraActive"
					},
				"availableusbmodes":{
					"StringList":["PC Suite","Mass storage","Image transfer","Media transfer"],
					"Entity":"General",
					"Key":"AvailableUSBModes"
					},
				"activeusbmode":{
					"StringData":"Mass storage",
					"Entity":"General",
					"Key":"ActiveUSBMode"
					},
				"flipstatus":{
					"Status":-1,
					"Entity":"General",
					"Key":"FlipStatus"
					},
				"gripstatus":{
					"Status":1,
					"Entity":"General",
					"Key":"GripStatus"
					}
			},
			"memory":{
				"listdrives":{
					"DriveList":["C:\\","D:\\","E:\\","Z:\\"],
					"Entity":"Memory",
					"Key":"ListDrives"
					},
				"memorycard":{
					"Status":1,
					"Entity":"Memory",
					"Key":"MemoryCard"
					},
				"driveinfo":{
					"Drive": {
							"C:\\": {
								"Drive": "C:\\",
								"CriticalSpace": 131072,
								"MediaType": 9,
								"TotalSpace": 90210304,
								"FreeSpace": 79319040,
								"DriveName": "",
								"BatterState": 0
								},
							"D:\\": {
								"Drive": "D:\\",
								"CriticalSpace": 2700000,
								"MediaType": 5,
								"TotalSpace": 52469760,
								"FreeSpace": 52457472,
								"DriveName": "",
								"BatterState": 0
								},
							"Z:\\": {
								"Drive": "Z:\\",
								"CriticalSpace": 131072,
								"MediaType": 7,
								"TotalSpace": 0,
								"FreeSpace": 0,
								"DriveName": "RomDrive",
								"BatterState": 0
								}
							},
					"Entity":"Memory",
					"Key":"DriveInfo"
					}
			},
			"network":{
				"registrationstatus":{
					"Status":4,
					"Entity":"Network",
					"Key":"RegistrationStatus"
					},
				"networkmode":{
					"Status":0,
					"Entity":"Network",
					"Key":"NetworkMode"
					},
				"signalstrength":{
					"Status":61,
					"Entity":"Network",
					"Key":"SignalStrength"
					},
				"currentnetwork":{
					"NetworkName":"Airtel",
					"NetworkStatus":1,
					"NetworkMode":1,
					"CountryCode":"404",
					"NetworkCode":"45",
					"LocationStatus":false,
					"Entity":"Network",
					"Key":"CurrentNetwork"
					}
			}
	}; 
	/**
	 * register data!
	 */
	device.implementation.loadData('Service.SysInfo', '', data_5800);

})()
