'use strict'

Grass.gGameCore = null;

/**
 * main game manager
 */
Grass.cGameCore = function () {
    
    //managers
    this.mScreenManager = null;
    this.mCanvasManager = null;
    this.mCollisionManager = null;
    this.mEventManager = null;
	this.mMouseTrack = null;
	this.mSimCore = null;
    
    //debug panel
    this.mDebugPanel = null;
    this.mShowDebug = false;
    
    //html layers
    this.mMainBgDivObj = null;
    this.mGameLayerDivObj = null;
    this.mUILayerDivObj = null;
    
    //holders
    this.mRootDomObj = null;
    this.mDocWidth = 0;
    this.mDocHeight = 0;
	this.mScreenSegmentSize = 40;
    
    //misc game values
    this.mGameIsPaused = true;
    this.mIsTouchUI = null;
	this.mGameStarted = false;
	
	this.mLawnManager = null;	
	
	this.mGameCanvas = null;
    this.mToolbarCanvas = null;    

    this.mMapsPath = ['lawn_maps/', ];
    this.mMaps = ['start', 'pond1', 'test-map', 'flat'];
	
    this.mCurrTilesInSegment = [];
    this.mHighlightedTile = null;
	this.mHighlightedTileIndex = null;
    this.mSelectedTile = null;
	this.mSelectedTileIndex = null;
	
	this.mGamePads = [];
	this.mButtonPressed = new Array(16);
	for(var i=0; i<this.mButtonPressed.length; i++) {
		this.mButtonPressed[i] = false;
	} 
	
    //load up map data into localStorage
    localStorage.clear();
    for(var i=0, l=this.mMaps.length; i<l; i++) {
        var scriptTag = document.createElement('script');
        scriptTag.type = "text/javascript";
        scriptTag.src = this.mMapsPath + this.mMaps[i] + '.js';
        document.head.appendChild(scriptTag);
    }
	
    this.mGrassClumpImgObj = new Image();
    this.mGrassClumpImgObj.src = "lawn_maps/grass_clump-sm.png";

    this.mLgGrassClumpImgObj = new Image();
    this.mLgGrassClumpImgObj.src = "lawn_maps/grass_clump1.png";

	
		
};

/**
 * main game init method
 */
Grass.cGameCore.prototype.Init = function () {
    this.mIsTouchUI = 'createTouch' in document;
    this.mRootDomObj = document.body; 
    this.mMainBgDivObj = document.getElementById('backgroundLayer');
    this.mGameLayerDivObj = document.getElementById('gameLayer');
    this.mUILayerDivObj = document.getElementById('uiLayer');
    
    this.mDocWidth = this.mRootDomObj.clientWidth;
    this.mDocHeight = this.mRootDomObj.clientHeight;
	//this.mScreenSegmentSize = this.mDocWidth/10;
    
    this.mEventManager = new Utils.cEventManger();
	this.mSimCore = new Utils.cSimCore();
    
    if(this.mShowDebug) {
        this.mDebugPanel = new Utils.cDebugPanel(this.mUILayerDivObj);
        this.mDebugPanel.Init();
    }

	this.ListenForEvents();
	this.RefreshGamePadStatus();
    this.mMouseTrack = new Utils.MouseTrack(this.mScreenSegmentSize);	
	
	

}

Grass.cGameCore.prototype.RefreshGamePadStatus = function () {
	var pads = navigator.getGamepads();
	var tempPadList = [];
	for(var i = 0, l = pads.length; i < l; i++) {
		if(typeof  pads[i] == "object") {
			tempPadList.push(pads[i]);
		}
	}
	this.mGamePads = tempPadList;
	
	if(this.mGamePads.length > 0) {
		var gamepad = Grass.gGameCore.mGamePads[0]; 
		var leftY = gamepad.axes[0].toPrecision(2);
		var leftX = gamepad.axes[1].toPrecision(2);
        var rightY = gamepad.axes[2].toPrecision(2);
        var rightX = gamepad.axes[3].toPrecision(2);
		//console.debug(leftX, leftY);
		var buttons = gamepad.buttons;
		//console.debug(buttons)
		for(var i = 0, l = buttons.length; i<l; i++) {
			if (buttons[i].pressed && this.mButtonPressed[i] == false) {
				this.mButtonPressed[i] = true;
				this.mEventManager.TriggerEvent(Utils.gEventTypes.ONGAMEPADBUTTONPRESS, i, buttons[i]);
				//console.debug(i)
			} else if (buttons[i].value === 0) {
                this.mButtonPressed[i] = false;
			}
		}
	}
}

Grass.cGameCore.prototype.StartMap = function(mapIndex) {
    var core = this;
	
	this.mSimCore.FlushSim();
	
    if(this.mLawnManager !== null) {
		this.mLawnManager.ClearMap();
	} else {
	   this.mLawnManager = new Utils.cMapManager(this.mGameLayerDivObj, this.mScreenSegmentSize, this.mSimCore);	
	}
    
    this.mLawnManager.LoadMap(this.mMaps[mapIndex]);
    
    for (var layer in this.mLawnManager.mLayerList) {
        this.mLawnManager.mLayerList[layer].BuildLayerCanvas(this.mGameLayerDivObj);
		
    }
    this.mGameIsPaused = false;
    
    
	if (!this.mGameStarted) {
		window.requestAnimationFrame(this.OnFrameChange);
	    document.getElementById('insideFrame').className = "";
	    document.getElementById('openingMenu').className = "top-left";
	    document.getElementById('gameClock').style.display = "block";
		
		//mouse events
		this.mMouseTrack.Init('gameLayer', this.mLawnManager.mLayerList[0].mLayerCanvas, function() {
			core.SegmentMouseHandler(arguments[0], arguments[1], arguments[2])
		});
		Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.CLICK, 'uiLayer', function() {
			core.TileSelectClickHandler();
		});
        Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.CLICK, 'cutGrassButton', function() {
            core.CutGrass();
        });
		
		//keyboard events
        Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.KEYDOWN, 27, function() { //esc
            core.PauseGame();
        });
        Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.KEYDOWN, 37, function() { // left arrow
            var newIndex = core.mHighlightedTileIndex || 0;
            core.HighlightTileByIndex(Math.min(newIndex + 1), 224);
			core.TileSelectClickHandler();
        });
        Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.KEYDOWN, 39, function() { //right arrow
            var newIndex = core.mHighlightedTileIndex || 0;
            core.HighlightTileByIndex(Math.min(newIndex - 1), 224);
			core.TileSelectClickHandler();
        });
        Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.KEYDOWN, 38, function() { //up arrow
            var newIndex = core.mHighlightedTileIndex || 0;
            core.HighlightTileByIndex(Math.min(newIndex - 15), 224);
			core.TileSelectClickHandler();
        });
        Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.KEYDOWN, 40, function() { //down arrow
            var newIndex = core.mHighlightedTileIndex || 0;
            core.HighlightTileByIndex(Math.min(newIndex + 15), 224);
			core.TileSelectClickHandler();
        });
        Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.KEYDOWN, 17, function() { //left crtl
            core.TileSelectClickHandler();
        });
        Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.KEYDOWN, 32, function() { //space
            core.TileSelectClickHandler();
			core.CutGrass();
        });
		
		
		//game pad events
        Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.ONGAMEPADBUTTONPRESS, 9, function() { //start button
            core.PauseGame();
        });
        Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.ONGAMEPADBUTTONPRESS, 1, function() { // B button
            core.TileSelectClickHandler();
            core.CutGrass();
        });
		Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.ONGAMEPADBUTTONPRESS, 0, function() { // A button
			core.TileSelectClickHandler();
		});
		Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.ONGAMEPADBUTTONPRESS, 14, function() { // dir pad left
			var newIndex = core.mHighlightedTileIndex || 0;
			core.HighlightTileByIndex(Math.min(newIndex + 1), 224);
			core.TileSelectClickHandler();
		});
		Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.ONGAMEPADBUTTONPRESS, 15, function() { // dir pad right
			var newIndex = core.mHighlightedTileIndex || 0;
			core.HighlightTileByIndex(Math.min(newIndex - 1), 224);
			core.TileSelectClickHandler();
		});
		Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.ONGAMEPADBUTTONPRESS, 12, function() { // dir pad up
			var newIndex = core.mHighlightedTileIndex || 0;
			core.HighlightTileByIndex(Math.min(newIndex - 15), 224);
			core.TileSelectClickHandler();
			
		});
		Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.ONGAMEPADBUTTONPRESS, 13, function() { // dir pad down
			var newIndex = core.mHighlightedTileIndex || 0;
			core.HighlightTileByIndex(Math.min(newIndex + 15), 224);
			core.TileSelectClickHandler();
		});
		this.mGameStarted = true;
	}
	
};

Grass.cGameCore.prototype.OnFrameChange = function () {
    var currTime = arguments[0]
    var core = Grass.gGameCore;
    if (core.mShowDebug) {
        core.mDebugPanel.OnFrameChange(currTime);
    }
    
    if (!core.mGameIsPaused) {

        //tick simulator
        core.mSimCore.TickSim(currTime);
		
		//redraw the lawn
	    for (var layer in core.mLawnManager.mLayerList) {
	        core.mLawnManager.mLayerList[layer].BuildLayerCanvas(null);
	    }
		
		//refresh input values
        core.mMouseTrack.DoTracking();
		

        //tick clock forward
		document.getElementById("clockTime").innerHTML = core.mSimCore.GetSimTimeToString() 

	    if(core.mSimCore.IsDaytime()) {
			if (document.getElementById('insideFrame').className != "active-light") {
				document.getElementById('outsideFrame').style.backgroundColor = "#0fb4e7"
				document.getElementById('insideFrame').className = "active-light";
			}
	    } else {
			if (document.getElementById('insideFrame').className != "active-dark") {
				document.getElementById('outsideFrame').style.backgroundColor = "#00001c"
				document.getElementById('insideFrame').className = "active-dark";
			}
	    }
    }
    core.RefreshGamePadStatus();
    window.requestAnimationFrame(core.OnFrameChange);
}

Grass.cGameCore.prototype.PauseGame = function () {
    if (this.mGameIsPaused) {
        this.mGameIsPaused = false;
    } else {
        this.mGameIsPaused = true;
    }
}

Grass.cGameCore.prototype.ListenForEvents = function () {
    var thisObj = this;
    for(var type in Utils.gEventTypes) {
        window.addEventListener(Utils.gEventTypes[type], function(){
            thisObj.HandleEvent(arguments[0].type, arguments[0]);
        }, false);
    }
    
}

Grass.cGameCore.prototype.MowLawn = function(tileIndex) {
	this.mSimCore.ClearLawn();
}

Grass.cGameCore.prototype.SetSimSpeed = function(speed) {
	this.mGameIsPaused = false;
    this.mSimCore.mSimTime.framesPerTick = speed;
}

Grass.cGameCore.prototype.CutGrass = function (tileIndex) {
	var tile = this.GetTileByIndex(tileIndex) || this.mSelectedTile;
	if (tile) {
		tile.mGrowthLevel = 0;
	}
	this.DrawSelectedTileInfo();
}

Grass.cGameCore.prototype.TileSelectClickHandler = function() {
	if (this.mHighlightedTile !== null) {
		if(this.mSelectedTile !== null) {
			this.mSelectedTile.SetSelected(false);
			this.mSelectedTile.SetHighlighted(false);
			
		}
        this.mSelectedTile = this.mHighlightedTile;
        this.mSelectedTile.SetHighlighted(false);
		this.mSelectedTile.SetSelected(true);
		this.mSelectedTileIndex = this.mSelectedTile.mIndex;
		this.DrawSelectedTileInfo();
	}
}

Grass.cGameCore.prototype.DrawSelectedTileInfo = function () {
    var infoPanel = document.getElementById("tileInfoPanel")
    infoPanel.style.display = "block";
    infoPanel.innerHTML = "<h1>" + this.mSelectedTile.mBaseTile.mName.replace('Tile','') + "</h1>";
    
    var tempCanvas = new Utils.cCanvasManager();
    tempCanvas.Init(80,80);
    tempCanvas.Show(infoPanel);
    tempCanvas.DrawImage(this.mSelectedTile.mBaseTile, 0, 0, 80, 80);
    if (this.mSelectedTile.mHasGrass === true) {
        if (this.mSelectedTile.mGrowthLevel === 1) {
            var topOffset = 40 - (this.mSelectedTile.mBaseTile.mBlockHeightIndex * 10);
            tempCanvas.DrawBlockDecal(this.mGrassClumpImgObj, topOffset, 0, 0);
        }
        if (this.mSelectedTile.mGrowthLevel === 2) {
            var topOffset = 40 - (this.mSelectedTile.mBaseTile.mBlockHeightIndex * 10);
            tempCanvas.DrawBlockDecal(this.mLgGrassClumpImgObj, topOffset, 0, 0);
        }
    }
	
    
    var detailsDiv = document.createElement("div");
    detailsDiv.innerHTML = "Name: " + this.mSelectedTile.mBaseTile.mName;
    detailsDiv.innerHTML += "<br>Tile Index: " + this.mSelectedTile.mIndex;
    detailsDiv.innerHTML += "<br>Growth Level: " + this.mSelectedTile.mGrowthLevel;
    detailsDiv.innerHTML += "<br>Growth Factor: " + this.mSelectedTile.mGrowthFactor;
    //detailsDiv.innerHTML += "<br>Pos X: " + this.mSelectedTile.mPosX;
    //detailsDiv.innerHTML += "<br>Pos Y: " + this.mSelectedTile.mPosY;
    detailsDiv.innerHTML += "<br><button id='cutGrassButton'>Cut Grass</button>";
    
    infoPanel.appendChild(detailsDiv);
	
}

Grass.cGameCore.prototype.SegmentMouseHandler = function (segmentX, segmentY, mouseData) {
	
	
	var tempTileList = [];

    if (this.mHighlightedTile !== null) {
		this.mHighlightedTile.SetHighlighted(false);
		this.mHighlightedTile = null;
	}

    for (var layer in this.mLawnManager.mLayerList) {
        tempTileList = tempTileList.concat(this.mLawnManager.mLayerList[layer].LookupTilesInSegment(segmentX, segmentY));
    }	
    var closetDist = 100;
    for(var tile in tempTileList) {
        var currTile = tempTileList[tile];
        
        var xDelta = Math.pow(((currTile.mPosX+(currTile.mBaseTile.mTileWidth/2)) - mouseData.mouseX),2);
        var yDelta = Math.pow(((currTile.mPosY+(currTile.mBaseTile.mTileHeight/2))- mouseData.mouseY),2);
        var dist = Math.sqrt(xDelta + yDelta);
        
		if(currTile.mIndex == this.mHighlightedTileIndex) {
			this.mHighlightedTile = currTile;
		}else if (dist < closetDist) {
            closetDist = dist;
            this.mHighlightedTile = currTile;
        }
    }

	if(this.mHighlightedTile !== null) {
		this.mHighlightedTile.SetHighlighted(true);
		this.mHighlightedTileIndex = this.mHighlightedTile.mIndex; 
	}
	this.mCurrTilesInSegment = tempTileList;
	//console.debug(this.mCurrTilesInSegment);
}

Grass.cGameCore.prototype.HighlightTileByIndex = function (tileIndex) {
	if(tileIndex < 0 || tileIndex > 224) {
		return;
	}
	this.mHighlightedTileIndex = tileIndex;
	var tempTile = null;
    for (var layer in this.mLawnManager.mLayerList) {
        tempTile = this.mLawnManager.mLayerList[layer].LookupTileByIndex(tileIndex)
    }   
	
    if(this.mHighlightedTile !== null) {
        this.mHighlightedTile.SetHighlighted(false);
    }
	
	if(tempTile !== null) {
		this.mHighlightedTile = tempTile;
		this.mHighlightedTile.SetHighlighted(true);
		this.mHighlightedTileIndex = this.mHighlightedTile.mIndex; 
	}
	
}

Grass.cGameCore.prototype.GetTileByIndex = function (tileIndex) {
    var tempTile = null;
    for (var layer in this.mLawnManager.mLayerList) {
        tempTile = this.mLawnManager.mLayerList[layer].LookupTileByIndex(tileIndex)
    }   
	return tempTile;
}

Grass.cGameCore.prototype.SelectTileByIndex = function (tileIndex) {
    this.HighlightTileByIndex(tileIndex);
    this.TileSelectClickHandler();
}

Grass.cGameCore.prototype.HandleEvent = function(type, event, data){
    switch(type) {
        case Utils.gEventTypes.CLICK:
			  this.mEventManager.TriggerEvent(Utils.gEventTypes.CLICK, event.toElement.id, event);
			  event.preventDefault();
            break;
        case Utils.gEventTypes.MOUSEMOVE:
			  this.mEventManager.TriggerEvent(Utils.gEventTypes.MOUSEMOVE, Utils.gEventTypes.MOUSEMOVE, event);
            break;
        case Utils.gEventTypes.TOUCHSTART:
              this.mEventManager.TriggerEvent(Utils.gEventTypes.TOUCHSTART, event.srcElement.id, event);
            break;
        case Utils.gEventTypes.TOUCHMOVE:
              this.mEventManager.TriggerEvent(Utils.gEventTypes.TOUCHMOVE, event.srcElement.id, event);
            break;
        case Utils.gEventTypes.TOUCHEND:
              this.mEventManager.TriggerEvent(Utils.gEventTypes.TOUCHEND, event.srcElement.id, event);
            break;
        case Utils.gEventTypes.ONGAMEPADCONNECT:
			  this.RefreshGamePadStatus();
              this.mEventManager.TriggerEvent(Utils.gEventTypes.ONGAMEPADCONNECT, 'gamePadConnect', event);
            break;
        case Utils.gEventTypes.ONGAMEPADDISCONNECT:
			  this.RefreshGamePadStatus();
              this.mEventManager.TriggerEvent(Utils.gEventTypes.ONGAMEPADDISCONNECT, 'gamePadDisconnect', event);
            break;
        case Utils.gEventTypes.KEYDOWN:
            //console.debug(event.keyCode);
            this.mEventManager.TriggerEvent(Utils.gEventTypes.KEYDOWN, event.keyCode, event.target);
            break;
        case Utils.gEventTypes.KEYUP:
            this.mEventManager.TriggerEvent(Utils.gEventTypes.KEYUP, event.keyCode, event.target);
            break;
        case Utils.gEventTypes.GAME:
            this.mEventManager.TriggerEvent(Utils.gEventTypes.GAME, event, data);
            break;
        case Utils.gEventTypes.SOCKET:
            this.mEventManager.TriggerEvent(Utils.gEventTypes.SOCKET, event, data);
            break;
        default:
            this.mEventManager.TriggerEvent(type, event, event.target);
            break;
    }
	//
}

//load global
Grass.gGameCore = new Grass.cGameCore();
