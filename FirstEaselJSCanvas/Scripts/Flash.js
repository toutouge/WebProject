var canvas;
var stage;
var img = new Image();
var sprite;
window.onload = function () {
    canvas = document.getElementById("canvas");
    // 创建一个舞台对象
    stage = new createjs.Stage(canvas);
    stage.addEventListener("stagemousedown", clickCanvas);
    stage.addEventListener("stagemousemove", moveCanvas);
    var data = {
        images: ["cnblogsLogo.png"],
        frames: { width: 20, height: 20, regX: 10, regY: 10 }
    }
  
    // 关于EaselJS的一些属性或者方法大家可以根据对应的api文档熟悉熟悉。
    //例如Sprite可以在这里找到
    // file:.../EaselJS-0.8.1/docs/EaselJS_docs-0.8.1/classes/Sprite.html
    sprite = new createjs.Sprite(new createjs.SpriteSheet(data));
    createjs.Ticker.setFPS(20);
    createjs.Ticker.addEventListener("tick", tick);
}

function tick(e) {
    var t = stage.getNumChildren();
    for (var i = t-1; i >0; i--) {
        var st = stage.getChildAt(i);

        // 设置单位振的位置
        st.vY += 2;
        st.vX += 1;
        st.x += st.vX;
        st.y += st.vY;

        // 设置大小变形
        st.scaleX = st.scaleY = st.scaleX + st.vS;
        // 设置透明度
        st.alpha += st.vA;
        if (st.alpha <= 0 || st.y > canvas.height) {
            // 如果超标则移除当前的
            stage.removeChildAt(i);
        }
    }

    // 每做一次操作，需要对舞台一次更新
    stage.update(e);
}

function clickCanvas(e) {
    // 设置鼠标点击出现的图案多
    addS(Math.random() * 200 + 100, stage.mouseX, stage.mouseY, 2);
}

function moveCanvas(e) {
    // 设置鼠标经过出现的图案少
    addS(Math.random() * 2 + 10, stage.mouseX, stage.mouseY, 1);
}

// addS方法中所有小数或者随机数都是可以根据具体需求随意设置的，
function addS(count,x,y,speed) {
    for (var i = 0; i < count; i++) {
        // 关于sprite.clone方法文档的介绍是，返回的是序列的实例，
        // 所以每个实例对象都可以用这个方法控制
        var sp = sprite.clone();
        // 设置图标出现位置
        sp.x = x;
        sp.y = y;
        // 利用随机数控制图标随机亮度
        sp.alpha = Math.random() * 0.5 + 0.5;
        // 设置大小
        sp.scaleX = sp.scaleY = Math.random() + 0.3;

        // 设置曲线
        var a = Math.PI * 2 * Math.random();

        //设置速度
        var v = (Math.random() - 0.5) * 30 * speed;
        sp.vX = Math.cos(a) * v;
        sp.vY = Math.sin(a) * v;
        sp.vS = (Math.random() - 0.5) * 0.2; // scale
        sp.vA = -Math.random() * 0.05 - 0.01;// alpha
        stage.addChild(sp);
    }
}