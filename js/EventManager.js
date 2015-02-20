/**
 * EventManager.js - Class for handling the registering and triggering of page events.
 */

/**
 * constructor function
 */
Utils.cEventManger = function () {
    this.mEvents = {};
    for (var type in Utils.gEventTypes) {
        this.mEvents[Utils.gEventTypes[type]] = [];
    }
};

/**
 * AddEventListener - function to register an event listener.<br> 
 * Examples:<br>
 * 			<i>Utils.gEventManager.AddEventListener(Utils.gEventTypes.HASHCHANGED, 'pageState', Utils.gPageStateHandler.ProcessHash);</i>
 * 			
 * @param {Object} eventType - one of the Utils.gEventTypes
 * @param {Object} eventUID - hex ID of the control triggering the event OR page name listening to the hash 
 * @param {Object} callback - function called when event is triggered
 */
Utils.cEventManger.prototype.AddEventListener = function (eventType, eventUID, callback) {
    if(this.mEvents[eventType] !== undefined) {
		var targetControlEvt = this.mEvents[eventType]["'" + eventUID + "'"] || null;
		if (targetControlEvt !== null) {
			var functArr = new Array();
			for (var i = 0; i < targetControlEvt.length; i++) {
				if (callback === targetControlEvt[i]) {
					console.debug("event already exists");
					return;
				} else {
					var addEvent = true;
					for(var x=0; x<functArr.length; x++) {
						if(targetControlEvt[i] === functArr[x]) {
							addEvent=false;
						}
					}
					if (addEvent) {
						functArr.push(targetControlEvt[i])
					}
				}
			}
			functArr.push(callback);
			this.mEvents[eventType]["'" + eventUID + "'"] = functArr;
		} else {
			this.mEvents[eventType]["'" + eventUID + "'"] = [callback];
		}
    }
	//console.debug("on add", this.mEvents[eventType], eventType, eventUID, callback)
	//this.DebugEventList();
}

/**
 * RemoveEventListener - function used to remove an event listener.<br>
 * Example: <i>Utils.gEventManager.RemoveEventListener('click', Utils.gGamePageIDs.mContinueTab);</i> 
 * @param {Object} eventType - one of the Utils.gEventTypes
 * @param {Object} eventUID - hex ID of the control triggering the event OR page name listening to the hash 
 * @param {Object} callback - function that should be removed 
 */
Utils.cEventManger.prototype.RemoveEventListener = function(eventType, eventUID, callback) {
	var tempEventList = [];
    if (this.mEvents[eventType] !== undefined) {
		for(var control in this.mEvents[eventType]) {
			if (callback === null || callback === undefined) {
				if ("'" + eventUID + "'" !== control && this.mEvents[eventType][control] !== undefined) {
					tempEventList[control] = this.mEvents[eventType][control]
				}
			} else {
				if ("'" + eventUID + "'" === control && this.mEvents[eventType][control] !== undefined) {
					var newArr = new Array();
					var currControlEvts = this.mEvents[eventType][control];
					var eventLen = currControlEvts.length;
					for(var i=0; i<eventLen; i++) {
						if(currControlEvts[i] !== callback) {
							newArr.push(currControlEvts[i]);
						}
					}
					this.mEvents[eventType][control] = newArr;
					
				}
				tempEventList[control] = this.mEvents[eventType][control];
			}
		}
        this.mEvents[eventType] = tempEventList;
    }
	tempEventList = null;
}

/**
 * TriggerEvent - function which is called to trigger an event
 * @param {Object} eventType
 * @param {Object} eventUID
 * @param {Object} targetControl
 */
Utils.cEventManger.prototype.TriggerEvent = function (eventType, eventUID, targetControl) {
	//console.debug(eventType, eventUID, targetControl);
    if(this.mEvents[eventType] !== undefined) {
		if (eventType === Utils.gEventTypes.HASHCHANGED) {
			var eventsList = this.mEvents[eventType];

			for(var eventName in eventsList) {
				var event = eventsList[eventName];
				if (typeof event === "function") {
					event(targetControl);
				}
				if (typeof event === "array") {
					var totalEvents = event.length
					for(i=0; i<totalEvents; i++) {
						event[i](targetControl);	
					}
				}
			}
		} else {
			var newEvent = this.mEvents[eventType]["'" + eventUID + "'"] || null;
			if (newEvent !== null) {
				if (typeof newEvent === "function") {
					newEvent(targetControl);
					return;
				}
				if (typeof newEvent === "object") {
					var eventKeys = Object.keys(newEvent);
					for(var key in newEvent) {
						newEvent[key](targetControl);
					}
					
				}
			}
		}
    }
}

/**
 * debug function to show the events array to the console
 */
Utils.cEventManger.prototype.DebugEventList = function () {
    console.debug(this.mEvents);
	//if(typeof Panel == "object") {
	//	Panel.mStateController.DebugMsg(this.mEvents);
	//}
};

/**
 * enum of possible event types
 */
Utils.gEventTypes = {
	CLICK : "click",
	MOUSEOVER: "mouseover",
	MOUSEOUT: "mouseout",
	MOUSEMOVE: "mousemove",
	DATACHANGED: "datachanged",
	HASHCHANGED: "hashchanged",
    KEYDOWN: "keydown",
    KEYUP: "keyup",
    GAME: "gameevent",
    SOCKET: "socketevent"
}

