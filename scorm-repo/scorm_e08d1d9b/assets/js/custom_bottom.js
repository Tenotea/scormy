$(document).ready(function() {

	if (isMobileSafari()) {
		$("html, body").css("height", "100%");
		$("html, body").css("overflow-y", "scroll");
		$("html, body").css("-webkit-overflow-scrolling", "touch");
	}
	
	$(".next-chapter").click(function() {
		top.runNextSco();
	});
	
	$(".prev-chapter").click(function() {
		top.runPrevSco();
	});
	
	$(".first-chapter").click(function() {
		top.runFirstSco();
	});

    $(".completed-next-chapter").click(function() {
        setCompletedStatus(true);
        top.runNextSco();
    });

	$(".loader").click(function() {
		$.LoadingOverlay("show", {
			image : "../assets/js/loading.gif"
		});
	});
	
	$(".print-main-content").click(function() {
		$('#main-content').printArea();
	});

});