function toPrintScore(){
	var thisUrl = window.location.pathname.split('/');
	window.location = window.location.origin + "/Learning/PrintScore/" + thisUrl[thisUrl.length-1];
}
var jsonAnswer = {};
function autoSubmit(){
	if($("#getAnswer").val() == undefined || $("#getUserId").val() == ""){
	
		return;
	}
	else{
		clearInterval(window.autoSubmitTime);
		jsonAnswer = JSON.parse($("#getAnswer").val());
		//setTimeout(function(){ajaxPostExam(jsonAnswer);setTimeout("toPrintScore()",3000);},3000)
		//5秒后转到打印成绩页面
	}
}

window.autoSubmitTime = setInterval("autoSubmit()",1000);
