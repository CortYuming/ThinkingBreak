/*
  # TODO
  アラート通知にLightOn表示
  B アラート音をシステムサウンドで統一する。
  B タイマー停止時にも回転アニメーション
  B Javascript リファクタリング。メンテしやすく。
  C バイブレーション機能
  C ボタン押してから5秒後に時計のみ表示。画面タップでボタン表示。
  B 次期メジャーアップデートで、履歴機能

  # DONE
  A 終了時アラートsetTimeOutでやる
  たまに出る画面下の白線を取る
  fix スリープで処理止まる。
  通知処理。アプリがバックグラウンドに回った時。
  jislint でエラー出ないようにした
  画面ずれ修正
  アイコン作成。
  設定を反映
  ##メインタイマープログラム
  終了時アラートjs
  ストップボタン
  gitで管理
  画像貼り付けで応急処置。初期起動時 Canvas描画遅れる。
  設定画面デザイン
  メイン画面デザイン。
*/


function loadHomeVal() {
    // 関数別にするとlocalStorage読まなくなる？
    // Slider
    if (localStorage.shortBreak === undefined) {
        localStorage.shortBreak = $('#home a.shortBreakButton').text();
    }
    $('#home a.shortBreakButton').text(localStorage.shortBreak);

    if (localStorage.longBreak === undefined) {
        localStorage.longBreak = $('#home a.longBreakButton').text();
    }
    $('#home a.longBreakButton').text(localStorage.longBreak);

    if (localStorage.action === undefined) {
        localStorage.action = $('#home a.actionButton').text();
    }
    $('#home a.actionButton').text(localStorage.action);
}

function saveSettings() {
    localStorage.shortBreak = $('#shortBreak').val();
    localStorage.longBreak = $('#longBreak').val();
    localStorage.action = $('#action').val();
    // loadHomeVal();
}

function loadSettings() {
    // Slider
    $('#shortBreak').val(localStorage.shortBreak).slider('refresh');
    $('#longBreak').val(localStorage.longBreak).slider('refresh');
    $('#action').val(localStorage.action).slider('refresh');

    // CheckBox
    // if (localStorage.isCheckBoxAlert == undefined)
    //     localStorage.isCheckBoxAlert = false;
    // alert($('#CheckBoxAlertwindow').attr('checked'));

    // $('#CheckBoxAlertwindow').attr('checked', localStorage.isCheckBoxAlert)
    //     .checkboxradio('refresh');

    // if (localStorage.isCheckBoxBeep == undefined)
    //     localStorage.isCheckBoxBeep = true;
    // $('#CheckBoxBeepsound').attr('checked', localStorage.isCheckBoxBeep)
    //     .checkboxradio('refresh');
}

function displayControlButton() {
    $('div .controlButton').removeAttr('style');
}
function nondisplayControlButton() {
    $('div .controlButton').css('display', 'none');
}

function opacityMinButton(a, b, c) {
    // $('#home .minButton').css('opacity', 0.8);
    $('#home .minButton .shortBreakButton').css('opacity', a);
    $('#home .minButton .longBreakButton').css('opacity', b);
    $('#home .minButton .actionButton').css('opacity', c);
}

var timeoutBeep = null;
var timeoutAlert = null;
var intervalTimer = null;
var setIntervalTimer = null;

var initNumShortBreak = 5;
var initNumBreakLongBreak = 15;
// var initNumBreakLongBreak = 0.1; // debug
var initNumAction = 25;

var initSetMinTime = 0;


function resetIntarval() {
    nondisplayControlButton();
    // displayMinButton();

    clearInterval(setIntervalTimer);
    clearInterval(intervalTimer);

    opacityMinButton(1, 1, 1);

    try {
        plugins.localNotification.cancelAll();
    } catch(e) {
        // nothing function for Web Browser
    }


    clearTimeout(timeoutBeep);
    clearTimeout(timeoutAlert);
}

// todo
// function hideMinButton() {
//    var hideButSet = setTimeout("$('#home .minButton a').hide()", 3000);
// }


function doneBeep() {
    // http://www.flasherdot.org/4_SE.htm
    // Bell (small) - (MP3, 58.7 kb)
    try {
        navigator.notification.beep();
    } catch (e) {
        var audioBeep = new Audio('beep.wav');
        audioBeep.play();
    }
}

// function doneVibration() {
//     try {
//         navigator.notification.virate();
//     } catch (e) {
//         // nothing function for Web Browser
//     }
// }

function doneAlert() {
    var min = initSetMinTime;
    var msgTitle = 'PomoMinutes';
    var message = min + ' minuites expired';
    if (min === 1) {
        message = min + ' minuite expired';
    }

    // try {
    //     // PhoneGap only (native func)
    //     navigator.notification.alert(message, null, msgTitle, '');
    //  } catch (e) {

    $('#dialogWindow h1').text(msgTitle);
    $('#dialogWindow p.message').text(message);
    $('#dialogButtone a').click();
    // }
}

// function displayTimer(docID, baseImage, minuteHandImage, angle) {
function displayTimer(docID, baseImage, minuteHandImage, gearImage, angle) {
    var xPos = 440 / 2;
    var yPos = 440 / 2;
    var context = docID.getContext('2d');

    context.clearRect(0, 0, docID.width, docID.height);
    context.save();
    context.translate(xPos, yPos);

    context.save();
    context.rotate(angle * Math.PI / 180); // debag
    context.drawImage(baseImage, -xPos, -yPos);
    context.restore();

    context.save();
    context.rotate(angle * Math.PI / 180 * 60);
    context.drawImage(gearImage, -xPos, -yPos);
    context.restore();

    context.drawImage(minuteHandImage, -xPos, -yPos);
    context.restore();


}



function onTimer(initSetMinTime) {
    displayControlButton();
    // $('div .controlButton').removeAttr('style');

    var startTime = new Date();
    // var timer = document.getElementById('timer');
    var timer = $('#timer').get(0);

    var baseImage = new Image();
    baseImage.src = 'img/watch_base.png';
    var minuteHandImage = new Image();
    minuteHandImage.src = 'img/watch_minute_hand.png';
    var gearImage = new Image();
    gearImage.src = 'img/watch_gear.png';

    var initTime = new Date();
    var isRotation = 1;
    var nowTime = null;
    var elapsedTimeSec = null;
    var angle = 0;
    // var speed = 25;
    // var speed = Math.floor(500 / initSetMinTime);

    var speed = 1000 / initSetMinTime;

    setIntervalTimer = setInterval(function() {
        nowTime = new Date().getTime();
        elapsedTimeSec = Math.floor((initTime.getTime() - nowTime) / speed);

        angle = (elapsedTimeSec) * (6 * isRotation);

        if (elapsedTimeSec <= initSetMinTime * -1) {
            clearInterval(setIntervalTimer);
        }

        displayTimer(timer, baseImage, minuteHandImage, gearImage, angle);
    }, speed);

    // var speed = 30;
    
    // setIntervalTimer = setInterval(function() {
    //     isRotation = 1;
    //     nowTime = new Date().getTime();
    //     elapsedTimeSec = Math.floor((initTime.getTime() - nowTime) / speed);

    //     angle = (elapsedTimeSec) * (6 * isRotation);

    //     if (elapsedTimeSec <= initSetMinTime * -1) {
    //         clearInterval(setIntervalTimer);
    //     }

    //     displayTimer(timer, baseImage, minuteHandImage, gearImage, angle);
    // }, speed);

    if (initSetMinTime !==0) {
        timeoutBeep = setTimeout(doneBeep,
                                 initSetMinTime * 60 * 1000 - 1000);
        timeoutAlert = setTimeout(doneAlert,
                                  initSetMinTime * 60 * 1000 - 1000);
    }
    
    intervalTimer = setInterval(function() {
        isRotation = -1;
        nowTime = new Date().getTime();
        elapsedTimeSec = Math.floor((initTime.getTime() - nowTime) / 1000);

        angle = (initSetMinTime * 60 + elapsedTimeSec) * 6 / 60 *
            isRotation;

        if (elapsedTimeSec <= initSetMinTime * 60 * -1) {

            resetIntarval();
        }
        displayTimer(timer, baseImage, minuteHandImage, gearImage, angle);
    }, 1000);
}


// localNotification
/* When this function is called, PhoneGap has been initialized and is ready to roll */

var alertTime = 0;

function onDeviceReady() {
    if (alertTime !== 0) {

	    var d = new Date();
	    // d = d.getTime() + 60*1000; //60 seconds from now
	    d = d.getTime() + initSetMinTime * 60 * 1000 - 2000;
        // d = d.getTime() + 5 * 1000;

        var min = initSetMinTime;
        var message = min + ' minuites expired';
        if (min === 1) {
            message = min + ' minuite expired';
        }
        
	    d = new Date(d);

        try {
	        plugins.localNotification.add({
		        date: d,
		        // message: 'time expired',
		        message: message,
		        hasAction: true,
		        // hasAction: false,
		        badge: 0,
		        id: '123'
	        });
        } catch(e) {
        // nothing function for Web Browser
        }

    }
}
function onBodyLoad()
{
	document.addEventListener("deviceready",onDeviceReady,false);
}


function startShortBreakTimer() {
    initSetMinTime = localStorage.shortBreak;
    alertTime = initSetMinTime;

    resetIntarval();
    onTimer(initSetMinTime);
    onDeviceReady();

    opacityMinButton(0.9, 0.4, 0.4);
    $('#lightSwitchOn').css('display', 'none');
}

function startLongBreakTimer() {
    initSetMinTime = localStorage.longBreak;
    alertTime = initSetMinTime;

    resetIntarval();
    onTimer(initSetMinTime);
    onDeviceReady();

    opacityMinButton(0.4, 0.9, 0.4);
    $('#lightSwitchOn').css('display', 'none');
}

function startActTimer() {
    initSetMinTime = localStorage.action;
    alertTime = initSetMinTime;

    resetIntarval();
    onTimer(initSetMinTime);
    onDeviceReady();

    // alertTime = localStorage.action;
    // onBodyLoad();

    // resetIntarval();
    // // onTimer(initNumAction);
    // onTimer(localStorage.action);
    opacityMinButton(0.4, 0.4, 0.9);
    // $('#lightSwitchOn').css('display', 'block');
    $('#lightSwitchOn').removeAttr('style');
}

function stopTimer() {
    alertTime = 0;

    resetIntarval();
    onTimer(0);
}


$(document).ready(function() {
    $('#home').ready(loadHomeVal);
    $('#home').ready(onBodyLoad);
    $('#home').live('pagebeforeshow', function(e, ui) {
        loadHomeVal();
    });
    $('#settings').live('pagebeforeshow', function(e, ui) {
        loadSettings();
    });

    $('#home a.shortBreakButton').click(startShortBreakTimer);
    $('#home a.longBreakButton').click(startLongBreakTimer);
    $('#home a.actionButton').click(startActTimer);
    $('#home a.stopButton').click(stopTimer);

    $('#dialogWindow a.shortBreakButton').click(startShortBreakTimer);
    $('#dialogWindow a.longBreakButton').click(startLongBreakTimer);
    $('#dialogWindow a.actionButton').click(startActTimer);

    $('#settings .saveButton').click(saveSettings);
});


