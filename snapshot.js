//$(document).ready(function(){
var launchComments = function(options){
    var $this = this,
    timer,
    options = options || {},

    runH2c = function(afterRender){
        try {
                options.onrendered = options.onrendered || function( canvas ) {
                    $this.h2cCanvas = canvas;
                    $this.h2cDone = true;
                    if(!!afterRender)
                        (afterRender)();
            };

            window.html2canvas([ $('.canvas-table').get(0) ], options);
            

        } catch( e ) {

            $this.h2cDone = true;
        }
    },
    

    data = function() {
        if ( $this.h2cCanvas !== undefined ) {
            try {
                return ($this.h2cCanvas.toDataURL() );
            } catch( e ) {}
            
        }
    },
    
    captureImg = function(){
                window.clearTimeout( timer );
                canvas = document.createElement( "canvas" );
                ctx = canvas.getContext("2d");
                timer = window.setTimeout(function(){
                    container = $('.container');
                    ctx.drawImage($this.h2cCanvas, window.pageXOffset, window.pageYOffset, options.width, options.height, 0, 0, options.width, options.height);
                    ctx.clip();

                }, 100);
    },
    
    displayImage = function(){
        var imgData = data();    
        if ( imgData !== undefined ) {
            var img = new Image();
            img.src = imgData;
            img.style.width = options.width;
            img.id = 'commentsBackground';
            $('<div id = "preViewPic" class="preViewPic"/>').appendTo($('.table-row'));
            $('#preViewPic').append(initContainer({
                id     :img.id, 
                picUrl :img.src, 
                width  :options.width,
                height :options.height
            }));
        //$('#preViewPic').append(img);
        }
    };

    runH2c(function(){
        captureImg();
        displayImage();
    });        
};
//);