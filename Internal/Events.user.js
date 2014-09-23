// ==UserScript==
// @name        Fimfiction Events API
// @author      Sollace
// @namespace   fimfiction-sollace
// @version     1.0
// @include     http://www.fimfiction.net/*
// @include     https://www.fimfiction.net/*
// @grant       none
// ==/UserScript==

(function (win) {
  var ver = 1;
  var startup =
      (typeof (FimFicEvents) === 'undefined') && (typeof (win.FimFicEvents) === 'undefined') &&
      (win == window || (typeof (window.FimFicEvents) === 'undefined'));
  if (typeof (win.FimFicEvents) === 'undefined' || win.FimFicEvents.version() < ver) {
    win.FimFicEvents = {
      'version': function() {
        return ver;
      },
      'on': function(name, func) {
        $(document).on(name,func);
      },
      'off': function(name, event) {
        $(document).off(name,event);
      },
      'trigger': function(name, e) {
        $(document).trigger(name, [e]);
      },
      'getEventName': function(url) {
        switch (url){
          case '/ajax/fetch_comments.php': return {'eventName': 'pagechange'};
          case '/ajax/edit_comment.php': return {'eventName': 'editcomment'};
          case '/ajax/preview_comment.php': return {'eventName': 'previewcomment'};
          case '/ajax/add_comment.php': return {'eventName': 'addcomment'};
          case '/compose_private_message.php': return {'eventName':'composepm'};
        }
        if (url.indexOf('/ajax/get_module_edit.php?box=') == 0) {
          return {'eventName': 'editmodule', 'box':url.split('&')[0].split('?')[1].split('=')[1]};
        }
        return null;
      }
    };
  }
  if (win != window) {
    window.FimFicEvents = {
      'on': function() {
        return win.FimFicEvents.on(name, func);
      },
      'off': function(name, event) {
        win.FimFicEvents.off(name, event);
      },
      'trigger': function(name, e) {
        win.FimFicEvents.trigger(name, e);
      },
      'getEventName': function(url) {
        return win.FimFicEvents.getEventname(url);
      }
    }
  }
    
  if (startup) {
    win.$.ajax = (function() {
      win.$.__ajax = win.$.ajax;
      return function(param, n) {
        var event = win.FimFicEvents.getEventName(param.url);
        if (event != null) {
          event.url = param.url;
          event.data = param.data;
          var __success = param.success;
          param.success = function() {
            event.result = arguments[0];
            win.FimFicEvents.trigger('before' + event.eventName, event);
            arguments[0] = event.result;
            if (__success != null) {
              __success.apply(this,arguments);
            }
          };
          var __complete = param.complete;
          param.complete = function() {
            if (__complete != null) {
              __complete.apply(this,arguments);
            }
            event.result = arguments[0];
            win.FimFicEvents.trigger('after' + event.eventName, event);
            arguments[0] = event.result;
          };
        }
        return win.$.__ajax(param, n);
      };
    })();
  }
})(typeof (unsafeWindow) !== 'undefined' && unsafeWindow != window ? unsafeWindow : window);