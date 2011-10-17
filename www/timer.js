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


function initMinute() {
    // init
    if (localStorage.shortBreak === undefined) {
        localStorage.shortBreak = $('#shortBreak').val();
    }
    if (localStorage.longBreak === undefined) {
        localStorage.longBreak = $('#longBreak').val();
    }
    if (localStorage.action === undefined) {
        localStorage.action = $('#action').val();
    }
}

function saveSettings() {
    localStorage.shortBreak = $('#shortBreak').val();
    localStorage.longBreak = $('#longBreak').val();
    localStorage.action = $('#action').val();
}

function loadSettings() {
    // Slider
    $('#shortBreak').val(localStorage.shortBreak).slider('refresh');
    $('#longBreak').val(localStorage.longBreak).slider('refresh');
    $('#action').val(localStorage.action).slider('refresh');
}

function controlStopButtonVisible() {
    $('div .controlStopButton').removeAttr('style');
}
function controlStopButtonNonVisible() {
    $('div .controlStopButton').css('display', 'none');
}

var minuiteButton = {
    visible:function() {
        $('#home .minButton').removeAttr('style');
    },
    nonvisible:function() {
        $('#home .minButton').css('display', 'none');
    }                      
};


var timeoutBeep;
var timeoutAlert;
var intervalTimer;
var setIntervalTimer;

var initSetMinTime = 0;

var onOffLight = {
    visible:function() {
        $('#onOffLight').removeAttr('style');
    },
    nonvisible:function() {
        $('#onOffLight').css('display', 'none');
    }                      
};

function resetIntarval() {
    onOffLight.nonvisible();

    minuiteButton.visible();

    controlStopButtonNonVisible();

    clearInterval(setIntervalTimer);
    clearInterval(intervalTimer);


    try {
        plugins.localNotification.cancelAll();
    } catch(e) {
        // nothing function for Web Browser
    }


    clearTimeout(timeoutBeep);
}

// function resetAlert() {
//     clearTimeout(timeoutAlert);
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

var statusThinkingOrBreak = '';

function alertMessage() {
    var min = initSetMinTime;
    var status = statusThinkingOrBreak;
    var message = status + ' time expired: ' + min + ' min';
    return message;   
}

// function doneAlert() {
//     var msgTitle = 'ThinkingBreak';
//     var message = alertMessage();

//     try {
//         // PhoneGap only (native func)
//         navigator.notification.alert(message, null, msgTitle, '');
//     } catch (e) {
//         // web browser
//         $('#dialogWindow h1').text(msgTitle);
//         $('#dialogWindow p.message').text(message);
//         $('#dialogButtone a').click();
//      }
// }

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
    controlStopButtonVisible();

    var startTime = new Date();
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


    if (initSetMinTime !==0) {
        // timeoutAlert = setTimeout(doneAlert,
        //                           initSetMinTime * 60 * 1000 - 1000);
        timeoutBeep = setTimeout(doneBeep,
                                 initSetMinTime * 60 * 1000 - 1000);
    }
    
    intervalTimer = setInterval(function() {
        isRotation = -1;
        nowTime = new Date().getTime();
        elapsedTimeSec = Math.floor((initTime.getTime() - nowTime) / 1000);

        angle = (initSetMinTime * 60 + elapsedTimeSec) * 6 / 60 *
            isRotation;
        if (angle * isRotation < 0) {
            angle = 0;
        }

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
	    d = d.getTime() + initSetMinTime * 60 * 1000 - 2000;

        var message = alertMessage();

	    d = new Date(d);

        try {
	        plugins.localNotification.add({
		        date: d,
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



var checkBeforeStatus = {
    visible:function(cls) {
        $('#home .minButton a img').attr('src', '');
        $('#home .minButton ' + cls + ' img').attr('src', 'img/before_on_off_light.png');
    },
    nonvisible:function() {
        $('#home .minButton a img').attr('src', '');
    }
    
};


function startShortBreakTimer() {
    checkBeforeStatus.visible('a.shortBreakButton');

    initSetMinTime = localStorage.shortBreak;
    alertTime = initSetMinTime;

    resetIntarval();
    // resetAlert();
    onTimer(initSetMinTime);
    onDeviceReady();

    minuiteButton.nonvisible();
    onOffLight.visible();
}

function startLongBreakTimer() {
    checkBeforeStatus.visible('a.longBreakButton');

    initSetMinTime = localStorage.longBreak;
    alertTime = initSetMinTime;

    resetIntarval();
    // resetAlert();
    onTimer(initSetMinTime);
    onDeviceReady();

    minuiteButton.nonvisible();
    onOffLight.visible();
}

function startActTimer() {
    checkBeforeStatus.visible('a.actionButton');

    initSetMinTime = localStorage.action;
    alertTime = initSetMinTime;

    resetIntarval();
    // resetAlert();
    onTimer(initSetMinTime);
    onDeviceReady();

    minuiteButton.nonvisible();
    onOffLight.visible();
}

function stopTimer() {
    alertTime = 0;

    resetIntarval();
    // resetAlert();
    onTimer(0);
}


$(document).ready(function() {
    $('#home').ready(onBodyLoad);
    $('#home').ready(initMinute);
    // $('#home').live('pagebeforeshow', function(e, ui) {
    //     initMinute();
    // });
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


