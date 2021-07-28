
function quiz_click_question_option(status) {
    quiz_continue_or_hide_notes(0);
    if (status == 1) {
        quiz_correct_answare();
    } else {
        quiz_incorrect_answare();
    }
    clearTimeout(window.mye_quiz_timeout);
    window.mye_quiz_timeout = setTimeout(function(){ quiz_continue_or_hide_notes(status); }, 2000);
}

function quiz_correct_answare() {
    $('.quiz-question-correct-note').show();
}

function quiz_incorrect_answare() {
    $('.quiz-question-incorrect-note').show();
}

function quiz_continue_or_hide_notes(status) {
    if (status == 1) {
        continueToNextPageOrSco();
    } else {
        $('.quiz-question-correct-note').hide();
        $('.quiz-question-incorrect-note').hide();
    }
}
