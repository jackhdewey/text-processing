/**
 * Core experiment code
 */
let subj_id = prompt("Please enter your worker ID:", "");
let subj_name = subj_id.toString() + "_" + Date.now();
let consent_duration = 12;
let consent_pay = "$" + (consent_duration * .135).toFixed(2).toString();
let completion_code = '4D93CD1C';

/******** MODIFY ********/
let consent = {
  type: 'html-keyboard-response',
  choices: ['y'],
  stimulus: "<h5>In order to run this study, we need to include the standard consent form below."
            + "</h5><h3>Please read and press the Y key to continue."
            + "</h3><h1>Consent for Participation in a Research Study"
            + "</h1><div style='width: 100%; text-align: center'><div style='display: inline-block; margin: 0 auto; padding: 10px 200px 10px 200px; text-align: left'>"
            + "<h5>STUDY TITLE</h5><p>Perceiving Objects and Events</p>"
            + "<h5>RESEARCH STUDY SUMMARY, RISKS, AND BENEFITS</h5>"
            + "<p>Thank you for volunteering to participate in this research study. The purpose of this study is to better understand how we see and how we think. "
            + "Study activities will include examining simple displays and then responding by answering questions, pressing some keys, or using a computer mouse. "
            + "Because these are activities that many people already experience hundreds or thousands of times every day, there are no risks involved in this study. "
            + "The study may have no benefits to you, but it may help the scientific community come to better understand how the human mind works. "
            + "Taking part in this study is your choice. You can choose to take part, or you can choose not to take part in this study. You can also change your mind at any time, with no penalty.</p>"
            + "<h5>DURATION</h5><p>If you agree to take part, the study will last approximately <strong> " + consent_duration.toString() + " minutes</strong>.</p>"
            + "<h5>COSTS AND COMPENSATION</h5><p>There are no costs associated with participation in this study. You will receive <strong>" + consent_pay + "</strong> for participating.</p>"
            + "<h5>CONFIDENTIALITY</h5><p>No personally identifying information will be collected, so your participation will be anonymous. Your data will be pooled with those from other participants, and may be included in scientific publications and uploaded to public data repositories.</p>"
            + "<h5>LEARNING MORE</h5><p>If you have questions about this study, you may contact your experimenter Joan Ongchoco at joan.ongchoco@yale.edu. If you have questions about your rights as a research participant, or you have complaints about this research, you can contact the Yale Institutional Review Boards at 203-785-4688 or hrpp@yale.edu.</p>"
            + "<h5>INFORMED CONSENT</h5><p>Your participation indicates that you have read and understood this consent form and the information presented and that you agree to be in this study.</p></div></div><h2 style='text-align: center'>PRESS THE Y KEY TO CONSENT</h2><p></p><p></p>",
  data: {
    subj_id: subj_name,
    test_part: 'consent'
  },
  on_finish: function(data) {
    data.screen_width = get_viewport_size().width;
    data.screen_height = get_viewport_size().height;
    data.url = window.location.href;
    console.log(data.url);
    let file_name = 'partial_' + subj_name
    saveData(file_name, jsPsych.data.get().csv());
  }
};

let debrief_text =
  "<div style='width: 50%; text-align: left; margin: 0 auto'><p style='text-align: center'>(You should have been returned to the normal size of your browser.)<br>Finally, we just have a couple questions for you!<br>Please note that you must answer <strong>ALL</strong> the questions before pressing the CONTINUE button below.</p>"
  + '<p>Age: <br><input name="age" type="number" style="width: 20%; border-radius: 4px; padding: 10px 10px; margin: 8px 0; border: 1px solid #ccc; font-size: 15px"/>'
  + '<p>Please indicate your gender:<br><input type="radio" id="male" name="gender" value="male"><label for="male">Male</label><br><input type="radio" id="female" name="gender" value="female"><label for="female">Female</label><br><input type="radio" id="other" name="gender" value="other"><label for="other">Other</label><br><input type="radio" id="NA" name="gender" value="NA"><label for="NA">I prefer not to say</label><br>'
  + '<p>In 1-2 sentences, what was this article about? <br><textarea name="3_article" rows="4" style="width: 100%; resize: none; border-radius: 4px; padding: 10px 10px; margin: 8px 0; border: 1px solid #ccc; font-size: 15px"></textarea>'
  + '<p>In 1-2 sentences, what do you think this experiment was testing? <br><textarea name="3_experiment" rows="4" style="width: 100%; resize: none; border-radius: 4px; padding: 10px 10px; margin: 8px 0; border: 1px solid #ccc; font-size: 15px"></textarea>'
  + '<p>Earlier, you read an article from the internet.  Have you ever encountered this <b>exact</b> article before?<br><input type="radio" id="yes" name="encountered" value="yes"><label for="yes">Yes</label><br><input type="radio" id="no" name="encountered" value="no"><label for="no">No</label><br>'
  + '<p>Have you ever, to your knowledge, participated in an experiment similar to this one?  If yes, please describe this experiment in 1-2 sentences.  If no, please just type "No" in the text box.<br><input name="4_experience" type="text" size="50" style="width: 100%; border-radius: 4px; padding: 10px 10px; margin: 8px 0; border: 1px solid #ccc; font-size: 15px"/>'
  + '<p>What kind of device (mouse, trackpad, etc.) did you use to scroll through the article? <br><input name="5_mouse" type="text" size="50" style="width: 100%; border-radius: 4px; padding: 10px 10px; margin: 8px 0; border: 1px solid #ccc; font-size: 15px"/></p>'
  + '<p>Anything else to share? <br><input name="6_final" type="text" size="50" style="width: 100%; border-radius: 4px; padding: 10px 10px; margin: 8px 0; border: 1px solid #ccc; font-size: 15px"/></p>'
  + '<p>We know it is generally difficult to stay focused in online experiments.</br>On a scale of 1-100 (with 1 being very distracted, and 100 being very focused), how well did you pay attention during the experiment?</br>(This will not affect whether you receive credit or compensation.) <br><input name="7_attention" type="number" max="100" style="width: 20%; border-radius: 4px; padding: 10px 10px; margin: 8px 0; border: 1px solid #ccc; font-size: 15px"></p></div>';

let debrief_prompt = [{
  html: debrief_text,
  data: {
    subj_id: subj_name,
    test_part: 'debrief'
  },
}];

let check_debrief_response = {
  type: 'survey-html-form',
  data: {
    subj_id: subj_name,
    test_part: 'debrief',
    completion_code: completion_code
  },
  check_blanks: true,
  on_finish: function(data) {
    console.log("Responses:", data.responses);
    let respObj = JSON.parse(data.responses);
    data.resp_age = respObj["age"];
    data.resp_gender = respObj["gender"];
    data.resp_encountered = respObj["encountered"];
    data.resp_article = respObj["3_article"];
    data.resp_experiment = respObj["3_experiment"];
    data.resp_experience = respObj["4_experience"];
    data.resp_mouse = respObj["5_mouse"];
    data.resp_final = respObj["6_final"];
    data.resp_attention = respObj["7_attention"];
    let interaction_data = jsPsych.data.getInteractionData();
    let interaction_filename = 'interactions_' + subj_name;
    saveData(interaction_filename, jsPsych.data.getInteractionData().csv());
    saveData(subj_name, jsPsych.data.get().csv());
  },
  timeline: debrief_prompt
};

function startExpt() {
  let start_clock = performance.now();
  jsPsych.init({
    timeline: timeline,
    //show_progress_bar: true,
    //preload_images: std_images,
    on_interaction_data_update: function(data) {
      data.subj_id = subj_name;
      data.screen_width = get_viewport_size().width;
      data.screen_height = get_viewport_size().height;
      console.log(JSON.stringify(data));
      if (JSON.stringify(data).includes('blur') && data.trial > 0 && data.trial < 5){
        if (confirm("Oops, you may have switched tabs, clicked outside of the browser, or exited full screen mode -- as a result, the experiment will now end.  You can refresh the browser to try again.")){
            location.reload();
        }
      }
    },
    on_finish: function() {
      let end_clock = performance.now();
      let total_time = end_clock - start_clock;
      console.log("Total time:", total_time);
    }
  });
}

/******** EXCLUDE BY BROWSER ********/
let check = false;

function getBrowserInfo() {
  let ua = navigator.userAgent,
    tem,
    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return 'IE ' + (tem[1] || '');
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null)
    M.splice(1, 1, tem[1]);
  return {
    'browser': M[0],
    'version': M[1]
  };
}

function mobileAndTabletCheck() {
  (function(a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i
      .test(a) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i
      .test(a.substr(0, 4))) check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}

/******** HELPER FUNCTIONS ********/
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function range(start, end) {
  return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

function get_random_value(array) {
  return jsPsych.randomization.sampleWithoutReplacement(array, 1)[0]
}

function pad(num, size) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

function get_sample(arr, n) {
  let result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    let x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

function get_average(array) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += array[i];
  }
  return sum / array.length;
}

function get_viewport_size() {
  let test = document.createElement("div");

  test.style.cssText = "position: fixed;top: 0;left: 0;bottom: 0;right: 0;";
  document.documentElement.insertBefore(test, document.documentElement.firstChild);

  let dims = {
    width: test.offsetWidth,
    height: test.offsetHeight
  };
  document.documentElement.removeChild(test);

  return dims;
}

/******** STANDARD VARIABLES ********/
let fixation = {
  type: 'html-keyboard-response',
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: jsPsych.NO_KEYS,
  trial_duration: get_random_value([500, 750, 1000]),
  data: {
    subj_id: subj_name,
    test_part: 'fixation'
  }
};

let blank = {
  type: 'html-keyboard-response',
  stimulus: '<div style="font-size:60px;"></div>',
  choices: jsPsych.NO_KEYS,
  trial_duration: get_random_value([500, 750, 1000]),
  data: {
    subj_id: subj_name,
    test_part: 'blank'
  }
};

/******** BOILERPLATE INSTRUCTIONS ********/
let text_intro = {
  type: 'jo-html-keyboard-response',
  wait_duration: 5000,
  choices: ['space'],
  stimulus: "<p>First, a quick note: Throughout this experiment, you will see greyed out text as in the last line below.</p>"
            + "<p>This text will contain the instructions for how to move to the next page -- which will typically involve pressing the spacebar.  "
            + "You will not be able to press the spacebar until after a brief period of time has elapsed.  Please use that time to read the instructions on the given page.  "
            + "Once the greyed out text has turned black, and you have finished reading the instructions, you will then be able to proceed by pressing the relevant key.</p>",
  prompt: "Press SPACE to continue.",
  data: {
    subj_id: subj_name,
    test_part: 'audio_check',
    completion_code: completion_code
  }
};

let check_open_ended_response = {
  type: 'jo-html-keyboard-response',
  wait_duration: 5000,
  choices: ['space'],
  stimulus: "<p>This is an anonymous survey consisting of multiple questions. "
            + "A few questions are open-ended questions where you need to type a few sentences or a short paragraph or two. "
            + "Some participants do not like answering open-ended questions and tend to quit a survey once they see such questions. "
            + "If a sizable number of people quit a survey halfway, the data quality of that survey would be compromised. However, our research depends on good quality data. "
            + "Thus, please make sure you do not mind open-ended questions before taking this survey.</p>",
  prompt: "Press SPACE to continue.",
  data: {
    subj_id: subj_name,
    test_part: 'instruct_prompt',
    completion_code: completion_code
  },
  on_finish: function() {
    let file_name = 'partial_' + subj_name
    saveData(file_name, jsPsych.data.get().csv());
  }
};

let break_prompt = function(progress) {
  let block = {
    type: 'html-keyboard-response',
    choices: ['space'],
    stimulus: "You have completed " + progress +
      " trials.<p>Take a one-minute break -- but don't leave!<br>You can use this time to adjust your seat, stretch, etc.</p>"
              + "<p><strong>Press the spacebar to continue.</strong></p>",
    response_ends_trial: true,
    data: {
      subj_id: subj_name,
      test_part: 'break_prompt'
    },
    on_finish: function() {
      let file_name = 'partial_' + subj_name
      saveData(file_name, jsPsych.data.get().csv());
    }
  };
  return block;
};

let setup_intro = {
  type: 'jo-html-keyboard-response',
  wait_duration: 5000,
  choices: ['space'],
  stimulus: "<p>Hi! Thank you for volunteering to help out with our study.  "
            + "Please take a moment to adjust your seating so that you can comfortably watch the monitor and use the keyboard.  "
            + "Feel free to dim the lights as well.</p><p>Close the door or do whatever is necessary to <b>minimize disturbance during the experiment</b>.  "
            + "Please also take a moment to silence your phone so that you are not interrupted by any messages mid-experiment.</p>",
  prompt: "Press SPACE to continue.",
  data: {
    subj_id: subj_name,
    test_part: 'instruct_prompt'
  }
};

let code_intro = {
  type: 'jo-html-keyboard-response',
  wait_duration: 3000,
  choices: ['space'],
  stimulus: "<p>To receive compensation for this study, you will be given a completion code at the end of the experiment.  "
            + "Do <strong>NOT</strong> close the window until you've copied and pasted this code in the HIT.  "
            + "Otherwise, we will not be able to give you compensation for this study.</p>",
  prompt: "Press SPACE to continue.",
  data: {
    subj_id: subj_name,
    test_part: 'instruct_prompt'
  }
};

let expt_end = {
  type: 'html-keyboard-response',
  choices: ['space'],
  stimulus: '<p>Great, you have completed this experiment.  Please press spacebar to proceed to the next page, and get your code.</p>',
  data: {
    subj_id: subj_name,
    test_part: 'instruct_prompt'
  },
  on_finish: function(data){
    saveData(subj_name, jsPsych.data.get().csv());
  }
};

let code_end = {
  type: 'html-keyboard-response',
  choices: ['space'],
  stimulus: '<p>Here is your completion code:</p><p style="font-size: 140%; color: grey"><strong>' + completion_code
            + '</strong></p><p>Do <strong>NOT</strong> close the window until you have copied and pasted this code in the HIT.  '
            + 'Otherwise, we will not be able to give you compensation for this study.</p>' + '<p>Thank you!</p>',
  data: {
    subj_id: subj_name,
    test_part: 'instruct_prompt'
  }
};

let close_end = {
  type: 'html-keyboard-response',
  choices: ['space'],
  stimulus: '<p>Thank you for helping!  You are all set.  You can now close the window!</p>',
  data: {
    subj_id: subj_name,
    test_part: 'instruct_prompt'
  }
};