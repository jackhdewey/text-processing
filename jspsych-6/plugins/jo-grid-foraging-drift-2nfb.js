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

jsPsych.plugins['forage-grid'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('forage-grid', 'stimuli', 'image');

  plugin.info = {
    name: 'forage-grid',
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
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Trial duration',
        default: [0, 120000, 120000],
        description: 'How long to show the stimulus for in milliseconds.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: ['space', 'left arrow', 'right arrow', 'up arrow', 'down arrow'],
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      visible_stats: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Trial duration',
        default: true,
        description: 'How long to show the stimulus for in milliseconds.'
      },
      width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Width',
        default: '',
        description: 'The width of the video in pixels.'
      },
      height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Height',
        default: '',
        description: 'The height of the video display in pixels.'
      },
      sources: {
        type: jsPsych.plugins.parameterType.VIDEO,
        pretty_name: 'Video',
        default: undefined,
        description: 'The video file to play.'
      },
      start_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Video',
        default: 3000,
        description: 'The video file to play.'
      },
      pause_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Video',
        default: 0,
        description: 'The video file to play.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {
    var trial_data_a = {};
    var trial_data_b = {};

    var update_time = 60000;
    var num_squares = 10; //80;
    var half = 4;
    var square_size = trial.grid_size/num_squares; // number of squares
    var circle_size = 4;
    var block_center = screen.width/2 - 300;
    var grid_center = screen.width/2 - trial.canvas_size[0]/2;
    var bar_center = screen.width/2 - trial.width/2;
    console.log("Bar Center", bar_center)
    console.log("Grid Center", grid_center)

    // Basic display
    var subj_score = 0;
    var start_x = 0;
    var start_y = 0;
    var grid_dict = {};
    var food_dict = {};
    var center_position = get_sample([[num_squares/2-1, num_squares/2-1], [num_squares/2-1, num_squares/2], [num_squares/2, num_squares/2-1], [num_squares/2, num_squares/2]], 1)[0];
    var curr_pos = [center_position[0], center_position[1]];
    var previous_pos;

    // Record interactions
    var first_key_press = 0;
    var start_time = 0;
    var trial_clock = 0;
    var list_positions = [];
    var curr_q = 'NA';

    // Food variables
    var checkForFood = 1;
    var prev_food;
    var food_list = [];
    var food_times = [];
    var food_latencies = [];
    var food_pools = [];
    var pool_list = [];
    var found_food_list = [];
    var curr_pool_list = [];
    var food_centers = [];

    // Create quadrants
    var pools_dict = {}
    var pool = [];

    var num_pools = 4;
    var start_x = 0;
    var stop_x = num_squares/2;
    var start_y = 0;
    var stop_y = num_squares/2;
    for (p=0; p<num_pools; p++){
        pool = [];
        for (x=start_x; x<stop_x; x++){
            for (y=start_y; y<stop_y; y++){
                pool.push([x, y]);
            }
        }
        pools_dict[p] = pool;
        if (p==1){
            start_x = 0;
            stop_x = num_squares/2;
            start_y = stop_y;
            stop_y += num_squares/2;
        } else {
            start_x = stop_x;
            stop_x += num_squares/2;
        }
    }
    console.log(pools_dict);

    // Select quadrant
    function get_sample(arr, n) {
        var result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            throw new RangeError("getRandom: more elements taken than available");
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    };
    function range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx)
    };
    function get_random_value(array){
        return jsPsych.randomization.sampleWithoutReplacement(array, 1)[0]
    };

    var pool_pattern = range(0, num_pools - 1);
    shuffle(pool_pattern);
    console.log(pool_pattern);
    var pool_number = pool_pattern[0];
    var pool_count = 0;
    var selected_pool = pools_dict[pool_number];

    // Build gaussian
    function randomG(v){
        var r = 0;
        for(var i = v; i > 0; i --){
            r += Math.random();
        }
        return r / v;
    }

    var gaussian_mean = 0.5;
    var gaussian_sd = 0.15;
    var loc_center = get_sample(selected_pool, 1)[0];
    var local_pool_a = [[loc_center[0]-1, loc_center[1]-1], [loc_center[0], loc_center[1]-1], [loc_center[0]+1, loc_center[1]-1],
                            [loc_center[0]-1, loc_center[1]], [loc_center[0], loc_center[1]], [loc_center[0]+1, loc_center[1]],
                            [loc_center[0]-1, loc_center[1]+1], [loc_center[0], loc_center[1]+1], [loc_center[0]+1, loc_center[1]+1],
                            ];
    var local_pool_b = [[loc_center[0]-2, loc_center[1]-2], [loc_center[0], loc_center[1]-2], [loc_center[0]+2, loc_center[1]-2],
                            [loc_center[0]-2, loc_center[1]], [loc_center[0], loc_center[1]], [loc_center[0]+2, loc_center[1]],
                            [loc_center[0]-2, loc_center[1]+2], [loc_center[0], loc_center[1]+2], [loc_center[0]+2, loc_center[1]+2],
                            ];
    var local_pool_inner = [[loc_center[0]-1, loc_center[1]-1], [loc_center[0], loc_center[1]-1], [loc_center[0]+1, loc_center[1]-1],
                            [loc_center[0]-1, loc_center[1]], [loc_center[0], loc_center[1]], [loc_center[0]+1, loc_center[1]],
                            [loc_center[0]-1, loc_center[1]+1], [loc_center[0], loc_center[1]+1], [loc_center[0]+1, loc_center[1]+1],
                            ];
    var local_pool_outer = [[loc_center[0]-2, loc_center[1]-2], [loc_center[0], loc_center[1]-2], [loc_center[0]+2, loc_center[1]-2],
                            [loc_center[0]-2, loc_center[1]], [loc_center[0], loc_center[1]], [loc_center[0]+2, loc_center[1]],
                            [loc_center[0]-2, loc_center[1]+2], [loc_center[0], loc_center[1]+2], [loc_center[0]+2, loc_center[1]+2],
                            ];

    // Remove out of grid cells
    for (i=0; i<local_pool_a.length; i++){
        cell = local_pool_a[i];
        check_included = selected_pool.some(a => cell.every((v, i) => v === a[i]));
        if (!check_included){
            cell_index = searchForArray(local_pool_inner, cell);
            local_pool_inner.splice(cell_index, 1);
        }
    }

    for (i=0; i<local_pool_b.length; i++){
        cell = local_pool_b[i];
        check_included = selected_pool.some(a => cell.every((v, i) => v === a[i]));
        if (!check_included){
            cell_index = searchForArray(local_pool_outer, cell);
            local_pool_outer.splice(cell_index, 1);
        }
    }

    console.log(local_pool_inner, local_pool_outer);

    function searchForArray(haystack, needle){
        var i, j, current;
        for(i = 0; i < haystack.length; ++i){
        if(needle.length === haystack[i].length){
          current = haystack[i];
          for(j = 0; j < needle.length && needle[j] === current[j]; ++j);
          if(j === needle.length)
            return i;
        }
        }
        return -1;
    }

    // Draw grid
    function drawGrid(context) {
        context.clearRect(0, 0, trial.canvas_size[0], trial.canvas_size[1]);
        context.beginPath();

        for (x = start_x; x < trial.grid_size+1; x += square_size){
            for (y = start_y; y < trial.grid_size+1; y += square_size){
                var block_x = Math.floor(x/square_size);
                var block_y = Math.floor(y/square_size);
                var block_id = block_x.toString() + "_" + block_y.toString();
                grid_dict[block_id] = 0;
                food_dict[block_id] = 0;
                context.rect(block_x * square_size, block_y * square_size, square_size, square_size);
                context.strokeStyle = "white";
                context.stroke();
            }
        };
//        console.log("Grid", grid_dict);

        context.beginPath();
        context.arc(curr_pos[0], curr_pos[1], circle_size, 0, 2 * Math.PI, false);
        context.lineWidth = 1;
        context.fillStyle = 'yellow';
        context.strokeStyle = 'white';
        context.fill();
        context.stroke();
        previous_pos = curr_pos;
    };

    function drawFood(context){
        start_clock = performance.now();
        randNum = randomG(4);
        if (randNum < (gaussian_mean + gaussian_sd) && randNum > (gaussian_mean - gaussian_sd)){
            new_food = get_sample(local_pool_inner, 1)[0];
        } else {
            new_food = get_sample(local_pool_outer, 1)[0];
        }
        while (new_food==prev_food){
            randNum = randomG(4);
            if (randNum < (gaussian_mean + gaussian_sd) && randNum > (gaussian_mean - gaussian_sd)){
                new_food = get_sample(local_pool_inner, 1)[0];
            } else {
                new_food = get_sample(local_pool_outer, 1)[0];
            }
        }
        prev_food = new_food;
        console.log(new_food);

        block_id = new_food[0].toString() + "_" + new_food[1].toString();
        food_dict[block_id] = 1;

        food_list.push(block_id);
        food_centers.push(loc_center);
        food_times.push(performance.now() - start_time);
        food_pools.push(pool_number);

        if (trial.visible_stats){
            context.beginPath();
            context.rect(new_food[0] * square_size, new_food[1] * square_size, square_size, square_size);
            context.fillStyle = "green";
            context.fill();
        }

        food_count += 1;
    };

    function isArrayInArray(arr, item){
      var item_as_string = JSON.stringify(item);

      var contains = arr.some(function(ele){
        return JSON.stringify(ele) === item_as_string;
      });
      return contains;
    };

    function drawAgent(context){
        context.beginPath();
        context.clearRect(previous_pos[0]-square_size/2, previous_pos[1]-square_size/2, square_size, square_size);
        context.rect(previous_pos[0]-square_size/2, previous_pos[1]-square_size/2, square_size, square_size);
        context.strokeStyle = "white";
        context.stroke();
        context.closePath();

//        if (trial.visible_stats){
//            context.fillStyle = 'lightgrey';
//            context.fill();
//        };

        block_x = Math.floor(curr_pos[0]/square_size);
        block_y = Math.floor(curr_pos[1]/square_size);
        block_id = block_x.toString() + "_" + block_y.toString();
        grid_dict[block_id] += 1;

        pos = [block_x, block_y];
        list_positions.push(block_id);
        move_times.push((performance.now()-start_time));
        pool_list.push(pool_number);

        if (isArrayInArray(pools_dict[0], pos)){
            curr_pool = 0;
        } else if (isArrayInArray(pools_dict[1], pos)){
            curr_pool = 1;
        } else if (isArrayInArray(pools_dict[2], pos)){
            curr_pool = 2;
        } else if (isArrayInArray(pools_dict[3], pos)){
            curr_pool = 3;
        }
        curr_pool_list.push(curr_pool);

        found_food = 0;
        if (food_dict[block_id] == 1 && checkForFood == 1){
//            checkForFood = 0;
            food_latencies.push(performance.now()-start_clock);
            found_food = 1;
            display_element.querySelector('#success_text').setAttribute("style", "display: block; position: absolute; background-color: #4CAF50; border: none; color: white; padding: 12px 30px; text-decoration: none; top: 10%; left: 10%");
            context.beginPath();
            context.clearRect(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, square_size, square_size);
            context.rect(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, square_size, square_size);
            context.fillStyle = "green";
            context.fill();
            context.closePath();
            context.beginPath();
            context.arc(curr_pos[0], curr_pos[1], circle_size*2, 0, 2 * Math.PI, false);
            context.lineWidth = 1.5;
            context.fillStyle = 'yellow';
            context.strokeStyle = 'white';
            context.fill();
            context.stroke();
            context.closePath();
            subj_score += 1;
            food_count -= 1;
            display_element.querySelector('#score_text').innerHTML = subj_score;
//            display_element.querySelector('#food_text').innerHTML = food_count;
            food_dict[block_id] = 0;
            setTimeout(function(){
                display_element.querySelector('#success_text').setAttribute("style", "display: none");
                drawFood(context);
            }, 1000);
        }
//        else if (food_dict[block_id] == 0 && checkForFood == 1){
//            checkForFood = 0;
//            display_element.querySelector('#fail_text').setAttribute("style", "display: block; position: absolute; background-color: #FF4500; border: none; color: white; padding: 12px 30px; text-decoration: none; top: 10%; left: 10%");
//            context.beginPath();
//            context.clearRect(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, square_size, square_size);
//            context.rect(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, square_size, square_size);
//            context.fillStyle = "red";
//            context.fill();
//            context.closePath();
//            context.beginPath();
//            context.arc(curr_pos[0], curr_pos[1], circle_size*2, 0, 2 * Math.PI, false);
//            context.lineWidth = 1.5;
//            context.fillStyle = 'yellow';
//            context.strokeStyle = 'white';
//            context.fill();
//            context.stroke();
//            context.closePath();
//            setTimeout(function(){
//                display_element.querySelector('#fail_text').setAttribute("style", "display: none");
//            }, 1000);
//        }
        else {
            context.beginPath();
            context.arc(curr_pos[0], curr_pos[1], circle_size, 0, 2 * Math.PI, false);
            context.lineWidth = 1.5;
            context.fillStyle = 'yellow';
            context.strokeStyle = 'white';
            context.fill();
            context.stroke();
            context.closePath();
        };
        found_food_list.push(found_food);
        previous_pos = curr_pos;
    };

    function move_dot(evt){
        block_x = Math.floor(curr_pos[0]/square_size);
        block_y = Math.floor(curr_pos[1]/square_size);
//        console.log(block_x, curr_pos)

        if (evt.keyCode == 39){ if(block_x < num_squares-1){ curr_pos = [curr_pos[0]+square_size, curr_pos[1]]; drawAgent(context)};} // right
        else if (evt.keyCode == 37){ if(block_x > 0){ curr_pos = [curr_pos[0]-square_size, curr_pos[1]]; drawAgent(context)};} // left
        else if (evt.keyCode == 38){ if(block_y > 0){ curr_pos = [curr_pos[0], curr_pos[1]-square_size]; drawAgent(context)};} // up
        else if (evt.keyCode == 40){ if(block_y < num_squares-1){ curr_pos = [curr_pos[0], curr_pos[1]+square_size]; drawAgent(context)};} // down
        else if (evt.keyCode == 70){ checkForFood = 1; drawAgent(context);}
    };

    function startForaging(which_part){
        // Basic display
        food_count = 0;
        grid_dict = {};
        food_dict = {};
        curr_pos = [center_position[0] * square_size + square_size/2, center_position[1] * square_size + square_size/2];
        console.log("Center Pos", curr_pos);
        display_element.querySelector('#score_text').innerHTML = subj_score;

        drawGrid(context);

        // Record interactions
        first_key_press = 0;
        list_positions = [];
        food_list = [];
        food_times = [];
        food_latencies = [];
        food_pools = [];
        food_centers = [];
        found_food_list = [];
        curr_pool_list = [];
        move_times = [];
        pool_list = [];
        curr_q = 'NA';

        drawFood(context);

        document.addEventListener('keydown', move_dot, true);

        jsPsych.pluginAPI.setTimeout(function() {
            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            // kill keyboard listeners
            jsPsych.pluginAPI.cancelAllKeyboardResponses();
            document.removeEventListener('keydown', move_dot, true);

            if (which_part==1){
                trial_data_a = {
                    "stimulus": JSON.stringify(trial.stimuli),
                    "list_positions": list_positions,
                    "move_times": move_times,
                    "total_moves": list_positions.length,
                    "pool": pool_pattern,
                    "food_score": subj_score,
                    "food_list": food_list,
                    "food_times": food_times,
                    "food_pools": food_pools,
                    "food_centers": food_centers,
                    "food_latencies": food_latencies,
                    "found_food_list": found_food_list,
                    "curr_pool_list": curr_pool_list,
                    "pool_list": pool_list
                };
                console.log(trial_data_a)
                display_element.querySelector('#foraging_display').setAttribute("style", "display: none;");
                display_element.querySelector('#canvas_display').setAttribute("style", "display: none;");
                display_element.querySelector('#jspsych-video-prompt-response-stimulus').play();
                setTimeout(function(){
                    display_element.querySelector('#jspsych-video-prompt-response-stimulus').pause();
                    setTimeout(function(){ display_element.querySelector('#jspsych-video-prompt-response-stimulus').play();}, trial.pause_duration);
                }, 14000);
            } else if (which_part==2){
                trial_data_b = {
                    "stimulus": JSON.stringify(trial.stimuli),
                    "list_positions": list_positions,
                    "move_times": move_times,
                    "total_moves": list_positions.length,
                    "pool": pool_pattern,
                    "food_score": subj_score,
                    "food_list": food_list,
                    "food_times": food_times,
                    "food_pools": food_pools,
                    "food_centers": food_centers,
                    "food_latencies": food_latencies,
                    "pool_list": pool_list,
                    "found_food_list": found_food_list,
                    "curr_pool_list": curr_pool_list
                };
                endTrial();
            }
        }, trial.trial_duration[which_part]);
    }

    // TRIAL FLOW
    var video_html = '<div id="video-wrapper">'
    video_html += '<video id="jspsych-video-prompt-response-stimulus"';

    if(trial.width) {
      video_html += ' width="'+trial.width+'"';
    }
    if(trial.height) {
      video_html += ' height="'+trial.height+'"';
    }
    video_html += " autoplay ";
    video_html +=">";

    console.log(video_html);

    var video_preload_blob = jsPsych.pluginAPI.getVideoBuffer(trial.sources[0]);
    if(!video_preload_blob) {
      for(var i=0; i<trial.sources.length; i++){
        var file_name = trial.sources[i];
        if(file_name.indexOf('?') > -1){
          file_name = file_name.substring(0, file_name.indexOf('?'));
        }
        var type = file_name.substr(file_name.lastIndexOf('.') + 1);
        type = type.toLowerCase();
        video_html+='<source src="' + file_name + '" type="video/'+type+'">';
      }
    }
    video_html += "</video>";
    video_html += "</div>";
    display_element.innerHTML = video_html;
    display_element.innerHTML += "<div id='game-instructions' style='display: none'>You will now play a food-hunting game.  You will see a grid of squares, and a yellow disc on one of the squares.<p>The yellow disc represents where YOU are on the grid.  You can move around the grid by using the up, down, left, and right arrow keys.</p><p>When you move to a square with a piece of food, the square will turn green to indicate you found food.  Food appears in clumps -- so if you find food in a square, there will most likely be food close by.  Try to collect as much food as you can!  (You'll see your food score at the top, and a progress bar to mark how much time has passed at the bottom.)</p><p>At some point in the game, the animation will start.  You don't have a task during this time.  Just try your best to situate yourself in the environment, as if you were actually walking through it.  Afterwards, you'll resume playing the game for another short while.</p><p>Press the ENTER key to begin.</p></div>";
    display_element.innerHTML += "<div id='foraging_display' style='display: none'>Your score: <span id='score_text'>"+subj_score+"</span></div>" + "<div id='canvas_display' style='display: none;'>"+"<canvas id='myCanvas' width='"+trial.canvas_size[0]+"' height='"+trial.canvas_size[1]+"'></canvas>"+"</div>"+"</div>";
    display_element.innerHTML += '<div id="myProgress" style="position: absolute; bottom: 10%; left: '+bar_center+'px; width: '+trial.width+'px; background-color:grey"><div id="myBar" style="width: 1%; height: 30px; background-color: green"></div></div>';
    display_element.innerHTML += "<div id='success_text' style='display: none; background-color: green;'>You found food!</div>";
    display_element.innerHTML += "<div id='fail_text' style='display: none; background-color: green;'>Oops, no food here</div>";
    var canvas = display_element.querySelector('#myCanvas');
    var context = canvas.getContext('2d');

    if (video_preload_blob){
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').src = video_preload_blob;
    };

    setTimeout(function(){
        display_element.querySelector('#jspsych-video-prompt-response-stimulus').pause();
        setTimeout(function(){
            display_element.querySelector('#game-instructions').setAttribute("style", "display: block; border-radius: 4px; padding: 10px 10px 20px 20px; background-color: white; width: 600px; height: 480px; position: absolute; top: 22%; left: "+block_center+"px");
            display_element.querySelector('#foraging_display').setAttribute("style", "display: block; color: white; position: absolute; top: 15%; left: 47%");
            display_element.querySelector('#canvas_display').setAttribute("style", "display: block; align:center; position: absolute; top: 22%; left: "+grid_center+"px");
            var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: start_game,
                valid_responses: ['enter'],
                rt_method: 'performance',
                persist: false,
                allow_held_key: false
            });
        }, 500)
    }, trial.start_duration)

    window.addEventListener("keydown", function(e) {
        // space and arrow keys
        if([32, 37, 38, 39, 40, 70].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    function getMousePos(canvas, evt)
    {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    canvas.addEventListener('mousedown', function(evt) {
        var mousePos = getMousePos(canvas, evt);

        context.beginPath();
        context.clearRect(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, square_size, square_size);
        context.rect(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, square_size, square_size);
        context.strokeStyle = "white";
        context.stroke();
        context.closePath();

        block_x = parseInt(mousePos.x/square_size);
        block_y = parseInt(mousePos.y/square_size);

        curr_pos[0] = block_x*square_size+square_size/2;
        curr_pos[1] = block_y*square_size+square_size/2;

        drawAgent(context);
    }, false);

    var start_time = 0;
    var start_game = function(info) {
      display_element.querySelector('#game-instructions').setAttribute("style", "display: none;");
      startForaging(1);
      start_time = performance.now();
      progress_width = 1;
      increment = 100/parseFloat((trial.trial_duration[1]+trial.trial_duration[2]+27000)/1000);
      console.log(increment);

      update_progress = setInterval(function(){
            progress_width = progress_width + increment;
            display_element.querySelector('#myBar').style.width = progress_width + "%";
      }, 1000)

      update_pool = setInterval(function(){
            console.log("UPDATING POOL");

            // Clear all food
            for (x = start_x; x < trial.grid_size+1; x += square_size){
                for (y = start_y; y < trial.grid_size+1; y += square_size){
                    block_x = Math.floor(x/square_size);
                    block_y = Math.floor(y/square_size);
                    block_id = block_x.toString() + "_" + block_y.toString();
                    food_dict[block_id] = 0;
                }
            };

            // Update
            pool_count++;
            if (pool_count==4){ pool_count = 0;};
            pool_number = pool_pattern[pool_count];
            selected_pool = pools_dict[pool_number];
            loc_center = get_sample(selected_pool, 1)[0];

            local_pool_a = [[loc_center[0]-1, loc_center[1]-1], [loc_center[0], loc_center[1]-1], [loc_center[0]+1, loc_center[1]-1],
                                    [loc_center[0]-1, loc_center[1]], [loc_center[0], loc_center[1]], [loc_center[0]+1, loc_center[1]],
                                    [loc_center[0]-1, loc_center[1]+1], [loc_center[0], loc_center[1]+1], [loc_center[0]+1, loc_center[1]+1],
                                    ];
            local_pool_b = [[loc_center[0]-2, loc_center[1]-2], [loc_center[0], loc_center[1]-2], [loc_center[0]+2, loc_center[1]-2],
                                    [loc_center[0]-2, loc_center[1]], [loc_center[0], loc_center[1]], [loc_center[0]+2, loc_center[1]],
                                    [loc_center[0]-2, loc_center[1]+2], [loc_center[0], loc_center[1]+2], [loc_center[0]+2, loc_center[1]+2],
                                    ];
            local_pool_inner = [[loc_center[0]-1, loc_center[1]-1], [loc_center[0], loc_center[1]-1], [loc_center[0]+1, loc_center[1]-1],
                                    [loc_center[0]-1, loc_center[1]], [loc_center[0], loc_center[1]], [loc_center[0]+1, loc_center[1]],
                                    [loc_center[0]-1, loc_center[1]+1], [loc_center[0], loc_center[1]+1], [loc_center[0]+1, loc_center[1]+1],
                                    ];
            local_pool_outer = [[loc_center[0]-2, loc_center[1]-2], [loc_center[0], loc_center[1]-2], [loc_center[0]+2, loc_center[1]-2],
                                    [loc_center[0]-2, loc_center[1]], [loc_center[0], loc_center[1]], [loc_center[0]+2, loc_center[1]],
                                    [loc_center[0]-2, loc_center[1]+2], [loc_center[0], loc_center[1]+2], [loc_center[0]+2, loc_center[1]+2],
                                    ];

            // Remove out of grid cells
            for (i=0; i<local_pool_a.length; i++){
                cell = local_pool_a[i];
                check_included = selected_pool.some(a => cell.every((v, i) => v === a[i]));
                if (!check_included){
                    cell_index = searchForArray(local_pool_inner, cell);
                    local_pool_inner.splice(cell_index, 1);
                }
            }

            for (i=0; i<local_pool_b.length; i++){
                cell = local_pool_b[i];
                check_included = selected_pool.some(a => cell.every((v, i) => v === a[i]));
                if (!check_included){
                    cell_index = searchForArray(local_pool_outer, cell);
                    local_pool_outer.splice(cell_index, 1);
                }
            }

            console.log(local_pool_inner, local_pool_outer);

            // Draw new food
            drawFood(context);
      }, update_time);
    };

    display_element.querySelector('#jspsych-video-prompt-response-stimulus').onended = function(){
        display_element.querySelector('#foraging_display').setAttribute("style", "display: block; color: white; position: absolute; top: 15%; left: 47%");
        display_element.querySelector('#canvas_display').setAttribute("style", "display: block; align:center; position: absolute; top: 22%; left: "+grid_center+"px");
        startForaging(2);
    }

    // END TRIAL
    function endTrial() {
        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();

        // kill keyboard listeners
        jsPsych.pluginAPI.cancelAllKeyboardResponses();

        clearInterval(update_pool);
        clearInterval(update_progress);

        display_element.innerHTML = '';
        document.body.style.backgroundImage = "";

        var trial_data = {
            "stimulus": JSON.stringify(trial.stimuli),
            "a_list_positions": trial_data_a["list_positions"],
            "a_move_times": trial_data_a["move_times"],
            "a_total_moves": trial_data_a["total_moves"],
            "a_pool_a": trial_data_a["pool"],
            "a_food_score": trial_data_a["food_score"],
            "a_food_list": trial_data_a["food_list"],
            "a_food_times": trial_data_a["food_times"],
            "a_food_pools": trial_data_a["food_pools"],
            "a_food_center": trial_data_a["food_centers"],
            "a_food_latencies": trial_data_a["food_latencies"],
            "a_found_food_list": trial_data_a["found_food_list"],
            "a_curr_pool_list": trial_data_a["curr_pool_list"],
            "a_pool_list": trial_data_a["pool_list"],
            "b_list_positions": trial_data_b["list_positions"],
            "b_move_times": trial_data_b["move_times"],
            "b_total_moves": trial_data_b["total_moves"],
            "b_pool_a": trial_data_b["pool"],
            "b_food_score": trial_data_b["food_score"],
            "b_food_list": trial_data_b["food_list"],
            "b_food_times": trial_data_b["food_times"],
            "b_food_pools": trial_data_b["food_pools"],
            "b_food_center": trial_data_b["food_centers"],
            "b_food_latencies": trial_data_b["food_latencies"],
            "b_found_food_list": trial_data_b["found_food_list"],
            "b_curr_pool_list": trial_data_b["curr_pool_list"],
            "b_pool_list": trial_data_b["pool_list"],
        };

        console.log(trial_data);

        jsPsych.finishTrial(trial_data);
    }
  };
  return plugin;
})();
