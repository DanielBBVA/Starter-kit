var BrowserAlerts = {
	
	cacheAttr : 'browserAlert.shown',
	htmlContainer : null,
	isDemo : false,
	
	init : function(opts){
		opts = opts || {};
		var delay = 0; // Number of milliseconds to delay the alert after the document loads.
		if(opts.delay){
			delay = opts.delay;
		}
		BrowserAlerts.htmlContainer = $('#browser-alert');
		setTimeout(function(){
			var alertKeys = Object.keys(BrowserAlerts.alerts);
			/* 
			 * Loop through each alert that's configured and run its test() method to see if the target browser is being used, and if so show the alert.
			 */
			for(var i=0,ii=alertKeys.length; i<ii; i++){
				var _alert = BrowserAlerts.alerts[alertKeys[i]];
				if(_alert && _alert.test()){
					var htmlContainer = (_alert['htmlContainer']) ? _alert['htmlContainer'] : BrowserAlerts.htmlContainer;
					if(_alert['alertContent']){ 
						$('.alert-msg-content').html(_alert['alertContent']);
					}
					var closeBtn = $('.alert-msg-close',htmlContainer);
					closeBtn.on('click',function(){
						BrowserAlerts.hide(htmlContainer);
					});
					BrowserAlerts.show(htmlContainer);
					return true;
				}
			}
			return false;
		},delay);
	},
	
	/*
	 * Configure alerts here. Each alert object is required to have a test() function that returns a boolean value.
	 * It can optionally have an 'alertContent' property to override the default HTML content for the message portion of the alert.
	 * It can optionally have an 'htmlContainer' property whose value is a jquery object for an alternate HTML container besides the #browser-alert container.
	 */
	alerts : {
		isIE10 : {
			test : function(){
				return BrowserAlerts.tests.isIE10();
			}
		}
	},
	
	/*
	 * Show the alert
	 */
	show : function(htmlContainer){
		var shownThisSession = (null != LocalStorageUtil.getCachedItem(BrowserAlerts.cacheAttr));
		if(BrowserAlerts.isDemo===false){
			if(shownThisSession){ // If the user has already seen the browser alert (during the current session) don't show it again.
				return false; 
			}
			LocalStorageUtil.setCachedItem(BrowserAlerts.cacheAttr,'true',{cookie:true});
		}
		htmlContainer.collapse('show');
		return true;
	},
	
	/*
	 * Hide the alert
	 */
	hide : function(htmlContainer){
		htmlContainer.collapse('hide');
		return true;
	},
	
	tests : {
		isIE10 : function(){
			 var isIE10 = false;
			 BrowserAlerts.isDemo = (document.location.href.indexOf("ie10=true") > -1);
			 isIE10 = (navigator.userAgent.indexOf('MSIE 10') > -1 || navigator.userAgent.indexOf("Trident/6") > -1);
			 /*@cc_on
				if (/^10/.test(@_jscript_version)) {
					isIE10 = true;
				}
			 @*/
			 return (isIE10 || BrowserAlerts.isDemo);
		},
		isIE11 : function(){
			var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
			var demo = (("" + document.location.href).indexOf("ie11=true") > -1);
			return (isIE11 || demo);
		},
		isIE : function(){
		  var userAgent = navigator.userAgent;
		  BrowserAlerts.isDemo = (document.location.href.indexOf('ie=true') > -1);
		  if(userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1 || userAgent.indexOf("Edge/") > -1){ 
			  return true;
		  }
		  return false;
		}
	}
};
