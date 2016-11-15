/*
 * This script handles 1) prompting the user to select their banking region (if the region is currently not set) 2) populating the city dropdown
 * according to the selected state 3) setting the region cookie 4) refreshing the page via form submit or redirect once the region cookie is set.
 * @dependency - jquery
 * @dependency - localstorage-util.js
 * @author andrew.arant@bbva.com
 */
 
var ChooseRegion = {

	requestedPage : null, // URL of the page being requested
	regionCookieName : 'customerRegion',
	regions : { // This object contains the values that populate the city selection dropdown
		       "AL":[
			            {"label":"Birmingham","value":"AL.Birmingham"},
					    {"label":"Mobile","value":"AL.Mobile"},
					    {"label":"Montgomery","value":"AL.Montgomery"},
					    {"label":"Huntsville","value":"AL.Huntsville"},
					    {"label":"Other Alabama","value":"AL.Other"}
			        ],
			   "AZ":[
			            {"label":"Phoenix","value":"AZ.Phoenix"},
					    {"label":"Tucson","value":"AZ.Tucson"},
					    {"label":"Other","value":"AZ.Other"}
					],
			   "CO":[
			            {"label":"Not needed, click Update","value":"CO"}
					],
			   "CA":[
			            {"label":"Southern California","value":"CA.Southern"},
						{"label":"Northern California","value":"CA.Northern"},
						{"label":"San Diego","value":"CA.San_Diego"}
					],
			   "FL":[
			            {"label":"Ft. Walton","value":"FL.Panhandle"},
						{"label":"Jacksonville","value":"FL.Jacksonville"},
						{"label":"Gainesville/Ocala","value":"FL.Gainesville"},
						{"label":"Pensacola","value":"FL.Pensacola"}
					],
			   "NM":[
			            {"label":"Albuquerque","value":"NM.Albuquerque"},
						{"label":"South New Mexico","value":"NM.South"}
					],
			   "TX":[
			            {"label":"Austin","value":"TX.Austin"},
						{"label":"Bryan/College Station","value":"TX.College_Station"},
						{"label":"Dallas/Ft. Worth","value":"TX.Dallas"},
						{"label":"El Paso","value":"TX.El_Paso"},
						{"label":"Houston","value":"TX.Houston"},
						{"label":"Laredo","value":"TX.Laredo"},
						{"label":"San Antonio","value":"TX.San_Antonio"},
						{"label":"Waco","value":"TX.Waco"},
						{"label":"Central Texas","value":"TX.Central"},
						{"label":"East Texas","value":"TX.East"},
						{"label":"West Texas","value":"TX.West"},
						{"label":"South Texas","value":"TX.South"}
					],
			   "NonFootprint":[
			            {"label":"Not needed, click Update","value":"NonFootprint"}
			        ]
	},
	
	/*
	 * Sets the customer region (i.e. the value that's set in the user's region cookie)
	 */
	chooseCity : function(){
		$('#customerRegion').val( $('#chooseRegionCity').val() );
	},
    
	/*
	 * Populates the city dropdown according to the selected state.
	 * @param {string} state
	 */
	populateCityDropdown : function(state){
		ChooseRegion.errorMsg(false);
		var state = $('#chooseRegionState')[0].options[$('#chooseRegionState')[0].selectedIndex].value;
		if(state.length === 0){
			ChooseRegion.enableCityDropdown(false);
			$('#customerRegion')[0].value = '';
			$('#chooseRegionCity')[0].options[0] = new Option("Choose Your City","");
			return;
		}
		var citySelect = $('#chooseRegionCity')[0];
		citySelect.options.length = 0;
		for(var i=0; i<ChooseRegion.regions[state].length; i++){
			citySelect.options[i] = new Option(ChooseRegion.regions[state][i]['label'],ChooseRegion.regions[state][i]['value']);
		}
		ChooseRegion.enableCityDropdown(true);
		ChooseRegion.chooseCity();
	},

	/*
	 * Enables/disables the city selection dropdown.
	 * @param {boolean} enable
	 */
	enableCityDropdown : function(enable){
		var cityDropdown = $('#chooseRegionCity');
		if(enable){
			cityDropdown.attr('disabled',false);
			cityDropdown.css('background','#FFFFFF');
		}
		else{
			cityDropdown[0].options.length = 0;
			cityDropdown[0].options[0] = new Option("Choose Your City","");
			cityDropdown.attr('disabled',true);
			cityDropdown.css('background','#EEEEEE');
			$('#customerRegion').val('');
		}
	},
    
	/*
	 * Pre-selects the city/state dropdown according to the region value gleaned from cookies.
	 * @param {string} state
	 */
	preselectRegion : function(region){
		 var city;
		 var state;
		 if(region.indexOf('.') === -1){
			 state = region;
			 city = 'none';
		 }
		 else{
		     state = region.substring(0,region.indexOf('.'));
		 }
		 var drop = $('#chooseRegionState');
		 drop.val(state);
		 ChooseRegion.populateCityDropdown(state);
		 ChooseRegion.enableCityDropdown(true);
		 if(city != 'none'){
		 	 drop = $('#chooseRegionCity');
			 drop.val(region);
		 }
		 $('#customerRegion').val(region);
	},

	getRegionFromCookie : function(){
		var cookie = LocalStorageUtil.getCachedItem(ChooseRegion.regionCookieName);
		return cookie;
	},
    
	/*
	 * Show/hide an error message for the form.
	 * @param {boolean} show
	 * @param {string} msg
	 */
	errorMsg : function(show,msg){
		if(msg){
			$('#choose-region-error').html(msg);
		}
	    if(show){
		    $('#choose-region-error').css('display','block');
		}
		else{
			$('#choose-region-error').css('display','none');
		}
	},
	
	validateForm : function(){
		return ($('#customerRegion').val().length > 1);
	},
	
	showModal : function(show){
		if(show){ $('#chooseRegionModal').modal('show'); }
	},

	doSubmit : function(){
		if(! ChooseRegion.validateForm()){
			 ChooseRegion.errorMsg(true);
		}
		else{
			// MUST be set as a cookie (i.e. NOT in local storage) b/c it will be read server-side.
			LocalStorageUtil.setCachedItem(ChooseRegion.regionCookieName,$("#customerRegion").val(),{path:'/',cookie:true,daysToPersist:30});
			if(null != ChooseRegion.requestedPage){
				var regionFromCookie = ChooseRegion.getRegionFromCookie();
				if(null !== regionFromCookie && regionFromCookie.length > 0){ // If region value is in cookies, refresh the page via redirect (b/c it doesn't need to be present as a URL param if it can be gleaned server-side via cookies).
					window.location = ChooseRegion.requestedPage;
					return false;
				}
			}
			$("#chooseRegionSubmissionForm").submit(); // If region value is NOT in cookies or the "requestedPage" var isn't set, do page refresh via form submit (so that the region value will be present as a querystring param and can be gleaned by server-side code via that instead of cookies).
		}
		return false;
	},

	init : function(){
		var regionFromCookie = ChooseRegion.getRegionFromCookie();
		if(regionFromCookie && regionFromCookie.length > 0){
		    ChooseRegion.preselectRegion(regionFromCookie);
		}
		else{ ChooseRegion.showModal(true); }
		$('#chooseRegionState').on('change',ChooseRegion.populateCityDropdown);
		$('#chooseRegionCity').on('change',ChooseRegion.chooseCity);

		// Using the "Select2" JS library to be able to style select form fields
		// Initializing Select2 on the page:
		$(document).ready( function(){
			BasePage.selectField.init();
  //           $("select").select2({
  //           	// Hiding the search box within the select field
  //           	minimumResultsForSearch: Infinity,
  //           	// Allowing the select box to take on 100% width of its container
  //           	// Default width without this setting is 100px
  //           	width: '100%'
  //           });
        });
	}
}

var _log = _log || function(obj){ if(typeof(console) != 'undefined'){console.log(obj);}}