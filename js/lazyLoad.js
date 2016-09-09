function lazyLoadImages() {
	var img = $('.lazy-load');
	var screenHeight = window.innerHeight || document.documentElement.clientHeight || getElementsByTagName('body')[0].clientHeight;

	$(window).on('scroll', function() {
		//img.each(function() {
			var top = img.offset().top,
				 src = img.data('src');

			var bottom = top + img.height();

			if ($(document).scrollTop() > top ) {

			}
			
		//});
		
		console.log('screenHeight: ' + screenHeight);
		console.log('img.top: ' + top);
		console.log('img.bottom: ' + bottom);
		console.log('scrollTop: ' + $(document).scrollTop());
		console.log('___________________________________');
		//console.log(img);
	});
}


(function lazyImg() {
	$('img.lazy-load').each(function() {
		var src = $(this).data('src');
		$(this).attr('src', src);
		$(this).one('load', function(event) {
			if (this.complete) {
				$(this).removeAttr('data-src');
			}
		});
	});
})();