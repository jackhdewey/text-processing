/*
 * Example plugin template
 */

jsPsych.plugins["jo-draw-shape"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "jo-draw-shape",
    parameters: {
      condition: {
        type: jsPsych.plugins.parameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: "unfinished"
      },
      prop_complete: {
        type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: .96
      },
      shape_id: {
        type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: 0
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var canvas_w = screen.width * .9;
    var canvas_h = screen.height * .8;
    display_element.innerHTML = "<div style='align:center; margin: 0 auto'>"+"<canvas id='myCanvas' width='"+canvas_w+"' height='"+canvas_h+"'></canvas>"+"</div>";

    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;

    var shape_id = trial.shape_id;
    var xPos = x_dict[shape_id];
    var yPos = y_dict[shape_id];

    var start_time = performance.now();
    var current_time = performance.now();
    var time_elapsed = 0;
    var trial_duration = 3;
    var num_frames = xPos.length;
    var radius = 1;
    var myReq;
    var interrupt_point = num_frames * trial.prop_complete;
    var factor = 250;
    var displace = get_sample(range(100, 300), 1)[0];

    for (i=0; i<interrupt_point; i++){
        get_pos = [xPos[i]*factor+displace, yPos[parseInt(i)]*factor+displace];
        context.beginPath();
        context.arc(get_pos[0], get_pos[1], radius, 0, 2 * Math.PI, false);
        context.fillStyle = '#003300';
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = '#003300';
        context.stroke();
    }

    move_disc();

    var frame_drawn = parseInt(interrupt_point);
    var frames_left = num_frames - frame_drawn;
    var final_frame = 0;
    function move_disc(){

        current_time = performance.now();
        time_elapsed = parseFloat(current_time - start_time)/1000;
        percent_time = time_elapsed / parseFloat(trial_duration);

        get_pos = [xPos[frame_drawn+parseInt(percent_time*frames_left)]*factor+displace, yPos[frame_drawn+parseInt(percent_time*frames_left)]*factor+displace];

        context.beginPath();
        context.arc(get_pos[0], get_pos[1], radius, 0, 2 * Math.PI, false);
        context.fillStyle = '#003300';
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = '#003300';
        context.stroke();

        myReq = requestAnimationFrame(function(){move_disc()});
        if ((frame_drawn+parseInt(percent_time*frames_left)) > num_frames-1){
            final_frame = parseInt(percent_time*num_frames);
            window.cancelAnimationFrame(myReq);
            document.addEventListener('keydown', get_key)
        };
    }

    function get_key(evt){
        console.log(evt.key);
        if (evt.key==' '){
            document.removeEventListener('keydown', get_key);
            for (i=0; i<final_frame; i++){
                get_pos = [xPos[i]*factor+displace, yPos[i]*factor+displace];
                context.beginPath();
                context.arc(get_pos[0], get_pos[1], radius, 0, 2 * Math.PI, false);
                context.fillStyle = 'purple';
                context.fill();
                context.lineWidth = 5;
                context.strokeStyle = 'purple';
                context.stroke();
            }
            end_trial();
        }
    }

    // data saving
    var trial_data = {
      parameter_name: 'parameter value'
    };

    // end trial
    function end_trial(){
        setTimeout(function(){
            jsPsych.finishTrial(trial_data);
        }, 500)


    }
  };

  return plugin;
})();
