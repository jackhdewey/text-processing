
jsPsych.plugins["jo-visual-search-v3"] = (function() {

    var plugin = {};

    plugin.info = {
        name: "jo-visual-search-v3",
        parameters: {
            locations: {
                type: jsPsych.plugins.parameterType.OBJECT,
                default: undefined
            },
            colors: {
                type: jsPsych.plugins.parameterType.OBJECT,
                default: undefined
            },
            oris: {
                type: jsPsych.plugins.parameterType.OBJECT,
                default: undefined
            },
            grid_dict: {
                type: jsPsych.plugins.parameterType.OBJECT,
                default: undefined
            },
            square_size: {
                type: jsPsych.plugins.parameterType.INT,
                default: 70
            },
            square_size: {
                type: jsPsych.plugins.parameterType.INT,
                default: 50
            },
            image_size: {
                type: jsPsych.plugins.parameterType.INT,
                default: 50
            },
            target_ori: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'left'
            },
            sources: {
                type: jsPsych.plugins.parameterType.STRING,
                default: ['images/door.mp4']
            },
            test_type: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'search'
            },
            display_condition: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'old'
            },
        }
    };

    plugin.trial = function(display_element, trial) {

        var num_squares_w = 8;
        var num_squares_h = 6;
        var square_size = trial.square_size;
        var image_size = trial.image_size;
        var grid_size_w = num_squares_w * square_size;
        var grid_size_h = num_squares_h * square_size;
        var grid_dict = trial.grid_dict;
        var grid_center = screen.width/2 - grid_size_w/2;

        const canvasHtml =
        `<canvas id="myCanvas" style="position: absolute; top: 20%; left: ${grid_center}px;"
            width="${grid_size_w}" height="${grid_size_h}">
        </canvas>`

        if (trial.test_type=='search'){
            display_element.innerHTML = '<div style="position: absolute; top: 88%; left: 65%">F KEY - <img src="images/white-left-T.png" width=5%></img><br>J KEY - <img src="images/white-right-T.png" width=5%></img></div>'
        } else if (trial.test_type=='memory'){
            display_element.innerHTML = "<img src='images/table1.png' width="+screen.width*.8+"></img>";
            display_element.innerHTML += '<div style="position: absolute; top: 5%; left: 40%">Did you see this display awhile ago?<br>Y KEY - YES, N KEY - NO</div>'
        }

        display_element.innerHTML += canvasHtml
        var canvas = display_element.querySelector('#myCanvas');
        var context = canvas.getContext('2d');

        // draw tiles
        var imgs = [];
        for (i=0; i<12; i++){
            // var image_list = new Image();
            if (i==0){
                image = "images/" + 'white' + "-" + trial.target_ori + "-T.png"
            } else {
                image = "images/" + 'white' + "-" + trial.oris[i-1].toString() + "-L.png"
            }
            var x = grid_dict[trial.locations[i]][0];
            var y = grid_dict[trial.locations[i]][1];
            imgs.push({ uri: image, x: x, y:  y, dw: image_size, dh: image_size });
        }


        function depict(options, context) {
            const myOptions = Object.assign({}, options);
            return loadImage(myOptions.uri).then(img => {
                context.drawImage(img, myOptions.x, myOptions.y, myOptions.dw, myOptions.dh);
            });
        }

        function loadImage(url) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`load ${url} fail`));
                img.src = url;
            });
        }

        function start_game() {
            imgs.forEach((elem) => depict(elem, context))
            document.addEventListener('keydown', check_key, true);
        }

        start_game();

        var is_correct = false;
        var rt = 0;
        var start_time = performance.now();

        function check_key(evt){
            if (trial.test_type=='search'){
                if (evt.key=='f' || evt.key=='j'){
                    document.removeEventListener('keydown', check_key, true);
                    if (trial.target_ori=='left' & evt.key=='f'){ is_correct = true}
                    if (trial.target_ori=='right' & evt.key=='j'){ is_correct = true}
                    response_key = evt.key;
                    rt = performance.now() - start_time;
                    end_trial();
                }
            }
            if (trial.test_type=='memory'){
                if (evt.key=='y' || evt.key=='n'){
                    document.removeEventListener('keydown', check_key, true);
                    if (trial.display_condition=='old' & evt.key=='y'){ is_correct = true}
                    if (trial.target_ori=='new' & evt.key=='n'){ is_correct = true}
                    response_key = evt.key;
                    rt = performance.now() - start_time;
                    end_trial();
                }
            }
        }

//        setTimeout(function(){ end_trial()}, 1000)

        function end_trial() {
//            document.removeEventListener('keydown', check_key, true);
            display_element.innerHTML = '';
            // data saving
            var trial_data = {
              is_correct: is_correct,
              response_time: rt,
              response_key: response_key
            };

            // end trial
            jsPsych.finishTrial(trial_data);
        }

    }

    return plugin;

})();
