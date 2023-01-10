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
      update_duration: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Trial duration',
        default: 60000,
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //BASIC SETUP
    var trial_data_a = {};
    var trial_data_b = {};

    var update_time = trial.update_duration;
    var num_squares = 10; //80;
    var half = 5;
    var square_size = trial.grid_size/num_squares; // number of squares
    var circle_size = 4;
    var block_center = screen.width/2 - 400;
    var grid_center = screen.width/2 - trial.canvas_size[0]/2;
    var bar_center = screen.width/2 - trial.width/2;
    console.log("Bar Center", bar_center)
    console.log("Grid Center", grid_center)

    // Display
    var subj_score = 0;
    var start_x = 0;
    var start_y = 0;
    var grid_dict = {};
    var food_dict = {};
    var center_position = get_sample([[num_squares/2-1, num_squares/2-1], [num_squares/2-1, num_squares/2], [num_squares/2, num_squares/2-1], [num_squares/2, num_squares/2]], 1)[0];
    var curr_pos = [center_position[0], center_position[1]];
    var previous_pos;
    var curr_pool;

    // Record interactions
    var first_key_press = 0;
    var start_time = 0;
    var trial_clock = 0;
    var curr_q = 'NA';

    // Food variables
    var checkForFood = 0;
    var prev_food;
    var new_food = center_position;

    // Complete food
    var food_list = [];
    var food_times = [];
    var food_pools = [];

    // Complete moves
    var move_list = [];
    var move_times = [];
    var move_pools = [];
    var move_points = [];
    var move_found_food = [];

    // Obtained food
    var found_food_latencies = [];
    var found_food_pools = [];

    // Matching pool
    var start_pool_clock = performance.now();
    var found_pool = 0;
    var found_pool_latencies = [];

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //FUNCTIONS
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

    function isArrayInArray(arr, item){
      var item_as_string = JSON.stringify(item);

      var contains = arr.some(function(ele){
        return JSON.stringify(ele) === item_as_string;
      });
      return contains;
    };

    function getMousePos(canvas, evt){
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    function randomG(v){
        var r = 0;
        for(var i = v; i > 0; i --){
            r += Math.random();
        }
        return r / v;
    }

    function rand( from, to ) {
        return Math.floor(Math.random()*(to-from+1)+from);
    }

    // from:     starting number
    // to:       ending number
    // inc:      distance between each random number
    // amount:   total number of random numbers
    function spacedRandArray( from, to, inc, amount ) {
        var retArray = [rand(from,to)]; // sets the first element
        var temp = null;

        for ( var x = 0; x < amount-1; x++ ) {
            do {
                temp = rand( from, to );
            } while ( Math.abs( temp - retArray[x] ) <= inc );

            retArray.push( temp );
        }

        return retArray;
    }

    Math.getDistance = function( x1, y1, x2, y2 ) {

        var xs = x2 - x1,
            ys = y2 - y1;

        xs *= xs;
        ys *= ys;

        return Math.sqrt( xs + ys );
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //CREATE FOUR GAUSSIANS
    var pools_dict = {}
    var pool = [];

    var num_pools = 2;

    // Get x values
    var sample_x = spacedRandArray(2, 6, 2, num_pools);
    var rand_x1 = sample_x[0];
    var rand_x2 = sample_x[1];
//    var rand_x3 = sample_x[2];
//    var rand_x4 = sample_x[3];

    // Get y values
    var sample_y = [2, 7];
    shuffle(sample_y);
    var rand_y1 = sample_y[0];
    var rand_y2 = sample_y[1];
//    var rand_y3 = sample_y[2];
//    var rand_y4 = sample_y[3];

    // Four centers
    var center1 = [rand_x1, rand_y1];
    var center2 = [rand_x2, rand_y2];
//    var center3 = [rand_x3, rand_y2];
//    var center4 = [rand_x4, rand_y4];
    var centers = [center1, center2];
    console.log("CENTERS: ", center1, center2);

    // Create pool pattern
    var pool_pattern = range(0, num_pools - 1);
    shuffle(pool_pattern);
    console.log("GLOBAL PATTERN: ", pool_pattern);

    // Build gaussians
    var gaussian_mean = 0.5;
    var gaussian_sd = 0.15;
    var local_pool_outer = [];
    var local_pool_inner = [];
    for (i=0; i<num_pools; i++){
        var loc_center = centers[i];
        var pool_inner = [[loc_center[0]-1, loc_center[1]-1], [loc_center[0], loc_center[1]-1], [loc_center[0]+1, loc_center[1]-1],
                            [loc_center[0]-1, loc_center[1]], [loc_center[0], loc_center[1]], [loc_center[0]+1, loc_center[1]],
                            [loc_center[0]-1, loc_center[1]+1], [loc_center[0], loc_center[1]+1], [loc_center[0]+1, loc_center[1]+1],
                            ];
//        var pool_outer = [[loc_center[0]-2, loc_center[1]-2], [loc_center[0]-1, loc_center[1]-2], [loc_center[0], loc_center[1]-2], [loc_center[0]+1, loc_center[1]-2],                         [loc_center[0]+2, loc_center[1]-2], [loc_center[0]-2, loc_center[1]-1], [loc_center[0]+2, loc_center[1]-1],
//                            [loc_center[0]-2, loc_center[1]], [loc_center[0]+2, loc_center[1]],
//                            [loc_center[0]-2, loc_center[1]+2], [loc_center[0]-1, loc_center[1]+2], [loc_center[0], loc_center[1]+2], [loc_center[0]+1, loc_center[1]+2], [loc_center[0]+2, loc_center[1]+2], [loc_center[0]-2, loc_center[1]+1], [loc_center[0]+2, loc_center[1]+1],
//                            ];

        var pool_outer = [[loc_center[0]-1, loc_center[1]+1], [loc_center[0], loc_center[1]+1], [loc_center[0]+1, loc_center[1]+1],
                            [loc_center[0]+2, loc_center[1]+1], [loc_center[0]-1, loc_center[1]], [loc_center[0]+2, loc_center[1]],
                            [loc_center[0]-1, loc_center[1]-1], [loc_center[0]+2, loc_center[1]-1],
                            [loc_center[0]-1, loc_center[1]-2], [loc_center[0], loc_center[1]-2], [loc_center[0]+1, loc_center[1]-2], [loc_center[0]+2, loc_center[1]-2]];
        pools_dict[i] = [pool_inner, pool_outer];
    }
    console.log("COMPLETE POOLS:", pools_dict);

    // Select quadrant
    var pool_number = pool_pattern[0];
    var pool_count = 0;
    var selected_pool = pools_dict[pool_number][0].concat(pools_dict[pool_number][1]);
    local_pool_inner = pools_dict[pool_number][0];
    local_pool_outer = pools_dict[pool_number][1];

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //DRAW GRID/AGENT/FOOD
    function drawGrid(context) {
        context.clearRect(0, 0, trial.canvas_size[0], trial.canvas_size[1]);
        context.beginPath();
        for (x = start_x; x < num_squares; x++){
            for (y = start_y; y < num_squares; y++){
                var block_x = x
                var block_y = y;
                var block_id = block_x.toString() + "_" + block_y.toString();
                grid_dict[block_id] = 0;
                food_dict[block_id] = 0;
                context.rect(block_x * square_size, block_y * square_size, square_size, square_size);
                context.strokeStyle = "white";
                context.stroke();
            }
        };
        context.closePath();

//        for (x = start_x; x < num_squares; x++){
//            for (y = start_y; y < num_squares; y++){
//                var block_x = x
//                var block_y = y;
//                if (isArrayInArray(pools_dict[0][0], [block_x, block_y]) || isArrayInArray(pools_dict[0][1], [block_x, block_y])){
//                    context.fillStyle = "rgba(232, 218, 239, 0.5)";
//                    context.beginPath();
//                    context.fillRect(block_x * square_size, block_y * square_size, square_size, square_size);
//                    context.closePath();
//                }
//            }
//        };
//        for (x = start_x; x < num_squares; x++){
//            for (y = start_y; y < num_squares; y++){
//                var block_x = x
//                var block_y = y;
//                if (isArrayInArray(pools_dict[1][0], [block_x, block_y]) || isArrayInArray(pools_dict[1][1], [block_x, block_y])){
//                    context.fillStyle = "rgba(174, 214, 241, 0.5)";
//                    context.beginPath();
//                    context.fillRect(block_x * square_size, block_y * square_size, square_size, square_size);
//                    context.closePath();
//                }
//            }
//        };
//        for (x = start_x; x < num_squares; x++){
//            for (y = start_y; y < num_squares; y++){
//                var block_x = x
//                var block_y = y;
//                if (isArrayInArray(pools_dict[2][0], [block_x, block_y]) || isArrayInArray(pools_dict[2][1], [block_x, block_y])){
//                    context.fillStyle = "rgba(249, 231, 159, 0.5)";
//                    context.beginPath();
//                    context.fillRect(block_x * square_size, block_y * square_size, square_size, square_size);
//                    context.closePath();
//                }
//            }
//        };
//        for (x = start_x; x < num_squares; x++){
//            for (y = start_y; y < num_squares; y++){
//                var block_x = x
//                var block_y = y;
//                if (isArrayInArray(pools_dict[3][0], [block_x, block_y]) || isArrayInArray(pools_dict[3][1], [block_x, block_y])){
//                    context.fillStyle = "rgba(230, 176, 170, 0.5)";
//                    context.beginPath();
//                    context.fillRect(block_x * square_size, block_y * square_size, square_size, square_size);
//                    context.closePath();
//                }
//            }
//        };

//        context.beginPath();
//        context.arc(curr_pos[0], curr_pos[1], circle_size, 0, 2 * Math.PI, false);
//        context.lineWidth = 1;
//        context.fillStyle = 'yellow';
//        context.strokeStyle = 'white';
//        context.fill();
//        context.stroke();
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
        console.log("FOOD:", new_food, pool_number);

        block_id = new_food[0].toString() + "_" + new_food[1].toString();

        // Update food dictionary so we know where the food is
        food_dict[block_id] = 1;

        // Add to running list of where food is
//        food_list.push(block_id);
//        food_times.push(performance.now() - start_time);
//        food_pools.push(pool_number);

    };

    var curr_points = 0;
    function drawAgent(context){
        canvas.removeEventListener("mousedown", move_user, false);

        context.beginPath();
        context.clearRect(previous_pos[0]-square_size/2, previous_pos[1]-square_size/2, square_size, square_size);
        context.rect(previous_pos[0]-square_size/2, previous_pos[1]-square_size/2, square_size, square_size);
        context.strokeStyle = "white";
        context.stroke();
        context.closePath();

        block_x = Math.floor(curr_pos[0]/square_size);
        block_y = Math.floor(curr_pos[1]/square_size);
        block_id = block_x.toString() + "_" + block_y.toString();
        grid_dict[block_id] += 1;

        pos = [block_x, block_y];

        // Add to running list of where agent is
        move_list.push(block_id);
        move_times.push((performance.now()-start_time));
        if (isArrayInArray(pools_dict[0][0], pos) || isArrayInArray(pools_dict[0][1], pos)){
            curr_pool = 0;
        } else if (isArrayInArray(pools_dict[1][0], pos) || isArrayInArray(pools_dict[1][1], pos)){
            curr_pool = 1;
        } else {
            curr_pool = -1;
        }
//        else if (isArrayInArray(pools_dict[3][0], pos) || isArrayInArray(pools_dict[3][1], pos)){
//            curr_pool = 3;
//        }
        move_pools.push(curr_pool);
        food_list.push(new_food[0].toString() + "_" + new_food[1].toString());
        food_times.push(performance.now() - start_time);
        food_pools.push(pool_number);

        if (parseInt(pool_number) == parseInt(curr_pool)){
            if (found_pool == 0){
                console.log("FOUND POOL!");
                found_pool = 1;
                found_pool_latencies.push(performance.now()-start_pool_clock);
            }
            move_found_food.push("in_pool");
        } else { move_found_food.push("not_in_pool");};

        found_food = 0;
        curr_food = new_food;
        console.log("WHERE ARE YOU:", curr_pool, pool_number)
        if (food_dict[block_id] == 1 && checkForFood == 1){
            checkForFood = 0;
            food_dict[block_id] = 0;
            found_food_pools.push(curr_pool);
            found_food = 1;

            // Modulate score based on distance
            curr_points = 10;
            subj_score += curr_points;
            display_element.querySelector('#success_text').innerHTML = "Perfect! You get " + (curr_points).toString() + " points.";
            display_element.querySelector('#score_text').innerHTML = subj_score;

            // Update display
            display_element.querySelector('#success_text').setAttribute("style", "display: block; position: absolute; background-color: #4CAF50; border: none; color: white; padding: 12px 30px; text-decoration: none; top: 10%; left: 30%");

            // Mark food
            context.beginPath();
            context.clearRect(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, square_size, square_size);
            context.rect(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, square_size, square_size);
            context.fillStyle = "green";
            context.fill();
            context.closePath();

            // Draw agent
            context.beginPath();
            context.arc(curr_pos[0], curr_pos[1], circle_size*2, 0, 2 * Math.PI, false);
            context.lineWidth = 1.5;
            context.fillStyle = 'yellow';
            context.strokeStyle = 'white';
            context.fill();
            context.stroke();
            context.closePath();

            setTimeout(function(){
                display_element.querySelector('#success_text').setAttribute("style", "display: none");

                context.clearRect(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, square_size, square_size);
                context.beginPath();
                context.rect(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, square_size, square_size);
                context.strokeStyle = 'white';
                context.stroke();
                context.closePath();

                // Draw agent
                context.beginPath();
                context.arc(curr_pos[0], curr_pos[1], circle_size, 0, 2 * Math.PI, false);
                context.lineWidth = 1.5;
                context.fillStyle = 'yellow';
                context.strokeStyle = 'white';
                context.fill();
                context.stroke();
                context.closePath();

                drawFood(context);

                canvas.addEventListener("mousedown", move_user, false);

            }, 2000);
        }
        else if (food_dict[block_id] == 0 && checkForFood == 1){
            checkForFood = 0;

            // Modulate score based on distance
            distance = Math.getDistance(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, new_food[0] * square_size, new_food[1] * square_size);

            console.log(isArrayInArray(local_pool_inner, pos), local_pool_inner, pos);
            console.log(isArrayInArray(local_pool_outer, pos), local_pool_outer, pos);

            if (isArrayInArray(local_pool_inner, pos)) {
                curr_points = 5;
                subj_score += curr_points;
                display_element.querySelector('#success_text').innerHTML = "So close - it was right next to you! " + (curr_points).toString() + " points.";
                display_element.querySelector('#success_text').setAttribute("style", "display: block; position: absolute; background-color: #4CAF50; border: none; color: white; padding: 12px 30px; text-decoration: none; top: 10%; left: 30%");
            } else if (isArrayInArray(local_pool_outer, pos)){
                curr_points = 4;
                subj_score += curr_points;
                display_element.querySelector('#success_text').innerHTML = "Great, you're in the right area! " + (curr_points).toString() + " points.";
                display_element.querySelector('#success_text').setAttribute("style", "display: block; position: absolute; background-color: #4CAF50; border: none; color: white; padding: 12px 30px; text-decoration: none; top: 10%; left: 30%");
//            } else if (distance < square_size*1){
//                curr_points = 5;
//                subj_score += curr_points;
//                display_element.querySelector('#success_text').innerHTML = "So close - it was right next to you! " + (curr_points).toString() + " points.";
//                display_element.querySelector('#success_text').setAttribute("style", "display: block; position: absolute; background-color: #4CAF50; border: none; color: white; padding: 12px 30px; text-decoration: none; top: 10%; left: 30%");
//            } else if (distance >= square_size*1 && distance < square_size*1.5){
//                curr_points = 5;
//                subj_score += curr_points;
//                display_element.querySelector('#success_text').innerHTML = "So close - it was right next to you! " + (curr_points).toString() + " points.";
//                display_element.querySelector('#success_text').setAttribute("style", "display: block; position: absolute; background-color: #4CAF50; border: none; color: white; padding: 12px 30px; text-decoration: none; top: 10%; left: 30%");
//            } else if (distance >= square_size*1.5 && distance < square_size*3){
//                curr_points = 3;
//                subj_score += curr_points;
//                display_element.querySelector('#success_text').innerHTML = "Close! The food was around 2 squares away! " + (curr_points).toString() + " points.";
//                display_element.querySelector('#success_text').setAttribute("style", "display: block; position: absolute; background-color: #4CAF50; border: none; color: white; padding: 12px 30px; text-decoration: none; top: 10%; left: 30%");
//            }
//            else if (distance >= square_size*3 && distance < square_size*4){
//                curr_points = 1;
//                subj_score += curr_points;
//                display_element.querySelector('#success_text').innerHTML = "Close! The food was around 3-4 squares away." + (curr_points).toString() + " point.";
//                display_element.querySelector('#success_text').setAttribute("style", "display: block; position: absolute; background-color: #4CAF50; border: none; color: white; padding: 12px 30px; text-decoration: none; top: 10%; left: 30%");
            } else {
                curr_points = 0;
                subj_score += 0;
                display_element.querySelector('#fail_text').innerHTML = "Oops, too far!";
                display_element.querySelector('#fail_text').setAttribute("style", "display: block; position: absolute; background-color: #FF4500; border: none; color: white; padding: 12px 30px; text-decoration: none; top: 10%; left: 30%");
            }
            display_element.querySelector('#score_text').innerHTML = subj_score;

            // Mark error
            context.beginPath();
            context.rect(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, square_size, square_size);
            context.fillStyle = "red";
            context.fill();
            context.closePath();

            // Draw true food location
//            context.beginPath();
//            context.rect(curr_food[0] * square_size, curr_food[1] * square_size, square_size, square_size);
//            context.fillStyle = "green";
//            context.fill();

            // Draw agent
            context.beginPath();
            context.arc(curr_pos[0], curr_pos[1], circle_size, 0, 2 * Math.PI, false);
            context.lineWidth = 1.5;
            context.fillStyle = 'yellow';
            context.strokeStyle = 'white';
            context.fill();
            context.stroke();
            context.closePath();

            // Draw text
            setTimeout(function(){
                display_element.querySelector('#fail_text').setAttribute("style", "display: none");
                display_element.querySelector('#success_text').setAttribute("style", "display: none");
                context.clearRect(curr_food[0] * square_size, curr_food[1] * square_size, square_size, square_size);
                context.clearRect(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, square_size, square_size);
                context.beginPath();
                context.rect(curr_food[0] * square_size, curr_food[1] * square_size, square_size, square_size);
                context.rect(curr_pos[0]-square_size/2, curr_pos[1]-square_size/2, square_size, square_size);
                context.strokeStyle = 'white';
                context.stroke();
                context.closePath();

                // Draw agent
                context.beginPath();
                context.arc(curr_pos[0], curr_pos[1], circle_size, 0, 2 * Math.PI, false);
                context.lineWidth = 1.5;
                context.fillStyle = 'yellow';
                context.strokeStyle = 'white';
                context.fill();
                context.stroke();
                context.closePath();

                //  Clear all food
                for (x = start_x; x < trial.grid_size+1; x += square_size){
                    for (y = start_y; y < trial.grid_size+1; y += square_size){
                        block_x = Math.floor(x/square_size);
                        block_y = Math.floor(y/square_size);
                        block_id = block_x.toString() + "_" + block_y.toString();
                        food_dict[block_id] = 0;
                    }
                };
                drawFood(context);

                canvas.addEventListener("mousedown", move_user, false);

            }, 1500);
        }
        else {
            // Update display
            context.beginPath();
            context.arc(curr_pos[0], curr_pos[1], circle_size, 0, 2 * Math.PI, false);
            context.lineWidth = 1.5;
            context.fillStyle = 'yellow';
            context.strokeStyle = 'white';
            context.fill();
            context.stroke();
            context.closePath();
        };
        move_points.push(curr_points);
        previous_pos = curr_pos;
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //TRIAL FLOW
    function startForaging(which_part){
        // Basic display
        food_count = 0;
        grid_dict = {};
        food_dict = {};
        curr_pos = [center_position[0] * square_size + square_size/2, center_position[1] * square_size + square_size/2];
        console.log("Center Pos", curr_pos);
        display_element.querySelector('#score_text').innerHTML = subj_score;

        // Record interactions
        first_key_press = 0;
        curr_q = 'NA';

        // Draw grid
        drawGrid(context);
        drawFood(context);

        jsPsych.pluginAPI.setTimeout(function() {
            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();
            jsPsych.pluginAPI.cancelAllKeyboardResponses();

            trial_data_a = {
                "stimulus": JSON.stringify(trial.stimuli),
                "move_times": move_times,
                "move_pools": move_pools,
                "move_list": move_list,
                "move_points": move_points,
                "move_found_food": move_found_food,
                "pool": pool_pattern,
                "food_score": subj_score,
                "food_list": food_list,
                "food_times": food_times,
                "food_pools": food_pools,
                "food_latencies": found_food_latencies,
                "found_food_list": found_food_pools,
                "found_pool_latencies": found_pool_latencies,
            };
            console.log("PRINTING DATA: ", trial_data_a);
            endTrial();
        }, trial.trial_duration[which_part]);
    }

    var total_pools = 0;
    var start_game = function(info) {
      canvas.addEventListener('mousedown', move_user, false);
      display_element.querySelector('#game-instructions').setAttribute("style", "display: none;");
      startForaging(1);
      start_time = performance.now();

      // Progress bar
      progress_width = 1;
      increment = 100/parseFloat(trial.trial_duration[1]/1000);
      update_progress = setInterval(function(){
            progress_width = progress_width + increment;
            display_element.querySelector('#myBar').style.width = progress_width + "%";
      }, 1000)

      // Update pool
      update_pool = setInterval(function(){
            console.log("UPDATING POOL");

            // Clear all food
            for (x = start_x; x < trial.grid_size+1; x += square_size){
                for (y = start_y; y < trial.grid_size+1; y += square_size){
                    block_x = Math.floor(x/square_size);
                    block_y = Math.floor(y/square_size);
                    block_id = block_x.toString() + "_" + block_y.toString();

//                    context.beginPath();
//                    context.clearRect(block_x * square_size, block_y * square_size, square_size, square_size);
//                    context.rect(block_x * square_size, block_y * square_size, square_size, square_size);
//                    context.strokeStyle = 'white';
//                    context.stroke();
//                    context.closePath();
//
//                    context.beginPath();
//                    context.arc(curr_pos[0], curr_pos[1], circle_size, 0, 2 * Math.PI, false);
//                    context.lineWidth = 1.5;
//                    context.fillStyle = 'yellow';
//                    context.fill();
//                    context.closePath();

                    food_dict[block_id] = 0;
                }
            };

            // Update
            pool_count++;
            total_pools++;
            if (pool_count==num_pools){ pool_count = 0;};
            pool_number = pool_pattern[pool_count];
            selected_pool = pools_dict[pool_number][0].concat(pools_dict[pool_number][1]);
            local_pool_inner = pools_dict[pool_number][0];
            local_pool_outer = pools_dict[pool_number][1];

            if (found_pool == 1){
                start_pool_clock = performance.now();
                found_pool = 0;
            } else {
                found_pool_latencies.push(performance.now()-start_pool_clock);
                start_pool_clock = performance.now();
                found_pool = 0;
            }

            console.log("NUMBER POOLS:", total_pools, pool_count, found_pool_latencies.length);
            // Draw new food
            drawFood(context);

      }, update_time);
    };

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
            "a_pool_pattern": trial_data_a["pool"],
            "a_food_score": trial_data_a["food_score"],
            "a_total_score": trial_data_a["food_score"],
            "a_move_list": trial_data_a["move_list"],
            "a_move_times": trial_data_a["move_times"],
            "a_move_pools": trial_data_a["move_pools"],
            "a_move_points": trial_data_a["move_points"],
            "a_move_found": trial_data_a["move_found_food"],
            "a_food_list": trial_data_a["food_list"],
            "a_food_times": trial_data_a["food_times"],
            "a_food_pools": trial_data_a["food_pools"],
            "a_found_pools": trial_data_a["found_pool_latencies"],
            "a_pool1": pools_dict[0],
            "a_pool2": pools_dict[1],
//            "a_pool3": pools_dict[2],
//            "a_pool4": pools_dict[3],
        };

        jsPsych.finishTrial(trial_data);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //HTML ELEMENTS
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
    display_element.innerHTML += "<div id='game-instructions' style='display: none'>You will now play a food-hunting game.  You will see a grid of squares, and your task is to find the square with a piece of food (there'll only be one piece at a time).<p>You can use your mouse cursor to click a square to find food. When you move to a square with a piece of food, the square will turn green. If the square has no food, the square instead will turn red, and you will receive feedback for how close you were to the food item.<p>The actual location of the food item will change every time you click a square. <b>But the locations of the food are clumped together -- so the next piece of food will often be close to the location of the previous food.</b>  Sometimes, even though you think you've found an area of food, you might get a note that you're far away from the piece of food again.  This means that the food clump has shifted to a different location in the board, so you have to find the new food clump again.</p><p>The number of points you get will depend on how close you are to the food. Try to earn as many points as you can! <b>Top scorers will earn bonus pay. (In particular, after 2 weeks, the 5 highest scorers will each receive 50% bonus pay.)</b><p>You'll see your food score at the top, and a progress bar at the bottom so you can see how much time there is left to this section. Just give it your best -- this'll only go for <b>7 minutes</b>.  Good luck!</p><p id='start-key' style='color: grey'><b>Press the ENTER key to begin.</p></b></div>";
    display_element.innerHTML += "<div id='foraging_display' style='display: none'>Your score: <span id='score_text'>"+subj_score+"</span><br><span style='font-size: 12px'>(TOP SCORE: 919)</span></div>" + "<div id='canvas_display' style='display: none;'>"+"<canvas id='myCanvas' width='"+trial.canvas_size[0]+"' height='"+trial.canvas_size[1]+"'></canvas>"+"</div>"+"</div>";
    display_element.innerHTML += '<div id="myProgress" style="position: absolute; bottom: 10%; left: '+bar_center+'px; width: '+trial.width+'px; background-color:grey"><div id="myBar" style="width: 1%; height: 30px; background-color: green"></div></div>';
    display_element.innerHTML += "<div id='success_text' style='display: none; background-color: green;'>You found food!</div>";
    display_element.innerHTML += "<div id='fail_text' style='display: none; background-color: green;'>Oops, no food here</div>";
    var canvas = display_element.querySelector('#myCanvas');
    var context = canvas.getContext('2d');

    move_user = function(evt){
        var mousePos = getMousePos(canvas, evt);

        checkForFood = 1;
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
    }



    if (video_preload_blob){
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').src = video_preload_blob;
    };

    setTimeout(function(){
        display_element.querySelector('#jspsych-video-prompt-response-stimulus').pause();
        setTimeout(function(){
            display_element.querySelector('#game-instructions').setAttribute("style", "display: block; border-radius: 4px; padding: 10px 10px 20px 20px; background-color: white; width: 850px; height: 575px; position: absolute; top: 22%; left: "+block_center+"px");
            display_element.querySelector('#foraging_display').setAttribute("style", "display: block; color: white; position: absolute; top: 15%; left: 47%");
            display_element.querySelector('#canvas_display').setAttribute("style", "display: block; align:center; position: absolute; top: 22%; left: "+grid_center+"px");

            setTimeout(function(){
                display_element.querySelector('#start-key').setAttribute("style", "color: black");
                var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: start_game,
                    valid_responses: ['enter'],
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
                });
            }, 5000);

        }, 500)
    }, trial.start_duration);
  };
  return plugin;
})();
