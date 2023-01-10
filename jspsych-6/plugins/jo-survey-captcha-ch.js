/**
 * jspsych-survey-html-form
 * a jspsych plugin for free html forms
 *
 * Jan Simson
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['survey-captcha'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'survey-captcha',
    description: '',
    parameters: {
      anchor: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Captcha numbers',
        default: '10',
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Verify',
        description: 'The text that appears on the button to finish the trial.'
      },
      dataAsArray: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        pretty_name: 'Data As Array',
        default:  false,
        description: 'Retrieve the data as an array e.g. [{name: "INPUT_NAME", value: "INPUT_VALUE"}, ...] instead of an object e.g. {INPUT_NAME: INPUT_VALUE, ...}.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var code;
    var captcha = [];
    var font_sizes = [];
    var font_families = [];
    var font_weights = [];
    var font_blur = [];

    function get_random_value(array){
        return jsPsych.randomization.sampleWithoutReplacement(array, 1)[0]
    };

    function createCaptcha() {
      html = '';
      captcha = [];
      lengthOtp = 3;
      for (i = 0; i < lengthOtp; i++) {
        if (i === 0){
            captcha.push("$");
        } else {
            captcha.push(trial.anchor[i-1]);
        }
        font_sizes.push(get_random_value(["100px", "110px", "120px"]));
        font_families.push(get_random_value(["Arial", "Georgia"]));
        font_weights.push(get_random_value(["normal", "bold"]));
        font_blur.push(get_random_value(["0.5", "0.6", "0.7"]))
      };
//      var canv = document.createElement("canvas");
//      canv.id = "captcha";
//      canv.width = 100;
//      canv.height = 50;
//      var ctx = canv.getContext("2d");
//      ctx.font = "25px Georgia";
//      ctx.strokeText(captcha.join(""), 0, 30);
//      //storing captcha so that can validate you can save it somewhere else according to your specific requirements
//      code = captcha.join("");
//      document.getElementById("captcha").appendChild(canv); // adds the canvas to the body element
        code = captcha.join();
        code = code.replace(/,/g, "");
        code = code.substr(1); // Removes $
//        captcha_text ='<div class="container" style="position: relative; text-align: center"><img src="images/checkerboard.jpg" style="width:50%;"><div class="centered" style="position: absolute; top: 30%; left: 35%;"><p><span style="color: DarkSlateGray; font-size: '+font_sizes[0]+'; font-family: '+font_families[0]+'; font-weight: '+font_weights[0]+'">'+captcha[0]+'</span><span style="color: DarkSlateGray; font-size: '+font_sizes[1]+'; font-family: '+font_families[1]+'; font-weight: '+font_weights[1]+'">'+captcha[1]+'</span><span style="color: DarkSlateGray; font-size: '+font_sizes[2]+'; font-family: '+font_families[2]+'; font-weight: '+font_weights[2]+'">'+captcha[2]+'</span></p>' +
//    '</div></div><input type="text" placeholder="Captcha" id="captchaTextBox" style="padding: 12px 20px; display: inline-block; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"/>'
        captcha_text ='<div class="container" style="position: relative; text-align: center"><img src="images/checkerboard.jpg" style="width:50%; filter: blur(5px);"><div class="centered" style="position: absolute; top: 30%; left: 35%;"><p><span style="color: transparent; text-shadow: 0 0 6px rgba(0,0,0,'+font_blur[1]+');font-size: '+font_sizes[1]+'; font-family: '+font_families[1]+'; font-weight: '+font_weights[1]+'">'+captcha[1]+'</span></p>' +
    '</div></div><p id="captcha_prompt">To verify that you are an actual human, please enter the digits above.</p><input type="text" placeholder="Captcha" id="captchaTextBox" style="padding: 12px 20px; display: inline-block; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"/>'
        // create form
        html += '<form id="jspsych-survey-html-form"><div id="captcha">' + captcha_text +
        '<input type="submit" id="jspsych-survey-html-form-next" class="jspsych-btn jspsych-survey-html-form" value="'+trial.button_label+'" style="background-color: #4CAF50; border: none; color: white; padding: 12px 30px; text-decoration: none; margin: 4px 2px"></input></form></body>'

        display_element.innerHTML = html;
    };

    createCaptcha();
    console.log(font_sizes, font_families, font_weights)
    var anchor_responses = [];

    display_element.querySelector('#jspsych-survey-html-form').addEventListener('submit', function(event) {
      // don't submit form
      event.preventDefault();

      console.log(display_element.querySelector("#captchaTextBox").value, code)
      if (display_element.querySelector("#captchaTextBox").value == code) {
//        alert("Valid Captcha");
        // measure response time
        var endTime = performance.now();
        var response_time = endTime - startTime;

        var question_data = serializeArray(this);

        if (!trial.dataAsArray) {
            question_data = objectifyForm(question_data);
        }

        // save data
        anchor_responses.push(display_element.querySelector("#captchaTextBox").value);
        console.log("Anchor Responses:", anchor_responses);
        var trialdata = {
            "rt": response_time,
            "responses": JSON.stringify(question_data),
            "anchor": anchor_responses,
            "actual_anchor_value": trial.anchor
        };

        display_element.innerHTML = '';

        // next trial
        jsPsych.finishTrial(trialdata);
      } else {
        anchor_responses.push(display_element.querySelector("#captchaTextBox").value);
        display_element.querySelector("#captcha_prompt").innerHTML = "Oops, you typed the wrong digits.  Try again.";
      }

    });

    var startTime = performance.now();
  };

  /*!
   * Serialize all form data into an array
   * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
   * @param  {Node}   form The form to serialize
   * @return {String}      The serialized form data
   */
  var serializeArray = function (form) {
    // Setup our serialized data
    var serialized = [];

    // Loop through each field in the form
    for (var i = 0; i < form.elements.length; i++) {
      var field = form.elements[i];

      // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
      if (!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;

      // If a multi-select, get all selections
      if (field.type === 'select-multiple') {
        for (var n = 0; n < field.options.length; n++) {
          if (!field.options[n].selected) continue;
          serialized.push({
            name: field.name,
            value: field.options[n].value
          });
        }
      }

      // Convert field data to a query string
      else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
        serialized.push({
          name: field.name,
          value: field.value
        });
      }
    }

    return serialized;
  };

  // from https://stackoverflow.com/questions/1184624/convert-form-data-to-javascript-object-with-jquery
  function objectifyForm(formArray) {//serialize data function
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++){
      returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
  }

  return plugin;
})();
