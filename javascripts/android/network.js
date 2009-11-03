Network.prototype.isReachable = function(uri, win, fail)
{
  if(NetworkManager.isReachable(uri))
    win();
  else
    fail();
}
