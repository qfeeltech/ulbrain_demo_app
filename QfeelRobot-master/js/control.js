  // var localStorage = window.localStorage;
var localStorage = window.localStorage;
var linearSpeed = 10; //线速度
var angularSpeed = 10; //角速度
localStorage.linearSpeed = 10;

var stateLink=false;//判断是否连接了
var moveTimeout=100;
var getPosTime=1000;//每次获取位置信息的时间
var power; //电池电量
var powerNum;
var info={br:false,bl:false,cr:false,cl:false,cc:false,wl:false,wr:false,bc:false};//记录状态信息
var button0Pressed; //按键0是否被按下
var button1Pressed; //按键1是否被按下
var button2Pressed; //按键2是否被按下
var URL = '/'; //路由地址
var currLinearSpeed = 0 //直线速度
var currAngularSpeed = 0 //转弯速度
var sending ={switch1:false,switch2:false}; //是否发送 switch1是控制前进后退，switch2控制转向
function checkState() { //检查机器人状态
    if(info.br){$('#br,#warning').show()}else{$('#br').hide();}
    if(info.bl){$('#bl,#warning').show()}else{$('#bl').hide();}
    if(info.bc){$('#bc,#warning').show()}else{$('#bc').hide();}
    if(info.cr){$('#cr,#warning').show()}else{$('#cr').hide();}
    if(info.cl){$('#cl,#warning').show()}else{$('#cl').hide();}
    if(info.cc){$('#cc,#warning').show()}else{$('#cc').hide();}
    if(info.wl){$('#wl,#warning').show()}else{$('#wl').hide();}
    if(info.wr){$('#wr,#warning').show()}else{$('#wr').hide();}
    if($('#warning ul').innerHeight()>2){$('#warning').show();}else {$('#warning').hide();}
}
function setSending(sending) { //设置是否发送控制命令
    if(!sending.switch1&&!sending.switch2)
    {
        stop();
    }
    else
    {
        keepSending();
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
            if(sending.switch1||sending.switch2)
            setTimeout(keepSending,moveTimeout/2);
        });
}
function battery(data) {//获得电池电量
    var n=Number(data.battery);
    powerNum = parseInt(n); 
    $("#battery span").html(powerNum+'%');
    var width=n*31/100;
    $('#battery strong i').css('width',width);
    
    if(n<=20)
    {
      $('#battery strong i').addClass('active');
    }
    else
    {
        $('#battery strong i').removeClass('active');
    }
    if (data.charger == 'adapterCharging') {
        $('#battery strong img').show();
    } 
    else
    {
        $('#battery strong img').hide();
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
            console.log("getEvent success");
            $('#alert').hide();
            stateLink=false;
        })
        .fail(function() {
            console.log("error");
            if(!stateLink)
            {
               $('#alert').show(); 
            }
            stateLink=true;
        })
        .always(function(data) {
            //获取机器人状态信息
            info.bl = data.bumperLeft;
            info.cl = data.cliffLeft;
            info.cr = data.cliffRight;
            info.br = data.bumperRight;
            info.cc = data.cliffCenter;
            info.bc = data.bumperCenter;
            info.wl = data.wheelDropLeft;
            info.wr = data.wheelDropRight;
            button0Pressed = data.button0Pressed;
            button1Pressed = data.button1Pressed;
            button2Pressed = data.button2Pressed;
            checkState();
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
            console.log("getBatteryState success");
        })
        .fail(function() {
            console.log("error");
        })
        .always(function(data) {
            battery(data);
            setTimeout(getBatteryState, 5000);  //每隔5秒访问一次
        });
}
function stop() {  //停止机器人移动
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
function startOpenni(){  //开启openni
    $.ajax({
        url:URL+'openni/start?sessionID='+localStorage.sessionID,
        type:'GET'
    }).done(function(data){
        console.log('OK');
    }).fail(function(data){
        console.log('failed');
    });
}
function stopOpenni(){  //关闭openni
    $.ajax({
        url:URL+'openni/stop?sessionID='+localStorage.sessionID,
        type:'GET'
    }).done(function(data){
        console.log('OK');
    }).fail(function(data){
        console.log('failed');
    });
}
function stopCamera(){  //关闭摄像头
    $.get(URL+'sensor/camera/0/stopRGBStream?sessionID=' + localStorage.sessionID, function(data) {
        console.log(data);
    });
    $('#videoCanvas').hide();
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
    var WS;
    var flag = false;
    var countOpenni=0;
    var countVideo=0;
    var countVoice=0;
    var countFollow=0;
    var timer=null;  //每次获取位置的定时器名称
    var voiceSwitch=false;
    var voiceTimer=null;
    function startCamera(){//调用sensor/camera/0/getRGBStreamWS接口，请求视频流，html中使用canvas来显示
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
    }
    function getPos(){  //获取定位
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
    }
    function getVoice(){  //开启语音识别
        $.ajax({
           url:URL+'voice/start?sessionID='+localStorage.sessionID,
           type:'GET'
        })
        .done(function(data){
             console.log(data);
             voiceSwitch=true;
             commandVoice();
        })
        .fail(function(data){
             console.log(data);
        });
    }
    function stopVoice(){  //关闭语音识别
        $.ajax({
         url:URL+'voice/stop?sessionID='+localStorage.sessionID,
         type:'GET'
        })
        .done(function(data){
             console.log(data);
             voiceSwitch=false;
             sending.switch1=false;
             sending.switch2=false;
             currAngularSpeed=0;
             currLinearSpeed=0;
             clearTimeout(voiceTimer);
             stop();
        })
        .fail(function(data){
             console.log(data);
             voiceSwitch=false;
             sending.switch1=false;
             sending.switch2=false;
             currAngularSpeed=0;
             currLinearSpeed=0;
             clearTimeout(voiceTimer);
             stop();
        });
    }
    function commandVoice(){  //语音控制
        $.ajax({
            url:URL+'voice/retrieve?sessionID='+localStorage.sessionID,
            type:'GET'
        })
        .done(function(data){
            switch(data)
            {
                case 'straight':
                    currLinearSpeed = linearSpeed;
                    currAngularSpeed=0;
                    sending.switch1=true;
                    sending.switch2=false;
                    setSending(sending);  
                    break;
                case 'back':
                    currLinearSpeed = -linearSpeed;
                    currAngularSpeed=0;
                    sending.switch1=true;
                    sending.switch2=false;
                    setSending(sending);  
                    break;
                case 'left':
                    currAngularSpeed = angularSpeed;
                    sending.switch2=true;
                    setSending(sending);  
                    break;
                case 'right':
                    currAngularSpeed = -angularSpeed;
                    sending.switch2=true;
                    setSending(sending);
                    break;
                case 'stop':
                    sending.switch1=false;
                    sending.switch2=false;
                    currLinearSpeed=0;
                    currAngularSpeed=0;
                    setSending(sending);
                    stop();
                    break;
            }
        })
        .always(function(){
            if(voiceSwitch)
            {
                voiceTimer=setTimeout(commandVoice,300);
            }
        });
    }
    function stopFollow(){  //停止跟随
        $.ajax({
            url:URL+'follow/stop?sessionID='+localStorage.sessionID,
            type:'GET'
        })
        .done(function(data){
            console.log(data);
        })
        .fail(function(data){
            console.log(data);
        });
    }
    $('#follow').bind('click',function(){  
        countFollow++;
        if(countFollow%2) //跟随初始化
          {
            $(this).addClass('followOn');
            $('.follow-btn').show();
            $.ajax({
            url:URL+'follow/init?sessionID='+localStorage.sessionID,
            type:'GET'
            })
            .done(function(data){
               console.log(data);
            })
              .fail(function(data){
               console.log(data);
            });
          }
        else  //停止跟随
        {
            $(this).removeClass('followOn');
            $('.follow-btn').hide();
            stopFollow();
        }
    });
    $('#record').bind('click',function(){
        if($(this).hasClass('recordOn')){  //跟随开始
            $(this).removeClass('recordOn');
            $('.follow-img').removeClass('follow-imgOn');
            $.ajax({
                url:URL+'follow/start?sessionID='+localStorage.sessionID,
                type:'GET'
            })
            .done(function(data){
                console.log(data);
            })
            .fail(function(data){
                console.log(data);
            });
        }
        else    //记录人脸
        {
            $(this).addClass('recordOn');  
            $('.follow-img').addClass('follow-imgOn');
            $.ajax({
                url:URL+'follow/record?sessionID='+localStorage.sessionID,
                type:'GET'
            })
            .done(function(data){
                console.log(data);
            })
            .fail(function(data){
                console.log(data);
            });
        }
    });
    $('#voice').bind('click',function(){  //语音识别
        countVoice++;
        if(countVoice%2)
        {
           $(this).addClass('active');
           getVoice();
        }
        else
        {
            $(this).removeClass('active');
            stopVoice();
        }
    });
    $('#videoNormal').bind('click',function(){  //普通摄像头
      countVideo++;
      if(countVideo%2)
      {
         
          $('.detailAPI').hide();
          $(this).addClass('active')
          $('#openni').addClass('disabled off');
          setTimeout(startCamera,500);

          $('#position').hide();
      }   
      else
      {
         stopCamera();
        $(this).removeClass('active');
        $('#openni').removeClass('disabled off');
      }
      return false;
    });
    //touch事件
    $('#videoNormal').bind('touchstart',function(e){
        e.preventDefault();
      countVideo++;
      if(countVideo%2)
      {
          $('.detailAPI').hide();
          $('#openni').addClass('disabled off');
          $(this).addClass('active');
          setTimeout(startCamera,500);
      }   
      else
      {
         stopCamera();
        $(this).removeClass('active')
        $('#openni').removeClass('disabled off');
      }
    });
    $('#openni').bind('click',function(){  //开启openni
        countOpenni++;
        if(countOpenni%2)
        {
            $(this).addClass('active');
            $('#videoNormal').addClass('disabled off');
            $('.detailAPI').show();
            setTimeout(startOpenni,200);
            $('#button3').show();  
        }
        else
        {
            if($('#follow').hasClass('followOn'))
            {
                stopFollow();
                $('.follow-btn').hide();
                $('.follow-img').removeClass('.follow-imgOn');
            }
            $('#button3').hide();
            $(this).removeClass('active');
            if($('#video').hasClass('active'))
            {
              stopCamera();
              $('#video').removeClass('active');
              $('.btn1-img').removeClass('active');
            }
            if($('#getPos').hasClass('active'))
            {
              $('#getPos').removeClass('active');
              $('.btn2-img').removeClass('active');
              $('#position').hide();
              clearTimeout(timer);
            }
            stopOpenni();
            $('.detailAPI').hide();
            $('#videoNormal').removeClass('disabled off');
        }
    });
    $('#video').bind('click',function(){  //开启rgbd摄像头
        if(!$(this).hasClass('active'))
        {   
            $(this).addClass('active');
            startCamera();
            $('.btn1-img').addClass('active');
        }
        else
        {
            stopCamera();
            $(this).removeClass('active');
            $('.btn1-img').removeClass('active');
        }
    });
    //touch事件
    $('#video').bind('touchstart',function(event){
        event.preventDefault();
        if(!$(this).hasClass('active'))
        {   
            $(this).addClass('active');
             startCamera();
             $('.btn1-img').addClass('active');
        }
        else
        {
            stopCamera();
            $(this).removeClass('active');
            $('.btn1-img').removeClass('active');
        }
    });
    $('#getPos').bind('click',function(event){  //开启定位
        if(!$(this).hasClass('active'))
        {
            $(this).addClass('active');
            $('#position').show();
            getPos();
             $('.btn2-img').addClass('active');
        }
        else
        {   
            clearTimeout(timer);
            $('#position').hide();
            $('.switch2').attr('src','ULBrainImages/off.png');
            $(this).removeClass('active')
             $('.btn2-img').removeClass('active');
        }
    });
    //touch事件
    $('#getPos').bind('touchstart',function(event){
        event.preventDefault();
        if(!$(this).hasClass('active'))
        {
            $(this).addClass('active');
            $('#position').show();
            getPos();
             $('.btn2-img').addClass('active');
        }
        else
        {   
            $(this).removeClass('active');
            clearTimeout(timer);
            $('#position').hide();
             $('.btn2-img').removeClass('active');
        }
    });
    //手机端开始移动控制
    $("#up,#down,#left,#right").on('touchmove', function(event) {
      event.preventDefault();           
    });
    $("#up").on('touchstart', function(event) {
        $(this).addClass('upOn');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currLinearSpeed = linearSpeed;
        sending.switch1=true;
        setSending(sending);           
    });
    $("#down").on('touchstart', function(event) {
        $(this).addClass('downOn');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currLinearSpeed = -linearSpeed;
        sending.switch1=true;
        setSending(sending);          
    });
    $("#left").on('touchstart', function(event) {
        $(this).addClass('leftOn');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = angularSpeed;
        sending.switch2=true;
        setSending(sending);            
    });
    $("#right").on('touchstart', function(event) {
        $(this).addClass('rightOn');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = -angularSpeed;
        sending.switch2=true;
        setSending(sending);          
    });
    $("#up").on('touchend', function(event) {
        $(this).removeClass('upOn');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡  
        currLinearSpeed = 0;
        sending.switch1=false;
        setSending(sending);          
    });
    $("#down").on('touchend', function(event) {
        $(this).removeClass('downOn');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡  
        currLinearSpeed = 0;
        sending.switch1=false;
        setSending(sending); 
    });
    $("#left").on('touchend', function(event) {
        $(this).removeClass('leftOn');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = 0;
        sending.switch2=false;
        setSending(sending);        
    });
    $("#right").on('touchend', function(event) {
        $(this).removeClass('rightOn');
        event.preventDefault();
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = 0;
        sending.switch2=false;
        setSending(sending);  
    });
    $("#speedup").bind('mousedown',function(event) {
        console.log(linearSpeed);
        event.preventDefault();
        event.stopPropagation(); 
        if (linearSpeed < 50) {
            linearSpeed += 10;
            localStorage.linearSpeed = linearSpeed;
            var num = Number($('#speedstate').text()) + 1;
            $('#speedstate').text(num);
        }
        $(this).addClass('speedupOn');     
    });
    $('#speedup').bind('mouseup',function(){
      $(this).removeClass('speedupOn');
    });
    $("#speeddown").bind('mousedown',function() {
        if (linearSpeed > 10) {
            linearSpeed -= 10;
            localStorage.linearSpeed = linearSpeed;
            var num = Number($('#speedstate').text()) - 1;
            $('#speedstate').text(num);
        }
         $(this).addClass('speeddownOn');
    });
    $('#speeddown').bind('mouseup',function(){
      $(this).removeClass('speeddownOn');
    });
    $("#speedup").on('touchstart', function(event) {
        event.preventDefault();
        event.stopPropagation(); 
        if (linearSpeed < 50)
        {
            linearSpeed += 10;
            localStorage.linearSpeed = linearSpeed;
            currLinearSpeed=linearSpeed;
            if($('#down').hasClass('downOn'))
            {
                currLinearSpeed=-linearSpeed;
            }
            var num = Number($('#speedstate').text()) + 1;
            $('#speedstate').text(num);
        }
        $(this).addClass('speedupOn');
    });
    $("#speedup").on('touchend', function(event) {
      $(this).removeClass('speedupOn');
    });
    $("#speeddown").on('touchstart', function(event) {
        if (linearSpeed > 10) 
        {
            linearSpeed -= 10;
            localStorage.linearSpeed = linearSpeed;
            currLinearSpeed=linearSpeed;
            var num = Number($('#speedstate').text()) - 1;
            $('#speedstate').text(num);
            if($('#down').hasClass('downOn'))
            {
                currLinearSpeed=-linearSpeed;
            }
        }
        $(this).addClass('speeddownOn');
    });
    $("#speeddown").on('touchend', function(event) {
      $(this).removeClass('speeddownOn');
    });
    //电脑端移动控制
    $("#up,#down,#left,#right").bind('mousedown', function(event) {
      event.preventDefault();
    });
    $("#up").bind('mousedown', function(event) {
        $(this).addClass('upOn');
        event.stopPropagation(); // 阻止事件冒泡
        currLinearSpeed = linearSpeed;
        sending.switch1=true;
        setSending(sending);
        $(document).bind('mouseup', function(){
            $('#up').removeClass('upOn');
            currLinearSpeed = 0;
            currAngularSpeed=0;
            sending.switch1=false;
            sending.switch2=false;
            setSending(sending);
            $(document).unbind('mouseup');
        });   
    });
    $("#down").bind('mousedown', function(event) {
        $(this).addClass('downOn');
        event.stopPropagation(); // 阻止事件冒泡
        currLinearSpeed = -linearSpeed;
        sending.switch1=true;
        setSending(sending);
        $(document).bind('mouseup', function(){
            $('#down').removeClass('downOn');
            currLinearSpeed = 0;
            currAngularSpeed=0;
            sending.switch1=false;
            sending.switch2=false;
            setSending(sending);
            $(document).unbind('mouseup');
        });   
    });
    $("#right").bind('mousedown', function(event) {
        $(this).addClass('rightOn');
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = -angularSpeed;
        sending.switch2=true;
        setSending(sending);
        $(document).bind('mouseup', function(){
            $('#right').removeClass('rightOn');
            currLinearSpeed = 0;
            currAngularSpeed=0;
            sending.switch1=false;
            sending.switch2=false;
            setSending(sending);
            $(document).unbind('mouseup');
        });   
    });
    $("#left").bind('mousedown', function(event) {
        $(this).addClass('leftOn');
        event.stopPropagation(); // 阻止事件冒泡
        currAngularSpeed = angularSpeed;
        sending.switch2=true;
        setSending(sending);
        $(document).bind('mouseup', function(){
            $('#left').removeClass('leftOn');
            currLinearSpeed = 0;
            currAngularSpeed=0;
            sending.switch1=false;
            sending.switch2=false;
            setSending(sending);
            $(document).unbind('mouseup');
        });   
    });
    //键盘控制
    var keySwitch={37:true,38:true,39:true,40:true};
    $(document).bind('keydown',function(event){
        for(var name in keySwitch)
        {
            if(name==event.which&&keySwitch[name])
            {
                switch(event.which)
                {
                    case 37:
                        sending.switch2=true;
                        currAngularSpeed=angularSpeed;
                        setSending(sending);
                        break;
                    case 38:
                        sending.switch1=true;
                        currLinearSpeed=linearSpeed;
                        setSending(sending);
                        break;
                    case 39:
                        sending.switch2=true;
                        currAngularSpeed=-angularSpeed;
                        setSending(sending);
                        break;
                    case 40:
                        sending.switch1=true;
                        currLinearSpeed=-linearSpeed;
                        setSending(sending);
                        break;
                }
                keySwitch[name]=false;
            }
        }
    });
    $(document).bind('keyup',function(event){
        for(var name in keySwitch)
        {
            if(name==event.which)
            {
                keySwitch[name]=true;
            }
        }
        switch(event.which)
        {
            case 37:
                sending.switch2=false;
                currAngularSpeed=0;
                setSending(sending);
                break;
            case 38:
                sending.switch1=false;
                currLinearSpeed=0;
                setSending(sending);
                break;
            case 39:
                sending.switch2=false;
                currAngularSpeed=0;
                setSending(sending);
                break;
            case 40:
                sending.switch1=false;
                currLinearSpeed=0;
                setSending(sending);
                break;
        }
    });
});
