var ownSketchIdCounter = 0;

docify.ready = function() {

    var selectedChapter = 0;
    initializeSketches($(".chapter:nth-child(" + (selectedChapter + 1) + ")"));

    $(".menu-entry").first().addClass("selected")
    $(".chapter").first().fadeIn();

    $(".menu-entry").each(function(index) {
        var that = this;

        if ($(that).text().charAt(0) == ' ' || $(that).text().charAt(0) == '\t') {
            $(that).addClass('subchapter');
        }

        $(this).click(function() {
            var scrollY = window.pageYOffset;

            var chapterTop = $(".chapter:nth-child(" + (selectedChapter + 1) + ")").css("top");
            chapterTop = parseInt(chapterTop);

            var dir = 1;
            if (index > selectedChapter) {
                dir = -1;
            }

            stopSketches($(".chapter:nth-child(" + (selectedChapter + 1) + ")"));
            $(".menu-entry:nth-child(" + (selectedChapter + 1) + ")").removeClass("selected");
            $(".chapter:nth-child(" + (selectedChapter + 1) + ")").fadeOut({
                progress: function(obj, p, r) {
                    //$(obj.elem).css("top", chapterTop + dir * (p) * 50);
                    window.scrollTo(0, (1 - p) * scrollY);
                }
            });

            selectedChapter = index;
            initializeSketches($(".chapter:nth-child(" + (selectedChapter + 1) + ")"));
            $(".menu-entry:nth-child(" + (selectedChapter + 1) + ")").addClass("selected");
            $(".chapter:nth-child(" + (selectedChapter + 1) + ")").fadeIn({
                progress: function(obj, p, r) {
                    //$(obj.elem).css("top", chapterTop - dir * (1 - p) * 50);
                }
            });
        });
    });

    // display text as one or two coloumns
    $(".t3").each(function(index) {
        if ($(this).text().length < 250) {
            $(this).addClass("one-coloumn");
        }
    });

    // optimize code blocks
    $("p:has(code)").addClass("code");
    $("p.code").prev("p.code").addClass("not-last");


    $(".svg").each(function(index, elem) {
        elem.onload = function() {
            // remove border from svg files when specified with <!-- noborder -->
            var nodes = elem.contentDocument.childNodes;
            for (var i = 0; i < nodes.length; i++) {
                if(nodes[i].nodeName == "#comment") {
                    if (nodes[i].data.match(/noborder/g)) {
                        $(elem).addClass('noborder');
                    }
                }
            };
        }
    });

    $("iframe").each(function(index, elem) {
        elem.onload = function() {
            // remove border from svg files when specified with <!-- noborder -->
            var nodes = elem.contentDocument.childNodes;
            for (var i = 0; i < nodes.length; i++) {
                if(nodes[i].nodeName == "#comment") {
                    if (nodes[i].data.match(/noborder/g)) {
                        $(elem).addClass('noborder');
                    }
                }
            };

            // adjust content of iframe according to the width and height of the containing svg element
            var content = elem.contentDocument;

            var w = parseInt($(content).find("svg").attr("width"));
            var h = parseInt($(content).find("svg").attr("height"));

            $(elem).css("height", h);
        }
    });



    /*
        $(".image").each(function(index) {
            console.log( $(this).
        });
    */
};

function stopSketches(chapter) {
    var sketches = chapter.find('canvas');
    
    _.each(sketches, function(sketch) {
        // remember dimensions of the sketch
        var w = sketch.getAttribute('width');
        var h = sketch.getAttribute('height');
        var url = sketch.getAttribute('data-processing-sources');

        $(sketch).replaceWith('<canvas id="p5sketch' + ownSketchIdCounter + '" class="sketch" data-processing-sources="' + url + '"></canvas>')
        var newCanvas = $('canvas#p5sketch' + ownSketchIdCounter);
        newCanvas.css({
            width: w + "px",
            height: h + "px"
        });

        ownSketchIdCounter++;
    });

}

function initializeSketches(chapter) {
    var sketches = chapter.find('canvas');
    _.each(sketches, function(sketch) {
        Processing.loadSketchFromSources(sketch, [sketch.getAttribute('data-processing-sources')]);
    });
}

function resetSketch(resetButton) {
    var url = resetButton.dataset.url;
    var res = $("body").find("[data-processing-sources='" + url + "']");
    var sketch = res[0];

    // remember dimensions of the sketch
    var w = sketch.getAttribute('width');
    var h = sketch.getAttribute('height');

    $(sketch).replaceWith('<canvas id="p5sketch' + ownSketchIdCounter + '" class="sketch" data-processing-sources="' + url + '"></canvas>')
    var newCanvas = $('canvas#p5sketch' + ownSketchIdCounter);
    newCanvas.css({
        width: w + "px",
        height: h + "px"
    }); // set the new canvas to the remembered dimensions to prevent the page from jumping

    Processing.loadSketchFromSources(newCanvas[0], [url]);

    ownSketchIdCounter++;
}


function resetSVG(resetButton) {
    var url = resetButton.dataset.url;
    var res = $("body").find("[data-src='" + url + "']");
    var svg = $(res[0]);
    var noborder = svg.hasClass("noborder");

    if (noborder) {
        svg.replaceWith('<img class="image svg noborder" data-src="'+url+'" src="' + (url+"?r="+Math.random()) + '"></img>')
    } else {
        svg.replaceWith('<img class="image svg" data-src="'+url+'" src="' + (url+"?r="+Math.random()) + '"></img>')
    }
}

function resetHTML(resetButton) {
    var url = resetButton.dataset.url;
    var res = $("body").find("[data-src='" + url + "']");
    var html = $(res[0]);
    var noborder = html.hasClass("noborder");

    // remember dimensions of the sketch
    var style = html.attr('style');

    if (noborder) {
        html.replaceWith('<iframe class="html noborder" data-src="'+url+'" src="' + (url+"?r="+Math.random()) + '" scrolling="no" style="'+style+'"></iframe>')
    } else {
        html.replaceWith('<iframe class="html" data-src="'+url+'" src="' + (url+"?r="+Math.random()) + '" scrolling="no" style="'+style+'"></iframe>')
    }
}





