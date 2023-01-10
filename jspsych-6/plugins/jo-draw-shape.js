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
    var trial_duration = 5;
    var num_frames = xPos.length;
    var radius = 4;
    var myReq;
    var interrupt_point = num_frames * trial.prop_complete;
    var factor = 250;
    var displace = get_sample(range(100, 300), 1)[0];

    function getDistance(xA, yA, xB, yB) {
        var xDiff = xA - xB;
        var yDiff = yA - yB;

        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }
    var midpoint = ([x1, y1], [x2, y2]) => [(x1 + x2) / 2, (y1 + y2) / 2];
    var xA = xPos[0]*factor+displace;
    var xB = xPos[interrupt_point]*factor+displace;
    var yA = yPos[0]*factor+displace;
    var yB = yPos[interrupt_point]*factor+displace;

    if (trial.condition=='unfinished'){
        var square_center = [xA+400, yA+get_sample(range(20, 50), 1)[0]];
        var square_center2 = [xA+get_sample(range(20, 50), 1)[0], yA+300];
        var square_dist = getDistance(xA, yA, xB, yB)*get_sample([0.5, 0.75, 1, 1.25, 1.5], 1)[0];
        var square_dist2 = getDistance(xA, yA, xB, yB)*get_sample([0.5, 0.75, 1, 1.25, 1.5], 1)[0];
    } else {
//        var square_center = [xA, yA];
        var square_center = midpoint([xA, yA], [xB, yB]);
        var square_center2 = [xA+400, yA+get_sample(range(20, 50), 1)[0]];
        var square_dist = getDistance(xA, yA, xB, yB);
        var square_dist2 = getDistance(xA, yA, xB, yB)*get_sample([0.5, 0.75, 1, 1.25, 1.5], 1)[0];
    }

    var radians = Math.atan2((yB-yA), (xB-xA));

    console.log(trial.condition, shape_id, radians);

    var draw_square = false;
    move_disc();

    var final_frame = 0;

    function move_disc(){
        current_time = performance.now();
        time_elapsed = parseFloat(current_time - start_time)/1000;
        percent_time = time_elapsed / parseFloat(trial_duration);

//        console.log(parseInt(percent_time*num_frames));

        if (parseInt(percent_time*num_frames)<num_frames){
            get_pos = [xPos[parseInt(percent_time*num_frames)]*factor+displace, yPos[parseInt(percent_time*num_frames)]*factor+displace];
        }

        if (!draw_square){
            context.beginPath();
            context.arc(square_center[0], square_center[1], square_dist/2, 0, 2 * Math.PI, false);
            context.fillStyle = '#003300';
            context.fill();
            context.lineWidth = 5;
            context.strokeStyle = '#003300';
            context.closePath();

            context.beginPath();
            context.arc(square_center2[0], square_center2[1], square_dist2/2, 0, 2 * Math.PI, false);
            context.fillStyle = '#003300';
            context.fill();
            context.lineWidth = 5;
            context.strokeStyle = '#003300';
            context.closePath();

            draw_square = true;
        }

        context.beginPath();
        context.arc(get_pos[0], get_pos[1], radius, 0, 2 * Math.PI, false);
        context.fillStyle = '#003300';
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = '#003300';
        context.stroke();

        myReq = requestAnimationFrame(function(){move_disc()});
        if (parseInt(percent_time*num_frames) > interrupt_point+5){
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

                context.beginPath();
                context.arc(square_center[0], square_center[1], square_dist/2, 0, 2 * Math.PI, false);
                context.fillStyle = '#003300';
                context.fill();
                context.lineWidth = 5;
                context.strokeStyle = '#003300';
                context.closePath();

                context.beginPath();
                context.arc(square_center2[0], square_center2[1], square_dist2/2, 0, 2 * Math.PI, false);
                context.fillStyle = '#003300';
                context.fill();
                context.lineWidth = 5;
                context.strokeStyle = '#003300';
                context.closePath();
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
