/*
 * Example plugin template
 */

jsPsych.plugins["jo-visual-search"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "jo-visual-search",
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
      target_ori: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'left'
      },
      sources: {
        type: jsPsych.plugins.parameterType.STRING,
        default: ['images/door.mp4']
      },
      setup_video: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: false
      },
      play_video: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: false
      },
      vid_start: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'ready'
      },
      which_epoch: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'first'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    var num_squares_w = 8;
    var num_squares_h = 6;
    var square_size = trial.square_size;
    var image_size = trial.image_size;
    var grid_size_w = num_squares_w * square_size;
    var grid_size_h = num_squares_h * square_size;
    var grid_dict = trial.grid_dict;
    var grid_center = screen.width/2 - grid_size_w/2;

    // setup stimulus
    if (trial.setup_video){
        var video_html = '<div id="video-wrapper">'
        video_html += '<video id="video"';
        var file_name = trial.sources[0];
        if(file_name.indexOf('?') > -1){
          file_name = file_name.substring(0, file_name.indexOf('?'));
        }
        var type = file_name.substr(file_name.lastIndexOf('.') + 1);
        type = type.toLowerCase();
        video_html+='<source src="' + file_name + '" type="video/'+type+'">';
        video_html += ' width="'+screen.width*.98+'"';
        video_html += ' height="'+screen.width*.95+'"';
        video_html += " controls";
        video_html += ">";
        video_html += "</video>";
        display_element.innerHTML = video_html;

        if (trial.vid_start=='first'){
            var left_center = screen.width/2-400;
            display_element.innerHTML += "<div id='jspsych-video-start-wrapper' style='display:block; border-radius: 4px; padding: 10px 10px 20px 20px; background-color: white; width: 800px; height: 380px; position: absolute; top: 10%; left: "+left_center+"px'><p>In this experiment, you will watch an animation, where you will move around a room (such as what you see in the background).  You will see a table where you will perform a task multiple times.  Each time, you will see differently colored L-shaped blocks <b>and one T-shaped block</b> that will be distributed across the table.  Your task is to search for the T-shaped block and press the <b>D KEY</b> if it is facing the left, and the <b>K KEY</b> if it is facing the right.  Try to do this as accurately and as quickly as you can.</p><p>After awhile, the animation will start playing again, as if you were walking through the room.  <strong>During this time, you don't have any particular task, but to watch the animation and imagine you were actually walking through it.</strong>  Afterwards, you will see another table and perform the same task multiple times again.</p><p><strong>Press the ENTER key to play the animation.</strong></p></div>";
        }

        display_element.innerHTML += "<canvas id='myCanvas' style='position: absolute; top: 20%; left: "+grid_center+"px' width='"+grid_size_w+"' height='"+grid_size_h+"'></canvas>"+"</div>"+"</div>";
        var canvas = display_element.querySelector('#myCanvas');
        var context = canvas.getContext('2d');

        var imgs = [];
        for (i=0; i<12; i++){
            var image_list = new Image();
            if (i==0){
                image = "images/" + trial.colors[i] + "-" + trial.target_ori + "-T.png"
            } else {
                image = "images/" + trial.colors[i] + "-" + trial.oris[i-1].toString() + "-L.png"
            }
            var x = grid_dict[trial.locations[i]][0];
            var y = grid_dict[trial.locations[i]][1];
            imgs.push({ uri: image, x: x, y:  y, dw: image_size, dh: image_size });
        }

        if (trial.vid_start=='first'){
            document.addEventListener('keydown', instructions_done, true);
            function instructions_done(evt){
                console.log(evt.key)
                if (evt.key=='Enter'){
                    document.removeEventListener('keydown', instructions_done, true);
                    display_element.querySelector('#jspsych-video-start-wrapper').setAttribute('style', 'display:none');
                    setTimeout(function(){
                        display_element.querySelector('#video').play();
                        setTimeout(function(){ display_element.querySelector('#video').pause(); start_game();}, 2955);
                    }, 500);
                }
            }
        } else {
            display_element.querySelector('#video').currentTime = 3;
            start_game();
        }
    } else {
        if (trial.which_epoch=='first'){
            display_element.innerHTML = "<img src='images/table1.png'></img>"
        } else {
            display_element.innerHTML = "<img src='images/table2.png'></img>"
        }

        display_element.innerHTML += "<canvas id='myCanvas' style='position: absolute; top: 20%; left: "+grid_center+"px' width='"+grid_size_w+"' height='"+grid_size_h+"'></canvas>"+"</div>"+"</div>";
        var canvas = display_element.querySelector('#myCanvas');
        var context = canvas.getContext('2d');

        var imgs = [];
        for (i=0; i<12; i++){
            var image_list = new Image();
            if (i==0){
                image = "images/" + trial.colors[i] + "-" + trial.target_ori + "-T.png"
            } else {
                image = "images/" + trial.colors[i] + "-" + trial.oris[i-1].toString() + "-L.png"
            }
            var x = grid_dict[trial.locations[i]][0];
            var y = grid_dict[trial.locations[i]][1];
            imgs.push({ uri: image, x: x, y:  y, dw: image_size, dh: image_size });
        }

        start_game();
    }

    function loadImage(url){
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`load ${url} fail`));
        img.src = url;
      });
    }

    function depict(options){
      const myOptions = Object.assign({}, options);
      return loadImage(myOptions.uri).then(img => {
        context.drawImage(img, myOptions.x, myOptions.y, myOptions.dw, myOptions.dh);
      });
    }

    function start_game(){
        imgs.forEach(depict);
        document.addEventListener('keydown', check_key, true);
    }

    var is_correct = false;
    var rt = 0;
    var start_time = performance.now();
    function check_key(evt){
        if (evt.key=='d' || evt.key=='k'){
            document.removeEventListener('keydown', check_key, true);
            if (trial.target_ori=='left' & evt.key=='d'){ is_correct = true}
            if (trial.target_ori=='right' & evt.key=='k'){ is_correct = true}
            rt = performance.now() - start_time;
            if (trial.play_video){
                play_now();
            } else {
                end_trial();
            }
        }
    }

    function play_now(){
        display_element.querySelector('#myCanvas').setAttribute('style', 'display:none');
        display_element.querySelector('#video').play();
        display_element.querySelector('#video').onended = function(){
          end_trial();
        }
    }

    function end_trial(){
        //display_element.innerHTML = '';

        // data saving
        var trial_data = {
          is_correct: is_correct,
          response_time: rt
        };

        // end trial
        jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();
