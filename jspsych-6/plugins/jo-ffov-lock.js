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
        default: [window.innerWidth, window.innerHeight],
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
      pointer_lock: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: "Pointer Lock",
        default: false,
        description: "Make an image of a pointer if pointerlock is on"
      },
      window_size: {
        type: jsPsych.plugins.parameterType.FLOAT,
        array: true,
        pretty_name: 'Window Size',
        default: [500, 500],
        description: 'The size of the window'
      }
    }
  }

  plugin.trial = function(display_element, trial) {
    var w = trial.window_size[0]
    var h = trial.window_size[1]
    var x = 0;
    var y = 0;

    function relock() {
      temp_x = -1
      document.exitPointerLock();
      document.removeEventListener("mousemove", mouse_move, false)
      document.removeEventListener("mouseup", mouse_click, false)
      document.getElementById("pointer_error_div").style.display = "block"
      var temp_btn = document.getElementById("b1");
      temp_btn.onclick = function(e) {
        display_element.requestPointerLock();
        var cursor = document.getElementById("cursor");
        cursor.style.visibility = "visible"
        document.addEventListener("mousemove", mouse_move, false);
        document.addEventListener("mouseup", mouse_click, false);
        document.getElementById("pointer_error_div").style.display = "none"
      }
    }

    var temp_x = -1
    var temp_y

    function mouse_move(e) {
      var movementX = e.movementX || e.mozMovementX || 0;
      var movementY = e.movementY || e.mozMovementY || 0;
      if (temp_x == -1) {
        temp_x = e.clientX
        temp_y = e.clientY
      }
      if (e.clientX != temp_x || e.clientY != temp_y) {
        relock();
      }
      x += movementX;
      y += movementY;
      if (x + 20 > w) {
        x = w - 20
      }
      if (y + 20 > h) {
        y = (h - 20)
      }
      if (x < 0) {
        x = 0
      }
      if (y < 0) {
        y = 0
      }
      cursor.style.left = x + "px";
      cursor.style.top = y + "px";
    }

    function mouse_click(e) {

      // gets the object on image cursor position
      var tmp = document.elementFromPoint(x - 2, y - 2);
      tmp.click();
      //console.log("I'm a clicking!")
      //console.log(tmp)
      if (tmp.id === "jspsych-instructions-back") {
        back()
      }
      if (tmp.id === "jspsych-instructions-next") {
        next()
      }
    }

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
    var ecc_10a = trial.viewing_distance * Math.tan(Math.radians(ecc_10_deg * sin_cos)) * trial.lpd;
    var ecc_20a = trial.viewing_distance * Math.tan(Math.radians(ecc_20_deg * sin_cos)) * trial.lpd;
    var ecc_30a = trial.viewing_distance * Math.tan(Math.radians(ecc_30_deg * sin_cos)) * trial.lpd;

    console.log("Computed pixels", canvas_w, canvas_h, ecc_10, ecc_20, ecc_30);

    var new_html = "<div style='align:center; margin: 0 auto'>" + "<canvas id='myCanvas' width='" + canvas_w + "' height='" + canvas_h + "'></canvas>" + "</div>";
    new_html += '<img id="mask_img" width=' + mask_size + ' height=' + mask_size + ' src=' + mask_img + ' style="display: none">';

    if (trial.pointer_lock) {
      new_html += ` <img id="cursor" src="https://media.geeksforgeeks.org/wp-content/uploads/20200319212118/cursor2.png" width="15" height="20" style="position: absolute; left: ` + w / 2 + `px; top: ` + h / 2 + `px; visibility: hidden"  /> <div id = "pointer_error_div" class = "modal" style = "display: none; position: fixed;z-index: 100; background-color: red; height: '+h+'px; width: '+w+'px; "><p style= "position: absolute; top: 40%;">Oops, something broke.  This might have happened if you pressed the escape button, tried to exit fullscreen or view a different window/tab. <br><br>Click here to continue where you left off: <button id="b1">Continue</button> </p> </div>`
      document.addEventListener("mousemove", mouse_move, false);
      document.addEventListener("mouseup", mouse_click, false);
    }
    display_element.innerHTML = new_html;

    var canvas = display_element.querySelector('#myCanvas');
    var context = canvas.getContext('2d');

    // draw
    var center_w = canvas_w / 2;
    var center_h = canvas_h / 2;
    var fixation_size = 50;
    var radius = 20;
    var ffov_positions = {
      0: [-ecc_10a, ecc_10a],
      1: [0, ecc_10],
      2: [ecc_10a, ecc_10a],
      3: [ecc_10, 0],
      4: [ecc_10a, -ecc_10a],
      5: [0, -ecc_10],
      6: [-ecc_10a, -ecc_10a],
      7: [-ecc_10, 0],
      8: [-ecc_20a, ecc_20a],
      9: [0, ecc_20],
      10: [ecc_20a, ecc_20a],
      11: [ecc_20, 0],
      12: [ecc_20a, -ecc_20a],
      13: [0, -ecc_20],
      14: [-ecc_20a, -ecc_20a],
      15: [-ecc_20, 0],
      16: [-ecc_30a, ecc_30a],
      17: [0, ecc_30],
      18: [ecc_30a, ecc_30a],
      19: [ecc_30, 0],
      20: [ecc_30a, -ecc_30a],
      21: [0, -ecc_30],
      22: [-ecc_30a, -ecc_30a],
      23: [-ecc_30, 0]
    }
    var target_pos = trial.target_pos;

    function drawFixation(x, y, w, h) {

      this.x = x;
      this.y = y;
      this.width = w;
      this.height = h;

      this.contains = function(x, y) {
        return this.x <= x && x <= this.x + this.width &&
          this.y <= y && y <= this.y + this.height;
      }

      this.draw = function(ctx) {
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.strokeStyle = "gray";
        context.stroke();
        context.closePath();
      }
    };

    function drawStim(context) {
      context.clearRect(0, 0, canvas_w, canvas_h);
      for (i = 0; i < 24; i++) {
        context.beginPath();

        if (i == target_pos) {
          context.save();
          cx = center_w + ffov_positions[i][0] - target_w / 2 + 0.5 * target_w;
          cy = center_h + ffov_positions[i][1] - target_h / 2 + 0.5 * target_h;
          context.translate(cx, cy);
          context.rotate(15 * (Math.PI / 180));
          context.translate(-cx, -cy);
        }

        context.rect(center_w + ffov_positions[i][0] - target_w / 2, center_h + ffov_positions[i][1] - target_h / 2, target_w, target_h);
        context.strokeStyle = "gray";
        context.fillStyle = "gray";
        if (i == target_pos && trial.highlight_line == true) {
          context.strokeStyle = "red";
          context.fillStyle = "red";
        }
        context.stroke();
        context.fill();
        context.closePath();

        if (i == target_pos) {
          context.restore();
        }
      };
    };

    function drawMask(context) {
      img = display_element.querySelector("#mask_img");
      context.clearRect(0, 0, canvas_w, canvas_h);
      for (i = 0; i < 24; i++) {
        context.beginPath();
        context.drawImage(img, center_w + ffov_positions[i][0] - mask_size / 2, center_h + ffov_positions[i][1] - mask_size / 2, mask_size, mask_size);
      };
    };

    function drawPoints(context) {
      context.clearRect(0, 0, canvas_w, canvas_h);
      for (i = 0; i < 24; i++) {
        context.beginPath();
        context.arc(center_w + ffov_positions[i][0], center_h + ffov_positions[i][1], radius, 0 * Math.PI, 2 * Math.PI)
        context.strokeStyle = "gray";
        context.stroke();
        context.closePath();
      };
    };

    function getMousePos(canvas, evt) {
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

    function fillPoint(context, x, y) {
      for (i = 0; i < 24; i++) {
        if (check_a_point(x, y, center_w + ffov_positions[i][0], center_h + ffov_positions[i][1], radius)) {
          context.beginPath();
          context.arc(center_w + ffov_positions[i][0], center_h + ffov_positions[i][1], radius, 0 * Math.PI, 2 * Math.PI)
          context.fillStyle = "purple";
          context.fill();
          context.closePath();
          console.log("circle pressed");
          which_pressed = i;
          end_time = Date.now() - start_time;
          setTimeout(end_trial, 500);
        };
      };
    };

    var which_pressed = 0;
    var has_started = 0;
    var fixation = new drawFixation(center_w - fixation_size / 2, center_h - fixation_size / 2, fixation_size, fixation_size);
    var fixation_contains = false;
    fixation.draw(context);
    canvas.addEventListener('mousemove', function(evt) {
      var mousePos = getMousePos(canvas, evt);
      if ((x > center_w - fixation_size / 2 && x < center_w - fixation_size / 2 + fixation_size) && (y > center_h - fixation_size / 2 && y < center_h - fixation_size / 2 + fixation_size)) {
        fixation_contains = true;
      }
      if ((trial.pointer_lock && fixation_contains && has_started == 0) || (fixation.contains(mousePos.x, mousePos.y) && has_started == 0)) {
        has_started = 1;
        drawStim(context);
        setTimeout(function() {
          if (trial.show_mask) {
            drawMask(context);
          }
          setTimeout(function() {
            start_time = Date.now();
            if (trial.show_resp) {
              drawPoints(context);
              canvas.addEventListener('mousedown', function(evt) {
                var mousePos = getMousePos(canvas, evt);
                fillPoint(context, mousePos.x, mousePos.y);
              }, false);
            } else {
              end_time = null;
              end_trial();
            }
          }, 1000);
        }, 250);
      }
    }, false);

    // function to end trial when it is time
    var end_trial = function() {
      document.removeEventListener("mousemove", mouse_move, false)
      document.removeEventListener("mouseup", mouse_click, false)
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
        "performance": trial.target_pos == which_pressed,
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
