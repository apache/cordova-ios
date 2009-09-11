
/**
 * This class provides access to the device media, interfaces to both sound and video
 * @constructor
 */

Media.prototype.playAudio = function(filename) {
  PhoneGap.startPlayingiAudio(filename);  
}

Media.prototype.stopAudio = function() {
  PhoneGap.stopPlayingAudio();
}
