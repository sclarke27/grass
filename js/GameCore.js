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
	
	this.mLawnManager = null;	
	
	this.mGameCanvas = null;
    this.mToolbarCanvas = null;    

    this.mMapsPath = ['lawn_maps/', ];
    this.mMaps = ['starting_lawn', 'pond'];
	
    localStorage.clear();
    for(var i=0, l=this.mMaps.length; i<l; i++) {
        var scriptTag = document.createElement('script');
        scriptTag.type = "text/javascript";
        scriptTag.src = this.mMapsPath + this.mMaps[i] + '.js';
        document.head.appendChild(scriptTag);
    }
	
	
	this.mCurrTilesInSegment = [];
	this.mHighlightedTile = null;
	this.mSelectedTile = null;
		
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
    
    if(this.mShowDebug) {
        this.mDebugPanel = new Utils.cDebugPanel(this.mUILayerDivObj);
        this.mDebugPanel.Init();
    }
    
	this.ListenForEvents();
	
    this.mMouseTrack = new Utils.MouseTrack(this.mScreenSegmentSize);	
	
	

}

Grass.cGameCore.prototype.PostLoad = function(mapIndex) {
	document.getElementById('insideFrame').className = "";
	var core = this;

    if(mapIndex === 0) {
		document.getElementById('outsideFrame').style.backgroundColor = "#0fb4e7"
		document.getElementById('insideFrame').className = "active-light";   
	} else {
		document.getElementById('outsideFrame').style.backgroundColor = "#00001c"
		document.getElementById('insideFrame').className = "active-dark";
	}
    
    if(this.mLawnManager !== null) {
		this.mLawnManager.ClearMap();
		
	} else {
	   this.mLawnManager = new Utils.cMapManager(this.mGameLayerDivObj, this.mScreenSegmentSize);	
	}
    
    this.mLawnManager.LoadMap(this.mMaps[mapIndex]);
    
    for (var layer in this.mLawnManager.mLayerList) {
        this.mLawnManager.mLayerList[layer].BuildLayerCanvas(this.mGameLayerDivObj);
		
    }
    this.mGameIsPaused = false;
    
	window.requestAnimationFrame(this.OnFrameChange);
    this.mMouseTrack.Init('gameLayer', this.mLawnManager.mLayerList[0].mLayerCanvas, function() {
		core.SegmentMouseHandler(arguments[0], arguments[1], arguments[2])
	});
    Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.CLICK, 'uiLayer', function() {
        core.TileSelectClickHandler();
    });
	
	
};

Grass.cGameCore.prototype.OnFrameChange = function () {
    var currTime = arguments[0]
    var core = Grass.gGameCore;
    if (core.mShowDebug) {
        core.mDebugPanel.OnFrameChange(currTime);
    }
    
    if (!core.mGameIsPaused) {

	    for (var layer in core.mLawnManager.mLayerList) {
	        core.mLawnManager.mLayerList[layer].BuildLayerCanvas(null);
	    }
        core.mMouseTrack.DoTracking();
        window.requestAnimationFrame(core.OnFrameChange);
    }
}

Grass.cGameCore.prototype.PauseGame = function () {
    if (this.mGameIsPaused) {
        this.mGameIsPaused = false;
        window.webkitRequestAnimationFrame(Grass.gGameCore.OnFrameChange);
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

Grass.cGameCore.prototype.TileSelectClickHandler = function() {
	if (this.mHighlightedTile !== null) {
		if(this.mSelectedTile !== null) {
			this.mSelectedTile.SetSelected(false);
			this.mSelectedTile.SetHighlighted(false);
		}
        this.mSelectedTile = this.mHighlightedTile;
		this.mSelectedTile.SetSelected(true);
	}
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
        
        if (dist < closetDist) {
            closetDist = dist;
            this.mHighlightedTile = currTile;
        }
    }

	if(this.mHighlightedTile !== null) {
		this.mHighlightedTile.SetHighlighted(true);
	}
	this.mCurrTilesInSegment = tempTileList;
	//console.debug(this.mCurrTilesInSegment);
}

Grass.cGameCore.prototype.HandleEvent = function(type, event, data){
    switch(type) {
        case Utils.gEventTypes.CLICK:
			  this.mEventManager.TriggerEvent(Utils.gEventTypes.CLICK, event.toElement.id, event);
            break;
        case Utils.gEventTypes.MOUSEMOVE:
			  this.mEventManager.TriggerEvent(Utils.gEventTypes.MOUSEMOVE, Utils.gEventTypes.MOUSEMOVE, event);
            break;
        case Utils.gEventTypes.KEYDOWN:
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
	//event.preventDefault();
}

//load global
Grass.gGameCore = new Grass.cGameCore();
