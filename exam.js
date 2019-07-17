var subtime = (Math.round(Math.random()*60) + 180);
$(document).ready(function(){
	var djsinfo = "<span id='djstime'>剩余 " + subtime + " 秒交卷。</span>";
	$("#sub").parent().append(djsinfo);
	djs();
	setTimeout(setAnswer,5000);
});
function setAnswer(){
	//判断全选A
	$("#rpThemes").find("span[id*='sflag1']").each(function(){
		$(this).prev().attr("checked","checked");
	});

	//单选全选D.
	$("#rpThemes").find("span[id*='sflag4']").each(function(num){
		$(this).prev().attr("checked","checked");
	});

	//多选全选ABCD
	$("#rpThemes").find("input[name*='optionsCheckboxse']").attr("checked","checked");
}
function djs(){
    var djsinfo = "剩余 " + subtime + " 秒交卷。"
	$("#djstime").html(djsinfo);
	subtime--;
	if(subtime >0) setTimeout(djs,1000);
	else GetData();
}
function GetData() {
            var rp = document.getElementById("rpThemes");
            if (rp != null) {
                var themId = "";
                var trs = rp.getElementsByClassName("trtheme");
                var inputs;
                var items = "";
                var flag = "";
                var textareas;
                var ids;
                var strItems = "";
                var control;
                var idsName;
                for (var i = 0; i < trs.length; i++) {
                    items = "";
                    if (i < 10) {
                        ids = "rpTheme$ctl0" + i + "$txtHThemId";
                        idsName = "rpTheme_ctl0" + i + "_txtHThemId";
                    }
                    else {
                        ids = "rpTheme$ctl" + i + "$txtHThemId";
                        idsName = "rpTheme_ctl" + i + "_txtHThemId";
                    }
                    if (document.getElementById(ids) != null)
                        themId = document.getElementById(ids).value;
                    else
                        themId = document.getElementById(idsName).value;

                    selects = trs[i].children[1];
                    if (selects != null) {
                              inputs = selects.getElementsByTagName("input");
                                for (var j = 0; j < inputs.length; j++) {
                                    if (inputs[j].type != "hidden") {
                                        var strId = "sflag" + (j + 1);
                                        // flag=trs[i].document.getElementById(strId).innerHTML.replace(/\s+/g,"");
                                        flag = $("#" + trs[i].id).find("#" + strId).text(); //.replace(/\s+/g, "");
                                        // flag=trs[i].getElementById(strId).innerHTML.replace(/\s+/g,"");
                                    }
                                    if (inputs[j].type == "radio" && inputs[j].checked) {
                                        items = flag;
                                    }
                                    else if (inputs[j].type == "checkbox" && inputs[j].checked) {
                                        items += flag.replace(/\s+/g, "");
                                    }
                                }   
                        strItems += themId + "△" + items + "♂";
                    }
                }
                if (strItems == "") {
                    alert("无试题！");
                    return;
                }
                var examId = document.getElementById("txtHExam").value;
                var paperId = document.getElementById("txtHPaper").value;
                var userId = document.getElementById("txtHUser").value;
                var time = document.getElementById("txtHTime").value;
                var sessionId = document.getElementById("txtHSessionId").value;
                var hThemeIdScore = document.getElementById("txtHThemeIdScore").value;             
                var url = "../exam/ExamRedirect.aspx?sessionId='" + sessionId + "'&examId=" + examId + "";
                var subbutton = document.getElementById("sub");
                subbutton.style.display = "none";
                info = JyOnline.WebBase.student.online_exam.paper_test.AddExamPaper(strItems, examId, paperId, userId, time, sessionId, hThemeIdScore).value;
                if (info == "1") {
                    var bgObj = document.createElement("a");
                    bgObj.setAttribute("id", "editLink");
                    bgObj.style.display = "none";
                    bgObj.value = "redirect";
                    bgObj.href = url;
                    document.body.appendChild(bgObj);
                    if (document.all) {
                        document.getElementById('editLink').click();
                    }
                    else {
                        var evt = document.createEvent("MouseEvents");
                        evt.initEvent("click", true, true);
                        document.getElementById('editLink').dispatchEvent(evt);
                    }
                }
                else {
                    doExamResult();
                    alert(info);
                }
            }
        }
