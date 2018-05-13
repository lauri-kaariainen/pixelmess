"use strict";

const scaleUpBtn = document.querySelector(".scalebuttonUp");
const scaleDownBtn = document.querySelector(".scalebuttonDown");
const randomBtn = document.querySelector(".randomButton");
const backgroundBtn = document.querySelector(".backgroundButton");

scaleUpBtn.onclick = scaleUpBtn.ontouchstart = scaleUpBtn.onselectstart = event => {
  event.preventDefault();
  window.scaleSize = window.scaleSize || 0.6;
  if (window.scaleSize < 5.0) window.scaleSize += 0.11;
};
scaleDownBtn.onclick = scaleDownBtn.ontouchstart = scaleDownBtn.onselectstart = event => {
  event.preventDefault();
  window.scaleSize = window.scaleSize || 0.6;
  if (window.scaleSize > 0.11) window.scaleSize -= 0.11;
  else window.scaleSize = 0.05;
};
randomBtn.onclick = randomBtn.ontouchstart = randomBtn.onselectstart = loadNewPic;

backgroundBtn.onclick = backgroundBtn.ontouchstart = backgroundBtn.onselectstart = event => {
  event.preventDefault();
  window.app.stage.children[0].renderable
    ? (app.stage.children[0].renderable = false)
    : (app.stage.children[0].renderable = true);
};
//start
window.app = null;

loadNewPic();

function loadNewPic() {
  window.app ? window.app.destroy({ children: true }) : "";
  document.querySelector("canvas")
    ? document.querySelector("canvas").remove()
    : "";
  getFinalUrlAfterRedirects(
    "https://source.unsplash.com/collection/1386982/900x700"
  )
    .then(function(url) {
      loadPixelsFromImage(url, document);
    })
    .catch(function(e) {
      alert("error loading!");
      console.log(e);
    });
}

function getFinalUrlAfterRedirects(url) {
  return new Promise(function(resolve, reject) {
    const req = new XMLHttpRequest();

    req.onreadystatechange = function() {
      if (req.readyState === 4) {
        // && req.status===200) {
        resolve(req.responseURL);
      }
    };

    req.open("GET", url, true);
    req.send();
  });
}

function loadPixelsFromImage(finalUrl, document) {
  const context = document.createElement("canvas").getContext("2d");
  const base_image = new Image();
  base_image.crossOrigin = "Anonymous";
  base_image.src = finalUrl;
  base_image.onload = function() {
    const picSizeScale =
      base_image.width / window.innerWidth > 0.8
        ? 1 / (base_image.width / window.innerWidth) * 0.8
        : 1;
    const scaledWidth = Math.floor(base_image.width * picSizeScale);
    const scaledHeight = Math.floor(base_image.height * picSizeScale);
    context.canvas.width = base_image.width;
    context.canvas.height = base_image.height;
    context.drawImage(base_image, 0, 0, scaledWidth, scaledHeight);
    const start = new Date();
    loadPixelsFromImage.pixelArray = context
      .getImageData(0, 0, scaledWidth, scaledHeight)
      .data.reduce((newArr, num, i) => {
        if (i % 4 === 0) newArr.push({ r: num });
        if (i % 4 === 1) newArr[newArr.length - 1].g = num;
        if (i % 4 === 2) newArr[newArr.length - 1].b = num;
        return newArr;
      }, []);
    console.log(new Date() - start, "ms loading pixels");
    render(scaledWidth, scaledHeight, finalUrl);
  };
}

function render(newPictureX, newPictureY, imageSrc) {
  var app = new PIXI.Application();
  window.app = app;
  document.querySelector(".canvasDiv").appendChild(app.view);

  var sprites = new PIXI.particles.ParticleContainer(100000, {
    scale: true,
    position: true,
    rotation: true,
    uvs: true,
    alpha: true
  });

  const bgContainer = new PIXI.Container();

  app.stage.addChild(bgContainer);
  console.log("bgContainer added to stage!");
  app.stage.addChild(sprites);
  console.log("sprites added to stage!");
  PIXI.loader.reset();
  PIXI.loader.add(imageSrc).load(function() {
    const sprite = new PIXI.Sprite.fromImage(imageSrc, true);
    sprite.height = newPictureY;
    sprite.width = newPictureX;
    const slide = background(
      { x: newPictureX, y: newPictureY },
      sprite,
      "cover"
    );
    bgContainer.addChild(slide);
    //app.renderer.render(app.stage);
  });

  //set background off initially
  app.stage.children[0].renderable = false;

  // create an array to store all the sprites
  var maggots = [];

  var totalSprites = app.renderer instanceof PIXI.WebGLRenderer ? 30000 : 100;

  //app.renderer.resize(window.innerWidth, window.innerHeight);
  app.renderer.resize(newPictureX, newPictureY);
  app.renderer.autoResize = true;

  for (var i = 0; i < totalSprites; i++) {
    // create a new Sprite
    var dude = PIXI.Sprite.fromImage("white_square.png");

    // set the anchor point so the texture is centerd on the sprite
    dude.anchor.set(0.5);

    // different maggots, different sizes
    dude.scale.set(0.6 + Math.random() * 0.3);
    //dude.scale.set(0.8);

    // scatter them all
    dude.x = Math.random() * app.screen.width;
    dude.y = Math.random() * app.screen.height;
    dude.tint = 0xffffff;

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

  var tick = 0;
  app.ticker.add(function() {
    this.counter = this.counter || 0;
    this.counter++;
    for (var i = 0; i < maggots.length; i++) {
      var dude = maggots[i];

      if (window.scaleSize && dude.scale !== window.scaleSize)
        dude.scale.set(window.scaleSize);

      //dude.scale.y = 0.95 + Math.sin(tick + dude.offset) * 0.05;
      //dude.direction += dude.turningSpeed * 0.01;
      dude.x += Math.sin(dude.direction) * (dude.speed * dude.scale.y);
      dude.y += Math.cos(dude.direction) * (dude.speed * dude.scale.y);

      //if (this.counter % 2 === 0) {
      var normalizedLocation =
        Math.floor(dude.y) * newPictureX + Math.floor(dude.x);
      if (
        loadPixelsFromImage.pixelArray &&
        loadPixelsFromImage.pixelArray.length > normalizedLocation &&
        normalizedLocation >= 0
      ) {
        var RGB = loadPixelsFromImage.pixelArray[normalizedLocation];
        dude.tint = rgbToDec(RGB);
      }
      //}
      // wrap the pixels
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
    }

    // increment the ticker
    tick += 0.1;
  });
}

function rgbToDec(rgb) {
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
function background(bgSize, inputSprite, type, forceSize) {
  var sprite = inputSprite;
  var bgContainer = new PIXI.Container();
  var mask = new PIXI.Graphics()
    .beginFill(0x8bc5ff)
    .drawRect(0, 0, bgSize.x, bgSize.y)
    .endFill();
  bgContainer.mask = mask;
  bgContainer.addChild(mask);
  bgContainer.addChild(sprite);

  var sp = { x: sprite.width, y: sprite.height };
  if (forceSize) sp = forceSize;
  var winratio = bgSize.x / bgSize.y;
  var spratio = sp.x / sp.y;
  var scale = 1;
  var pos = new PIXI.Point(0, 0);
  if (type == "cover" ? winratio > spratio : winratio < spratio) {
    //photo is wider than background
    scale = bgSize.x / sp.x;
    pos.y = -(sp.y * scale - bgSize.y) / 2;
  } else {
    //photo is taller than background
    scale = bgSize.y / sp.y;
    pos.x = -(sp.x * scale - bgSize.x) / 2;
  }

  sprite.scale = new PIXI.Point(scale, scale);
  sprite.position = pos;
  return bgContainer;
}
// loadPixelsFromImage("../../contour/images/girl.jpg", document);
