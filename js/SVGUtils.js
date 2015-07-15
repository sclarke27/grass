"use strict";

Utils.cSVGUtils = function () {

};


/*
 * begin extra SVG object attribute handlers
 */

Utils.cSVGUtils.prototype.RadArc = function (startVal, endVal, total, topCenter, leftCenter, outsideRadius, ringWidth) {
    var tempVal = null;
    var goClockwise = false;
    startVal = (isNaN(startVal)) ? 0 : startVal;
    endVal = (isNaN(endVal)) ? 0 : endVal;
    if (startVal > endVal) {
        goClockwise = true;
        tempVal = startVal;
        startVal = endVal;
        endVal = tempVal;
    }

    var iconObj = this.data("icon") || null;

    // find outer cords
    var newRadius = outsideRadius;
    var alpha1 = 360 / total * startVal; //starting degree
    var a1 = (90 - alpha1) * Math.PI / 180; // 
    var x1 = topCenter + newRadius * Math.cos(a1)
    var y1 = leftCenter - newRadius * Math.sin(a1)

    var alpha2 = 360 / total * endVal; //starting degree
    var a2 = (90 - alpha2) * Math.PI / 180;
    var x2 = topCenter + newRadius * Math.cos(a2);
    var y2 = leftCenter - newRadius * Math.sin(a2);

    // find inner cords
    var newRadius2 = outsideRadius - ringWidth;
    var alpha3 = 360 / total * endVal; //starting degree
    var a3 = (90 - alpha3) * Math.PI / 180;
    var x3 = topCenter + newRadius2 * Math.cos(a3);
    var y3 = leftCenter - newRadius2 * Math.sin(a3);

    var alpha4 = 360 / total * startVal; //starting degree
    var a4 = (90 - alpha4) * Math.PI / 180; // 
    var x4 = topCenter + newRadius2 * Math.cos(a4)
    var y4 = leftCenter - newRadius2 * Math.sin(a4)

    // place icon
    if (iconObj && typeof iconObj == "object") {
        var iconWidth = iconObj.attr("width");
        if ((alpha2 - alpha1) > iconWidth) {
            iconObj.show();
            var alpha5 = 360 / total * (Math.ceil(startVal + endVal) / 2); //starting degree
            var iconRadius = outsideRadius - (ringWidth / 2);
            var a5 = (90 - alpha5) * Math.PI / 180; // 
            var x5 = (topCenter + iconRadius * Math.cos(a5)) - (iconWidth / 2);
            var y5 = (leftCenter - iconRadius * Math.sin(a5)) - (iconWidth / 2);
            iconObj.attr({
                x: x5,
                y: y5
            });
        } else {
            iconObj.hide();
        }
    }


    var arcPath = ""
    if (goClockwise) {
        arcPath = [
          ["M", x1, y1],
          ["A", newRadius, newRadius, 0, +(alpha1 > 180), 0, x2, y2],
          ["L", x3, y3],
          ["A", newRadius2, newRadius2, 0, +(alpha1 > 180), 1, x4, y4],
          ["L", x1, y1]
        ];
    } else {
        if (endVal < 50) {
            arcPath = [
              ["M", x1, y1],
              ["A", newRadius, newRadius, 1, +(alpha1 < 180), 0, x2, y2],
              ["L", x3, y3],
              ["A", newRadius2, newRadius2, 1, +(alpha1 < 180), 1, x4, y4],
              ["L", x1, y1]
            ];
        } else {
            arcPath = [
              ["M", x1, y1],
              ["A", newRadius, newRadius, 1, +(alpha1 > 180), 0, x2, y2],
              ["L", x3, y3],
              ["A", newRadius2, newRadius2, 1, +(alpha1 > 180), 1, x4, y4],
              ["L", x1, y1]
            ];
        }
    }

    return {
        path: arcPath
    }

};

Utils.cSVGUtils.prototype.SimpleArc = function (startVal, endVal, total, topCenter, leftCenter, outsideRadius, ringWidth) {

    var iconObj = this.data("icon") || null;
    //console.debug("start:" + startVal + " end:" + endVal);    
    if (isNaN(startVal) || isNaN(endVal) || isNaN(total)) {
        //console.debug("bad value")
        return;
    } else {



        // find outer cords
        var newRadius = outsideRadius;
        var alpha1 = 360 / total * startVal; //starting degree
        var a1 = (90 - alpha1) * Math.PI / 180; // 
        var x1 = topCenter + newRadius * Math.cos(a1)
        var y1 = leftCenter - newRadius * Math.sin(a1)

        var alpha2 = 360 / total * endVal; //starting degree
        var a2 = (90 - alpha2) * Math.PI / 180;
        var x2 = topCenter + newRadius * Math.cos(a2);
        var y2 = leftCenter - newRadius * Math.sin(a2);

        // find inner cords
        var newRadius2 = outsideRadius + ringWidth;
        var alpha3 = 360 / total * endVal; //starting degree
        var a3 = (90 - alpha3) * Math.PI / 180;
        var x3 = topCenter + newRadius2 * Math.cos(a3);
        var y3 = leftCenter - newRadius2 * Math.sin(a3);

        var alpha4 = 360 / total * startVal; //starting degree
        var a4 = (90 - alpha4) * Math.PI / 180; // 
        var x4 = topCenter + newRadius2 * Math.cos(a4)
        var y4 = leftCenter - newRadius2 * Math.sin(a4)

        // place icon
        if (iconObj && typeof iconObj == "object") {
            var iconWidth = iconObj.attr("width");
            if (((alpha2 - alpha1) * 3.2) > iconWidth) {
                iconObj.show();
                var alpha5 = 360 / total * (Math.ceil(startVal + endVal) / 2); //starting degree
                var iconRadius = outsideRadius + (ringWidth / 2);
                var a5 = (90 - alpha5) * Math.PI / 180; // 
                var x5 = (topCenter + iconRadius * Math.cos(a5)) - (iconWidth / 2);
                var y5 = (leftCenter - iconRadius * Math.sin(a5)) - (iconWidth / 2);
                iconObj.animate({
                    x: x5,
                    y: y5
                }, 10, "linear");
            } else {
                iconObj.hide();
            }
        }
        var arcPath = []
        if (startVal > 50 || (startVal < 50 && (endVal - startVal) >= 50)) {
            arcPath = [["M", x1, y1], ["A", newRadius, newRadius, 0, +(alpha1 < 180), 1, x2, y2], ["L", x3, y3], ["A", newRadius2, newRadius2, 0, +(alpha1 < 180), 0, x4, y4], ["L", x1, y1]];
        } else {
            arcPath = [["M", x1, y1], ["A", newRadius, newRadius, 0, +(alpha1 > 180), 1, x2, y2], ["L", x3, y3], ["A", newRadius2, newRadius2, 0, +(alpha1 > 180), 0, x4, y4], ["L", x1, y1]];
        }

        return {
            path: arcPath
        }
    }

};

Utils.cSVGUtils.prototype.HideArc = function (isArcHidden) {
    var iconObj = this.data("icon") || null;
    if (isArcHidden) {
        if (iconObj) {
            iconObj.attr({
                opacity: 0
            })
        }
        this.hide();
    } else {
        if (iconObj) {
            iconObj.attr({
                opacity: 1
            })
        }
        this.show();
    }

    return null;
};

Utils.gSVGUtils = new Utils.cSVGUtils();


