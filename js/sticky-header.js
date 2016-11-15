/* Feedify v1.1.2 by Sarah Dayan | https://sarahdayan.github.io/feedify */

(function ($) {

  $.fn.feedify = function(options) {

    var feedify = this;
    var settings = $.extend({
      container: $(window),
      offset: 0
    }, options);

    settings.container.bind('scroll touchmove load resize', function(e) {

      feedify.children('.feedify-item').each(function() {
        var itemHeader       = $(this).find('.feedify-item-header');
        var itemBody         = $(this).find('.feedify-item-body');
        var itemHeaderHeight = itemHeader.outerHeight();
        var viewportOffset   = $(this).offset().top - settings.container.scrollTop() + settings.offset;
        var switchPoint      = '-' + ($(this).height() - itemHeaderHeight - settings.offset);

        if (viewportOffset < 0) {
          if (viewportOffset > switchPoint ? true : false) {
            $(this).addClass('fixed').removeClass('bottom');
            $('#sticky-header').show({
              duration: 500,
              easing: 'easeInOutQuad'}).css({
              "display": "block !important"
            });
            $('.feedify-item-header').css("border-bottom","2px solid #ededed");
          } else {
            $(this).removeClass('fixed').addClass('bottom');
          }
          itemBody.css('paddingTop', itemHeaderHeight);
          itemHeader.css('width', feedify.width());
          return;
        } else if (viewportOffset > 0) {
          $('#sticky-header').fadeOut({
            duration: 400,
            easing: 'easeInOutQuad'});
            $('.feedify-item-header').css("border-bottom","none");
        }
        $(this).removeClass('fixed').removeClass('bottom');
        itemBody.css('paddingTop', '0');
        itemHeader.css('width', 'auto');
      });

    });

  };

}(jQuery));

$(function() {
  $('.feedify').feedify();
});

/////////// Trigger Section

/*$(document).ready(function () {

    var $window = $(window);
    var $section1 = $('#section-1-header');
    var endzone = $('#section-1').offset().top;
     $window.on('scroll resize', function () {

      if (endzone < $window.scrollTop() ) {
        $section1.show({
          duration: 600,
          easing: 'easeInOutQuad'});
          //$section1.css('-webkit-transform', 'translateZ(0)');
      } else {
        $section1.fadeOut({
          duration: 400,
          easing: 'easeInOutQuad'});
      }
      //console.log("section 1 " + endzone);
      //console.log("Sticky Header " + ($section1.position().top));
      //console.log($window.scrollTop());
      //console.log(endzone);
     });
}); */
