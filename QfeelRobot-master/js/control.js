  // var localStorage = window.localStorage;
var localStorage = window.localStorage;

var linearSpeed = 10; //线速度
var angularSpeed = 10; //角速度
localStorage.linearSpeed = 10;
var linearUp = false;
var linearDown = false;
var angularL = false;
var angularR = false;
var upLeft = false;
var upRight = false;
var downLeft = false;
var downRight = false;

var moveTimeout=100;
var getPosTime=1000;//每次获取位置信息的时间
var power; //电池电量
var powerNum;
var warning = false; //是否处于警告状态
var bumperLeft; //左侧碰撞
var bumperRight; //右侧碰撞
var bumperCenter; //中间碰撞
var wheelDropLeft; //左侧被提起
var wheelDropRight; //右侧呗提起
var cliffLeft; //左侧悬空
var cliffRight; //右侧悬空
var cliffCenter; // 中间悬空
var button0Pressed; //按键0是否被按下
var button1Pressed; //按键1是否被按下
var button2Pressed; //按键2是否被按下

var URL = '/'; //路由地址


var currLinearSpeed = 0 //直线速度
var currAngularSpeed = 0 //转弯速度
var sending = false //是否发送


function checkState() { //检查机器人状态
    if (bumperLeft) {
        $("#bumperLeft").attr('src', './images/warning.png');
    }
    if (!bumperLeft) {
        $("#bumperLeft").attr('src', './images/normal.png');
    }
    if (bumperRight) {
        $("#bumperRight").attr('src', './images/warning.png');
    }
    if (!bumperRight) {
        $("#bumperRight").attr('src', './images/normal.png');
    }
    if (bumperCenter) {
        $("#bumperCenter").attr('src', './images/warning.png');
    }
    if (!bumperCenter) {
        $("#bumperCenter").attr('src', './images/normal.png');
    }
    if (wheelDropLeft) {
        $("#wheelDropLeft").attr('src', './images/warning.png');
    }
    if (!wheelDropLeft) {
        $("#wheelDropLeft").attr('src', './images/normal.png');
    }
    if (wheelDropRight) {
        $("#wheelDropRight").attr('src', './images/warning.png');
    }
    if (!wheelDropRight) {
        $("#wheelDropRight").attr('src', './images/normal.png');
    }
    if (cliffLeft) {
        $("#cliffLeft").attr('src', './images/warning.png');
    }
    if (!cliffLeft) {
        $("#cliffLeft").attr('src', './images/normal.png');
    }
    if (cliffRight) {
        $("#cliffRight").attr('src', './images/warning.png');
    }
    if (!cliffRight) {
        $("#cliffRight").attr('src', './images/normal.png');
    }
    if (cliffCenter) {
        $("#cliffCenter").attr('src', './images/warning.png');
    }
    if (!cliffCenter) {
        $("#cliffCenter").attr('src', './images/normal.png');
    }
}


function setSending(_sending) { //设置是否发送控制命令
    if (sending && !_sending) {

        sending = _sending;
        stop();
        return;
    }
    if (!sending && _sending) {

        sending = _sending;
        keepSending();
        return;
    }
}

function keepSending() { //持续发送控制命令
    $.ajax({
            url: URL + 'control/move?sessionID=' + localStorage.sessionID + '&linear=' + currLinearSpeed + '&angular=' + currAngularSpeed + '&timeout='+moveTimeout,
            type: 'GET',
            //dataType: 'json',
            data: "",
        })
        .done(function() {
            console.log("Forward success");
        })
        .fail(function() {
            console.log("error");
        })
        .always(function(data) {
            if (sending)
            setTimeout(keepSending,moveTimeout/2);
        });
}

function warn() { //警告状态变成红点
    if (warning) {
        $('#center').attr('src', './images/center_red.png');
    } else {
        $('#center').attr('src', './images/center_blue.png');
    }
}

function battery(data) {
    powerNum = parseInt(Number(data.battery));
    power = powerNum.toString() + '%'; //获得电池电量
    $("#battery-state").text(power);
    if (data.charger == 'adapterCharging') {
        $("#battery-img").attr('src', './images/charging.png');
    } else if (data.charger == 'adapterCharged') {
        $("#battery-img").attr('src', './images/full.png');
    } else {
        if (powerNum == 0) {
            $("#battery-img").attr('src', './images/empty.png');
        } else if (0 < powerNum && powerNum <= 15) {
            $("#battery-img").attr('src', './images/low.png');
        } else if (15 < powerNum && powerNum  <= 40) {
            $("#battery-img").attr('src', './images/lower.png');
        } else if (40 < powerNum && powerNum <= 60) {
            $("#battery-img").attr('src', './images/half.png');
        } else if (60 < powerNum && powerNum <= 85) {
            $("#battery-img").attr('src', './images/higher.png');
        } else if (85 < powerNum && powerNum < 100) {
            $("#battery-img").attr('src', './images/high.png');
        }
    }

}

function keepGetting() { //调用event接口获得机器人信息
    $.ajax({
            url: URL+'sensor/event?sessionID=' + localStorage.sessionID,
            type: 'GET',
            dataType: 'json',
            data: "",
        })
        .done(function() {
            //console.log("getEvent success");
        })
        .fail(function() {
            console.log("error");
        })
        .always(function(data) {
            //获取机器人状态信息
            bumperLeft = data.bumperLeft;
            bumperRight = data.bumperRight;
            bumperCenter = data.bumperCenter;
            wheelDropLeft = data.wheelDropLeft;
            wheelDropRight = data.wheelDropRight;
            cliffLeft = data.cliffLeft;
            cliffRight = data.cliffRight;
            cliffCenter = data.cliffCenter;
            button0Pressed = data.button0Pressed;
            button1Pressed = data.button1Pressed;
            button2Pressed = data.button2Pressed;
            checkState();
            for (var o in data) {
                if (data[o]) {
                    warning = true;
                    warn();
                    break;
                }
                warning = false;
                warn();
            }
            setTimeout(keepGetting, 500);
        });
}


function getBatteryState() { //调用state接口，获得机器人电池状态信息
    $.ajax({
            url: URL+'state?sessionID='+localStorage.sessionID,
            type: 'GET',
            dataType: 'json',
            data: "",
        })
        .done(function() {
            // console.log("getBatteryState success");
        })
        .fail(function() {
            console.log("error");
        })
        .always(function(data) {
            battery(data);
            setTimeout(getBatteryState, 5000);  //每隔5秒访问一次
        });

}


function stop() {           //停止机器人移动
    $.ajax({
            url: URL + 'control/move?sessionID=' + localStorage.sessionID + '&linear=0&angular=0&timeout=100',
            type: 'GET',
            //dataType: 'json',
            data: "",
        })
        .done(function() {
            console.log("stop success");
        })
        .fail(function() {
            console.log("error");
        })
        .always(function(data) {

        });
}

function startOpenni()
{
    $.ajax({
        url:URL+'openni/start?sessionID='+localStorage.sessionID,
        type:'GET'
    }).done(function(data){
        console.log('OK');
    }).fail(function(data){
        console.log('failed');
    });
}
function stopOpenni()
{
    //--------openni停止----start------
    $.ajax({
        url:URL+'openni/stop?sessionID='+localStorage.sessionID,
        type:'GET'
    }).done(function(data){
        console.log('OK');
    }).fail(function(data){
        console.log('failed');
    });
    //--------openni停止----end---------
}





/*function stopGetPos()
{
    //----------定位关闭------start------ 
     $.ajax({
             url:URL+'vlocalizationRgbdslam/stop?sessionID='+localStorage.sessionID,
             type:'GET'
         })
         .done(function(){
             console.log('OK');

         })
         .fail(function(){
             console.log('bad request');
         });
     //--------定位开始--------start--------
}*/

function stopCamera()
{
    //--------摄像头关闭-----start--------
    $.get(URL+'sensor/camera/0/stopRGBStream?sessionID=' + localStorage.sessionID, function(data) {
        console.log(data);
    });
    $('#videoCanvas').hide();
    //--------摄像头关闭-----start--------
}

window.onbeforeunload=function(e) {
   e = e || window.event;
      stopCamera();
      stopOpenni();
};
$(document).ready(function() {

    stopCamera();
    stopOpenni();

    keepGetting();
    getBatteryState();
    //get video input start
    var WS;
    var flag = false;
    var countOpenni=0;
    var countVideo=0;
    var timer=null;  //每次获取位置的定时器名称
    function startCamera()
    {
        //调用sensor/camera/0/getRGBStreamWS接口，请求视频流，html中使用canvas来显示

        $.ajax({
                url: URL+'sensor/camera/0/getRGBStreamWS?sessionID=' + localStorage.sessionID + '&format=mp4&width=320&height=240&rate=300',
                type: 'GET',
                dataType: 'json',
                data: "",
            })
            .done(function(data) {
                $('#videoCanvas').show();
                WS = data.webSocketURL;
                console.log(WS);
                console.log("success");
                var canvas = document.getElementById('videoCanvas'); //取得页面中的Canvas元素
                var client = new WebSocket(WS); //使用请求获得的URL新建一个WebSocket
               
                var player = new jsmpeg(client, { //此处需要先调用jsmpg.js文件，按此方法调用jsmpeg()函数即可生成视频流
                    canvas: canvas,
                    autoplay: true
                });
            })
            .fail(function() {
                console.log("error");
            })
            .always(function() {
                console.log("complete");
            })
        //get video input end
    }

    function getPos()
    {
         //------------获取定位--------start-------\
         $.ajax({
             url:URL+'rlocalization/getLocation?sessionID='+localStorage.sessionID,
             type:'GET'
         })
         .done(function(data){
             $('#position .x').html('x:'+data.coord.x);
             $('#position .y').html('y:'+data.coord.y);
             $('#position .z').html('z:'+data.coord.z);
         });
         timer=setTimeout(function(){
              $.ajax({
                  url:URL+'rlocalization/getLocation?sessionID='+localStorage.sessionID,
                  type:'GET'
              })
              .done(function(data){
                  $('#position .x').html('x:'+data.coord.x);
                  $('#position .y').html('y:'+data.coord.y);
                  $('#position .z').html('z:'+data.coord.z);
                  getPos();
              });
          },getPosTime);
        //------------获取定位--------end-------
    }

   /* function startGetPos()
    {
        //------------开启 RGBD SLAM定位------start-----------
            $.ajax({
                url:URL+'vlocalizationRgbdslam/start?sessionID='+localStorage.sessionID,
                type:'GET'
            })
            .done(function(){
                $.ajax({
                    url:URL+'vlocalizationRgbdslam/getLocation?sessionID='+localStorage.sessionID,
                    type:'GET'
                })
                .done(function(data){
                    $('#position p').html('x:'+data.coord.x+' y:'+data.coord.y+' z:'+data.coord.z);
                })
                .fail(function(){
                    console.log('bad request');
                });
                getPos();
            })
            .fail(function(){
                console.log('bad request');
            });

            //-----------开启 RGBD SLAM定位---end----------
    }*/

//---------------------------普通视频 开启------start-------------------------------------
   $('#videoNormal').bind('click',function(){
    
      countVideo++;
      if(countVideo%2)
      {
          /*$(this).html('关闭普通视频');*/
          $('.detailAPI').hide();
          $('.openni').attr('src','ULBrainImages/openNIun.png');
          $('#openni').addClass('disabled');
          /*if(countOpenni%2)
            {
              if($('#video').prop('checked'))
              {
                stopCamera();
                $('.switch1').attr('src','ULBrainImages/off.png');
              }
              if($('#getPos').prop('checked'))
              {
                stopGetPos();
                $('.switch2').attr('src','ULBrainImages/off.png');
              }
              stopOpenni();
              $('.openni').attr('src','ULBrainImages/openNIun.png');
              $('#openni').html('开启openni');
              countOpenni++;
            }*/
        $('.videoNormal').attr('src','ULBrainImages/video1.png')
          setTimeout(startCamera,500);
          /*$('#video').prop('checked',false);
          $('#getPos').prop('checked',false);
          $('#position').hide();*/
      }   
      else
      {
         stopCamera();
         /*$(this).html('开启普通视频');*/
         $('.videoNormal').attr('src','ULBrainImages/videoclick.png')
         $('.openni').attr('src','ULBrainImages/openNI.png');
        $('#openni').removeClass('disabled');
      }
      return false;
   });
    //touch事件
   $('#videoNormal').bind('touchstart',function(e){
        e.preventDefault();
    
      countVideo++;
      if(countVideo%2)
      {
          $(this).html('关闭普通视频');
          $('.detailAPI').hide();
          $('.openni').attr('src','ULBrainImages/openNIun.png');
          $('#openni').addClass('disabled');
        $('.videoNormal').attr('src','ULBrainImages/video1.png')
          setTimeout(startCamera,500);
      }   
      else
      {
         stopCamera();
         $(this).html('开启普通视频');
         $('.videoNormal').attr('src','ULBrainImages/videoclick.png')
         $('.openni').attr('src','ULBrainImages/openNI.png');
        $('#openni').removeClass('disabled');
      }

   });
//----------------------------------普通视频 开启------end------------------------------------------------
  


//----------openni启动start-------------------------------------------------------------------
    $('#openni').bind('click',function(){
        
        countOpenni++;
        if(countOpenni%2)
        {
            $(this).html('关闭openni');
            /*if(countVideo%2)
            {
                stopCamera();
                $('#videoNormal').html('开启普通视频');
                $('.videoNormal').attr('src','ULBrainImages/video1click.png')
                countVideo++;
            }*/
            $('.videoNormal').attr('src','ULBrainImages/video1un.png');
            $('#videoNormal').addClass('disabled');
            $('.detailAPI').show();
            setTimeout(startOpenni,500);
            $('.openni').attr('src','ULBrainImages/openNI.png');
        }
        else
        {
            $('.openni').attr('src','ULBrainImages/openNIclickclick.png');
            $(this).html('开启openni');
            if($('#video').prop('data-state')==true)
            {
              stopCamera();
    
              $('.switch1').attr('src','ULBrainImages/off.png');
            }
            
            if($('#getPos').prop('data-state')==true)
            {

             
              $('.switch2').attr('src','ULBrainImages/off.png');
              $('#position').hide();
              clearTimeout(timer);
            }
            stopOpenni();
            $('.detailAPI').hide();
            $('#video').prop('data-state',false);
            $('#getPos').prop('data-state',false);
            $('#videoNormal').removeClass('disabled');
            $('.videoNormal').attr('src','ULBrainImages/videoclick.png');
        }
    });

//---------------openni 启动 end--------------------------------------------------------------
        

//-----------------------openni 视频 启动---start---------------------------------------
    $('#video').bind('click',function(){
        if(!$(this).prop('data-state'))
        {   
            $(this).prop('data-state',true);
            startCamera();
            $('.switch1').attr('src','ULBrainImages/on.png');
        }
        else
        {
            stopCamera();
            $(this).prop('data-state',false);
            $('.switch1').attr('src','ULBrainImages/off.png');
        }
    });
    //touch事件
    $('#video').bind('touchstart',function(event){
        event.preventDefault();
        if(!$(this).prop('data-state'))
        {   
            $(this).prop('data-state',true);
            startCamera();
            $('.switch1').attr('src','ULBrainImages/on.png');
        }
        else
        {
            stopCamera();
            $(this).prop('data-state',false);
            $('.switch1').attr('src','ULBrainImages/off.png');
        }
    });

//-----------------------openni 视频 启动---end-----------------------------------------

//-----------------------openni 定位 启动---start---------------------------------------
 
$('#getPos').bind('click',function(event){

    if(!$(this).prop('data-state'))
    {
        $(this).prop('data-state',true);
        $('#position').show();
        getPos();
        $('.switch2').attr('src','ULBrainImages/on.png');
    }
    else
    {   
        clearTimeout(timer);
        $('#position').hide();
        $('.switch2').attr('src','ULBrainImages/off.png');
        $(this).prop('data-state',false);
    }
});

$('#getPos').bind('touchstart',function(event){
    event.preventDefault();
    if(!$(this).prop('data-state'))
    {
        $(this).prop('data-state',true);
        $('#position').show();
        getPos();
        $('.switch2').attr('src','ULBrainImages/on.png');
    }
    else
    {   
        clearTimeout(timer);
        $('#position').hide();
        $('.switch2').attr('src','ULBrainImages/off.png');
        $(this).prop('data-state',false);
    }
});


//-----------------------openni 定位 启动---end-----------------------------------------

    //控制事件开始

    //手机端开始
    $("#up,#down,#left,#right").on('touchmove', function(event) {
        event.preventDefault();
    });

    $("#up").on('touchstart', function(event) {
        $(this).attr('src', 'ULBrainImages/tclick.png');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currLinearSpeed = linearSpeed;
        setSending(true)
    });
    $("#down").on('touchstart', function(event) {
        $(this).attr('src', 'ULBrainImages/dclick.png');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currLinearSpeed = -linearSpeed;
        setSending(true)
    });


    $("#left").on('touchstart', function(event) {
        $(this).attr('src', 'ULBrainImages/lclick.png');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = angularSpeed
        setSending(true)
    });
    $("#right").on('touchstart', function(event) {
        $(this).attr('src', 'ULBrainImages/rclick.png');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = -angularSpeed
        setSending(true)
    });

    $("#up").on('touchend', function(event) {
        $(this).attr('src', 'ULBrainImages/t.png');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡  
        currLinearSpeed = 0
        setSending(false)
    });
    $("#down").on('touchend', function(event) {
        $(this).attr('src', 'ULBrainImages/d.png');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡  
        currLinearSpeed = 0
        setSending(false)
    });
    $("#left").on('touchend', function(event) {
        $(this).attr('src', 'ULBrainImages/l.png');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = 0
        setSending(false)
    });
    $("#right").on('touchend', function(event) {
        $(this).attr('src', 'ULBrainImages/r.png');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = 0
        setSending(false)
    });


    //组合键事件  start

    //组合键事件  end
    $("#speedup").click(function() {
        console.log(linearSpeed);
        if (linearSpeed < 50) {
            linearSpeed += 10;
            localStorage.linearSpeed = linearSpeed;
            var num = Number($('#speedstate').text()) + 1;
            $('#speedstate').text(num);
        }
    });

    $("#speeddown").click(function() {
        if (linearSpeed > 10) {
            linearSpeed -= 10;
            localStorage.linearSpeed = linearSpeed;
            var num = Number($('#speedstate').text()) - 1;
            $('#speedstate').text(num);
        }
    });

    $("#speedup").on('touchstart', function(event) {
        $(this).attr('src', './images/add2.png');
    })
    $("#speedup").on('touchend', function(event) {
        $(this).attr('src', './images/add.png');
    })
    $("#speeddown").on('touchstart', function(event) {
        $(this).attr('src', './images/dec2.png');
    })
    $("#speeddown").on('touchend', function(event) {
            $(this).attr('src', './images/dec.png');
        })
        //调整速度  start

    //调整速度  end 
    //获取信息  start
    $("#center").bind('touchstart', function(event) {
        event.preventDefault();
        $("#attention,#attentionRight").css('display', 'block');
        if (warning) {
            $(this).attr('src', './images/center_red2.png');
        } else {
            $(this).attr('src', './images/center_blue2.png');
        }

    });
    $("#center").bind('touchend', function(event) {
        event.preventDefault();
        $("#attention,#attentionRight").css('display', 'none');
        $(this).attr('src', './images/center_blue.png');
    });
    //获取信息  end



    //电脑端开始
    //
    $("#center").bind('mousedown', function(event) {
        event.preventDefault();
        if($("#attention").css('display')=='block')
        {
            $("#attention,#attentionRight").css('display', 'none');
            $(this).attr('src', './images/center_blue.png');
        }
        else
        {
            $("#attention,#attentionRight").css('display', 'block');
            $(this).attr('src', './images/center_blue2.png');
        }

    });


    $("#up,#down,#left,#right").bind('mousedown', function(event) {
        event.preventDefault();
    });

    $(document).bind('mouseup', function(event) {
        $("#up").attr('src', 'ULBrainImages/t.png');
        $("#down").attr('src', 'ULBrainImages/d.png');
        $("#left").attr('src', 'ULBrainImages/l.png');
        $("#right").attr('src', 'ULBrainImages/r.png');
        event.preventDefault();
        currLinearSpeed = 0;
        currAngularSpeed=0;
        setSending(false);
        return false;
    });
    $("#up").bind('mousedown', function(event) {
        $(this).attr('src', 'ULBrainImages/tclick.png');
        event.stopPropagation(); // 阻止事件冒泡
        currLinearSpeed = linearSpeed;
        setSending(true);
    });
    $("#down").bind('mousedown', function(event) {
        $(this).attr('src', 'ULBrainImages/dclick.png');
        event.stopPropagation(); // 阻止事件冒泡
        currLinearSpeed = -linearSpeed;
        setSending(true);
    });
    $("#right").bind('mousedown', function(event) {
        $(this).attr('src', 'ULBrainImages/rclick.png');
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = -angularSpeed;
        setSending(true);
    });
    $("#left").bind('mousedown', function(event) {
        $(this).attr('src', 'ULBrainImages/lclick.png');
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = angularSpeed;
        setSending(true);
    });
  /*  $("#down").bind('mouseup', function(event) {
        $(this).attr('src', './images/down.png');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡  
        currLinearSpeed = 0;
        setSending(false);
    });*/
/*    $("#left").bind('mouseup', function(event) {
        $(this).attr('src', './images/left.png');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = 0;
        setSending(false);
    });*/

/*    $("#right").bind('mouseup', function(event) {
        $(this).attr('src', './images/right.png');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = 0;
        setSending(false);
    });*/


    //控制事件结束
});
