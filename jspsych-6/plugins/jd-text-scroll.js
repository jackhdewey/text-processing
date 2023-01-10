/**
 * Plugin for collecting a user's scrolling behavior over text
 *
 * FEATURES: Intersection observer tracks when each heading / paragraph is onscreen
 * FEATURES: Randomly misspells a word in (most) paragraphs, which can then be clicked on
 * DONE: Slow down scroll data gathering to track lines
 * DONE: Reformat slider images and height of text box
 * DONE: Concatenate what's on screen to scroll data
 * DONE: Add misspelled words to data (which ones they clicked and where)
 * DONE: Fix cursor
 * DONE: Convert set and word list from object to string
 * DONE: Randomize distribution of typos
 * DONE: Get rid of scrolling with keys (i.e. wheel only)
 * DONE: Last two questions: add option to click button if no part was more interesting than rest
 * DONE: Randomly misspell 1-2 words and allow subject to click on any word
 * DONE: Convert onscreen set to string
 * DONE: Record clicked typos, clicked non-typos, location and time (split into three arrays)
 * DONE: Make it so typos aren't swaps of first or last letter (too salient)
 * DONE: Typos detected by paragraph and percentage of the typos caught per paragraph
 * DONE: Locate depths of headings / paragraphs
 * DONE: Measure scroll depth / heading depth / paragraph depth as a percentage of screen
 * DONE: Fix multiple clicks issue, filter typos (no punctuation)
 * DONE: Fix random number generator for experiment condition
 * DONE: Make the text a bit wider (to make sure headings don't align with screen).
 * DONE: Disable home and page up / page down
 *
 * TO DO: Filter data by what's on screen (i.e. all scrolls with 'p2' on screen)
 */

jsPsych.plugins["jd-text-scroll"] = (function() {

  let plugin = {};

  plugin.info = {
    name: "jd-text-scroll",
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.STRING,
        default: ""
      },
      wait_time: {
        type: jsPsych.plugins.parameterType.INT,
        default: 5000
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    /**
     *  Display the text.
     */
    let html = '<div id="jspsych-html-keyboard-response-stimulus">' + trial.stimulus + '</div>';
    display_element.innerHTML = html;

    let screen_height = window.innerHeight;

    /**
     * Prevent the user from scrolling with arrow keys, space bar, or page up / page down.
     */
    window.addEventListener("keydown", processSpace);

    function processSpace(e) {
        if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight",
            "Home", "End", "PageDown", "PageUp"].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    }

    /**
     *  Count the number of paragraphs and headings.
     */
    let num_paragraphs = 0;
    let num_headings = 0;
    let paragraph_index = html.indexOf("<p");
    let heading_index = html.indexOf("<h");

    while (paragraph_index !== -1) {
        num_paragraphs += 1;
        paragraph_index = html.indexOf("<p", paragraph_index + 1);
    }

    while (heading_index !== -1) {
        num_headings += 1;
        heading_index = html.indexOf("<h", heading_index + 1);
    }

    /**
     *  Loop over the paragraphs and randomly misspell one word
     */
    let typos = [];
    let typo_indices = [];
    let typos_per_paragraph = [];
    let num_typos_found = [];

    for (let i = 1; i <= num_paragraphs; i++) {

        if (i === 3 || i === 8 || i === 14 || i === 24) {
            continue;
        }

        // Select each paragraph and extract its content as a string
        let temp_id = "p" + i;
        let this_paragraph = document.getElementById(temp_id).innerHTML;

        // Search the paragraph for the indices of gaps between words
        let word_index = 0;
        let last_index = 0;
        let word_indices = [];
        while (word_index !== -1) {
            word_index = this_paragraph.indexOf(" ", last_index + 1);
            last_index = word_index;
            if (word_index !== -1) {
                word_indices.push(word_index);
            }
        }

        // If the paragraph is shorter than 15 words, don't add a typo
        if (word_indices.length < 15) {
            typos_per_paragraph.push(0);
            num_typos_found.push(0);
            continue;
        }

        //let random_num_words = get_sample([1,2],1)[0];
        typos_per_paragraph.push(1);

        let random_index1;
        let random_word_index1;
        let random_word_end_index1;
        let target_word1 = "";

        let random_letter_index1;
        let swap_letter_index1;
        let misspelled_word1 = "";

        // Select a word
        do {
            random_index1 = Math.floor(Math.random() * (word_indices.length - 10) + 9);
            random_word_index1 = word_indices[random_index1];
            random_word_end_index1 = word_indices[random_index1 + 1];
            target_word1 = this_paragraph.substring(random_word_index1 + 1, random_word_end_index1);
        } while (target_word1.length < 5 || target_word1.includes('\'') || target_word1.includes('.')
               || target_word1.includes(',') || (target_word1[0] === target_word1[0].toUpperCase()));

        typo_indices.push(random_index1);

        // Select letters to swap
        do {
            random_letter_index1 = Math.floor(Math.random() * (target_word1.length - 3) + 1);
            swap_letter_index1 = random_letter_index1 + 1;
        } while (target_word1[random_letter_index1] === target_word1[swap_letter_index1]);

        for (let i = 0; i < target_word1.length; i++) {
            if (i === random_letter_index1) {
                misspelled_word1 += target_word1[swap_letter_index1];
            } else if (i === swap_letter_index1) {
                misspelled_word1 += target_word1[random_letter_index1];
            } else {
                misspelled_word1 += target_word1[i];
            }
        }

        typos.push(misspelled_word1);

        /*
        // Repeat the process if number of words to be misspelled is 2
        if (random_num_words === 2) {

            let random_index2;
            let random_word_index2;
            let random_word_end_index2;
            let target_word2 = "";

            let random_letter_index2;
            let swap_letter_index2;
            let misspelled_word2 = "";

            // Select a word
            do {
                random_index2 = Math.floor(Math.random() * (word_indices.length - 10) + 9);
                random_word_index2 = word_indices[random_index2];
                random_word_end_index2 = word_indices[random_index2 + 1];
                target_word2 = this_paragraph.substring(random_word_index2 + 1, random_word_end_index2);
            } while (random_index2 === random_index1 || target_word2.length < 5
                     || target_word1.includes(',') || target_word1.includes('\'')
                     || target_word1.includes('.') || (target_word2[0] === target_word2[0].toUpperCase()));

            typo_indices.push(random_index2);

            // Select letters to swap
            do {
                random_letter_index2 = Math.floor(Math.random() * (target_word2.length - 3) + 1);
                swap_letter_index2 = random_letter_index2 + 1;
            } while (target_word2[random_letter_index2] === target_word1[swap_letter_index2]);

            for (let i = 0; i < target_word2.length; i++) {
                if (i === random_letter_index2) {
                    misspelled_word2 += target_word2[swap_letter_index2];
                    misspelled_word2 += target_word2[random_letter_index2];
                } else if (i !== swap_letter_index2) {
                    misspelled_word2 += target_word2[i];
                }
            }

            typos.push(misspelled_word2);
        }
        */

        // Add the typos back to a new paragraph with spans
        let new_paragraph = "";
        let typo_span = " <span class=typo>";
        //if (random_num_words === 1) {
        new_paragraph = this_paragraph.substring(0, random_word_index1)
                        + typo_span + misspelled_word1 + "</span> "
                        + this_paragraph.substring(random_word_end_index1 + 1);
        /*
        } else if (random_num_words === 2) {
            if (random_word_index1 < random_word_index2) {
                new_paragraph = this_paragraph.substring(0, random_word_index1)
                                + typo_span + misspelled_word1 + "</span> "
                                + this_paragraph.substring(random_word_end_index1 + 1, random_word_index2)
                                + typo_span + misspelled_word2 + "</span> "
                                + this_paragraph.substring(random_word_end_index2 + 1);
            } else {
                new_paragraph = this_paragraph.substring(0, random_word_index2)
                                + typo_span + misspelled_word2 + "</span> "
                                + this_paragraph.substring(random_word_end_index2 + 1, random_word_index1)
                                + typo_span + misspelled_word1 + "</span> "
                                + this_paragraph.substring(random_word_end_index1 + 1);
            }
        }
        */

        // Add spans to each correct word (i.e. non-typo)
        let new_paragraph2 = "";
        let span = "<span class=correct>";
        let span_end = "</span>";
        let word = "";

        last_index = -1;
        let index = 0;

        while (index !== -1) {

            index = new_paragraph.indexOf(" ", last_index + 1);

            // Special case for existing typo spans - leaves those intact
            if (new_paragraph.substring(last_index + 1, index) === "<span") {
                index = new_paragraph.indexOf(" ", index + 1);
                typo_span = new_paragraph.substring(last_index + 1, index);
                new_paragraph2 += typo_span;
                last_index = index;
            }

            // Check if you've reached the end of the string
            if (index !== -1) {
                word = new_paragraph.substring(last_index + 1, index);
                new_paragraph2 += span + word + span_end + " ";
                last_index = index;
            } else {
                word = new_paragraph.substring(last_index + 1);
                new_paragraph2 += span + word + span_end;
            }
        }
        // Add the modified paragraph back to the HTML Document
        document.getElementById(temp_id).innerHTML = new_paragraph2;
        num_typos_found.push(0);
    }


    /**
    * Make typos clickable and, when clicked, turn green and add to clicked typo list.
    * Make non-typos clickable and, when clicked, add to the false alarms list.
    */
    document.onload = makeClickable();
    let start_time = performance.now();

    let time_of_click = 0;
    let paragraph = "";

    let typo_string = "";
    let clicked_typos = [];
    let clicked_typo_locations = [];
    let typo_click_times = [];

    let correct_string = "";
    let false_alarms = [];
    let false_alarm_locations = [];
    let false_alarm_times = [];

    function makeClickable(){
      let typos = document.getElementsByClassName("typo");
      for (let i = 0; i < typos.length; i++) {
          typos[i].addEventListener("click", function (e) {
              if (typos[i].style.color !== "purple") {
                  typos[i].style.color = "purple";

                  typo_string = typos[i].innerHTML;
                  clicked_typos.push(typo_string);

                  paragraph = typos[i].parentElement.id;
                  clicked_typo_locations.push(paragraph);

                  num_typos_found[parseInt(paragraph.substring(1)) - 1] += 1;

                  time_of_click = (performance.now() - start_time) / 1000;
                  typo_click_times.push(time_of_click);
              }
          });
      }

      let correct = document.getElementsByClassName("correct");
      for (let i = 0; i < correct.length; i++) {
          correct[i].addEventListener("click", function (e) {
              if (correct[i].style.color !== "purple") {
                  correct[i].style.color = "purple";

                  correct_string = correct[i].innerHTML;
                  false_alarms.push(correct_string);

                  paragraph = correct[i].parentElement.id;
                  false_alarm_locations.push(paragraph);

                  time_of_click = (performance.now() - start_time) / 1000;
                  false_alarm_times.push(time_of_click);
              }
          });
      }
    }

    /**
     *  Create observers to track when each paragraph / heading is visible on-screen.
     */
    let options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.6
    };

    let onscreen = new Set();
    function onScreen(changes) {
        changes.forEach(change => {
            if (change.isIntersecting) {
                let id = change.target.id;
                onscreen.add(id);
            } else if (!change.isIntersecting) {
                let id = change.target.id;
                if (onscreen.has(id)) {
                    onscreen.delete(id);
                }
            }
        });
    }

    let observer = new IntersectionObserver(onScreen, options);

    let document_height = $(document).height();

    let heading_depths = [];
    let paragraph_depths = [];

    for (let i = 1; i <= num_headings; i++) {
        let temp_id = 'h' + i;
        observer.observe(document.getElementById(temp_id));

        // Calculate the depth of each heading as a percentage of the document height
        temp_id = '#' + temp_id;
        let elementTop = $(temp_id).offset().top;
        heading_depths.push(Math.round(elementTop/document_height * 100));
    }

    for (let i = 1; i <= num_paragraphs; i++) {
        let temp_id = "p" + i;
        observer.observe(document.getElementById(temp_id));

        // Calculate the depth of each paragraph as a percentage of the document height
        temp_id = '#' + temp_id;
        let elementTop = $(temp_id).offset().top;
        paragraph_depths.push(Math.round(elementTop/document_height * 100));
    }

    /**
     *  Collect scroll data: time, speed, distance and direction.
     */
    function amount_scrolled() {
        let window_height = $(window).height();
        let document_height = $(document).height();
        let scrollTop = $(window).scrollTop();
        let trackLength = document_height - window_height;
        return Math.round(scrollTop/trackLength * 100);
    }

    let total_reading_time = 0;
    let total_lines_scrolled = 0;
    let num_scrolls_up = 0;

    let scroll_type = [];
    let scroll_time = [];
    let scroll_depth = [];
    let scroll_duration = [];
    let onscreen_at_scroll = [];

    let DEFAULT_SCROLL_PERCENT = .5;
    let last_percent_scrolled = 0;
    let new_percent_scrolled;

    let curr_scroll = 0;
    let last_scroll = start_time;
    let end_time;

    document.addEventListener("scroll", check_mouse);

    function check_mouse(evt){

        new_percent_scrolled = amount_scrolled();

        // Check whether this scroll crosses the distance threshold
        if (Math.abs( new_percent_scrolled - last_percent_scrolled) >= DEFAULT_SCROLL_PERCENT) {

            total_lines_scrolled += 1;

            // Log scroll depth
            scroll_depth.push(new_percent_scrolled);
            console.log(new_percent_scrolled);

            // Log whether the scroll is up or down
            if (new_percent_scrolled - last_percent_scrolled > 0) {
                scroll_type.push("down");
            } else if (new_percent_scrolled - last_percent_scrolled < 0) {
                scroll_type.push("up");
                num_scrolls_up += 1;
            }

            // Log what's onscreen for this scroll
            const myIterator = onscreen.values();
            let onscreen_string = "";
            for (const entry of myIterator) {
                onscreen_string += "(" + entry + ")";
            }
            onscreen_at_scroll.push(onscreen_string);

            // Log time of scroll
            curr_scroll = (performance.now() - start_time) / 1000.00
            scroll_time.push(curr_scroll);

            // Log duration of scroll
            scroll_duration.push(curr_scroll - last_scroll);

            // Reset scroll time and depth
            last_scroll = curr_scroll;
            last_percent_scrolled = new_percent_scrolled;
        }
    }

    /**
     * EXIT TRIAL
     */
    setTimeout(function(){
        let button = $('<button type="button" id="submit_button" class="jspsych-btn" style="display: inline-block"/>Continue</button><br>');
        button.on("click", function() {
            end_time = performance.now() - start_time;
            total_reading_time = end_time - start_time;
            end_trial();
        });
        $('#exit_prompt').remove();
        $('#text').append(button);
    }, trial.wait_time)

    function end_trial(){
        document.removeEventListener("wheel", check_mouse);
        window.removeEventListener("keydown", processSpace);
        let trial_data = {
            "rt": end_time,
            //"stimulus": trial.stimulus,

            "inner_height": screen_height,

            "total_reading_time": total_reading_time,
            "total_scrolls": total_lines_scrolled,
            "num_scrolls_up": num_scrolls_up,
            "scroll_type": scroll_type,
            "scroll_time": scroll_time,
            "scroll_duration" : scroll_duration,
            "scroll_depth" : scroll_depth,
            "onscreen_at_scroll" : onscreen_at_scroll,

            "heading_depths": heading_depths,
            "paragraph_depths": paragraph_depths,

            "typos": typos,
            "typo_indices": typo_indices,
            "typos_per_paragraph": typos_per_paragraph,
            "num_typos_found": num_typos_found,
            "clicked_typos": clicked_typos,
            "clicked_typo_locations": clicked_typo_locations,
            "clicked_typo_times": typo_click_times,
            "false_alarms": false_alarms,
            "false_alarm_locations": false_alarm_locations,
            "false_alarm_times": false_alarm_times,
        };

        // end trial
        jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();
