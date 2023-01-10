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
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    display_element.innerHTML = "<p>Imagine this:</p><img width=30% src='"+trial.image_source+"'></img><br><br><div style='align:center; margin: 0 auto'>"+"<canvas id='myCanvas' width='"+trial.grid_size+"' height='"+trial.grid_size+"'></canvas>"+"</div>";
    document.documentElement.style.cursor = 'none';

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

    if (trial.image_source=='images/pattern_bottom.png'){
        var shape_squares = get_sample(['0_0', '0_1', '0_2', '1_2', '2_0', '2_1', '2_2'], 3);
    } else if (trial.image_source=='images/pattern_top.png'){
        var shape_squares = get_sample(['0_0', '0_1', '0_2', '1_0', '2_0', '2_1', '2_2'], 3);
    } else if (trial.image_source=='images/pattern_left.png'){
        var shape_squares = get_sample(['0_0', '0_1', '0_2', '1_0', '1_2', '2_0', '2_2'], 3);
    } else if (trial.image_source=='images/pattern_right.png'){
        var shape_squares = get_sample(['0_0', '0_2', '1_0', '1_2', '2_0', '2_1', '2_2'], 3);
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
    var change_inc = trial.change_inc; // 0.0001 --> 0.3 to 0.27; 0.0002 --> 0.3 to 0.25
    shuffle(change_inc);
    var trial_duration = 5000;

    function changeSquares() {
        t_now = performance.now() - t_start;
        if (t_now > trial_duration){
            setTimeout(end_trial, 500);
        }
        else if (t_now > change_time+change_duration){
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
    changeSquares();

    function end_trial() {
        console.log(trial.condition);
        display_element.innerHTML = '';
        document.documentElement.style.cursor = 'auto';

        var trial_data = {
          canvas_size: trial.canvas_size,
          change_time: trial.change_time,
          shape_squares: shape_squares
        };

        // end trial
        jsPsych.finishTrial(trial_data);
    };


  };

  return plugin;
})();
