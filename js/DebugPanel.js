Utils.cDebugPanel = function (rootDomObj) {
    this.mCanvas = null;
    this.mRootDomObj = rootDomObj;
    this.mWindowWidth = 200;
    this.mWindowHeight = 150;
    this.mFPSArray = new Array();
    this.mMaxArrayLen = 240;
    this.mFPSCount = 0;
    this.mMaxFPS = 0;
    this.mMinFPS = 0;
    this.mMeanFPS = 0;
    this.mStopAt = 10;
    this.mFPS = 0;
    this.mStartTime = 0;
    this.mCurrDate = 0;
    this.mLeftMargin = 2;
    this.mLineHeight = 15;
    this.mLastTimeStamp = 0;
};

Utils.cDebugPanel.prototype.Init = function (rootDomObj) {
    //create and display canvas to write debug info to
    this.mCanvas = new Utils.cCanvasManager();
    this.mCanvas.Init(this.mWindowWidth,this.mWindowHeight,(Grass.gGameCore.mDocWidth-this.mWindowWidth), 20);
    this.mCanvas.Show(this.mRootDomObj);
    this.mCanvas.mCanvasDomObj.style.position = "fixed";
    this.mCanvas.mCanvasDomObj.style.backgroundColor = "rgba(0,0,0,.5)"
    this.mCanvas.mCanvasDomObj.style.boxShadow = "0px 0px 15px rgba(0,0,0,.5)"
    
    this.mCurrDate = new Date();
    this.mStartTime = Math.round(this.mCurrDate.getTime()/1000);
    
};

Utils.cDebugPanel.prototype.OnFrameChange = function (timestamp) {
    timestamp = Math.round(timestamp/1000);
    var thisObj = this;
    //console.debug(timestamp, thisObj.mLastTimeStamp !== timestamp)
    if(thisObj.mLastTimeStamp !== timestamp) {
        this.mFPS = this.mFPSCount;
        this.mFPSCount = 0;
        this.mFPSArray.push(this.mFPS);
        
        var fpsArrLen = this.mFPSArray.length;
        var i = 0;
        var j = fpsArrLen-1;

        while(i<fpsArrLen) {
            while(j > i) {
                if(this.mFPSArray[j-1] > this.mFPSArray[j]) {
                    this.mFPSArray[j-1] = this.mFPSArray[j]
                }
                j--;
            }
            i++
        }

        if (this.mFPSArray[0] == 0 || fpsArrLen > this.mMaxArrayLen) {
            this.mFPSArray = this.mFPSArray.slice(1, (fpsArrLen > this.mMaxArrayLen) ? this.mMaxArrayLen : fpsArrLen);
            fpsArrLen = this.mFPSArray.length;
        }
        i=0;
        
        var sum = 0;
        while(i<fpsArrLen) {
            sum = sum + this.mFPSArray[i];
            i++;
        }
        this.mMeanFPS = Math.round((sum / fpsArrLen)*10)/10;
        this.mMaxFPS = this.mFPSArray[fpsArrLen-1];
        this.mMinFPS = this.mFPSArray[0];        
    } else {
        this.mFPSCount++
    }

    //console.debug(this.mFPSArray)
    thisObj.mLastTimeStamp = timestamp;
    thisObj.ShowDebugInfo();  
    this.mCanvas.Show(this.mRootDomObj);
};

Utils.cDebugPanel.prototype.ShowDebugInfo = function () {
    var i = 1;
    this.mCanvas.ClearCanvas();
    this.mCanvas.WriteFillText("<< DEBUG PANEL >>", this.mLeftMargin, this.mLineHeight, "#00ff00", "10px Tahoma");
    this.mCanvas.WriteFillText("Start Time: " + this.mStartTime, this.mLeftMargin, this.mLineHeight*++i, "#00ff00", "10px Tahoma");
    this.mCanvas.WriteFillText("Curr Time: " + this.mLastTimeStamp, this.mLeftMargin, this.mLineHeight*++i, "#00ff00", "10px Tahoma");
    this.mCanvas.WriteFillText("FPS: " + this.mFPS, this.mLeftMargin, this.mLineHeight*++i, "#00ff00", "10px Tahoma");
    this.mCanvas.WriteFillText("FPS Max: " + this.mMaxFPS, this.mLeftMargin, this.mLineHeight*++i, "#00ff00", "10px Tahoma");
    this.mCanvas.WriteFillText("FPS Min: " + this.mMinFPS, this.mLeftMargin, this.mLineHeight*++i, "#00ff00", "10px Tahoma");
    this.mCanvas.WriteFillText("FPS Mean: " + this.mMeanFPS, this.mLeftMargin, this.mLineHeight*++i, "#00ff00", "10px Tahoma");
   // this.mCanvas.WriteFillText("FPS Count: " + this.mFPSCount, this.mLeftMargin, this.mLineHeight*++i, "#00ff00", "10px Tahoma");
    //this.mCanvas.WriteFillText("Touchsreen: " + Utils.gCoreManager.mIsTouchUI, this.mLeftMargin, this.mLineHeight*++i, "#00ff00", "10px Tahoma");
  
};
