/**
 * The MIT License
 * -------------------------------------------------------------
 * Copyright (c) 2008, Rob Ellis, Brock Whitten, Brian Leroux, Joe Bowser, Dave Johnson, Nitobi
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package com.nitobi.phonegap.api.impl;

import java.util.Enumeration;
import java.util.Hashtable;

import javax.microedition.pim.Contact;
import javax.microedition.pim.PIM;

import net.rim.blackberry.api.pdap.BlackBerryContact;
import net.rim.blackberry.api.pdap.BlackBerryContactList;

import com.nitobi.phonegap.PhoneGap;
import com.nitobi.phonegap.api.Command;

/**
 * Finds data in agenda. 
 *
 * @author Jose Noheda
 * @author Fil Maj
 *
 */
public class ContactsCommand implements Command {

	private static final int SEARCH_COMMAND = 0;
	private static final int GET_ALL_COMMAND = 1;
	private static final int CHOOSE_COMMAND = 2;
	private static final String CODE = "PhoneGap=contacts"; 
	private static final String CONTACT_MANAGER_JS_NAMESPACE = "navigator.ContactManager";

	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}

	/**
	 * Invokes internal phone application.
	 */
	public String execute(String instruction) {
		Hashtable options = ContactsCommand.parseParameters(instruction);
		switch (getCommand(instruction)) {
			case SEARCH_COMMAND:
				return getAgenda(options);
			case GET_ALL_COMMAND:
				return getAgenda(options);
			case CHOOSE_COMMAND:
				return chooseContact();
		}
		return null;
	}
	/**
	 * Invokes the default BlackBerry contact chooser to allow the user to choose a contact.
	 * @return JSON representation of the chosen contact, which will then be sent back to JavaScript.
	 */
	private String chooseContact() {
		try {
			BlackBerryContactList agenda = (BlackBerryContactList) PIM.getInstance().openPIMList(PIM.CONTACT_LIST, PIM.READ_ONLY);
			BlackBerryContact blackberryContact;
			StringBuffer contacts = new StringBuffer("[");
			if (agenda != null) {
				blackberryContact = (BlackBerryContact) agenda.choose();
				agenda.close();
				ContactsCommand.addContactToBuffer(contacts, blackberryContact);
				contacts.append("];");
				return ";" + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + ".contacts=" + contacts.toString() + "if (" + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + ".choose_onSuccess) { " + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + ".choose_onSuccess();" + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + ".choose_onSuccess = null; };";
			} else {
				// TODO: If cannot get reference to Agenda, should the error or success callback be called?
				return ";" + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + ".contacts=" + contacts.append("];").toString() + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + ".choose_onSuccess = null;";
			}
		} catch (Exception e) {
			System.out.println("Exception getting contact list: " + e.getMessage());
			// TODO: No error callbacks associated with contact chooser - what to do?
		}
		return null;
	}

	/**
	 * Parses the options object and returns a hash of params.
	 * @param instruction The cookie/string representation of the instruction.
	 * @return Hashtable 
	 */
	private static Hashtable parseParameters(String instruction) {
		String[] params = PhoneGap.splitString(instruction, '/', false);
		int numParams = params.length;
		Hashtable hash = new Hashtable();
		for (int i = 0; i < numParams; i++) {
			String curParam = params[i];
			if (curParam.indexOf(':') == -1) continue;
			String[] key_value = PhoneGap.splitString(curParam, ':', false);
			if (key_value.length < 2) continue;
			String key = key_value[0];
			String value = key_value[1];
			hash.put(key, value);
		}
		return hash;
	}
	private int getCommand(String instruction) {
		String command = instruction.substring(instruction.indexOf('/') + 1);
		if (command.startsWith("search")) return SEARCH_COMMAND;
		if (command.startsWith("getall")) return GET_ALL_COMMAND;
		if (command.startsWith("choose")) return CHOOSE_COMMAND;
		return -1;
	}
	/**
	 * Returns a contact list, either all contacts or contacts matching the optional search parameter.
	 * @param options A hash of options to pass into retrieving contacts. These can include name filters and paging parameters.
	 * @return JSON string representing the contacts that are retrieved.
	 */
	private String getAgenda(Hashtable options) {
		String callbackHook = "";
		try {
			BlackBerryContactList agenda = (BlackBerryContactList) PIM.getInstance().openPIMList(PIM.CONTACT_LIST, PIM.READ_ONLY);
			StringBuffer contacts = new StringBuffer("[");
			if (agenda != null) {
				Enumeration matches;
				String name = options.get("nameFilter")!=null?options.get("nameFilter").toString():"";
				if (name != "") {
					matches = agenda.itemsByName(name);
					callbackHook = "search_";
				} else {
					matches = agenda.items();
					callbackHook = "global_";
				}
				int pageSize = 0, pageNumber = 0;
				if (options.contains("pageSize")) pageSize = Integer.parseInt(options.get("pageSize").toString());
				if (options.contains("pageNumber")) pageNumber = Integer.parseInt(options.get("pageNumber").toString());
				if (pageSize > 0) {
					for (int i = 0; i < pageSize*pageNumber && matches.hasMoreElements(); i++) {
						matches.nextElement();
					}
					for (int j = 0; j < pageSize && matches.hasMoreElements(); j++) {
						BlackBerryContact contact = (BlackBerryContact)matches.nextElement();
						ContactsCommand.addContactToBuffer(contacts, contact);
						contacts.append(',');
					}
				} else {
					while (matches.hasMoreElements()) {
						BlackBerryContact contact = (BlackBerryContact)matches.nextElement();
						ContactsCommand.addContactToBuffer(contacts, contact);
						contacts.append(',');
					}
				}
				if (contacts.length() > 1) contacts = contacts.deleteCharAt(contacts.length() - 1);
				contacts.append("];");
				// Return an assignment to the contact manager contacts array with the contacts JSON generated above.
				// Also call the right onSuccess if it exists.
				return ";" + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + ".contacts=" + contacts.toString() + "if (" + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + "." + callbackHook + "onSuccess) { " + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + "." + callbackHook + "onSuccess();" + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + "." + callbackHook + "onSuccess = null;" + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + "." + callbackHook + "onError = null; };"; 
			} else {
				// TODO: If cannot get reference to Agenda, should the error or success callback be called?
				return ";" + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + ".contacts=" + contacts.append("];").toString() + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + "." + callbackHook + "onSuccess = null;" + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + "." + callbackHook + "onError = null;";
			}
		} catch (Exception ex) {
			System.out.println("Exception getting contact list: " + ex.getMessage());
			return ";if (" + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + "." + callbackHook + "onError) { " + ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + "." + callbackHook + "onError();" +  ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + "." + callbackHook + "onSuccess = null;" +  ContactsCommand.CONTACT_MANAGER_JS_NAMESPACE + "." + callbackHook + "onError = null; };"; 
		}
	}
	private static void addContactToBuffer(StringBuffer buff, BlackBerryContact contact) {
		buff.append("{email:'");
		buff.append(contact.getString(Contact.EMAIL, 0));
		buff.append("', phone:'");
		buff.append(contact.getString(Contact.TEL, 0));
		buff.append("', name:'");
		String displayName = "";
		// See if there is a meaningful name set for the contact.
	    if (contact.countValues(Contact.NAME) > 0) {
	        final String[] name = contact.getStringArray(Contact.NAME, 0);
	        final String firstName = name[Contact.NAME_GIVEN];
	        final String lastName = name[Contact.NAME_FAMILY];
	        if (firstName != null && lastName != null) {
	            displayName = firstName + " " + lastName;
	        } else if (firstName != null) {
	            displayName = firstName;
	        } else if (lastName != null) {
	            displayName = lastName;
	        }
	        if (displayName != "") {
	            final String namePrefix = name[Contact.NAME_PREFIX];
	            if (namePrefix != null) {
	                displayName = namePrefix + " " + displayName;
	            }
	        }
	    }
	    buff.append(displayName + "'}");
	}
}
