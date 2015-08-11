var sessionStorage = window.sessionStorage; //存储selfID
var localStorage = window.localStorage; //本地存储
var URL = '/'; //路由地址
$(document).ready(function() {
    $("#pair-submit").on('click', function() { //点击配对发起配对请求
        var selfID = localStorage.selfID;
        var robotID = "00000000000000000000000000000000";  //内测使用32个零作为robotID
        var deviceName = $("#deviceName").val();

        $.ajax({
                url: URL + 'authentication/pair?selfID=' + selfID + '&robotID=' + robotID + '&name=' + deviceName,
                type: 'GET',
                dataType: 'json',
                data: "",
            })
            .done(function(data) {
                console.log("success");

            })
            .fail(function(data) {
                if (data.status == 400) {
                    console.log(data.status);
                    console.log('selfID already exist.');  //配对失败，selfID已经存在
                }

            })
            .always(function(data) {
                if (data.status == 200) {  //配对成功
                    console.log('success');
                    localStorage.deviceName = deviceName;   //存储设备昵称
                    localStorage.firstLogin = false;  //将是否第一次登陆置为 false
                    // setTimeout(function(){alert("timeout")},10000);
                    window.location.href = "connect.html"; //并跳转到connect界面
                }
            });

    });


});
//设置cookie

function randomString(len) {　　//用于生产随机字符串，作为客户端唯一selfID
    len = len || 32;　　
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; //默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1 
    　　
    var maxPos = $chars.length;　　
    var pwd = '';　　
    for (i = 0; i < len; i++) {　　　　
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));　　
    }　　
    return pwd;
}

function checkSession() {
    // if (localStorage.firstLogin == 'false') {     //如果是第一次登陆
    //     console.log("firstLogin:" + localStorage.firstLogin);
    //     console.log('selfID:' + localStorage.selfID);
    //     console.log('sessionID:' + localStorage.sessionID);
    //     window.location.href = 'connect.html';
    // } else {
        console.log("firstLogin:" + localStorage.firstLogin);
        localStorage.selfID = randomString();   //生成一个随机字符串作为selfID，保存在本地
    // }
}
window.onload = function() {
    checkSession();     //页面加载时，检测是否第一次配对
}
