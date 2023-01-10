/*
 * Example plugin template
 */

jsPsych.plugins["jo-pest-contrast"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "jo-pest-contrast",
    parameters: {
      brightness_change: {
        type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: .03
      },
      grid_size: {
        type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: 200
      },
      with_prompt: {
        type: jsPsych.plugins.parameterType.BOOL, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: true
      },
      check_correct: {
        type: jsPsych.plugins.parameterType.BOOL, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: false
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    display_element.innerHTML = '';
    if (trial.with_prompt){
        display_element.innerHTML = "<div style='position:absolute; top:10%; left:41%'><p>Which is different?</p><p>(J - LEFTMOST, K - RIGHTMOST)</p></div>";
    }
    display_element.innerHTML += "<div id='warning' style='display: none'><p style='color: red'>Oops, you pressed the wrong key!  Try again.</p></div>";
    display_element.innerHTML += "<canvas id='myCanvas' style='display: none' width='"+trial.grid_size+"' height='"+trial.grid_size+"'></canvas>";
    document.documentElement.style.cursor = 'none';

    var start_x = 0;
    var start_y = 1;
    var num_squares = 3;
    var square_size = trial.grid_size/num_squares;
    var grid_dict = {};
    var standard_opacity = 0.24;
    var new_opacity = 0.24;

//    var shape_squares = get_sample(['0_0', '0_1', '0_2', '1_0', '1_1', '1_2', '2_0', '2_1', '2_2'], 5);
//    var change = 1;//get_sample([1, 0], 1)[0];

    var change_square = get_sample(['0_1', '2_1'], 1)[0];

    function drawSquares(context) {
        context.clearRect(0, 0, trial.grid_size, trial.grid_size);
        for (x = start_x; x < num_squares; x++){
            context.beginPath();
            var block_x = x
            var block_y = start_y;
            var block_id = block_x.toString() + "_" + block_y.toString();
            grid_dict[block_id] = 0;

            new_opacity = standard_opacity - trial.brightness_change;

            if (block_id==change_square){
                context.fillStyle = "rgba(120, 120, 120, " + new_opacity.toString() + ")";
                console.log("NEW OPACITY", new_opacity)
            } else {
                context.fillStyle = "rgba(120, 120, 120, " + standard_opacity.toString() + ")";
            }

            context.fillRect(block_x * square_size, block_y * square_size, square_size, square_size);
            context.strokeStyle = "#505050";
            context.lineWidth = 0.8;
            context.strokeRect(block_x * square_size, block_y * square_size, square_size, square_size);

            context.closePath();
        };
    };

    var canvas = display_element.querySelector('#myCanvas');
    var context = canvas.getContext('2d');

    setTimeout(function(){
        display_element.querySelector('#myCanvas').setAttribute('style', 'display:block');
        drawSquares(context);
    }, 500);

    document.addEventListener('keydown', check_key, true);

    if (!trial.with_prompt){
        document.removeEventListener('keydown', check_key, true);
        setTimeout(function(){ end_trial()}, 3000)
    }

    var response;
    var correct = 0;
    function check_key(evt){
        if (evt.key=='j' || evt.key=='k'){
            response = evt.key;
            if (change_square=='0_1'){
                if (response=='j'){ correct = 1}
            } else if (change_square=='2_1'){
                if (response=='k'){ correct = 1}
            }
            if (trial.check_correct){
                if (correct==0){
                    display_element.querySelector('#warning').setAttribute('style', 'display: block; position: absolute; top: 70%; left: 38%');
                } else {
                    end_trial();
                }
            } else {
                end_trial();
            }
        }
    }

    function end_trial(){
        document.removeEventListener('keydown', check_key, true);

        // data saving
        var trial_data = {
          brightness_change: trial.brightness_change,
          correct: correct
        };

        // end trial
        jsPsych.finishTrial(trial_data);
    }

  };

  return plugin;
})();
