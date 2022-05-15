const startdiv = document.getElementById("start");
const btn = document.querySelector("#start button");
const p = document.querySelector("#start p");
const scorediv = document.getElementById("score");
const killsdiv = document.getElementById("kills");
const canvas = document.getElementById("canvas");
const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');
ctx.clearRect(0,0,width,height);

canvas.addEventListener("mousemove", (e)=>{
    if(playing){
        var dx = e.pageX - player.x;            // dik ucgenin kenarlarina gore acilari hesaplanarak mouse konumuna gore hareket etmesi 
        var dy = e.pageY - player.y;
        var tetha = Math.atan2(dy,dx);         // atan2 aciyi radyan cinsinden dondurur
        tetha *= 180 / Math.PI;                // radyandan dereceye cevrildi
        angle = tetha;
    }
});

canvas.addEventListener("click", (e) => {
    bullets.push(new Circle(player.x,player.y,e.pageX,e.pageY,5,'white',5));         //tikladikca ortaya mermi olusturuyo noktalari hedefe dogru hareket ettirme
});

class Circle{
    constructor(bx,by,tx,ty,r,c,s){ 
        this.bx = bx;  // begin.x
        this.by = by;
        this.tx = tx;  // target.x
        this.ty = ty;
        this.x = bx;
        this.y = by;
        this.r = r; // radius
        this.c = c; // color
        this.s = s; // speed
    }
    draw(){
        ctx.fillStyle = this.c;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();
    }

    update(){
        var dx = this.tx - this.bx;  // hedef ile orta nokta arasinda dik ucgen olusturuldu
        var dy = this.ty - this.by;
        var hp = Math.sqrt(dx*dx + dy*dy); // hipotenus bulma
        this.x += (dx/hp) * this.s;
        this.y += (dy/hp) * this.s;
    }
    remove(){  // ekran disina cikinca 
        if( (this.x<0 || this.x>width)         // hedef x ekseninde ekranin disinda ise
            || (this.y<0 ||this.y>height) ){   // hedef y ekseninde ekran disinda ise
            return true;
        }
        return false;
    }
}

class Player{
    constructor(x,y,r,c){
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c;
    }
    draw(){
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(angle*Math.PI/180);
        ctx.fillStyle = this.c;
        ctx.beginPath();
        ctx.arc(0,0,this.r,0,Math.PI*2);
        ctx.fillRect(0,-(this.r * .4),this.r + 10,this.r * .8);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}

function addEnemy(){  // rastgele dusman ekleme
    for(var i=enemies.length; i<maxenemy; i++){

        var r = Math.random() * 30 + 10;    // max cap 40
        var c = 'hsl(' + (Math.random()*360) + ',50%,50%)';
        var s = .5 + ((40-((r/40)*r)) / 160) / maxenemy;  // hedef sayisi arttikca hiz azalir 

        var x,y;
        if(Math.random()<.5){
            x = (Math.random() > .5) ? width : 0;  // hedefin ekranin sag ya da solundan rastgele gelmesi
            y = Math.random() * height;  // hedefin ekranin alt ya da ustunden rastgele gelmesi
        }else{
            x = Math.random() * width;
            y = (Math.random() < .5) ? height : 0;
        }

        enemies.push(new Circle(x,y,player.x, player.y,r,c,s));
    }
}

function collision(x1,y1,r1,x2,y2,r2){   // iki nesnenin konumlari arasindaki hipotenus hesaplama
    var dx = x1 - x2;
    var dy = y1 - y2;
    var hp = Math.sqrt(dx*dx + dy*dy);
    if(hp < (r1 + r2)){   // hipotenus yaricaplarin toplamindan kucukse bu iki nesne birbirine dokunuyo
        return true;
    }
    return false;
}

function animate(){
    if(playing){
        requestAnimationFrame(animate);
        //ctx.clearRect(0,0,width,height);  
        ctx.fillStyle = 'rgba(0,0,0,.3)';   // hedef ve mermilerin arkasinda efekt olmasi
        ctx.fillRect(0,0,width,height);
        ctx.fill();
        
        enemies.forEach((enemy,e) => {

            bullets.forEach((bullet,b)=>{
                if(collision(enemy.x, enemy.y, enemy.r, bullet.x, bullet.y, bullet.r)){  // hedefi vurunca
                    if(enemy.r < 25){  // yaricap 25 den kucukse hedef yok olur
                        enemies.splice(e,1);   // vurulan hedef yok olur
                        score += 25;
                        kills++;
                        if(kills % 3 === 0){ // her 3 kill de ekrandaki hedef sayisi artar
                            maxenemy++;
                        }
                        addEnemy(); // her yok olan hedef yerine yenisi gelir
                    }else{      // degilse yaricapi azalir
                        enemy.r -= 5;
                        score += 5;
                    }
                    bullets.splice(b,1); // mermi hedefii vurduktan sonra yok olur
                    
                }
            });

            if( collision(enemy.x, enemy.y, enemy.r, player.x, player.y, player.r) ){   // iki nesne birbirine dokunuyorsa
                startdiv.classList.remove("hidden");
                btn.textContent = "TRY AGAIN";
                p.innerHTML = "Game over! <br/> Score: " + score;
                playing = false;
            }

            if(enemy.remove()){       // hedef ekran disina cikti ise
                enemies.splice(e,1);
                addEnemy();           // hedef ekrandan yok olunca yeni bir tane daha ekler
            }
            enemy.update();
            enemy.draw();
        });

        bullets.forEach((bullet,b) => {
            if(bullet.remove()){  // bullet ekran disina cikti ise
                bullets.splice(b,1);  // mermileri temizler
            }
            bullet.update();
            bullet.draw();
        })

        player.draw();
        scorediv.innerHTML = "Score: " + score;
        killsdiv.innerHTML = "Kills: " + kills;
        
    }
}

function init(){  // oyun baslarken
    playing = true;
    score = 0;
    kills = 0;
    angle = 0;
    bullets = [];
    enemies = [];
    maxenemy = 5;
    startdiv.classList.add("hidden");

    player = new Player(width/2, height/2, 20, 'white');
    addEnemy(); 
    animate();
}

var playing = false;
var player, angle, bullets, enemies, maxenemy, score, kills;