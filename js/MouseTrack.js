Utils.MouseTrack = function (segmentSize) {
	this.mMouseCir = {};
	this.mDocWidth = 0;
	this.mDocHeight = 0;
	this.mContainerDiv = null;
	this.mObjectList = [];
	this.mItemMap = null;
	this.mTotalCircles = 50;
	this.mScaleCircles = true;
	
	this.mRadStart = 10;
	this.mRadEnd = 20;
	this.mTestRad = 54;
	
	//screen seg props
	this.mSegmentPixelSize = segmentSize;
	this.mDocBody = null;
	this.mTotalSegmentsX = null;
	this.mTotalSegmentsY = null;
	this.mSegmentX = 0;
	this.mSegmentY = 0;
	this.mSegementMouseCallback = null;
	//canvas 
	this.mLayerCanvasDomObj = null;
	this.mLayerCanvas = null;
	
	//create an array to hold screen items based on segments
	this.mItemMap = null;//new Array(totalSegmentsX, totalSegmentsY)
	this.mActiveItems = new Array()	
	
	//objec to hold move mouse event
	this.mMouseData = {
		mouseX : 0,
		mouseY : 0,
		targetLayer : null,
		mouseDirty : true
	};
};


Utils.MouseTrack.prototype.Init = function (mainContainerID, layerCanvas, segmentMouseCallback) {
    this.mContainerDiv = document.getElementById(mainContainerID);
    this.mDocBody = document.body;
    this.mDocWidth = this.mContainerDiv.offsetWidth;
    this.mDocHeight = this.mContainerDiv.offsetHeight;
    this.mTotalSegmentsX = Math.ceil(this.mDocWidth/this.mSegmentPixelSize);
    this.mTotalSegmentsY = Math.ceil(this.mDocHeight/this.mSegmentPixelSize);
	this.mSegementMouseCallback = segmentMouseCallback;
    
    this.mLayerCanvasDomObj = layerCanvas.mCanvasDomObj;
    this.mLayerCanvas = layerCanvas.mCanvasContext;
	
	this.mMouseCir.radius = 5;

    this.BuildEmptyItemMap();
	this.DrawTrackingGrid();
	
	var mouseTrack = this;
	Grass.gGameCore.mEventManager.AddEventListener(Utils.gEventTypes.MOUSEMOVE, 'mousemove', function() {
		mouseTrack.UpdateMouseData(arguments[0]);
	});
	
};

Utils.MouseTrack.prototype.UpdateMouseData = function (event) {
    this.mMouseData.mouseY = event.y - this.mContainerDiv.parentElement.offsetTop; 
	this.mMouseData.mouseX = event.x - this.mContainerDiv.parentElement.offsetLeft;
	this.mMouseData.targetLayer = event.srcElement;
	this.mMouseData.mouseDirty = true;
}


Utils.MouseTrack.prototype.BuildEmptyItemMap = function() {
    this.mItemMap = new Array(this.mTotalSegmentsX, this.mTotalSegmentsY);
    for(var i=0; i <= this.mTotalSegmentsX; i++) {
        this.mItemMap[i] = new Array;
        for(var x=0; x <= this.mTotalSegmentsY; x++) {
            this.mItemMap[i][x] = new Array;    
        }
    }
}

Utils.MouseTrack.prototype.DoTracking = function () {
    //if (this.mMouseData.mouseDirty) {
        var targetDiv = this.mMouseData.targetLayer;
        if (targetDiv && targetDiv.hasOwnProperty('id')) {
            if (targetDiv.id === "uiLayer") {
                this.mSegmentX = Math.floor(this.mMouseData.mouseX / this.mSegmentPixelSize);
                this.mSegmentY = Math.floor(this.mMouseData.mouseY / this.mSegmentPixelSize);
                this.mMouseData.mouseDirty = false;
                this.mSegementMouseCallback(this.mSegmentX, this.mSegmentY, this.mMouseData);
            }
            
        }
    //}	
	//this.DrawTrackingGrid();
}

Utils.MouseTrack.prototype.DrawTrackingGrid = function() {
    var i = 0;

	this.mLayerCanvas.strokeStyle = "rgba(0,0,0,0.1)";
    while(i < this.mTotalSegmentsY) {
        this.mLayerCanvas.beginPath();
        this.mLayerCanvas.moveTo(0, this.mSegmentPixelSize*i);
        this.mLayerCanvas.lineTo(this.mDocWidth, this.mSegmentPixelSize*i);
        this.mLayerCanvas.stroke();
        i++;
    }
    i = 0;
    while(i < this.mTotalSegmentsX) {
        this.mLayerCanvas.beginPath();
        this.mLayerCanvas.moveTo(this.mSegmentPixelSize*i, 0);
        this.mLayerCanvas.lineTo(this.mSegmentPixelSize*i, this.mDocHeight);
        this.mLayerCanvas.stroke();
        i++;
    }

	this.mLayerCanvas.fillStyle = "rgba(255,0,100,0.5)";
	this.mLayerCanvas.fillRect((this.mSegmentX*this.mSegmentPixelSize), (this.mSegmentY*this.mSegmentPixelSize), this.mSegmentPixelSize, this.mSegmentPixelSize);
	this.mLayerCanvas.stroke();
    this.mLayerCanvas.moveTo(this.mMouseData.mouseX, this.mMouseData.mouseY);
    this.mLayerCanvas.ellipse(this.mMouseData.mouseX, this.mMouseData.mouseY, 15, 15, 0, 2*Math.PI, false);
    this.mLayerCanvas.stroke();

}

