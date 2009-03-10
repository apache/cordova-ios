/**
 * Media/Audio override.
 *
 */

Media.prototype.play = function() {
	if (this.src != null) {
		document.location = "gap://Sound.play/" + this.src;
	}
}