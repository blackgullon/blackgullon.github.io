//课程选择学习
var alreayStudyList=[];              //已学习课程列表
var courseList = [];     //确定的学习可能列表
var preCourseList;  //预学习课程列表
var courseSelect = "";
var currentCourse = {};   //当前学习视频信息
var currentCourseNum = 0; //当前学习视频编号
var currentTotalTime = 0; //当前学习视频时间（秒）
var currentPlayTime = 0;      //当前已播放时间（秒）
var totalTime = 0;         //累计学时
var speedTimes = 1;		  //学习加快倍数
var studyPercent = 0;
var studyCount = 0;   
var isStop = false;

$(document).ready(function(){
	getCourseList();
});
function getCourseList(){
	$.postJSON('/user/getschoolfileList', {
		 pageSize:1000, 
		 pageNo: 1,
		 courseType: '',
		 studyStatus: '1'
	}).then(function(dataSource){
			if(dataSource!=null||dataSource!="undefined"){
				alreayStudyList = dataSource.data; 
				Init_Select();
			}
			else{
				getCourseList();
			}
			
		});
}
function Init_Select(){
	$.get("https://raw.githubusercontent.com/generade/djzx/master/GBCourseList_dev",function(data){
		if(data!=null||data!=""){
			preCourseList = eval(data);
			for(var i=0;i<preCourseList.length;i++){
				var isAdd = false;
				if(alreayStudyList == null){
					courseList = preCourseList;
					break;
				}
				for(var j=0;j<alreayStudyList.length;j++){
					if(preCourseList[i].courseId == alreayStudyList[j].courseId){
						isAdd = true;
						break;
					}
				}
				if(isAdd == false) courseList.push(preCourseList[i]);
			}
			courseSelect = courseSelect + "<select id='courseSelect' style='width:550px;height:30px;' >";
			for (var i=0;i<courseList.length;i++){
				courseList[i]['courseNum'] = i;
				courseSelect += "<option value='" + i + "'>" + courseList[i].courseName + "（时长：" + courseList[i].courseDuration+ "分钟|学时：" + courseList[i].courseHour + "）</option>";	
			}			
			courseSelect += "</select>&nbsp;&nbsp;&nbsp;&nbsp;";
			//初始化控件
			init_compontent();
		}
	});
}

function init_compontent(){
	var lblText = "请选择开始课程：";
    var btnStart = '<input type="button" value="开始" id="Start" style="height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;">&nbsp;&nbsp;&nbsp;&nbsp;';
    var btnEnd = '<input type="button" value="暂停" id="End" disabled="disabled" style="height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;">'
	var iptTime = '<input type="text" id="iptTime" value="70" style="width:30px;height:30px;border: 1px solid;border-radius: 3px;text-align:center;">&nbsp;&nbsp;&nbsp;&nbsp;';
	$(".bar-box:last").before('<div id="messageContent" style="width:1050px;padding:10px 10px;background-color: #fff;margin: 0 auto;line-height:30px;height:200px;"><div>' + lblText + courseSelect + iptTime + btnStart + btnEnd + "</div></div>");
	
	$("#Start").bind("click",function(){
		//禁用本按钮
		$(this).attr("disabled","disabled");
		//禁用选择框
		$("#courseSelect").attr("disabled","disabled");
		//启用暂停按钮
		$("#End").removeAttr("disabled");
		//禁用课时录入窗口
		$("#iptTime").attr("disabled","disabled");
		//开始学习
		startStudy();
	});
	$("#End").bind("click",function(){
		//禁用本按钮
		$(this).attr("disabled","disabled");
		//启用开始按钮
		$("#Start").removeAttr("disabled");
		//启用选择框
		$("#courseSelect").removeAttr("disabled");
		//启用科室录入窗口
		$("#iptTime").removeAttr("disabled");
		//停止学习
		stopStudy();
	});
	//当前学习内容页
	var lblText2 = "当前学习课程：";
	var lblText3 = "</br>当前课程学习进度：";
	var lblText4 = "</br>累计学时：";
	var lblCurrentCourseTitle = "<label id='lblCurrentCourseTitle'></label>";
	var currentPlayTime = "<label id='currentPlayTime'></label>";
	var lblTotalTime = "<label id='lblTotalTime'></label>";
	
	$("#messageContent").append('<div>' + lblText2 + lblCurrentCourseTitle + lblText3 + currentPlayTime + lblText4 + lblTotalTime + "</div>");
	$("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
	$("#messageContent").css("height","100px");
	//选择框变化
	$("#courseSelect").change(function(){
		currentCourseNum =  $("#courseSelect option:selected").val();
		$("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
	});
	//得到总学时
	getTotalHours();
	window.getHoursTimer = setInterval("getTotalHours()",20000);
}
function startStudy(){
	currentCourse = courseList[currentCourseNum];
	currentTotalTime = currentCourse.courseDuration*60;
	var tempTimes = currentCourse.courseDuration;
    speedTimes = parseInt(tempTimes/2)?parseInt(tempTimes/2):1;
	addTimeCount();
}
//记录学习信息
function addTimeCount(){
	$.postJSON("/user/addTimeCount", currentCourse,).then(
		function(data){
			var code = data.code;
			console.log( data.isRecord );
		}
	);
	currentCourse.studyTimes = currentCourse.studyTimes?currentCourse.studyTimes:0;		
	studyProcess();
}
function studyProcess(){
	window.sendTimer = setInterval(function(){
		studyCount++;
		currentPlayTime += speedTimes;
		studyPercent = parseInt(currentPlayTime/currentTotalTime*100)==100?100:parseInt(currentPlayTime/currentTotalTime*100);
		$("#currentPlayTime").html("<font color='red'>" + studyPercent + "%</font>");
		if(currentPlayTime > (currentTotalTime+60)){
			//设置学习完的颜色
			$("#courseSelect option[value='" + currentCourseNum + "']").css("background-color","green")
			//播放下一个视频
			//初始化时间参数等
			clearInterval(sendTimer);
			studyCount = 0;
			currentPlayTime = 0;
			currentCourseNum++;
			if(currentCourseNum >= courseList.length) {
				studyAgain();
				return;
			}				
			$("#lblCurrentCourseTitle").html("<font color='red'>" + courseList[currentCourseNum].courseName + "（时长：" + courseList[currentCourseNum].courseDuration+ "分钟|学时：" + courseList[currentCourseNum].courseHour + "）</font>");
			startStudy();
		}
                else if(studyCount%30 == 0){
			$.postJSON("/bintang/learntime", {
				timelength:currentCourse.courseDuration,
				courseId:currentCourse.courseId,
				userId:userId,
				studyTimes:currentPlayTime
			}).then(function(data) {
					if(data==false){
						 returnTime = true;
					 }
					currentCourse.studyTimes = currentPlayTime;
					console.log("learntime:"+currentCourse.studyTimes);
				});
		}
	},500);
	
}
function getTotalHours(){
	$.post("/user/getOutTime").then(function (data){
		if(data!=null){
			totalTime = data.totalHours;
			$("#lblTotalTime").html("<font color='red'>" + totalTime + "</font>");
			$("title").text(totalTime);
			if(totalTime >= parseInt($("#iptTime").val())){
				isStop = true;
				stopStudy();
			}
			else{
				if(isStop == true){
					isStop = false;
					studyAgain();
				}
			}
		}
	});
}
function stopStudy(){
	clearInterval(sendTimer);
	currentPlayTime = 0;
	studyCount = 0;
}
//学完没有计入学时的，重新学习
function studyAgain(){
	$.postJSON('/user/getschoolfileList', {
		 pageSize:1000, 
		 pageNo: 1,
		 courseType: '',
		 studyStatus: '1'
	}).then(function(dataSource){
			if(dataSource!=null||dataSource!="undefined"){
				alreayStudyList = dataSource.data; 
				Init_Select_Again();
			}
			else{
				studyAgain();
			}
			
		});
}
function Init_Select_Again(){
	courseList = new Array();
	courseSelect = "";
	currentCourseNum = 0;
	currentPlayTime = 0;
	studyCount = 0;
	
	for(var i=0;i<preCourseList.length;i++){
		var isAdd = false;
		for(var j=0;j<alreayStudyList.length;j++){
			if(preCourseList[i].courseId == alreayStudyList[j].courseId){
				isAdd = true;
				break;
			}
		}
		if(isAdd == false) courseList.push(preCourseList[i]);
	}
	for (var i=0;i<courseList.length;i++){
		courseList[i]['courseNum'] = i;
		courseSelect += "<option value='" + i + "'>" + courseList[i].courseName + "（时长：" + courseList[i].courseDuration+ "分钟|学时：" + courseList[i].courseHour + "）</option>";	
	}			
	//更新列表
	$("#courseSelect").html(courseSelect);
	$("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
	//继续学习
	startStudy();
}
