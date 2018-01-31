/* global localStorage, document */
(function shaderNotifierPopup() {
    'use strict';

    var SHADERS_PREVIEW_URL = 'https://www.shadertoy.com/media/shaders/{id}.jpg',

        SHADER_URL = 'https://www.shadertoy.com/view/{id}',

        SHADER_PREVIEW_TEMPLATE = '<a href="{url}"><img title="{id}" src="{img}"/></a>',

        shadersListElement = document.getElementById('shaders-list');

    function Shader(id) {
        this.id = id;
        this.create();
        this.append();
        this.getMeta();
    }

    Shader.prototype.getMeta = function() {

    };

    Shader.prototype.create = function() {
        this.element = document.createElement('li');
        this.element.innerHTML = SHADER_PREVIEW_TEMPLATE
            .replace('{img}', SHADERS_PREVIEW_URL)
            .replace(/\{url\}/g, SHADER_URL)
            .replace(/\{id\}/g, this.id);
    };

    Shader.prototype.append = function() {
        shadersListElement.appendChild(this.element);
    };

    function getShaders() {
        var shadersList = localStorage.getItem('shaders'),
            shaders = [];

        try {
            shaders = JSON.parse(shadersList);

            shaders = shaders || [];

            shadersListElement.innerHTML = '';

            shaders.forEach(function(id) {
                return new Shader(id);
            });
        } catch (ignore) {}
    }

    function onListClick(e) {
        if (e.target.tagName === 'IMG') {
            chrome.tabs.create({url: e.target.parentElement.href});
        }
        return false;
    }

    function bindEvents() {
        shadersListElement.addEventListener('click', onListClick);
    }

    bindEvents();
    getShaders();
}());
