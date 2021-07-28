
$(document).ready(function() {

    $(".next-page").click(function() {
        askForPage(window.pageParams.page_btn_next_href)
    });

    $(".prev-page").click(function() {
        askForPage(window.pageParams.page_btn_prev_href);
    });

    $(".first-page").click(function() {
        if (window.scoFirstPage.length > 3) {
            askForPage(window.scoFirstPage);
        } else {
            askForPage("page1.html");
        }
    });

});


$(window).load(function() {

    runPageAfterStartSCO();

});

