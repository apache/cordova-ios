/**
 * SAPI Sample Data - Contacts
 */

(function(){


	var data_contacts = [{
	    "id": "",
	    "FirstName": {
	        "Label": "First name",
	        "Value": "Alice"
	    },
	    "LastName": {
	        "Label": "Last name",
	        "Value": "Moller"
	    },
	    "LandPhoneGen": {
	        "Label": "Telephone",
	        "Value": "0230328732"
	    },
	    "SyncClass": {
	        "Label": "Synchronisation",
	        "Value": "private"
	    }
	}, {
	    "id": "",
	    "FirstName": {
	        "Label": "First name",
	        "Value": "Amy"
	    },
	    "LastName": {
	        "Label": "Last name",
	        "Value": "Kammer"
	    },
	    "LandPhoneGen": {
	        "Label": "Telephone",
	        "Value": "0492303652"
	    },
	    "SyncClass": {
	        "Label": "Synchronisation",
	        "Value": "private"
	    }
	}, {
	    "id": "",
	    "SyncClass": {
	        "Label": "Synchronisation",
	        "Value": "private"
	    },
	    "LastName": {
	        "Label": "Last name",
	        "Value": "Bierman"
	    },
	    "FirstName": {
	        "Label": "First name",
	        "Value": "Michael"
	    },
	    "MobilePhoneGen": {
	        "Label": "Mobile",
	        "Value": "4084256071"
	    }
	}, {
	    "id": "",
	    "FirstName": {
	        "Label": "First name",
	        "Value": "Ralph"
	    },
	    "LastName": {
	        "Label": "Last name",
	        "Value": "Jacmor"
	    },
	    "LandPhoneGen": {
	        "Label": "Telephone",
	        "Value": "0432443343"
	    },
	    "SyncClass": {
	        "Label": "Synchronisation",
	        "Value": "private"
	    }
	}, {
	    "id": "",
	    "FirstName": {
	        "Label": "First name",
	        "Value": "Robert"
	    },
	    "LastName": {
	        "Label": "Last name",
	        "Value": "Richards"
	    },
	    "LandPhoneGen": {
	        "Label": "Telephone",
	        "Value": "+4443433434"
	    },
	    "SyncClass": {
	        "Label": "Synchronisation",
	        "Value": "private"
	    }
	}, {
	    "id": "",
	    "FirstName": {
	        "Label": "First name",
	        "Value": "Ursula"
	    },
	    "LastName": {
	        "Label": "Last name",
	        "Value": "West"
	    },
	    "LandPhoneGen": {
	        "Label": "Telephone",
	        "Value": "0213443434"
	    },
	    "SyncClass": {
	        "Label": "Synchronisation",
	        "Value": "private"
	    }
	}];  
	

    var data_groups = [{
        "id": "",
        "GroupLabel": "TestGroupName"
    }, {
        "id": "",
        "GroupLabel": "Silver club #5488",
        "Contents": ["", "", "", "", "", ""]
    }, {
        "id": "",
        "GroupLabel": "The buddies #9926"
    }, {
        "id": "",
        "GroupLabel": "Football team #5940",
        "Contents": ["", ""]
    }, {
        "id": "",
        "GroupLabel": "Science group #2742",
        "Contents": ["", "", "", "", "", ""]
    }, {
        "id": "",
        "GroupLabel": "Rockers #3062",
        "Contents": ["", "", "", "", "", ""]
    }];
		
		
    var data_database = [{
        "DBUri": "cntdb://c:contacts.cdb"
    },{
        "DBUri": "sim://global_adn"
	}];
    
    
    /**
     * register data!
     */
    device.implementation.loadData('Service.Contact', 'Contact', data_contacts);
    device.implementation.loadData('Service.Contact', 'Group', data_groups);
    device.implementation.loadData('Service.Contact', 'Database', data_database);
    
})()
