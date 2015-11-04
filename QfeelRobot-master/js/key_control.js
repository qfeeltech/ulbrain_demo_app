var localStorage = window.localStorage;
var linear = localStorage.linearSpeed;
var angular = 10;;
var single = true;
var up = false;
var down = false;
var left = false;
var right = false;
var up_left = false;
var up_right = false;
var down_left = false;
var down_right = false;

var URL = '/';

function linearForward() {
    if (up && single) {
       	console.log('up');
       	$.ajax({
					url: URL + 'control/move?sessionID=' + localStorage.sessionID + '&linear=' + localStorage.linearSpeed + '&angular=0&timeout=100',
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
					
				});
		
        setTimeout(linearForward, 50);
    }
}

function linearBackward() { //直线后退
    if (down && single) {
       console.log('down');
       $.ajax({
					url: URL +'control/move?sessionID=' + localStorage.sessionID + '&linear=' + (-1)*localStorage.linearSpeed + '&angular=0&timeout=100',
					type: 'GET',
					//dataType: 'json',
					data: "",
				})
				.done(function() {
					console.log("Backward success");
				})
				.fail(function() {
					console.log("error");
				})
				.always(function(data) {
					
				});
			
		
       setTimeout(linearBackward, 50);
    }

}

function angularLeft() { //向左转
    if (left && single) {
      	console.log('left');
      	$.ajax({
					url: URL + 'control/move?sessionID=' + localStorage.sessionID + '&linear=0&angular=10&timeout=100',
					type: 'GET',
					//dataType: 'json',
					data: "",
				})
				.done(function() {
					console.log("AngularLeft success");
				})
				.fail(function() {
					console.log("error");
				})
				.always(function(data) {
					
				});
			
        setTimeout(angularLeft, 50);
    }

}

function angularRight() { //向右转
    if (right && single) {
        console.log('right');
        $.ajax({
					url: URL +'control/move?sessionID=' + localStorage.sessionID + '&linear=0&angular=-10&timeout=100',
					type: 'GET',
					//dataType: 'json',
					data: "",
				})
				.done(function() {
					console.log("AngularRight success");
				})
				.fail(function() {
					console.log("error");
				})
				.always(function(data) {
					
				});
        setTimeout(angularRight, 50);
    }
}

function up_leftForward(){
	if (up && left) {
		console.log('up+left');
		$.ajax({
					url: URL +'control/move?sessionID=' + localStorage.sessionID + '&linear='+localStorage.linearSpeed+'&angular=10&timeout=100',
					type: 'GET',
					//dataType: 'json',
					data: "",
				})
				.done(function() {
					console.log("AngularRight success");
				})
				.fail(function() {
					console.log("error");
				})
				.always(function(data) {
					
				});
		setTimeout(up_leftForward, 50);
	}
}

function up_rightForward(){
	if (up && right) {
		console.log('up+right');
		$.ajax({
					url: URL +'control/move?sessionID=' + localStorage.sessionID + '&linear='+localStorage.linearSpeed+'&angular=-10&timeout=100',
					type: 'GET',
					//dataType: 'json',
					data: "",
				})
				.done(function() {
					console.log("AngularRight success");
				})
				.fail(function() {
					console.log("error");
				})
				.always(function(data) {
					
				});
		setTimeout(up_rightForward, 50);
	}
}

function down_leftBackward(){
	if (down && left) {
		console.log('down+left');
		$.ajax({
					url: URL +'control/move?sessionID=' + localStorage.sessionID + '&linear='+(-1)*localStorage.linearSpeed+'&angular=-10&timeout=100',
					type: 'GET',
					//dataType: 'json',
					data: "",
				})
				.done(function() {
					console.log("AngularRight success");
				})
				.fail(function() {
					console.log("error");
				})
				.always(function(data) {
					
				});
		setTimeout(down_leftBackward, 50);
	}
}

function down_rightBackward(){
	if (down && right) {
		console.log('down+right');
		$.ajax({
					url: URL +'control/move?sessionID=' + localStorage.sessionID + '&linear='+(-1)*localStorage.linearSpeed+'&angular=10&timeout=100',
					type: 'GET',
					//dataType: 'json',
					data: "",
				})
				.done(function() {
					console.log("AngularRight success");
				})
				.fail(function() {
					console.log("error");
				})
				.always(function(data) {
					
				});
		setTimeout(down_rightBackward, 50);
	}
}

function stop() { //停止
   	console.log('stop');
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

//按下按键  start
function upPressed(){
	
	up = true;
	linearForward();
}

function downPressed(){
	
	down = true;
	linearBackward();
}

function leftPressed(){
	
	left = true;
	angularLeft();
}

function rightPressed(){
	
	right = true;
	angularRight();
}

function up_leftPressed(){
	up = true;
	left = true;
	single = false;    //不允许单键
	up_leftForward();
}
function up_rightPressed(){
	up = true;
	right = true;
	single = false;   //不允许单键
	up_rightForward();
}
function down_leftPressed(){
	down = true;
	left = true;
	single = false;    //不允许单键
	down_leftBackward();
}
function down_rightPressed(){
	down = true;
	right = true;
	single = false;    //不允许单键
	down_rightBackward();
}
//按下按键  stop

//松开按键  start
function upReleased(){
	
	up = false;
	stop();
}

function downReleased(){
	
	down = false;
	stop();
}

function leftReleased(){
	
	left = false;
	stop();
}

function rightReleased(){
	
	right = false;
	stop();
}
function up_leftReleased(){
	up = false;
	left = false;
	single = true;    //允许单键
	stop();
}
function up_rightReleased(){
	up = false;
	right = false;
	single = true;     //允许单键
	stop();
}
function down_leftReleased(){
	down = false;
	left = false;
	single = true;    //允许单键
	stop();
}
function down_rightReleased(){
	down = false;
	right = false;
	single = true;    //允许单键
	stop();
}
//松开按键  stop
//按键监听  start
var listener = new window.keypress.Listener();

listener.register_combo({
    "keys"              : 'up',
    "on_keydown"        : upPressed,
    "on_keyup"          : upReleased,
    "on_release"        : null,
    "this"              : undefined,
    "prevent_default"   : true,
    "prevent_repeat"    : true,
    "is_unordered"      : true,
    "is_exclusive"      : false,
});
listener.register_combo({
    "keys"              : 'down',
    "on_keydown"        : downPressed,
    "on_keyup"          : downReleased,
    "on_release"        : null,
    "this"              : undefined,
    "prevent_default"   : true,
    "prevent_repeat"    : true,
    "is_unordered"      : true,
    "is_exclusive"      : false,
});
listener.register_combo({
    "keys"              : 'left',
    "on_keydown"        : leftPressed,
    "on_keyup"          : leftReleased,
    "on_release"        : null,
    "this"              : undefined,
    "prevent_default"   : true,
    "prevent_repeat"    : true,
    "is_unordered"      : true,
    "is_exclusive"      : false,
});
listener.register_combo({
    "keys"              : 'right',
    "on_keydown"        : rightPressed,
    "on_keyup"          : rightReleased,
    "on_release"        : null,
    "this"              : undefined,
    "prevent_default"   : true,
    "prevent_repeat"    : true,
    "is_unordered"      : true,
    "is_exclusive"      : false,
});
listener.register_combo({
    "keys"              : 'up left',
    "on_keydown"        : up_leftPressed,
    "on_keyup"          : up_leftReleased,
    "on_release"        : null,
    "this"              : undefined,
    "prevent_default"   : true,
    "prevent_repeat"    : true,
    "is_unordered"      : true,
    "is_exclusive"      : false,
    "is_solitary"		: true,
});
listener.register_combo({
    "keys"              : 'up right',
    "on_keydown"        : up_rightPressed,
    "on_keyup"          : up_rightReleased,
    "on_release"        : null,
    "this"              : undefined,
    "prevent_default"   : true,
    "prevent_repeat"    : true,
    "is_unordered"      : true,
    "is_exclusive"      : false,
    "is_solitary"		: true,
});
listener.register_combo({
    "keys"              : 'down left',
    "on_keydown"        : down_leftPressed,
    "on_keyup"          : down_leftReleased,
    "on_release"        : null,
    "this"              : undefined,
    "prevent_default"   : true,
    "prevent_repeat"    : true,
    "is_unordered"      : true,
    "is_exclusive"      : false,
    "is_solitary"		: true,
});
listener.register_combo({
    "keys"              : 'down right',
    "on_keydown"        : down_rightPressed,
    "on_keyup"          : down_rightReleased,
    "on_release"        : null,
    "this"              : undefined,
    "prevent_default"   : true,
    "prevent_repeat"    : true,
    "is_unordered"      : true,
    "is_exclusive"      : false,
    "is_solitary"		: true,
});


//按键监听  stop
