/* global localStorage, document */
(() => {
    'use strict';

    var SHADERS_PREVIEW_URL = 'https://www.shadertoy.com/media/shaders/{id}.jpg',

        SHADER_URL = 'https://www.shadertoy.com/view/{id}',

        SHADER_PREVIEW_TEMPLATE = '<a href="{url}"></a>',

        shadersListElement = document.getElementById('shaders-list'),

        notificationsInput = document.getElementById('notificationsInput'),

        shaders = [];

    function Shader(id) {
        this.id = id;
        this.create();
        this.append();
    }

    Shader.prototype.create = function() {
        this.element = document.createElement('li');
        this.element.innerHTML = SHADER_PREVIEW_TEMPLATE
            .replace(/\{url\}/g, SHADER_URL)
            .replace(/\{id\}/g, this.id);

        this.img = document.createElement('img');
        this.img.src = SHADERS_PREVIEW_URL.replace('{id}', this.id);
        this.img.onerror = function() {
            this.img.parentElement.innerHTML = 'no preview';
        };

        this.element.querySelector('a').appendChild(this.img);
    };

    Shader.prototype.append = function() {
        shadersListElement.appendChild(this.element);
    };

    function getShaders() {
        var shadersList = localStorage.getItem('shaders');

        try {
            shadersListElement.innerHTML = '';

            (JSON.parse(shadersList) || [])
                .forEach(id => {
                    shaders.push(new Shader(id));
                });

            if (chrome) {
                chrome.browserAction.setBadgeText({text: ''});
            }

            if (shaders.length) {
                localStorage.setItem('lastSeenShader', shaders[0].id);
            }
        } catch (ignore) {
        }
    }

    function onListClick(e) {
        if (e.target.tagName === 'IMG') {
            chrome.tabs.create({url: e.target.parentElement.href});
        }

        return false;
    }

    function onNotificationInputChange(event) {
        if (event.target.checked) {
            localStorage.setItem('notifications', event.target.checked);
        } else {
            localStorage.removeItem('notifications');
        }
    }

    function bindEvents() {
        shadersListElement.addEventListener('click', onListClick);
        notificationsInput.addEventListener('click', onNotificationInputChange);
    }

    function initializeElements() {
        notificationsInput.checked = !!localStorage.getItem('notifications');
    }

    bindEvents();
    initializeElements();
    getShaders();
})();
