function lazyLoadImages() {
	var screenHeight = window.innerHeight || document.documentElement.clientHeight || getElementsByTagName('body')[0].clientHeight;


	$(window).on('scroll.percents', function() {
		if ($(this).scrollTop() > when) {
			crazyPercentsCounters();
			$(window).off('scroll.percents');
		}
	});
}


function initCounter() {
	var sectionWithCounters = $('.rating');
	var topPos = sectionWithCounters.offset().top + 30;

	

	if (sectionWithCounters.offset().top < screenHeight) {
		crazyPercentsCounters();
	} else {
		var when = $('.second-screen').offset().top/2;
		
	}	
};