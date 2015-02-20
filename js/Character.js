platformGame.cCharacter = function (charProps, canvas) {
    this.mCharWidth = charProps.width;
    this.mCharKeyBindings = charProps.keybindings || null;
    this.mCanvas = canvas || null;
    this.mSpriteProps = charProps.sprite;
    this.mIsShown = true;
    this.mIsMoving = false;
    this.mPosX = 0;
    this.mPosY = 0;
    this.mSprite = new platformGame.Sprite(this.mSpriteProps.imgSrc, 
                                            this.mSpriteProps.width, 
                                            this.mSpriteProps.height,
                                            this.mSpriteProps.offsetX,
                                            this.mSpriteProps.offsetY,
                                            this.mSpriteProps.frames,
                                            this.mSpriteProps.duration);
                                            
    
    
    if(this.mCharKeyBindings.length > 0) {
        this.RegisterEvents();
    }
    
    
};

platformGame.cCharacter.prototype.SetCanvas = function (canvas) {
    this.mCanvas = canvas;
    if (this.mCanvas) {
        this.mSprite.SetCanvas(this.mCanvas);
    }
}

platformGame.cCharacter.prototype.Show = function () {
    if (this.mCanvas) {
        this.mSprite.Draw();
    }
};

platformGame.cCharacter.prototype.Hide = function () {
    
};

platformGame.cCharacter.prototype.Animate = function(time){
    this.mSprite.Animate(time);
}

platformGame.cCharacter.prototype.SetPosition = function(x, y) {
    this.mPosX = x;
    this.mPosY = y;
    if (this.mCanvas) {
        this.mSprite.SetPosition(this.mPosX, this.mPosX);
    }
};


platformGame.cCharacter.prototype.DoStuff = function () {
    
}

platformGame.cCharacter.prototype.ToggleMovement = function(doMovement, dir, dist){
    console.debug('toggle')
    if(!this.mIsMoving && doMovement) {
        this.MoveCharacter(dir, dist);
    } 
    this.mIsMoving = doMovement;
    
}

platformGame.cCharacter.prototype.MoveCharacter = function(direction, distance){
    console.debug('move;')
    if(this.mCanvas) {
        this.mSprite.mMoveDirection = direction || this.mSprite.mMoveDirection;
        this.mSprite.mMoveDistance = distance || this.mSprite.mMoveDistance;
        var currPos = this.mSprite.GetPosition();
        switch(this.mSprite.mMoveDirection) {
            case 'up' :
                currPos.y = currPos.y - this.mSprite.mMoveDistance;
                break
            case 'down' :
                currPos.y = currPos.y + this.mSprite.mMoveDistance;
                break
            case 'left' :
                currPos.x = currPos.x - this.mSprite.mMoveDistance;
                this.mSprite.MirrorX(true);
                break
            case 'right' :
                currPos.x = currPos.x + this.mSprite.mMoveDistance;
                this.mSprite.MirrorX(false);
                break
        }
        this.mSprite.SetPosition(currPos.x, currPos.y);
        this.mSprite.Draw();
    }
};

platformGame.cCharacter.prototype.RegisterEvents = function () {
    var i = 0;
    var totalBindings = this.mCharKeyBindings.length;
    var thisObj = this;
    while(i < totalBindings) {
        var currBinding = this.mCharKeyBindings[i];
        platformGame.gCoreManager.mEventManager.AddEventListener(
            platformGame.gEventTypes.KEYDOWN, 
            currBinding[0], 
            function(){
                if (!thisObj.mIsMoving) {
                    thisObj.ToggleMovement(true, currBinding[0], platformGame.gCoreManager.mMoveDistance);
                }
            }
        );
        platformGame.gCoreManager.mEventManager.AddEventListener(
            platformGame.gEventTypes.KEYUP, 
            currBinding[0], 
            function(){
                thisObj.ToggleMovement(false);
            }
        );
        
        
        i++;
    }
};

platformGame.cCharacter.prototype.AddEventsOld = function () {
    // MOVE UP >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYDOWN, 
        platformGame.kKeys.W, 
        function(){
            //if (!platformGame.gCoreManager.mBrownBird.mIsMoving) {
                platformGame.gCoreManager.ToggleBirdMovement(true, 'up', platformGame.gCoreManager.mMoveDistance);
           // }
        }
    );
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYDOWN, 
        platformGame.kKeys.ARROWUP, 
        function(){
            if (!platformGame.gCoreManager.mBrownBird.mIsMoving) {
                platformGame.gCoreManager.ToggleBirdMovement(true, 'up', platformGame.gCoreManager.mMoveDistance);
            }
        }
    );
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYUP, 
        platformGame.kKeys.W, 
        function(){
            platformGame.gCoreManager.ToggleBirdMovement(false);
        }
    );
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYUP, 
        platformGame.kKeys.ARROWUP, 
        function(){
            platformGame.gCoreManager.ToggleBirdMovement(false);
        }
    );
    
    // MOVE DOWN >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYDOWN, 
        platformGame.kKeys.S, 
        function(){
            //if (!platformGame.gCoreManager.mBrownBird.mIsMoving) {
                platformGame.gCoreManager.ToggleBirdMovement(true, 'down', platformGame.gCoreManager.mMoveDistance);
           // }
        }
    );
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYDOWN, 
        platformGame.kKeys.ARROWDOWN, 
        function(){
            if (!platformGame.gCoreManager.mBrownBird.mIsMoving) {
                platformGame.gCoreManager.ToggleBirdMovement(true, 'down', platformGame.gCoreManager.mMoveDistance);
            }
        }
    );
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYUP, 
        platformGame.kKeys.S, 
        function(){
            platformGame.gCoreManager.ToggleBirdMovement(false);
        }
    );
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYUP, 
        platformGame.kKeys.ARROWDOWN, 
        function(){
            platformGame.gCoreManager.ToggleBirdMovement(false);
        }
    );
    
    // MOVE RIGHT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYDOWN, 
        platformGame.kKeys.D, 
        function(){
            //if (!platformGame.gCoreManager.mBrownBird.mIsMoving) {
                platformGame.gCoreManager.ToggleBirdMovement(true, 'right', platformGame.gCoreManager.mMoveDistance);
           // }
        }
    );
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYDOWN, 
        platformGame.kKeys.ARROWRIGHT, 
        function(){
            if (!platformGame.gCoreManager.mBrownBird.mIsMoving) {
                platformGame.gCoreManager.ToggleBirdMovement(true, 'right', platformGame.gCoreManager.mMoveDistance);
            }
        }
    );
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYUP, 
        platformGame.kKeys.D, 
        function(){
            platformGame.gCoreManager.ToggleBirdMovement(false);
        }
    );
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYUP, 
        platformGame.kKeys.ARROWRIGHT, 
        function(){
            platformGame.gCoreManager.ToggleBirdMovement(false);
        }
    );
    
    
    // MOVE LEFT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYDOWN, 
        platformGame.kKeys.A, 
        function(){
            //if (!platformGame.gCoreManager.mBrownBird.mIsMoving) {
                platformGame.gCoreManager.ToggleBirdMovement(true, 'left', platformGame.gCoreManager.mMoveDistance);
           // }
        }
    );
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYDOWN, 
        platformGame.kKeys.ARROWLEFT, 
        function(){
            if (!platformGame.gCoreManager.mBrownBird.mIsMoving) {
                platformGame.gCoreManager.ToggleBirdMovement(true, 'left', platformGame.gCoreManager.mMoveDistance);
            }
        }
    );
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYUP, 
        platformGame.kKeys.A, 
        function(){
            platformGame.gCoreManager.ToggleBirdMovement(false);
        }
    );
    platformGame.gCoreManager.mEventManager.AddEventListener(
        platformGame.gEventTypes.KEYUP, 
        platformGame.kKeys.ARROWLEFT, 
        function(){
            platformGame.gCoreManager.ToggleBirdMovement(false);
        }
    );    
}

