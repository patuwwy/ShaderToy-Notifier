/* global localStorage, Notification, Promise, fetch */

(function shaderNotifierBackgroundProcess() {
    'use strict';

    var NEWEST_URL = 'https://www.shadertoy.com/results?query=&sort=newest&filter=',

        latestShaders = [],

        lastSeenShader = null;

    function updateBadgeCount(badgeText) {
        chrome.browserAction.setBadgeBackgroundColor({color: 'red'});
        chrome.browserAction.setBadgeText({text: badgeText});
    }

    function notify(data) {
        var notification = new Notification(data.id, {
            icon: '../../icons/icon_active_128.png',
            body: data.body,
            image: data.icon
        });

        if (data.id) {
            notification.onclick = function() {
                updateBadgeCount(0);
                lastSeenShader = latestShaders[0];
                localStorage.setItem('lastSeenShader', lastSeenShader);
                window.open('https://shadertoy.com/view/' + data.id);
            };
        }
    }

    function parseText(text) {
        return new Promise(function(resolve) {
            var fragment = text.match(/var gShaderIDs=\[".*"]/)[0].replace('var gShaderIDs=', ''),
                jsonData = {};

            try {
                jsonData = JSON.parse(fragment);
                resolve(jsonData);
            } catch (ignore) {
            }
        });
    }

    function compareData(data) {
        return new Promise((resolve) => {
            var lastCheckData = localStorage.getItem('shaders'),
                lastStoredShader = localStorage.getItem('lastSeenShader'),
                newsCount = null;

            if (data) {
                latestShaders = data;
                localStorage.setItem('shaders', JSON.stringify(data));
            }

            if (lastStoredShader) {
                lastCheckData = JSON.parse(lastCheckData);

                if (lastStoredShader) {
                    newsCount = !~data.indexOf(lastStoredShader) ? '16+' : (data.indexOf(lastStoredShader) || '').toString();
                }

                if (lastCheckData[0] !== data[0]) {
                    resolve(data[0]);
                }
            } else {
                lastStoredShader = data[0];
                lastStoredShader = localStorage.setItem('lastSeenShader', data[0]);
                resolve(data[0]);
                newsCount = 'Hi !';
            }

            updateBadgeCount(newsCount);
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

    chrome.alarms.onAlarm.addListener(function() {
        getData();
    });

    chrome.alarms.create('Fetch', {periodInMinutes: 1});

    getData();
}());
