var canvas;
var stage;
var txt;
var count = 0;
window.onload = function () {
    canvas = document.getElementById("canvas");

    // 创建一个舞台对象
    stage = new createjs.Stage(canvas);
    txt = new createjs.Text("Hello CNBlogs->", "20px Arial", "#ff7700");
    stage.addChild(txt);

    createjs.Ticker.addEventListener("tick", tick);
}

function tick(e)
{
    count++;
    txt.text = "Hello CNBlogs->" + count + "☺";
    stage.update();
}