/**
 * Plugin to event handler
 * @extends base Plugin
 * @author Jagadish P <jagadish.pujari@tarento.com>
 */

 /* istanbul ignore next */
Plugin.extend({
  _type: 'org.ekstep.customnavigation',
  _isContainer: false,
  _render: true, 
  customNavigationVisible: false, 
  _config:{},
  _templatePath: undefined,
  _userSwitcherTP: undefined,
  _ngScopeVar: "overlay",
  _customNavigationPlugins:[],
  initialize: function() {
    var instance = this;
    var globalConfig = EkstepRendererAPI.getGlobalConfig();
    instance._config = _.extend(instance._config, globalConfig.overlay);
    this._templatePath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/newnavigation.html");
    this.controllerPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/controller/custom_navigation_ctrl.js");
    org.ekstep.service.controller.loadNgModules(this._templatePath, this.controllerPath);

    //Prototype for adding handleNext method 
    Plugin.prototype.handleNext = function(){
    }
    //Prototype for adding handlePrevious method 
    Plugin.prototype.handlePrevious = function(){
    }

    EkstepRendererAPI.addEventListener("renderer:overlay:show", instance.showOrHideOverlay, instance);        
    EkstepRendererAPI.addEventListener("renderer:content:start", instance.showOrHideOverlay, instance);

    //Register plugin for custom navigation
    EkstepRendererAPI.addEventListener("renderer:navigator:register",function(event, data){
      instance._customNavigationPlugins.push(event.target);
    });

    //Register plugin for custom navigation
    EkstepRendererAPI.addEventListener("renderer:navigator:deregister",function(event){
      var index = _.findIndex(instance._customNavigationPlugins, function(pluginInstance){ return pluginInstance.id == event.target});
      if (index > -1) {
        instance._customNavigationPlugins.splice(index, 1);
      }
    });

    //If register call plugin next method
    EkstepRendererAPI.addEventListener("renderer:navigator:next",function(event){
      var registered = _.isEmpty(instance._customNavigationPlugins);
      if(!registered){
        // Get the first plugin instance and pass control to it.
        var pluginInstance = instance._customNavigationPlugins[0];
        pluginInstance.handleNext();
      } else {
        EventBus.dispatch("actionNavigateNext", "next");
        EventBus.dispatch("nextClick");
      }
    });

    //If register call plugin previous method
    EkstepRendererAPI.addEventListener("renderer:navigator:prev",function(event){
      var registered = _.isEmpty(instance._customNavigationPlugins);
      if(!registered){
        var pluginInstance = instance._customNavigationPlugins[0];
        pluginInstance.handlePrevious();
      } else {
        EventBus.dispatch("actionNavigatePrevious", "previous");
        EventBus.dispatch("previousClick");
      }
    });

  },
  showOrHideOverlay: function(){
    this.customNavigationVisible = true;
  }
});
//#sourceURL=customnavigation.js
