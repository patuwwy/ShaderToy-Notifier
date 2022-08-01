/* global localStorage, Notification, fetch */

(() => {
    'use strict';

    var NEWEST_URL = 'https://www.shadertoy.com/results?query=&sort=newest&filter=',

        latestShaders = [];

    function updateBadgeCount(badgeText) {
        if (window.chrome) {
            chrome.browserAction.setBadgeBackgroundColor({color: 'red'});
            chrome.browserAction.setBadgeText({text: badgeText});
        }
    }

    function notify(data) {
        var notification = new Notification(data.id, {
            icon: '../../icons/icon_active_128.png',
            body: data.body,
            image: data.icon
        });

        if (data.id) {
            notification.onclick = () => {
                localStorage.setItem('lastSeenShader', latestShaders[0]);
                window.open('https://shadertoy.com/view/' + data.id);
                updateBadgeCount(0);
            };
        }
    }

    function parseText(text) {
        return new Promise((resolve) => {
            var shaders = text.match(/var gShaders=\[[^]*?(?=var gUseScreenshots)/gm)[0].match(/(?<=info":{"id":")[a-zA-Z0-9]{5,}(?=")/g)

            try {
                resolve(shaders);
            } catch (ignore) {
            }
        });
    }

    function compareData(data) {
        return new Promise((resolve, reject) => {
            var lastCheckData = JSON.parse(localStorage.getItem('shaders')),
                lastStoredShader = localStorage.getItem('lastSeenShader'),
                newsCount = null;

            if (!data) {
                reject(new Error('no data'));
            }

            latestShaders = data;
            localStorage.setItem('shaders', JSON.stringify(data));

            if (lastCheckData) {
                if (lastStoredShader) {
                    newsCount = !~data.indexOf(lastStoredShader) ? '16+' : (data.indexOf(lastStoredShader) || '').toString();
                }

                if (lastCheckData[0] !== data[0]) {
                    resolve(data[0]);
                }
            } else {
                lastStoredShader = latestShaders[0];
                localStorage.setItem('lastSeenShader', lastStoredShader);

                localStorage.setItem('notifications', true);

                newsCount = 'Hi !';
                resolve(latestShaders[0]);
            }

            updateBadgeCount(newsCount);
        });
    }

    function notifyUser(shaderId) {
        var notificationsEnabled = localStorage.getItem('notifications');

        if (shaderId && notificationsEnabled) {
            notify({
                id: shaderId,
                icon: 'https://www.shadertoy.com/media/shaders/' + shaderId + '.jpg',
                body: 'New shader added'
            });
        }
    }

    function getData() {
        if (navigator.connection && navigator.connection.type === 'none') {
            return;
        }

        fetch(NEWEST_URL)
            .then(response => response.text())
            .then(parseText)
            .then(compareData)
            .then(notifyUser);
    }

    chrome.alarms.onAlarm.addListener(function() {
        getData();
    });

    chrome.alarms.create('Fetch', {periodInMinutes: 1});

    getData();
})();
