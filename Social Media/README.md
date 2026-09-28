# GlideNet

## Start on Windows

1. Install the Node.js LTS version from https://nodejs.org/ if it is not already installed.
2. Keep `Start GlideNet.bat`, `server.js`, `Glidernet.html`, `styles.css`, and `GliderSpace.png` together in the same folder.
3. Double-click `Start GlideNet.bat`. It starts the server and opens the site in your browser. Leave the GlideNet Server window open while using the site.
4. If Windows Firewall asks, allow Node.js on private networks.

## Let another device connect

Both devices must be on the same Wi-Fi or local network. On the computer running GlideNet, find its IPv4 address in Windows Settings under Network & Internet, then open `http://<computer-ip>:3000/` on the other device. For example: `http://192.168.1.25:3000/`.

The server must keep running, and the other device may need permission through the host computer's firewall. `localhost` only refers to the device where the browser is running.

## Current storage behavior

Server names, messages, pictures, and reactions use browser `localStorage`. They remain in that browser but are not synchronized across different users or devices.