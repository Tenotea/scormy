
function runPageAfterStartSCO() {
    var body = $('body');
    window.scoFirstPage = body.attr('firstPage');
    window.scoRememberPage = (body.attr('rememberPage') == "true") ? true : false;
    if (window.scoFirstPage === undefined) {
        window.scoFirstPage = "page1.html";
    }

    console.log("start SCO: " + turn_on_api + " / " + window.scoFirstPage + " / " + window.scoRememberPage);

    if (turn_on_api && window.scoRememberPage) {
        var rememberedLocation = doLMSGetValue("cmi.location"); // scorm 2004
        // var rememberedLocation = doLMSGetValue("cmi.core.lesson_location"); // scorm 1.1, 1.2
        console.log("start SCO 1: " + rememberedLocation);
        if (rememberedLocation.length < 3) {
            rememberedLocation = window.scoFirstPage;
        }
        console.log("start SCO 2: " + rememberedLocation);
        if (rememberedLocation.length < 3) {
            rememberedLocation = "page1.html";
        }
        console.log("start SCO 3: " + rememberedLocation);
        askForPage(rememberedLocation);
    } else {
        if (window.scoFirstPage.length > 3) {
            askForPage(window.scoFirstPage);
        } else {
            askForPage("page1.html");
        }
    }
}

function initializeAudio() {
    window.mainAudio = document.getElementById("main-audio");
    window.mainAudioIsFinished = false;

    window.mainAudio.onload = function () {
        // console.log("onload");
        window.pageParams.is_main_audio_playing = false;
        $('.audio-progress-bar').css('width', "0%");
        $('.count-down-text').text("-");
        $('span:first', $('.player-play')).removeClass("glyphicon-pause");
        $('span:first', $('.player-play')).addClass("glyphicon-play");
    };
    window.mainAudio.onloadstart = function () {
        // console.log("onloadstart " + this.autoplay);
        $('.audio-progress-bar').css('width', "0%");
        $('.count-down-text').text("-");
        if (this.autoplay) {
            window.pageParams.is_main_audio_playing = true;
            $('span:first', $('.player-play')).removeClass("glyphicon-play");
            $('span:first', $('.player-play')).addClass("glyphicon-pause");
        } else {
            window.pageParams.is_main_audio_playing = false;
            $('span:first', $('.player-play')).removeClass("glyphicon-pause");
            $('span:first', $('.player-play')).addClass("glyphicon-play");
        }

    };
    window.mainAudio.onstart = function () {
        // console.log("onstart");
        window.pageParams.is_main_audio_playing = true;
        $('span:first', $('.player-play')).removeClass("glyphicon-play");
        $('span:first', $('.player-play')).addClass("glyphicon-pause");
    };
    window.mainAudio.onpause = function() {
        // console.log("onpause");
        window.pageParams.is_main_audio_playing = false;
        $('span:first', $('.player-play')).removeClass("glyphicon-pause");
        $('span:first', $('.player-play')).addClass("glyphicon-play");
    };
    window.mainAudio.onended = function() {
        window.pageParams.is_main_audio_playing = false;
        $('span:first', $('.player-play')).removeClass("glyphicon-pause");
        $('span:first', $('.player-play')).addClass("glyphicon-play");
    };
    window.mainAudio.ontimeupdate = function() {
        if (window.mainAudioIsFinished) {
            return;
        }
        var currentTime = window.mainAudio.currentTime;
        var duration = window.mainAudio.duration;
        var progress = 0;
        if (currentTime != 0 && duration != 0) {
            progress = Math.round(currentTime / duration * 100);
        }
        window.mainAudioCurrentTime = currentTime;
        window.mainAudioDuration = duration;
        window.mainAudioProgress = progress;
        window.mainAudioCountDown = duration - currentTime;

        // console.log("AudioProgress : " + window.mainAudioCountDown + " / " + window.mainAudioDuration + " / " + window.mainAudioProgress);
        setPageProgress();

        if (progress >= 100 && window.pageParams.page_auto_next == "true") {
            window.pageParams.is_main_audio_playing = false;
            window.mainAudioIsFinished = true;
            if (window.pageParams.is_count_down_running == false) {
                continueToNextPageOrSco();
            }
        }
    };
}

function mainAudioPlay() {
    if (window.pageParams.is_main_audio_playing) {
        window.mainAudio.pause();
        stopCountDown();
    } else {
        window.mainAudio.play();
        window.pageParams.is_main_audio_playing = true;
        if (window.pageParams.is_count_down_running == false) {
            continueCountDown();
        }
        $('span:first', $('.player-play')).removeClass("glyphicon-play");
        $('span:first', $('.player-play')).addClass("glyphicon-pause");
    }
}

function mainAudioStop() {
    window.pageParams.is_main_audio_playing = false;
    $('span:first', $('.player-play')).removeClass("glyphicon-pause");
    $('span:first', $('.player-play')).addClass("glyphicon-play");
    if (window.mainAudio !== undefined) {
        window.mainAudio.pause();
    }
}

function mainAudioRewind() {
    window.pageParams.is_main_audio_playing = false;
    window.mainAudioIsFinished = false;
    $('.audio-progress-bar').css('width', "0%");
    $('.count-down-text').text("-");
    $('span:first', $('.player-play')).removeClass("glyphicon-pause");
    $('span:first', $('.player-play')).addClass("glyphicon-play");
    if (window.mainAudio.autoplay) {
        startCountDown(window.pageParams.minimal_page_time);
    }
    window.mainAudio.load();
}

function askForPage(pageUri) {

    var mainButtonBox = $('#main-buttons-box');
    mainButtonBox.find('.prev-page').prop( "disabled", true );
    mainButtonBox.find('.next-page').prop( "disabled", true );
    mainButtonBox.find('.prev-chapter').prop( "disabled", true );
    mainButtonBox.find('.next-chapter').prop( "disabled", true );
    mainButtonBox.find('.completed-next-chapter').prop( "disabled", true );

    // window.mainAudio.pause();
    $.ajax({
        context: $('#main-content-wrapper'),
        dataType : "html",
        url : pageUri,
        success : function(data) {
            var page = $(data).find('#main-content').parent();
            if (page.length === 0) askForPage("page1.html");
            buildPage(this, page, {
                'page_type' : (top.load_player_page_type === true) ? top.player_page_type : page.attr("page-type") || 'text',
                'completion_status_pct' : (top.load_player_completion_status_pct === true) ? top.player_completion_status_pct : page.attr("completion-status-pct") || '0',
                'btn_box_position' : (top.load_player_btn_box_position === true) ? top.player_btn_box_position : page.attr("btn-box-position") || 'bottom-right',
                'page_info_text' : (top.load_player_page_info_text === true) ? top.player_page_info_text : page.attr("page-info-text") || '',
                'page_background_color' : (top.load_player_page_background_color === true) ? top.player_page_background_color : page.attr("page-background-color") || '#ffffff',
                'minimal_page_time' : (top.load_player_minimal_page_time === true) ? top.player_minimal_page_time : page.attr("minimal-page-time") || '0',
                'audio_auto_play' : (top.load_player_audio_auto_play === true) ? top.player_audio_auto_play : page.attr("audio-auto-play") || 'false',
                'page_audio_href' : (top.load_player_page_audio_href === true) ? top.player_page_audio_href : page.attr("page-audio-href") || '',
                'page_btn_prev_href' : (top.load_player_page_btn_prev_href === true) ? top.player_page_btn_prev_href : page.attr("page-btn-prev-href") || '',
                'page_btn_next_href' : (top.load_player_page_btn_next_href === true) ? top.player_page_btn_next_href : page.attr("page-btn-next-href") || '',
                'page_auto_next' : (top.load_player_page_auto_next === true) ? top.player_page_auto_next : page.attr("page-auto-next") || 'false',
                'loader_for_next_page' : (top.load_player_loader_for_next_page === true) ? top.player_loader_for_next_page : page.attr("loader-for-next-page") || 'false',
                'page_btn_prev_chapter' : (top.load_player_page_btn_prev_chapter === true) ? top.player_page_btn_prev_chapter : page.attr("page-btn-prev-chapter") || 'false',
                'page_btn_next_chapter' : (top.load_player_page_btn_next_chapter === true) ? top.player_page_btn_next_chapter : page.attr("page-btn-next-chapter") || 'false',
                'sco_complete_status' : (top.load_player_sco_complete_status === true) ? top.player_sco_complete_status : page.attr("sco-complete-status") || 'false',
                'is_main_audio_playing' : (top.load_player_is_main_audio_playing === true) ? top.player_is_main_audio_playing : false,
                'is_count_down_running' : (top.load_player_is_count_down_running === true) ? top.player_is_count_down_running : false,
                'page_uri' : pageUri
            });
            $(".first-page").click(function() {
                if (window.scoFirstPage.length > 3) {
                    askForPage(window.scoFirstPage);
                } else {
                    askForPage("page1.html");
                }
            });
        }
    });

}

function buildPage(wrapper, page, params) {
    window.pageParams = params;

    window.mainAudioCountDown = 0;
    window.mainAudioDuration = 0;
    window.pageCountDown = 0;

    wrapper.html(page.html());
    loadZdp();

    var mainButtonBox = $('#main-buttons-box');

    mainButtonBox.removeClass("pos-top-right");
    mainButtonBox.removeClass("pos-top-left");
    mainButtonBox.removeClass("pos-bottom-right");
    mainButtonBox.removeClass("pos-bottom-left");

    if (params.btn_box_position == "top-right") {
        mainButtonBox.addClass("pos-top-right");
    } else if (params.btn_box_position == "top-left") {
        mainButtonBox.addClass("pos-top-left");
    } else if (params.btn_box_position == "bottom-right") {
        mainButtonBox.addClass("pos-bottom-right");
    } else if (params.btn_box_position == "bottom-left") {
        mainButtonBox.addClass("pos-bottom-left");
    } else {
        mainButtonBox.addClass("pos-bottom-right");
    }

    if (params.page_audio_href.length > 3) {
        initializeAudio();
        $('.audio-progress-bar').css('width', "0%");
        mainButtonBox.find('.player-rewind').prop( "disabled", false ).show();
        mainButtonBox.find('.player-play').prop( "disabled", false ).show();
        $('.audio-progress').show();
        $('.count-down').show();
        window.mainAudioIsFinished = false;
        window.mainAudio.src = params.page_audio_href;
        if (params.audio_auto_play == "true") {
            window.mainAudio.autoplay = true;
        }
        window.mainAudio.load();
        // console.log("building ... loading Audio / " + window.mainAudio.autoplay + " / " + window.mainAudio.src);
    } else {
        mainAudioStop();
        mainButtonBox.find('.player-rewind').prop( "disabled", true ).hide();
        mainButtonBox.find('.player-play').prop( "disabled", true ).hide();
        if (isNaN(params.minimal_page_time) || parseInt(params.minimal_page_time) <= 0) {
            $('.audio-progress').hide();
            $('.count-down').hide();
        } else {
            $('.audio-progress').show();
            $('.count-down').show();
        }
    }

    if (params.page_btn_prev_chapter == "true") {
        mainButtonBox.find('.prev-chapter').prop( "disabled", false ).show();
    } else {
        mainButtonBox.find('.prev-chapter').prop( "disabled", true ).hide();
    }

    if (params.page_btn_prev_href.length > 3) {
        mainButtonBox.find('.prev-page').prop( "disabled", false ).show();
        mainButtonBox.find('.prev-page').attr('src', params.page_btn_prev_href);
    } else {
        mainButtonBox.find('.prev-page').prop( "disabled", true ).hide();
    }

    if (params.page_btn_next_href.length > 3) {
        mainButtonBox.find('.next-page').prop( "disabled", false ).show();
        mainButtonBox.find('.next-page').attr('src', params.page_btn_next_href);
    } else {
        mainButtonBox.find('.next-page').prop( "disabled", true ).hide();
    }

    if (params.page_btn_next_chapter == "true") {
        mainButtonBox.find('.next-chapter').prop( "disabled", true ).hide();
        mainButtonBox.find('.completed-next-chapter').prop( "disabled", true ).hide();
        if (params.sco_complete_status == "true") {
            mainButtonBox.find('.completed-next-chapter').prop( "disabled", false ).show();
        } else {
            mainButtonBox.find('.next-chapter').prop( "disabled", false ).show();
        }
    } else {
        mainButtonBox.find('.next-chapter').prop( "disabled", true ).hide();
        mainButtonBox.find('.completed-next-chapter').prop( "disabled", true ).hide();
    }

    if (params.page_info_text.length > 0) {
        mainButtonBox.find('.page-info-text').html(params.page_info_text);
    } else {
        mainButtonBox.find('.page-info-text').html('');
    }

    $("body").css('background-color', params.page_background_color);

    startCountDown(params.minimal_page_time);
    setPageValuesToLMS(params);
    $("html, body").animate({ scrollTop: 0 }, "fast");
    if (params.sco_complete_status == "true") {
        setCompletedStatus(true);
    }
    if (params.page_type == "quiz") {
        mainButtonBox.find('.next-page').prop( "disabled", true );
        mainButtonBox.find('.next-chapter').prop( "disabled", true );
        mainButtonBox.find('.completed-next-chapter').prop( "disabled", true );
    }
    mainButtonBox.show();
    $.LoadingOverlay("hide");

    if (params.page_audio_href.length > 3 && params.audio_auto_play === "true") {
        setTimeout(() => {
            var audio_play_promise = window.mainAudio.play();
            if (audio_play_promise !== undefined) {
                audio_play_promise.catch(error => {
                    mainAudioStop();
                    $('#mainAudioModal').modal({backdrop: 'static', keyboard: false});
                }).then(() => {

                });
            }
        }, 500);
    }
}

function setPageValuesToLMS(params) {
    if (turn_on_api) {
        if (window.scoRememberPage) {
            doLMSSetValue("cmi.location", params.page_uri); // scorm 2004
            // doLMSSetValue("cmi.core.lesson_location", params.page_uri); // scorm 1.1, 1.2
        }
        if (!isNaN(params.completion_status_pct) && parseInt(params.completion_status_pct) > 0) {
            var actualScore = doLMSGetValue("cmi.score.raw"); // scorm 2004
            // var actualScore = doLMSGetValue("cmi.core.score.raw"); // scorm 1.1, 1.2
            var newScore = parseInt(params.completion_status_pct);
            if (actualScore < newScore) {
                doLMSSetValue("cmi.score.raw", newScore); // scorm 2004
                // doLMSSetValue("cmi.core.score.raw", newScore); // scorm 1.1, 1.2
            }
        }
        doLMSCommit();
    }
}

function startCountDown(seconds) {
    stopCountDown();
    var mainButtonBox = $('#main-buttons-box');
    if (isNaN(seconds) || parseInt(seconds) <= 0) {
        mainButtonBox.find('.next-page').prop( "disabled", false );
        mainButtonBox.find('.next-chapter').prop( "disabled", false );
        mainButtonBox.find('.completed-next-chapter').prop( "disabled", false );
        return;
    }
    mainButtonBox.find('.next-page').prop( "disabled", true );
    mainButtonBox.find('.next-chapter').prop( "disabled", true );
    mainButtonBox.find('.completed-next-chapter').prop( "disabled", true );

    window.mainAudioCountDown = 0;
    window.mainAudioDuration = 0;
    window.pageCountDown = parseInt(seconds)+1;
    window.pageTimenout = setInterval(pageTimeoutInterval, 100);
}

function finishCountDown() {
    stopCountDown();
    var mainButtonBox = $('#main-buttons-box');
    mainButtonBox.find('.next-page').prop( "disabled", false );
    mainButtonBox.find('.next-chapter').prop( "disabled", false );
    mainButtonBox.find('.completed-next-chapter').prop( "disabled", false );
    if (window.pageParams.page_auto_next == "true" && window.pageParams.is_main_audio_playing == false) {
        continueToNextPageOrSco();
    }
}

function stopCountDown() {
    clearInterval(window.pageTimenout);
    window.pageParams.is_count_down_running = false;
}

function continueCountDown() {
    window.pageTimenout = setInterval(pageTimeoutInterval, 100);
}

function pageTimeoutInterval() {
    window.pageParams.is_count_down_running = true;
    window.pageCountDown = window.pageCountDown - 0.1;
    // console.log("Page Timeout: " + window.pageCountDown);
    setPageProgress();
    if (window.pageCountDown <= 0) {
        finishCountDown();
    }
}

function continueToNextPageOrSco() {
    if (window.pageParams.loader_for_next_page == "true") {
        $.LoadingOverlay("show");
    }
    if (window.pageParams.page_btn_next_href.length > 3) {
        askForPage(window.pageParams.page_btn_next_href);
    } else {
        if (window.pageParams.sco_complete_status == "true") {
            setCompletedStatus(true);
        }
        top.runNextSco();
    }
}

function setPageProgress() {
    var biggerCountDown = Math.max(window.mainAudioCountDown, window.pageCountDown);
    var biggerDuration = Math.max(window.mainAudioDuration, window.pageParams.minimal_page_time);
    var pageProgress = Math.round((biggerDuration - biggerCountDown) / biggerDuration * 100);

    // console.log("Progress: " + biggerCountDown + " / " + biggerDuration + " / " + pageProgress);
    $('.audio-progress-bar').css('width', pageProgress+"%");
    $('.count-down-text').text(secondsToTime(biggerCountDown));
}

function loadZdp() {
    var wrapper = $('#main-content-wrapper');
    var top_title = $(top.document.getElementById('href-actual'));
    var player_title = top_title.find("h1:first");
    var gid = top.group_id;
    var img = wrapper.find('img:first');
    var zdp_type = img.attr('zdp-type');
    var zdp_title = img.attr('zdp-title');
    if (zdp_type == "ep" || zdp_type == "pps" || zdp_type == "bu") {
        player_title.html(zdp_title);
        img.attr('src', top.url_root + "/photo/group/" + gid + "/docs/" + zdp_type + ".jpg");
    }
}