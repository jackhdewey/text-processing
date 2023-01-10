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
        default: screen.width*.15
      },
      change_time: {
        type: jsPsych.plugins.parameterType.INT,
        default: 3000
      },
      change_inc: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0.025
      },
      image_source: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'images/pattern_bottom.png'
      },
      change_shape: {
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
        display_element.innerHTML = "<p>Imagine this:</p><img width=5% src='"+trial.image_source+"'></img><br><br><div style='align:center; margin: 0 auto'>"+"<canvas id='myCanvas' width='"+trial.grid_size+"' height='"+trial.grid_size+"'></canvas>"+"</div>";
        document.documentElement.style.cursor = 'none';
    } else if (trial.imagery_condition=='no_imagery'){
        display_element.innerHTML = ""+"<canvas id='myCanvas' width='"+trial.grid_size+"' height='"+trial.grid_size+"'></canvas>"+"</div>";
        document.documentElement.style.cursor = 'none';
    } else if (trial.imagery_condition=='practice'){
        display_element.innerHTML = "<p>Imagine this:</p><img width=5% src='"+trial.image_source+"'></img><br><br><div style='align:center; margin: 0 auto'>"+"<canvas id='myCanvas' width='"+trial.grid_size+"' height='"+trial.grid_size+"'></canvas>"+"</div><p>The display will automatically advance in 5 seconds.</p>";
        document.documentElement.style.cursor = 'none';
    }

    var start_x = 0;
    var start_y = 0;
    var num_squares = 3;
    var square_size = trial.grid_size/num_squares;
    var grid_dict = {};
    var standard_opacity = 0.24;
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

    var shape_squares = [];
    if (trial.change_shape=='images/corner-bottomL.png'){
        var shape_squares = ['0_0', '0_1', '0_2', '1_2', '2_2'];
    } else if (trial.change_shape=='images/corner-topL.png'){
        var shape_squares = ['0_0', '0_1', '0_2', '1_0', '2_0'];
    } else if (trial.change_shape=='images/corner-bottomR.png'){
        var shape_squares = ['0_2', '1_2', '2_2', '2_1', '2_0'];
    } else if (trial.change_shape=='images/corner-topR.png'){
        var shape_squares = ['0_0', '1_0', '2_0', '2_1', '2_2'];
    }

//    if (trial.condition=='match'){
//        if (trial.change_shape=='images/corner-bottomL.png'){
//            var shape_squares = ['0_0', '0_1', '0_2', '1_2', '2_2'];
//        } else if (trial.image_source=='images/corner-topL.png'){
//            var shape_squares = ['0_0', '0_1', '0_2', '1_0', '2_0'];
//        } else if (trial.image_source=='images/corner-bottomR.png'){
//            var shape_squares = ['0_2', '1_2', '2_2', '2_1', '2_0'];
//        } else if (trial.image_source=='images/corner-topR.png'){
//            var shape_squares = ['0_0', '1_0', '2_0', '2_1', '2_2'];
//        }
//    } else if (trial.condition=='mismatch'){
//        if (trial.image_source=='images/corner-bottomL.png'){
//            var shape_squares = get_sample([['0_0', '0_1', '0_2', '1_0', '2_0'],
//                                            ['0_2', '1_2', '2_2', '2_1', '2_0'],
//                                            ['0_0', '1_0', '2_0', '2_1', '2_2']], 1)[0];
//        } else if (trial.image_source=='images/corner-topL.png'){
//            var shape_squares = get_sample([['0_0', '0_1', '0_2', '1_2', '2_2'],
//                                            ['0_2', '1_2', '2_2', '2_1', '2_0'],
//                                            ['0_0', '1_0', '2_0', '2_1', '2_2']], 1)[0];
//        } else if (trial.image_source=='images/corner-bottomR.png'){
//            var shape_squares = get_sample([['0_0', '0_1', '0_2', '1_2', '2_2'],
//                                            ['0_0', '0_1', '0_2', '1_0', '2_0'],
//                                            ['0_0', '1_0', '2_0', '2_1', '2_2']], 1)[0];
//        } else if (trial.image_source=='images/corner-topR.png'){
//            var shape_squares = get_sample([['0_0', '0_1', '0_2', '1_2', '2_2'],
//                                            ['0_0', '0_1', '0_2', '1_0', '2_0'],
//                                            ['0_0', '1_0', '2_0', '2_1', '2_2']], 1)[0];
//        }
//    } else {
//        var shape_squares = [];
//    }

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
    var trial_duration = 5000;
    var change_time = get_sample(range(1500, 2900), 1)[0];
    var change_duration = get_sample(range(2000, trial_duration - change_time), 1)[0];
    var change_half = change_duration/2;
    var new_opacity = standard_opacity;
    var change_inc = trial.change_inc/(150*(change_duration/1000));
    console.log(trial.condition, trial.change_inc, change_inc);

    var switched = 0;

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
            if (switched==0){
                console.log("OPACITY", new_opacity);
                switched = 1;
            }
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
          change_inc: trial.change_inc,
          change_time: change_time,
          change_duration: change_duration,
          change_shape: trial.change_shape,
          imagery_condition: trial.imagery_condition
        };

        // end trial
        jsPsych.finishTrial(trial_data);
    };


  };

  return plugin;
})();
