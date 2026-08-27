(function(){
    var perTag = document.getElementById('donut')
    //angles, radius and contants
    var A = 1;
    var B = 1;
    var isDragging = false;
    var lastX = 0;
    var lastY = 0;
    var autoRotate = true;
    var resumeTimeout;
    var baseSpeedA = 0.07;
    var baseSpeedB = 0.03;
    var donutScale = 1.5;
    var lastFrameTime = 0;
    var frameAccumulator = 0;

    function getFrameDimensions() {
        var scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
        var fontSize = Math.max(4, Math.min(10, 10 * scale));
        var charWidth = fontSize * 0.6;
        var frameScale = Math.min(
            1,
            (window.innerWidth - 32) / (560 * charWidth),
            (window.innerHeight - 32) / (320 * fontSize)
        );

        perTag.style.setProperty('--ascii-font-size', fontSize + 'px');
        return {
            width: Math.max(80, Math.floor(560 * frameScale)),
            height: Math.max(48, Math.floor(320 * frameScale))
        };
    }

    //function to render ASCII frame
    function renderAsciiFrame(elapsedMs) {
        var b = []; // Array to stay ascii chars
        var z = []; // Array to store depth values

        if (!Number.isFinite(A) || !Number.isFinite(B)) {
            A = 1;
            B = 1;
        }

        var dimensions = getFrameDimensions();
        var width = dimensions.width;
        var height = dimensions.height;
        var projectionScale = Math.min(donutScale, width / 100, height / 60);

        if (autoRotate) {
            var rotationScale = (elapsedMs || 40) / 40;
            A += baseSpeedA * rotationScale; // Increament angle a
            B += baseSpeedB * rotationScale; // Increament angle b
        }

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
                    h, D, t;

                h = ct + 2;
                D = 1 / (sp * h * sA + st * cA + 4);
                if (!Number.isFinite(D)) D = 0;
                t = sp * h * cA - st * sA;  //Temporary variable
                //Calculate cordinates of ascii char
                var x = Math.floor(width / 2 + (width / 4) * projectionScale * D * (cp * h * cB - t * sB));
                var y = Math.floor(height / 2 + (height / 4) * projectionScale * D * (cp * h * sB + t * cB));

                if (!Number.isFinite(x)) x = Math.floor(width / 2);
                if (!Number.isFinite(y)) y = Math.floor(height / 2);

                if (x < 0 || x >= width || y < 0 || y >= height) continue;

                //Calculate the index in the array
                var o = x + width * y;
            //Calculate the ascii char index
            var N = Math.floor(8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB) )

            //Update ascii char and depth if conditions are met
            if(D > z[o]){
                z[o] = D;
                //Update the ascii char based on the index
                b[o] = '.,-~:;=!*#$@'[N > 0 ? N : 0]
            }
            }
        }

        //Update html element with the ascii frame
        perTag.innerHTML = b.join('');

   }

    var themeToggle = document.getElementById('themeToggle');
    var themeSwitcher = document.getElementById('themeSwitcher');
    if (themeToggle && themeSwitcher) {
        themeToggle.addEventListener('click', function() {
            var isOpen = themeSwitcher.classList.toggle('open');
            themeToggle.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', function(event) {
            if (!themeSwitcher.contains(event.target)) {
                themeSwitcher.classList.remove('open');
                themeToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    var schemeRadios = document.querySelectorAll('input[name="colorScheme"]');
    schemeRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
            if (radio.checked) {
                document.body.setAttribute('data-scheme', radio.value);
                localStorage.setItem('donut-scheme', radio.value);
            }
        });
    });

    var savedScheme = localStorage.getItem('donut-scheme') || 'classic';
    document.body.setAttribute('data-scheme', savedScheme);
    var matchingRadio = document.querySelector('input[name="colorScheme"][value="' + savedScheme + '"]');
    if (matchingRadio) matchingRadio.checked = true;

       perTag.addEventListener('pointerdown', function(event) {
           event.preventDefault();
           clearTimeout(resumeTimeout);
           isDragging = true;
           autoRotate = false;
           lastX = event.clientX;
           lastY = event.clientY;
           perTag.setPointerCapture(event.pointerId);
       });

       window.addEventListener('pointermove', function(event) {
           if (!isDragging) return;
           B += (event.clientX - lastX) * 0.005;
           A += (event.clientY - lastY) * 0.005;
           lastX = event.clientX;
           lastY = event.clientY;
           renderAsciiFrame();
       });

       function stopDragging() {
           isDragging = false;
           clearTimeout(resumeTimeout);
           resumeTimeout = setTimeout(function() {
               autoRotate = true;
           }, 2000);
       }

       window.addEventListener('pointerup', stopDragging);
       window.addEventListener('pointercancel', stopDragging);

   // Render at a stable cadence while keeping rotation independent of frame rate.
   function startAsciiAnimation(){
        function animate(timestamp) {
            if (!lastFrameTime) lastFrameTime = timestamp;
            frameAccumulator += timestamp - lastFrameTime;
            lastFrameTime = timestamp;

            if (frameAccumulator >= 33) {
                renderAsciiFrame(Math.min(frameAccumulator, 66));
                frameAccumulator -= 33;
            }

            window.asciiAnimationId = requestAnimationFrame(animate);
        }

        window.asciiAnimationId = requestAnimationFrame(animate);
    }

    document.addEventListener('visibilitychange', function() {
        lastFrameTime = 0;
        frameAccumulator = 0;
    });

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