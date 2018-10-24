/* global PIXI */       // src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.8.2/pixi.min.js"
/* global W */          // src="index.html"
/* global H */          // src="index.html"
/* global car */        // car.js
/* global createMap */  // map.js

var app = 0;

var test = new car("img/car1.PNG");

function main(){
    init();
    loadResources();
}

function init(){
    app = new PIXI.Application({
        width: 3000,
        height: 3000,
        antialias: true,
        transparent: false,
        resolution: 1
    });
    
    document.body.appendChild(app.view);
    app.renderer.backgroundColor = 0xefe009;
}

function loadResources(){
    createMap();
    PIXI.loader.add(test.img).on("progress", progressHandler).load(setup);
    
}

function progressHandler(loader, resource){
    console.log("loading: " + resource.url);
    console.log("progress: " + loader.progress);
}

function setup(){
    let sprite = new PIXI.Sprite(PIXI.loader.resources[test.img].texture);
    sprite.anchor.set(0.5, 0.5);
    test.sprite = sprite;
    console.log(sprite.width +  " " + sprite.height);
    app.stage.addChild(sprite);
    test.genPhysBody();
    gameLoop();
}

 function gameLoop(){
    test.update();
    
    test.sprite.x = test.physics.position[0];
    test.sprite.y = test.physics.position[1];
    test.sprite.rotation = test.physics.angle;
    
    requestAnimationFrame(gameLoop);   
 }

main();