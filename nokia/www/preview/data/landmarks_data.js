/**
 * SAPI Sample Data - Landmark
 */

(function(){

	var data_landmark =	[{
		"id":"47",
		"LandmarkName":"Best food ever!",
		"LandmarkPosition":{
			"Latitude":-17.5423,
			"Longitude":-54.8163,
			"Altitude":82,
			"HAccuracy":2,
			"VAccuracy":4
		},
		"CategoryInfo":["1"],
		"LandmarkDesc":"Place looks really nice.",
		"LandmarkFields":{
			"Country":"Finland",
			"City":"Tokyo",
			"AreaCode":"FI-70100",
			"Street":"Plains Road",
			"Telephone":"+4443433434"
		}
	},{
		"id":"44",
		"LandmarkName":"Food store",
		"LandmarkPosition":{
			"Latitude":65.4233,
			"Longitude":-93.4225,
			"Altitude":54,
			"HAccuracy":1,
			"VAccuracy":1
		},
		"CategoryInfo":["10"],
		"LandmarkDesc":"Words are not enough to describe this landmark",
		"LandmarkFields":{
			"Country":"Finland",
			"City":"St. Michel",
			"AreaCode":"11233",
			"Street":"McKenzie Avenue",
			"Telephone":"0432443343"
		}
	},{
		"id":"40",
		"LandmarkName":"Hospital",
		"LandmarkPosition":{
			"Latitude":-2.4616,
			"Longitude":51.4958,
			"Altitude":43,
			"HAccuracy":3,
			"VAccuracy":3
		},
		"CategoryInfo":["13"],
		"LandmarkDesc":"Place looks really nice.",
		"LandmarkFields":{
			"Country":"United States of America",
			"City":"London",
			"AreaCode":"11233",
			"Street":"Pukershire Avenue",
			"Telephone":"0565645455"
		}
	},{
		"id":"45",
		"LandmarkName":"John’s home",
		"LandmarkPosition":{
			"Latitude":36.9077,
			"Longitude":134.4066,
			"Altitude":42,
			"HAccuracy":3,
			"VAccuracy":5
		},
		"CategoryInfo":["14"],
		"LandmarkDesc":"This is my favorite place",
		"LandmarkFields":{
			"City":"Los Angeles",
			"AreaCode":"00310",
			"Street":"McKenzie Lane",
			"Telephone":"+35854553456",
			"Country":"Japan"
		}
	},{
		"id":"48",
		"LandmarkName":"John’s home",
		"LandmarkPosition":{
			"Latitude":17.1817,
			"Longitude":113.4183,
			"Altitude":29,
			"HAccuracy":3,
			"VAccuracy":2
		},
		"CategoryInfo":["3"],
		"LandmarkDesc":"Words are not enough to describe this landmark",
		"LandmarkFields":{
			"Country":"Norway",
			"City":"St. Petersburg",
			"AreaCode":"FI-70100",
			"Street":"Windsor Road",
			"Telephone":"+4465665456"
		}
	},{
		"id":"49",
		"LandmarkName":"Nice beach",
		"LandmarkPosition":{
			"Latitude":-22.0327,
			"Longitude":-33.0193,
			"Altitude":57,
			"HAccuracy":1,
			"VAccuracy":0
		},
		"CategoryInfo":["7"],
		"LandmarkDesc":"This is my favorite place",
		"LandmarkFields":{
			"Telephone":"+35854553456",
			"Country":"Finland",
			"City":"Bangkok",
			"AreaCode":"00310",
			"Street":"Highland Avenue Extension"
		}
	},{
		"id":"42",
		"LandmarkName":"Nice view",
		"LandmarkPosition":{
			"Latitude":-1.5979999999999999,
			"Longitude":177.5871,
			"Altitude":23,
			"HAccuracy":1,
			"VAccuracy":4
		},
		"CategoryInfo":["5"],
		"LandmarkDesc":"Words are not enough to describe this landmark",
		"LandmarkFields":{
			"Country":"Thailand",
			"City":"St. Petersburg",
			"AreaCode":"00310",
			"Street":"Pukershire Avenue",
			"Telephone":"0435445454"
		}
	},{
		"id":"41",
		"LandmarkName":"Summer cottage",
		"LandmarkPosition":{
			"Latitude":-80.6438,
			"Longitude":78.5627,
			"Altitude":60,
			"HAccuracy":1,
			"VAccuracy":4
		},
		"CategoryInfo":["11"],
		"LandmarkDesc":"Place looks really nice.",
		"LandmarkFields":{
			"Country":"Thailand",
			"City":"Havana",
			"AreaCode":"99002",
			"Street":"Eastman Street",
			"Telephone":"+4465665456"
		}
	},{
		"id":"43",
		"LandmarkName":"Summer cottage",
		"LandmarkPosition":{
			"Latitude":23.6319,
			"Longitude":-141.5323,
			"Altitude":60,
			"HAccuracy":2,
			"VAccuracy":2
		},
		"CategoryInfo":["1"],
		"LandmarkDesc":"This is my favorite place",
		"LandmarkFields":{
			"Country":"Norway",
			"City":"Nairobi",
			"AreaCode":"FI-70100",
			"Street":"Windsor Avenue",
			"Telephone":"0785434444"
		}
	},{
		"id":"46",
		"LandmarkName":"Work place",
		"LandmarkPosition":{
			"Latitude":1.7755,
			"Longitude":66.132,
			"Altitude":36,
			"HAccuracy":5,
			"VAccuracy":5
		},
		"CategoryInfo":["3"],
		"LandmarkDesc":"Delicious strawberries sold here. Must visit again sometime!",
		"LandmarkFields":{
			"Country":"Kenya",
			"City":"Havana",
			"AreaCode":"99002",
			"Street":"Barnes Street",
			"Telephone":"0342303777"
		}
	}];
	
	
	var data_category =	[{
		"id":"1",
		"CategoryName":"Accommodation",
		"GlobalId":"3000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16384,
		"IconMaskIndex":16385
	},{

		"id":"2",
		"CategoryName":"Businesses",
		"GlobalId":"6000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16386,
		"IconMaskIndex":16387
	},{
		"id":"3",
		"CategoryName":"Telecommunications",
		"GlobalId":"9000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16388,
		"IconMaskIndex":16389
	},{
		"id":"4",
		"CategoryName":"Education",
		"GlobalId":"12000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16390,
		"IconMaskIndex":16391
	},{
		"id":"5",
		"CategoryName":"Entertainment",
		"GlobalId":"15000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16392,
		"IconMaskIndex":16393
	},{
		"id":"6",
		"CategoryName":"Food and drink",
		"GlobalId":"18000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16394,
		"IconMaskIndex":16395
	},{
		"id":"7",
		"CategoryName":"Geographical locations",
		"GlobalId":"21000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16396,
		"IconMaskIndex":16397
	},{
		"id":"8",
		"CategoryName":"Outdoor activities",
		"GlobalId":"24000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16398,
		"IconMaskIndex":16399
	},{
		"id":"9",
		"CategoryName":"People",
		"GlobalId":"27000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16400,
		"IconMaskIndex":16401
	},{
		"id":"10",
		"CategoryName":"Public services",
		"GlobalId":"30000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16402,
		"IconMaskIndex":16403
	},{
		"id":"11",
		"CategoryName":"Places of worship",
		"GlobalId":"33000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16404,
		"IconMaskIndex":16405
	},{
		"id":"12",
		"CategoryName":"Shopping",
		"GlobalId":"36000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16406,
		"IconMaskIndex":16407
	},{
		"id":"13",
		"CategoryName":"Sightseeing",
		"GlobalId":"39000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16408,
		"IconMaskIndex":16409
	},{
		"id":"14",
		"CategoryName":"Sports",
		"GlobalId":"42000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16410,
		"IconMaskIndex":16411
	},{
		"id":"15",
		"CategoryName":"Transport",
		"GlobalId":"45000",
		"IconFile":"\resource\apps\eposlmglcategories.mif",
		"IconIndex":16412,
		"IconMaskIndex":16413
	},{
		"id":"24",
		"CategoryName":"All places",
		"IconFile":"Z:\resource\apps\smart2go.mif",
		"IconIndex":16384,
		"IconMaskIndex":16385
	},{
		"id":"25",
		"CategoryName":"Nokia maps",
		"IconFile":"Z:\resource\apps\LmkUi.mif",
		"IconIndex":16402,
		"IconMaskIndex":16403
	}];
	
	var data_database =	[{
		"DatabaseURI":"file://C:eposlm.ldb",
		"DatabaseName":"",
		"DbProtocol":"file",
		"DbActive":false,
		"DbSize":226,
		"DbDrive":"C",
		"DbMedia":9
	}]; 


    /**
     * register data!
     */
    device.implementation.loadData('Service.Landmarks', 'Landmark', data_landmark);
    device.implementation.loadData('Service.Landmarks', 'Category', data_category);
    device.implementation.loadData('Service.Landmarks', 'Database', data_database);

})()
	