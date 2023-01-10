/*
 * Example plugin template
 */

jsPsych.plugins["move-disc"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "move-disc",
    parameters: {
      parameter_name: {
        type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: undefined
      },
      parameter_name: {
        type: jsPsych.plugins.parameterType.IMAGE,
        default: undefined
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var html = '<canvas id="myCanvas" width="600" height="600"></canvas>';
    display_element.innerHTML = html;

    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = 10;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();

    var distance = 100;
    var start_pos = [centerX, centerY];
    var trial_duration = 0.5;
    var pos_array = [];
    var speed = 2;
    var fps = 60;
    var num_frames = fps * trial_duration;

    var newX = start_pos[0];
    var newY = start_pos[1];
    for (i=0; i<num_frames; i++){
        newX = newX + parseFloat(distance)/fps * speed;
        newY = newY + parseFloat(distance)/fps * speed;
        pos_array.push([newX, newY]);
    }
    console.log(pos_array);

    var start_time = performance.now();
    var current_time = performance.now();
    var time_elapsed = 0;
    move_disc();

    function move_disc(){
        if (time_elapsed < trial_duration){
            current_time = performance.now();
            time_elapsed = parseFloat(current_time - start_time)/1000;
            percent_time = time_elapsed / parseFloat(trial_duration);

            console.log(parseInt(percent_time*num_frames));

            if (parseInt(percent_time*num_frames)<num_frames){
                get_pos = pos_array[parseInt(percent_time*num_frames)];
            }

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            context.arc(get_pos[0], get_pos[1], radius, 0, 2 * Math.PI, false);
            context.fillStyle = 'green';
            context.fill();
            context.lineWidth = 5;
            context.strokeStyle = '#003300';
            context.stroke();

            requestAnimationFrame(function(){move_disc()})
        };
    }

    // data saving
    var trial_data = {
      parameter_name: 'parameter value'
    };

    // end trial
//    jsPsych.finishTrial(trial_data);
  };

  return plugin;
})();
