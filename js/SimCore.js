

Utils.cSimCore = function() {

    this.mAgents = [];
    this.mTiles = [];
    this.mCurrFameTime = 0;
    this.mDiceSeed = 10;
	this.mDiceMultiplier = 5000;
    
    this.mSimTime = {
        currHour: 12,
        currMinute: 0,
        currTick: 0,
        framesPerTick: 30,
        maxMinutes: 60,
        maxHours: 12,
        isAM: false,
        isDaytime: true
    }
    
}

Utils.cSimCore.prototype.Init = function() {

}

Utils.cSimCore.prototype.ResetSimTime = function() {
    this.mSimTime.currHour = 12;
    this.mSimTime.currMinute = 0;
    this.mSimTime.currTick = 0;
    this.mSimTime.isAM = false;
    this.mSimTime.isDaytime = true;
}

Utils.cSimCore.prototype.FlushSim = function() {
    this.ResetSimTime();
    this.mAgents = [];
    this.mTiles = [];
    this.mCurrFameTime = 0;
    
    
}

Utils.cSimCore.prototype.IsDaytime = function() {
    return this.mSimTime.isDaytime;
}

Utils.cSimCore.prototype.RollDice = function(maxChance) {
    var factor = (this.mDiceSeed - maxChance) * this.mDiceMultiplier;
    return (this.RandomIntFromInterval(1, factor) === (factor / 2))
}

Utils.cSimCore.prototype.TickSim = function(currTime) {
    this.mCurrFameTime = currTime;
    this.TickClock();
    
    for (var i = 0, l = this.mTiles.length; i < l; i++) {
        var currTile = this.mTiles[i];
        if (currTile.mBaseTile.mName === "GrassTile") {
            this.UpdateGrowthFactor(currTile);
            if (this.RollDice(currTile.mGrowthFactor)) {
				currTile.mGrowthLevel = Math.min(currTile.mGrowthLevel + 1, 2);
				/*
                if (this.RollDice(currTile.mGrowthFactor * 100)) {
                    currTile.mGrowthLevel = 0;
                } else if (this.RollDice(currTile.mGrowthFactor)) {
                    
                }
                */
                
            }
        }
    }
}

Utils.cSimCore.prototype.RegisterTile = function(tile) {
    if (tile.mBaseTile.mName === "GrassTile") {
        tile.mHasGrass = true;
    } else {
        tile.mHasGrass = false;
    }
    tile.mGrowthLevel = 0;
    tile.mGrowthFactor = 0;
    this.mTiles.push(tile);
}

Utils.cSimCore.prototype.UpdateGrowthFactor = function(tile) {
    //console.debug(tile)
    var startFactor = tile.mBaseTile.mBlockHeightIndex;
    var baseIndex = tile.mIndex;
    var neighborIndexes = [baseIndex - 15, baseIndex + 15, baseIndex - 1, baseIndex + 1]
    for (var i = 0, l = neighborIndexes.length; i < l; i++) {
        var nextTile = Grass.gGameCore.GetTileByIndex(neighborIndexes[i]);
		
        if (nextTile && nextTile.mBaseTile.mName == "Water Tile") {
            startFactor = startFactor + 5;
        }
    }
    
    
    tile.mGrowthFactor = startFactor;
}

Utils.cSimCore.prototype.TickClock = function() {
    //tick clock forward
    if (this.mSimTime.currTick >= this.mSimTime.framesPerTick) {
        this.mSimTime.currMinute++;
        this.mSimTime.currTick = 0;
        if (this.mSimTime.currMinute >= 60) {
            this.mSimTime.currMinute = 0;
            this.mSimTime.currHour++;
            if (this.mSimTime.currHour === 12) {
                this.mSimTime.isAM = !this.mSimTime.isAM
            } else if (this.mSimTime.currHour > 12) {
                this.mSimTime.currHour = 1;
            }
        }
        if (this.mSimTime.currHour == 8 && this.mSimTime.isAM) {
            this.mSimTime.isDaytime = true;
        }
        if (this.mSimTime.currHour == 8 && !this.mSimTime.isAM) {
            this.mSimTime.isDaytime = false;
        }
    } else {
        this.mSimTime.currTick++;
    }
}

Utils.cSimCore.prototype.GetSimTimeToString = function() {
    var timeStr = "";
    timeStr = (this.mSimTime.currHour < 10) ? ('0' + this.mSimTime.currHour) : this.mSimTime.currHour;
    timeStr += ":" + ((this.mSimTime.currMinute < 10) ? ('0' + this.mSimTime.currMinute) : this.mSimTime.currMinute);
    timeStr += this.mSimTime.isAM ? " am" : " pm";
    return timeStr;
}

Utils.cSimCore.prototype.RandomIntFromInterval = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
