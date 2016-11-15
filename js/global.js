
/*
 * Included on all .com webite pages to enhance basic page functionality.
 * @dependency - jquery
 * @dependency - jquery.sidr.min.js
 * @dependency - localstorage-util.js
 * @dependency - url-params.js
 * @dependency - olb-login.js
 * @author katherine.mcgonigle@bbva.com 
 * @author andrew.arant@bbva.com
 */
 
var BasePage = {
	
	mobileNav : {
		init : function(){
			  $('#responsive-menu-button').sidr({ // initialize sidr (i.e. hamburger menu)
				  name: 'sidr-main',
				  source: '#navigation',
				  side: 'left',
				  onOpen: function() {
					// On Open, Move Secondary Nav to be a child of the active <li>
					$('.sidr-class-primary-nav > .sidr-class-active').append($('.sidr-class-secondary-nav'));

					// Search Form Also needs to be moved outside of Secondary Nav
					$('.sidr-class-main-nav').append($('.sidr-class-form-wrapper'));

					// Change order of Search Input button, placing it before the text input field
			  		$('#sidr-id-searchform input[type=submit]').prependTo('#sidr-id-searchform');
				  },
				  onCloseEnd: function() {
					// On Close, Move Secondary Nav and Search Form back to original position
					$('.sidr-inner').append($('.sidr-class-secondary-nav'));
					$('.sidr-class-secondary-nav .sidr-class-container').append($('.sidr-class-form-wrapper'));
				  }
		      });

			  // Add Placeholder text
			  $('#sidr-id-searchform #sidr-id-q').attr("placeholder","Search bbvacompass.com");

			  // Aesthetic Only
			  // When Sidr Mobile Menu is open, and user focuses on search input field, give the parent form a yellow bottom border
			  $('#sidr-id-search').bind('focus', function(){
					$(this).parent().addClass('active');
			  });
			  $('#sidr-id-search').bind('focusout', function(){
					$(this).parent().removeClass('active');
			  });
		}
	},

	searchBar : {
		containerWidth 	: $('.container').outerWidth() - 30, // Subtracting total of Bootstrap margin, 15px on either side
		triggerElem 	: $('.search-trigger'),
		parent 			: $('.form-wrapper'),
		secondaryNav 	: $('.secondary-nav ul'),
		inputField 		: $('.form-wrapper input[type="text"]'),
		fadeSpeed 		: 150,
		searchHeight	: "71px",
		animationSpeed 	: 700,
		isOpen : false,
		show : function(){
				$(BasePage.searchBar.secondaryNav).fadeOut(BasePage.searchBar.fadeSpeed);

				$(BasePage.searchBar.parent).stop().delay(BasePage.searchBar.fadeSpeed).css({'display': 'block', 'height': BasePage.searchBar.searchHeight, 'overflow': 'hidden'}).animate({
					width: BasePage.searchBar.containerWidth
				}, BasePage.searchBar.animationSpeed, 'swing', function(){
					$('.search-close-left').removeClass('search-close-left-outro').addClass('search-close-left-intro');
					$('.search-close-right').removeClass('search-close-right-outro').addClass('search-close-right-intro');

					// Allowing for searchbar overflow (autocorrect dropdown)
					$(BasePage.searchBar.parent).css({'height': 'auto', 'overflow': 'visible'});

					$(BasePage.searchBar.inputField).focus();
					BasePage.searchBar.isOpen = true;
				});
		},
		hide : function(){
			$('.search-close-left').removeClass('search-close-left-intro').addClass('search-close-left-outro');
	        $('.search-close-right').removeClass('search-close-right-intro').addClass('search-close-right-outro');

	        if (BasePage.searchBar.isOpen) {
	            $(BasePage.searchBar.parent).stop().delay(BasePage.searchBar.fadeSpeed).css({'height': BasePage.searchBar.searchHeight, 'overflow': 'hidden'}).animate({
	                width: 0
	            }, BasePage.searchBar.animationSpeed, 'swing', function(){
	                $(BasePage.searchBar.secondaryNav).fadeIn(BasePage.searchBar.fadeSpeed);
	                BasePage.searchBar.isOpen = false;

	        		$(BasePage.searchBar.parent).css({'display': 'none'});
	            });
	        }
		},
		init : function(){
			// Hide close button initially
			$('.search-close-left').addClass('search-close-left-outro');
			$('.search-close-right').addClass('search-close-right-outro');

			// Setup to open search bar when search icon is clicked
			$(BasePage.searchBar.triggerElem).on('click', BasePage.searchBar.show);

			// Close search bar if "X" button is clicked
			$('.search-close').on('click', function () {
				BasePage.searchBar.hide();
			});

			// Change order of Search Input button, placing it before the text input field
			$('#searchform input[type=submit]').prependTo('#searchform');

			// Add Placeholder text
			$('#searchform #q').attr("placeholder","Search bbvacompass.com");

		}
	},

	selectField : {
		init : function () {
			// Aesthetic only
			// On pages with "select" dropdown form fields, init Select2
			var deviceAgent = navigator.userAgent.toLowerCase(),
				isTouchDevice = false;

			if (Modernizr.touch ||
				deviceAgent.match(/(iphone|ipod|ipad)/) ||
				deviceAgent.match(/(android)/)  ||
				deviceAgent.match(/(iemobile)/) ||
				deviceAgent.match(/iphone/i) ||
				deviceAgent.match(/ipad/i) ||
				deviceAgent.match(/ipod/i) ||
				deviceAgent.match(/blackberry/i) ||
				deviceAgent.match(/bada/i)) {
					isTouchDevice = true;
			}

			if (!isTouchDevice){ console.debug('touch device');
				// We only want the stylized select2 boxes on non-touch devices
	            $("select").select2({
	            	// Hiding the search box within the select field
	            	minimumResultsForSearch: Infinity,
	            	// Allowing the select box to take on 100% width of its container
	            	// Default width without this setting is 100px
	            	width: '100%'
	            });
			}
		}
	},

	responsiveTables : {
		init : function() {
			//responsive table
			var headertext = [];
			var headers = document.querySelectorAll("thead");
			var tablebody = document.querySelectorAll("tbody");

			for (var i = 0; i < headers.length; i++) {
			    headertext[i]=[];
			    for (var j = 0, headrow; headrow = headers[i].rows[0].cells[j]; j++) {
			      var current = headrow;
			      headertext[i].push(current.textContent);
			      }
			}

			for (var h = 0, tbody; tbody = tablebody[h]; h++) {
			    for (var i = 0, row; row = tbody.rows[i]; i++) {
			      for (var j = 0, col; col = row.cells[j]; j++) {
			      	if (typeof headertext[h] != 'undefined'){
			      		col.setAttribute("data-th", headertext[h][j]);
			      	}
			      }
			    }
			}
		}
	},

	onWindowResize : function(){
	    var containerW = $('.container').outerWidth();
		if (BasePage.searchBar.isOpen) {
			// If the Search field is open, we'll need to reposition it
			$(BasePage.searchBar.parent).css('width', containerW);
		}
		var windowWidth = $(window).width();
		if (windowWidth < 1200 && !$('#header-sign-in-mobile .sign-in-wrapper')[0]){
			// If resizing the window under 1200px AND header sign-in hasn't been moved to its mobile position,
			// Append it to the mobile container element
	    	$('#header-sign-in-mobile').append($('#header-sign-in .sign-in-wrapper'));
	    } else if (windowWidth >= 1200 && !$('#header-sign-in .sign-in-wrapper')[0]) {
	    	// If resizing the window over 1200px AND header sign-in hasn't been moved to its desktop position,
			// Append it to the desktop container element
	    	$('#header-sign-in').append($('#header-sign-in-mobile .sign-in-wrapper'));
	    }

	    // If we have a short page, the footer may not extend to the bottom of the page.
		// Check the page content height against the window height
		var windowHeight = $(window).height();
		if (windowHeight > $('body').height()){
			BasePage.footerSetHeight(windowHeight, $('body').height());
		} else {
			// Footer height might need to be adjusted, so remove the explicit height style to get the true footer height
			$('body > footer').css('height', 'auto');

			if (windowHeight > $('body').height()){
				BasePage.footerSetHeight(windowHeight, $('body').height());
			}
		}
	},

	footerSetHeight : function(windowHeight, bodyHeight) {
		// The window is taller than the page content, so extend the footer to touch the bottom of the window.
		// Otherwise, a strip of white space will appear underneath the footer.

		var heightDifference = windowHeight - bodyHeight,
			footerHeight = $('body > footer').outerHeight();

		$('body > footer').css('height', footerHeight+heightDifference);
	},

	init : function(){
		// Mobile menu toggle
	    // Move Sign-in into main nav if browser is >= 1200 px wide
	    if ($(window).width() >= 1200){
	    	$('#header-sign-in').append($('#header-sign-in-mobile .sign-in-wrapper'));
	    }
	    // If there is a Maintenance Message, .sign-in-bg needs to be adjusted
	    if ($('.maintenance-notice-toggle')[0]){
	    	$('.sign-in-bg').addClass('maintenance-notice-toggle-adjust');
	    }
		// On Resize, get container size
		$(window).on('resize', BasePage.onWindowResize);

		// If we have a short page, the footer may not extend to the bottom of the page.
		// Check the page content height against the window height
		if ($(window).height() > $('body').height()){
			BasePage.footerSetHeight($(window).height(), $('body').height());
		}

		// Checking for touch device capability
		/*! modernizr 3.3.1 (Custom Build) | MIT *
		* https://modernizr.com/download/?-touchevents-setclasses !*/
		!function(e,n,t){function o(e,n){return typeof e===n}function s(){var e,n,t,s,a,i,r;for(var l in c)if(c.hasOwnProperty(l)){if(e=[],n=c[l],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(t=0;t<n.options.aliases.length;t++)e.push(n.options.aliases[t].toLowerCase());for(s=o(n.fn,"function")?n.fn():n.fn,a=0;a<e.length;a++)i=e[a],r=i.split("."),1===r.length?Modernizr[r[0]]=s:(!Modernizr[r[0]]||Modernizr[r[0]]instanceof Boolean||(Modernizr[r[0]]=new Boolean(Modernizr[r[0]])),Modernizr[r[0]][r[1]]=s),f.push((s?"":"no-")+r.join("-"))}}function a(e){var n=u.className,t=Modernizr._config.classPrefix||"";if(p&&(n=n.baseVal),Modernizr._config.enableJSClass){var o=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");n=n.replace(o,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(n+=" "+t+e.join(" "+t),p?u.className.baseVal=n:u.className=n)}function i(){return"function"!=typeof n.createElement?n.createElement(arguments[0]):p?n.createElementNS.call(n,"http://www.w3.org/2000/svg",arguments[0]):n.createElement.apply(n,arguments)}function r(){var e=n.body;return e||(e=i(p?"svg":"body"),e.fake=!0),e}function l(e,t,o,s){var a,l,f,c,d="modernizr",p=i("div"),h=r();if(parseInt(o,10))for(;o--;)f=i("div"),f.id=s?s[o]:d+(o+1),p.appendChild(f);return a=i("style"),a.type="text/css",a.id="s"+d,(h.fake?h:p).appendChild(a),h.appendChild(p),a.styleSheet?a.styleSheet.cssText=e:a.appendChild(n.createTextNode(e)),p.id=d,h.fake&&(h.style.background="",h.style.overflow="hidden",c=u.style.overflow,u.style.overflow="hidden",u.appendChild(h)),l=t(p,e),h.fake?(h.parentNode.removeChild(h),u.style.overflow=c,u.offsetHeight):p.parentNode.removeChild(p),!!l}var f=[],c=[],d={_version:"3.3.1",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var t=this;setTimeout(function(){n(t[e])},0)},addTest:function(e,n,t){c.push({name:e,fn:n,options:t})},addAsyncTest:function(e){c.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=d,Modernizr=new Modernizr;var u=n.documentElement,p="svg"===u.nodeName.toLowerCase(),h=d._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):["",""];d._prefixes=h;var m=d.testStyles=l;Modernizr.addTest("touchevents",function(){var t;if("ontouchstart"in e||e.DocumentTouch&&n instanceof DocumentTouch)t=!0;else{var o=["@media (",h.join("touch-enabled),("),"heartz",")","{#modernizr{top:9px;position:absolute}}"].join("");m(o,function(e){t=9===e.offsetTop})}return t}),s(),a(f),delete d.addTest,delete d.addAsyncTest;for(var v=0;v<Modernizr._q.length;v++)Modernizr._q[v]();e.Modernizr=Modernizr}(window,document);

		// Aesthetic only
		// On pages with "select" dropdown form fields, init Select2
		// City/State Selector inits Select2 at the appropriate place within its code; no need to init twice
		if ($("select")[0] && !$('#chooseRegionState')[0]){
            BasePage.selectField.init();
        }

        // Responsive tables
        // Table columns collapse into single cells on narrow resolutions
        BasePage.responsiveTables.init();

        // Circular images (profile images) on Officer Pages and Blog Pages (for Author image) use the object-fit property
        // This initializes a polyfill for browsers that do not natively support object-fit.
        if ($('.profile-img')[0]){objectFitImages();}
	}
}


$(document).ready( function(){
	BasePage.searchBar.init();
	BasePage.init();
	//BrowserAlerts.init({delay:1000});
	if(typeof(ChooseRegion) !== 'undefined'){ // If the page contains region-specific content, initialize the choose-region form.
		ChooseRegion.requestedPage = document.location.href;
		ChooseRegion.init();
	}
});

BasePage.mobileNav.init(); // Initialize Mobile Navigation (i.e. hamburger menu)
//OlbRememberMe.init(); // Initialize "Remember my username" for OLB login
//UrlParams.initParamHandlers(UrlParams.paramHandlers.basePage);
