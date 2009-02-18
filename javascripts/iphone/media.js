/**
 * Media/Audio override.
 *
 */

Media.prototype.play = function() {
	if (this.src != null) {
		document.location = "gap://playSound/" + this.src;
	}
}