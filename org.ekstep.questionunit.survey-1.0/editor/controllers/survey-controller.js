/*
 * Plugin to create MCQ question
 * @class org.ekstep.questionunitmcq:mcqQuestionFormController
 * Jagadish P<jagadish.pujari@tarento.com>
 */
angular.module('surveyApp', ['org.ekstep.question']).controller('surveyQuestionFormController', ['$scope', '$rootScope', 'questionServices', '$timeout', function ($scope, rootScope, questionServices, $timeout) {
  $scope.formVaild = false;
  $scope.mcqConfiguartion = {
    'questionConfig': {
      'isText': true,
      'isImage': true,
      'isAudio': true,
      'isHint': false
    },
    'optionsConfig': [{
      'isText': true,
      'isImage': true,
      'isAudio': true,
      'isHint': false
    }, {
      'isText': true,
      'isImage': true,
      'isAudio': true,
      'isHint': false
    }]
  };
  $scope.surveyFormData = {
    'question': {
      'text': '',
      'image': '',
      'audio': '',
      'audioName': '',
      'hint': ''
    },
    'options': [{
      'text': '',
      'image': '',
      'audio': '',
      'audioName': '',
      'hint': '',
      'isCorrect': false
    }, {
      'text': '',
      'image': '',
      'audio': '',
      'audioName': '',
      'hint': '',
      'isCorrect': false
    }],
    'questionCount': 0
  };
  $scope.oHint = [];
  $scope.questionMedia = {};
  $scope.optionsMedia = {
    'image': [],
    'audio': []
  };
  $scope.surveyFormData.media = [];
  $scope.editMedia = [];
  //get questionunit manifest
  var questionUnitIns = org.ekstep.pluginframework.pluginManager.getPluginManifest("org.ekstep.questionunit");
  $scope.ckConfig = { // eslint-disable-line no-undef
    customConfig: ecEditor.resolvePluginResource(questionUnitIns.id, questionUnitIns.ver, "editor/ckeditor-config.js"),
    skin: 'moono-lisa,' + CKEDITOR.basePath + "skins/moono-lisa/", // eslint-disable-line no-undef
    contentsCss: CKEDITOR.basePath + "contents.css" // eslint-disable-line no-undef
  };
  var questionInput = CKEDITOR.replace('ckedit', $scope.ckConfig);
  questionInput.on('change', function () {
    $scope.surveyFormData.question.text = this.getData();
  });
  questionInput.on('focus', function () {
    $scope.generateTelemetry({
      type: 'TOUCH',
      id: 'input',
      pageid: 'question-creation-mcq-form',
      target: {
        id: 'questionunit-mcq-question',
        ver: '',
        type: 'input'
      }
    })
  });
  angular.element('.innerScroll').on('scroll', function () {
    $scope.generateTelemetry({
      type: 'SCROLL',
      id: 'form',
      target: {
        id: 'questionunit-mcq-form',
        ver: '',
        type: 'form'
      }
    })
  });
  $scope.init = function () {
    $scope.mcqPluginInstance = org.ekstep.pluginframework.pluginManager.getPluginManifest("org.ekstep.questionunit.survey")
    EventBus.listeners['org.ekstep.questionunit.survey:validateform'] = [];
    ecEditor.addEventListener('org.ekstep.questionunit.survey:validateform', function (event, callback) {
      var validationRes = $scope.formValidation();
      callback(validationRes.isValid, validationRes.formData);
    }, $scope);
    EventBus.listeners['org.ekstep.questionunit.survey:editquestion'] = [];
    ecEditor.addEventListener('org.ekstep.questionunit.survey:editquestion', $scope.editMcqQuestion, $scope);
    ecEditor.dispatchEvent("org.ekstep.questionunit:ready");
    $scope.BindCkeditor();
  }
  $scope.editMcqQuestion = function (event, data) {
    var qdata = data.data;
    $scope.surveyFormData.question = qdata.question;
    $scope.surveyFormData.options = qdata.options;
    $scope.editMedia = qdata.media;
    var opLength = qdata.length;
    if (opLength > 2) {
      for (var j = 2; j < opLength; j++) {
        $scope.surveyFormData.options.push({
          'text': '',
          'image': '',
          'audio': '',
          'audioName': '',
          'isCorrect': false
        });
        $scope.$safeApply();
      }
    }
    if ($scope.surveyFormData.options.length < 2) {
      $scope.surveyFormData.options.splice(2, 1);
    }
    $scope.$safeApply();
  }
  $scope.addAnswerField = function () {
    var option = {
      'text': '',
      'image': '',
      'audio': '',
      'audioName': '',
      'isCorrect': false
    };
    if ($scope.surveyFormData.options.length < 8) $scope.surveyFormData.options.push(option);
    $scope.BindCkeditor();
  }
  $scope.formValidation = function () {
    console.log('debug');
    var opSel = false;
    var valid = false;
    // debugger;
    var formValid = $scope.surveyForm.$valid && $scope.surveyFormData.options.length > 1;
    $scope.submitted = true;
    if (!($scope.surveyFormData.question.text.length || $scope.surveyFormData.question.image.length || $scope.surveyFormData.question.audio.length)) {
      $('.questionTextBox').addClass("ck-error");
    } else {
      $('.questionTextBox').removeClass("ck-error");
    }
    if (!_.isUndefined($scope.selectedOption)) {
      _.each($scope.surveyFormData.options, function (k, v) {
        $scope.surveyFormData.options[v].isCorrect = false;
        console.log('checking');
      });
      valid = true;
      console.log('debug');
      $scope.surveyFormData.options[$scope.selectedOption].isCorrect = true;
    } else {
      _.each($scope.surveyFormData.options, function (k, v) { // eslint-disable-line no-unused-vars
        // if (k.isCorrect) {
        //   valid = true;
        // } else {
          valid = true;
        // }
      });
    }
    if (valid) {
      opSel = true;
      $scope.selLbl = 'success';
    } else {
      opSel = false;
      $scope.selLbl = 'error';
    }
    var tempArray = [];
    var temp = [];
    _.isEmpty($scope.questionMedia.image) ? 0 : tempArray.push($scope.questionMedia.image);
    _.isEmpty($scope.questionMedia.audio) ? 0 : tempArray.push($scope.questionMedia.audio);
    _.each($scope.optionsMedia.image, function (key, val) { // eslint-disable-line no-unused-vars
      tempArray.push(key);
    });
    _.each($scope.optionsMedia.audio, function (key, val) { // eslint-disable-line no-unused-vars
      tempArray.push(key);
    });
    temp = tempArray.filter(function (element) {
      return element !== undefined;
    });
    $scope.editMedia = _.union($scope.editMedia, temp);
    $scope.surveyFormData.media = $scope.editMedia;
    //check if audio is their then add audio icon in media array
    if ($scope.surveyFormData.media.length > 0) $scope.addDefaultMedia();
    var formConfig = {};
    formConfig.formData = $scope.surveyFormData;
    if (formValid && opSel) {
      formConfig.isValid = true;
    } else {
      formConfig.isValid = false;
    }
    return formConfig;
  }
  $scope.deleteAnswer = function (id) {
    if (id >= 0) $scope.surveyFormData.options.splice(id, 1);
    if (parseInt($scope.selectedOption) == id) {
      $scope.selectedOption = undefined;
    }
    $scope.BindCkeditor();
  }
  //if audio added then audio icon id sent to ecml add stage
  $scope.addDefaultMedia = function () {
    var addAllMedia = [{
      id: "org.ekstep.questionset.audioicon",
      src: ecEditor.resolvePluginResource($scope.mcqPluginInstance.id, $scope.mcqPluginInstance.ver, 'renderer/assets/audio.png'),
      assetId: "org.ekstep.questionset.audioicon",
      type: "image",
      preload: true
    }, {
      id: "org.ekstep.questionset.default-imgageicon",
      src: ecEditor.resolvePluginResource($scope.mcqPluginInstance.id, $scope.mcqPluginInstance.ver, 'renderer/assets/default-image.png'),
      assetId: "org.ekstep.questionset.default-imgageicon",
      type: "image",
      preload: true
    }];
    addAllMedia.forEach(function (obj) {
      $scope.surveyFormData.media.push(obj);
    })
  }
  /**
   * invokes the asset browser to pick an image to add to either the question or the options
   * @param {string} type if `q` then it is image for question, else for options
   * @param {string} index if `id` is not `q` but an index, then it can be either 'LHS' or 'RHS'
   * @param {string} mediaType `image` or `audio`
   */
  $scope.addMedia = function (type, index, mediaType) {
    var mediaObject = {
      type: mediaType,
      search_filter: {} // All composite keys except mediaType
    }
    //Defining the callback function of mediaObject before invoking asset browser
    mediaObject.callback = function (data) {
      var telemetryObject = {
        type: 'TOUCH',
        id: 'button',
        target: {
          id: '',
          ver: '',
          type: 'button'
        }
      };
      var media = {
        "id": Math.floor(Math.random() * 1000000000), // Unique identifier
        "src": org.ekstep.contenteditor.mediaManager.getMediaOriginURL(data.assetMedia.src), // Media URL
        "assetId": data.assetMedia.id, // Asset identifier
        "type": data.assetMedia.type, // Type of asset (image, audio, etc)
        "preload": false // true or false
      };
      if (type == 'q') {
        telemetryObject.target.id = 'questionunit-mcq-add' + mediaType;
        $scope.surveyFormData.question[mediaType] = org.ekstep.contenteditor.mediaManager.getMediaOriginURL(data.assetMedia.src);
        data.assetMedia.type == 'audio' ? $scope.surveyFormData.question.audioName = data.assetMedia.name : '';
        $scope.questionMedia[mediaType] = media;
      } else {
        telemetryObject.target.id = 'questionunit-mcq-option-add-' + mediaType;
        $scope.surveyFormData.options[index][mediaType] = org.ekstep.contenteditor.mediaManager.getMediaOriginURL(data.assetMedia.src);
        data.assetMedia.type == 'audio' ? $scope.surveyFormData.options[index].audioName = data.assetMedia.name : '';
        $scope.optionsMedia[mediaType][index] = media;
      }
      $scope.generateTelemetry(telemetryObject)
      if (!$scope.$$phase) {
        $scope.$digest()
      }
    }
    questionServices.invokeAssetBrowser(mediaObject);
  }
  /**
   * Deletes the selected media from the question element (question, LHS or RHS options)
   * @param {string} type 
   * @param {Integer} index 
   * @param {string} mediaType 
   */
  $scope.deleteMedia = function (type, index, mediaType) {
    var telemetryObject = {
      type: 'TOUCH',
      id: 'button',
      target: {
        id: '',
        ver: '',
        type: 'button'
      }
    };
    if (type == 'q') {
      $scope.surveyFormData.question[mediaType] = '';
      delete $scope.questionMedia[mediaType];
    } else {
      $scope.surveyFormData.options[index][mediaType] = '';
      delete $scope.optionsMedia[mediaType][index];
    }
    $scope.generateTelemetry(telemetryObject)
  }
  $scope.addHint = function (id) {
    if (id == 'q') {
      $scope.qHint = true;
    } else {
      $scope.oHint[id] = true;
    }
  }
  $scope.deleteHint = function (id) {
    if (id == 'q') {
      $scope.qHint = false;
      $scope.surveyFormData.question.hint = '';
    } else {
      $scope.oHint[id] = false;
      $scope.surveyFormData.options[id].hint = '';
    }
  }
  /**
   * Helper function to generate telemetry event
   * @param {Object} data telemetry data
   */
  $scope.generateTelemetry = function (data) {
    data.plugin = data.plugin || {
      "id": $scope.mcqPluginInstance.id,
      "ver": $scope.mcqPluginInstance.ver
    }
    data.form = data.form || 'question-creation-mcq-form';
    questionServices.generateTelemetry(data);
  }
  /**
   * Callbacks object to be passed to the directive to manage selected media
   */
  $scope.callbacks = {
    deleteMedia: $scope.deleteMedia,
    addMedia: $scope.addMedia,
    qtype: 'mcq'
  }
  /**
   * destroy ckeditor apart from question
   * on click delete option we need to destroy all ckeditor option
   * we are not destroy question ckedit
   */
  $scope.destroyCkEditor = function () {
    for (var name in CKEDITOR.instances) {
      if (name != "ckedit") {
        CKEDITOR.instances[name].destroy(true);
      }
    }
  }
  $scope.ckEditorEventHandler = function (index) {
    $("#cke_mcqoptions_" + index).remove();
    var optionelement = $(".mcqoption-text-ck")[index];
    $scope.ckConfig.title = "Set Answer";
    var optionInput = CKEDITOR.inline(optionelement.id, $scope.ckConfig);
    //assign value to input box
    CKEDITOR.instances[optionelement.id].setData($scope.surveyFormData.options[index].text);
    optionInput.on('change', function () {
      //on changes get index id and assign to model
      var id = parseInt(this.name.split("mcqoptions_")[1]);
      $scope.surveyFormData.options[id].text = CKEDITOR.instances[this.name].getData();
      $scope.$safeApply();
    });
    optionInput.on('blur', function () {
      ecEditor.jQuery('.cke_float').hide();
    });
    optionInput.on('focus', function () {
      $scope.generateTelemetry({
        type: 'TOUCH',
        id: 'input',
        pageid: 'question-creation-mcq-form',
        target: {
          id: 'questionunit-mcq-question-option',
          ver: '',
          type: 'input'
        }
      })
    });
    $(".innerScroll").scroll(function () {
      ecEditor.jQuery('.cke_float').hide();
    });
    optionInput.focus();
  }
  /**
   * bind ckeditor in all option
   */
  $scope.BindCkeditor = function () {
    $timeout(function () {
      $scope.destroyCkEditor();
      var index = 0;
      for (index; index < $(".mcqoption-text-ck").length; index++) {
        $scope.ckEditorEventHandler(index);
      }
    }, 0);
  }
}])
//# sourceURL=horizontalMCQ.js