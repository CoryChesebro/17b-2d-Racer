var input = {
    left: false,
    right: false,
    up: false,
    down: false
}

document.addEventListener("keydown", function(event){
    if(event.keyCode == 65){
        input.left = true;
    }
    else if(event.keyCode == 68){
        input.right = true;
    }
    else if(event.keyCode == 87){
        input.up = true;
    }
    else if(event.keyCode == 83){
        input.down = true;
    }
});

document.addEventListener("keyup", function(event){
    if(event.keyCode == 65){
        input.left = false;
    }
    else if(event.keyCode == 68){
        input.right = false;
    }
    else if(event.keyCode == 87){
        input.up = false;
    }
    else if(event.keyCode == 83){
        input.down = false;
    }
});