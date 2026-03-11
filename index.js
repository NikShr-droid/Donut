function setTheme(theme) {
    document.body.setAttribute('data-theme', theme)
}
function toggleMenu() {
    const switcher = document.getElementById('themeSwitcher');
    switcher.classList.toggle('open');
}

(function(){
    var perTag = document.getElementById('donut')
    //angles, radius and contants
    var A = 1;
    var B = 1;
    var R1 = 1; 
    var R2 = 2;
    var K1 = 150;
    var K2 = 30;

    //function to render ASCII frame
    function renderAsciiFrame() {
        var b = []; // Array to stay ascii chars
        var z = []; // Array to store depth values

        var width = 280; // Width of frame 
        var height = 160; // Height of frame

        A += 0.07; // Increament angle a
        B += 0.03; // Increament angle b

        // Sin and Cosine of angles
        var cA = Math.cos(A),
            sA = Math.sin(A),
            cB = Math.cos(B),
            sB = Math.sin(B);

        // Initialize array with default angles
        for(var k = 0; k < width * height; k++){
            //set default ascii char
            b[k] = k % width == width - 1 ? '\n' : ' ';
            //set default depth
            z[k] = 0;
        }

        //Generate the ascii frame
        for (var j = 0; j < 6.28; j += 0.07) {  
            var ct = Math.cos(j); //Cosine of j
            var st = Math.sin(j); //Sin of j
            
            for(var i = 0; i < 6.28; i += 0.02){
                var sp = Math.sin(i), //Sin of i
                    cp = Math.cos(i), //Cosine of i
                    h = ct + 2, //Height calculation
                    D = 1 / (sp * h * sA + st * cA + 5), //Distance calculation
                    t = sp * h * cA - st * sA;  //Temporary variable
                //Calculate cordinates of ascii char
                var x = Math.floor(width / 2 + (width / 4) * D * (cp * h * cB - t * sB));
                var y = Math.floor(height / 2 + (height / 4) * D * (cp * h * sB + t * cB));

                //Calculate the index in the array
                var o = x + width * y;
            //Calculate the ascii char index
            var N = Math.floor(8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB) )

            //Update ascii char and depth if conditions are met
            if(y < height && y >= 0 && x >= 0 && x < width && D > z[o]){
                z[o] = D;
                //Update the ascii char based on the index
                b[o] = '.,-~:;=!*#$@'[N > 0 ? N : 0]
            }
            }
        }

        //Update html element with the ascii frame
        perTag.innerHTML = b.join('');

   }

   //Function to start the animation
   function startAsciiAnimation(){
        //Start it by calling renderAsciiAnimation every 50ms
        window.asciiIntervalId = setInterval(renderAsciiFrame, 40);
    }

    renderAsciiFrame(); //Render the initial ascii frame
    //Add event listner to start animation when page is loaded 
    if(document.all){
        //for older versions of internet exploarer
        window.attachEvent('onload', startAsciiAnimation)
    }else{
        //For mordern  browsers
        window.addEventListener('load', startAsciiAnimation, false);
    }

    //Add evevnt listner to update ascii frame when window resized 
    window.addEventListener('resize', renderAsciiFrame);
})();