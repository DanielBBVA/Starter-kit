// ------------------------------ //
// ------------------------------ //
// BBVA Responsive Tabs           //
// ------------------------------ //

// Bootstrap tabs are not responsive out of the box. This JS snippet takes tabs that would normally start to wrap into a second row and collapses them into a dropdown menu.
// Adapted from: http://www.bootply.com/xvAx7qs67v

(function() {

    $.fn.tabCollapse = function(originalCount, resizing, naturalHeight) {

        var tabs = this,
            originalCount = originalCount;

        // Global variables
        var tabSection = {
            dropdown            : $(tabs).find('.collapsed'),
            dropdownParent      : $(tabs).find('.lastTab'),
            tabsHeight          : tabs.innerHeight(),
            targetTabsHeight    : naturalHeight,
            directChildren      : tabs.children('li:not(:last-child)'),
            childrenDisplay     : tabs.children('li:not(:last-child)').css('display'),
            count               : tabs.children('li:not(:last-child)').size(),
            resizing            : resizing,

            testTabHeight : function(){
                if (tabSection.tabsHeight > tabSection.targetTabsHeight || tabSection.resizing == 'narrower') {
                    // This means that tabs are flowing into multiple rows -- the window is too narrow to accomodate all tabs in one row
                    // The solution is to roll the overflow tabs into a dropdown menu
                    tabSection.prependTabsDropdown();
                    
                } else if (tabSection.resizing == 'wider') {
                    tabSection.prependTabsUL();
                }

            },

            prependTabsDropdown : function(){
                // This function loops until tabsHeight is < targetTabsHeight
                // Extra tabs are prepended to the dropdown menu

                // Reveal dropdown
                tabSection.dropdownParent.css('display', tabSection.childrenDisplay);

                for (var i = tabSection.count - 1; i >= 0; i--) {
                    tabSection.tabsHeight = tabs.innerHeight();
                    if (tabSection.tabsHeight > tabSection.targetTabsHeight) {
                        $(tabSection.directChildren[i]).prependTo(tabSection.dropdown);

                        if (i == 0) {
                            // All children are within the dropdown; add a special class for styling purposes
                            $(tabs).addClass('dropdown-only');
                        } else {
                            $(tabs).removeClass('dropdown-only');
                        }

                    } else {
                        if (tabSection.dropdown.children('li').size() == 0 && tabSection.dropdownParent.is(':visible')){
                            // If all children have been removed from the dropdown, hide it
                            $(tabSection.dropdownParent).css('display', 'none');
                        }
                        return;
                    }
                };
            },

            prependTabsUL : function(){
                // This function loops until all tabs that can fit on one line are visible
                // Extra tabs are prepended to ".nav-tabs" and removed from the the dropdown menu
                // If the dropdown menu is no longer needed, it is made invisible

                var dropdownChildren = tabSection.dropdown.children('li');

                // Are all tabs already visible? Then return, no need to check
                if (tabSection.count == originalCount) { 
                    if (dropdownChildren.size() == 0 && tabSection.dropdownParent.is(':visible')){
                        // If all children have been removed from the dropdown, hide it
                        tabSection.dropdownParent.css('display', 'none');
                    }
                    return;
                } else { 

                    var dropdownCount = dropdownChildren.size();

                    for (var i = 0; i < dropdownCount; i++) {
                        $(dropdownChildren[i]).insertBefore(tabSection.dropdownParent);
                        tabSection.tabsHeight = tabs.innerHeight();

                        if (i == (dropdownCount-1)){
                            // Only one dropdown item remaining
                            // Try hiding dropdown li to see if target height can be achieved
                            $(tabSection.dropdownParent).css('display', 'none');
                        }

                        if (tabSection.tabsHeight > tabSection.targetTabsHeight) {
                                // Adding this tab bumps the tabs to 2 lines, to add it back to the dropdown
                                $(dropdownChildren[i]).prependTo(tabSection.dropdown);

                                // Make sure dropdown li is showing
                                tabSection.dropdownParent.css('display', tabSection.childrenDisplay);

                            return false;
                        }
                    }

                    dropdownChildren = tabSection.dropdown.children('li');
                    dropdownCount = dropdownChildren.size();
                    if (dropdownCount == 0 && tabSection.dropdownParent.is(':visible')){
                        // If all children have been removed from the dropdown, hide it
                        $(tabSection.dropdownParent).css('display', 'none');
                    }

                    // Remove dropdown-only class if not all children are within the dropdown
                    if (dropdownCount > 1) {
                        $(tabs).removeClass('dropdown-only');
                    }

                }
            },

            init : function(){
                // Run the height test
                tabSection.testTabHeight();
            }
        }

        // Init()
        tabSection.init();
    }

    // ----------------------------------------------- //
      
    var getNaturalHeight = {

        checkTabVisibility : function(tabs) {
            // Check to see if tabs are visible or not;
            // If not visible, will not be able to get the natural height below without briefly revealing them.
            // We will need to reveal the whole invisible element in order to get the true height.
            var tabsVisible = $(tabs).is(':visible'),
                visibleParent = $(tabs),
                invisibleChild = false;     // The element in the DOM that is actually hidden, forcing the hiding of tabs

            if (!$(tabs).is(':visible')){
                // Not visible

                // First, find the highest parent that is still invisible
                // Also find its sibling so that we can reinsert it into the page at the correct spot
                while (!$(visibleParent).is(':visible')){
                    invisibleChild = visibleParent;
                    invisibleChild.data('sibling', $(invisibleChild).prev());
                    visibleParent = $(visibleParent).parent();
                }
            }
            return invisibleChild;
        },

        init : function(tabs) {
            var placeholder = '<li class="placeholder"><a href="#">Lorem</a></li>',
                invisibleChild,
                naturalHeight;

            // Check visibility of tabs/nav element
            // invisibleChild = getNaturalHeight.checkTabVisibility(tabs);

            // Get actual natural height of element by hiding children and adding in placeholder
            $(tabs).children().hide()
            $(tabs).append(placeholder);
            naturalHeight = $(tabs).innerHeight();
            $('.placeholder').remove();
            $(tabs).children().show();

            return naturalHeight;

        }
    }

    // ----------------------------------------------- //

    $(document).ready(function() {
        var previousWindowWidth = $(window).width(),
            $targetElement = $('.responsive-tabs'),
            dropdownText = "More",
            naturalHeight = 65, // Default for tabs
            invisibleTabContainer,
            invisibleShown = false; // Turns true if tabs are in an invisible container and it gets revealed
        
        // Initialize collapsing of tabs
        $targetElement.each(function(){
            var originalTabsCount = $(this).children().size(),
                tabs = $(this);

            // Check for visibility first
            invisibleTabContainer = getNaturalHeight.checkTabVisibility($(tabs));

            if (invisibleTabContainer){
                // Quickly show (and then later hide) the invisible parent to get appropriate tab height
                $('body').append(invisibleTabContainer);
                $(invisibleTabContainer).css('display', 'block');
            }

            // Get actual natural height of element by hiding children and adding in placeholder
            naturalHeight = getNaturalHeight.init($(tabs));

            // Get dropdown text data attribute, if it exists.
            // This will set what appears in the dropdown (i.e. "More" or "View Navigation")
            if ($(tabs).attr('data-dropdown-text')) { 
                dropdownText = $(tabs).attr('data-dropdown-text');
            }

            // Append the empty dropdown element
            // This will remain hidden until needed
            $(tabs).append('<li class="lastTab" style="display: none;"><a class="dropdown-toggle" data-toggle="dropdown" href="#">'+dropdownText+'<span class="caret"></span></a><ul class="dropdown-menu collapsed"></ul></li>');

            // Attach correct "natural height" of tabs as retrievable data
            $(tabs).data('naturalHeight', naturalHeight);

            // Run tabCollapse
            $(tabs).tabCollapse(originalTabsCount, false, naturalHeight);

            if (invisibleTabContainer){
                // Return the invisible parent to a hidden state
                $(invisibleTabContainer).css('display', '').insertAfter(invisibleTabContainer.data('sibling'));
            }
            
        }); // when document first loads

        // ----------------------------------------------- //

        // If a tab other than the first tab is being called through a hash in the URL,
        // make that tab open automatically on page load.
        // Current version of jQuery sanitizes the hash value.

        var url = window.location.hash;
        if (url.substring(url.indexOf("#")+1) && $('.nav-tabs')[0]) {
            // If there is a hash in the URL AND tabs on the page, run the hashCheck function.
            hashCheck();
        }

        // If the window hash changes, recheck
        if ("onhashchange" in window) {
            window.onhashchange = hashCheck;
        }

        function hashCheck() {
            // Get the link with the href that matches the url hash
            var url = window.location.hash,
                hash = url.substring(url.indexOf("#")+1),
                targetTab = $('a[href="#'+hash+'"]:first').parent();

            // Remove default active state
            $('.active').removeClass('active');
            $('.in').removeClass('in');

            // Make the targeted tab and tab content active
            $(targetTab).addClass('active');
            $('#'+hash).addClass('active in');
        }

        // ----------------------------------------------- //

        // Bug fix
        // This is only for Bootstrap tabs
        // Bootstrap bug where when tabs in a dropdown are clicked, "active" class is not properly removed
        $(document).on('hidden.bs.tab', function (e) {
            // If tab is not the currently open one AND the previously active tab is in the dropdown, remove the active class
            if ($(e.relatedTarget).attr('href') != $(e.target).attr('href') && $(e.target).parent().parent().hasClass('dropdown-menu')){
                $(e.target).parent().removeClass('active');
            }
        });

        // Parent dropdown <li> shows active class when one of its children are active
        $(document).on('shown.bs.tab', function (e) {
            // If tab is not the currently open one AND the previously active tab is in the dropdown, remove the active class
            if ($(e.target).parent().parent().hasClass('dropdown-menu')){
                $(e.target).parent().parent().parent().addClass('active');
            }
        });

        // --------------------------------------------------- //
        //  Situations where the tabs need to be recalculated  //
        // --------------------------------------------------- //
        // On resize, on mobile device orientation change, when an invisible parent element is shown

        function recalcTabs() {

            $targetElement.each(function(){
                var dropdown = $(this).find('.lastTab');

                // Dropdown should not have "active" class if the active tab moves out of the dropdown on resize
                if ($(dropdown).hasClass('active') && $(dropdown).find('li.active').length == 0){
                    $(dropdown).removeClass('active');
                }

                // Conversely, dropdown SHOULD have the "active" class if the active tab moves into the dropdown on resize
                if (!$(dropdown).hasClass('active') && $(dropdown).find('li.active').length != 0){
                    $(dropdown).addClass('active');
                }
            });
            
            // ----------------------------------------------- //

            if (previousWindowWidth > $(window).width()){
                $targetElement.each(function(){
                    var originalTabsCount = $(this).children().size();
                    $(this).tabCollapse(originalTabsCount, 'narrower', $(this).data('naturalHeight'));
                });
            } else {
                $targetElement.each(function(){
                    var originalTabsCount = $(this).children().size();
                    $(this).tabCollapse(originalTabsCount, 'wider', $(this).data('naturalHeight'));
                });
            }

            previousWindowWidth = $(window).width();
        }

        // On resize
        $(window).resize(function() {

            // Preventing this from happening on touch devices
            // Using Modernizr in global.js to detect.
            if (!$('.touchevents')[0] && !$('.mobile-device')[0]) {
                recalcTabs();
            }
                
        });

        // On touch device orientation change
        $(window).on('orientationchange', function(event) {
            recalcTabs();
        });

        // When an invisible container is revealed
        $(invisibleTabContainer).on('shown.bs.collapse', function () {
            if (invisibleShown){
                recalcTabs();
            }
        });
      
    });

})();

// ------------------------------ //
// END BBVA Responsive Tabs       //
// ------------------------------ //
// ------------------------------ //