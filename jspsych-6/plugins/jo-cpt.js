/**
 * jspsych-html-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["cpt"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'cpt',
    description: '',
    parameters: {
      canvas_size: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Canvas size',
        default: [500, 500],
        description: 'The HTML string to be displayed'
      },
      num_faces: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Number of faces',
        default: 800,
        description: 'The HTML string to be displayed'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    function get_random_value(array){
        return jsPsych.randomization.sampleWithoutReplacement(array, 1)[0]
    };

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    };

    var female_faces = ["images/image_set1/JPEG/001.jpg", "images/image_set1/JPEG/002.jpg", "images/image_set1/JPEG/003.jpg",
                        "images/image_set1/JPEG/004.jpg", "images/image_set1/JPEG/005.jpg", "images/image_set1/JPEG/006.jpg",
                        "images/image_set1/JPEG/007.jpg", "images/image_set1/JPEG/008.jpg", "images/image_set1/JPEG/009.jpg",
                        "images/image_set1/JPEG/010.jpg"];
    var male_faces = ["images/image_set2/JPEG/001.jpg", "images/image_set2/JPEG/002.jpg", "images/image_set2/JPEG/003.jpg",
                        "images/image_set2/JPEG/004.jpg", "images/image_set2/JPEG/005.jpg", "images/image_set2/JPEG/006.jpg",
                        "images/image_set2/JPEG/007.jpg", "images/image_set2/JPEG/008.jpg", "images/image_set2/JPEG/009.jpg",
                        "images/image_set2/JPEG/010.jpg"];

    var num_trials = trial.num_faces;
    var conditions = Array(num_trials*0.9).fill(1).concat(Array(num_trials*0.1).fill(2));
    shuffle(conditions);
    var image_list = ['images/blank_small.png'];
    var response_dict = {};

    var prev_face = "";
    var image = "";
    for (i=0; i<conditions.length; i++)
    {
        while (prev_face == image){
            if (conditions[i]==1){
                image=get_random_value(female_faces);
            } else {
                image=get_random_value(male_faces);
            };
        }
        image_list.push(image);
        prev_face = image;
        response_dict[i] = [];
    };

    var first_face = 'images/blank_small.png';
    var new_html = "<div class='img-wrapper'>";
    new_html += '<img id="curr_img" src="'+first_face+'" onload="fadeImage()" />';
    new_html += '<img id="new_img" src="'+first_face+'"  />';
    // onload="fadeImage();
    new_html += '</div>';
    display_element.innerHTML = new_html;

    var i = 0;
    var imgidx = 0;
    var old_imgidx = 0;
    var imgtoggle = false;
    var transition_duration = 800;
    var start_time = 0;

    // function will initialize loading the next image in background
    window.nextImage = function()
    {
        start_time = performance.now();
        document.addEventListener('keypress', update_response, true);
        function update_response(evt){
            // document.removeEventListener('keypress', update_response, true);
            console.log(evt.keyCode)
            if (evt.keyCode == 106){
                console.log("recording keypress", response_dict[i]);
                rt=performance.now()-start_time;
                if (response_dict[i] == []){
                    array = [];
                    array.push(rt);
                } else {
                    array = response_dict[i];
                    array.push(rt);
                }
                response_dict[i] = array;
            };
        };
        if (i == num_trials){
            end_trial()
        } else {
            imgtoggle = !imgtoggle;
            old_imgidx = imgidx;
            imgidx = (imgidx + 1) % image_list.length;
            console.log(i, old_imgidx, imgidx);
            if (imgtoggle)
            {
              document.getElementById('new_img').classList.add("bottom");
              document.getElementById('new_img').classList.remove("top");
              document.getElementById('curr_img').classList.add("top");
              document.getElementById('curr_img').classList.remove("bottom");

              document.getElementById('curr_img').src = image_list[old_imgidx];
              document.getElementById('new_img').src = image_list[imgidx];

              window.setTimeout(function(){
                document.getElementById('curr_img').classList.add("active");
                document.getElementById('new_img').classList.remove("active");
              }, 200); // This together with the css code should add up to the transition duration
            }
            else
            {
              document.getElementById('curr_img').classList.add("bottom");
              document.getElementById('curr_img').classList.remove("top");
              document.getElementById('new_img').classList.add("top");
              document.getElementById('new_img').classList.remove("bottom");

              document.getElementById('curr_img').src = image_list[imgidx];
              document.getElementById('new_img').src = image_list[old_imgidx];

              window.setTimeout(function()
              {
                document.getElementById('new_img').classList.add("active");
                document.getElementById('curr_img').classList.remove("active");
              }, 200);
            }
            i++;
        }
    }

    // function will trigger the crossfade and then start the timer for the next switch
    window.fadeImage = function()
    {
      window.setTimeout(function()
      {
        nextImage();
      }, transition_duration);
    }

    // Now load our very first image to start the slideshow
    next_img = document.getElementById('new_img');
    //next_img.style.opacity = 0;
   // next_img.style.transition = 'opacity 0.2s ease-in-out';

    document.getElementById('curr_img').classList.add("bottom");
    document.getElementById('curr_img').classList.remove("top");
    document.getElementById('new_img').classList.add("top");
    document.getElementById('new_img').classList.remove("bottom");

    document.getElementById('new_img').src = image_list[0];
    document.getElementById('curr_img').src = image_list[0];
    document.getElementById('new_img').classList.add("active");

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "image_list": image_list,
        "response_dict": JSON.stringify(response_dict)
      };

      for (i=0; i<trial.num_faces; i++){
        image_col_name = "img" + i.toString();
        resp_col_name = "resp" + i.toString();
        selected_col_name = "sel" + i.toString();
        condition_col_name = "face" + i.toString();
        trial_data[image_col_name] = image_list[i];
        trial_data[condition_col_name] = conditions[i];
        trial_data[resp_col_name] = response_dict[i];
        trial_data[selected_col_name] = response_dict[i][0];
      };

      console.log(trial_data);

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

  };

  return plugin;
})();
