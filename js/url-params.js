
/*
 * Utility functions for getting/setting querystring params.
 * Handler functions for querystring params that need to have custom code executed when the param is present on the URL or in client cache.
 * @dependency - jquery
 * @dependency - localstorage-util.js
 * @author - andrew.arant@bbva.com
 */

var UrlParams = {

	patterns : {
		oaoApplicationUrl : 'online.bbvacompass.com/apply',
		oaoShoppingCartUrl : '/oao/'
	},

	/*
	 * Params that, if present on the URL or in local cache, have their corresponding "onParamPresent" function called at page load time.
	 */
	paramHandlers : {
		basePage : { // Applies to all website pages.
			'pbid' : { // Corresponds to the URL param name on the requested URL.
				/*
				 * Called when the target param is found on the URL or in client cache.
				 * @param {string} paramValue
				 */
				onParamPresent : function(paramValue){
					UrlParams.addOAOApplicationParams({'oaoPro':'pb'+paramValue});
				}
			},
			'ssot' : {
				onParamPresent : function(paramValue){
					var source = UrlParams.get('source') || LocalStorageUtil.getCachedItem('source') || '';
					var platform = UrlParams.get('platform') || LocalStorageUtil.getCachedItem('platform') || '';
					var params = { 'oneTimeToken' : paramValue, 'source' : source, 'platform' : platform };
					UrlParams.addOAOApplicationParams(params);
				}
			},
			'source' : {
				dependency : ['ssot'], // only append/persist this param if the dependency params are also present (i.e. it should appear as part of a group, if it doesn't ignore it)
				onParamPresent : function(paramValue){
					// since carryover of this param should only be done if it's present with the 'ssot' param, the handler code is part of the 'ssot' param's handler
				}
			},
			'platform' : {
				dependency : ['ssot'], // only append/persist this param if the dependency params are also present (i.e. it should appear as part of a group, if it doesn't ignore it)
				onParamPresent : function(paramValue){
					// since carryover of this param should only be done if it's present with the 'ssot' param, the handler code is part of the 'ssot' param's handler
				}
			},
			'oaoPro' : {
				onParamPresent : function(paramValue){
					UrlParams.addOAOApplicationParams({'oaoPro':paramValue});
				}
			}
		}
	},

	/*
	 * Appends a querystring param to all links in the page pointing to the OAO application.
	 * @param {string} paramName
	 * @param {string} paramNValue
	 * @param {object} opts
	 */
	addOAOApplicationParams : function(params, opts){
		opts = opts || {};
		UrlParams.addParamsToPageLinks('a[href*="'+UrlParams.patterns.oaoApplicationUrl+'"]',params,opts);
	},

	/*
	 * Appends a querystring param to all links in the page pointing to the OAO shopping cart.
	 * @param {string} paramName
	 * @param {string} paramNValue
	 * @param {object} opts
	 */
	addOAOShoppingCartParams : function(params, opts){
		opts = opts || {};
		UrlParams.addParamsToPageLinks('a[href*="'+UrlParams.patterns.oaoShoppingCartUrl+'"]',params,opts);
	},

	/*
	 * Appends a querystring param to all links in the page that match the anchor tag selector.
	 * @param {string} anchorTagSelector
	 * @param {string} paramName
	 * @param {string} paramNValue
	 * @param {object} opts
	 *   - opts{'filter'} : A comma separated list of strings. If specified, the param will only be appended to the link URL if the value of a filter is found within the href attribute of a link. Ex. to append to only OAO checking OR savings links {filter:'checking,savings'}
	 */
	addParamsToPageLinks : function(anchorTagSelector, params, opts){
		opts = opts || {};
		$(anchorTagSelector).each(function(index, element) {
			var lnk = $(this);
			var href = lnk.attr('href');
			if(opts['filter']){
				var filters = opts['filter'];
				for(var i=0,ii=filters.length; i<ii; i++){
					if(href.indexOf(filters[i]) > -1){
						var paramKeys = Object.keys(params);
						for(var j=0,jj=paramKeys.length; j<jj; j++){
							href = UrlParams.set(paramKeys[j],params[paramKeys[j]],href);
						}
						lnk.attr('href',href);
						break;
					}
				}
			}
			else{
				var paramKeys = Object.keys(params);
				for(var i=0,ii=paramKeys.length; i<ii; i++){
					href = UrlParams.set(paramKeys[i],params[paramKeys[i]],href);
				}
				lnk.attr('href',href);
			}
		});
	},

	/*
	 * Called upon page load.
	 * Loops through each param in the "paramHandlers" object, and if found on the URL OR in client cache,  calls the param's "onParamPresent" function.
	 * @param {object} pageGroupTarget - i.e. the object within the paramHandlers object that contains the params we want to target. Ex. UrlParams.paramHandlers.basePage
	 */
	initParamHandlers : function(pageGroupTarget){
		if(null == pageGroupTarget){return false;}
		var params = Object.keys(pageGroupTarget);
		if(params && params.length > 0){
			for(var i=0,ii=params.length; i<ii; i++){
				var param = params[i];
				var cacheName = params[i];
				var hasDependentParams = (pageGroupTarget[param]['dependency'] && pageGroupTarget[param]['dependency'].length > 0);
				var dependentParamsPresent = true;
				if(hasDependentParams){
					for(var j=0,jj=pageGroupTarget[param]['dependency'].length; j<jj; j++){
						var dependencyFromUrl = UrlParams.get(pageGroupTarget[param]['dependency'][j]);
						var dependencyFromCache = LocalStorageUtil.getCachedItem(pageGroupTarget[param]['dependency'][j]);
						if( (! (dependencyFromUrl && dependencyFromUrl.length > 0) ) || (! (dependencyFromCache && dependencyFromCache.length > 0))){
							dependentParamsPresent = false;
						}
					}
					if(! dependentParamsPresent){ continue; }
				}
				var paramOnUrl = UrlParams.get(param);
				if(paramOnUrl){
					LocalStorageUtil.setCachedItem(cacheName,paramOnUrl,{cookie:true});
					pageGroupTarget[param].onParamPresent(paramOnUrl);
				}
				else{
					var paramInCache = LocalStorageUtil.getCachedItem(cacheName);
					if(paramInCache){
						pageGroupTarget[param].onParamPresent(paramInCache);
					}
				}
			}
		}
	},

	/*
	 * Gets the value of a querystring param from the URL.
	 * @param {string} paramName
	 * @param {string} url
	 */
	get : function(paramName, url){
		url = url || document.URL;
		paramName = paramName.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + paramName + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent( (results[2].replace(/\+/g, " ")) ).replace(/[^a-zA-Z0-9\_\-\,\/\=\.]/g,'');
	},

	/*
	 * Removes a querystring param on the URL string
	 * @param {string} paramName
	 * @param {string} url
	 */
	remove : function(paramName, url) {
		url = url || document.URL;
		paramName = paramName.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + paramName + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		return url.replace(results[0], '');
	},

	/* 
	 * Sets a querystring param on a URL string. If the parameter already
	 * exists, then the parameter will be removed and reset with the new value.
	 * @param {string} paramName
	 * @param {string} paramValue
	 * @param {string} url
	 */
	set : function(paramName, paramValue, url){
		url = url || document.URL;
		var prefixChar = (url.indexOf('?') > -1) ? '&' : '?';
		if(url.indexOf(paramName+"=")  === -1){ // don't set the param if it's already present
			url =  (url + prefixChar + paramName + '=' + encodeURIComponent(paramValue));
		} else {
			url = this.remove(paramName, url);
			return this.set(paramName, paramValue, url);
		}
		return url;
	}

}
