/**
 * @class rpc
 * @author Scott Clarke
 * @constructor none
 * Example request:
 * 
        function handleSuccessCallback (response) {
            if(response.statusCode === 200) {
                document.getElementById('testContentDiv').innerHTML = response.contentText;
            } else {
                document.getElementById('testContentDiv').innerHTML = response.error;
            }
        }
             
        function handleStatusCallback (response) {
            document.getElementById('testContentDiv').innerHTML = response;
        }

        function handleErrorCallback (response) {
            document.getElementById('testContentDiv').innerHTML = response;
        }
             
        function bareMinumumRequest () {
            var requestData = {
                "url" : "pspTest.html",
                "onSuccess" : handleSuccessCallback,
                "onStatus" : handleStatusCallback,
                "onError" : handleErrorCallback
            };
            window.rpc.Request(requestData);
        };
        
 */
window.rpc = {
	/**
	 *  XHR Object Properties
	 */
	async: true,
	httpResponseText: null,
	showXHRStatus: false,
	responseHandler: null,
	currentState: "Connection Uninitialized.",
	connState: ["Connection Uninitialized.","Connection Open. Wait for Request.","Data recieved.","Processing Data.","Request Complete","Unknown XHR state."],
	preventCaching : true,
	toJSON : false,
	requestMethods : {
		"get" : "GET",
        "post" : "POST",
		"delete" : "DELETE",
		"put" : "PUT"
	},
	
	/**
	 * Main worker function
	 * @param {Object} inputParams
	 */
	Request : function (inputParams) {
		
		// process input parameters being passed in
		var currTimestamp = rpc.CreateTimestamp();
		var requestId = (typeof inputParams.id === "string") ? inputParams.id : "";
		var urlString = (typeof inputParams.url === "string") ? inputParams.url : "";
		var paramArr = (typeof inputParams.params === "object" && inputParams.params !== null) ? inputParams.params : [] ;
		var paramCount = paramArr.length;
		var requestMethod = (typeof inputParams.method === "string") ? inputParams.method : "get";
		var successCallback = (typeof inputParams.onSuccess === "function") ? inputParams.onSuccess : function () {};
        var errorCallback = (typeof inputParams.onError === "function") ? inputParams.onError : function () {};
        var statusCallback = (typeof inputParams.onStatus === "function") ? inputParams.onStatus : function () {};
		var isAsync  = (typeof inputParams.async === "boolean") ? inputParams.async : this.async ;
		var preventCache  = (typeof inputParams.preventCache === "boolean") ? inputParams.preventCache : this.preventCaching ;
		var restart = (typeof inputParams.restart === "function") ? inputParams.restart : null ;
		var contentType = (typeof inputParams.contentType === "string") ? inputParams.contentType : "application/json" ;
		
        // Add xtsx param if required
        if(preventCache && requestMethod !== "post"){
            paramArr.push(['xtsx',currTimestamp]);
			++paramCount;
        }
            
		//build param string
		var paramString = "";
        if(paramCount > 0 && (requestMethod === "get" || requestMethod === 'delete'))
                paramString = "?"
        
        // Add all params to the string
		for(i=0; i<paramCount; ++i) {
            if(i !== 0 ) paramString += "&"
			paramString += paramArr[i][0] + "=" + paramArr[i][1];
		}

		//make the request 
		this.MakeRequest(requestId, urlString, paramString, requestMethod, isAsync, successCallback, errorCallback, statusCallback);
	},
	
	
	/**
     * Method used to make actual XHR request. Called by rpc.Request(). 
     * This should never be called directly. Always use rpc.Request() method instead so input params can be properly processed
     *  
	 * @param {Object} requestId
	 * @param {Object} url
	 * @param {Object} params
	 * @param {Object} method
	 * @param {Object} async
	 * @param {Object} successCallback
	 * @param {Object} errorCallback
	 * @param {Object} statusCallback
	 */
	MakeRequest : function (requestId, url, params, method, async, successCallback, errorCallback, statusCallback) {

        //create request object
		var httpRequest = this.CreateRequestObject(false);
		
		//defined a temp request handler for dealing with status codes and the final server response
		var requestHandler = function() {
			if(httpRequest.readyState <= 4) {
				switch(httpRequest.readyState) {
					case 0 :
						rpc.HandleStatusUpdate(rpc.connState[0], statusCallback);
						break;
					case 1 :
						rpc.HandleStatusUpdate(rpc.connState[1], statusCallback);
						break;
					case 2 :
						rpc.HandleStatusUpdate(rpc.connState[2], statusCallback);
						break;
					case 3 :
						rpc.HandleStatusUpdate(rpc.connState[3], statusCallback);
						break;
					case 4 :			
						rpc.HandleStatusUpdate(rpc.connState[4], statusCallback);
						rpc.ProcessServerResponse(requestId, httpRequest, successCallback, errorCallback);
						break;
					default :
						rpc.HandleStatusUpdate(rpc.connState[5], statusCallback);
						break;
				}
			}						
		};
		
        //pass temp request handler to request object
		httpRequest.onreadystatechange = requestHandler;
		try {
			//do request
			if (method === "get") {
				httpRequest.open('GET', url + params, async);
				httpRequest.withCredentials = true;
				httpRequest.send(null);
			}
			else 
				if (method === "delete") {
					httpRequest.open('DELETE', url + params, async);
					httpRequest.withCredentials = true;
					httpRequest.send(null);
				}
				else {
					httpRequest.open('POST', url, async);
					httpRequest.withCredentials = true;
					httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
					httpRequest.send(params);
					
				}
		} catch(e) {
			errorCallback({"code":500, "message":"error opening conneciton to server", "stack": e});
		}
	},
	
	/**
	 * callback handler for status updates from XHR request. 
	 * @param {Object} statusMsg
	 * @param {Object} callback
	 */
	HandleStatusUpdate : function (statusMsg, callback) {
		if(typeof callback == "function") {
			callback(statusMsg);
		} else {
			scrui.DebugPrint(statusMsg);
		}
	},
	
	/**
	 * callback handler for when errors occur with XHR request
	 * @param {Object} errorMsg
	 * @param {Object} callback
	 */
	HandleXHRError : function (errorMsg, callback) {
        if(typeof callback == "function") {
            callback(errorMsg);
        } else {
			scrui.DebugPrint(errorMsg);
		}
	},
	
	/**
	 * 
	 * @param {Object} requestId
	 * @param {Object} httpRequest
	 * @param {Object} callback
	 * @param {Object} errorStr
	 */
	ProcessServerResponse : function(requestId, httpRequest, successCallback, errorCallback) { 
		var state = httpRequest.readyState;
		var content_type = httpRequest.getResponseHeader('Content-Type');
		var response = [ {
				"statusCode" : 0,
				"error" : null,
				"contentText" : "",
				"contentType" : "",
                "jsonContent" : null,
				"isJson" : true}
			];

		//build response object
		response.statusCode = (typeof httpRequest.status !== "unknown") ? httpRequest.status : 200;
		response.contentText = (typeof httpRequest.responseText !== "unknown") ? httpRequest.responseText : '';
		response.contentType = (typeof content_type !== "unknown") ? content_type : '';
		response.jsonContent = eval("[" + httpRequest.responseText + "]");
		callAfterRequestDone = function() {rpc.HandleXHRResponse(requestId, response, successCallback, errorCallback)};
		window.setTimeout(callAfterRequestDone, 10);
	},
		
	/**
	 * Handles the server response to an XHR call
	 * @param {Object} requestId
	 * @param {Object} response
	 * @param {Object} callback
	 */
	HandleXHRResponse : function(requestId, response, successCallback, errorCallback) {

        if (typeof errorCallback != "function") {
			errorCallback = function(message) {alert(message)};
		}
		switch(response.statusCode) {
			//handle redirect
			case 401:
                errorCallback({"code":401,"message":"server sent redirect"});
			case 302:
                errorCallback({"code":401,"message":"not authenticated"});
				break;
			case 404:
                errorCallback({"code":404,"message":"page not found"});
				break;
			case 405:
                errorCallback({"code":405,"message":"invalid request"});
				break;
			case 500:
                errorCallback({"code":500,"message":"server encounterd an error processing the request. See server logs."});
				break;
			case 501:
                errorCallback({"code":501,"message":"request method not implemented"});
				break;
			// handle correct response
			case 200:
				if(typeof successCallback == "function") {
					successCallback(response);
				}
				break;

			// catch any unkown error that may occur				
			default :
				errorCallback({"code": response.statusCode, "message": "unknown error occured"});
				break;
				
		}		
	},
	
	/**
	 * creates a timestamp with gets tacked onto the end of a URL to prevent caching
	 */
	CreateTimestamp : function () {
		currentDate = new Date();
		return currentDate.getUTCDay() + '' + currentDate.getUTCHours() + '' + currentDate.getUTCMonth() + '' + currentDate.getUTCMinutes() + '' +currentDate.getUTCSeconds() + '' + currentDate.getUTCMilliseconds();
	},
	
	/**
	 * function to handle making a new http request ojbect
	 */
	CreateRequestObject : function(useComet) {
		var httpRequest = false;
		if (window.XMLHttpRequest && !window.ActiveXObject) { // Mozilla, Safari,...
			//debug.append('Mozilla HTTP request method');
			httpRequest = new XMLHttpRequest();
			httpRequest.domain="ea.com";
			if (httpRequest.overrideMimeType) {
				httpRequest.overrideMimeType('text/xml');
			}
		} else if (window.ActiveXObject) { // IE
			try {
				httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
			try {
				httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {}
				httpRequest = false;
			}
		}
		if (!httpRequest) {
			//debug.append('Cannot create XMLHTTP instance');
			httpRequest = false;
		}	
		//httpRequest.multipart = true;
		return httpRequest;
	}	
	

};
