/*
 * Example plugin template
 */

jsPsych.plugins["virtual-chinrest"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "virtual-chinrest",
    parameters: {}
  }

  plugin.trial = function(display_element, trial) {
    var chin_data = {"dataType":"configurationData"};
    chin_data["ballPosition"] = [];
    chin_data["fullScreenClicked"] = false;
    chin_data["sliderClicked"] = false;

    (function ( distanceSetup, $ ) {
        distanceSetup.round = function(value, decimals) {
            return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
        };

        distanceSetup.px2mm = function(cardImageWidth) {
            const cardWidth = 85.6; //card dimension: 85.60 × 53.98 mm (3.370 × 2.125 in)
            var px2mm = cardImageWidth/cardWidth;
            chin_data["px2mm"] = distanceSetup.round(px2mm, 2);
            return px2mm;
        };
    }( window.distanceSetup = window.distanceSetup || {}, jQuery));

    function getCardWidth() {
        var cardWidthPx = $('#card').width();
        chin_data["cardWidthPx"] = distanceSetup.round(cardWidthPx,2);
        return cardWidthPx
    }

    function configureBlindSpot() {
        drawBall();
        $('#page-size').remove();
        $('#blind-spot').css({'visibility':'visible'});
        $(document).on('keydown', recordPosition);
    };

    jQuery('body').on('click','#btnCBS',function(e)
    {
        configureBlindSpot();
    });

    $( function() {
        $( "#slider" ).slider({value:"50"});
    } );

    $(document).ready(function() {
        $( "#slider" ).on("slide", function (event, ui) {
            var cardWidth = ui.value + "%";
            $("#card").css({"width":cardWidth});
        });
        $('#slider').on('slidechange', function(event, ui){
            chin_data["sliderClicked"] = true;
        });
    });

    //Ball Animation
    function drawBall(pos=180){
        // pos: define where the fixation square should be.
        var mySVG = SVG("svgDiv");
        const cardWidthPx = getCardWidth()
        const rectX = distanceSetup.px2mm(cardWidthPx)*pos;

        const ballX = rectX*0.6 // define where the ball is
        var ball = mySVG.circle(30).move(ballX, 50).fill("#f00");
        window.ball = ball;
        var square = mySVG.rect(30, 30).move(Math.min(rectX - 50, 950), 50); //square position
        chin_data["squarePosition"] = distanceSetup.round(square.cx(),2);
        chin_data['rectX'] = rectX
        chin_data['ballX'] = ballX
    };

    function animateBall()
    {
        ball.animate(7000).during(
            function(pos){
                moveX = - pos*data['ballX'];
                window.moveX = moveX;
                moveY = 0;
                ball.attr({transform:"translate("+moveX+","+moveY+")"});
            }
        ).loop(true, false).
        after(function()
        {
            animateBall();
        });

        //disable the button after clicked once.
        $("#start").attr("disabled", true);
    };

    jQuery("body").on('click', '#start' , function(e){
        animateBall();
    });

    function recordPosition(event, angle=13.5) {
        // angle: define horizontal blind spot entry point position in degrees.
        if (event.keyCode == '32') { //Press "Space"

            chin_data["ballPosition"].push(distanceSetup.round((ball.cx() + moveX),2));
            var sum = chin_data["ballPosition"].reduce((a, b) => a + b, 0);
            var ballPosLen = chin_data["ballPosition"].length;
            chin_data["avgBallPos"] = distanceSetup.round(sum/ballPosLen, 2);
            var ball_sqr_distance = (chin_data["squarePosition"]-chin_data["avgBallPos"])/chin_data["px2mm"];
            var viewDistance = ball_sqr_distance/Math.radians(angle)
            console.log(Math.radians(angle))
            chin_data["viewDistance_mm"] = distanceSetup.round(viewDistance, 2);

            //counter and stop
            var counter = Number($('#click').text());
            counter = counter - 1;
            var pauseAnimation = false;
            $('#click').text(Math.max(counter, 0));
            if (counter <= 0) {
                end_result = chin_data["viewDistance_mm"] * Math.tan(Math.radians(15.5)) * data["px2mm"] * 2;
                console.log(end_result, window.innerWidth, window.innerHeight)
                if (end_result < window.innerWidth && end_result < window.innerHeight){

                  ball.stop();

                  // Disable space key
                  $('html').bind('keydown', function(e)
                  {
                     if (e.keyCode == 32) {return false;}
                  });

                  // Display data
                  $('#info').css("visibility", "visible");
                  $('#info-h').append(chin_data["viewDistance_mm"]/10)

                  // data saving
                  var trial_data = chin_data;
                  console.log(trial_data);

                  // end trial
                  jsPsych.finishTrial(trial_data);
                } else {
                  $('#blind-spot').remove();
                  $('#page-size').css({'visibility':'visible'});
                  // display_element.querySelector('#main_instructions').innerHTML = "<h3 style='color=red'>Let's try this again.  Please move your head closer to the screen in order to achieve the prerequisite viewing distance.</h3>";
                  // display_element.querySelector('#start').disabled = false;
                  // pauseAnimation = true;
                  // chin_data["ballPosition"] = [];
                  // counter = 5;
                  $('#click').text(Math.max(counter, 0));
                }
            };

            ball.stop();
            if(!pauseAnimation) animateBall();
        }
    }

    //Helper Functions
    function fullScreen(){
        doc = document.documentElement;
        if(doc.requestFullScreen) {
            doc.requestFullScreen();
        } else if(doc.mozRequestFullScreen) {
            doc.mozRequestFullScreen();
        } else if(doc.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)) {
            doc.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    };

    function registerClick(){
        chin_data["fullScreenClicked"] = true;
    }

    // Converts from degrees to radians.
    Math.radians = function(degrees) {
      return degrees * Math.PI / 180;
    };

    html = '<div id="virtual-chinrest-page">' +
        '<div id="page-size">' +
            "<h3> Let's find out what your monitor size is (click to go into <div onclick='fullScreen(); registerClick();' style='display:inline; cursor:pointer; color: red'><em><u>full screen mode</u></em></div>).</h2>" +
            "<p>Please use any credit card that you have available (it can also be a grocery store membership card, your drivers license, or anything that is of the same format), hold it onto the screen, and adjust the slider below to its size.</p>" +
            "<p>(If you don't have access to a real card, you can use a ruler to measure image width to 3.37inch or 85.6mm, or make your best guess!)</p>" +
            "<b style='font-style: italic'>Make sure you put the card onto your screen.</b>" +
            "<br>" +
            "<div id='container'>" +
                "<div id='slider'></div>" +
                "<br>" +
                "<img id='card' src='virtual_chinrest-master/src/card.png' style='width: 50%'>" +
                "<br><br>" +
                "<button class='btn btn-primary' id='btnCBS'>Click here when you are done!</button>" +
            "</div>" +
        "</div>" +
        '<div id="blind-spot" style="visibility: hidden">' +
            "<div id='main_instructions'>" + "<h3>Now, let’s quickly test how far away you are sitting.</h3>" +
            "<p>You might know that vision tests at a doctor’s practice often involve chinrests; the doctor basically asks you to sit away from a screen in a specific distance. We do this here with a virtual chinrest.</p>" +
            "</div>" +
            "<h3>Instructions</h3>" +
            "<p>1. Put your finger on <b>space bar</b> on the keyboard.</p>" +
            "<p>2. Close your right eye. <em>(Tips: it might be easier to cover your right eye by hand!)</em></p>" +
            "<p>3. Using your left eye, focus on the black square.</p>" +
            "<p>4. Click the button below to start the animation of the red ball. The <b style='color: red'>red ball</b> will disappear as it moves from right to left. Press the “Space” key as soon as the ball disappears from your eye sight.</p>" +
            "<br>" +
            "<p>Please do it <b>five</b> times. Keep your right eye closed and hit the “Space” key fast!</p>" +
            "<br>" +
            "<button class='btn btn-primary' id='start'>Start</button>" +

            '<div id="svgDiv" style="width:1000px;height:200px;"></div>' +
            "Hit 'space' <div id='click' style='display:inline; color: red; font-weight: bold'>5</div> more times!" +
        "</div>" +

        '<div id="chinrest-info" style="visibility:hidden">' +
            '<h3 id="info-h">Estimated viewing distance (cm): </h3>' +
            "<p id='info-p'>View more output data in the Console in your browser's developer/inspector view.</p>" +
        "</div>" +
    "</div>"

    display_element.innerHTML = html;
  };

  return plugin;
})();
