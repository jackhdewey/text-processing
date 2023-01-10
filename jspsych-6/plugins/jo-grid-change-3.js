/*
 * Example plugin template
 */

jsPsych.plugins["jo-grid-change"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "jo-grid-change",
    parameters: {
      grid_size: {
        type: jsPsych.plugins.parameterType.INT,
        default: 200
      },
      change_time: {
        type: jsPsych.plugins.parameterType.INT,
        default: 3000
      },
      change_inc: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0.0001
      },
      image_source: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'images/pattern_bottom.png'
      },
      condition: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'match'
      },
      imagery_condition: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'imagery'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    if (trial.imagery_condition=='imagery'){
        display_element.innerHTML = "<p>Imagine this:</p><img width=30% src='"+trial.image_source+"'></img><br><br><div style='align:center; margin: 0 auto'>"+"<canvas id='myCanvas' width='"+trial.grid_size+"' height='"+trial.grid_size+"'></canvas>"+"</div>";
        document.documentElement.style.cursor = 'none';
    } else if (trial.imagery_condition=='no_imagery'){
        display_element.innerHTML = ""+"<canvas id='myCanvas' width='"+trial.grid_size+"' height='"+trial.grid_size+"'></canvas>"+"</div>";
        document.documentElement.style.cursor = 'none';
    }


    var start_x = 0;
    var start_y = 0;
    var num_squares = 3;
    var square_size = trial.grid_size/num_squares;
    var grid_dict = {};
    var standard_opacity = 0.3;
//    var shape_squares = ['0_0', '0_1', '0_2', '1_0', '1_1', '1_2', '2_0', '2_1', '2_2'];

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

//    if (trial.condition=='on'){
//        if (trial.image_source=='images/pattern_bottom.png'){
//            var shape_squares = get_sample(['0_0', '0_1', '0_2', '1_2', '2_0', '2_1', '2_2'], 3);
//        } else if (trial.image_source=='images/pattern_top.png'){
//            var shape_squares = get_sample(['0_0', '0_1', '0_2', '1_0', '2_0', '2_1', '2_2'], 3);
//        } else if (trial.image_source=='images/pattern_left.png'){
//            var shape_squares = get_sample(['0_0', '0_1', '0_2', '1_0', '1_2', '2_0', '2_2'], 3);
//        } else if (trial.image_source=='images/pattern_right.png'){
//            var shape_squares = get_sample(['0_0', '0_2', '1_0', '1_2', '2_0', '2_1', '2_2'], 3);
//        }
//    } else if (trial.condition=='off'){
//        if (trial.image_source=='images/pattern_bottom.png'){
//            var shape_squares = ['1_0', '1_1'].concat(get_sample(['0_0', '0_1', '0_2', '1_2', '2_0', '2_1', '2_2'], 1)[0]);
//        } else if (trial.image_source=='images/pattern_top.png'){
//            var shape_squares = ['1_1', '1_2'].concat(get_sample(['0_0', '0_1', '0_2', '1_0', '2_0', '2_1', '2_2'], 1)[0]);
//        } else if (trial.image_source=='images/pattern_left.png'){
//            var shape_squares = ['1_1', '2_1'].concat(get_sample(['0_0', '0_1', '0_2', '1_0', '1_2', '2_0', '2_2'], 1)[0]);
//        } else if (trial.image_source=='images/pattern_right.png'){
//            var shape_squares = ['0_1', '1_1'].concat(get_sample(['0_0', '0_2', '1_0', '1_2', '2_0', '2_1', '2_2'], 1)[0]);
//        }
//    }

    if (trial.condition=='on'){
        if (trial.image_source=='images/01.png'){
            var shape_squares = get_sample(['0_1', '0_2', '1_1', '2_0', '2_1'], 3);
        } else if (trial.image_source=='images/02.png'){
            var shape_squares = get_sample(['0_0', '1_0', '1_1', '1_2', '2_2'], 3);
        } else if (trial.image_source=='images/03.png'){
            var shape_squares = get_sample(['0_2', '1_0', '1_1', '1_2', '2_0'], 3);
        } else if (trial.image_source=='images/04.png'){
            var shape_squares = get_sample(['0_0', '0_1', '1_1', '2_1', '2_2'], 3);
        }
    } else if (trial.condition=='off'){
        if (trial.image_source=='images/01.png'){
            var shape_squares = get_sample(['0_0', '1_0', '1_2', '2_2'], 2).concat(get_sample(['0_1', '0_2', '1_1', '2_0', '2_1'], 1));
        } else if (trial.image_source=='images/02.png'){
            var shape_squares = get_sample(['0_1', '0_2', '2_0', '2_1'], 2).concat(get_sample(['0_0', '1_0', '1_1', '1_2', '2_2'], 1));
        } else if (trial.image_source=='images/03.png'){
            var shape_squares = get_sample(['0_0', '0_1', '2_1', '2_2'], 2).concat(get_sample(['0_2', '1_0', '1_1', '1_2', '2_0'], 1));
        } else if (trial.image_source=='images/04.png'){
            var shape_squares = get_sample(['0_2', '1_0', '1_2', '2_0'], 2).concat(get_sample(['0_0', '0_1', '1_1', '2_1', '2_2'], 1));
        }
    }

    function drawGrid(context) {
        context.clearRect(0, 0, trial.grid_size, trial.grid_size);
        for (x = start_x; x < num_squares; x++){
            for (y = start_y; y < num_squares; y++){
                context.beginPath();
                var block_x = x
                var block_y = y;
                var block_id = block_x.toString() + "_" + block_y.toString();
                grid_dict[block_id] = 0;

                context.fillStyle = "rgba(120, 120, 120, " + standard_opacity.toString() + ")";
                context.fillRect(block_x * square_size, block_y * square_size, square_size, square_size);
                context.strokeStyle = "#505050";
                context.lineWidth = 0.8;
                context.strokeRect(block_x * square_size, block_y * square_size, square_size, square_size);

                context.closePath();
            }
        };
    };

    function shuffle(array) {
      for (var i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
      }
    };

    var t_start = performance.now();
    var t_now = 0;
    var change_time = 3000;
    var change_duration = 1000;
    var change_half = change_duration/2;
    var new_opacity = standard_opacity;
    var change_inc = trial.change_inc;
    // 0.0001 --> 0.3 to 0.27; 0.0002 --> 0.3 to 0.24; 0.0003 --> 0.3 to 0.21, 0.0004 --> 0.3 to 0.18, 0.0005 --> 0.3 to 0.15
    var trial_duration = 5000;
    console.log(trial.condition, change_inc);

    function changeSquares() {
        t_now = performance.now() - t_start;
        if (t_now > change_time+change_duration){
            context.clearRect(0, 0, trial.grid_size, trial.grid_size);
            for (x = start_x; x < num_squares; x++){
                for (y = start_y; y < num_squares; y++){
                    context.beginPath();
                    var block_x = x
                    var block_y = y;
                    var block_id = block_x.toString() + "_" + block_y.toString();
                    grid_dict[block_id] = 0;

                    context.fillStyle = "rgba(120, 120, 120, " + standard_opacity.toString() + ")";
                    context.fillRect(block_x * square_size, block_y * square_size, square_size, square_size);
                    context.strokeStyle = "#505050";
                    context.lineWidth = 0.8;
                    context.strokeRect(block_x * square_size, block_y * square_size, square_size, square_size);

                    context.closePath();
                }
            };
            requestAnimationFrame(changeSquares);
        }
        else if (t_now > change_time+change_half){
            context.clearRect(0, 0, trial.grid_size, trial.grid_size);
            for (x = start_x; x < num_squares; x++){
                for (y = start_y; y < num_squares; y++){
                    context.beginPath();
                    var block_x = x
                    var block_y = y;
                    var block_id = block_x.toString() + "_" + block_y.toString();
                    if (shape_squares.includes(block_id)){
                        new_opacity += change_inc;
                        context.fillStyle = "rgba(120, 120, 120, " + new_opacity.toString() + ")";
                        context.fillRect(block_x * square_size, block_y * square_size, square_size, square_size);
                        context.strokeStyle = "#505050";
                        context.lineWidth = 0.8;
                        context.strokeRect(block_x * square_size, block_y * square_size, square_size, square_size);
                    } else {
                        context.fillStyle = "rgba(120, 120, 120, " + standard_opacity.toString() + ")";
                        context.fillRect(block_x * square_size, block_y * square_size, square_size, square_size);
                        context.strokeStyle = "#505050";
                        context.lineWidth = 0.8;
                        context.strokeRect(block_x * square_size, block_y * square_size, square_size, square_size);
                    }
                    context.closePath();
                }
            };
            requestAnimationFrame(changeSquares);
        }
        else if (t_now > change_time){
            context.clearRect(0, 0, trial.grid_size, trial.grid_size);
            for (x = start_x; x < num_squares; x++){
                for (y = start_y; y < num_squares; y++){
                    context.beginPath();
                    var block_x = x
                    var block_y = y;
                    var block_id = block_x.toString() + "_" + block_y.toString();
                    if (shape_squares.includes(block_id)){
                        new_opacity -= change_inc;
                        context.fillStyle = "rgba(120, 120, 120, " + new_opacity.toString() + ")";
                        context.fillRect(block_x * square_size, block_y * square_size, square_size, square_size);
                        context.strokeStyle = "#505050";
                        context.lineWidth = 0.8;
                        context.strokeRect(block_x * square_size, block_y * square_size, square_size, square_size);
                    } else {
                        context.fillStyle = "rgba(120, 120, 120, " + standard_opacity.toString() + ")";
                        context.fillRect(block_x * square_size, block_y * square_size, square_size, square_size);
                        context.strokeStyle = "#505050";
                        context.lineWidth = 0.8;
                        context.strokeRect(block_x * square_size, block_y * square_size, square_size, square_size);
                    }
                    context.closePath();
                }
            };
            requestAnimationFrame(changeSquares);
        }
        else {
            requestAnimationFrame(changeSquares);
        }
    };

    var canvas = display_element.querySelector('#myCanvas');
    var context = canvas.getContext('2d');

    drawGrid(context);

    if (trial.condition != 'none'){
        changeSquares();
    }

    setTimeout(end_trial, trial_duration);

    function end_trial() {
        display_element.innerHTML = '';
        document.documentElement.style.cursor = 'auto';

        var trial_data = {
          canvas_size: trial.canvas_size,
          change_time: trial.change_time,
          shape_squares: shape_squares,
          imagery_condition: trial.imagery_condition
        };

        // end trial
        jsPsych.finishTrial(trial_data);
    };


  };

  return plugin;
})();
