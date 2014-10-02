var mercury = require('mercury');
var AttributeHook = require('../../../lib/mercury/attribute-hook');
var insertCss = require('insert-css');
var displayItemDetails = require('./display-item-details');
var makeRPC = require('./make-rpc');
var browseService = require('../../../services/browse-service');
var smartService = require('../../../services/smart-service');
var h = mercury.h;
var css = require('./index.css');
var methodForm = require('./method-form/index.js');

module.exports = create;
module.exports.render = render;

/*
 * ItemDetails component provides user interfaces for displaying details for
 * a browse item such is its type, signature, etc.
 */
function create() {
  var state = mercury.struct({
    /*
     * Item name to display settings for
     * @type {string}
     */
    itemName: mercury.value(''),

    /*
     * Method signature for the name, if pointing to a server
     * @type {Object}
     */
    signature: mercury.value(null),

    /*
     * Which tab to display; 0 is Details, 1 is Methods
     * @type {integer}
     */
    selectedTabIndex: mercury.value(0),

    /*
     * The details information for each service object.
     * Can include recommended details information.
     * @type {map[string]map[string]string|mercury|float}
     * details information: string or mercury element
     * recommended details information: float
     */
    details: mercury.varhash(),

    /*
     * List of RPC method outputs
     * @type {Array<string>}
     */
    methodOutputs: mercury.array([]),

    /*
     * The method form has information for each service object. It maps method
     * names to the relevant state used in the renderMethod module.
     * @type {map[string]mercury.struct}
     */
    methodForm: mercury.varhash()
  });

  var events = mercury.input([
    'displayItemDetails',
    'tabSelected',
    'methodCalled',
    'methodRemoved',
    'methodCancelled',
    'methodForm'
  ]);

  wireUpEvents(state, events);
  events.methodForm = mercury.varhash();

  return {
    state: state,
    events: events
  };
}

/*
 * Render the item details page, which includes tabs for details and methods.
 */
function render(state, events) {
  insertCss(css);

  // Only render the selected tab to avoid needless re-rendering.
  var detailsTab, methodsTab;
  if (state.selectedTabIndex === 0) {
    detailsTab = renderDetailsTab(state, events);
    methodsTab = '';
  } else {
    detailsTab = '';
    methodsTab = renderMethodsTab(state, events);
  }

  return [h('paper-tabs.tabs', {
      'selected': new AttributeHook(state.selectedTabIndex),
      'noink': new AttributeHook(true)
    }, [
      h('paper-tab.tab', {
        'ev-click': mercury.event(events.tabSelected, {
          index: 0
        })
      }, 'Details'),
      h('paper-tab.tab', {
        'ev-click': mercury.event(events.tabSelected, {
          index: 1
        })
      }, 'Methods')
    ]),
    h('core-selector', {
      'selected': new AttributeHook(state.selectedTabIndex)
    }, [
      h('div.tab-content', detailsTab),
      h('div.tab-content', methodsTab)
    ])
  ];
}

/*
 * The details tab renders details about the current service object.
 * This includes the output of parameterless RPCs made on that object.
 * It also includes recommendations for parameterless RPCs.
 */
function renderDetailsTab(state, events) {
  var typeInfo = browseService.getTypeInfo(state.signature);
  var displayItems = [
    renderFieldItem('Name', (state.itemName || '<root>')),
    renderFieldItem('Type', typeInfo.name, typeInfo.description)
  ];

  // In addition to the Name and Type, render additional service details.
  var details = state.details[state.itemName];
  for (var method in details) {
    if (details.hasOwnProperty(method)) {
      // TODO(alexfandrianto): We may wish to replace this with something less
      // arbitrary. Currently, strings are treated as stringified RPC output.
      // And mercury elements can also be rendered this way.
      // Numbers are treated as the prediction values of recommended items.
      if (typeof details[method] !== 'number') {
        // These details are already known.
        displayItems.push(
          renderFieldItem(
            method,
            details[method]
          )
        );
      } else {
        // These details need to be queried.
        displayItems.push(
          renderFieldItem(
            method,
            renderSuggestRPC(state, events, method, details[method])
          )
        );
      }
    }
  }

  return [
    h('div', displayItems)
  ];
}

/*
 * The methods tab renders the signature, input form, and output area.
 */
function renderMethodsTab(state, events) {
  return h('div', [
    renderMethodSignatures(state, events),
    renderMethodOutput(state)
  ]);
}

/*
 * Renders each method signature with associated form for entering inputs and
 * making RPCs to the associated service.
 */
function renderMethodSignatures(state, events) {
  var sig = state.signature;
  if (!sig) {
    return h('div.empty', 'No method signature');
  }

  var methods = [];

  // Render all the methods in alphabetical order.
  Object.getOwnPropertyNames(sig).sort().forEach(function(m) {
    methods.push(methodForm.render(state.methodForm[m], events.methodForm[m]));
  });

  return h('div.signature', methods); // Note: allows 0 method signatures
}

/*
 * Renders the method outputs received by the current service object.
 * Prints each output received in reverse order; most recent is on top.
 */
function renderMethodOutput(state) {
  if (state.methodOutputs.length === 0) {
    return h('div.method-output', 'No method output');
  }
  var outputRows = [h('tr', [
    h('th', '#'),
    h('th', 'Method'),
    h('th', 'Output')
  ])];
  for (var i = state.methodOutputs.length - 1; i >= 0; i--) {
    outputRows.push(
      h('tr', [
        h('td', { 'scope': 'row' }, '' + (i + 1)),
        h('td', h('pre', state.methodOutputs[i][0])),
        h('td', h('pre', state.methodOutputs[i][1]))
      ])
    );
  }

  var outputTable = h('table', {
    'summary': new AttributeHook('Table showing the outputs of methods run' +
      'on the service. The results are shown in reverse order.')
  }, outputRows);
  return h('div.method-output', outputTable);
}

/*
 * Renders the suggestion buttons for an RPC.
 */
function renderSuggestRPC(state, events, methodName, prediction) {
  var buttons = [];
  // The run button is rendered to initiate the RPC.
  buttons.push(renderRPCRunButton(state, events, methodName, false, []));

  // A remove button is rendered to remove the recommendation.
  buttons.push(renderRPCRemoveSuggestButton(state, events, methodName));

  return h('div', buttons);
}

/*
 * Renders a Run button to make RPCs
 */
function renderRPCRunButton(state, events, methodName, hasParams, args) {
  var ev = mercury.event(events.methodCalled, {
    name: state.itemName,
    methodName: methodName,
    hasParams: hasParams,
    signature: state.signature,
    args: args
  });
  var runButton = h(
    'paper-button.method-input-run',
    {
      'href': '#',
      'ev-click': ev,
      'label': 'RUN',
      'icon': new AttributeHook('av:play-circle-outline')
    }
  );
  return runButton;
}

/*
 * Renders a button to remove suggested RPCs.
 */
function renderRPCRemoveSuggestButton(state, events, methodName) {
  var ev = mercury.event(events.methodRemoved, {
    name: state.itemName,
    methodName: methodName,
    signature: state.signature,
    reward: -1
  });
  return h(
    'paper-button.method-input-remove',
    {
      'href': '#',
      'ev-click': ev,
      'label': 'REMOVE',
      'icon': new AttributeHook('close')
    }
  );
}

/*TODO(aghassemi) make a web component for this*/
function renderFieldItem(label, content, tooltip) {
  var hlabel = h('h4', label);
  if (tooltip) {
    // If there is a tooltip, wrap the content in it
    content = h('core-tooltip.tooltip', {
      'label': new AttributeHook(tooltip),
      'position': 'right'
    }, content);
  }

  return h('div.field', [
    h('h4', hlabel),
    h('div.content', content)
  ]);
}

// Wire up events that we know how to handle
function wireUpEvents(state, events) {
  events.displayItemDetails(displayItemDetails.bind(null, state, events));
  events.tabSelected(function(data) {
    state.selectedTabIndex.set(data.index);
  });
  events.methodCalled(makeRPC.bind(null, state));
  events.methodRemoved(function(data) {
    var detail = state.details[data.name];
    delete detail[data.methodName];

    // Log the removed RPC to the smart service.
    smartService.record('learner-autorpc', data);
    state.details.put(data.name, detail);
    smartService.save('learner-autorpc');
  });
  events.methodCancelled(function(data) {
    var detail = state.details[data.name];
    detail[data.methodName] = 0;

    // Log the removed RPC to the smart service.
    smartService.record('learner-autorpc', data);
    state.details.put(data.name, detail);
    smartService.save('learner-autorpc');
  });
}
