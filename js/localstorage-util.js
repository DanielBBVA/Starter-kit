
/*
 * Utility functions for getting/setting cookies and HTML5 storage.
 * @author andrew.arant@bbva.com
 */

var LocalStorageUtil = LocalStorageUtil || {
	html5StorageEnabled : (localStorage != null && sessionStorage != null),
	cookiesEnabled : (navigator.cookieEnabled),
	/*
	 * Sets an item in local cache (uses cookies as default unless HTML5 storage is explicitly specified via {html5:true}).
	 * @param {string} itemName
	 * @param {string||object} itemValue
	 * @param {object} opts
	 * opts:
	 *   - cookie:boolean (indicates whether cookies should be used instead of HTML5 local storage - if both 'cookie' and 'html5' flags are absent, cookies are used by default)
	 *   - html5:boolean (indicates whether HTML5 storage should be used instead of cookies)
	 *   - daysToPersist:int (for cookie storage, indicates the number of days the cookies should persist. If absent or < 1, cookie will expire at end of session)
	 *   - persistent:boolean (for HTML5 storage, indicates whether the item should be placed in localStorage vs. sessionStorage)
	 *   - path:string (for cookie storage, indicates the 'path' attribute for the cookie)
	 *   - domain:string (for cookie storage, indicates the 'domain' attribute for the cookie)
	 */
	setCachedItem : function(itemName, itemValue, opts){
		var savedToCache = false;
		try{
			opts = opts || {};
			if(typeof(itemValue) == 'object'){
				itemValue = JSON.stringify(itemValue);
			}
			var useHtml5Storage = (LocalStorageUtil.html5StorageEnabled && (opts['html5']===true));
			var useCookies = ( (! useHtml5Storage) && LocalStorageUtil.cookiesEnabled );
			if( (!useHtml5Storage) && (!useCookies)){ // handles scenario where use of HTML5 storage is not explicitly specified AND cookies are disabled.
				if(LocalStorageUtil.cookiesEnabled){useCookies=true;}
				else if(LocalStorageUtil.html5StorageEnabled){useHtml5Storage=true;}
			}
			if(useHtml5Storage){
				var persistent = (opts['persistent']===true);
				if(persistent){ localStorage.setItem(itemName,itemValue); }
				else{ sessionStorage.setItem(itemName,itemValue); }
				savedToCache = true;
			}
			else if(useCookies){
				var expires='',path='',domain='';
				if(opts['daysToPersist']){
					var date = new Date();
					date.setTime(date.getTime()+(parseInt(opts['daysToPersist'])*24*60*60*1000));
					expires='; expires='+date.toGMTString();
				}
				path = (opts['path']) ? "; path="+opts['path'] : "; path=/";
				domain = (opts['domain']) ? "; domain="+opts['domain'] : "; domain="+document.domain;
				document.cookie = itemName+'='+itemValue+expires+path+domain;
				savedToCache = true;
			}
		}
		catch(err){_log(err);}
		return savedToCache;
	},
	/* 
	 * Gets an item from local cached (HTML5 or cookies). If the item is a JSON string, it's parsed into an object.
	 * @param {string} itemName
	 */
	getCachedItem : function(itemName){
		var cachedItem = null;
		try{
			cachedItem = sessionStorage.getItem(itemName);
			if(! cachedItem){
				cachedItem = localStorage.getItem(itemName);
			}
			if(! cachedItem){
				cachedItem = LocalStorageUtil.getCookie(itemName);
			}
			if(cachedItem && cachedItem.length > 0 && (cachedItem.indexOf("{") > -1 || cachedItem.indexOf("[") > -1) ){
				try{
					cachedItem = JSON.parse(cachedItem);
				}
				catch(err){}
			}
		}
		catch(err){_log(err);}
		return cachedItem;
	},
	/* 
	 * Delete an item from HTML5 storage and/or cookies.   
	 * @param {string} itemName
	 * opts:
	 *   - path:string (for cookie storage, indicates the 'path' attribute for the cookie)
	 *   - domain:string (for cookie storage, indicates the 'domain' attribute for the cookie)
	 */
	deleteCachedItem : function(itemName,opts){
		var itemDeleted = false;
		opts = opts || {};
		try{
			if(LocalStorageUtil.html5StorageEnabled){
				localStorage.removeItem(itemName);
				sessionStorage.removeItem(itemName);
				itemDeleted = true;
			}
			if(LocalStorageUtil.cookiesEnabled){
				var path = (opts['path']) ? "; path="+opts['path'] : "; path=/";
				var domain = (opts['domain']) ? "; domain="+opts['domain'] : "; domain="+document.domain;
				LocalStorageUtil.setCachedItem(itemName,'',{'daysToPersist':-1,'path':path,'domain':domain,'cookie':true});
				itemDeleted = true;
			}
		}
		catch(err){_log(err);}
		return itemDeleted;
	},
	/*
	 * Gets the value of a cookie.
	 * @param {string} cookieName
	 */
	getCookie : function(cookieName){
		if(! LocalStorageUtil.cookiesEnabled){return false;}
		var name = cookieName + "=";
		var cookies = document.cookie.split(';');
		var cookieValue=null;
		for(var i=0,ii=cookies.length; i<ii; i++) {
			var cookie = cookies[i];
			while (cookie.charAt(0)==' ') {
				cookie = cookie.substring(1);
			}
			if (cookie.indexOf(name) == 0) {
				cookieValue = cookie.substring(name.length,cookie.length);
				break;
			}
		}
		return cookieValue;
	}
};

var _log = _log || function(obj){ if(typeof(console) != 'undefined'){console.log(obj);}}
