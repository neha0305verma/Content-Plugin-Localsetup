'use strict';
angular.module('genie-canvas').controllerProvider.register("FTBRendererController", function($scope, $rootScope, $sce) {
  $scope.showTemplate = true;
  $scope.question;
  $scope.constant = {
    ftbContainerId: "#preview-ftb-horizontal",
    ftbText: "#qs-ftb-text",
    ftbQuestionClass: ".ftb-question-header",
    tempanswertext: "#tempanswertext"
  }
  $scope.qcquestion = true;
  $scope.textboxtarget = {};
  $scope.qcblank = false;
  $scope.events = {
    "show": "",
    "hide": "",
    "eval": ""
  };
  var ctrl = this;
  $scope.init = function() {
    $scope.cssPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource("org.ekstep.questionunit.ftb", "1.0", "renderer/styles/style.css");
    $scope.pluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.questionunit.ftb");
    $scope.events.eval = $scope.pluginInstance._manifest.id + ":evaluate";
    $scope.events.show = $scope.pluginInstance._manifest.id + ":show";
    $scope.events.hide = $scope.pluginInstance._manifest.id + ":hide";
    $scope.removeEvents();
    $scope.registerEvents();
    if (!$rootScope.isFTBRendererd) {
      $rootScope.isFTBRendererd = true;
    }
    if (EventBus.hasEventListener($scope.events.eval)) {
      if (EventBus.listeners[$scope.events.eval].length > 1) EventBus.removeEventListener($scope.events.eval, $scope.evalListener)
    }
  }
  $scope.registerEvents = function() {
    /**
     * renderer:questionunit.ftb:dispatch an event in question set with question data.
     * @event renderer:questionunit.ftb:dispatch
     * @memberof org.ekstep.questionunit.ftb
     */
    EkstepRendererAPI.addEventListener($scope.events.show, $scope.showEventListener);
    /**
     * renderer:questionunit.ftb:hide template on question set navigation.
     * @event renderer:questionunit.ftb:dispatch
     * @memberof org.ekstep.questionunit.ftb
     */
    EkstepRendererAPI.addEventListener($scope.events.hide, $scope.hideEventListener);
    /**
     * renderer:questionunit.ftb:question set call evalution using plugin instance.
     * @event renderer:questionunit.ftb:click
     * @memberof org.ekstep.questionunit.ftb
     */
    EkstepRendererAPI.addEventListener($scope.events.eval, $scope.evalListener);
  }
  $scope.removeEvents = function() {
    EkstepRendererAPI.removeEventListener($scope.events.hide, $scope.hideEventListener, undefined);
    EkstepRendererAPI.removeEventListener($scope.events.show, $scope.showEventListener, undefined);
    EkstepRendererAPI.removeEventListener($scope.events.eval, $scope.evalListener, undefined);
  }
  $scope.showEventListener = function(event) {
    $scope.question = event.target;
    var gererateId = 0;
    var qData = $scope.question._currentQuestion.data.__cdata || $scope.question._currentQuestion.data;
    var questionData = JSON.parse(qData);
    $($scope.constant.ftbText).html(questionData.parsedQuestion.text);
    $($scope.constant.ftbContainerId).off('click');
    $($scope.constant.ftbContainerId).on('click', '.ans-field', $scope.doTextBoxHandle);
    var qState = $scope.question._currentQuestionState;
    if (qState && qState.val) {
      $scope.textboxtarget.state = qState.val;
      $scope.setStateInput();
    }
    $scope.questionObj = questionData;
    $scope.showTemplate = true;
    $scope.safeApply();
  }
  //if question state their then bind the value in text box
  $scope.setStateInput = function() {
    var textBoxCollection = angular.element($($scope.constant.ftbQuestionClass).find("input[type=text]"));
    _.each(textBoxCollection, function(element, index) {
      $("#" + element.id).val($scope.textboxtarget.state[index]);
    });
  }
  $scope.hideEventListener = function(event) {
    EkstepRendererAPI.dispatchEvent("org.ekstep.keyboard:hide"); 
    $scope.showTemplate = false;
    $scope.safeApply();
  }
  $scope.evalListener = function(event) {
    var callback = event.target;
    $scope.evaluate(callback);
    $scope.safeApply();
  }
  /**
   * renderer:questionunit.ftb:show keyboard in device.
   * @event renderer:questionunit.ftb:click
   * @memberof org.ekstep.questionunit.ftb
   */
  window.addEventListener('native.keyboardshow', function(e) {
    $scope.qcquestion = false;
    $scope.qcblank = true;
    $scope.qcmiddlealign = true;
    $($scope.constant.tempanswertext).val($("#" + $scope.textboxtarget.id).val());
    //for text focus
    $($scope.constant.tempanswertext).focus();
    $scope.safeApply();
    //for text focus
    $('#tempanswertext').focus();
  });
  /**
   * renderer:questionunit.ftb:hide keyboard in device.
   * @event renderer:questionunit.ftb:click
   * @memberof org.ekstep.questionunit.ftb
   */
  window.addEventListener('native.keyboardhide', function() {
    $scope.qcquestion = true;
    $scope.qcblank = false;
    $scope.qcmiddlealign = false;
    $("#" + $scope.textboxtarget.id).val($($scope.constant.tempanswertext).val().trim());
    $scope.qcmiddlealign = false;
    $scope.safeApply();
  });
  /**
  /**
   * renderer:questionunit.ftb:set target and value.
   * @event renderer:questionunit.ftb:click
   * @memberof org.ekstep.questionunit.ftb
   */
  $scope.doTextBoxHandle = function() {
    var questionConfig = $scope.question._currentQuestion.data.__cdata || $scope.question._currentQuestion.data;
    var qConfig = {
      'qData': questionConfig,
      'inputoldValue': $scope.textboxtarget
    }
    if (isbrowserpreview) {
      $scope.qcblank = false;
    } else if ($scope.questionObj.question.keyboardConfig.keyboardType == "Device" && !isbrowserpreview) {
      $scope.qcblank = true;
    }
    $scope.textboxtarget.id = this.id;
    $scope.textboxtarget.value = this.value.trim();
    EkstepRendererAPI.dispatchEvent("org.ekstep.keyboard:invoke", qConfig, $scope.callbackFromKeyboard);
  }
  $scope.callbackFromKeyboard = function(ans) {
    $("#qs-ftb-text").show();
    $("#" + $scope.textboxtarget.id).val(ans);
  }
  /**
   * renderer:questionunit.ftb:evalution.
   * @event renderer:questionunit.ftb:click
   * @memberof org.ekstep.questionunit.ftb
   */
  $scope.evaluate = function(callback) {
    var telemetryAnsArr = [], //array have all answer
      correctAnswer = false,
      answerArray = [],
      ansObj = {};
    //check for evalution
    //get all text box value inside the class
    var textBoxCollection = angular.element($($scope.constant.ftbQuestionClass).find("input[type=text]"));
    _.each(textBoxCollection, function(element, index) {
      answerArray.push(element.value.toLowerCase().trim());
      ansObj = {
        ["ans" + index]: element.value
      }
      telemetryAnsArr.push(ansObj);
    });
    //compare two array
    if (_.isEqual(answerArray, $scope.questionObj.answer)) {
      correctAnswer = true;
    }
    var result = {
      eval: correctAnswer,
      state: {
        val: answerArray
      }
    }
    if (_.isFunction(callback)) {
      //$scope.removeEvents();
      callback(result);
    }
    EkstepRendererAPI.dispatchEvent('org.ekstep.questionset:saveQuestionState', result.state);
    $scope.generateItemResponse(telemetryAnsArr);
  }
  $scope.generateItemResponse = function(telemetryAnsArr) {
    var edata = {
      "target": {
        "id": $scope.pluginInstance._manifest.id ? $scope.pluginInstance._manifest.id : "",
        "ver": $scope.pluginInstance._manifest.ver ? $scope.pluginInstance._manifest.ver : "1.0",
        "type": $scope.pluginInstance._manifest.type ? $scope.pluginInstance._manifest.type : "plugin"
      },
      "type": "INPUT",
      "values": telemetryAnsArr
    }
    TelemetryService.itemResponse(edata);
  }
  $scope.telemetry = function(event) {
    TelemetryService.interact("TOUCH", event.target.id, "TOUCH", {
      stageId: Renderer.theme._currentStage
    });
  }
});
//# sourceURL=questionunitFtbRenderereTmpPlugin.js