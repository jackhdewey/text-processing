/**
 * jsPsych plugin for showing scenes that mimic the experiments described in
 *
 * Fiser, J., & Aslin, R. N. (2001). Unsupervised statistical learning of
 * higher-order spatial structures from visual scenes. Psychological science,
 * 12(6), 499-504.
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['draw-grid-2'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('draw-grid-2', 'stimuli', 'image');

  plugin.info = {
    name: 'draw-grid-2',
    description: '',
    parameters: {
      grid_size: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Grid dimensions',
        default: undefined,
        description: 'x by x squares.'
      },
      canvas_size: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Grid dimensions',
        array: true,
        default: [500, 500],
        description: 'Size of canvas.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: 2000,
        description: 'How long to show the stimulus for in milliseconds.'
      },
      allow_drawing: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Drawing permission',
        default: false,
        description: 'Whether they can draw on the grid.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Text prompt',
        default: '<p>Draw as many shapes and patterns as you can recall.<br><strong>Press SUBMIT when you finish drawing one shape or pattern, and it will clear the grid, so you can draw more.</strong><br>You can submit as many as you want, and when you have drawn all the shapes you saw (to the best you can recall), press the <strong>Q key</strong> to exit.</p>',
        description: 'Instructions with the grid.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: [],
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      subj_id: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Subject name',
        array: true,
        default: '',
        description: 'ID of the subject'
      },
      bypass: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Automatically end trial',
        array: false,
        default: '',
        description: 'End trial trigger'
      },
      hold_key: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Automatically end trial',
        array: false,
        default: false,
        description: 'End trial trigger'
      },
      control_key: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Automatically end trial',
        array: false,
        default: false,
        description: 'End trial trigger'
      },
    }
  }

  plugin.trial = function(display_element, trial) {
    var hold_onsets = [];
    var hold_durations = [];
    var hold_num = 0;

    var control_onsets = [];
    var control_durations = [];
    var control_num = 0;
    var no_control_onsets = [];
    var no_control_durations = [];
    var no_control_num = 0;

    if (trial.bypass){
        console.log("END TRIAL")
        endTrial();
    } else {
        var phase_prompt = "";
        if (trial.hold_key){

            phase_prompt = "<span id='holdKeyPrompt'>Hold the S KEY down when you see a shape/pattern.</span>";

            document.addEventListener("keydown", checkKeyPressed, false);
            function checkKeyPressed(pressed_key) {
              if (pressed_key.keyCode === 83) {
                display_element.querySelector('#holdKeyPrompt').setAttribute("style", "color:blue");
                start = performance.now() // new Date();
                hold_onsets.push(start);
                hold_num++;
                console.log("Adding hold", hold_num);
                document.removeEventListener("keydown", checkKeyPressed, false);
                document.addEventListener("keyup", checkKeyRelease, false);
              }
            };

            function checkKeyRelease(pressed_key) {
              if (pressed_key.keyCode === 83) {
                display_element.querySelector('#holdKeyPrompt').setAttribute("style", "color:black");
                end = performance.now(); // new Date();
                hold_dur = end - start;
                hold_durations.push(hold_dur);
                console.log("Here is the calculated total duration of the key hold.", hold_dur);
                document.removeEventListener("keyup", checkKeyRelease, false);
                document.addEventListener("keydown", checkKeyPressed, false);
              }
            }
        }

        if (trial.control_key){

            phase_prompt = "<span id='holdKeyPrompt'>Hold the S KEY down when you see an S, and the D KEY when you see a different pattern.</span>";

            document.addEventListener("keydown", checkKeyPressed, false);
            function checkKeyPressed(pressed_key) {
              if (pressed_key.keyCode === 83) {
                display_element.querySelector('#holdKeyPrompt').setAttribute("style", "color:blue");
                start = performance.now() // new Date();
                control_onsets.push(start);
                control_num++;
                console.log("Adding SUCCESS hold", control_num);
                document.removeEventListener("keydown", checkKeyPressed, false);
                document.addEventListener("keyup", checkKeyRelease, false);
              } else if (pressed_key.keyCode === 68) {
                display_element.querySelector('#holdKeyPrompt').setAttribute("style", "color:purple");
                start = performance.now() // new Date();
                no_control_onsets.push(start);
                no_control_num++;
                console.log("Adding OOPS hold", no_control_num);
                document.removeEventListener("keydown", checkKeyPressed, false);
                document.addEventListener("keyup", checkKeyRelease, false);
              }
            };

            function checkKeyRelease(pressed_key) {
              if (pressed_key.keyCode === 83) {
                display_element.querySelector('#holdKeyPrompt').setAttribute("style", "color:black");
                end = performance.now(); // new Date();
                control_dur = end - start;
                control_durations.push(control_dur);
                console.log("Here is the calculated total duration of the key hold.", control_dur);
                document.removeEventListener("keyup", checkKeyRelease, false);
                document.addEventListener("keydown", checkKeyPressed, false);
              }  else if (pressed_key.keyCode === 68) {
                display_element.querySelector('#holdKeyPrompt').setAttribute("style", "color:black");
                end = performance.now(); // new Date();
                no_control_dur = end - start;
                no_control_durations.push(no_control_dur);
                console.log("Here is the calculated total duration of the key hold.", no_control_dur);
                document.removeEventListener("keyup", checkKeyRelease, false);
                document.addEventListener("keydown", checkKeyPressed, false);
              }
            }
        }

        if (trial.allow_drawing == true){
            display_element.innerHTML = trial.prompt + phase_prompt + "<div style='align:center; margin: 0 auto'>"+"<canvas id='myCanvas' width='"+trial.canvas_size[0]+"' height='"+trial.canvas_size[1]+"'></canvas>"+"</div>";
        } else {
            display_element.innerHTML = phase_prompt + "<div style='align:center; margin: 0 auto'>"+"<canvas id='myCanvas' width='"+trial.canvas_size[0]+"' height='"+trial.canvas_size[1]+"'></canvas>"+"</div>";
        }
        start_x = 0;
        start_y = 0;
        num_squares = 10;
        square_size = trial.grid_size/num_squares; // number of squares
        var grid_dict = {};

        function drawGrid(context) {
            context.clearRect(0, 0, trial.canvas_size[0], trial.canvas_size[1]);
            context.beginPath();
            for (var x = start_x; x < trial.grid_size+1; x += square_size) {
              context.moveTo(x, 0);
              context.lineTo(x, trial.grid_size);
            };

            for (var y = start_y; y < trial.grid_size+1; y += square_size) {
              context.moveTo(0, y);
              context.lineTo(trial.grid_size, y);
            };        for (var y = start_y; y < trial.grid_size+1; y += square_size) {
              context.moveTo(0, y);
              context.lineTo(trial.grid_size, y);
            };

            context.strokeStyle = "gray";
            context.stroke();

            var square_id = 0
            for (x = start_x; x < trial.grid_size+1; x += square_size){
                for (y = start_y; y < trial.grid_size+1; y += square_size){
                    var block_x = Math.floor(x/square_size);
                    var block_y = Math.floor(y/square_size);
                    var block_id = block_x.toString() + "_" + block_y.toString();
                    grid_dict[block_id] = 0;
                }
            };
            console.log("Grid", grid_dict);
        };

        function fillBlock(draw_mode, context,x,y)
        {
            if (draw_mode == true){
                var block_x = Math.floor(x/square_size);
                var block_y = Math.floor(y/square_size);
                var block_id = block_x.toString() + "_" + block_y.toString();
                console.log("Is the square shaded?", grid_dict[block_id]);

                if (grid_dict[block_id] == 0){
                    if((last_block_x != block_x) || (last_block_y != block_y))
                    {
                        last_block_x  = block_x;
                        last_block_y = block_y;
                        context.beginPath();
                        context.rect(block_x * square_size, block_y * square_size, square_size, square_size);
                        context.fillStyle = "rgba(208, 211, 212, 1)";
                        context.fill();
                        context.strokeStyle = "gray";
                        context.stroke();

                        var block_data = {
                          'x' : block_x,
                          'y': block_y,
                          'timestamp': formatTimer(timer_time)
                        };
                        draw_data.push(block_data);
                        grid_dict[block_id] = 1;
                    }
                } else if (grid_dict[block_id] == 1){
                    if((last_block_x != block_x) || (last_block_y != block_y))
                    {
                        last_block_x  = block_x;
                        last_block_y = block_y;
                        context.clearRect(block_x * square_size, block_y * square_size, square_size, square_size);
                        context.beginPath();
                        context.rect(block_x * square_size, block_y * square_size, square_size, square_size);
                        context.strokeStyle = "gray";
                        context.stroke();

                        var block_data = {
                          'x' : block_x,
                          'y': block_y,
                          'timestamp': formatTimer(timer_time)
                        };

                        for (item = 0; item < draw_data.length; item++){
                            if (draw_data[item].toString() == block_data.toString()){
                                draw_data.splice(item, 1);
                            };
                        };
                        grid_dict[block_id] = 0;
                    };
                };
            }
        };

        function formatTimer (seconds)
        {
            seconds = Math.floor(seconds);

            var new_sec = null;
            var new_min = null;
            var new_time = "";

            new_sec = seconds%60;
            new_sec = (new_sec < 10 ? "0" + new_sec : new_sec);
            new_min = Math.floor(seconds/60);

            new_time = new_min + ":" + new_sec;

            return new_time;
        };

        function writeMessage(canvas, message)
        {
            console.log(message);
        };

        function startTimer()
        {
            if(isTimerStarted == 0)
            {
              isTimerStarted = 1;
              startTime = Date.now();

              setInterval(function(){
                var elapsedTime = Date.now() - startTime;
                timer_time = (elapsedTime / 1000).toFixed(3);
              //  console.log(timer_time);
              }, 50);
            }
        };

        function resetTimer() {
            timer_time = 0;
            startTime = Date.now();
        };

       function getMousePos(canvas, evt)
        {
            var rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        };

        function get_key_for_grid(info)
        {
            response = info;
            if (response.key == 81) { endTrial()};
        };

        var canvas = display_element.querySelector('#myCanvas');
        var context = canvas.getContext('2d');

        drawGrid(context);

        // Timer
        var isTimerStarted = 0;
        var timer_time = 0;
        var startTime = 0;
        startTimer();

        // Drawing
        var draw_mode = false;
        var draw_id = 1;
        var draw_data = [];
        var drawn_squares = [];
        var canvas_hammer = new Hammer(canvas);
        var last_block_x = null;
        var last_block_y = null;

        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: get_key_for_grid,
            valid_responses: trial.choices,
            rt_method: 'performance',
            persist: false,
            allow_held_key: false
        });

        if (trial.allow_drawing){
            // Error Message
            $( ".jspsych-content" ).prepend('<div class="err_msg"></div>');

            // User
            userkey = trial.subj_id;

            // Timer
            isTimerStarted = 0;
            timer_time = 0;
            startTime = 0;
            startTimer();

            // Drawing
            draw_mode = false;
            draw_id = 1;
            draw_data = [];
            drawn_squares = [];
            canvas_hammer = new Hammer(canvas);
            last_block_x = null;
            last_block_y = null;

            canvas.addEventListener('mousedown', function(evt) {
                var mousePos = getMousePos(canvas, evt);
                var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
                console.log('start');
                draw_mode = true;
                fillBlock(draw_mode, context, mousePos.x, mousePos.y);
            }, false);

            canvas.addEventListener('mousemove', function(evt) {
                var mousePos = getMousePos(canvas, evt);
                var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
                fillBlock(draw_mode, context, mousePos.x, mousePos.y);
            }, false);

            canvas.addEventListener('mouseup', function(evt) {
                console.log('end');
                draw_mode = false;
            }, false);

            // Submit
            var submit_btn = document.createElement("BUTTON");   // Create a <button> element
            submit_btn.innerHTML = "SUBMIT";
            submit_btn.classList.add('btn-submit')
            submit_btn.setAttribute('style', 'font-size: 20px; background-color: #4CAF50; border: none; color: white; padding: 12px 30px; text-decoration: none; margin: 4px 2px')
            submit_btn.addEventListener('click',function(evt) {
              if(draw_data != undefined && draw_data.length != 0)
              {
                var drawing_data = {
                  img: '',
                  user: userkey,
                  drawing_data:  JSON.stringify(draw_data),
                  drawing_id: draw_id,
                  base64: document.querySelector('#myCanvas').toDataURL()
                }
                 $.post('submit_drawing.php', JSON.stringify(drawing_data), function(data, status)
                 {
                    data = JSON.parse(data);
                    $( ".jspsych-content .err_msg" ).html('<div style="position: absolute"><p>' + data.message + '</p></div>');
                    drawGrid(context);
                    draw_id += 1;
                    draw_data = [];
                    drawn_squares = [];
                    resetTimer();

                    setTimeout(function()
                    {
                       $( ".jspsych-content .err_msg" ).html('');
                    }, 2000);

                });
               }
               else
               {
                   $( ".jspsych-content .err_msg" ).html('<div style="position: absolute"><p>Unable to submit drawing. No drawing found</p>');
                    setTimeout(function()
                    {
                       $( ".jspsych-content .err_msg" ).html('');
                    }, 2000);
               }
            });
            document.querySelector("#jspsych-content").appendChild(submit_btn);
        } else {
            jsPsych.pluginAPI.setTimeout(function() {
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
                endTrial();
            }, trial.trial_duration);
        };
    };

    function endTrial() {
        document.removeEventListener("keydown", checkKeyPressed, false);
        document.removeEventListener("keyup", checkKeyRelease, false);
        display_element.innerHTML = '';

        var trial_data = {
            "stimulus": JSON.stringify(trial.stimuli),
            "hold_onsets": JSON.stringify(hold_onsets),
            "hold_durations": JSON.stringify(hold_durations),
            "hold_num": JSON.stringify(hold_num)
        };

        jsPsych.finishTrial(trial_data);
    };
  };
  return plugin;
})();
