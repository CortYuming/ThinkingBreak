/*
  # TODO
  ## A
  通知処理。アプリがバックグラウンドに回った時。
  fix スリープで処理止まる。
  ## B
  リファクタリング。コードをメンテしやすいように
  アプリ裏で動いてる時のためのアラートとバイブレーション。
  ボタン押してから5秒後に時計のみ表示。画面タップでボタン表示。
  履歴機能

  # DONE
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
function nondisplayControlButtona() {
    $('div .controlButton').css('display', 'none');
}

function opacityMinButton(a, b, c) {
    // $('#home .minButton').css('opacity', 0.8);
    $('#home .minButton .shortBreakButton').css('opacity', a);
    $('#home .minButton .longBreakButton').css('opacity', b);
    $('#home .minButton .actionButton').css('opacity', c);
}

var intervalTimer = null;
var setIntervalTimer = null;

var initNumShortBreak = 5;
var initNumBreakLongBreak = 15;
// var initNumBreakLongBreak = 0.1; // debug
var initNumAction = 25;

function resetIntarval() {
    nondisplayControlButtona();
    // displayMinButton();

    clearInterval(setIntervalTimer);
    clearInterval(intervalTimer);

    opacityMinButton(1, 1, 1);
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
        // navigator.notification.alert('test message',
        //                              navigator.notification.beep(),
        //                              'Title', '');
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

function doneAlert(min) {
    var msgTitle = 'TIME IS UP';
    var message = min + ' minuites expired';
    if (min === 1) {
        message = min + ' minuite expired';
    }

    // PhoneGap only (native func)
    // try {
    //     navigator.notification.alert(message, null, msgTitle, '');
    //  } catch (e) {
    //      alert(msgTitle + ': ' + message);
    // }

    $('#dialogWindow h1').text(msgTitle);
    $('#dialogWindow p.message').text(message);
    $('#dialogButtone a').click();
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
    var angle = null;
    // var speed = 300 / initSetMinTime;
    var speed = 500 / initSetMinTime;

    setIntervalTimer = setInterval(function() {
        // var isRotation = 1;
        // var nowTime = new Date().getTime();
        // var elapsedTimeSec = Math.floor((initTime.getTime() - nowTime) / speed);
        // var angle = (initSetMinTime * 60 + elapsedTimeSec) * 6 *
        //     isRotation;
        // if (elapsedTimeSec <= initSetMinTime * -1)
        //     clearInterval(setIntervalTimer);
        nowTime = new Date().getTime();
        elapsedTimeSec = Math.floor((initTime.getTime() - nowTime) / speed);

        angle = (elapsedTimeSec) * (6 * isRotation);

        if (elapsedTimeSec <= initSetMinTime * -1) {
            clearInterval(setIntervalTimer);
        }

        displayTimer(timer, baseImage, minuteHandImage, gearImage, angle);
    }, speed);

    // initTime = new Date();

     intervalTimer = setInterval(function() {
        isRotation = -1;
        nowTime = new Date().getTime();
        elapsedTimeSec = Math.floor((initTime.getTime() - nowTime) / 1000);

        angle = (initSetMinTime * 60 + elapsedTimeSec) * 6 / 60 *
            isRotation;

        if (elapsedTimeSec <= initSetMinTime * 60 * -1) {

            if (initSetMinTime !== 0) {
                doneBeep();
                // doneVibration();
                doneAlert(initSetMinTime);
            }
            resetIntarval();
        }
        displayTimer(timer, baseImage, minuteHandImage, gearImage, angle);
    }, 1000);
}

function startShortBreakTimer() {

    resetIntarval();
    // clearInterval(intervalTimer);
    // onTimer(initNumShortBreak);
    onTimer(localStorage.shortBreak);
    opacityMinButton(0.9, 0.4, 0.4);

    // hideMinButton(); // todo
}

function startLongBreakTimer() {
    resetIntarval();
    // onTimer(initNumBreakLongBreak);
    onTimer(localStorage.longBreak);
    opacityMinButton(0.4, 0.9, 0.4);
}

function startActTimer() {
    resetIntarval();
    // onTimer(initNumAction);
    onTimer(localStorage.action);
    opacityMinButton(0.4, 0.4, 0.9);
}

function stopTimer() {
    resetIntarval();
    onTimer(0);
}


$(document).ready(function() {
    $('#home').ready(loadHomeVal);
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
