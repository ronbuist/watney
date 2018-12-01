/**
 Copyright (c) 2018 Ron Buist All right reserved.
 Watney Scratch extension is free software; you can redistribute it and/or
 modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 Version 3 as published by the Free Software Foundation; either
 or (at your option) any later version.
 This library is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.
 You should have received a copy of the GNU AFFERO GENERAL PUBLIC LICENSE
 along with this library; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

(function (ext) {

    var heartbeatInterval = null;
    var connected = false;
    var myStatus = 1;						// initially, set light to yellow
    var myMsg = 'not_ready';
    var wifiSSID = '';
    var wifiQuality = '';
    var wifiSignal = '';
    var hostname = '';

	// Function for sending the heartbeat to the Watney rover.
	function doHeartbeat() {
	
		// JSON call to do the heartbeat.
        $.ajax({
            url:'http://' + hostname + ':5000/heartbeat',
            type:"POST",
            dataType:"json"
        }).done(function(data) {
            wifiSSID = data.SSID;
            wifiQuality = data.Quality;
            wifiSignal = data.Signal;
        });
    };

    // when the connect to Watney block is executed.
    ext.cnct = function (watneyHostname, callback) {

		// store the hostname; we'll need it for the other code blocks.
		hostname = watneyHostname;

		// Check if there is already a heartbeat running. This should not be
		// the case, but we'll stop it if there is one running.
		if (heartbeatInterval !== null) {
			clearInterval(heartbeatInterval);
		}

		// Start the heartbeat to Watney
		heartbeatInterval = setInterval(function () { doHeartbeat() },1000);
		
        // change status light from yellow to green.
        myMsg = 'ready';
        connected = true;
        myStatus = 2;

        // Callback to let Scratch know initialization is complete.
        callback();
    };

    // Cleanup function when the extension is unloaded
    ext._shutdown = function () {

        // Clear the heartbeat timeout
        clearInterval(heartbeatInterval);
    };

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function (status, msg) {
        return {status: myStatus, msg: myMsg};
    };


    // when the disconnect from server block is executed
    ext.discnct = function () {

        connected = false;
        myMsg = 'not_ready';                    // back to yellow status.
        myStatus = 1;
        
        // Clear the heartbeat timeout
        clearInterval(heartbeatInterval);

    };
    
    // When the wifi SSID reporter block is executed
    ext.getWifiSSID = function() {
    
    	// The SSID is updated through the Watney heartbeat.
    	// Just return its value here...
    	return wifiSSID;
    };

    // When the wifi Quality reporter block is executed
    ext.getWifiQuality = function() {
    
    	// The wifi quality is updated through the Watney heartbeat.
    	// Just return its value here...
    	return wifiQuality;
    };

    // When the wifi Signal reporter block is executed
    ext.getWifiSignal = function() {
    
    	// The SSID is updated through the Watney heartbeat.
    	// Just return its value here...
    	return wifiSignal;
    };

    // Block and block menu descriptions
    var lang = navigator.language || navigator.userLanguage;
    lang = lang.toUpperCase();
    if (lang.includes('NL')) {

        var descriptor = {
            blocks: [
                // Block type, block name, function name
                ["w", 'Verbind met Watney rover op %s', 'cnct', "Host"],
                [" ", 'Verbreek verbinding met Watney rover', 'discnct'],
                [" ", 'Rij in richting %m.direction', 'drive', "0"],
                ["r", 'WiFi SSID','getWifiSSID'],
                ["r", 'WiFi Kwaliteit','getWifiQuality'],
                ["r", 'WiFi Signaal','getWifiSignal']
            ],
            "menus": {
                "direction": ["0", "n", "nw", "no", "z", "zo", "zw", "o", "w"],
                "showstate": ["Aan", "Uit"]

            },
            url: 'https://github.com/ronbuist/watneyscratch'
        };

    }
    else {

        var descriptor = {
            blocks: [
                // Block type, block name, function name
                ["w", 'Connect to Watney rover on host %s', 'cnct', "Host"],
                [" ", 'Disconnect from Watney rover', 'discnct'],
                [" ", 'Drive in direction %m.direction', 'drive', "0"],
                ["r", 'WiFi SSID','getWifiSSID'],
                ["r", 'WiFi Quality','getWifiQuality'],
                ["r", 'WiFi Signal','getWifiSignal']
            ],
            "menus": {
                "direction": ["0", "n", "nw", "ne", "s", "se", "sw", "e", "w"],
                "showstate": ["Aan", "Uit"]

            },
            url: 'https://github.com/ronbuist/watneyscratch'
        };
    };

    // Register the extension
    ScratchExtensions.register('watney', descriptor, ext);
})({});
