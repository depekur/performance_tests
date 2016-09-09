<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Performance tests - lazy load</title>

	<?php require 'meta.php'; ?>

	<style>
		button,input,select{-webkit-appearance:none}.overflow-hidden,.stop-scrolling{overflow:hidden}.btn,hr{outline:0}body{background:#fff;font-family:Helvetica,sans-serif;font-family:'exo2 light',Helvetica,sans-serif;font-weight:400;line-height:25px}.wrapp{width:1024px;margin:0 auto}section{width:100%}*,:after,:before{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}button,select{cursor:pointer;-moz-appearance:none;appearance:none}input{-moz-appearance:none;appearance:none}img[data-src]{display:block;margin-left:auto;margin-right:auto;width:20px!important;height:20px!important}.death{display:none!important}.clearfix:after{display:block;content:'';clear:both}.section{padding-top:40px;padding-bottom:40px}.text{line-height:22px;letter-spacing:1px}.font-bold{font-family:'exo2 extrabold'}.font-sb{font-family:'exo2 semibold'}.btn,.font-medium,.item__title,.title--box,.title--footer,.title--small{font-family:'exo2 medium'}.text-dark{color:#3D3950}.text-light{color:#868686}.text-center{text-align:center}.text-left{text-align:left}.text-right{text-align:right}.btn,.item,.title--section{text-align:center}.transitioned{-webkit-transition:all .5s ease;-moz-transition:all .5s ease;-ms-transition:all .5s ease;-o-transition:all .5s ease;transition:all .5s ease}hr{height:1px;border:none;background:#000}.stop-scrolling{height:100%}.title--footer:after,.title--section:after{height:2px;content:'';display:block}.title{font-size:25px;letter-spacing:.5px;line-height:1.3}.title--large{font-size:30px;line-height:40px;letter-spacing:1.5px}.title--main{font-size:39px;margin-bottom:20px}.title--section{margin-bottom:40px}.title--section:after{width:100px;margin:15px auto 0;background:#D9D9D9}.title--footer{font-size:16px;color:#DFDFE0}.title--footer:after{width:50px;margin:5px 0 20px;background:#fff}.title--content{margin-top:40px;margin-bottom:25px;color:#3F3B51;font-size:30px}.title--small{margin-top:20px;margin-bottom:5px;font-size:16px;color:#454157}.title--box{background:#EFEFEE;position:relative;padding:20px 0;font-size:18px;letter-spacing:.9px;line-height:23px}.title--box:after{content:'';display:block;position:absolute;bottom:0;left:50%;width:0;height:0;border:10px solid transparent;border-bottom:10px solid #fff;-webkit-transform:translate(-50%,0);-ms-transform:translate(-50%,0);transform:translate(-50%,0)}.title--margin{margin-top:30px;margin-bottom:10px}.upper{text-transform:uppercase}.logo{width:250px}.logo--header{float:left;margin-top:20px}.logo__icon{display:block;float:left;width:30px;height:25px;margin-right:5px}.title--logo{display:block;float:left;font-size:19px}.btn,.btn__icon,.item{display:inline-block}.item{vertical-align:top}.item__img{width:30px;height:30px;margin:0 auto 10px}.item__title{line-height:40px;font-size:18px;color:#3D3950}.item__text{color:#797979;font-size:16px}.btn{padding:10px 20px 7px;text-decoration:none;color:#3D3950;-webkit-appearance:none;appearance:none}.btn--small{padding:5px 20px}.btn--orange{background:#FFC002;border:none;border-bottom:3px solid #FFC002}.btn--orange:active,.btn--orange:hover{border-bottom-color:#CF8D01}.btn--orange:active{background:-webkit-linear-gradient(#EDB302,#FFBF02);background:-o-linear-gradient(#EDB302,#FFBF02);background:-moz-linear-gradient(#EDB302,#FFBF02);background:linear-gradient(#EDB302,#FFBF02)}.bth--header{margin-top:12px;margin-left:10px;padding:5px 15px}.btn--blueBox{color:#00BCD5;border:2px solid #00BCD5}.bth--header.btn--blueBox:hover{background:#00BCD5;border-bottom-color:#00869F;color:#F6FCFD}.bth--header.btn--blueBox:active{border-bottom-color:#00BCD5}.bth--header.btn--blueBox:hover .btn__icon--login path{fill:#F6FCFD}.bth--header.btn--orangeBox:hover{color:#3D3950;background:#FFCA2C;border-bottom-color:#CE8C00}.bth--header.btn--orangeBox:active{border-bottom-color:#FFCA2C}.btn--orangeBox{color:#FFCA2C;border:2px solid #FFCA2C}.btn__icon{width:10px;height:10px}.btn-totop{position:fixed;width:45px;height:45px;padding:0;margin:0;border:none;background:0 0;right:10px;bottom:50px;z-index:700;outline:0;cursor:pointer;display:none}.btn-totop .circle{fill:#000;opacity:.2}.btn-totop .arrow{fill:#fff}.btn-totop:active .circle,.btn-totop:hover .circle{opacity:.4}.btn--contact{width:100%;font-size:16px}.btn--contact:disabled{opacity:.5;cursor:default}.btn--contact:disabled:hover{border-bottom-color:#FFC002}.btn--dark{background:#3D3950;color:#fff;border:none;border-bottom:3px solid #3D3950;font-size:16px}.btn--dark:hover{border-bottom-color:#060219}
	</style>

	<style>
		body {
			width: 900px !important;
			margin: 0 auto !important;
		}
	</style>
</head>
<body>

	<?php require 'content.php'; ?>

	<link rel="stylesheet" href="css/parts/reset.css">
	<link rel="stylesheet" href="css/min/style_2.min.css">
	<link rel="stylesheet" href="css/parts/laptop.css">
	<link rel="stylesheet" href="css/parts/mobile.css">
	<link rel="stylesheet" href="css/parts/mobile.css">
	<link rel="stylesheet" href="css/parts/slick.css">
	<link rel="stylesheet" href="css/parts/tablet.css">
	<link rel="stylesheet" href="css/parts/retina.css">
	<link rel="stylesheet" href="css/parts/comments.css">
	<link rel="stylesheet" href="css/parts/sidebar.css">
	
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
	<script src="http://cdn.jsdelivr.net/theaterjs/latest/theater.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/js/materialize.min.js"></script>
	<script src="js/app.min.js"></script>
	<script src="js/lazyLoad.js"></script>

</body>
</html>