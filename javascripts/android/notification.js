Notification.prototype.vibrate = function(mills)
{
  Device.vibrate(mills);
}

/*
 * On the Android, we don't beep, we notify you with your 
 * notification!  We shouldn't keep hammering on this, and should
 * review what we want beep to do.
 */

Notification.prototype.beep = function(count, volume)
{
  Device.notify();
}
