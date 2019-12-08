function toPrintScore(){
	var thisUrl = window.location.pathname.split('/');
	window.location = window.location.origin + "/Learning/PrintScore/" + thisUrl[thisUrl.length-1];
}

function autoSubmit(){
	if($("#getAnswer").val() == undefined || $("#getUserId").val() == ""){
	
		return;
	}
	else{
		clearInterval(window.autoSubmitTime);
		var jsonAnswer = JSON.parse($("#getAnswer").val());
		ajaxPostExam(jsonAnswer);
		//5秒后转到打印成绩页面
		setInterval("toPrintScore()",3000);
	}
}

window.autoSubmitTime = setInterval("autoSubmit()",1000);
