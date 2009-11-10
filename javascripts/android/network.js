Network.prototype.isReachable = function(uri, win, options)
{
  var status = new NetworkStatus();
  if(NetworkManager.isReachable(uri))
  {
    if (NetworkManager.isWifiActive)
      status.code = 2;
    else
      status.code = 1;
  }
  else
      status.code = 0;
  win(status);
}
