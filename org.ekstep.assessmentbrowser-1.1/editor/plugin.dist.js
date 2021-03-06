
window.assessmentBrowserUtil = (function() {

    function getQuestionPreviwContent(templateJson, itemJson) {
        try {
            if (!templateJson) {
                throw "Template cannot be empty";
            }

            var story = { "theme": { "manifest": { "media": [] }, "template": [], "controller": [{ "name": "assessment", "type": "items", "id": "assessment", "__cdata": {} }], "startStage": "assessmentStage", "id": "theme", "ver": 0.3, "stage": [{ "id": "baseStage", "preload": true, "image": [], "audio": [], "voice": [] }, { "id": "assessmentStage", "x": 0, "y": 0, "w": 100, "h": 100, "g": [{ "embed": { "template": "item", "var-item": "item" }, "x": 10, "y": 0, "w": 80, "h": 90 }], "iterate": "assessment", "var": "item" }] } };
            story.theme.controller[0].__cdata = { "total_items": 1, "SET_TYPE": "MATERIALISED_SET", "SET_OBJECT_TYPE_KEY": "AssessmentItem", "item_sets": [{ "id": "itemSet", "count": 1 }], "items": { "itemSet": [itemJson] }, "identifier": "itemSet" };

            var templates = ecEditor._.isUndefined(templateJson.theme.template) ? [] : (ecEditor._.isArray(templateJson.theme.template) ? templateJson.theme.template : [templateJson.theme.template]);
            ecEditor._.forEach(templates, function(t) {
                if (t && ecEditor._.findIndex(story.theme.template, function(st) {
                        return st.id == t.id
                    }) < 0) {
                    story.theme.template.push(t);
                }
            });
            if (itemJson.media) {
                story = addMediaToStory(story, itemJson.media);
            }
            if (ecEditor._.has(templateJson, 'theme.manifest') && templateJson.theme.manifest.media) {
                story = addMediaToStory(story, templateJson.theme.manifest.media);
            }
            return story;
        } catch (err) {
            return { "error": err };
        };
    }

    function addMediaToStory(story, media) {
        media = ecEditor._.isUndefined(media) ? [] : (ecEditor._.isArray(media) ? media : [media]);
        var idIndex,
            srcIndex;
        ecEditor._.forEach(media, function(m) {
            if (m.id && m.src) {
                srcIndex = ecEditor._.findIndex(story.theme.manifest.media, function(sm) {
                    return sm.src === m.src;
                });
                idIndex = ecEditor._.findIndex(story.theme.manifest.media, function(sm) {
                    return sm.id === m.id;
                });
                if (idIndex === -1) story.theme.manifest.media.push(m);
                if (idIndex !== -1 && srcIndex === -1) {
                    var newMedia = { "id": m.id, "src": m.src, "type": m.type };
                    if (m.assetId) newMedia.assetId = m.assetId;
                    story.theme.manifest.media[idIndex] = newMedia;
                }
            }
        });
        return story;
    }
    return {
        getQuestionPreviwContent: getQuestionPreviwContent
    }
})();
/*
 Copyright 2011-2013 Abdulla Abdurakhmanov
 Original sources are available at https://code.google.com/p/x2js/

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

function X2JS(config) {
    'use strict';

    var VERSION = "1.1.5";

    config = config || {};
    initConfigDefaults();
    initRequiredPolyfills();

    function initConfigDefaults() {
        if (config.escapeMode === undefined) {
            config.escapeMode = true;
        }
        config.attributePrefix = config.attributePrefix || "_";
        if (config.attributePrefix === "none") {
            config.attributePrefix = "";
        }
        config.arrayAccessForm = config.arrayAccessForm || "none";
        config.emptyNodeForm = config.emptyNodeForm || "text";
        if (config.enableToStringFunc === undefined) {
            config.enableToStringFunc = true;
        }
        config.arrayAccessFormPaths = config.arrayAccessFormPaths || [];
        if (config.skipEmptyTextNodesForObj === undefined) {
            config.skipEmptyTextNodesForObj = true;
        }
        if (config.stripWhitespaces === undefined) {
            config.stripWhitespaces = true;
        }
        config.datetimeAccessFormPaths = config.datetimeAccessFormPaths || [];
        if (config.coerce === undefined) {
            config.coerce = true;
        }
    }

    var DOMNodeTypes = {
        ELEMENT_NODE: 1,
        TEXT_NODE: 3,
        CDATA_SECTION_NODE: 4,
        COMMENT_NODE: 8,
        DOCUMENT_NODE: 9
    };

    function initRequiredPolyfills() {
        function pad(number) {
            var r = String(number);
            if (r.length === 1) {
                r = '0' + r;
            }
            return r;
        }
        // Hello IE8-
        if (typeof String.prototype.trim !== 'function') {
            String.prototype.trim = function() {
                return this.replace(/^\s+|^\n+|(\s|\n)+$/g, '');
            }
        }
        if (typeof Date.prototype.toISOString !== 'function') {
            // Implementation from http://stackoverflow.com/questions/2573521/how-do-i-output-an-iso-8601-formatted-string-in-javascript
            Date.prototype.toISOString = function() {
                return this.getUTCFullYear() + '-' + pad(this.getUTCMonth() + 1) + '-' + pad(this.getUTCDate()) + 'T' + pad(this.getUTCHours()) + ':' + pad(this.getUTCMinutes()) + ':' + pad(this.getUTCSeconds()) + '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5) + 'Z';
            };
        }
    }

    function getNodeLocalName(node) {
        var nodeLocalName = node.localName;
        if (nodeLocalName == null) // Yeah, this is IE!!
            nodeLocalName = node.baseName;
        if (nodeLocalName == null || nodeLocalName == "") // =="" is IE too
            nodeLocalName = node.nodeName;
        return nodeLocalName;
    }

    function getNodePrefix(node) {
        return node.prefix;
    }

    function escapeXmlChars(str) {
        if (typeof(str) == "string")
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
        else
            return str;
    }

    function unescapeXmlChars(str) {
        return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#x2F;/g, '\/');
    }

    function toArrayAccessForm(obj, childName, path) {
        switch (config.arrayAccessForm) {
            case "property":
                if (!(obj[childName] instanceof Array))
                    obj[childName + "_asArray"] = [obj[childName]];
                else
                    obj[childName + "_asArray"] = obj[childName];
                break;
                /*case "none":
                 break;*/
        }

        if (!(obj[childName] instanceof Array) && config.arrayAccessFormPaths.length > 0) {
            var idx = 0;
            for (; idx < config.arrayAccessFormPaths.length; idx++) {
                var arrayPath = config.arrayAccessFormPaths[idx];
                if (typeof arrayPath === "string") {
                    if (arrayPath == path)
                        break;
                } else
                if (arrayPath instanceof RegExp) {
                    if (arrayPath.test(path))
                        break;
                } else
                if (typeof arrayPath === "function") {
                    if (arrayPath(obj, childName, path))
                        break;
                }
            }
            if (idx != config.arrayAccessFormPaths.length) {
                obj[childName] = [obj[childName]];
            }
        }
    }

    function fromXmlDateTime(prop) {
        // Implementation based up on http://stackoverflow.com/questions/8178598/xml-datetime-to-javascript-date-object
        // Improved to support full spec and optional parts
        var bits = prop.split(/[-T:+Z]/g);

        var d = new Date(bits[0], bits[1] - 1, bits[2]);
        var secondBits = bits[5].split("\.");
        d.setHours(bits[3], bits[4], secondBits[0]);
        if (secondBits.length > 1)
            d.setMilliseconds(secondBits[1]);

        // Get supplied time zone offset in minutes
        if (bits[6] && bits[7]) {
            var offsetMinutes = bits[6] * 60 + Number(bits[7]);
            var sign = /\d\d-\d\d:\d\d$/.test(prop) ? '-' : '+';

            // Apply the sign
            offsetMinutes = 0 + (sign == '-' ? -1 * offsetMinutes : offsetMinutes);

            // Apply offset and local timezone
            d.setMinutes(d.getMinutes() - offsetMinutes - d.getTimezoneOffset())
        } else
        if (prop.indexOf("Z", prop.length - 1) !== -1) {
            d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()));
        }

        // d is now a local time equivalent to the supplied time
        return d;
    }

    function checkFromXmlDateTimePaths(value, childName, fullPath) {
        if (config.datetimeAccessFormPaths.length > 0) {
            var path = fullPath.split("\.#")[0];
            var idx = 0;
            for (; idx < config.datetimeAccessFormPaths.length; idx++) {
                var dtPath = config.datetimeAccessFormPaths[idx];
                if (typeof dtPath === "string") {
                    if (dtPath == path)
                        break;
                } else
                if (dtPath instanceof RegExp) {
                    if (dtPath.test(path))
                        break;
                } else
                if (typeof dtPath === "function") {
                    if (dtPath(obj, childName, path))
                        break;
                }
            }
            if (idx != config.datetimeAccessFormPaths.length) {
                return fromXmlDateTime(value);
            } else
                return value;
        } else
            return value;
    }

    function parseDOMChildren(node, path) {
        if (node.nodeType == DOMNodeTypes.DOCUMENT_NODE) {
            var result = new Object;
            var nodeChildren = node.childNodes;
            // Alternative for firstElementChild which is not supported in some environments
            for (var cidx = 0; cidx < nodeChildren.length; cidx++) {
                var child = nodeChildren.item(cidx);
                if (child.nodeType == DOMNodeTypes.ELEMENT_NODE) {
                    var childName = getNodeLocalName(child);
                    result[childName] = parseDOMChildren(child, childName);
                }
            }
            return result;
        } else if (node.nodeType == DOMNodeTypes.ELEMENT_NODE) {
            var result = new Object;
            result.__cnt = 0;

            var nodeChildren = node.childNodes;

            // Children nodes
            for (var cidx = 0; cidx < nodeChildren.length; cidx++) {
                var child = nodeChildren.item(cidx); // nodeChildren[cidx];
                var childName = getNodeLocalName(child);

                if (child.nodeType != DOMNodeTypes.COMMENT_NODE) {
                    result.__cnt++;
                    if (result[childName] == null) {
                        result[childName] = parseDOMChildren(child, path + "." + childName);
                        toArrayAccessForm(result, childName, path + "." + childName);
                    } else {
                        if (result[childName] != null) {
                            if (!(result[childName] instanceof Array)) {
                                result[childName] = [result[childName]];
                                toArrayAccessForm(result, childName, path + "." + childName);
                            }
                        }
                        (result[childName])[result[childName].length] = parseDOMChildren(child, path + "." + childName);
                    }
                }
            }

            // Attributes
            for (var aidx = 0; aidx < node.attributes.length; aidx++) {
                var attr = node.attributes.item(aidx); // [aidx];
                result.__cnt++;
                result[config.attributePrefix + attr.name] = coerce(attr.value);
            }

            // Node namespace prefix
            var nodePrefix = getNodePrefix(node);
            if (nodePrefix != null && nodePrefix != "") {
                result.__cnt++;
                result.__prefix = nodePrefix;
            }

            if (result["#text"] != null) {
                result.__text = result["#text"];
                if (result.__text instanceof Array) {
                    result.__text = result.__text.join("\n");
                }
                if (config.escapeMode)
                    result.__text = unescapeXmlChars(result.__text);
                if (config.stripWhitespaces)
                    result.__text = result.__text.trim();
                delete result["#text"];
                if (config.arrayAccessForm == "property")
                    delete result["#text_asArray"];
                result.__text = checkFromXmlDateTimePaths(result.__text, childName, path + "." + childName);
            }
            if (result["#cdata-section"] != null) {
                result.__cdata = result["#cdata-section"];
                delete result["#cdata-section"];
                if (config.arrayAccessForm == "property")
                    delete result["#cdata-section_asArray"];
            }

            if (result.__cnt == 1 && result.__text != null) {
                result = result.__text;
            } else
            if (result.__cnt == 0 && config.emptyNodeForm == "text") {
                result = '';
            } else
            if (result.__cnt > 1 && result.__text != null && config.skipEmptyTextNodesForObj) {
                if ((config.stripWhitespaces && result.__text == "") || (result.__text.trim() == "")) {
                    delete result.__text;
                }
            }
            delete result.__cnt;

            if (config.enableToStringFunc && (result.__text != null || result.__cdata != null)) {
                result.toString = function() {
                    return (this.__text != null ? this.__text : '') + (this.__cdata != null ? this.__cdata : '');
                };
            }

            return result;
        } else if (node.nodeType == DOMNodeTypes.TEXT_NODE || node.nodeType == DOMNodeTypes.CDATA_SECTION_NODE) {
            return coerce(node.nodeValue);
        }
    }

    function coerce(value) {
        if (!config.coerce || value.trim() === '') {
            return value;
        }

        var num = Number(value);
        if (!isNaN(num)) {
            return num;
        }

        var _value = value.toLowerCase();

        if (_value == 'true') {
            return true;
        }

        if (_value == 'false') {
            return false;
        }

        return value;
    }

    function startTag(jsonObj, element, attrList, closed) {
        var resultStr = "<" + ((jsonObj != null && jsonObj.__prefix != null) ? (jsonObj.__prefix + ":") : "") + element;
        if (attrList != null) {
            for (var aidx = 0; aidx < attrList.length; aidx++) {
                var attrName = attrList[aidx];
                var attrVal = jsonObj[attrName];
                if (config.escapeMode)
                    attrVal = escapeXmlChars(attrVal);
                resultStr += " " + attrName.substr(config.attributePrefix.length) + "='" + attrVal + "'";
            }
        }
        if (!closed)
            resultStr += ">";
        else
            resultStr += "/>";
        return resultStr;
    }

    function endTag(jsonObj, elementName) {
        return "</" + (jsonObj.__prefix != null ? (jsonObj.__prefix + ":") : "") + elementName + ">";
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    function jsonXmlSpecialElem(jsonObj, jsonObjField) {
        if ((config.arrayAccessForm == "property" && endsWith(jsonObjField.toString(), ("_asArray"))) || jsonObjField.toString().indexOf(config.attributePrefix) == 0 || jsonObjField.toString().indexOf("__") == 0 || (jsonObj[jsonObjField] instanceof Function))
            return true;
        else
            return false;
    }

    function jsonXmlElemCount(jsonObj) {
        var elementsCnt = 0;
        if (jsonObj instanceof Object) {
            for (var it in jsonObj) {
                if (jsonXmlSpecialElem(jsonObj, it))
                    continue;
                elementsCnt++;
            }
        }
        return elementsCnt;
    }

    function parseJSONAttributes(jsonObj) {
        var attrList = [];
        if (jsonObj instanceof Object) {
            for (var ait in jsonObj) {
                if (ait.toString().indexOf("__") == -1 && ait.toString().indexOf(config.attributePrefix) == 0) {
                    attrList.push(ait);
                }
            }
        }
        return attrList;
    }

    function parseJSONTextAttrs(jsonTxtObj) {
        var result = "";

        if (jsonTxtObj.__cdata != null) {
            result += "<![CDATA[" + jsonTxtObj.__cdata + "]]>";
        }

        if (jsonTxtObj.__text != null) {
            if (config.escapeMode)
                result += escapeXmlChars(jsonTxtObj.__text);
            else
                result += jsonTxtObj.__text;
        }
        return result;
    }

    function parseJSONTextObject(jsonTxtObj) {
        var result = "";

        if (jsonTxtObj instanceof Object) {
            result += parseJSONTextAttrs(jsonTxtObj);
        } else
        if (jsonTxtObj != null) {
            if (config.escapeMode)
                result += escapeXmlChars(jsonTxtObj);
            else
                result += jsonTxtObj;
        }

        return result;
    }

    function parseJSONArray(jsonArrRoot, jsonArrObj, attrList) {
        var result = "";
        if (jsonArrRoot.length == 0) {
            result += startTag(jsonArrRoot, jsonArrObj, attrList, true);
        } else {
            for (var arIdx = 0; arIdx < jsonArrRoot.length; arIdx++) {
                result += startTag(jsonArrRoot[arIdx], jsonArrObj, parseJSONAttributes(jsonArrRoot[arIdx]), false);
                result += parseJSONObject(jsonArrRoot[arIdx]);
                result += endTag(jsonArrRoot[arIdx], jsonArrObj);
            }
        }
        return result;
    }

    function parseJSONObject(jsonObj) {
        var result = "";

        var elementsCnt = jsonXmlElemCount(jsonObj);

        if (elementsCnt > 0) {
            for (var it in jsonObj) {

                if (jsonXmlSpecialElem(jsonObj, it))
                    continue;

                var subObj = jsonObj[it];

                var attrList = parseJSONAttributes(subObj)

                if (subObj == null || subObj == undefined) {
                    result += startTag(subObj, it, attrList, true);
                } else
                if (subObj instanceof Object) {

                    if (subObj instanceof Array) {
                        result += parseJSONArray(subObj, it, attrList);
                    } else if (subObj instanceof Date) {
                        result += startTag(subObj, it, attrList, false);
                        result += subObj.toISOString();
                        result += endTag(subObj, it);
                    } else {
                        var subObjElementsCnt = jsonXmlElemCount(subObj);
                        if (subObjElementsCnt > 0 || subObj.__text != null || subObj.__cdata != null) {
                            result += startTag(subObj, it, attrList, false);
                            result += parseJSONObject(subObj);
                            result += endTag(subObj, it);
                        } else {
                            result += startTag(subObj, it, attrList, true);
                        }
                    }
                } else {
                    result += startTag(subObj, it, attrList, false);
                    result += parseJSONTextObject(subObj);
                    result += endTag(subObj, it);
                }
            }
        }
        result += parseJSONTextObject(jsonObj);

        return result;
    }

    this.parseXmlString = function(xmlDocStr) {
        var isIEParser = window.ActiveXObject || "ActiveXObject" in window;
        if (xmlDocStr === undefined) {
            return null;
        }
        var xmlDoc;
        if (window.DOMParser) {
            var parser = new window.DOMParser();
            var parsererrorNS = null;
            // IE9+ now is here
            if (!isIEParser) {
                try {
                    parsererrorNS = parser.parseFromString("INVALID", "text/xml").childNodes[0].namespaceURI;
                } catch (err) {
                    parsererrorNS = null;
                }
            }
            try {
                xmlDoc = parser.parseFromString(xmlDocStr, "text/xml");
                if (parsererrorNS != null && xmlDoc.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0) {
                    //throw new Error('Error parsing XML: '+xmlDocStr);
                    xmlDoc = null;
                }
            } catch (err) {
                xmlDoc = null;
            }
        } else {
            // IE :(
            if (xmlDocStr.indexOf("<?") == 0) {
                xmlDocStr = xmlDocStr.substr(xmlDocStr.indexOf("?>") + 2);
            }
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlDocStr);
        }
        return xmlDoc;
    };

    this.asArray = function(prop) {
        if (prop instanceof Array)
            return prop;
        else
            return [prop];
    };

    this.toXmlDateTime = function(dt) {
        if (dt instanceof Date)
            return dt.toISOString();
        else
        if (typeof(dt) === 'number')
            return new Date(dt).toISOString();
        else
            return null;
    };

    this.asDateTime = function(prop) {
        if (typeof(prop) == "string") {
            return fromXmlDateTime(prop);
        } else
            return prop;
    };

    this.xml2json = function(xmlDoc) {
        return parseDOMChildren(xmlDoc);
    };

    this.xml_str2json = function(xmlDocStr) {
        var xmlDoc = this.parseXmlString(xmlDocStr);
        if (xmlDoc != null)
            return this.xml2json(xmlDoc);
        else
            return null;
    };

    this.json2xml_str = function(jsonObj) {
        return parseJSONObject(jsonObj);
    };

    this.json2xml = function(jsonObj) {
        var xmlDocStr = this.json2xml_str(jsonObj);
        return this.parseXmlString(xmlDocStr);
    };

    this.getVersion = function() {
        return VERSION;
    };

}
window.X2JS = X2JS;

org.ekstep.pluginframework.pluginManager.registerPlugin({"id":"org.ekstep.assessmentbrowser","ver":"1.1","shortId":"assessmentbrowser","author":"Santhosh Vasabhaktula","title":"AssessmentBrowser Plugin","description":"","publishedDate":"","editor":{"main":"editor/plugin.js","dependencies":[{"type":"plugin","plugin":"org.ekstep.conceptselector","ver":"1.1"},{"type":"js","src":"editor/assessmentbrowser_util.js"},{"type":"js","src":"editor/libs/xml2json.js"}]}},org.ekstep.contenteditor.basePlugin.extend({type:"assessmentbrowser",previewURL:(ecEditor.getConfig("previewURL")||"/content/preview/preview.html")+"?webview=true",callback:function(){},initialize:function(){var t=this;ecEditor.addEventListener(this.manifest.id+":show",this.showAssessmentBrowser,this),setTimeout(function(){var e=ecEditor.resolvePluginResource(t.manifest.id,t.manifest.ver,"editor/assessmentbrowser.html"),s=ecEditor.resolvePluginResource(t.manifest.id,t.manifest.ver,"editor/assessmentbrowserapp.js");ecEditor.getService("popup").loadNgModules(e,s)},1e3)},showAssessmentBrowser:function(e,s){var t=this;this.callback=s.callback,this.data=ecEditor._.isUndefined(s.data)?"":s.data,ecEditor.getService("popup").open({template:"assessmentbrowser",controller:"assessmentbrowsercontroller",controllerAs:"$ctrl",resolve:{instance:function(){return t}},width:900,showClose:!1,className:"ngdialog-theme-plain"})}}))