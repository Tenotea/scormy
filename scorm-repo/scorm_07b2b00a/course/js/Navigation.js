var Navigation = {
	ccLanguage: '',
	loadPages:function(link){
		clearInterval(Navigation.interval);
		var url = $(link).attr('url');
		$('.transcriptTitle').html($(link).text());
		var h = $('#player').height();
		//var htmlContent = "<iframe name='ContentFrame' vzaar-video-playerid= 'ContentFrame' allowtransparency='true' scrolling='no' frameborder='0' src='" +url +"?apiOn=true' width='100%' height='" + h + "' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
		var htmlContent = '<iframe allowFullScreen allowTransparency="true" class="vzaar-video-player" frameborder="0" id="ContentFrame" mozallowfullscreen name="ContentFrame" src="'+ url + '?apiOn=true" title="vzaar video player" type="text/html" webkitAllowFullScreen width="100%" height="' + h + '"></iframe>';
		
		View.updateElements("player",htmlContent);
		
		Navigation.transcript();		
		
		var id = $(link).attr('id');
		Framework.PageVisitedStatus[id] = 1;
		Framework.currentIndex = id;
		$('#pageno').html((parseInt(id) + 1)+" of "+ courseArray.length);
		
		var percentage = ((Utils.getCount(Framework.PageVisitedStatus, 1))/courseArray.length)*$('#progress').width();
		$('#fill').width(percentage);
		var percentageText = ((Utils.getCount(Framework.PageVisitedStatus, 1))/courseArray.length)*100;
		$('#progressTxt').text(Math.ceil(percentageText) +"%");
		
		$(link).addClass('completed');
		
		if(id == 0){
			$('#back').addClass('disable').removeClass('enable');
		}else{
			$('#back').removeClass('disable').addClass('enable');
		} 
		
		if(courseArray.length-1 == Framework.currentIndex){
			$('#next').addClass('disable').removeClass('enable');
		}else{
			$('#next').removeClass('disable').addClass('enable');
		}
		
		Navigation.sendStatus();
		
		
		
		//alert(htmlContent);
	},
	
	transcript: function(){
		var vzp;
		
		$.getJSON("cc/" + Navigation.ccLanguage + "/" + (parseInt(Framework.currentIndex) + 1) +".json", function(json) {
			var ccText = "";
			for(i=0;i<json.length;i++){
				ccText += '<span start ="' + json[i].start + '" tabindex="' + (9+i+1) + '" id="cc'+i+'" class="ccspan">' + json[i].text + '</span>&nbsp;';
			}
			
			$('.transcriptContent').html(ccText);
			$('.transcriptContent').scrollTop(0);
			$('.ccspan').click(function(){
				vzp.seekTo($(this).attr('start'));
			});
			
			$('.ccspan').keypress(function(event) {
				if(event.keyCode == 13){
					$(document.activeElement).click();	
				}
			});
			 setTimeout(function(){ 
				vzp = new vzPlayer("ContentFrame");
				clearInterval(Navigation.interval);
				 vzp.ready(function() {
					Navigation.interval = setInterval(function() {
						vzp.getTime(function(currentTime) {
							for(var j=0; j<json.length; j++) {
								if(parseFloat(json[j].start.toFixed(1)) < parseFloat(currentTime) && parseFloat(json[j].end.toFixed(1)) > parseFloat(currentTime)){
									$('.ccspan').css('background', 'transparent');
									$('#cc'+j).css('background', '#f00');
									$('.transcriptContent').scrollTop = $('#cc'+j).offsetTop - $('#transcript').offsetTop - 40;
									$('#cc'+j).focus();
								}
							}	
						});
					}, 100);
				  });
			}, 3000);	
		});
	},
	navigation:function(options){
		//alert("in navigation :: "  + options.Lesson_location);
		if(options.Lesson_location != "" && options.Lesson_location != null && options.Lesson_location != "undefined"){
			Framework.currentIndex = options.Lesson_location;
			Framework.PageVisitedStatus = options.PageVisitedStatus.split(",")
			
			Navigation.markCompletion();
			$('#disabler').show();
			$('#bookmark_container').show();
		}else{
			$('#0').click();
		}
		//$('#'+Framework.currentIndex).click();

	},
	
	markCompletion:function(){
		//alert(Framework.PageVisitedStatus.length);
		for(i=0;i<Framework.PageVisitedStatus.length;i++){
			//alert(Framework.PageVisitedStatus[i]);
			if(Framework.PageVisitedStatus[i] == 1){
				$('#'+i).addClass('completed');	
			}
		}
	},
	
	sendStatus:function(){
	
		var cnt = 0;
		for(i=0;i<Framework.PageVisitedStatus.length;i++){
			
			if(Framework.PageVisitedStatus[i] == 1){
				cnt++;
			}
		}
		
		var score = Math.ceil((cnt/Framework.PageVisitedStatus.length)*100);
		if(cnt ==Framework.PageVisitedStatus.length){
			Framework.completion = "completed";
		}
		
		if(Framework.mode == "scorm"){
			doLMSSetValue(Framework.completion,Framework.currentIndex, Framework.PageVisitedStatus.toString(),score );
		}else if(Framework.mode == "scorm13"){
		
		}else if(Framework.mode == "tincan"){
			Tincan.putData(Framework.currentIndex,Framework.PageVisitedStatus.toString());
		}else{
			Web.set(Framework.currentIndex,Framework.PageVisitedStatus.toString());
		}
	},
	
	exit:function(){
		if(Framework.mode == "scorm"){
			doLMSFinish();
		}else if(Framework.mode == "scorm13"){
		
		}else if(Framework.mode == "tincan"){
			Tincan.putData();
		}else{
			Web.set(Framework.currentIndex,Framework.PageVisitedStatus.toString());
		}
	}

}