// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var mercury = require('mercury');
var insertCss = require('insert-css');
var getServiceIcon = require('../../get-service-icon');

var browseRoute = require('../../../../routes/browse');

var css = require('./index.css');
var h = mercury.h;

module.exports.render = render;

/*
 * Renders a namespace item in a card view.
 * @param item {namespaceitem} @see services/namespace/item
 */
function render(item, browseState, browseEvents, navEvents, showShortName,
  hoverActionInfo) {

  insertCss(css);

  var selected = (browseState.selectedItemName === item.objectName);
  var url = browseRoute.createUrl(browseState, {
    namespace: item.objectName
  });

  // Prepare the drill if this item happens to be globbable.
  var expandAction = null;
  if (!item.isLeaf) {
    expandAction = h('a.drill', {
      'href': url,
      'ev-click': mercury.event(navEvents.navigate, {
        path: url
      })
    }, h('core-icon.action-icon', {
      attributes: {
        'icon': 'chevron-right'
      }
    }));
  }

  // Prepare tooltip and service icon information for the item.
  var itemTooltip = item.objectName;
  var iconCssClass = '.service-type-icon';
  var iconAttributes = {};
  var iconInfo = getServiceIcon(item);
  iconAttributes.attributes = {
    title: iconInfo.title,
    icon: iconInfo.icon
  };

  // Construct the service icon.
  var iconNode = h('core-icon' + iconCssClass, iconAttributes);

  // Put the item card's pieces together.
  var itemClassNames = 'item.card' + (selected ? '.selected' : '');

  var cardLabel = (showShortName ? item.mountedName : item.objectName) ||
    '<Home>';

  var hoverAction;
  if (hoverActionInfo) {
    hoverAction = renderHoverAction(item.objectName, hoverActionInfo);
  }

  return h('div.' + itemClassNames, {
    'title': itemTooltip
  }, [
    h('a.label', {
      'href': 'javascript:;',
      'ev-click': mercury.event(
        browseEvents.selectItem, {
          name: item.objectName
        })
    }, [
      iconNode,
      h('span.right-justify', cardLabel)
    ]),
    expandAction,
    hoverAction
  ]);
}

/*
 * The hover action must have an icon and an event handler.
 */
function renderHoverAction(objectName, hoverAction) {
  return h('div.action-bar', h('paper-fab', {
    attributes: {
      'aria-label': hoverAction.description,
      'title': hoverAction.description,
      'icon': hoverAction.icon,
      'mini': true
    },
    'ev-click': hoverAction.action.bind(null, objectName)
  }));
}