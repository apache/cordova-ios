/**
 * The MIT License
 * -------------------------------------------------------------
 * Copyright (c) 2008, Rob Ellis, Brock Whitten, Brian Leroux, Joe Bowser, Dave Johnson, Fil Maj, Nitobi
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

import java.io.IOException;
import java.io.InputStream;
import java.util.Hashtable;

import javax.microedition.media.Player;
import com.nitobi.phonegap.api.Command;

/**
 * Wraps playing local storage (music) media on the BlackBerry for access from JavaScript.
 * @author Fil Maj
 *
 */
public class MediaCommand implements Command {
	private static final String CODE = "PhoneGap=media";
	private Player musicPlayer;
	private Hashtable extToMime = new Hashtable();
	
	public MediaCommand() {
		extToMime.put("wav", "audio/x-wav");
		extToMime.put("au", "audio/basic");
		extToMime.put("snd", "audio/basic");
		extToMime.put("mid", "audio/mid");
		extToMime.put("rmi", "audio/mid");
		extToMime.put("mp3", "audio/mpeg");
		extToMime.put("aif", "audio/x-aiff");
		extToMime.put("aiff", "audio/x-aiff");
		extToMime.put("aifc", "audio/x-aiff");
		extToMime.put("ra", "audio/x-pn-realaudio");
		extToMime.put("ram", "audio/x-pn-realaudio");
	}
	
	/**
	 * Determines whether the specified instruction is accepted by the command. 
	 * @param instruction The string instruction passed from JavaScript via cookie.
	 * @return true if the Command accepts the instruction, false otherwise.
	 */
	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}
	
	public String execute(String instruction) {
		String mediaURI = instruction.substring(instruction.indexOf('/')+1);
		try
        {
            InputStream in = getClass().getResourceAsStream("/" + mediaURI);            
            String audioMime = this.mapExtensionToMime(mediaURI.substring(mediaURI.lastIndexOf('.')+1));
            if (audioMime == null) return ";alert('[PhoneGap Error] Media type not supported.');";
            // Create a media player with our inputstream
            musicPlayer = javax.microedition.media.Manager.createPlayer(in, audioMime);
            musicPlayer.realize();
            musicPlayer.prefetch();
            musicPlayer.setLoopCount(1);
            musicPlayer.start();
            return "";
        }
        catch (IOException e) {
        	return ";alert('[PhoneGap Error] Media file I/O exception.');";
		} catch (javax.microedition.media.MediaException e) {
			return ";alert('[PhoneGap Error] Could not play and/or determine media file type.');";
		}
	}
	/**
	 * Maps media file extensions to mime type, for use with the sound player.
	 * @param extension The media file extension
	 * @return A mime type as a string
	 */
	private String mapExtensionToMime(String extension) {
		return extToMime.get(extension).toString();
	}
}
