/**
 * jspsych-html-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["ffov"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'ffov',
    description: '',
    parameters: {
      canvas_size: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Canvas size',
        default: [1280, 1024],
        description: 'The HTML string to be displayed'
      },
      target_pos: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Target location',
        default: null,
        description: 'Which line will be tilted'
      },
      viewing_distance: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Viewing distance',
        default: 300
      },
      lpd: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'LPD',
        default: 5
      },
      show_mask: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Show mask',
        default: true
      },
      show_resp: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Show response',
        default: true
      },
      highlight_line: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Show target',
        default: false
      },
      line_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Duration of lines',
        default: 500
      },
      check_answer: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Show target',
        default: false
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var mask_img = 'images/mask_lines.png';
    var mask_size = 40;

    // in degrees
    var target_w_deg = 0.2;
    var target_h_deg = 1;
    var ecc_10_deg = 5 // 4.5;
    var ecc_20_deg = 10 // 9;
    var ecc_30_deg = 15 // 13.5;
    var sin_cos = 0.71;

    // convert to pixels
    Math.radians = function(degrees) {
      return degrees * Math.PI / 180;
    };
    var canvas_w = window.innerWidth;
    var canvas_h = window.innerHeight;
    var target_w = trial.viewing_distance * Math.tan(Math.radians(target_w_deg)) * trial.lpd;
    var target_h = trial.viewing_distance * Math.tan(Math.radians(target_h_deg)) * trial.lpd;
    var ecc_10 = trial.viewing_distance * Math.tan(Math.radians(ecc_10_deg)) * trial.lpd;
    var ecc_20 = trial.viewing_distance * Math.tan(Math.radians(ecc_20_deg)) * trial.lpd;
    var ecc_30 = trial.viewing_distance * Math.tan(Math.radians(ecc_30_deg)) * trial.lpd;
    var ecc_10a = trial.viewing_distance * Math.tan(Math.radians(ecc_10_deg*sin_cos)) * trial.lpd;
    var ecc_20a = trial.viewing_distance * Math.tan(Math.radians(ecc_20_deg*sin_cos)) * trial.lpd;
    var ecc_30a = trial.viewing_distance * Math.tan(Math.radians(ecc_30_deg*sin_cos)) * trial.lpd;

    console.log(canvas_w, canvas_h, ecc_10, ecc_20, ecc_30);

    var new_html = "<div style='align:center; margin: 0 auto; cursor: url(dot.png) 10 10 , crosshair'>"+"<canvas id='myCanvas' width='"+canvas_w+"' height='"+canvas_h+"'></canvas>"+"</div>";
    new_html += '<img id="mask_img" width='+mask_size+' height='+mask_size+' src='+mask_img+' style="display: none">';
    display_element.innerHTML = new_html;

    var canvas = display_element.querySelector('#myCanvas');
    var context = canvas.getContext('2d');

    // draw
    var center_w = canvas_w/2;
    var center_h = canvas_h/2;
    var fixation_size = 50;
    var radius = 20;
    var ffov_positions = {0: [-ecc_10a, ecc_10a], 1: [0, ecc_10], 2: [ecc_10a, ecc_10a],
                          3: [ecc_10, 0], 4: [ecc_10a, -ecc_10a], 5: [0, -ecc_10],
                          6: [-ecc_10a, -ecc_10a], 7: [-ecc_10, 0], 8: [-ecc_20a, ecc_20a],
                          9: [0, ecc_20], 10: [ecc_20a, ecc_20a], 11: [ecc_20, 0],
                          12: [ecc_20a, -ecc_20a], 13: [0, -ecc_20], 14: [-ecc_20a, -ecc_20a],
                          15: [-ecc_20, 0], 16: [-ecc_30a, ecc_30a], 17: [0, ecc_30],
                          18: [ecc_30a, ecc_30a], 19: [ecc_30, 0], 20: [ecc_30a, -ecc_30a],
                          21: [0, -ecc_30], 22: [-ecc_30a, -ecc_30a], 23: [-ecc_30, 0]}
    console.log(ffov_positions);
    var target_pos = trial.target_pos;
    function drawFixation(x, y, w, h) {

        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;

        this.contains = function (x, y) {
            return this.x <= x && x <= this.x + this.width &&
                   this.y <= y && y <= this.y + this.height;
        }

        this.draw = function (ctx) {
            context.beginPath();
            context.font = "20px Roboto";
            context.rect(this.x, this.y, this.width, this.height);
            context.strokeStyle = "gray";
            context.stroke();
            context.fillText("Move the mouse cursor to the square.", center_w-160, center_h-50);
            context.closePath();
        }
    };

    function drawStim(context) {
        context.clearRect(0, 0, canvas_w, canvas_h);
        for (i=0; i<24; i++){
            context.beginPath();

            if (i == target_pos){
                context.save();
                cx = center_w+ffov_positions[i][0]-target_w/2 + 0.5 * target_w;
                cy = center_h+ffov_positions[i][1]-target_h/2 + 0.5 * target_h;
                context.translate(cx, cy);
                context.rotate(15*(Math.PI/180));
                context.translate(-cx, -cy);
            }

            context.rect(center_w+ffov_positions[i][0]-target_w/2, center_h+ffov_positions[i][1]-target_h/2, target_w, target_h);
            context.strokeStyle = "gray";
            context.fillStyle = "gray";
            if (i == target_pos && trial.highlight_line == true){
              context.strokeStyle = "red";
              context.fillStyle = "red";
            }
            context.stroke();
            context.fill();
            context.closePath();

            if (i == target_pos){ context.restore();}
        };
    };

    function drawMask(context){
        img = display_element.querySelector("#mask_img");
        context.clearRect(0, 0, canvas_w, canvas_h);
        for (i=0; i<24; i++){
            context.beginPath();
            context.drawImage(img, center_w+ffov_positions[i][0]-mask_size/2, center_h+ffov_positions[i][1]-mask_size/2, mask_size, mask_size);
        };
    };

    function drawPoints(context){
        context.clearRect(0, 0, canvas_w, canvas_h);
        for (i=0; i<24; i++){
            context.beginPath();
            context.arc(center_w+ffov_positions[i][0], center_h+ffov_positions[i][1], radius, 0*Math.PI, 2*Math.PI)
            context.strokeStyle = "gray";
            context.stroke();
            if (answer_wrong){
              context.fillStyle = "red";
              context.fillText("Oops, try again!  The correct answer is the dot in the first ring, at the position of 8 o'clock.", center_w-320, 20);
            } else {
              context.fillText("Click the location of the tilted line.", center_w-150, 20);
            }
            context.closePath();
        };
    };

    function getMousePos(canvas, evt){
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    function check_a_point(a, b, x, y, r) {
        var dist_points = (a - x) * (a - x) + (b - y) * (b - y);
        r *= r;
        if (dist_points < r) {
            return true;
        }
        return false;
    };

    function fillPoint(context, x, y){
        for (i=0; i<24; i++){
            if (check_a_point(x, y, center_w+ffov_positions[i][0], center_h+ffov_positions[i][1], radius)){
                context.beginPath();
                context.arc(center_w+ffov_positions[i][0], center_h+ffov_positions[i][1], radius, 0*Math.PI, 2*Math.PI)
                context.fillStyle = "purple";
                context.fill();
                context.closePath();
                console.log("circle pressed");
                which_pressed = i;
                end_time = Date.now() - start_time;
                if (trial.check_answer){
                  console.log("Checking answers")
                  if (trial.target_pos==which_pressed){
                    setTimeout(end_trial, 500);
                  } else {
                    answer_wrong = true;
                    drawPoints(context);
                  }
                } else { setTimeout(end_trial, 500);}
            };
        };
    };

    var which_pressed = 0;
    var has_started = 0;
    var answer_wrong = false;
    var fixation = new drawFixation(center_w-fixation_size/2, center_h-fixation_size/2, fixation_size, fixation_size);
    fixation.draw(context);
    canvas.addEventListener('mousemove', function(evt){
        var mousePos = getMousePos(canvas, evt);
        if (fixation.contains(mousePos.x, mousePos.y) && has_started == 0){
            has_started = 1;
            drawStim(context);
            setTimeout(function(){
                if (trial.show_mask){ drawMask(context);}
                setTimeout(function(){
                    start_time = Date.now();
                    if (trial.show_resp){
                      drawPoints(context);
                      canvas.addEventListener('mousedown', function(evt){
                            var mousePos = getMousePos(canvas, evt);
                            fillPoint(context, mousePos.x, mousePos.y);
                        }, false);
                    } else {
                      end_time=null;
                      end_trial();
                    }
                  }, 1000);
            }, trial.line_duration);
        }
    }, false);

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "target_pos": trial.target_pos,
        "response": which_pressed,
        "performance": trial.target_pos==which_pressed,
        "rt": end_time
      };

      console.log(trial_data);

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

  };

  return plugin;
})();
