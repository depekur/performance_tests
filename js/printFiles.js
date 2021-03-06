function printFiles() {
			var js = true,
		 css = false;

	var jsLinks = [
		'https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js',
		'http://cdn.jsdelivr.net/theaterjs/latest/theater.min.js',
		'https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/js/materialize.min.js',
		'js/three.min.js',
		'js/lazyLoad.js'
	]; 

	var result = '';

	if (css) {
		for (var i = 0; i < cssLinks.length; i++) {
			result += '<link href="' + cssLinks[i] + '" rel="stylesheet">';
		}
	} 

	document.body.insertAdjacentHTML('beforeend', result);

	if (js) {
		for (var i = 0; i < jsLinks.length; i++) {
			var script = document.createElement('script');
			script.src = jsLinks[i];

			if (script.src == 'js/lazyLoad.js') {
				script.onload = function() {
					lazyImg();
				}
			}

			document.body.appendChild(script);					

			//result += '<script src="' + jsLinks[i] + '"><\/script>';
		}
	}		
}

document.addEventListener("DOMContentLoaded", printFiles);