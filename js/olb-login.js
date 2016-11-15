
/*
 * This script drives the functionalities for OLB login and "Remember my username" for OLB login.
 * @dependency - jquery
 * @dependency - localstorage-util.js
 * @author andrew.arant@bbva.com
 */

var OlbLogin = {
	/*
	 * Validates a username for Online Banking login.
	 * @param {string} userName
	 */
    validateUsername : function(username) {
		if(null == username){ return false; }
		username = username.toLowerCase();
        var isValidUsername = false;
        var usernameFiltered = username.replace(/[^0-9A-Za-z]+/g, "");
        var defaultStrMatcher = "or nickname"; // Default 'placeholder' field value
        var hasBlacklistChars = false;
        if (username.indexOf(defaultStrMatcher) > -1) {
            return false
        }
        if (username.length > 3 && username.length <= 20) {
            isValidUsername = (username.length == usernameFiltered.length);
        } 
		else {
            isValidUsername = false;
        }
        return isValidUsername;
    },
	/*
	 * Called upon login form submit, validates user input and submits the login form.
	 */
    doLogin : function() {
        try {
			OlbRememberMe.copyEnteredTextToHiddenField();
			var err = $("#signon-error-msg");
            var usernameInput = $("#userName");
			var username = usernameInput.val();
			OlbRememberMe.saveUsername(username);
            if (! OlbLogin.validateUsername(username)) {
                err.css({
                    color: "#a32a3d",
                    fontStyle: "italic"
                });
                err.html("Enter a valid User ID");
                usernameInput.focus();
                OlbLogin.notifyDataLayerInvalidLogin();
                return false;
            }
			else {
                var standalone = (typeof(standalone_login) != "undefined");
                err.css({
                    color: "#666666",
                    fontStyle: "normal"
                });
                err.html("Logging in...");
                if (standalone) {
                    $("#signin-lock-ico").css("display", "none")
                }
                $("#loginSpinner").css("visibility", "visible");
                var frm = $("#olbLoginForm");
                frm.submit();
                return true
            }
        } catch (err) {
			_log(err);
            var frm = $("#olbLoginForm");
            frm.submit()
			return true;
        }
    },
   /*
    * Updates the data-layer with an invalid login notice when a bad username is entered.
    */
  	 notifyDataLayerInvalidLogin : function() {
  		 try {
  		 	 var digitalData = digitalData || {};
  			 if (digitalData && digitalData.page && digitalData.page.pageInfo) {
  				 digitalData.page.pageInfo.siteErrorFields = "Username:Invalid / Username: 401";
  			 }
  		 } catch (err) {
  			 _log(err);
  		 }
  	},
	/*
	 * Called upon "forgot password" form submit, validates user input and submits the recover password form.
	 */
    doForgotPassword: function() {
        try {
            var err = $("#signon-error-msg");
            if (err.length > 0) {
                err.html("&nbsp;")
            }
			var usernameInput = $('#inputFP1');
			var username = usernameInput.val();
            if (! OlbLogin.validateUsername(username)) {
                if (err.length > 0) {
                    err.text("Enter a valid User ID.")
                }
                return false
            } 
			else {
                var frm = $("#forgotPassword1");
                frm.submit();
                return true
            }
        } catch (err) {
			_log(err);
            var frm = $("#forgotPassword1");
            frm.submit()
        }
    }
};

var OlbRememberMe =  {
	userNameTextInput : $('#userNameInput'),
	userNameHiddenField : $('#userName'),
	OlbRememberMeCheckbox : $("#remembermeChk"),
	cachedItemKeys : {
		userName : "username"
	},
	/*
	 * Store the username in local storage.
	 * @param {string} userName
	 */
	saveUsername : function(userName){
		try{
			var remember = OlbRememberMe.OlbRememberMeCheckbox.is(':checked');
			if(OlbLogin.validateUsername(userName) && remember){
				LocalStorageUtil.setCachedItem(OlbRememberMe.cachedItemKeys.userName,userName,{persistent:true,daysToPersist:1000,html5:true});
			}
			else{
				LocalStorageUtil.deleteCachedItem(OlbRememberMe.cachedItemKeys.userName);
			}
		}
		catch(err){_log(err);}
	},
	/*
	 * Retrieve the username from local storage, display it in the username input, and place it in the username hidden field.
	 */
	getSavedUsername : function(){
		try{
			var cachedUserName = LocalStorageUtil.getCachedItem(OlbRememberMe.cachedItemKeys.userName);
			if(cachedUserName && cachedUserName.length > 0){
				OlbRememberMe.userNameHiddenField.val(cachedUserName);
				OlbRememberMe.userNameTextInput.val(OlbRememberMe.obfuscateUsername(cachedUserName));
				OlbRememberMe.OlbRememberMeCheckbox.attr('checked',true);
			}
		}
		catch(err){_log(err);}
	},
	/*
	 * Called when the user clicks he "remember my username" checkbox. Deletes the stored username from local cache when the checkbox is un-checked.
	 */
	onCheckboxClick : function(){
		var remember = OlbRememberMe.OlbRememberMeCheckbox.is(':checked');
		if(! remember){
			LocalStorageUtil.deleteCachedItem(OlbRememberMe.cachedItemKeys.userName);
		}
	},
	/*
	 * Copies the "remembered" username value to a hidden field. Because the "remembered" value displayed in the text input is obfuscated with * characters
	 * for the last n digits of the username, the full unobfuscated value is placed into a hidden field to be submitted to OLB.
	 */
	copyEnteredTextToHiddenField : function(){
		if(OlbRememberMe.userNameTextInput.length < 1 || OlbRememberMe.userNameHiddenField.length < 1){ return false; }
		var textInputValue = OlbRememberMe.userNameTextInput.val();
		var hiddenFieldValue = OlbRememberMe.userNameHiddenField.val();
		if(textInputValue.indexOf("*") == -1){
			OlbRememberMe.userNameHiddenField.val(textInputValue);
		}
	},
	/*
	 * Replace the last n characters of the unobfuscated username w/ * characters.
	 * @param {string} userName
	 */
	obfuscateUsername : function(userName){
		var obfuscated = "*****";
		var plain = userName.substring(0,3);
		return plain+obfuscated;
	},
	/*
	 * Clears the username input if the user begins typing into it while a "remembered" password is present.
	 * @param {event} e
	 */
	clearObfuscatedUsernameWhenTyping : function(e){ 
		var keynum;
		var enterKeyKeynum = 13;
		var textInputValue = OlbRememberMe.userNameTextInput.val();
		if(window.event) { // IE                    
		  keynum = e.keyCode;
		} else if(e.which){ // Netscape/Firefox/Opera                   
		  keynum = e.which;
		}
		if(textInputValue.indexOf('*') > -1 && (keynum != enterKeyKeynum) ){
		    var keyPressed = String.fromCharCode(keynum).toLowerCase();
			OlbRememberMe.userNameTextInput.val(keyPressed);	
		}
	},
	/*
	 * Initiates retrieving the "remembered" username from local storage.
	 * Event listener setup for "remember me" related form inputs.
	 */
	init : function(){
		OlbRememberMe.getSavedUsername();
		OlbRememberMe.userNameTextInput.on('keyup',OlbRememberMe.clearObfuscatedUsernameWhenTyping);
	}
};

var _log = _log || function(obj){ if(typeof(console) != 'undefined'){console.log(obj);}}