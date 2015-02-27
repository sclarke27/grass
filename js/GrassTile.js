/**
 * Grass Tile extends Utils.Sprite
 */
Grass.GrassTile = function (baseTile) {
	//Utils.Sprite.call(this)
	this.mBaseTile = baseTile;
	this.mIsHighlighted = false;
	this.mIsSelected = false;
	this.mHasGrass = false;
	this.mGrowthLevel = 1;
	
	
}
//Grass.GrassTile.prototype = new Utils.Sprite();
//Grass.GrassTile.prototype.constructor = Grass.GrassTile;

Grass.GrassTile.prototype.SetHighlighted = function (isHighlighed) {
    if (typeof isHighlighed === "boolean" && !this.mIsSelected) {
        this.mIsHighlighted = isHighlighed;
    }
};

Grass.GrassTile.prototype.SetSelected = function (isSelected) {
    if (typeof isSelected === "boolean") {
        this.mIsSelected = isSelected;
    }
};