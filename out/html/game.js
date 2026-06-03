(function() {
  var game;
  var ui;

  var DateOptions = {hour: 'numeric',
                 minute: 'numeric',
                 second: 'numeric',
                 year: 'numeric',
                 month: 'short',
                 day: 'numeric' };

  var main = function(dendryUI) {
    ui = dendryUI;
    game = ui.game;
  };

  var TITLE = "Diversity In Canada" + '_' + "ForkFinder22";

  window.enableImages = function() {
      window.dendryUI.show_portraits = true;
      window.dendryUI.saveSettings();
  };

  window.disableImages = function() {
      window.dendryUI.show_portraits = false;
      window.dendryUI.saveSettings();
  };

  window.enableLightMode = function() {
      window.dendryUI.dark_mode = false;
      document.body.classList.remove('dark-mode');
      window.dendryUI.saveSettings();
  };
  window.enableDarkMode = function() {
      window.dendryUI.dark_mode = true;
      document.body.classList.add('dark-mode');
      window.dendryUI.saveSettings();
  };

  window.populateOptions = function() {
    var show_portraits = window.dendryUI.show_portraits;
    if (show_portraits) {
        $('#images_yes')[0].checked = true;
    } else {
        $('#images_no')[0].checked = true;
    }
    if (window.dendryUI.dark_mode) {
        $('#dark_mode')[0].checked = true;
    } else {
        $('#light_mode')[0].checked = true;
    }
  };

  window.displayText = function(text) {
      return text;
  };

  window.handleSignal = function(signal, event, scene_id) {
  };
  
  // This function runs on a new page. Right now, this auto-saves.
  window.onNewPage = function() {
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    if (scene != 'root' && !window.justLoaded) {
        window.dendryUI.autosave();
    }
    if (window.justLoaded) {
        window.justLoaded = false;
    }
  };

  window.updateSidebar = function() {
      $('#qualities').empty();
      var scene = dendryUI.game.scenes[window.statusTab];
      dendryUI.dendryEngine._runActions(scene.onArrival);
      var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
      $('#qualities').append(dendryUI.contentToHTML.convert(displayContent));
      colorTextNodes(document.getElementById('qualities'), colors);
  };

  window.changeTab = function(newTab, tabId) {
      if (tabId == 'poll_tab' && dendryUI.dendryEngine.state.qualities.historical_mode) {
          window.alert('Polls are not available in historical mode.');
          return;
      }
      var tabButton = document.getElementById(tabId);
      var tabButtons = document.getElementsByClassName('tab_button');
      for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(' active', '');
      }
      tabButton.className += ' active';
      window.statusTab = newTab;
      window.updateSidebar();
  };

  window.onDisplayContent = function() {
      window.updateSidebar();
      colorTextNodes(document.getElementById('content'), colors);
  };

  var colors = {
        'Diversity': '#b6a783',
        'Card': '#09effb'
    };
    function colorTextNodes(element, colors) {
        element.childNodes.forEach(function(node) {
            if (node.nodeType === 3) { // text node only
                var text = node.textContent;
                var newHTML = text;
                Object.keys(colors).forEach(function(word) {
                    newHTML = newHTML.replace(new RegExp('\\b' + word + '\\b', 'g'),
                        '<span style="color:' + colors[word] + ';">' + word + '</span>');
                });
                if (newHTML !== text) {
                    var span = document.createElement('span');
                    span.innerHTML = newHTML;
                    node.parentNode.replaceChild(span, node);
                }
            } else if (node.nodeType === 1) { // element node, recurse
                colorTextNodes(node, colors);
            }
        });
    }

  window.generateBar = function(quality, qualityName, max, min, colors) {
      var bar = document.createElement('div');
      bar.className = 'bar';
      var value = document.createElement('div');
      value.className = 'barValue';
      var width = (quality - min)/(max - min);
      if (width > 1) {
          width = 1;
      } else if (width < 0) {
          width = 0;
      }
      value.style.width = Math.round(width*100) + '%';
      if (colors) {
          value.style.backgroundColor = window.probToColor(width*100);
      }
      bar.textContent = qualityName + ': ' + quality;
      if (colors) {
          bar.textContent += '/' + max;
      }
      bar.appendChild(value);
      return bar;
  };
window._decorateChoices = function() {
    var cardRoutes = {
        'main.diversitydeck': 'diversitydecktrue'
    };

    document.querySelectorAll('a.card[card-id]').forEach(function(card) {
        var id = card.getAttribute('card-id');
        if (cardRoutes[id] && !card.dataset.clickAttached) {
            card.dataset.clickAttached = 'true';
            card.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.dendryUI.dendryEngine.goToScene(cardRoutes[id]);
            });
        }
    });
};

function initDecorator() {
    var contentEl = document.getElementById('content');
    if (!contentEl) {
        setTimeout(initDecorator, 100);
        return;
    }
    var decoObserver = new MutationObserver(function() {
        decoObserver.disconnect();
        try {
            window._decorateChoices();
        } catch (e) {
            console.error('[decorator error]', e);
        }
        decoObserver.observe(contentEl, { childList: true, subtree: true });
    });
    decoObserver.observe(contentEl, { childList: true, subtree: true });
    window._decorateChoices();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDecorator);
} else {
    initDecorator();
}

  window.justLoaded = true;
  window.statusTab = "status";
  window.dendryModifyUI = main;
  console.log("Modifying stats: see dendryUI.dendryEngine.state.qualities");

  window.onload = function() {
    window.dendryUI.loadSettings({show_portraits: false});
    if (window.dendryUI.dark_mode) {
        document.body.classList.add('dark-mode');
    }
    window.pinnedCardsDescription = "Advisor cards - actions are only usable once per 6 months.";
  };

}());
