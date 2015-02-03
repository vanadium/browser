var mercury = require('mercury');
var insertCss = require('insert-css');

var methodNameToVarHashKey = require('./methodNameToVarHashKey');

var browseRoute = require('../../../routes/browse');

var displayItemDetails = require('./display-item-details');
var bookmark = require('./bookmark');

var methodForm = require('./method-form/index');
var ErrorBox = require('../../error/error-box/index');

var namespaceUtil = require('../../../services/namespace/service').util;

var css = require('./index.css');
var h = mercury.h;

module.exports = create;
module.exports.render = render;

/*
 * ItemDetails component provides user interfaces for displaying details for
 * a browse item such is its type, signature, etc.
 */
function create() {
  var state = mercury.varhash({

    /*
     * objectName for the item we are showing details of.
     * We keep this in addition to item.objectName since item object may not be
     * present (when in the middle of loading or when failed to load).
     * Keeping itemName separate allows us to render a header with add/remove
     * bookmark actions even when item is loading or has failed to load.
     * @type {string}
     */
    itemName: mercury.value(''),

    /*
     * namespace item to display details for.
     * @see services/namespace/item
     * @type {namespaceitem}
     */
    item: mercury.value(null),

    /*
     * Any fatal error while getting the details.
     * Note: will be displayed to user.
     * @type Error
     */
    error: mercury.value(null),

    /*
     * signature for the item.
     * It's a map with extra information.
     * @see services/namespace/signature-adapter
     * @type {signature}
     */
    signature: mercury.value(null),

    /*
     * Which tab to display; 0 is for service details
     * TODO(alexfandrianto): Once we have more info to display, add more tabs.
     * We are currently combining service details, methods, and outputs.
     * TODO(alexfandrianto): Use an enum instead of a comment to clarify the
     * mapping between tab name and tab index.
     * @type {integer}
     */
    selectedTabIndex: mercury.value(0),

    /*
     * An associative array from item names to method outputs.
     * The outputs are in RPC call-order and store render information.
     * @type {map[string]Array<Object>}
     */
    methodOutputs: mercury.varhash(),

    /*
     * Each method form corresponds to an interface in the signature. It is a
     * map from method names to the relevant state used in the method-form
     * component.
     * @type {[]map[string]mercury.struct}
     */
    methodForms: mercury.array([]),

    /*
     * Each method form could be open or closed. All start out open, except
     * for __Reserved, which is explicitly set to closed.
     * @type {[]boolean}
     */
    methodFormsOpen: mercury.array([]),

    /*
     * Whether a loading indicator should be displayed instead of content
     * @type {mercury.value<boolean>}
     */
    showLoadingIndicator: mercury.value(false),

    /*
     * Whether item is bookmarked
     * @type {mercury.value<boolean>}
     */
    isBookmarked: mercury.value(false)
  });

  var events = mercury.input([
    'bookmark',
    'displayItemDetails',
    'tabSelected',
    'methodForms',
    'toggleMethodForm',
    'toast'
  ]);

  wireUpEvents(state, events);

  // events.methodForms is []events; the index order matches state.methodForms
  // and state.methodFormsOpen.
  events.methodForms = [];

  return {
    state: state,
    events: events
  };
}

/*
 * Render the item details page, which includes tabs for details and methods.
 */
function render(state, events, browseState, navEvents) {
  insertCss(css);

  var tabContent;

  if (state.showLoadingIndicator) {
    tabContent = h('paper-spinner', {
      attributes: {
        'active': true,
        'aria-label': 'Loading'
      }
    });
  } else if (state.item) {
    var detailsContent = renderDetailsContent(state, events);

    var methodsContent;
    if (state.item.isServer) {
      methodsContent = renderMethodsContent(state, events);
    }
    tabContent = [detailsContent, methodsContent];
  } else if (state.error) {
    var errorTitle = 'Unable to connect to ' + state.itemName;
    tabContent = ErrorBox.render(errorTitle, state.error.toString());
  }

  var headerContent = renderHeaderContent(state, events, browseState,
    navEvents);
  var formattedTabTitle = (namespaceUtil.basename(state.itemName) || '<root>');
  return [h('paper-tabs.tabs', {
      attributes: {
        'selected': state.selectedTabIndex,
        'noink': true
      }
    }, [
      h('paper-tab.tab', {
        'ev-click': mercury.event(events.tabSelected, {
          index: 0
        })
      }, formattedTabTitle)
    ]),
    h('core-selector', {
      attributes: {
        'selected': state.selectedTabIndex
      }
    }, [
      h('div.tab-content', [headerContent, tabContent]),
    ])
  ];
}

/*
 * Renders an action bar on top of the details panel page.
 */
function renderActions(state, events, browseState, navEvents) {

  // Collect a list of actions.
  var actions = [];

  // Bookmark action (Add or remove a bookmark)
  var isBookmarked = state.isBookmarked;
  var bookmarkIcon = 'bookmark' + (!isBookmarked ? '-outline' : '');
  var bookmarkTitle = (isBookmarked ? 'Remove bookmark ' : 'Add Bookmark');
  var bookmarkAction = h('core-tooltip', {
      attributes: {
        'label': bookmarkTitle,
        'position': 'right'
      }
    },
    h('paper-icon-button' + (isBookmarked ? '.bookmarked' : ''), {
      attributes: {
        'icon': bookmarkIcon,
        'alt': bookmarkTitle
      },
      'ev-click': mercury.event(events.bookmark, {
        bookmark: !isBookmarked,
        name: state.itemName
      })
    })
  );
  actions.push(bookmarkAction);

  // Browse action (Navigate into this item)
  // This action only appears if this item is globbable and distinct from the
  // current namespace.
  var isGlobbable = state.item ? state.item.isGlobbable : false;
  if (browseState.namespace !== state.itemName && isGlobbable) {
    var browseUrl = browseRoute.createUrl(browseState, {
      namespace: state.itemName
    });
    var itemName = state.itemName || '<root>';
    var browseTitle = 'Change root to ' + itemName;
    var browseAction = h('core-tooltip', {
        attributes: {
          'label': browseTitle,
          'position': 'right'
        }
      },
      h('a', {
        'href': browseUrl,
        'ev-click': mercury.event(navEvents.navigate, {
          path: browseUrl
        })
      }, h('paper-icon-button', {
        attributes: {
          'icon': 'launch',
          'alt': browseTitle
        }
      }))
    );
    actions.push(browseAction);
  }

  return h('div.icon-group.item-actions', actions);
}


/*
 * Renders the header which includes actions and name field.
 * Header is always displayed, even during loading time or when we fail
 * to load details for an item.
 * Note: we should be able to render header without loading signature. Any
 * information about the item other than name and whether it is bookmarked.
 */
function renderHeaderContent(state, events, browseState, navEvents) {
  var actions = renderActions(state, events, browseState, navEvents);
  var headerItems = [
    actions,
    renderFieldItem('Full Name', (state.itemName || '<root>')),
  ];

  return headerItems;
}

/*
 * Renders details about the current service object.
 * Note: Currently renders in the same tab as renderMethodsContent.
 */
function renderDetailsContent(state, events) {
  var displayItems = [];
  displayItems.push(renderTypeFieldItem(state));
  if (state.item.isServer) {
    displayItems.push(renderEndpointsFieldItem(state));
  }
  return [
    h('div', displayItems)
  ];
}

/*
 * Renders the Type Field Item. Includes the type name of the service and its
 * description. Non-servers receive a default type name instead.
 */
function renderTypeFieldItem(state) {
  var item = state.item;
  var typeName;
  var typeDescription;
  if (item.isServer) {
    typeName = item.serverInfo.typeInfo.typeName;
    typeDescription = item.serverInfo.typeInfo.description;
  } else {
    typeName = 'Intermediary Name';
  }

  return renderFieldItem('Type', typeName, {
    contentTooltip: typeDescription
  });
}

/*
 * Renders the Endpoints Field Item, a simple listing of the server's endpoints.
 */
function renderEndpointsFieldItem(state) {
  var item = state.item;
  var endpointDivs;
  if (item.serverInfo.endpoints.length === 0) {
    endpointDivs = [
      h('div', h('span', 'No endpoints found'))
    ];
  } else {
    // Show 1 div per server endpoint.
    endpointDivs = item.serverInfo.endpoints.map(function(endpoint) {
      return h('div', h('span', endpoint));
    });
  }
  return renderFieldItem('Endpoints', h('div', {
    attributes: {
      'vertical': true,
      'layout': true
    }
  }, endpointDivs));
}

/*
 * Renders the method signature forms and the RPC output area.
 * Note: Currently renders in the same tab as renderDetailsContent.
 */
function renderMethodsContent(state, events) {
  var sig = state.signature;
  if (!sig || sig.size === 0) {
    return renderFieldItem('Methods',
      h('div', h('span', 'No method signature')));
  }

  // Render each interface and an output region.
  var content = state.signature.map(function(interface, interfaceIndex) {
    var label = interface.pkgPath + '.' + interface.name;
    var content;
    var open = state.methodFormsOpen[interfaceIndex];
    var options = {
      labelTooltip: interface.doc,
      collapsed: !open,
      callback: events.toggleMethodForm.bind(null, {
        index: interfaceIndex,
        value: !open
      })
    };
    if (!open) {
      content = h('span');
    } else {
      content = renderMethodInterface(state, events, interfaceIndex);
    }
    return renderFieldItem(label, content, options);
  });
  content.push(renderFieldItem('Output', renderMethodOutput(state)));

  return h('div', content);
}

/*
 * Renders each method signature belonging to one of the interfaces of the
 * service. Each form allows RPCs to be made to the associated service.
 */
function renderMethodInterface(state, events, interfaceIndex) {
  var methods = [];

  // Render all the methods in alphabetical order.
  // ES6 Map iterates in the order values were added, so we must sort them.
  var methodNames = [];
  state.signature[interfaceIndex].methods.forEach(
    function(methodData) {
      methodNames.push(methodData.name);
    }
  );
  methodNames.sort().forEach(function(methodName) {
    var methodKey = methodNameToVarHashKey(methodName);
    methods.push(methodForm.render(
      state.methodForms[interfaceIndex][methodKey],
      events.methodForms[interfaceIndex][methodKey]
    ));
  });

  return h('div', methods); // Note: allows 0 method signatures
}

/*
 * Renders the method outputs received by the current service object.
 * Prints each output received in reverse order; most recent is on top.
 */
function renderMethodOutput(state) {
  var outputs = state.methodOutputs[state.item.objectName];
  if (outputs === undefined) {
    return h('div.method-output', h('span', 'No method output'));
  }
  var outputRows = [h('tr', [
    h('th', '#'),
    h('th', 'Method'),
    h('th', 'Output')
  ])];
  for (var i = outputs.length - 1; i >= 0; i--) {
    var output = outputs[i];
    if (output.shouldShow) {
      outputRows.push(
        h('tr', [
          h('td', {
            'scope': 'row'
          }, '' + (i + 1)),
          h('td', h('pre', output.method)),
          h('td', h('pre', output.result))
        ])
      );
    }
  }

  var outputTable = h('table', {
    attributes: {
      'summary': 'Table showing the outputs of methods run on' +
        'the service. The results are shown in reverse order.'
    }
  }, outputRows);
  return h('div.method-output', outputTable);
}

/*TODO(aghassemi) make a web component for this*/
function renderFieldItem(label, content, options) {
  options = options || {};

  var hlabel = h('h4', label);
  var hinfo = h('span');
  if (options.labelTooltip) {
    // If there is a tooltip, create an info icon with that tooltip.
    hinfo = h('core-tooltip.tooltip.field-tooltip', {
      attributes: {
        'label': options.labelTooltip
      },
      'position': 'left'
    }, h('core-icon.icon.info', {
      attributes: {
        'icon': 'info'
      }
    }));
  }
  content = h('span', content);
  if (options.contentTooltip) {
    // If there is a tooltip, wrap the content in it.
    content = h('core-tooltip.tooltip.field-tooltip', {
      attributes: {
        'label': options.contentTooltip
      },
      'position': 'right'
    }, content);
  }

  var expander = h('span');
  if (options.collapsed !== undefined) {
    expander = h('core-icon.icon', {
      attributes: {
        'icon': options.collapsed ? 'chevron-right' : 'expand-more'
      },
      'ev-click': options.callback
    });
  }

  return h('div.field' + (options.collapsed === true ? '.collapsed' : ''), [
    h('div.header', [
      hlabel,
      hinfo,
      expander
    ]),
    h('div.content', content)
  ]);
}

// Wire up events that we know how to handle
function wireUpEvents(state, events) {
  events.displayItemDetails(displayItemDetails.bind(null, state, events));
  events.tabSelected(function(data) {
    state.selectedTabIndex.set(data.index);
  });
  events.bookmark(bookmark.bind(null, state, events));
  events.toggleMethodForm(function(data) {
    state.methodFormsOpen.put(data.index, data.value);
  });
}
