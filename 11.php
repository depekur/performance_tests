<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Performance tests - lazy load</title>

	<style>
		<?= file_get_contents('css/min/style_1.min.css'); ?>
	</style>

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
		<?= file_get_contents('js/wow.js'); ?>
	</script>

	<script>
		<?= file_get_contents('js/lazyLoad.js'); ?>
	</script>
	

</body>
</html>