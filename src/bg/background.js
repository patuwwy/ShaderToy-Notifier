/* global localStorage, Notification */

(function shaderNotifierBackgroundProcess() {
    'use strict';

    var NEWEST_URL = 'https://www.shadertoy.com/results?query=&sort=newest&filter=';

    function notify(data) {
        var notification = new Notification(data.id, {
            icon: data.icon,
            body: data.body
        });

        notification.onclick = function() {
            window.open('https://shadertoy.com/view/' + data.id);
        };
    }

    function parseText(text) {
        return new Promise(function(resolve, reject) {
            var fragment = text.match(/var gShaderIDs=\[".*"]/)[0].replace('var gShaderIDs=', ''),
                jsonData = {};

            try {
                jsonData = JSON.parse(fragment);
                resolve(jsonData);
            } catch (e) {
                reject(e);
            }
        });
    }

    function compareData(data) {
        return new Promise((resolve, reject) => {
            var lastCheckData = localStorage.getItem('shaders');

            if (data) {
                localStorage.setItem('shaders', JSON.stringify(data));
            }

            if (lastCheckData) {
                lastCheckData = JSON.parse(lastCheckData);

                /*
                if (newsCount > -1) {
                    chrome.browserAction.setBadgeText({text: newsCount});
                }
                */

                // chrome.browserAction.setBadgeText({text: 0});

                if (lastCheckData[0] == data[0]) {
                    resolve(null);
                    resolve(data[0]);
                } else {
                    resolve(data[0]);
                }
            } else {
                resolve(null);
            }

        });
    }

    function notifyUser(shaderId) {
        if (shaderId) {
            notify({
                id: shaderId,
                icon: 'https://www.shadertoy.com/media/shaders/' + shaderId + '.jpg',
                body: 'New shader added'
            });
        }
    }

    function onError(e) {
        notify({
            id: null,
            icon: '?',
            body: e
        });
    }

    function getData() {
        fetch(NEWEST_URL)
            .then(response => response.text())
            .then(parseText)
            .then(compareData)
            .then(notifyUser)
            .catch(onError);
    }

    chrome.alarms.onAlarm.addListener(function(alarm){
        getData();
    });

    chrome.alarms.create("Start", {periodInMinutes:1});

}());
