/**
 * @author Alexander Farkas
 * v. 1.21
 */


(function ($) {
    if (!document.defaultView || !document.defaultView.getComputedStyle) { // IE6-IE8
        var oldCurCSS = jQuery.curCSS;
        jQuery.curCSS = function (elem, name, force) {
            if (name === 'background-position') {
                name = 'backgroundPosition';
            }
            if (name !== 'backgroundPosition' || !elem.currentStyle || elem.currentStyle[name]) {
                return oldCurCSS.apply(this, arguments);
            }
            var style = elem.style;
            if (!force && style && style[name]) {
                return style[name];
            }
            return oldCurCSS(elem, 'backgroundPositionX', force) + ' ' + oldCurCSS(elem, 'backgroundPositionY', force);
        };
    }

    var oldAnim = $.fn.animate;
    $.fn.animate = function (prop) {
        if ('background-position' in prop) {
            prop.backgroundPosition = prop['background-position'];
            delete prop['background-position'];
        }
        if ('backgroundPosition' in prop) {
            prop.backgroundPosition = '(' + prop.backgroundPosition;
        }
        return oldAnim.apply(this, arguments);
    };

    function toArray(strg) {
        strg = strg.replace(/left|top/g, '0px');
        strg = strg.replace(/right|bottom/g, '100%');
        strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g, "$1px$2");
        var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
        return [parseFloat(res[1], 10), res[2], parseFloat(res[3], 10), res[4]];
    }

    $.fx.step.backgroundPosition = function (fx) {
        if (!fx.bgPosReady) {
            var start = $.curCSS(fx.elem, 'backgroundPosition');

            if (!start) {//FF2 no inline-style fallback
                start = '0px 0px';
            }

            start = toArray(start);

            fx.start = [start[0], start[2]];

            var end = toArray(fx.options.curAnim.backgroundPosition);
            fx.end = [end[0], end[2]];

            fx.unit = [end[1], end[3]];
            fx.bgPosReady = true;
        }
        //return;
        var nowPosX = [];
        nowPosX[0] = ((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0] + fx.unit[0];
        nowPosX[1] = ((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1] + fx.unit[1];
        fx.elem.style.backgroundPosition = nowPosX[0] + ' ' + nowPosX[1];

    };

    /* position of the <li> that is currently shown */
    var current = 0;

    var loaded = 0;
    for (var i = 1; i < 4; ++i)
        $('<img />').load(function () {
            ++loaded;
            if (loaded == 3) {
                $('#bg1,#bg2,#bg3').mouseover(function (e) {

                    var $this = $(this);
                    /* if we hover the current one, then don't do anything */
                    if ($this.parent().index() == current)
                        return;

                    /* item is bg1 or bg2 or bg3, depending where we are hovering */
                    var item = e.target.id;

                    /*
                    this is the sub menu overlay. Let's hide the current one
                    if we hover the first <li> or if we come from the last one,
                    then the overlay should move left -> right,
                    otherwise right->left
                     */
                    if (item == 'bg1' || current == 2)
                        $('#menu .sub' + parseInt(current + 1)).stop().animate({ backgroundPosition: "(-266px 0)" }, 300, function () {
                            $(this).find('li').hide();
                        });
                    else
                        $('#menu .sub' + parseInt(current + 1)).stop().animate({ backgroundPosition: "(266px 0)" }, 300, function () {
                            $(this).find('li').hide();
                        });

                    if (item == 'bg1' || current == 2) {
                        /* if we hover the first <li> or if we come from the last one, then the images should move left -> right */
                        $('#menu > li').animate({ backgroundPosition: "(-800px 0)" }, 0).removeClass('bg1 bg2 bg3').addClass(item);
                        move(1, item);
                    }
                    else {
                        /* if we hover the first <li> or if we come from the last one, then the images should move right -> left */
                        $('#menu > li').animate({ backgroundPosition: "(800px 0)" }, 0).removeClass('bg1 bg2 bg3').addClass(item);
                        move(0, item);
                    }

                    /*
                    We want that if we go from the first one to the last one (without hovering the middle one),
                    or from the last one to the first one, the middle menu's overlay should also slide, either
                    from left to right or right to left.
                     */
                    if (current == 2 && item == 'bg1') {
                        $('#menu .sub' + parseInt(current)).stop().animate({ backgroundPosition: "(-266px 0)" }, 300);
                    }
                    if (current == 0 && item == 'bg3') {
                        $('#menu .sub' + parseInt(current + 2)).stop().animate({ backgroundPosition: "(266px 0)" }, 300);
                    }


                    /* change the current element */
                    current = $this.parent().index();

                    /* let's make the overlay of the current one appear */

                    $('#menu .sub' + parseInt(current + 1)).stop().animate({ backgroundPosition: "(0 0)" }, 300, function () {
                        $(this).find('li').fadeIn();
                    });
                });
            }
        }).attr('src', 'img/' + i + '.jpg');


    /*
    dir:1 - move left->right
    dir:0 - move right->left
     */
    function move(dir, item) {
        if (dir) {
            $('#bg1').parent().stop().animate({ backgroundPosition: "(0 0)" }, 200);
            $('#bg2').parent().stop().animate({ backgroundPosition: "(-266px 0)" }, 300);
            $('#bg3').parent().stop().animate({ backgroundPosition: "(-532px 0)" }, 400, function () {
                $('#menuWrapper').removeClass('bg1 bg2 bg3').addClass(item);
            });
        }
        else {
            $('#bg1').parent().stop().animate({ backgroundPosition: "(0 0)" }, 400, function () {
                $('#menuWrapper').removeClass('bg1 bg2 bg3').addClass(item);
            });
            $('#bg2').parent().stop().animate({ backgroundPosition: "(-266px 0)" }, 300);
            $('#bg3').parent().stop().animate({ backgroundPosition: "(-532px 0)" }, 200);
        }
    }
})(jQuery);