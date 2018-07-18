# island-game-refresh

Full stack multiplayer turn / tile-based game using Phaser and socket.io.
A fresh restart from the other island game, attempting to be cleaner
and use a more functional / event driven architecture.

All you need to do is:
* Run npm install in both the server and client folders
* Create a .env file in the server with PORT = (whatver port you would like)
* Run npm run dev or npm run build from the server folder, this will also
start Webpack watching the client for changes.
* Visit the page from your browser.
* The game begins once there are two players ( I usually just duplicate the tab for testing )
but you may have to refresh once or twice for it to work ( still trying to fix that ).
