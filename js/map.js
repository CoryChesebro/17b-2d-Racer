/* global p2 */
/* global PIXI */

// Use distance between two vectors to determine if the player has reached 
// the finish line or not

// Use CatmuilRom Spline along with Rectangles along the line to generate the 
// map easily
var world = new p2.World();

let scale = 3.5;
let width = 135;

let trackOffset = scale * width;

let contact = new p2.Material();

var points = [
        {x: 70 , y: 200},
        {x: 200 , y: 70},
        {x: 380, y: 200},
        {x: 600, y: 230},
        {x: 500, y: 570}
    ];

// // Almost a circle
// var points = [
//     {x: 80, y: 80},
//     {x: 50,  y: 150},
//     {x: 80,  y: 220},
//     {x: 150, y: 250},
//     {x: 220, y: 220},
//     {x: 250, y: 150},
//     {x: 220, y: 80},
//     {x: 150, y: 50}
//     ];
    
function getPoint(index) {
    return { x: points[index].x * scale + trackOffset,
             y: points[index].y * scale + trackOffset };
}

function createMap(){
    var gfx = new PIXI.Graphics();
    
    var mapBounds = new p2.Body({
        mass: 0,
        position: [0, 0],
        angle: 0,
        gravityScale: 0,
        damping: 1
    });
    
    var map = new p2.Body({
        mass: 0,
        gavity: 0
    });
    
    // Eric Added this 👽
    // for (let i = 0; i < points.length; i++) {
    //     points[i].x *= scale; // scale it
    //     points[i].x += 550; // push it to the middle
        
    //     points[i].y *= scale;// scale it
    //     points[i].y += 550;// push it to the middle
    // }
    
    let curve = [];
    
    function CatmullRom(t, p0, p1, p2, p3) {
        
        
        let v0x = ( p2.x - p0.x ) * 0.5;
        let v1x = ( p3.x - p1.x ) * 0.5;
        let v0y = ( p2.y - p0.y ) * 0.5;
        let v1y = ( p3.y - p1.y ) * 0.5;
        let t2 = t * t;
        let t3 = t * t2;
    
        let ret = {
            point: {x: 0, y: 0},
            dir:   {x: 0, y: 0}
        };
    
        ret.point.x = ( 2 * p1.x - 2 * p2.x + v0x + v1x ) * t3 + ( - 3 * p1.x + 3 * p2.x - 2 * v0x - v1x ) * t2 + v0x * t + p1.x;
        ret.point.y = ( 2 * p1.y - 2 * p2.y + v0y + v1y ) * t3 + ( - 3 * p1.y + 3 * p2.y - 2 * v0y - v1y ) * t2 + v0y * t + p1.y;
    
        ret.dir.x = 3 * ( 2 * p1.x - 2 * p2.x + v0x + v1x ) * t2 + 2 * ( - 3 * p1.x + 3 * p2.x - 2 * v0x - v1x ) * t + v0x;
        ret.dir.y = 3 * ( 2 * p1.y - 2 * p2.y + v0y + v1y ) * t2 + 2 * ( - 3 * p1.y + 3 * p2.y - 2 * v0y - v1y ) * t + v0y;

        let mag = Math.sqrt((ret.dir.x * ret.dir.x) + (ret.dir.y * ret.dir.y));
        
        ret.dir.x /= mag;
        ret.dir.y /= mag;
        
        ret.dir.x *= width;
        ret.dir.y *= width;
        
        return ret;
    }
    
    function splineLoop(t, points) {
        let p = points.length * t;
    
        let intPoint = Math.floor(p);
        let weight = p - intPoint;
    
        function inRange(n0) {
            let n = n0 %  points.length;
            if (n < 0) n += points.length;
            return n;
        }
    
        // Get the correct adjacent points
        let p0 = points[ inRange(intPoint - 1)];
        let p1 = points[ inRange(intPoint) ];
        let p2 = points[ inRange(intPoint + 1) ];
        let p3 = points[ inRange(intPoint + 2) ];
    
        return CatmullRom(weight, p0, p1, p2, p3);
    }
    
    let pointsList = [];
    
    for (let i = 0; i < points.length; i++) {
        pointsList.push(getPoint(i));
    }
    
    let seg = 128;
    for(let i = 0; i <= 1; i += 1/ seg){
        let newp = splineLoop(i, pointsList);
        curve.push(newp);
    }
    
    let len = curve.length;
    let count = 0;
    
    let height = 10;
    
    for(let i = 1; i < len; i++){
        let tPoint = curve[i];
        
        // always face towards the center of the track
        let dir1 = {x: -curve[i - 1].dir.y, y: curve[i - 1].dir.x};
        let dir2 = {x: -curve[i].dir.y, y: curve[i].dir.x};
        
        // always face away from the center of the track
        let dir3 = {x: -dir1.x, y: -dir1.y};
        let dir4 = {x: -dir2.x, y: -dir2.y};
        
        // positive side
        let pos1 = {x: curve[i - 1].point.x + dir1.x,
                    y: curve[i - 1].point.y + dir1.y};
             
        let pos2 = {x: curve[i].point.x + dir2.x,
                    y: curve[i].point.y + dir2.y};
             
        // negative side
        let pos3 = {x: curve[i - 1].point.x + dir3.x,
                    y: curve[i - 1].point.y + dir3.y};
                    
        let pos4 = {x: curve[i].point.x + dir4.x,
                    y: curve[i].point.y + dir4.y};
        
        // mid points            
        let mid1 = {x: (pos1.x + pos2.x) / 2,
                    y: (pos1.y + pos2.y) / 2};
                    
        let mid2 = {x: (pos3.x + pos4.x) / 2,
                    y: (pos3.y + pos4.y) / 2};
        
        //distance between points
        let dist1 = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
        let dist2 = Math.sqrt(Math.pow(pos3.x - pos4.x, 2) + Math.pow(pos3.y - pos4.y, 2));
        
        let angle1 = Math.atan((pos1.y - pos2.y) / (pos1.x - pos2.x));
        let angle2 = Math.atan((pos3.y - pos4.y) / (pos3.x - pos4.x));
        
        //push the boundary box out to make corners intersect and not side midpoints
        let offset1 = {x: 0.5 * height * Math.cos(angle1), y: 0.5 * height * Math.sin(angle1)};
        let offset2 = {x: 0.5 * height * Math.cos(angle2), y: 0.5 * height * Math.sin(angle2)};
        
        mid1.x += offset1.x;
        mid1.y += offset1.y;
        
        mid2.x += offset2.x;
        mid2.y += offset2.y;
        
        let mat = new p2.Material();
        
        let box1 = new p2.Box({
            width: dist1,
            height: height
        });
        
        box1.material = contact;
        
        mapBounds.addShape(box1);
        mapBounds.shapes[count].position = [mid1.x, mid1.y];
        mapBounds.shapes[count++].angle = angle1;
        
        let box2 = new p2.Box({
            width: dist2,
            height: height
        });
        
        box2.material = contact;
        
        mapBounds.addShape(box2);
        mapBounds.shapes[count].position = [mid2.x, mid2.y];
        mapBounds.shapes[count++].angle = angle2;
        
        let roadPoints = [];
        for(let i = 0; i < curve.length; i += 4){
            roadPoints.push(curve[i].point);
        }
        
        var roadTexture = 
            new PIXI.mesh.Rope(
                PIXI.Texture.fromImage('/Project/data/assets/MeshTexutres/roadMeshTexture.jpg'), roadPoints);
        
        gfx.position.set(0.0);
        gfx.lineStyle(5, 0x000000)
        .moveTo(pos1.x, pos1.y)
        .lineTo(pos2.x, pos2.y);
        
        gfx.lineStyle(5, 0x000000)
        .moveTo(pos3.x, pos3.y)
        .lineTo(pos4.x, pos4.y);
        
    }
    
    world.addBody(mapBounds);
    app.stage.addChild(gfx);
    app.stage.addChild(roadTexture);
}


    
