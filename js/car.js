/* global input */ 
/* global H */
/* global W */
/* global p2 */

var pxToM = 0.0002645833;

class car{
    constructor(img){
        // sprite data
        this.img = img;
        this.sprite = 0;
        this.w = 0;// width in pixels
        this.h = 0;// height in pixels
        this.accel = 20;
        this.mag = 0;
        this.maxAngVel = 120 * (Math.PI / 180);
        this.handling = 5 * (Math.PI / 180);
        
        // Physics body stuff
        this.mass = 6000;
        
    }
    
    genPhysBody(){
        this.w = this.sprite.width;
        this.h = this.sprite.height;
        //console.log(this.sprite.width + " " + this.sprite.height);
        
        this.physics = new p2.Body({
            mass: this.mass,
            position: [getPoint(0).x, getPoint(0).y],
            angle: Math.PI / 2,
            gravityScale: 0,
            damping: 0.75,
            fixedRotation: false
        });
        
        
        this.physics.ccdSpeedThreshold = 0.1;
        this.physics.ccdIterations = 25;
        
        let mid = new p2.Box({
            width: this.w - this.h,
            height: this.h
        });
        
        let front = new p2.Circle({
            radius: (this.h / 2) + 1
        });
        
        
        let back = new p2.Circle({
            radius: (this.h / 2) + 1
        });
        
        let contact = new p2.Material();
        
        mid.material = contact;
        front.material = contact;
        back.material = contact;
        
        this.physics.addShape(mid);
        this.physics.addShape(front);
        this.physics.addShape(back);
        
        this.physics.shapes[1].position = [mid.width / 2, 0];
        this.physics.shapes[2].position = [-mid.width / 2, 0];
        world.addBody(this.physics);

        this.physics.angularDamping = 0.999;
        
        this.physics.shapes[0].x = 0;
        this.physics.shapes[0].y = 0;
        
        world.addContactMaterial(
            new p2.ContactMaterial(mid.material, 
                                   world.bodies[0].shapes[0].material,
                                   {restitution: 0.01,
                                    stiffness: Number.MAX_VALUE
                                   }
                                   ));
        
    }

        
    update(){
        
        this.mag = p2.vec2.length(this.physics.velocity) + this.accel;
        
        if(this.mag > 40){
            if(input.left){
                this.physics.angle -= this.handling;
                // if(this.physics.angularVelocity < -this.maxAngVel){
                //     this.physics.angularVelocity = -this.maxAngVel;
                // }
            }
            if(input.right){
                this.physics.angle += this.handling;
                // if(this.physics.angularVelocity > this.maxAngVel){
                //     this.physics.angularVelocity = this.maxAngVel;
                // }
            }
        }
        if(input.up){
            this.physics.velocity = [
                -this.mag * Math.cos(this.physics.angle),
                -this.mag * Math.sin(this.physics.angle)
                ];
        }
        if(input.down){
            this.physics.velocity = [
                0.8 * this.mag * Math.cos(this.physics.angle),
                0.8 * this.mag * Math.sin(this.physics.angle)
                ];
        }
        
        // console.log(this.physics.position[0] + " " + this.physics.position[1]);
        world.step(1/60);
        
        this.physics.angularVelocity *= 0.6;
        
    }
}