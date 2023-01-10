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
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: 2000,
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
    }
  }

  plugin.trial = function(display_element, trial) {
    var trial_data_a = {};
    var trial_data_b = {};

    var num_squares = 16; //80;
    var half = 8;
    var square_size = trial.grid_size/num_squares; // number of squares
    var circle_size = 4;

    // Basic display
    var subj_score = 0;
    var food_count = 0;
    var start_x = 0;
    var start_y = 0;
    var grid_dict = {};
    var food_dict = {};
    var center_position = get_sample([[7, 7], [7, 8], [8, 7], [8, 8]], 1)[0];
    var curr_pos = [center_position[0], center_position[1]];
    var previous_pos;

    // Record interactions
    var first_key_press = 0;
    var start_time = 0;
    var time_for_food = 0;
    var list_positions = [];
    var list_quadrants = [];
    var num_q1 = 0;
    var num_q2 = 0;
    var num_q3 = 0;
    var num_q4 = 0;
    var numA = 0;
    var numB = 0;
    var curr_q = 'NA';

    // Create quadrants
    var quadrant_a = [];
    var quadrant_b = [];
    var quadrant_c = [];
    var quadrant_d = [];

    for (x=0; x<half; x++){
        for (y=0; y<half; y++){
            quadrant_a.push([x, y]);
        }
    };

    for (x=half; x<num_squares; x++){
        for (y=0; y<half; y++){
            quadrant_b.push([x, y]);
        }
    }

    for (x=0; x<half; x++){
        for (y=half; y<num_squares; y++){
            quadrant_c.push([x, y]);
        }
    }

    for (x=half; x<num_squares; x++){
        for (y=half; y<num_squares; y++){
            quadrant_d.push([x, y]);
        }
    }

    var choices_a = [];
    var choices_b = [];
    var choices_c = [];
    var choices_d = [];

    for (x=0; x<2; x++){
        for (y=0; y<2; y++){
            choices_a.push([x, y]);
        }
    };

    for (x=9; x<11; x++){
        for (y=0; y<2; y++){
            choices_b.push([x, y]);
        }
    }

    for (x=0; x<2; x++){
        for (y=9; y<11; y++){
            choices_c.push([x, y]);
        }
    }

    for (x=9; x<11; x++){
        for (y=9; y<11; y++){
            choices_d.push([x, y]);
        }
    }

    // Select 2 quadrants
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
    var selected_quadrants = get_sample(["A", "B", "C", "D"], 2);
    shuffle(selected_quadrants);
//    console.log(selected_quadrants);

    if (selected_quadrants[0] == 'A'){ var corner_a = get_sample(choices_a, 1)}
    else if (selected_quadrants[0] == 'B'){ var corner_a = get_sample(choices_b, 1)}
    else if (selected_quadrants[0] == 'C'){ var corner_a = get_sample(choices_c, 1)}
    else if (selected_quadrants[0] == 'D'){ var corner_a = get_sample(choices_d, 1)};
    if (selected_quadrants[1] == 'A'){ var corner_b = get_sample(choices_a, 1)}
    else if (selected_quadrants[1] == 'B'){ var corner_b = get_sample(choices_b, 1)}
    else if (selected_quadrants[1] == 'C'){ var corner_b = get_sample(choices_c, 1)}
    else if (selected_quadrants[1] == 'D'){ var corner_b = get_sample(choices_d, 1)};

    var pool_a = [];
    var pool_b = [];

    for (x=corner_a[0][0]; x<corner_a[0][0]+6; x++){
        for (y=corner_a[0][1]; y<corner_a[0][1]+6; y++){
            pool_a.push([x, y]);
        }
    }

    for (x=corner_b[0][0]; x<corner_b[0][0]+6; x++){
        for (y=corner_b[0][1]; y<corner_b[0][1]+6; y++){
            pool_b.push([x, y]);
        }
    }

//    console.log(corner_a, corner_b, pool_a, pool_b)

    // Draw food
    var food_distribution = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1];

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

    function get_random_value(array){
        return jsPsych.randomization.sampleWithoutReplacement(array, 1)[0]
    };

    function drawFood(context, random, count){
        if (random == "random"){
            which_pool = get_random_value(food_distribution);
        } else {
            which_pool = food_distribution[count];
        }
        if (which_pool == 0){ new_food = get_random_value(pool_a);}
        else if (which_pool == 1){ new_food = get_random_value(pool_b);}
//        console.log(new_food);

        block_id = new_food[0].toString() + "_" + new_food[1].toString();
        food_dict[block_id] = 1;

        if (trial.visible_stats){
            context.beginPath();
            context.rect(new_food[0] * square_size, new_food[1] * square_size, square_size, square_size);
            context.fillStyle = "green";
            context.fill();
        }

        food_count += 1;
        display_element.querySelector('#food_text').innerHTML = food_count;
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

        if (trial.visible_stats){
            context.fillStyle = 'lightgrey';
            context.fill();
        };

        block_x = Math.floor(curr_pos[0]/square_size);
        block_y = Math.floor(curr_pos[1]/square_size);
        block_id = block_x.toString() + "_" + block_y.toString();
        grid_dict[block_id] += 1;
//        console.log(block_id);

        pos = [block_x, block_y];
        list_positions.push(pos);
        if (isArrayInArray(quadrant_a, pos)){ curr_q = 'A'; num_q1 += 1}
        else if (isArrayInArray(quadrant_b, pos)){ curr_q = 'B'; num_q2 += 1}
        else if (isArrayInArray(quadrant_c, pos)){ curr_q = 'C'; num_q3 += 1}
        else if (isArrayInArray(quadrant_d, pos)){ curr_q = 'D'; num_q4 += 1};
        console.log(pos, curr_q);
        list_quadrants.push(curr_q);

        if (isArrayInArray(pool_a, pos)){ numA += 1}
        else if (isArrayInArray(pool_b, pos)){ numB += 1}

        if (food_dict[block_id] == 1){
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
            display_element.querySelector('#food_text').innerHTML = food_count;
            food_dict[block_id] = 0;
            setTimeout(function(){
                display_element.querySelector('#success_text').setAttribute("style", "display: none");
            }, 1000);
        } else {
            context.beginPath();
            context.arc(curr_pos[0], curr_pos[1], circle_size, 0, 2 * Math.PI, false);
            context.lineWidth = 1.5;
            context.fillStyle = 'yellow';
            context.strokeStyle = 'white';
            context.fill();
            context.stroke();
            context.closePath();
        };
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
    };

    function startForaging(which_part){
        // Basic display
        subj_score = 0;
        food_count = 0;
        grid_dict = {};
        food_dict = {};
        curr_pos = [center_position[0] * square_size + square_size/2, center_position[1] * square_size + square_size/2];
        console.log("Center Pos", curr_pos);

        drawGrid(context);

        // Record interactions
        first_key_press = 0;
        start_time = 0;
        time_for_food = 0;
        list_positions = [];
        list_quadrants = [];
        num_q1 = 0;
        num_q2 = 0;
        num_q3 = 0;
        num_q4 = 0;
        numA = 0;
        numB = 0;
        curr_q = 'NA';

        for (i=0; i<10; i++){
            drawFood(context, 'start', i);
        };

        update_food = setInterval(function(){
//            console.log("adding food")
            drawFood(context, "random", 0);
        }, 4000);

        document.addEventListener('keydown', move_dot, true);

        jsPsych.pluginAPI.setTimeout(function() {
            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            // kill keyboard listeners
            jsPsych.pluginAPI.cancelAllKeyboardResponses();
            document.removeEventListener('keydown', move_dot, true);

            clearInterval(update_food);

            if (which_part==1){
                trial_data_a = {
                    "stimulus": JSON.stringify(trial.stimuli),
                    "list_quadrants": list_quadrants,
                    "list_positions": list_positions,
                    "num_q1": num_q1,
                    "num_q2": num_q2,
                    "num_q3": num_q3,
                    "num_q4": num_q4,
                    "numA": numA,
                    "numB": numB,
                    "total_moves": list_positions.length,
                    "pool_a": [selected_quadrants[0], corner_a],
                    "pool_b": [selected_quadrants[1], corner_b],
                    "food_score": subj_score
                };
                display_element.querySelector('#foraging_display').setAttribute("style", "display: none;");
                display_element.querySelector('#jspsych-video-prompt-response-stimulus').play();
            } else if (which_part==2){
                trial_data_b = {
                    "stimulus": JSON.stringify(trial.stimuli),
                    "list_quadrants": list_quadrants,
                    "list_positions": list_positions,
                    "num_q1": num_q1,
                    "num_q2": num_q2,
                    "num_q3": num_q3,
                    "num_q4": num_q4,
                    "numA": numA,
                    "numB": numB,
                    "total_moves": list_positions.length,
                    "pool_a": [selected_quadrants[0], corner_a],
                    "pool_b": [selected_quadrants[1], corner_b],
                    "food_score": subj_score
                };
                endTrial();
            }
        }, trial.trial_duration);
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
    video_html +=">";

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
    display_element.innerHTML += "<div id='game-instructions' style='display:block; border-radius: 4px; padding: 10px 10px 20px 20px; background-color: white; width: 600px; height: 380px; position: absolute; top: 20%; left: 35%'>You will now play a food-hunting game.  You will see a grid of squares, and a yellow disc on one of the squares.<p>The yellow disc represents where YOU are on the grid.  You can move around the grid by using the up, down, left, and right arrow keys.</p><p>When you move to a square with a piece of food, the square will turn green to indicate you found food.  New food will be added throughout the game.  Food appears in clumps -- so if you find food in a square, there will most likely be food close by.  Try to collect as much food as you can!  (You'll see your food score at the top, and below this is a counter of how much food you haven't collected yet.)<p>Press the ENTER key to begin.</p></div>";
    display_element.innerHTML += "<div id='foraging_display'><div style='color: white; position: absolute; top: 10%; left: 47%'>Your score: <span id='score_text'>"+subj_score+"</span><br>Food available: <span id='food_text'>"+food_count+"</span></div>" + "<div style='align:center; position: absolute; top: 20%; left: 40%'>"+"<canvas id='myCanvas' width='"+trial.canvas_size[0]+"' height='"+trial.canvas_size[1]+"'></canvas>"+"</div>"+"</div>";
    display_element.innerHTML += "<div id='success_text' style='display: none; background-color: green;'>You found food!</div>";
    var canvas = display_element.querySelector('#myCanvas');
    var context = canvas.getContext('2d');

    // Part 1
    window.addEventListener("keydown", function(e) {
        // space and arrow keys
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    var start_game = function(info) {
      display_element.querySelector('#game-instructions').setAttribute("style", "display: none;");
      startForaging(1);
    };

    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: start_game,
        valid_responses: ['enter'],
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
    });

    // Part 2
    if (video_preload_blob){
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').src = video_preload_blob;
    };

    // Part 3
    display_element.querySelector('#jspsych-video-prompt-response-stimulus').onended = function(){
        display_element.querySelector('#foraging_display').setAttribute("style", "display: block;");
        startForaging(2);
    }

    // END TRIAL
    function endTrial() {
        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();

        // kill keyboard listeners
        jsPsych.pluginAPI.cancelAllKeyboardResponses();

        display_element.innerHTML = '';
        document.body.style.backgroundImage = "";

        var trial_data = {
            "stimulus": JSON.stringify(trial.stimuli),
            "a_list_quadrants": trial_data_a["list_quadrants"],
            "a_list_positions": trial_data_a["list_positions"],
            "a_num_q1": trial_data_a["num_q1"],
            "a_num_q2": trial_data_a["num_q2"],
            "a_num_q3": trial_data_a["num_q3"],
            "a_num_q4": trial_data_a["num_q4"],
            "a_numA": trial_data_a["numA"],
            "a_numB": trial_data_a["numB"],
            "a_total_moves": trial_data_a["total_moves"],
            "a_pool_a": trial_data_a["pool_a"],
            "a_pool_b": trial_data_a["pool_b"],
            "a_food_score": trial_data_a["food_score"],
            "b_list_quadrants": trial_data_b["list_quadrants"],
            "b_list_positions": trial_data_b["list_positions"],
            "b_num_q1": trial_data_b["num_q1"],
            "b_num_q2": trial_data_b["num_q2"],
            "b_num_q3": trial_data_b["num_q3"],
            "b_num_q4": trial_data_b["num_q4"],
            "b_numA": trial_data_b["numA"],
            "b_numB": trial_data_b["numB"],
            "b_total_moves": trial_data_b["total_moves"],
            "b_pool_a": trial_data_b["pool_a"],
            "b_pool_b": trial_data_b["pool_b"],
            "b_food_score": trial_data_b["food_score"],
        };

        console.log(trial_data);

        jsPsych.finishTrial(trial_data);
    }
  };
  return plugin;
})();
