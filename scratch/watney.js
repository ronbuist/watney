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
    var camWindow = null;
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
    
    // Cleanup function
    function doCleanup() {

		// Stop heartbeat interval (if it's running)
		if (heartbeatInterval !== null) {
			clearInterval(heartbeatInterval);
			heartbeatInterval = null;
		}

        // Close the cam window (if it's open)
        if (camWindow !== null) {
        	camWindow.close();
        	camWindow = null;
        }
        
        // Reset WiFi data
        wifiSSID = '';
        wifiQuality = '';
        wifiSignal = '';

    };

    // when the connect to Watney block is executed.
    ext.cnct = function (watneyHostname, callback) {

		// store the hostname; we'll need it for the other code blocks.
		hostname = watneyHostname;

		// There shouldn't be anything to clean up at this point, but we'll do
		// it anyway...
		doCleanup();

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

        // Clean up
        doCleanup();

    };

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function (status, msg) {
        return {status: myStatus, msg: myMsg};
    };
    
    // When the open camera block is executed
	ext.camopen = function () {
			
		// Open the camera window, but only if we haven't done so already.
		if (camWindow == null) {
			camWindow = window.open('http://' + hostname + ':5000/camwindow.html');
		}

	};
	
	// When the close camera block is executed
	ext.camclose = function () {
	
		// Close the camera window, but only if we have opened it before.
		if (camWindow !== null) {
			camWindow.close();
			camwindow = null;
		}
	};

    // when the disconnect from server block is executed
    ext.discnct = function () {

        connected = false;
        myMsg = 'not_ready';                    // back to yellow status.
        myStatus = 1;
        
        // Clean up
        doCleanup();

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
    
    	// The wifi signal is updated through the Watney heartbeat.
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
                [" ", 'Open camera window', 'camopen'],
                [" ", 'Sluit camera window', 'camclose'],
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
                [" ", 'Open camera window', 'camopen'],
                [" ", 'Close camera window', 'camclose'],
                [" ", 'Disconnect from Watney rover', 'discnct'],
                [" ", 'Drive in direction %m.direction', 'drive', "0"],
                ["r", 'WiFi SSID','getWifiSSID'],
                ["r", 'WiFi Quality','getWifiQuality'],
                ["r", 'WiFi Signal','getWifiSignal']
            ],
            "menus": {
                "direction": ["0", "n", "nw", "ne", "s", "se", "sw", "e", "w"],
                "showstate": ["On", "Off"]

            },
            url: 'https://github.com/ronbuist/watneyscratch'
        };
    };

    // Register the extension
    ScratchExtensions.register('watney', descriptor, ext);
})({});
