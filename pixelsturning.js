"use strict";
function init(newPictureX, newPictureY) {
	var app = new PIXI.Application();
	document.body.appendChild(app.view);

	var sprites = new PIXI.particles.ParticleContainer(50000, {
		scale: true,
		position: true,
		rotation: true,
		uvs: true,
		alpha: true
	});
	app.stage.addChild(sprites);

	// create an array to store all the sprites
	var maggots = [];

	var totalSprites = app.renderer instanceof PIXI.WebGLRenderer ? 50000 : 100;

	// var newPictureX = 500;
	// var newPictureY = 300;

	//resolutionrenderer.autoResize = true;
	app.renderer.resize(window.innerWidth, window.innerHeight);
	app.renderer.resize(newPictureX, newPictureY);

	for (var i = 0; i < totalSprites; i++) {
		// create a new Sprite
		var dude = PIXI.Sprite.fromImage("white_square.png");

		// dude.tint = Math.random() * 0xe8d4cd;

		// set the anchor point so the texture is centerd on the sprite
		dude.anchor.set(0.5);

		// different maggots, different sizes
		dude.scale.set(0.8 + Math.random() * 0.3);
		dude.scale.set(0.4);

		// scatter them all
		dude.x = Math.random() * app.screen.width;
		dude.y = Math.random() * app.screen.height;
		dude.tint = 0xffffff;
		//dude.alpha = Math.random() > 0.999 ? 1 : 0.1;
		//dude.alpha = Math.random() + 0.5;
		// dude.tint = Math.random() * 0x808080;

		// create a random direction in radians
		dude.direction = Math.random() * Math.PI * 2;

		// this number will be used to modify the direction of the sprite over time
		dude.turningSpeed = Math.random() - 0.8;

		// create a random speed between 0 - 2, and these maggots are slooww
		dude.speed = (2 + Math.random() * 2) * 0.2;

		dude.offset = Math.random() * 100;

		// finally we push the dude into the maggots array so it it can be easily accessed later
		maggots.push(dude);

		sprites.addChild(dude);
	}

	// create a bounding box box for the little maggots
	var dudeBoundsPadding = 5;
	var dudeBounds = new PIXI.Rectangle(
		-dudeBoundsPadding,
		-dudeBoundsPadding,
		app.screen.width + dudeBoundsPadding * 2,
		app.screen.height + dudeBoundsPadding * 2
	);

	// var brightenPoint = {
	// 	x: 300,
	// 	y: 300,
	// 	direction: Math.random() * Math.PI * 2,
	// 	turningSpeed: 0.4,
	// 	speed: 1,
	// 	rotation: 0
	// };

	var tick = 0;
	//setInterval(() => console.log(app.ticker.FPS, "fps"), 1000);
	app.ticker.add(function() {
		// iterate through the sprites and update their position
		// brightenPoint.direction += brightenPoint.turningSpeed * 0.01;
		// brightenPoint.rotation = -brightenPoint.direction + Math.PI;
		// brightenPoint.x +=
		// 	Math.sin(brightenPoint.direction) * brightenPoint.speed * 6;
		// brightenPoint.y +=
		// 	Math.cos(brightenPoint.direction) * brightenPoint.speed * 6;
		// if (brightenPoint.x < dudeBounds.x) {
		// 	brightenPoint.x += dudeBounds.width;
		// } else if (brightenPoint.x > dudeBounds.x + dudeBounds.width) {
		// 	brightenPoint.x -= dudeBounds.width;
		// }

		// if (brightenPoint.y < dudeBounds.y) {
		// 	brightenPoint.y += dudeBounds.height;
		// } else if (brightenPoint.y > dudeBounds.y + dudeBounds.height) {
		// 	brightenPoint.y -= dudeBounds.height;
		// }

		this.counter = this.counter || 0;

		for (var i = 0; i < maggots.length; i++) {
			var dude = maggots[i];

			//dude.scale.y = 0.95 + Math.sin(tick + dude.offset) * 0.05;
			//dude.direction += dude.turningSpeed * 0.01;
			dude.x += Math.sin(dude.direction) * (dude.speed * dude.scale.y);
			dude.y += Math.cos(dude.direction) * (dude.speed * dude.scale.y);

			var normalizedLocation =
				Math.floor(dude.y) * newPictureX + Math.floor(dude.x);
			if (
				loadPixelsFromImage.pixelArray &&
				loadPixelsFromImage.pixelArray.length > normalizedLocation &&
				normalizedLocation >= 0
			) {
				var RGB = loadPixelsFromImage.pixelArray[normalizedLocation];
				//console.log(parseInt(normalizedLocation);
				// RGB = { r: 255, g: 0, b: 0 };
				//dude.tint = parseInt("" + RGB.r + RGB.g + RGB.b);
				dude.tint = rgbToHexNum(RGB);
				if (dude.tint < 100) dude.renderable = false;
				else dude.renderable = true;
			}
			// dude.rotation = -dude.direction + Math.PI;
			// if (dude.x > brightenPoint.x - 30 && dude.x < brightenPoint.x + 30)
			// 	if (
			// 		dude.y > brightenPoint.y - 30 &&
			// 		dude.y < brightenPoint.y + 30
			// 	) {
			// 		dude.alpha = 1;
			// 		dude.tint = Math.random() * 0xffffff;
			// 		dude.speed = (2 + Math.random() * 2) * 0.2 * 10;
			// 	}

			// if (dude.alpha > 0.1) {
			// 	dude.alpha -= 0.01;
			// 	dude.speed *= 0.95;
			// }
			// wrap the maggots
			if (dude.x < dudeBounds.x) {
				dude.x += dudeBounds.width;
			} else if (dude.x > dudeBounds.x + dudeBounds.width) {
				dude.x -= dudeBounds.width;
			}

			if (dude.y < dudeBounds.y) {
				dude.y += dudeBounds.height;
			} else if (dude.y > dudeBounds.y + dudeBounds.height) {
				dude.y -= dudeBounds.height;
			}
			// const point = new PIXI.Point(200, 305);
			// const test = app.renderer.plugins.interaction.hitTest(point);
			// if (test !== null) console.log(test);
		}

		// increment the ticker
		tick += 0.1;
	});
}
function loadPixelsFromImage(src, document) {
	// var canvas = document.getElementById("viewport"),
	// 	context = canvas.getContext("2d");
	var context = document.createElement("canvas").getContext("2d");
	const base_image = new Image();
	base_image.src = src;
	base_image.onload = function() {
		context.canvas.width = base_image.width;
		context.canvas.height = base_image.height;
		console.log("pic onloaded");
		context.drawImage(
			base_image,
			0,
			0,
			base_image.width * 1,
			base_image.height * 1
		);
		const start = new Date();
		loadPixelsFromImage.pixelArray = context
			.getImageData(0, 0, base_image.width, base_image.height)
			.data.reduce((newArr, num, i) => {
				if (i % 4 === 0) newArr.push({ r: num });
				if (i % 4 === 1) newArr[newArr.length - 1].g = num;
				if (i % 4 === 2) newArr[newArr.length - 1].b = num;
				return newArr;
			}, []);
		console.log(new Date() - start, "ms loading pixels");

		init(base_image.width, base_image.height);
	};
}

function rgbToHexNum(rgb) {
	// if (
	// 	Array.isArray(rgb) &&
	// 	rgb.length > 2 &&
	// 	typeof rgb[0] === "number" &&
	// 	typeof rgb[1] === "number" &&
	// 	typeof rgb[2] === "number"
	// )
	// 	return (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
	// if (
	// 	typeof rgb === "object" &&
	// 	typeof rgb.r === "number" &&
	// 	typeof rgb.g === "number" &&
	// 	typeof rgb.b === "number"
	// )
	return (rgb.r << 16) + (rgb.g << 8) + rgb.b;
}

// var context = document.createElement("canvas").getContext("2d");
// loadPixelsFromImage("../../../airport/pics/bb-ipad.png", document);
loadPixelsFromImage("cat.png", document);
