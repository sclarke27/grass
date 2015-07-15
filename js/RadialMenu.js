"use strict";
Utils.kGameMessageRadialMenuActive = 0xb7244857; // RadialMenuActive
Utils.kGameMessageControllerStickCoords = 0x3c081915; // ControllerStickCoords

Utils.kControlIDMainContainer = "menuContainer";
Utils.kControlIDDebugTextX = "mouseposX";
Utils.kControlIDDebugTextY = "mouseposY";
Utils.kControlIDDebugTextAngle = "mouseposAng";
Utils.kcontrolIDCanvasTarget = "menuCanvas";
Utils.kControlIDMenuTitleText = "menuTitle";

Utils.kRadialMenuEventListeners = [
    [Utils.gEventTypes.GAMEEVENT, Utils.kGameMessageRadialMenuActive, 'UpdateMenuActiveState'],
    [Utils.gEventTypes.GAMEEVENT, Utils.kGameMessageControllerStickCoords, 'UpdateControllerStickCoords']
];

Utils.cRadialMenu = function () {
    this.mShowDebug = true;

    this.mMenuItems = {};
    this.mMainContainerControl = null;
    this.mCanvasTargetControl = null;
    this.mMenuCanvas = null;
    this.mIsMenuActive = false;
    this.mCoordsDebugTextX = null;
    this.mCoordsDebugTextY = null;
    this.mCoordsDebugTextAngle = null;
    this.mMenuTitleText = null;
    this.mCanvasWidth = 350;
    this.mCanvasPadding = 30;

    this.mWorkAreaWidth = this.mCanvasWidth - this.mCanvasPadding;
    this.mWorkAreaHeight = this.mWorkAreaWidth; //this canvas is square, deal with it
    this.mPadding = this.mWorkAreaWidth * .0175;
    this.mTopCenter = this.mWorkAreaWidth / 2;
    this.mSideCenter = this.mWorkAreaHeight / 2;
    this.mStrokeWidth = this.mWorkAreaWidth*.23;
    this.mPadding = this.mWorkAreaWidth*.0175;
    this.mRingGap = (this.mCanvasWidth*.001);
    this.mTopCenter = (this.mWorkAreaWidth+this.mCanvasPadding)/2;
    this.mLeftCenter = (this.mWorkAreaWidth+this.mCanvasPadding)/2;
    this.mOutsideRadius = (this.mWorkAreaWidth*.93)/2-this.mPadding;
    this.mInsideArcHeight = this.mStrokeWidth*.715;
    this.mRing2RadiusStart = this.mOutsideRadius - (this.mOutsideRadius*.04) - (this.mInsideArcHeight);
    this.mRing2RadiusEnd = this.mRing2RadiusStart + (this.mCanvasWidth*.0475);
    this.mRing3RadiusStart = this.mRing2RadiusEnd + (this.mRingGap * 4);
    this.mRing3RadiusEnd = this.mRing3RadiusStart + (this.mCanvasWidth * .0475);
    this.mOffsetTop = 0;
    this.mOffsetLeft = 0;


    this.mHoverArcs = [];
    this.mHoverArcsShadows = [];
    this.mActiveMenuData = null;
    this.mMenuDataLookup = [];
    this.mSelectedMenuItem = null;

    this.mDebugMenuData = {
        one: {
            title: "menu item one",
            icon: "thing.png",
            onSelect: function () {
                console.debug(this.title+' selected');
            }
        },
        two: {
            title: "menu item two",
            icon: "thing2.png",
            onSelect: function () {
                console.debug(this.title + ' selected');
            }
        },
        three: {
            title: "menu item three",
            icon: "thing2.png",
            onSelect: function () {
                console.debug(this.title + ' selected');
            }
        }
    }


};


Utils.cRadialMenu.prototype.Init = function () {
    this.mMainContainerControl = document.getElementById(Utils.kControlIDMainContainer);
    this.mCoordsDebugTextX = document.getElementById(Utils.kControlIDDebugTextX);
    this.mCoordsDebugTextY = document.getElementById(Utils.kControlIDDebugTextY);
    this.mCoordsDebugTextAngle = document.getElementById(Utils.kControlIDDebugTextAngle);
    this.mCanvasTargetControl = document.getElementById(Utils.kcontrolIDCanvasTarget);
    this.mMenuTitleText = document.getElementById(Utils.kControlIDMenuTitleText);
    this.mMenuCanvas = Raphael(this.mCanvasTargetControl, "100%", "100%");
    this.mMenuCanvas.customAttributes.simpleArc = Utils.gSVGUtils.SimpleArc;
    this.mMenuCanvas.customAttributes.radArc = Utils.gSVGUtils.RadArc;
    this.mMenuCanvas.customAttributes.hideArc = Utils.gSVGUtils.HideArc;
    this.mActiveMenuData = this.mDebugMenuData;
    this.HandleEventRegistration(true);
    
};

Utils.cRadialMenu.prototype.Shutdown = function () {
    this.mMainContainerControl = null;
    this.HandleEventRegistration(false);
};


Utils.cRadialMenu.prototype.ActivateUI = function () {
    this.mIsMenuActive = true;
    this.AppendTransforms();
    //this.mMainContainerControl.SetVisibility(true);

    if (this.mShowDebug) {
        var bgDropShadow = this.mMenuCanvas.circle(this.mTopCenter, this.mTopCenter, this.mWorkAreaWidth / 5);
        bgDropShadow.attr(Utils.cRadialMenu.kDropShadow());
        bgDropShadow.node.setAttribute("filter", "url(#smBlur)");

        var bgCircle = this.mMenuCanvas.circle(this.mTopCenter, this.mTopCenter, this.mWorkAreaWidth / 5);
        bgCircle.attr(Utils.cRadialMenu.kGreyCircle());
    }

    this.DrawMainMenuRings();
};

Utils.cRadialMenu.prototype.DeactivateUI = function () {
    if (this.mSelectedMenuItem) {
        var selectedMenuItemData = this.mActiveMenuData[this.mSelectedMenuItem];
        if (selectedMenuItemData && selectedMenuItemData.hasOwnProperty('onSelect')) {
            selectedMenuItemData.onSelect(this.mSelectedMenuItem);
        }
        this.mSelectedMenuItem = null;
    }
    this.mIsMenuActive = false;
    this.mMainContainerControl.SetVisibility(false);
    this.mMenuCanvas.clear()
    this.mHoverArcs = [];
    this.mHoverArcsShadows = [];
};

Utils.cRadialMenu.prototype.SetMenuData = function (newData) {
    this.mActiveMenuData = newData;
}


Utils.cRadialMenu.prototype.UpdateMenuActiveState = function (gameEvent) {
    var menu = Grass.gGameCore.mRadialMenu;
    var activateMenu = (typeof gameEvent != "boolean") ? false : gameEvent;

    if (activateMenu) {
        menu.ActivateUI();
    } else {
        menu.DeactivateUI();
    }
}

Utils.cRadialMenu.prototype.UpdateControllerStickCoords = function (gameEvent) {
    var menu = Grass.gGameCore.mRadialMenu;
    var itemCount = menu.mMenuDataLookup.length;
    menu.mSelectedMenuItem = null;
    if (menu.mIsMenuActive) {
        var coords = gameEvent.stickCoords[0];
        var radian = Math.round(Math.atan2(coords[0], coords[1]) * (180 / Math.PI))
        var degrees = radian;
        if (degrees < 0) {
            degrees = (degrees + 360);
        }
        if (menu.mShowDebug) {
            menu.mCoordsDebugTextX.SetRawText("X: " + Math.round(coords[0] * 10));
            menu.mCoordsDebugTextY.SetRawText("Y: " + Math.round(coords[1] * 10));
            menu.mCoordsDebugTextAngle.SetRawText("Radian: " + degrees);
        } else {
            menu.mCoordsDebugTextX.SetRawText(" ");
            menu.mCoordsDebugTextY.SetRawText(" ");
            menu.mCoordsDebugTextAngle.SetRawText(" ");

        }
        var menuItem = null;
        var menuData = null;
        if (coords[0] != 0 && coords[1] != 0) {
            var delta = Math.floor((degrees / 360) * itemCount);
            menu.mSelectedMenuItem = menu.mMenuDataLookup[delta];
            
        }
        menu.DrawMainMenuRings();
    }
};

Utils.cRadialMenu.prototype.DrawMainMenuRings = function () {

    var thisObj = this;
    var arcList = this.mActiveMenuData;
    var currDataSet = arcList;
    var startPercent = this.mRingGap;
    var itemCount = 0;
    var iterator = 0;
    var easing = "<>";
    var easeTime = 300;
    var layers = {
        shadow: {
            holder: this.mHoverArcsShadows,
            style: Utils.cRadialMenu.kDropShadow(),
            filter: "url(#smBlur)",
            opacity: .5
        },
        visible: {
            holder: this.mHoverArcs,
            style: Utils.cRadialMenu.kGreenSubRingStyle(this.mWorkAreaWidth),
            opacity: 1
        }

    }


    for (var lineItem in currDataSet) {
        this.mMenuDataLookup[itemCount]  = lineItem;
        itemCount++
    };

    for (var layer in layers) {
        startPercent = 0;
        iterator = 0;
        var currPercent = 0;
        // draw visibile layers
        for (var lineItem in currDataSet) {
            var currItemVal = currDataSet[lineItem];
            var currLayer = layers[layer] || null;
            var currArc = currLayer.holder[lineItem] || null;

            currPercent = startPercent + (100/itemCount);//((currItemVal / this.mBudgetData.totals.budget) * 100);

            var isNew = false;

            if (currArc == null) {
                currLayer.holder[lineItem] = this.mMenuCanvas.path();
                currLayer.holder[lineItem].attr(currLayer.style);
                if (currLayer.filter) {
                    currLayer.holder[lineItem].node.setAttribute("filter", currLayer.filter);
                }
                /*
                if (this.mIcons[lineItem] && currLayer.hasIcon) {
                    currLayer.holder[lineItem].data("icon", this.mIcons[lineItem]);
                }
                */
                currArc = currLayer.holder[lineItem];

                isNew = true
            } else {
                currArc.attr({ hideArc: false })
            }
            if (this.mSelectedMenuItem !== null) {

                var selectedMenuItemData = this.mActiveMenuData[this.mSelectedMenuItem];
                if (selectedMenuItemData && selectedMenuItemData.hasOwnProperty('title')) {
                    thisObj.mMenuTitleText.innerHTML = selectedMenuItemData['title'];
                }

                
            } else {
                thisObj.mMenuTitleText.innerHTML = "";
            }
            if (lineItem === this.mSelectedMenuItem) {
                currArc.attr(Utils.cRadialMenu.kRedSubRingStyle());
            } else {
                currArc.attr(Utils.cRadialMenu.kGreenSubRingStyle());
            }
            var subData = null;
            currLayer.holder[lineItem].data("subData", currPercent);
            subData = currPercent;

            iterator++;
                
            var padding = this.mRingGap;
            var arcStart = startPercent;
            var arcEnd = (currPercent - padding);

            currArc.data("startPercent", arcStart);
            currArc.data("endPercent", arcEnd);
            currArc.data("hoverColor", "rgb(185,54,54)");
            currArc.data("normalColor", currArc.attr("fill"));
            currArc.data("budgetValue", currItemVal);
            currArc.data("budgetType", lineItem);
            var textWidth = 0;
            var textHieght = 0;
            var newRadius = this.mRing2RadiusStart + (this.mInsideArcHeight * 3);
            var alpha5 = 360 / 100 * ((arcStart + arcEnd) / 2);
            var a5 = (90 - alpha5) * Math.PI / 180; 
            var x5 = (this.mTopCenter + newRadius * Math.cos(a5)) - (textWidth / 2);
            var y5 = (this.mLeftCenter - newRadius * Math.sin(a5)) - (textHieght / 2);
            var ringPad = currLayer.ringPadding || 0;
            if (!currArc.data("radius")) {
                currArc.data("radius", this.mRing2RadiusStart + ringPad)
            } else {
                this.mRing2RadiusStart = currArc.data("radius");
            }

            currArc.data("centerPoint", {
                x: x5,
                y: y5
            })

            currArc.attr({
                hideArc: false,
                simpleArc: [arcStart, arcEnd, 100, this.mTopCenter, this.mLeftCenter, this.mRing2RadiusStart + ringPad, this.mInsideArcHeight]
            });

            startPercent = (isNaN(currPercent)) ? startPercent : currPercent;
            
        }
    }
    startPercent = currPercent = 0;

}

Utils.cRadialMenu.prototype.HandleEventRegistration = function (activate) {
    for (var i = 0, n = Utils.kRadialMenuEventListeners.length; i < n; i++) {
        var curEvt = Utils.kRadialMenuEventListeners[i];
        if (activate) {
            Grass.gGameCore.mEventManager.AddEventListener(curEvt[0], curEvt[1], this[curEvt[2]]);
        } else {
            Grass.gGameCore.mEventManager.RemoveEventListener(curEvt[0], curEvt[1], this[curEvt[2]]);
        };
    };
};


//SVG radial meny styles

Utils.cRadialMenu.prototype.AppendTransforms = function () {
    /*  
      var glowFilters = {
          feColorMatrix : {
              "in" : "SourceGraphic",
              "type" : "matrix",
              "values" : "0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 1 0",
              "result" : "mask"
          },
          feMorphology : {
              "in" : "mask",
              "radius" : 1,
              "operator" : "dilate",
              "result" : "mask"
          },
          feColorMatrix : {
              "in" : "mask",
              "type" : "matrix",
              "values" : "0 0 0 0 0.6 0 0 0 0 0.5333333333333333 0 0 0 0 0.5333333333333333  0 0 0 1 0",
              "result" : "r0"
          },
          feGausianBlur : {
              "in" : "r0",
              "stdDeviation" : 4,
              "result" : "r1"
          },
          feComposite : {
              "operator" : "out",
              "in" : "r1",
              "in2" : "mask",
              "result" : "comp"
          },
          feMerge : {
              "feMergeNode" : {
                  "in" : "SourceGraphic"
              },
              "feMergeNode-1" : {
                  "in" : "r1"
              }
          }
      }
      */
    var SVGTag = document.getElementsByTagName("defs")[0];
    var filterTag = window.document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filterTag.setAttribute('id', 'outerGlow');

    var blurFilter1 = window.document.createElementNS("http://www.w3.org/2000/svg", "filter");
    blurFilter1.setAttribute('id', 'lgBlur');

    var blurTag1 = window.document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
    blurTag1.setAttribute('stdDeviation', 10);
    blurFilter1.appendChild(blurTag1);
    SVGTag.appendChild(blurFilter1);

    var blurFilter2 = window.document.createElementNS("http://www.w3.org/2000/svg", "filter");
    blurFilter2.setAttribute('id', 'smBlur');

    var blurTag2 = window.document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
    blurTag2.setAttribute('stdDeviation', 1.5);
    blurFilter2.appendChild(blurTag2);
    SVGTag.appendChild(blurFilter2);
    /*
        for(var filterType in glowFilters) {
            var attrTag = window.document.createElementNS("http://www.w3.org/2000/svg", filterType);
            var currFilter = glowFilters[filterType];
            for(var filterAttr in currFilter) {
                if (typeof currFilter[filterAttr] !== "object") {
                    attrTag.setAttribute(filterAttr, currFilter[filterAttr])
                } else {
                    var tag = (filterAttr.indexOf('-') > -1) ? filterAttr.substring(0,filterAttr.indexOf('-')) : filterAttr;
                    var subTag = window.document.createElementNS("http://www.w3.org/2000/svg", tag);
                    var currSubAttr = currFilter[filterAttr];
                    for(var subAttr in currSubAttr) {
                        subTag.setAttribute(subAttr, currSubAttr[subAttr]);
                    } 
                    attrTag.appendChild(subTag);
                }
            }
            filterTag.appendChild(attrTag);
        }
      */
    SVGTag.appendChild(filterTag);
};


Utils.cRadialMenu.kDropShadow = function () {
    return {
        stroke: "rgba(0,0,0,1)",
        "stroke-width": 1,
        "fill": "rgba(97,97,97,1)"
    }
}

Utils.cRadialMenu.kGreyCircle = function () {
    return {
        stroke: "rgba(97,97,97,1)",
        "stroke-width": 2,
        "fill": "rgba(223,223,223,1)"
    }
}

Utils.cRadialMenu.kGreenSubRingStyle = function () {
    return {
        stroke: "rgba(97,97,97,0)",
        fill: "#27c708",
        "stroke-width": 1
    }
};

Utils.cRadialMenu.kRedSubRingStyle = function () {
    return {
        stroke: "rgba(97,97,97,0)",
        fill: "rgb(185,54,54)",
        "stroke-width": 1
    }
};