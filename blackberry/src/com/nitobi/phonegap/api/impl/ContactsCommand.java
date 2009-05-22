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

import javax.microedition.pim.Contact;
import javax.microedition.pim.PIM;

import net.rim.blackberry.api.pdap.BlackBerryContact;
import net.rim.blackberry.api.pdap.BlackBerryContactList;

import com.nitobi.phonegap.api.Command;

/**
 * Finds data in agenda. 
 *
 * @author Jose Noheda
 *
 */
public class ContactsCommand implements Command {

	private static final int SEARCH_COMMAND = 0;
	private static final String CODE = "gap://contacts"; 

	/**
	 * Able to run the <i>call</i> command. Ex: gap://contacts/search/name/Joe
	 */
	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}

	/**
	 * Invokes internal phone application.
	 */
	public String execute(String instruction) {
		switch (getCommand(instruction)) {
			case SEARCH_COMMAND:
				return "navigator.ContactManager.contacts = navigator.ContactManager.contacts.concat(" + getAgendaByName("Joe") + ");";
		}
		return null;
	}

	private int getCommand(String instruction) {
		String command = instruction.substring(instruction.substring(7).indexOf('/') + 1);
		if (command.indexOf("search") > 0) return SEARCH_COMMAND;
		return -1;
	}

	private String getAgendaByName(String name) {
		try {
			BlackBerryContactList agenda = (BlackBerryContactList) PIM.getInstance().openPIMList(PIM.CONTACT_LIST, PIM.READ_ONLY);
			if (agenda != null) {
				StringBuffer contacts = new StringBuffer("[");
				Enumeration matches = agenda.itemsByName(name);
				while (matches.hasMoreElements()) {
					BlackBerryContact contact = (BlackBerryContact) matches.nextElement();
					contacts.append("{email:'");
					contacts.append(contact.getString(Contact.EMAIL, 0));
					contacts.append("', phone:'");
					contacts.append(contact.getString(Contact.TEL, 0));
					contacts.append("'},");
				}
				return contacts.deleteCharAt(contacts.length() - 1).append("]").toString();
			}
		} catch (Exception ex) {
			System.out.println("Exception getting contact list: " + ex.getMessage());
		}
		return null;
	}

}
