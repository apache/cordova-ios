/**
 * widget object constructor
 * @param {void}
 *     widget()
 * @return {void}
 */ 

if (typeof window.menu == "undefined" || !window.menu) 
{
	window.menu = 
	{
		author : 'Nokia WRT Emulation Library',
		items : [],
		index : null,
		isDimmed : false,	
			
		//	Event triggers
		onShow : null,
		onRightSoftKeySelect : null,
	};
	
	
	/*
		Function 	:	menu.append()
		Argument	:	MenuItem Object
		Returns		:	Void
		Description	:	Function appends MenuItem to a Menu Object
	*/
	menu.append = function(MenuItem)
	{
		if(this.allowedTypeOf(MenuItem))
		{
			var i;
			var flag = true;
			try{
			for(var key in this.items)
			{
				if(this.items[key].id == MenuItem.id)
				{	
					flag = false; 
					break; 
				}
			}} catch(e){ }
			if(flag)
			{
				//	MenuItem.parent = this;
				this.items[MenuItem.id] = MenuItem;
			}
		}
	}
	
	
	/*
		Function 	:	menu.remove()
		Argument	:	MenuItem Object
		Returns		:	Void
		Description	:	Function Remove the menuItem and its children from the container options menu.
	*/
	menu.remove = function(MenuItem)
	{
		if(!this.allowedTypeOf(MenuItem))
			return false;
	
		var flag = false;
		if (this.items.length) {
			for (var key in this.items) {
				if (this.items[key].id == MenuItem.id) {
					flag = true;
					break;
				}
			}
		}
		if(flag)
		{
			this.items.splice(key, 1);
		}
	}
	
	/*
		Function 	:	menu.clear()
		Argument	:	Void
		Returns		:	Void
		Description	:	Clears (deletes) all the menu items in the menupane.
	*/
	menu.clear = function()
	{
		try
		{
			this.items.splice(0, this.items.length);
		}catch(e){}
	}
	
	
	/*
		Function 	:	Menu.getMenuItemById(id)
		Argument	:	Integer
		Returns		:	MenuItem Object
		Description	:	Function get the MenuItem Object with the reference of id
	*/
	menu.getMenuItemById = function(id)
	{
		var menuItemRef = menu.menuItemExhistsById(this, id, 0);
		if(this.allowedTypeOf(menuItemRef))
			return menuItemRef;
		else
			return undefined;
	}
	
	
	/*
		Function 	:	Menu.getMenuItemByName(name)
		Argument	:	String
		Returns		:	MenuItem Object
		Description	:	Function get the MenuItem Object with the reference of String name
	*/
	menu.getMenuItemByName = function(name)
	{
		var menuItemRef = menu.menuItemExhistsById(this, name, 1);
	
	//	if(menuItemRef !=null)
		if(this.allowedTypeOf(menuItemRef))
			return menuItemRef;
		else
			return undefined;
	}
	
	/*
		Function 	:	Menu.setRightSoftkeyLabel()
		Argument	:	String, Function
		Returns		:	Void
		Description	:	Set the label of the right soft key to str. This enables the default text 
						to be changed from exit and a new function assigned by setting a callbackfunction
	*/

	menu.setRightSoftkeyLabel = function(label, callback)
	{
		window.menu = this;
		try
		{
			if(typeof label != '' && !label)
				this.setExitToRsk();			

			else if(typeof callback != 'function' && !callback)
				this.setExitToRsk();			
			
			else if (_BRIDGE_REF.nokia.menu.setRsk(callback)) {
				_BRIDGE_REF.parent.$("#RskLabel > a")[0].innerHTML = label;
				_BRIDGE_REF.nokia.menu.rsk_label = label;
				_BRIDGE_REF.nokia.menu.rsk_event = callback;
				_BRIDGE_REF.nokia.menu.is_rsk_overridden = true;
			}
			else 
				this.setExitToRsk();

		}catch(e){ 
			// alert(e);
		 }
	}


	menu.setExitToRsk = function()
	{
		this.onRightSoftKeySelect = null;

		_BRIDGE_REF.nokia.menu.is_rsk_overridden = false;
		_BRIDGE_REF.nokia.menu.rsk_label = '';
		_BRIDGE_REF.nokia.menu.rsk_event = null;
		_BRIDGE_REF.parent.$("#RskLabel > a")[0].innerHTML = 'Exit';

		_BRIDGE_REF.nokia.menu.setRsk(function(){
			_BRIDGE_REF.nokia.menu.exit();
		});
	}
	
	/*
		Function 	:	Menu.showSoftkeys()
		Argument	:	Void
		Returns		:	Void
		Description	:	Makes the softkeys visible. By default the softkeys are not visible
	
	*/
	menu.showSoftkeys = function()
	{
		/*
		 *  Shows showSoftkeys
		 */
		_BRIDGE_REF.nokia.menu.softkeys_visibility = true;
		_BRIDGE_REF.nokia.menu.showSoftKeys();
	}
	
	/*
		Function 	:	Menu.hideSoftkeys()
		Argument	:	Void
		Returns		:	Void
		Description	:	Makes the softkeys invisible. By default the softkeys are not visible. 
	
	*/
	menu.hideSoftkeys = function()
	{
		/*
		 *  Hide showSoftkeys
		 */
		_BRIDGE_REF.nokia.menu.softkeys_visibility = false;
		_BRIDGE_REF.nokia.menu.hideSoftKeys();
	}
	
	
	/*	
	 *  
	 * ----------------------------------------------------------------
	 * Exta Functionalities which helps to make main functions to work
	 * ----------------------------------------------------------------
	 *  
	*/
	
	menu.cancel = function()
	{
		_BRIDGE_REF.nokia.menu.cancel();
	}
	
	menu.exit = function()
	{
		_BRIDGE_REF.nokia.menu.exit();
	}
	
	
	menu.triggeLSKEvent = function()
	{
		if(typeof(window.menu.onShow) == 'function')
		{
				window.menu.onShow();
		}
		_BRIDGE_REF.parent.$('#softKeysPane').show();
		this.show();
	}
	
	menu.triggerEvent = function(MenuItemId)
	{
		try{
			var menuItemRef = this.menuItemExhistsById(this, MenuItemId, 0);
			if(menuItemRef != null)
			{
				if(typeof menuItemRef.onSelect == 'function')
					menuItemRef.onSelect(MenuItemId);
		
				if(_BRIDGE_REF.helper.getElementsLengthInObject(menuItemRef.items))
					this.show(MenuItemId);
				else
					this.cancel();

			}else
			{
				this.show();
			}
		}
		catch(e)
		{
			alert('triggeEvent: '+MenuItemId+' >> '+e);
		}
	}
	
	menu.hasChild = function(parentId)
	{
		for(var i in this.items)
		{
			if(this.items[i].parentId == parentId)
			{	
				 return true;
			}
		}
		return false;
	}
	
	
	menu.allowedTypeOf = function(MenuItem)
	{
		try
		{
			if( (typeof(MenuItem) == 'object') && (MenuItem.type == 'MenuItem'))
				return true;			
		}
		catch(e)
		{
			return false;
		}
	}
	
	menu.show = function(parentId)
	{
		try
		{
			var menuItemsPane = _BRIDGE_REF.parent.$('#MenuItemsArea')
			menuItemsPane = menuItemsPane[0];
			
			menuItemsPane.innerHTML = '';
			
			var ul = document.createElement('ul');
			var ele = window.menu;

			if(typeof parentId != 'undefined' && typeof parentId == 'object')
			{
				if (typeof window.menu.onShow != null && typeof window.menu.onShow == 'function') {
					window.menu.onShow();
				}
			}

			if(typeof parentId == 'number')
			{
				var tempRef = menu.menuItemExhistsById(ele, parentId, 0);
	
				if(typeof parentId != 'undefined' && typeof tempRef != 'undefined')
					ele = tempRef;
			}

			if(_BRIDGE_REF.helper.getElementsLengthInObject(ele.items))
			{
				for(var key in ele.items)
				{
					if(!ele.items[key].isDimmed){
						
						try{
							ul.appendChild(menu.create_menuElement(ele.items[key]));
						}catch(e){  }
					}
				}
				if(typeof parentId == 'number' && _BRIDGE_REF.helper.getElementsLengthInObject(ele.items))
				{
					if(ele.parent)
						ul.appendChild(menu.create_normalMenuItem('Back', ele.parent.id));	
					else
						ul.appendChild(menu.create_normalMenuItem('Back', null));	
				}
				else
				{
					ul.appendChild(menu.create_exitMenuItem());	
				}


				if(_BRIDGE_REF.helper.getElementsLengthInObject(ele.items) > 5)
					menuItemsPane.style.overflowY = 'scroll';
				else
					menuItemsPane.style.overflowY = 'hidden';

			}
			else
			{
				menuItemsPane.style.overflowY = 'hidden';
				ul.appendChild(menu.create_exitMenuItem());	
			}
			menuItemsPane.innerHTML = '<ul>'+ul.innerHTML+'</ul>';
			
			_BRIDGE_REF.nokia.menu.show();
		}
		catch(e)
		{
			alert('menu.show: '+e);
		}
	}



/*
*
*	HELPER FUNCTIONS
*
*/

	menu.menuItemExhistsById = function(menuReference, value, argumentType)
	{
		var flag = null;
		
		for(var key in menuReference.items)
		{
			if(!argumentType)
			{
				if(menuReference.items[key].id == value)
				{	
					flag = true; 
					break; 
				}
			}
			else
			{
				if(menuReference.items[key].name == value)
				{	
					flag = true; 
					break; 
				}
			}
			
			if(menuReference.items[key].items != undefined && menuReference.items[key].items.length)
			{
				var temp = this.menuItemExhistsById(menuReference.items[key], value, argumentType);
				if(temp)
					return temp;
			}
		}
		if(flag)
		{
			// crate a package and send it
			menuReference.items[key].index = key;
			return menuReference.items[key];
		}
		else
			return null;
	}
	
	menu.create_menuElement = function(MenuItem) 
	{
		var listitem = document.createElement('li');
		listitem.id = MenuItem.id;
		listitem.setAttribute('onClick', 'javascript:NOKIA.emulator.child.menu.triggerEvent('+MenuItem.id+');');
	
	    var anchor = document.createElement('a');
		anchor.id = 'subMenuItem_'+MenuItem.id;
		anchor.innerHTML = MenuItem.name;
		if(_BRIDGE_REF.helper.getElementsLengthInObject(MenuItem.items))
	 	{  
			anchor.className = 'subMenuItem';
			anchor.setAttribute('href', 'javascript:NOKIA.emulator.child.menu.show('+MenuItem.id+');');
		}
	    listitem.appendChild(anchor);
		return (listitem);
	}
	
	menu.create_normalMenuItem = function(MenuTitle, index) 
	{
	    var listitem = document.createElement('li');
	
	    var anchor = document.createElement('a');
		anchor.id = 'subMenuItem_BACK';
		anchor.innerHTML = MenuTitle;
	
		if (MenuTitle == 'Back') {
			listitem.className = 'exitOrBackBtn';
			anchor.setAttribute('href', 'javascript:NOKIA.emulator.child.menu.triggerEvent(' + index + ');');
		}
		else 
			anchor.setAttribute('href', 'javascript:NOKIA.emulator.child.menu.triggerEvent(' + index + ');');
	    
		listitem.appendChild(anchor);
		return (listitem);
	}
	
	menu.create_exitMenuItem = function() 
	{
	    var listitem = document.createElement('li');
		listitem.className = 'exitOrBackBtn';
	    var anchor = document.createElement('a');
		anchor.id = 'subMenuItem_EXIT';
		anchor.innerHTML = 'Exit';
		anchor.setAttribute('href', 'javascript:NOKIA.emulator.child.menu.exit();');
		listitem.setAttribute('onClick', 'javascript:NOKIA.emulator.child.menu.exit();');
		
	    listitem.appendChild(anchor);
		return (listitem);
	}
	
	menu.triggeRSK = function()
	{
		try {
			if (window.menu) {
				if (childToParent_Reference.$('softKeysPane').style.display != 'none') {
					if (window.menu.onRightSoftKeySelect != null) {
						window.menu.onRightSoftKeySelect();
						window.menu.cancel();
					}
					else {
						window.menu.cancel();
					}
				}
			}
		}catch(e)
		{
			alert(e);
		}
	}
	
	menu.triggeLSK = function()
	{
		if(window.menu)
		{
			window.menu.show();
			if(typeof(window.menu.onShow) == 'function')
			{
				if(window.menu.onShow)
				{
					window.menu.onShow();
				}
			}
		}
	}


	//	make TRUE menu.js script loaded
	window.parent.NOKIA.scriptsLoaded.menu = true;
}