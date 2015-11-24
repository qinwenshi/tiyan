//$(document).ready(function(){
var launchComments = function(){
    var $this = this,
    timer,
    options = {},
    getBounds = function( el ) {
        return el.getBoundingClientRect();
    },

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
                    ctx.drawImage($this.h2cCanvas, window.pageXOffset, window.pageYOffset, container.width(), container.height(), 0, 0, container.width(), container.height() );
                    ctx.clip();

                }, 100);
    },

    displayImage = function(){
        var imgData = data();    
        if ( imgData !== undefined ) {
            var img = new Image();
            img.src = imgData;
            img.style.width = $('.container').width();
            img.id = 'commentsBackground';
            $('.table-row').append( img );
        }
    };


    runH2c(function(){
        captureImg();
        displayImage();
    });
    
        
};
//);