var answerList = [];
var params = {};
var examId = "";
var userId = "";
var yongtime = Math.ceil(10000 + 4*Math.random()*1000) + 2000;

$(document).ready(function() {
	setTimeout('$(".answerConfirm").click()',2000);
	init_data();
	setTimeout(jiaojuan,yongtime);
});

function init_data(){
	var allData = JSON.parse(sessionStorage.getItem('allData')).data;
	userId = JSON.parse(sessionStorage.getItem("userInfo")).data.userId;
	examId = allData[0].examId;
	for(var i=0;i<allData.length;i++){
		var answer = {};
		answer.id = allData[i].id;
		answer.answer = "";
		for(var j=0;j<allData[i].options.length;j++){
			if(allData[i].options[j].checked == true) answer.answer += allData[i].options[j].optionName;
		}
		answerList.push(answer);
	}	
}

function jiaojuan(){
     params = {
    	"userId": userId,
    	"examId": examId,
     	'questionList':answerList,
    	'useTime': w_yongtime || ''
      }
      $.ajax({
      url: "http://dkt.dtdjzx.gov.cn/examination/postExamination",
      type: 'post',
      data:JSON.stringify(params),
      dataType: "json",
      contentType: 'application/json',
	  success: function(res){
		dats=res;
		if(dats.code != 200) {
			alert(dats.message);
			return;
		}
		sessionStorage.setItem('huikanData',JSON.stringify(dats));
		var data = res.data;
		var questionTotal = data.reminisceQuestionList.length;
		var totalScore = data.totalScore;
		var rightCount = data.rightCount;
		var wrongCount = data.wrongCount;
		clearInterval(jisiqi);
		$('#mydefen').modal("show");
		$('.fenfen').html(totalScore); //分数
		// localStorage.setItem('fenfen',w_fff)
		$('.w_shijain').html( $('.W_time').html() );
		// localStorage.setItem('w_shijain', $('.W_time').html() )
		$('.w_num_geshu').html( questionTotal );
		$('.w_dui').html(rightCount);
		$('.w_cuode').html(wrongCount);

		$('.jiaojuan').addClass('W_jiaoquancol');
		var message = {};
		message.type = "result";
		message.message = totalScore+"分"+$('.W_time').html()+"秒";
		chrome.extension.sendMessage(JSON.stringify(message),function(response){});
		}
	});  
	
}
