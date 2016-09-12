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

			var jsFiles = [
				'https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js',
				'http://cdn.jsdelivr.net/theaterjs/latest/theater.min.js',
				'https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/js/materialize.min.js',
				'js/three.min.js',
				'js/lazyLoad.js'
			]; 

			var cssLinks = [
				'css/parts/reset.css',
				'css/min/style_2.min.css',
				'css/parts/laptop.css',
				'css/parts/mobile.css',
				'css/parts/slick.css',
				'css/parts/tablet.css',
				'css/parts/retina.css',
				'css/parts/comments.css',
				'css/parts/sidebar.css',
			];

			var result = '';
			var jsFilesCount = jsFiles.length;

			if (css) {
				for (var i = 0; i < cssLinks.length; i++) {
					result += '<link href="' + cssLinks[i] + '" rel="stylesheet">';
				}
				document.body.insertAdjacentHTML('beforeend', result);
			} 

			

			if (js) {
				print(jsFiles, jsFilesCount);
			}

			function print(jsFiles, jsFilesCount) {

				if (jsFilesCount > 0) {
					var fileId = jsFiles.length - jsFilesCount;
					jsFilesCount--;

					var script = document.createElement('script');
					script.src = jsFiles[fileId];

					script.onload = function() {
						print(jsFiles, jsFilesCount);
						if (script.src == 'js/lazyLoad.js') {
							lazyImg();
						}
					}

					document.body.appendChild(script);
				}
			}
		}

		document.addEventListener("DOMContentLoaded", printFiles);		
	</script>


</body>
</html>