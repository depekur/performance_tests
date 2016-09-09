<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Performance tests - lazy load</title>

	<link rel="stylesheet" href="css/base.min.css">

	<?php require 'meta.php'; ?>

	<style>
		body {
			width: 900px !important;
			margin: 0 auto !important;
		}
	</style>
</head>
<body>

	<?php require 'content.php'; ?>

	<script>
		function printFiles() {
			var js = true,
				 css = true;

			var jsLinks = [
				'https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js',
				'http://cdn.jsdelivr.net/theaterjs/latest/theater.min.js',
				'https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/js/materialize.min.js',
				'js/app.min.js',
				'js/lazyLoad.js'
			]; 

			var cssLinks = [
				'css/min/style_1.min.css'
			];

			var result = '';

			if (css) {
				for (var i = 0; i < cssLinks.length; i++) {
					result += '<link href="' + cssLinks[i] + '" rel="stylesheet">';
				}
			} 

			if (js) {
				for (var i = 0; i < jsLinks.length; i++) {
					result += '<script src="' + jsLinks[i] + '"><\/script>';
				}
			}		

			document.body.insertAdjacentHTML('beforeend', result);
		}

		document.addEventListener("DOMContentLoaded", printFiles);		
	</script>

</body>
</html>