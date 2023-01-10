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
    }
  }

  plugin.trial = function(display_element, trial) {
    // Basic display
    var subj_score = 0;
    var food_count = 0;
    var start_x = 0;
    var start_y = 0;
    var num_squares = 16; //80;
    var half = 8;
    var square_size = trial.grid_size/num_squares; // number of squares
    var grid_dict = {};
    var food_dict = {};
    var curr_pos = [trial.canvas_size[0]/2+square_size/2, trial.canvas_size[1]/2+square_size/2];
    var previous_pos;
    var circle_size = 4;

    document.body.style.backgroundImage = "url('images/video_door_2.png')";
    display_element.innerHTML += "<div style='color: white'>Your score: <span id='score_text'>"+subj_score+"</span><br>Food available: <span id='food_text'>"+food_count+"</span></div>" + "<div style='align:center; margin: 0 auto'>"+"<canvas id='myCanvas' width='"+trial.canvas_size[0]+"' height='"+trial.canvas_size[1]+"'></canvas>"+"</div>";
    display_element.innerHTML += "<div id='success_text' style='display: none; background-color: green;'>You found food!</div>";

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
        console.log("Grid", grid_dict);

        context.beginPath();
        context.arc(curr_pos[0], curr_pos[1], circle_size, 0, 2 * Math.PI, false);
        context.lineWidth = 1;
        context.fillStyle = 'yellow';
        context.strokeStyle = 'white';
        context.fill();
        context.stroke();
        previous_pos = curr_pos;
    };

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
    console.log(selected_quadrants);

    if (selected_quadrants[0] == 'A'){ var pool_a = quadrant_a}
    else if (selected_quadrants[0] == 'B'){ var pool_a = quadrant_b}
    else if (selected_quadrants[0] == 'C'){ var pool_a = quadrant_c}
    else if (selected_quadrants[0] == 'D'){ var pool_a = quadrant_d};
    if (selected_quadrants[1] == 'A'){ var pool_b = quadrant_a}
    else if (selected_quadrants[1] == 'B'){ var pool_b = quadrant_b}
    else if (selected_quadrants[1] == 'C'){ var pool_b = quadrant_c}
    else if (selected_quadrants[1] == 'D'){ var pool_b = quadrant_d};

    // Draw food
    var food_distribution = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1];

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
        console.log(new_food);

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
        console.log(block_id);

        pos = [block_x, block_y];
        list_positions.push(pos);
        if (isArrayInArray(quadrant_a, pos)){ curr_q = 'A'; num_q1 += 1}
        else if (isArrayInArray(quadrant_b, pos)){ curr_q = 'B'; num_q2 += 1}
        else if (isArrayInArray(quadrant_c, pos)){ curr_q = 'C'; num_q3 += 1}
        else if (isArrayInArray(quadrant_d, pos)){ curr_q = 'D'; num_q4 += 1};
        console.log(pos, curr_q);
        list_quadrants.push(curr_q);

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

    var canvas = display_element.querySelector('#myCanvas');
    var context = canvas.getContext('2d');
    drawGrid(context);
    for (i=0; i<10; i++){
        drawFood(context, 'start', i);
    }

    // RECORD INTERACTIONS
    var first_key_press = 0;
    var start_time = 0;
    var time_for_food = 0;
    var list_positions = [];
    var list_quadrants = [];
    var num_q1 = 0;
    var num_q2 = 0;
    var num_q3 = 0;
    var num_q4 = 0;
    var curr_q = 'NA';

    document.addEventListener('keydown', move_dot, false);
    function move_dot(evt){
//        console.log(evt.keyCode, curr_pos);
        block_x = Math.floor(curr_pos[0]/square_size);
        block_y = Math.floor(curr_pos[1]/square_size);
        console.log(block_x, curr_pos)

        if (evt.keyCode == 39){ if(block_x < num_squares-1){ curr_pos = [curr_pos[0]+square_size, curr_pos[1]]; drawAgent(context)};} // right
        else if (evt.keyCode == 37){ if(block_x > 0){ curr_pos = [curr_pos[0]-square_size, curr_pos[1]]; drawAgent(context)};} // left
        else if (evt.keyCode == 38){ if(block_y > 0){ curr_pos = [curr_pos[0], curr_pos[1]-square_size]; drawAgent(context)};} // up
        else if (evt.keyCode == 40){ if(block_y < num_squares-1){ curr_pos = [curr_pos[0], curr_pos[1]+square_size]; drawAgent(context)};} // down

        if (first_key_press == 0){
            first_key_press = 1;
            drawFood(context, "random", 0);
            start_time = performance.now();
            time_for_food = (start_time/1000)+4;
        } else {
            time_elapsed = (performance.now() - start_time)/1000;
            if (time_elapsed > time_for_food){
                drawFood(context, "random", 0);
                time_for_food = time_elapsed+4;
            };
        };
    };

    // END TRIAL
    jsPsych.pluginAPI.setTimeout(function() {
        endTrial();
    }, trial.trial_duration);

    function endTrial() {
        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();

        // kill keyboard listeners
        jsPsych.pluginAPI.cancelAllKeyboardResponses();

        display_element.innerHTML = '';
        document.body.style.backgroundImage = "";

        var trial_data = {
            "stimulus": JSON.stringify(trial.stimuli),
            "list_quadrants": list_quadrants,
            "list_positions": list_positions,
            "num_q1": num_q1,
            "num_q2": num_q2,
            "num_q3": num_q3,
            "num_q4": num_q4,
            "total_moves": list_positions.length,
            "pool_a": selected_quadrants[0],
            "pool_b": selected_quadrants[1],
            "food_score": subj_score
        };

        console.log(trial_data);

        jsPsych.finishTrial(trial_data);
    }
  };
  return plugin;
})();
