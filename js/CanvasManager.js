Utils.cCanvasManager = function () {
    this.mCanvasDomObj = null;
    this.mCanvasContext = null;
    this.mCanvasWidth = 0;
    this.mCanvasHeight = 0;
    this.mParentDomObj = null;
    this.mZoomLevel = 0;
	
}

Utils.cCanvasManager.prototype.Init = function (width, height, posX, posY, backgroundColor) {
    
    this.mCanvasDomObj = document.createElement("canvas");
	
    this.mCanvasDomObj.width = width;
    this.mCanvasDomObj.height = height;
    this.mCanvasDomObj.style.position = "absolute";
	
    if(posX) {
        this.mCanvasDomObj.style.left = posX + "px";
    }
    
    if(posY) {
        this.mCanvasDomObj.style.top = posY + "px";
    }
    
    if(backgroundColor) {
        this.mCanvasDomObj.style.backgroundColor = backgroundColor;
    }

    this.mCanvasContext = this.mCanvasDomObj.getContext("2d");
}

Utils.cCanvasManager.prototype.Show = function(targetDomObj){
    this.mParentDomObj = targetDomObj;
    if (this.mParentDomObj) {
        if (this.mCanvasDomObj) {
            this.mParentDomObj.appendChild(this.mCanvasDomObj);
        }
    } else {
        console.debug("target div not found: " + this.mParentDomObj);
    }
}

Utils.cCanvasManager.prototype.Hide = function(){
    if (this.mCanvasDomObj) {
        this.mParentDomObj.removeChild(this.mCanvasDomObj);
    }
}

Utils.cCanvasManager.prototype.DrawSimpleImage = function(imgObj, posX, posY, width, height, offsetX, offsetY) {
    this.mCanvasContext.drawImage(
        imgObj, 
        offsetX*width, 
        offsetY*width,
        width,
        height,
        posX,
        posY,
        width,
        height
    )
	
}

Utils.cCanvasManager.prototype.DrawBlockHightlight = function(highlightImgObj, imgData, posX, posY) {
    this.mCanvasContext.drawImage(
        highlightImgObj, 
        (imgData.mOffsetX)*imgData.mTileWidth, 
        (imgData.mOffsetY)*imgData.mTileHeight,
        imgData.mTileWidth,
        imgData.mTileHeight,
        posX,
        posY,
        imgData.mTileWidth,
        imgData.mTileWidth
    )
    
}

Utils.cCanvasManager.prototype.DrawImage = function(imgData, posX, posY){
    if (imgData && imgData.isVisible) {

        /*
		//this is for image preprocessing, but its slow due to getImageData & putImageData which happens when drawing from one canvas to another
		var newImgData = this.CreateImageData(imgData);
		this.mCanvasContext.drawImage(this.mOffscreenCanvasObj,posX,posY);
		*/
        
        this.mCanvasContext.drawImage(
            imgData.mImgObj, 
            (imgData.mOffsetX)*imgData.mTileWidth, 
            (imgData.mOffsetY)*imgData.mTileHeight,
            imgData.mTileWidth,
            imgData.mTileHeight,
            posX,
            posY,
            imgData.mTileWidth,
            imgData.mTileWidth
        )
        
    }
   
}

Utils.cCanvasManager.prototype.ClearCanvas = function () {
    if (this.mCanvasContext) {
        this.mCanvasContext.clearRect(0, 0, this.mCanvasWidth, this.mCanvasHeight);
        var w = this.mCanvasDomObj.width;
        this.mCanvasDomObj.width = 1;
        this.mCanvasDomObj.width = w;
    }
};

Utils.cCanvasManager.prototype.WriteStrokeText = function (text, posX, posY, strokeStyle, font) {
    this.mCanvasContext.strokeStyle = strokeStyle || "#fff";
    this.mCanvasContext.font = font || '10px san-serif';
    this.mCanvasContext.textBaseline = 'bottom';
    this.mCanvasContext.strokeText(text, posX, posY);    
}

Utils.cCanvasManager.prototype.WriteFillText = function (text, posX, posY, fillStyle, font) {
    this.mCanvasContext.fillStyle = fillStyle || "#fff";
    this.mCanvasContext.font = font || '10px san-serif';
    this.mCanvasContext.textBaseline = 'bottom';
    this.mCanvasContext.fillText(text, posX, posY);    
}
