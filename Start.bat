@echo off
start Hosting\Tor\tor.exe --HTTPTunnelPort 7979 -f Hosting\Config\torrc.config
node app.js
exit