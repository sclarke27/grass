Utils.cMapManager = function (targetDiv, segmentSize, simCore) {
    this.mRawData = null;
    this.mRawLayers = new Array();
    this.mTotalLayers = 0;
    this.mRawTiles = new Array();
    this.mTileTypeList = new Array();
    this.mTileWidth = 0;
    this.mTileHeight = 0;
    this.mMapWidth = 0;
    this.mMapHeight = 0;
	this.mSegmentSize = segmentSize;
	this.mSimCore = simCore;
    
    this.mLayerList = null;
    
}

Utils.cMapManager.prototype.LoadMap = function (mapSrc, simCore) {
    this.ParseMapData([JSON.parse(localStorage[mapSrc])]);
}

Utils.cMapManager.prototype.HideMap = function(){
    i = 0;
    while(i < this.mTotalLayers) {
        this.mLayerList[i].HideLayerCanvas();
        i++    
    }
    
}

Utils.cMapManager.prototype.ClearMap = function(){
    i = 0;
    while(i < this.mTotalLayers) {
        this.mLayerList[i].ClearCanvas();
        i++    
    }
    
}

Utils.cMapManager.prototype.ParseMapData = function (jsonData) {
    this.mRawData = jsonData[0];
    this.mRawLayers = this.mRawData.layers;
    this.mTotalLayers = this.mRawLayers.length;
    this.mRawTiles = this.mRawData.tilesets;
    this.mMapWidth = this.mRawData.width;
    this.mMapHeight = this.mRawData.height;
    this.mTileWidth = this.mRawData.tilewidth;
    this.mTileHeight = this.mRawData.tileheight;
    this.mLayerList  = new Array(this.mRawLayers.length);
    

    //load tiles    
    var i = 0;
    var x = 1;
    var tileLen = this.mRawTiles.length
    while(i<tileLen) {
        var currRawTile = this.mRawTiles[i];
        var totalTileProps = currRawTile.tileproperties.length;
        for(var prop in currRawTile.tileproperties) {
            offsets = currRawTile.tileproperties[prop].coords.split(',')
            currRawTile.offsetx = offsets[1];
            currRawTile.offsety = offsets[0];
			this.mTileTypeList[x] = new Utils.cMapTile(currRawTile);
			x++
        }
        i++;
    }
    
    //load layers    
    i = 0;
    while(i < this.mTotalLayers) {
        this.mLayerList[i] = new Utils.cMapLayer(this.mRawLayers[i], this.mTileTypeList, this.mTileWidth, this.mTileHeight, this.mSegmentSize, this.mSimCore);
        i++    
    }
    //console.debug(this)
}

/**
 * object to handle individual map tiles
 * @param {Object} tileData
 * @param {Object} offsetX
 * @param {Object} offsetY
 */
Utils.cMapTile = function (tileData, offsetX, offsetY) {
    //this.mRawData = tileData;
    this.mImgSrc = "lawn_maps/" + tileData.image;
    this.mImgMargin = tileData.margin;
    this.mName = tileData.name;
    this.mSpacing = tileData.spacing;
    this.mTileHeight = tileData.tileheight;
    this.mTileWidth = tileData.tilewidth;
    this.mOffsetX = Number(tileData.offsetx) || 0;
    this.mOffsetY = Number(tileData.offsety) || 0;
    this.isVisible = tileData.isvisible || true;
	this.mBlockHeightIndex = this.mOffsetX + this.mOffsetY;
	
	this.mImgObj = new Image();
    if (this.mImgSrc) {
        this.mImgObj.src = this.mImgSrc;
		
    }
    this.mImgWidth = this.mImgObj.width || this.mTileWidth;
    this.mImgHeight = this.mImgObj.height || this.mTileHeight;
    
};


/**
 * object to handle individual map layers
 * @param {Object} layerData
 * @param {Object} tileList
 */
Utils.cMapLayer = function (layerData, tileList, tileWidth, tileHeight, segmentSize, simCore) {
    this.mLayerRawData = layerData;
    this.mLayerData = this.mLayerRawData.data;
    this.mLayerName = this.mLayerRawData.name;
    this.mLayerProps = this.mLayerRawData.properties || {};
    this.mTotalTiles = this.mLayerData.length;
    this.mTileTypeList = tileList;
    this.mOpacity = this.mLayerRawData.opacity;
    this.mLayerWidth = this.mLayerRawData.width;
    this.mLayerHeight = this.mLayerRawData.height;
    this.mLayerVisible = this.mLayerRawData.visible;
    this.mLayerType = this.mLayerRawData.type;
    this.mLayerTileWidth = tileWidth;
    this.mLayerTileHeight = tileHeight;
    this.mPosX = this.mLayerRawData.x;
    this.mPosY = this.mLayerRawData.y;
    this.mTileMap = new Array(this.mLayerWidth);
	this.mTileLookupCache = [];
    this.mLayerCanvas = new Utils.cCanvasManager();
	this.mScreenSegmentSize = segmentSize;
    this.mHighlightImgObj = null;
	this.mSelectedImgObj = null;
	this.mGrassClumpImgObj = null;
	this.mSimCore = simCore;
	
    this.BuildEmptyTileMap();
}

Utils.cMapLayer.prototype.BuildEmptyTileMap = function(){
    var i = 0;
    while(i < this.mLayerWidth) {
        this.mTileMap[i] = new Array(this.mLayerHeight);
        i++;
    }
    if (this.mLayerVisible) {
        this.LoadLayerMap();
    }
}

/**
 * this loads up the map tiles from the TileList
 */
Utils.cMapLayer.prototype.LoadLayerMap = function () {
    //console.debug('loading layer map data');
    var i = 0;
    var row = 0;
    var col = 0;
	
    while(i < this.mTotalTiles) {
        if (this.mLayerData[i] !== 0) {
            var currTile = new Grass.GrassTile(this.mTileTypeList[this.mLayerData[i]]);
			if(!currTile) {
				console.debug(this.mTileTypeList,this.mLayerData[i])
			}
            this.mTileMap[col][row] = currTile;
			this.mSimCore.RegisterTile(this.mTileMap[col][row]);
        }
        col++;
        if(col >= this.mLayerWidth) {
            col = 0;
            row++;
        }
        i++;
    }
    
	this.mHighlightImgObj = new Image();
    this.mHighlightImgObj.src = "lawn_maps/blockHighlight-green-wide.png";

    this.mSelectedImgObj = new Image();
    this.mSelectedImgObj.src = "lawn_maps/blockHighlight-white-wide.png";
	
	this.mGrassClumpImgObj = new Image();
    this.mGrassClumpImgObj.src = "lawn_maps/grass_clump-sm.png";

    this.mLgGrassClumpImgObj = new Image();
    this.mLgGrassClumpImgObj.src = "lawn_maps/grass_clump1.png";

    this.mLayerCanvas.Init((this.mLayerWidth*this.mLayerTileWidth),(this.mLayerHeight*this.mLayerTileHeight+40));
    //console.debug(this.mTileMap)
}

Utils.cMapLayer.prototype.ClearCanvas = function() {
	this.mLayerCanvas.ClearCanvas();
}
/**
 * this renders the map to the canvas
 * @param {Object} targetDomObj
 */
Utils.cMapLayer.prototype.BuildLayerCanvas = function(targetDomObj){
    var x = 0;
    var y = 0;
    var i = 0;
	var parentDiv = document.getElementById("insideFrame");
    this.mLayerCanvas.ClearCanvas();
	if (targetDomObj !== null) {
		this.mLayerCanvas.Show(targetDomObj);
	}
	var tempLookupCache = new Array(Math.floor(parentDiv.offsetWidth/this.mScreenSegmentSize));
	for(var i =0, l = tempLookupCache.length; i<l; i++) {
		var arrlen = Math.floor(parentDiv.offsetHeight/this.mScreenSegmentSize);
		tempLookupCache[i] = new Array(arrlen); 
		
		for( var z=0; z<arrlen; z++) {
			tempLookupCache[i][z] = [];
		}
	}
	
	var selectedIndex = -1;
	i=0;
    while (x < this.mLayerWidth) {
        while( y < this.mLayerHeight){
            var currTile = this.mTileMap[x][y];
			var yOffset = 0;
			var row = x;
			var col = y;
            var tilePositionX = ((row - col) * this.mLayerTileHeight);
            tilePositionX += (((this.mLayerWidth * this.mLayerTileWidth) / 2) - (this.mLayerTileWidth / 2));
            var tilePositionY = (((row + col) * (this.mLayerTileHeight / 2)))+yOffset;

            var segmentY = Math.floor(tilePositionY/this.mScreenSegmentSize);
			var segmentX = Math.floor(tilePositionX/this.mScreenSegmentSize);
			
			currTile.mPosX = tilePositionX;
			currTile.mPosY = tilePositionY;
			currTile.mIndex = i;
			if (tempLookupCache && tempLookupCache[segmentX]) {
				if(!tempLookupCache[segmentX].hasOwnProperty[segmentY]) {
					tempLookupCache[segmentX][segmentY] = [];
				}
				tempLookupCache[segmentX][segmentY].push(currTile);
				
				this.mLayerCanvas.DrawImage(currTile.mBaseTile, (tilePositionX), (tilePositionY), this.mLayerTileHeight, this.mLayerTileWidth);
				
                if (currTile.mHasGrass === true) {
				    if (currTile.mGrowthLevel === 1) {
						var topOffset = 40 - (currTile.mBaseTile.mBlockHeightIndex * 10);
						this.mLayerCanvas.DrawBlockDecal(this.mGrassClumpImgObj, topOffset, (tilePositionX), (tilePositionY));
					}
                    if (currTile.mGrowthLevel === 2) {
                        var topOffset = 40 - (currTile.mBaseTile.mBlockHeightIndex * 10);
                        this.mLayerCanvas.DrawBlockDecal(this.mLgGrassClumpImgObj, topOffset, (tilePositionX), (tilePositionY));
                    }
                }

				if (currTile.mIsHighlighted === true) {
					this.mLayerCanvas.DrawBlockHightlight(this.mHighlightImgObj, currTile.mBaseTile, (tilePositionX), (tilePositionY));
				}
				
				if (currTile.mIsSelected === true) {
					//console.debug(currTile)
					selectedIndex = i;
					this.mLayerCanvas.DrawBlockHightlight(this.mSelectedImgObj, currTile.mBaseTile, (tilePositionX), (tilePositionY));
				}
			}
			
            y++;
            i++;
        }
        y=0;
        x++;
    }
	this.mTileLookupCache = tempLookupCache;
	//console.debug('lawn refreshed', selectedIndex);
}

Utils.cMapLayer.prototype.HideLayerCanvas = function(){
    this.mLayerCanvas.Hide();
}

Utils.cMapLayer.prototype.LookupTileByIndex = function (tileIndex) {
	var returnTile = null;
	var total = 0;
    try {
        for(var x=0, lx=this.mTileMap.length; x<lx; x++) {
            var currRow = this.mTileMap[x];
			for(var y=0, ly=currRow.length; y<ly; y++) {
				total++;
				if(this.mTileMap[x][y].mIndex == tileIndex) {
					returnTile = this.mTileMap[x][y];
				}
			}
		}
    }
    catch (e) {
        
    }
		
	return returnTile;
}

Utils.cMapLayer.prototype.LookupTilesInSegment = function (segmentX, segmentY) {
	//console.debug(segmentX, segmentY, this.mTileLookupCache);
	var returnArr = [];
	//console.debug(segmentX, this.mTileLookupCache.hasOwnProperty(segmentX))
	//returnArr = this.mTileLookupCache[segmentX][segmentY];
	try {
		for (var x = segmentX - 1, len = segmentX + 1; x <= len; x++) {
			for (var y = segmentY - 1, len2 = segmentY + 1; y <= len2; y++) {
				if (x >= 0 && y >= 0 && x < this.mTileLookupCache.length && y < this.mTileLookupCache[x].length) {
					if (this.mTileLookupCache[segmentX].hasOwnProperty(segmentY)) {
						var data = this.mTileLookupCache[segmentX][segmentY];
						if (data) {
							returnArr = returnArr.concat(this.mTileLookupCache[x][y]);
						}
					}
				}
			}
		}
	}
	catch (e) {
		returnArr = [];
	}

	return returnArr;
}
