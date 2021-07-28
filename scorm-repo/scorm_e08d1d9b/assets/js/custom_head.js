var turn_on_api = true;

function isMobileSafari() {
	return navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)
}

function setCompletedStatus(force = false) {
	if (turn_on_api != true) {
		return false;
	}

	// scorm 2004
	if (doLMSGetValue( "cmi.completion_status" ) != "completed" || force) {
		doLMSSetValue( "cmi.completion_status", "completed" );
		doLMSCommit();
	}

	// scorm 1.1, 1.2
	/*
	if (doLMSGetValue( "cmi.core.lesson_status" ) != "completed") {
		doLMSSetValue( "cmi.core.lesson_status", "completed" );
		doLMSCommit();
	}
	*/
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function secondsToTime(secs)
{
	if (isNaN(secs)) {
		return "-";
	}

    secs = Math.round(secs);
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    return pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);
}