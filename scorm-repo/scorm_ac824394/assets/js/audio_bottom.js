$(document).ready(function() {

    $(".player-play").click(function() {
        mainAudioPlay();
    });

    $(".player-rewind").click(function() {
        mainAudioRewind();
    });

});

$(window).scroll(function() {

    if (window.pageParams.btn_box_position == "top-right") {
        $('#main-buttons-box').css('position', 'fixed').css('top', '35px').css('right', '25px');
    } else if (window.pageParams.btn_box_position == "top-left") {
        $('#main-buttons-box').css('position', 'fixed').css('top', '35px').css('left', '25px');
    } else if (window.pageParams.btn_box_position == "bottom-right") {
        $('#main-buttons-box').css('position', 'fixed').css('bottom', '35px').css('right', '25px');
    } else if (window.pageParams.btn_box_position == "bottom-left") {
        $('#main-buttons-box').css('position', 'fixed').css('bottom', '35px').css('left', '25px');
    } else {
        $('#main-buttons-box').css('position', 'fixed').css('bottom', '25px').css('right', '25px');
    }

});






