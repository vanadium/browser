// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var mercury = require('mercury');
var insertCss = require('insert-css');
var d3 = require('d3');

var namespaceService = require('../../../../services/namespace/service');
var browseRoute = require('../../../../routes/browse');
var getServiceIcon = require('../../get-service-icon');

var log = require('../../../../lib/log')(
  'components:browse:items:visualize-view'
);

var css = require('./index.css');
var h = mercury.h;

module.exports = create;
module.exports.render = render;
module.exports.clearCache = clearCache;

var DURATION = 500; // d3 animation duration
var STAGGER = 5; // mS delay for each node
var MIN_ZOOM = 0.5; // minimum zoom allowed
var MAX_ZOOM = 20; // maximum zoom allowed
var SYMBOL_STROKE_COLOR = '#00838F';
var SELECTED_COLOR = '#E65100'; // color of selected node
var ZOOM_INC = 0.06; // zoom factor per animation frame
var PAN_INC = 3; //  pan per animation frame
var ROT_INC = 0.5; // rotation per animation frame
var RELATIVE_ROOT = '<Home>';

// keyboard key codes
var KEY_PLUS = 187; // + (zoom in)
var KEY_MINUS = 189; // - (zoom out)
var KEY_PAGEUP = 33; // (rotate CCW)
var KEY_PAGEDOWN = 34; // (rotate CW)
var KEY_LEFT = 37; // left arrow
var KEY_UP = 38; // up arrow
var KEY_RIGHT = 39; // right arrow
var KEY_DOWN = 40; // down arrow
var KEY_SPACE = 32; // (expand node)
var KEY_RETURN = 13; // (expand tree)
var KEY_HOME = 36; // (center root)
var KEY_END = 35; // (center selection)

function create() {}

var widget;

function clearCache() {
  widget = null;
}

function render(itemsState, browseState, browseEvents, navEvents) {
  insertCss(css);

  if (!widget) {
    widget = createWidget(browseState, browseEvents, navEvents);
  } else {
    widget.update(browseState, browseEvents);
  }

  return [
    widget,
    h('div.vismenu', { // visualization menu
    }, [
      h('paper-fab.zoom', {
        attributes: {
          mini: true,
          raised: true,
          icon: 'add',
          title: 'Zoom In (+)',
          'aria-label': 'zoom in'
        },
        'ev-down': widget.polydown.bind(undefined, KEY_PLUS),
        'ev-up': widget.polyup.bind(undefined, KEY_PLUS)
      }),
      h('paper-fab.zoom', {
        attributes: {
          mini: true,
          icon: 'remove',
          title: 'Zoom Out (\u2212)',
          'aria-label': 'zoom out'
        },
        'ev-down': widget.polydown.bind(undefined, KEY_MINUS),
        'ev-up': widget.polyup.bind(undefined, KEY_MINUS),
      }),
      h('paper-fab.rotate', {
        attributes: {
          mini: true,
          icon: 'image:rotate-left',
          title: 'Rotate CCW (Page Up)',
          'aria-label': 'rotate counterclockwise'
        },
        'ev-down': widget.polydown.bind(undefined, KEY_PAGEUP),
        'ev-up': widget.polyup.bind(undefined, KEY_PAGEUP)
      }),
      h('paper-fab.rotate', {
        attributes: {
          mini: true,
          icon: 'image:rotate-right',
          title: 'Rotate CW (Page Down)',
          'aria-label': 'rotate clockwise'
        },
        'ev-down': widget.polydown.bind(undefined, KEY_PAGEDOWN),
        'ev-up': widget.polyup.bind(undefined, KEY_PAGEDOWN)
      }),
      h('paper-fab.expand', {
        attributes: {
          mini: true,
          icon: 'unfold-more', // 'expand-less',
          title: 'Load +1 Level (space bar)',
          'aria-label': 'load +1 level'
        },
        'ev-click': widget.menu.bind(undefined, KEY_SPACE, false)
      })
    ]),
    h('paper-shadow.contextmenu', { // context menu
      attributes: {
        z: 3 // height above background
      }
    }, [ // context menu
      h('paper-item', {
        'ev-mouseup': widget.menu.bind(undefined, KEY_RETURN, false),
        'ev-mousedown': widget.menu.bind(undefined, KEY_RETURN, false)
      }, [h('div.ecnode', 'Expand Node'), h('div.ksc', 'Return')]),
      h('paper-item', {
        'ev-mouseup': widget.menu.bind(undefined, KEY_RETURN, true),
        'ev-mousedown': widget.menu.bind(undefined, KEY_RETURN, true)
      }, [h('div', 'Show Loaded'), h('div.ksc', '\u21E7 Return')]),
      h('paper-item', {
        'ev-mouseup': widget.menu.bind(undefined, KEY_SPACE, false),
        'ev-mousedown': widget.menu.bind(undefined, KEY_SPACE, false)
      }, [h('div', 'Load +1 Level'), h('div.ksc', 'space bar')]),
      h('paper-item', {
        'ev-mouseup': widget.menu.bind(undefined, KEY_SPACE, true),
        'ev-mousedown': widget.menu.bind(undefined, KEY_SPACE, true)
      }, [h('div', 'Browse Into'), h('div.ksc', '\u21E7 space bar')]),
      h('paper-item', {
        'ev-mouseup': widget.menu.bind(undefined, KEY_END, false),
        'ev-mousedown': widget.menu.bind(undefined, KEY_END, false)
      }, [h('div', 'Center Selected'), h('div.ksc', 'End')]),
      h('paper-item', {
        'ev-mouseup': widget.menu.bind(undefined, KEY_HOME, false),
        'ev-mousedown': widget.menu.bind(undefined, KEY_HOME, false)
      }, [h('div', 'Center Root'), h('div.ksc', 'Home')])
    ])
  ];
}

function createWidget(browseState, browseEvents, navEvents) {

  var networkElem; // DOM element for visualization

  var selNode; // currently selected node
  var selectItem; // function to select item in app

  var width, height; // size of the visualization diagram

  var curX, curY, curR, curZ; // transforms (x, y, rotate, zoom)
  var modZ; // modified zoom for nodes and text

  var diagonal; // d3 diagonal projection for use by the node paths
  var treeD3; // d3 tree layout
  var svgBase, svgGroup; // svg elements

  var root; // data trees
  var rootIndex = {}; // index id to nodes

  browseInto.browseState = browseState;
  browseInto.navEvents = navEvents;

  // Constructor for mercury widget for d3 element
  function D3Widget(browseState, browseEvents) {
    this.browseState = browseState;
    this.browseEvents = browseEvents;
  }

  D3Widget.prototype.type = 'Widget';

  D3Widget.prototype.init = function() {
    if (!networkElem) {
      networkElem = document.createElement('div');
      networkElem.className = 'network';
      networkElem.setAttribute('tabindex', 0); // allow focus
      selectItem = this.browseEvents.selectItem.bind(this.browseEvents);
      requestAnimationFrame(initD3);
    }

    // wrap in a new element, needed for Mercury vdom to patch properly.
    var wrapper = document.createElement('div');
    wrapper.className = 'networkParent';
    wrapper.appendChild(networkElem);

    requestAnimationFrame(this.updateRoot.bind(this));

    return wrapper;
  };

  // Keep track of previous namespace that was browsed to so we can
  // know when navigating to a different namespace happens.
  var previousNamespace;

  D3Widget.prototype.polyup = polyup;
  D3Widget.prototype.polydown = polydown;
  D3Widget.prototype.menu = menu;
  D3Widget.prototype.update = function(browseState, browseEvents) {

    // handle changed selection
    selNode = rootIndex[browseState.selectedItemName] || selNode;

    this.browseState = browseState;
    this.browseEvents = browseEvents;

    // check to see if window was resized while we were away
    if (width !== networkElem.offsetWidth) {
      resize();
    }

    this.updateRoot();

    networkElem.focus();
  };

  // build new data tree
  D3Widget.prototype.updateRoot = function() {
    var rootNodeId = this.browseState.namespace;

    if (previousNamespace !== rootNodeId) {

      previousNamespace = rootNodeId;

      // parse root id
      var parts = namespaceService.util.parseName(rootNodeId);

      var isRooted = namespaceService.util.isRooted(rootNodeId);
      var buildId = '';
      if (!isRooted) {
        parts.unshift('');
      } // create <Home> node

      var parent; // used to connect each new node to their parent

      parts.forEach(function(v) {
        buildId += (buildId.length > 0 || isRooted ? '/' : '') + v;
        var nn = rootIndex[buildId] || {};
        var isNew = (nn.id === undefined);
        nn.id = buildId;
        nn.name = v || RELATIVE_ROOT;
        nn.isLeaf = false;
        nn.hasServer = true; // assume true, fix later
        nn.hasMountPoint = true; // assume true, fix later
        if (parent !== undefined) {
          nn.parent = parent;
          if (parent.children === undefined && parent._children === undefined) {
            parent._children = [nn]; // initially hidden
          }
        }
        if (isNew) {
          rootIndex[buildId] = nn;
        }
        parent = nn;
      });

      root = parent; // new root

      if (selNode === undefined) {
        selectNode(root);
      }

      loadItem(root); // load rest of information for this node
      loadSubItems(root); // load the children
    }

    updateD3(root, true); // always animate
  };

  // initialize d3 HTML elements
  function initD3() {

    // size of the diagram
    width = networkElem.offsetWidth;
    height = networkElem.offsetHeight;

    // current pan, zoom, and rotation
    curX = width / 2; // center
    curY = height / 2;
    curZ = modZ = 1.0; // current zoom
    curR = 270; // current rotation

    // d3 diagonal projection for use by the node paths
    diagonal = d3.svg.diagonal.radial().
    projection(function(d) {
      return [d.y, d.x / 180 * Math.PI];
    });

    // d3 tree layout
    treeD3 = d3.layout.tree().
      // circular coordinates to fit in window
      // 120 is to allow space for text strings
    size([360, Math.min(width, height) / 2 - 120]).
      // space between nodes, depends on if they have same parent
      // dividing by a.depth is for radial coordinates
    separation(function(a, b) {
      return (a.parent === b.parent ? 1 : 2) / (a.depth + 1);
    });

    // define the svgBase, attaching a class for styling and the zoomListener
    svgBase = d3.select('.network').append('svg').
    attr('width', width).
    attr('height', height).
    attr('class', 'overlay').
    on('mousedown', mousedown);

    // Group which holds all nodes and manages pan, zoom, rotate
    svgGroup = svgBase.append('g').
    attr('transform', 'translate(' + curX + ',' + curY + ')');

    networkElem.focus();
    d3.select('.network'). // set up document events
    on('wheel', wheel). // zoom, rotate
    on('keydown', keydown).
    on('keyup', keyup).
    on('mouseover', function() {
      networkElem.focus();
    });
    d3.select(window).on('resize', resize);
  }

  // draw tree using d3js
  // subroot - source node of the update
  // doAni - whether to do a transition animation
  function updateD3(subroot, doAni) {
      // length of d3 animation
      var duration = (d3.event && d3.event.altKey ? DURATION * 4 : DURATION);

      // Compute the new tree layout.
      var d3nodes = treeD3.nodes(root);
      var d3links = treeD3.links(d3nodes);

      // Update the view
      var view = doAni ? svgGroup.transition().duration(duration) : svgGroup;

      view.attr('transform',
        'rotate(' + curR + ' ' + curX + ' ' + curY +
        ')translate(' + curX + ' ' + curY +
        ')scale(' + curZ + ')');

      var gnode = svgGroup.selectAll('g.node').
      data(d3nodes, function(d) {
        return d.id;
      });

      // Enter any new nodes at the parent's previous position
      var nodeEnter = gnode.enter().insert('g', ':first-child').
      attr('class', 'node').
      attr('opacity', 0).
      attr('transform', 'rotate(' + (subroot.x - 90) +
        ')translate(' + subroot.y + ')').
      on('click', click).on('dblclick', dblclick).
      on('contextmenu', showContextMenu);

      nodeEnter.append('title').text(function(d) {
        return getServiceIcon(d).title;
      });

      nodeEnter.filter(function(d) { // Mount Point
        return d.hasMountPoint;
      }).append('path').attr('class', 'mountpointicon').
      attr('d', d3.svg.symbol().type('square'));

      nodeEnter.filter(function(d) { // Server
        return d.hasServer;
      }).append('path').attr('class', 'servericon').
      attr('d', d3.svg.symbol().type('circle').size(60));

      nodeEnter.append('text').
      text(function(d) {
        return d.name;
      }).
      attr('transform', ((subroot.x + curR) % 360 <= 180 ?
        'rotate(-7)translate(8)scale(' : 'rotate(187)translate(-8)scale('
      ) + modZ + ')');

      // update existing graph nodes

      // set path style for selection, loading, and scale
      gnode.select('path').
      attr('transform', 'scale(' + modZ + ')').
      classed('loading', function(d) {
        return d.loading;
      }).
      attr('stroke', function(d) {
        return d === selNode ? SELECTED_COLOR : SYMBOL_STROKE_COLOR;
      }).
      attr('stroke-width', function(d) {
        return d === selNode ? 3 : 2;
      });

      gnode.select('title').text(function(d) {
        return getServiceIcon(d).title;
      });

      // remove icons if assumed true but turn out to be false
      gnode.select('path.servericon').filter(function(d) {
        return !d.hasServer;
      }).remove();
      gnode.select('path.mountpointicon').filter(function(d) {
        return !d.hasMountPoint;
      }).remove();

      gnode.select('text').
      attr('text-anchor', function(d) {
        return (d.x + curR) % 360 <= 180 ? 'start' : 'end';
      }).
      attr('transform', function(d) {
        return ((d.x + curR) % 360 <= 180 ?
          'rotate(-7)translate(8)scale(' :
          'rotate(187)translate(-8)scale('
        ) + modZ + ')';
      }).
      attr('fill', function(d) {
        return d === selNode ? SELECTED_COLOR : 'black';
      }).
      attr('dy', '5px');

      var nodeUpdate = (doAni ?
        gnode.transition().duration(duration).delay(function(d, i) {
          return i * STAGGER + Math.max(0, d.depth - selNode.depth);
        }) : gnode);

      nodeUpdate.attr('transform', function(d) {
        return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
      }).style('opacity', 1);

      nodeUpdate.select('path').
      attr('transform', 'scale(' + modZ + ')');

      // Transition exiting nodes to the parent's new position and remove
      var nodeExit = doAni ? gnode.exit().transition().duration(duration).
      delay(function(d, i) {
        return i * STAGGER;
      }): gnode.exit();

      nodeExit.attr('transform', function(d) {
        return 'rotate(' + (subroot.x - 90) + ')translate(' + subroot.y + ')';
      }).
      attr('opacity', 0).
      remove();

      nodeExit.select('.node path').attr('transform', 'scale(0)');
      nodeExit.select('.node text').style('fill-opacity', 0);

      // Update the links…
      var glink = svgGroup.selectAll('path.link').
      data(d3links, function(d) {
        return d.target.id;
      });

      // Enter any new links at the parent's previous position
      glink.enter().insert('path', 'g').
      attr('class', 'link').
      attr('d', function() {
        var o = {
          x: subroot.x,
          y: subroot.y
        };
        return diagonal({
          source: o,
          target: o
        });
      });

      // Transition links to their new position
      (doAni ? glink.transition().duration(duration).delay(function(d, i) {
        return i * STAGGER + Math.max(0, d.source.depth - selNode.depth);
      }) : glink).
      attr('d', diagonal);

      // Transition exiting nodes to the parent's new position
      (doAni ? glink.exit().transition().duration(duration) : glink.exit()).
      attr('d', function() {
        var o = {
          x: subroot.x,
          y: subroot.y
        };
        return diagonal({
          source: o,
          target: o
        });
      }).
      remove(); // remove edge at end of animation
    } // end updateD3

  // find place to insert new node in children
  var bisectfun = d3.bisector(function(d) {
    return d.name;
  }).right;

  // create node or merge new item data into it
  function mergeNode(item, parent) {
      var nn = rootIndex[item.objectName] || {};
      var isNew = nn.id === undefined; // not found in rootIndex
      nn.id = item.objectName;
      nn.name = item.mountedName || RELATIVE_ROOT;
      nn.parent = parent || nn.parent;
      nn.isLeaf = item.isLeaf;
      nn.hasMountPoint = item.hasMountPoint;
      nn.hasServer = item.hasServer;
      if (isNew && parent !== undefined) { // insert node in proper place
        rootIndex[nn.id] = nn;
        if (parent.children === undefined) {
          parent.children = [nn];
        } else {
          parent.children.splice(bisectfun(parent.children, nn.name), 0, nn);
        }
      }
      return isNew; // need to animate it in
    } // end mergeNode

  function loadItem(node) { // load a single item (used for root of tree)
    namespaceService.getNamespaceItem(node.id).then(function(observable) {
      mercury.watch(observable, updateItem);

      function updateItem(item) { // currently only gets called once
        mergeNode(item, node.parent); // update elsewhere
      }
    });
  }

  // load children items asynchronously
  function loadSubItems(node) {
      if (node.subNodesLoaded) {
        return;
      }
      var namespace = node.id;
      if (node._children) {
        node.children = node._children;
        node._children = null;
      }
      node.subNodesLoaded = true;
      showLoading(node, true); // node is loading

      namespaceService.getChildren(namespace).then(function(resultObservable) {
        var initialValues = resultObservable();
        initialValues.forEach(function(item) {
          batchUpdate(node, mergeNode(item, node));
        });
        resultObservable.events.once('end', function() {
          showLoading(node, false); // node no longer loading
        });

        resultObservable(updatedValues);

        function updatedValues(results) {
          // TODO(wmleler) support removed and updated nodes for watchGlob
          var item = results._diff[0][2]; // changed item from Mercury
          batchUpdate(node, mergeNode(item, node));
        }
      }).catch(function(err) {
        log.error('glob failed', err);
      });
    } // end loadSubItems

  // batch up groups of updates to speed up transitions
  var batchNode = null;
  var batchId = null;

  function batchUpdate(node, doAni) {
    if (node !== batchNode) {
      if (batchNode !== null) {
        updateD3(batchNode, doAni);
      }
      batchNode = node;
      if (batchId !== null) {
        clearTimeout(batchId);
        batchId = null;
      }
    } else {
      batchId = setTimeout(function() {
        updateD3(batchNode, doAni);
        batchId = null;
      }, DURATION);
    }
  }

  function selectNode(node) { // highlight node and show details
    if (node === selNode) {
      return;
    }
    selNode = node;
    selectItem({
      name: node.id
    }); // notify rest of app
  }

  function browseInto(node) { // make this node the root
    var browseUrl = browseRoute.createUrl(browseInto.browseState, {
      namespace: node.id
    });
    browseInto.navEvents.navigate({
      path: browseUrl
    });
  }

  // set view with no animation
  function setview() {
    svgGroup.attr('transform',
      'rotate(' + curR + ' ' + curX + ' ' + curY +
      ')translate(' + curX + ' ' + curY +
      ')scale(' + curZ + ')');
    svgGroup.selectAll('text').
    attr('text-anchor', function(d) {
      return (d.x + curR) % 360 <= 180 ? 'start' : 'end';
    }).
    attr('transform', function(d) {
      return ((d.x + curR) % 360 <= 180 ?
        'rotate(-7)translate(8)scale(' :
        'rotate(187)translate(-8)scale('
      ) + modZ + ')';
    });
    svgGroup.selectAll('.node path').
    attr('transform', 'scale(' + modZ + ')').
    attr('stroke-width', function(d) {
      return d === selNode ? 3 : 2;
    });
  }

  // show nodes that are loading
  function showLoading(node, v) {
    node.loading = v;
    svgGroup.selectAll('.node path').
    classed('loading', function(d) {
      return d.loading;
    });
  }

  //
  // Helper functions for collapsing and expanding nodes
  //

  // Toggle expand / collapse
  function toggle(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else if (d._children && d.subNodesLoaded) {
      d.children = d._children;
      d._children = null;
    } else {
      loadSubItems(d);
    }
  }

  function collapse(d) { // collapse one level
    if (d.children) {
      d._children = d.children;
      d.children = null;
    }
  }

  // expand all loaded children and descendents
  function expandTree(d) {
    if (d._children) {
      d.children = d._children;
      d._children = null;
    }
    if (d.children) {
      d.children.forEach(expandTree);
    }
  }

  // expand one level of tree using breadth first search
  function expand1Level(d) {
    var q = [d]; // non-recursive using queue
    var cn;
    var done = null;
    while (q.length > 0) {
      cn = q.shift();
      if (done !== null && done < cn.depth) {
        return;
      }
      if (cn._children) {
        done = cn.depth;
        cn.children = cn._children;
        cn._children = null;
        cn.children.forEach(collapse);
      } else if (!(cn.isLeaf || cn.subNodesLoaded)) {
        done = cn.depth;
        loadSubItems(cn);
      }
      if (cn.children) {
        q = q.concat(cn.children);
      }
    }
    // no nodes to open
  }

  var moveX = 0,
    moveY = 0,
    moveZ = 0,
    moveR = 0; // animations
  var keysdown = []; // which keys are currently down
  var animation = null;
  var aniTime = null; // time since last animation frame

  // update animation frame
  function frame(frametime) {
    var diff = aniTime ? (frametime - aniTime) / 16 : 0;
    aniTime = frametime;

    var dz = Math.pow(1.2, diff * moveZ);
    var newZ = limitZ(curZ * dz);
    dz = newZ / curZ;
    curZ = newZ;
    modZ = Math.pow(1.1, -curZ); // limit text and node size as scale increases
    curX += diff * moveX - (width / 2 - curX) * (dz - 1);
    curY += diff * moveY - (height / 2 - curY) * (dz - 1);
    curR = limitR(curR + diff * moveR);
    setview();
    animation = requestAnimationFrame(frame);
  }

  // enforce zoom extent
  function limitZ(z) {
    return Math.max(Math.min(z, MAX_ZOOM), MIN_ZOOM);
  }

  // keep rotation between 0 and 360
  function limitR(r) {
    return (r + 360) % 360;
  }

  //
  // d3 event handlers
  //

  function resize() { // window resize
    if (networkElem.offsetWidth === 0) {
      return;
    }
    var oldwidth = width;
    var oldheight = height;
    width = networkElem.offsetWidth;
    height = networkElem.offsetHeight;
    treeD3.size([360, Math.min(width, height) / 2 - 120]);
    svgBase.attr('width', width).attr('height', height);
    curX += (width - oldwidth) / 2;
    curY += (height - oldheight) / 2;
    svgGroup.attr('transform',
      'rotate(' + curR + ' ' + curX + ' ' + curY +
      ')translate(' + curX + ' ' + curY +
      ')scale(' + curZ + ')');
    updateD3(root, false);
  }

  function click(d) { // Select node
    if (d3.event.defaultPrevented || d === selNode) {
      return;
    }
    selectNode(d);
    updateD3(d, false);
    d3.event.preventDefault();
  }

  function dblclick(d) { // Toggle children of node
    if (d3.event.defaultPrevented) {
      return;
    } // click suppressed
    d3.event.preventDefault();
    if (d3.event.shiftKey) {
      expand1Level(d);
    } else {
      toggle(d);
    }
    updateD3(d, true);
  }

  var startposX, startposY; // initial position on mouse button down for pan

  function mousedown() { // pan action from mouse drag
    if (d3.event.which !== 1) {
      return;
    } // ingore other mouse buttons
    startposX = curX - d3.event.clientX;
    startposY = curY - d3.event.clientY;
    d3.select(document).on('mousemove', mousemove, true);
    d3.select(document).on('mouseup', mouseup, true);
    networkElem.focus();
    d3.event.preventDefault();
  }

  function mousemove() { // drag
    curX = startposX + d3.event.clientX;
    curY = startposY + d3.event.clientY;
    setview();
    d3.event.preventDefault();
  }

  function mouseup() { // cleanup
    d3.select(document).on('mousemove', null);
    d3.select(document).on('mouseup', null);
  }

  function wheel() { // mousewheel (including left-right)
    var dz, newZ;
    var slow = (d3.event && d3.event.altKey) ? 0.25 : 1;
    if (d3.event.wheelDeltaY !== 0) { // up-down = zoom
      dz = Math.pow(1.2, d3.event.wheelDeltaY * 0.001 * slow);
      newZ = limitZ(curZ * dz);
      dz = newZ / curZ;
      curZ = newZ;
      // zoom around mouse position
      curX -= (d3.event.clientX - curX) * (dz - 1);
      curY -= (d3.event.clientY - curY) * (dz - 1);
      setview();
    }
    if (d3.event.wheelDeltaX !== 0) { // left-right = rotate
      curR = limitR(curR + d3.event.wheelDeltaX * 0.01 * slow);
      updateD3(root, false);
    }
  }

  function polydown(key, evt) { // polymer ev-mousedown event
    actionDown(key, evt.shiftKey, evt.altKey);
  }

  function polyup(key, evt) { // polymer ev-mouseup event
    actionUp(key);
  }

  function menu(key, shift, evt) { // context menu selection event
    if (evt === undefined) { // shiftkey not supplied
      evt = shift;
      shift = evt.shiftKey;
    }
    actionDown(key, shift, evt.altKey);
    networkElem.focus();
  }

  function keydown() { // d3 keydown event
    var evt = d3.event;
    if (evt.repeat) {
      return;
    }
    actionDown(evt.which, evt.shiftKey, evt.altKey);
  }

  function keyup() { // d3 keyup event
    var evt = d3.event;
    actionUp(evt.which);
  }

  // right click, show context menu and select this node
  function showContextMenu(d) {
    d3.event.preventDefault();
    d3.select('.ecnode').text(
      (d.children ? 'Collapse ' : 'Expand ') + 'Node');
    var cmenu = d3.select('.contextmenu');
    cmenu.style({
      left: Math.min(d3.event.offsetX + 3,
        width - cmenu.style('width').replace('px', '') - 5) + 'px',
      top: (d3.event.offsetY + 8) + 'px',
      display: 'block'
    });
    var doc = d3.select(document);
    doc.on('mousedown.cm', hideContextMenu, true);
    setTimeout(function() {
      doc.on('mouseup.cm', hideContextMenu, true);
    }, 500);
    selectNode(d);
  }

  function hideContextMenu() {
    var doc = d3.select(document);
    d3.select('.contextmenu').style('display', 'none');
    doc.on('mouseup.cm', null);
    doc.on('mousedown.cm', null);
    networkElem.focus();
  }


  // Event actions
  // Almost all UI actions pass through here,
  // even if they are not originally generated from the keyboard
  // There are two types of actions:
  // * Press-and-Hold actions perform some action while they are pressed,
  //   until they are released, like pan, zoom, and rotate. These actions end
  //   with "break", so the key can be saved, and actionUp can stop the action.
  // * Click actions mostly happen on keydown, like toggling children.
  function actionDown(key, shift, alt) {
    var parch; // parent's children
    var slow = alt ? 0.25 : 1;
    if (keysdown.indexOf(key) >= 0) {
      return;
    } // defeat auto repeat
    switch (key) {
      case KEY_PLUS: // zoom in
        moveZ = ZOOM_INC * slow;
        break;
      case KEY_MINUS: // zoom out
        moveZ = -ZOOM_INC * slow;
        break;
      case KEY_PAGEUP: // rotate counterclockwise
        moveR = -ROT_INC * slow;
        break;
      case KEY_PAGEDOWN: // rotate clockwise
        moveR = ROT_INC * slow;
        break;
      case KEY_LEFT:
        if (shift) { // move selection to parent
          if (!selNode) {
            selectNode(root);
          } else if (selNode.parent) {
            selectNode(selNode.parent);
            updateD3(selNode, false);
          }
          return;
        }
        moveX = -PAN_INC * slow; // pan left
        break;
      case KEY_UP:
        if (shift) { // move selection to previous child
          if (!selNode) {
            selectNode(root);
          } else if (selNode.parent) {
            parch = selNode.parent.children;
            selectNode(parch[(parch.indexOf(selNode) +
              parch.length - 1) % parch.length]);
            updateD3(selNode, false);
          }
          return;
        }
        moveY = -PAN_INC * slow; // pan up
        break;
      case KEY_RIGHT:
        if (shift) { // move selection to first/last child
          if (!selNode) {
            selectNode(root);
          } else {
            if (selNode.children && selNode.children.length > 0) {
              selectNode(selNode.children[0]);
              updateD3(selNode, false);
            }
          }
          return;
        }
        moveX = PAN_INC * slow; // pan right
        break;
      case KEY_DOWN:
        if (shift) { // move selection to next child
          if (!selNode) {
            selectNode(root);
          } else if (selNode.parent) {
            parch = selNode.parent.children;
            selectNode(parch[(parch.indexOf(selNode) + 1) % parch.length]);
            updateD3(selNode, false);
          }
          return;
        }
        moveY = PAN_INC * slow; // pan down
        break;
      case KEY_RETURN:
        if (!selNode) {
          selectNode(root);
        }
        if (shift) { // show loaded
          expandTree(selNode);
          loadSubItems(selNode);
        } else {
          toggle(selNode); // expand/collapse node
        }
        updateD3(selNode, true);
        return;
      case KEY_SPACE:
        if (!selNode) {
          selectNode(root);
        }
        if (shift) { // browse into
          browseInto(selNode);
        } else { // load +1 level
          expand1Level(selNode);
          updateD3(selNode, true);
        }
        return;
      case KEY_HOME: // reset transform
        curX = width / 2;
        curY = height / 2;
        curR = limitR(90 - root.x);
        curZ = 1;
        updateD3(root, true);
        return;
      case KEY_END: // zoom to selection
        if (!selNode) {
          return;
        }
        curX = width / 2 - selNode.y * curZ;
        curY = height / 2;
        curR = limitR(90 - selNode.x);
        updateD3(selNode, true);
        return;
      default:
        return; // ignore other keys
    }
    keysdown.push(key);
    // start animation if anything happening
    if (keysdown.length > 0 && animation === null) {
      animation = requestAnimationFrame(frame);
    }
  }

  function actionUp(key) {
    var pos = keysdown.indexOf(key);
    if (pos < 0) {
      return;
    }

    switch (key) {
      case KEY_PLUS: // - = zoom out
      case KEY_MINUS: // + = zoom in
        moveZ = 0;
        break;
      case KEY_PAGEUP: // page up = rotate CCW
      case KEY_PAGEDOWN: // page down = rotate CW
        moveR = 0;
        break;
      case KEY_LEFT: // left arrow
      case KEY_RIGHT: // right arrow
        moveX = 0;
        break;
      case KEY_UP: // up arrow
      case KEY_DOWN: // down arrow
        moveY = 0;
        break;
    }
    keysdown.splice(pos, 1); // remove key
    if (keysdown.length > 0 || animation === null) {
      return;
    }
    cancelAnimationFrame(animation);
    animation = aniTime = null;
    networkElem.focus();
  }

  return new D3Widget(browseState, browseEvents);
}