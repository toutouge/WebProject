function easeOut(t, b, c, d) {
    var ts = (t /= d) * t;
    var tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

function getColor(index, total) {
    var h = (index + 1) / total;
    var s = 0.9;
    var l = 0.5;

    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

$.widget('javobyte.rouletteWheel', {

    options: {
        pointer: $('<img>').attr('src', 'img/pointer.png')[0],
        selected: function () {
        },
        spinText: 'SPIN',
        colors: [],
    },

    _options: {
        is_rotating: false,
        arc: 0,
        currentAngle: 0,
        ctx: 0,
        itemsToDraw: 0,
    },

    _create: function () {
        if (!this.options.items) throw 'No items provided';

        var canvas = this.element[0];

        if (canvas.getContext) {
            this._options.ctx = canvas.getContext('2d');

            this._options.itemsToDraw = Object.keys(this.options.items).length;

            if (this.options.colors.length !== this._options.itemsToDraw) {
                var colors = [];
                for (var i = 0; i < this._options.itemsToDraw; i++) {
                    var color = getColor(i, this._options.itemsToDraw);
                    colors.push('rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')');
                }
                this.options.colors = colors;
            }

            var w, h;
            w = this.element.width();
            h = this.element.height();

            var base = Math.min(w, h);
            this._options.centerX = w / 2;
            this._options.centerY = h / 2;


            this._options.radius = base * 0.8 / 2;
            this._options.innerRadius = base * 0.3 / 2;
            this._options.textRadius = (this._options.radius + this._options.innerRadius) / 2;
            this._options.arc = 2 * Math.PI / this._options.itemsToDraw;

            var widget = this;
            this.element.click(function (e) {

                var x;
                var y;
                if (e.pageX || e.pageY) {
                    x = e.pageX;
                    y = e.pageY;
                }
                else {
                    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }
                x -= this.offsetLeft;
                y -= this.offsetTop;

                var centerX = widget._options.centerX;
                var centerY = widget._options.centerY;

                if (Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2) < Math.pow(widget._options.innerRadius, 2)) {
                    if (!widget.is_rotating()) {
                        widget.spin();
                    }
                }

            });
        } else {
            throw 'Canvas not supported';
        }

        var widget = this;
        $(this.options.pointer).load(function () {
            widget._draw();
        });
    },

    _draw: function () {
        var ctx = this._options.ctx;
        var radius = this._options.radius;
        var innerRadius = this._options.innerRadius;
        var textRadius = this._options.textRadius;
        var currentAngle = this._options.currentAngle;
        var arc = this._options.arc;

        var cx = this._options.centerX;
        var cy = this._options.centerY;

        ctx.clearRect(0, 0, 500, 500);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.font = 'bold 14px Helvetica, Arial';

        var text, textWidth;
        var i = 0;


        ctx.fillStyle = '#388AE8';

        ctx.save();

        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
        ctx.clip();

        var shadowColor = this.is_rotating() ? 'black' : 'white';

        ctx.beginPath();

        ctx.strokeStyle = shadowColor;
        ctx.lineWidth = 5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = shadowColor;

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.arc(cx, cy, innerRadius + 3, 0, 2 * Math.PI);

        ctx.stroke();

        ctx.restore();


        for (var key in this.options.items) {
            var angle = currentAngle + i * arc;

            ctx.fillStyle = this.options.colors[i];

            ctx.beginPath();
            ctx.arc(cx, cy, radius, angle, angle + arc, false);
            ctx.arc(cx, cy, innerRadius, angle + arc, angle, true);
            ctx.stroke();
            ctx.fill();

            ctx.save();

            ctx.fillStyle = 'black';

            text = this.options.items[key];
            textWidth = ctx.measureText(text).width;

            ctx.translate(cx + Math.cos(angle + arc / 2) * textRadius,
                cy + Math.sin(angle + arc / 2) * textRadius);

            ctx.rotate(angle + arc / 2);


            ctx.fillText(text, textWidth > radius - innerRadius ? innerRadius - textRadius : -textWidth / 2, 0, radius - innerRadius);

            ctx.restore();
            i++;
        }

        ctx.fillStyle = 'black';
        ctx.drawImage(this.options.pointer, cx - 25, cy - radius - 45, 50, 50);

        if (!this.is_rotating()) {
            ctx.save();
            ctx.font = 'bold 30px Helvetica, Arial';
            var text = this.options.spinText;
            ctx.fillText(text, cx - ctx.measureText(text).width / 2, cy + 10);
            ctx.restore();
        }


    },

    _rotate: function () {
        this._options.spinTime += 30;
        if (this._options.spinTime >= this._options.spinTimeTotal) {
            this.stop();
            return;
        }
        var spinAngle = this._options.spinAngleStart - easeOut(this._options.spinTime, 0, this._options.spinAngleStart, this._options.spinTimeTotal);
        this._options.currentAngle += (spinAngle * Math.PI / 180);
        this._draw();
        var widget = this;
        this._options.spinTimeout = setTimeout(function () {
            widget._rotate();
        }, 30);
    },

    is_rotating: function () {
        return this._options.rotating;
    },

    spin: function () {
        this._options.rotating = true;
        this._options.spinAngleStart = Math.random() * 100 + 5 * Math.random() + 5 * Math.random() + 2 * Math.random();
        this._options.spinTime = 0;
        this._options.spinTimeTotal = Math.random() * 3000 + 4 * 1000 + 2 * Math.random();
        this._rotate();
    },

    stop: function () {
        this._options.rotating = false;
        clearTimeout(this._options.spinTimeout);
        this._draw();

        var degrees = this._options.currentAngle * 180 / Math.PI + 90;
        var arcd = this._options.arc * 180 / Math.PI;
        var index = Math.floor((360 - degrees % 360) / arcd);


        var keys = Object.keys(this.options.items);
        var key = keys[index];
        this.options.selected(key, this.options.items[key]);
    }
});
