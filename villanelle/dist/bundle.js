(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
;(function(undefined) {
  'use strict';

  var __instances = {};

  // Deal with resize.  skip this for node.js apps
  if (typeof window != 'undefined')
    window.addEventListener('resize', function() {
      for (var key in __instances) {
        if (__instances.hasOwnProperty(key)) {
          var instance = __instances[key];
          instance.refresh();
        }
      }
    });

  /**
   * This is the sigma instances constructor. One instance of sigma represent
   * one graph. It is possible to represent this grapĥ with several renderers
   * at the same time. By default, the default renderer (WebGL + Canvas
   * polyfill) will be used as the only renderer, with the container specified
   * in the configuration.
   *
   * @param  {?*}    conf The configuration of the instance. There are a lot of
   *                      different recognized forms to instantiate sigma, check
   *                      example files, documentation in this file and unit
   *                      tests to know more.
   * @return {sigma}      The fresh new sigma instance.
   *
   * Instanciating sigma:
   * ********************
   * If no parameter is given to the constructor, the instance will be created
   * without any renderer or camera. It will just instantiate the graph, and
   * other modules will have to be instantiated through the public methods,
   * like "addRenderer" etc:
   *
   *  > s0 = new sigma();
   *  > s0.addRenderer({
   *  >   type: 'canvas',
   *  >   container: 'my-container-id'
   *  > });
   *
   * In most of the cases, sigma will simply be used with the default renderer.
   * Then, since the only required parameter is the DOM container, there are
   * some simpler way to call the constructor. The four following calls do the
   * exact same things:
   *
   *  > s1 = new sigma('my-container-id');
   *  > s2 = new sigma(document.getElementById('my-container-id'));
   *  > s3 = new sigma({
   *  >   container: document.getElementById('my-container-id')
   *  > });
   *  > s4 = new sigma({
   *  >   renderers: [{
   *  >     container: document.getElementById('my-container-id')
   *  >   }]
   *  > });
   *
   * Recognized parameters:
   * **********************
   * Here is the exhaustive list of every accepted parameters, when calling the
   * constructor with to top level configuration object (fourth case in the
   * previous examples):
   *
   *   {?string} id        The id of the instance. It will be generated
   *                       automatically if not specified.
   *   {?array}  renderers An array containing objects describing renderers.
   *   {?object} graph     An object containing an array of nodes and an array
   *                       of edges, to avoid having to add them by hand later.
   *   {?object} settings  An object containing instance specific settings that
   *                       will override the default ones defined in the object
   *                       sigma.settings.
   */
  var sigma = function(conf) {
    // Local variables:
    // ****************
    var i,
        l,
        a,
        c,
        o,
        id;

    sigma.classes.dispatcher.extend(this);

    // Private attributes:
    // *******************
    var _conf = conf || {};

    // Little shortcut:
    // ****************
    // The configuration is supposed to have a list of the configuration
    // objects for each renderer.
    //  - If there are no configuration at all, then nothing is done.
    //  - If there are no renderer list, the given configuration object will be
    //    considered as describing the first and only renderer.
    //  - If there are no renderer list nor "container" object, it will be
    //    considered as the container itself (a DOM element).
    //  - If the argument passed to sigma() is a string, it will be considered
    //    as the ID of the DOM container.
    if (
      typeof _conf === 'string' ||
      _conf instanceof HTMLElement
    )
      _conf = {
        renderers: [_conf]
      };
    else if (Object.prototype.toString.call(_conf) === '[object Array]')
      _conf = {
        renderers: _conf
      };

    // Also check "renderer" and "container" keys:
    o = _conf.renderers || _conf.renderer || _conf.container;
    if (!_conf.renderers || _conf.renderers.length === 0)
      if (
        typeof o === 'string' ||
        o instanceof HTMLElement ||
        (typeof o === 'object' && 'container' in o)
      )
        _conf.renderers = [o];

    // Recense the instance:
    if (_conf.id) {
      if (__instances[_conf.id])
        throw 'sigma: Instance "' + _conf.id + '" already exists.';
      Object.defineProperty(this, 'id', {
        value: _conf.id
      });
    } else {
      id = 0;
      while (__instances[id])
        id++;
      Object.defineProperty(this, 'id', {
        value: '' + id
      });
    }
    __instances[this.id] = this;

    // Initialize settings function:
    this.settings = new sigma.classes.configurable(
      sigma.settings,
      _conf.settings || {}
    );

    // Initialize locked attributes:
    Object.defineProperty(this, 'graph', {
      value: new sigma.classes.graph(this.settings),
      configurable: true
    });
    Object.defineProperty(this, 'middlewares', {
      value: [],
      configurable: true
    });
    Object.defineProperty(this, 'cameras', {
      value: {},
      configurable: true
    });
    Object.defineProperty(this, 'renderers', {
      value: {},
      configurable: true
    });
    Object.defineProperty(this, 'renderersPerCamera', {
      value: {},
      configurable: true
    });
    Object.defineProperty(this, 'cameraFrames', {
      value: {},
      configurable: true
    });
    Object.defineProperty(this, 'camera', {
      get: function() {
        return this.cameras[0];
      }
    });
    Object.defineProperty(this, 'events', {
      value: [
        'click',
        'rightClick',
        'clickStage',
        'doubleClickStage',
        'rightClickStage',
        'clickNode',
        'clickNodes',
        'doubleClickNode',
        'doubleClickNodes',
        'rightClickNode',
        'rightClickNodes',
        'hovers',
        'downNode',
        'downNodes',
        'upNode',
        'upNodes'
      ],
      configurable: true
    });

    // Add a custom handler, to redispatch events from renderers:
    this._handler = (function(e) {
      var k,
          data = {};

      for (k in e.data)
        data[k] = e.data[k];

      data.renderer = e.target;
      this.dispatchEvent(e.type, data);
    }).bind(this);

    // Initialize renderers:
    a = _conf.renderers || [];
    for (i = 0, l = a.length; i < l; i++)
      this.addRenderer(a[i]);

    // Initialize middlewares:
    a = _conf.middlewares || [];
    for (i = 0, l = a.length; i < l; i++)
      this.middlewares.push(
        typeof a[i] === 'string' ?
          sigma.middlewares[a[i]] :
          a[i]
      );

    // Check if there is already a graph to fill in:
    if (typeof _conf.graph === 'object' && _conf.graph) {
      this.graph.read(_conf.graph);

      // If a graph is given to the to the instance, the "refresh" method is
      // directly called:
      this.refresh();
    }

  };




  /**
   * This methods will instantiate and reference a new camera. If no id is
   * specified, then an automatic id will be generated.
   *
   * @param  {?string}              id Eventually the camera id.
   * @return {sigma.classes.camera}    The fresh new camera instance.
   */
  sigma.prototype.addCamera = function(id) {
    var self = this,
        camera;

    if (!arguments.length) {
      id = 0;
      while (this.cameras['' + id])
        id++;
      id = '' + id;
    }

    if (this.cameras[id])
      throw 'sigma.addCamera: The camera "' + id + '" already exists.';

    camera = new sigma.classes.camera(id, this.graph, this.settings);
    this.cameras[id] = camera;

    // Add a quadtree to the camera:
    camera.quadtree = new sigma.classes.quad();

    // Add an edgequadtree to the camera:
    if (sigma.classes.edgequad !== undefined) {
      camera.edgequadtree = new sigma.classes.edgequad();
    }

    camera.bind('coordinatesUpdated', function(e) {
      self.dispatchEvent('coordinatesUpdated');
      self.renderCamera(camera);
    });

    this.renderersPerCamera[id] = [];

    return camera;
  };

  /**
   * This method kills a camera, and every renderer attached to it.
   *
   * @param  {string|camera} v The camera to kill or its ID.
   * @return {sigma}           Returns the instance.
   */
  sigma.prototype.killCamera = function(v) {
    v = typeof v === 'string' ? this.cameras[v] : v;

    if (!v)
      throw 'sigma.killCamera: The camera is undefined.';

    var i,
        l,
        a = this.renderersPerCamera[v.id];

    for (l = a.length, i = l - 1; i >= 0; i--)
      this.killRenderer(a[i]);

    delete this.renderersPerCamera[v.id];
    delete this.cameraFrames[v.id];
    delete this.cameras[v.id];

    if (v.kill)
      v.kill();

    return this;
  };

  /**
   * This methods will instantiate and reference a new renderer. The "type"
   * argument can be the constructor or its name in the "sigma.renderers"
   * package. If no type is specified, then "sigma.renderers.def" will be used.
   * If no id is specified, then an automatic id will be generated.
   *
   * @param  {?object}  options Eventually some options to give to the renderer
   *                            constructor.
   * @return {renderer}         The fresh new renderer instance.
   *
   * Recognized parameters:
   * **********************
   * Here is the exhaustive list of every accepted parameters in the "options"
   * object:
   *
   *   {?string}            id     Eventually the renderer id.
   *   {?(function|string)} type   Eventually the renderer constructor or its
   *                               name in the "sigma.renderers" package.
   *   {?(camera|string)}   camera Eventually the renderer camera or its
   *                               id.
   */
  sigma.prototype.addRenderer = function(options) {
    var id,
        fn,
        camera,
        renderer,
        o = options || {};

    // Polymorphism:
    if (typeof o === 'string')
      o = {
        container: document.getElementById(o)
      };
    else if (o instanceof HTMLElement)
      o = {
        container: o
      };

    // If the container still is a string, we get it by id
    if (typeof o.container === 'string')
      o.container = document.getElementById(o.container);

    // Reference the new renderer:
    if (!('id' in o)) {
      id = 0;
      while (this.renderers['' + id])
        id++;
      id = '' + id;
    } else
      id = o.id;

    if (this.renderers[id])
      throw 'sigma.addRenderer: The renderer "' + id + '" already exists.';

    // Find the good constructor:
    fn = typeof o.type === 'function' ? o.type : sigma.renderers[o.type];
    fn = fn || sigma.renderers.def;

    // Find the good camera:
    camera = 'camera' in o ?
      (
        o.camera instanceof sigma.classes.camera ?
          o.camera :
          this.cameras[o.camera] || this.addCamera(o.camera)
      ) :
      this.addCamera();

    if (this.cameras[camera.id] !== camera)
      throw 'sigma.addRenderer: The camera is not properly referenced.';

    // Instantiate:
    renderer = new fn(this.graph, camera, this.settings, o);
    this.renderers[id] = renderer;
    Object.defineProperty(renderer, 'id', {
      value: id
    });

    // Bind events:
    if (renderer.bind)
      renderer.bind(
        [
          'click',
          'rightClick',
          'clickStage',
          'doubleClickStage',
          'rightClickStage',
          'clickNode',
          'clickNodes',
          'clickEdge',
          'clickEdges',
          'doubleClickNode',
          'doubleClickNodes',
          'doubleClickEdge',
          'doubleClickEdges',
          'rightClickNode',
          'rightClickNodes',
          'rightClickEdge',
          'rightClickEdges',
          'hovers',
          'downNode',
          'downNodes',
          'downEdge',
          'downEdges',
          'upNode',
          'upNodes',
          'upEdge',
          'upEdges'
        ],
        this._handler
      );

    // Reference the renderer by its camera:
    this.renderersPerCamera[camera.id].push(renderer);

    return renderer;
  };

  /**
   * This method kills a renderer.
   *
   * @param  {string|renderer} v The renderer to kill or its ID.
   * @return {sigma}             Returns the instance.
   */
  sigma.prototype.killRenderer = function(v) {
    v = typeof v === 'string' ? this.renderers[v] : v;

    if (!v)
      throw 'sigma.killRenderer: The renderer is undefined.';

    var a = this.renderersPerCamera[v.camera.id],
        i = a.indexOf(v);

    if (i >= 0)
      a.splice(i, 1);

    if (v.kill)
      v.kill();

    delete this.renderers[v.id];

    return this;
  };




  /**
   * This method calls the "render" method of each renderer, with the same
   * arguments than the "render" method, but will also check if the renderer
   * has a "process" method, and call it if it exists.
   *
   * It is useful for quadtrees or WebGL processing, for instance.
   *
   * @param  {?object}  options Eventually some options to give to the refresh
   *                            method.
   * @return {sigma}            Returns the instance itself.
   *
   * Recognized parameters:
   * **********************
   * Here is the exhaustive list of every accepted parameters in the "options"
   * object:
   *
   *   {?boolean} skipIndexation A flag specifying wether or not the refresh
   *                             function should reindex the graph in the
   *                             quadtrees or not (default: false).
   */
  sigma.prototype.refresh = function(options) {
    var i,
        l,
        k,
        a,
        c,
        bounds,
        prefix = 0;

    options = options || {};

    // Call each middleware:
    a = this.middlewares || [];
    for (i = 0, l = a.length; i < l; i++)
      a[i].call(
        this,
        (i === 0) ? '' : 'tmp' + prefix + ':',
        (i === l - 1) ? 'ready:' : ('tmp' + (++prefix) + ':')
      );

    // Then, for each camera, call the "rescale" middleware, unless the
    // settings specify not to:
    for (k in this.cameras) {
      c = this.cameras[k];
      if (
        c.settings('autoRescale') &&
        this.renderersPerCamera[c.id] &&
        this.renderersPerCamera[c.id].length
      )
        sigma.middlewares.rescale.call(
          this,
          a.length ? 'ready:' : '',
          c.readPrefix,
          {
            width: this.renderersPerCamera[c.id][0].width,
            height: this.renderersPerCamera[c.id][0].height
          }
        );
      else
        sigma.middlewares.copy.call(
          this,
          a.length ? 'ready:' : '',
          c.readPrefix
        );

      if (!options.skipIndexation) {
        // Find graph boundaries:
        bounds = sigma.utils.getBoundaries(
          this.graph,
          c.readPrefix
        );

        // Refresh quadtree:
        c.quadtree.index(this.graph, {
          prefix: c.readPrefix,
          maxLevel: c.settings('nodeQuadtreeMaxLevel'),
          bounds: {
            x: bounds.minX,
            y: bounds.minY,
            width: bounds.maxX - bounds.minX,
            height: bounds.maxY - bounds.minY
          }
        });

        // Refresh edgequadtree:
        if (
          c.edgequadtree !== undefined &&
          c.settings('drawEdges') &&
          (c.settings('enableEdgeHovering') ||
            c.settings('edgesClippingWithNodes'))
        ) {
          c.edgequadtree.index(this.graph, {
            prefix: c.readPrefix,
            maxLevel: c.settings('edgeQuadtreeMaxLevel'),
            bounds: {
              x: bounds.minX,
              y: bounds.minY,
              width: bounds.maxX - bounds.minX,
              height: bounds.maxY - bounds.minY
            }
          });
        }
      }
    }

    // Call each renderer:
    a = Object.keys(this.renderers);
    for (i = 0, l = a.length; i < l; i++)
      if (this.renderers[a[i]].process) {
        if (this.settings('skipErrors'))
          try {
            this.renderers[a[i]].process();
          } catch (e) {
            console.log(
              'Warning: The renderer "' + a[i] + '" crashed on ".process()"'
            );
          }
        else
          this.renderers[a[i]].process();
      }

    this.render();

    return this;
  };

  /**
   * This method calls the "render" method of each renderer.
   *
   * @return {sigma} Returns the instance itself.
   */
  sigma.prototype.render = function() {
    var l,
        i,
        prefix = 0;

    // Call each renderer:
    for (i in this.renderers)
      if (this.settings('skipErrors'))
        try {
          this.renderers[i].render();
        } catch (e) {
          if (this.settings('verbose'))
            console.log(
              'Warning: The renderer "' + this.renderers[i] +
              '" crashed on ".render()"'
            );
        }
      else
        this.renderers[i].render();

    return this;
  };

  /**
   * This method calls the "render" method of each renderer that is bound to
   * the specified camera. To improve the performances, if this method is
   * called too often, the number of effective renderings is limitated to one
   * per frame, unless you are using the "force" flag.
   *
   * @param  {sigma.classes.camera} camera The camera to render.
   * @param  {?boolean}             force  If true, will render the camera
   *                                       directly.
   * @return {sigma}                       Returns the instance itself.
   */
  sigma.prototype.renderCamera = function(camera, force) {
    var i,
        l,
        a,
        self = this;

    if (force) {
      a = this.renderersPerCamera[camera.id];
      for (i = 0, l = a.length; i < l; i++)
        if (this.settings('skipErrors'))
          try {
            a[i].render();
          } catch (e) {
            if (this.settings('verbose'))
              console.log(
                'Warning: The renderer "'+ a[i].id + '" crashed on ".render()"'
              );
          }
        else
          a[i].render();
    } else {
      if (!this.cameraFrames[camera.id]) {
        a = this.renderersPerCamera[camera.id];
        for (i = 0, l = a.length; i < l; i++)
          if (this.settings('skipErrors'))
            try {
              a[i].render();
            } catch (e) {
              if (this.settings('verbose'))
                console.log(
                  'Warning: The renderer "'+a[i].id +'" crashed on ".render()"'
                );
            }
          else
            a[i].render();

        this.cameraFrames[camera.id] = requestAnimationFrame(function() {
          delete self.cameraFrames[camera.id];
        });
      }
    }

    return this;
  };

  /**
   * This method calls the "kill" method of each module and destroys any
   * reference from the instance.
   */
  sigma.prototype.kill = function() {
    var k;

    // Dispatching event
    this.dispatchEvent('kill');

    // Kill graph:
    this.graph.kill();

    // Kill middlewares:
    delete this.middlewares;

    // Kill each renderer:
    for (k in this.renderers)
      this.killRenderer(this.renderers[k]);

    // Kill each camera:
    for (k in this.cameras)
      this.killCamera(this.cameras[k]);

    delete this.renderers;
    delete this.cameras;

    // Kill everything else:
    for (k in this)
      if (this.hasOwnProperty(k))
        delete this[k];

    delete __instances[this.id];
  };




  /**
   * Returns a clone of the instances object or a specific running instance.
   *
   * @param  {?string} id Eventually an instance ID.
   * @return {object}     The related instance or a clone of the instances
   *                      object.
   */
  sigma.instances = function(id) {
    return arguments.length ?
      __instances[id] :
      sigma.utils.extend({}, __instances);
  };



  /**
   * The current version of sigma:
   */
  sigma.version = '1.5.2';


  /**
   * Disable ES6 features if true:
   */
  sigma.forceES5 = false;


  /**
   * EXPORT:
   * *******
   */
  if (typeof this.sigma !== 'undefined')
    throw 'An object called sigma is already in the global scope.';

  this.sigma = sigma;

}).call(this);

/**
 * conrad.js is a tiny JavaScript jobs scheduler,
 *
 * Version: 0.1.0
 * Sources: http://github.com/jacomyal/conrad.js
 * Doc:     http://github.com/jacomyal/conrad.js#readme
 *
 * License:
 * --------
 * Copyright © 2013 Alexis Jacomy, Sciences-Po médialab
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * The Software is provided "as is", without warranty of any kind, express or
 * implied, including but not limited to the warranties of merchantability,
 * fitness for a particular purpose and noninfringement. In no event shall the
 * authors or copyright holders be liable for any claim, damages or other
 * liability, whether in an action of contract, tort or otherwise, arising
 * from, out of or in connection with the software or the use or other dealings
 * in the Software.
 */
(function(global) {
  'use strict';

  // Check that conrad.js has not been loaded yet:
  if (global.conrad)
    throw new Error('conrad already exists');


  /**
   * PRIVATE VARIABLES:
   * ******************
   */

  /**
   * A flag indicating whether conrad is running or not.
   *
   * @type {Number}
   */
  var _lastFrameTime;

  /**
   * A flag indicating whether conrad is running or not.
   *
   * @type {Boolean}
   */
  var _isRunning = false;

  /**
   * The hash of registered jobs. Each job must at least have a unique ID
   * under the key "id" and a function under the key "job". This hash
   * contains each running job and each waiting job.
   *
   * @type {Object}
   */
  var _jobs = {};

  /**
   * The hash of currently running jobs.
   *
   * @type {Object}
   */
  var _runningJobs = {};

  /**
   * The array of currently running jobs, sorted by priority.
   *
   * @type {Array}
   */
  var _sortedByPriorityJobs = [];

  /**
   * The array of currently waiting jobs.
   *
   * @type {Object}
   */
  var _waitingJobs = {};

  /**
   * The array of finished jobs. They are stored in an array, since two jobs
   * with the same "id" can happen at two different times.
   *
   * @type {Array}
   */
  var _doneJobs = [];

  /**
   * A dirty flag to keep conrad from starting: Indeed, when addJob() is called
   * with several jobs, conrad must be started only at the end. This flag keeps
   * me from duplicating the code that effectively adds a job.
   *
   * @type {Boolean}
   */
  var _noStart = false;

  /**
   * An hash containing some global settings about how conrad.js should
   * behave.
   *
   * @type {Object}
   */
  var _parameters = {
    frameDuration: 20,
    history: true
  };

  /**
   * This object contains every handlers bound to conrad events. It does not
   * requirea any DOM implementation, since the events are all JavaScript.
   *
   * @type {Object}
   */
  var _handlers = Object.create(null);


  /**
   * PRIVATE FUNCTIONS:
   * ******************
   */

  /**
   * Will execute the handler everytime that the indicated event (or the
   * indicated events) will be triggered.
   *
   * @param  {string|array|object} events  The name of the event (or the events
   *                                       separated by spaces).
   * @param  {function(Object)}    handler The handler to bind.
   * @return {Object}                      Returns conrad.
   */
  function _bind(events, handler) {
    var i,
        i_end,
        event,
        eArray;

    if (!arguments.length)
      return;
    else if (
      arguments.length === 1 &&
      Object(arguments[0]) === arguments[0]
    )
      for (events in arguments[0])
        _bind(events, arguments[0][events]);
    else if (arguments.length > 1) {
      eArray =
        Array.isArray(events) ?
          events :
          events.split(/ /);

      for (i = 0, i_end = eArray.length; i !== i_end; i += 1) {
        event = eArray[i];

        if (!_handlers[event])
          _handlers[event] = [];

        // Using an object instead of directly the handler will make possible
        // later to add flags
        _handlers[event].push({
          handler: handler
        });
      }
    }
  }

  /**
   * Removes the handler from a specified event (or specified events).
   *
   * @param  {?string}           events  The name of the event (or the events
   *                                     separated by spaces). If undefined,
   *                                     then all handlers are removed.
   * @param  {?function(Object)} handler The handler to unbind. If undefined,
   *                                     each handler bound to the event or the
   *                                     events will be removed.
   * @return {Object}            Returns conrad.
   */
  function _unbind(events, handler) {
    var i,
        i_end,
        j,
        j_end,
        a,
        event,
        eArray = Array.isArray(events) ?
                   events :
                   events.split(/ /);

    if (!arguments.length)
      _handlers = Object.create(null);
    else if (handler) {
      for (i = 0, i_end = eArray.length; i !== i_end; i += 1) {
        event = eArray[i];
        if (_handlers[event]) {
          a = [];
          for (j = 0, j_end = _handlers[event].length; j !== j_end; j += 1)
            if (_handlers[event][j].handler !== handler)
              a.push(_handlers[event][j]);

          _handlers[event] = a;
        }

        if (_handlers[event] && _handlers[event].length === 0)
          delete _handlers[event];
      }
    } else
      for (i = 0, i_end = eArray.length; i !== i_end; i += 1)
        delete _handlers[eArray[i]];
  }

  /**
   * Executes each handler bound to the event.
   *
   * @param  {string}  events The name of the event (or the events separated
   *                          by spaces).
   * @param  {?Object} data   The content of the event (optional).
   * @return {Object}         Returns conrad.
   */
  function _dispatch(events, data) {
    var i,
        j,
        i_end,
        j_end,
        event,
        eventName,
        eArray = Array.isArray(events) ?
                   events :
                   events.split(/ /);

    data = data === undefined ? {} : data;

    for (i = 0, i_end = eArray.length; i !== i_end; i += 1) {
      eventName = eArray[i];

      if (_handlers[eventName]) {
        event = {
          type: eventName,
          data: data || {}
        };

        for (j = 0, j_end = _handlers[eventName].length; j !== j_end; j += 1)
          try {
            _handlers[eventName][j].handler(event);
          } catch (e) {}
      }
    }
  }

  /**
   * Executes the most prioritary job once, and deals with filling the stats
   * (done, time, averageTime, currentTime, etc...).
   *
   * @return {?Object} Returns the job object if it has to be killed, null else.
   */
  function _executeFirstJob() {
    var i,
        l,
        test,
        kill,
        pushed = false,
        time = __dateNow(),
        job = _sortedByPriorityJobs.shift();

    // Execute the job and look at the result:
    test = job.job();

    // Deal with stats:
    time = __dateNow() - time;
    job.done++;
    job.time += time;
    job.currentTime += time;
    job.weightTime = job.currentTime / (job.weight || 1);
    job.averageTime = job.time / job.done;

    // Check if the job has to be killed:
    kill = job.count ? (job.count <= job.done) : !test;

    // Reset priorities:
    if (!kill) {
      for (i = 0, l = _sortedByPriorityJobs.length; i < l; i++)
        if (_sortedByPriorityJobs[i].weightTime > job.weightTime) {
          _sortedByPriorityJobs.splice(i, 0, job);
          pushed = true;
          break;
        }

      if (!pushed)
        _sortedByPriorityJobs.push(job);
    }

    return kill ? job : null;
  }

  /**
   * Activates a job, by adding it to the _runningJobs object and the
   * _sortedByPriorityJobs array. It also initializes its currentTime value.
   *
   * @param  {Object} job The job to activate.
   */
  function _activateJob(job) {
    var l = _sortedByPriorityJobs.length;

    // Add the job to the running jobs:
    _runningJobs[job.id] = job;
    job.status = 'running';

    // Add the job to the priorities:
    if (l) {
      job.weightTime = _sortedByPriorityJobs[l - 1].weightTime;
      job.currentTime = job.weightTime * (job.weight || 1);
    }

    // Initialize the job and dispatch:
    job.startTime = __dateNow();
    _dispatch('jobStarted', __clone(job));

    _sortedByPriorityJobs.push(job);
  }

  /**
   * The main loop of conrad.js:
   *  . It executes job such that they all occupate the same processing time.
   *  . It stops jobs that do not need to be executed anymore.
   *  . It triggers callbacks when it is relevant.
   *  . It starts waiting jobs when they need to be started.
   *  . It injects frames to keep a constant frapes per second ratio.
   *  . It stops itself when there are no more jobs to execute.
   */
  function _loop() {
    var k,
        o,
        l,
        job,
        time,
        deadJob;

    // Deal with the newly added jobs (the _jobs object):
    for (k in _jobs) {
      job = _jobs[k];

      if (job.after)
        _waitingJobs[k] = job;
      else
        _activateJob(job);

      delete _jobs[k];
    }

    // Set the _isRunning flag to false if there are no running job:
    _isRunning = !!_sortedByPriorityJobs.length;

    // Deal with the running jobs (the _runningJobs object):
    while (
      _sortedByPriorityJobs.length &&
      __dateNow() - _lastFrameTime < _parameters.frameDuration
    ) {
      deadJob = _executeFirstJob();

      // Deal with the case where the job has ended:
      if (deadJob) {
        _killJob(deadJob.id);

        // Check for waiting jobs:
        for (k in _waitingJobs)
          if (_waitingJobs[k].after === deadJob.id) {
            _activateJob(_waitingJobs[k]);
            delete _waitingJobs[k];
          }
      }
    }

    // Check if conrad still has jobs to deal with, and kill it if not:
    if (_isRunning) {
      // Update the _lastFrameTime:
      _lastFrameTime = __dateNow();

      _dispatch('enterFrame');
      setTimeout(_loop, 0);
    } else
      _dispatch('stop');
  }

  /**
   * Adds one or more jobs, and starts the loop if no job was running before. A
   * job is at least a unique string "id" and a function, and there are some
   * parameters that you can specify for each job to modify the way conrad will
   * execute it. If a job is added with the "id" of another job that is waiting
   * or still running, an error will be thrown.
   *
   * When a job is added, it is referenced in the _jobs object, by its id.
   * Then, if it has to be executed right now, it will be also referenced in
   * the _runningJobs object. If it has to wait, then it will be added into the
   * _waitingJobs object, until it can start.
   *
   * Keep reading this documentation to see how to call this method.
   *
   * @return {Object} Returns conrad.
   *
   * Adding one job:
   * ***************
   * Basically, a job is defined by its string id and a function (the job). It
   * is also possible to add some parameters:
   *
   *  > conrad.addJob('myJobId', myJobFunction);
   *  > conrad.addJob('myJobId', {
   *  >   job: myJobFunction,
   *  >   someParameter: someValue
   *  > });
   *  > conrad.addJob({
   *  >   id: 'myJobId',
   *  >   job: myJobFunction,
   *  >   someParameter: someValue
   *  > });
   *
   * Adding several jobs:
   * ********************
   * When adding several jobs at the same time, it is possible to specify
   * parameters for each one individually or for all:
   *
   *  > conrad.addJob([
   *  >   {
   *  >     id: 'myJobId1',
   *  >     job: myJobFunction1,
   *  >     someParameter1: someValue1
   *  >   },
   *  >   {
   *  >     id: 'myJobId2',
   *  >     job: myJobFunction2,
   *  >     someParameter2: someValue2
   *  >   }
   *  > ], {
   *  >   someCommonParameter: someCommonValue
   *  > });
   *  > conrad.addJob({
   *  >   myJobId1: {,
   *  >     job: myJobFunction1,
   *  >     someParameter1: someValue1
   *  >   },
   *  >   myJobId2: {,
   *  >     job: myJobFunction2,
   *  >     someParameter2: someValue2
   *  >   }
   *  > }, {
   *  >   someCommonParameter: someCommonValue
   *  > });
   *  > conrad.addJob({
   *  >   myJobId1: myJobFunction1,
   *  >   myJobId2: myJobFunction2
   *  > }, {
   *  >   someCommonParameter: someCommonValue
   *  > });
   *
   *  Recognized parameters:
   *  **********************
   *  Here is the exhaustive list of every accepted parameters:
   *
   *    {?Function} end      A callback to execute when the job is ended. It is
   *                         not executed if the job is killed instead of ended
   *                         "naturally".
   *    {?Integer}  count    The number of time the job has to be executed.
   *    {?Number}   weight   If specified, the job will be executed as it was
   *                         added "weight" times.
   *    {?String}   after    The id of another job (eventually not added yet).
   *                         If specified, this job will start only when the
   *                         specified "after" job is ended.
   */
  function _addJob(v1, v2) {
    var i,
        l,
        o;

    // Array of jobs:
    if (Array.isArray(v1)) {
      // Keep conrad to start until the last job is added:
      _noStart = true;

      for (i = 0, l = v1.length; i < l; i++)
        _addJob(v1[i].id, __extend(v1[i], v2));

      _noStart = false;
      if (!_isRunning) {
        // Update the _lastFrameTime:
        _lastFrameTime = __dateNow();

        _dispatch('start');
        _loop();
      }
    } else if (typeof v1 === 'object') {
      // One job (object):
      if (typeof v1.id === 'string')
        _addJob(v1.id, v1);

      // Hash of jobs:
      else {
        // Keep conrad to start until the last job is added:
        _noStart = true;

        for (i in v1)
          if (typeof v1[i] === 'function')
            _addJob(i, __extend({
              job: v1[i]
            }, v2));
          else
            _addJob(i, __extend(v1[i], v2));

        _noStart = false;
        if (!_isRunning) {
          // Update the _lastFrameTime:
          _lastFrameTime = __dateNow();

          _dispatch('start');
          _loop();
        }
      }

    // One job (string, *):
    } else if (typeof v1 === 'string') {
      if (_hasJob(v1))
        throw new Error(
          '[conrad.addJob] Job with id "' + v1 + '" already exists.'
        );

      // One job (string, function):
      if (typeof v2 === 'function') {
        o = {
          id: v1,
          done: 0,
          time: 0,
          status: 'waiting',
          currentTime: 0,
          averageTime: 0,
          weightTime: 0,
          job: v2
        };

      // One job (string, object):
      } else if (typeof v2 === 'object') {
        o = __extend(
          {
            id: v1,
            done: 0,
            time: 0,
            status: 'waiting',
            currentTime: 0,
            averageTime: 0,
            weightTime: 0
          },
          v2
        );

      // If none of those cases, throw an error:
      } else
        throw new Error('[conrad.addJob] Wrong arguments.');

      // Effectively add the job:
      _jobs[v1] = o;
      _dispatch('jobAdded', __clone(o));

      // Check if the loop has to be started:
      if (!_isRunning && !_noStart) {
        // Update the _lastFrameTime:
        _lastFrameTime = __dateNow();

        _dispatch('start');
        _loop();
      }

    // If none of those cases, throw an error:
    } else
      throw new Error('[conrad.addJob] Wrong arguments.');

    return this;
  }

  /**
   * Kills one or more jobs, indicated by their ids. It is only possible to
   * kill running jobs or waiting jobs. If you try to kill a job that does not
   * exists or that is already killed, a warning will be thrown.
   *
   * @param  {Array|String} v1 A string job id or an array of job ids.
   * @return {Object}       Returns conrad.
   */
  function _killJob(v1) {
    var i,
        l,
        k,
        a,
        job,
        found = false;

    // Array of job ids:
    if (Array.isArray(v1))
      for (i = 0, l = v1.length; i < l; i++)
        _killJob(v1[i]);

    // One job's id:
    else if (typeof v1 === 'string') {
      a = [_runningJobs, _waitingJobs, _jobs];

      // Remove the job from the hashes:
      for (i = 0, l = a.length; i < l; i++)
        if (v1 in a[i]) {
          job = a[i][v1];

          if (_parameters.history) {
            job.status = 'done';
            _doneJobs.push(job);
          }

          _dispatch('jobEnded', __clone(job));
          delete a[i][v1];

          if (typeof job.end === 'function')
            job.end();

          found = true;
        }

      // Remove the priorities array:
      a = _sortedByPriorityJobs;
      for (i = 0, l = a.length; i < l; i++)
        if (a[i].id === v1) {
          a.splice(i, 1);
          break;
        }

      if (!found)
        throw new Error('[conrad.killJob] Job "' + v1 + '" not found.');

    // If none of those cases, throw an error:
    } else
      throw new Error('[conrad.killJob] Wrong arguments.');

    return this;
  }

  /**
   * Kills every running, waiting, and just added jobs.
   *
   * @return {Object} Returns conrad.
   */
  function _killAll() {
    var k,
        jobs = __extend(_jobs, _runningJobs, _waitingJobs);

    // Take every jobs and push them into the _doneJobs object:
    if (_parameters.history)
      for (k in jobs) {
        jobs[k].status = 'done';
        _doneJobs.push(jobs[k]);

        if (typeof jobs[k].end === 'function')
          jobs[k].end();
      }

    // Reinitialize the different jobs lists:
    _jobs = {};
    _waitingJobs = {};
    _runningJobs = {};
    _sortedByPriorityJobs = [];

    // In case some jobs are added right after the kill:
    _isRunning = false;

    return this;
  }

  /**
   * Returns true if a job with the specified id is currently running or
   * waiting, and false else.
   *
   * @param  {String}  id The id of the job.
   * @return {?Object} Returns the job object if it exists.
   */
  function _hasJob(id) {
    var job = _jobs[id] || _runningJobs[id] || _waitingJobs[id];
    return job ? __extend(job) : null;
  }

  /**
   * This method will set the setting specified by "v1" to the value specified
   * by "v2" if both are given, and else return the current value of the
   * settings "v1".
   *
   * @param  {String}   v1 The name of the property.
   * @param  {?*}       v2 Eventually, a value to set to the specified
   *                       property.
   * @return {Object|*} Returns the specified settings value if "v2" is not
   *                    given, and conrad else.
   */
  function _settings(v1, v2) {
    var o;

    if (typeof a1 === 'string' && arguments.length === 1)
      return _parameters[a1];
    else {
      o = (typeof a1 === 'object' && arguments.length === 1) ?
        a1 || {} :
        {};
      if (typeof a1 === 'string')
        o[a1] = a2;

      for (var k in o)
        if (o[k] !== undefined)
          _parameters[k] = o[k];
        else
          delete _parameters[k];

      return this;
    }
  }

  /**
   * Returns true if conrad is currently running, and false else.
   *
   * @return {Boolean} Returns _isRunning.
   */
  function _getIsRunning() {
    return _isRunning;
  }

  /**
   * Unreference every jobs that are stored in the _doneJobs object. It will
   * not be possible anymore to get stats about these jobs, but it will release
   * the memory.
   *
   * @return {Object} Returns conrad.
   */
  function _clearHistory() {
    _doneJobs = [];
    return this;
  }

  /**
   * Returns a snapshot of every data about jobs that wait to be started, are
   * currently running or are done.
   *
   * It is possible to get only running, waiting or done jobs by giving
   * "running", "waiting" or "done" as fist argument.
   *
   * It is also possible to get every job with a specified id by giving it as
   * first argument. Also, using a RegExp instead of an id will return every
   * jobs whose ids match the RegExp. And these two last use cases work as well
   * by giving before "running", "waiting" or "done".
   *
   * @return {Array} The array of the matching jobs.
   *
   * Some call examples:
   * *******************
   *  > conrad.getStats('running')
   *  > conrad.getStats('waiting')
   *  > conrad.getStats('done')
   *  > conrad.getStats('myJob')
   *  > conrad.getStats(/test/)
   *  > conrad.getStats('running', 'myRunningJob')
   *  > conrad.getStats('running', /test/)
   */
  function _getStats(v1, v2) {
    var a,
        k,
        i,
        l,
        stats,
        pattern,
        isPatternString;

    if (!arguments.length) {
      stats = [];

      for (k in _jobs)
        stats.push(_jobs[k]);

      for (k in _waitingJobs)
        stats.push(_waitingJobs[k]);

      for (k in _runningJobs)
        stats.push(_runningJobs[k]);

      stats = stats.concat(_doneJobs);
    }

    if (typeof v1 === 'string')
      switch (v1) {
        case 'waiting':
          stats = __objectValues(_waitingJobs);
          break;
        case 'running':
          stats = __objectValues(_runningJobs);
          break;
        case 'done':
          stats = _doneJobs;
          break;
        default:
          pattern = v1;
      }

    if (v1 instanceof RegExp)
      pattern = v1;

    if (!pattern && (typeof v2 === 'string' || v2 instanceof RegExp))
      pattern = v2;

    // Filter jobs if a pattern is given:
    if (pattern) {
      isPatternString = typeof pattern === 'string';

      if (stats instanceof Array) {
        a = stats;
      } else if (typeof stats === 'object') {
        a = [];

        for (k in stats)
          a = a.concat(stats[k]);
      } else {
        a = [];

        for (k in _jobs)
          a.push(_jobs[k]);

        for (k in _waitingJobs)
          a.push(_waitingJobs[k]);

        for (k in _runningJobs)
          a.push(_runningJobs[k]);

        a = a.concat(_doneJobs);
      }

      stats = [];
      for (i = 0, l = a.length; i < l; i++)
        if (isPatternString ? a[i].id === pattern : a[i].id.match(pattern))
          stats.push(a[i]);
    }

    return __clone(stats);
  }


  /**
   * TOOLS FUNCTIONS:
   * ****************
   */

  /**
   * This function takes any number of objects as arguments, copies from each
   * of these objects each pair key/value into a new object, and finally
   * returns this object.
   *
   * The arguments are parsed from the last one to the first one, such that
   * when two objects have keys in common, the "earliest" object wins.
   *
   * Example:
   * ********
   *  > var o1 = {
   *  >       a: 1,
   *  >       b: 2,
   *  >       c: '3'
   *  >     },
   *  >     o2 = {
   *  >       c: '4',
   *  >       d: [ 5 ]
   *  >     };
   *  > __extend(o1, o2);
   *  > // Returns: {
   *  > //   a: 1,
   *  > //   b: 2,
   *  > //   c: '3',
   *  > //   d: [ 5 ]
   *  > // };
   *
   * @param  {Object+} Any number of objects.
   * @return {Object}  The merged object.
   */
  function __extend() {
    var i,
        k,
        res = {},
        l = arguments.length;

    for (i = l - 1; i >= 0; i--)
      for (k in arguments[i])
        res[k] = arguments[i][k];

    return res;
  }

  /**
   * This function simply clones an object. This object must contain only
   * objects, arrays and immutable values. Since it is not public, it does not
   * deal with cyclic references, DOM elements and instantiated objects - so
   * use it carefully.
   *
   * @param  {Object} The object to clone.
   * @return {Object} The clone.
   */
  function __clone(item) {
    var result, i, k, l;

    if (!item)
      return item;

    if (Array.isArray(item)) {
      result = [];
      for (i = 0, l = item.length; i < l; i++)
        result.push(__clone(item[i]));
    } else if (typeof item === 'object') {
      result = {};
      for (i in item)
        result[i] = __clone(item[i]);
    } else
      result = item;

    return result;
  }

  /**
   * Returns an array containing the values of an object.
   *
   * @param  {Object} The object.
   * @return {Array}  The array of values.
   */
  function __objectValues(o) {
    var k,
        a = [];

    for (k in o)
      a.push(o[k]);

    return a;
  }

  /**
   * A short "Date.now()" polyfill.
   *
   * @return {Number} The current time (in ms).
   */
  function __dateNow() {
    return Date.now ? Date.now() : new Date().getTime();
  }

  /**
   * Polyfill for the Array.isArray function:
   */
  if (!Array.isArray)
    Array.isArray = function(v) {
      return Object.prototype.toString.call(v) === '[object Array]';
    };


  /**
   * EXPORT PUBLIC API:
   * ******************
   */
  var conrad = {
    hasJob: _hasJob,
    addJob: _addJob,
    killJob: _killJob,
    killAll: _killAll,
    settings: _settings,
    getStats: _getStats,
    isRunning: _getIsRunning,
    clearHistory: _clearHistory,

    // Events management:
    bind: _bind,
    unbind: _unbind,

    // Version:
    version: '0.1.0'
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = conrad;
    exports.conrad = conrad;
  }
  global.conrad = conrad;
})(this);

// Hardcoded export for the node.js version:
var sigma = this.sigma,
    conrad = this.conrad;

sigma.conrad = conrad;

// Dirty polyfills to permit sigma usage in node
if (typeof HTMLElement === 'undefined')
  HTMLElement = function() {};

if (typeof window === 'undefined')
  window = {
    addEventListener: function() {}
  };

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports)
    exports = module.exports = sigma;
  exports.sigma = sigma;
}

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  var _root = this;

  // Initialize packages:
  sigma.utils = sigma.utils || {};

  /**
   * MISC UTILS:
   */


  /**
   * SigmaMap wraps an ES6 Object. Methods set, get, has, forEach, delete, and clear
   * have the same signature than the corresponding Map methods.
   */
  function SigmaMap() {
    var self = this;
    var _store;

    if (!sigma.forceES5 &&
      typeof Map !== 'undefined' &&
      Map.prototype.keys !== undefined &&
      Map.prototype.forEach !== undefined
      && Array.from !== undefined) {

      _store = new Map();

      Object.defineProperty(this, 'size', {
        get: function() { return _store.size; },
        set: undefined,
        enumerable: true
      });

      this.set = function(key, value) { _store.set('' + key, value); };
      this.get = function(key) { return _store.get('' + key); };
      this.has = function(key) { return _store.has('' + key); };
      this.forEach = function(func) { return _store.forEach(func); };
      this.delete = function(key) { return _store.delete('' + key); };
      this.clear = function() { _store.clear(); };

      this.keyList = function () {
        return Array.from(_store.keys());
      };

      this.valueList = function () {
        var values = [];
        _store.forEach(function(val) {
          values.push(val);
        });
        return values;
      };
    }
    else {
      _store = Object.create(null);
      this.size = 0;

      this.keyList = function () {
        return Object.keys(_store).filter(function(key) {
          return _store[key] !== undefined;
        });
      };

      this.valueList = function () {
        var keys = Object.keys(_store);
        var values = [];

        for (var i = 0; i < keys.length; i++) {
          var val = _store[keys[i]];
          if (val !== undefined) {
            values.push(val);
          }
        }
        return values;
      };

      this.set = function (key, value) {
        if (_store[key] === undefined) self.size++;

        _store[key] = value;
      };

      this.get = function (key) {
        return _store[key];
      };

      this.has = function (key) {
        return _store[key] !== undefined;
      };

      this.forEach = function (func) {
        var keys = Object.keys(_store);
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i],
              obj = _store[key];

          if (typeof obj !== 'undefined') {
            func(obj, key);
          }
        }
      };

      this.delete = function (key) {
        var value = _store[key];
        _store[key] = undefined;

        if (value !== undefined) self.size--;

        return value;
      };

      this.clear = function () {
        for (var k in _store)
          if (!('hasOwnProperty' in _store) || _store.hasOwnProperty(k))
            delete _store[k];

        _store = Object.create(null);
        self.size = 0;
      };
    }
  }

  sigma.utils.map = SigmaMap;


  /**
   * This function takes any number of objects as arguments, copies from each
   * of these objects each pair key/value into a new object, and finally
   * returns this object.
   *
   * The arguments are parsed from the last one to the first one, such that
   * when several objects have keys in common, the "earliest" object wins.
   *
   * Example:
   * ********
   *  > var o1 = {
   *  >       a: 1,
   *  >       b: 2,
   *  >       c: '3'
   *  >     },
   *  >     o2 = {
   *  >       c: '4',
   *  >       d: [ 5 ]
   *  >     };
   *  > sigma.utils.extend(o1, o2);
   *  > // Returns: {
   *  > //   a: 1,
   *  > //   b: 2,
   *  > //   c: '3',
   *  > //   d: [ 5 ]
   *  > // };
   *
   * @param  {object+} Any number of objects.
   * @return {object}  The merged object.
   */
  sigma.utils.extend = function() {
    var i,
        k,
        res = {},
        l = arguments.length;

    for (i = l - 1; i >= 0; i--)
      for (k in arguments[i])
        res[k] = arguments[i][k];

    return res;
  };

  /**
   * A short "Date.now()" polyfill.
   *
   * @return {Number} The current time (in ms).
   */
  sigma.utils.dateNow = function() {
    return Date.now ? Date.now() : new Date().getTime();
  };

  /**
   * Takes a package name as parameter and checks at each lebel if it exists,
   * and if it does not, creates it.
   *
   * Example:
   * ********
   *  > sigma.utils.pkg('a.b.c');
   *  > a.b.c;
   *  > // Object {};
   *  >
   *  > sigma.utils.pkg('a.b.d');
   *  > a.b;
   *  > // Object { c: {}, d: {} };
   *
   * @param  {string} pkgName The name of the package to create/find.
   * @return {object}         The related package.
   */
  sigma.utils.pkg = function(pkgName) {
    return (pkgName || '').split('.').reduce(function(context, objName) {
      return (objName in context) ?
        context[objName] :
        (context[objName] = {});
    }, _root);
  };

  /**
   * Returns a unique incremental number ID.
   *
   * Example:
   * ********
   *  > sigma.utils.id();
   *  > // 1;
   *  >
   *  > sigma.utils.id();
   *  > // 2;
   *  >
   *  > sigma.utils.id();
   *  > // 3;
   *
   * @param  {string} pkgName The name of the package to create/find.
   * @return {object}         The related package.
   */
  sigma.utils.id = (function() {
    var i = 0;
    return function() {
      return ++i;
    };
  })();

  /**
   * This function takes an hexa color (for instance "#ffcc00" or "#fc0") or a
   * rgb / rgba color (like "rgb(255,255,12)" or "rgba(255,255,12,1)") and
   * returns an integer equal to "r * 255 * 255 + g * 255 + b", to gain some
   * memory in the data given to WebGL shaders.
   *
   * Note that the function actually caches its results for better performance.
   *
   * @param  {string} val The hexa or rgba color.
   * @return {number}     The number value.
   */
  var floatColorCache = {};

  sigma.utils.floatColor = function(val) {

    // Is the color already computed?
    if (floatColorCache[val])
      return floatColorCache[val];

    var original = val,
        r = 0,
        g = 0,
        b = 0;

    if (val[0] === '#') {
      val = val.slice(1);

      if (val.length === 3) {
        r = parseInt(val.charAt(0) + val.charAt(0), 16);
        g = parseInt(val.charAt(1) + val.charAt(1), 16);
        b = parseInt(val.charAt(2) + val.charAt(2), 16);
      }
      else {
        r = parseInt(val.charAt(0) + val.charAt(1), 16);
        g = parseInt(val.charAt(2) + val.charAt(3), 16);
        b = parseInt(val.charAt(4) + val.charAt(5), 16);
      }
    } else if (val.match(/^ *rgba? *\(/)) {
      val = val.match(
        /^ *rgba? *\( *([0-9]*) *, *([0-9]*) *, *([0-9]*) *(,.*)?\) *$/
      );
      r = +val[1];
      g = +val[2];
      b = +val[3];
    }

    var color = (
      r * 256 * 256 +
      g * 256 +
      b
    );

    // Caching the color
    floatColorCache[original] = color;

    return color;
  };

    /**
   * Perform a zoom into a camera, with or without animation, to the
   * coordinates indicated using a specified ratio.
   *
   * Recognized parameters:
   * **********************
   * Here is the exhaustive list of every accepted parameters in the animation
   * object:
   *
   *   {?number} duration     An amount of time that means the duration of the
   *                          animation. If this parameter doesn't exist the
   *                          zoom will be performed without animation.
   *   {?function} onComplete A function to perform it after the animation. It
   *                          will be performed even if there is no duration.
   *
   * @param {camera}     The camera where perform the zoom.
   * @param {x}          The X coordiantion where the zoom goes.
   * @param {y}          The Y coordiantion where the zoom goes.
   * @param {ratio}      The ratio to apply it to the current camera ratio.
   * @param {?animation} A dictionary with options for a possible animation.
   */
  sigma.utils.zoomTo = function(camera, x, y, ratio, animation) {
    var settings = camera.settings,
        count,
        newRatio,
        animationSettings,
        coordinates;

    // Create the newRatio dealing with min / max:
    newRatio = Math.max(
      settings('zoomMin'),
      Math.min(
        settings('zoomMax'),
        camera.ratio * ratio
      )
    );

    // Check that the new ratio is different from the initial one:
    if (newRatio !== camera.ratio) {
      // Create the coordinates variable:
      ratio = newRatio / camera.ratio;
      coordinates = {
        x: x * (1 - ratio) + camera.x,
        y: y * (1 - ratio) + camera.y,
        ratio: newRatio
      };

      if (animation && animation.duration) {
        // Complete the animation setings:
        count = sigma.misc.animation.killAll(camera);
        animation = sigma.utils.extend(
          animation,
          {
            easing: count ? 'quadraticOut' : 'quadraticInOut'
          }
        );

        sigma.misc.animation.camera(camera, coordinates, animation);
      } else {
        camera.goTo(coordinates);
        if (animation && animation.onComplete)
          animation.onComplete();
      }
    }
  };

  /**
   * Return the control point coordinates for a quadratic bezier curve.
   *
   * @param  {number}  x1  The X coordinate of the start point.
   * @param  {number}  y1  The Y coordinate of the start point.
   * @param  {number}  x2  The X coordinate of the end point.
   * @param  {number}  y2  The Y coordinate of the end point.
   * @param  {?number} cc  The curvature coefficients.
   * @return {x,y}         The control point coordinates.
   */
  sigma.utils.getQuadraticControlPoint = function(x1, y1, x2, y2, cc) {
    cc = this.extend(cc, { x: 2, y: 4 });
    return {
      x: (x1 + x2) / cc.x + (y2 - y1) / cc.y,
      y: (y1 + y2) / cc.x + (x1 - x2) / cc.y
    };
  };

  /**
    * Compute the coordinates of the point positioned
    * at length t in the quadratic bezier curve.
    *
    * @param  {number} t  In [0,1] the step percentage to reach
    *                     the point in the curve from the context point.
    * @param  {number} x1 The X coordinate of the context point.
    * @param  {number} y1 The Y coordinate of the context point.
    * @param  {number} x2 The X coordinate of the ending point.
    * @param  {number} y2 The Y coordinate of the ending point.
    * @param  {number} xi The X coordinate of the control point.
    * @param  {number} yi The Y coordinate of the control point.
    * @return {object}    {x,y}.
  */
  sigma.utils.getPointOnQuadraticCurve = function(t, x1, y1, x2, y2, xi, yi) {
    // http://stackoverflow.com/a/5634528
    return {
      x: (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * xi + t * t * x2,
      y: (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * yi + t * t * y2
    };
  };

  /**
    * Compute the coordinates of the point positioned
    * at length t in the cubic bezier curve.
    *
    * @param  {number} t  In [0,1] the step percentage to reach
    *                     the point in the curve from the context point.
    * @param  {number} x1 The X coordinate of the context point.
    * @param  {number} y1 The Y coordinate of the context point.
    * @param  {number} x2 The X coordinate of the end point.
    * @param  {number} y2 The Y coordinate of the end point.
    * @param  {number} cx The X coordinate of the first control point.
    * @param  {number} cy The Y coordinate of the first control point.
    * @param  {number} dx The X coordinate of the second control point.
    * @param  {number} dy The Y coordinate of the second control point.
    * @return {object}    {x,y} The point at t.
  */
  sigma.utils.getPointOnBezierCurve =
    function(t, x1, y1, x2, y2, cx, cy, dx, dy) {
    // http://stackoverflow.com/a/15397596
    // Blending functions:
    var B0_t = (1 - t) * (1 - t) * (1 - t),
        B1_t = 3 * t * (1 - t) * (1 - t),
        B2_t = 3 * t * t * (1 - t),
        B3_t = t * t * t;

    return {
      x: (B0_t * x1) + (B1_t * cx) + (B2_t * dx) + (B3_t * x2),
      y: (B0_t * y1) + (B1_t * cy) + (B2_t * dy) + (B3_t * y2)
    };
  };

  /**
   * Return the coordinates of the two control points for a self loop (i.e.
   * where the start point is also the end point) computed as a cubic bezier
   * curve.
   *
   * @param  {number} x    The X coordinate of the node.
   * @param  {number} y    The Y coordinate of the node.
   * @param  {number} size The node size.
   * @return {x1,y1,x2,y2} The coordinates of the two control points.
   */
  sigma.utils.getSelfLoopControlPoints = function(x , y, size) {
    return {
      x1: x - size * 7,
      y1: y,
      x2: x,
      y2: y + size * 7
    };
  };

  /**
   * Return the euclidian distance between two points of a plane
   * with an orthonormal basis.
   *
   * @param  {number} x1  The X coordinate of the first point.
   * @param  {number} y1  The Y coordinate of the first point.
   * @param  {number} x2  The X coordinate of the second point.
   * @param  {number} y2  The Y coordinate of the second point.
   * @return {number}     The euclidian distance.
   */
  sigma.utils.getDistance = function(x0, y0, x1, y1) {
    return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
  };

  /**
   * Return the coordinates of the intersection points of two circles.
   *
   * @param  {number} x0  The X coordinate of center location of the first
   *                      circle.
   * @param  {number} y0  The Y coordinate of center location of the first
   *                      circle.
   * @param  {number} r0  The radius of the first circle.
   * @param  {number} x1  The X coordinate of center location of the second
   *                      circle.
   * @param  {number} y1  The Y coordinate of center location of the second
   *                      circle.
   * @param  {number} r1  The radius of the second circle.
   * @return {xi,yi}      The coordinates of the intersection points.
   */
  sigma.utils.getCircleIntersection = function(x0, y0, r0, x1, y1, r1) {
    // http://stackoverflow.com/a/12219802
    var a, dx, dy, d, h, rx, ry, x2, y2;

    // dx and dy are the vertical and horizontal distances between the circle
    // centers:
    dx = x1 - x0;
    dy = y1 - y0;

    // Determine the straight-line distance between the centers:
    d = Math.sqrt((dy * dy) + (dx * dx));

    // Check for solvability:
    if (d > (r0 + r1)) {
        // No solution. circles do not intersect.
        return false;
    }
    if (d < Math.abs(r0 - r1)) {
        // No solution. one circle is contained in the other.
        return false;
    }

    //'point 2' is the point where the line through the circle intersection
    // points crosses the line between the circle centers.

    // Determine the distance from point 0 to point 2:
    a = ((r0 * r0) - (r1 * r1) + (d * d)) / (2.0 * d);

    // Determine the coordinates of point 2:
    x2 = x0 + (dx * a / d);
    y2 = y0 + (dy * a / d);

    // Determine the distance from point 2 to either of the intersection
    // points:
    h = Math.sqrt((r0 * r0) - (a * a));

    // Determine the offsets of the intersection points from point 2:
    rx = -dy * (h / d);
    ry = dx * (h / d);

    // Determine the absolute intersection points:
    var xi = x2 + rx;
    var xi_prime = x2 - rx;
    var yi = y2 + ry;
    var yi_prime = y2 - ry;

    return {xi: xi, xi_prime: xi_prime, yi: yi, yi_prime: yi_prime};
  };

  /**
    * Check if a point is on a line segment.
    *
    * @param  {number} x       The X coordinate of the point to check.
    * @param  {number} y       The Y coordinate of the point to check.
    * @param  {number} x1      The X coordinate of the line start point.
    * @param  {number} y1      The Y coordinate of the line start point.
    * @param  {number} x2      The X coordinate of the line end point.
    * @param  {number} y2      The Y coordinate of the line end point.
    * @param  {number} epsilon The precision (consider the line thickness).
    * @return {boolean}        True if point is "close to" the line
    *                          segment, false otherwise.
  */
  sigma.utils.isPointOnSegment = function(x, y, x1, y1, x2, y2, epsilon) {
    return sigma.utils.distancePointToSegment(x, y, x1, y1, x2, y2) < epsilon;
  };

  /**
    * Compute the distance of a point to a line segment.
    *
    * @param  {number} x       The X coordinate of the point to check.
    * @param  {number} y       The Y coordinate of the point to check.
    * @param  {number} x1      The X coordinate of the line start point.
    * @param  {number} y1      The Y coordinate of the line start point.
    * @param  {number} x2      The X coordinate of the line end point.
    * @param  {number} y2      The Y coordinate of the line end point.
    * @return {number}         Distance to the segment
  */
  sigma.utils.distancePointToSegment = function(x, y, x1, y1, x2, y2) {
    // http://stackoverflow.com/a/6853926/1075195
    var A = x - x1,
        B = y - y1,
        C = x2 - x1,
        D = y2 - y1,
        dot = A * C + B * D,
        len_sq = C * C + D * D,
        param = -1,
        xx, yy;

    if (len_sq !== 0) //in case of 0 length line
        param = dot / len_sq;

    if (param < 0) {
      xx = x1;
      yy = y1;
    }
    else if (param > 1) {
      xx = x2;
      yy = y2;
    }
    else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /**
    * Check if a point is on a quadratic bezier curve segment with a thickness.
    *
    * @param  {number} x       The X coordinate of the point to check.
    * @param  {number} y       The Y coordinate of the point to check.
    * @param  {number} x1      The X coordinate of the curve start point.
    * @param  {number} y1      The Y coordinate of the curve start point.
    * @param  {number} x2      The X coordinate of the curve end point.
    * @param  {number} y2      The Y coordinate of the curve end point.
    * @param  {number} cpx     The X coordinate of the curve control point.
    * @param  {number} cpy     The Y coordinate of the curve control point.
    * @param  {number} epsilon The precision (consider the line thickness).
    * @return {boolean}        True if (x,y) is on the curve segment,
    *                          false otherwise.
  */
  sigma.utils.isPointOnQuadraticCurve =
    function(x, y, x1, y1, x2, y2, cpx, cpy, epsilon) {
    // Fails if the point is too far from the extremities of the segment,
    // preventing for more costly computation:
    var dP1P2 = sigma.utils.getDistance(x1, y1, x2, y2);
    if (Math.abs(x - x1) > dP1P2 || Math.abs(y - y1) > dP1P2) {
      return false;
    }

    var dP1 = sigma.utils.getDistance(x, y, x1, y1),
        dP2 = sigma.utils.getDistance(x, y, x2, y2),
        t = 0.5,
        r = (dP1 < dP2) ? -0.01 : 0.01,
        rThreshold = 0.001,
        i = 100,
        pt = sigma.utils.getPointOnQuadraticCurve(t, x1, y1, x2, y2, cpx, cpy),
        dt = sigma.utils.getDistance(x, y, pt.x, pt.y),
        old_dt;

    // This algorithm minimizes the distance from the point to the curve. It
    // find the optimal t value where t=0 is the start point and t=1 is the end
    // point of the curve, starting from t=0.5.
    // It terminates because it runs a maximum of i interations.
    while (i-- > 0 &&
      t >= 0 && t <= 1 &&
      (dt > epsilon) &&
      (r > rThreshold || r < -rThreshold)) {
      old_dt = dt;
      pt = sigma.utils.getPointOnQuadraticCurve(t, x1, y1, x2, y2, cpx, cpy);
      dt = sigma.utils.getDistance(x, y, pt.x, pt.y);

      if (dt > old_dt) {
        // not the right direction:
        // halfstep in the opposite direction
        r = -r / 2;
        t += r;
      }
      else if (t + r < 0 || t + r > 1) {
        // oops, we've gone too far:
        // revert with a halfstep
        r = r / 2;
        dt = old_dt;
      }
      else {
        // progress:
        t += r;
      }
    }

    return dt < epsilon;
  };


  /**
    * Check if a point is on a cubic bezier curve segment with a thickness.
    *
    * @param  {number} x       The X coordinate of the point to check.
    * @param  {number} y       The Y coordinate of the point to check.
    * @param  {number} x1      The X coordinate of the curve start point.
    * @param  {number} y1      The Y coordinate of the curve start point.
    * @param  {number} x2      The X coordinate of the curve end point.
    * @param  {number} y2      The Y coordinate of the curve end point.
    * @param  {number} cpx1    The X coordinate of the 1st curve control point.
    * @param  {number} cpy1    The Y coordinate of the 1st curve control point.
    * @param  {number} cpx2    The X coordinate of the 2nd curve control point.
    * @param  {number} cpy2    The Y coordinate of the 2nd curve control point.
    * @param  {number} epsilon The precision (consider the line thickness).
    * @return {boolean}        True if (x,y) is on the curve segment,
    *                          false otherwise.
  */
  sigma.utils.isPointOnBezierCurve =
    function(x, y, x1, y1, x2, y2, cpx1, cpy1, cpx2, cpy2, epsilon) {
    // Fails if the point is too far from the extremities of the segment,
    // preventing for more costly computation:
    var dP1CP1 = sigma.utils.getDistance(x1, y1, cpx1, cpy1);
    if (Math.abs(x - x1) > dP1CP1 || Math.abs(y - y1) > dP1CP1) {
      return false;
    }

    var dP1 = sigma.utils.getDistance(x, y, x1, y1),
        dP2 = sigma.utils.getDistance(x, y, x2, y2),
        t = 0.5,
        r = (dP1 < dP2) ? -0.01 : 0.01,
        rThreshold = 0.001,
        i = 100,
        pt = sigma.utils.getPointOnBezierCurve(
          t, x1, y1, x2, y2, cpx1, cpy1, cpx2, cpy2),
        dt = sigma.utils.getDistance(x, y, pt.x, pt.y),
        old_dt;

    // This algorithm minimizes the distance from the point to the curve. It
    // find the optimal t value where t=0 is the start point and t=1 is the end
    // point of the curve, starting from t=0.5.
    // It terminates because it runs a maximum of i interations.
    while (i-- > 0 &&
      t >= 0 && t <= 1 &&
      (dt > epsilon) &&
      (r > rThreshold || r < -rThreshold)) {
      old_dt = dt;
      pt = sigma.utils.getPointOnBezierCurve(
        t, x1, y1, x2, y2, cpx1, cpy1, cpx2, cpy2);
      dt = sigma.utils.getDistance(x, y, pt.x, pt.y);

      if (dt > old_dt) {
        // not the right direction:
        // halfstep in the opposite direction
        r = -r / 2;
        t += r;
      }
      else if (t + r < 0 || t + r > 1) {
        // oops, we've gone too far:
        // revert with a halfstep
        r = r / 2;
        dt = old_dt;
      }
      else {
        // progress:
        t += r;
      }
    }

    return dt < epsilon;
  };


  /**
   * ************
   * EVENTS UTILS:
   * ************
   */
  /**
   * Here are some useful functions to unify extraction of the information we
   * need with mouse events and touch events, from different browsers:
   */

  /**
   * Extract the local X position from a mouse or touch event.
   *
   * @param  {event}  e A mouse or touch event.
   * @return {number}   The local X value of the mouse.
   */
  sigma.utils.getX = function(e) {
    return (
      (e.offsetX !== undefined && e.offsetX) ||
      (e.layerX !== undefined && e.layerX) ||
      (e.clientX !== undefined && e.clientX)
    );
  };

  /**
   * Extract the local Y position from a mouse or touch event.
   *
   * @param  {event}  e A mouse or touch event.
   * @return {number}   The local Y value of the mouse.
   */
  sigma.utils.getY = function(e) {
    return (
      (e.offsetY !== undefined && e.offsetY) ||
      (e.layerY !== undefined && e.layerY) ||
      (e.clientY !== undefined && e.clientY)
    );
  };

  /**
   * The pixel ratio of the screen. Taking zoom into account
   *
   * @return {number}        Pixel ratio of the screen
   */
  sigma.utils.getPixelRatio = function() {
    var ratio = 1;
    if (window.screen.deviceXDPI !== undefined &&
         window.screen.logicalXDPI !== undefined &&
         window.screen.deviceXDPI > window.screen.logicalXDPI) {
        ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
    }
    else if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
    }
    return ratio;
  };

  /**
   * Extract the width from a mouse or touch event.
   *
   * @param  {event}  e A mouse or touch event.
   * @return {number}   The width of the event's target.
   */
  sigma.utils.getWidth = function(e) {
    var w = (!e.target.ownerSVGElement) ?
              e.target.width :
              e.target.ownerSVGElement.width;

    return (
      (typeof w === 'number' && w) ||
      (w !== undefined && w.baseVal !== undefined && w.baseVal.value)
    );
  };

  /**
   * Extract the center from a mouse or touch event.
   *
   * @param  {event}  e A mouse or touch event.
   * @return {object}   The center of the event's target.
   */
  sigma.utils.getCenter = function(e) {
    var ratio = e.target.namespaceURI.indexOf('svg') !== -1 ? 1 :
        sigma.utils.getPixelRatio();
    return {
      x: sigma.utils.getWidth(e) / (2 * ratio),
      y: sigma.utils.getHeight(e) / (2 * ratio),
    };
  };

  /**
   * Convert mouse coords to sigma coords
   *
   * @param  {event}   e A mouse or touch event.
   * @param  {number?} x The x coord to convert
   * @param  {number?} x The y coord to convert
   *
   * @return {object}    The standardized event
   */
  sigma.utils.mouseCoords = function(e, x, y) {
    x = x || sigma.utils.getX(e);
    y = y || sigma.utils.getY(e);
    return {
        x: x - sigma.utils.getCenter(e).x,
        y: y - sigma.utils.getCenter(e).y,
        clientX: e.clientX,
        clientY: e.clientY,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey
    };
  };

  /**
   * Extract the height from a mouse or touch event.
   *
   * @param  {event}  e A mouse or touch event.
   * @return {number}   The height of the event's target.
   */
  sigma.utils.getHeight = function(e) {
    var h = (!e.target.ownerSVGElement) ?
              e.target.height :
              e.target.ownerSVGElement.height;

    return (
      (typeof h === 'number' && h) ||
      (h !== undefined && h.baseVal !== undefined && h.baseVal.value)
    );
  };

  /**
   * Extract the wheel delta from a mouse or touch event.
   *
   * @param  {event}  e A mouse or touch event.
   * @return {number}   The wheel delta of the mouse.
   */
  sigma.utils.getDelta = function(e) {
    return (
      (e.wheelDelta !== undefined && e.wheelDelta) ||
      (e.detail !== undefined && -e.detail)
    );
  };

  /**
   * Returns the offset of a DOM element.
   *
   * @param  {DOMElement} dom The element to retrieve the position.
   * @return {object}         The offset of the DOM element (top, left).
   */
  sigma.utils.getOffset = function(dom) {
    var left = 0,
        top = 0;

    while (dom) {
      top = top + parseInt(dom.offsetTop);
      left = left + parseInt(dom.offsetLeft);
      dom = dom.offsetParent;
    }

    return {
      top: top,
      left: left
    };
  };

  /**
   * Simulates a "double click" event.
   *
   * @param  {HTMLElement} target   The event target.
   * @param  {string}      type     The event type.
   * @param  {function}    callback The callback to execute.
   */
  sigma.utils.doubleClick = function(target, type, callback) {
    var clicks = 0,
        self = this,
        handlers;

    target._doubleClickHandler = target._doubleClickHandler || {};
    target._doubleClickHandler[type] = target._doubleClickHandler[type] || [];
    handlers = target._doubleClickHandler[type];

    handlers.push(function(e) {
      clicks++;

      if (clicks === 2) {
        clicks = 0;
        return callback(e);
      } else if (clicks === 1) {
        setTimeout(function() {
          clicks = 0;
        }, sigma.settings.doubleClickTimeout);
      }
    });

    target.addEventListener(type, handlers[handlers.length - 1], false);
  };

  /**
   * Unbind simulated "double click" events.
   *
   * @param  {HTMLElement} target   The event target.
   * @param  {string}      type     The event type.
   */
  sigma.utils.unbindDoubleClick = function(target, type) {
    var handler,
        handlers = (target._doubleClickHandler || {})[type] || [];

    while ((handler = handlers.pop())) {
      target.removeEventListener(type, handler);
    }

    delete (target._doubleClickHandler || {})[type];
  };




  /**
   * Here are just some of the most basic easing functions, used for the
   * animated camera "goTo" calls.
   *
   * If you need some more easings functions, don't hesitate to add them to
   * sigma.utils.easings. But I will not add some more here or merge PRs
   * containing, because I do not want sigma sources full of overkill and never
   * used stuff...
   */
  sigma.utils.easings = sigma.utils.easings || {};
  sigma.utils.easings.linearNone = function(k) {
    return k;
  };
  sigma.utils.easings.quadraticIn = function(k) {
    return k * k;
  };
  sigma.utils.easings.quadraticOut = function(k) {
    return k * (2 - k);
  };
  sigma.utils.easings.quadraticInOut = function(k) {
    if ((k *= 2) < 1)
      return 0.5 * k * k;
    return - 0.5 * (--k * (k - 2) - 1);
  };
  sigma.utils.easings.cubicIn = function(k) {
    return k * k * k;
  };
  sigma.utils.easings.cubicOut = function(k) {
    return --k * k * k + 1;
  };
  sigma.utils.easings.cubicInOut = function(k) {
    if ((k *= 2) < 1)
      return 0.5 * k * k * k;
    return 0.5 * ((k -= 2) * k * k + 2);
  };




  /**
   * ************
   * WEBGL UTILS:
   * ************
   */

  /**
   * Return true if the browser support webgl
   *
   * @return {boolean}
   */
  sigma.utils.isWebGLSupported = function() {
    var canvas,
        webgl = !!window.WebGLRenderingContext;
    if (webgl) {
      canvas = document.createElement('canvas');
      try {
        return !!(
          canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl')
        );
      } catch (e) {}
    }
    return false;
  };

  /**
   * Loads a WebGL shader and returns it.
   *
   * @param  {WebGLContext}           gl           The WebGLContext to use.
   * @param  {string}                 shaderSource The shader source.
   * @param  {number}                 shaderType   The type of shader.
   * @param  {function(string): void} error        Callback for errors.
   * @return {WebGLShader}                         The created shader.
   */
  sigma.utils.loadShader = function(gl, shaderSource, shaderType, error) {
    var compiled,
        shader = gl.createShader(shaderType);

    // Load the shader source
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    // If something went wrong:
    if (!compiled) {
      if (error) {
        error(
          'Error compiling shader "' + shader + '":' +
          gl.getShaderInfoLog(shader)
        );
      }

      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  /**
   * Creates a program, attaches shaders, binds attrib locations, links the
   * program and calls useProgram.
   *
   * @param  {Array.<WebGLShader>}    shaders   The shaders to attach.
   * @param  {Array.<string>}         attribs   The attribs names.
   * @param  {Array.<number>}         locations The locations for the attribs.
   * @param  {function(string): void} error     Callback for errors.
   * @return {WebGLProgram}                     The created program.
   */
  sigma.utils.loadProgram = function(gl, shaders, attribs, loc, error) {
    var i,
        linked,
        program = gl.createProgram();

    for (i = 0; i < shaders.length; ++i)
      gl.attachShader(program, shaders[i]);

    if (attribs)
      for (i = 0; i < attribs.length; ++i)
        gl.bindAttribLocation(
          program,
          locations ? locations[i] : i,
          opt_attribs[i]
        );

    gl.linkProgram(program);

    // Check the link status
    linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      if (error)
        error('Error in program linking: ' + gl.getProgramInfoLog(program));

      gl.deleteProgram(program);
      return null;
    }

    return program;
  };

  /**
   * *********
   * MATRICES:
   * *********
   * The following utils are just here to help generating the transformation
   * matrices for the WebGL renderers.
   */
  sigma.utils.pkg('sigma.utils.matrices');

  /**
   * The returns a 3x3 translation matrix.
   *
   * @param  {number} dx The X translation.
   * @param  {number} dy The Y translation.
   * @return {array}     Returns the matrix.
   */
  sigma.utils.matrices.translation = function(dx, dy) {
    return [
      1, 0, 0,
      0, 1, 0,
      dx, dy, 1
    ];
  };

  /**
   * The returns a 3x3 or 2x2 rotation matrix.
   *
   * @param  {number}  angle The rotation angle.
   * @param  {boolean} m2    If true, the function will return a 2x2 matrix.
   * @return {array}         Returns the matrix.
   */
  sigma.utils.matrices.rotation = function(angle, m2) {
    var cos = Math.cos(angle),
        sin = Math.sin(angle);

    return m2 ? [
      cos, -sin,
      sin, cos
    ] : [
      cos, -sin, 0,
      sin, cos, 0,
      0, 0, 1
    ];
  };

  /**
   * The returns a 3x3 or 2x2 homothetic transformation matrix.
   *
   * @param  {number}  ratio The scaling ratio.
   * @param  {boolean} m2    If true, the function will return a 2x2 matrix.
   * @return {array}         Returns the matrix.
   */
  sigma.utils.matrices.scale = function(ratio, m2) {
    return m2 ? [
      ratio, 0,
      0, ratio
    ] : [
      ratio, 0, 0,
      0, ratio, 0,
      0, 0, 1
    ];
  };

  /**
   * The returns a 3x3 or 2x2 homothetic transformation matrix.
   *
   * @param  {array}   a  The first matrix.
   * @param  {array}   b  The second matrix.
   * @param  {boolean} m2 If true, the function will assume both matrices are
   *                      2x2.
   * @return {array}      Returns the matrix.
   */
  sigma.utils.matrices.multiply = function(a, b, m2) {
    var l = m2 ? 2 : 3,
        a00 = a[0 * l + 0],
        a01 = a[0 * l + 1],
        a02 = a[0 * l + 2],
        a10 = a[1 * l + 0],
        a11 = a[1 * l + 1],
        a12 = a[1 * l + 2],
        a20 = a[2 * l + 0],
        a21 = a[2 * l + 1],
        a22 = a[2 * l + 2],
        b00 = b[0 * l + 0],
        b01 = b[0 * l + 1],
        b02 = b[0 * l + 2],
        b10 = b[1 * l + 0],
        b11 = b[1 * l + 1],
        b12 = b[1 * l + 2],
        b20 = b[2 * l + 0],
        b21 = b[2 * l + 1],
        b22 = b[2 * l + 2];

    return m2 ? [
      a00 * b00 + a01 * b10,
      a00 * b01 + a01 * b11,
      a10 * b00 + a11 * b10,
      a10 * b01 + a11 * b11
    ] : [
      a00 * b00 + a01 * b10 + a02 * b20,
      a00 * b01 + a01 * b11 + a02 * b21,
      a00 * b02 + a01 * b12 + a02 * b22,
      a10 * b00 + a11 * b10 + a12 * b20,
      a10 * b01 + a11 * b11 + a12 * b21,
      a10 * b02 + a11 * b12 + a12 * b22,
      a20 * b00 + a21 * b10 + a22 * b20,
      a20 * b01 + a21 * b11 + a22 * b21,
      a20 * b02 + a21 * b12 + a22 * b22
    ];
  };


  /**
   * ************
   * CANVAS UTILS:
   * ************
   */
  /**
   * Calculate the width of the text either approximated via the font size or
   * via the more expensive but accurate context.measureText.
   *
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {boolean}     approximate   Approximate or not.
   * @param  {integer}     fontSize      Font size of the text.
   * @param  {string}      text          The text to use.
   *
   * @return {float}       Returns the width.
   */
   sigma.utils.canvas = {};
   sigma.utils.canvas.getTextWidth =
        function(context, approximate, fontSize, text) {

    if (!text) return 0;

    return approximate ? 0.6 * text.length * fontSize :
      context.measureText(text).width;
  };

  /**
   * Set the shadow values of the specified context according to the level
   * to create visual depth.
   *
   * @param  {number}     level     The level (from 1 to 5).
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   */
  sigma.utils.canvas.setLevel = function(level, context) {
    if (level) {
      context.shadowOffsetX = 0;
      // inspired by Material Design shadows, level from 1 to 5:
      switch(level) {
        case 1:
          context.shadowOffsetY = 1.5;
          context.shadowBlur = 4;
          context.shadowColor = 'rgba(0,0,0,0.36)';
          break;
        case 2:
          context.shadowOffsetY = 3;
          context.shadowBlur = 12;
          context.shadowColor = 'rgba(0,0,0,0.39)';
          break;
        case 3:
          context.shadowOffsetY = 6;
          context.shadowBlur = 12;
          context.shadowColor = 'rgba(0,0,0,0.42)';
          break;
        case 4:
          context.shadowOffsetY = 10;
          context.shadowBlur = 20;
          context.shadowColor = 'rgba(0,0,0,0.47)';
          break;
        case 5:
          context.shadowOffsetY = 15;
          context.shadowBlur = 24;
          context.shadowColor = 'rgba(0,0,0,0.52)';
          break;
      }
    }
  };

  /**
   * Reset the shadow values.
   *
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   */
  sigma.utils.canvas.resetLevel = function(context) {
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;
    context.shadowColor = '#000000';
  };

  // incrementally scaled, not automatically resized for now
  // (ie. possible memory leak if there are many graph load / unload)
  var imgCache = {};

  /**
   * Draw an image inside the specified node on the canvas.
   *
   * @param  {object}                   node     The node object.
   * @param  {number}                   x        The node x coordinate.
   * @param  {number}                   y        The node y coordinate.
   * @param  {number}                   size     The node size.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {string}                   imgCrossOrigin Cross-origin URL or '*'.
   * @param  {number}                  threshold Display if node size is larger
   * @param  {function}                 clipFn    The clipping shape function.
   */
  sigma.utils.canvas.drawImage =
    function(node, x, y, size, context, imgCrossOrigin, threshold, clipFn) {

    if(!node.image || !node.image.url || size < threshold) return;

    var url = node.image.url;
    var ih = node.image.h || 1; // 1 is arbitrary, anyway only the ratio counts
    var iw = node.image.w || 1;
    var scale = node.image.scale || 1;
    var clip = node.image.clip || 1;

    // create new IMG or get from imgCache
    var image = imgCache[url];
    if(!image) {
      image = document.createElement('IMG');
      image.setAttribute('crossOrigin', imgCrossOrigin);
      image.src = url;
      image.onload = function() {
        window.dispatchEvent(new Event('resize'));
      };
      imgCache[url] = image;
    }

    // calculate position and draw
    var xratio = (iw < ih) ? (iw / ih) : 1;
    var yratio = (ih < iw) ? (ih / iw) : 1;
    var r = size * scale;

    context.save(); // enter clipping mode
      context.beginPath();
    if (typeof clipFn === 'function') {
      clipFn(node, x, y, size, context, clip);
    }
    else {
      // Draw the clipping disc:
      context.arc(x, y, size * clip, 0, Math. PI * 2, true);
    }
    context.closePath();
    context.clip();

    // Draw the actual image
    context.drawImage(
      image,
      x + Math.sin(-3.142 / 4) * r * xratio,
      y - Math.cos(-3.142 / 4) * r * yratio,
      r * xratio * 2 * Math.sin(-3.142 / 4) * (-1),
      r * yratio * 2 * Math.cos(-3.142 / 4)
    );
    context.restore(); // exit clipping mode
  };

  /**
   * Draw an icon inside the specified node on the canvas.
   *
   * @param  {object}                   node     The node object.
   * @param  {number}                   x        The node x coordinate.
   * @param  {number}                   y        The node y coordinate.
   * @param  {number}                   size     The node size.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {number}                  threshold Display if node size is larger
   */
  sigma.utils.canvas.drawIcon = function(node, x, y, size, context, threshold){
    if(!node.icon || size < threshold) return;

    var font = node.icon.font || 'Arial',
        fgColor = node.icon.color || '#F00',
        text = node.icon.content || '?',
        px = node.icon.x || 0.5,
        py = node.icon.y || 0.5,
        height = size,
        width = size;

    var fontSizeRatio = 0.70;
    if (typeof node.icon.scale === "number") {
      fontSizeRatio = Math.abs(Math.max(0.01, node.icon.scale));
    }

    var fontSize = Math.round(fontSizeRatio * height);

    context.save();
    context.fillStyle = fgColor;

    context.font = '' + fontSize + 'px ' + font;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, x, y);
    context.restore();
  };

}).call(this);

;(function(global) {
  'use strict';

  /**
   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
   * requestAnimationFrame polyfill by Erik Möller.
   * fixes from Paul Irish and Tino Zijdel
   * MIT license
   */
  var x,
      lastTime = 0,
      vendors = ['ms', 'moz', 'webkit', 'o'];

  for (x = 0; x < vendors.length && !global.requestAnimationFrame; x++) {
    global.requestAnimationFrame =
      global[vendors[x] + 'RequestAnimationFrame'];
    global.cancelAnimationFrame =
      global[vendors[x] + 'CancelAnimationFrame'] ||
      global[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!global.requestAnimationFrame)
    global.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime(),
          timeToCall = Math.max(0, 16 - (currTime - lastTime)),
          id = global.setTimeout(
            function() {
              callback(currTime + timeToCall);
            },
            timeToCall
          );

      lastTime = currTime + timeToCall;
      return id;
    };

  if (!global.cancelAnimationFrame)
    global.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };

  /**
   * Function.prototype.bind polyfill found on MDN.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
   * Public domain
   */
  if (!Function.prototype.bind)
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function')
        // Closest thing possible to the ECMAScript 5 internal IsCallable
        // function:
        throw new TypeError(
          'Function.prototype.bind - what is trying to be bound is not callable'
        );

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP,
          fBound;

      fNOP = function() {};
      fBound = function() {
        return fToBind.apply(
          this instanceof fNOP && oThis ?
            this :
            oThis,
          aArgs.concat(Array.prototype.slice.call(arguments))
        );
      };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
})(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Packages initialization:
  sigma.utils.pkg('sigma.settings');

  var settings = {
    /**
     * GRAPH SETTINGS:
     * ***************
     */
    // {boolean} Indicates if the data have to be cloned in methods to add
    //           nodes or edges.
    clone: false,
    // {boolean} Indicates if nodes "id" values and edges "id", "source" and
    //           "target" values must be set as immutable.
    immutable: true,
    // {boolean} Indicates if sigma can log its errors and warnings.
    verbose: false,


    /**
     * RENDERERS SETTINGS:
     * *******************
     */
    // {string}
    classPrefix: 'sigma',
    // {string}
    defaultNodeType: 'def',
    // {string}
    defaultEdgeType: 'def',
    // {string}
    defaultLabelColor: '#000',
    // {string}
    defaultEdgeColor: '#000',
    // {string}
    defaultNodeColor: '#000',
    // {string}
    defaultLabelSize: 14,
    // {string} Label position relative to its node. Available values:
    //          "right", "left", "top", "bottom", "center", "inside"
    labelAlignment: 'right',
    // {string} Indicates how to choose the edges color. Available values:
    //          "source", "target", "default"
    edgeColor: 'source',
    // {number} Defines the minimal edge's arrow display size.
    minArrowSize: 0,
    // {string}
    font: 'arial',
    // {string} Example: 'bold'
    fontStyle: '',
    // {string} Indicates how to choose the labels color. Available values:
    //          "node", "default"
    labelColor: 'default',
    // {string} Indicates how to choose the labels size. Available values:
    //          "fixed", "proportional"
    labelSize: 'fixed',
    // {string} The ratio between the font size of the label and the node size.
    labelSizeRatio: 1,
    // {number} The minimum size a node must have to see its label displayed.
    labelThreshold: 8,
    // {number} Maximum length of a node's label (in characters). Displays the label on several lines. 0 disables it
    // (the whole label is displayed on one line)
    maxNodeLabelLineLength: 0,
    // {number} The oversampling factor used in WebGL renderer.
    webglOversamplingRatio: 2,
    // {number} The size of the border of nodes.
    nodeBorderSize: 0,
    // {number} The default node border's color.
    defaultNodeBorderColor: '#000',
    // {number} The hovered node's label font. If not specified, will heritate
    //          the "font" value.
    hoverFont: '',
    // {boolean} If true, then only one node can be hovered at a time.
    singleHover: true,
    // {string} Example: 'bold'
    hoverFontStyle: '',
    // {string} Indicates how to choose the hovered nodes shadow color.
    //          Available values: "node", "default"
    labelHoverShadow: 'default',
    // {string}
    labelHoverShadowColor: '#000',
    // {string} Indicates how to choose the hovered nodes color.
    //          Available values: "node", "default"
    nodeHoverColor: 'node',
    // {string}
    defaultNodeHoverColor: '#000',
    // {string} Indicates how to choose the hovered nodes background color.
    //          Available values: "node", "default"
    labelHoverBGColor: 'default',
    // {string}
    defaultHoverLabelBGColor: '#fff',
    // {string} Indicates how to choose the hovered labels color.
    //          Available values: "node", "default"
    labelHoverColor: 'default',
    // {string}
    defaultLabelHoverColor: '#000',
    // {string} Indicates how to choose the edges hover color. Available values:
    //          "edge", "default"
    edgeHoverColor: 'edge',
    // {number} The size multiplicator of hovered edges.
    edgeHoverSizeRatio: 1,
    // {string}
    defaultEdgeHoverColor: '#000',
    // {boolean} Indicates if the edge extremities must be hovered when the
    //           edge is hovered.
    edgeHoverExtremities: false,
    // {booleans} The different drawing modes:
    //           false: Layered not displayed.
    //           true: Layered displayed.
    drawEdges: true,
    drawNodes: true,
    drawLabels: true,
    drawEdgeLabels: false,
    // {boolean} Indicates if the edges must be drawn in several frames or in
    //           one frame, as the nodes and labels are drawn.
    batchEdgesDrawing: false,
    // {boolean} Indicates if the edges must be hidden during dragging and
    //           animations.
    hideEdgesOnMove: false,
    // {numbers} The different batch sizes, when elements are displayed in
    //           several frames.
    canvasEdgesBatchSize: 500,
    webglEdgesBatchSize: 1000,
    // {boolean} Approximate labels width instead of using canvas.measureText
    approximateLabelWidth: true,
    // {boolean} Hide edges from nodes too far away
    edgesClippingWithNodes: true,
    // {number} if sigma.canvas.edges.autoCurve is called, set relative
    // distance between curved parallel edges (i.e. edges with same
    // extremities). Smaller value increases distances.
    autoCurveRatio: 1,
    // {boolean} if sigma.canvas.edges.autoCurve is called, sort edges by
    // direction.
    autoCurveSortByDirection: true,


    /**
     * RESCALE SETTINGS:
     * *****************
     */
    // {string} Indicates of to scale the graph relatively to its container.
    //          Available values: "inside", "outside"
    scalingMode: 'inside',
    // {number} The margin to keep around the graph.
    sideMargin: 0,
    // {number} Determine the size of the smallest and the biggest node / edges
    //          on the screen. This mapping makes easier to display the graph,
    //          avoiding too big nodes that take half of the screen, or too
    //          small ones that are not readable. If the two parameters are
    //          equals, then the minimal display size will be 0. And if they
    //          are both equal to 0, then there is no mapping, and the radius
    //          of the nodes will be their size.
    minEdgeSize: 0.5,
    maxEdgeSize: 1,
    minNodeSize: 1,
    maxNodeSize: 8,




    /**
     * CAPTORS SETTINGS:
     * *****************
     */
    // {boolean} If true, the user will need to click on the visualization element
    // in order to focus it
    clickToFocus: false,
    // {boolean}
    touchEnabled: true,
    // {boolean}
    mouseEnabled: true,
    // {boolean}
    mouseWheelEnabled: true,
    // {boolean}
    doubleClickEnabled: true,
    // {boolean} Defines whether the custom events such as "clickNode" can be
    //           used.
    eventsEnabled: true,
    // {number} Defines by how much multiplicating the zooming level when the
    //          user zooms with the mouse-wheel.
    zoomingRatio: 1.7,
    // {number} Defines by how much multiplicating the zooming level when the
    //          user zooms by double clicking.
    doubleClickZoomingRatio: 2.2,
    // {number} The minimum zooming level.
    zoomMin: 0.0625,
    // {number} The maximum zooming level.
    zoomMax: 2,
    // {boolean} Defines whether the zoom focuses on the mouse location.
    zoomOnLocation: true,
    // {number} The duration of animations following a mouse scrolling.
    mouseZoomDuration: 200,
    // {number} The duration of animations following a mouse double click.
    doubleClickZoomDuration: 200,
    // {number} The duration of animations following a mouse dropping.
    mouseInertiaDuration: 200,
    // {number} The inertia power (mouse captor).
    mouseInertiaRatio: 3,
    // {number} The duration of animations following a touch dropping.
    touchInertiaDuration: 200,
    // {number} The inertia power (touch captor).
    touchInertiaRatio: 3,
    // {number} The maximum time between two clicks to make it a double click.
    doubleClickTimeout: 300,
    // {number} The maximum time between two taps to make it a double tap.
    doubleTapTimeout: 300,
    // {number} The maximum time of dragging to trigger intertia.
    dragTimeout: 200,




    /**
     * GLOBAL SETTINGS:
     * ****************
     */
    // {boolean} Determines whether the "rescale" middleware has to be called
    //           automatically for each camera on refresh.
    autoRescale: true,
    // {boolean} If set to false, the camera method "goTo" will basically do
    //           nothing.
    enableCamera: true,
    // {boolean} If set to false, the nodes cannot be hovered.
    enableHovering: true,
    // {boolean} If set to true, the edges can be hovered.
    enableEdgeHovering: false,
    // {number} The size of the area around the edges to activate hovering.
    edgeHoverPrecision: 5,
    // {boolean} If set to true, the rescale middleware will ignore node sizes
    //           to determine the graphs boundings.
    rescaleIgnoreSize: false,
    // {boolean} Determines if the core has to try to catch errors on
    //           rendering.
    skipErrors: false,



    /**
     * SPATIAL INDEXING SETTINGS:
     * ****************
     */
    // {number} Max height of the node quad tree.
    nodeQuadtreeMaxLevel: 4,
    // {number} Max height of the edge quad tree.
    edgeQuadtreeMaxLevel: 4,



    /**
     * CAMERA SETTINGS:
     * ****************
     */
    // {number} The power degrees applied to the nodes/edges size relatively to
    //          the zooming level. Basically:
    //           > onScreenR = Math.pow(zoom, nodesPowRatio) * R
    //           > onScreenT = Math.pow(zoom, edgesPowRatio) * T
    nodesPowRatio: 0.5,
    edgesPowRatio: 0.5,




    /**
     * ANIMATIONS SETTINGS:
     * ********************
     */
    // {number} The default animation time.
    animationsTime: 200
  };

  // Export the previously designed settings:
  sigma.settings = sigma.utils.extend(sigma.settings || {}, settings);
}).call(this);

;(function() {
  'use strict';

  /**
   * Dispatcher constructor.
   *
   * @return {dispatcher} The new dispatcher instance.
   */
  var dispatcher = function() {
    Object.defineProperty(this, '_handlers', {
      value: {}
    });
  };




  /**
   * Will execute the handler everytime that the indicated event (or the
   * indicated events) will be triggered.
   *
   * @param  {string}           events  The name of the event (or the events
   *                                    separated by spaces).
   * @param  {function(Object)} handler The handler to bind.
   * @return {dispatcher}               Returns the instance itself.
   */
  dispatcher.prototype.bind = function(events, handler) {
    var i,
        l,
        event,
        eArray;

    if (
      arguments.length === 1 &&
      typeof arguments[0] === 'object'
    )
      for (events in arguments[0])
        this.bind(events, arguments[0][events]);
    else if (
      arguments.length === 2 &&
      typeof arguments[1] === 'function'
    ) {
      eArray = typeof events === 'string' ? events.split(' ') : events;

      for (i = 0, l = eArray.length; i !== l; i += 1) {
        event = eArray[i];

        // Check that event is not '':
        if (!event)
          continue;

        if (!this._handlers[event])
          this._handlers[event] = [];

        // Using an object instead of directly the handler will make possible
        // later to add flags
        this._handlers[event].push({
          handler: handler
        });
      }
    } else
      throw 'bind: Wrong arguments.';

    return this;
  };

  /**
   * Removes the handler from a specified event (or specified events).
   *
   * @param  {?string}           events  The name of the event (or the events
   *                                     separated by spaces). If undefined,
   *                                     then all handlers are removed.
   * @param  {?function(object)} handler The handler to unbind. If undefined,
   *                                     each handler bound to the event or the
   *                                     events will be removed.
   * @return {dispatcher}                Returns the instance itself.
   */
  dispatcher.prototype.unbind = function(events, handler) {
    var i,
        n,
        j,
        m,
        k,
        a,
        event,
        eArray = typeof events === 'string' ? events.split(' ') : events;

    if (!arguments.length) {
      for (k in this._handlers)
        delete this._handlers[k];
      return this;
    }

    if (handler) {
      for (i = 0, n = eArray.length; i !== n; i += 1) {
        event = eArray[i];
        if (this._handlers[event]) {
          a = [];
          for (j = 0, m = this._handlers[event].length; j !== m; j += 1)
            if (this._handlers[event][j].handler !== handler)
              a.push(this._handlers[event][j]);

          this._handlers[event] = a;
        }

        if (this._handlers[event] && this._handlers[event].length === 0)
          delete this._handlers[event];
      }
    } else
      for (i = 0, n = eArray.length; i !== n; i += 1)
        delete this._handlers[eArray[i]];

    return this;
  };

  /**
   * Executes each handler bound to the event
   *
   * @param  {string}     events The name of the event (or the events separated
   *                             by spaces).
   * @param  {?object}    data   The content of the event (optional).
   * @return {dispatcher}        Returns the instance itself.
   */
  dispatcher.prototype.dispatchEvent = function(events, data) {
    var i,
        n,
        j,
        m,
        a,
        event,
        eventName,
        self = this,
        eArray = typeof events === 'string' ? events.split(' ') : events;

    data = data === undefined ? {} : data;

    for (i = 0, n = eArray.length; i !== n; i += 1) {
      eventName = eArray[i];

      if (this._handlers[eventName]) {
        event = self.getEvent(eventName, data);
        a = [];

        for (j = 0, m = this._handlers[eventName].length; j !== m; j += 1) {
          this._handlers[eventName][j].handler(event);
          if (!this._handlers[eventName][j].one)
            a.push(this._handlers[eventName][j]);
        }

        this._handlers[eventName] = a;
      }
    }

    return this;
  };

  /**
   * Return an event object.
   *
   * @param  {string}  events The name of the event.
   * @param  {?object} data   The content of the event (optional).
   * @return {object}         Returns the instance itself.
   */
  dispatcher.prototype.getEvent = function(event, data) {
    return {
      type: event,
      data: data || {},
      target: this
    };
  };

  /**
   * A useful function to deal with inheritance. It will make the target
   * inherit the prototype of the class dispatcher as well as its constructor.
   *
   * @param {object} target The target.
   */
  dispatcher.extend = function(target, args) {
    var k;

    for (k in dispatcher.prototype)
      if (dispatcher.prototype.hasOwnProperty(k))
        target[k] = dispatcher.prototype[k];

    dispatcher.apply(target, args);
  };




  /**
   * EXPORT:
   * *******
   */
  if (typeof this.sigma !== 'undefined') {
    this.sigma.classes = this.sigma.classes || {};
    this.sigma.classes.dispatcher = dispatcher;
  } else if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = dispatcher;
    exports.dispatcher = dispatcher;
  } else
    this.dispatcher = dispatcher;
}).call(this);

;(function() {
  'use strict';

  /**
   * This utils aims to facilitate the manipulation of each instance setting.
   * Using a function instead of an object brings two main advantages: First,
   * it will be easier in the future to catch settings updates through a
   * function than an object. Second, giving it a full object will "merge" it
   * to the settings object properly, keeping us to have to always add a loop.
   *
   * @return {configurable} The "settings" function.
   */
  var configurable = function() {
    var i,
        l,
        data = {},
        datas = Array.prototype.slice.call(arguments, 0);

    /**
     * The method to use to set or get any property of this instance.
     *
     * @param  {string|object}    a1 If it is a string and if a2 is undefined,
     *                               then it will return the corresponding
     *                               property. If it is a string and if a2 is
     *                               set, then it will set a2 as the property
     *                               corresponding to a1, and return this. If
     *                               it is an object, then each pair string +
     *                               object(or any other type) will be set as a
     *                               property.
     * @param  {*?}               a2 The new property corresponding to a1 if a1
     *                               is a string.
     * @return {*|configurable}      Returns itself or the corresponding
     *                               property.
     *
     * Polymorphism:
     * *************
     * Here are some basic use examples:
     *
     *  > settings = new configurable();
     *  > settings('mySetting', 42);
     *  > settings('mySetting'); // Logs: 42
     *  > settings('mySetting', 123);
     *  > settings('mySetting'); // Logs: 123
     *  > settings({mySetting: 456});
     *  > settings('mySetting'); // Logs: 456
     *
     * Also, it is possible to use the function as a fallback:
     *  > settings({mySetting: 'abc'}, 'mySetting');  // Logs: 'abc'
     *  > settings({hisSetting: 'abc'}, 'mySetting'); // Logs: 456
     */
    var settings = function(a1, a2) {
      var o,
          i,
          l,
          k;

      if (arguments.length === 1 && typeof a1 === 'string') {
        if (data[a1] !== undefined)
          return data[a1];
        for (i = 0, l = datas.length; i < l; i++)
          if (datas[i][a1] !== undefined)
            return datas[i][a1];
        return undefined;
      } else if (typeof a1 === 'object' && typeof a2 === 'string') {
        return (a1 || {})[a2] !== undefined ? a1[a2] : settings(a2);
      } else {
        o = (typeof a1 === 'object' && a2 === undefined) ? a1 : {};

        if (typeof a1 === 'string')
          o[a1] = a2;

        for (i = 0, k = Object.keys(o), l = k.length; i < l; i++)
          data[k[i]] = o[k[i]];

        return this;
      }
    };

    /**
     * This method returns a new configurable function, with new objects
     *
     * @param  {object*}  Any number of objects to search in.
     * @return {function} Returns the function. Check its documentation to know
     *                    more about how it works.
     */
    settings.embedObjects = function() {
      var args = datas.concat(
        data
      ).concat(
        Array.prototype.splice.call(arguments, 0)
      );

      return configurable.apply({}, args);
    };

    // Initialize
    for (i = 0, l = arguments.length; i < l; i++)
      settings(arguments[i]);

    return settings;
  };

  /**
   * EXPORT:
   * *******
   */
  if (typeof this.sigma !== 'undefined') {
    this.sigma.classes = this.sigma.classes || {};
    this.sigma.classes.configurable = configurable;
  } else if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = configurable;
    exports.configurable = configurable;
  } else
    this.configurable = configurable;
}).call(this);

;(function(undefined) {
  'use strict';

  var _methods = Object.create(null),
      _indexes = Object.create(null),
      _initBindings = Object.create(null),
      _methodBindings = Object.create(null),
      _methodBeforeBindings = Object.create(null),
      _defaultSettings = {
        immutable: true,
        clone: true
      },
      _defaultSettingsFunction = function(key) {
        return _defaultSettings[key];
      };

  /**
   * The graph constructor. It initializes the data and the indexes, and binds
   * the custom indexes and methods to its own scope.
   *
   * Recognized parameters:
   * **********************
   * Here is the exhaustive list of every accepted parameters in the settings
   * object:
   *
   *   {boolean} clone     Indicates if the data have to be cloned in methods
   *                       to add nodes or edges.
   *   {boolean} immutable Indicates if nodes "id" values and edges "id",
   *                       "source" and "target" values must be set as
   *                       immutable.
   *
   * @param  {?configurable} settings Eventually a settings function.
   * @return {graph}                  The new graph instance.
   */
  var graph = function(settings) {
    var k,
        fn,
        data;

    /**
     * DATA:
     * *****
     * Every data that is callable from graph methods are stored in this "data"
     * object. This object will be served as context for all these methods,
     * and it is possible to add other type of data in it.
     */
    data = {
      /**
       * SETTINGS FUNCTION:
       * ******************
       */
      settings: settings || _defaultSettingsFunction,

      /**
       * MAIN DATA:
       * **********
       */
      nodesArray: [],
      edgesArray: [],

      /**
       * GLOBAL INDEXES:
       * ***************
       * These indexes just index data by ids.
       */
      nodesIndex: new sigma.utils.map(),
      edgesIndex: new sigma.utils.map(),

      /**
       * LOCAL INDEXES:
       * **************
       * These indexes refer from node to nodes. Each key is an id, and each
       * value is the array of the ids of related nodes.
       */
      inNeighborsIndex: new sigma.utils.map(),
      outNeighborsIndex: new sigma.utils.map(),
      allNeighborsIndex: new sigma.utils.map()
    };

    // Execute bindings:
    for (k in _initBindings)
      _initBindings[k].call(data);

    // Add methods to both the scope and the data objects:
    for (k in _methods) {
      fn = __bindGraphMethod(k, data, _methods[k]);
      this[k] = fn;
      data[k] = fn;
    }
  };




  /**
   * A custom tool to bind methods such that function that are bound to it will
   * be executed anytime the method is called.
   *
   * @param  {string}   methodName The name of the method to bind.
   * @param  {object}   scope      The scope where the method must be executed.
   * @param  {function} fn         The method itself.
   * @return {function}            The new method.
   */
  function __bindGraphMethod(methodName, scope, fn) {
    var result = function() {
      var k,
          res;

      // Execute "before" bound functions:
      for (k in _methodBeforeBindings[methodName])
        _methodBeforeBindings[methodName][k].apply(scope, arguments);

      // Apply the method:
      res = fn.apply(scope, arguments);

      // Execute bound functions:
      for (k in _methodBindings[methodName])
        _methodBindings[methodName][k].apply(scope, arguments);

      // Return res:
      return res;
    };

    return result;
  }

  /**
   * This custom tool function removes every pair key/value from an hash. The
   * goal is to avoid creating a new object while some other references are
   * still hanging in some scopes...
   *
   * @param  {object} obj The object to empty.
   * @return {object}     The empty object.
   */
  function __emptyObject(obj) {
    var k;

    for (k in obj)
      if (!('hasOwnProperty' in obj) || obj.hasOwnProperty(k))
        delete obj[k];

    return obj;
  }




  /**
   * This global method adds a method that will be bound to the futurly created
   * graph instances.
   *
   * Since these methods will be bound to their scope when the instances are
   * created, it does not use the prototype. Because of that, methods have to
   * be added before instances are created to make them available.
   *
   * Here is an example:
   *
   *  > graph.addMethod('getNodesCount', function() {
   *  >   return this.nodesArray.length;
   *  > });
   *  >
   *  > var myGraph = new graph();
   *  > console.log(myGraph.getNodesCount()); // outputs 0
   *
   * @param  {string}   methodName The name of the method.
   * @param  {function} fn         The method itself.
   * @return {object}              The global graph constructor.
   */
  graph.addMethod = function(methodName, fn) {
    if (
      typeof methodName !== 'string' ||
      typeof fn !== 'function' ||
      arguments.length !== 2
    )
      throw 'addMethod: Wrong arguments.';

    if (_methods[methodName] || graph[methodName])
      throw 'The method "' + methodName + '" already exists.';

    _methods[methodName] = fn;
    _methodBindings[methodName] = Object.create(null);
    _methodBeforeBindings[methodName] = Object.create(null);

    return this;
  };

  /**
   * This global method returns true if the method has already been added, and
   * false else.
   *
   * Here are some examples:
   *
   *  > graph.hasMethod('addNode'); // returns true
   *  > graph.hasMethod('hasMethod'); // returns true
   *  > graph.hasMethod('unexistingMethod'); // returns false
   *
   * @param  {string}  methodName The name of the method.
   * @return {boolean}            The result.
   */
  graph.hasMethod = function(methodName) {
    return !!(_methods[methodName] || graph[methodName]);
  };

  /**
   * This global methods attaches a function to a method. Anytime the specified
   * method is called, the attached function is called right after, with the
   * same arguments and in the same scope. The attached function is called
   * right before if the last argument is true, unless the method is the graph
   * constructor.
   *
   * To attach a function to the graph constructor, use 'constructor' as the
   * method name (first argument).
   *
   * The main idea is to have a clean way to keep custom indexes up to date,
   * for instance:
   *
   *  > var timesAddNodeCalled = 0;
   *  > graph.attach('addNode', 'timesAddNodeCalledInc', function() {
   *  >   timesAddNodeCalled++;
   *  > });
   *  >
   *  > var myGraph = new graph();
   *  > console.log(timesAddNodeCalled); // outputs 0
   *  >
   *  > myGraph.addNode({ id: '1' }).addNode({ id: '2' });
   *  > console.log(timesAddNodeCalled); // outputs 2
   *
   * The idea for calling a function before is to provide pre-processors, for
   * instance:
   *
   *  > var colorPalette = { Person: '#C3CBE1', Place: '#9BDEBD' };
   *  > graph.attach('addNode', 'applyNodeColorPalette', function(n) {
   *  >   n.color = colorPalette[n.category];
   *  > }, true);
   *  >
   *  > var myGraph = new graph();
   *  > myGraph.addNode({ id: 'n0', category: 'Person' });
   *  > console.log(myGraph.nodes('n0').color); // outputs '#C3CBE1'
   *
   * @param  {string}   methodName The name of the related method or
   *                               "constructor".
   * @param  {string}   key        The key to identify the function to attach.
   * @param  {function} fn         The function to bind.
   * @param  {boolean}  before     If true the function is called right before.
   * @return {object}              The global graph constructor.
   */
  graph.attach = function(methodName, key, fn, before) {
    if (
      typeof methodName !== 'string' ||
      typeof key !== 'string' ||
      typeof fn !== 'function' ||
      arguments.length < 3 ||
      arguments.length > 4
    )
      throw 'attach: Wrong arguments.';

    var bindings;

    if (methodName === 'constructor')
      bindings = _initBindings;
    else {
      if (before) {
        if (!_methodBeforeBindings[methodName])
        throw 'The method "' + methodName + '" does not exist.';

        bindings = _methodBeforeBindings[methodName];
      }
      else {
        if (!_methodBindings[methodName])
          throw 'The method "' + methodName + '" does not exist.';

        bindings = _methodBindings[methodName];
      }
    }

    if (bindings[key])
      throw 'A function "' + key + '" is already attached ' +
            'to the method "' + methodName + '".';

    bindings[key] = fn;

    return this;
  };

  /**
   * Alias of attach(methodName, key, fn, true).
   */
  graph.attachBefore = function(methodName, key, fn) {
    return this.attach(methodName, key, fn, true);
  };

  /**
   * This methods is just an helper to deal with custom indexes. It takes as
   * arguments the name of the index and an object containing all the different
   * functions to bind to the methods.
   *
   * Here is a basic example, that creates an index to keep the number of nodes
   * in the current graph. It also adds a method to provide a getter on that
   * new index:
   *
   *  > sigma.classes.graph.addIndex('nodesCount', {
   *  >   constructor: function() {
   *  >     this.nodesCount = 0;
   *  >   },
   *  >   addNode: function() {
   *  >     this.nodesCount++;
   *  >   },
   *  >   dropNode: function() {
   *  >     this.nodesCount--;
   *  >   }
   *  > });
   *  >
   *  > sigma.classes.graph.addMethod('getNodesCount', function() {
   *  >   return this.nodesCount;
   *  > });
   *  >
   *  > var myGraph = new sigma.classes.graph();
   *  > console.log(myGraph.getNodesCount()); // outputs 0
   *  >
   *  > myGraph.addNode({ id: '1' }).addNode({ id: '2' });
   *  > console.log(myGraph.getNodesCount()); // outputs 2
   *
   * @param  {string} name     The name of the index.
   * @param  {object} bindings The object containing the functions to bind.
   * @return {object}          The global graph constructor.
   */
  graph.addIndex = function(name, bindings) {
    if (
      typeof name !== 'string' ||
      Object(bindings) !== bindings ||
      arguments.length !== 2
    )
      throw 'addIndex: Wrong arguments.';

    if (_indexes[name])
      throw 'The index "' + name + '" already exists.';

    var k;

    // Store the bindings:
    _indexes[name] = bindings;

    // Attach the bindings:
    for (k in bindings)
      if (typeof bindings[k] !== 'function')
        throw 'The bindings must be functions.';
      else
        graph.attach(k, name, bindings[k]);

    return this;
  };




  /**
   * This method adds a node to the graph. The node must be an object, with a
   * string under the key "id". Except for this, it is possible to add any
   * other attribute, that will be preserved all along the manipulations.
   *
   * If the graph option "clone" has a truthy value, the node will be cloned
   * when added to the graph. Also, if the graph option "immutable" has a
   * truthy value, its id will be defined as immutable.
   *
   * @param  {object} node The node to add.
   * @return {object}      The graph instance.
   */
  graph.addMethod('addNode', function(node) {
    // Check that the node is an object and has an id:
    if (Object(node) !== node || arguments.length !== 1)
      throw 'addNode: Wrong arguments.';

    if (typeof node.id !== 'string' && typeof node.id !== 'number')
      throw 'The node must have a string or number id.';

    if (this.nodesIndex.get(node.id))
      throw 'The node "' + node.id + '" already exists.';

    var k,
        id = node.id,
        validNode = Object.create(null);

    // Check the "clone" option:
    if (this.settings('clone')) {
      for (k in node)
        if (k !== 'id')
          validNode[k] = node[k];
    } else
      validNode = node;

    // Try to fix the node coordinates and size
    if (validNode.x !== undefined && typeof validNode.x !== 'number') {
      validNode.x = parseFloat(validNode.x);
    }
    if (validNode.y !== undefined && typeof validNode.y !== 'number') {
      validNode.y = parseFloat(validNode.y);
    }
    if (validNode.size !== undefined && typeof validNode.size !== 'number') {
      validNode.size = parseFloat(validNode.size);
    }

    // Check node size
    if (!validNode.size || validNode.size <= 0) {
      validNode.size = 1;
    }

    // Check the "immutable" option:
    if (this.settings('immutable'))
      Object.defineProperty(validNode, 'id', {
        value: id,
        enumerable: true
      });
    else
      validNode.id = id;

    // Add empty containers for edges indexes:
    this.inNeighborsIndex.set(id, new sigma.utils.map());
    this.outNeighborsIndex.set(id, new sigma.utils.map());
    this.allNeighborsIndex.set(id, new sigma.utils.map());

    // Add the node to indexes:
    this.nodesArray.push(validNode);
    this.nodesIndex.set(validNode.id, validNode);

    // Return the current instance:
    return this;
  });

  /**
   * This method adds an edge to the graph. The edge must be an object, with a
   * string under the key "id", and strings under the keys "source" and
   * "target" that design existing nodes. Except for this, it is possible to
   * add any other attribute, that will be preserved all along the
   * manipulations.
   *
   * If the graph option "clone" has a truthy value, the edge will be cloned
   * when added to the graph. Also, if the graph option "immutable" has a
   * truthy value, its id, source and target will be defined as immutable.
   *
   * @param  {object} edge The edge to add.
   * @return {object}      The graph instance.
   */
  graph.addMethod('addEdge', function(edge) {
    // Check that the edge is an object and has an id:
    if (Object(edge) !== edge || arguments.length !== 1)
      throw 'addEdge: Wrong arguments.';

    if (typeof edge.id !== 'string' && typeof edge.id !== 'number')
      throw 'The edge must have a string or number id.';

    if ((typeof edge.source !== 'string' && typeof edge.source !== 'number') ||
        !this.nodesIndex.get(edge.source))
      throw 'The edge source must have an existing node id.';

    if ((typeof edge.target !== 'string' && typeof edge.target !== 'number') ||
        !this.nodesIndex.get(edge.target))
      throw 'The edge target must have an existing node id.';

    if (this.edgesIndex.get(edge.id))
      throw 'The edge "' + edge.id + '" already exists.';

    var k,
        validEdge = Object.create(null);

    // Check the "clone" option:
    if (this.settings('clone')) {
      for (k in edge)
        if (k !== 'id' && k !== 'source' && k !== 'target')
          validEdge[k] = edge[k];
    } else
      validEdge = edge;

    // Try to fix the edge size
    if (validEdge.size !== undefined && typeof validEdge.size !== 'number') {
      validEdge.size = parseFloat(validEdge.size);
    }

    // Check edge size
    if (!validEdge.size || validEdge.size <= 0) {
      validEdge.size = 1;
    }

    // Check the "immutable" option:
    if (this.settings('immutable')) {
      Object.defineProperty(validEdge, 'id', {
        value: edge.id,
        enumerable: true
      });

      Object.defineProperty(validEdge, 'source', {
        value: edge.source,
        enumerable: true
      });

      Object.defineProperty(validEdge, 'target', {
        value: edge.target,
        enumerable: true
      });
    } else {
      validEdge.id = edge.id;
      validEdge.source = edge.source;
      validEdge.target = edge.target;
    }

    // Add the edge to indexes:
    this.edgesArray.push(validEdge);
    this.edgesIndex.set(validEdge.id, validEdge);

    if (!this.inNeighborsIndex.get(validEdge.target).get(validEdge.source))
      this.inNeighborsIndex.get(validEdge.target).set(validEdge.source,
        new sigma.utils.map());
    this.inNeighborsIndex.get(validEdge.target).get(validEdge.source).set(validEdge.id,
      validEdge);

    if (!this.outNeighborsIndex.get(validEdge.source).get(validEdge.target))
      this.outNeighborsIndex.get(validEdge.source).set(validEdge.target,
        new sigma.utils.map());
    this.outNeighborsIndex.get(validEdge.source).get(validEdge.target).set(validEdge.id,
      validEdge);

    if (!this.allNeighborsIndex.get(validEdge.source).get(validEdge.target))
      this.allNeighborsIndex.get(validEdge.source).set(validEdge.target,
        new sigma.utils.map());
    this.allNeighborsIndex.get(validEdge.source).get(validEdge.target).set(validEdge.id,
      validEdge);

    if (validEdge.target !== validEdge.source) {
      if (!this.allNeighborsIndex.get(validEdge.target).get(validEdge.source))
        this.allNeighborsIndex.get(validEdge.target).set(validEdge.source,
          new sigma.utils.map());
      this.allNeighborsIndex.get(validEdge.target).get(validEdge.source).set(validEdge.id,
        validEdge);
    }

    return this;
  });

  /**
   * This method drops a node from the graph. It also removes each edge that is
   * bound to it, through the dropEdge method. An error is thrown if the node
   * does not exist.
   *
   * @param  {string} id The node id.
   * @return {object}    The graph instance.
   */
  graph.addMethod('dropNode', function(id) {
    // Check that the arguments are valid:
    if ((typeof id !== 'string' && typeof id !== 'number') ||
        arguments.length !== 1)
      throw 'dropNode: Wrong arguments.';

    if (!this.nodesIndex.get(id))
      throw 'The node "' + id + '" does not exist.';

    var i, k, l;

    // Remove the node from indexes:
    this.nodesIndex.delete(id);
    for (i = 0, l = this.nodesArray.length; i < l; i++)
      if (this.nodesArray[i].id === id) {
        this.nodesArray.splice(i, 1);
        break;
      }

    // Remove related edges:
    for (i = this.edgesArray.length - 1; i >= 0; i--)
      if (this.edgesArray[i].source === id || this.edgesArray[i].target === id)
        this.dropEdge(this.edgesArray[i].id);

    // Remove related edge indexes:
    this.inNeighborsIndex.delete(id);
    this.outNeighborsIndex.delete(id);
    this.allNeighborsIndex.delete(id);

    var self = this;
    this.nodesIndex.forEach(function(n, k) {
      self.inNeighborsIndex.get(k).delete(id);
      self.outNeighborsIndex.get(k).delete(id);
      self.allNeighborsIndex.get(k).delete(id);
    });

    return this;
  });

  /**
   * This method drops an edge from the graph. An error is thrown if the edge
   * does not exist.
   *
   * @param  {string} id The edge id.
   * @return {object}    The graph instance.
   */
  graph.addMethod('dropEdge', function(id) {
    // Check that the arguments are valid:
    if ((typeof id !== 'string' && typeof id !== 'number') ||
        arguments.length !== 1)
      throw 'dropEdge: Wrong arguments.';

    if (!this.edgesIndex.get(id))
      throw 'The edge "' + id + '" does not exist.';

    var i, l, edge;

    // Remove the edge from indexes:
    edge = this.edgesIndex.get(id);
    this.edgesIndex.delete(id);
    for (i = 0, l = this.edgesArray.length; i < l; i++)
      if (this.edgesArray[i].id === id) {
        this.edgesArray.splice(i, 1);
        break;
      }

    this.inNeighborsIndex.get(edge.target).get(edge.source).delete(edge.id);
    if (this.inNeighborsIndex.get(edge.target).get(edge.source).size == 0)
      this.inNeighborsIndex.get(edge.target).delete(edge.source);

    this.outNeighborsIndex.get(edge.source).get(edge.target).delete(edge.id);
    if (this.outNeighborsIndex.get(edge.source).get(edge.target).size == 0)
      this.outNeighborsIndex.get(edge.source).delete(edge.target);

    this.allNeighborsIndex.get(edge.source).get(edge.target).delete(edge.id);
    if (this.allNeighborsIndex.get(edge.source).get(edge.target).size == 0)
      this.allNeighborsIndex.get(edge.source).delete(edge.target);

    if (edge.target !== edge.source) {
      this.allNeighborsIndex.get(edge.target).get(edge.source).delete(edge.id);
      if (this.allNeighborsIndex.get(edge.target).get(edge.source).size == 0)
        this.allNeighborsIndex.get(edge.target).delete(edge.source);
    }

    return this;
  });

  /**
   * This method destroys the current instance. It basically empties each index
   * and methods attached to the graph.
   */
  graph.addMethod('kill', function() {
    // Delete arrays:
    this.nodesArray.length = 0;
    this.edgesArray.length = 0;
    delete this.nodesArray;
    delete this.edgesArray;

    // Delete indexes:
    delete this.nodesIndex;
    delete this.edgesIndex;
    delete this.inNeighborsIndex;
    delete this.outNeighborsIndex;
    delete this.allNeighborsIndex;
  });

  /**
   * This method empties the nodes and edges arrays, as well as the different
   * indexes.
   *
   * @return {object} The graph instance.
   */
  graph.addMethod('clear', function() {
    this.nodesArray.length = 0;
    this.edgesArray.length = 0;

    // Due to GC issues, I prefer not to create new object. These objects are
    // only available from the methods and attached functions, but still, it is
    // better to prevent ghost references to unrelevant data...
    this.nodesIndex.clear();
    this.edgesIndex.clear();
    this.nodesIndex.clear();
    this.inNeighborsIndex.clear();
    this.outNeighborsIndex.clear();
    this.allNeighborsIndex.clear();

    return this;
  });

  /**
   * This method reads an object and adds the nodes and edges, through the
   * proper methods "addNode" and "addEdge".
   *
   * Here is an example:
   *
   *  > var myGraph = new graph();
   *  > myGraph.read({
   *  >   nodes: [
   *  >     { id: 'n0' },
   *  >     { id: 'n1' }
   *  >   ],
   *  >   edges: [
   *  >     {
   *  >       id: 'e0',
   *  >       source: 'n0',
   *  >       target: 'n1'
   *  >     }
   *  >   ]
   *  > });
   *  >
   *  > console.log(
   *  >   myGraph.nodes().length,
   *  >   myGraph.edges().length
   *  > ); // outputs 2 1
   *
   * @param  {object} g The graph object.
   * @return {object}   The graph instance.
   */
  graph.addMethod('read', function(g) {
    var i,
        a,
        l;

    a = g.nodes || [];
    for (i = 0, l = a.length; i < l; i++)
      this.addNode(a[i]);

    a = g.edges || [];
    for (i = 0, l = a.length; i < l; i++)
      this.addEdge(a[i]);

    return this;
  });

  /**
   * This methods returns one or several nodes, depending on how it is called.
   *
   * To get the array of nodes, call "nodes" without argument. To get a
   * specific node, call it with the id of the node. The get multiple node,
   * call it with an array of ids, and it will return the array of nodes, in
   * the same order.
   *
   * @param  {?(string|array)} v Eventually one id, an array of ids.
   * @return {object|array}      The related node or array of nodes.
   */
  graph.addMethod('nodes', function(v) {
    // Clone the array of nodes and return it:
    if (!arguments.length)
      return this.nodesArray.slice(0);

    // Return the related node:
    if (arguments.length === 1 &&
        (typeof v === 'string' || typeof v === 'number'))
      return this.nodesIndex.get(v);

    // Return an array of the related node:
    if (
      arguments.length === 1 &&
      Object.prototype.toString.call(v) === '[object Array]'
    ) {
      var i,
          l,
          a = [];

      for (i = 0, l = v.length; i < l; i++)
        if (typeof v[i] === 'string' || typeof v[i] === 'number')
          a.push(this.nodesIndex.get(v[i]));
        else
          throw 'nodes: Wrong arguments.';

      return a;
    }

    throw 'nodes: Wrong arguments.';
  });

  /**
   * This methods returns the degree of one or several nodes, depending on how
   * it is called. It is also possible to get incoming or outcoming degrees
   * instead by specifying 'in' or 'out' as a second argument.
   *
   * @param  {string|array} v     One id, an array of ids.
   * @param  {?string}      which Which degree is required. Values are 'in',
   *                              'out', and by default the normal degree.
   * @return {number|array}       The related degree or array of degrees.
   */
  graph.addMethod('degree', function(v, which) {
    // Check which degree is required:
    which = {
      'in': this.inNeighborsIndex,
      'out': this.outNeighborsIndex
    }[which || ''] || this.allNeighborsIndex;

    // Return the related node:
    if (typeof v === 'string' || typeof v === 'number')
      return which.get(v).size;

    // Return an array of the related node:
    if (Object.prototype.toString.call(v) === '[object Array]') {
      var i,
          l,
          a = [];

      for (i = 0, l = v.length; i < l; i++)
        if (typeof v[i] === 'string' || typeof v[i] === 'number')
          a.push(which.get(v[i]).size);
        else
          throw 'degree: Wrong arguments.';

      return a;
    }

    throw 'degree: Wrong arguments.';
  });

  /**
   * This methods returns one or several edges, depending on how it is called.
   *
   * To get the array of edges, call "edges" without argument. To get a
   * specific edge, call it with the id of the edge. The get multiple edge,
   * call it with an array of ids, and it will return the array of edges, in
   * the same order.
   *
   * @param  {?(string|array)} v Eventually one id, an array of ids.
   * @return {object|array}      The related edge or array of edges.
   */
  graph.addMethod('edges', function(v) {
    // Clone the array of edges and return it:
    if (!arguments.length)
      return this.edgesArray.slice(0);

    // Return the related edge:
    if (arguments.length === 1 &&
        (typeof v === 'string' || typeof v === 'number'))
      return this.edgesIndex.get(v);

    // Return an array of the related edge:
    if (
      arguments.length === 1 &&
      Object.prototype.toString.call(v) === '[object Array]'
    ) {
      var i,
          l,
          a = [];

      for (i = 0, l = v.length; i < l; i++)
        if (typeof v[i] === 'string' || typeof v[i] === 'number')
          a.push(this.edgesIndex.get(v[i]));
        else
          throw 'edges: Wrong arguments.';

      return a;
    }

    throw 'edges: Wrong arguments.';
  });


  /**
   * EXPORT:
   * *******
   */
  if (typeof sigma !== 'undefined') {
    sigma.classes = sigma.classes || Object.create(null);
    sigma.classes.graph = graph;
  } else if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = graph;
    exports.graph = graph;
  } else
    this.graph = graph;
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  sigma.utils.pkg('sigma.classes');

  /**
   * The camera constructor. It just initializes its attributes and methods.
   *
   * @param  {string}       id       The id.
   * @param  {sigma.classes.graph}  graph    The graph.
   * @param  {configurable} settings The settings function.
   * @param  {?object}      options  Eventually some overriding options.
   * @return {camera}                Returns the fresh new camera instance.
   */
  sigma.classes.camera = function(id, graph, settings, options) {
    sigma.classes.dispatcher.extend(this);

    Object.defineProperty(this, 'graph', {
      value: graph
    });
    Object.defineProperty(this, 'id', {
      value: id
    });
    Object.defineProperty(this, 'readPrefix', {
      value: 'read_cam' + id + ':'
    });
    Object.defineProperty(this, 'prefix', {
      value: 'cam' + id + ':'
    });

    this.x = 0;
    this.y = 0;
    this.ratio = 1;
    this.angle = 0;
    this.isAnimated = false;
    this.settings = (typeof options === 'object' && options) ?
      settings.embedObject(options) :
      settings;
  };

  /**
   * Updates the camera position.
   *
   * @param  {object} coordinates The new coordinates object.
   * @return {camera}             Returns the camera.
   */
  sigma.classes.camera.prototype.goTo = function(coordinates) {
    if (!this.settings('enableCamera'))
      return this;

    var i,
        l,
        c = coordinates || {},
        keys = ('ratio' in coordinates && !this.settings('zoomOnLocation'))
          ? ['ratio', 'angle'] : ['x', 'y', 'ratio', 'angle'];

    for (i = 0, l = keys.length; i < l; i++)
      if (c[keys[i]] !== undefined) {
        if (typeof c[keys[i]] === 'number' && !isNaN(c[keys[i]]))
          this[keys[i]] = c[keys[i]];
        else
          throw 'Value for "' + keys[i] + '" is not a number.';
      }

    this.dispatchEvent('coordinatesUpdated');
    return this;
  };

  /**
   * This method takes a graph and computes for each node and edges its
   * coordinates relatively to the center of the camera. Basically, it will
   * compute the coordinates that will be used by the graphic renderers.
   *
   * Since it should be possible to use different cameras and different
   * renderers, it is possible to specify a prefix to put before the new
   * coordinates (to get something like "node.camera1_x")
   *
   * @param  {?string} read    The prefix of the coordinates to read.
   * @param  {?string} write   The prefix of the coordinates to write.
   * @param  {?object} options Eventually an object of options. Those can be:
   *                           - A restricted nodes array.
   *                           - A restricted edges array.
   *                           - A width.
   *                           - A height.
   * @return {camera}        Returns the camera.
   */
  sigma.classes.camera.prototype.applyView = function(read, write, options) {
    options = options || {};
    write = write !== undefined ? write : this.prefix;
    read = read !== undefined ? read : this.readPrefix;

    var nodes = options.nodes || this.graph.nodes(),
        edges = options.edges || this.graph.edges();

    var i,
        l,
        node,
        relCos = Math.cos(this.angle) / this.ratio,
        relSin = Math.sin(this.angle) / this.ratio,
        nodeRatio = Math.pow(this.ratio, this.settings('nodesPowRatio')),
        edgeRatio = Math.pow(this.ratio, this.settings('edgesPowRatio')),
        xOffset = (options.width || 0) / 2 - this.x * relCos - this.y * relSin,
        yOffset = (options.height || 0) / 2 - this.y * relCos + this.x * relSin;

    for (i = 0, l = nodes.length; i < l; i++) {
      node = nodes[i];
      node[write + 'x'] =
        (node[read + 'x'] || 0) * relCos +
        (node[read + 'y'] || 0) * relSin +
        xOffset;
      node[write + 'y'] =
        (node[read + 'y'] || 0) * relCos -
        (node[read + 'x'] || 0) * relSin +
        yOffset;
      node[write + 'size'] =
        (node[read + 'size'] || 0) /
        nodeRatio;
    }

    for (i = 0, l = edges.length; i < l; i++) {
      edges[i][write + 'size'] =
        (edges[i][read + 'size'] || 0) /
        edgeRatio;
    }

    return this;
  };

  /**
   * This function converts the coordinates of a point from the frame of the
   * camera to the frame of the graph.
   *
   * @param  {number} x The X coordinate of the point in the frame of the
   *                    camera.
   * @param  {number} y The Y coordinate of the point in the frame of the
   *                    camera.
   * @return {object}   The point coordinates in the frame of the graph.
   */
  sigma.classes.camera.prototype.graphPosition = function(x, y, vector) {
    var X = 0,
        Y = 0,
        cos = Math.cos(this.angle),
        sin = Math.sin(this.angle);

    // Revert the origin differential vector:
    if (!vector) {
      X = - (this.x * cos + this.y * sin) / this.ratio;
      Y = - (this.y * cos - this.x * sin) / this.ratio;
    }

    return {
      x: (x * cos + y * sin) / this.ratio + X,
      y: (y * cos - x * sin) / this.ratio + Y
    };
  };

  /**
   * This function converts the coordinates of a point from the frame of the
   * graph to the frame of the camera.
   *
   * @param  {number} x The X coordinate of the point in the frame of the
   *                    graph.
   * @param  {number} y The Y coordinate of the point in the frame of the
   *                    graph.
   * @return {object}   The point coordinates in the frame of the camera.
   */
  sigma.classes.camera.prototype.cameraPosition = function(x, y, vector) {
    var X = 0,
        Y = 0,
        cos = Math.cos(this.angle),
        sin = Math.sin(this.angle);

    // Revert the origin differential vector:
    if (!vector) {
      X = - (this.x * cos + this.y * sin) / this.ratio;
      Y = - (this.y * cos - this.x * sin) / this.ratio;
    }

    return {
      x: ((x - X) * cos - (y - Y) * sin) * this.ratio,
      y: ((y - Y) * cos + (x - X) * sin) * this.ratio
    };
  };

  /**
   * This method returns the transformation matrix of the camera. This is
   * especially useful to apply the camera view directly in shaders, in case of
   * WebGL rendering.
   *
   * @return {array} The transformation matrix.
   */
  sigma.classes.camera.prototype.getMatrix = function() {
    var scale = sigma.utils.matrices.scale(1 / this.ratio),
        rotation = sigma.utils.matrices.rotation(this.angle),
        translation = sigma.utils.matrices.translation(-this.x, -this.y),
        matrix = sigma.utils.matrices.multiply(
          translation,
          sigma.utils.matrices.multiply(
            rotation,
            scale
          )
        );

    return matrix;
  };

  /**
   * Taking a width and a height as parameters, this method returns the
   * coordinates of the rectangle representing the camera on screen, in the
   * graph's referentiel.
   *
   * To keep displaying labels of nodes going out of the screen, the method
   * keeps a margin around the screen in the returned rectangle.
   *
   * @param  {number} width  The width of the screen.
   * @param  {number} height The height of the screen.
   * @return {object}        The rectangle as x1, y1, x2 and y2, representing
   *                         two opposite points.
   */
  sigma.classes.camera.prototype.getRectangle = function(width, height) {
    var widthVect = this.cameraPosition(width, 0, true),
        heightVect = this.cameraPosition(0, height, true),
        centerVect = this.cameraPosition(width / 2, height / 2, true),
        marginX = this.cameraPosition(width / 4, 0, true).x,
        marginY = this.cameraPosition(0, height / 4, true).y;

    return {
      x1: this.x - centerVect.x - marginX,
      y1: this.y - centerVect.y - marginY,
      x2: this.x - centerVect.x + marginX + widthVect.x,
      y2: this.y - centerVect.y - marginY + widthVect.y,
      height: Math.sqrt(
        Math.pow(heightVect.x, 2) +
        Math.pow(heightVect.y + 2 * marginY, 2)
      )
    };
  };
}).call(this);

;(function(undefined) {
  'use strict';

  /**
   * Sigma Quadtree Module
   * =====================
   *
   * Author: Guillaume Plique (Yomguithereal), Sébastien Heymann, Damien Marié
   */



  /**
   * Quad Geometric Operations
   * -------------------------
   *
   * A useful batch of geometric operations used by the quadtree.
   */

  var _geom = {

    /**
     * Transforms a graph node with x, y and size into an
     * axis-aligned square.
     *
     * @param  {object} A graph node with at least a point (x, y) and a size.
     * @return {object} A square: two points (x1, y1), (x2, y2) and height.
     */
    pointToSquare: function(n) {
      return {
        x1: n.x - n.size,
        y1: n.y - n.size,
        x2: n.x + n.size,
        y2: n.y - n.size,
        height: n.size * 2
      };
    },


    /**
     * Transforms a graph edge with x1, y1, x2, y2 and size into an
     * axis-aligned square.
     *
     * @param  {object} A graph edge with at least two points
     *                  (x1, y1), (x2, y2) and a size.
     * @return {object} A square: two points (x1, y1), (x2, y2) and height.
     */
    lineToSquare: function(e) {
      if (e.y1 < e.y2) {
        // (e.x1, e.y1) on top
        if (e.x1 < e.x2) {
          // (e.x1, e.y1) on left
          return {
            x1: e.x1 - e.size,
            y1: e.y1 - e.size,
            x2: e.x2 + e.size,
            y2: e.y1 - e.size,
            height: e.y2 - e.y1 + e.size * 2
          };
        }
        // (e.x1, e.y1) on right
        return {
          x1: e.x2 - e.size,
          y1: e.y1 - e.size,
          x2: e.x1 + e.size,
          y2: e.y1 - e.size,
          height: e.y2 - e.y1 + e.size * 2
        };
      }

      // (e.x2, e.y2) on top
      if (e.x1 < e.x2) {
        // (e.x1, e.y1) on left
        return {
          x1: e.x1 - e.size,
          y1: e.y2 - e.size,
          x2: e.x2 + e.size,
          y2: e.y2 - e.size,
          height: e.y1 - e.y2 + e.size * 2
        };
      }
      // (e.x2, e.y2) on right
      return {
        x1: e.x2 - e.size,
        y1: e.y2 - e.size,
        x2: e.x1 + e.size,
        y2: e.y2 - e.size,
        height: e.y1 - e.y2 + e.size * 2
      };
    },

    /**
     * Transforms a graph edge of type 'curve' with x1, y1, x2, y2,
     * control point and size into an axis-aligned square.
     *
     * @param  {object} e  A graph edge with at least two points
     *                     (x1, y1), (x2, y2) and a size.
     * @param  {object} cp A control point (x,y).
     * @return {object}    A square: two points (x1, y1), (x2, y2) and height.
     */
    quadraticCurveToSquare: function(e, cp) {
      var pt = sigma.utils.getPointOnQuadraticCurve(
        0.5,
        e.x1,
        e.y1,
        e.x2,
        e.y2,
        cp.x,
        cp.y
      );

      // Bounding box of the two points and the point at the middle of the
      // curve:
      var minX = Math.min(e.x1, e.x2, pt.x),
          maxX = Math.max(e.x1, e.x2, pt.x),
          minY = Math.min(e.y1, e.y2, pt.y),
          maxY = Math.max(e.y1, e.y2, pt.y);

      return {
        x1: minX - e.size,
        y1: minY - e.size,
        x2: maxX + e.size,
        y2: minY - e.size,
        height: maxY - minY + e.size * 2
      };
    },

    /**
     * Transforms a graph self loop into an axis-aligned square.
     *
     * @param  {object} n A graph node with a point (x, y) and a size.
     * @return {object}   A square: two points (x1, y1), (x2, y2) and height.
     */
    selfLoopToSquare: function(n) {
      // Fitting to the curve is too costly, we compute a larger bounding box
      // using the control points:
      var cp = sigma.utils.getSelfLoopControlPoints(n.x, n.y, n.size);

      // Bounding box of the point and the two control points:
      var minX = Math.min(n.x, cp.x1, cp.x2),
          maxX = Math.max(n.x, cp.x1, cp.x2),
          minY = Math.min(n.y, cp.y1, cp.y2),
          maxY = Math.max(n.y, cp.y1, cp.y2);

      return {
        x1: minX - n.size,
        y1: minY - n.size,
        x2: maxX + n.size,
        y2: minY - n.size,
        height: maxY - minY + n.size * 2
      };
    },

    /**
     * Checks whether a rectangle is axis-aligned.
     *
     * @param  {object}  A rectangle defined by two points
     *                   (x1, y1) and (x2, y2).
     * @return {boolean} True if the rectangle is axis-aligned.
     */
    isAxisAligned: function(r) {
      return r.x1 === r.x2 || r.y1 === r.y2;
    },

    /**
     * Compute top points of an axis-aligned rectangle. This is useful in
     * cases when the rectangle has been rotated (left, right or bottom up) and
     * later operations need to know the top points.
     *
     * @param  {object} An axis-aligned rectangle defined by two points
     *                  (x1, y1), (x2, y2) and height.
     * @return {object} A rectangle: two points (x1, y1), (x2, y2) and height.
     */
    axisAlignedTopPoints: function(r) {

      // Basic
      if (r.y1 === r.y2 && r.x1 < r.x2)
        return r;

      // Rotated to right
      if (r.x1 === r.x2 && r.y2 > r.y1)
        return {
          x1: r.x1 - r.height, y1: r.y1,
          x2: r.x1, y2: r.y1,
          height: r.height
        };

      // Rotated to left
      if (r.x1 === r.x2 && r.y2 < r.y1)
        return {
          x1: r.x1, y1: r.y2,
          x2: r.x2 + r.height, y2: r.y2,
          height: r.height
        };

      // Bottom's up
      return {
        x1: r.x2, y1: r.y1 - r.height,
        x2: r.x1, y2: r.y1 - r.height,
        height: r.height
      };
    },

    /**
     * Get coordinates of a rectangle's lower left corner from its top points.
     *
     * @param  {object} A rectangle defined by two points (x1, y1) and (x2, y2).
     * @return {object} Coordinates of the corner (x, y).
     */
    lowerLeftCoor: function(r) {
      var width = (
        Math.sqrt(
          (r.x2 - r.x1) * (r.x2 - r.x1) +
          (r.y2 - r.y1) * (r.y2 - r.y1)
        )
      );

      return {
        x: r.x1 - (r.y2 - r.y1) * r.height / width,
        y: r.y1 + (r.x2 - r.x1) * r.height / width
      };
    },

    /**
     * Get coordinates of a rectangle's lower right corner from its top points
     * and its lower left corner.
     *
     * @param  {object} A rectangle defined by two points (x1, y1) and (x2, y2).
     * @param  {object} A corner's coordinates (x, y).
     * @return {object} Coordinates of the corner (x, y).
     */
    lowerRightCoor: function(r, llc) {
      return {
        x: llc.x - r.x1 + r.x2,
        y: llc.y - r.y1 + r.y2
      };
    },

    /**
     * Get the coordinates of all the corners of a rectangle from its top point.
     *
     * @param  {object} A rectangle defined by two points (x1, y1) and (x2, y2).
     * @return {array}  An array of the four corners' coordinates (x, y).
     */
    rectangleCorners: function(r) {
      var llc = this.lowerLeftCoor(r),
          lrc = this.lowerRightCoor(r, llc);

      return [
        {x: r.x1, y: r.y1},
        {x: r.x2, y: r.y2},
        {x: llc.x, y: llc.y},
        {x: lrc.x, y: lrc.y}
      ];
    },

    /**
     * Split a square defined by its boundaries into four.
     *
     * @param  {object} Boundaries of the square (x, y, width, height).
     * @return {array}  An array containing the four new squares, themselves
     *                  defined by an array of their four corners (x, y).
     */
    splitSquare: function(b) {
      return [
        [
          {x: b.x, y: b.y},
          {x: b.x + b.width / 2, y: b.y},
          {x: b.x, y: b.y + b.height / 2},
          {x: b.x + b.width / 2, y: b.y + b.height / 2}
        ],
        [
          {x: b.x + b.width / 2, y: b.y},
          {x: b.x + b.width, y: b.y},
          {x: b.x + b.width / 2, y: b.y + b.height / 2},
          {x: b.x + b.width, y: b.y + b.height / 2}
        ],
        [
          {x: b.x, y: b.y + b.height / 2},
          {x: b.x + b.width / 2, y: b.y + b.height / 2},
          {x: b.x, y: b.y + b.height},
          {x: b.x + b.width / 2, y: b.y + b.height}
        ],
        [
          {x: b.x + b.width / 2, y: b.y + b.height / 2},
          {x: b.x + b.width, y: b.y + b.height / 2},
          {x: b.x + b.width / 2, y: b.y + b.height},
          {x: b.x + b.width, y: b.y + b.height}
        ]
      ];
    },

    /**
     * Compute the four axis between corners of rectangle A and corners of
     * rectangle B. This is needed later to check an eventual collision.
     *
     * @param  {array} An array of rectangle A's four corners (x, y).
     * @param  {array} An array of rectangle B's four corners (x, y).
     * @return {array} An array of four axis defined by their coordinates (x,y).
     */
    axis: function(c1, c2) {
      return [
        {x: c1[1].x - c1[0].x, y: c1[1].y - c1[0].y},
        {x: c1[1].x - c1[3].x, y: c1[1].y - c1[3].y},
        {x: c2[0].x - c2[2].x, y: c2[0].y - c2[2].y},
        {x: c2[0].x - c2[1].x, y: c2[0].y - c2[1].y}
      ];
    },

    /**
     * Project a rectangle's corner on an axis.
     *
     * @param  {object} Coordinates of a corner (x, y).
     * @param  {object} Coordinates of an axis (x, y).
     * @return {object} The projection defined by coordinates (x, y).
     */
    projection: function(c, a) {
      var l = (
        (c.x * a.x + c.y * a.y) /
        (a.x * a.x + a.y * a.y)
      );

      return {
        x: l * a.x,
        y: l * a.y
      };
    },

    /**
     * Check whether two rectangles collide on one particular axis.
     *
     * @param  {object}   An axis' coordinates (x, y).
     * @param  {array}    Rectangle A's corners.
     * @param  {array}    Rectangle B's corners.
     * @return {boolean}  True if the rectangles collide on the axis.
     */
    axisCollision: function(a, c1, c2) {
      var sc1 = [],
          sc2 = [];

      for (var ci = 0; ci < 4; ci++) {
        var p1 = this.projection(c1[ci], a),
            p2 = this.projection(c2[ci], a);

        sc1.push(p1.x * a.x + p1.y * a.y);
        sc2.push(p2.x * a.x + p2.y * a.y);
      }

      var maxc1 = Math.max.apply(Math, sc1),
          maxc2 = Math.max.apply(Math, sc2),
          minc1 = Math.min.apply(Math, sc1),
          minc2 = Math.min.apply(Math, sc2);

      return (minc2 <= maxc1 && maxc2 >= minc1);
    },

    /**
     * Check whether two rectangles collide on each one of their four axis. If
     * all axis collide, then the two rectangles do collide on the plane.
     *
     * @param  {array}    Rectangle A's corners.
     * @param  {array}    Rectangle B's corners.
     * @return {boolean}  True if the rectangles collide.
     */
    collision: function(c1, c2) {
      var axis = this.axis(c1, c2),
          col = true;

      for (var i = 0; i < 4; i++)
        col = col && this.axisCollision(axis[i], c1, c2);

      return col;
    }
  };


  /**
   * Quad Functions
   * ------------
   *
   * The Quadtree functions themselves.
   * For each of those functions, we consider that in a splitted quad, the
   * index of each node is the following:
   * 0: top left
   * 1: top right
   * 2: bottom left
   * 3: bottom right
   *
   * Moreover, the hereafter quad's philosophy is to consider that if an element
   * collides with more than one nodes, this element belongs to each of the
   * nodes it collides with where other would let it lie on a higher node.
   */

  /**
   * Get the index of the node containing the point in the quad
   *
   * @param  {object}  point      A point defined by coordinates (x, y).
   * @param  {object}  quadBounds Boundaries of the quad (x, y, width, heigth).
   * @return {integer}            The index of the node containing the point.
   */
  function _quadIndex(point, quadBounds) {
    var xmp = quadBounds.x + quadBounds.width / 2,
        ymp = quadBounds.y + quadBounds.height / 2,
        top = (point.y < ymp),
        left = (point.x < xmp);

    if (top) {
      if (left)
        return 0;
      else
        return 1;
    }
    else {
      if (left)
        return 2;
      else
        return 3;
    }
  }

  /**
   * Get a list of indexes of nodes containing an axis-aligned rectangle
   *
   * @param  {object}  rectangle   A rectangle defined by two points (x1, y1),
   *                               (x2, y2) and height.
   * @param  {array}   quadCorners An array of the quad nodes' corners.
   * @return {array}               An array of indexes containing one to
   *                               four integers.
   */
  function _quadIndexes(rectangle, quadCorners) {
    var indexes = [];

    // Iterating through quads
    for (var i = 0; i < 4; i++)
      if ((rectangle.x2 >= quadCorners[i][0].x) &&
          (rectangle.x1 <= quadCorners[i][1].x) &&
          (rectangle.y1 + rectangle.height >= quadCorners[i][0].y) &&
          (rectangle.y1 <= quadCorners[i][2].y))
        indexes.push(i);

    return indexes;
  }

  /**
   * Get a list of indexes of nodes containing a non-axis-aligned rectangle
   *
   * @param  {array}  corners      An array containing each corner of the
   *                               rectangle defined by its coordinates (x, y).
   * @param  {array}  quadCorners  An array of the quad nodes' corners.
   * @return {array}               An array of indexes containing one to
   *                               four integers.
   */
  function _quadCollision(corners, quadCorners) {
    var indexes = [];

    // Iterating through quads
    for (var i = 0; i < 4; i++)
      if (_geom.collision(corners, quadCorners[i]))
        indexes.push(i);

    return indexes;
  }

  /**
   * Subdivide a quad by creating a node at a precise index. The function does
   * not generate all four nodes not to potentially create unused nodes.
   *
   * @param  {integer}  index The index of the node to create.
   * @param  {object}   quad  The quad object to subdivide.
   * @return {object}         A new quad representing the node created.
   */
  function _quadSubdivide(index, quad) {
    var next = quad.level + 1,
        subw = Math.round(quad.bounds.width / 2),
        subh = Math.round(quad.bounds.height / 2),
        qx = Math.round(quad.bounds.x),
        qy = Math.round(quad.bounds.y),
        x,
        y;

    switch (index) {
      case 0:
        x = qx;
        y = qy;
        break;
      case 1:
        x = qx + subw;
        y = qy;
        break;
      case 2:
        x = qx;
        y = qy + subh;
        break;
      case 3:
        x = qx + subw;
        y = qy + subh;
        break;
    }

    return _quadTree(
      {x: x, y: y, width: subw, height: subh},
      next,
      quad.maxElements,
      quad.maxLevel
    );
  }

  /**
   * Recursively insert an element into the quadtree. Only points
   * with size, i.e. axis-aligned squares, may be inserted with this
   * method.
   *
   * @param  {object}  el         The element to insert in the quadtree.
   * @param  {object}  sizedPoint A sized point defined by two top points
   *                              (x1, y1), (x2, y2) and height.
   * @param  {object}  quad       The quad in which to insert the element.
   * @return {undefined}          The function does not return anything.
   */
  function _quadInsert(el, sizedPoint, quad) {
    if (quad.level < quad.maxLevel) {

      // Searching appropriate quads
      var indexes = _quadIndexes(sizedPoint, quad.corners);

      // Iterating
      for (var i = 0, l = indexes.length; i < l; i++) {

        // Subdividing if necessary
        if (quad.nodes[indexes[i]] === undefined)
          quad.nodes[indexes[i]] = _quadSubdivide(indexes[i], quad);

        // Recursion
        _quadInsert(el, sizedPoint, quad.nodes[indexes[i]]);
      }
    }
    else {

      // Pushing the element in a leaf node
      quad.elements.push(el);
    }
  }

  /**
   * Recursively retrieve every elements held by the node containing the
   * searched point.
   *
   * @param  {object}  point The searched point (x, y).
   * @param  {object}  quad  The searched quad.
   * @return {array}         An array of elements contained in the relevant
   *                         node.
   */
  function _quadRetrievePoint(point, quad) {
    if (quad.level < quad.maxLevel) {
      var index = _quadIndex(point, quad.bounds);

      // If node does not exist we return an empty list
      if (quad.nodes[index] !== undefined) {
        return _quadRetrievePoint(point, quad.nodes[index]);
      }
      else {
        return [];
      }
    }
    else {
      return quad.elements;
    }
  }

  /**
   * Recursively retrieve every elements contained within an rectangular area
   * that may or may not be axis-aligned.
   *
   * @param  {object|array} rectData       The searched area defined either by
   *                                       an array of four corners (x, y) in
   *                                       the case of a non-axis-aligned
   *                                       rectangle or an object with two top
   *                                       points (x1, y1), (x2, y2) and height.
   * @param  {object}       quad           The searched quad.
   * @param  {function}     collisionFunc  The collision function used to search
   *                                       for node indexes.
   * @param  {array?}       els            The retrieved elements.
   * @return {array}                       An array of elements contained in the
   *                                       area.
   */
  function _quadRetrieveArea(rectData, quad, collisionFunc, els) {
    els = els || {};

    if (quad.level < quad.maxLevel) {
      var indexes = collisionFunc(rectData, quad.corners);

      for (var i = 0, l = indexes.length; i < l; i++)
        if (quad.nodes[indexes[i]] !== undefined)
          _quadRetrieveArea(
            rectData,
            quad.nodes[indexes[i]],
            collisionFunc,
            els
          );
    } else
      for (var j = 0, m = quad.elements.length; j < m; j++)
        if (els[quad.elements[j].id] === undefined)
          els[quad.elements[j].id] = quad.elements[j];

    return els;
  }

  /**
   * Creates the quadtree object itself.
   *
   * @param  {object}   bounds       The boundaries of the quad defined by an
   *                                 origin (x, y), width and heigth.
   * @param  {integer}  level        The level of the quad in the tree.
   * @param  {integer}  maxElements  The max number of element in a leaf node.
   * @param  {integer}  maxLevel     The max recursion level of the tree.
   * @return {object}                The quadtree object.
   */
  function _quadTree(bounds, level, maxElements, maxLevel) {
    return {
      level: level || 0,
      bounds: bounds,
      corners: _geom.splitSquare(bounds),
      maxElements: maxElements || 20,
      maxLevel: maxLevel || 4,
      elements: [],
      nodes: []
    };
  }


  /**
   * Sigma Quad Constructor
   * ----------------------
   *
   * The quad API as exposed to sigma.
   */

  /**
   * The quad core that will become the sigma interface with the quadtree.
   *
   * @param  {boolean?} indexEdges Tell to index edges or nodes
   *
   * property {object} _tree       Property holding the quadtree object
   * property {object} _geom       Exposition of the _geom namespace for testing
   * property {object} _cache      Cache for the area method
   */
  var quad = function(indexEdges) {
    this._geom = _geom;
    this._tree = null;
    this._cache = {
      query: false,
      result: false
    };
    this._enabled = true;
    this._indexEdges = indexEdges || false;
  };

  /**
   * Index a graph by inserting its elements into the quadtree.
   *
   * @param  {array}  graph      The graph to index
   * @param  {object} params     An object of parameters with at least the quad
   *                             bounds.
   * @return {object}            The quadtree object.
   *
   * Parameters:
   * ----------
   * bounds:      {object}   boundaries of the quad defined by its origin (x, y)
   *                         width and heigth.
   * prefix:      {string?}  a prefix for node geometric attributes.
   * maxElements: {integer?} the max number of elements in a leaf node.
   * maxLevel:    {integer?} the max recursion level of the tree.
   */
  quad.prototype.index = function(graph, params) {
    if (!this._enabled) {
      return this._tree;
    }

    // Enforcing presence of boundaries
    if (!params.bounds)
      throw 'sigma.classes.quad.index: bounds information not given.';

    // Prefix
    var prefix = params.prefix || '',
        cp,
        cc = params.curvatureCoefficients,
        source,
        target,
        i,
        l,
        n,
        e;

    // Building the tree
    this._tree = _quadTree(
      params.bounds,
      0,
      params.maxElements,
      params.maxLevel
    );

    if (!this._indexEdges) {
      var nodes = graph.nodes();
      // Inserting graph nodes into the tree
      for (i = 0, l = nodes.length; i < l; i++) {

        // Inserting node
        _quadInsert(
          nodes[i],
          _geom.pointToSquare({
            x: nodes[i][prefix + 'x'],
            y: nodes[i][prefix + 'y'],
            size: nodes[i][prefix + 'size']
          }),
          this._tree
        );
      }
    } else {
      var edges = graph.edges();
      // Inserting graph edges into the tree
      for (i = 0, l = edges.length; i < l; i++) {
        source = graph.nodes(edges[i].source);
        target = graph.nodes(edges[i].target);
        e = {
          x1: source[prefix + 'x'],
          y1: source[prefix + 'y'],
          x2: target[prefix + 'x'],
          y2: target[prefix + 'y'],
          size: edges[i][prefix + 'size'] || 0
        };

        // Inserting edge
        if (edges[i].type === 'curve' || edges[i].type === 'curvedArrow') {
          if (source.id === target.id) {
            n = {
              x: source[prefix + 'x'],
              y: source[prefix + 'y'],
              size: source[prefix + 'size'] || 0
            };
            _quadInsert(
              edges[i],
              _geom.selfLoopToSquare(n),
              this._tree);
          }
          else {
            cp = sigma.utils.getQuadraticControlPoint(e.x1, e.y1, e.x2, e.y2, edges[i].cc || cc);
            _quadInsert(
              edges[i],
              _geom.quadraticCurveToSquare(e, cp),
              this._tree);
          }
        }
        else {
          _quadInsert(
            edges[i],
            _geom.lineToSquare(e),
            this._tree);
        }
      }
    }

    // Reset cache:
    this._cache = {
      query: false,
      result: false
    };

    // remove?
    return this._tree;
  };

  /**
   * Retrieve every graph nodes held by the quadtree node containing the
   * searched point.
   *
   * @param  {number} x of the point.
   * @param  {number} y of the point.
   * @return {array}  An array of nodes retrieved.
   */
  quad.prototype.point = function(x, y) {
    if (!this._enabled)
      return [];

    return this._tree ?
      _quadRetrievePoint({x: x, y: y}, this._tree) || [] :
      [];
  };

  /**
   * Retrieve every graph nodes within a rectangular area. The methods keep the
   * last area queried in cache for optimization reason and will act differently
   * for the same reason if the area is axis-aligned or not.
   *
   * @param  {object} A rectangle defined by two top points (x1, y1), (x2, y2)
   *                  and height.
   * @return {array}  An array of nodes retrieved.
   */
  quad.prototype.area = function(rect) {
    if (!this._enabled)
      return [];

    var serialized = JSON.stringify(rect),
        collisionFunc,
        rectData;

    // Returning cache?
    if (this._cache.query === serialized)
      return this._cache.result;

    // Axis aligned ?
    if (_geom.isAxisAligned(rect)) {
      collisionFunc = _quadIndexes;
      rectData = _geom.axisAlignedTopPoints(rect);
    }
    else {
      collisionFunc = _quadCollision;
      rectData = _geom.rectangleCorners(rect);
    }

    // Retrieving nodes
    var elements = this._tree ?
      _quadRetrieveArea(
        rectData,
        this._tree,
        collisionFunc
      ) :
      [];

    // Object to array
    var elementsArr = [];
    for (var i in elements)
      elementsArr.push(elements[i]);

    // Caching
    this._cache.query = serialized;
    this._cache.result = elementsArr;

    return elementsArr;
  };


  /**
   * EXPORT:
   * *******
   */
  if (typeof this.sigma !== 'undefined') {
    this.sigma.classes = this.sigma.classes || {};
    this.sigma.classes.quad = quad;
    this.sigma.classes.edgequad = quad.bind(this, true);
  } else if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = quad;
    exports.quad = quad;
  } else
    this.quad = quad;

}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.captors');

  /**
   * The user inputs default captor. It deals with mouse events, keyboards
   * events and touch events.
   *
   * @param  {DOMElement}   target   The DOM element where the listeners will be
   *                                 bound.
   * @param  {camera}       camera   The camera related to the target.
   * @param  {configurable} settings The settings function.
   * @return {sigma.captor}          The fresh new captor instance.
   */
  sigma.captors.mouse = function(target, camera, settings) {
    var _self = this,
        _target = target,
        _camera = camera,
        _settings = settings,

        // CAMERA MANAGEMENT:
        // ******************
        // The camera position when the user starts dragging:
        _startCameraX,
        _startCameraY,
        _startCameraAngle,

        // The latest stage position:
        _lastCameraX,
        _lastCameraY,
        _lastCameraAngle,
        _lastCameraRatio,

        // MOUSE MANAGEMENT:
        // *****************
        // The mouse position when the user starts dragging:
        _startMouseX,
        _startMouseY,

        _isMouseDown,
        _isMoving,
        _hasDragged,
        _downStartTime,
        _movingTimeoutId;

    this.eltFocused = false;

    sigma.classes.dispatcher.extend(this);

    sigma.utils.doubleClick(_target, 'click', _doubleClickHandler);
    _target.addEventListener('DOMMouseScroll', _wheelHandler, false);
    _target.addEventListener('mousewheel', _wheelHandler, false);
    _target.addEventListener('mousemove', _moveHandler, false);
    _target.addEventListener('mousedown', _downHandler, false);
    _target.addEventListener('click', _clickHandler, false);
    _target.addEventListener('mouseout', _outHandler, false);
    _target.addEventListener('mouseenter', _enterHandler, false);
    document.addEventListener('mouseup', _upHandler, false);




    /**
     * This method unbinds every handlers that makes the captor work.
     */
    this.kill = function() {
      sigma.utils.unbindDoubleClick(_target, 'click');
      _target.removeEventListener('DOMMouseScroll', _wheelHandler);
      _target.removeEventListener('mousewheel', _wheelHandler);
      _target.removeEventListener('mousemove', _moveHandler);
      _target.removeEventListener('mousedown', _downHandler);
      _target.removeEventListener('click', _clickHandler);
      _target.removeEventListener('mouseout', _outHandler);
      document.removeEventListener('mouseup', _upHandler);
    };




    // MOUSE EVENTS:
    // *************

    function _enterHandler(e) {
      if (!_settings('clickToFocus')) {
        target.focus();
      }
    }

    /**
     * The handler listening to the 'move' mouse event. It will effectively
     * drag the graph.
     *
     * @param {event} e A mouse event.
     */
    function _moveHandler(e) {
      var x,
          y,
          pos;

      // Dispatch event:
      if (_settings('mouseEnabled')) {
        _self.dispatchEvent('mousemove',
          sigma.utils.mouseCoords(e));

        if (_isMouseDown) {
          _isMoving = true;
          _hasDragged = true;

          if (_movingTimeoutId)
            clearTimeout(_movingTimeoutId);

          _movingTimeoutId = setTimeout(function() {
            _isMoving = false;
          }, _settings('dragTimeout'));

          sigma.misc.animation.killAll(_camera);

          _camera.isMoving = true;
          pos = _camera.cameraPosition(
            sigma.utils.getX(e) - _startMouseX,
            sigma.utils.getY(e) - _startMouseY,
            true
          );

          x = _startCameraX - pos.x;
          y = _startCameraY - pos.y;

          if (x !== _camera.x || y !== _camera.y) {
            _lastCameraX = _camera.x;
            _lastCameraY = _camera.y;

            _camera.goTo({
              x: x,
              y: y
            });
          }

          if (e.preventDefault)
            e.preventDefault();
          else
            e.returnValue = false;

          e.stopPropagation();
          return false;
        }
      }
    }

    /**
     * The handler listening to the 'up' mouse event. It will stop dragging the
     * graph.
     *
     * @param {event} e A mouse event.
     */
    function _upHandler(e) {
      if (_settings('mouseEnabled') && _isMouseDown) {
        _isMouseDown = false;
        if (_movingTimeoutId)
          clearTimeout(_movingTimeoutId);

        _camera.isMoving = false;

        var x = sigma.utils.getX(e),
            y = sigma.utils.getY(e);

        if (_isMoving) {
          sigma.misc.animation.killAll(_camera);
          sigma.misc.animation.camera(
            _camera,
            {
              x: _camera.x +
                _settings('mouseInertiaRatio') * (_camera.x - _lastCameraX),
              y: _camera.y +
                _settings('mouseInertiaRatio') * (_camera.y - _lastCameraY)
            },
            {
              easing: 'quadraticOut',
              duration: _settings('mouseInertiaDuration')
            }
          );
        } else if (
          _startMouseX !== x ||
          _startMouseY !== y
        )
          _camera.goTo({
            x: _camera.x,
            y: _camera.y
          });

        _self.dispatchEvent('mouseup',
          sigma.utils.mouseCoords(e));

        // Update _isMoving flag:
        _isMoving = false;
      }
    }

    /**
     * The handler listening to the 'down' mouse event. It will start observing
     * the mouse position for dragging the graph.
     *
     * @param {event} e A mouse event.
     */
    function _downHandler(e) {
      if (_settings('mouseEnabled')) {
        _startCameraX = _camera.x;
        _startCameraY = _camera.y;

        _lastCameraX = _camera.x;
        _lastCameraY = _camera.y;

        _startMouseX = sigma.utils.getX(e);
        _startMouseY = sigma.utils.getY(e);

        _hasDragged = false;
        _downStartTime = (new Date()).getTime();

        switch (e.which) {
          case 2:
            // Middle mouse button pressed
            // Do nothing.
            break;
          case 3:
            // Right mouse button pressed
            _self.dispatchEvent('rightclick',
              sigma.utils.mouseCoords(e, _startMouseX, _startMouseY));
            break;
          // case 1:
          default:
            // Left mouse button pressed
            _isMouseDown = true;

            _self.dispatchEvent('mousedown',
              sigma.utils.mouseCoords(e, _startMouseX, _startMouseY));
        }
      }
    }

    /**
     * The handler listening to the 'out' mouse event. It will just redispatch
     * the event.
     *
     * @param {event} e A mouse event.
     */
    function _outHandler(e) {
      _self.eltFocused = false;
      target.blur();

      if (_settings('mouseEnabled'))
        _self.dispatchEvent('mouseout');
    }

    /**
     * The handler listening to the 'click' mouse event. It will redispatch the
     * click event, but with normalized X and Y coordinates.
     *
     * @param {event} e A mouse event.
     */
    function _clickHandler(e) {
      _self.eltFocused = true;
      target.focus();

      if (_settings('mouseEnabled')) {
        var event = sigma.utils.mouseCoords(e);
        event.isDragging =
          (((new Date()).getTime() - _downStartTime) > 100) && _hasDragged;
        _self.dispatchEvent('click', event);
      }

      if (e.preventDefault)
        e.preventDefault();
      else
        e.returnValue = false;

      e.stopPropagation();
      return false;
    }

    /**
     * The handler listening to the double click custom event. It will
     * basically zoom into the graph.
     *
     * @param {event} e A mouse event.
     */
    function _doubleClickHandler(e) {
      var pos,
          ratio,
          animation;

      if (_settings('mouseEnabled')) {
        ratio = 1 / _settings('doubleClickZoomingRatio');

        _self.dispatchEvent('doubleclick',
            sigma.utils.mouseCoords(e, _startMouseX, _startMouseY));

        if (_settings('doubleClickEnabled')) {
          pos = _camera.cameraPosition(
            sigma.utils.getX(e) - sigma.utils.getCenter(e).x,
            sigma.utils.getY(e) - sigma.utils.getCenter(e).y,
            true
          );

          animation = {
            duration: _settings('doubleClickZoomDuration')
          };

          sigma.utils.zoomTo(_camera, pos.x, pos.y, ratio, animation);
        }

        if (e.preventDefault)
          e.preventDefault();
        else
          e.returnValue = false;

        e.stopPropagation();
        return false;
      }
    }

    /**
     * The handler listening to the 'wheel' mouse event. It will basically zoom
     * in or not into the graph.
     *
     * @param {event} e A mouse event.
     */
    function _wheelHandler(e) {
      var pos,
          ratio,
          animation;

      if (_settings('mouseEnabled') && _settings('mouseWheelEnabled') && (!_settings('clickToFocus') || _self.eltFocused)) {
        ratio = sigma.utils.getDelta(e) > 0 ?
          1 / _settings('zoomingRatio') :
          _settings('zoomingRatio');

        pos = _camera.cameraPosition(
          sigma.utils.getX(e) - sigma.utils.getCenter(e).x,
          sigma.utils.getY(e) - sigma.utils.getCenter(e).y,
          true
        );

        animation = {
          duration: _settings('mouseZoomDuration')
        };

        sigma.utils.zoomTo(_camera, pos.x, pos.y, ratio, animation);

        if (e.preventDefault)
          e.preventDefault();
        else
          e.returnValue = false;

        e.stopPropagation();
        return false;
      }
    }
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.captors');

  /**
   * The user inputs default captor. It deals with mouse events, keyboards
   * events and touch events.
   *
   * @param  {DOMElement}   target   The DOM element where the listeners will be
   *                                 bound.
   * @param  {camera}       camera   The camera related to the target.
   * @param  {configurable} settings The settings function.
   * @return {sigma.captor}          The fresh new captor instance.
   */
  sigma.captors.touch = function(target, camera, settings) {
    var _self = this,
        _target = target,
        _camera = camera,
        _settings = settings,

        // CAMERA MANAGEMENT:
        // ******************
        // The camera position when the user starts dragging:
        _startCameraX,
        _startCameraY,
        _startCameraAngle,
        _startCameraRatio,

        // The latest stage position:
        _lastCameraX,
        _lastCameraY,
        _lastCameraAngle,
        _lastCameraRatio,

        // TOUCH MANAGEMENT:
        // *****************
        // Touches that are down:
        _downTouches = [],

        _startTouchX0,
        _startTouchY0,
        _startTouchX1,
        _startTouchY1,
        _startTouchAngle,
        _startTouchDistance,

        _touchMode,

        _isMoving,
        _doubleTap,
        _movingTimeoutId;

    sigma.classes.dispatcher.extend(this);

    sigma.utils.doubleClick(_target, 'touchstart', _doubleTapHandler);
    _target.addEventListener('touchstart', _handleStart, false);
    _target.addEventListener('touchend', _handleLeave, false);
    _target.addEventListener('touchcancel', _handleLeave, false);
    _target.addEventListener('touchleave', _handleLeave, false);
    _target.addEventListener('touchmove', _handleMove, false);

    function position(e) {
      var offset = sigma.utils.getOffset(_target);

      return {
        x: e.pageX - offset.left,
        y: e.pageY - offset.top
      };
    }

    /**
     * This method unbinds every handlers that makes the captor work.
     */
    this.kill = function() {
      sigma.utils.unbindDoubleClick(_target, 'touchstart');
      _target.addEventListener('touchstart', _handleStart);
      _target.addEventListener('touchend', _handleLeave);
      _target.addEventListener('touchcancel', _handleLeave);
      _target.addEventListener('touchleave', _handleLeave);
      _target.addEventListener('touchmove', _handleMove);
    };

    // TOUCH EVENTS:
    // *************
    /**
     * The handler listening to the 'touchstart' event. It will set the touch
     * mode ("_touchMode") and start observing the user touch moves.
     *
     * @param {event} e A touch event.
     */
    function _handleStart(e) {
      if (_settings('touchEnabled')) {
        var x0,
            x1,
            y0,
            y1,
            pos0,
            pos1;

        _downTouches = e.touches;

        switch (_downTouches.length) {
          case 1:
            _camera.isMoving = true;
            _touchMode = 1;

            _startCameraX = _camera.x;
            _startCameraY = _camera.y;

            _lastCameraX = _camera.x;
            _lastCameraY = _camera.y;

            pos0 = position(_downTouches[0]);
            _startTouchX0 = pos0.x;
            _startTouchY0 = pos0.y;

            break;
          case 2:
            _camera.isMoving = true;
            _touchMode = 2;

            pos0 = position(_downTouches[0]);
            pos1 = position(_downTouches[1]);
            x0 = pos0.x;
            y0 = pos0.y;
            x1 = pos1.x;
            y1 = pos1.y;

            _lastCameraX = _camera.x;
            _lastCameraY = _camera.y;

            _startCameraAngle = _camera.angle;
            _startCameraRatio = _camera.ratio;

            _startCameraX = _camera.x;
            _startCameraY = _camera.y;

            _startTouchX0 = x0;
            _startTouchY0 = y0;
            _startTouchX1 = x1;
            _startTouchY1 = y1;

            _startTouchAngle = Math.atan2(
              _startTouchY1 - _startTouchY0,
              _startTouchX1 - _startTouchX0
            );
            _startTouchDistance = Math.sqrt(
              (_startTouchY1 - _startTouchY0) *
                (_startTouchY1 - _startTouchY0) +
              (_startTouchX1 - _startTouchX0) *
                (_startTouchX1 - _startTouchX0)
            );

            e.preventDefault();
            return false;
        }
      }
    }

    /**
     * The handler listening to the 'touchend', 'touchcancel' and 'touchleave'
     * event. It will update the touch mode if there are still at least one
     * finger, and stop dragging else.
     *
     * @param {event} e A touch event.
     */
    function _handleLeave(e) {
      if (_settings('touchEnabled')) {
        _downTouches = e.touches;
        var inertiaRatio = _settings('touchInertiaRatio');

        if (_movingTimeoutId) {
          _isMoving = false;
          clearTimeout(_movingTimeoutId);
        }

        switch (_touchMode) {
          case 2:
            if (e.touches.length === 1) {
              _handleStart(e);

              e.preventDefault();
              break;
            }
            /* falls through */
          case 1:
            _camera.isMoving = false;
            _self.dispatchEvent('stopDrag');

            if (_isMoving) {
              _doubleTap = false;
              sigma.misc.animation.camera(
                _camera,
                {
                  x: _camera.x +
                    inertiaRatio * (_camera.x - _lastCameraX),
                  y: _camera.y +
                    inertiaRatio * (_camera.y - _lastCameraY)
                },
                {
                  easing: 'quadraticOut',
                  duration: _settings('touchInertiaDuration')
                }
              );
            }

            _isMoving = false;
            _touchMode = 0;
            break;
        }
      }
    }

    /**
     * The handler listening to the 'touchmove' event. It will effectively drag
     * the graph, and eventually zooms and turn it if the user is using two
     * fingers.
     *
     * @param {event} e A touch event.
     */
    function _handleMove(e) {
      if (!_doubleTap && _settings('touchEnabled')) {
        var x0,
            x1,
            y0,
            y1,
            cos,
            sin,
            end,
            pos0,
            pos1,
            diff,
            start,
            dAngle,
            dRatio,
            newStageX,
            newStageY,
            newStageRatio,
            newStageAngle;

        _downTouches = e.touches;
        _isMoving = true;

        if (_movingTimeoutId)
          clearTimeout(_movingTimeoutId);

        _movingTimeoutId = setTimeout(function() {
          _isMoving = false;
        }, _settings('dragTimeout'));

        switch (_touchMode) {
          case 1:
            pos0 = position(_downTouches[0]);
            x0 = pos0.x;
            y0 = pos0.y;

            diff = _camera.cameraPosition(
              x0 - _startTouchX0,
              y0 - _startTouchY0,
              true
            );

            newStageX = _startCameraX - diff.x;
            newStageY = _startCameraY - diff.y;

            if (newStageX !== _camera.x || newStageY !== _camera.y) {
              _lastCameraX = _camera.x;
              _lastCameraY = _camera.y;

              _camera.goTo({
                x: newStageX,
                y: newStageY
              });

              _self.dispatchEvent('mousemove',
                sigma.utils.mouseCoords(e, pos0.x, pos0.y));

              _self.dispatchEvent('drag');
            }
            break;
          case 2:
            pos0 = position(_downTouches[0]);
            pos1 = position(_downTouches[1]);
            x0 = pos0.x;
            y0 = pos0.y;
            x1 = pos1.x;
            y1 = pos1.y;

            start = _camera.cameraPosition(
              (_startTouchX0 + _startTouchX1) / 2 -
                sigma.utils.getCenter(e).x,
              (_startTouchY0 + _startTouchY1) / 2 -
                sigma.utils.getCenter(e).y,
              true
            );
            end = _camera.cameraPosition(
              (x0 + x1) / 2 - sigma.utils.getCenter(e).x,
              (y0 + y1) / 2 - sigma.utils.getCenter(e).y,
              true
            );

            dAngle = Math.atan2(y1 - y0, x1 - x0) - _startTouchAngle;
            dRatio = Math.sqrt(
              (y1 - y0) * (y1 - y0) + (x1 - x0) * (x1 - x0)
            ) / _startTouchDistance;

            // Translation:
            x0 = start.x;
            y0 = start.y;

            // Homothetic transformation:
            newStageRatio = _startCameraRatio / dRatio;
            x0 = x0 * dRatio;
            y0 = y0 * dRatio;

            // Rotation:
            newStageAngle = _startCameraAngle - dAngle;
            cos = Math.cos(-dAngle);
            sin = Math.sin(-dAngle);
            x1 = x0 * cos + y0 * sin;
            y1 = y0 * cos - x0 * sin;
            x0 = x1;
            y0 = y1;

            // Finalize:
            newStageX = x0 - end.x + _startCameraX;
            newStageY = y0 - end.y + _startCameraY;

            if (
              newStageRatio !== _camera.ratio ||
              newStageAngle !== _camera.angle ||
              newStageX !== _camera.x ||
              newStageY !== _camera.y
            ) {
              _lastCameraX = _camera.x;
              _lastCameraY = _camera.y;
              _lastCameraAngle = _camera.angle;
              _lastCameraRatio = _camera.ratio;

              _camera.goTo({
                x: newStageX,
                y: newStageY,
                angle: newStageAngle,
                ratio: newStageRatio
              });

              _self.dispatchEvent('drag');
            }

            break;
        }

        e.preventDefault();
        return false;
      }
    }

    /**
     * The handler listening to the double tap custom event. It will
     * basically zoom into the graph.
     *
     * @param {event} e A touch event.
     */
    function _doubleTapHandler(e) {
      var pos,
          ratio,
          animation;

      if (e.touches && e.touches.length === 1 && _settings('touchEnabled')) {
        _doubleTap = true;

        ratio = 1 / _settings('doubleClickZoomingRatio');

        pos = position(e.touches[0]);
        _self.dispatchEvent('doubleclick',
          sigma.utils.mouseCoords(e, pos.x, pos.y));

        if (_settings('doubleClickEnabled')) {
          pos = _camera.cameraPosition(
            pos.x - sigma.utils.getCenter(e).x,
            pos.y - sigma.utils.getCenter(e).y,
            true
          );

          animation = {
            duration: _settings('doubleClickZoomDuration'),
            onComplete: function() {
              _doubleTap = false;
            }
          };

          sigma.utils.zoomTo(_camera, pos.x, pos.y, ratio, animation);
        }

        if (e.preventDefault)
          e.preventDefault();
        else
          e.returnValue = false;

        e.stopPropagation();
        return false;
      }
    }
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  if (typeof conrad === 'undefined')
    throw 'conrad is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.renderers');

  /**
   * This function is the constructor of the canvas sigma's renderer.
   *
   * @param  {sigma.classes.graph}            graph    The graph to render.
   * @param  {sigma.classes.camera}           camera   The camera.
   * @param  {configurable}           settings The sigma instance settings
   *                                           function.
   * @param  {object}                 object   The options object.
   * @return {sigma.renderers.canvas}          The renderer instance.
   */
  sigma.renderers.canvas = function(graph, camera, settings, options) {
    if (typeof options !== 'object')
      throw 'sigma.renderers.canvas: Wrong arguments.';

    if (!(options.container instanceof HTMLElement))
      throw 'Container not found.';

    var i,
        l,
        a,
        fn,
        self = this;

    sigma.classes.dispatcher.extend(this);

    // Initialize main attributes:
    Object.defineProperty(this, 'conradId', {
      value: sigma.utils.id()
    });
    this.graph = graph;
    this.camera = camera;
    this.contexts = {};
    this.domElements = {};
    this.options = options;
    this.container = this.options.container;
    this.settings = (
        typeof options.settings === 'object' &&
        options.settings
      ) ?
        settings.embedObjects(options.settings) :
        settings;

    // Node indexes:
    this.nodesOnScreen = [];
    this.edgesOnScreen = [];

    // Conrad related attributes:
    this.jobs = {};

    // Find the prefix:
    this.options.prefix = 'renderer' + this.conradId + ':';

    // Initialize the DOM elements:
    if (
      !this.settings('batchEdgesDrawing')
    ) {
      this.initDOM('canvas', 'scene');
      this.contexts.edges = this.contexts.scene;
      this.contexts.nodes = this.contexts.scene;
      this.contexts.labels = this.contexts.scene;
    } else {
      this.initDOM('canvas', 'edges');
      this.initDOM('canvas', 'scene');
      this.contexts.nodes = this.contexts.scene;
      this.contexts.labels = this.contexts.scene;
    }

    this.initDOM('canvas', 'mouse');
    this.contexts.hover = this.contexts.mouse;

    // Initialize captors:
    this.captors = [];
    a = this.options.captors || [sigma.captors.mouse, sigma.captors.touch];
    for (i = 0, l = a.length; i < l; i++) {
      fn = typeof a[i] === 'function' ? a[i] : sigma.captors[a[i]];
      this.captors.push(
        new fn(
          this.domElements.mouse,
          this.camera,
          this.settings
        )
      );
    }

    // Deal with sigma events:
    sigma.misc.bindEvents.call(this, this.options.prefix);
    sigma.misc.drawHovers.call(this, this.options.prefix);

    this.resize(false);
  };

  /**
   * Static method to render edges or nodes with the given renderers
   *
   * @param  {object}       params     The parameters passed in an object
   * {
   *   renderers: {object}              Renderers indexed by types
   *   type:      {string}              "edges" or "nodes"
   *   ctx:       {Context2D}           Canvas Context to draw on
   *   settings:  {object}              Settings object to use
   *   elements:  {array}               Elements to render
   *   graph?:    {sigma.classes.graph} Graph object
   *                                    (only necessary for edge rendering)
   *   start?:    {integer}             Starting index of the elements to render
   *   end?:      {integer}             Last index of the elements to render
   * }
   */
  sigma.renderers.canvas.applyRenderers = function(params) {
    var i,
        renderer,
        specializedRenderer,
        def,
        render,
        els = params.elements,
        ctx_infos = {font: params.ctx.font},
        elementType = (params.elements || params.type == 'edges' ?
              'defaultEdgeType' : 'defaultNodeType');

    params.start = params.start || 0;
    params.end = params.end || params.elements.length;
    params.end = Math.min(params.elements.length, params.end);

    params.ctx.save();

    for (i = params.start; i < params.end; i++) {
      if (!els[i].hidden) {
        specializedRenderer = params.renderers[
          els[i].type || params.settings(elementType)
        ];
        def = (specializedRenderer || params.renderers.def);
        if (params.type == 'edges') {
          def(
            els[i],
            params.graph.nodes(els[i].source),
            params.graph.nodes(els[i].target),
            params.ctx,
            params.settings,
            {ctx: ctx_infos}
          );
        }else {
          def(
            els[i],
            params.ctx,
            params.settings,
            {ctx: ctx_infos}
          );
        }
      }
    }

    params.ctx.restore();
  };


  /**
   * Render a batch of edges
   *
   * @param    {integer}      start    Starting index of the elements to render
   * @param    {integer}      end      Last index of the elements to render
   * @param    {object}       settings Settings to use
   */
  sigma.renderers.canvas.prototype.renderEdges =
          function(start, end, settings) {
    var renderParams = {
      renderers: sigma.canvas.edges,
      type: 'edges',
      elements: this.edgesOnScreen,
      ctx: this.contexts.edges,
      start: start,
      end: end,
      graph: this.graph,
      settings: settings
    };
    sigma.renderers.canvas.applyRenderers(renderParams);
    if (settings('drawEdgeLabels')) {
      renderParams.renderers = sigma.canvas.edges.labels;
      renderParams.ctx = this.contexts.labels;
      sigma.renderers.canvas.applyRenderers(renderParams);
    }
  };

  /**
   * This method renders the graph on the canvases.
   *
   * @param  {?object}                options Eventually an object of options.
   * @return {sigma.renderers.canvas}         Returns the instance itself.
   */
  sigma.renderers.canvas.prototype.render = function(options) {
    options = options || {};

    this.dispatchEvent('beforeRender');

    var a,
        i,
        k,
        l,
        o,
        id,
        end,
        job,
        start,
        edges,
        batchSize,
        tempGCO,
        index = {},
        graph = this.graph,
        nodes = this.graph.nodes,
        prefix = this.options.prefix || '',
        drawEdges = this.settings(options, 'drawEdges'),
        drawNodes = this.settings(options, 'drawNodes'),
        drawLabels = this.settings(options, 'drawLabels'),
        embedSettings = this.settings.embedObjects(options, {
          prefix: this.options.prefix
        });

    // Call the resize function:
    this.resize(false);

    // Check the 'hideEdgesOnMove' setting:
    if (this.settings(options, 'hideEdgesOnMove'))
      if (this.camera.isAnimated || this.camera.isMoving)
        drawEdges = false;

    // Apply the camera's view:
    this.camera.applyView(
      undefined,
      this.options.prefix,
      {
        width: this.width,
        height: this.height
      }
    );

    // Clear canvases:
    this.clear();

    // Kill running jobs:
    for (k in this.jobs)
      if (conrad.hasJob(k))
        conrad.killJob(k);

    // Find which nodes are on screen:
    this.nodesOnScreen = this.camera.quadtree.area(
      this.camera.getRectangle(this.width, this.height)
    );

    for (a = this.nodesOnScreen, i = 0, l = a.length; i < l; i++)
      index[a[i].id] = a[i];

    // Draw edges:
    // - If settings('batchEdgesDrawing') is true, the edges are displayed per
    //   batches. If not, they are drawn in one frame.
    if (drawEdges) {
      this.edgesOnScreen = [];
      if (embedSettings('edgesClippingWithNodes')) {
        // Identify which edges to draw by keeping every edges that have at
        // least one extremity displayed according to the quadtree and the
        // "hidden" attribute. We also do not keep hidden edges.
        for (a = graph.edges(), i = 0, l = a.length; i < l; i++) {
          o = a[i];
          if (
            (index[o.source] || index[o.target]) &&
            (!o.hidden && !nodes(o.source).hidden && !nodes(o.target).hidden)
          )
            this.edgesOnScreen.push(o);
        }
      } else {
        this.edgesOnScreen = this.camera.edgequadtree.area(
          this.camera.getRectangle(this.width, this.height)
        );
      }

      // If the "batchEdgesDrawing" settings is true, edges are batched:
      if (embedSettings('batchEdgesDrawing')) {
        id = 'edges_' + this.conradId;
        batchSize = embedSettings('canvasEdgesBatchSize');

        edges = this.edgesOnScreen;
        l = edges.length;

        start = 0;
        end = Math.min(edges.length, start + batchSize);

        job = function() {
          tempGCO = this.contexts.edges.globalCompositeOperation;
          this.contexts.edges.globalCompositeOperation = 'destination-over';

          this.renderEdges(start, end, embedSettings);

          // Restore original globalCompositeOperation:
          this.contexts.edges.globalCompositeOperation = tempGCO;

          // Catch job's end:
          if (end === edges.length) {
            delete this.jobs[id];
            return false;
          }

          start = end + 1;
          end = Math.min(edges.length, start + batchSize);
          return true;
        };

        this.jobs[id] = job;
        conrad.addJob(id, job.bind(this));

      // If not, they are drawn in one frame:
      } else {
        this.renderEdges(0, this.edgesOnScreen.length, embedSettings);
      }
    }

    // Draw nodes:
    // - No batching
    if (drawNodes) {
      sigma.renderers.canvas.applyRenderers({
        renderers: sigma.canvas.nodes,
        type: 'nodes',
        ctx: this.contexts.nodes,
        elements: this.nodesOnScreen,
        settings: embedSettings
      });
    }

    // Draw labels:
    // - No batching
    if (drawLabels) {
      sigma.renderers.canvas.applyRenderers({
        renderers: sigma.canvas.labels,
        type: 'nodes',
        ctx: this.contexts.labels,
        elements: this.nodesOnScreen,
        settings: embedSettings
      });
    }

    this.dispatchEvent('render');

    return this;
  };

  /**
   * This method creates a DOM element of the specified type, switches its
   * position to "absolute", references it to the domElements attribute, and
   * finally appends it to the container.
   *
   * @param  {string} tag The label tag.
   * @param  {string} id  The id of the element (to store it in "domElements").
   */
  sigma.renderers.canvas.prototype.initDOM = function(tag, id) {
    var dom = document.createElement(tag);

    dom.style.position = 'absolute';
    dom.setAttribute('class', 'sigma-' + id);

    this.domElements[id] = dom;
    this.container.appendChild(dom);

    if (tag.toLowerCase() === 'canvas')
      this.contexts[id] = dom.getContext('2d');
  };

  /**
   * This method resizes each DOM elements in the container and stores the new
   * dimensions. Then, it renders the graph.
   *
   * @param  {?number}                width  The new width of the container.
   * @param  {?number}                height The new height of the container.
   * @return {sigma.renderers.canvas}        Returns the instance itself.
   */
  sigma.renderers.canvas.prototype.resize = function(w, h) {
    var k,
        oldWidth = this.width,
        oldHeight = this.height,
        pixelRatio = sigma.utils.getPixelRatio();

    if (w !== undefined && h !== undefined) {
      this.width = w;
      this.height = h;
    } else {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;

      w = this.width;
      h = this.height;
    }

    if (oldWidth !== this.width || oldHeight !== this.height) {
      for (k in this.domElements) {
        this.domElements[k].style.width = w + 'px';
        this.domElements[k].style.height = h + 'px';

        if (this.domElements[k].tagName.toLowerCase() === 'canvas') {
          this.domElements[k].setAttribute('width', (w * pixelRatio) + 'px');
          this.domElements[k].setAttribute('height', (h * pixelRatio) + 'px');

          if (pixelRatio !== 1)
            this.contexts[k].scale(pixelRatio, pixelRatio);
        }
      }
    }

    return this;
  };

  /**
   * This method clears each canvas.
   *
   * @return {sigma.renderers.canvas} Returns the instance itself.
   */
  sigma.renderers.canvas.prototype.clear = function() {
    for (var k in this.contexts) {
      this.contexts[k].clearRect(0, 0, this.width, this.height);
    }

    return this;
  };

  /**
   * This method kills contexts and other attributes.
   */
  sigma.renderers.canvas.prototype.kill = function() {
    var k,
        captor;

    // Kill captors:
    while ((captor = this.captors.pop()))
      captor.kill();
    delete this.captors;

    // Kill contexts:
    for (k in this.domElements) {
      this.domElements[k].parentNode.removeChild(this.domElements[k]);
      delete this.domElements[k];
      delete this.contexts[k];
    }
    delete this.domElements;
    delete this.contexts;
  };




  /**
   * The labels, nodes and edges renderers are stored in the three following
   * objects. When an element is drawn, its type will be checked and if a
   * renderer with the same name exists, it will be used. If not found, the
   * default renderer will be used instead.
   *
   * They are stored in different files, in the "./canvas" folder.
   */
  sigma.utils.pkg('sigma.canvas.nodes');
  sigma.utils.pkg('sigma.canvas.edges');
  sigma.utils.pkg('sigma.canvas.labels');
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.renderers');

  /**
   * This function is the constructor of the canvas sigma's renderer.
   *
   * @param  {sigma.classes.graph}            graph    The graph to render.
   * @param  {sigma.classes.camera}           camera   The camera.
   * @param  {configurable}           settings The sigma instance settings
   *                                           function.
   * @param  {object}                 object   The options object.
   * @return {sigma.renderers.canvas}          The renderer instance.
   */
  sigma.renderers.webgl = function(graph, camera, settings, options) {
    if (typeof options !== 'object')
      throw 'sigma.renderers.webgl: Wrong arguments.';

    if (!(options.container instanceof HTMLElement))
      throw 'Container not found.';

    var k,
        i,
        l,
        a,
        fn,
        _self = this;

    sigma.classes.dispatcher.extend(this);

    // Conrad related attributes:
    this.jobs = {};

    Object.defineProperty(this, 'conradId', {
      value: sigma.utils.id()
    });

    // Initialize main attributes:
    this.graph = graph;
    this.camera = camera;
    this.contexts = {};
    this.domElements = {};
    this.options = options;
    this.container = this.options.container;
    this.settings = (
        typeof options.settings === 'object' &&
        options.settings
      ) ?
        settings.embedObjects(options.settings) :
        settings;

    // Find the prefix:
    this.options.prefix = this.camera.readPrefix;

    // Initialize programs hash
    Object.defineProperty(this, 'nodePrograms', {
      value: {}
    });
    Object.defineProperty(this, 'edgePrograms', {
      value: {}
    });
    Object.defineProperty(this, 'nodeFloatArrays', {
      value: {}
    });
    Object.defineProperty(this, 'edgeFloatArrays', {
      value: {}
    });
    Object.defineProperty(this, 'edgeIndicesArrays', {
      value: {}
    });

    // Initialize the DOM elements:
    if (this.settings(options, 'batchEdgesDrawing')) {
      this.initDOM('canvas', 'edges', true);
      this.initDOM('canvas', 'nodes', true);
    } else {
      this.initDOM('canvas', 'scene', true);
      this.contexts.nodes = this.contexts.scene;
      this.contexts.edges = this.contexts.scene;
    }

    this.initDOM('canvas', 'labels');
    this.initDOM('canvas', 'mouse');
    this.contexts.hover = this.contexts.mouse;

    // Initialize captors:
    this.captors = [];
    a = this.options.captors || [sigma.captors.mouse, sigma.captors.touch];
    for (i = 0, l = a.length; i < l; i++) {
      fn = typeof a[i] === 'function' ? a[i] : sigma.captors[a[i]];
      this.captors.push(
        new fn(
          this.domElements.mouse,
          this.camera,
          this.settings
        )
      );
    }

    // Deal with sigma events:
    sigma.misc.bindEvents.call(this, this.camera.prefix);
    sigma.misc.drawHovers.call(this, this.camera.prefix);

    this.resize();
  };




  /**
   * This method will generate the nodes and edges float arrays. This step is
   * separated from the "render" method, because to keep WebGL efficient, since
   * all the camera and middlewares are modelised as matrices and they do not
   * require the float arrays to be regenerated.
   *
   * Basically, when the user moves the camera or applies some specific linear
   * transformations, this process step will be skipped, and the "render"
   * method will efficiently refresh the rendering.
   *
   * And when the user modifies the graph colors or positions (applying a new
   * layout or filtering the colors, for instance), this "process" step will be
   * required to regenerate the float arrays.
   *
   * @return {sigma.renderers.webgl} Returns the instance itself.
   */
  sigma.renderers.webgl.prototype.process = function() {
    var a,
        i,
        l,
        k,
        type,
        renderer,
        graph = this.graph,
        options = sigma.utils.extend(options, this.options),
        defaultEdgeType = this.settings(options, 'defaultEdgeType'),
        defaultNodeType = this.settings(options, 'defaultNodeType');

    // Empty float arrays:
    for (k in this.nodeFloatArrays)
      delete this.nodeFloatArrays[k];

    for (k in this.edgeFloatArrays)
      delete this.edgeFloatArrays[k];

    for (k in this.edgeIndicesArrays)
      delete this.edgeIndicesArrays[k];

    // Sort edges and nodes per types:
    for (a = graph.edges(), i = 0, l = a.length; i < l; i++) {
      type = a[i].type || defaultEdgeType;
      k = (type && sigma.webgl.edges[type]) ? type : 'def';

      if (!this.edgeFloatArrays[k])
        this.edgeFloatArrays[k] = {
          edges: []
        };

      this.edgeFloatArrays[k].edges.push(a[i]);
    }

    for (a = graph.nodes(), i = 0, l = a.length; i < l; i++) {
      type = a[i].type || defaultNodeType;
      k = (type && sigma.webgl.nodes[type]) ? type : 'def';

      if (!this.nodeFloatArrays[k])
        this.nodeFloatArrays[k] = {
          nodes: []
        };

      this.nodeFloatArrays[k].nodes.push(a[i]);
    }

    // Push edges:
    for (k in this.edgeFloatArrays) {
      renderer = sigma.webgl.edges[k];
      a = this.edgeFloatArrays[k].edges;

      // Creating the necessary arrays
      this.edgeFloatArrays[k].array = new Float32Array(
        a.length * renderer.POINTS * renderer.ATTRIBUTES
      );

      for (i = 0, l = a.length; i < l; i++) {

        // Just check that the edge and both its extremities are visible:
        if (
          !a[i].hidden &&
          !graph.nodes(a[i].source).hidden &&
          !graph.nodes(a[i].target).hidden
        )
          renderer.addEdge(
            a[i],
            graph.nodes(a[i].source),
            graph.nodes(a[i].target),
            this.edgeFloatArrays[k].array,
            i * renderer.POINTS * renderer.ATTRIBUTES,
            options.prefix,
            this.settings
          );
      }

      if (typeof renderer.computeIndices === 'function')
        this.edgeIndicesArrays[k] = renderer.computeIndices(
          this.edgeFloatArrays[k].array
        );
    }

    // Push nodes:
    for (k in this.nodeFloatArrays) {
      renderer = sigma.webgl.nodes[k];
      a = this.nodeFloatArrays[k].nodes;

      // Creating the necessary arrays
      this.nodeFloatArrays[k].array = new Float32Array(
        a.length * renderer.POINTS * renderer.ATTRIBUTES
      );

      for (i = 0, l = a.length; i < l; i++) {
        if (!this.nodeFloatArrays[k].array)
          this.nodeFloatArrays[k].array = new Float32Array(
            a.length * renderer.POINTS * renderer.ATTRIBUTES
          );

        // Just check that the edge and both its extremities are visible:
        if (
          !a[i].hidden
        )
          renderer.addNode(
            a[i],
            this.nodeFloatArrays[k].array,
            i * renderer.POINTS * renderer.ATTRIBUTES,
            options.prefix,
            this.settings
          );
      }
    }

    return this;
  };




  /**
   * This method renders the graph. It basically calls each program (and
   * generate them if they do not exist yet) to render nodes and edges, batched
   * per renderer.
   *
   * As in the canvas renderer, it is possible to display edges, nodes and / or
   * labels in batches, to make the whole thing way more scalable.
   *
   * @param  {?object}               params Eventually an object of options.
   * @return {sigma.renderers.webgl}        Returns the instance itself.
   */
  sigma.renderers.webgl.prototype.render = function(params) {
    var a,
        i,
        l,
        k,
        o,
        program,
        renderer,
        self = this,
        graph = this.graph,
        nodesGl = this.contexts.nodes,
        edgesGl = this.contexts.edges,
        matrix = this.camera.getMatrix(),
        options = sigma.utils.extend(params, this.options),
        drawLabels = this.settings(options, 'drawLabels'),
        drawEdges = this.settings(options, 'drawEdges'),
        drawNodes = this.settings(options, 'drawNodes');

    // Call the resize function:
    this.resize(false);

    // Check the 'hideEdgesOnMove' setting:
    if (this.settings(options, 'hideEdgesOnMove'))
      if (this.camera.isAnimated || this.camera.isMoving)
        drawEdges = false;

    // Clear canvases:
    this.clear();

    // Translate matrix to [width/2, height/2]:
    matrix = sigma.utils.matrices.multiply(
      matrix,
      sigma.utils.matrices.translation(this.width / 2, this.height / 2)
    );

    // Kill running jobs:
    for (k in this.jobs)
      if (conrad.hasJob(k))
        conrad.killJob(k);

    if (drawEdges) {
      if (this.settings(options, 'batchEdgesDrawing'))
        (function() {
          var a,
              k,
              i,
              id,
              job,
              arr,
              end,
              start,
              indices,
              renderer,
              batchSize,
              currentProgram;

          id = 'edges_' + this.conradId;
          batchSize = this.settings(options, 'webglEdgesBatchSize');
          a = Object.keys(this.edgeFloatArrays);

          if (!a.length)
            return;
          i = 0;
          renderer = sigma.webgl.edges[a[i]];
          arr = this.edgeFloatArrays[a[i]].array;
          indices = this.edgeIndicesArrays[a[i]];
          start = 0;
          end = Math.min(
            start + batchSize * renderer.POINTS,
            arr.length / renderer.ATTRIBUTES
          );

          job = function() {
            // Check program:
            if (!this.edgePrograms[a[i]])
              this.edgePrograms[a[i]] = renderer.initProgram(edgesGl);

            if (start < end) {
              edgesGl.useProgram(this.edgePrograms[a[i]]);
              renderer.render(
                edgesGl,
                this.edgePrograms[a[i]],
                arr,
                {
                  settings: this.settings,
                  matrix: matrix,
                  width: this.width,
                  height: this.height,
                  ratio: this.camera.ratio,
                  scalingRatio: this.settings(
                    options,
                    'webglOversamplingRatio'
                  ),
                  start: start,
                  count: end - start,
                  indicesData: indices
                }
              );
            }

            // Catch job's end:
            if (
              end >= arr.length / renderer.ATTRIBUTES &&
              i === a.length - 1
            ) {
              delete this.jobs[id];
              return false;
            }

            if (end >= arr.length / renderer.ATTRIBUTES) {
              i++;
              arr = this.edgeFloatArrays[a[i]].array;
              renderer = sigma.webgl.edges[a[i]];
              start = 0;
              end = Math.min(
                start + batchSize * renderer.POINTS,
                arr.length / renderer.ATTRIBUTES
              );
            } else {
              start = end;
              end = Math.min(
                start + batchSize * renderer.POINTS,
                arr.length / renderer.ATTRIBUTES
              );
            }

            return true;
          };

          this.jobs[id] = job;
          conrad.addJob(id, job.bind(this));
        }).call(this);
      else {
        for (k in this.edgeFloatArrays) {
          renderer = sigma.webgl.edges[k];

          // Check program:
          if (!this.edgePrograms[k])
            this.edgePrograms[k] = renderer.initProgram(edgesGl);

          // Render
          if (this.edgeFloatArrays[k]) {
            edgesGl.useProgram(this.edgePrograms[k]);
            renderer.render(
              edgesGl,
              this.edgePrograms[k],
              this.edgeFloatArrays[k].array,
              {
                settings: this.settings,
                matrix: matrix,
                width: this.width,
                height: this.height,
                ratio: this.camera.ratio,
                scalingRatio: this.settings(options, 'webglOversamplingRatio'),
                indicesData: this.edgeIndicesArrays[k]
              }
            );
          }
        }
      }
    }

    if (drawNodes) {
      // Enable blending:
      nodesGl.blendFunc(nodesGl.SRC_ALPHA, nodesGl.ONE_MINUS_SRC_ALPHA);
      nodesGl.enable(nodesGl.BLEND);

      for (k in this.nodeFloatArrays) {
        renderer = sigma.webgl.nodes[k];

        // Check program:
        if (!this.nodePrograms[k])
          this.nodePrograms[k] = renderer.initProgram(nodesGl);

        // Render
        if (this.nodeFloatArrays[k]) {
          nodesGl.useProgram(this.nodePrograms[k]);
          renderer.render(
            nodesGl,
            this.nodePrograms[k],
            this.nodeFloatArrays[k].array,
            {
              settings: this.settings,
              matrix: matrix,
              width: this.width,
              height: this.height,
              ratio: this.camera.ratio,
              scalingRatio: this.settings(options, 'webglOversamplingRatio')
            }
          );
        }
      }
    }

    if (drawLabels) {
      a = this.camera.quadtree.area(
        this.camera.getRectangle(this.width, this.height)
      );

      // Apply camera view to these nodes:
      this.camera.applyView(
        undefined,
        undefined,
        {
          nodes: a,
          edges: [],
          width: this.width,
          height: this.height
        }
      );

      o = function(key) {
        return self.settings({
          prefix: self.camera.prefix
        }, key);
      };

      for (i = 0, l = a.length; i < l; i++)
        if (!a[i].hidden)
          (
            sigma.canvas.labels[
              a[i].type ||
              this.settings(options, 'defaultNodeType')
            ] || sigma.canvas.labels.def
          )(a[i], this.contexts.labels, o);
    }

    this.dispatchEvent('render');

    return this;
  };




  /**
   * This method creates a DOM element of the specified type, switches its
   * position to "absolute", references it to the domElements attribute, and
   * finally appends it to the container.
   *
   * @param  {string}   tag   The label tag.
   * @param  {string}   id    The id of the element (to store it in
   *                          "domElements").
   * @param  {?boolean} webgl Will init the WebGL context if true.
   */
  sigma.renderers.webgl.prototype.initDOM = function(tag, id, webgl) {
    var gl,
        dom = document.createElement(tag),
        self = this;

    dom.style.position = 'absolute';
    dom.setAttribute('class', 'sigma-' + id);

    this.domElements[id] = dom;
    this.container.appendChild(dom);

    if (tag.toLowerCase() === 'canvas') {
      this.contexts[id] = dom.getContext(webgl ? 'experimental-webgl' : '2d', {
        preserveDrawingBuffer: true
      });

      // Adding webgl context loss listeners
      if (webgl) {
        dom.addEventListener('webglcontextlost', function(e) {
          e.preventDefault();
        }, false);

        dom.addEventListener('webglcontextrestored', function(e) {
          self.render();
        }, false);
      }
    }
  };

  /**
   * This method resizes each DOM elements in the container and stores the new
   * dimensions. Then, it renders the graph.
   *
   * @param  {?number}               width  The new width of the container.
   * @param  {?number}               height The new height of the container.
   * @return {sigma.renderers.webgl}        Returns the instance itself.
   */
  sigma.renderers.webgl.prototype.resize = function(w, h) {
    var k,
        oldWidth = this.width,
        oldHeight = this.height,
        pixelRatio = sigma.utils.getPixelRatio();

    if (w !== undefined && h !== undefined) {
      this.width = w;
      this.height = h;
    } else {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;

      w = this.width;
      h = this.height;
    }

    if (oldWidth !== this.width || oldHeight !== this.height) {
      for (k in this.domElements) {
        this.domElements[k].style.width = w + 'px';
        this.domElements[k].style.height = h + 'px';

        if (this.domElements[k].tagName.toLowerCase() === 'canvas') {
          // If simple 2D canvas:
          if (this.contexts[k] && this.contexts[k].scale) {
            this.domElements[k].setAttribute('width', (w * pixelRatio) + 'px');
            this.domElements[k].setAttribute('height', (h * pixelRatio) + 'px');

            if (pixelRatio !== 1)
              this.contexts[k].scale(pixelRatio, pixelRatio);
          } else {
            this.domElements[k].setAttribute(
              'width',
              (w * this.settings('webglOversamplingRatio')) + 'px'
            );
            this.domElements[k].setAttribute(
              'height',
              (h * this.settings('webglOversamplingRatio')) + 'px'
            );
          }
        }
      }
    }

    // Scale:
    for (k in this.contexts)
      if (this.contexts[k] && this.contexts[k].viewport)
        this.contexts[k].viewport(
          0,
          0,
          this.width * this.settings('webglOversamplingRatio'),
          this.height * this.settings('webglOversamplingRatio')
        );

    return this;
  };

  /**
   * This method clears each canvas.
   *
   * @return {sigma.renderers.webgl} Returns the instance itself.
   */
  sigma.renderers.webgl.prototype.clear = function() {
    this.contexts.labels.clearRect(0, 0, this.width, this.height);
    this.contexts.nodes.clear(this.contexts.nodes.COLOR_BUFFER_BIT);
    this.contexts.edges.clear(this.contexts.edges.COLOR_BUFFER_BIT);

    return this;
  };

  /**
   * This method kills contexts and other attributes.
   */
  sigma.renderers.webgl.prototype.kill = function() {
    var k,
        captor;

    // Kill captors:
    while ((captor = this.captors.pop()))
      captor.kill();
    delete this.captors;

    // Kill contexts:
    for (k in this.domElements) {
      this.domElements[k].parentNode.removeChild(this.domElements[k]);
      delete this.domElements[k];
      delete this.contexts[k];
    }
    delete this.domElements;
    delete this.contexts;
  };




  /**
   * The object "sigma.webgl.nodes" contains the different WebGL node
   * renderers. The default one draw nodes as discs. Here are the attributes
   * any node renderer must have:
   *
   * {number}   POINTS      The number of points required to draw a node.
   * {number}   ATTRIBUTES  The number of attributes needed to draw one point.
   * {function} addNode     A function that adds a node to the data stack that
   *                        will be given to the buffer. Here is the arguments:
   *                        > {object}       node
   *                        > {number}       index   The node index in the
   *                                                 nodes array.
   *                        > {Float32Array} data    The stack.
   *                        > {object}       options Some options.
   * {function} render      The function that will effectively render the nodes
   *                        into the buffer.
   *                        > {WebGLRenderingContext} gl
   *                        > {WebGLProgram}          program
   *                        > {Float32Array} data    The stack to give to the
   *                                                 buffer.
   *                        > {object}       params  An object containing some
   *                                                 options, like width,
   *                                                 height, the camera ratio.
   * {function} initProgram The function that will initiate the program, with
   *                        the relevant shaders and parameters. It must return
   *                        the newly created program.
   *
   * Check sigma.webgl.nodes.def or sigma.webgl.nodes.fast to see how it
   * works more precisely.
   */
  sigma.utils.pkg('sigma.webgl.nodes');




  /**
   * The object "sigma.webgl.edges" contains the different WebGL edge
   * renderers. The default one draw edges as direct lines. Here are the
   * attributes any edge renderer must have:
   *
   * {number}   POINTS      The number of points required to draw an edge.
   * {number}   ATTRIBUTES  The number of attributes needed to draw one point.
   * {function} addEdge     A function that adds an edge to the data stack that
   *                        will be given to the buffer. Here is the arguments:
   *                        > {object}       edge
   *                        > {object}       source
   *                        > {object}       target
   *                        > {Float32Array} data    The stack.
   *                        > {object}       options Some options.
   * {function} render      The function that will effectively render the edges
   *                        into the buffer.
   *                        > {WebGLRenderingContext} gl
   *                        > {WebGLProgram}          program
   *                        > {Float32Array} data    The stack to give to the
   *                                                 buffer.
   *                        > {object}       params  An object containing some
   *                                                 options, like width,
   *                                                 height, the camera ratio.
   * {function} initProgram The function that will initiate the program, with
   *                        the relevant shaders and parameters. It must return
   *                        the newly created program.
   *
   * Check sigma.webgl.edges.def or sigma.webgl.edges.fast to see how it
   * works more precisely.
   */
  sigma.utils.pkg('sigma.webgl.edges');




  /**
   * The object "sigma.canvas.labels" contains the different
   * label renderers for the WebGL renderer. Since displaying texts in WebGL is
   * definitely painful and since there a way less labels to display than nodes
   * or edges, the default renderer simply renders them in a canvas.
   *
   * A labels renderer is a simple function, taking as arguments the related
   * node, the renderer and a settings function.
   */
  sigma.utils.pkg('sigma.canvas.labels');
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  if (typeof conrad === 'undefined')
    throw 'conrad is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.renderers');

  /**
   * This function is the constructor of the svg sigma's renderer.
   *
   * @param  {sigma.classes.graph}            graph    The graph to render.
   * @param  {sigma.classes.camera}           camera   The camera.
   * @param  {configurable}           settings The sigma instance settings
   *                                           function.
   * @param  {object}                 object   The options object.
   * @return {sigma.renderers.svg}             The renderer instance.
   */
  sigma.renderers.svg = function(graph, camera, settings, options) {
    if (typeof options !== 'object')
      throw 'sigma.renderers.svg: Wrong arguments.';

    if (!(options.container instanceof HTMLElement))
      throw 'Container not found.';

    var i,
        l,
        a,
        fn,
        self = this;

    sigma.classes.dispatcher.extend(this);

    // Initialize main attributes:
    this.graph = graph;
    this.camera = camera;
    this.domElements = {
      graph: null,
      groups: {},
      nodes: {},
      edges: {},
      labels: {},
      edgelabels: {},
      hovers: {}
    };
    this.measurementCanvas = null;
    this.options = options;
    this.container = this.options.container;
    this.settings = (
        typeof options.settings === 'object' &&
        options.settings
      ) ?
        settings.embedObjects(options.settings) :
        settings;

    // Is the renderer meant to be freestyle?
    this.settings('freeStyle', !!this.options.freeStyle);

    // SVG xmlns
    this.settings('xmlns', 'http://www.w3.org/2000/svg');

    // Indexes:
    this.nodesOnScreen = [];
    this.edgesOnScreen = [];

    // Find the prefix:
    this.options.prefix = 'renderer' + sigma.utils.id() + ':';

    // Initialize the DOM elements
    this.initDOM('svg');

    // Initialize captors:
    this.captors = [];
    a = this.options.captors || [sigma.captors.mouse, sigma.captors.touch];
    for (i = 0, l = a.length; i < l; i++) {
      fn = typeof a[i] === 'function' ? a[i] : sigma.captors[a[i]];
      this.captors.push(
        new fn(
          this.domElements.graph,
          this.camera,
          this.settings
        )
      );
    }

    // Bind resize:
    window.addEventListener('resize', function() {
      self.resize();
    });

    // Deal with sigma events:
    // TODO: keep an option to override the DOM events?
    sigma.misc.bindDOMEvents.call(this, this.domElements.graph);
    this.bindHovers(this.options.prefix);

    // Resize
    this.resize(false);
  };

  /**
   * This method renders the graph on the svg scene.
   *
   * @param  {?object}                options Eventually an object of options.
   * @return {sigma.renderers.svg}            Returns the instance itself.
   */
  sigma.renderers.svg.prototype.render = function(options) {
    options = options || {};

    this.dispatchEvent('beforeRender');

    var a,
        i,
        k,
        e,
        l,
        o,
        source,
        target,
        start,
        edges,
        renderers,
        subrenderers,
        index = {},
        graph = this.graph,
        nodes = this.graph.nodes,
        prefix = this.options.prefix || '',
        drawEdges = this.settings(options, 'drawEdges'),
        drawNodes = this.settings(options, 'drawNodes'),
        drawLabels = this.settings(options, 'drawLabels'),
        drawEdgeLabels = this.settings(options, 'drawEdgeLabels'),
        defaultEdgeType = this.settings(options, 'defaultEdgeType'),
        embedSettings = this.settings.embedObjects(options, {
          prefix: this.options.prefix,
          forceLabels: this.options.forceLabels
        });

    // Check the 'hideEdgesOnMove' setting:
    if (this.settings(options, 'hideEdgesOnMove'))
      if (this.camera.isAnimated || this.camera.isMoving)
        drawEdges = false;

    // Apply the camera's view:
    this.camera.applyView(
      undefined,
      this.options.prefix,
      {
        width: this.width,
        height: this.height
      }
    );

    // Hiding everything
    // TODO: find a more sensible way to perform this operation
    this.hideDOMElements(this.domElements.nodes);
    this.hideDOMElements(this.domElements.edges);
    this.hideDOMElements(this.domElements.labels);
    this.hideDOMElements(this.domElements.edgelabels);

    // Find which nodes are on screen
    this.edgesOnScreen = [];
    this.nodesOnScreen = this.camera.quadtree.area(
      this.camera.getRectangle(this.width, this.height)
    );

    // Node index
    for (a = this.nodesOnScreen, i = 0, l = a.length; i < l; i++)
      index[a[i].id] = a[i];

    // Find which edges are on screen
    for (a = graph.edges(), i = 0, l = a.length; i < l; i++) {
      o = a[i];
      if (
        (index[o.source] || index[o.target]) &&
        (!o.hidden && !nodes(o.source).hidden && !nodes(o.target).hidden)
      )
        this.edgesOnScreen.push(o);
    }

    // Display nodes
    //---------------
    renderers = sigma.svg.nodes;
    subrenderers = sigma.svg.labels;

    //-- First we create the nodes which are not already created
    if (drawNodes)
      for (a = this.nodesOnScreen, i = 0, l = a.length; i < l; i++) {
        if (!a[i].hidden && !this.domElements.nodes[a[i].id]) {

          // Node
          e = (renderers[a[i].type] || renderers.def).create(
            a[i],
            embedSettings
          );

          this.domElements.nodes[a[i].id] = e;
          this.domElements.groups.nodes.appendChild(e);

          // Label
          if (drawLabels) {
            e = (subrenderers[a[i].type] || subrenderers.def).create(
              a[i],
              embedSettings
            );

            this.domElements.labels[a[i].id] = e;
            this.domElements.groups.labels.appendChild(e);
          }
        }
      }

    //-- Second we update the nodes
    if (drawNodes)
      for (a = this.nodesOnScreen, i = 0, l = a.length; i < l; i++) {

        if (a[i].hidden)
          continue;

        // Node
        (renderers[a[i].type] || renderers.def).update(
          a[i],
          this.domElements.nodes[a[i].id],
          embedSettings
        );

        // Label
        if (drawLabels) {
          (subrenderers[a[i].type] || subrenderers.def).update(
            a[i],
            this.domElements.labels[a[i].id],
            embedSettings
          );
        }
      }

    // Display edges
    //---------------
    renderers = sigma.svg.edges;
    subrenderers = sigma.svg.edges.labels;

    //-- First we create the edges which are not already created
    if (drawEdges)
      for (a = this.edgesOnScreen, i = 0, l = a.length; i < l; i++) {
        if (!this.domElements.edges[a[i].id]) {
          source = nodes(a[i].source);
          target = nodes(a[i].target);

          e = (renderers[a[i].type] ||
            renderers[defaultEdgeType] ||
            renderers.def
          ).create(
            a[i],
            source,
            target,
            embedSettings
          );

          this.domElements.edges[a[i].id] = e;
          this.domElements.groups.edges.appendChild(e);

          // Label
          if (drawEdgeLabels) {

            e = (subrenderers[a[i].type] ||
              subrenderers[defaultEdgeType]  ||
              subrenderers.def
            ).create(
              a[i],
              embedSettings
            );
            this.domElements.edgelabels[a[i].id] = e;
            this.domElements.groups.edgelabels.appendChild(e);
          }
        }
       }

    //-- Second we update the edges
    if (drawEdges)
      for (a = this.edgesOnScreen, i = 0, l = a.length; i < l; i++) {
        source = nodes(a[i].source);
        target = nodes(a[i].target);

        (renderers[a[i].type] ||
          renderers[defaultEdgeType] ||
          renderers.def
        ).update(
          a[i],
          this.domElements.edges[a[i].id],
          source,
          target,
          embedSettings
        );

        // Label
        if (drawEdgeLabels) {
          (subrenderers[a[i].type] ||
            subrenderers[defaultEdgeType] ||
            subrenderers.def
          ).update(
            a[i],
            source,
            target,
            this.domElements.edgelabels[a[i].id],
            embedSettings
          );
        }
       }

    this.dispatchEvent('render');

    return this;
  };

  /**
   * This method creates a DOM element of the specified type, switches its
   * position to "absolute", references it to the domElements attribute, and
   * finally appends it to the container.
   *
   * @param  {string} tag The label tag.
   * @param  {string} id  The id of the element (to store it in "domElements").
   */
  sigma.renderers.svg.prototype.initDOM = function(tag) {
    var dom = document.createElementNS(this.settings('xmlns'), tag),
        c = this.settings('classPrefix'),
        g,
        l,
        i;

    dom.style.position = 'absolute';
    dom.setAttribute('class', c + '-svg');

    // Setting SVG namespace
    dom.setAttribute('xmlns', this.settings('xmlns'));
    dom.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    dom.setAttribute('version', '1.1');

    // Creating the measurement canvas
    var canvas = document.createElement('canvas');
    canvas.setAttribute('class', c + '-measurement-canvas');

    // Appending elements
    this.domElements.graph = this.container.appendChild(dom);

    // Creating groups
    var groups = ['edges', 'nodes', 'edgelabels', 'labels', 'hovers'];
    for (i = 0, l = groups.length; i < l; i++) {
      g = document.createElementNS(this.settings('xmlns'), 'g');

      g.setAttributeNS(null, 'id', c + '-group-' + groups[i]);
      g.setAttributeNS(null, 'class', c + '-group');

      this.domElements.groups[groups[i]] =
        this.domElements.graph.appendChild(g);
    }

    // Appending measurement canvas
    this.container.appendChild(canvas);
    this.measurementCanvas = canvas.getContext('2d');
  };

  /**
   * This method hides a batch of SVG DOM elements.
   *
   * @param  {array}                  elements  An array of elements to hide.
   * @param  {object}                 renderer  The renderer to use.
   * @return {sigma.renderers.svg}              Returns the instance itself.
   */
  sigma.renderers.svg.prototype.hideDOMElements = function(elements) {
    var o,
        i;

    for (i in elements) {
      o = elements[i];
      sigma.svg.utils.hide(o);
    }

    return this;
  };

  /**
   * This method binds the hover events to the renderer.
   *
   * @param  {string} prefix The renderer prefix.
   */
  // TODO: add option about whether to display hovers or not
  sigma.renderers.svg.prototype.bindHovers = function(prefix) {
    var renderers = sigma.svg.hovers,
        self = this,
        hoveredNode;

    function updateHovers(e) {
      var node,
          embedSettings = self.settings.embedObjects({
            prefix: prefix
          });

      if (!embedSettings('enableHovering'))
        return;

      if (e.data.enter.nodes.length > 0) { // over
        node = e.data.enter.nodes[0];
        var hover = (renderers[node.type] || renderers.def).create(
          node,
          self.domElements.nodes[node.id],
          self.measurementCanvas,
          embedSettings
        );

        self.domElements.hovers[node.id] = hover;

        // Inserting the hover in the dom
        self.domElements.groups.hovers.appendChild(hover);
        hoveredNode = node;
      } else if (e.data.leave.nodes.length > 0) { // out
        node = e.data.leave.nodes[0];

        // Deleting element
        self.domElements.groups.hovers.removeChild(
          self.domElements.hovers[node.id]
        );
        hoveredNode = null;
        delete self.domElements.hovers[node.id];

        // Reinstate
        self.domElements.groups.nodes.appendChild(
          self.domElements.nodes[node.id]
        );
      }
    }

    // OPTIMIZE: perform a real update rather than a deletion
    function update() {
      if (!hoveredNode)
        return;

      var embedSettings = self.settings.embedObjects({
            prefix: prefix
          });

      // Deleting element before update
      self.domElements.groups.hovers.removeChild(
        self.domElements.hovers[hoveredNode.id]
      );
      delete self.domElements.hovers[hoveredNode.id];

      var hover = (renderers[hoveredNode.type] || renderers.def).create(
        hoveredNode,
        self.domElements.nodes[hoveredNode.id],
        self.measurementCanvas,
        embedSettings
      );

      self.domElements.hovers[hoveredNode.id] = hover;

      // Inserting the hover in the dom
      self.domElements.groups.hovers.appendChild(hover);
    }

    // Binding events
    this.bind('hovers', updateHovers);

    // Update on render
    this.bind('render', update);
  };

  /**
   * This method resizes each DOM elements in the container and stores the new
   * dimensions. Then, it renders the graph.
   *
   * @param  {?number}                width  The new width of the container.
   * @param  {?number}                height The new height of the container.
   * @return {sigma.renderers.svg}           Returns the instance itself.
   */
  sigma.renderers.svg.prototype.resize = function(w, h) {
    var oldWidth = this.width,
        oldHeight = this.height;

    if (w !== undefined && h !== undefined) {
      this.width = w;
      this.height = h;
    } else {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
    }

    if (oldWidth !== this.width || oldHeight !== this.height) {
      this.domElements.graph.style.width = this.width + 'px';
      this.domElements.graph.style.height = this.height + 'px';
    }

    return this;
  };

  /**
   * The labels, nodes and edges renderers are stored in the three following
   * objects. When an element is drawn, its type will be checked and if a
   * renderer with the same name exists, it will be used. If not found, the
   * default renderer will be used instead.
   *
   * They are stored in different files, in the "./svg" folder.
   */
  sigma.utils.pkg('sigma.svg.nodes');
  sigma.utils.pkg('sigma.svg.edges');
  sigma.utils.pkg('sigma.svg.labels');
  sigma.utils.pkg('sigma.svg.edgelabels');
}).call(this);

;(function(global) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.renderers');

  // Copy the good renderer:
  sigma.renderers.def = sigma.utils.isWebGLSupported() ?
    sigma.renderers.webgl :
    sigma.renderers.canvas;
})(this);

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.webgl.nodes');

  /**
   * This node renderer will display nodes as discs, shaped in triangles with
   * the gl.TRIANGLES display mode. So, to be more precise, to draw one node,
   * it will store three times the center of node, with the color and the size,
   * and an angle indicating which "corner" of the triangle to draw.
   *
   * The fragment shader does not deal with anti-aliasing, so make sure that
   * you deal with it somewhere else in the code (by default, the WebGL
   * renderer will oversample the rendering through the webglOversamplingRatio
   * value).
   */
  sigma.webgl.nodes.def = {
    POINTS: 3,
    ATTRIBUTES: 5,
    addNode: function(node, data, i, prefix, settings) {
      var color = sigma.utils.floatColor(
        node.color || settings('defaultNodeColor')
      );

      data[i++] = node[prefix + 'x'];
      data[i++] = node[prefix + 'y'];
      data[i++] = node[prefix + 'size'];
      data[i++] = color;
      data[i++] = 0;

      data[i++] = node[prefix + 'x'];
      data[i++] = node[prefix + 'y'];
      data[i++] = node[prefix + 'size'];
      data[i++] = color;
      data[i++] = 2 * Math.PI / 3;

      data[i++] = node[prefix + 'x'];
      data[i++] = node[prefix + 'y'];
      data[i++] = node[prefix + 'size'];
      data[i++] = color;
      data[i++] = 4 * Math.PI / 3;
    },
    render: function(gl, program, data, params) {
      var buffer;

      // Define attributes:
      var positionLocation =
            gl.getAttribLocation(program, 'a_position'),
          sizeLocation =
            gl.getAttribLocation(program, 'a_size'),
          colorLocation =
            gl.getAttribLocation(program, 'a_color'),
          angleLocation =
            gl.getAttribLocation(program, 'a_angle'),
          resolutionLocation =
            gl.getUniformLocation(program, 'u_resolution'),
          matrixLocation =
            gl.getUniformLocation(program, 'u_matrix'),
          ratioLocation =
            gl.getUniformLocation(program, 'u_ratio'),
          scaleLocation =
            gl.getUniformLocation(program, 'u_scale');

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

      gl.uniform2f(resolutionLocation, params.width, params.height);
      gl.uniform1f(
        ratioLocation,
        1 / Math.pow(params.ratio, params.settings('nodesPowRatio'))
      );
      gl.uniform1f(scaleLocation, params.scalingRatio);
      gl.uniformMatrix3fv(matrixLocation, false, params.matrix);

      gl.enableVertexAttribArray(positionLocation);
      gl.enableVertexAttribArray(sizeLocation);
      gl.enableVertexAttribArray(colorLocation);
      gl.enableVertexAttribArray(angleLocation);

      gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.vertexAttribPointer(
        sizeLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        8
      );
      gl.vertexAttribPointer(
        colorLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        12
      );
      gl.vertexAttribPointer(
        angleLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        16
      );

      gl.drawArrays(
        gl.TRIANGLES,
        params.start || 0,
        params.count || (data.length / this.ATTRIBUTES)
      );
    },
    initProgram: function(gl) {
      var vertexShader,
          fragmentShader,
          program;

      vertexShader = sigma.utils.loadShader(
        gl,
        [
          'attribute vec2 a_position;',
          'attribute float a_size;',
          'attribute float a_color;',
          'attribute float a_angle;',

          'uniform vec2 u_resolution;',
          'uniform float u_ratio;',
          'uniform float u_scale;',
          'uniform mat3 u_matrix;',

          'varying vec4 color;',
          'varying vec2 center;',
          'varying float radius;',

          'void main() {',
            // Multiply the point size twice:
            'radius = a_size * u_ratio;',

            // Scale from [[-1 1] [-1 1]] to the container:
            'vec2 position = (u_matrix * vec3(a_position, 1)).xy;',
            // 'center = (position / u_resolution * 2.0 - 1.0) * vec2(1, -1);',
            'center = position * u_scale;',
            'center = vec2(center.x, u_scale * u_resolution.y - center.y);',

            'position = position +',
              '2.0 * radius * vec2(cos(a_angle), sin(a_angle));',
            'position = (position / u_resolution * 2.0 - 1.0) * vec2(1, -1);',

            'radius = radius * u_scale;',

            'gl_Position = vec4(position, 0, 1);',

            // Extract the color:
            'float c = a_color;',
            'color.b = mod(c, 256.0); c = floor(c / 256.0);',
            'color.g = mod(c, 256.0); c = floor(c / 256.0);',
            'color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;',
            'color.a = 1.0;',
          '}'
        ].join('\n'),
        gl.VERTEX_SHADER
      );

      fragmentShader = sigma.utils.loadShader(
        gl,
        [
          'precision mediump float;',

          'varying vec4 color;',
          'varying vec2 center;',
          'varying float radius;',

          'void main(void) {',
            'vec4 color0 = vec4(0.0, 0.0, 0.0, 0.0);',

            'vec2 m = gl_FragCoord.xy - center;',
            'float diff = radius - sqrt(m.x * m.x + m.y * m.y);',

            // Here is how we draw a disc instead of a square:
            'if (diff > 0.0)',
              'gl_FragColor = color;',
            'else',
              'gl_FragColor = color0;',
          '}'
        ].join('\n'),
        gl.FRAGMENT_SHADER
      );

      program = sigma.utils.loadProgram(gl, [vertexShader, fragmentShader]);

      return program;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.webgl.nodes');

  /**
   * This node renderer will display nodes in the fastest way: Nodes are basic
   * squares, drawn through the gl.POINTS drawing method. The size of the nodes
   * are represented with the "gl_PointSize" value in the vertex shader.
   *
   * It is the fastest node renderer here since the buffer just takes one line
   * to draw each node (with attributes "x", "y", "size" and "color").
   *
   * Nevertheless, this method has some problems, especially due to some issues
   * with the gl.POINTS:
   *  - First, if the center of a node is outside the scene, the point will not
   *    be drawn, even if it should be partly on screen.
   *  - I tried applying a fragment shader similar to the one in the default
   *    node renderer to display them as discs, but it did not work fine on
   *    some computers settings, filling the discs with weird gradients not
   *    depending on the actual color.
   */
  sigma.webgl.nodes.fast = {
    POINTS: 1,
    ATTRIBUTES: 4,
    addNode: function(node, data, i, prefix, settings) {
      data[i++] = node[prefix + 'x'];
      data[i++] = node[prefix + 'y'];
      data[i++] = node[prefix + 'size'];
      data[i++] = sigma.utils.floatColor(
        node.color || settings('defaultNodeColor')
      );
    },
    render: function(gl, program, data, params) {
      var buffer;

      // Define attributes:
      var positionLocation =
            gl.getAttribLocation(program, 'a_position'),
          sizeLocation =
            gl.getAttribLocation(program, 'a_size'),
          colorLocation =
            gl.getAttribLocation(program, 'a_color'),
          resolutionLocation =
            gl.getUniformLocation(program, 'u_resolution'),
          matrixLocation =
            gl.getUniformLocation(program, 'u_matrix'),
          ratioLocation =
            gl.getUniformLocation(program, 'u_ratio'),
          scaleLocation =
            gl.getUniformLocation(program, 'u_scale');

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

      gl.uniform2f(resolutionLocation, params.width, params.height);
      gl.uniform1f(
        ratioLocation,
        1 / Math.pow(params.ratio, params.settings('nodesPowRatio'))
      );
      gl.uniform1f(scaleLocation, params.scalingRatio);
      gl.uniformMatrix3fv(matrixLocation, false, params.matrix);

      gl.enableVertexAttribArray(positionLocation);
      gl.enableVertexAttribArray(sizeLocation);
      gl.enableVertexAttribArray(colorLocation);

      gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.vertexAttribPointer(
        sizeLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        8
      );
      gl.vertexAttribPointer(
        colorLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        12
      );

      gl.drawArrays(
        gl.POINTS,
        params.start || 0,
        params.count || (data.length / this.ATTRIBUTES)
      );
    },
    initProgram: function(gl) {
      var vertexShader,
          fragmentShader,
          program;

      vertexShader = sigma.utils.loadShader(
        gl,
        [
          'attribute vec2 a_position;',
          'attribute float a_size;',
          'attribute float a_color;',

          'uniform vec2 u_resolution;',
          'uniform float u_ratio;',
          'uniform float u_scale;',
          'uniform mat3 u_matrix;',

          'varying vec4 color;',

          'void main() {',
            // Scale from [[-1 1] [-1 1]] to the container:
            'gl_Position = vec4(',
              '((u_matrix * vec3(a_position, 1)).xy /',
                'u_resolution * 2.0 - 1.0) * vec2(1, -1),',
              '0,',
              '1',
            ');',

            // Multiply the point size twice:
            //  - x SCALING_RATIO to correct the canvas scaling
            //  - x 2 to correct the formulae
            'gl_PointSize = a_size * u_ratio * u_scale * 2.0;',

            // Extract the color:
            'float c = a_color;',
            'color.b = mod(c, 256.0); c = floor(c / 256.0);',
            'color.g = mod(c, 256.0); c = floor(c / 256.0);',
            'color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;',
            'color.a = 1.0;',
          '}'
        ].join('\n'),
        gl.VERTEX_SHADER
      );

      fragmentShader = sigma.utils.loadShader(
        gl,
        [
          'precision mediump float;',

          'varying vec4 color;',

          'void main(void) {',
            'float border = 0.01;',
            'float radius = 0.5;',

            'vec4 color0 = vec4(0.0, 0.0, 0.0, 0.0);',
            'vec2 m = gl_PointCoord - vec2(0.5, 0.5);',
            'float dist = radius - sqrt(m.x * m.x + m.y * m.y);',

            'float t = 0.0;',
            'if (dist > border)',
              't = 1.0;',
            'else if (dist > 0.0)',
              't = dist / border;',

            'gl_FragColor = mix(color0, color, t);',
          '}'
        ].join('\n'),
        gl.FRAGMENT_SHADER
      );

      program = sigma.utils.loadProgram(gl, [vertexShader, fragmentShader]);

      return program;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.webgl.edges');

  /**
   * This edge renderer will display edges as lines going from the source node
   * to the target node. To deal with edge thicknesses, the lines are made of
   * two triangles forming rectangles, with the gl.TRIANGLES drawing mode.
   *
   * It is expensive, since drawing a single edge requires 6 points, each
   * having 7 attributes (source position, target position, thickness, color
   * and a flag indicating which vertice of the rectangle it is).
   */
  sigma.webgl.edges.def = {
    POINTS: 6,
    ATTRIBUTES: 7,
    addEdge: function(edge, source, target, data, i, prefix, settings) {
      var w = (edge[prefix + 'size'] || 1) / 2,
          x1 = source[prefix + 'x'],
          y1 = source[prefix + 'y'],
          x2 = target[prefix + 'x'],
          y2 = target[prefix + 'y'],
          color = edge.color;

      if (!color)
        switch (settings('edgeColor')) {
          case 'source':
            color = source.color || settings('defaultNodeColor');
            break;
          case 'target':
            color = target.color || settings('defaultNodeColor');
            break;
          default:
            color = settings('defaultEdgeColor');
            break;
        }

      // Normalize color:
      color = sigma.utils.floatColor(color);

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = 1.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = 1.0;
      data[i++] = color;

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = 0.0;
      data[i++] = color;
    },
    render: function(gl, program, data, params) {
      var buffer;

      // Define attributes:
      var colorLocation =
            gl.getAttribLocation(program, 'a_color'),
          positionLocation1 =
            gl.getAttribLocation(program, 'a_position1'),
          positionLocation2 =
            gl.getAttribLocation(program, 'a_position2'),
          thicknessLocation =
            gl.getAttribLocation(program, 'a_thickness'),
          minusLocation =
            gl.getAttribLocation(program, 'a_minus'),
          resolutionLocation =
            gl.getUniformLocation(program, 'u_resolution'),
          matrixLocation =
            gl.getUniformLocation(program, 'u_matrix'),
          matrixHalfPiLocation =
            gl.getUniformLocation(program, 'u_matrixHalfPi'),
          matrixHalfPiMinusLocation =
            gl.getUniformLocation(program, 'u_matrixHalfPiMinus'),
          ratioLocation =
            gl.getUniformLocation(program, 'u_ratio'),
          scaleLocation =
            gl.getUniformLocation(program, 'u_scale');

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

      gl.uniform2f(resolutionLocation, params.width, params.height);
      gl.uniform1f(
        ratioLocation,
        params.ratio / Math.pow(params.ratio, params.settings('edgesPowRatio'))
      );
      gl.uniform1f(scaleLocation, params.scalingRatio);
      gl.uniformMatrix3fv(matrixLocation, false, params.matrix);
      gl.uniformMatrix2fv(
        matrixHalfPiLocation,
        false,
        sigma.utils.matrices.rotation(Math.PI / 2, true)
      );
      gl.uniformMatrix2fv(
        matrixHalfPiMinusLocation,
        false,
        sigma.utils.matrices.rotation(-Math.PI / 2, true)
      );

      gl.enableVertexAttribArray(colorLocation);
      gl.enableVertexAttribArray(positionLocation1);
      gl.enableVertexAttribArray(positionLocation2);
      gl.enableVertexAttribArray(thicknessLocation);
      gl.enableVertexAttribArray(minusLocation);

      gl.vertexAttribPointer(positionLocation1,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.vertexAttribPointer(positionLocation2,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        8
      );
      gl.vertexAttribPointer(thicknessLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        16
      );
      gl.vertexAttribPointer(minusLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        20
      );
      gl.vertexAttribPointer(colorLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        24
      );

      gl.drawArrays(
        gl.TRIANGLES,
        params.start || 0,
        params.count || (data.length / this.ATTRIBUTES)
      );
    },
    initProgram: function(gl) {
      var vertexShader,
          fragmentShader,
          program;

      vertexShader = sigma.utils.loadShader(
        gl,
        [
          'attribute vec2 a_position1;',
          'attribute vec2 a_position2;',
          'attribute float a_thickness;',
          'attribute float a_minus;',
          'attribute float a_color;',

          'uniform vec2 u_resolution;',
          'uniform float u_ratio;',
          'uniform float u_scale;',
          'uniform mat3 u_matrix;',
          'uniform mat2 u_matrixHalfPi;',
          'uniform mat2 u_matrixHalfPiMinus;',

          'varying vec4 color;',

          'void main() {',
            // Find the good point:
            'vec2 position = a_thickness * u_ratio *',
              'normalize(a_position2 - a_position1);',

            'mat2 matrix = a_minus * u_matrixHalfPiMinus +',
              '(1.0 - a_minus) * u_matrixHalfPi;',

            'position = matrix * position + a_position1;',

            // Scale from [[-1 1] [-1 1]] to the container:
            'gl_Position = vec4(',
              '((u_matrix * vec3(position, 1)).xy /',
                'u_resolution * 2.0 - 1.0) * vec2(1, -1),',
              '0,',
              '1',
            ');',

            // Extract the color:
            'float c = a_color;',
            'color.b = mod(c, 256.0); c = floor(c / 256.0);',
            'color.g = mod(c, 256.0); c = floor(c / 256.0);',
            'color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;',
            'color.a = 1.0;',
          '}'
        ].join('\n'),
        gl.VERTEX_SHADER
      );

      fragmentShader = sigma.utils.loadShader(
        gl,
        [
          'precision mediump float;',

          'varying vec4 color;',

          'void main(void) {',
            'gl_FragColor = color;',
          '}'
        ].join('\n'),
        gl.FRAGMENT_SHADER
      );

      program = sigma.utils.loadProgram(gl, [vertexShader, fragmentShader]);

      return program;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.webgl.edges');

  /**
   * This edge renderer will display edges as lines with the gl.LINES display
   * mode. Since this mode does not support well thickness, edges are all drawn
   * with the same thickness (3px), independantly of the edge attributes or the
   * zooming ratio.
   */
  sigma.webgl.edges.fast = {
    POINTS: 2,
    ATTRIBUTES: 3,
    addEdge: function(edge, source, target, data, i, prefix, settings) {
      var w = (edge[prefix + 'size'] || 1) / 2,
          x1 = source[prefix + 'x'],
          y1 = source[prefix + 'y'],
          x2 = target[prefix + 'x'],
          y2 = target[prefix + 'y'],
          color = edge.color;

      if (!color)
        switch (settings('edgeColor')) {
          case 'source':
            color = source.color || settings('defaultNodeColor');
            break;
          case 'target':
            color = target.color || settings('defaultNodeColor');
            break;
          default:
            color = settings('defaultEdgeColor');
            break;
        }

      // Normalize color:
      color = sigma.utils.floatColor(color);

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = color;
    },
    render: function(gl, program, data, params) {
      var buffer;

      // Define attributes:
      var colorLocation =
            gl.getAttribLocation(program, 'a_color'),
          positionLocation =
            gl.getAttribLocation(program, 'a_position'),
          resolutionLocation =
            gl.getUniformLocation(program, 'u_resolution'),
          matrixLocation =
            gl.getUniformLocation(program, 'u_matrix');

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

      gl.uniform2f(resolutionLocation, params.width, params.height);
      gl.uniformMatrix3fv(matrixLocation, false, params.matrix);

      gl.enableVertexAttribArray(positionLocation);
      gl.enableVertexAttribArray(colorLocation);

      gl.vertexAttribPointer(positionLocation,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.vertexAttribPointer(colorLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        8
      );

      gl.lineWidth(3);
      gl.drawArrays(
        gl.LINES,
        params.start || 0,
        params.count || (data.length / this.ATTRIBUTES)
      );
    },
    initProgram: function(gl) {
      var vertexShader,
          fragmentShader,
          program;

      vertexShader = sigma.utils.loadShader(
        gl,
        [
          'attribute vec2 a_position;',
          'attribute float a_color;',

          'uniform vec2 u_resolution;',
          'uniform mat3 u_matrix;',

          'varying vec4 color;',

          'void main() {',
            // Scale from [[-1 1] [-1 1]] to the container:
            'gl_Position = vec4(',
              '((u_matrix * vec3(a_position, 1)).xy /',
                'u_resolution * 2.0 - 1.0) * vec2(1, -1),',
              '0,',
              '1',
            ');',

            // Extract the color:
            'float c = a_color;',
            'color.b = mod(c, 256.0); c = floor(c / 256.0);',
            'color.g = mod(c, 256.0); c = floor(c / 256.0);',
            'color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;',
            'color.a = 1.0;',
          '}'
        ].join('\n'),
        gl.VERTEX_SHADER
      );

      fragmentShader = sigma.utils.loadShader(
        gl,
        [
          'precision mediump float;',

          'varying vec4 color;',

          'void main(void) {',
            'gl_FragColor = color;',
          '}'
        ].join('\n'),
        gl.FRAGMENT_SHADER
      );

      program = sigma.utils.loadProgram(gl, [vertexShader, fragmentShader]);

      return program;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.webgl.edges');

  /**
   * This edge renderer will display edges as arrows going from the source node
   * to the target node. To deal with edge thicknesses, the lines are made of
   * three triangles: two forming rectangles, with the gl.TRIANGLES drawing
   * mode.
   *
   * It is expensive, since drawing a single edge requires 9 points, each
   * having a lot of attributes.
   */
  sigma.webgl.edges.arrow = {
    POINTS: 9,
    ATTRIBUTES: 11,
    addEdge: function(edge, source, target, data, i, prefix, settings) {
      var w = (edge[prefix + 'size'] || 1) / 2,
          x1 = source[prefix + 'x'],
          y1 = source[prefix + 'y'],
          x2 = target[prefix + 'x'],
          y2 = target[prefix + 'y'],
          targetSize = target[prefix + 'size'],
          color = edge.color;

      if (!color)
        switch (settings('edgeColor')) {
          case 'source':
            color = source.color || settings('defaultNodeColor');
            break;
          case 'target':
            color = target.color || settings('defaultNodeColor');
            break;
          default:
            color = settings('defaultEdgeColor');
            break;
        }

      // Normalize color:
      color = sigma.utils.floatColor(color);

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 1.0;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 0.0;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = color;

      // Arrow head:
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 1.0;
      data[i++] = -1.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 1.0;
      data[i++] = 1.0;
      data[i++] = color;
    },
    render: function(gl, program, data, params) {
      var buffer;

      // Define attributes:
      var positionLocation1 =
            gl.getAttribLocation(program, 'a_pos1'),
          positionLocation2 =
            gl.getAttribLocation(program, 'a_pos2'),
          thicknessLocation =
            gl.getAttribLocation(program, 'a_thickness'),
          targetSizeLocation =
            gl.getAttribLocation(program, 'a_tSize'),
          delayLocation =
            gl.getAttribLocation(program, 'a_delay'),
          minusLocation =
            gl.getAttribLocation(program, 'a_minus'),
          headLocation =
            gl.getAttribLocation(program, 'a_head'),
          headPositionLocation =
            gl.getAttribLocation(program, 'a_headPosition'),
          colorLocation =
            gl.getAttribLocation(program, 'a_color'),
          resolutionLocation =
            gl.getUniformLocation(program, 'u_resolution'),
          matrixLocation =
            gl.getUniformLocation(program, 'u_matrix'),
          matrixHalfPiLocation =
            gl.getUniformLocation(program, 'u_matrixHalfPi'),
          matrixHalfPiMinusLocation =
            gl.getUniformLocation(program, 'u_matrixHalfPiMinus'),
          ratioLocation =
            gl.getUniformLocation(program, 'u_ratio'),
          nodeRatioLocation =
            gl.getUniformLocation(program, 'u_nodeRatio'),
          arrowHeadLocation =
            gl.getUniformLocation(program, 'u_arrowHead'),
          scaleLocation =
            gl.getUniformLocation(program, 'u_scale');

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

      gl.uniform2f(resolutionLocation, params.width, params.height);
      gl.uniform1f(
        ratioLocation,
        params.ratio / Math.pow(params.ratio, params.settings('edgesPowRatio'))
      );
      gl.uniform1f(
        nodeRatioLocation,
        Math.pow(params.ratio, params.settings('nodesPowRatio')) /
        params.ratio
      );
      gl.uniform1f(arrowHeadLocation, 5.0);
      gl.uniform1f(scaleLocation, params.scalingRatio);
      gl.uniformMatrix3fv(matrixLocation, false, params.matrix);
      gl.uniformMatrix2fv(
        matrixHalfPiLocation,
        false,
        sigma.utils.matrices.rotation(Math.PI / 2, true)
      );
      gl.uniformMatrix2fv(
        matrixHalfPiMinusLocation,
        false,
        sigma.utils.matrices.rotation(-Math.PI / 2, true)
      );

      gl.enableVertexAttribArray(positionLocation1);
      gl.enableVertexAttribArray(positionLocation2);
      gl.enableVertexAttribArray(thicknessLocation);
      gl.enableVertexAttribArray(targetSizeLocation);
      gl.enableVertexAttribArray(delayLocation);
      gl.enableVertexAttribArray(minusLocation);
      gl.enableVertexAttribArray(headLocation);
      gl.enableVertexAttribArray(headPositionLocation);
      gl.enableVertexAttribArray(colorLocation);

      gl.vertexAttribPointer(positionLocation1,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.vertexAttribPointer(positionLocation2,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        8
      );
      gl.vertexAttribPointer(thicknessLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        16
      );
      gl.vertexAttribPointer(targetSizeLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        20
      );
      gl.vertexAttribPointer(delayLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        24
      );
      gl.vertexAttribPointer(minusLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        28
      );
      gl.vertexAttribPointer(headLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        32
      );
      gl.vertexAttribPointer(headPositionLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        36
      );
      gl.vertexAttribPointer(colorLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        40
      );

      gl.drawArrays(
        gl.TRIANGLES,
        params.start || 0,
        params.count || (data.length / this.ATTRIBUTES)
      );
    },
    initProgram: function(gl) {
      var vertexShader,
          fragmentShader,
          program;

      vertexShader = sigma.utils.loadShader(
        gl,
        [
          'attribute vec2 a_pos1;',
          'attribute vec2 a_pos2;',
          'attribute float a_thickness;',
          'attribute float a_tSize;',
          'attribute float a_delay;',
          'attribute float a_minus;',
          'attribute float a_head;',
          'attribute float a_headPosition;',
          'attribute float a_color;',

          'uniform vec2 u_resolution;',
          'uniform float u_ratio;',
          'uniform float u_nodeRatio;',
          'uniform float u_arrowHead;',
          'uniform float u_scale;',
          'uniform mat3 u_matrix;',
          'uniform mat2 u_matrixHalfPi;',
          'uniform mat2 u_matrixHalfPiMinus;',

          'varying vec4 color;',

          'void main() {',
            // Find the good point:
            'vec2 pos = normalize(a_pos2 - a_pos1);',

            'mat2 matrix = (1.0 - a_head) *',
              '(',
                'a_minus * u_matrixHalfPiMinus +',
                '(1.0 - a_minus) * u_matrixHalfPi',
              ') + a_head * (',
                'a_headPosition * u_matrixHalfPiMinus * 0.6 +',
                '(a_headPosition * a_headPosition - 1.0) * mat2(1.0)',
              ');',

            'pos = a_pos1 + (',
              // Deal with body:
              '(1.0 - a_head) * a_thickness * u_ratio * matrix * pos +',
              // Deal with head:
              'a_head * u_arrowHead * a_thickness * u_ratio * matrix * pos +',
              // Deal with delay:
              'a_delay * pos * (',
                'a_tSize / u_nodeRatio +',
                'u_arrowHead * a_thickness * u_ratio',
              ')',
            ');',

            // Scale from [[-1 1] [-1 1]] to the container:
            'gl_Position = vec4(',
              '((u_matrix * vec3(pos, 1)).xy /',
                'u_resolution * 2.0 - 1.0) * vec2(1, -1),',
              '0,',
              '1',
            ');',

            // Extract the color:
            'float c = a_color;',
            'color.b = mod(c, 256.0); c = floor(c / 256.0);',
            'color.g = mod(c, 256.0); c = floor(c / 256.0);',
            'color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;',
            'color.a = 1.0;',
          '}'
        ].join('\n'),
        gl.VERTEX_SHADER
      );

      fragmentShader = sigma.utils.loadShader(
        gl,
        [
          'precision mediump float;',

          'varying vec4 color;',

          'void main(void) {',
            'gl_FragColor = color;',
          '}'
        ].join('\n'),
        gl.FRAGMENT_SHADER
      );

      program = sigma.utils.loadProgram(gl, [vertexShader, fragmentShader]);

      return program;
    }
  };
})();

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.canvas.labels');

  /**
   * This label renderer will display the label of the node
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   * @param  {object?}                  infos    The batch infos.
   */
  sigma.canvas.labels.def = function(node, context, settings, infos) {
    var fontSize,
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'] || 1,
        fontStyle = settings('fontStyle'),
        borderSize = settings('nodeBorderSize'),
        labelWidth,
        labelOffsetX,
        labelOffsetY,
        alignment = settings('labelAlignment'),
        maxLineLength = settings('maxNodeLabelLineLength') || 0;

    if (size <= settings('labelThreshold'))
      return;

    if (!node.label || typeof node.label !== 'string')
      return;

    fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
      settings('labelSizeRatio') * size;

    var new_font = (fontStyle ? fontStyle + ' ' : '') +
      fontSize + 'px ' +
      (node.active ?
        settings('activeFont') || settings('font') :
        settings('font'));

    if (infos && infos.ctx.font != new_font) { //use font value caching
      context.font = new_font;
      infos.ctx.font = new_font;
    } else {
      context.font = new_font;
    }

    context.fillStyle =
        (settings('labelColor') === 'node') ?
        node.color || settings('defaultNodeColor') :
        settings('defaultLabelColor');

    labelOffsetX = 0;
    labelOffsetY = fontSize / 3;
    context.textAlign = 'center';

    switch (alignment) {
      case 'bottom':
        labelOffsetY = + size + 4 * fontSize / 3;
        break;
      case 'center':
        break;
      case 'left':
        context.textAlign = 'right';
        labelOffsetX = - size - borderSize - 3;
        break;
      case 'top':
        labelOffsetY = - size - 2 * fontSize / 3;
        break;
      case 'inside':
        labelWidth = sigma.utils.canvas.getTextWidth(context, settings('approximateLabelWidth'), fontSize, node.label);
        if (labelWidth <= (size + fontSize / 3) * 2) {
          break;
        }
      /* falls through*/
      case 'right':
      /* falls through*/
      default:
        labelOffsetX = size + borderSize + 3;
        context.textAlign = 'left';
        break;
    }

    var lines = getLines(node.label, maxLineLength),
        baseX = node[prefix + 'x'] + labelOffsetX,
        baseY = Math.round(node[prefix + 'y'] + labelOffsetY);

    for (var i = 0; i < lines.length; ++i) {
      context.fillText(lines[i], baseX, baseY + i * (fontSize + 1));
    }
  };

  /**
   * Split a text into several lines. Each line won't be longer than the specified maximum length.
   * @param {string}  text            Text to split
   * @param {number}  maxLineLength   Maximum length of a line. A value <= 1 will be treated as "infinity".
   * @returns {Array<string>}         List of lines
   */
  function getLines(text, maxLineLength) {
    if (maxLineLength <= 1) {
      return [text];
    }

    var words = text.split(' '),
        lines = [],
        lineLength = 0,
        lineIndex = -1,
        lineList = [],
        lineFull = true;

    for (var i = 0; i < words.length; ++i) {
      if (lineFull) {
        if (words[i].length > maxLineLength) {
          var parts = splitWord(words[i], maxLineLength);
          for (var j = 0; j < parts.length; ++j) {
            lines.push([parts[j]]);
            ++lineIndex;
          }
          lineLength = parts[parts.length - 1].length;
        } else {
          lines.push([words[i]
          ]);
          ++lineIndex;
          lineLength = words[i].length + 1;
        }
        lineFull = false;
      } else if (lineLength + words[i].length <= maxLineLength) {
        lines[lineIndex].push(words[i]);
        lineLength += words[i].length + 1;
      } else {
        lineFull = true;
        --i;
      }
    }

    for (i = 0; i < lines.length; ++i) {
      lineList.push(lines[i].join(' '))
    }

    return lineList;
  }

  /**
   * Split a word into several lines (with a '-' at the end of each line but the last).
   * @param {string} word       Word to split
   * @param {number} maxLength  Maximum length of a line
   * @returns {Array<string>}   List of lines
   */
  function splitWord(word, maxLength) {
    var parts = [];

    for (var i = 0; i < word.length; i += maxLength - 1) {
      parts.push(word.substr(i, maxLength - 1) + '-');
    }

    var lastPartLen = parts[parts.length - 1].length;
    parts[parts.length - 1] = parts[parts.length - 1].substr(0, lastPartLen - 1) + ' ';

    return parts;
  }
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.canvas.hovers');

  /**
   * This hover renderer will basically display the label with a background.
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   */
  sigma.canvas.hovers.def = function(node, context, settings) {
    var x,
        y,
        w,
        h,
        e,
        labelX,
        labelY,
        lines,
        baseX,
        baseY,
        borderSize = settings('nodeBorderSize'),
        alignment = settings('labelAlignment'),
        fontStyle = settings('hoverFontStyle') || settings('fontStyle'),
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'],
        maxLineLength = settings('maxNodeLabelLineLength') || 0,
        fontSize = (settings('labelSize') === 'fixed') ?
          settings('defaultLabelSize') :
          settings('labelSizeRatio') * size;


    // Label background:
    context.font = (fontStyle ? fontStyle + ' ' : '') +
      fontSize + 'px ' + (settings('hoverFont') || settings('font'));

    context.beginPath();
    context.fillStyle = settings('labelHoverBGColor') === 'node' ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultHoverLabelBGColor');

    if (settings('labelHoverShadow')) {
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 8;
      context.shadowColor = settings('labelHoverShadowColor');
    }

    lines = getLines(node.label, maxLineLength);
    drawHoverBorder(alignment, context, fontSize, node, lines, maxLineLength);

    // Node border:
    if (borderSize > 0) {
      context.beginPath();
      context.fillStyle = settings('nodeBorderColor') === 'node' ?
        (node.color || settings('defaultNodeColor')) :
        settings('defaultNodeBorderColor');
      context.arc(
        node[prefix + 'x'],
        node[prefix + 'y'],
        size + borderSize,
        0,
        Math.PI * 2,
        true
      );
      context.closePath();
      context.fill();
    }

    // Node:
    var nodeRenderer = sigma.canvas.nodes[node.type] || sigma.canvas.nodes.def;
    nodeRenderer(node, context, settings);

    // Display the label:
    if (node.label && typeof node.label === 'string') {
      context.fillStyle = (settings('labelHoverColor') === 'node') ?
        (node.color || settings('defaultNodeColor')) :
        settings('defaultLabelHoverColor');
      var labelWidth = sigma.utils.canvas.getTextWidth(context,
            settings('approximateLabelWidth'), fontSize, node.label),
          labelOffsetX = - labelWidth / 2,
          labelOffsetY = fontSize / 3;

      switch (alignment) {
        case 'bottom':
          labelOffsetY = + size + 4 * fontSize / 3;
          break;
        case 'center':
          break;
        case 'left':
          labelOffsetX = - size - borderSize - 3 - labelWidth;
          break;
        case 'top':
          labelOffsetY = - size - 2 * fontSize / 3;
          break;
        case 'inside':
          if (labelWidth <= (size + fontSize / 3) * 2) {
            break;
          }
        /* falls through*/
        case 'right':
        /* falls through*/
        default:
          labelOffsetX = size + borderSize + 3;
          break;
      }

      baseX = node[prefix + 'x'] + labelOffsetX;
      baseY = Math.round(node[prefix + 'y'] + labelOffsetY);

      for (var i = 0; i < lines.length; ++i) {
        context.fillText(lines[i], baseX, baseY + i * (fontSize + 1));
      }
    }

    function drawHoverBorder(alignment, context, fontSize, node, lines, maxLineLength) {
      var labelWidth =
        (maxLineLength > 1 && lines.length > 1) ?
        0.6 * maxLineLength * fontSize :
        sigma.utils.canvas.getTextWidth(
          context,
          settings('approximateLabelWidth'),
          fontSize,
          lines[0]
        );

      var x = Math.round(node[prefix + 'x']),
          y = Math.round(node[prefix + 'y']),
          h = ((fontSize + 1) * lines.length) + 4,
          e = Math.round(size + fontSize / 4),
          w = Math.round(labelWidth + size + 1.5 + fontSize / 3);

      if (node.label && typeof node.label === 'string') {
        // draw a rectangle for the label
        switch (alignment) {
          case 'center':
            break;
          case 'left':
            x = Math.round(node[prefix + 'x'] + fontSize / 2 + 2);
            y = Math.round(node[prefix + 'y'] - fontSize / 2 - 2);

            context.moveTo(x, y + e);
            context.arcTo(x, y, x - e, y, e);
            context.lineTo(x - w - borderSize - e, y);
            context.lineTo(x - w - borderSize - e, y + h);
            context.lineTo(x - e, y + h);
            context.arcTo(x, y + h, x, y + h - e, e);
            context.lineTo(x, y + e);
            break;
          case 'top':
            context.rect(x - w / 2, y - e - h, w, h);
            break;
          case 'bottom':
            context.rect(x - w / 2, y + e, w, h);
            break;
          case 'inside':
            if (labelWidth <= e * 2) {
              // don't draw anything
              break;
            }
            // use default setting, falling through
          /* falls through*/
          case 'right':
          /* falls through*/
          default:
            x = Math.round(node[prefix + 'x'] - fontSize / 2 - 2);
            y = Math.round(node[prefix + 'y'] - fontSize / 2 - 2);

            context.moveTo(x, y + e);
            context.arcTo(x, y, x + e, y, e);
            context.lineTo(x + w + borderSize + e, y);
            context.lineTo(x + w + borderSize + e, y + h);
            context.lineTo(x + e, y + h);
            context.arcTo(x, y + h, x, y + h - e, e);
            context.lineTo(x, y + e);
            break;
        }
      }

      context.closePath();
      context.fill();

      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 0;
    }

    /**
     * Split a text into several lines. Each line won't be longer than the specified maximum length.
     * @param {string}  text            Text to split
     * @param {number}  maxLineLength   Maximum length of a line. A value <= 1 will be treated as "infinity".
     * @returns {Array<string>}         List of lines
     */
    function getLines(text, maxLineLength) {
      if (maxLineLength <= 1) {
        return [text];
      }

      var words = text.split(' '),
        lines = [],
        lineLength = 0,
        lineIndex = -1,
        lineList = [],
        lineFull = true;

      for (var i = 0; i < words.length; ++i) {
        if (lineFull) {
          if (words[i].length > maxLineLength) {
            var parts = splitWord(words[i], maxLineLength);
            for (var j = 0; j < parts.length; ++j) {
              lines.push([parts[j]]);
              ++lineIndex;
            }
            lineLength = parts[parts.length - 1].length;
          } else {
            lines.push([words[i]
            ]);
            ++lineIndex;
            lineLength = words[i].length + 1;
          }
          lineFull = false;
        } else if (lineLength + words[i].length <= maxLineLength) {
          lines[lineIndex].push(words[i]);
          lineLength += words[i].length + 1;
        } else {
          lineFull = true;
          --i;
        }
      }

      for (i = 0; i < lines.length; ++i) {
        lineList.push(lines[i].join(' '))
      }

      return lineList;
    }

    /**
     * Split a word into several lines (with a '-' at the end of each line but the last).
     * @param {string} word       Word to split
     * @param {number} maxLength  Maximum length of a line
     * @returns {Array<string>}   List of lines
     */
    function splitWord(word, maxLength) {
      var parts = [];

      for (var i = 0; i < word.length; i += maxLength - 1) {
        parts.push(word.substr(i, maxLength - 1) + '-');
      }

      var lastPartLen = parts[parts.length - 1].length;
      parts[parts.length - 1] = parts[parts.length - 1].substr(0, lastPartLen - 1) + ' ';

      return parts;
    }
  };
}).call(this);

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.nodes');

  /**
   * The default node renderer. It renders the node as a simple disc.
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   */
  sigma.canvas.nodes.def = function(node, context, settings) {
    var prefix = settings('prefix') || '';

    context.fillStyle = node.color || settings('defaultNodeColor');
    context.beginPath();
    context.arc(
      node[prefix + 'x'],
      node[prefix + 'y'],
      node[prefix + 'size'],
      0,
      Math.PI * 2,
      true
    );

    context.closePath();
    context.fill();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edges');

  /**
   * The default edge renderer. It renders the edge as a simple line.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edges.def = function(edge, source, target, context, settings) {
    var color = edge.color,
        prefix = settings('prefix') || '',
        size = edge[prefix + 'size'] || 1,
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor');

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(
      source[prefix + 'x'],
      source[prefix + 'y']
    );
    context.lineTo(
      target[prefix + 'x'],
      target[prefix + 'y']
    );
    context.stroke();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edges');

  /**
   * This edge renderer will display edges as curves.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edges.curve = function(edge, source, target, context, settings) {
    var color = edge.color,
        prefix = settings('prefix') || '',
        size = edge[prefix + 'size'] || 1,
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor'),
        cp = {},
        sSize = source[prefix + 'size'],
        sX = source[prefix + 'x'],
        sY = source[prefix + 'y'],
        tX = target[prefix + 'x'],
        tY = target[prefix + 'y'];

    cp = (source.id === target.id) ?
      sigma.utils.getSelfLoopControlPoints(sX, sY, sSize) :
      sigma.utils.getQuadraticControlPoint(sX, sY, tX, tY, edge.cc);

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(sX, sY);
    if (source.id === target.id) {
      context.bezierCurveTo(cp.x1, cp.y1, cp.x2, cp.y2, tX, tY);
    } else {
      context.quadraticCurveTo(cp.x, cp.y, tX, tY);
    }
    context.stroke();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edges');

  /**
   * This edge renderer will display edges as arrows going from the source node
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edges.arrow = function(edge, source, target, context, settings) {
    var color = edge.color,
        prefix = settings('prefix') || '',
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor'),
        size = edge[prefix + 'size'] || 1,
        tSize = target[prefix + 'size'],
        sX = source[prefix + 'x'],
        sY = source[prefix + 'y'],
        tX = target[prefix + 'x'],
        tY = target[prefix + 'y'],
        aSize = Math.max(size * 2.5, settings('minArrowSize')),
        d = Math.sqrt((tX - sX) * (tX - sX) + (tY - sY) * (tY - sY)),
        aX = sX + (tX - sX) * (d - aSize - tSize) / d,
        aY = sY + (tY - sY) * (d - aSize - tSize) / d,
        vX = (tX - sX) * aSize / d,
        vY = (tY - sY) * aSize / d;

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(sX, sY);
    context.lineTo(
      aX,
      aY
    );
    context.stroke();

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(aX + vX, aY + vY);
    context.lineTo(aX + vY * 0.6, aY - vX * 0.6);
    context.lineTo(aX - vY * 0.6, aY + vX * 0.6);
    context.lineTo(aX + vX, aY + vY);
    context.closePath();
    context.fill();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edges');

  /**
   * This edge renderer will display edges as curves with arrow heading.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edges.curvedArrow =
    function(edge, source, target, context, settings) {
    var color = edge.color,
        prefix = settings('prefix') || '',
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor'),
        cp = {},
        size = edge[prefix + 'size'] || 1,
        tSize = target[prefix + 'size'],
        sX = source[prefix + 'x'],
        sY = source[prefix + 'y'],
        tX = target[prefix + 'x'],
        tY = target[prefix + 'y'],
        aSize = Math.max(size * 2.5, settings('minArrowSize')),
        d,
        aX,
        aY,
        vX,
        vY;

    cp = (source.id === target.id) ?
      sigma.utils.getSelfLoopControlPoints(sX, sY, tSize) :
      sigma.utils.getQuadraticControlPoint(sX, sY, tX, tY, edge.cc);

    if (source.id === target.id) {
      d = Math.sqrt((tX - cp.x1) * (tX - cp.x1) + (tY - cp.y1) * (tY - cp.y1));
      aX = cp.x1 + (tX - cp.x1) * (d - aSize - tSize) / d;
      aY = cp.y1 + (tY - cp.y1) * (d - aSize - tSize) / d;
      vX = (tX - cp.x1) * aSize / d;
      vY = (tY - cp.y1) * aSize / d;
    }
    else {
      d = Math.sqrt((tX - cp.x) * (tX - cp.x) + (tY - cp.y) * (tY - cp.y));
      aX = cp.x + (tX - cp.x) * (d - aSize - tSize) / d;
      aY = cp.y + (tY - cp.y) * (d - aSize - tSize) / d;
      vX = (tX - cp.x) * aSize / d;
      vY = (tY - cp.y) * aSize / d;
    }

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(sX, sY);
    if (source.id === target.id) {
      context.bezierCurveTo(cp.x2, cp.y2, cp.x1, cp.y1, aX, aY);
    } else {
      context.quadraticCurveTo(cp.x, cp.y, aX, aY);
    }
    context.stroke();

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(aX + vX, aY + vY);
    context.lineTo(aX + vY * 0.6, aY - vX * 0.6);
    context.lineTo(aX - vY * 0.6, aY + vX * 0.6);
    context.lineTo(aX + vX, aY + vY);
    context.closePath();
    context.fill();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edgehovers');

  /**
   * This hover renderer will display the edge with a different color or size.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edgehovers.def =
    function(edge, source, target, context, settings) {
      var color = edge.color,
        prefix = settings('prefix') || '',
        size = edge[prefix + 'size'] || 1,
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor');

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    if (settings('edgeHoverColor') === 'edge') {
      color = edge.hover_color || color;
    } else {
      color = edge.hover_color || settings('defaultEdgeHoverColor') || color;
    }
    size *= settings('edgeHoverSizeRatio');

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(
      source[prefix + 'x'],
      source[prefix + 'y']
    );
    context.lineTo(
      target[prefix + 'x'],
      target[prefix + 'y']
    );
    context.stroke();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edgehovers');

  /**
   * This hover renderer will display the edge with a different color or size.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edgehovers.curve =
    function(edge, source, target, context, settings) {
    var color = edge.color,
        prefix = settings('prefix') || '',
        size = settings('edgeHoverSizeRatio') * (edge[prefix + 'size'] || 1),
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor'),
        cp = {},
        sSize = source[prefix + 'size'],
        sX = source[prefix + 'x'],
        sY = source[prefix + 'y'],
        tX = target[prefix + 'x'],
        tY = target[prefix + 'y'];

    cp = (source.id === target.id) ?
      sigma.utils.getSelfLoopControlPoints(sX, sY, sSize) :
      sigma.utils.getQuadraticControlPoint(sX, sY, tX, tY, edge.cc);

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    if (settings('edgeHoverColor') === 'edge') {
      color = edge.hover_color || color;
    } else {
      color = edge.hover_color || settings('defaultEdgeHoverColor') || color;
    }

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(sX, sY);
    if (source.id === target.id) {
      context.bezierCurveTo(cp.x1, cp.y1, cp.x2, cp.y2, tX, tY);
    } else {
      context.quadraticCurveTo(cp.x, cp.y, tX, tY);
    }
    context.stroke();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edgehovers');

  /**
   * This hover renderer will display the edge with a different color or size.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edgehovers.arrow =
    function(edge, source, target, context, settings) {
    var color = edge.color,
        prefix = settings('prefix') || '',
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor'),
        size = edge[prefix + 'size'] || 1,
        tSize = target[prefix + 'size'],
        sX = source[prefix + 'x'],
        sY = source[prefix + 'y'],
        tX = target[prefix + 'x'],
        tY = target[prefix + 'y'];

    size = (edge.hover) ?
      settings('edgeHoverSizeRatio') * size : size;
    var aSize = Math.max(size * 2.5, settings('minArrowSize')),
        d = Math.sqrt((tX - sX) * (tX - sX) + (tY - sY) * (tY - sY)),
        aX = sX + (tX - sX) * (d - aSize - tSize) / d,
        aY = sY + (tY - sY) * (d - aSize - tSize) / d,
        vX = (tX - sX) * aSize / d,
        vY = (tY - sY) * aSize / d;

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    if (settings('edgeHoverColor') === 'edge') {
      color = edge.hover_color || color;
    } else {
      color = edge.hover_color || settings('defaultEdgeHoverColor') || color;
    }

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(sX, sY);
    context.lineTo(
      aX,
      aY
    );
    context.stroke();

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(aX + vX, aY + vY);
    context.lineTo(aX + vY * 0.6, aY - vX * 0.6);
    context.lineTo(aX - vY * 0.6, aY + vX * 0.6);
    context.lineTo(aX + vX, aY + vY);
    context.closePath();
    context.fill();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edgehovers');

  /**
   * This hover renderer will display the edge with a different color or size.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edgehovers.curvedArrow =
    function(edge, source, target, context, settings) {
    var color = edge.color,
        prefix = settings('prefix') || '',
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor'),
        cp = {},
        size = settings('edgeHoverSizeRatio') * (edge[prefix + 'size'] || 1),
        tSize = target[prefix + 'size'],
        sX = source[prefix + 'x'],
        sY = source[prefix + 'y'],
        tX = target[prefix + 'x'],
        tY = target[prefix + 'y'],
        d,
        aSize,
        aX,
        aY,
        vX,
        vY;

    cp = (source.id === target.id) ?
      sigma.utils.getSelfLoopControlPoints(sX, sY, tSize) :
      sigma.utils.getQuadraticControlPoint(sX, sY, tX, tY, edge.cc);

    if (source.id === target.id) {
      d = Math.sqrt((tX - cp.x1) * (tX - cp.x1) + (tY - cp.y1) * (tY - cp.y1));
      aSize = Math.max(size * 2.5, settings('minArrowSize'));
      aX = cp.x1 + (tX - cp.x1) * (d - aSize - tSize) / d;
      aY = cp.y1 + (tY - cp.y1) * (d - aSize - tSize) / d;
      vX = (tX - cp.x1) * aSize / d;
      vY = (tY - cp.y1) * aSize / d;
    }
    else {
      d = Math.sqrt((tX - cp.x) * (tX - cp.x) + (tY - cp.y) * (tY - cp.y));
      aSize = size * 2.5;
      aX = cp.x + (tX - cp.x) * (d - aSize - tSize) / d;
      aY = cp.y + (tY - cp.y) * (d - aSize - tSize) / d;
      vX = (tX - cp.x) * aSize / d;
      vY = (tY - cp.y) * aSize / d;
    }

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    if (settings('edgeHoverColor') === 'edge') {
      color = edge.hover_color || color;
    } else {
      color = edge.hover_color || settings('defaultEdgeHoverColor') || color;
    }

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(sX, sY);
    if (source.id === target.id) {
      context.bezierCurveTo(cp.x2, cp.y2, cp.x1, cp.y1, aX, aY);
    } else {
      context.quadraticCurveTo(cp.x, cp.y, aX, aY);
    }
    context.stroke();

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(aX + vX, aY + vY);
    context.lineTo(aX + vY * 0.6, aY - vX * 0.6);
    context.lineTo(aX - vY * 0.6, aY + vX * 0.6);
    context.lineTo(aX + vX, aY + vY);
    context.closePath();
    context.fill();
  };
})();

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.canvas.extremities');

  /**
   * The default renderer for hovered edge extremities. It renders the edge
   * extremities as hovered.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.extremities.def =
    function(edge, source, target, context, settings) {
    // Source Node:
    (
      sigma.canvas.hovers[source.type] ||
      sigma.canvas.hovers.def
    ) (
      source, context, settings
    );

    // Target Node:
    (
      sigma.canvas.hovers[target.type] ||
      sigma.canvas.hovers.def
    ) (
      target, context, settings
    );
  };
}).call(this);

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.svg.utils');

  /**
   * Some useful functions used by sigma's SVG renderer.
   */
  sigma.svg.utils = {

    /**
     * SVG Element show.
     *
     * @param  {DOMElement}               element   The DOM element to show.
     */
    show: function(element) {
      element.style.display = '';
      return this;
    },

    /**
     * SVG Element hide.
     *
     * @param  {DOMElement}               element   The DOM element to hide.
     */
    hide: function(element) {
      element.style.display = 'none';
      return this;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.svg.nodes');

  /**
   * The default node renderer. It renders the node as a simple disc.
   */
  sigma.svg.nodes.def = {

    /**
     * SVG Element creation.
     *
     * @param  {object}                   node     The node object.
     * @param  {configurable}             settings The settings function.
     */
    create: function(node, settings) {
      var prefix = settings('prefix') || '',
          circle = document.createElementNS(settings('xmlns'), 'circle');

      // Defining the node's circle
      circle.setAttributeNS(null, 'data-node-id', node.id);
      circle.setAttributeNS(null, 'class', settings('classPrefix') + '-node');
      circle.setAttributeNS(
        null, 'fill', node.color || settings('defaultNodeColor'));

      // Returning the DOM Element
      return circle;
    },

    /**
     * SVG Element update.
     *
     * @param  {object}                   node     The node object.
     * @param  {DOMElement}               circle   The node DOM element.
     * @param  {configurable}             settings The settings function.
     */
    update: function(node, circle, settings) {
      var prefix = settings('prefix') || '';

      // Applying changes
      // TODO: optimize - check if necessary
      circle.setAttributeNS(null, 'cx', node[prefix + 'x']);
      circle.setAttributeNS(null, 'cy', node[prefix + 'y']);
      circle.setAttributeNS(null, 'r', node[prefix + 'size']);

      // Updating only if not freestyle
      if (!settings('freeStyle'))
        circle.setAttributeNS(
          null, 'fill', node.color || settings('defaultNodeColor'));

      // Showing
      circle.style.display = '';

      return this;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.svg.edges');

  /**
   * The default edge renderer. It renders the node as a simple line.
   */
  sigma.svg.edges.def = {

    /**
     * SVG Element creation.
     *
     * @param  {object}                   edge       The edge object.
     * @param  {object}                   source     The source node object.
     * @param  {object}                   target     The target node object.
     * @param  {configurable}             settings   The settings function.
     */
    create: function(edge, source, target, settings) {
      var color = edge.color,
          prefix = settings('prefix') || '',
          edgeColor = settings('edgeColor'),
          defaultNodeColor = settings('defaultNodeColor'),
          defaultEdgeColor = settings('defaultEdgeColor');

      if (!color)
        switch (edgeColor) {
          case 'source':
            color = source.color || defaultNodeColor;
            break;
          case 'target':
            color = target.color || defaultNodeColor;
            break;
          default:
            color = defaultEdgeColor;
            break;
        }

      var line = document.createElementNS(settings('xmlns'), 'line');

      // Attributes
      line.setAttributeNS(null, 'data-edge-id', edge.id);
      line.setAttributeNS(null, 'class', settings('classPrefix') + '-edge');
      line.setAttributeNS(null, 'stroke', color);

      return line;
    },

    /**
     * SVG Element update.
     *
     * @param  {object}                   edge       The edge object.
     * @param  {DOMElement}               line       The line DOM Element.
     * @param  {object}                   source     The source node object.
     * @param  {object}                   target     The target node object.
     * @param  {configurable}             settings   The settings function.
     */
    update: function(edge, line, source, target, settings) {
      var prefix = settings('prefix') || '';

      line.setAttributeNS(null, 'stroke-width', edge[prefix + 'size'] || 1);
      line.setAttributeNS(null, 'x1', source[prefix + 'x']);
      line.setAttributeNS(null, 'y1', source[prefix + 'y']);
      line.setAttributeNS(null, 'x2', target[prefix + 'x']);
      line.setAttributeNS(null, 'y2', target[prefix + 'y']);

      // Showing
      line.style.display = '';

      return this;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.svg.edges');

  /**
   * The curve edge renderer. It renders the edge as a bezier curve.
   */
  sigma.svg.edges.curve = {

    /**
     * SVG Element creation.
     *
     * @param  {object}                   edge       The edge object.
     * @param  {object}                   source     The source node object.
     * @param  {object}                   target     The target node object.
     * @param  {configurable}             settings   The settings function.
     */
    create: function(edge, source, target, settings) {
      var color = edge.color,
          prefix = settings('prefix') || '',
          edgeColor = settings('edgeColor'),
          defaultNodeColor = settings('defaultNodeColor'),
          defaultEdgeColor = settings('defaultEdgeColor');

      if (!color)
        switch (edgeColor) {
          case 'source':
            color = source.color || defaultNodeColor;
            break;
          case 'target':
            color = target.color || defaultNodeColor;
            break;
          default:
            color = defaultEdgeColor;
            break;
        }

      var path = document.createElementNS(settings('xmlns'), 'path');

      // Attributes
      path.setAttributeNS(null, 'data-edge-id', edge.id);
      path.setAttributeNS(null, 'class', settings('classPrefix') + '-edge');
      path.setAttributeNS(null, 'stroke', color);

      return path;
    },

    /**
     * SVG Element update.
     *
     * @param  {object}                   edge       The edge object.
     * @param  {DOMElement}               path       The path DOM Element.
     * @param  {object}                   source     The source node object.
     * @param  {object}                   target     The target node object.
     * @param  {configurable}             settings   The settings function.
     */
    update: function(edge, path, source, target, settings) {
      var prefix = settings('prefix') || '',
          sSize = source[prefix + 'size'],
          sX = source[prefix + 'x'],
          sY = source[prefix + 'y'],
          tX = target[prefix + 'x'],
          tY = target[prefix + 'y'],
          cp,
          p;

      path.setAttributeNS(null, 'stroke-width', edge[prefix + 'size'] || 1);

      if (source.id === target.id) {
        cp = sigma.utils.getSelfLoopControlPoints(sX, sY, sSize);
        // Path
        p = 'M' + sX + ',' + sY + ' ' +
            'C' + cp.x1 + ',' + cp.y1 + ' ' +
            cp.x2 + ',' + cp.y2 + ' ' +
            tX + ',' + tY;
      }
      else {
        cp = sigma.utils.getQuadraticControlPoint(sX, sY, tX, tY, edge.cc);
        // Path
        p = 'M' + sX + ',' + sY + ' ' +
            'Q' + cp.x + ',' + cp.y + ' ' +
            tX + ',' + tY;
      }

      // Updating attributes
      path.setAttributeNS(null, 'd', p);
      path.setAttributeNS(null, 'fill', 'none');

      // Showing
      path.style.display = '';

      return this;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.svg.edges');

  /**
   * TODO add arrow
   */
  sigma.svg.edges.curvedArrow = {

    /**
     * SVG Element creation.
     *
     * @param  {object}                   edge       The edge object.
     * @param  {object}                   source     The source node object.
     * @param  {object}                   target     The target node object.
     * @param  {configurable}             settings   The settings function.
     */
    create: function(edge, source, target, settings) {
      var color = edge.color,
          prefix = settings('prefix') || '',
          edgeColor = settings('edgeColor'),
          defaultNodeColor = settings('defaultNodeColor'),
          defaultEdgeColor = settings('defaultEdgeColor');

      if (!color)
        switch (edgeColor) {
          case 'source':
            color = source.color || defaultNodeColor;
            break;
          case 'target':
            color = target.color || defaultNodeColor;
            break;
          default:
            color = defaultEdgeColor;
            break;
        }

      var path = document.createElementNS(settings('xmlns'), 'path');

      // Attributes
      path.setAttributeNS(null, 'data-edge-id', edge.id);
      path.setAttributeNS(null, 'class', settings('classPrefix') + '-edge');
      path.setAttributeNS(null, 'stroke', color);

      return path;
    },

    /**
     * SVG Element update.
     *
     * @param  {object}                   edge       The edge object.
     * @param  {DOMElement}               path       The path DOM Element.
     * @param  {object}                   source     The source node object.
     * @param  {object}                   target     The target node object.
     * @param  {configurable}             settings   The settings function.
     */
    update: function(edge, path, source, target, settings) {
      var prefix = settings('prefix') || '',
          sSize = source[prefix + 'size'],
          sX = source[prefix + 'x'],
          sY = source[prefix + 'y'],
          tX = target[prefix + 'x'],
          tY = target[prefix + 'y'],
          cp,
          p;

      path.setAttributeNS(null, 'stroke-width', edge[prefix + 'size'] || 1);

      if (source.id === target.id) {
        cp = sigma.utils.getSelfLoopControlPoints(sX, sY, sSize);
        // Path
        p = 'M' + sX + ',' + sY + ' ' +
            'C' + cp.x1 + ',' + cp.y1 + ' ' +
            cp.x2 + ',' + cp.y2 + ' ' +
            tX + ',' + tY;
      }
      else {
        cp = sigma.utils.getQuadraticControlPoint(sX, sY, tX, tY, edge.cc);
        // Path
        p = 'M' + sX + ',' + sY + ' ' +
            'Q' + cp.x + ',' + cp.y + ' ' +
            tX + ',' + tY;
      }

      // Updating attributes
      path.setAttributeNS(null, 'd', p);
      path.setAttributeNS(null, 'fill', 'none');

      // Showing
      path.style.display = '';

      return this;
    }
  };
})();

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.svg.labels');

  /**
   * The default label renderer. It renders the label as a simple text.
   */
  sigma.svg.labels.def = {

    /**
     * SVG Element creation.
     *
     * @param  {object}                   node       The node object.
     * @param  {configurable}             settings   The settings function.
     */
    create: function(node, settings) {
      var prefix = settings('prefix') || '',
          size = node[prefix + 'size'],
          text = document.createElementNS(settings('xmlns'), 'text');

      var fontSize = (settings('labelSize') === 'fixed') ?
        settings('defaultLabelSize') :
        settings('labelSizeRatio') * size;

      var fontColor = (settings('labelColor') === 'node') ?
        (node.color || settings('defaultNodeColor')) :
        settings('defaultLabelColor');

      text.setAttributeNS(null, 'data-label-target', node.id);
      text.setAttributeNS(null, 'class', settings('classPrefix') + '-label');
      text.setAttributeNS(null, 'font-size', fontSize);
      text.setAttributeNS(null, 'font-family', settings('font'));
      text.setAttributeNS(null, 'fill', fontColor);

      text.innerHTML = node.label;
      text.textContent = node.label;

      return text;
    },

    /**
     * SVG Element update.
     *
     * @param  {object}                   node     The node object.
     * @param  {DOMElement}               text     The label DOM element.
     * @param  {configurable}             settings The settings function.
     */
    update: function(node, text, settings) {
      var prefix = settings('prefix') || '',
          size = node[prefix + 'size'];

      var fontSize = (settings('labelSize') === 'fixed') ?
        settings('defaultLabelSize') :
        settings('labelSizeRatio') * size;

      // Case when we don't want to display the label
      if (!settings('forceLabels') && size < settings('labelThreshold'))
        return;

      if (typeof node.label !== 'string')
        return;

      // Updating
      text.setAttributeNS(null, 'x',
        Math.round(node[prefix + 'x'] + size + 3));
      text.setAttributeNS(null, 'y',
        Math.round(node[prefix + 'y'] + fontSize / 3));

      // Showing
      text.style.display = '';

      return this;
    }
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.svg.hovers');

  /**
   * The default hover renderer.
   */
  sigma.svg.hovers.def = {

    /**
     * SVG Element creation.
     *
     * @param  {object}           node               The node object.
     * @param  {CanvasElement}    measurementCanvas  A fake canvas handled by
     *                            the svg to perform some measurements and
     *                            passed by the renderer.
     * @param  {DOMElement}       nodeCircle         The node DOM Element.
     * @param  {configurable}     settings           The settings function.
     */
    create: function(node, nodeCircle, measurementCanvas, settings) {

      // Defining visual properties
      var x,
          y,
          w,
          h,
          e,
          d,
          fontStyle = settings('hoverFontStyle') || settings('fontStyle'),
          prefix = settings('prefix') || '',
          size = node[prefix + 'size'],
          fontSize = (settings('labelSize') === 'fixed') ?
            settings('defaultLabelSize') :
            settings('labelSizeRatio') * size,
          fontColor = (settings('labelHoverColor') === 'node') ?
                        (node.color || settings('defaultNodeColor')) :
                        settings('defaultLabelHoverColor');

      // Creating elements
      var group = document.createElementNS(settings('xmlns'), 'g'),
          rectangle = document.createElementNS(settings('xmlns'), 'rect'),
          circle = document.createElementNS(settings('xmlns'), 'circle'),
          text = document.createElementNS(settings('xmlns'), 'text');

      // Defining properties
      group.setAttributeNS(null, 'class', settings('classPrefix') + '-hover');
      group.setAttributeNS(null, 'data-node-id', node.id);

      if (typeof node.label === 'string') {

        // Text
        text.innerHTML = node.label;
        text.textContent = node.label;
        text.setAttributeNS(
            null,
            'class',
            settings('classPrefix') + '-hover-label');
        text.setAttributeNS(null, 'font-size', fontSize);
        text.setAttributeNS(null, 'font-family', settings('font'));
        text.setAttributeNS(null, 'fill', fontColor);
        text.setAttributeNS(null, 'x',
          Math.round(node[prefix + 'x'] + size + 3));
        text.setAttributeNS(null, 'y',
          Math.round(node[prefix + 'y'] + fontSize / 3));

        // Measures
        // OPTIMIZE: Find a better way than a measurement canvas
        x = Math.round(node[prefix + 'x'] - fontSize / 2 - 2);
        y = Math.round(node[prefix + 'y'] - fontSize / 2 - 2);
        w = Math.round(
          measurementCanvas.measureText(node.label).width +
            fontSize / 2 + size + 9
        );
        h = Math.round(fontSize + 4);
        e = Math.round(fontSize / 2 + 2);

        // Circle
        circle.setAttributeNS(
            null,
            'class',
            settings('classPrefix') + '-hover-area');
        circle.setAttributeNS(null, 'fill', '#fff');
        circle.setAttributeNS(null, 'cx', node[prefix + 'x']);
        circle.setAttributeNS(null, 'cy', node[prefix + 'y']);
        circle.setAttributeNS(null, 'r', e);

        // Rectangle
        rectangle.setAttributeNS(
            null,
            'class',
            settings('classPrefix') + '-hover-area');
        rectangle.setAttributeNS(null, 'fill', '#fff');
        rectangle.setAttributeNS(null, 'x', node[prefix + 'x'] + e / 4);
        rectangle.setAttributeNS(null, 'y', node[prefix + 'y'] - e);
        rectangle.setAttributeNS(null, 'width', w);
        rectangle.setAttributeNS(null, 'height', h);
      }

      // Appending childs
      group.appendChild(circle);
      group.appendChild(rectangle);
      group.appendChild(text);
      group.appendChild(nodeCircle);

      return group;
    }
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.middlewares');
  sigma.utils.pkg('sigma.utils');

  /**
   * This middleware will rescale the graph such that it takes an optimal space
   * on the renderer.
   *
   * As each middleware, this function is executed in the scope of the sigma
   * instance.
   *
   * @param {?string} readPrefix  The read prefix.
   * @param {?string} writePrefix The write prefix.
   * @param {object}  options     The parameters.
   */
  sigma.middlewares.rescale = function(readPrefix, writePrefix, options) {
    var i,
        l,
        a,
        b,
        c,
        d,
        scale,
        margin,
        n = this.graph.nodes(),
        e = this.graph.edges(),
        settings = this.settings.embedObjects(options || {}),
        bounds = settings('bounds') || sigma.utils.getBoundaries(
          this.graph,
          readPrefix,
          true
        ),
        minX = bounds.minX,
        minY = bounds.minY,
        maxX = bounds.maxX,
        maxY = bounds.maxY,
        sizeMax = bounds.sizeMax,
        weightMax = bounds.weightMax,
        w = settings('width') || 1,
        h = settings('height') || 1,
        rescaleSettings = settings('autoRescale'),
        validSettings = {
          nodePosition: 1,
          nodeSize: 1,
          edgeSize: 1
        };

    /**
     * What elements should we rescale?
     */
    if (!(rescaleSettings instanceof Array))
      rescaleSettings = ['nodePosition', 'nodeSize', 'edgeSize'];

    for (i = 0, l = rescaleSettings.length; i < l; i++)
      if (!validSettings[rescaleSettings[i]])
        throw new Error(
          'The rescale setting "' + rescaleSettings[i] + '" is not recognized.'
        );

    var np = ~rescaleSettings.indexOf('nodePosition'),
        ns = ~rescaleSettings.indexOf('nodeSize'),
        es = ~rescaleSettings.indexOf('edgeSize');

    if (np) {
      /**
       * First, we compute the scaling ratio, without considering the sizes
       * of the nodes : Each node will have its center in the canvas, but might
       * be partially out of it.
       */
      scale = settings('scalingMode') === 'outside' ?
        Math.max(
          w / Math.max(maxX - minX, 1),
          h / Math.max(maxY - minY, 1)
        ) :
        Math.min(
          w / Math.max(maxX - minX, 1),
          h / Math.max(maxY - minY, 1)
        );

      /**
       * Then, we correct that scaling ratio considering a margin, which is
       * basically the size of the biggest node.
       * This has to be done as a correction since to compare the size of the
       * biggest node to the X and Y values, we have to first get an
       * approximation of the scaling ratio.
       **/
      margin =
        (
          settings('rescaleIgnoreSize') ?
            0 :
            (settings('maxNodeSize') || sizeMax) / scale
        ) +
        (settings('sideMargin') || 0);
      maxX += margin;
      minX -= margin;
      maxY += margin;
      minY -= margin;

      // Fix the scaling with the new extrema:
      scale = settings('scalingMode') === 'outside' ?
        Math.max(
          w / Math.max(maxX - minX, 1),
          h / Math.max(maxY - minY, 1)
        ) :
        Math.min(
          w / Math.max(maxX - minX, 1),
          h / Math.max(maxY - minY, 1)
        );
    }

    // Size homothetic parameters:
    if (!settings('maxNodeSize') && !settings('minNodeSize')) {
      a = 1;
      b = 0;
    } else if (settings('maxNodeSize') === settings('minNodeSize')) {
      a = 0;
      b = +settings('maxNodeSize');
    } else {
      a = (settings('maxNodeSize') - settings('minNodeSize')) / sizeMax;
      b = +settings('minNodeSize');
    }

    if (!settings('maxEdgeSize') && !settings('minEdgeSize')) {
      c = 1;
      d = 0;
    } else if (settings('maxEdgeSize') === settings('minEdgeSize')) {
      c = 0;
      d = +settings('minEdgeSize');
    } else {
      c = (settings('maxEdgeSize') - settings('minEdgeSize')) / weightMax;
      d = +settings('minEdgeSize');
    }

    // Rescale the nodes and edges:
    for (i = 0, l = e.length; i < l; i++)
      e[i][writePrefix + 'size'] =
        e[i][readPrefix + 'size'] * (es ? c : 1) + (es ? d : 0);

    for (i = 0, l = n.length; i < l; i++) {
      n[i][writePrefix + 'size'] =
        n[i][readPrefix + 'size'] * (ns ? a : 1) + (ns ? b : 0);

      if (np) {
        n[i][writePrefix + 'x'] =
          (n[i][readPrefix + 'x'] - (maxX + minX) / 2) * scale;
        n[i][writePrefix + 'y'] =
          (n[i][readPrefix + 'y'] - (maxY + minY) / 2) * scale;
      }
      else {
        n[i][writePrefix + 'x'] = n[i][readPrefix + 'x'];
        n[i][writePrefix + 'y'] = n[i][readPrefix + 'y'];
      }
    }
  };

  sigma.utils.getBoundaries = function(graph, prefix, doEdges) {
    var i,
        l,
        e = graph.edges(),
        n = graph.nodes(),
        weightMax = -Infinity,
        sizeMax = -Infinity,
        minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

    if (doEdges)
      for (i = 0, l = e.length; i < l; i++)
        weightMax = Math.max(e[i][prefix + 'size'], weightMax);

    for (i = 0, l = n.length; i < l; i++) {
      sizeMax = Math.max(n[i][prefix + 'size'], sizeMax);
      maxX = Math.max(n[i][prefix + 'x'], maxX);
      minX = Math.min(n[i][prefix + 'x'], minX);
      maxY = Math.max(n[i][prefix + 'y'], maxY);
      minY = Math.min(n[i][prefix + 'y'], minY);
    }

    weightMax = weightMax || 1;
    sizeMax = sizeMax || 1;

    return {
      weightMax: weightMax,
      sizeMax: sizeMax,
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY
    };
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.middlewares');

  /**
   * This middleware will just copy the graphic properties.
   *
   * @param {?string} readPrefix  The read prefix.
   * @param {?string} writePrefix The write prefix.
   */
  sigma.middlewares.copy = function(readPrefix, writePrefix) {
    var i,
        l,
        a;

    if (writePrefix + '' === readPrefix + '')
      return;

    a = this.graph.nodes();
    for (i = 0, l = a.length; i < l; i++) {
      a[i][writePrefix + 'x'] = a[i][readPrefix + 'x'];
      a[i][writePrefix + 'y'] = a[i][readPrefix + 'y'];
      a[i][writePrefix + 'size'] = a[i][readPrefix + 'size'];
    }

    a = this.graph.edges();
    for (i = 0, l = a.length; i < l; i++)
      a[i][writePrefix + 'size'] = a[i][readPrefix + 'size'];
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.misc.animation.running');

  /**
   * Generates a unique ID for the animation.
   *
   * @return {string} Returns the new ID.
   */
  var _getID = (function() {
    var id = 0;
    return function() {
      return '' + (++id);
    };
  })();

  /**
   * This function animates a camera. It has to be called with the camera to
   * animate, the values of the coordinates to reach and eventually some
   * options. It returns a number id, that you can use to kill the animation,
   * with the method sigma.misc.animation.kill(id).
   *
   * The available options are:
   *
   *   {?number}            duration   The duration of the animation.
   *   {?function}          onNewFrame A callback to execute when the animation
   *                                   enter a new frame.
   *   {?function}          onComplete A callback to execute when the animation
   *                                   is completed or killed.
   *   {?(string|function)} easing     The name of a function from the package
   *                                   sigma.utils.easings, or a custom easing
   *                                   function.
   *
   * @param  {camera}  camera  The camera to animate.
   * @param  {object}  target  The coordinates to reach.
   * @param  {?object} options Eventually an object to specify some options to
   *                           the function. The available options are
   *                           presented in the description of the function.
   * @return {number}          The animation id, to make it easy to kill
   *                           through the method "sigma.misc.animation.kill".
   */
  sigma.misc.animation.camera = function(camera, val, options) {
    if (
      !(camera instanceof sigma.classes.camera) ||
      typeof val !== 'object' ||
      !val
    )
      throw 'animation.camera: Wrong arguments.';

    if (
      typeof val.x !== 'number' &&
      typeof val.y !== 'number' &&
      typeof val.ratio !== 'number' &&
      typeof val.angle !== 'number'
    )
      throw 'There must be at least one valid coordinate in the given val.';

    var fn,
        id,
        anim,
        easing,
        duration,
        initialVal,
        o = options || {},
        start = sigma.utils.dateNow();

    // Store initial values:
    initialVal = {
      x: camera.x,
      y: camera.y,
      ratio: camera.ratio,
      angle: camera.angle
    };

    duration = o.duration;
    easing = typeof o.easing !== 'function' ?
      sigma.utils.easings[o.easing || 'quadraticInOut'] :
      o.easing;

    fn = function() {
      var coef,
          t = o.duration ? (sigma.utils.dateNow() - start) / o.duration : 1;

      // If the animation is over:
      if (t >= 1) {
        camera.isAnimated = false;
        camera.goTo({
          x: val.x !== undefined ? val.x : initialVal.x,
          y: val.y !== undefined ? val.y : initialVal.y,
          ratio: val.ratio !== undefined ? val.ratio : initialVal.ratio,
          angle: val.angle !== undefined ? val.angle : initialVal.angle
        });

        cancelAnimationFrame(id);
        delete sigma.misc.animation.running[id];

        // Check callbacks:
        if (typeof o.onComplete === 'function')
          o.onComplete();

      // Else, let's keep going:
      } else {
        coef = easing(t);
        camera.isAnimated = true;
        camera.goTo({
          x: val.x !== undefined ?
            initialVal.x + (val.x - initialVal.x) * coef :
            initialVal.x,
          y: val.y !== undefined ?
            initialVal.y + (val.y - initialVal.y) * coef :
            initialVal.y,
          ratio: val.ratio !== undefined ?
            initialVal.ratio + (val.ratio - initialVal.ratio) * coef :
            initialVal.ratio,
          angle: val.angle !== undefined ?
            initialVal.angle + (val.angle - initialVal.angle) * coef :
            initialVal.angle
        });

        // Check callbacks:
        if (typeof o.onNewFrame === 'function')
          o.onNewFrame();

        anim.frameId = requestAnimationFrame(fn);
      }
    };

    id = _getID();
    anim = {
      frameId: requestAnimationFrame(fn),
      target: camera,
      type: 'camera',
      options: o,
      fn: fn
    };
    sigma.misc.animation.running[id] = anim;

    return id;
  };

  /**
   * Kills a running animation. It triggers the eventual onComplete callback.
   *
   * @param  {number} id  The id of the animation to kill.
   * @return {object}     Returns the sigma.misc.animation package.
   */
  sigma.misc.animation.kill = function(id) {
    if (arguments.length !== 1 || typeof id !== 'number')
      throw 'animation.kill: Wrong arguments.';

    var o = sigma.misc.animation.running[id];

    if (o) {
      cancelAnimationFrame(id);
      delete sigma.misc.animation.running[o.frameId];

      if (o.type === 'camera')
        o.target.isAnimated = false;

      // Check callbacks:
      if (typeof (o.options || {}).onComplete === 'function')
        o.options.onComplete();
    }

    return this;
  };

  /**
   * Kills every running animations, or only the one with the specified type,
   * if a string parameter is given.
   *
   * @param  {?(string|object)} filter A string to filter the animations to kill
   *                                   on their type (example: "camera"), or an
   *                                   object to filter on their target.
   * @return {number}                  Returns the number of animations killed
   *                                   that way.
   */
  sigma.misc.animation.killAll = function(filter) {
    var o,
        id,
        count = 0,
        type = typeof filter === 'string' ? filter : null,
        target = typeof filter === 'object' ? filter : null,
        running = sigma.misc.animation.running;

    for (id in running)
      if (
        (!type || running[id].type === type) &&
        (!target || running[id].target === target)
      ) {
        o = sigma.misc.animation.running[id];
        cancelAnimationFrame(o.frameId);
        delete sigma.misc.animation.running[id];

        if (o.type === 'camera')
          o.target.isAnimated = false;

        // Increment counter:
        count++;

        // Check callbacks:
        if (typeof (o.options || {}).onComplete === 'function')
          o.options.onComplete();
      }

    return count;
  };

  /**
   * Returns "true" if any animation that is currently still running matches
   * the filter given to the function.
   *
   * @param  {string|object} filter A string to filter the animations to kill
   *                                on their type (example: "camera"), or an
   *                                object to filter on their target.
   * @return {boolean}              Returns true if any running animation
   *                                matches.
   */
  sigma.misc.animation.has = function(filter) {
    var id,
        type = typeof filter === 'string' ? filter : null,
        target = typeof filter === 'object' ? filter : null,
        running = sigma.misc.animation.running;

    for (id in running)
      if (
        (!type || running[id].type === type) &&
        (!target || running[id].target === target)
      )
        return true;

    return false;
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.misc');

  /**
   * This helper will bind any no-DOM renderer (for instance canvas or WebGL)
   * to its captors, to properly dispatch the good events to the sigma instance
   * to manage clicking, hovering etc...
   *
   * It has to be called in the scope of the related renderer.
   */
  sigma.misc.bindEvents = function(prefix) {
    var i,
        l,
        mX,
        mY,
        captor,
        self = this;

    function getNodes(e) {
      if (e) {
        mX = 'x' in e.data ? e.data.x : mX;
        mY = 'y' in e.data ? e.data.y : mY;
      }

      var i,
          j,
          l,
          n,
          x,
          y,
          s,
          inserted,
          selected = [],
          modifiedX = mX + self.width / 2,
          modifiedY = mY + self.height / 2,
          point = self.camera.cameraPosition(
            mX,
            mY
          ),
          nodes = self.camera.quadtree.point(
            point.x,
            point.y
          );

      if (nodes.length)
        for (i = 0, l = nodes.length; i < l; i++) {
          n = nodes[i];
          x = n[prefix + 'x'];
          y = n[prefix + 'y'];
          s = n[prefix + 'size'];

          if (
            !n.hidden &&
            modifiedX > x - s &&
            modifiedX < x + s &&
            modifiedY > y - s &&
            modifiedY < y + s &&
            Math.sqrt(
              (modifiedX - x) * (modifiedX - x) +
              (modifiedY - y) * (modifiedY - y)
            ) < s
          ) {
            // Insert the node:
            inserted = false;

            for (j = 0; j < selected.length; j++)
              if (n.size > selected[j].size) {
                selected.splice(j, 0, n);
                inserted = true;
                break;
              }

            if (!inserted)
              selected.push(n);
          }
        }

      return selected;
    }


    function getEdges(e) {
      if (!self.settings('enableEdgeHovering')) {
        // No event if the setting is off:
        return [];
      }

      var isCanvas = (
        sigma.renderers.canvas && self instanceof sigma.renderers.canvas);

      if (!isCanvas) {
        // A quick hardcoded rule to prevent people from using this feature
        // with the WebGL renderer (which is not good enough at the moment):
        throw new Error(
          'The edge events feature is not compatible with the WebGL renderer'
        );
      }

      if (e) {
        mX = 'x' in e.data ? e.data.x : mX;
        mY = 'y' in e.data ? e.data.y : mY;
      }

      var i,
          j,
          l,
          a,
          edge,
          s,
          maxEpsilon = self.settings('edgeHoverPrecision'),
          source,
          target,
          cp,
          nodeIndex = {},
          inserted,
          selected = [],
          modifiedX = mX + self.width / 2,
          modifiedY = mY + self.height / 2,
          point = self.camera.cameraPosition(
            mX,
            mY
          ),
          edges = [];

      if (isCanvas) {
        var nodesOnScreen = self.camera.quadtree.area(
          self.camera.getRectangle(self.width, self.height)
        );
        for (a = nodesOnScreen, i = 0, l = a.length; i < l; i++)
          nodeIndex[a[i].id] = a[i];
      }

      if (self.camera.edgequadtree !== undefined) {
        edges = self.camera.edgequadtree.point(
          point.x,
          point.y
        );
      }

      function insertEdge(selected, edge) {
        inserted = false;

        for (j = 0; j < selected.length; j++)
          if (edge.size > selected[j].size) {
            selected.splice(j, 0, edge);
            inserted = true;
            break;
          }

        if (!inserted)
          selected.push(edge);
      }

      if (edges.length)
        for (i = 0, l = edges.length; i < l; i++) {
          edge = edges[i];
          source = self.graph.nodes(edge.source);
          target = self.graph.nodes(edge.target);
          // (HACK) we can't get edge[prefix + 'size'] on WebGL renderer:
          s = edge[prefix + 'size'] ||
              edge['read_' + prefix + 'size'];

          // First, let's identify which edges are drawn. To do this, we keep
          // every edges that have at least one extremity displayed according to
          // the quadtree and the "hidden" attribute. We also do not keep hidden
          // edges.
          // Then, let's check if the mouse is on the edge (we suppose that it
          // is a line segment).

          if (
            !edge.hidden &&
            !source.hidden && !target.hidden &&
            (!isCanvas ||
              (nodeIndex[edge.source] || nodeIndex[edge.target])) &&
            sigma.utils.getDistance(
              source[prefix + 'x'],
              source[prefix + 'y'],
              modifiedX,
              modifiedY) > source[prefix + 'size'] &&
            sigma.utils.getDistance(
              target[prefix + 'x'],
              target[prefix + 'y'],
              modifiedX,
              modifiedY) > target[prefix + 'size']
          ) {
            if (edge.type == 'curve' || edge.type == 'curvedArrow') {
              if (source.id === target.id) {
                cp = sigma.utils.getSelfLoopControlPoints(
                  source[prefix + 'x'],
                  source[prefix + 'y'],
                  source[prefix + 'size']
                );
                if (
                  sigma.utils.isPointOnBezierCurve(
                  modifiedX,
                  modifiedY,
                  source[prefix + 'x'],
                  source[prefix + 'y'],
                  target[prefix + 'x'],
                  target[prefix + 'y'],
                  cp.x1,
                  cp.y1,
                  cp.x2,
                  cp.y2,
                  Math.max(s, maxEpsilon)
                )) {
                  insertEdge(selected, edge);
                }
              }
              else {
                cp = sigma.utils.getQuadraticControlPoint(
                  source[prefix + 'x'],
                  source[prefix + 'y'],
                  target[prefix + 'x'],
                  target[prefix + 'y'],
                  edge.cc);
                if (
                  sigma.utils.isPointOnQuadraticCurve(
                  modifiedX,
                  modifiedY,
                  source[prefix + 'x'],
                  source[prefix + 'y'],
                  target[prefix + 'x'],
                  target[prefix + 'y'],
                  cp.x,
                  cp.y,
                  Math.max(s, maxEpsilon)
                )) {
                  insertEdge(selected, edge);
                }
              }
            } else if (
                sigma.utils.isPointOnSegment(
                modifiedX,
                modifiedY,
                source[prefix + 'x'],
                source[prefix + 'y'],
                target[prefix + 'x'],
                target[prefix + 'y'],
                Math.max(s, maxEpsilon)
              )) {
              insertEdge(selected, edge);
            }
          }
        }

      return selected;
    }


    function bindCaptor(captor) {
      var nodes,
          edges,
          overNodes = {},
          overEdges = {};

      function onClick(e) {
        if (!self.settings('eventsEnabled'))
          return;

        self.dispatchEvent('click', e.data);

        nodes = getNodes(e);
        edges = getEdges(e);

        if (nodes.length) {
          self.dispatchEvent('clickNode', {
            node: nodes[0],
            captor: e.data
          });
          self.dispatchEvent('clickNodes', {
            node: nodes,
            captor: e.data
          });
        } else if (edges.length) {
          self.dispatchEvent('clickEdge', {
            edge: edges[0],
            captor: e.data
          });
          self.dispatchEvent('clickEdges', {
            edge: edges,
            captor: e.data
          });
        } else
          self.dispatchEvent('clickStage', {captor: e.data});
      }

      function onDoubleClick(e) {
        if (!self.settings('eventsEnabled'))
          return;

        self.dispatchEvent('doubleClick', e.data);

        nodes = getNodes(e);
        edges = getEdges(e);

        if (nodes.length) {
          self.dispatchEvent('doubleClickNode', {
            node: nodes[0],
            captor: e.data
          });
          self.dispatchEvent('doubleClickNodes', {
            node: nodes,
            captor: e.data
          });
        } else if (edges.length) {
          self.dispatchEvent('doubleClickEdge', {
            edge: edges[0],
            captor: e.data
          });
          self.dispatchEvent('doubleClickEdges', {
            edge: edges,
            captor: e.data
          });
        } else
          self.dispatchEvent('doubleClickStage', {captor: e.data});
      }

      function onRightClick(e) {
        if (!self.settings('eventsEnabled'))
          return;

        self.dispatchEvent('rightClick', e.data);

        nodes = getNodes(e);
        edges = getEdges(e);

        if (nodes.length) {
          self.dispatchEvent('rightClickNode', {
            node: nodes[0],
            captor: e.data
          });
          self.dispatchEvent('rightClickNodes', {
            node: nodes,
            captor: e.data
          });
        } else if (edges.length) {
          self.dispatchEvent('rightClickEdge', {
            edge: edges[0],
            captor: e.data
          });
          self.dispatchEvent('rightClickEdges', {
            edge: edges,
            captor: e.data
          });
        } else
          self.dispatchEvent('rightClickStage', {captor: e.data});
      }

      function onOut(e) {
        if (!self.settings('eventsEnabled'))
          return;

        var k,
            event = {
              current: { nodes: [], edges: [], },
              enter: { nodes: [], edges: [], },
              leave: { nodes: [], edges: [], },
              captor: e.data
            },
            leave = event.leave;

        for (k in overNodes)
          leave.nodes.push(overNodes[k]);

        for (k in overEdges)
          leave.edges.push(overEdges[k]);

        overNodes = {};
        overEdges = {};

        if (leave.nodes.length || leave.edges.length) {
          self.dispatchEvent('hovers', event);
        }
      }

      function onMove(e) {
        if (!self.settings('eventsEnabled'))
          return;

        nodes = getNodes(e);
        edges = getEdges(e);

        var i,
            k,
            node,
            edge,
            newOutNodes = [],
            newOverNodes = [],
            currentOverNodes = {},
            newOutEdges = [],
            newOverEdges = [],
            currentOverEdges = {};

        // Check newly overred nodes:
        for (i = 0; i < nodes.length; i++) {
          node = nodes[i];
          currentOverNodes[node.id] = node;
          if (!overNodes[node.id]) {
            newOverNodes.push(node);
            overNodes[node.id] = node;
          }
        }

        // Check no more overred nodes:
        for (k in overNodes)
          if (!currentOverNodes[k]) {
            newOutNodes.push(overNodes[k]);
            delete overNodes[k];
          }

        // Check newly overred edges:
        for (i = 0; i < edges.length; i++) {
          edge = edges[i];
          currentOverEdges[edge.id] = edge;
          if (!overEdges[edge.id]) {
            newOverEdges.push(edge);
            overEdges[edge.id] = edge;
          }
        }

        // Check no more overred edges:
        for (k in overEdges)
          if (!currentOverEdges[k]) {
            newOutEdges.push(overEdges[k]);
            delete overEdges[k];
          }

        if (newOutEdges.length || newOverEdges.length ||
             newOutNodes.length || newOverNodes.length) {
          self.dispatchEvent('hovers', {
            current: {
              nodes: nodes,
              edges: edges,
            },
            enter: {
              nodes: newOverNodes,
              edges: newOverEdges,
            },
            leave: {
              nodes: newOutNodes,
              edges: newOutEdges,
            },
            captor: e.data
          });
        }
      }

      // Bind events:
      captor.bind('click', onClick);
      captor.bind('mousedown', onMove);
      captor.bind('mouseup', onMove);
      captor.bind('mousemove', onMove);
      captor.bind('mouseout', onOut);
      captor.bind('doubleclick', onDoubleClick);
      captor.bind('rightclick', onRightClick);
    }

    for (i = 0, l = this.captors.length; i < l; i++)
      bindCaptor(this.captors[i]);
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.misc');

  /**
   * This helper will bind any DOM renderer (for instance svg)
   * to its captors, to properly dispatch the good events to the sigma instance
   * to manage clicking, hovering etc...
   *
   * It has to be called in the scope of the related renderer.
   */
  sigma.misc.bindDOMEvents = function(container) {
    var self = this,
        graph = this.graph,
        hovered = {nodes: [], edges: []};

    // DOMElement abstraction
    function Element(domElement) {

      // Helpers
      this.attr = function(attrName) {
        return domElement.getAttributeNS(null, attrName);
      };

      // Properties
      this.tag = domElement.tagName;
      this.class = this.attr('class');
      this.id = this.attr('id');

      // Methods
      this.isNode = function() {
        return !!~this.class.indexOf(self.settings('classPrefix') + '-node');
      };

      this.isEdge = function() {
        return !!~this.class.indexOf(self.settings('classPrefix') + '-edge');
      };

      this.isHover = function() {
        return !!~this.class.indexOf(self.settings('classPrefix') + '-hover');
      };
    }

    // Click
    function click(e) {
      if (!self.settings('eventsEnabled'))
        return;

      // Generic event
      self.dispatchEvent('click', sigma.utils.mouseCoords(e));

      // Are we on a node?
      var element = new Element(e.target);

      if (element.isNode())
        self.dispatchEvent('clickNode', {
          node: graph.nodes(element.attr('data-node-id'))
        });
      else
        self.dispatchEvent('clickStage');

      e.preventDefault();
      e.stopPropagation();
    }

    // Double click
    function doubleClick(e) {
      if (!self.settings('eventsEnabled'))
        return;

      // Generic event
      self.dispatchEvent('doubleClick', sigma.utils.mouseCoords(e));

      // Are we on a node?
      var element = new Element(e.target);

      if (element.isNode())
        self.dispatchEvent('doubleClickNode', {
          node: graph.nodes(element.attr('data-node-id'))
        });
      else
        self.dispatchEvent('doubleClickStage');

      e.preventDefault();
      e.stopPropagation();
    }

    // On over
    function onOver(e) {
      var target = e.toElement || e.target;

      if (!self.settings('eventsEnabled') || !target)
        return;

      var el_svg = new Element(target),
        event = {
          leave: {nodes: [], edges: []},
          enter: {nodes: [], edges: []},
          captor: sigma.utils.mouseCoords(e),
        },
        el;

      if (el_svg.isNode()) {
        el = graph.nodes(el_svg.attr('data-node-id'));
        event.enter.nodes = [el];
        hovered.nodes.push(el);
      } else if (el_svg.isEdge()) {
        el = graph.edges(el_svg.attr('data-edge-id'));
        event.enter.edges = [el];
        hovered.edges.push(el);
      }

      event.current = hovered;
      self.dispatchEvent('hovers', event);
    }

    // On out
    function onOut(e) {
      var target = e.fromElement || e.originalTarget;

      if (!self.settings('eventsEnabled'))
        return;

      var el_svg = new Element(target),
        event = {
          leave: {nodes: [], edges: []},
          enter: {nodes: [], edges: []},
          captor: sigma.utils.mouseCoords(e),
        },
        el;

      if (el_svg.isNode()) {
        el = graph.nodes(el_svg.attr('data-node-id'));
        event.leave.nodes = [el];
        hovered.nodes.push(el);
      } else if (el_svg.isEdge()) {
        el = graph.edges(el_svg.attr('data-edge-id'));
        event.leave.edges = [el];
        hovered.edges.push(el);
      } else {
        return;
      }

      event.current = hovered;
      self.dispatchEvent('hovers', event);
    }

    // Registering Events:

    // Click
    container.addEventListener('click', click, false);
    sigma.utils.doubleClick(container, 'click', doubleClick);

    // Touch counterparts
    container.addEventListener('touchstart', click, false);
    sigma.utils.doubleClick(container, 'touchstart', doubleClick);

    // Mouseover
    container.addEventListener('mouseover', onOver, true);

    // Mouseout
    container.addEventListener('mouseout', onOut, true);
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.misc');

  /**
   * This method listens to "hovers" events from a renderer and renders
   * the nodes differently on the top layer.
   * The goal is to make any node label readable with the mouse, and to
   * highlight hovered nodes and edges.
   *
   * It has to be called in the scope of the related renderer.
   */
  sigma.misc.drawHovers = function(prefix) {
    var self = this,
        current = {nodes: [], edges: []};

    this.bind('hovers', function(event) {
      current = event.data.current;
      draw();
    });

    this.bind('render', function(event) {
      draw();
    });

    function draw() {
      var c = self.contexts.hover.canvas,
          embedSettings = self.settings.embedObjects({
            prefix: prefix
          }),
          end = embedSettings('singleHover') ? 1 : undefined,
          renderParams = {
            elements: current.nodes,
            renderers: sigma.canvas.hovers,
            type: 'nodes',
            ctx: self.contexts.hover,
            end: end,
            graph: self.graph,
            settings: embedSettings,
          };

      self.contexts.hover.clearRect(0, 0, c.width, c.height);

      // Node render
      if (current.nodes.length > 0 && embedSettings('enableHovering')) {
        sigma.renderers.canvas.applyRenderers(renderParams);
      }

      // Edge render
      if (current.edges.length > 0 && embedSettings('enableEdgeHovering')) {
        renderParams.renderers = sigma.canvas.edgehovers;
        renderParams.elements = current.edges;
        renderParams.type = 'edges';
        sigma.renderers.canvas.applyRenderers(renderParams);

        if (embedSettings('edgeHoverExtremities')) {
          renderParams.renderers = sigma.canvas.extremities;
          sigma.renderers.canvas.applyRenderers(renderParams);
        } else { //draw nodes over edges
          renderParams.ctx = self.contexts.nodes;
          renderParams.type = 'nodes';
          renderParams.renderers = sigma.canvas.nodes;
          renderParams.elements = current.nodes;
          sigma.renderers.canvas.applyRenderers(renderParams);
        }
      }
    }
  };
}).call(this);

},{}],2:[function(require,module,exports){
;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw new Error('sigma is not declared');

  // Initialize package:
  sigma.utils.pkg('sigma.layouts.noverlap');

  /**
   * Noverlap Layout
   * ===============================
   *
   * Author: @apitts / Andrew Pitts
   * Algorithm: @jacomyma / Mathieu Jacomy (originally contributed to Gephi and ported to sigma.js under the MIT license by @andpitts with permission)
   * Acknowledgement: @sheyman / Sébastien Heymann (some inspiration has been taken from other MIT licensed layout algorithms authored by @sheyman)
   * Version: 0.1
   */

  var settings = {
    speed: 3,
    scaleNodes: 1.2,
    nodeMargin: 5.0,
    gridSize: 20,
    permittedExpansion: 1.1,
    rendererIndex: 0,
    maxIterations: 500
  };

  var _instance = {};

  /**
   * Event emitter Object
   * ------------------
   */
  var _eventEmitter = {};

   /**
   * Noverlap Object
   * ------------------
   */
  function Noverlap() {
    var self = this;

    this.init = function (sigInst, options) {
      options = options || {};

      // Properties
      this.sigInst = sigInst;
      this.config = sigma.utils.extend(options, settings);
      this.easing = options.easing;
      this.duration = options.duration;

      if (options.nodes) {
        this.nodes = options.nodes;
        delete options.nodes;
      }

      if (!sigma.plugins || typeof sigma.plugins.animate === 'undefined') {
        throw new Error('sigma.plugins.animate is not declared');
      }

      // State
      this.running = false;
    };

    /**
     * Single layout iteration.
     */
    this.atomicGo = function () {
      if (!this.running || this.iterCount < 1) return false;

      var nodes = this.nodes || this.sigInst.graph.nodes(),
          nodesCount = nodes.length,
          i,
          n,
          n1,
          n2,
          xmin = Infinity,
          xmax = -Infinity,
          ymin = Infinity,
          ymax = -Infinity,
          xwidth,
          yheight,
          xcenter,
          ycenter,
          grid,
          row,
          col,
          minXBox,
          maxXBox,
          minYBox,
          maxYBox,
          adjacentNodes,
          subRow,
          subCol,
          nxmin,
          nxmax,
          nymin,
          nymax;

      this.iterCount--;
      this.running = false;

      for (i=0; i < nodesCount; i++) {
        n = nodes[i];
        n.dn.dx = 0;
        n.dn.dy = 0;

        //Find the min and max for both x and y across all nodes
        xmin = Math.min(xmin, n.dn_x - (n.dn_size*self.config.scaleNodes + self.config.nodeMargin) );
        xmax = Math.max(xmax, n.dn_x + (n.dn_size*self.config.scaleNodes + self.config.nodeMargin) );
        ymin = Math.min(ymin, n.dn_y - (n.dn_size*self.config.scaleNodes + self.config.nodeMargin) );
        ymax = Math.max(ymax, n.dn_y + (n.dn_size*self.config.scaleNodes + self.config.nodeMargin) );

      }

      xwidth = xmax - xmin;
      yheight = ymax - ymin;
      xcenter = (xmin + xmax) / 2;
      ycenter = (ymin + ymax) / 2;
      xmin = xcenter - self.config.permittedExpansion*xwidth / 2;
      xmax = xcenter + self.config.permittedExpansion*xwidth / 2;
      ymin = ycenter - self.config.permittedExpansion*yheight / 2;
      ymax = ycenter + self.config.permittedExpansion*yheight / 2;

      grid = {}; //An object of objects where grid[row][col] is an array of node ids representing nodes that fall in that grid. Nodes can fall in more than one grid

      for(row = 0; row < self.config.gridSize; row++) {
        grid[row] = {};
        for(col = 0; col < self.config.gridSize; col++) {
          grid[row][col] = [];
        }
      }

      //Place nodes in grid
      for (i=0; i < nodesCount; i++) {
        n = nodes[i];

        nxmin = n.dn_x - (n.dn_size*self.config.scaleNodes + self.config.nodeMargin);
        nxmax = n.dn_x + (n.dn_size*self.config.scaleNodes + self.config.nodeMargin);
        nymin = n.dn_y - (n.dn_size*self.config.scaleNodes + self.config.nodeMargin);
        nymax = n.dn_y + (n.dn_size*self.config.scaleNodes + self.config.nodeMargin);

        minXBox = Math.floor(self.config.gridSize* (nxmin - xmin) / (xmax - xmin) );
        maxXBox = Math.floor(self.config.gridSize* (nxmax - xmin) / (xmax - xmin) );
        minYBox = Math.floor(self.config.gridSize* (nymin - ymin) / (ymax - ymin) );
        maxYBox = Math.floor(self.config.gridSize* (nymax - ymin) / (ymax - ymin) );
        for(col = minXBox; col <= maxXBox; col++) {
          for(row = minYBox; row <= maxYBox; row++) {
            grid[row][col].push(n.id);
          }
        }
      }


      adjacentNodes = {}; //An object that stores the node ids of adjacent nodes (either in same grid box or adjacent grid box) for all nodes

      for(row = 0; row < self.config.gridSize; row++) {
        for(col = 0; col < self.config.gridSize; col++) {
          grid[row][col].forEach(function(nodeId) {
            if(!adjacentNodes[nodeId]) {
              adjacentNodes[nodeId] = [];
            }
            for(subRow = Math.max(0, row - 1); subRow <= Math.min(row + 1, self.config.gridSize - 1); subRow++) {
              for(subCol = Math.max(0, col - 1); subCol <= Math.min(col + 1,  self.config.gridSize - 1); subCol++) {
                grid[subRow][subCol].forEach(function(subNodeId) {
                  if(subNodeId !== nodeId && adjacentNodes[nodeId].indexOf(subNodeId) === -1) {
                    adjacentNodes[nodeId].push(subNodeId);
                  }
                });
              }
            }
          });
        }
      }

      //If two nodes overlap then repulse them
      for (i=0; i < nodesCount; i++) {
        n1 = nodes[i];
        adjacentNodes[n1.id].forEach(function(nodeId) {
          var n2 = self.sigInst.graph.nodes(nodeId);
          var xDist = n2.dn_x - n1.dn_x;
          var yDist = n2.dn_y - n1.dn_y;
          var dist = Math.sqrt(xDist*xDist + yDist*yDist);
          var collision = (dist < ((n1.dn_size*self.config.scaleNodes + self.config.nodeMargin) + (n2.dn_size*self.config.scaleNodes + self.config.nodeMargin)));
          if(collision) {
            self.running = true;
            if(dist > 0) {
              n2.dn.dx += xDist / dist * (1 + n1.dn_size);
              n2.dn.dy += yDist / dist * (1 + n1.dn_size);
            } else {
              n2.dn.dx += xwidth * 0.01 * (0.5 - Math.random());
              n2.dn.dy += yheight * 0.01 * (0.5 - Math.random());
            }
          }
        });
      }

      for (i=0; i < nodesCount; i++) {
        n = nodes[i];
        if(!n.fixed) {
          n.dn_x = n.dn_x + n.dn.dx * 0.1 * self.config.speed;
          n.dn_y = n.dn_y + n.dn.dy * 0.1 * self.config.speed;
        }
      }

      if(this.running && this.iterCount < 1) {
        this.running = false;
      }

      return this.running;
    };

    this.go = function () {
      this.iterCount = this.config.maxIterations;

      while (this.running) {
        this.atomicGo();
      };

      this.stop();
    };

    this.start = function() {
      if (this.running) return;

      var nodes = this.sigInst.graph.nodes();

      var prefix = this.sigInst.renderers[self.config.rendererIndex].options.prefix;

      this.running = true;

      // Init nodes
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].dn_x = nodes[i][prefix + 'x'];
        nodes[i].dn_y = nodes[i][prefix + 'y'];
        nodes[i].dn_size = nodes[i][prefix + 'size'];
        nodes[i].dn = {
          dx: 0,
          dy: 0
        };
      }
      _eventEmitter[self.sigInst.id].dispatchEvent('start');
      this.go();
    };

    this.stop = function() {
      var nodes = this.sigInst.graph.nodes();

      this.running = false;

      if (this.easing) {
        _eventEmitter[self.sigInst.id].dispatchEvent('interpolate');
        sigma.plugins.animate(
          self.sigInst,
          {
            x: 'dn_x',
            y: 'dn_y'
          },
          {
            easing: self.easing,
            onComplete: function() {
              self.sigInst.refresh();
              for (var i = 0; i < nodes.length; i++) {
                nodes[i].dn = null;
                nodes[i].dn_x = null;
                nodes[i].dn_y = null;
              }
              _eventEmitter[self.sigInst.id].dispatchEvent('stop');
            },
            duration: self.duration
          }
        );
      }
      else {
        // Apply changes
        for (var i = 0; i < nodes.length; i++) {
          nodes[i].x = nodes[i].dn_x;
          nodes[i].y = nodes[i].dn_y;
        }

        this.sigInst.refresh();

        for (var i = 0; i < nodes.length; i++) {
          nodes[i].dn = null;
          nodes[i].dn_x = null;
          nodes[i].dn_y = null;
        }
        _eventEmitter[self.sigInst.id].dispatchEvent('stop');
      }
    };

    this.kill = function() {
      this.sigInst = null;
      this.config = null;
      this.easing = null;
    };
  };

  /**
   * Interface
   * ----------
   */

  /**
   * Configure the layout algorithm.

   * Recognized options:
   * **********************
   * Here is the exhaustive list of every accepted parameter in the settings
   * object:
   *
   *   {?number}            speed               A larger value increases the convergence speed at the cost of precision
   *   {?number}            scaleNodes          The ratio to scale nodes by - a larger ratio will lead to more space around larger nodes
   *   {?number}            nodeMargin          A fixed margin to apply around nodes regardless of size
   *   {?number}            maxIterations       The maximum number of iterations to perform before the layout completes.
   *   {?integer}           gridSize            The number of rows and columns to use when partioning nodes into a grid for efficient computation
   *   {?number}            permittedExpansion  A permitted expansion factor to the overall size of the network applied at each iteration
   *   {?integer}           rendererIndex       The index of the renderer to use for node co-ordinates. Defaults to zero.
   *   {?(function|string)} easing              Either the name of an easing in the sigma.utils.easings package or a function. If not specified, the
   *                                            quadraticInOut easing from this package will be used instead.
   *   {?number}            duration            The duration of the animation. If not specified, the "animationsTime" setting value of the sigma instance will be used instead.
   *
   *
   * @param  {object} config  The optional configuration object.
   *
   * @return {sigma.classes.dispatcher} Returns an event emitter.
   */
  sigma.prototype.configNoverlap = function(config) {

    var sigInst = this;

    if (!config) throw new Error('Missing argument: "config"');

    // Create instance if undefined
    if (!_instance[sigInst.id]) {
      _instance[sigInst.id] = new Noverlap();

      _eventEmitter[sigInst.id] = {};
      sigma.classes.dispatcher.extend(_eventEmitter[sigInst.id]);

      // Binding on kill to clear the references
      sigInst.bind('kill', function() {
        _instance[sigInst.id].kill();
        _instance[sigInst.id] = null;
        _eventEmitter[sigInst.id] = null;
      });
    }

    _instance[sigInst.id].init(sigInst, config);

    return _eventEmitter[sigInst.id];
  };

  /**
   * Start the layout algorithm. It will use the existing configuration if no
   * new configuration is passed.

   * Recognized options:
   * **********************
   * Here is the exhaustive list of every accepted parameter in the settings
   * object
   *
   *   {?number}            speed               A larger value increases the convergence speed at the cost of precision
   *   {?number}            scaleNodes          The ratio to scale nodes by - a larger ratio will lead to more space around larger nodes
   *   {?number}            nodeMargin          A fixed margin to apply around nodes regardless of size
   *   {?number}            maxIterations       The maximum number of iterations to perform before the layout completes.
   *   {?integer}           gridSize            The number of rows and columns to use when partioning nodes into a grid for efficient computation
   *   {?number}            permittedExpansion  A permitted expansion factor to the overall size of the network applied at each iteration
   *   {?integer}           rendererIndex       The index of the renderer to use for node co-ordinates. Defaults to zero.
   *   {?(function|string)} easing              Either the name of an easing in the sigma.utils.easings package or a function. If not specified, the
   *                                            quadraticInOut easing from this package will be used instead.
   *   {?number}            duration            The duration of the animation. If not specified, the "animationsTime" setting value of the sigma instance will be used instead.
   *
   *
   *
   * @param  {object} config  The optional configuration object.
   *
   * @return {sigma.classes.dispatcher} Returns an event emitter.
   */

  sigma.prototype.startNoverlap = function(config) {

    var sigInst = this;

    if (config) {
      this.configNoverlap(sigInst, config);
    }

    _instance[sigInst.id].start();

    return _eventEmitter[sigInst.id];
  };

  /**
   * Returns true if the layout has started and is not completed.
   *
   * @return {boolean}
   */
  sigma.prototype.isNoverlapRunning = function() {

    var sigInst = this;

    return !!_instance[sigInst.id] && _instance[sigInst.id].running;
  };

}).call(this);
},{}],3:[function(require,module,exports){
/**
 * This plugin provides a method to animate a sigma instance by interpolating
 * some node properties. Check the sigma.plugins.animate function doc or the
 * examples/animate.html code sample to know more.
 */
(function() {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  sigma.utils.pkg('sigma.plugins');

  var _id = 0,
      _cache = {};

  // TOOLING FUNCTIONS:
  // ******************
  function parseColor(val) {
    if (_cache[val])
      return _cache[val];

    var result = [0, 0, 0];

    if (val.match(/^#/)) {
      val = (val || '').replace(/^#/, '');
      result = (val.length === 3) ?
        [
          parseInt(val.charAt(0) + val.charAt(0), 16),
          parseInt(val.charAt(1) + val.charAt(1), 16),
          parseInt(val.charAt(2) + val.charAt(2), 16)
        ] :
        [
          parseInt(val.charAt(0) + val.charAt(1), 16),
          parseInt(val.charAt(2) + val.charAt(3), 16),
          parseInt(val.charAt(4) + val.charAt(5), 16)
        ];
    } else if (val.match(/^ *rgba? *\(/)) {
      val = val.match(
        /^ *rgba? *\( *([0-9]*) *, *([0-9]*) *, *([0-9]*) *(,.*)?\) *$/
      );
      result = [
        +val[1],
        +val[2],
        +val[3]
      ];
    }

    _cache[val] = {
      r: result[0],
      g: result[1],
      b: result[2]
    };

    return _cache[val];
  }

  function interpolateColors(c1, c2, p) {
    c1 = parseColor(c1);
    c2 = parseColor(c2);

    var c = {
      r: c1.r * (1 - p) + c2.r * p,
      g: c1.g * (1 - p) + c2.g * p,
      b: c1.b * (1 - p) + c2.b * p
    };

    return 'rgb(' + [c.r | 0, c.g | 0, c.b | 0].join(',') + ')';
  }

  /**
   * This function will animate some specified node properties. It will
   * basically call requestAnimationFrame, interpolate the values and call the
   * refresh method during a specified duration.
   *
   * Events fired though sigma instance:
   * *************
   * animate.start  Fired at the beginning of the animation.
   * animate.end    Fired at the end of the animation.
   *
   * Recognized parameters:
   * **********************
   * Here is the exhaustive list of every accepted parameters in the settings
   * object:
   *
   *   {?array}             nodes      An array of node objects or node ids. If
   *                                   not specified, all nodes of the graph
   *                                   will be animated.
   *   {?(function|string)} easing     Either the name of an easing in the
   *                                   sigma.utils.easings package or a
   *                                   function. If not specified, the
   *                                   quadraticInOut easing from this package
   *                                   will be used instead.
   *   {?number}            duration   The duration of the animation. If not
   *                                   specified, the "animationsTime" setting
   *                                   value of the sigma instance will be used
   *                                   instead.
   *   {?function}          onComplete Eventually a function to call when the
   *                                   animation is ended.
   *
   * @param  {sigma}   s       The related sigma instance.
   * @param  {object}  animate An hash with the keys being the node properties
   *                           to interpolate, and the values being the related
   *                           target values.
   * @param  {?object} options Eventually an object with options.
   */
  sigma.plugins.animate = function(s, animate, options) {
    var o = options || {},
        id = ++_id,
        duration = o.duration || s.settings('animationsTime'),
        easing = typeof o.easing === 'string' ?
          sigma.utils.easings[o.easing] :
          typeof o.easing === 'function' ?
          o.easing :
          sigma.utils.easings.quadraticInOut,
        start = sigma.utils.dateNow(),
        nodes,
        startPositions;

    if (o.nodes && o.nodes.length) {
      if (typeof o.nodes[0] === 'object')
        nodes = o.nodes;
      else
        nodes = s.graph.nodes(o.nodes); // argument is an array of IDs
    }
    else
      nodes = s.graph.nodes();

    // Store initial positions:
    startPositions = nodes.reduce(function(res, node) {
      var k;
      res[node.id] = {};
      for (k in animate)
        if (k in node)
          res[node.id][k] = node[k];
      return res;
    }, {});

    s.animations = s.animations || Object.create({});
    sigma.plugins.killAnimate(s);

    s.dispatchEvent('animate.start'); // send a sigma event

    function step() {
      var p = (sigma.utils.dateNow() - start) / duration;

      if (p >= 1) {
        nodes.forEach(function(node) {
          for (var k in animate)
            if (k in animate && animate[k] in node)
              node[k] = node[animate[k]];
        });

        s.refresh({skipIndexation: true});
        if (typeof o.onComplete === 'function') {
          o.onComplete();
        }
        s.dispatchEvent('animate.end'); // send a sigma event
      }
      else {
        p = easing(p);
        nodes.forEach(function(node) {
          for (var k in animate)
            if (k in animate && animate[k] in node) {
              if (k.match(/color$/))
                node[k] = interpolateColors(
                  startPositions[node.id][k],
                  node[animate[k]],
                  p
                );
              else
                node[k] =
                  node[animate[k]] * p +
                  startPositions[node.id][k] * (1 - p);
            }
        });

        s.refresh({skipIndexation: true});
        s.animations[id] = requestAnimationFrame(step);
      }
    }

    step();
  };

  sigma.plugins.killAnimate = function(s) {
    for (var k in (s.animations || {}))
      cancelAnimationFrame(s.animations[k]);
  };
}).call(window);

},{}],4:[function(require,module,exports){
;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw new Error('sigma is not declared');

  // Initialize package:
  sigma.utils.pkg('sigma.plugins');

  /**
   * Sigma design
   * =============================
   *
   * @author Sébastien Heymann <seb@linkurio.us> (Linkurious)
   * @version 0.4
   */


  /**
   * Convert Javascript string in dot notation into an object reference.
   *
   * @param  {object} obj The object.
   * @param  {string} str The string to convert, e.g. 'a.b.etc'.
   * @return {?}          The object reference.
   */
  function strToObjectRef(obj, str) {
    // http://stackoverflow.com/a/6393943
    return str.split('.').reduce(function(obj, i) { return obj[i] }, obj);
  }

  /**
   * This custom tool function removes every pair key/value from an hash. The
   * goal is to avoid creating a new object while some other references are
   * still hanging in some scopes...
   *
   * @param  {object} obj The object to empty.
   * @return {object}     The empty object.
   */
  function emptyObject(obj) {
    var k;

    for (k in obj)
      if (!('hasOwnProperty' in obj) || obj.hasOwnProperty(k))
        delete obj[k];

    return obj;
  }

  /**
   * Fast deep copy function.
   *
   * @param  {object} o The object.
   * @return {object}   The object copy.
   */
  function deepCopy(o) {
    var copy = Object.create(null);
    for (var i in o) {
      if (typeof o[i] === "object" && o[i] !== null) {
        copy[i] = deepCopy(o[i]);
      }
      else if (typeof o[i] === "function" && o[i] !== null) {
        // clone function:
        eval(" copy[i] = " +  o[i].toString());
        //copy[i] = o[i].bind(_g);
      }

      else
        copy[i] = o[i];
    }
    return copy;
  }

  /**
   * This method will put the values in different bins using a linear scale,
   * for a specified number of bins (i.e. histogram). It will return a
   * dictionary of bins indexed by the specified values.
   *
   * @param  {array}  values The values.
   * @param  {number} nbins  The number of bins.
   * @return {object}        The basic histogram.
   */
  function baseHistogram(values, nbins) {
    var numlist,
        min,
        max,
        bin,
        res = {};

    if (!values.length)
      return res;

    // sort values by inverse order:
    numlist = values.map(function (val) {
      return parseFloat(val);
    })
    .sort(function(a, b) {
      return a - b;
    });

    min = numlist[0];
    max = numlist[numlist.length - 1];


    if (max - min !== 0) {
      numlist.forEach(function (num) {
        bin = Math.floor(nbins * Math.abs(num - min) / Math.abs(max - min));
        bin -= (bin == nbins) ? 1 : 0;
        res[num] = bin;
      });
    } else {
      // if the max is the same as the minimum, we put all the numbers in the same bin.
      numlist.forEach(function(num){
        res[num] = 0;
      });
    }

    return res;
  }

  /**
   * This function will generate a consolidated histogram of values grouped by
   * bins. The result is an array of objects ordered by bins. Each object
   * contains the list of `values` in the `bin`, the `min` and `max` values,
   * and the `ratio` of values in the bin compared to the largest bin.
   *
   * @param  {object} h         The nodes or edges histograms.
   * @param  {string} p         The property accessor.
   * @return {array}            The consolidated histogram.
   */
  function histogram(h, p) {
    var d = [],
        bins,
        maxOcc = 0;

    if (h && h[p]) {
      Object.keys(h[p]).forEach(function(value) {
        var bin = h[p][value];
        d[bin] = d[bin] || [];
        d[bin].push(+value);
      });

      bins = (d.length !== 1 ) ? d.length : 7;

      for (var bin = 0; bin < bins; bin++) {
        if (d[bin]) {
          maxOcc = (maxOcc > d[bin].length) ? maxOcc : d[bin].length;
        }
      }

      for (var bin = 0; bin < bins; bin++) {
        if (d[bin] === undefined) {
          d[bin] = [];
        }
        d[bin] = {
          bin: bin,
          values: d[bin],
          ratio: d[bin].length / maxOcc
        };
        // d[bin][visualVar] = design.palette.sequential[bins][bin];

        if (d[bin].values.length) {
          d[bin].min = Math.min.apply(null, d[bin].values);
          d[bin].max = Math.max.apply(null, d[bin].values);
        }
      }
    }
    return d;
  }

  /**
   * Add reference to nodes or edges in histogram bins.
   *
   * @param  {object} h         The nodes or edges histograms.
   * @param  {Vision} vision    The vision object.
   * @param  {string} p         The property accessor.
   * @return {array}            The consolidated histogram.
   */
  function resolveHistogram(h, vision, p) {
    var items = vision.get(p),
      item,
      value,
      nBins = h.length,
      maxOcc = 0;

    for (var bin = 0; bin < nBins; bin++) {
      h[bin].items = [];
    }

    Object.keys(items).forEach(function(value) {
      for (var i = 0; i < items[value].items.length; i++) {
        item = items[value].items[i];
        value = strToObjectRef(item, p);

        for (var bin = 0; bin < h.length; bin++) {
          if ((!'min' in h[bin]) || (!'max' in h[bin]))
            continue;

          if (h[bin].min <= value && value <= h[bin].max) {
            h[bin].items.push(item);
          }
        }
      }
    });

    for (var bin = 0; bin < nBins; bin++) {
      if (h[bin].items) {
        maxOcc = (maxOcc > h[bin].items.length) ? maxOcc : h[bin].items.length;
      }
    }

    for (var bin = 0; bin < nBins; bin++) {
      h[bin].itemsRatio = h[bin].items.length / maxOcc;
    }

    return h;
  }

  // Utilities
  function download(fileEntry, extension, filename) {
    var blob = null,
        objectUrl = null,
        dataUrl = null;

    if(window.Blob){
      // use Blob if available
      blob = new Blob([fileEntry], {type: 'text/json'});
      objectUrl = window.URL.createObjectURL(blob);
    }
    else {
      // else use dataURI
      dataUrl = 'data:text/json;charset=UTF-8,' + encodeURIComponent(fileEntry);
    }

    if (navigator.msSaveBlob) { // IE11+ : (has Blob, but not a[download])
      navigator.msSaveBlob(blob, filename);
    } else if (navigator.msSaveOrOpenBlob) { // IE10+ : (has Blob, but not a[download])
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      // A-download
      var anchor = document.createElement('a');
      anchor.setAttribute('href', (window.Blob) ? objectUrl : dataUrl);
      anchor.setAttribute('download', filename || 'graph.' + extension);

      // Firefox requires the link to be added to the DOM before it can be clicked.
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }

    if (objectUrl) {
      setTimeout(function() { // Firefox needs a timeout
        window.URL.revokeObjectURL(objectUrl);
      }, 0);
    }
  }


  /**
   * This constructor instanciates a new vision on a specified dataset (nodes
   * or edges).
   *
   * @param  {sigma} s              The sigma instance.
   * @param  {function} datasetName The dataset. Available options: 'nodes',
   *                                'edges'.
   * @param  {object} mappings      The style mappings object.
   * @param  {object} palette       The palette object.
   * @return {Vision}               The vision instance.
   */
  function Vision(s, datasetName, mappings, palette) {
    var that = this;

    // defined below:
    this.visualVars = null;

    // mappings may be overriden:
    this.mappings = null;

    // palette may be overriden:
    this.palette = palette;

    // index of data properties:
    this.idx = Object.create(null);

    // histograms of data properties for visual variables:
    this.histograms = Object.create(null);

    // index of deprecated visions on data properties:
    this.deprecated = Object.create(null);

    // some original sigma settings:
    this.sigmaSettings = Object.create(null);

    // properties are sequential or qualitative data
    this.dataTypes = Object.create(null);

    // original values of visual variables
    this.originalVisualVariable = Object.create(null);

    // nodes or edges:
    if (datasetName === 'nodes') {
      this.visualVars = ['color', 'size', 'label', 'type', 'icon', 'image'];
      this.mappings = mappings.nodes;
      this.dataset = function() { return s.graph.nodes(); }
    }
    else if (datasetName === 'edges') {
      this.visualVars = ['color', 'size', 'label', 'type'];
      this.mappings = mappings.edges;
      this.dataset = function() { return s.graph.edges(); }
    }
    else
      throw new Error('Invalid argument: "datasetName" is not "nodes" or "edges", was ' + datasetName);


    /**
     * This method will index the collection with the specified property, and
     * will compute all styles related to the specified property for each item.
     *
     * @param  {string}  key The property accessor.
     */
    this.update = function(key) {
      // console.log('Vision.update', key);
      var self = this;

      if (key === undefined)
        throw new Error('Missing argument: "key".');

      if (typeof key !== 'string')
        throw new Error('Invalid argument: "key" is not a string, was ' + key);

      var val,
          byFn,
          schemeFn,
          isSequential = undefined,
          isArray = true;

      byFn = function(item, key) { return strToObjectRef(item, key); };
      schemeFn = function(palette, key) { return strToObjectRef(palette, key); };

      function insertItem(val, item) {
        if (self.idx[key][val] === undefined) {
          self.idx[key][val] = {
            key: val,
            items: [],
            styles: Object.create(null)
          };
        }
        self.idx[key][val].items.push(item);

        if (isSequential || isSequential === undefined) {
          isSequential = (typeof val === 'number');
          // TODO: throw error if is number AND (is NaN or is Infinity)
        }
      }

      // Index the collection:
      this.idx[key] = {};
      this.dataset().forEach(function (item) {
        val = byFn(item, key);
        if (val !== undefined) {
          if (isArray) {
            isArray = Array.isArray(val) ? isArray : false;
          }
          if (isArray) {
            if (val.length === 1) {
              insertItem(val[0], item);
            }
            else {
              val.forEach(function (v) {
                insertItem(v, item);
              });
            }
          }
          else {
            insertItem(val, item);
          }
        }
      });

      this.dataTypes[key] = { sequential: isSequential, array: isArray };
      this.deprecated[key] = false;

      // Find the max number of occurrence of values:
      var maxOcc = 0;
      for (val in this.idx[key]) {
        maxOcc =
          (maxOcc < this.idx[key][val].items.length) ?
          this.idx[key][val].items.length :
          maxOcc;
      }

      // number of occurrence / max number of occurrences of the value:
      Object.keys(this.idx[key]).forEach(function (val) {
        self.idx[key][val].ratio =
          parseFloat(self.idx[key][val].items.length / maxOcc);
      });

      var format,
          colorHist,
          sizeHist,
          colorScheme,
          typeScheme,
          iconScheme,
          imageScheme,
          bins,
          visualVars,
          nset = 0;

      // Visual variables mapped to the specified property:
      visualVars = Object.keys(that.mappings).filter(function (visualVar) {
        return (
          (that.mappings[visualVar]) &&
          (that.mappings[visualVar].by !== undefined) &&
          (that.mappings[visualVar].by.toString() == key)
        );
      });

      // Validate the mappings and compute histograms if needed:
      visualVars.forEach(function (visualVar) {
        switch (visualVar) {
          case 'color':
            colorScheme = that.mappings.color.scheme;

            if (typeof colorScheme !== 'string')
              throw new Error('color.scheme "' + colorScheme + '" is not a string.');

            if (isSequential) {
              bins = that.mappings.color.bins || 7;
              self.histograms.color = self.histograms.color || {};
              self.histograms.color[key] = baseHistogram(Object.keys(self.idx[key]), bins);
            }

            break;

          case 'label':
            format = that.mappings.label.format || function(item) {
              return (typeof item === 'string') ? item : item.label;
            };

            if (typeof format !== 'function')
              throw new Error('label.format "' + format + '" is not a function.');
            break;

          case 'size':
            if (isSequential === undefined) break;

            if (!isSequential)
              throw new Error('One value of the property "' + key + '" is not a number.');

            self.histograms.size = self.histograms.size || {};
            self.histograms.size[key] = baseHistogram(
              Object.keys(self.idx[key]),
              (that.mappings.size.bins || 7)
            );
            break;

          case 'type':
            typeScheme = that.mappings.type.scheme;

            if (typeof typeScheme !== 'string')
              throw new Error('type.scheme "' + typeScheme + '" is not a string.');

            break;

          case 'icon':
            iconScheme = that.mappings.icon.scheme;

            if (typeof iconScheme !== 'string')
              throw new Error('icon.scheme "' + iconScheme + '" is not a string.');

            break;

          case 'image':
            imageScheme = that.mappings.image.scheme;

            if (typeof imageScheme !== 'string')
              throw new Error('type.scheme "' + imageScheme + '" is not a string.');

            break;
        }
      });

      // Compute all styles related to the property for each item:
      Object.keys(this.idx[key]).forEach(function (val) {
        visualVars.forEach(function (visualVar) {
          switch (visualVar) {

            case 'color':
              if (isSequential) {
                self.idx[key][val].styles.color = function() {
                  var bin = self.histograms.color[key][val];
                  return schemeFn(that.palette, colorScheme)[bins][bin];
                };
              }
              else {
                self.idx[key][val].styles.color = function() {
                  if (schemeFn(that.palette, colorScheme) === undefined)
                    throw new Error('Wrong or undefined color scheme.');

                  if (that.mappings.color.set > 0) {
                    var setItem = schemeFn(that.palette, colorScheme)[that.mappings.color.set][nset];
                    nset = (nset + 1) % that.mappings.color.set;
                    return setItem;
                  }

                  return schemeFn(that.palette, colorScheme)[val];
                };
              }
              break;

            case 'label':
              self.idx[key][val].styles.label = function(item) {
                return format(byFn(item, key));
              };
              break;

            case 'size':
              self.idx[key][val].styles.size = function() {
                return 1 + self.histograms.size[key][val];
              };
              break;

            case 'type':
              self.idx[key][val].styles.type = function() {
                if (schemeFn(that.palette, typeScheme) === undefined)
                  throw new Error('Wrong or undefined type scheme.');

                return schemeFn(that.palette, typeScheme)[val];
              };
              break;

            case 'icon':
              self.idx[key][val].styles.icon = function() {
                if (schemeFn(that.palette, iconScheme) === undefined)
                  throw new Error('Wrong or undefined icon scheme.');

                return schemeFn(that.palette, iconScheme)[val];
              };
              break;

            case 'image':
              self.idx[key][val].styles.image = function() {
                if (schemeFn(that.palette, imageScheme) === undefined)
                  throw new Error('Wrong or undefined image scheme.');

                return schemeFn(that.palette, imageScheme)[val];
              };
              break;
          }
        });
      });
    };

    /**
     * This method will return the vision on a specified property. It will update
     * the vision on the property if it is deprecated or missing.
     *
     * @param  {string} key  The property accessor.
     * @return {object}      The vision on the property.
     */
    this.get = function (key) {
      if (key === undefined)
        throw new TypeError('Missing argument: "key".');

      if (typeof key !== 'string')
        throw new TypeError('Invalid argument: "key" is not a string, was ' + key);

      // lazy updating:
      if (this.deprecated[key]) this.update(key);

      // lazy indexing:
      if (this.idx[key] === undefined) this.update(key);

      return this.idx[key];
    };

    /**
     * This method will apply a mapping between a visual variable and a property.
     * It will update the vision on the property if it is deprecated or missing.
     * It will stores the original value of the visual variable for each item.
     * If the new value is `undefined`, it will keep the original value.
     * Available visual variables are stored in `visualVars`.
     *
     * @param {string} visualVar The name of the visual variable.
     * @param {string} key       The property accessor.
     */
    this.applyStyle = function(visualVar, key) {
      if (key === undefined)
        throw new TypeError('Missing argument: "key"');

      if (typeof key !== 'string')
        throw new TypeError('Invalid argument: "key" is not a string, was ' + key);

      if (this.visualVars.indexOf(visualVar) == -1)
        throw new Error('Unknown style "' + visualVar + '"');

      var self = this,
          idxp = this.get(key);

      if (visualVar === 'color' && self.dataTypes[key].array) {
        this.dataset().forEach(function (item) {
          delete item.colors;
        });

        Object.keys(idxp).forEach(function (val) {
          var o = idxp[val];
          o.items.forEach(function (item) {
            item.colors = [];
          });
        });
      }

      Object.keys(idxp).forEach(function (val) {
        var o = idxp[val];
        o.items.forEach(function (item) {
          if (item !== undefined &&
              o.styles !== undefined &&
              typeof o.styles[visualVar] === 'function') {

            if (!self.originalVisualVariable[item.id]) {
              self.originalVisualVariable[item.id] = {};
            }
            if (!(visualVar in self.originalVisualVariable[item.id])) {
              // non-writable property
              Object.defineProperty(self.originalVisualVariable[item.id], visualVar, {
               enumerable: true,
               value: item[visualVar]
              });
            }

            var newVal = o.styles[visualVar](item);

            if (visualVar === 'color' && self.dataTypes[key].array) {
              if (newVal !== undefined) {
                item.color = newVal;  // backward-compatibility
                item.colors.push(newVal);
              }
            }
            else if (newVal !== undefined) {
              item[visualVar] = newVal;
            }
          }
          else {
            if (typeof o.styles[visualVar] === 'function')
              throw new TypeError(o.styles + '.' + visualVar + 'is not a function, was ' + o.styles[visualVar]);
          }
        });
      });

      if (visualVar === 'size') {
        if (datasetName === 'nodes') {
          if (this.mappings.size.min > this.mappings.size.max) {
            throw new RangeError('nodes.size.min must be ' +
            'lower or equal than nodes.size.max');
          }

          if (this.mappings.size.min) {
            if (!this.sigmaSettings.minNodeSize) {
              this.sigmaSettings.minNodeSize = s.settings('minNodeSize');
            }
            s.settings('minNodeSize', this.mappings.size.min);
          }

          if (this.mappings.size.max) {
            if (!this.sigmaSettings.maxNodeSize) {
              this.sigmaSettings.maxNodeSize = s.settings('maxNodeSize');
            }
            s.settings('maxNodeSize', this.mappings.size.max);
          }
        }
        else if (datasetName === 'edges') {
          if (this.mappings.size.min > this.mappings.size.max) {
            throw new RangeError('edges.size.min must be '+
            'lower or equal than edges.size.max');
          }

          if (this.mappings.size.min) {
            if (!this.sigmaSettings.minEdgeSize) {
              this.sigmaSettings.minEdgeSize = s.settings('minEdgeSize');
            }
            s.settings('minEdgeSize', this.mappings.size.min);
          }

          if (this.mappings.size.max) {
            if (!this.sigmaSettings.maxEdgeSize) {
              this.sigmaSettings.maxEdgeSize = s.settings('maxEdgeSize');
            }
            s.settings('maxEdgeSize', this.mappings.size.max);
          }
        }
      }
    };

    /**
     * This method will reset a mapping between a visual variable and a property.
     * It restores the original value of the visual variable for each item. It
     * will do nothing if the vision on the property is missing.
     * Available visual variables are stored in `visualVars`.
     *
     * @param {string} visualVar The name of the visual variable.
     * @param {string} key       The property accessor.
     */
    this.resetStyle = function(visualVar, key) {
      if (key === undefined)
        throw new TypeError('Missing argument: "key"');

      if (typeof key !== 'string')
        throw new TypeError('Invalid argument: "key" is not a string, was ' + key);

      if (this.visualVars.indexOf(visualVar) == -1)
        throw new Error('Unknown style "' + visualVar + '".');

      if (this.idx[key] === undefined) return;

      var self = this,
          idxp = this.get(key);

      if (visualVar === 'color' && self.dataTypes[key].array) {
        Object.keys(idxp).forEach(function (val) {
          var o = idxp[val];
          o.items.forEach(function (item) {
            delete item.colors;
          });
        });
      }

      Object.keys(idxp).forEach(function (val) {
        var o = idxp[val];
        o.items.forEach(function (item) {
          if (item !== undefined && item[visualVar] !== undefined) {

            if (self.originalVisualVariable[item.id] === undefined ||
              self.originalVisualVariable[item.id][visualVar] === undefined) {

              // Avoid Sigma bug on edge with no size
              if (self.key === 'edges' && visualVar === 'size')
                item.size = 1;
              else
                delete item[visualVar];
          }
            else
              item[visualVar] = self.originalVisualVariable[item.id][visualVar];
          }
        });
      });

      if (visualVar === 'size') {
        if (datasetName === 'nodes') {
          if (this.sigmaSettings.minNodeSize) {
            s.settings('minNodeSize', this.sigmaSettings.minNodeSize);
          }
          if (this.sigmaSettings.maxNodeSize) {
            s.settings('maxNodeSize', this.sigmaSettings.maxNodeSize);
          }
        }
        else if (datasetName === 'edges') {
          if (this.sigmaSettings.minEdgeSize) {
            s.settings('minEdgeSize', this.sigmaSettings.minEdgeSize);
          }
          if (this.sigmaSettings.maxEdgeSize) {
            s.settings('maxEdgeSize', this.sigmaSettings.maxEdgeSize);
          }
        }
      }
    };

    /**
     * This method empties the arrays and indexes.
     */
    this.clear = function() {
      this.visualVars.length = 0;
      emptyObject(this.idx);
      emptyObject(this.histograms);
      emptyObject(this.deprecated);
      emptyObject(this.sigmaSettings);
      emptyObject(this.dataTypes);
      emptyObject(this.originalVisualVariable);
    };

    return this;
  };


  /**
   * design Object
   * ------------------
   * @param  {sigma}   s       The related sigma instance.
   * @param  {?object} options The object contains `palette` and `styles`.
   *                           Styles are mappings between visual variables and
   *                           data properties on nodes and edges.
   */
  function design(s, options) {
    this.palette = (options || {}).palette || {};
    this.styles = sigma.utils.extend((options || {}).styles || {}, {
      nodes: {},
      edges: {}
    });

    var self = this,
        _visionOnNodes = new Vision(s, 'nodes', this.styles, this.palette),
        _visionOnEdges = new Vision(s, 'edges', this.styles, this.palette);

    s.bind('kill', function() {
      sigma.plugins.killDesign(s);
    });


    /**
     * This method will set new styles. Styles are mappings between visual
     * variables and data properties on nodes and edges. It will deprecate
     * existing styles.
     *
     * @param  {object}  styles The styles object.
     * @return {design}       The instance.
     */
    this.setStyles = function(styles) {
      this.styles = sigma.utils.extend(styles || {}, {
        nodes: {},
        edges: {}
      });

      _visionOnNodes.mappings = this.styles.nodes;
      _visionOnEdges.mappings = this.styles.edges;

      this.deprecate();
      return this;
    };

    /**
     * This method will set a specified node style. Styles are mappings between
     * visual variables and data properties on nodes and edges. It will
     * deprecate existing node styles bound to the specified data property.
     *
     * @param  {string}  visualVar The visual variable.
     * @param  {object}  params    The style parameter.
     * @return {design}          The instance.
     */
    this.nodesBy = function(visualVar, params) {
      this.styles = sigma.utils.extend(this.styles || {}, {
        nodes: {},
        edges: {}
      });

      this.styles.nodes[visualVar] = params;
      _visionOnNodes.mappings = this.styles.nodes;

      if (params.by) {
        this.deprecate('nodes', params.by);
      }

      return this;
    };

    /**
     * This method will set a specified edge style. Styles are mappings between
     * visual variables and data properties on nodes and edges. It will
     * deprecate existing edge styles bound to the specified data property.
     *
     * @param  {string}  visualVar The visual variable.
     * @param  {object}  params    The style parameter.
     * @return {design}          The instance.
     */
    this.edgesBy = function(visualVar, params) {
      this.styles = sigma.utils.extend(this.styles || {}, {
        nodes: {},
        edges: {}
      });

      this.styles.edges[visualVar] = params;
      _visionOnEdges.mappings = this.styles.edges;

      if (params.by) {
        this.deprecate('edges', params.by);
      }

      return this;
    };


    /**
     * This method will set a new palette. It will deprecate existing styles.
     *
     * @param  {object}  palette The palette object.
     * @return {design}        The instance.
     */
    this.setPalette = function(palette) {
      this.palette = palette;

      _visionOnNodes.palette = this.palette;
      _visionOnEdges.palette = this.palette;

      this.deprecate();
      return this;
    };

    /**
     * This method is used to get the styles bound to each node of the graph for
     * a specified property.
     *
     * @param  {string} key The property accessor. Use a dot notation like
     *                      'data.myProperty'.
     * @return {object}     The styles.
     */
    this.nodes = function(key) {
      return _visionOnNodes.get(key);
    };

    /**
     * This method is used to get the styles bound to each edge of the graph for
     * a specified property.
     *
     * @param  {string} key The property accessor. Use a dot notation like
     *                      'data.myProperty'.
     * @return {object}     The styles.
     */
    this.edges = function(key) {
      return _visionOnEdges.get(key);
    };

    /**
     * This method will export a deep copy of the internal `Vision` objects,
     * which store the indexes, bound styles and histograms.
     *
     * @return {object}  The object of keys `nodes` and `edges`.
     */
    this.inspect = function() {
      return {
        nodes: deepCopy(_visionOnNodes),
        edges: deepCopy(_visionOnEdges)
      };
    };

    function __apply(mappings, vision, visualVar) {
      if (!visualVar) {
        // apply all styles if no visual variable is specified:
        Object.keys(mappings).forEach(function (visuVar) {
          mappings[visuVar].active = false;
          if (mappings[visuVar] && mappings[visuVar].by) {
            vision.applyStyle(visuVar, mappings[visuVar].by);
            mappings[visuVar].active = true;
          }
        });
      }
      else if (mappings[visualVar] && mappings[visualVar].by) {
        // apply the style of the specified visual variable:
        vision.applyStyle(visualVar, mappings[visualVar].by);
        mappings[visualVar].active = true;
      }

      if (s) s.refresh({skipIndexation: true});
    };

    /**
     * This method is used to apply all target styles or a specified target
     * style, depending on how it is called. Apply all styles if it is called
     * without argument. It will refresh the display.
     *
     * @param  {?string} target     The data target. Available values:
     *                              "nodes", "edges".
     * @param  {?string} visualVar  The visual variable. Available values:
     *                              "color", "size", "label".
     * @return {design}            The instance.
     */
    this.apply = function(target, visualVar) {
      if (!this.styles) return;

      if (!target) {
        __apply(this.styles.nodes, _visionOnNodes, visualVar);
        __apply(this.styles.edges, _visionOnEdges, visualVar);
        return this;
      }

      switch (target) {
        case 'nodes':
          __apply(this.styles.nodes, _visionOnNodes, visualVar);
          break;
        case 'edges':
          __apply(this.styles.edges, _visionOnEdges, visualVar);
          break;
        default:
          throw new Error('Invalid argument: "target" is not "nodes" or "edges", was ' + target);
      }

      return this;
    };

    function __reset(mappings, vision, visualVar) {
      if (!visualVar) {
        // reset all styles if no visual variable is specified:
        Object.keys(mappings).forEach(function (visuVar) {
          if (mappings[visuVar].active) {
            vision.resetStyle(visuVar, mappings[visuVar].by);
            mappings[visuVar].active = false;
          }
        });
      }
      else if (mappings[visualVar] && mappings[visualVar].active) {
        // reset the style of the specified visual variable:
        vision.resetStyle(visualVar, mappings[visualVar].by);
        mappings[visualVar].active = false;
      }

      if (s) s.refresh({skipIndexation: true});
    };

    /**
     * This method is used to reset all target styles or a specified target style,
     * depending on how it is called. reset all styles if it is called
     * without argument. It will do nothing if the visual variable
     * is not in the existing styles. It will finally refresh the display.
     *
     * @param  {?string} target     The data target. Available values:
     *                               "nodes", "edges".
     * @param  {?string} visualVar  The visual variable. Available values:
     *                             "color", "size", "label".
     * @return {design}  The instance.
     */
    this.reset = function(target, visualVar) {
      if (!this.styles) return;

      if (!target) {
        __reset(this.styles.nodes, _visionOnNodes, visualVar);
        __reset(this.styles.edges, _visionOnEdges, visualVar);
        return this;
      }

      switch (target) {
        case 'nodes':
          __reset(this.styles.nodes, _visionOnNodes, visualVar);
          break;
        case 'edges':
          __reset(this.styles.edges, _visionOnEdges, visualVar);
          break;
        default:
          throw new Error('Invalid argument: "target" is not "nodes" or "edges", was ' + target);
      }

      return this;
    };

    /**
     * This method is used when the styles are deprecated, for instance when the
     * graph has changed. The specified property style will be remade the next
     * time it is called using `.apply()`, `.nodes()`, or `.edges()`
     * or all property styles if called without argument.
     *
     * @param  {?string} target  The data target. Available values:
     *                           "nodes", "edges".
     * @param  {?string} key     The property accessor. Use a dot notation like
     *                           'data.myProperty'.
     *
     * @return {design}          The instance.
     */
    this.deprecate = function(target, key) {
      if (target) {
        if (target !== 'nodes' && target !== 'edges')
          throw new Error('Invalid argument: "target" is not "nodes" or "edges", was ' + target);

        if (key) {
          if (target === 'nodes') {
            _visionOnNodes.deprecated[key] = true;
          }
          else if (target === 'edges') {
            _visionOnEdges.deprecated[key] = true;
          }
        }
        else {
          if (target === 'nodes') {
            Object.keys(_visionOnNodes.deprecated).forEach(function(prop) {
              _visionOnNodes.deprecated[prop] = true;
            });
          }
          else if (target === 'edges') {
            Object.keys(_visionOnEdges.deprecated).forEach(function(prop) {
              _visionOnEdges.deprecated[prop] = true;
            });
          }
        }
      }
      else {
        Object.keys(_visionOnNodes.deprecated).forEach(function(prop) {
          _visionOnNodes.deprecated[prop] = true;
        });

        Object.keys(_visionOnEdges.deprecated).forEach(function(prop) {
          _visionOnEdges.deprecated[prop] = true;
        });
      }

      return this;
    };

    /**
     * Delete styles from a node or an edge according to its specified id,
     * target type and property reference.
     *
     * @param {string}  target The data target. Available values: "nodes", "edges".
     * @param {number}  id     The id of the node or edge to update
     * @param {string}  key    The property key to delete styles from.
     *
     * @return {design}        The instance.
     */
    this.deletePropertyStylesFrom = function(target, id, key){

      if (id == null){
        throw new TypeError('Missing argument: "id".');
      }
      if (target !== 'nodes' && target !== 'edges') {
        throw new Error('Invalid argument: "target" is not "nodes" or "edges", was ' + target);
      }
      if (key == null){
        throw new TypeError('Missing argument: "key".');
      }

      var
        computedStyles,
        computedStyle,
        appliedStyles,
        item;

      if (target === 'nodes'){
        computedStyles = _visionOnNodes.get(key);
      } else {
        computedStyles = _visionOnEdges.get(key);
      }

      var values = Object.keys(computedStyles);

      for (var k = 0 ; k < values.length ; k++){

        computedStyle = computedStyles[values[k]];
        appliedStyles = Object.keys(computedStyle.styles);

        for (var i = 0 ; i < computedStyle.items.length ; i++){

          item = computedStyle.items[i];
          if (item.id === id) {

            // For a given property, we want to delete all the styles references that are computed
            // from it for a given node
            for (var j = 0; j < appliedStyles.length; j++) {

              if (appliedStyles[j] !== 'label' && appliedStyles[j] !== 'size') {
                delete item[appliedStyles[j]];
              } else if (appliedStyles[j] === 'size'){
                item.size = 1;
              }
            }
            // There is only one node that should correspond to this. Once we have found it, we
            // can return.
            this.deprecate(target, key);
            return this;
          }
        }
      }

      return this;
    };

    /**
     * This method is used to clear all styles. It will refresh the display. Use
     * `.reset()` instead to reset styles without losing the configuration.
     *
     * @return {design}  The instance.
     */
    this.clear = function() {
      this.reset();
      this.styles = {
        nodes: {},
        edges: {}
      };
      this.palette = {};

      _visionOnNodes.clear();
      _visionOnEdges.clear();

      _visionOnNodes = new Vision(s, 'nodes', this.styles, this.palette);
      _visionOnEdges = new Vision(s, 'edges', this.styles, this.palette);

      if (s) s.refresh({skipIndexation: true});

      return this;
    };

    /**
     * This method destroys the current instance.
     */
    this.kill = function() {
      delete this.styles;
      delete this.palette;
      _visionOnNodes.clear();
      _visionOnEdges.clear();
    };

    /**
     * Transform the styles and palette into a JSON representation.
     *
     * @param  {object} params The options.
     * @return {string}        The JSON string.
     */
    this.toJSON = function(params) {
      params = params || {};

      var o = {
        styles: this.styles,
        palette: this.palette
      }

      if (params.pretty) {
        var jsonString = JSON.stringify(o, null, ' ');
      }
      else {
        var jsonString = JSON.stringify(o);
      }

      if (params.download) {
        download(jsonString, 'json', params.filename);
      }

      return jsonString;
    };

    this.utils = {};

    /**
     * This method is used to get the data type of a specified property on nodes
     * or edges. It is true if data is sequential, false otherwise (qualitative),
     * or undefined if the property doesn't exist.
     *
     * @param  {string} target     The data target. Available values:
     *                             "nodes", "edges".
     * @param  {string} property   The property accessor.
     * @return {boolean}           The data type.
     */
    this.utils.isSequential = function(target, property) {
      if (!target)
        throw new TypeError('Missing argument: "target"');

      var v;
      switch (target) {
        case 'nodes':
          v = _visionOnNodes;
          break;
        case 'edges':
          v = _visionOnEdges;
          break;
        default:
          throw new Error('Invalid argument: "target" is not "nodes" or "edges", was ' + target);
      }

      if (property === undefined)
        throw new TypeError('Missing argument: "property"');

      if (typeof property !== 'string')
        throw new TypeError('Invalid argument: "property" is not a string, was ' + property);

      if (!(property in v.dataTypes) || v.dataTypes[property].sequential === undefined) {
        var val,
            found = false,
            isSequential = true;

        v.dataset().forEach(function (item) {
          val = strToObjectRef(item, property);
          if (val !== undefined) {
            found = true;
            isSequential = (typeof val === 'number') ? isSequential : false;
            // TODO: throw error if is number AND (is NaN or is Infinity)
          }
        });

        if (found) {
          v.dataTypes[property] = { sequential: isSequential };
        }
        else if(v.dataTypes[property]) {
          v.dataTypes[property].sequential = undefined;
        }
      }

      return (v.dataTypes[property] || {}).sequential;
    };

    /**
     * This method is used to get the histogram of values, grouped by bins, on
     * a specified property of nodes or edges computed for a visual variable.
     * The property must have been used on a style before calling this method.
     *
     * The result is an array of objects ordered by bins. Each object contains
     * the list of `values` in the `bin`, the `min` and `max` values, and the
     * `ratio` of values in the bin compared to the largest bin.
     * If the visual variable is the `color`, it also contains the `color` of the
     * bin.
     *
     * @param  {string} target     The data target. Available values:
     *                             "nodes", "edges".
     * @param  {string} visualVar  The visual variable. Available values:
     *                             "color", "size", "label".
     * @param  {string} property   The property accessor.
     * @return {array}             The histogram.
     */
    this.utils.histogram = function(target, visualVar, property) {
      if (!target)
        throw new TypeError('Missing argument: "target"');

      var v;
      switch (target) {
        case 'nodes':
          v = _visionOnNodes;
          break;
        case 'edges':
          v = _visionOnEdges;
          break;
        default:
          throw new Error('Invalid argument: "target" is not "nodes" or "edges", was ' + target);
      }

      if (v.visualVars.indexOf(visualVar) == -1)
        throw new Error('Unknown visual variable "' + visualVar + '".');

      if (property === undefined)
        throw new TypeError('Missing argument: "property".');

      if (typeof property !== 'string')
        throw new TypeError('Invalid argument: "property" is not a string, was' + property);

      var isSequential = self.utils.isSequential(target, property);

      if (!isSequential)
        throw new Error('The property "'+ property +'" is not sequential.');

      var h = histogram(v.histograms[visualVar], property);
      h = resolveHistogram(h, v, property);

      if (visualVar === 'color') {
        if (!self.styles[target].color) {
          throw new Error('Missing key "color" in '+ target +' palette.');
        }
        var bins = h.length,
          o = strToObjectRef(self.palette, self.styles[target].color.scheme);

        if (!o)
          throw new Error('Color scheme "' + self.styles[target].color.scheme + '" not in '+ target +' palette.');

        if (isSequential) {
          for (var bin = 0; bin < bins; bin++) {
            if (!o[bins])
              throw new Error('Missing key "'+ bins +'" in '+ target +' palette " of color scheme ' + self.styles[target].color.scheme + '".');

            h[bin][visualVar] = o[bins][bin];
          }
        }
      }

      return h;
    };
  };


  /**
   * Interface
   * ------------------
   *
   * > var design = sigma.plugins.design(s, options);
   */
  var _instance = {};

  /**
   * @param  {sigma}   s       The related sigma instance.
   * @param  {?object} options The object contains `palette` and `styles`.
   *                           Styles are mappings between visual variables and
   *                           data properties on nodes and edges.
   * @return {design}        The instance.
   */
  sigma.plugins.design = function(s, options) {
    // Create instance if undefined
    if (!_instance[s.id]) {
      _instance[s.id] = new design(s, options);
    }
    return _instance[s.id];
  };

  /**
   *  This function kills the design instance.
   */
  sigma.plugins.killDesign = function(s) {
    if (_instance[s.id] instanceof design) {
      _instance[s.id].kill();
    }
    delete _instance[s.id];
  };

}).call(this);

},{}],5:[function(require,module,exports){
/**
 * This plugin provides a method to drag & drop nodes. Check the
 * sigma.plugins.dragNodes function doc or the examples/drag-nodes.html code
 * sample to know more.
 */
(function() {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  sigma.utils.pkg('sigma.plugins');


  /**
   * This function will add `mousedown`, `mouseup` & `mousemove` events to the
   * nodes in the `overNode`event to perform drag & drop operations. It uses
   * `linear interpolation` [http://en.wikipedia.org/wiki/Linear_interpolation]
   * and `rotation matrix` [http://en.wikipedia.org/wiki/Rotation_matrix] to
   * calculate the X and Y coordinates from the `cam` or `renderer` node
   * attributes. These attributes represent the coordinates of the nodes in
   * the real container, not in canvas.
   *
   * Fired events:
   * *************
   * startdrag  Fired at the beginning of the drag.
   * drag       Fired while the node is dragged.
   * drop       Fired at the end of the drag if the node has been dragged.
   * dragend    Fired at the end of the drag.
   *
   * Recognized parameters:
   * **********************
   * @param  {sigma}                      s        The related sigma instance.
   * @param  {renderer}                   renderer The related renderer instance.
   * @param  {?sigma.plugins.activeState} a        The activeState plugin instance.
   */
  function DragNodes(s, renderer, a) {
    sigma.classes.dispatcher.extend(this);

    // A quick hardcoded rule to prevent people from using this plugin with the
    // WebGL renderer (which is impossible at the moment):
    if (
      sigma.renderers.webgl &&
      renderer instanceof sigma.renderers.webgl
    )
      throw new Error(
        'The sigma.plugins.dragNodes is not compatible with the WebGL renderer'
      );

    // Init variables:
    var _self = this,
      _s = s,
      _a = a,
      _body = document.body,
      _renderer = renderer,
      _mouse = renderer.container.getElementsByClassName('sigma-mouse')[0],
      _prefix = renderer.options.prefix,
      _node = null,
      _draggingNode = null,
      _hoveredNode = null,
      _isMouseDown = false,
      _isMouseOverCanvas = false,
      _drag = false,
      _sticky = true,
      _enabled = true;

    if (renderer instanceof sigma.renderers.svg) {
        _mouse = renderer.container.firstChild;
    }

    renderer.bind('hovers', nodeMouseOver);
    renderer.bind('hovers', treatOutNode);
    renderer.bind('click', click);

    /**
     * Enable dragging and events.
     */
    this.enable = function() {
      _enabled = true;
    }

    /**
     * Disable dragging and events.
     */
    this.disable = function() {
      _enabled = false;
      _node = null,
      _draggingNode = null,
      _hoveredNode = null;
      _isMouseDown = false,
      _isMouseOverCanvas = false,
      _drag = false,
      _sticky = true;
    }

    /**
     * Unbind all event listeners.
     */
    this.unbindAll = function() {
      _mouse.removeEventListener('mousedown', nodeMouseDown);
      _body.removeEventListener('mousemove', nodeMouseMove);
      _body.removeEventListener('mouseup', nodeMouseUp);
      _renderer.unbind('hovers', nodeMouseOver);
      _renderer.unbind('hovers', treatOutNode);
    }

    // Calculates the global offset of the given element more accurately than
    // element.offsetTop and element.offsetLeft.
    function calculateOffset(element) {
      var style = window.getComputedStyle(element);
      var getCssProperty = function(prop) {
        return parseInt(style.getPropertyValue(prop).replace('px', '')) || 0;
      };
      return {
        left: element.getBoundingClientRect().left + getCssProperty('padding-left'),
        top: element.getBoundingClientRect().top + getCssProperty('padding-top')
      };
    };

    function click(event) {
      // event triggered at the end of the click
      _isMouseDown = false;
      _body.removeEventListener('mousemove', nodeMouseMove);
      _body.removeEventListener('mouseup', nodeMouseUp);

      if (!_hoveredNode) {
        _node = null;
      }
      else {
        // Drag node right after click instead of needing mouse out + mouse over:
        setTimeout(function() {
          // Set the current node to be the last hovered node
          _node = _hoveredNode;
          _mouse.addEventListener('mousedown', nodeMouseDown);
        }, 0);
      }
    };

    function nodeMouseOver(event) {
      if (event.data.enter.nodes.length == 0) {
        return;
      }
      var n = event.data.enter.nodes[0];

      // Don't treat the node if it is already registered
      if (_hoveredNode && _hoveredNode.id === n.id) {
        return;
      }

      // Set reference to the hovered node
      _hoveredNode = n;

      if(!_isMouseDown) {
        // Set the current node to be the last hovered node
        _node = _hoveredNode;
        _mouse.addEventListener('mousedown', nodeMouseDown);
      }
    };

    function treatOutNode(event) {
      if (event.data.leave.nodes.length == 0) {
        return;
      }
      var n = event.data.leave.nodes[0];

      if (_hoveredNode && _hoveredNode.id === n.id) {
        _hoveredNode = null;
        _node = null;
      }
      else if (!_hoveredNode) {
        _mouse.removeEventListener('mousedown', nodeMouseDown);
      }
    };

    function nodeMouseDown(event) {
      if(!_enabled || event.which == 3) return; // Right mouse button pressed

      _isMouseDown = true;
      if (_node && _s.graph.nodes().length > 0) {
        _sticky = true;
        _mouse.removeEventListener('mousedown', nodeMouseDown);
        _body.addEventListener('mousemove', nodeMouseMove);
        _body.addEventListener('mouseup', nodeMouseUp);

        // Deactivate drag graph.
        _renderer.settings({mouseEnabled: false, enableHovering: false});

        _self.dispatchEvent('startdrag', {
          node: _node,
          captor: event,
          renderer: _renderer
        });
      }
    };

    function nodeMouseUp(event) {
      _isMouseDown = false;
      _mouse.addEventListener('mousedown', nodeMouseDown);
      _body.removeEventListener('mousemove', nodeMouseMove);
      _body.removeEventListener('mouseup', nodeMouseUp);

      // Activate drag graph.
      _renderer.settings({mouseEnabled: true, enableHovering: true});

      if (_drag) {
        _self.dispatchEvent('drop', {
          node: _draggingNode,
          captor: event,
          renderer: _renderer
        });

        if(_a) {
          var activeNodes = _a.nodes();
          for(var i = 0; i < activeNodes.length; i++) {
            activeNodes[i].alphaX = undefined;
            activeNodes[i].alphaY = undefined;
          }
        }

        _s.refresh();
      }
      _self.dispatchEvent('dragend', {
        node: _node,
        captor: event,
        renderer: _renderer
      });

      _drag = false;
      _draggingNode = null;
    };

    function nodeMouseMove(event) {
      if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        clearTimeout(timeOut);
        var timeOut = setTimeout(executeNodeMouseMove, 0);
      } else {
        executeNodeMouseMove();
      }

      function executeNodeMouseMove() {
        var offset = calculateOffset(_renderer.container),
            x = event.clientX - offset.left,
            y = event.clientY - offset.top,
            cos = Math.cos(_renderer.camera.angle),
            sin = Math.sin(_renderer.camera.angle),
            nodes = _s.graph.nodes(),
            ref = [],
            x2,
            y2,
            activeNodes,
            n,
            aux,
            isHoveredNodeActive,
            dist;

        if (_a && _a.nbNodes() === nodes.length) return;

        if (!_enabled || nodes.length < 2) return;

        dist = sigma.utils.getDistance(x, y, _node[_prefix + 'x'],_node[_prefix + 'y']);

        if (_sticky && dist < _node[_prefix + 'size']) return;
        _sticky = false;

        // Find two reference points and derotate them
        // We take the first node as a first reference point and then try to find
        // another node not aligned with it
        for (var i = 0;;i++) {
          if(!_enabled) break;

          n = nodes[i];
          if (n) {
            aux = {
              x: n.x * cos + n.y * sin,
              y: n.y * cos - n.x * sin,
              renX: n[_prefix + 'x'], //renderer X
              renY: n[_prefix + 'y'], //renderer Y
            };
            ref.push(aux);
          }
          if(i == nodes.length - 1) { //we tried all nodes
            break
          }
          if (i > 0) {
            if (ref[0].x == ref[1].x || ref[0].y == ref[1].y) {
              ref.pop() // drop last nodes and try to find another one
            } else { // we managed to find two nodes not aligned
              break
            }
          }
        }

        var a = ref[0], b = ref[1];

        // Applying linear interpolation.
        var divx = (b.renX - a.renX);
        if (divx === 0) divx = 1; //fix edge case where axis are aligned

        var divy = (b.renY - a.renY);
        if (divy === 0) divy = 1; //fix edge case where axis are aligned

        x = ((x - a.renX) / divx) * (b.x - a.x) + a.x;
        y = ((y - a.renY) / divy) * (b.y - a.y) + a.y;

        x2 = x * cos - y * sin;
        y2 = y * cos + x * sin;

        // Drag multiple nodes, Keep distance
        if(_a) {
          activeNodes = _a.nodes();

          // If hovered node is active, drag active nodes
          isHoveredNodeActive = (-1 < activeNodes.map(function(node) {
            return node.id;
          }).indexOf(_node.id));

          if (isHoveredNodeActive) {
            for(var i = 0; i < activeNodes.length; i++) {
              // Delete old reference
              if(_draggingNode != _node) {
                activeNodes[i].alphaX = undefined;
                activeNodes[i].alphaY = undefined;
              }

              // Calcul first position of activeNodes
              if(!activeNodes[i].alphaX || !activeNodes[i].alphaY) {
                activeNodes[i].alphaX = activeNodes[i].x - x;
                activeNodes[i].alphaY = activeNodes[i].y - y;
              }

              // Move activeNodes to keep same distance between dragged nodes
              // and active nodes
              activeNodes[i].x = _node.x + activeNodes[i].alphaX;
              activeNodes[i].y = _node.y + activeNodes[i].alphaY;
            }
          }
        }

        // Rotating the coordinates.
        _node.x = x2;
        _node.y = y2;

        _s.refresh({skipIndexation: true});

        _drag = true;
        _draggingNode = _node;

        _self.dispatchEvent('drag', {
          node: _draggingNode,
          captor: event,
          renderer: _renderer
        });
      }
    };
  };

  /**
   * Interface
   * ------------------
   *
   * > var dragNodesListener = sigma.plugins.dragNodes(s, s.renderers[0], a);
   */
  var _instance = {};

  /**
   * @param  {sigma}                      s        The related sigma instance.
   * @param  {renderer}                   renderer The related renderer instance.
   * @param  {?sigma.plugins.activeState} a        The activeState plugin instance.
   */
  sigma.plugins.dragNodes = function(s, renderer, a) {
    // Create object if undefined
    if (!_instance[s.id]) {
      // Handle drag events:
      _instance[s.id] = new DragNodes(s, renderer, a);
    }

    s.bind('kill', function() {
      sigma.plugins.killDragNodes(s);
    });

    // disable on plugins.animate start.
    s.bind('animate.start', function() {
      _instance[s.id].disable();
    });

    // enable on plugins.animate end.
    s.bind('animate.end', function() {
      _instance[s.id].enable();
    });

    return _instance[s.id];
  };

  /**
   * This method removes the event listeners and kills the dragNodes instance.
   *
   * @param  {sigma} s The related sigma instance.
   */
  sigma.plugins.killDragNodes = function(s) {
    if (_instance[s.id] instanceof DragNodes) {
      _instance[s.id].unbindAll();
      delete _instance[s.id];
    }
  };

}).call(window);

},{}],6:[function(require,module,exports){
/**
 * This plugin provides a method to display a tooltip at a specific event, e.g.
 * to display some node properties on node hover. Check the
 * sigma.plugins.tooltip function doc or the examples/tooltip.html code sample
 * to know more.
 */
(function() {
  'use strict';

  if (typeof sigma === 'undefined')
    throw new Error('sigma is not declared');

  // Initialize package:
  sigma.utils.pkg('sigma.plugins');

  /**
   * Sigma tooltip
   * =============================
   *
   * @author Sébastien Heymann <seb@linkurio.us> (Linkurious)
   * @version 0.3
   */

  var settings = {
    stage: {
      show: 'rightClickStage',
      hide: 'clickStage',
      cssClass: 'sigma-tooltip',
      position: 'top',    // top | bottom | left | right
      autoadjust: false,
      delay: 0,
      hideDelay: 0,
      template: '',       // HTML string
      renderer: null      // function
    },
    node: {
      show: 'clickNode',
      hide: 'clickStage',
      cssClass: 'sigma-tooltip',
      position: 'top',    // top | bottom | left | right
      autoadjust: false,
      delay: 0,
      hideDelay: 0,
      template: '',       // HTML string
      renderer: null      // function
    },
    edge: {
      show: 'clickEdge',
      hide: 'clickStage',
      cssClass: 'sigma-tooltip',
      position: 'top',    // top | bottom | left | right
      autoadjust: false,
      delay: 0,
      hideDelay: 0,
      template: '',       // HTML string
      renderer: null      // function
    },
    doubleClickDelay: 800
  };


  /**
   * This function will display a tooltip when a sigma event is fired. It will
   * basically create a DOM element, fill it with the template or the result of
   * the renderer function, set its position and CSS class, and insert the
   * element as a child of the sigma container. Only one tooltip may exist.
   *
   * Recognized parameters of options:
   * *********************************
   * Enable node tooltips by adding the "node" key to the options object.
   * Enable edge tooltips by adding the "edge" key to the options object.
   * Each value could be an array of objects for multiple tooltips,
   * or an object for one tooltip.
   * Here is the exhaustive list of every accepted parameter in these objects:
   *
   *   {?string}   show       The event that triggers the tooltip. Default
   *                          values: "clickNode", "clickEdge". Other suggested
   *                          values: "overNode", "doubleClickNode",
   *                          "rightClickNode", "hovers", "doubleClickEdge",
   *                          "rightClickEdge", "doubleClickNode",
   *                          "rightClickNode".
   *   {?string}   hide       The event that hides the tooltip. Default value:
   *                          "clickStage". Other suggested values: "hovers"
   *   {?string}   template   The HTML template. It is directly inserted inside
   *                          a div element unless a renderer is specified.
   *   {?function} renderer   This function may process the template or be used
   *                          independently. It should return an HTML string or
   *                          a DOM element. It is executed at runtime. Its
   *                          context is sigma.graph.
   *   {?string}   cssClass   The CSS class attached to the top div element.
   *                          Default value: "sigma-tooltip".
   *   {?string}   position   The position of the tooltip regarding the mouse.
   *                          If it is not specified, the tooltip top-left
   *                          corner is positionned at the mouse position.
   *                          Available values: "top", "bottom", "left",
   *                          "right".
   *   {?number}   delay      The delay in miliseconds before displaying the
   *                          tooltip after the show event is triggered.
   *   {?boolean}  autoadjust [EXPERIMENTAL] If true, tries to adjust the
   *                          tooltip position to be fully included in the body
   *                          area. Doesn't work on Firefox 30. Better work on
   *                          elements with fixed width and height.
   *
   * > sigma.plugins.tooltip(s, {
   * >   node: {
   * >     template: 'Hello node!'
   * >   },
   * >   edge: {
   * >     template: 'Hello edge!'
   * >   },
   * >   stage: {
   * >     template: 'Hello stage!'
   * >   }
   * > });
   *
   * @param {sigma}    s        The related sigma instance.
   * @param {renderer} renderer The related sigma renderer.
   * @param {object}   options  An object with options.
   */
  function Tooltips(s, renderer, options) {
    var self = this,
        _tooltip,
        _timeoutHandle,
        _timeoutHideHandle,
        _stageTooltips = [],
        _nodeTooltips = [],
        _edgeTooltips = [],
        _mouseOverTooltip = false,
        _doubleClick = false;

    if (Array.isArray(options.stage)) {
      for (var i = 0; i < options.stage.length; i++) {
        _stageTooltips.push(sigma.utils.extend(options.stage[i], settings.stage));
      }
    } else {
      _stageTooltips.push(sigma.utils.extend(options.stage, settings.stage));
    }

    if (Array.isArray(options.node)) {
      for (var i = 0; i < options.node.length; i++) {
        _nodeTooltips.push(sigma.utils.extend(options.node[i], settings.node));
      }
    } else {
      _nodeTooltips.push(sigma.utils.extend(options.node, settings.node));
    }

    if (Array.isArray(options.edge)) {
      for (var i = 0; i < options.edge.length; i++) {
        _edgeTooltips.push(sigma.utils.extend(options.edge[i], settings.edge));
      }
    } else {
      _edgeTooltips.push(sigma.utils.extend(options.edge, settings.edge));
    }

    sigma.classes.dispatcher.extend(this);

    s.bind('kill', function() {
      sigma.plugins.killTooltips(s);
    });

    function contextmenuListener(event) {
      event.preventDefault();
    };

    /**
     * This function removes the existing tooltip and creates a new tooltip for a
     * specified node or edge.
     *
     * @param {object}    o          The node or the edge.
     * @param {object}    options    The options related to the object.
     * @param {number}    x          The X coordinate of the mouse.
     * @param {number}    y          The Y coordinate of the mouse.
     * @param {function?} onComplete Optional function called when open finish
     */
    this.open = function(o, options, x, y, onComplete) {
      remove();

      // Create the DOM element:
      _tooltip = document.createElement('div');
      if (options.renderer) {
        // Copy the object:
        var clone = Object.create(null),
            tooltipRenderer,
            type,
            k;
        for (k in o)
          clone[k] = o[k];

        tooltipRenderer = options.renderer.call(s.graph, clone, options.template);

        type = typeof tooltipRenderer;

        if (type === 'undefined') return;

        if (type === 'string') {
           _tooltip.innerHTML = tooltipRenderer;
        }
        else {
          // tooltipRenderer is a dom element:
          _tooltip.appendChild(tooltipRenderer);
        }
      }
      else {
        _tooltip.innerHTML = options.template;
      }

      var containerPosition = window.getComputedStyle(renderer.container).position;

      if(containerPosition !== 'static') {
        _tooltip.style.position = 'absolute';
        var containerRect = renderer.container.getBoundingClientRect();
        x = ~~(x - containerRect.left);
        y = ~~(y - containerRect.top);
      }


      // Style it:
      _tooltip.className = options.cssClass;

      if (options.position !== 'css') {
        if(containerPosition === 'static') {
          _tooltip.style.position = 'absolute';
        }

        // Default position is mouse position:
        _tooltip.style.left = x + 'px';
        _tooltip.style.top = y + 'px';
      }

      _tooltip.addEventListener('mouseenter', function() {
        _mouseOverTooltip = true;
      }, false);

      _tooltip.addEventListener('mouseleave', function() {
        _mouseOverTooltip = false;
      }, false);

      // Execute after rendering:
      setTimeout(function() {
        if (!_tooltip)
          return;

        // Insert the element in the DOM:
        renderer.container.appendChild(_tooltip);

        // Find offset:
        var bodyRect = document.body.getBoundingClientRect(),
            tooltipRect = _tooltip.getBoundingClientRect(),
            offsetTop =  tooltipRect.top - bodyRect.top,
            offsetBottom = bodyRect.bottom - tooltipRect.bottom,
            offsetLeft =  tooltipRect.left - bodyRect.left,
            offsetRight = bodyRect.right - tooltipRect.right;

        if (options.position === 'top') {
          // New position vertically aligned and on top of the mouse:
          _tooltip.className = options.cssClass + ' top';
          _tooltip.style.left = x - (tooltipRect.width / 2) + 'px';
          _tooltip.style.top = y - tooltipRect.height + 'px';
        }
        else if (options.position === 'bottom') {
          // New position vertically aligned and on bottom of the mouse:
          _tooltip.className = options.cssClass + ' bottom';
          _tooltip.style.left = x - (tooltipRect.width / 2) + 'px';
          _tooltip.style.top = y + 'px';
        }
        else if (options.position === 'left') {
          // New position vertically aligned and on bottom of the mouse:
          _tooltip.className = options.cssClass+ ' left';
          _tooltip.style.left = x - tooltipRect.width + 'px';
          _tooltip.style.top = y - (tooltipRect.height / 2) + 'px';
        }
        else if (options.position === 'right') {
          // New position vertically aligned and on bottom of the mouse:
          _tooltip.className = options.cssClass + ' right';
          _tooltip.style.left = x + 'px';
          _tooltip.style.top = y - (tooltipRect.height / 2) + 'px';
        }

        // Adjust position to keep the tooltip inside body:
        // FIXME: doesn't work on Firefox
        if (options.autoadjust) {

          // Update offset
          tooltipRect = _tooltip.getBoundingClientRect();
          offsetTop = tooltipRect.top - bodyRect.top;
          offsetBottom = bodyRect.bottom - tooltipRect.bottom;
          offsetLeft = tooltipRect.left - bodyRect.left;
          offsetRight = bodyRect.right - tooltipRect.right;

          if (offsetBottom < 0) {
            _tooltip.className = options.cssClass;
            if (options.position === 'top' || options.position === 'bottom') {
              _tooltip.className = options.cssClass + ' top';
            }
            _tooltip.style.top = y - tooltipRect.height + 'px';
          }
          else if (offsetTop < 0) {
            _tooltip.className = options.cssClass;
            if (options.position === 'top' || options.position === 'bottom') {
              _tooltip.className = options.cssClass + ' bottom';
            }
            _tooltip.style.top = y + 'px';
          }
          if (offsetRight < 0) {
            //! incorrect tooltipRect.width on non fixed width element.
            _tooltip.className = options.cssClass;
            if (options.position === 'left' || options.position === 'right') {
              _tooltip.className = options.cssClass + ' left';
            }
            _tooltip.style.left = x - tooltipRect.width + 'px';
          }
          else if (offsetLeft < 0) {
            _tooltip.className = options.cssClass;
            if (options.position === 'left' || options.position === 'right') {
              _tooltip.className = options.cssClass + ' right';
            }
            _tooltip.style.left = x + 'px';
          }
        }
        if (onComplete) onComplete();
      }, 0);
    };

    /**
     * This function removes the tooltip element from the DOM.
     */
    function remove() {
      if (_tooltip && _tooltip.parentNode) {
        // Remove from the DOM:
        _tooltip.parentNode.removeChild(_tooltip);
        _tooltip = null;
      }
    };

    /**
     * This function clears all timeouts related to the tooltip
     * and removes the tooltip.
     */
    function cancel() {
      clearTimeout(_timeoutHandle);
      clearTimeout(_timeoutHideHandle);
      _timeoutHandle = false;
      _timeoutHideHandle = false;
      remove();
    };

    /**
     * Similar to cancel() but can be delayed.
     *
     * @param {number} delay. The delay in miliseconds.
     */
    function delayedCancel(delay) {
      clearTimeout(_timeoutHandle);
      clearTimeout(_timeoutHideHandle);
      _timeoutHandle = false;
      _timeoutHideHandle = setTimeout(function() {
        if (!_mouseOverTooltip) remove();
      }, delay);
    };

    // INTERFACE:
    this.close = function() {
      cancel();
      this.dispatchEvent('hidden');
      return this;
    };

    this.kill = function() {
      this.unbindEvents();
      clearTimeout(_timeoutHandle);
      clearTimeout(_timeoutHideHandle);
      _tooltip = null;
      _timeoutHandle = null;
      _timeoutHideHandle = null;
      _doubleClick = false;
      _stageTooltips = [];
      _nodeTooltips = [];
      _edgeTooltips = [];
    };

    this.unbindEvents = function() {
      var tooltips = _stageTooltips.concat(_nodeTooltips).concat(_edgeTooltips);

      for (var i = 0; i < tooltips.length; i++) {
        s.unbind(tooltips[i].show);
        s.unbind(tooltips[i].hide);

        if (tooltips[i].show === 'rightClickNode' || tooltips[i].show === 'rightClickEdge') {
          renderer.container.removeEventListener(
            'contextmenu',
            contextmenuListener
          );
        }
      }
      // Remove the default event handlers
      s.unbind('doubleClickStage');
      s.unbind('doubleClickNode');
      s.unbind('doubleClickEdge');
    };

    this.bindStageEvents = function(tooltip) {
      s.bind(tooltip.show, function(event) {
        if (tooltip.show !== 'doubleClickStage' && _doubleClick) {
          return;
        }

        var clientX = event.data.captor.clientX,
            clientY = event.data.captor.clientY;

        clearTimeout(_timeoutHandle);
        _timeoutHandle = setTimeout(function() {
          self.open(
            null,
            tooltip,
            clientX,
            clientY,
            self.dispatchEvent.bind(self,'shown', event.data));
        }, tooltip.delay);
      });

      s.bind(tooltip.hide, function(event) {
        var p = _tooltip;
        delayedCancel(settings.stage.hideDelay);
        if (p)
          self.dispatchEvent('hidden', event.data);
      });
    };

    this.bindNodeEvents = function(tooltip) {
      s.bind(tooltip.show, function(event) {
        if (tooltip.show !== 'doubleClickNode' && _doubleClick) {
          return;
        }

        var n = event.data.node;
        if (!n && event.data.enter) {
          n = event.data.enter.nodes[0];
        }
        if (n == undefined) return;

        var clientX = event.data.captor.clientX,
            clientY = event.data.captor.clientY;

        clearTimeout(_timeoutHandle);
        _timeoutHandle = setTimeout(function() {
          self.open(
            n,
            tooltip,
            clientX,
            clientY,
            self.dispatchEvent.bind(self,'shown', event.data));
        }, tooltip.delay);
      });

      s.bind(tooltip.hide, function(event) {
        if (event.data.leave && event.data.leave.nodes.length == 0)
          return
        var p = _tooltip;
        delayedCancel(settings.node.hideDelay);
        if (p)
          self.dispatchEvent('hidden', event.data);
      });
    };

    this.bindEdgeEvents = function(tooltip) {
      s.bind(tooltip.show, function(event) {
        if (tooltip.show !== 'doubleClickEdge' && _doubleClick) {
          return;
        }

        var e = event.data.edge;
        if (!e && event.data.enter) {
          e = event.data.enter.edges[0];
        }
        if (e == undefined) return;

        var clientX = event.data.captor.clientX,
            clientY = event.data.captor.clientY;

        clearTimeout(_timeoutHandle);
        _timeoutHandle = setTimeout(function() {
          self.open(
            e,
            tooltip,
            clientX,
            clientY,
            self.dispatchEvent.bind(self,'shown', event.data));
        }, tooltip.delay);
      });

      s.bind(tooltip.hide, function(event) {
        if (event.data.leave && event.data.leave.edges.length == 0)
          return
        var p = _tooltip;
        delayedCancel(settings.edge.hideDelay);
        if (p)
          self.dispatchEvent('hidden', event.data);
      });
    };

    // STAGE tooltip:
    if (options.stage) {
      var hasDoubleClickStage = false;

      for (var i = 0; i < _stageTooltips.length; i++) {
        if (_stageTooltips[i].renderer !== null &&
            typeof _stageTooltips[i].renderer !== 'function')
          throw new TypeError('"options.stage.renderer" is not a function, was ' + _stageTooltips[i].renderer);

        if (_stageTooltips[i].position !== undefined) {
          if (_stageTooltips[i].position !== 'top' &&
              _stageTooltips[i].position !== 'bottom' &&
              _stageTooltips[i].position !== 'left' &&
              _stageTooltips[i].position !== 'right' &&
              _stageTooltips[i].position !== 'css') {
            throw new Error('"options.position" is not "top", "bottom", "left", "right", or "css", was ' + _stageTooltips[i].position);
          }
        }

        if (_stageTooltips[i].show === 'doubleClickStage') {
          hasDoubleClickStage = true;
        }
      }

      for (var i = 0; i < _stageTooltips.length; i++) {
        this.bindStageEvents(_stageTooltips[i]);
      }

      if (!hasDoubleClickStage) {
        s.bind('doubleClickStage', function(event) {
          cancel();
          _doubleClick = true;
          self.dispatchEvent('hidden', event.data);
          setTimeout(function() {
            _doubleClick = false;
          }, settings.doubleClickDelay);
        });
      }
    }

    // NODE tooltip:
    if (options.node) {
      var hasRightClickNode = false;
      var hasDoubleClickNode = false;

      for (var i = 0; i < _nodeTooltips.length; i++) {
        if (_nodeTooltips[i].renderer !== null &&
            typeof _nodeTooltips[i].renderer !== 'function')
          throw new TypeError('"options.node.renderer" is not a function, was ' + _nodeTooltips[i].renderer);

        if (_nodeTooltips[i].position !== undefined) {
          if (_nodeTooltips[i].position !== 'top' &&
              _nodeTooltips[i].position !== 'bottom' &&
              _nodeTooltips[i].position !== 'left' &&
              _nodeTooltips[i].position !== 'right' &&
              _nodeTooltips[i].position !== 'css') {
            throw new Error('"options.position" is not "top", "bottom", "left", "right", or "css", was ' + _nodeTooltips[i].position);
          }
        }

        if (_nodeTooltips[i].show === 'doubleClickNode') {
          hasDoubleClickNode = true;
        } else if (_nodeTooltips[i].show === 'rightClickNode') {
          hasRightClickNode = true;
        }
      }

      for (var i = 0; i < _nodeTooltips.length; i++) {
        this.bindNodeEvents(_nodeTooltips[i]);
      }

      if (!hasDoubleClickNode) {
        s.bind('doubleClickNode', function(event) {
          cancel();
          _doubleClick = true;
          self.dispatchEvent('hidden', event.data);
          setTimeout(function() {
            _doubleClick = false;
          }, settings.doubleClickDelay);
        });
      }
    }

    // EDGE tooltip:
    if (options.edge) {
      var hasRightClickEdge = false;
      var hasDoubleClickEdge = false;

      for (var i = 0; i < _edgeTooltips.length; i++) {
        if (_edgeTooltips[i].renderer !== null &&
            typeof _edgeTooltips[i].renderer !== 'function')
          throw new TypeError('"options.edge.renderer" is not a function, was ' + _edgeTooltips[i].renderer);

        if (_edgeTooltips[i].position !== undefined) {
          if (_edgeTooltips[i].position !== 'top' &&
              _edgeTooltips[i].position !== 'bottom' &&
              _edgeTooltips[i].position !== 'left' &&
              _edgeTooltips[i].position !== 'right' &&
              _edgeTooltips[i].position !== 'css') {
            throw new Error('"options.position" is not "top", "bottom", "left", "right", or "css", was ' + _edgeTooltips[i].position);
          }
        }

        if (_edgeTooltips[i].show === 'doubleClickEdge') {
          hasDoubleClickEdge = true;
        } else if (_edgeTooltips[i].show === 'rightClickEdge') {
          hasRightClickEdge = true;
        }
      }

      for (var i = 0; i < _edgeTooltips.length; i++) {
        this.bindEdgeEvents(_edgeTooltips[i]);
      }

      if (!hasDoubleClickEdge) {
        s.bind('doubleClickEdge', function(event) {
          cancel();
          _doubleClick = true;
          self.dispatchEvent('hidden', event.data);
          setTimeout(function() {
            _doubleClick = false;
          }, settings.doubleClickDelay);
        })
      }
    }

    // Prevent the browser context menu to appear
    // if the right click event is already handled:
    if (hasRightClickNode || hasRightClickEdge) {
      renderer.container.addEventListener(
        'contextmenu',
        contextmenuListener
      );
    }
  };

  /**
   * Interface
   * ------------------
   */
  var _instance = {};

  /**
   * @param {sigma}    s        The related sigma instance.
   * @param {renderer} renderer The related sigma renderer.
   * @param {object}   options  An object with options.
   */
  sigma.plugins.tooltips = function(s, renderer, options) {
    // Create object if undefined
    if (!_instance[s.id]) {
      _instance[s.id] = new Tooltips(s, renderer, options);
    }
    return _instance[s.id];
  };

  /**
   *  This function kills the tooltips instance.
   */
  sigma.plugins.killTooltips = function(s) {
    if (_instance[s.id] instanceof Tooltips) {
      _instance[s.id].kill();
    }
    delete _instance[s.id];
  };

}).call(window);

},{}],7:[function(require,module,exports){
;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.nodes');

  var drawBorder = function(context, x, y, radius, color, line_width) {
    context.beginPath();
    context.strokeStyle = color;
	  context.lineWidth = line_width;
    context.arc(x, y, radius, 0, Math.PI * 2, true);
    context.closePath();
    context.stroke();
  };


  /**
   * The default node renderer. It renders the node as a simple disc.
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   * @param  {?object}                  options  Force optional parameters (e.g. color).
   */
  sigma.canvas.nodes.def = function(node, context, settings, options) {
    var o = options || {},
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'] || 1,
        x = node[prefix + 'x'],
        y = node[prefix + 'y'],
        defaultNodeColor = settings('defaultNodeColor'),
        imgCrossOrigin = settings('imgCrossOrigin') || 'anonymous',
        borderSize = node.border_size || settings('nodeBorderSize'),
        outerBorderSize = settings('nodeOuterBorderSize'),
        activeBorderSize = node.border_size || settings('nodeActiveBorderSize'),
        activeOuterBorderSize = settings('nodeActiveOuterBorderSize'),
        color = o.color || node.color || defaultNodeColor,
	      borderColor = settings('nodeBorderColor') === 'default'
          ? settings('defaultNodeBorderColor')
          : (o.borderColor || node.border_color || node.color || defaultNodeColor),
        level = node.active ? settings('nodeActiveLevel') : node.level;

    // Level:
    sigma.utils.canvas.setLevel(level, context);

    if (node.active) {
      // Color:
      if (settings('nodeActiveColor') === 'node') {
        color = node.active_color || color;
      }
      else {
        color = settings('defaultNodeActiveColor') || color;
      }

      // Outer Border:
      if (activeOuterBorderSize > 0) {
        context.beginPath();
        context.fillStyle = settings('nodeActiveOuterBorderColor') === 'node' ?
          (color || defaultNodeColor) :
          settings('defaultNodeActiveOuterBorderColor');
        context.arc(x, y, size + activeBorderSize + activeOuterBorderSize, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
      }
      // Border:
      if (activeBorderSize > 0) {
        context.beginPath();
        context.fillStyle = settings('nodeActiveBorderColor') === 'node'
          ? borderColor
          : settings('defaultNodeActiveBorderColor');
        context.arc(x, y, size + activeBorderSize, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
      }
    }
    else {
      // Outer Border:
      if (outerBorderSize > 0) {
        context.beginPath();
        context.fillStyle = settings('nodeOuterBorderColor') === 'node' ?
          (color || defaultNodeColor) :
          settings('defaultNodeOuterBorderColor');
        context.arc(x, y, size + borderSize + outerBorderSize, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
      }

      // Border:
      if (borderSize > 0) {
        context.beginPath();
        context.fillStyle = settings('nodeBorderColor') === 'node'
          ? borderColor
          : settings('defaultNodeBorderColor');
        context.arc(x, y, size + borderSize, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
      }
    }

    if ((!node.active ||
      (node.active && settings('nodeActiveColor') === 'node')) &&
      node.colors &&
      node.colors.length) {

      // see http://jsfiddle.net/hvYkM/1/
      var i,
          l = node.colors.length,
          j = 1 / l,
          lastend = 0;

      for (i = 0; i < l; i++) {
        context.fillStyle = node.colors[i];
        context.beginPath();
        context.moveTo(x, y);
        context.arc(x, y, size, lastend, lastend + (Math.PI * 2 * j), false);
        context.lineTo(x, y);
        context.closePath();
        context.fill();
        lastend += Math.PI * 2 * j;
      }
      sigma.utils.canvas.resetLevel(context);
    }
    else {
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();

      sigma.utils.canvas.resetLevel(context);

      if (!node.active && borderSize > 0 && (size > 2 * borderSize)) {
		    drawBorder(context, x, y, size, borderColor, borderSize);
      }
    }

    // Image:
    if (node.image) {
      sigma.utils.canvas.drawImage(
        node, x, y, size, context, imgCrossOrigin, settings('imageThreshold')
      );
    }

    // Icon:
    if (node.icon) {
      sigma.utils.canvas.drawIcon(node, x, y, size, context, settings('iconThreshold'));
    }

  };
})();

},{}],8:[function(require,module,exports){
;(function(undefined) {
  'use strict';

  var __instances = {};

  /**
   * This is the sigma instances constructor. One instance of sigma represent
   * one graph. It is possible to represent this grapĥ with several renderers
   * at the same time. By default, the default renderer (WebGL + Canvas
   * polyfill) will be used as the only renderer, with the container specified
   * in the configuration.
   *
   * @param  {?*}    conf The configuration of the instance. There are a lot of
   *                      different recognized forms to instantiate sigma, check
   *                      example files, documentation in this file and unit
   *                      tests to know more.
   * @return {sigma}      The fresh new sigma instance.
   *
   * Instanciating sigma:
   * ********************
   * If no parameter is given to the constructor, the instance will be created
   * without any renderer or camera. It will just instantiate the graph, and
   * other modules will have to be instantiated through the public methods,
   * like "addRenderer" etc:
   *
   *  > s0 = new sigma();
   *  > s0.addRenderer({
   *  >   type: 'canvas',
   *  >   container: 'my-container-id'
   *  > });
   *
   * In most of the cases, sigma will simply be used with the default renderer.
   * Then, since the only required parameter is the DOM container, there are
   * some simpler way to call the constructor. The four following calls do the
   * exact same things:
   *
   *  > s1 = new sigma('my-container-id');
   *  > s2 = new sigma(document.getElementById('my-container-id'));
   *  > s3 = new sigma({
   *  >   container: document.getElementById('my-container-id')
   *  > });
   *  > s4 = new sigma({
   *  >   renderers: [{
   *  >     container: document.getElementById('my-container-id')
   *  >   }]
   *  > });
   *
   * Recognized parameters:
   * **********************
   * Here is the exhaustive list of every accepted parameters, when calling the
   * constructor with to top level configuration object (fourth case in the
   * previous examples):
   *
   *   {?string} id        The id of the instance. It will be generated
   *                       automatically if not specified.
   *   {?array}  renderers An array containing objects describing renderers.
   *   {?object} graph     An object containing an array of nodes and an array
   *                       of edges, to avoid having to add them by hand later.
   *   {?object} settings  An object containing instance specific settings that
   *                       will override the default ones defined in the object
   *                       sigma.settings.
   */
  var sigma = function(conf) {
    // Local variables:
    // ****************
    var i,
        l,
        a,
        c,
        o,
        id;

    sigma.classes.dispatcher.extend(this);

    // Private attributes:
    // *******************
    var _self = this,
        _conf = conf || {};

    // Little shortcut:
    // ****************
    // The configuration is supposed to have a list of the configuration
    // objects for each renderer.
    //  - If there are no configuration at all, then nothing is done.
    //  - If there are no renderer list, the given configuration object will be
    //    considered as describing the first and only renderer.
    //  - If there are no renderer list nor "container" object, it will be
    //    considered as the container itself (a DOM element).
    //  - If the argument passed to sigma() is a string, it will be considered
    //    as the ID of the DOM container.
    if (
      typeof _conf === 'string' ||
      _conf instanceof HTMLElement
    )
      _conf = {
        renderers: [_conf]
      };
    else if (Object.prototype.toString.call(_conf) === '[object Array]')
      _conf = {
        renderers: _conf
      };

    // Also check "renderer" and "container" keys:
    o = _conf.renderers || _conf.renderer || _conf.container;
    if (!_conf.renderers || _conf.renderers.length === 0)
      if (
        typeof o === 'string' ||
        o instanceof HTMLElement ||
        (typeof o === 'object' && 'container' in o)
      )
        _conf.renderers = [o];

    // Recense the instance:
    if (_conf.id) {
      if (__instances[_conf.id])
        throw 'sigma: Instance "' + _conf.id + '" already exists.';
      Object.defineProperty(this, 'id', {
        value: _conf.id
      });
    } else {
      id = 0;
      while (__instances[id])
        id++;
      Object.defineProperty(this, 'id', {
        value: '' + id
      });
    }
    __instances[this.id] = this;

    // Initialize settings function:
    this.settings = new sigma.classes.configurable(
      sigma.settings,
      _conf.settings || {}
    );

    // Initialize locked attributes:
    Object.defineProperty(this, 'graph', {
      value: new sigma.classes.graph(this.settings),
      configurable: true
    });
    Object.defineProperty(this, 'middlewares', {
      value: [],
      configurable: true
    });
    Object.defineProperty(this, 'cameras', {
      value: {},
      configurable: true
    });
    Object.defineProperty(this, 'renderers', {
      value: {},
      configurable: true
    });
    Object.defineProperty(this, 'renderersPerCamera', {
      value: {},
      configurable: true
    });
    Object.defineProperty(this, 'cameraFrames', {
      value: {},
      configurable: true
    });
    Object.defineProperty(this, 'camera', {
      get: function() {
        return this.cameras[0];
      }
    });
    Object.defineProperty(this, 'events', {
      value: [
        'click',
        'rightClick',
        'clickStage',
        'doubleClickStage',
        'rightClickStage',
        'clickNode',
        'clickNodes',
        'doubleClickNode',
        'doubleClickNodes',
        'rightClickNode',
        'rightClickNodes',
        'overNode',
        'overNodes',
        'outNode',
        'outNodes',
        'downNode',
        'downNodes',
        'upNode',
        'upNodes'
      ],
      configurable: true
    });

    // Add a custom handler, to redispatch events from renderers:
    this._handler = (function(e) {
      var k,
          data = {};

      for (k in e.data)
        data[k] = e.data[k];

      data.renderer = e.target;
      this.dispatchEvent(e.type, data);
    }).bind(this);

    // Initialize renderers:
    a = _conf.renderers || [];
    for (i = 0, l = a.length; i < l; i++)
      this.addRenderer(a[i]);

    // Initialize middlewares:
    a = _conf.middlewares || [];
    for (i = 0, l = a.length; i < l; i++)
      this.middlewares.push(
        typeof a[i] === 'string' ?
          sigma.middlewares[a[i]] :
          a[i]
      );

    // Check if there is already a graph to fill in:
    if (typeof _conf.graph === 'object' && _conf.graph) {
      this.graph.read(_conf.graph);

      // If a graph is given to the to the instance, the "refresh" method is
      // directly called:
      this.refresh();
    }

    // Deal with resize:
    window.addEventListener('resize', function() {
      if (_self.settings)
        _self.refresh();
    });
  };




  /**
   * This methods will instantiate and reference a new camera. If no id is
   * specified, then an automatic id will be generated.
   *
   * @param  {?string}              id Eventually the camera id.
   * @return {sigma.classes.camera}    The fresh new camera instance.
   */
  sigma.prototype.addCamera = function(id) {
    var self = this,
        camera;

    if (!arguments.length) {
      id = 0;
      while (this.cameras['' + id])
        id++;
      id = '' + id;
    }

    if (this.cameras[id])
      throw 'sigma.addCamera: The camera "' + id + '" already exists.';

    camera = new sigma.classes.camera(id, this.graph, this.settings);
    this.cameras[id] = camera;

    // Add a quadtree to the camera:
    camera.quadtree = new sigma.classes.quad();

    // Add an edgequadtree to the camera:
    if (sigma.classes.edgequad !== undefined) {
      camera.edgequadtree = new sigma.classes.edgequad();
    }

    camera.bind('coordinatesUpdated', function(e) {
      self.renderCamera(camera, camera.isAnimated);
    });

    this.renderersPerCamera[id] = [];

    return camera;
  };

  /**
   * This method kills a camera, and every renderer attached to it.
   *
   * @param  {string|camera} v The camera to kill or its ID.
   * @return {sigma}           Returns the instance.
   */
  sigma.prototype.killCamera = function(v) {
    v = typeof v === 'string' ? this.cameras[v] : v;

    if (!v)
      throw 'sigma.killCamera: The camera is undefined.';

    var i,
        l,
        a = this.renderersPerCamera[v.id];

    for (l = a.length, i = l - 1; i >= 0; i--)
      this.killRenderer(a[i]);

    delete this.renderersPerCamera[v.id];
    delete this.cameraFrames[v.id];
    delete this.cameras[v.id];

    if (v.kill)
      v.kill();

    return this;
  };

  /**
   * This methods will instantiate and reference a new renderer. The "type"
   * argument can be the constructor or its name in the "sigma.renderers"
   * package. If no type is specified, then "sigma.renderers.def" will be used.
   * If no id is specified, then an automatic id will be generated.
   *
   * @param  {?object}  options Eventually some options to give to the renderer
   *                            constructor.
   * @return {renderer}         The fresh new renderer instance.
   *
   * Recognized parameters:
   * **********************
   * Here is the exhaustive list of every accepted parameters in the "options"
   * object:
   *
   *   {?string}            id     Eventually the renderer id.
   *   {?(function|string)} type   Eventually the renderer constructor or its
   *                               name in the "sigma.renderers" package.
   *   {?(camera|string)}   camera Eventually the renderer camera or its
   *                               id.
   */
  sigma.prototype.addRenderer = function(options) {
    var id,
        fn,
        camera,
        renderer,
        o = options || {};

    // Polymorphism:
    if (typeof o === 'string')
      o = {
        container: document.getElementById(o)
      };
    else if (o instanceof HTMLElement)
      o = {
        container: o
      };

    // If the container still is a string, we get it by id
    if (typeof o.container === 'string')
      o.container = document.getElementById(o.container);

    // Reference the new renderer:
    if (!('id' in o)) {
      id = 0;
      while (this.renderers['' + id])
        id++;
      id = '' + id;
    } else
      id = o.id;

    if (this.renderers[id])
      throw 'sigma.addRenderer: The renderer "' + id + '" already exists.';

    // Find the good constructor:
    fn = typeof o.type === 'function' ? o.type : sigma.renderers[o.type];
    fn = fn || sigma.renderers.def;

    // Find the good camera:
    camera = 'camera' in o ?
      (
        o.camera instanceof sigma.classes.camera ?
          o.camera :
          this.cameras[o.camera] || this.addCamera(o.camera)
      ) :
      this.addCamera();

    if (this.cameras[camera.id] !== camera)
      throw 'sigma.addRenderer: The camera is not properly referenced.';

    // Instantiate:
    renderer = new fn(this.graph, camera, this.settings, o);
    this.renderers[id] = renderer;
    Object.defineProperty(renderer, 'id', {
      value: id
    });

    // Bind events:
    if (renderer.bind)
      renderer.bind(
        [
          'click',
          'rightClick',
          'clickStage',
          'doubleClickStage',
          'rightClickStage',
          'clickNode',
          'clickNodes',
          'clickEdge',
          'clickEdges',
          'doubleClickNode',
          'doubleClickNodes',
          'doubleClickEdge',
          'doubleClickEdges',
          'rightClickNode',
          'rightClickNodes',
          'rightClickEdge',
          'rightClickEdges',
          'overNode',
          'overNodes',
          'overEdge',
          'overEdges',
          'outNode',
          'outNodes',
          'outEdge',
          'outEdges',
          'downNode',
          'downNodes',
          'downEdge',
          'downEdges',
          'upNode',
          'upNodes',
          'upEdge',
          'upEdges'
        ],
        this._handler
      );

    // Reference the renderer by its camera:
    this.renderersPerCamera[camera.id].push(renderer);

    return renderer;
  };

  /**
   * This method kills a renderer.
   *
   * @param  {string|renderer} v The renderer to kill or its ID.
   * @return {sigma}             Returns the instance.
   */
  sigma.prototype.killRenderer = function(v) {
    v = typeof v === 'string' ? this.renderers[v] : v;

    if (!v)
      throw 'sigma.killRenderer: The renderer is undefined.';

    var a = this.renderersPerCamera[v.camera.id],
        i = a.indexOf(v);

    if (i >= 0)
      a.splice(i, 1);

    if (v.kill)
      v.kill();

    delete this.renderers[v.id];

    return this;
  };




  /**
   * This method calls the "render" method of each renderer, with the same
   * arguments than the "render" method, but will also check if the renderer
   * has a "process" method, and call it if it exists.
   *
   * It is useful for quadtrees or WebGL processing, for instance.
   *
   * @param  {?object}  options Eventually some options to give to the refresh
   *                            method.
   * @return {sigma}            Returns the instance itself.
   *
   * Recognized parameters:
   * **********************
   * Here is the exhaustive list of every accepted parameters in the "options"
   * object:
   *
   *   {?boolean} skipIndexation A flag specifying wether or not the refresh
   *                             function should reindex the graph in the
   *                             quadtrees or not (default: false).
   */
  sigma.prototype.refresh = function(options) {
    var i,
        l,
        k,
        a,
        c,
        bounds,
        prefix = 0;

    options = options || {};

    // Call each middleware:
    a = this.middlewares || [];
    for (i = 0, l = a.length; i < l; i++)
      a[i].call(
        this,
        (i === 0) ? '' : 'tmp' + prefix + ':',
        (i === l - 1) ? 'ready:' : ('tmp' + (++prefix) + ':')
      );

    // Then, for each camera, call the "rescale" middleware, unless the
    // settings specify not to:
    for (k in this.cameras) {
      c = this.cameras[k];
      if (
        c.settings('autoRescale') &&
        this.renderersPerCamera[c.id] &&
        this.renderersPerCamera[c.id].length
      )
        sigma.middlewares.rescale.call(
          this,
          a.length ? 'ready:' : '',
          c.readPrefix,
          {
            width: this.renderersPerCamera[c.id][0].width,
            height: this.renderersPerCamera[c.id][0].height
          }
        );
      else
        sigma.middlewares.copy.call(
          this,
          a.length ? 'ready:' : '',
          c.readPrefix
        );

      if (!options.skipIndexation) {
        // Find graph boundaries:
        bounds = sigma.utils.getBoundaries(
          this.graph,
          c.readPrefix
        );

        // Refresh quadtree:
        c.quadtree.index(this.graph.nodes(), {
          prefix: c.readPrefix,
          bounds: {
            x: bounds.minX,
            y: bounds.minY,
            width: bounds.maxX - bounds.minX,
            height: bounds.maxY - bounds.minY
          }
        });

        // Refresh edgequadtree:
        if (
          c.edgequadtree !== undefined &&
          c.settings('drawEdges') &&
          c.settings('enableEdgeHovering')
        ) {
          c.edgequadtree.index(this.graph, {
            prefix: c.readPrefix,
            bounds: {
              x: bounds.minX,
              y: bounds.minY,
              width: bounds.maxX - bounds.minX,
              height: bounds.maxY - bounds.minY
            }
          });
        }
      }
    }

    // Call each renderer:
    a = Object.keys(this.renderers);
    for (i = 0, l = a.length; i < l; i++)
      if (this.renderers[a[i]].process) {
        if (this.settings('skipErrors'))
          try {
            this.renderers[a[i]].process();
          } catch (e) {
            console.log(
              'Warning: The renderer "' + a[i] + '" crashed on ".process()"'
            );
          }
        else
          this.renderers[a[i]].process();
      }

    this.render();

    return this;
  };

  /**
   * This method calls the "render" method of each renderer.
   *
   * @return {sigma} Returns the instance itself.
   */
  sigma.prototype.render = function() {
    var i,
        l,
        a,
        prefix = 0;

    // Call each renderer:
    a = Object.keys(this.renderers);
    for (i = 0, l = a.length; i < l; i++)
      if (this.settings('skipErrors'))
        try {
          this.renderers[a[i]].render();
        } catch (e) {
          if (this.settings('verbose'))
            console.log(
              'Warning: The renderer "' + a[i] + '" crashed on ".render()"'
            );
        }
      else
        this.renderers[a[i]].render();

    return this;
  };

  /**
   * This method calls the "render" method of each renderer that is bound to
   * the specified camera. To improve the performances, if this method is
   * called too often, the number of effective renderings is limitated to one
   * per frame, unless you are using the "force" flag.
   *
   * @param  {sigma.classes.camera} camera The camera to render.
   * @param  {?boolean}             force  If true, will render the camera
   *                                       directly.
   * @return {sigma}                       Returns the instance itself.
   */
  sigma.prototype.renderCamera = function(camera, force) {
    var i,
        l,
        a,
        self = this;

    if (force) {
      a = this.renderersPerCamera[camera.id];
      for (i = 0, l = a.length; i < l; i++)
        if (this.settings('skipErrors'))
          try {
            a[i].render();
          } catch (e) {
            if (this.settings('verbose'))
              console.log(
                'Warning: The renderer "' + a[i].id + '" crashed on ".render()"'
              );
          }
        else
          a[i].render();
    } else {
      if (!this.cameraFrames[camera.id]) {
        a = this.renderersPerCamera[camera.id];
        for (i = 0, l = a.length; i < l; i++)
          if (this.settings('skipErrors'))
            try {
              a[i].render();
            } catch (e) {
              if (this.settings('verbose'))
                console.log(
                  'Warning: The renderer "' +
                    a[i].id +
                    '" crashed on ".render()"'
                );
            }
          else
            a[i].render();

        this.cameraFrames[camera.id] = requestAnimationFrame(function() {
          delete self.cameraFrames[camera.id];
        });
      }
    }

    return this;
  };

  /**
   * This method calls the "kill" method of each module and destroys any
   * reference from the instance.
   */
  sigma.prototype.kill = function() {
    var k;

    // Dispatching event
    this.dispatchEvent('kill');

    // Kill graph:
    this.graph.kill();

    // Kill middlewares:
    delete this.middlewares;

    // Kill each renderer:
    for (k in this.renderers)
      this.killRenderer(this.renderers[k]);

    // Kill each camera:
    for (k in this.cameras)
      this.killCamera(this.cameras[k]);

    delete this.renderers;
    delete this.cameras;

    // Kill everything else:
    for (k in this)
      if (this.hasOwnProperty(k))
        delete this[k];

    delete __instances[this.id];
  };




  /**
   * Returns a clone of the instances object or a specific running instance.
   *
   * @param  {?string} id Eventually an instance ID.
   * @return {object}     The related instance or a clone of the instances
   *                      object.
   */
  sigma.instances = function(id) {
    return arguments.length ?
      __instances[id] :
      sigma.utils.extend({}, __instances);
  };



  /**
   * The current version of sigma:
   */
  sigma.version = '1.2.1';




  /**
   * EXPORT:
   * *******
   */
  if (typeof this.sigma !== 'undefined')
    throw 'An object called sigma is already in the global scope.';

  this.sigma = sigma;

}).call(this);

/**
 * conrad.js is a tiny JavaScript jobs scheduler,
 *
 * Version: 0.1.0
 * Sources: http://github.com/jacomyal/conrad.js
 * Doc:     http://github.com/jacomyal/conrad.js#readme
 *
 * License:
 * --------
 * Copyright © 2013 Alexis Jacomy, Sciences-Po médialab
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * The Software is provided "as is", without warranty of any kind, express or
 * implied, including but not limited to the warranties of merchantability,
 * fitness for a particular purpose and noninfringement. In no event shall the
 * authors or copyright holders be liable for any claim, damages or other
 * liability, whether in an action of contract, tort or otherwise, arising
 * from, out of or in connection with the software or the use or other dealings
 * in the Software.
 */
(function(global) {
  'use strict';

  // Check that conrad.js has not been loaded yet:
  if (global.conrad)
    throw new Error('conrad already exists');


  /**
   * PRIVATE VARIABLES:
   * ******************
   */

  /**
   * A flag indicating whether conrad is running or not.
   *
   * @type {Number}
   */
  var _lastFrameTime;

  /**
   * A flag indicating whether conrad is running or not.
   *
   * @type {Boolean}
   */
  var _isRunning = false;

  /**
   * The hash of registered jobs. Each job must at least have a unique ID
   * under the key "id" and a function under the key "job". This hash
   * contains each running job and each waiting job.
   *
   * @type {Object}
   */
  var _jobs = {};

  /**
   * The hash of currently running jobs.
   *
   * @type {Object}
   */
  var _runningJobs = {};

  /**
   * The array of currently running jobs, sorted by priority.
   *
   * @type {Array}
   */
  var _sortedByPriorityJobs = [];

  /**
   * The array of currently waiting jobs.
   *
   * @type {Object}
   */
  var _waitingJobs = {};

  /**
   * The array of finished jobs. They are stored in an array, since two jobs
   * with the same "id" can happen at two different times.
   *
   * @type {Array}
   */
  var _doneJobs = [];

  /**
   * A dirty flag to keep conrad from starting: Indeed, when addJob() is called
   * with several jobs, conrad must be started only at the end. This flag keeps
   * me from duplicating the code that effectively adds a job.
   *
   * @type {Boolean}
   */
  var _noStart = false;

  /**
   * An hash containing some global settings about how conrad.js should
   * behave.
   *
   * @type {Object}
   */
  var _parameters = {
    frameDuration: 20,
    history: true
  };

  /**
   * This object contains every handlers bound to conrad events. It does not
   * requirea any DOM implementation, since the events are all JavaScript.
   *
   * @type {Object}
   */
  var _handlers = Object.create(null);


  /**
   * PRIVATE FUNCTIONS:
   * ******************
   */

  /**
   * Will execute the handler everytime that the indicated event (or the
   * indicated events) will be triggered.
   *
   * @param  {string|array|object} events  The name of the event (or the events
   *                                       separated by spaces).
   * @param  {function(Object)}    handler The handler to bind.
   * @return {Object}                      Returns conrad.
   */
  function _bind(events, handler) {
    var i,
        i_end,
        event,
        eArray;

    if (!arguments.length)
      return;
    else if (
      arguments.length === 1 &&
      Object(arguments[0]) === arguments[0]
    )
      for (events in arguments[0])
        _bind(events, arguments[0][events]);
    else if (arguments.length > 1) {
      eArray =
        Array.isArray(events) ?
          events :
          events.split(/ /);

      for (i = 0, i_end = eArray.length; i !== i_end; i += 1) {
        event = eArray[i];

        if (!_handlers[event])
          _handlers[event] = [];

        // Using an object instead of directly the handler will make possible
        // later to add flags
        _handlers[event].push({
          handler: handler
        });
      }
    }
  }

  /**
   * Removes the handler from a specified event (or specified events).
   *
   * @param  {?string}           events  The name of the event (or the events
   *                                     separated by spaces). If undefined,
   *                                     then all handlers are removed.
   * @param  {?function(Object)} handler The handler to unbind. If undefined,
   *                                     each handler bound to the event or the
   *                                     events will be removed.
   * @return {Object}            Returns conrad.
   */
  function _unbind(events, handler) {
    var i,
        i_end,
        j,
        j_end,
        a,
        event,
        eArray = Array.isArray(events) ?
                   events :
                   events.split(/ /);

    if (!arguments.length)
      _handlers = Object.create(null);
    else if (handler) {
      for (i = 0, i_end = eArray.length; i !== i_end; i += 1) {
        event = eArray[i];
        if (_handlers[event]) {
          a = [];
          for (j = 0, j_end = _handlers[event].length; j !== j_end; j += 1)
            if (_handlers[event][j].handler !== handler)
              a.push(_handlers[event][j]);

          _handlers[event] = a;
        }

        if (_handlers[event] && _handlers[event].length === 0)
          delete _handlers[event];
      }
    } else
      for (i = 0, i_end = eArray.length; i !== i_end; i += 1)
        delete _handlers[eArray[i]];
  }

  /**
   * Executes each handler bound to the event.
   *
   * @param  {string}  events The name of the event (or the events separated
   *                          by spaces).
   * @param  {?Object} data   The content of the event (optional).
   * @return {Object}         Returns conrad.
   */
  function _dispatch(events, data) {
    var i,
        j,
        i_end,
        j_end,
        event,
        eventName,
        eArray = Array.isArray(events) ?
                   events :
                   events.split(/ /);

    data = data === undefined ? {} : data;

    for (i = 0, i_end = eArray.length; i !== i_end; i += 1) {
      eventName = eArray[i];

      if (_handlers[eventName]) {
        event = {
          type: eventName,
          data: data || {}
        };

        for (j = 0, j_end = _handlers[eventName].length; j !== j_end; j += 1)
          try {
            _handlers[eventName][j].handler(event);
          } catch (e) {}
      }
    }
  }

  /**
   * Executes the most prioritary job once, and deals with filling the stats
   * (done, time, averageTime, currentTime, etc...).
   *
   * @return {?Object} Returns the job object if it has to be killed, null else.
   */
  function _executeFirstJob() {
    var i,
        l,
        test,
        kill,
        pushed = false,
        time = __dateNow(),
        job = _sortedByPriorityJobs.shift();

    // Execute the job and look at the result:
    test = job.job();

    // Deal with stats:
    time = __dateNow() - time;
    job.done++;
    job.time += time;
    job.currentTime += time;
    job.weightTime = job.currentTime / (job.weight || 1);
    job.averageTime = job.time / job.done;

    // Check if the job has to be killed:
    kill = job.count ? (job.count <= job.done) : !test;

    // Reset priorities:
    if (!kill) {
      for (i = 0, l = _sortedByPriorityJobs.length; i < l; i++)
        if (_sortedByPriorityJobs[i].weightTime > job.weightTime) {
          _sortedByPriorityJobs.splice(i, 0, job);
          pushed = true;
          break;
        }

      if (!pushed)
        _sortedByPriorityJobs.push(job);
    }

    return kill ? job : null;
  }

  /**
   * Activates a job, by adding it to the _runningJobs object and the
   * _sortedByPriorityJobs array. It also initializes its currentTime value.
   *
   * @param  {Object} job The job to activate.
   */
  function _activateJob(job) {
    var l = _sortedByPriorityJobs.length;

    // Add the job to the running jobs:
    _runningJobs[job.id] = job;
    job.status = 'running';

    // Add the job to the priorities:
    if (l) {
      job.weightTime = _sortedByPriorityJobs[l - 1].weightTime;
      job.currentTime = job.weightTime * (job.weight || 1);
    }

    // Initialize the job and dispatch:
    job.startTime = __dateNow();
    _dispatch('jobStarted', __clone(job));

    _sortedByPriorityJobs.push(job);
  }

  /**
   * The main loop of conrad.js:
   *  . It executes job such that they all occupate the same processing time.
   *  . It stops jobs that do not need to be executed anymore.
   *  . It triggers callbacks when it is relevant.
   *  . It starts waiting jobs when they need to be started.
   *  . It injects frames to keep a constant frapes per second ratio.
   *  . It stops itself when there are no more jobs to execute.
   */
  function _loop() {
    var k,
        o,
        l,
        job,
        time,
        deadJob;

    // Deal with the newly added jobs (the _jobs object):
    for (k in _jobs) {
      job = _jobs[k];

      if (job.after)
        _waitingJobs[k] = job;
      else
        _activateJob(job);

      delete _jobs[k];
    }

    // Set the _isRunning flag to false if there are no running job:
    _isRunning = !!_sortedByPriorityJobs.length;

    // Deal with the running jobs (the _runningJobs object):
    while (
      _sortedByPriorityJobs.length &&
      __dateNow() - _lastFrameTime < _parameters.frameDuration
    ) {
      deadJob = _executeFirstJob();

      // Deal with the case where the job has ended:
      if (deadJob) {
        _killJob(deadJob.id);

        // Check for waiting jobs:
        for (k in _waitingJobs)
          if (_waitingJobs[k].after === deadJob.id) {
            _activateJob(_waitingJobs[k]);
            delete _waitingJobs[k];
          }
      }
    }

    // Check if conrad still has jobs to deal with, and kill it if not:
    if (_isRunning) {
      // Update the _lastFrameTime:
      _lastFrameTime = __dateNow();

      _dispatch('enterFrame');
      setTimeout(_loop, 0);
    } else
      _dispatch('stop');
  }

  /**
   * Adds one or more jobs, and starts the loop if no job was running before. A
   * job is at least a unique string "id" and a function, and there are some
   * parameters that you can specify for each job to modify the way conrad will
   * execute it. If a job is added with the "id" of another job that is waiting
   * or still running, an error will be thrown.
   *
   * When a job is added, it is referenced in the _jobs object, by its id.
   * Then, if it has to be executed right now, it will be also referenced in
   * the _runningJobs object. If it has to wait, then it will be added into the
   * _waitingJobs object, until it can start.
   *
   * Keep reading this documentation to see how to call this method.
   *
   * @return {Object} Returns conrad.
   *
   * Adding one job:
   * ***************
   * Basically, a job is defined by its string id and a function (the job). It
   * is also possible to add some parameters:
   *
   *  > conrad.addJob('myJobId', myJobFunction);
   *  > conrad.addJob('myJobId', {
   *  >   job: myJobFunction,
   *  >   someParameter: someValue
   *  > });
   *  > conrad.addJob({
   *  >   id: 'myJobId',
   *  >   job: myJobFunction,
   *  >   someParameter: someValue
   *  > });
   *
   * Adding several jobs:
   * ********************
   * When adding several jobs at the same time, it is possible to specify
   * parameters for each one individually or for all:
   *
   *  > conrad.addJob([
   *  >   {
   *  >     id: 'myJobId1',
   *  >     job: myJobFunction1,
   *  >     someParameter1: someValue1
   *  >   },
   *  >   {
   *  >     id: 'myJobId2',
   *  >     job: myJobFunction2,
   *  >     someParameter2: someValue2
   *  >   }
   *  > ], {
   *  >   someCommonParameter: someCommonValue
   *  > });
   *  > conrad.addJob({
   *  >   myJobId1: {,
   *  >     job: myJobFunction1,
   *  >     someParameter1: someValue1
   *  >   },
   *  >   myJobId2: {,
   *  >     job: myJobFunction2,
   *  >     someParameter2: someValue2
   *  >   }
   *  > }, {
   *  >   someCommonParameter: someCommonValue
   *  > });
   *  > conrad.addJob({
   *  >   myJobId1: myJobFunction1,
   *  >   myJobId2: myJobFunction2
   *  > }, {
   *  >   someCommonParameter: someCommonValue
   *  > });
   *
   *  Recognized parameters:
   *  **********************
   *  Here is the exhaustive list of every accepted parameters:
   *
   *    {?Function} end      A callback to execute when the job is ended. It is
   *                         not executed if the job is killed instead of ended
   *                         "naturally".
   *    {?Integer}  count    The number of time the job has to be executed.
   *    {?Number}   weight   If specified, the job will be executed as it was
   *                         added "weight" times.
   *    {?String}   after    The id of another job (eventually not added yet).
   *                         If specified, this job will start only when the
   *                         specified "after" job is ended.
   */
  function _addJob(v1, v2) {
    var i,
        l,
        o;

    // Array of jobs:
    if (Array.isArray(v1)) {
      // Keep conrad to start until the last job is added:
      _noStart = true;

      for (i = 0, l = v1.length; i < l; i++)
        _addJob(v1[i].id, __extend(v1[i], v2));

      _noStart = false;
      if (!_isRunning) {
        // Update the _lastFrameTime:
        _lastFrameTime = __dateNow();

        _dispatch('start');
        _loop();
      }
    } else if (typeof v1 === 'object') {
      // One job (object):
      if (typeof v1.id === 'string')
        _addJob(v1.id, v1);

      // Hash of jobs:
      else {
        // Keep conrad to start until the last job is added:
        _noStart = true;

        for (i in v1)
          if (typeof v1[i] === 'function')
            _addJob(i, __extend({
              job: v1[i]
            }, v2));
          else
            _addJob(i, __extend(v1[i], v2));

        _noStart = false;
        if (!_isRunning) {
          // Update the _lastFrameTime:
          _lastFrameTime = __dateNow();

          _dispatch('start');
          _loop();
        }
      }

    // One job (string, *):
    } else if (typeof v1 === 'string') {
      if (_hasJob(v1))
        throw new Error(
          '[conrad.addJob] Job with id "' + v1 + '" already exists.'
        );

      // One job (string, function):
      if (typeof v2 === 'function') {
        o = {
          id: v1,
          done: 0,
          time: 0,
          status: 'waiting',
          currentTime: 0,
          averageTime: 0,
          weightTime: 0,
          job: v2
        };

      // One job (string, object):
      } else if (typeof v2 === 'object') {
        o = __extend(
          {
            id: v1,
            done: 0,
            time: 0,
            status: 'waiting',
            currentTime: 0,
            averageTime: 0,
            weightTime: 0
          },
          v2
        );

      // If none of those cases, throw an error:
      } else
        throw new Error('[conrad.addJob] Wrong arguments.');

      // Effectively add the job:
      _jobs[v1] = o;
      _dispatch('jobAdded', __clone(o));

      // Check if the loop has to be started:
      if (!_isRunning && !_noStart) {
        // Update the _lastFrameTime:
        _lastFrameTime = __dateNow();

        _dispatch('start');
        _loop();
      }

    // If none of those cases, throw an error:
    } else
      throw new Error('[conrad.addJob] Wrong arguments.');

    return this;
  }

  /**
   * Kills one or more jobs, indicated by their ids. It is only possible to
   * kill running jobs or waiting jobs. If you try to kill a job that does not
   * exist or that is already killed, a warning will be thrown.
   *
   * @param  {Array|String} v1 A string job id or an array of job ids.
   * @return {Object}       Returns conrad.
   */
  function _killJob(v1) {
    var i,
        l,
        k,
        a,
        job,
        found = false;

    // Array of job ids:
    if (Array.isArray(v1))
      for (i = 0, l = v1.length; i < l; i++)
        _killJob(v1[i]);

    // One job's id:
    else if (typeof v1 === 'string') {
      a = [_runningJobs, _waitingJobs, _jobs];

      // Remove the job from the hashes:
      for (i = 0, l = a.length; i < l; i++)
        if (v1 in a[i]) {
          job = a[i][v1];

          if (_parameters.history) {
            job.status = 'done';
            _doneJobs.push(job);
          }

          _dispatch('jobEnded', __clone(job));
          delete a[i][v1];

          if (typeof job.end === 'function')
            job.end();

          found = true;
        }

      // Remove the priorities array:
      a = _sortedByPriorityJobs;
      for (i = 0, l = a.length; i < l; i++)
        if (a[i].id === v1) {
          a.splice(i, 1);
          break;
        }

      if (!found)
        throw new Error('[conrad.killJob] Job "' + v1 + '" not found.');

    // If none of those cases, throw an error:
    } else
      throw new Error('[conrad.killJob] Wrong arguments.');

    return this;
  }

  /**
   * Kills every running, waiting, and just added jobs.
   *
   * @return {Object} Returns conrad.
   */
  function _killAll() {
    var k,
        jobs = __extend(_jobs, _runningJobs, _waitingJobs);

    // Take every jobs and push them into the _doneJobs object:
    if (_parameters.history)
      for (k in jobs) {
        jobs[k].status = 'done';
        _doneJobs.push(jobs[k]);

        if (typeof jobs[k].end === 'function')
          jobs[k].end();
      }

    // Reinitialize the different jobs lists:
    _jobs = {};
    _waitingJobs = {};
    _runningJobs = {};
    _sortedByPriorityJobs = [];

    // In case some jobs are added right after the kill:
    _isRunning = false;

    return this;
  }

  /**
   * Returns true if a job with the specified id is currently running or
   * waiting, and false else.
   *
   * @param  {String}  id The id of the job.
   * @return {?Object} Returns the job object if it exists.
   */
  function _hasJob(id) {
    var job = _jobs[id] || _runningJobs[id] || _waitingJobs[id];
    return job ? __extend(job) : null;
  }

  /**
   * This method will set the setting specified by "v1" to the value specified
   * by "v2" if both are given, and else return the current value of the
   * settings "v1".
   *
   * @param  {String}   v1 The name of the property.
   * @param  {?*}       v2 Eventually, a value to set to the specified
   *                       property.
   * @return {Object|*} Returns the specified settings value if "v2" is not
   *                    given, and conrad else.
   */
  function _settings(v1, v2) {
    var o;

    if (typeof a1 === 'string' && arguments.length === 1)
      return _parameters[a1];
    else {
      o = (typeof a1 === 'object' && arguments.length === 1) ?
        a1 || {} :
        {};
      if (typeof a1 === 'string')
        o[a1] = a2;

      for (var k in o)
        if (o[k] !== undefined)
          _parameters[k] = o[k];
        else
          delete _parameters[k];

      return this;
    }
  }

  /**
   * Returns true if conrad is currently running, and false else.
   *
   * @return {Boolean} Returns _isRunning.
   */
  function _getIsRunning() {
    return _isRunning;
  }

  /**
   * Unreference every job that is stored in the _doneJobs object. It will
   * not be possible anymore to get stats about these jobs, but it will release
   * the memory.
   *
   * @return {Object} Returns conrad.
   */
  function _clearHistory() {
    _doneJobs = [];
    return this;
  }

  /**
   * Returns a snapshot of every data about jobs that wait to be started, are
   * currently running or are done.
   *
   * It is possible to get only running, waiting or done jobs by giving
   * "running", "waiting" or "done" as fist argument.
   *
   * It is also possible to get every job with a specified id by giving it as
   * first argument. Also, using a RegExp instead of an id will return every
   * jobs whose ids match the RegExp. And these two last use cases work as well
   * by giving before "running", "waiting" or "done".
   *
   * @return {Array} The array of the matching jobs.
   *
   * Some call examples:
   * *******************
   *  > conrad.getStats('running')
   *  > conrad.getStats('waiting')
   *  > conrad.getStats('done')
   *  > conrad.getStats('myJob')
   *  > conrad.getStats(/test/)
   *  > conrad.getStats('running', 'myRunningJob')
   *  > conrad.getStats('running', /test/)
   */
  function _getStats(v1, v2) {
    var a,
        k,
        i,
        l,
        stats,
        pattern,
        isPatternString;

    if (!arguments.length) {
      stats = [];

      for (k in _jobs)
        stats.push(_jobs[k]);

      for (k in _waitingJobs)
        stats.push(_waitingJobs[k]);

      for (k in _runningJobs)
        stats.push(_runningJobs[k]);

      stats = stats.concat(_doneJobs);
    }

    if (typeof v1 === 'string')
      switch (v1) {
        case 'waiting':
          stats = __objectValues(_waitingJobs);
          break;
        case 'running':
          stats = __objectValues(_runningJobs);
          break;
        case 'done':
          stats = _doneJobs;
          break;
        default:
          pattern = v1;
      }

    if (v1 instanceof RegExp)
      pattern = v1;

    if (!pattern && (typeof v2 === 'string' || v2 instanceof RegExp))
      pattern = v2;

    // Filter jobs if a pattern is given:
    if (pattern) {
      isPatternString = typeof pattern === 'string';

      if (stats instanceof Array) {
        a = stats;
      } else if (typeof stats === 'object') {
        a = [];

        for (k in stats)
          a = a.concat(stats[k]);
      } else {
        a = [];

        for (k in _jobs)
          a.push(_jobs[k]);

        for (k in _waitingJobs)
          a.push(_waitingJobs[k]);

        for (k in _runningJobs)
          a.push(_runningJobs[k]);

        a = a.concat(_doneJobs);
      }

      stats = [];
      for (i = 0, l = a.length; i < l; i++)
        if (isPatternString ? a[i].id === pattern : a[i].id.match(pattern))
          stats.push(a[i]);
    }

    return __clone(stats);
  }


  /**
   * TOOLS FUNCTIONS:
   * ****************
   */

  /**
   * This function takes any number of objects as arguments, copies from each
   * of these objects each pair key/value into a new object, and finally
   * returns this object.
   *
   * The arguments are parsed from the last one to the first one, such that
   * when two objects have keys in common, the "earliest" object wins.
   *
   * Example:
   * ********
   *  > var o1 = {
   *  >       a: 1,
   *  >       b: 2,
   *  >       c: '3'
   *  >     },
   *  >     o2 = {
   *  >       c: '4',
   *  >       d: [ 5 ]
   *  >     };
   *  > __extend(o1, o2);
   *  > // Returns: {
   *  > //   a: 1,
   *  > //   b: 2,
   *  > //   c: '3',
   *  > //   d: [ 5 ]
   *  > // };
   *
   * @param  {Object+} Any number of objects.
   * @return {Object}  The merged object.
   */
  function __extend() {
    var i,
        k,
        res = {},
        l = arguments.length;

    for (i = l - 1; i >= 0; i--)
      for (k in arguments[i])
        res[k] = arguments[i][k];

    return res;
  }

  /**
   * This function simply clones an object. This object must contain only
   * objects, arrays and immutable values. Since it is not public, it does not
   * deal with cyclic references, DOM elements and instantiated objects - so
   * use it carefully.
   *
   * @param  {Object} The object to clone.
   * @return {Object} The clone.
   */
  function __clone(item) {
    var result, i, k, l;

    if (!item)
      return item;

    if (Array.isArray(item)) {
      result = [];
      for (i = 0, l = item.length; i < l; i++)
        result.push(__clone(item[i]));
    } else if (typeof item === 'object') {
      result = {};
      for (i in item)
        result[i] = __clone(item[i]);
    } else
      result = item;

    return result;
  }

  /**
   * Returns an array containing the values of an object.
   *
   * @param  {Object} The object.
   * @return {Array}  The array of values.
   */
  function __objectValues(o) {
    var k,
        a = [];

    for (k in o)
      a.push(o[k]);

    return a;
  }

  /**
   * A short "Date.now()" polyfill.
   *
   * @return {Number} The current time (in ms).
   */
  function __dateNow() {
    return Date.now ? Date.now() : new Date().getTime();
  }

  /**
   * Polyfill for the Array.isArray function:
   */
  if (!Array.isArray)
    Array.isArray = function(v) {
      return Object.prototype.toString.call(v) === '[object Array]';
    };


  /**
   * EXPORT PUBLIC API:
   * ******************
   */
  var conrad = {
    hasJob: _hasJob,
    addJob: _addJob,
    killJob: _killJob,
    killAll: _killAll,
    settings: _settings,
    getStats: _getStats,
    isRunning: _getIsRunning,
    clearHistory: _clearHistory,

    // Events management:
    bind: _bind,
    unbind: _unbind,

    // Version:
    version: '0.1.0'
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = conrad;
    exports.conrad = conrad;
  }
  global.conrad = conrad;
})(this);

// Hardcoded export for the node.js version:
var sigma = this.sigma,
    conrad = this.conrad;

sigma.conrad = conrad;

// Dirty polyfills to permit sigma usage in node
if (typeof HTMLElement === 'undefined')
  HTMLElement = function() {};

if (typeof window === 'undefined')
  window = {
    addEventListener: function() {}
  };

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports)
    exports = module.exports = sigma;
  exports.sigma = sigma;
}

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  var _root = this;

  // Initialize packages:
  sigma.utils = sigma.utils || {};

  /**
   * MISC UTILS:
   */
  /**
   * This function takes any number of objects as arguments, copies from each
   * of these objects each pair key/value into a new object, and finally
   * returns this object.
   *
   * The arguments are parsed from the last one to the first one, such that
   * when several objects have keys in common, the "earliest" object wins.
   *
   * Example:
   * ********
   *  > var o1 = {
   *  >       a: 1,
   *  >       b: 2,
   *  >       c: '3'
   *  >     },
   *  >     o2 = {
   *  >       c: '4',
   *  >       d: [ 5 ]
   *  >     };
   *  > sigma.utils.extend(o1, o2);
   *  > // Returns: {
   *  > //   a: 1,
   *  > //   b: 2,
   *  > //   c: '3',
   *  > //   d: [ 5 ]
   *  > // };
   *
   * @param  {object+} Any number of objects.
   * @return {object}  The merged object.
   */
  sigma.utils.extend = function() {
    var i,
        k,
        res = {},
        l = arguments.length;

    for (i = l - 1; i >= 0; i--)
      for (k in arguments[i])
        res[k] = arguments[i][k];

    return res;
  };

  /**
   * A short "Date.now()" polyfill.
   *
   * @return {Number} The current time (in ms).
   */
  sigma.utils.dateNow = function() {
    return Date.now ? Date.now() : new Date().getTime();
  };

  /**
   * Takes a package name as parameter and checks at each lebel if it exists,
   * and if it does not, creates it.
   *
   * Example:
   * ********
   *  > sigma.utils.pkg('a.b.c');
   *  > a.b.c;
   *  > // Object {};
   *  >
   *  > sigma.utils.pkg('a.b.d');
   *  > a.b;
   *  > // Object { c: {}, d: {} };
   *
   * @param  {string} pkgName The name of the package to create/find.
   * @return {object}         The related package.
   */
  sigma.utils.pkg = function(pkgName) {
    return (pkgName || '').split('.').reduce(function(context, objName) {
      return (objName in context) ?
        context[objName] :
        (context[objName] = {});
    }, _root);
  };

  /**
   * Returns a unique incremental number ID.
   *
   * Example:
   * ********
   *  > sigma.utils.id();
   *  > // 1;
   *  >
   *  > sigma.utils.id();
   *  > // 2;
   *  >
   *  > sigma.utils.id();
   *  > // 3;
   *
   * @param  {string} pkgName The name of the package to create/find.
   * @return {object}         The related package.
   */
  sigma.utils.id = (function() {
    var i = 0;
    return function() {
      return ++i;
    };
  })();

  /**
   * This function takes an hexa color (for instance "#ffcc00" or "#fc0") or a
   * rgb / rgba color (like "rgb(255,255,12)" or "rgba(255,255,12,1)") and
   * returns an integer equal to "r * 255 * 255 + g * 255 + b", to gain some
   * memory in the data given to WebGL shaders.
   *
   * Note that the function actually caches its results for better performance.
   *
   * @param  {string} val The hexa or rgba color.
   * @return {number}     The number value.
   */
  var floatColorCache = {};

  sigma.utils.floatColor = function(val) {

    // Is the color already computed?
    if (floatColorCache[val])
      return floatColorCache[val];

    var original = val,
        r = 0,
        g = 0,
        b = 0;

    if (val[0] === '#') {
      val = val.slice(1);

      if (val.length === 3) {
        r = parseInt(val.charAt(0) + val.charAt(0), 16);
        g = parseInt(val.charAt(1) + val.charAt(1), 16);
        b = parseInt(val.charAt(2) + val.charAt(2), 16);
      }
      else {
        r = parseInt(val.charAt(0) + val.charAt(1), 16);
        g = parseInt(val.charAt(2) + val.charAt(3), 16);
        b = parseInt(val.charAt(4) + val.charAt(5), 16);
      }
    } else if (val.match(/^ *rgba? *\(/)) {
      val = val.match(
        /^ *rgba? *\( *([0-9]*) *, *([0-9]*) *, *([0-9]*) *(,.*)?\) *$/
      );
      r = +val[1];
      g = +val[2];
      b = +val[3];
    }

    var color = (
      r * 256 * 256 +
      g * 256 +
      b
    );

    // Caching the color
    floatColorCache[original] = color;

    return color;
  };

    /**
   * Perform a zoom into a camera, with or without animation, to the
   * coordinates indicated using a specified ratio.
   *
   * Recognized parameters:
   * **********************
   * Here is the exhaustive list of every accepted parameters in the animation
   * object:
   *
   *   {?number} duration     An amount of time that means the duration of the
   *                          animation. If this parameter doesn't exist the
   *                          zoom will be performed without animation.
   *   {?function} onComplete A function to perform it after the animation. It
   *                          will be performed even if there is no duration.
   *
   * @param {camera}     The camera where perform the zoom.
   * @param {x}          The X coordiantion where the zoom goes.
   * @param {y}          The Y coordiantion where the zoom goes.
   * @param {ratio}      The ratio to apply it to the current camera ratio.
   * @param {?animation} A dictionary with options for a possible animation.
   */
  sigma.utils.zoomTo = function(camera, x, y, ratio, animation) {
    var settings = camera.settings,
        count,
        newRatio,
        animationSettings,
        coordinates;

    // Create the newRatio dealing with min / max:
    newRatio = Math.max(
      settings('zoomMin'),
      Math.min(
        settings('zoomMax'),
        camera.ratio * ratio
      )
    );

    // Check that the new ratio is different from the initial one:
    if (newRatio !== camera.ratio) {
      // Create the coordinates variable:
      ratio = newRatio / camera.ratio;
      coordinates = {
        x: x * (1 - ratio) + camera.x,
        y: y * (1 - ratio) + camera.y,
        ratio: newRatio
      };

      if (animation && animation.duration) {
        // Complete the animation setings:
        count = sigma.misc.animation.killAll(camera);
        animation = sigma.utils.extend(
          animation,
          {
            easing: count ? 'quadraticOut' : 'quadraticInOut'
          }
        );

        sigma.misc.animation.camera(camera, coordinates, animation);
      } else {
        camera.goTo(coordinates);
        if (animation && animation.onComplete)
          animation.onComplete();
      }
    }
  };

  /**
   * Return the control point coordinates for a quadratic bezier curve.
   *
   * @param  {number} x1  The X coordinate of the start point.
   * @param  {number} y1  The Y coordinate of the start point.
   * @param  {number} x2  The X coordinate of the end point.
   * @param  {number} y2  The Y coordinate of the end point.
   * @return {x,y}        The control point coordinates.
   */
  sigma.utils.getQuadraticControlPoint = function(x1, y1, x2, y2) {
    return {
      x: (x1 + x2) / 2 + (y2 - y1) / 4,
      y: (y1 + y2) / 2 + (x1 - x2) / 4
    };
  };

  /**
    * Compute the coordinates of the point positioned
    * at length t in the quadratic bezier curve.
    *
    * @param  {number} t  In [0,1] the step percentage to reach
    *                     the point in the curve from the context point.
    * @param  {number} x1 The X coordinate of the context point.
    * @param  {number} y1 The Y coordinate of the context point.
    * @param  {number} x2 The X coordinate of the ending point.
    * @param  {number} y2 The Y coordinate of the ending point.
    * @param  {number} xi The X coordinate of the control point.
    * @param  {number} yi The Y coordinate of the control point.
    * @return {object}    {x,y}.
  */
  sigma.utils.getPointOnQuadraticCurve = function(t, x1, y1, x2, y2, xi, yi) {
    // http://stackoverflow.com/a/5634528
    return {
      x: Math.pow(1 - t, 2) * x1 + 2 * (1 - t) * t * xi + Math.pow(t, 2) * x2,
      y: Math.pow(1 - t, 2) * y1 + 2 * (1 - t) * t * yi + Math.pow(t, 2) * y2
    };
  };

  /**
    * Compute the coordinates of the point positioned
    * at length t in the cubic bezier curve.
    *
    * @param  {number} t  In [0,1] the step percentage to reach
    *                     the point in the curve from the context point.
    * @param  {number} x1 The X coordinate of the context point.
    * @param  {number} y1 The Y coordinate of the context point.
    * @param  {number} x2 The X coordinate of the end point.
    * @param  {number} y2 The Y coordinate of the end point.
    * @param  {number} cx The X coordinate of the first control point.
    * @param  {number} cy The Y coordinate of the first control point.
    * @param  {number} dx The X coordinate of the second control point.
    * @param  {number} dy The Y coordinate of the second control point.
    * @return {object}    {x,y} The point at t.
  */
  sigma.utils.getPointOnBezierCurve =
    function(t, x1, y1, x2, y2, cx, cy, dx, dy) {
    // http://stackoverflow.com/a/15397596
    // Blending functions:
    var B0_t = Math.pow(1 - t, 3),
        B1_t = 3 * t * Math.pow(1 - t, 2),
        B2_t = 3 * Math.pow(t, 2) * (1 - t),
        B3_t = Math.pow(t, 3);

    return {
      x: (B0_t * x1) + (B1_t * cx) + (B2_t * dx) + (B3_t * x2),
      y: (B0_t * y1) + (B1_t * cy) + (B2_t * dy) + (B3_t * y2)
    };
  };

  /**
   * Return the coordinates of the two control points for a self loop (i.e.
   * where the start point is also the end point) computed as a cubic bezier
   * curve.
   *
   * @param  {number} x    The X coordinate of the node.
   * @param  {number} y    The Y coordinate of the node.
   * @param  {number} size The node size.
   * @return {x1,y1,x2,y2} The coordinates of the two control points.
   */
  sigma.utils.getSelfLoopControlPoints = function(x , y, size) {
    return {
      x1: x - size * 7,
      y1: y,
      x2: x,
      y2: y + size * 7
    };
  };

  /**
   * Return the euclidian distance between two points of a plane
   * with an orthonormal basis.
   *
   * @param  {number} x1  The X coordinate of the first point.
   * @param  {number} y1  The Y coordinate of the first point.
   * @param  {number} x2  The X coordinate of the second point.
   * @param  {number} y2  The Y coordinate of the second point.
   * @return {number}     The euclidian distance.
   */
  sigma.utils.getDistance = function(x0, y0, x1, y1) {
    return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
  };

  /**
   * Return the coordinates of the intersection points of two circles.
   *
   * @param  {number} x0  The X coordinate of center location of the first
   *                      circle.
   * @param  {number} y0  The Y coordinate of center location of the first
   *                      circle.
   * @param  {number} r0  The radius of the first circle.
   * @param  {number} x1  The X coordinate of center location of the second
   *                      circle.
   * @param  {number} y1  The Y coordinate of center location of the second
   *                      circle.
   * @param  {number} r1  The radius of the second circle.
   * @return {xi,yi}      The coordinates of the intersection points.
   */
  sigma.utils.getCircleIntersection = function(x0, y0, r0, x1, y1, r1) {
    // http://stackoverflow.com/a/12219802
    var a, dx, dy, d, h, rx, ry, x2, y2;

    // dx and dy are the vertical and horizontal distances between the circle
    // centers:
    dx = x1 - x0;
    dy = y1 - y0;

    // Determine the straight-line distance between the centers:
    d = Math.sqrt((dy * dy) + (dx * dx));

    // Check for solvability:
    if (d > (r0 + r1)) {
        // No solution. circles do not intersect.
        return false;
    }
    if (d < Math.abs(r0 - r1)) {
        // No solution. one circle is contained in the other.
        return false;
    }

    //'point 2' is the point where the line through the circle intersection
    // points crosses the line between the circle centers.

    // Determine the distance from point 0 to point 2:
    a = ((r0 * r0) - (r1 * r1) + (d * d)) / (2.0 * d);

    // Determine the coordinates of point 2:
    x2 = x0 + (dx * a / d);
    y2 = y0 + (dy * a / d);

    // Determine the distance from point 2 to either of the intersection
    // points:
    h = Math.sqrt((r0 * r0) - (a * a));

    // Determine the offsets of the intersection points from point 2:
    rx = -dy * (h / d);
    ry = dx * (h / d);

    // Determine the absolute intersection points:
    var xi = x2 + rx;
    var xi_prime = x2 - rx;
    var yi = y2 + ry;
    var yi_prime = y2 - ry;

    return {xi: xi, xi_prime: xi_prime, yi: yi, yi_prime: yi_prime};
  };

  /**
    * Check if a point is on a line segment.
    *
    * @param  {number} x       The X coordinate of the point to check.
    * @param  {number} y       The Y coordinate of the point to check.
    * @param  {number} x1      The X coordinate of the line start point.
    * @param  {number} y1      The Y coordinate of the line start point.
    * @param  {number} x2      The X coordinate of the line end point.
    * @param  {number} y2      The Y coordinate of the line end point.
    * @param  {number} epsilon The precision (consider the line thickness).
    * @return {boolean}        True if point is "close to" the line
    *                          segment, false otherwise.
  */
  sigma.utils.isPointOnSegment = function(x, y, x1, y1, x2, y2, epsilon) {
    // http://stackoverflow.com/a/328122
    var crossProduct = Math.abs((y - y1) * (x2 - x1) - (x - x1) * (y2 - y1)),
        d = sigma.utils.getDistance(x1, y1, x2, y2),
        nCrossProduct = crossProduct / d; // normalized cross product

    return (nCrossProduct < epsilon &&
     Math.min(x1, x2) <= x && x <= Math.max(x1, x2) &&
     Math.min(y1, y2) <= y && y <= Math.max(y1, y2));
  };

  /**
    * Check if a point is on a quadratic bezier curve segment with a thickness.
    *
    * @param  {number} x       The X coordinate of the point to check.
    * @param  {number} y       The Y coordinate of the point to check.
    * @param  {number} x1      The X coordinate of the curve start point.
    * @param  {number} y1      The Y coordinate of the curve start point.
    * @param  {number} x2      The X coordinate of the curve end point.
    * @param  {number} y2      The Y coordinate of the curve end point.
    * @param  {number} cpx     The X coordinate of the curve control point.
    * @param  {number} cpy     The Y coordinate of the curve control point.
    * @param  {number} epsilon The precision (consider the line thickness).
    * @return {boolean}        True if (x,y) is on the curve segment,
    *                          false otherwise.
  */
  sigma.utils.isPointOnQuadraticCurve =
    function(x, y, x1, y1, x2, y2, cpx, cpy, epsilon) {
    // Fails if the point is too far from the extremities of the segment,
    // preventing for more costly computation:
    var dP1P2 = sigma.utils.getDistance(x1, y1, x2, y2);
    if (Math.abs(x - x1) > dP1P2 || Math.abs(y - y1) > dP1P2) {
      return false;
    }

    var dP1 = sigma.utils.getDistance(x, y, x1, y1),
        dP2 = sigma.utils.getDistance(x, y, x2, y2),
        t = 0.5,
        r = (dP1 < dP2) ? -0.01 : 0.01,
        rThreshold = 0.001,
        i = 100,
        pt = sigma.utils.getPointOnQuadraticCurve(t, x1, y1, x2, y2, cpx, cpy),
        dt = sigma.utils.getDistance(x, y, pt.x, pt.y),
        old_dt;

    // This algorithm minimizes the distance from the point to the curve. It
    // find the optimal t value where t=0 is the start point and t=1 is the end
    // point of the curve, starting from t=0.5.
    // It terminates because it runs a maximum of i interations.
    while (i-- > 0 &&
      t >= 0 && t <= 1 &&
      (dt > epsilon) &&
      (r > rThreshold || r < -rThreshold)) {
      old_dt = dt;
      pt = sigma.utils.getPointOnQuadraticCurve(t, x1, y1, x2, y2, cpx, cpy);
      dt = sigma.utils.getDistance(x, y, pt.x, pt.y);

      if (dt > old_dt) {
        // not the right direction:
        // halfstep in the opposite direction
        r = -r / 2;
        t += r;
      }
      else if (t + r < 0 || t + r > 1) {
        // oops, we've gone too far:
        // revert with a halfstep
        r = r / 2;
        dt = old_dt;
      }
      else {
        // progress:
        t += r;
      }
    }

    return dt < epsilon;
  };


  /**
    * Check if a point is on a cubic bezier curve segment with a thickness.
    *
    * @param  {number} x       The X coordinate of the point to check.
    * @param  {number} y       The Y coordinate of the point to check.
    * @param  {number} x1      The X coordinate of the curve start point.
    * @param  {number} y1      The Y coordinate of the curve start point.
    * @param  {number} x2      The X coordinate of the curve end point.
    * @param  {number} y2      The Y coordinate of the curve end point.
    * @param  {number} cpx1    The X coordinate of the 1st curve control point.
    * @param  {number} cpy1    The Y coordinate of the 1st curve control point.
    * @param  {number} cpx2    The X coordinate of the 2nd curve control point.
    * @param  {number} cpy2    The Y coordinate of the 2nd curve control point.
    * @param  {number} epsilon The precision (consider the line thickness).
    * @return {boolean}        True if (x,y) is on the curve segment,
    *                          false otherwise.
  */
  sigma.utils.isPointOnBezierCurve =
    function(x, y, x1, y1, x2, y2, cpx1, cpy1, cpx2, cpy2, epsilon) {
    // Fails if the point is too far from the extremities of the segment,
    // preventing for more costly computation:
    var dP1CP1 = sigma.utils.getDistance(x1, y1, cpx1, cpy1);
    if (Math.abs(x - x1) > dP1CP1 || Math.abs(y - y1) > dP1CP1) {
      return false;
    }

    var dP1 = sigma.utils.getDistance(x, y, x1, y1),
        dP2 = sigma.utils.getDistance(x, y, x2, y2),
        t = 0.5,
        r = (dP1 < dP2) ? -0.01 : 0.01,
        rThreshold = 0.001,
        i = 100,
        pt = sigma.utils.getPointOnBezierCurve(
          t, x1, y1, x2, y2, cpx1, cpy1, cpx2, cpy2),
        dt = sigma.utils.getDistance(x, y, pt.x, pt.y),
        old_dt;

    // This algorithm minimizes the distance from the point to the curve. It
    // find the optimal t value where t=0 is the start point and t=1 is the end
    // point of the curve, starting from t=0.5.
    // It terminates because it runs a maximum of i interations.
    while (i-- > 0 &&
      t >= 0 && t <= 1 &&
      (dt > epsilon) &&
      (r > rThreshold || r < -rThreshold)) {
      old_dt = dt;
      pt = sigma.utils.getPointOnBezierCurve(
        t, x1, y1, x2, y2, cpx1, cpy1, cpx2, cpy2);
      dt = sigma.utils.getDistance(x, y, pt.x, pt.y);

      if (dt > old_dt) {
        // not the right direction:
        // halfstep in the opposite direction
        r = -r / 2;
        t += r;
      }
      else if (t + r < 0 || t + r > 1) {
        // oops, we've gone too far:
        // revert with a halfstep
        r = r / 2;
        dt = old_dt;
      }
      else {
        // progress:
        t += r;
      }
    }

    return dt < epsilon;
  };


  /**
   * ************
   * EVENTS UTILS:
   * ************
   */
  /**
   * Here are some useful functions to unify extraction of the information we
   * need with mouse events and touch events, from different browsers:
   */

  /**
   * Extract the local X position from a mouse or touch event.
   *
   * @param  {event}  e A mouse or touch event.
   * @return {number}   The local X value of the mouse.
   */
  sigma.utils.getX = function(e) {
    return (
      (e.offsetX !== undefined && e.offsetX) ||
      (e.layerX !== undefined && e.layerX) ||
      (e.clientX !== undefined && e.clientX)
    );
  };

  /**
   * Extract the local Y position from a mouse or touch event.
   *
   * @param  {event}  e A mouse or touch event.
   * @return {number}   The local Y value of the mouse.
   */
  sigma.utils.getY = function(e) {
    return (
      (e.offsetY !== undefined && e.offsetY) ||
      (e.layerY !== undefined && e.layerY) ||
      (e.clientY !== undefined && e.clientY)
    );
  };

  /**
   * The pixel ratio of the screen. Taking zoom into account
   *
   * @return {number}        Pixel ratio of the screen
   */
  sigma.utils.getPixelRatio = function() {
    var ratio = 1;
    if (window.screen.deviceXDPI !== undefined &&
         window.screen.logicalXDPI !== undefined &&
         window.screen.deviceXDPI > window.screen.logicalXDPI) {
        ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
    }
    else if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
    }
    return ratio;
  };

  /**
   * Extract the width from a mouse or touch event.
   *
   * @param  {event}  e A mouse or touch event.
   * @return {number}   The width of the event's target.
   */
  sigma.utils.getWidth = function(e) {
    var w = (!e.target.ownerSVGElement) ?
              e.target.width :
              e.target.ownerSVGElement.width;

    return (
      (typeof w === 'number' && w) ||
      (w !== undefined && w.baseVal !== undefined && w.baseVal.value)
    );
  };

  /**
   * Extract the center from a mouse or touch event.
   *
   * @param  {event}  e A mouse or touch event.
   * @return {object}   The center of the event's target.
   */
  sigma.utils.getCenter = function(e) {
    var ratio = e.target.namespaceURI.indexOf('svg') !== -1 ? 1 :
        sigma.utils.getPixelRatio();
    return {
      x: sigma.utils.getWidth(e) / (2 * ratio),
      y: sigma.utils.getHeight(e) / (2 * ratio)
    };
  };

  /**
   * Convert mouse coords to sigma coords
   *
   * @param  {event}   e A mouse or touch event.
   * @param  {number?} x The x coord to convert
   * @param  {number?} x The y coord to convert
   *
   * @return {object}    The standardized event
   */
  sigma.utils.mouseCoords = function(e, x, y) {
    x = x || sigma.utils.getX(e);
    y = y || sigma.utils.getY(e);
    return {
        x: x - sigma.utils.getCenter(e).x,
        y: y - sigma.utils.getCenter(e).y,
        clientX: e.clientX,
        clientY: e.clientY,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey
    };
  };

  /**
   * Extract the height from a mouse or touch event.
   *
   * @param  {event}  e A mouse or touch event.
   * @return {number}   The height of the event's target.
   */
  sigma.utils.getHeight = function(e) {
    var h = (!e.target.ownerSVGElement) ?
              e.target.height :
              e.target.ownerSVGElement.height;

    return (
      (typeof h === 'number' && h) ||
      (h !== undefined && h.baseVal !== undefined && h.baseVal.value)
    );
  };

  /**
   * Extract the wheel delta from a mouse or touch event.
   *
   * @param  {event}  e A mouse or touch event.
   * @return {number}   The wheel delta of the mouse.
   */
  sigma.utils.getDelta = function(e) {
    return (
      (e.wheelDelta !== undefined && e.wheelDelta) ||
      (e.detail !== undefined && -e.detail)
    );
  };

  /**
   * Returns the offset of a DOM element.
   *
   * @param  {DOMElement} dom The element to retrieve the position.
   * @return {object}         The offset of the DOM element (top, left).
   */
  sigma.utils.getOffset = function(dom) {
    var left = 0,
        top = 0;

    while (dom) {
      top = top + parseInt(dom.offsetTop);
      left = left + parseInt(dom.offsetLeft);
      dom = dom.offsetParent;
    }

    return {
      top: top,
      left: left
    };
  };

  /**
   * Simulates a "double click" event.
   *
   * @param  {HTMLElement} target   The event target.
   * @param  {string}      type     The event type.
   * @param  {function}    callback The callback to execute.
   */
  sigma.utils.doubleClick = function(target, type, callback) {
    var clicks = 0,
        self = this,
        handlers;

    target._doubleClickHandler = target._doubleClickHandler || {};
    target._doubleClickHandler[type] = target._doubleClickHandler[type] || [];
    handlers = target._doubleClickHandler[type];

    handlers.push(function(e) {
      clicks++;

      if (clicks === 2) {
        clicks = 0;
        return callback(e);
      } else if (clicks === 1) {
        setTimeout(function() {
          clicks = 0;
        }, sigma.settings.doubleClickTimeout);
      }
    });

    target.addEventListener(type, handlers[handlers.length - 1], false);
  };

  /**
   * Unbind simulated "double click" events.
   *
   * @param  {HTMLElement} target   The event target.
   * @param  {string}      type     The event type.
   */
  sigma.utils.unbindDoubleClick = function(target, type) {
    var handler,
        handlers = (target._doubleClickHandler || {})[type] || [];

    while ((handler = handlers.pop())) {
      target.removeEventListener(type, handler);
    }

    delete (target._doubleClickHandler || {})[type];
  };




  /**
   * Here are just some of the most basic easing functions, used for the
   * animated camera "goTo" calls.
   *
   * If you need some more easings functions, don't hesitate to add them to
   * sigma.utils.easings. But I will not add some more here or merge PRs
   * containing, because I do not want sigma sources full of overkill and never
   * used stuff...
   */
  sigma.utils.easings = sigma.utils.easings || {};
  sigma.utils.easings.linearNone = function(k) {
    return k;
  };
  sigma.utils.easings.quadraticIn = function(k) {
    return k * k;
  };
  sigma.utils.easings.quadraticOut = function(k) {
    return k * (2 - k);
  };
  sigma.utils.easings.quadraticInOut = function(k) {
    if ((k *= 2) < 1)
      return 0.5 * k * k;
    return - 0.5 * (--k * (k - 2) - 1);
  };
  sigma.utils.easings.cubicIn = function(k) {
    return k * k * k;
  };
  sigma.utils.easings.cubicOut = function(k) {
    return --k * k * k + 1;
  };
  sigma.utils.easings.cubicInOut = function(k) {
    if ((k *= 2) < 1)
      return 0.5 * k * k * k;
    return 0.5 * ((k -= 2) * k * k + 2);
  };




  /**
   * ************
   * WEBGL UTILS:
   * ************
   */
  /**
   * Loads a WebGL shader and returns it.
   *
   * @param  {WebGLContext}           gl           The WebGLContext to use.
   * @param  {string}                 shaderSource The shader source.
   * @param  {number}                 shaderType   The type of shader.
   * @param  {function(string): void} error        Callback for errors.
   * @return {WebGLShader}                         The created shader.
   */
  sigma.utils.loadShader = function(gl, shaderSource, shaderType, error) {
    var compiled,
        shader = gl.createShader(shaderType);

    // Load the shader source
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    // If something went wrong:
    if (!compiled) {
      if (error) {
        error(
          'Error compiling shader "' + shader + '":' +
          gl.getShaderInfoLog(shader)
        );
      }

      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  /**
   * Creates a program, attaches shaders, binds attrib locations, links the
   * program and calls useProgram.
   *
   * @param  {Array.<WebGLShader>}    shaders   The shaders to attach.
   * @param  {Array.<string>}         attribs   The attribs names.
   * @param  {Array.<number>}         locations The locations for the attribs.
   * @param  {function(string): void} error     Callback for errors.
   * @return {WebGLProgram}                     The created program.
   */
  sigma.utils.loadProgram = function(gl, shaders, attribs, loc, error) {
    var i,
        linked,
        program = gl.createProgram();

    for (i = 0; i < shaders.length; ++i)
      gl.attachShader(program, shaders[i]);

    if (attribs)
      for (i = 0; i < attribs.length; ++i)
        gl.bindAttribLocation(
          program,
          locations ? locations[i] : i,
          opt_attribs[i]
        );

    gl.linkProgram(program);

    // Check the link status
    linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      if (error)
        error('Error in program linking: ' + gl.getProgramInfoLog(program));

      gl.deleteProgram(program);
      return null;
    }

    return program;
  };




  /**
   * *********
   * MATRICES:
   * *********
   * The following utils are just here to help generating the transformation
   * matrices for the WebGL renderers.
   */
  sigma.utils.pkg('sigma.utils.matrices');

  /**
   * The returns a 3x3 translation matrix.
   *
   * @param  {number} dx The X translation.
   * @param  {number} dy The Y translation.
   * @return {array}     Returns the matrix.
   */
  sigma.utils.matrices.translation = function(dx, dy) {
    return [
      1, 0, 0,
      0, 1, 0,
      dx, dy, 1
    ];
  };

  /**
   * The returns a 3x3 or 2x2 rotation matrix.
   *
   * @param  {number}  angle The rotation angle.
   * @param  {boolean} m2    If true, the function will return a 2x2 matrix.
   * @return {array}         Returns the matrix.
   */
  sigma.utils.matrices.rotation = function(angle, m2) {
    var cos = Math.cos(angle),
        sin = Math.sin(angle);

    return m2 ? [
      cos, -sin,
      sin, cos
    ] : [
      cos, -sin, 0,
      sin, cos, 0,
      0, 0, 1
    ];
  };

  /**
   * The returns a 3x3 or 2x2 homothetic transformation matrix.
   *
   * @param  {number}  ratio The scaling ratio.
   * @param  {boolean} m2    If true, the function will return a 2x2 matrix.
   * @return {array}         Returns the matrix.
   */
  sigma.utils.matrices.scale = function(ratio, m2) {
    return m2 ? [
      ratio, 0,
      0, ratio
    ] : [
      ratio, 0, 0,
      0, ratio, 0,
      0, 0, 1
    ];
  };

  /**
   * The returns a 3x3 or 2x2 homothetic transformation matrix.
   *
   * @param  {array}   a  The first matrix.
   * @param  {array}   b  The second matrix.
   * @param  {boolean} m2 If true, the function will assume both matrices are
   *                      2x2.
   * @return {array}      Returns the matrix.
   */
  sigma.utils.matrices.multiply = function(a, b, m2) {
    var l = m2 ? 2 : 3,
        a00 = a[0 * l + 0],
        a01 = a[0 * l + 1],
        a02 = a[0 * l + 2],
        a10 = a[1 * l + 0],
        a11 = a[1 * l + 1],
        a12 = a[1 * l + 2],
        a20 = a[2 * l + 0],
        a21 = a[2 * l + 1],
        a22 = a[2 * l + 2],
        b00 = b[0 * l + 0],
        b01 = b[0 * l + 1],
        b02 = b[0 * l + 2],
        b10 = b[1 * l + 0],
        b11 = b[1 * l + 1],
        b12 = b[1 * l + 2],
        b20 = b[2 * l + 0],
        b21 = b[2 * l + 1],
        b22 = b[2 * l + 2];

    return m2 ? [
      a00 * b00 + a01 * b10,
      a00 * b01 + a01 * b11,
      a10 * b00 + a11 * b10,
      a10 * b01 + a11 * b11
    ] : [
      a00 * b00 + a01 * b10 + a02 * b20,
      a00 * b01 + a01 * b11 + a02 * b21,
      a00 * b02 + a01 * b12 + a02 * b22,
      a10 * b00 + a11 * b10 + a12 * b20,
      a10 * b01 + a11 * b11 + a12 * b21,
      a10 * b02 + a11 * b12 + a12 * b22,
      a20 * b00 + a21 * b10 + a22 * b20,
      a20 * b01 + a21 * b11 + a22 * b21,
      a20 * b02 + a21 * b12 + a22 * b22
    ];
  };
}).call(this);

;(function(global) {
  'use strict';

  /**
   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
   * requestAnimationFrame polyfill by Erik Möller.
   * fixes from Paul Irish and Tino Zijdel
   * MIT license
   */
  var x,
      lastTime = 0,
      vendors = ['ms', 'moz', 'webkit', 'o'];

  for (x = 0; x < vendors.length && !global.requestAnimationFrame; x++) {
    global.requestAnimationFrame =
      global[vendors[x] + 'RequestAnimationFrame'];
    global.cancelAnimationFrame =
      global[vendors[x] + 'CancelAnimationFrame'] ||
      global[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!global.requestAnimationFrame)
    global.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime(),
          timeToCall = Math.max(0, 16 - (currTime - lastTime)),
          id = global.setTimeout(
            function() {
              callback(currTime + timeToCall);
            },
            timeToCall
          );

      lastTime = currTime + timeToCall;
      return id;
    };

  if (!global.cancelAnimationFrame)
    global.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };

  /**
   * Function.prototype.bind polyfill found on MDN.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
   * Public domain
   */
  if (!Function.prototype.bind)
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function')
        // Closest thing possible to the ECMAScript 5 internal IsCallable
        // function:
        throw new TypeError(
          'Function.prototype.bind - what is trying to be bound is not callable'
        );

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP,
          fBound;

      fNOP = function() {};
      fBound = function() {
        return fToBind.apply(
          this instanceof fNOP && oThis ?
            this :
            oThis,
          aArgs.concat(Array.prototype.slice.call(arguments))
        );
      };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
})(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Packages initialization:
  sigma.utils.pkg('sigma.settings');

  var settings = {
    /**
     * GRAPH SETTINGS:
     * ***************
     */
    // {boolean} Indicates if the data have to be cloned in methods to add
    //           nodes or edges.
    clone: true,
    // {boolean} Indicates if nodes "id" values and edges "id", "source" and
    //           "target" values must be set as immutable.
    immutable: true,
    // {boolean} Indicates if sigma can log its errors and warnings.
    verbose: false,


    /**
     * RENDERERS SETTINGS:
     * *******************
     */
    // {string}
    classPrefix: 'sigma',
    // {string}
    defaultNodeType: 'def',
    // {string}
    defaultEdgeType: 'def',
    // {string}
    defaultLabelColor: '#000',
    // {string}
    defaultEdgeColor: '#000',
    // {string}
    defaultNodeColor: '#000',
    // {string}
    defaultLabelSize: 14,
    // {string} Indicates how to choose the edges color. Available values:
    //          "source", "target", "default"
    edgeColor: 'source',
    // {number} Defines the minimal edge's arrow display size.
    minArrowSize: 0,
    // {string}
    font: 'arial',
    // {string} Example: 'bold'
    fontStyle: '',
    // {string} Indicates how to choose the labels color. Available values:
    //          "node", "default"
    labelColor: 'default',
    // {string} Indicates how to choose the labels size. Available values:
    //          "fixed", "proportional"
    labelSize: 'fixed',
    // {string} The ratio between the font size of the label and the node size.
    labelSizeRatio: 1,
    // {number} The minimum size a node must have to see its label displayed.
    labelThreshold: 8,
    // {number} The oversampling factor used in WebGL renderer.
    webglOversamplingRatio: 2,
    // {number} The size of the border of hovered nodes.
    borderSize: 0,
    // {number} The default hovered node border's color.
    defaultNodeBorderColor: '#000',
    // {number} The hovered node's label font. If not specified, will heritate
    //          the "font" value.
    hoverFont: '',
    // {boolean} If true, then only one node can be hovered at a time.
    singleHover: true,
    // {string} Example: 'bold'
    hoverFontStyle: '',
    // {string} Indicates how to choose the hovered nodes shadow color.
    //          Available values: "node", "default"
    labelHoverShadow: 'default',
    // {string}
    labelHoverShadowColor: '#000',
    // {string} Indicates how to choose the hovered nodes color.
    //          Available values: "node", "default"
    nodeHoverColor: 'node',
    // {string}
    defaultNodeHoverColor: '#000',
    // {string} Indicates how to choose the hovered nodes background color.
    //          Available values: "node", "default"
    labelHoverBGColor: 'default',
    // {string}
    defaultHoverLabelBGColor: '#fff',
    // {string} Indicates how to choose the hovered labels color.
    //          Available values: "node", "default"
    labelHoverColor: 'default',
    // {string}
    defaultLabelHoverColor: '#000',
    // {string} Indicates how to choose the edges hover color. Available values:
    //          "edge", "default"
    edgeHoverColor: 'edge',
    // {number} The size multiplicator of hovered edges.
    edgeHoverSizeRatio: 1,
    // {string}
    defaultEdgeHoverColor: '#000',
    // {boolean} Indicates if the edge extremities must be hovered when the
    //           edge is hovered.
    edgeHoverExtremities: false,
    // {booleans} The different drawing modes:
    //           false: Layered not displayed.
    //           true: Layered displayed.
    drawEdges: true,
    drawNodes: true,
    drawLabels: true,
    drawEdgeLabels: false,
    // {boolean} Indicates if the edges must be drawn in several frames or in
    //           one frame, as the nodes and labels are drawn.
    batchEdgesDrawing: false,
    // {boolean} Indicates if the edges must be hidden during dragging and
    //           animations.
    hideEdgesOnMove: false,
    // {numbers} The different batch sizes, when elements are displayed in
    //           several frames.
    canvasEdgesBatchSize: 500,
    webglEdgesBatchSize: 1000,




    /**
     * RESCALE SETTINGS:
     * *****************
     */
    // {string} Indicates of to scale the graph relatively to its container.
    //          Available values: "inside", "outside"
    scalingMode: 'inside',
    // {number} The margin to keep around the graph.
    sideMargin: 0,
    // {number} Determine the size of the smallest and the biggest node / edges
    //          on the screen. This mapping makes easier to display the graph,
    //          avoiding too big nodes that take half of the screen, or too
    //          small ones that are not readable. If the two parameters are
    //          equals, then the minimal display size will be 0. And if they
    //          are both equal to 0, then there is no mapping, and the radius
    //          of the nodes will be their size.
    minEdgeSize: 0.5,
    maxEdgeSize: 1,
    minNodeSize: 1,
    maxNodeSize: 8,




    /**
     * CAPTORS SETTINGS:
     * *****************
     */
    // {boolean}
    touchEnabled: true,
    // {boolean}
    mouseEnabled: true,
    // {boolean}
    mouseWheelEnabled: true,
    // {boolean}
    doubleClickEnabled: true,
    // {boolean} Defines whether the custom events such as "clickNode" can be
    //           used.
    eventsEnabled: true,
    // {number} Defines by how much multiplicating the zooming level when the
    //          user zooms with the mouse-wheel.
    zoomingRatio: 1.7,
    // {number} Defines by how much multiplicating the zooming level when the
    //          user zooms by double clicking.
    doubleClickZoomingRatio: 2.2,
    // {number} The minimum zooming level.
    zoomMin: 0.0625,
    // {number} The maximum zooming level.
    zoomMax: 2,
    // {number} The duration of animations following a mouse scrolling.
    mouseZoomDuration: 200,
    // {number} The duration of animations following a mouse double click.
    doubleClickZoomDuration: 200,
    // {number} The duration of animations following a mouse dropping.
    mouseInertiaDuration: 200,
    // {number} The inertia power (mouse captor).
    mouseInertiaRatio: 3,
    // {number} The duration of animations following a touch dropping.
    touchInertiaDuration: 200,
    // {number} The inertia power (touch captor).
    touchInertiaRatio: 3,
    // {number} The maximum time between two clicks to make it a double click.
    doubleClickTimeout: 300,
    // {number} The maximum time between two taps to make it a double tap.
    doubleTapTimeout: 300,
    // {number} The maximum time of dragging to trigger intertia.
    dragTimeout: 200,




    /**
     * GLOBAL SETTINGS:
     * ****************
     */
    // {boolean} Determines whether the instance has to refresh itself
    //           automatically when a "resize" event is dispatched from the
    //           window object.
    autoResize: true,
    // {boolean} Determines whether the "rescale" middleware has to be called
    //           automatically for each camera on refresh.
    autoRescale: true,
    // {boolean} If set to false, the camera method "goTo" will basically do
    //           nothing.
    enableCamera: true,
    // {boolean} If set to false, the nodes cannot be hovered.
    enableHovering: true,
    // {boolean} If set to true, the edges can be hovered.
    enableEdgeHovering: false,
    // {number} The size of the area around the edges to activate hovering.
    edgeHoverPrecision: 5,
    // {boolean} If set to true, the rescale middleware will ignore node sizes
    //           to determine the graphs boundings.
    rescaleIgnoreSize: false,
    // {boolean} Determines if the core has to try to catch errors on
    //           rendering.
    skipErrors: false,




    /**
     * CAMERA SETTINGS:
     * ****************
     */
    // {number} The power degrees applied to the nodes/edges size relatively to
    //          the zooming level. Basically:
    //           > onScreenR = Math.pow(zoom, nodesPowRatio) * R
    //           > onScreenT = Math.pow(zoom, edgesPowRatio) * T
    nodesPowRatio: 0.5,
    edgesPowRatio: 0.5,




    /**
     * ANIMATIONS SETTINGS:
     * ********************
     */
    // {number} The default animation time.
    animationsTime: 200
  };

  // Export the previously designed settings:
  sigma.settings = sigma.utils.extend(sigma.settings || {}, settings);
}).call(this);

;(function() {
  'use strict';

  /**
   * Dispatcher constructor.
   *
   * @return {dispatcher} The new dispatcher instance.
   */
  var dispatcher = function() {
    Object.defineProperty(this, '_handlers', {
      value: {}
    });
  };




  /**
   * Will execute the handler everytime that the indicated event (or the
   * indicated events) will be triggered.
   *
   * @param  {string}           events  The name of the event (or the events
   *                                    separated by spaces).
   * @param  {function(Object)} handler The handler to bind.
   * @return {dispatcher}               Returns the instance itself.
   */
  dispatcher.prototype.bind = function(events, handler) {
    var i,
        l,
        event,
        eArray;

    if (
      arguments.length === 1 &&
      typeof arguments[0] === 'object'
    )
      for (events in arguments[0])
        this.bind(events, arguments[0][events]);
    else if (
      arguments.length === 2 &&
      typeof arguments[1] === 'function'
    ) {
      eArray = typeof events === 'string' ? events.split(' ') : events;

      for (i = 0, l = eArray.length; i !== l; i += 1) {
        event = eArray[i];

        // Check that event is not '':
        if (!event)
          continue;

        if (!this._handlers[event])
          this._handlers[event] = [];

        // Using an object instead of directly the handler will make possible
        // later to add flags
        this._handlers[event].push({
          handler: handler
        });
      }
    } else
      throw 'bind: Wrong arguments.';

    return this;
  };

  /**
   * Removes the handler from a specified event (or specified events).
   *
   * @param  {?string}           events  The name of the event (or the events
   *                                     separated by spaces). If undefined,
   *                                     then all handlers are removed.
   * @param  {?function(object)} handler The handler to unbind. If undefined,
   *                                     each handler bound to the event or the
   *                                     events will be removed.
   * @return {dispatcher}                Returns the instance itself.
   */
  dispatcher.prototype.unbind = function(events, handler) {
    var i,
        n,
        j,
        m,
        k,
        a,
        event,
        eArray = typeof events === 'string' ? events.split(' ') : events;

    if (!arguments.length) {
      for (k in this._handlers)
        delete this._handlers[k];
      return this;
    }

    if (handler) {
      for (i = 0, n = eArray.length; i !== n; i += 1) {
        event = eArray[i];
        if (this._handlers[event]) {
          a = [];
          for (j = 0, m = this._handlers[event].length; j !== m; j += 1)
            if (this._handlers[event][j].handler !== handler)
              a.push(this._handlers[event][j]);

          this._handlers[event] = a;
        }

        if (this._handlers[event] && this._handlers[event].length === 0)
          delete this._handlers[event];
      }
    } else
      for (i = 0, n = eArray.length; i !== n; i += 1)
        delete this._handlers[eArray[i]];

    return this;
  };

  /**
   * Executes each handler bound to the event
   *
   * @param  {string}     events The name of the event (or the events separated
   *                             by spaces).
   * @param  {?object}    data   The content of the event (optional).
   * @return {dispatcher}        Returns the instance itself.
   */
  dispatcher.prototype.dispatchEvent = function(events, data) {
    var i,
        n,
        j,
        m,
        a,
        event,
        eventName,
        self = this,
        eArray = typeof events === 'string' ? events.split(' ') : events;

    data = data === undefined ? {} : data;

    for (i = 0, n = eArray.length; i !== n; i += 1) {
      eventName = eArray[i];

      if (this._handlers[eventName]) {
        event = self.getEvent(eventName, data);
        a = [];

        for (j = 0, m = this._handlers[eventName].length; j !== m; j += 1) {
          this._handlers[eventName][j].handler(event);
          if (!this._handlers[eventName][j].one)
            a.push(this._handlers[eventName][j]);
        }

        this._handlers[eventName] = a;
      }
    }

    return this;
  };

  /**
   * Return an event object.
   *
   * @param  {string}  events The name of the event.
   * @param  {?object} data   The content of the event (optional).
   * @return {object}         Returns the instance itself.
   */
  dispatcher.prototype.getEvent = function(event, data) {
    return {
      type: event,
      data: data || {},
      target: this
    };
  };

  /**
   * A useful function to deal with inheritance. It will make the target
   * inherit the prototype of the class dispatcher as well as its constructor.
   *
   * @param {object} target The target.
   */
  dispatcher.extend = function(target, args) {
    var k;

    for (k in dispatcher.prototype)
      if (dispatcher.prototype.hasOwnProperty(k))
        target[k] = dispatcher.prototype[k];

    dispatcher.apply(target, args);
  };




  /**
   * EXPORT:
   * *******
   */
  if (typeof this.sigma !== 'undefined') {
    this.sigma.classes = this.sigma.classes || {};
    this.sigma.classes.dispatcher = dispatcher;
  } else if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = dispatcher;
    exports.dispatcher = dispatcher;
  } else
    this.dispatcher = dispatcher;
}).call(this);

;(function() {
  'use strict';

  /**
   * This utils aims to facilitate the manipulation of each instance setting.
   * Using a function instead of an object brings two main advantages: First,
   * it will be easier in the future to catch settings updates through a
   * function than an object. Second, giving it a full object will "merge" it
   * to the settings object properly, keeping us to have to always add a loop.
   *
   * @return {configurable} The "settings" function.
   */
  var configurable = function() {
    var i,
        l,
        data = {},
        datas = Array.prototype.slice.call(arguments, 0);

    /**
     * The method to use to set or get any property of this instance.
     *
     * @param  {string|object}    a1 If it is a string and if a2 is undefined,
     *                               then it will return the corresponding
     *                               property. If it is a string and if a2 is
     *                               set, then it will set a2 as the property
     *                               corresponding to a1, and return this. If
     *                               it is an object, then each pair string +
     *                               object(or any other type) will be set as a
     *                               property.
     * @param  {*?}               a2 The new property corresponding to a1 if a1
     *                               is a string.
     * @return {*|configurable}      Returns itself or the corresponding
     *                               property.
     *
     * Polymorphism:
     * *************
     * Here are some basic use examples:
     *
     *  > settings = new configurable();
     *  > settings('mySetting', 42);
     *  > settings('mySetting'); // Logs: 42
     *  > settings('mySetting', 123);
     *  > settings('mySetting'); // Logs: 123
     *  > settings({mySetting: 456});
     *  > settings('mySetting'); // Logs: 456
     *
     * Also, it is possible to use the function as a fallback:
     *  > settings({mySetting: 'abc'}, 'mySetting');  // Logs: 'abc'
     *  > settings({hisSetting: 'abc'}, 'mySetting'); // Logs: 456
     */
    var settings = function(a1, a2) {
      var o,
          i,
          l,
          k;

      if (arguments.length === 1 && typeof a1 === 'string') {
        if (data[a1] !== undefined)
          return data[a1];
        for (i = 0, l = datas.length; i < l; i++)
          if (datas[i][a1] !== undefined)
            return datas[i][a1];
        return undefined;
      } else if (typeof a1 === 'object' && typeof a2 === 'string') {
        return (a1 || {})[a2] !== undefined ? a1[a2] : settings(a2);
      } else {
        o = (typeof a1 === 'object' && a2 === undefined) ? a1 : {};

        if (typeof a1 === 'string')
          o[a1] = a2;

        for (i = 0, k = Object.keys(o), l = k.length; i < l; i++)
          data[k[i]] = o[k[i]];

        return this;
      }
    };

    /**
     * This method returns a new configurable function, with new objects
     *
     * @param  {object*}  Any number of objects to search in.
     * @return {function} Returns the function. Check its documentation to know
     *                    more about how it works.
     */
    settings.embedObjects = function() {
      var args = datas.concat(
        data
      ).concat(
        Array.prototype.splice.call(arguments, 0)
      );

      return configurable.apply({}, args);
    };

    // Initialize
    for (i = 0, l = arguments.length; i < l; i++)
      settings(arguments[i]);

    return settings;
  };

  /**
   * EXPORT:
   * *******
   */
  if (typeof this.sigma !== 'undefined') {
    this.sigma.classes = this.sigma.classes || {};
    this.sigma.classes.configurable = configurable;
  } else if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = configurable;
    exports.configurable = configurable;
  } else
    this.configurable = configurable;
}).call(this);

;(function(undefined) {
  'use strict';

  var _methods = Object.create(null),
      _indexes = Object.create(null),
      _initBindings = Object.create(null),
      _methodBindings = Object.create(null),
      _methodBeforeBindings = Object.create(null),
      _defaultSettings = {
        immutable: true,
        clone: true
      },
      _defaultSettingsFunction = function(key) {
        return _defaultSettings[key];
      };

  /**
   * The graph constructor. It initializes the data and the indexes, and binds
   * the custom indexes and methods to its own scope.
   *
   * Recognized parameters:
   * **********************
   * Here is the exhaustive list of every accepted parameters in the settings
   * object:
   *
   *   {boolean} clone     Indicates if the data have to be cloned in methods
   *                       to add nodes or edges.
   *   {boolean} immutable Indicates if nodes "id" values and edges "id",
   *                       "source" and "target" values must be set as
   *                       immutable.
   *
   * @param  {?configurable} settings Eventually a settings function.
   * @return {graph}                  The new graph instance.
   */
  var graph = function(settings) {
    var k,
        fn,
        data;

    /**
     * DATA:
     * *****
     * Every data that is callable from graph methods are stored in this "data"
     * object. This object will be served as context for all these methods,
     * and it is possible to add other type of data in it.
     */
    data = {
      /**
       * SETTINGS FUNCTION:
       * ******************
       */
      settings: settings || _defaultSettingsFunction,

      /**
       * MAIN DATA:
       * **********
       */
      nodesArray: [],
      edgesArray: [],

      /**
       * GLOBAL INDEXES:
       * ***************
       * These indexes just index data by ids.
       */
      nodesIndex: Object.create(null),
      edgesIndex: Object.create(null),

      /**
       * LOCAL INDEXES:
       * **************
       * These indexes refer from node to nodes. Each key is an id, and each
       * value is the array of the ids of related nodes.
       */
      inNeighborsIndex: Object.create(null),
      outNeighborsIndex: Object.create(null),
      allNeighborsIndex: Object.create(null),

      inNeighborsCount: Object.create(null),
      outNeighborsCount: Object.create(null),
      allNeighborsCount: Object.create(null)
    };

    // Execute bindings:
    for (k in _initBindings)
      _initBindings[k].call(data);

    // Add methods to both the scope and the data objects:
    for (k in _methods) {
      fn = __bindGraphMethod(k, data, _methods[k]);
      this[k] = fn;
      data[k] = fn;
    }
  };




  /**
   * A custom tool to bind methods such that function that are bound to it will
   * be executed anytime the method is called.
   *
   * @param  {string}   methodName The name of the method to bind.
   * @param  {object}   scope      The scope where the method must be executed.
   * @param  {function} fn         The method itself.
   * @return {function}            The new method.
   */
  function __bindGraphMethod(methodName, scope, fn) {
    var result = function() {
      var k,
          res;

      // Execute "before" bound functions:
      for (k in _methodBeforeBindings[methodName])
        _methodBeforeBindings[methodName][k].apply(scope, arguments);

      // Apply the method:
      res = fn.apply(scope, arguments);

      // Execute bound functions:
      for (k in _methodBindings[methodName])
        _methodBindings[methodName][k].apply(scope, arguments);

      // Return res:
      return res;
    };

    return result;
  }

  /**
   * This custom tool function removes every pair key/value from an hash. The
   * goal is to avoid creating a new object while some other references are
   * still hanging in some scopes...
   *
   * @param  {object} obj The object to empty.
   * @return {object}     The empty object.
   */
  function __emptyObject(obj) {
    var k;

    for (k in obj)
      if (!('hasOwnProperty' in obj) || obj.hasOwnProperty(k))
        delete obj[k];

    return obj;
  }




  /**
   * This global method adds a method that will be bound to the futurly created
   * graph instances.
   *
   * Since these methods will be bound to their scope when the instances are
   * created, it does not use the prototype. Because of that, methods have to
   * be added before instances are created to make them available.
   *
   * Here is an example:
   *
   *  > graph.addMethod('getNodesCount', function() {
   *  >   return this.nodesArray.length;
   *  > });
   *  >
   *  > var myGraph = new graph();
   *  > console.log(myGraph.getNodesCount()); // outputs 0
   *
   * @param  {string}   methodName The name of the method.
   * @param  {function} fn         The method itself.
   * @return {object}              The global graph constructor.
   */
  graph.addMethod = function(methodName, fn) {
    if (
      typeof methodName !== 'string' ||
      typeof fn !== 'function' ||
      arguments.length !== 2
    )
      throw 'addMethod: Wrong arguments.';

    if (_methods[methodName] || graph[methodName])
      throw 'The method "' + methodName + '" already exists.';

    _methods[methodName] = fn;
    _methodBindings[methodName] = Object.create(null);
    _methodBeforeBindings[methodName] = Object.create(null);

    return this;
  };

  /**
   * This global method returns true if the method has already been added, and
   * false else.
   *
   * Here are some examples:
   *
   *  > graph.hasMethod('addNode'); // returns true
   *  > graph.hasMethod('hasMethod'); // returns true
   *  > graph.hasMethod('unexistingMethod'); // returns false
   *
   * @param  {string}  methodName The name of the method.
   * @return {boolean}            The result.
   */
  graph.hasMethod = function(methodName) {
    return !!(_methods[methodName] || graph[methodName]);
  };

  /**
   * This global methods attaches a function to a method. Anytime the specified
   * method is called, the attached function is called right after, with the
   * same arguments and in the same scope. The attached function is called
   * right before if the last argument is true, unless the method is the graph
   * constructor.
   *
   * To attach a function to the graph constructor, use 'constructor' as the
   * method name (first argument).
   *
   * The main idea is to have a clean way to keep custom indexes up to date,
   * for instance:
   *
   *  > var timesAddNodeCalled = 0;
   *  > graph.attach('addNode', 'timesAddNodeCalledInc', function() {
   *  >   timesAddNodeCalled++;
   *  > });
   *  >
   *  > var myGraph = new graph();
   *  > console.log(timesAddNodeCalled); // outputs 0
   *  >
   *  > myGraph.addNode({ id: '1' }).addNode({ id: '2' });
   *  > console.log(timesAddNodeCalled); // outputs 2
   *
   * The idea for calling a function before is to provide pre-processors, for
   * instance:
   *
   *  > var colorPalette = { Person: '#C3CBE1', Place: '#9BDEBD' };
   *  > graph.attach('addNode', 'applyNodeColorPalette', function(n) {
   *  >   n.color = colorPalette[n.category];
   *  > }, true);
   *  >
   *  > var myGraph = new graph();
   *  > myGraph.addNode({ id: 'n0', category: 'Person' });
   *  > console.log(myGraph.nodes('n0').color); // outputs '#C3CBE1'
   *
   * @param  {string}   methodName The name of the related method or
   *                               "constructor".
   * @param  {string}   key        The key to identify the function to attach.
   * @param  {function} fn         The function to bind.
   * @param  {boolean}  before     If true the function is called right before.
   * @return {object}              The global graph constructor.
   */
  graph.attach = function(methodName, key, fn, before) {
    if (
      typeof methodName !== 'string' ||
      typeof key !== 'string' ||
      typeof fn !== 'function' ||
      arguments.length < 3 ||
      arguments.length > 4
    )
      throw 'attach: Wrong arguments.';

    var bindings;

    if (methodName === 'constructor')
      bindings = _initBindings;
    else {
      if (before) {
        if (!_methodBeforeBindings[methodName])
        throw 'The method "' + methodName + '" does not exist.';

        bindings = _methodBeforeBindings[methodName];
      }
      else {
        if (!_methodBindings[methodName])
          throw 'The method "' + methodName + '" does not exist.';

        bindings = _methodBindings[methodName];
      }
    }

    if (bindings[key])
      throw 'A function "' + key + '" is already attached ' +
            'to the method "' + methodName + '".';

    bindings[key] = fn;

    return this;
  };

  /**
   * Alias of attach(methodName, key, fn, true).
   */
  graph.attachBefore = function(methodName, key, fn) {
    return this.attach(methodName, key, fn, true);
  };

  /**
   * This methods is just an helper to deal with custom indexes. It takes as
   * arguments the name of the index and an object containing all the different
   * functions to bind to the methods.
   *
   * Here is a basic example, that creates an index to keep the number of nodes
   * in the current graph. It also adds a method to provide a getter on that
   * new index:
   *
   *  > sigma.classes.graph.addIndex('nodesCount', {
   *  >   constructor: function() {
   *  >     this.nodesCount = 0;
   *  >   },
   *  >   addNode: function() {
   *  >     this.nodesCount++;
   *  >   },
   *  >   dropNode: function() {
   *  >     this.nodesCount--;
   *  >   }
   *  > });
   *  >
   *  > sigma.classes.graph.addMethod('getNodesCount', function() {
   *  >   return this.nodesCount;
   *  > });
   *  >
   *  > var myGraph = new sigma.classes.graph();
   *  > console.log(myGraph.getNodesCount()); // outputs 0
   *  >
   *  > myGraph.addNode({ id: '1' }).addNode({ id: '2' });
   *  > console.log(myGraph.getNodesCount()); // outputs 2
   *
   * @param  {string} name     The name of the index.
   * @param  {object} bindings The object containing the functions to bind.
   * @return {object}          The global graph constructor.
   */
  graph.addIndex = function(name, bindings) {
    if (
      typeof name !== 'string' ||
      Object(bindings) !== bindings ||
      arguments.length !== 2
    )
      throw 'addIndex: Wrong arguments.';

    if (_indexes[name])
      throw 'The index "' + name + '" already exists.';

    var k;

    // Store the bindings:
    _indexes[name] = bindings;

    // Attach the bindings:
    for (k in bindings)
      if (typeof bindings[k] !== 'function')
        throw 'The bindings must be functions.';
      else
        graph.attach(k, name, bindings[k]);

    return this;
  };




  /**
   * This method adds a node to the graph. The node must be an object, with a
   * string under the key "id". Except for this, it is possible to add any
   * other attribute, that will be preserved all along the manipulations.
   *
   * If the graph option "clone" has a truthy value, the node will be cloned
   * when added to the graph. Also, if the graph option "immutable" has a
   * truthy value, its id will be defined as immutable.
   *
   * @param  {object} node The node to add.
   * @return {object}      The graph instance.
   */
  graph.addMethod('addNode', function(node) {
    // Check that the node is an object and has an id:
    if (Object(node) !== node || arguments.length !== 1)
      throw 'addNode: Wrong arguments.';

    if (typeof node.id !== 'string' && typeof node.id !== 'number')
      throw 'The node must have a string or number id.';

    if (this.nodesIndex[node.id])
      throw 'The node "' + node.id + '" already exists.';

    var k,
        id = node.id,
        validNode = Object.create(null);

    // Check the "clone" option:
    if (this.settings('clone')) {
      for (k in node)
        if (k !== 'id')
          validNode[k] = node[k];
    } else
      validNode = node;

    // Check the "immutable" option:
    if (this.settings('immutable'))
      Object.defineProperty(validNode, 'id', {
        value: id,
        enumerable: true
      });
    else
      validNode.id = id;

    // Add empty containers for edges indexes:
    this.inNeighborsIndex[id] = Object.create(null);
    this.outNeighborsIndex[id] = Object.create(null);
    this.allNeighborsIndex[id] = Object.create(null);

    this.inNeighborsCount[id] = 0;
    this.outNeighborsCount[id] = 0;
    this.allNeighborsCount[id] = 0;

    // Add the node to indexes:
    this.nodesArray.push(validNode);
    this.nodesIndex[validNode.id] = validNode;

    // Return the current instance:
    return this;
  });

  /**
   * This method adds an edge to the graph. The edge must be an object, with a
   * string under the key "id", and strings under the keys "source" and
   * "target" that design existing nodes. Except for this, it is possible to
   * add any other attribute, that will be preserved all along the
   * manipulations.
   *
   * If the graph option "clone" has a truthy value, the edge will be cloned
   * when added to the graph. Also, if the graph option "immutable" has a
   * truthy value, its id, source and target will be defined as immutable.
   *
   * @param  {object} edge The edge to add.
   * @return {object}      The graph instance.
   */
  graph.addMethod('addEdge', function(edge) {
    // Check that the edge is an object and has an id:
    if (Object(edge) !== edge || arguments.length !== 1)
      throw 'addEdge: Wrong arguments.';

    if (typeof edge.id !== 'string' && typeof edge.id !== 'number')
      throw 'The edge must have a string or number id.';

    if ((typeof edge.source !== 'string' && typeof edge.source !== 'number') ||
        !this.nodesIndex[edge.source])
      throw 'The edge source must have an existing node id.';

    if ((typeof edge.target !== 'string' && typeof edge.target !== 'number') ||
        !this.nodesIndex[edge.target])
      throw 'The edge target must have an existing node id.';

    if (this.edgesIndex[edge.id])
      throw 'The edge "' + edge.id + '" already exists.';

    var k,
        validEdge = Object.create(null);

    // Check the "clone" option:
    if (this.settings('clone')) {
      for (k in edge)
        if (k !== 'id' && k !== 'source' && k !== 'target')
          validEdge[k] = edge[k];
    } else
      validEdge = edge;

    // Check the "immutable" option:
    if (this.settings('immutable')) {
      Object.defineProperty(validEdge, 'id', {
        value: edge.id,
        enumerable: true
      });

      Object.defineProperty(validEdge, 'source', {
        value: edge.source,
        enumerable: true
      });

      Object.defineProperty(validEdge, 'target', {
        value: edge.target,
        enumerable: true
      });
    } else {
      validEdge.id = edge.id;
      validEdge.source = edge.source;
      validEdge.target = edge.target;
    }

    // Add the edge to indexes:
    this.edgesArray.push(validEdge);
    this.edgesIndex[validEdge.id] = validEdge;

    if (!this.inNeighborsIndex[validEdge.target][validEdge.source])
      this.inNeighborsIndex[validEdge.target][validEdge.source] =
        Object.create(null);
    this.inNeighborsIndex[validEdge.target][validEdge.source][validEdge.id] =
      validEdge;

    if (!this.outNeighborsIndex[validEdge.source][validEdge.target])
      this.outNeighborsIndex[validEdge.source][validEdge.target] =
        Object.create(null);
    this.outNeighborsIndex[validEdge.source][validEdge.target][validEdge.id] =
      validEdge;

    if (!this.allNeighborsIndex[validEdge.source][validEdge.target])
      this.allNeighborsIndex[validEdge.source][validEdge.target] =
        Object.create(null);
    this.allNeighborsIndex[validEdge.source][validEdge.target][validEdge.id] =
      validEdge;

    if (validEdge.target !== validEdge.source) {
      if (!this.allNeighborsIndex[validEdge.target][validEdge.source])
        this.allNeighborsIndex[validEdge.target][validEdge.source] =
          Object.create(null);
      this.allNeighborsIndex[validEdge.target][validEdge.source][validEdge.id] =
        validEdge;
    }

    // Keep counts up to date:
    this.inNeighborsCount[validEdge.target]++;
    this.outNeighborsCount[validEdge.source]++;
    this.allNeighborsCount[validEdge.target]++;
    this.allNeighborsCount[validEdge.source]++;

    return this;
  });

  /**
   * This method drops a node from the graph. It also removes each edge that is
   * bound to it, through the dropEdge method. An error is thrown if the node
   * does not exist.
   *
   * @param  {string} id The node id.
   * @return {object}    The graph instance.
   */
  graph.addMethod('dropNode', function(id) {
    // Check that the arguments are valid:
    if ((typeof id !== 'string' && typeof id !== 'number') ||
        arguments.length !== 1)
      throw 'dropNode: Wrong arguments.';

    if (!this.nodesIndex[id])
      throw 'The node "' + id + '" does not exist.';

    var i, k, l;

    // Remove the node from indexes:
    delete this.nodesIndex[id];
    for (i = 0, l = this.nodesArray.length; i < l; i++)
      if (this.nodesArray[i].id === id) {
        this.nodesArray.splice(i, 1);
        break;
      }

    // Remove related edges:
    for (i = this.edgesArray.length - 1; i >= 0; i--)
      if (this.edgesArray[i].source === id || this.edgesArray[i].target === id)
        this.dropEdge(this.edgesArray[i].id);

    // Remove related edge indexes:
    delete this.inNeighborsIndex[id];
    delete this.outNeighborsIndex[id];
    delete this.allNeighborsIndex[id];

    delete this.inNeighborsCount[id];
    delete this.outNeighborsCount[id];
    delete this.allNeighborsCount[id];

    for (k in this.nodesIndex) {
      delete this.inNeighborsIndex[k][id];
      delete this.outNeighborsIndex[k][id];
      delete this.allNeighborsIndex[k][id];
    }

    return this;
  });

  /**
   * This method drops an edge from the graph. An error is thrown if the edge
   * does not exist.
   *
   * @param  {string} id The edge id.
   * @return {object}    The graph instance.
   */
  graph.addMethod('dropEdge', function(id) {
    // Check that the arguments are valid:
    if ((typeof id !== 'string' && typeof id !== 'number') ||
        arguments.length !== 1)
      throw 'dropEdge: Wrong arguments.';

    if (!this.edgesIndex[id])
      throw 'The edge "' + id + '" does not exist.';

    var i, l, edge;

    // Remove the edge from indexes:
    edge = this.edgesIndex[id];
    delete this.edgesIndex[id];
    for (i = 0, l = this.edgesArray.length; i < l; i++)
      if (this.edgesArray[i].id === id) {
        this.edgesArray.splice(i, 1);
        break;
      }

    delete this.inNeighborsIndex[edge.target][edge.source][edge.id];
    if (!Object.keys(this.inNeighborsIndex[edge.target][edge.source]).length)
      delete this.inNeighborsIndex[edge.target][edge.source];

    delete this.outNeighborsIndex[edge.source][edge.target][edge.id];
    if (!Object.keys(this.outNeighborsIndex[edge.source][edge.target]).length)
      delete this.outNeighborsIndex[edge.source][edge.target];

    delete this.allNeighborsIndex[edge.source][edge.target][edge.id];
    if (!Object.keys(this.allNeighborsIndex[edge.source][edge.target]).length)
      delete this.allNeighborsIndex[edge.source][edge.target];

    if (edge.target !== edge.source) {
      delete this.allNeighborsIndex[edge.target][edge.source][edge.id];
      if (!Object.keys(this.allNeighborsIndex[edge.target][edge.source]).length)
        delete this.allNeighborsIndex[edge.target][edge.source];
    }

    this.inNeighborsCount[edge.target]--;
    this.outNeighborsCount[edge.source]--;
    this.allNeighborsCount[edge.source]--;
    this.allNeighborsCount[edge.target]--;

    return this;
  });

  /**
   * This method destroys the current instance. It basically empties each index
   * and methods attached to the graph.
   */
  graph.addMethod('kill', function() {
    // Delete arrays:
    this.nodesArray.length = 0;
    this.edgesArray.length = 0;
    delete this.nodesArray;
    delete this.edgesArray;

    // Delete indexes:
    delete this.nodesIndex;
    delete this.edgesIndex;
    delete this.inNeighborsIndex;
    delete this.outNeighborsIndex;
    delete this.allNeighborsIndex;
    delete this.inNeighborsCount;
    delete this.outNeighborsCount;
    delete this.allNeighborsCount;
  });

  /**
   * This method empties the nodes and edges arrays, as well as the different
   * indexes.
   *
   * @return {object} The graph instance.
   */
  graph.addMethod('clear', function() {
    this.nodesArray.length = 0;
    this.edgesArray.length = 0;

    // Due to GC issues, I prefer not to create new object. These objects are
    // only available from the methods and attached functions, but still, it is
    // better to prevent ghost references to unrelevant data...
    __emptyObject(this.nodesIndex);
    __emptyObject(this.edgesIndex);
    __emptyObject(this.nodesIndex);
    __emptyObject(this.inNeighborsIndex);
    __emptyObject(this.outNeighborsIndex);
    __emptyObject(this.allNeighborsIndex);
    __emptyObject(this.inNeighborsCount);
    __emptyObject(this.outNeighborsCount);
    __emptyObject(this.allNeighborsCount);

    return this;
  });

  /**
   * This method reads an object and adds the nodes and edges, through the
   * proper methods "addNode" and "addEdge".
   *
   * Here is an example:
   *
   *  > var myGraph = new graph();
   *  > myGraph.read({
   *  >   nodes: [
   *  >     { id: 'n0' },
   *  >     { id: 'n1' }
   *  >   ],
   *  >   edges: [
   *  >     {
   *  >       id: 'e0',
   *  >       source: 'n0',
   *  >       target: 'n1'
   *  >     }
   *  >   ]
   *  > });
   *  >
   *  > console.log(
   *  >   myGraph.nodes().length,
   *  >   myGraph.edges().length
   *  > ); // outputs 2 1
   *
   * @param  {object} g The graph object.
   * @return {object}   The graph instance.
   */
  graph.addMethod('read', function(g) {
    var i,
        a,
        l;

    a = g.nodes || [];
    for (i = 0, l = a.length; i < l; i++)
      this.addNode(a[i]);

    a = g.edges || [];
    for (i = 0, l = a.length; i < l; i++)
      this.addEdge(a[i]);

    return this;
  });

  /**
   * This methods returns one or several nodes, depending on how it is called.
   *
   * To get the array of nodes, call "nodes" without argument. To get a
   * specific node, call it with the id of the node. The get multiple node,
   * call it with an array of ids, and it will return the array of nodes, in
   * the same order.
   *
   * @param  {?(string|array)} v Eventually one id, an array of ids.
   * @return {object|array}      The related node or array of nodes.
   */
  graph.addMethod('nodes', function(v) {
    // Clone the array of nodes and return it:
    if (!arguments.length)
      return this.nodesArray.slice(0);

    // Return the related node:
    if (arguments.length === 1 &&
        (typeof v === 'string' || typeof v === 'number'))
      return this.nodesIndex[v];

    // Return an array of the related node:
    if (
      arguments.length === 1 &&
      Object.prototype.toString.call(v) === '[object Array]'
    ) {
      var i,
          l,
          a = [];

      for (i = 0, l = v.length; i < l; i++)
        if (typeof v[i] === 'string' || typeof v[i] === 'number')
          a.push(this.nodesIndex[v[i]]);
        else
          throw 'nodes: Wrong arguments.';

      return a;
    }

    throw 'nodes: Wrong arguments.';
  });

  /**
   * This methods returns the degree of one or several nodes, depending on how
   * it is called. It is also possible to get incoming or outcoming degrees
   * instead by specifying 'in' or 'out' as a second argument.
   *
   * @param  {string|array} v     One id, an array of ids.
   * @param  {?string}      which Which degree is required. Values are 'in',
   *                              'out', and by default the normal degree.
   * @return {number|array}       The related degree or array of degrees.
   */
  graph.addMethod('degree', function(v, which) {
    // Check which degree is required:
    which = {
      'in': this.inNeighborsCount,
      'out': this.outNeighborsCount
    }[which || ''] || this.allNeighborsCount;

    // Return the related node:
    if (typeof v === 'string' || typeof v === 'number')
      return which[v];

    // Return an array of the related node:
    if (Object.prototype.toString.call(v) === '[object Array]') {
      var i,
          l,
          a = [];

      for (i = 0, l = v.length; i < l; i++)
        if (typeof v[i] === 'string' || typeof v[i] === 'number')
          a.push(which[v[i]]);
        else
          throw 'degree: Wrong arguments.';

      return a;
    }

    throw 'degree: Wrong arguments.';
  });

  /**
   * This methods returns one or several edges, depending on how it is called.
   *
   * To get the array of edges, call "edges" without argument. To get a
   * specific edge, call it with the id of the edge. The get multiple edge,
   * call it with an array of ids, and it will return the array of edges, in
   * the same order.
   *
   * @param  {?(string|array)} v Eventually one id, an array of ids.
   * @return {object|array}      The related edge or array of edges.
   */
  graph.addMethod('edges', function(v) {
    // Clone the array of edges and return it:
    if (!arguments.length)
      return this.edgesArray.slice(0);

    // Return the related edge:
    if (arguments.length === 1 &&
        (typeof v === 'string' || typeof v === 'number'))
      return this.edgesIndex[v];

    // Return an array of the related edge:
    if (
      arguments.length === 1 &&
      Object.prototype.toString.call(v) === '[object Array]'
    ) {
      var i,
          l,
          a = [];

      for (i = 0, l = v.length; i < l; i++)
        if (typeof v[i] === 'string' || typeof v[i] === 'number')
          a.push(this.edgesIndex[v[i]]);
        else
          throw 'edges: Wrong arguments.';

      return a;
    }

    throw 'edges: Wrong arguments.';
  });


  /**
   * EXPORT:
   * *******
   */
  if (typeof sigma !== 'undefined') {
    sigma.classes = sigma.classes || Object.create(null);
    sigma.classes.graph = graph;
  } else if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = graph;
    exports.graph = graph;
  } else
    this.graph = graph;
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  sigma.utils.pkg('sigma.classes');

  /**
   * The camera constructor. It just initializes its attributes and methods.
   *
   * @param  {string}       id       The id.
   * @param  {sigma.classes.graph}  graph    The graph.
   * @param  {configurable} settings The settings function.
   * @param  {?object}      options  Eventually some overriding options.
   * @return {camera}                Returns the fresh new camera instance.
   */
  sigma.classes.camera = function(id, graph, settings, options) {
    sigma.classes.dispatcher.extend(this);

    Object.defineProperty(this, 'graph', {
      value: graph
    });
    Object.defineProperty(this, 'id', {
      value: id
    });
    Object.defineProperty(this, 'readPrefix', {
      value: 'read_cam' + id + ':'
    });
    Object.defineProperty(this, 'prefix', {
      value: 'cam' + id + ':'
    });

    this.x = 0;
    this.y = 0;
    this.ratio = 1;
    this.angle = 0;
    this.isAnimated = false;
    this.settings = (typeof options === 'object' && options) ?
      settings.embedObject(options) :
      settings;
  };

  /**
   * Updates the camera position.
   *
   * @param  {object} coordinates The new coordinates object.
   * @return {camera}             Returns the camera.
   */
  sigma.classes.camera.prototype.goTo = function(coordinates) {
    if (!this.settings('enableCamera'))
      return this;

    var i,
        l,
        c = coordinates || {},
        keys = ['x', 'y', 'ratio', 'angle'];

    for (i = 0, l = keys.length; i < l; i++)
      if (c[keys[i]] !== undefined) {
        if (typeof c[keys[i]] === 'number' && !isNaN(c[keys[i]]))
          this[keys[i]] = c[keys[i]];
        else
          throw 'Value for "' + keys[i] + '" is not a number.';
      }

    this.dispatchEvent('coordinatesUpdated');
    return this;
  };

  /**
   * This method takes a graph and computes for each node and edges its
   * coordinates relatively to the center of the camera. Basically, it will
   * compute the coordinates that will be used by the graphic renderers.
   *
   * Since it should be possible to use different cameras and different
   * renderers, it is possible to specify a prefix to put before the new
   * coordinates (to get something like "node.camera1_x")
   *
   * @param  {?string} read    The prefix of the coordinates to read.
   * @param  {?string} write   The prefix of the coordinates to write.
   * @param  {?object} options Eventually an object of options. Those can be:
   *                           - A restricted nodes array.
   *                           - A restricted edges array.
   *                           - A width.
   *                           - A height.
   * @return {camera}        Returns the camera.
   */
  sigma.classes.camera.prototype.applyView = function(read, write, options) {
    options = options || {};
    write = write !== undefined ? write : this.prefix;
    read = read !== undefined ? read : this.readPrefix;

    var nodes = options.nodes || this.graph.nodes(),
        edges = options.edges || this.graph.edges();

    var i,
        l,
        node,
        relCos = Math.cos(this.angle) / this.ratio,
        relSin = Math.sin(this.angle) / this.ratio,
        nodeRatio = Math.pow(this.ratio, this.settings('nodesPowRatio')),
        edgeRatio = Math.pow(this.ratio, this.settings('edgesPowRatio')),
        xOffset = (options.width || 0) / 2 - this.x * relCos - this.y * relSin,
        yOffset = (options.height || 0) / 2 - this.y * relCos + this.x * relSin;

    for (i = 0, l = nodes.length; i < l; i++) {
      node = nodes[i];
      node[write + 'x'] =
        (node[read + 'x'] || 0) * relCos +
        (node[read + 'y'] || 0) * relSin +
        xOffset;
      node[write + 'y'] =
        (node[read + 'y'] || 0) * relCos -
        (node[read + 'x'] || 0) * relSin +
        yOffset;
      node[write + 'size'] =
        (node[read + 'size'] || 0) /
        nodeRatio;
    }

    for (i = 0, l = edges.length; i < l; i++) {
      edges[i][write + 'size'] =
        (edges[i][read + 'size'] || 0) /
        edgeRatio;
    }

    return this;
  };

  /**
   * This function converts the coordinates of a point from the frame of the
   * camera to the frame of the graph.
   *
   * @param  {number} x The X coordinate of the point in the frame of the
   *                    camera.
   * @param  {number} y The Y coordinate of the point in the frame of the
   *                    camera.
   * @return {object}   The point coordinates in the frame of the graph.
   */
  sigma.classes.camera.prototype.graphPosition = function(x, y, vector) {
    var X = 0,
        Y = 0,
        cos = Math.cos(this.angle),
        sin = Math.sin(this.angle);

    // Revert the origin differential vector:
    if (!vector) {
      X = - (this.x * cos + this.y * sin) / this.ratio;
      Y = - (this.y * cos - this.x * sin) / this.ratio;
    }

    return {
      x: (x * cos + y * sin) / this.ratio + X,
      y: (y * cos - x * sin) / this.ratio + Y
    };
  };

  /**
   * This function converts the coordinates of a point from the frame of the
   * graph to the frame of the camera.
   *
   * @param  {number} x The X coordinate of the point in the frame of the
   *                    graph.
   * @param  {number} y The Y coordinate of the point in the frame of the
   *                    graph.
   * @return {object}   The point coordinates in the frame of the camera.
   */
  sigma.classes.camera.prototype.cameraPosition = function(x, y, vector) {
    var X = 0,
        Y = 0,
        cos = Math.cos(this.angle),
        sin = Math.sin(this.angle);

    // Revert the origin differential vector:
    if (!vector) {
      X = - (this.x * cos + this.y * sin) / this.ratio;
      Y = - (this.y * cos - this.x * sin) / this.ratio;
    }

    return {
      x: ((x - X) * cos - (y - Y) * sin) * this.ratio,
      y: ((y - Y) * cos + (x - X) * sin) * this.ratio
    };
  };

  /**
   * This method returns the transformation matrix of the camera. This is
   * especially useful to apply the camera view directly in shaders, in case of
   * WebGL rendering.
   *
   * @return {array} The transformation matrix.
   */
  sigma.classes.camera.prototype.getMatrix = function() {
    var scale = sigma.utils.matrices.scale(1 / this.ratio),
        rotation = sigma.utils.matrices.rotation(this.angle),
        translation = sigma.utils.matrices.translation(-this.x, -this.y),
        matrix = sigma.utils.matrices.multiply(
          translation,
          sigma.utils.matrices.multiply(
            rotation,
            scale
          )
        );

    return matrix;
  };

  /**
   * Taking a width and a height as parameters, this method returns the
   * coordinates of the rectangle representing the camera on screen, in the
   * graph's referentiel.
   *
   * To keep displaying labels of nodes going out of the screen, the method
   * keeps a margin around the screen in the returned rectangle.
   *
   * @param  {number} width  The width of the screen.
   * @param  {number} height The height of the screen.
   * @return {object}        The rectangle as x1, y1, x2 and y2, representing
   *                         two opposite points.
   */
  sigma.classes.camera.prototype.getRectangle = function(width, height) {
    var widthVect = this.cameraPosition(width, 0, true),
        heightVect = this.cameraPosition(0, height, true),
        centerVect = this.cameraPosition(width / 2, height / 2, true),
        marginX = this.cameraPosition(width / 4, 0, true).x,
        marginY = this.cameraPosition(0, height / 4, true).y;

    return {
      x1: this.x - centerVect.x - marginX,
      y1: this.y - centerVect.y - marginY,
      x2: this.x - centerVect.x + marginX + widthVect.x,
      y2: this.y - centerVect.y - marginY + widthVect.y,
      height: Math.sqrt(
        Math.pow(heightVect.x, 2) +
        Math.pow(heightVect.y + 2 * marginY, 2)
      )
    };
  };
}).call(this);

;(function(undefined) {
  'use strict';

  /**
   * Sigma Quadtree Module
   * =====================
   *
   * Author: Guillaume Plique (Yomguithereal)
   * Version: 0.2
   */



  /**
   * Quad Geometric Operations
   * -------------------------
   *
   * A useful batch of geometric operations used by the quadtree.
   */

  var _geom = {

    /**
     * Transforms a graph node with x, y and size into an
     * axis-aligned square.
     *
     * @param  {object} A graph node with at least a point (x, y) and a size.
     * @return {object} A square: two points (x1, y1), (x2, y2) and height.
     */
    pointToSquare: function(n) {
      return {
        x1: n.x - n.size,
        y1: n.y - n.size,
        x2: n.x + n.size,
        y2: n.y - n.size,
        height: n.size * 2
      };
    },

    /**
     * Checks whether a rectangle is axis-aligned.
     *
     * @param  {object}  A rectangle defined by two points
     *                   (x1, y1) and (x2, y2).
     * @return {boolean} True if the rectangle is axis-aligned.
     */
    isAxisAligned: function(r) {
      return r.x1 === r.x2 || r.y1 === r.y2;
    },

    /**
     * Compute top points of an axis-aligned rectangle. This is useful in
     * cases when the rectangle has been rotated (left, right or bottom up) and
     * later operations need to know the top points.
     *
     * @param  {object} An axis-aligned rectangle defined by two points
     *                  (x1, y1), (x2, y2) and height.
     * @return {object} A rectangle: two points (x1, y1), (x2, y2) and height.
     */
    axisAlignedTopPoints: function(r) {

      // Basic
      if (r.y1 === r.y2 && r.x1 < r.x2)
        return r;

      // Rotated to right
      if (r.x1 === r.x2 && r.y2 > r.y1)
        return {
          x1: r.x1 - r.height, y1: r.y1,
          x2: r.x1, y2: r.y1,
          height: r.height
        };

      // Rotated to left
      if (r.x1 === r.x2 && r.y2 < r.y1)
        return {
          x1: r.x1, y1: r.y2,
          x2: r.x2 + r.height, y2: r.y2,
          height: r.height
        };

      // Bottom's up
      return {
        x1: r.x2, y1: r.y1 - r.height,
        x2: r.x1, y2: r.y1 - r.height,
        height: r.height
      };
    },

    /**
     * Get coordinates of a rectangle's lower left corner from its top points.
     *
     * @param  {object} A rectangle defined by two points (x1, y1) and (x2, y2).
     * @return {object} Coordinates of the corner (x, y).
     */
    lowerLeftCoor: function(r) {
      var width = (
        Math.sqrt(
          Math.pow(r.x2 - r.x1, 2) +
          Math.pow(r.y2 - r.y1, 2)
        )
      );

      return {
        x: r.x1 - (r.y2 - r.y1) * r.height / width,
        y: r.y1 + (r.x2 - r.x1) * r.height / width
      };
    },

    /**
     * Get coordinates of a rectangle's lower right corner from its top points
     * and its lower left corner.
     *
     * @param  {object} A rectangle defined by two points (x1, y1) and (x2, y2).
     * @param  {object} A corner's coordinates (x, y).
     * @return {object} Coordinates of the corner (x, y).
     */
    lowerRightCoor: function(r, llc) {
      return {
        x: llc.x - r.x1 + r.x2,
        y: llc.y - r.y1 + r.y2
      };
    },

    /**
     * Get the coordinates of all the corners of a rectangle from its top point.
     *
     * @param  {object} A rectangle defined by two points (x1, y1) and (x2, y2).
     * @return {array}  An array of the four corners' coordinates (x, y).
     */
    rectangleCorners: function(r) {
      var llc = this.lowerLeftCoor(r),
          lrc = this.lowerRightCoor(r, llc);

      return [
        {x: r.x1, y: r.y1},
        {x: r.x2, y: r.y2},
        {x: llc.x, y: llc.y},
        {x: lrc.x, y: lrc.y}
      ];
    },

    /**
     * Split a square defined by its boundaries into four.
     *
     * @param  {object} Boundaries of the square (x, y, width, height).
     * @return {array}  An array containing the four new squares, themselves
     *                  defined by an array of their four corners (x, y).
     */
    splitSquare: function(b) {
      return [
        [
          {x: b.x, y: b.y},
          {x: b.x + b.width / 2, y: b.y},
          {x: b.x, y: b.y + b.height / 2},
          {x: b.x + b.width / 2, y: b.y + b.height / 2}
        ],
        [
          {x: b.x + b.width / 2, y: b.y},
          {x: b.x + b.width, y: b.y},
          {x: b.x + b.width / 2, y: b.y + b.height / 2},
          {x: b.x + b.width, y: b.y + b.height / 2}
        ],
        [
          {x: b.x, y: b.y + b.height / 2},
          {x: b.x + b.width / 2, y: b.y + b.height / 2},
          {x: b.x, y: b.y + b.height},
          {x: b.x + b.width / 2, y: b.y + b.height}
        ],
        [
          {x: b.x + b.width / 2, y: b.y + b.height / 2},
          {x: b.x + b.width, y: b.y + b.height / 2},
          {x: b.x + b.width / 2, y: b.y + b.height},
          {x: b.x + b.width, y: b.y + b.height}
        ]
      ];
    },

    /**
     * Compute the four axis between corners of rectangle A and corners of
     * rectangle B. This is needed later to check an eventual collision.
     *
     * @param  {array} An array of rectangle A's four corners (x, y).
     * @param  {array} An array of rectangle B's four corners (x, y).
     * @return {array} An array of four axis defined by their coordinates (x,y).
     */
    axis: function(c1, c2) {
      return [
        {x: c1[1].x - c1[0].x, y: c1[1].y - c1[0].y},
        {x: c1[1].x - c1[3].x, y: c1[1].y - c1[3].y},
        {x: c2[0].x - c2[2].x, y: c2[0].y - c2[2].y},
        {x: c2[0].x - c2[1].x, y: c2[0].y - c2[1].y}
      ];
    },

    /**
     * Project a rectangle's corner on an axis.
     *
     * @param  {object} Coordinates of a corner (x, y).
     * @param  {object} Coordinates of an axis (x, y).
     * @return {object} The projection defined by coordinates (x, y).
     */
    projection: function(c, a) {
      var l = (
        (c.x * a.x + c.y * a.y) /
        (Math.pow(a.x, 2) + Math.pow(a.y, 2))
      );

      return {
        x: l * a.x,
        y: l * a.y
      };
    },

    /**
     * Check whether two rectangles collide on one particular axis.
     *
     * @param  {object}   An axis' coordinates (x, y).
     * @param  {array}    Rectangle A's corners.
     * @param  {array}    Rectangle B's corners.
     * @return {boolean}  True if the rectangles collide on the axis.
     */
    axisCollision: function(a, c1, c2) {
      var sc1 = [],
          sc2 = [];

      for (var ci = 0; ci < 4; ci++) {
        var p1 = this.projection(c1[ci], a),
            p2 = this.projection(c2[ci], a);

        sc1.push(p1.x * a.x + p1.y * a.y);
        sc2.push(p2.x * a.x + p2.y * a.y);
      }

      var maxc1 = Math.max.apply(Math, sc1),
          maxc2 = Math.max.apply(Math, sc2),
          minc1 = Math.min.apply(Math, sc1),
          minc2 = Math.min.apply(Math, sc2);

      return (minc2 <= maxc1 && maxc2 >= minc1);
    },

    /**
     * Check whether two rectangles collide on each one of their four axis. If
     * all axis collide, then the two rectangles do collide on the plane.
     *
     * @param  {array}    Rectangle A's corners.
     * @param  {array}    Rectangle B's corners.
     * @return {boolean}  True if the rectangles collide.
     */
    collision: function(c1, c2) {
      var axis = this.axis(c1, c2),
          col = true;

      for (var i = 0; i < 4; i++)
        col = col && this.axisCollision(axis[i], c1, c2);

      return col;
    }
  };


  /**
   * Quad Functions
   * ------------
   *
   * The Quadtree functions themselves.
   * For each of those functions, we consider that in a splitted quad, the
   * index of each node is the following:
   * 0: top left
   * 1: top right
   * 2: bottom left
   * 3: bottom right
   *
   * Moreover, the hereafter quad's philosophy is to consider that if an element
   * collides with more than one nodes, this element belongs to each of the
   * nodes it collides with where other would let it lie on a higher node.
   */

  /**
   * Get the index of the node containing the point in the quad
   *
   * @param  {object}  point      A point defined by coordinates (x, y).
   * @param  {object}  quadBounds Boundaries of the quad (x, y, width, heigth).
   * @return {integer}            The index of the node containing the point.
   */
  function _quadIndex(point, quadBounds) {
    var xmp = quadBounds.x + quadBounds.width / 2,
        ymp = quadBounds.y + quadBounds.height / 2,
        top = (point.y < ymp),
        left = (point.x < xmp);

    if (top) {
      if (left)
        return 0;
      else
        return 1;
    }
    else {
      if (left)
        return 2;
      else
        return 3;
    }
  }

  /**
   * Get a list of indexes of nodes containing an axis-aligned rectangle
   *
   * @param  {object}  rectangle   A rectangle defined by two points (x1, y1),
   *                               (x2, y2) and height.
   * @param  {array}   quadCorners An array of the quad nodes' corners.
   * @return {array}               An array of indexes containing one to
   *                               four integers.
   */
  function _quadIndexes(rectangle, quadCorners) {
    var indexes = [];

    // Iterating through quads
    for (var i = 0; i < 4; i++)
      if ((rectangle.x2 >= quadCorners[i][0].x) &&
          (rectangle.x1 <= quadCorners[i][1].x) &&
          (rectangle.y1 + rectangle.height >= quadCorners[i][0].y) &&
          (rectangle.y1 <= quadCorners[i][2].y))
        indexes.push(i);

    return indexes;
  }

  /**
   * Get a list of indexes of nodes containing a non-axis-aligned rectangle
   *
   * @param  {array}  corners      An array containing each corner of the
   *                               rectangle defined by its coordinates (x, y).
   * @param  {array}  quadCorners  An array of the quad nodes' corners.
   * @return {array}               An array of indexes containing one to
   *                               four integers.
   */
  function _quadCollision(corners, quadCorners) {
    var indexes = [];

    // Iterating through quads
    for (var i = 0; i < 4; i++)
      if (_geom.collision(corners, quadCorners[i]))
        indexes.push(i);

    return indexes;
  }

  /**
   * Subdivide a quad by creating a node at a precise index. The function does
   * not generate all four nodes not to potentially create unused nodes.
   *
   * @param  {integer}  index The index of the node to create.
   * @param  {object}   quad  The quad object to subdivide.
   * @return {object}         A new quad representing the node created.
   */
  function _quadSubdivide(index, quad) {
    var next = quad.level + 1,
        subw = Math.round(quad.bounds.width / 2),
        subh = Math.round(quad.bounds.height / 2),
        qx = Math.round(quad.bounds.x),
        qy = Math.round(quad.bounds.y),
        x,
        y;

    switch (index) {
      case 0:
        x = qx;
        y = qy;
        break;
      case 1:
        x = qx + subw;
        y = qy;
        break;
      case 2:
        x = qx;
        y = qy + subh;
        break;
      case 3:
        x = qx + subw;
        y = qy + subh;
        break;
    }

    return _quadTree(
      {x: x, y: y, width: subw, height: subh},
      next,
      quad.maxElements,
      quad.maxLevel
    );
  }

  /**
   * Recursively insert an element into the quadtree. Only points
   * with size, i.e. axis-aligned squares, may be inserted with this
   * method.
   *
   * @param  {object}  el         The element to insert in the quadtree.
   * @param  {object}  sizedPoint A sized point defined by two top points
   *                              (x1, y1), (x2, y2) and height.
   * @param  {object}  quad       The quad in which to insert the element.
   * @return {undefined}          The function does not return anything.
   */
  function _quadInsert(el, sizedPoint, quad) {
    if (quad.level < quad.maxLevel) {

      // Searching appropriate quads
      var indexes = _quadIndexes(sizedPoint, quad.corners);

      // Iterating
      for (var i = 0, l = indexes.length; i < l; i++) {

        // Subdividing if necessary
        if (quad.nodes[indexes[i]] === undefined)
          quad.nodes[indexes[i]] = _quadSubdivide(indexes[i], quad);

        // Recursion
        _quadInsert(el, sizedPoint, quad.nodes[indexes[i]]);
      }
    }
    else {

      // Pushing the element in a leaf node
      quad.elements.push(el);
    }
  }

  /**
   * Recursively retrieve every elements held by the node containing the
   * searched point.
   *
   * @param  {object}  point The searched point (x, y).
   * @param  {object}  quad  The searched quad.
   * @return {array}         An array of elements contained in the relevant
   *                         node.
   */
  function _quadRetrievePoint(point, quad) {
    if (quad.level < quad.maxLevel) {
      var index = _quadIndex(point, quad.bounds);

      // If node does not exist we return an empty list
      if (quad.nodes[index] !== undefined) {
        return _quadRetrievePoint(point, quad.nodes[index]);
      }
      else {
        return [];
      }
    }
    else {
      return quad.elements;
    }
  }

  /**
   * Recursively retrieve every elements contained within an rectangular area
   * that may or may not be axis-aligned.
   *
   * @param  {object|array} rectData       The searched area defined either by
   *                                       an array of four corners (x, y) in
   *                                       the case of a non-axis-aligned
   *                                       rectangle or an object with two top
   *                                       points (x1, y1), (x2, y2) and height.
   * @param  {object}       quad           The searched quad.
   * @param  {function}     collisionFunc  The collision function used to search
   *                                       for node indexes.
   * @param  {array?}       els            The retrieved elements.
   * @return {array}                       An array of elements contained in the
   *                                       area.
   */
  function _quadRetrieveArea(rectData, quad, collisionFunc, els) {
    els = els || {};

    if (quad.level < quad.maxLevel) {
      var indexes = collisionFunc(rectData, quad.corners);

      for (var i = 0, l = indexes.length; i < l; i++)
        if (quad.nodes[indexes[i]] !== undefined)
          _quadRetrieveArea(
            rectData,
            quad.nodes[indexes[i]],
            collisionFunc,
            els
          );
    } else
      for (var j = 0, m = quad.elements.length; j < m; j++)
        if (els[quad.elements[j].id] === undefined)
          els[quad.elements[j].id] = quad.elements[j];

    return els;
  }

  /**
   * Creates the quadtree object itself.
   *
   * @param  {object}   bounds       The boundaries of the quad defined by an
   *                                 origin (x, y), width and heigth.
   * @param  {integer}  level        The level of the quad in the tree.
   * @param  {integer}  maxElements  The max number of element in a leaf node.
   * @param  {integer}  maxLevel     The max recursion level of the tree.
   * @return {object}                The quadtree object.
   */
  function _quadTree(bounds, level, maxElements, maxLevel) {
    return {
      level: level || 0,
      bounds: bounds,
      corners: _geom.splitSquare(bounds),
      maxElements: maxElements || 20,
      maxLevel: maxLevel || 4,
      elements: [],
      nodes: []
    };
  }


  /**
   * Sigma Quad Constructor
   * ----------------------
   *
   * The quad API as exposed to sigma.
   */

  /**
   * The quad core that will become the sigma interface with the quadtree.
   *
   * property {object} _tree  Property holding the quadtree object.
   * property {object} _geom  Exposition of the _geom namespace for testing.
   * property {object} _cache Cache for the area method.
   */
  var quad = function() {
    this._geom = _geom;
    this._tree = null;
    this._cache = {
      query: false,
      result: false
    };
  };

  /**
   * Index a graph by inserting its nodes into the quadtree.
   *
   * @param  {array}  nodes   An array of nodes to index.
   * @param  {object} params  An object of parameters with at least the quad
   *                          bounds.
   * @return {object}         The quadtree object.
   *
   * Parameters:
   * ----------
   * bounds:      {object}   boundaries of the quad defined by its origin (x, y)
   *                         width and heigth.
   * prefix:      {string?}  a prefix for node geometric attributes.
   * maxElements: {integer?} the max number of elements in a leaf node.
   * maxLevel:    {integer?} the max recursion level of the tree.
   */
  quad.prototype.index = function(nodes, params) {

    // Enforcing presence of boundaries
    if (!params.bounds)
      throw 'sigma.classes.quad.index: bounds information not given.';

    // Prefix
    var prefix = params.prefix || '';

    // Building the tree
    this._tree = _quadTree(
      params.bounds,
      0,
      params.maxElements,
      params.maxLevel
    );

    // Inserting graph nodes into the tree
    for (var i = 0, l = nodes.length; i < l; i++) {

      // Inserting node
      _quadInsert(
        nodes[i],
        _geom.pointToSquare({
          x: nodes[i][prefix + 'x'],
          y: nodes[i][prefix + 'y'],
          size: nodes[i][prefix + 'size']
        }),
        this._tree
      );
    }

    // Reset cache:
    this._cache = {
      query: false,
      result: false
    };

    // remove?
    return this._tree;
  };

  /**
   * Retrieve every graph nodes held by the quadtree node containing the
   * searched point.
   *
   * @param  {number} x of the point.
   * @param  {number} y of the point.
   * @return {array}  An array of nodes retrieved.
   */
  quad.prototype.point = function(x, y) {
    return this._tree ?
      _quadRetrievePoint({x: x, y: y}, this._tree) || [] :
      [];
  };

  /**
   * Retrieve every graph nodes within a rectangular area. The methods keep the
   * last area queried in cache for optimization reason and will act differently
   * for the same reason if the area is axis-aligned or not.
   *
   * @param  {object} A rectangle defined by two top points (x1, y1), (x2, y2)
   *                  and height.
   * @return {array}  An array of nodes retrieved.
   */
  quad.prototype.area = function(rect) {
    var serialized = JSON.stringify(rect),
        collisionFunc,
        rectData;

    // Returning cache?
    if (this._cache.query === serialized)
      return this._cache.result;

    // Axis aligned ?
    if (_geom.isAxisAligned(rect)) {
      collisionFunc = _quadIndexes;
      rectData = _geom.axisAlignedTopPoints(rect);
    }
    else {
      collisionFunc = _quadCollision;
      rectData = _geom.rectangleCorners(rect);
    }

    // Retrieving nodes
    var nodes = this._tree ?
      _quadRetrieveArea(
        rectData,
        this._tree,
        collisionFunc
      ) :
      [];

    // Object to array
    var nodesArray = [];
    for (var i in nodes)
      nodesArray.push(nodes[i]);

    // Caching
    this._cache.query = serialized;
    this._cache.result = nodesArray;

    return nodesArray;
  };


  /**
   * EXPORT:
   * *******
   */
  if (typeof this.sigma !== 'undefined') {
    this.sigma.classes = this.sigma.classes || {};
    this.sigma.classes.quad = quad;
  } else if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = quad;
    exports.quad = quad;
  } else
    this.quad = quad;
}).call(this);

;(function(undefined) {
  'use strict';

  /**
   * Sigma Quadtree Module for edges
   * ===============================
   *
   * Author: Sébastien Heymann,
   *   from the quad of Guillaume Plique (Yomguithereal)
   * Version: 0.2
   */



  /**
   * Quad Geometric Operations
   * -------------------------
   *
   * A useful batch of geometric operations used by the quadtree.
   */

  var _geom = {

    /**
     * Transforms a graph node with x, y and size into an
     * axis-aligned square.
     *
     * @param  {object} A graph node with at least a point (x, y) and a size.
     * @return {object} A square: two points (x1, y1), (x2, y2) and height.
     */
    pointToSquare: function(n) {
      return {
        x1: n.x - n.size,
        y1: n.y - n.size,
        x2: n.x + n.size,
        y2: n.y - n.size,
        height: n.size * 2
      };
    },

    /**
     * Transforms a graph edge with x1, y1, x2, y2 and size into an
     * axis-aligned square.
     *
     * @param  {object} A graph edge with at least two points
     *                  (x1, y1), (x2, y2) and a size.
     * @return {object} A square: two points (x1, y1), (x2, y2) and height.
     */
    lineToSquare: function(e) {
      if (e.y1 < e.y2) {
        // (e.x1, e.y1) on top
        if (e.x1 < e.x2) {
          // (e.x1, e.y1) on left
          return {
            x1: e.x1 - e.size,
            y1: e.y1 - e.size,
            x2: e.x2 + e.size,
            y2: e.y1 - e.size,
            height: e.y2 - e.y1 + e.size * 2
          };
        }
        // (e.x1, e.y1) on right
        return {
          x1: e.x2 - e.size,
          y1: e.y1 - e.size,
          x2: e.x1 + e.size,
          y2: e.y1 - e.size,
          height: e.y2 - e.y1 + e.size * 2
        };
      }

      // (e.x2, e.y2) on top
      if (e.x1 < e.x2) {
        // (e.x1, e.y1) on left
        return {
          x1: e.x1 - e.size,
          y1: e.y2 - e.size,
          x2: e.x2 + e.size,
          y2: e.y2 - e.size,
          height: e.y1 - e.y2 + e.size * 2
        };
      }
      // (e.x2, e.y2) on right
      return {
        x1: e.x2 - e.size,
        y1: e.y2 - e.size,
        x2: e.x1 + e.size,
        y2: e.y2 - e.size,
        height: e.y1 - e.y2 + e.size * 2
      };
    },

    /**
     * Transforms a graph edge of type 'curve' with x1, y1, x2, y2,
     * control point and size into an axis-aligned square.
     *
     * @param  {object} e  A graph edge with at least two points
     *                     (x1, y1), (x2, y2) and a size.
     * @param  {object} cp A control point (x,y).
     * @return {object}    A square: two points (x1, y1), (x2, y2) and height.
     */
    quadraticCurveToSquare: function(e, cp) {
      var pt = sigma.utils.getPointOnQuadraticCurve(
        0.5,
        e.x1,
        e.y1,
        e.x2,
        e.y2,
        cp.x,
        cp.y
      );

      // Bounding box of the two points and the point at the middle of the
      // curve:
      var minX = Math.min(e.x1, e.x2, pt.x),
          maxX = Math.max(e.x1, e.x2, pt.x),
          minY = Math.min(e.y1, e.y2, pt.y),
          maxY = Math.max(e.y1, e.y2, pt.y);

      return {
        x1: minX - e.size,
        y1: minY - e.size,
        x2: maxX + e.size,
        y2: minY - e.size,
        height: maxY - minY + e.size * 2
      };
    },

    /**
     * Transforms a graph self loop into an axis-aligned square.
     *
     * @param  {object} n A graph node with a point (x, y) and a size.
     * @return {object}   A square: two points (x1, y1), (x2, y2) and height.
     */
    selfLoopToSquare: function(n) {
      // Fitting to the curve is too costly, we compute a larger bounding box
      // using the control points:
      var cp = sigma.utils.getSelfLoopControlPoints(n.x, n.y, n.size);

      // Bounding box of the point and the two control points:
      var minX = Math.min(n.x, cp.x1, cp.x2),
          maxX = Math.max(n.x, cp.x1, cp.x2),
          minY = Math.min(n.y, cp.y1, cp.y2),
          maxY = Math.max(n.y, cp.y1, cp.y2);

      return {
        x1: minX - n.size,
        y1: minY - n.size,
        x2: maxX + n.size,
        y2: minY - n.size,
        height: maxY - minY + n.size * 2
      };
    },

    /**
     * Checks whether a rectangle is axis-aligned.
     *
     * @param  {object}  A rectangle defined by two points
     *                   (x1, y1) and (x2, y2).
     * @return {boolean} True if the rectangle is axis-aligned.
     */
    isAxisAligned: function(r) {
      return r.x1 === r.x2 || r.y1 === r.y2;
    },

    /**
     * Compute top points of an axis-aligned rectangle. This is useful in
     * cases when the rectangle has been rotated (left, right or bottom up) and
     * later operations need to know the top points.
     *
     * @param  {object} An axis-aligned rectangle defined by two points
     *                  (x1, y1), (x2, y2) and height.
     * @return {object} A rectangle: two points (x1, y1), (x2, y2) and height.
     */
    axisAlignedTopPoints: function(r) {

      // Basic
      if (r.y1 === r.y2 && r.x1 < r.x2)
        return r;

      // Rotated to right
      if (r.x1 === r.x2 && r.y2 > r.y1)
        return {
          x1: r.x1 - r.height, y1: r.y1,
          x2: r.x1, y2: r.y1,
          height: r.height
        };

      // Rotated to left
      if (r.x1 === r.x2 && r.y2 < r.y1)
        return {
          x1: r.x1, y1: r.y2,
          x2: r.x2 + r.height, y2: r.y2,
          height: r.height
        };

      // Bottom's up
      return {
        x1: r.x2, y1: r.y1 - r.height,
        x2: r.x1, y2: r.y1 - r.height,
        height: r.height
      };
    },

    /**
     * Get coordinates of a rectangle's lower left corner from its top points.
     *
     * @param  {object} A rectangle defined by two points (x1, y1) and (x2, y2).
     * @return {object} Coordinates of the corner (x, y).
     */
    lowerLeftCoor: function(r) {
      var width = (
        Math.sqrt(
          Math.pow(r.x2 - r.x1, 2) +
          Math.pow(r.y2 - r.y1, 2)
        )
      );

      return {
        x: r.x1 - (r.y2 - r.y1) * r.height / width,
        y: r.y1 + (r.x2 - r.x1) * r.height / width
      };
    },

    /**
     * Get coordinates of a rectangle's lower right corner from its top points
     * and its lower left corner.
     *
     * @param  {object} A rectangle defined by two points (x1, y1) and (x2, y2).
     * @param  {object} A corner's coordinates (x, y).
     * @return {object} Coordinates of the corner (x, y).
     */
    lowerRightCoor: function(r, llc) {
      return {
        x: llc.x - r.x1 + r.x2,
        y: llc.y - r.y1 + r.y2
      };
    },

    /**
     * Get the coordinates of all the corners of a rectangle from its top point.
     *
     * @param  {object} A rectangle defined by two points (x1, y1) and (x2, y2).
     * @return {array}  An array of the four corners' coordinates (x, y).
     */
    rectangleCorners: function(r) {
      var llc = this.lowerLeftCoor(r),
          lrc = this.lowerRightCoor(r, llc);

      return [
        {x: r.x1, y: r.y1},
        {x: r.x2, y: r.y2},
        {x: llc.x, y: llc.y},
        {x: lrc.x, y: lrc.y}
      ];
    },

    /**
     * Split a square defined by its boundaries into four.
     *
     * @param  {object} Boundaries of the square (x, y, width, height).
     * @return {array}  An array containing the four new squares, themselves
     *                  defined by an array of their four corners (x, y).
     */
    splitSquare: function(b) {
      return [
        [
          {x: b.x, y: b.y},
          {x: b.x + b.width / 2, y: b.y},
          {x: b.x, y: b.y + b.height / 2},
          {x: b.x + b.width / 2, y: b.y + b.height / 2}
        ],
        [
          {x: b.x + b.width / 2, y: b.y},
          {x: b.x + b.width, y: b.y},
          {x: b.x + b.width / 2, y: b.y + b.height / 2},
          {x: b.x + b.width, y: b.y + b.height / 2}
        ],
        [
          {x: b.x, y: b.y + b.height / 2},
          {x: b.x + b.width / 2, y: b.y + b.height / 2},
          {x: b.x, y: b.y + b.height},
          {x: b.x + b.width / 2, y: b.y + b.height}
        ],
        [
          {x: b.x + b.width / 2, y: b.y + b.height / 2},
          {x: b.x + b.width, y: b.y + b.height / 2},
          {x: b.x + b.width / 2, y: b.y + b.height},
          {x: b.x + b.width, y: b.y + b.height}
        ]
      ];
    },

    /**
     * Compute the four axis between corners of rectangle A and corners of
     * rectangle B. This is needed later to check an eventual collision.
     *
     * @param  {array} An array of rectangle A's four corners (x, y).
     * @param  {array} An array of rectangle B's four corners (x, y).
     * @return {array} An array of four axis defined by their coordinates (x,y).
     */
    axis: function(c1, c2) {
      return [
        {x: c1[1].x - c1[0].x, y: c1[1].y - c1[0].y},
        {x: c1[1].x - c1[3].x, y: c1[1].y - c1[3].y},
        {x: c2[0].x - c2[2].x, y: c2[0].y - c2[2].y},
        {x: c2[0].x - c2[1].x, y: c2[0].y - c2[1].y}
      ];
    },

    /**
     * Project a rectangle's corner on an axis.
     *
     * @param  {object} Coordinates of a corner (x, y).
     * @param  {object} Coordinates of an axis (x, y).
     * @return {object} The projection defined by coordinates (x, y).
     */
    projection: function(c, a) {
      var l = (
        (c.x * a.x + c.y * a.y) /
        (Math.pow(a.x, 2) + Math.pow(a.y, 2))
      );

      return {
        x: l * a.x,
        y: l * a.y
      };
    },

    /**
     * Check whether two rectangles collide on one particular axis.
     *
     * @param  {object}   An axis' coordinates (x, y).
     * @param  {array}    Rectangle A's corners.
     * @param  {array}    Rectangle B's corners.
     * @return {boolean}  True if the rectangles collide on the axis.
     */
    axisCollision: function(a, c1, c2) {
      var sc1 = [],
          sc2 = [];

      for (var ci = 0; ci < 4; ci++) {
        var p1 = this.projection(c1[ci], a),
            p2 = this.projection(c2[ci], a);

        sc1.push(p1.x * a.x + p1.y * a.y);
        sc2.push(p2.x * a.x + p2.y * a.y);
      }

      var maxc1 = Math.max.apply(Math, sc1),
          maxc2 = Math.max.apply(Math, sc2),
          minc1 = Math.min.apply(Math, sc1),
          minc2 = Math.min.apply(Math, sc2);

      return (minc2 <= maxc1 && maxc2 >= minc1);
    },

    /**
     * Check whether two rectangles collide on each one of their four axis. If
     * all axis collide, then the two rectangles do collide on the plane.
     *
     * @param  {array}    Rectangle A's corners.
     * @param  {array}    Rectangle B's corners.
     * @return {boolean}  True if the rectangles collide.
     */
    collision: function(c1, c2) {
      var axis = this.axis(c1, c2),
          col = true;

      for (var i = 0; i < 4; i++)
        col = col && this.axisCollision(axis[i], c1, c2);

      return col;
    }
  };


  /**
   * Quad Functions
   * ------------
   *
   * The Quadtree functions themselves.
   * For each of those functions, we consider that in a splitted quad, the
   * index of each node is the following:
   * 0: top left
   * 1: top right
   * 2: bottom left
   * 3: bottom right
   *
   * Moreover, the hereafter quad's philosophy is to consider that if an element
   * collides with more than one nodes, this element belongs to each of the
   * nodes it collides with where other would let it lie on a higher node.
   */

  /**
   * Get the index of the node containing the point in the quad
   *
   * @param  {object}  point      A point defined by coordinates (x, y).
   * @param  {object}  quadBounds Boundaries of the quad (x, y, width, heigth).
   * @return {integer}            The index of the node containing the point.
   */
  function _quadIndex(point, quadBounds) {
    var xmp = quadBounds.x + quadBounds.width / 2,
        ymp = quadBounds.y + quadBounds.height / 2,
        top = (point.y < ymp),
        left = (point.x < xmp);

    if (top) {
      if (left)
        return 0;
      else
        return 1;
    }
    else {
      if (left)
        return 2;
      else
        return 3;
    }
  }

  /**
   * Get a list of indexes of nodes containing an axis-aligned rectangle
   *
   * @param  {object}  rectangle   A rectangle defined by two points (x1, y1),
   *                               (x2, y2) and height.
   * @param  {array}   quadCorners An array of the quad nodes' corners.
   * @return {array}               An array of indexes containing one to
   *                               four integers.
   */
  function _quadIndexes(rectangle, quadCorners) {
    var indexes = [];

    // Iterating through quads
    for (var i = 0; i < 4; i++)
      if ((rectangle.x2 >= quadCorners[i][0].x) &&
          (rectangle.x1 <= quadCorners[i][1].x) &&
          (rectangle.y1 + rectangle.height >= quadCorners[i][0].y) &&
          (rectangle.y1 <= quadCorners[i][2].y))
        indexes.push(i);

    return indexes;
  }

  /**
   * Get a list of indexes of nodes containing a non-axis-aligned rectangle
   *
   * @param  {array}  corners      An array containing each corner of the
   *                               rectangle defined by its coordinates (x, y).
   * @param  {array}  quadCorners  An array of the quad nodes' corners.
   * @return {array}               An array of indexes containing one to
   *                               four integers.
   */
  function _quadCollision(corners, quadCorners) {
    var indexes = [];

    // Iterating through quads
    for (var i = 0; i < 4; i++)
      if (_geom.collision(corners, quadCorners[i]))
        indexes.push(i);

    return indexes;
  }

  /**
   * Subdivide a quad by creating a node at a precise index. The function does
   * not generate all four nodes not to potentially create unused nodes.
   *
   * @param  {integer}  index The index of the node to create.
   * @param  {object}   quad  The quad object to subdivide.
   * @return {object}         A new quad representing the node created.
   */
  function _quadSubdivide(index, quad) {
    var next = quad.level + 1,
        subw = Math.round(quad.bounds.width / 2),
        subh = Math.round(quad.bounds.height / 2),
        qx = Math.round(quad.bounds.x),
        qy = Math.round(quad.bounds.y),
        x,
        y;

    switch (index) {
      case 0:
        x = qx;
        y = qy;
        break;
      case 1:
        x = qx + subw;
        y = qy;
        break;
      case 2:
        x = qx;
        y = qy + subh;
        break;
      case 3:
        x = qx + subw;
        y = qy + subh;
        break;
    }

    return _quadTree(
      {x: x, y: y, width: subw, height: subh},
      next,
      quad.maxElements,
      quad.maxLevel
    );
  }

  /**
   * Recursively insert an element into the quadtree. Only points
   * with size, i.e. axis-aligned squares, may be inserted with this
   * method.
   *
   * @param  {object}  el         The element to insert in the quadtree.
   * @param  {object}  sizedPoint A sized point defined by two top points
   *                              (x1, y1), (x2, y2) and height.
   * @param  {object}  quad       The quad in which to insert the element.
   * @return {undefined}          The function does not return anything.
   */
  function _quadInsert(el, sizedPoint, quad) {
    if (quad.level < quad.maxLevel) {

      // Searching appropriate quads
      var indexes = _quadIndexes(sizedPoint, quad.corners);

      // Iterating
      for (var i = 0, l = indexes.length; i < l; i++) {

        // Subdividing if necessary
        if (quad.nodes[indexes[i]] === undefined)
          quad.nodes[indexes[i]] = _quadSubdivide(indexes[i], quad);

        // Recursion
        _quadInsert(el, sizedPoint, quad.nodes[indexes[i]]);
      }
    }
    else {

      // Pushing the element in a leaf node
      quad.elements.push(el);
    }
  }

  /**
   * Recursively retrieve every elements held by the node containing the
   * searched point.
   *
   * @param  {object}  point The searched point (x, y).
   * @param  {object}  quad  The searched quad.
   * @return {array}         An array of elements contained in the relevant
   *                         node.
   */
  function _quadRetrievePoint(point, quad) {
    if (quad.level < quad.maxLevel) {
      var index = _quadIndex(point, quad.bounds);

      // If node does not exist we return an empty list
      if (quad.nodes[index] !== undefined) {
        return _quadRetrievePoint(point, quad.nodes[index]);
      }
      else {
        return [];
      }
    }
    else {
      return quad.elements;
    }
  }

  /**
   * Recursively retrieve every elements contained within an rectangular area
   * that may or may not be axis-aligned.
   *
   * @param  {object|array} rectData       The searched area defined either by
   *                                       an array of four corners (x, y) in
   *                                       the case of a non-axis-aligned
   *                                       rectangle or an object with two top
   *                                       points (x1, y1), (x2, y2) and height.
   * @param  {object}       quad           The searched quad.
   * @param  {function}     collisionFunc  The collision function used to search
   *                                       for node indexes.
   * @param  {array?}       els            The retrieved elements.
   * @return {array}                       An array of elements contained in the
   *                                       area.
   */
  function _quadRetrieveArea(rectData, quad, collisionFunc, els) {
    els = els || {};

    if (quad.level < quad.maxLevel) {
      var indexes = collisionFunc(rectData, quad.corners);

      for (var i = 0, l = indexes.length; i < l; i++)
        if (quad.nodes[indexes[i]] !== undefined)
          _quadRetrieveArea(
            rectData,
            quad.nodes[indexes[i]],
            collisionFunc,
            els
          );
    } else
      for (var j = 0, m = quad.elements.length; j < m; j++)
        if (els[quad.elements[j].id] === undefined)
          els[quad.elements[j].id] = quad.elements[j];

    return els;
  }

  /**
   * Creates the quadtree object itself.
   *
   * @param  {object}   bounds       The boundaries of the quad defined by an
   *                                 origin (x, y), width and heigth.
   * @param  {integer}  level        The level of the quad in the tree.
   * @param  {integer}  maxElements  The max number of element in a leaf node.
   * @param  {integer}  maxLevel     The max recursion level of the tree.
   * @return {object}                The quadtree object.
   */
  function _quadTree(bounds, level, maxElements, maxLevel) {
    return {
      level: level || 0,
      bounds: bounds,
      corners: _geom.splitSquare(bounds),
      maxElements: maxElements || 40,
      maxLevel: maxLevel || 8,
      elements: [],
      nodes: []
    };
  }


  /**
   * Sigma Quad Constructor
   * ----------------------
   *
   * The edgequad API as exposed to sigma.
   */

  /**
   * The edgequad core that will become the sigma interface with the quadtree.
   *
   * property {object} _tree     Property holding the quadtree object.
   * property {object} _geom     Exposition of the _geom namespace for testing.
   * property {object} _cache    Cache for the area method.
   * property {boolean} _enabled Can index and retreive elements.
   */
  var edgequad = function() {
    this._geom = _geom;
    this._tree = null;
    this._cache = {
      query: false,
      result: false
    };
    this._enabled = true;
  };

  /**
   * Index a graph by inserting its edges into the quadtree.
   *
   * @param  {object} graph   A graph instance.
   * @param  {object} params  An object of parameters with at least the quad
   *                          bounds.
   * @return {object}         The quadtree object.
   *
   * Parameters:
   * ----------
   * bounds:      {object}   boundaries of the quad defined by its origin (x, y)
   *                         width and heigth.
   * prefix:      {string?}  a prefix for edge geometric attributes.
   * maxElements: {integer?} the max number of elements in a leaf node.
   * maxLevel:    {integer?} the max recursion level of the tree.
   */
  edgequad.prototype.index = function(graph, params) {
    if (!this._enabled)
      return this._tree;

    // Enforcing presence of boundaries
    if (!params.bounds)
      throw 'sigma.classes.edgequad.index: bounds information not given.';

    // Prefix
    var prefix = params.prefix || '',
        cp,
        source,
        target,
        n,
        e;

    // Building the tree
    this._tree = _quadTree(
      params.bounds,
      0,
      params.maxElements,
      params.maxLevel
    );

    var edges = graph.edges();

    // Inserting graph edges into the tree
    for (var i = 0, l = edges.length; i < l; i++) {
      source = graph.nodes(edges[i].source);
      target = graph.nodes(edges[i].target);
      e = {
        x1: source[prefix + 'x'],
        y1: source[prefix + 'y'],
        x2: target[prefix + 'x'],
        y2: target[prefix + 'y'],
        size: edges[i][prefix + 'size'] || 0
      };

      // Inserting edge
      if (edges[i].type === 'curve' || edges[i].type === 'curvedArrow') {
        if (source.id === target.id) {
          n = {
            x: source[prefix + 'x'],
            y: source[prefix + 'y'],
            size: source[prefix + 'size'] || 0
          };
          _quadInsert(
            edges[i],
            _geom.selfLoopToSquare(n),
            this._tree);
        }
        else {
          cp = sigma.utils.getQuadraticControlPoint(e.x1, e.y1, e.x2, e.y2);
          _quadInsert(
            edges[i],
            _geom.quadraticCurveToSquare(e, cp),
            this._tree);
        }
      }
      else {
        _quadInsert(
          edges[i],
          _geom.lineToSquare(e),
          this._tree);
      }
    }

    // Reset cache:
    this._cache = {
      query: false,
      result: false
    };

    // remove?
    return this._tree;
  };

  /**
   * Retrieve every graph edges held by the quadtree node containing the
   * searched point.
   *
   * @param  {number} x of the point.
   * @param  {number} y of the point.
   * @return {array}  An array of edges retrieved.
   */
  edgequad.prototype.point = function(x, y) {
    if (!this._enabled)
      return [];

    return this._tree ?
      _quadRetrievePoint({x: x, y: y}, this._tree) || [] :
      [];
  };

  /**
   * Retrieve every graph edges within a rectangular area. The methods keep the
   * last area queried in cache for optimization reason and will act differently
   * for the same reason if the area is axis-aligned or not.
   *
   * @param  {object} A rectangle defined by two top points (x1, y1), (x2, y2)
   *                  and height.
   * @return {array}  An array of edges retrieved.
   */
  edgequad.prototype.area = function(rect) {
    if (!this._enabled)
      return [];

    var serialized = JSON.stringify(rect),
        collisionFunc,
        rectData;

    // Returning cache?
    if (this._cache.query === serialized)
      return this._cache.result;

    // Axis aligned ?
    if (_geom.isAxisAligned(rect)) {
      collisionFunc = _quadIndexes;
      rectData = _geom.axisAlignedTopPoints(rect);
    }
    else {
      collisionFunc = _quadCollision;
      rectData = _geom.rectangleCorners(rect);
    }

    // Retrieving edges
    var edges = this._tree ?
      _quadRetrieveArea(
        rectData,
        this._tree,
        collisionFunc
      ) :
      [];

    // Object to array
    var edgesArray = [];
    for (var i in edges)
      edgesArray.push(edges[i]);

    // Caching
    this._cache.query = serialized;
    this._cache.result = edgesArray;

    return edgesArray;
  };


  /**
   * EXPORT:
   * *******
   */
  if (typeof this.sigma !== 'undefined') {
    this.sigma.classes = this.sigma.classes || {};
    this.sigma.classes.edgequad = edgequad;
  } else if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = edgequad;
    exports.edgequad = edgequad;
  } else
    this.edgequad = edgequad;
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.captors');

  /**
   * The user inputs default captor. It deals with mouse events, keyboards
   * events and touch events.
   *
   * @param  {DOMElement}   target   The DOM element where the listeners will be
   *                                 bound.
   * @param  {camera}       camera   The camera related to the target.
   * @param  {configurable} settings The settings function.
   * @return {sigma.captor}          The fresh new captor instance.
   */
  sigma.captors.mouse = function(target, camera, settings) {
    var _self = this,
        _target = target,
        _camera = camera,
        _settings = settings,

        // CAMERA MANAGEMENT:
        // ******************
        // The camera position when the user starts dragging:
        _startCameraX,
        _startCameraY,
        _startCameraAngle,

        // The latest stage position:
        _lastCameraX,
        _lastCameraY,
        _lastCameraAngle,
        _lastCameraRatio,

        // MOUSE MANAGEMENT:
        // *****************
        // The mouse position when the user starts dragging:
        _startMouseX,
        _startMouseY,

        _isMouseDown,
        _isMoving,
        _hasDragged,
        _downStartTime,
        _movingTimeoutId;

    sigma.classes.dispatcher.extend(this);

    sigma.utils.doubleClick(_target, 'click', _doubleClickHandler);
    _target.addEventListener('DOMMouseScroll', _wheelHandler, false);
    _target.addEventListener('mousewheel', _wheelHandler, false);
    _target.addEventListener('mousemove', _moveHandler, false);
    _target.addEventListener('mousedown', _downHandler, false);
    _target.addEventListener('click', _clickHandler, false);
    _target.addEventListener('mouseout', _outHandler, false);
    document.addEventListener('mouseup', _upHandler, false);




    /**
     * This method unbinds every handlers that makes the captor work.
     */
    this.kill = function() {
      sigma.utils.unbindDoubleClick(_target, 'click');
      _target.removeEventListener('DOMMouseScroll', _wheelHandler);
      _target.removeEventListener('mousewheel', _wheelHandler);
      _target.removeEventListener('mousemove', _moveHandler);
      _target.removeEventListener('mousedown', _downHandler);
      _target.removeEventListener('click', _clickHandler);
      _target.removeEventListener('mouseout', _outHandler);
      document.removeEventListener('mouseup', _upHandler);
    };




    // MOUSE EVENTS:
    // *************

    /**
     * The handler listening to the 'move' mouse event. It will effectively
     * drag the graph.
     *
     * @param {event} e A mouse event.
     */
    function _moveHandler(e) {
      var x,
          y,
          pos;

      // Dispatch event:
      if (_settings('mouseEnabled')) {
        _self.dispatchEvent('mousemove',
          sigma.utils.mouseCoords(e));

        if (_isMouseDown) {
          _isMoving = true;
          _hasDragged = true;

          if (_movingTimeoutId)
            clearTimeout(_movingTimeoutId);

          _movingTimeoutId = setTimeout(function() {
            _isMoving = false;
          }, _settings('dragTimeout'));

          sigma.misc.animation.killAll(_camera);

          _camera.isMoving = true;
          pos = _camera.cameraPosition(
            sigma.utils.getX(e) - _startMouseX,
            sigma.utils.getY(e) - _startMouseY,
            true
          );

          x = _startCameraX - pos.x;
          y = _startCameraY - pos.y;

          if (x !== _camera.x || y !== _camera.y) {
            _lastCameraX = _camera.x;
            _lastCameraY = _camera.y;

            _camera.goTo({
              x: x,
              y: y
            });
          }

          if (e.preventDefault)
            e.preventDefault();
          else
            e.returnValue = false;

          e.stopPropagation();
          return false;
        }
      }
    }

    /**
     * The handler listening to the 'up' mouse event. It will stop dragging the
     * graph.
     *
     * @param {event} e A mouse event.
     */
    function _upHandler(e) {
      if (_settings('mouseEnabled') && _isMouseDown) {
        _isMouseDown = false;
        if (_movingTimeoutId)
          clearTimeout(_movingTimeoutId);

        _camera.isMoving = false;

        var x = sigma.utils.getX(e),
            y = sigma.utils.getY(e);

        if (_isMoving) {
          sigma.misc.animation.killAll(_camera);
          sigma.misc.animation.camera(
            _camera,
            {
              x: _camera.x +
                _settings('mouseInertiaRatio') * (_camera.x - _lastCameraX),
              y: _camera.y +
                _settings('mouseInertiaRatio') * (_camera.y - _lastCameraY)
            },
            {
              easing: 'quadraticOut',
              duration: _settings('mouseInertiaDuration')
            }
          );
        } else if (
          _startMouseX !== x ||
          _startMouseY !== y
        )
          _camera.goTo({
            x: _camera.x,
            y: _camera.y
          });

        _self.dispatchEvent('mouseup',
          sigma.utils.mouseCoords(e));

        // Update _isMoving flag:
        _isMoving = false;
      }
    }

    /**
     * The handler listening to the 'down' mouse event. It will start observing
     * the mouse position for dragging the graph.
     *
     * @param {event} e A mouse event.
     */
    function _downHandler(e) {
      if (_settings('mouseEnabled')) {
        _startCameraX = _camera.x;
        _startCameraY = _camera.y;

        _lastCameraX = _camera.x;
        _lastCameraY = _camera.y;

        _startMouseX = sigma.utils.getX(e);
        _startMouseY = sigma.utils.getY(e);

        _hasDragged = false;
        _downStartTime = (new Date()).getTime();

        switch (e.which) {
          case 2:
            // Middle mouse button pressed
            // Do nothing.
            break;
          case 3:
            // Right mouse button pressed
            _self.dispatchEvent('rightclick',
              sigma.utils.mouseCoords(e, _startMouseX, _startMouseY));
            break;
          // case 1:
          default:
            // Left mouse button pressed
            _isMouseDown = true;

            _self.dispatchEvent('mousedown',
              sigma.utils.mouseCoords(e, _startMouseX, _startMouseY));
        }
      }
    }

    /**
     * The handler listening to the 'out' mouse event. It will just redispatch
     * the event.
     *
     * @param {event} e A mouse event.
     */
    function _outHandler(e) {
      if (_settings('mouseEnabled'))
        _self.dispatchEvent('mouseout');
    }

    /**
     * The handler listening to the 'click' mouse event. It will redispatch the
     * click event, but with normalized X and Y coordinates.
     *
     * @param {event} e A mouse event.
     */
    function _clickHandler(e) {
      if (_settings('mouseEnabled')) {
        var event = sigma.utils.mouseCoords(e);
        event.isDragging =
          (((new Date()).getTime() - _downStartTime) > 100) && _hasDragged;
        _self.dispatchEvent('click', event);
      }

      if (e.preventDefault)
        e.preventDefault();
      else
        e.returnValue = false;

      e.stopPropagation();
      return false;
    }

    /**
     * The handler listening to the double click custom event. It will
     * basically zoom into the graph.
     *
     * @param {event} e A mouse event.
     */
    function _doubleClickHandler(e) {
      var pos,
          ratio,
          animation;

      if (_settings('mouseEnabled')) {
        ratio = 1 / _settings('doubleClickZoomingRatio');

        _self.dispatchEvent('doubleclick',
            sigma.utils.mouseCoords(e, _startMouseX, _startMouseY));

        if (_settings('doubleClickEnabled')) {
          pos = _camera.cameraPosition(
            sigma.utils.getX(e) - sigma.utils.getCenter(e).x,
            sigma.utils.getY(e) - sigma.utils.getCenter(e).y,
            true
          );

          animation = {
            duration: _settings('doubleClickZoomDuration')
          };

          sigma.utils.zoomTo(_camera, pos.x, pos.y, ratio, animation);
        }

        if (e.preventDefault)
          e.preventDefault();
        else
          e.returnValue = false;

        e.stopPropagation();
        return false;
      }
    }

    /**
     * The handler listening to the 'wheel' mouse event. It will basically zoom
     * in or not into the graph.
     *
     * @param {event} e A mouse event.
     */
    function _wheelHandler(e) {
      var pos,
          ratio,
          animation,
          wheelDelta = sigma.utils.getDelta(e);

      if (_settings('mouseEnabled') && _settings('mouseWheelEnabled') && wheelDelta !== 0) {
        ratio = wheelDelta > 0 ?
          1 / _settings('zoomingRatio') :
          _settings('zoomingRatio');

        pos = _camera.cameraPosition(
          sigma.utils.getX(e) - sigma.utils.getCenter(e).x,
          sigma.utils.getY(e) - sigma.utils.getCenter(e).y,
          true
        );

        animation = {
          duration: _settings('mouseZoomDuration')
        };

        sigma.utils.zoomTo(_camera, pos.x, pos.y, ratio, animation);

        if (e.preventDefault)
          e.preventDefault();
        else
          e.returnValue = false;

        e.stopPropagation();
        return false;
      }
    }
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.captors');

  /**
   * The user inputs default captor. It deals with mouse events, keyboards
   * events and touch events.
   *
   * @param  {DOMElement}   target   The DOM element where the listeners will be
   *                                 bound.
   * @param  {camera}       camera   The camera related to the target.
   * @param  {configurable} settings The settings function.
   * @return {sigma.captor}          The fresh new captor instance.
   */
  sigma.captors.touch = function(target, camera, settings) {
    var _self = this,
        _target = target,
        _camera = camera,
        _settings = settings,

        // CAMERA MANAGEMENT:
        // ******************
        // The camera position when the user starts dragging:
        _startCameraX,
        _startCameraY,
        _startCameraAngle,
        _startCameraRatio,

        // The latest stage position:
        _lastCameraX,
        _lastCameraY,
        _lastCameraAngle,
        _lastCameraRatio,

        // TOUCH MANAGEMENT:
        // *****************
        // Touches that are down:
        _downTouches = [],

        _startTouchX0,
        _startTouchY0,
        _startTouchX1,
        _startTouchY1,
        _startTouchAngle,
        _startTouchDistance,

        _touchMode,

        _isMoving,
        _doubleTap,
        _movingTimeoutId;

    sigma.classes.dispatcher.extend(this);

    sigma.utils.doubleClick(_target, 'touchstart', _doubleTapHandler);
    _target.addEventListener('touchstart', _handleStart, false);
    _target.addEventListener('touchend', _handleLeave, false);
    _target.addEventListener('touchcancel', _handleLeave, false);
    _target.addEventListener('touchleave', _handleLeave, false);
    _target.addEventListener('touchmove', _handleMove, false);

    function position(e) {
      var offset = sigma.utils.getOffset(_target);

      return {
        x: e.pageX - offset.left,
        y: e.pageY - offset.top
      };
    }

    /**
     * This method unbinds every handlers that makes the captor work.
     */
    this.kill = function() {
      sigma.utils.unbindDoubleClick(_target, 'touchstart');
      _target.addEventListener('touchstart', _handleStart);
      _target.addEventListener('touchend', _handleLeave);
      _target.addEventListener('touchcancel', _handleLeave);
      _target.addEventListener('touchleave', _handleLeave);
      _target.addEventListener('touchmove', _handleMove);
    };

    // TOUCH EVENTS:
    // *************
    /**
     * The handler listening to the 'touchstart' event. It will set the touch
     * mode ("_touchMode") and start observing the user touch moves.
     *
     * @param {event} e A touch event.
     */
    function _handleStart(e) {
      if (_settings('touchEnabled')) {
        var x0,
            x1,
            y0,
            y1,
            pos0,
            pos1;

        _downTouches = e.touches;

        switch (_downTouches.length) {
          case 1:
            _camera.isMoving = true;
            _touchMode = 1;

            _startCameraX = _camera.x;
            _startCameraY = _camera.y;

            _lastCameraX = _camera.x;
            _lastCameraY = _camera.y;

            pos0 = position(_downTouches[0]);
            _startTouchX0 = pos0.x;
            _startTouchY0 = pos0.y;

            break;
          case 2:
            _camera.isMoving = true;
            _touchMode = 2;

            pos0 = position(_downTouches[0]);
            pos1 = position(_downTouches[1]);
            x0 = pos0.x;
            y0 = pos0.y;
            x1 = pos1.x;
            y1 = pos1.y;

            _lastCameraX = _camera.x;
            _lastCameraY = _camera.y;

            _startCameraAngle = _camera.angle;
            _startCameraRatio = _camera.ratio;

            _startCameraX = _camera.x;
            _startCameraY = _camera.y;

            _startTouchX0 = x0;
            _startTouchY0 = y0;
            _startTouchX1 = x1;
            _startTouchY1 = y1;

            _startTouchAngle = Math.atan2(
              _startTouchY1 - _startTouchY0,
              _startTouchX1 - _startTouchX0
            );
            _startTouchDistance = Math.sqrt(
              (_startTouchY1 - _startTouchY0) *
                (_startTouchY1 - _startTouchY0) +
              (_startTouchX1 - _startTouchX0) *
                (_startTouchX1 - _startTouchX0)
            );

            e.preventDefault();
            return false;
        }
      }
    }

    /**
     * The handler listening to the 'touchend', 'touchcancel' and 'touchleave'
     * event. It will update the touch mode if there are still at least one
     * finger, and stop dragging else.
     *
     * @param {event} e A touch event.
     */
    function _handleLeave(e) {
      if (_settings('touchEnabled')) {
        _downTouches = e.touches;
        var inertiaRatio = _settings('touchInertiaRatio');

        if (_movingTimeoutId) {
          _isMoving = false;
          clearTimeout(_movingTimeoutId);
        }

        switch (_touchMode) {
          case 2:
            if (e.touches.length === 1) {
              _handleStart(e);

              e.preventDefault();
              break;
            }
            /* falls through */
          case 1:
            _camera.isMoving = false;
            _self.dispatchEvent('stopDrag');

            if (_isMoving) {
              _doubleTap = false;
              sigma.misc.animation.camera(
                _camera,
                {
                  x: _camera.x +
                    inertiaRatio * (_camera.x - _lastCameraX),
                  y: _camera.y +
                    inertiaRatio * (_camera.y - _lastCameraY)
                },
                {
                  easing: 'quadraticOut',
                  duration: _settings('touchInertiaDuration')
                }
              );
            }

            _isMoving = false;
            _touchMode = 0;
            break;
        }
      }
    }

    /**
     * The handler listening to the 'touchmove' event. It will effectively drag
     * the graph, and eventually zooms and turn it if the user is using two
     * fingers.
     *
     * @param {event} e A touch event.
     */
    function _handleMove(e) {
      if (!_doubleTap && _settings('touchEnabled')) {
        var x0,
            x1,
            y0,
            y1,
            cos,
            sin,
            end,
            pos0,
            pos1,
            diff,
            start,
            dAngle,
            dRatio,
            newStageX,
            newStageY,
            newStageRatio,
            newStageAngle;

        _downTouches = e.touches;
        _isMoving = true;

        if (_movingTimeoutId)
          clearTimeout(_movingTimeoutId);

        _movingTimeoutId = setTimeout(function() {
          _isMoving = false;
        }, _settings('dragTimeout'));

        switch (_touchMode) {
          case 1:
            pos0 = position(_downTouches[0]);
            x0 = pos0.x;
            y0 = pos0.y;

            diff = _camera.cameraPosition(
              x0 - _startTouchX0,
              y0 - _startTouchY0,
              true
            );

            newStageX = _startCameraX - diff.x;
            newStageY = _startCameraY - diff.y;

            if (newStageX !== _camera.x || newStageY !== _camera.y) {
              _lastCameraX = _camera.x;
              _lastCameraY = _camera.y;

              _camera.goTo({
                x: newStageX,
                y: newStageY
              });

              _self.dispatchEvent('mousemove',
                sigma.utils.mouseCoords(e, pos0.x, pos0.y));

              _self.dispatchEvent('drag');
            }
            break;
          case 2:
            pos0 = position(_downTouches[0]);
            pos1 = position(_downTouches[1]);
            x0 = pos0.x;
            y0 = pos0.y;
            x1 = pos1.x;
            y1 = pos1.y;

            start = _camera.cameraPosition(
              (_startTouchX0 + _startTouchX1) / 2 -
                sigma.utils.getCenter(e).x,
              (_startTouchY0 + _startTouchY1) / 2 -
                sigma.utils.getCenter(e).y,
              true
            );
            end = _camera.cameraPosition(
              (x0 + x1) / 2 - sigma.utils.getCenter(e).x,
              (y0 + y1) / 2 - sigma.utils.getCenter(e).y,
              true
            );

            dAngle = Math.atan2(y1 - y0, x1 - x0) - _startTouchAngle;
            dRatio = Math.sqrt(
              (y1 - y0) * (y1 - y0) + (x1 - x0) * (x1 - x0)
            ) / _startTouchDistance;

            // Translation:
            x0 = start.x;
            y0 = start.y;

            // Homothetic transformation:
            newStageRatio = _startCameraRatio / dRatio;
            x0 = x0 * dRatio;
            y0 = y0 * dRatio;

            // Rotation:
            newStageAngle = _startCameraAngle - dAngle;
            cos = Math.cos(-dAngle);
            sin = Math.sin(-dAngle);
            x1 = x0 * cos + y0 * sin;
            y1 = y0 * cos - x0 * sin;
            x0 = x1;
            y0 = y1;

            // Finalize:
            newStageX = x0 - end.x + _startCameraX;
            newStageY = y0 - end.y + _startCameraY;

            if (
              newStageRatio !== _camera.ratio ||
              newStageAngle !== _camera.angle ||
              newStageX !== _camera.x ||
              newStageY !== _camera.y
            ) {
              _lastCameraX = _camera.x;
              _lastCameraY = _camera.y;
              _lastCameraAngle = _camera.angle;
              _lastCameraRatio = _camera.ratio;

              _camera.goTo({
                x: newStageX,
                y: newStageY,
                angle: newStageAngle,
                ratio: newStageRatio
              });

              _self.dispatchEvent('drag');
            }

            break;
        }

        e.preventDefault();
        return false;
      }
    }

    /**
     * The handler listening to the double tap custom event. It will
     * basically zoom into the graph.
     *
     * @param {event} e A touch event.
     */
    function _doubleTapHandler(e) {
      var pos,
          ratio,
          animation;

      if (e.touches && e.touches.length === 1 && _settings('touchEnabled')) {
        _doubleTap = true;

        ratio = 1 / _settings('doubleClickZoomingRatio');

        pos = position(e.touches[0]);
        _self.dispatchEvent('doubleclick',
          sigma.utils.mouseCoords(e, pos.x, pos.y));

        if (_settings('doubleClickEnabled')) {
          pos = _camera.cameraPosition(
            pos.x - sigma.utils.getCenter(e).x,
            pos.y - sigma.utils.getCenter(e).y,
            true
          );

          animation = {
            duration: _settings('doubleClickZoomDuration'),
            onComplete: function() {
              _doubleTap = false;
            }
          };

          sigma.utils.zoomTo(_camera, pos.x, pos.y, ratio, animation);
        }

        if (e.preventDefault)
          e.preventDefault();
        else
          e.returnValue = false;

        e.stopPropagation();
        return false;
      }
    }
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  if (typeof conrad === 'undefined')
    throw 'conrad is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.renderers');

  /**
   * This function is the constructor of the canvas sigma's renderer.
   *
   * @param  {sigma.classes.graph}            graph    The graph to render.
   * @param  {sigma.classes.camera}           camera   The camera.
   * @param  {configurable}           settings The sigma instance settings
   *                                           function.
   * @param  {object}                 object   The options object.
   * @return {sigma.renderers.canvas}          The renderer instance.
   */
  sigma.renderers.canvas = function(graph, camera, settings, options) {
    if (typeof options !== 'object')
      throw 'sigma.renderers.canvas: Wrong arguments.';

    if (!(options.container instanceof HTMLElement))
      throw 'Container not found.';

    var k,
        i,
        l,
        a,
        fn,
        self = this;

    sigma.classes.dispatcher.extend(this);

    // Initialize main attributes:
    Object.defineProperty(this, 'conradId', {
      value: sigma.utils.id()
    });
    this.graph = graph;
    this.camera = camera;
    this.contexts = {};
    this.domElements = {};
    this.options = options;
    this.container = this.options.container;
    this.settings = (
        typeof options.settings === 'object' &&
        options.settings
      ) ?
        settings.embedObjects(options.settings) :
        settings;

    // Node indexes:
    this.nodesOnScreen = [];
    this.edgesOnScreen = [];

    // Conrad related attributes:
    this.jobs = {};

    // Find the prefix:
    this.options.prefix = 'renderer' + this.conradId + ':';

    // Initialize the DOM elements:
    if (
      !this.settings('batchEdgesDrawing')
    ) {
      this.initDOM('canvas', 'scene');
      this.contexts.edges = this.contexts.scene;
      this.contexts.nodes = this.contexts.scene;
      this.contexts.labels = this.contexts.scene;
    } else {
      this.initDOM('canvas', 'edges');
      this.initDOM('canvas', 'scene');
      this.contexts.nodes = this.contexts.scene;
      this.contexts.labels = this.contexts.scene;
    }

    this.initDOM('canvas', 'mouse');
    this.contexts.hover = this.contexts.mouse;

    // Initialize captors:
    this.captors = [];
    a = this.options.captors || [sigma.captors.mouse, sigma.captors.touch];
    for (i = 0, l = a.length; i < l; i++) {
      fn = typeof a[i] === 'function' ? a[i] : sigma.captors[a[i]];
      this.captors.push(
        new fn(
          this.domElements.mouse,
          this.camera,
          this.settings
        )
      );
    }

    // Deal with sigma events:
    sigma.misc.bindEvents.call(this, this.options.prefix);
    sigma.misc.drawHovers.call(this, this.options.prefix);

    this.resize(false);
  };




  /**
   * This method renders the graph on the canvases.
   *
   * @param  {?object}                options Eventually an object of options.
   * @return {sigma.renderers.canvas}         Returns the instance itself.
   */
  sigma.renderers.canvas.prototype.render = function(options) {
    options = options || {};

    var a,
        i,
        k,
        l,
        o,
        id,
        end,
        job,
        start,
        edges,
        renderers,
        rendererType,
        batchSize,
        tempGCO,
        index = {},
        graph = this.graph,
        nodes = this.graph.nodes,
        prefix = this.options.prefix || '',
        drawEdges = this.settings(options, 'drawEdges'),
        drawNodes = this.settings(options, 'drawNodes'),
        drawLabels = this.settings(options, 'drawLabels'),
        drawEdgeLabels = this.settings(options, 'drawEdgeLabels'),
        embedSettings = this.settings.embedObjects(options, {
          prefix: this.options.prefix
        });

    // Call the resize function:
    this.resize(false);

    // Check the 'hideEdgesOnMove' setting:
    if (this.settings(options, 'hideEdgesOnMove'))
      if (this.camera.isAnimated || this.camera.isMoving)
        drawEdges = false;

    // Apply the camera's view:
    this.camera.applyView(
      undefined,
      this.options.prefix,
      {
        width: this.width,
        height: this.height
      }
    );

    // Clear canvases:
    this.clear();

    // Kill running jobs:
    for (k in this.jobs)
      if (conrad.hasJob(k))
        conrad.killJob(k);

    // Find which nodes are on screen:
    this.edgesOnScreen = [];
    this.nodesOnScreen = this.camera.quadtree.area(
      this.camera.getRectangle(this.width, this.height)
    );

    for (a = this.nodesOnScreen, i = 0, l = a.length; i < l; i++)
      index[a[i].id] = a[i];

    // Draw edges:
    // - If settings('batchEdgesDrawing') is true, the edges are displayed per
    //   batches. If not, they are drawn in one frame.
    if (drawEdges) {
      // First, let's identify which edges to draw. To do this, we just keep
      // every edges that have at least one extremity displayed according to
      // the quadtree and the "hidden" attribute. We also do not keep hidden
      // edges.
      for (a = graph.edges(), i = 0, l = a.length; i < l; i++) {
        o = a[i];
        if (
          (index[o.source] || index[o.target]) &&
          (!o.hidden && !nodes(o.source).hidden && !nodes(o.target).hidden)
        )
          this.edgesOnScreen.push(o);
      }

      // If the "batchEdgesDrawing" settings is true, edges are batched:
      if (this.settings(options, 'batchEdgesDrawing')) {
        id = 'edges_' + this.conradId;
        batchSize = embedSettings('canvasEdgesBatchSize');

        edges = this.edgesOnScreen;
        l = edges.length;

        start = 0;
        end = Math.min(edges.length, start + batchSize);

        job = function() {
          tempGCO = this.contexts.edges.globalCompositeOperation;
          this.contexts.edges.globalCompositeOperation = 'destination-over';

          renderers = sigma.canvas.edges;
          for (i = start; i < end; i++) {
            o = edges[i];
            (renderers[
              o.type || this.settings(options, 'defaultEdgeType')
            ] || renderers.def)(
              o,
              graph.nodes(o.source),
              graph.nodes(o.target),
              this.contexts.edges,
              embedSettings
            );
          }

          // Draw edge labels:
          if (drawEdgeLabels) {
            renderers = sigma.canvas.edges.labels;
            for (i = start; i < end; i++) {
              o = edges[i];
              if (!o.hidden)
                (renderers[
                  o.type || this.settings(options, 'defaultEdgeType')
                ] || renderers.def)(
                  o,
                  graph.nodes(o.source),
                  graph.nodes(o.target),
                  this.contexts.labels,
                  embedSettings
                );
            }
          }

          // Restore original globalCompositeOperation:
          this.contexts.edges.globalCompositeOperation = tempGCO;

          // Catch job's end:
          if (end === edges.length) {
            delete this.jobs[id];
            return false;
          }

          start = end + 1;
          end = Math.min(edges.length, start + batchSize);
          return true;
        };

        this.jobs[id] = job;
        conrad.addJob(id, job.bind(this));

      // If not, they are drawn in one frame:
      } else {
        renderers = sigma.canvas.edges;
        for (a = this.edgesOnScreen, i = 0, l = a.length; i < l; i++) {
          o = a[i];
          (renderers[
            o.type || this.settings(options, 'defaultEdgeType')
          ] || renderers.def)(
            o,
            graph.nodes(o.source),
            graph.nodes(o.target),
            this.contexts.edges,
            embedSettings
          );
        }

        // Draw edge labels:
        // - No batching
        if (drawEdgeLabels) {
          renderers = sigma.canvas.edges.labels;
          for (a = this.edgesOnScreen, i = 0, l = a.length; i < l; i++)
            if (!a[i].hidden)
              (renderers[
                a[i].type || this.settings(options, 'defaultEdgeType')
              ] || renderers.def)(
                a[i],
                graph.nodes(a[i].source),
                graph.nodes(a[i].target),
                this.contexts.labels,
                embedSettings
              );
        }
      }
    }

    // Draw nodes:
    // - No batching
    if (drawNodes) {
      renderers = sigma.canvas.nodes;
      for (a = this.nodesOnScreen, i = 0, l = a.length; i < l; i++)
        if (!a[i].hidden)
          (renderers[
            a[i].type || this.settings(options, 'defaultNodeType')
          ] || renderers.def)(
            a[i],
            this.contexts.nodes,
            embedSettings
          );
    }

    // Draw labels:
    // - No batching
    if (drawLabels) {
      renderers = sigma.canvas.labels;
      for (a = this.nodesOnScreen, i = 0, l = a.length; i < l; i++)
        if (!a[i].hidden)
          (renderers[
            a[i].type || this.settings(options, 'defaultNodeType')
          ] || renderers.def)(
            a[i],
            this.contexts.labels,
            embedSettings
          );
    }

    this.dispatchEvent('render');

    return this;
  };

  /**
   * This method creates a DOM element of the specified type, switches its
   * position to "absolute", references it to the domElements attribute, and
   * finally appends it to the container.
   *
   * @param  {string} tag The label tag.
   * @param  {string} id  The id of the element (to store it in "domElements").
   */
  sigma.renderers.canvas.prototype.initDOM = function(tag, id) {
    var dom = document.createElement(tag);

    dom.style.position = 'absolute';
    dom.setAttribute('class', 'sigma-' + id);

    this.domElements[id] = dom;
    this.container.appendChild(dom);

    if (tag.toLowerCase() === 'canvas')
      this.contexts[id] = dom.getContext('2d');
  };

  /**
   * This method resizes each DOM elements in the container and stores the new
   * dimensions. Then, it renders the graph.
   *
   * @param  {?number}                width  The new width of the container.
   * @param  {?number}                height The new height of the container.
   * @return {sigma.renderers.canvas}        Returns the instance itself.
   */
  sigma.renderers.canvas.prototype.resize = function(w, h) {
    var k,
        oldWidth = this.width,
        oldHeight = this.height,
        pixelRatio = sigma.utils.getPixelRatio();

    if (w !== undefined && h !== undefined) {
      this.width = w;
      this.height = h;
    } else {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;

      w = this.width;
      h = this.height;
    }

    if (oldWidth !== this.width || oldHeight !== this.height) {
      for (k in this.domElements) {
        this.domElements[k].style.width = w + 'px';
        this.domElements[k].style.height = h + 'px';

        if (this.domElements[k].tagName.toLowerCase() === 'canvas') {
          this.domElements[k].setAttribute('width', (w * pixelRatio) + 'px');
          this.domElements[k].setAttribute('height', (h * pixelRatio) + 'px');

          if (pixelRatio !== 1)
            this.contexts[k].scale(pixelRatio, pixelRatio);
        }
      }
    }

    return this;
  };

  /**
   * This method clears each canvas.
   *
   * @return {sigma.renderers.canvas} Returns the instance itself.
   */
  sigma.renderers.canvas.prototype.clear = function() {
    for (var k in this.contexts) {
      this.contexts[k].clearRect(0, 0, this.width, this.height);
    }

    return this;
  };

  /**
   * This method kills contexts and other attributes.
   */
  sigma.renderers.canvas.prototype.kill = function() {
    var k,
        captor;

    // Kill captors:
    while ((captor = this.captors.pop()))
      captor.kill();
    delete this.captors;

    // Kill contexts:
    for (k in this.domElements) {
      this.domElements[k].parentNode.removeChild(this.domElements[k]);
      delete this.domElements[k];
      delete this.contexts[k];
    }
    delete this.domElements;
    delete this.contexts;
  };




  /**
   * The labels, nodes and edges renderers are stored in the three following
   * objects. When an element is drawn, its type will be checked and if a
   * renderer with the same name exists, it will be used. If not found, the
   * default renderer will be used instead.
   *
   * They are stored in different files, in the "./canvas" folder.
   */
  sigma.utils.pkg('sigma.canvas.nodes');
  sigma.utils.pkg('sigma.canvas.edges');
  sigma.utils.pkg('sigma.canvas.labels');
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.renderers');

  /**
   * This function is the constructor of the canvas sigma's renderer.
   *
   * @param  {sigma.classes.graph}            graph    The graph to render.
   * @param  {sigma.classes.camera}           camera   The camera.
   * @param  {configurable}           settings The sigma instance settings
   *                                           function.
   * @param  {object}                 object   The options object.
   * @return {sigma.renderers.canvas}          The renderer instance.
   */
  sigma.renderers.webgl = function(graph, camera, settings, options) {
    if (typeof options !== 'object')
      throw 'sigma.renderers.webgl: Wrong arguments.';

    if (!(options.container instanceof HTMLElement))
      throw 'Container not found.';

    var k,
        i,
        l,
        a,
        fn,
        _self = this;

    sigma.classes.dispatcher.extend(this);

    // Conrad related attributes:
    this.jobs = {};

    Object.defineProperty(this, 'conradId', {
      value: sigma.utils.id()
    });

    // Initialize main attributes:
    this.graph = graph;
    this.camera = camera;
    this.contexts = {};
    this.domElements = {};
    this.options = options;
    this.container = this.options.container;
    this.settings = (
        typeof options.settings === 'object' &&
        options.settings
      ) ?
        settings.embedObjects(options.settings) :
        settings;

    // Find the prefix:
    this.options.prefix = this.camera.readPrefix;

    // Initialize programs hash
    Object.defineProperty(this, 'nodePrograms', {
      value: {}
    });
    Object.defineProperty(this, 'edgePrograms', {
      value: {}
    });
    Object.defineProperty(this, 'nodeFloatArrays', {
      value: {}
    });
    Object.defineProperty(this, 'edgeFloatArrays', {
      value: {}
    });
    Object.defineProperty(this, 'edgeIndicesArrays', {
      value: {}
    });

    // Initialize the DOM elements:
    if (this.settings(options, 'batchEdgesDrawing')) {
      this.initDOM('canvas', 'edges', true);
      this.initDOM('canvas', 'nodes', true);
    } else {
      this.initDOM('canvas', 'scene', true);
      this.contexts.nodes = this.contexts.scene;
      this.contexts.edges = this.contexts.scene;
    }

    this.initDOM('canvas', 'labels');
    this.initDOM('canvas', 'mouse');
    this.contexts.hover = this.contexts.mouse;

    // Initialize captors:
    this.captors = [];
    a = this.options.captors || [sigma.captors.mouse, sigma.captors.touch];
    for (i = 0, l = a.length; i < l; i++) {
      fn = typeof a[i] === 'function' ? a[i] : sigma.captors[a[i]];
      this.captors.push(
        new fn(
          this.domElements.mouse,
          this.camera,
          this.settings
        )
      );
    }

    // Deal with sigma events:
    sigma.misc.bindEvents.call(this, this.camera.prefix);
    sigma.misc.drawHovers.call(this, this.camera.prefix);

    this.resize();
  };




  /**
   * This method will generate the nodes and edges float arrays. This step is
   * separated from the "render" method, because to keep WebGL efficient, since
   * all the camera and middlewares are modelised as matrices and they do not
   * require the float arrays to be regenerated.
   *
   * Basically, when the user moves the camera or applies some specific linear
   * transformations, this process step will be skipped, and the "render"
   * method will efficiently refresh the rendering.
   *
   * And when the user modifies the graph colors or positions (applying a new
   * layout or filtering the colors, for instance), this "process" step will be
   * required to regenerate the float arrays.
   *
   * @return {sigma.renderers.webgl} Returns the instance itself.
   */
  sigma.renderers.webgl.prototype.process = function() {
    var a,
        i,
        l,
        k,
        type,
        renderer,
        graph = this.graph,
        options = sigma.utils.extend(options, this.options),
        defaultEdgeType = this.settings(options, 'defaultEdgeType'),
        defaultNodeType = this.settings(options, 'defaultNodeType');

    // Empty float arrays:
    for (k in this.nodeFloatArrays)
      delete this.nodeFloatArrays[k];

    for (k in this.edgeFloatArrays)
      delete this.edgeFloatArrays[k];

    for (k in this.edgeIndicesArrays)
      delete this.edgeIndicesArrays[k];

    // Sort edges and nodes per types:
    for (a = graph.edges(), i = 0, l = a.length; i < l; i++) {
      type = a[i].type || defaultEdgeType;
      k = (type && sigma.webgl.edges[type]) ? type : 'def';

      if (!this.edgeFloatArrays[k])
        this.edgeFloatArrays[k] = {
          edges: []
        };

      this.edgeFloatArrays[k].edges.push(a[i]);
    }

    for (a = graph.nodes(), i = 0, l = a.length; i < l; i++) {
      type = a[i].type || defaultNodeType;
      k = (type && sigma.webgl.nodes[type]) ? type : 'def';

      if (!this.nodeFloatArrays[k])
        this.nodeFloatArrays[k] = {
          nodes: []
        };

      this.nodeFloatArrays[k].nodes.push(a[i]);
    }

    // Push edges:
    for (k in this.edgeFloatArrays) {
      renderer = sigma.webgl.edges[k];
      a = this.edgeFloatArrays[k].edges;

      // Creating the necessary arrays
      this.edgeFloatArrays[k].array = new Float32Array(
        a.length * renderer.POINTS * renderer.ATTRIBUTES
      );

      for (i = 0, l = a.length; i < l; i++) {

        // Just check that the edge and both its extremities are visible:
        if (
          !a[i].hidden &&
          !graph.nodes(a[i].source).hidden &&
          !graph.nodes(a[i].target).hidden
        )
          renderer.addEdge(
            a[i],
            graph.nodes(a[i].source),
            graph.nodes(a[i].target),
            this.edgeFloatArrays[k].array,
            i * renderer.POINTS * renderer.ATTRIBUTES,
            options.prefix,
            this.settings
          );
      }

      if (typeof renderer.computeIndices === 'function')
        this.edgeIndicesArrays[k] = renderer.computeIndices(
          this.edgeFloatArrays[k].array
        );
    }

    // Push nodes:
    for (k in this.nodeFloatArrays) {
      renderer = sigma.webgl.nodes[k];
      a = this.nodeFloatArrays[k].nodes;

      // Creating the necessary arrays
      this.nodeFloatArrays[k].array = new Float32Array(
        a.length * renderer.POINTS * renderer.ATTRIBUTES
      );

      for (i = 0, l = a.length; i < l; i++) {
        if (!this.nodeFloatArrays[k].array)
          this.nodeFloatArrays[k].array = new Float32Array(
            a.length * renderer.POINTS * renderer.ATTRIBUTES
          );

        // Just check that the edge and both its extremities are visible:
        if (
          !a[i].hidden
        )
          renderer.addNode(
            a[i],
            this.nodeFloatArrays[k].array,
            i * renderer.POINTS * renderer.ATTRIBUTES,
            options.prefix,
            this.settings
          );
      }
    }

    return this;
  };




  /**
   * This method renders the graph. It basically calls each program (and
   * generate them if they do not exist yet) to render nodes and edges, batched
   * per renderer.
   *
   * As in the canvas renderer, it is possible to display edges, nodes and / or
   * labels in batches, to make the whole thing way more scalable.
   *
   * @param  {?object}               params Eventually an object of options.
   * @return {sigma.renderers.webgl}        Returns the instance itself.
   */
  sigma.renderers.webgl.prototype.render = function(params) {
    var a,
        i,
        l,
        k,
        o,
        program,
        renderer,
        self = this,
        graph = this.graph,
        nodesGl = this.contexts.nodes,
        edgesGl = this.contexts.edges,
        matrix = this.camera.getMatrix(),
        options = sigma.utils.extend(params, this.options),
        drawLabels = this.settings(options, 'drawLabels'),
        drawEdges = this.settings(options, 'drawEdges'),
        drawNodes = this.settings(options, 'drawNodes');

    // Call the resize function:
    this.resize(false);

    // Check the 'hideEdgesOnMove' setting:
    if (this.settings(options, 'hideEdgesOnMove'))
      if (this.camera.isAnimated || this.camera.isMoving)
        drawEdges = false;

    // Clear canvases:
    this.clear();

    // Translate matrix to [width/2, height/2]:
    matrix = sigma.utils.matrices.multiply(
      matrix,
      sigma.utils.matrices.translation(this.width / 2, this.height / 2)
    );

    // Kill running jobs:
    for (k in this.jobs)
      if (conrad.hasJob(k))
        conrad.killJob(k);

    if (drawEdges) {
      if (this.settings(options, 'batchEdgesDrawing'))
        (function() {
          var a,
              k,
              i,
              id,
              job,
              arr,
              end,
              start,
              indices,
              renderer,
              batchSize,
              currentProgram;

          id = 'edges_' + this.conradId;
          batchSize = this.settings(options, 'webglEdgesBatchSize');
          a = Object.keys(this.edgeFloatArrays);

          if (!a.length)
            return;
          i = 0;
          renderer = sigma.webgl.edges[a[i]];
          arr = this.edgeFloatArrays[a[i]].array;
          indices = this.edgeIndicesArrays[a[i]];
          start = 0;
          end = Math.min(
            start + batchSize * renderer.POINTS,
            arr.length / renderer.ATTRIBUTES
          );

          job = function() {
            // Check program:
            if (!this.edgePrograms[a[i]])
              this.edgePrograms[a[i]] = renderer.initProgram(edgesGl);

            if (start < end) {
              edgesGl.useProgram(this.edgePrograms[a[i]]);
              renderer.render(
                edgesGl,
                this.edgePrograms[a[i]],
                arr,
                {
                  settings: this.settings,
                  matrix: matrix,
                  width: this.width,
                  height: this.height,
                  ratio: this.camera.ratio,
                  scalingRatio: this.settings(
                    options,
                    'webglOversamplingRatio'
                  ),
                  start: start,
                  count: end - start,
                  indicesData: indices
                }
              );
            }

            // Catch job's end:
            if (
              end >= arr.length / renderer.ATTRIBUTES &&
              i === a.length - 1
            ) {
              delete this.jobs[id];
              return false;
            }

            if (end >= arr.length / renderer.ATTRIBUTES) {
              i++;
              arr = this.edgeFloatArrays[a[i]].array;
              renderer = sigma.webgl.edges[a[i]];
              start = 0;
              end = Math.min(
                start + batchSize * renderer.POINTS,
                arr.length / renderer.ATTRIBUTES
              );
            } else {
              start = end;
              end = Math.min(
                start + batchSize * renderer.POINTS,
                arr.length / renderer.ATTRIBUTES
              );
            }

            return true;
          };

          this.jobs[id] = job;
          conrad.addJob(id, job.bind(this));
        }).call(this);
      else {
        for (k in this.edgeFloatArrays) {
          renderer = sigma.webgl.edges[k];

          // Check program:
          if (!this.edgePrograms[k])
            this.edgePrograms[k] = renderer.initProgram(edgesGl);

          // Render
          if (this.edgeFloatArrays[k]) {
            edgesGl.useProgram(this.edgePrograms[k]);
            renderer.render(
              edgesGl,
              this.edgePrograms[k],
              this.edgeFloatArrays[k].array,
              {
                settings: this.settings,
                matrix: matrix,
                width: this.width,
                height: this.height,
                ratio: this.camera.ratio,
                scalingRatio: this.settings(options, 'webglOversamplingRatio'),
                indicesData: this.edgeIndicesArrays[k]
              }
            );
          }
        }
      }
    }

    if (drawNodes) {
      // Enable blending:
      nodesGl.blendFunc(nodesGl.SRC_ALPHA, nodesGl.ONE_MINUS_SRC_ALPHA);
      nodesGl.enable(nodesGl.BLEND);

      for (k in this.nodeFloatArrays) {
        renderer = sigma.webgl.nodes[k];

        // Check program:
        if (!this.nodePrograms[k])
          this.nodePrograms[k] = renderer.initProgram(nodesGl);

        // Render
        if (this.nodeFloatArrays[k]) {
          nodesGl.useProgram(this.nodePrograms[k]);
          renderer.render(
            nodesGl,
            this.nodePrograms[k],
            this.nodeFloatArrays[k].array,
            {
              settings: this.settings,
              matrix: matrix,
              width: this.width,
              height: this.height,
              ratio: this.camera.ratio,
              scalingRatio: this.settings(options, 'webglOversamplingRatio')
            }
          );
        }
      }
    }

    if (drawLabels) {
      a = this.camera.quadtree.area(
        this.camera.getRectangle(this.width, this.height)
      );

      // Apply camera view to these nodes:
      this.camera.applyView(
        undefined,
        undefined,
        {
          nodes: a,
          edges: [],
          width: this.width,
          height: this.height
        }
      );

      o = function(key) {
        return self.settings({
          prefix: self.camera.prefix
        }, key);
      };

      for (i = 0, l = a.length; i < l; i++)
        if (!a[i].hidden)
          (
            sigma.canvas.labels[
              a[i].type ||
              this.settings(options, 'defaultNodeType')
            ] || sigma.canvas.labels.def
          )(a[i], this.contexts.labels, o);
    }

    this.dispatchEvent('render');

    return this;
  };




  /**
   * This method creates a DOM element of the specified type, switches its
   * position to "absolute", references it to the domElements attribute, and
   * finally appends it to the container.
   *
   * @param  {string}   tag   The label tag.
   * @param  {string}   id    The id of the element (to store it in
   *                          "domElements").
   * @param  {?boolean} webgl Will init the WebGL context if true.
   */
  sigma.renderers.webgl.prototype.initDOM = function(tag, id, webgl) {
    var gl,
        dom = document.createElement(tag),
        self = this;

    dom.style.position = 'absolute';
    dom.setAttribute('class', 'sigma-' + id);

    this.domElements[id] = dom;
    this.container.appendChild(dom);

    if (tag.toLowerCase() === 'canvas') {
      this.contexts[id] = dom.getContext(webgl ? 'experimental-webgl' : '2d', {
        preserveDrawingBuffer: true
      });

      // Adding webgl context loss listeners
      if (webgl) {
        dom.addEventListener('webglcontextlost', function(e) {
          e.preventDefault();
        }, false);

        dom.addEventListener('webglcontextrestored', function(e) {
          self.render();
        }, false);
      }
    }
  };

  /**
   * This method resizes each DOM elements in the container and stores the new
   * dimensions. Then, it renders the graph.
   *
   * @param  {?number}               width  The new width of the container.
   * @param  {?number}               height The new height of the container.
   * @return {sigma.renderers.webgl}        Returns the instance itself.
   */
  sigma.renderers.webgl.prototype.resize = function(w, h) {
    var k,
        oldWidth = this.width,
        oldHeight = this.height,
        pixelRatio = sigma.utils.getPixelRatio();

    if (w !== undefined && h !== undefined) {
      this.width = w;
      this.height = h;
    } else {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;

      w = this.width;
      h = this.height;
    }

    if (oldWidth !== this.width || oldHeight !== this.height) {
      for (k in this.domElements) {
        this.domElements[k].style.width = w + 'px';
        this.domElements[k].style.height = h + 'px';

        if (this.domElements[k].tagName.toLowerCase() === 'canvas') {
          // If simple 2D canvas:
          if (this.contexts[k] && this.contexts[k].scale) {
            this.domElements[k].setAttribute('width', (w * pixelRatio) + 'px');
            this.domElements[k].setAttribute('height', (h * pixelRatio) + 'px');

            if (pixelRatio !== 1)
              this.contexts[k].scale(pixelRatio, pixelRatio);
          } else {
            this.domElements[k].setAttribute(
              'width',
              (w * this.settings('webglOversamplingRatio')) + 'px'
            );
            this.domElements[k].setAttribute(
              'height',
              (h * this.settings('webglOversamplingRatio')) + 'px'
            );
          }
        }
      }
    }

    // Scale:
    for (k in this.contexts)
      if (this.contexts[k] && this.contexts[k].viewport)
        this.contexts[k].viewport(
          0,
          0,
          this.width * this.settings('webglOversamplingRatio'),
          this.height * this.settings('webglOversamplingRatio')
        );

    return this;
  };

  /**
   * This method clears each canvas.
   *
   * @return {sigma.renderers.webgl} Returns the instance itself.
   */
  sigma.renderers.webgl.prototype.clear = function() {
    this.contexts.labels.clearRect(0, 0, this.width, this.height);
    this.contexts.nodes.clear(this.contexts.nodes.COLOR_BUFFER_BIT);
    this.contexts.edges.clear(this.contexts.edges.COLOR_BUFFER_BIT);

    return this;
  };

  /**
   * This method kills contexts and other attributes.
   */
  sigma.renderers.webgl.prototype.kill = function() {
    var k,
        captor;

    // Kill captors:
    while ((captor = this.captors.pop()))
      captor.kill();
    delete this.captors;

    // Kill contexts:
    for (k in this.domElements) {
      this.domElements[k].parentNode.removeChild(this.domElements[k]);
      delete this.domElements[k];
      delete this.contexts[k];
    }
    delete this.domElements;
    delete this.contexts;
  };




  /**
   * The object "sigma.webgl.nodes" contains the different WebGL node
   * renderers. The default one draw nodes as discs. Here are the attributes
   * any node renderer must have:
   *
   * {number}   POINTS      The number of points required to draw a node.
   * {number}   ATTRIBUTES  The number of attributes needed to draw one point.
   * {function} addNode     A function that adds a node to the data stack that
   *                        will be given to the buffer. Here is the arguments:
   *                        > {object}       node
   *                        > {number}       index   The node index in the
   *                                                 nodes array.
   *                        > {Float32Array} data    The stack.
   *                        > {object}       options Some options.
   * {function} render      The function that will effectively render the nodes
   *                        into the buffer.
   *                        > {WebGLRenderingContext} gl
   *                        > {WebGLProgram}          program
   *                        > {Float32Array} data    The stack to give to the
   *                                                 buffer.
   *                        > {object}       params  An object containing some
   *                                                 options, like width,
   *                                                 height, the camera ratio.
   * {function} initProgram The function that will initiate the program, with
   *                        the relevant shaders and parameters. It must return
   *                        the newly created program.
   *
   * Check sigma.webgl.nodes.def or sigma.webgl.nodes.fast to see how it
   * works more precisely.
   */
  sigma.utils.pkg('sigma.webgl.nodes');




  /**
   * The object "sigma.webgl.edges" contains the different WebGL edge
   * renderers. The default one draw edges as direct lines. Here are the
   * attributes any edge renderer must have:
   *
   * {number}   POINTS      The number of points required to draw an edge.
   * {number}   ATTRIBUTES  The number of attributes needed to draw one point.
   * {function} addEdge     A function that adds an edge to the data stack that
   *                        will be given to the buffer. Here is the arguments:
   *                        > {object}       edge
   *                        > {object}       source
   *                        > {object}       target
   *                        > {Float32Array} data    The stack.
   *                        > {object}       options Some options.
   * {function} render      The function that will effectively render the edges
   *                        into the buffer.
   *                        > {WebGLRenderingContext} gl
   *                        > {WebGLProgram}          program
   *                        > {Float32Array} data    The stack to give to the
   *                                                 buffer.
   *                        > {object}       params  An object containing some
   *                                                 options, like width,
   *                                                 height, the camera ratio.
   * {function} initProgram The function that will initiate the program, with
   *                        the relevant shaders and parameters. It must return
   *                        the newly created program.
   *
   * Check sigma.webgl.edges.def or sigma.webgl.edges.fast to see how it
   * works more precisely.
   */
  sigma.utils.pkg('sigma.webgl.edges');




  /**
   * The object "sigma.canvas.labels" contains the different
   * label renderers for the WebGL renderer. Since displaying texts in WebGL is
   * definitely painful and since there a way less labels to display than nodes
   * or edges, the default renderer simply renders them in a canvas.
   *
   * A labels renderer is a simple function, taking as arguments the related
   * node, the renderer and a settings function.
   */
  sigma.utils.pkg('sigma.canvas.labels');
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  if (typeof conrad === 'undefined')
    throw 'conrad is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.renderers');

  /**
   * This function is the constructor of the svg sigma's renderer.
   *
   * @param  {sigma.classes.graph}            graph    The graph to render.
   * @param  {sigma.classes.camera}           camera   The camera.
   * @param  {configurable}           settings The sigma instance settings
   *                                           function.
   * @param  {object}                 object   The options object.
   * @return {sigma.renderers.svg}             The renderer instance.
   */
  sigma.renderers.svg = function(graph, camera, settings, options) {
    if (typeof options !== 'object')
      throw 'sigma.renderers.svg: Wrong arguments.';

    if (!(options.container instanceof HTMLElement))
      throw 'Container not found.';

    var i,
        l,
        a,
        fn,
        self = this;

    sigma.classes.dispatcher.extend(this);

    // Initialize main attributes:
    this.graph = graph;
    this.camera = camera;
    this.domElements = {
      graph: null,
      groups: {},
      nodes: {},
      edges: {},
      labels: {},
      hovers: {}
    };
    this.measurementCanvas = null;
    this.options = options;
    this.container = this.options.container;
    this.settings = (
        typeof options.settings === 'object' &&
        options.settings
      ) ?
        settings.embedObjects(options.settings) :
        settings;

    // Is the renderer meant to be freestyle?
    this.settings('freeStyle', !!this.options.freeStyle);

    // SVG xmlns
    this.settings('xmlns', 'http://www.w3.org/2000/svg');

    // Indexes:
    this.nodesOnScreen = [];
    this.edgesOnScreen = [];

    // Find the prefix:
    this.options.prefix = 'renderer' + sigma.utils.id() + ':';

    // Initialize the DOM elements
    this.initDOM('svg');

    // Initialize captors:
    this.captors = [];
    a = this.options.captors || [sigma.captors.mouse, sigma.captors.touch];
    for (i = 0, l = a.length; i < l; i++) {
      fn = typeof a[i] === 'function' ? a[i] : sigma.captors[a[i]];
      this.captors.push(
        new fn(
          this.domElements.graph,
          this.camera,
          this.settings
        )
      );
    }

    // Bind resize:
    window.addEventListener('resize', function() {
      self.resize();
    });

    // Deal with sigma events:
    // TODO: keep an option to override the DOM events?
    sigma.misc.bindDOMEvents.call(this, this.domElements.graph);
    this.bindHovers(this.options.prefix);

    // Resize
    this.resize(false);
  };

  /**
   * This method renders the graph on the svg scene.
   *
   * @param  {?object}                options Eventually an object of options.
   * @return {sigma.renderers.svg}            Returns the instance itself.
   */
  sigma.renderers.svg.prototype.render = function(options) {
    options = options || {};

    var a,
        i,
        k,
        e,
        l,
        o,
        source,
        target,
        start,
        edges,
        renderers,
        subrenderers,
        index = {},
        graph = this.graph,
        nodes = this.graph.nodes,
        prefix = this.options.prefix || '',
        drawEdges = this.settings(options, 'drawEdges'),
        drawNodes = this.settings(options, 'drawNodes'),
        drawLabels = this.settings(options, 'drawLabels'),
        embedSettings = this.settings.embedObjects(options, {
          prefix: this.options.prefix,
          forceLabels: this.options.forceLabels
        });

    // Check the 'hideEdgesOnMove' setting:
    if (this.settings(options, 'hideEdgesOnMove'))
      if (this.camera.isAnimated || this.camera.isMoving)
        drawEdges = false;

    // Apply the camera's view:
    this.camera.applyView(
      undefined,
      this.options.prefix,
      {
        width: this.width,
        height: this.height
      }
    );

    // Hiding everything
    // TODO: find a more sensible way to perform this operation
    this.hideDOMElements(this.domElements.nodes);
    this.hideDOMElements(this.domElements.edges);
    this.hideDOMElements(this.domElements.labels);

    // Find which nodes are on screen
    this.edgesOnScreen = [];
    this.nodesOnScreen = this.camera.quadtree.area(
      this.camera.getRectangle(this.width, this.height)
    );

    // Node index
    for (a = this.nodesOnScreen, i = 0, l = a.length; i < l; i++)
      index[a[i].id] = a[i];

    // Find which edges are on screen
    for (a = graph.edges(), i = 0, l = a.length; i < l; i++) {
      o = a[i];
      if (
        (index[o.source] || index[o.target]) &&
        (!o.hidden && !nodes(o.source).hidden && !nodes(o.target).hidden)
      )
        this.edgesOnScreen.push(o);
    }

    // Display nodes
    //---------------
    renderers = sigma.svg.nodes;
    subrenderers = sigma.svg.labels;

    //-- First we create the nodes which are not already created
    if (drawNodes)
      for (a = this.nodesOnScreen, i = 0, l = a.length; i < l; i++) {
        if (!a[i].hidden && !this.domElements.nodes[a[i].id]) {

          // Node
          e = (renderers[a[i].type] || renderers.def).create(
            a[i],
            embedSettings
          );

          this.domElements.nodes[a[i].id] = e;
          this.domElements.groups.nodes.appendChild(e);

          // Label
          e = (subrenderers[a[i].type] || subrenderers.def).create(
            a[i],
            embedSettings
          );

          this.domElements.labels[a[i].id] = e;
          this.domElements.groups.labels.appendChild(e);
        }
      }

    //-- Second we update the nodes
    if (drawNodes)
      for (a = this.nodesOnScreen, i = 0, l = a.length; i < l; i++) {

        if (a[i].hidden)
          continue;

        // Node
        (renderers[a[i].type] || renderers.def).update(
          a[i],
          this.domElements.nodes[a[i].id],
          embedSettings
        );

        // Label
        (subrenderers[a[i].type] || subrenderers.def).update(
          a[i],
          this.domElements.labels[a[i].id],
          embedSettings
        );
      }

    // Display edges
    //---------------
    renderers = sigma.svg.edges;

    //-- First we create the edges which are not already created
    if (drawEdges)
      for (a = this.edgesOnScreen, i = 0, l = a.length; i < l; i++) {
        if (!this.domElements.edges[a[i].id]) {
          source = nodes(a[i].source);
          target = nodes(a[i].target);

          e = (renderers[a[i].type] || renderers.def).create(
            a[i],
            source,
            target,
            embedSettings
          );

          this.domElements.edges[a[i].id] = e;
          this.domElements.groups.edges.appendChild(e);
        }
       }

    //-- Second we update the edges
    if (drawEdges)
      for (a = this.edgesOnScreen, i = 0, l = a.length; i < l; i++) {
        source = nodes(a[i].source);
        target = nodes(a[i].target);

        (renderers[a[i].type] || renderers.def).update(
          a[i],
          this.domElements.edges[a[i].id],
          source,
          target,
          embedSettings
        );
       }

    this.dispatchEvent('render');

    return this;
  };

  /**
   * This method creates a DOM element of the specified type, switches its
   * position to "absolute", references it to the domElements attribute, and
   * finally appends it to the container.
   *
   * @param  {string} tag The label tag.
   * @param  {string} id  The id of the element (to store it in "domElements").
   */
  sigma.renderers.svg.prototype.initDOM = function(tag) {
    var dom = document.createElementNS(this.settings('xmlns'), tag),
        c = this.settings('classPrefix'),
        g,
        l,
        i;

    dom.style.position = 'absolute';
    dom.setAttribute('class', c + '-svg');

    // Setting SVG namespace
    dom.setAttribute('xmlns', this.settings('xmlns'));
    dom.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    dom.setAttribute('version', '1.1');

    // Creating the measurement canvas
    var canvas = document.createElement('canvas');
    canvas.setAttribute('class', c + '-measurement-canvas');

    // Appending elements
    this.domElements.graph = this.container.appendChild(dom);

    // Creating groups
    var groups = ['edges', 'nodes', 'labels', 'hovers'];
    for (i = 0, l = groups.length; i < l; i++) {
      g = document.createElementNS(this.settings('xmlns'), 'g');

      g.setAttributeNS(null, 'id', c + '-group-' + groups[i]);
      g.setAttributeNS(null, 'class', c + '-group');

      this.domElements.groups[groups[i]] =
        this.domElements.graph.appendChild(g);
    }

    // Appending measurement canvas
    this.container.appendChild(canvas);
    this.measurementCanvas = canvas.getContext('2d');
  };

  /**
   * This method hides a batch of SVG DOM elements.
   *
   * @param  {array}                  elements  An array of elements to hide.
   * @param  {object}                 renderer  The renderer to use.
   * @return {sigma.renderers.svg}              Returns the instance itself.
   */
  sigma.renderers.svg.prototype.hideDOMElements = function(elements) {
    var o,
        i;

    for (i in elements) {
      o = elements[i];
      sigma.svg.utils.hide(o);
    }

    return this;
  };

  /**
   * This method binds the hover events to the renderer.
   *
   * @param  {string} prefix The renderer prefix.
   */
  // TODO: add option about whether to display hovers or not
  sigma.renderers.svg.prototype.bindHovers = function(prefix) {
    var renderers = sigma.svg.hovers,
        self = this,
        hoveredNode;

    function overNode(e) {
      var node = e.data.node,
          embedSettings = self.settings.embedObjects({
            prefix: prefix
          });

      if (!embedSettings('enableHovering'))
        return;

      var hover = (renderers[node.type] || renderers.def).create(
        node,
        self.domElements.nodes[node.id],
        self.measurementCanvas,
        embedSettings
      );

      self.domElements.hovers[node.id] = hover;

      // Inserting the hover in the dom
      self.domElements.groups.hovers.appendChild(hover);
      hoveredNode = node;
    }

    function outNode(e) {
      var node = e.data.node,
          embedSettings = self.settings.embedObjects({
            prefix: prefix
          });

      if (!embedSettings('enableHovering'))
        return;

      // Deleting element
      self.domElements.groups.hovers.removeChild(
        self.domElements.hovers[node.id]
      );
      hoveredNode = null;
      delete self.domElements.hovers[node.id];

      // Reinstate
      self.domElements.groups.nodes.appendChild(
        self.domElements.nodes[node.id]
      );
    }

    // OPTIMIZE: perform a real update rather than a deletion
    function update() {
      if (!hoveredNode)
        return;

      var embedSettings = self.settings.embedObjects({
            prefix: prefix
          });

      // Deleting element before update
      self.domElements.groups.hovers.removeChild(
        self.domElements.hovers[hoveredNode.id]
      );
      delete self.domElements.hovers[hoveredNode.id];

      var hover = (renderers[hoveredNode.type] || renderers.def).create(
        hoveredNode,
        self.domElements.nodes[hoveredNode.id],
        self.measurementCanvas,
        embedSettings
      );

      self.domElements.hovers[hoveredNode.id] = hover;

      // Inserting the hover in the dom
      self.domElements.groups.hovers.appendChild(hover);
    }

    // Binding events
    this.bind('overNode', overNode);
    this.bind('outNode', outNode);

    // Update on render
    this.bind('render', update);
  };

  /**
   * This method resizes each DOM elements in the container and stores the new
   * dimensions. Then, it renders the graph.
   *
   * @param  {?number}                width  The new width of the container.
   * @param  {?number}                height The new height of the container.
   * @return {sigma.renderers.svg}           Returns the instance itself.
   */
  sigma.renderers.svg.prototype.resize = function(w, h) {
    var oldWidth = this.width,
        oldHeight = this.height,
        pixelRatio = 1;

    if (w !== undefined && h !== undefined) {
      this.width = w;
      this.height = h;
    } else {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;

      w = this.width;
      h = this.height;
    }

    if (oldWidth !== this.width || oldHeight !== this.height) {
      this.domElements.graph.style.width = w + 'px';
      this.domElements.graph.style.height = h + 'px';

      if (this.domElements.graph.tagName.toLowerCase() === 'svg') {
        this.domElements.graph.setAttribute('width', (w * pixelRatio));
        this.domElements.graph.setAttribute('height', (h * pixelRatio));
      }
    }

    return this;
  };


  /**
   * The labels, nodes and edges renderers are stored in the three following
   * objects. When an element is drawn, its type will be checked and if a
   * renderer with the same name exists, it will be used. If not found, the
   * default renderer will be used instead.
   *
   * They are stored in different files, in the "./svg" folder.
   */
  sigma.utils.pkg('sigma.svg.nodes');
  sigma.utils.pkg('sigma.svg.edges');
  sigma.utils.pkg('sigma.svg.labels');
}).call(this);

;(function(global) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.renderers');

  // Check if WebGL is enabled:
  var canvas,
      webgl = !!global.WebGLRenderingContext;
  if (webgl) {
    canvas = document.createElement('canvas');
    try {
      webgl = !!(
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')
      );
    } catch (e) {
      webgl = false;
    }
  }

  // Copy the good renderer:
  sigma.renderers.def = webgl ?
    sigma.renderers.webgl :
    sigma.renderers.canvas;
})(this);

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.webgl.nodes');

  /**
   * This node renderer will display nodes as discs, shaped in triangles with
   * the gl.TRIANGLES display mode. So, to be more precise, to draw one node,
   * it will store three times the center of node, with the color and the size,
   * and an angle indicating which "corner" of the triangle to draw.
   *
   * The fragment shader does not deal with anti-aliasing, so make sure that
   * you deal with it somewhere else in the code (by default, the WebGL
   * renderer will oversample the rendering through the webglOversamplingRatio
   * value).
   */
  sigma.webgl.nodes.def = {
    POINTS: 3,
    ATTRIBUTES: 5,
    addNode: function(node, data, i, prefix, settings) {
      var color = sigma.utils.floatColor(
        node.color || settings('defaultNodeColor')
      );

      data[i++] = node[prefix + 'x'];
      data[i++] = node[prefix + 'y'];
      data[i++] = node[prefix + 'size'];
      data[i++] = color;
      data[i++] = 0;

      data[i++] = node[prefix + 'x'];
      data[i++] = node[prefix + 'y'];
      data[i++] = node[prefix + 'size'];
      data[i++] = color;
      data[i++] = 2 * Math.PI / 3;

      data[i++] = node[prefix + 'x'];
      data[i++] = node[prefix + 'y'];
      data[i++] = node[prefix + 'size'];
      data[i++] = color;
      data[i++] = 4 * Math.PI / 3;
    },
    render: function(gl, program, data, params) {
      var buffer;

      // Define attributes:
      var positionLocation =
            gl.getAttribLocation(program, 'a_position'),
          sizeLocation =
            gl.getAttribLocation(program, 'a_size'),
          colorLocation =
            gl.getAttribLocation(program, 'a_color'),
          angleLocation =
            gl.getAttribLocation(program, 'a_angle'),
          resolutionLocation =
            gl.getUniformLocation(program, 'u_resolution'),
          matrixLocation =
            gl.getUniformLocation(program, 'u_matrix'),
          ratioLocation =
            gl.getUniformLocation(program, 'u_ratio'),
          scaleLocation =
            gl.getUniformLocation(program, 'u_scale');

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

      gl.uniform2f(resolutionLocation, params.width, params.height);
      gl.uniform1f(
        ratioLocation,
        1 / Math.pow(params.ratio, params.settings('nodesPowRatio'))
      );
      gl.uniform1f(scaleLocation, params.scalingRatio);
      gl.uniformMatrix3fv(matrixLocation, false, params.matrix);

      gl.enableVertexAttribArray(positionLocation);
      gl.enableVertexAttribArray(sizeLocation);
      gl.enableVertexAttribArray(colorLocation);
      gl.enableVertexAttribArray(angleLocation);

      gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.vertexAttribPointer(
        sizeLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        8
      );
      gl.vertexAttribPointer(
        colorLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        12
      );
      gl.vertexAttribPointer(
        angleLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        16
      );

      gl.drawArrays(
        gl.TRIANGLES,
        params.start || 0,
        params.count || (data.length / this.ATTRIBUTES)
      );
    },
    initProgram: function(gl) {
      var vertexShader,
          fragmentShader,
          program;

      vertexShader = sigma.utils.loadShader(
        gl,
        [
          'attribute vec2 a_position;',
          'attribute float a_size;',
          'attribute float a_color;',
          'attribute float a_angle;',

          'uniform vec2 u_resolution;',
          'uniform float u_ratio;',
          'uniform float u_scale;',
          'uniform mat3 u_matrix;',

          'varying vec4 color;',
          'varying vec2 center;',
          'varying float radius;',

          'void main() {',
            // Multiply the point size twice:
            'radius = a_size * u_ratio;',

            // Scale from [[-1 1] [-1 1]] to the container:
            'vec2 position = (u_matrix * vec3(a_position, 1)).xy;',
            // 'center = (position / u_resolution * 2.0 - 1.0) * vec2(1, -1);',
            'center = position * u_scale;',
            'center = vec2(center.x, u_scale * u_resolution.y - center.y);',

            'position = position +',
              '2.0 * radius * vec2(cos(a_angle), sin(a_angle));',
            'position = (position / u_resolution * 2.0 - 1.0) * vec2(1, -1);',

            'radius = radius * u_scale;',

            'gl_Position = vec4(position, 0, 1);',

            // Extract the color:
            'float c = a_color;',
            'color.b = mod(c, 256.0); c = floor(c / 256.0);',
            'color.g = mod(c, 256.0); c = floor(c / 256.0);',
            'color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;',
            'color.a = 1.0;',
          '}'
        ].join('\n'),
        gl.VERTEX_SHADER
      );

      fragmentShader = sigma.utils.loadShader(
        gl,
        [
          'precision mediump float;',

          'varying vec4 color;',
          'varying vec2 center;',
          'varying float radius;',

          'void main(void) {',
            'vec4 color0 = vec4(0.0, 0.0, 0.0, 0.0);',

            'vec2 m = gl_FragCoord.xy - center;',
            'float diff = radius - sqrt(m.x * m.x + m.y * m.y);',

            // Here is how we draw a disc instead of a square:
            'if (diff > 0.0)',
              'gl_FragColor = color;',
            'else',
              'gl_FragColor = color0;',
          '}'
        ].join('\n'),
        gl.FRAGMENT_SHADER
      );

      program = sigma.utils.loadProgram(gl, [vertexShader, fragmentShader]);

      return program;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.webgl.nodes');

  /**
   * This node renderer will display nodes in the fastest way: Nodes are basic
   * squares, drawn through the gl.POINTS drawing method. The size of the nodes
   * are represented with the "gl_PointSize" value in the vertex shader.
   *
   * It is the fastest node renderer here since the buffer just takes one line
   * to draw each node (with attributes "x", "y", "size" and "color").
   *
   * Nevertheless, this method has some problems, especially due to some issues
   * with the gl.POINTS:
   *  - First, if the center of a node is outside the scene, the point will not
   *    be drawn, even if it should be partly on screen.
   *  - I tried applying a fragment shader similar to the one in the default
   *    node renderer to display them as discs, but it did not work fine on
   *    some computers settings, filling the discs with weird gradients not
   *    depending on the actual color.
   */
  sigma.webgl.nodes.fast = {
    POINTS: 1,
    ATTRIBUTES: 4,
    addNode: function(node, data, i, prefix, settings) {
      data[i++] = node[prefix + 'x'];
      data[i++] = node[prefix + 'y'];
      data[i++] = node[prefix + 'size'];
      data[i++] = sigma.utils.floatColor(
        node.color || settings('defaultNodeColor')
      );
    },
    render: function(gl, program, data, params) {
      var buffer;

      // Define attributes:
      var positionLocation =
            gl.getAttribLocation(program, 'a_position'),
          sizeLocation =
            gl.getAttribLocation(program, 'a_size'),
          colorLocation =
            gl.getAttribLocation(program, 'a_color'),
          resolutionLocation =
            gl.getUniformLocation(program, 'u_resolution'),
          matrixLocation =
            gl.getUniformLocation(program, 'u_matrix'),
          ratioLocation =
            gl.getUniformLocation(program, 'u_ratio'),
          scaleLocation =
            gl.getUniformLocation(program, 'u_scale');

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

      gl.uniform2f(resolutionLocation, params.width, params.height);
      gl.uniform1f(
        ratioLocation,
        1 / Math.pow(params.ratio, params.settings('nodesPowRatio'))
      );
      gl.uniform1f(scaleLocation, params.scalingRatio);
      gl.uniformMatrix3fv(matrixLocation, false, params.matrix);

      gl.enableVertexAttribArray(positionLocation);
      gl.enableVertexAttribArray(sizeLocation);
      gl.enableVertexAttribArray(colorLocation);

      gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.vertexAttribPointer(
        sizeLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        8
      );
      gl.vertexAttribPointer(
        colorLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        12
      );

      gl.drawArrays(
        gl.POINTS,
        params.start || 0,
        params.count || (data.length / this.ATTRIBUTES)
      );
    },
    initProgram: function(gl) {
      var vertexShader,
          fragmentShader,
          program;

      vertexShader = sigma.utils.loadShader(
        gl,
        [
          'attribute vec2 a_position;',
          'attribute float a_size;',
          'attribute float a_color;',

          'uniform vec2 u_resolution;',
          'uniform float u_ratio;',
          'uniform float u_scale;',
          'uniform mat3 u_matrix;',

          'varying vec4 color;',

          'void main() {',
            // Scale from [[-1 1] [-1 1]] to the container:
            'gl_Position = vec4(',
              '((u_matrix * vec3(a_position, 1)).xy /',
                'u_resolution * 2.0 - 1.0) * vec2(1, -1),',
              '0,',
              '1',
            ');',

            // Multiply the point size twice:
            //  - x SCALING_RATIO to correct the canvas scaling
            //  - x 2 to correct the formulae
            'gl_PointSize = a_size * u_ratio * u_scale * 2.0;',

            // Extract the color:
            'float c = a_color;',
            'color.b = mod(c, 256.0); c = floor(c / 256.0);',
            'color.g = mod(c, 256.0); c = floor(c / 256.0);',
            'color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;',
            'color.a = 1.0;',
          '}'
        ].join('\n'),
        gl.VERTEX_SHADER
      );

      fragmentShader = sigma.utils.loadShader(
        gl,
        [
          'precision mediump float;',

          'varying vec4 color;',

          'void main(void) {',
            'float border = 0.01;',
            'float radius = 0.5;',

            'vec4 color0 = vec4(0.0, 0.0, 0.0, 0.0);',
            'vec2 m = gl_PointCoord - vec2(0.5, 0.5);',
            'float dist = radius - sqrt(m.x * m.x + m.y * m.y);',

            'float t = 0.0;',
            'if (dist > border)',
              't = 1.0;',
            'else if (dist > 0.0)',
              't = dist / border;',

            'gl_FragColor = mix(color0, color, t);',
          '}'
        ].join('\n'),
        gl.FRAGMENT_SHADER
      );

      program = sigma.utils.loadProgram(gl, [vertexShader, fragmentShader]);

      return program;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.webgl.edges');

  /**
   * This edge renderer will display edges as lines going from the source node
   * to the target node. To deal with edge thicknesses, the lines are made of
   * two triangles forming rectangles, with the gl.TRIANGLES drawing mode.
   *
   * It is expensive, since drawing a single edge requires 6 points, each
   * having 7 attributes (source position, target position, thickness, color
   * and a flag indicating which vertice of the rectangle it is).
   */
  sigma.webgl.edges.def = {
    POINTS: 6,
    ATTRIBUTES: 7,
    addEdge: function(edge, source, target, data, i, prefix, settings) {
      var w = (edge[prefix + 'size'] || 1) / 2,
          x1 = source[prefix + 'x'],
          y1 = source[prefix + 'y'],
          x2 = target[prefix + 'x'],
          y2 = target[prefix + 'y'],
          color = edge.color;

      if (!color)
        switch (settings('edgeColor')) {
          case 'source':
            color = source.color || settings('defaultNodeColor');
            break;
          case 'target':
            color = target.color || settings('defaultNodeColor');
            break;
          default:
            color = settings('defaultEdgeColor');
            break;
        }

      // Normalize color:
      color = sigma.utils.floatColor(color);

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = 1.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = 1.0;
      data[i++] = color;

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = 0.0;
      data[i++] = color;
    },
    render: function(gl, program, data, params) {
      var buffer;

      // Define attributes:
      var colorLocation =
            gl.getAttribLocation(program, 'a_color'),
          positionLocation1 =
            gl.getAttribLocation(program, 'a_position1'),
          positionLocation2 =
            gl.getAttribLocation(program, 'a_position2'),
          thicknessLocation =
            gl.getAttribLocation(program, 'a_thickness'),
          minusLocation =
            gl.getAttribLocation(program, 'a_minus'),
          resolutionLocation =
            gl.getUniformLocation(program, 'u_resolution'),
          matrixLocation =
            gl.getUniformLocation(program, 'u_matrix'),
          matrixHalfPiLocation =
            gl.getUniformLocation(program, 'u_matrixHalfPi'),
          matrixHalfPiMinusLocation =
            gl.getUniformLocation(program, 'u_matrixHalfPiMinus'),
          ratioLocation =
            gl.getUniformLocation(program, 'u_ratio'),
          scaleLocation =
            gl.getUniformLocation(program, 'u_scale');

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

      gl.uniform2f(resolutionLocation, params.width, params.height);
      gl.uniform1f(
        ratioLocation,
        params.ratio / Math.pow(params.ratio, params.settings('edgesPowRatio'))
      );
      gl.uniform1f(scaleLocation, params.scalingRatio);
      gl.uniformMatrix3fv(matrixLocation, false, params.matrix);
      gl.uniformMatrix2fv(
        matrixHalfPiLocation,
        false,
        sigma.utils.matrices.rotation(Math.PI / 2, true)
      );
      gl.uniformMatrix2fv(
        matrixHalfPiMinusLocation,
        false,
        sigma.utils.matrices.rotation(-Math.PI / 2, true)
      );

      gl.enableVertexAttribArray(colorLocation);
      gl.enableVertexAttribArray(positionLocation1);
      gl.enableVertexAttribArray(positionLocation2);
      gl.enableVertexAttribArray(thicknessLocation);
      gl.enableVertexAttribArray(minusLocation);

      gl.vertexAttribPointer(positionLocation1,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.vertexAttribPointer(positionLocation2,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        8
      );
      gl.vertexAttribPointer(thicknessLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        16
      );
      gl.vertexAttribPointer(minusLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        20
      );
      gl.vertexAttribPointer(colorLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        24
      );

      gl.drawArrays(
        gl.TRIANGLES,
        params.start || 0,
        params.count || (data.length / this.ATTRIBUTES)
      );
    },
    initProgram: function(gl) {
      var vertexShader,
          fragmentShader,
          program;

      vertexShader = sigma.utils.loadShader(
        gl,
        [
          'attribute vec2 a_position1;',
          'attribute vec2 a_position2;',
          'attribute float a_thickness;',
          'attribute float a_minus;',
          'attribute float a_color;',

          'uniform vec2 u_resolution;',
          'uniform float u_ratio;',
          'uniform float u_scale;',
          'uniform mat3 u_matrix;',
          'uniform mat2 u_matrixHalfPi;',
          'uniform mat2 u_matrixHalfPiMinus;',

          'varying vec4 color;',

          'void main() {',
            // Find the good point:
            'vec2 position = a_thickness * u_ratio *',
              'normalize(a_position2 - a_position1);',

            'mat2 matrix = a_minus * u_matrixHalfPiMinus +',
              '(1.0 - a_minus) * u_matrixHalfPi;',

            'position = matrix * position + a_position1;',

            // Scale from [[-1 1] [-1 1]] to the container:
            'gl_Position = vec4(',
              '((u_matrix * vec3(position, 1)).xy /',
                'u_resolution * 2.0 - 1.0) * vec2(1, -1),',
              '0,',
              '1',
            ');',

            // Extract the color:
            'float c = a_color;',
            'color.b = mod(c, 256.0); c = floor(c / 256.0);',
            'color.g = mod(c, 256.0); c = floor(c / 256.0);',
            'color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;',
            'color.a = 1.0;',
          '}'
        ].join('\n'),
        gl.VERTEX_SHADER
      );

      fragmentShader = sigma.utils.loadShader(
        gl,
        [
          'precision mediump float;',

          'varying vec4 color;',

          'void main(void) {',
            'gl_FragColor = color;',
          '}'
        ].join('\n'),
        gl.FRAGMENT_SHADER
      );

      program = sigma.utils.loadProgram(gl, [vertexShader, fragmentShader]);

      return program;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.webgl.edges');

  /**
   * This edge renderer will display edges as lines with the gl.LINES display
   * mode. Since this mode does not support well thickness, edges are all drawn
   * with the same thickness (3px), independantly of the edge attributes or the
   * zooming ratio.
   */
  sigma.webgl.edges.fast = {
    POINTS: 2,
    ATTRIBUTES: 3,
    addEdge: function(edge, source, target, data, i, prefix, settings) {
      var w = (edge[prefix + 'size'] || 1) / 2,
          x1 = source[prefix + 'x'],
          y1 = source[prefix + 'y'],
          x2 = target[prefix + 'x'],
          y2 = target[prefix + 'y'],
          color = edge.color;

      if (!color)
        switch (settings('edgeColor')) {
          case 'source':
            color = source.color || settings('defaultNodeColor');
            break;
          case 'target':
            color = target.color || settings('defaultNodeColor');
            break;
          default:
            color = settings('defaultEdgeColor');
            break;
        }

      // Normalize color:
      color = sigma.utils.floatColor(color);

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = color;
    },
    render: function(gl, program, data, params) {
      var buffer;

      // Define attributes:
      var colorLocation =
            gl.getAttribLocation(program, 'a_color'),
          positionLocation =
            gl.getAttribLocation(program, 'a_position'),
          resolutionLocation =
            gl.getUniformLocation(program, 'u_resolution'),
          matrixLocation =
            gl.getUniformLocation(program, 'u_matrix');

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

      gl.uniform2f(resolutionLocation, params.width, params.height);
      gl.uniformMatrix3fv(matrixLocation, false, params.matrix);

      gl.enableVertexAttribArray(positionLocation);
      gl.enableVertexAttribArray(colorLocation);

      gl.vertexAttribPointer(positionLocation,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.vertexAttribPointer(colorLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        8
      );

      gl.lineWidth(3);
      gl.drawArrays(
        gl.LINES,
        params.start || 0,
        params.count || (data.length / this.ATTRIBUTES)
      );
    },
    initProgram: function(gl) {
      var vertexShader,
          fragmentShader,
          program;

      vertexShader = sigma.utils.loadShader(
        gl,
        [
          'attribute vec2 a_position;',
          'attribute float a_color;',

          'uniform vec2 u_resolution;',
          'uniform mat3 u_matrix;',

          'varying vec4 color;',

          'void main() {',
            // Scale from [[-1 1] [-1 1]] to the container:
            'gl_Position = vec4(',
              '((u_matrix * vec3(a_position, 1)).xy /',
                'u_resolution * 2.0 - 1.0) * vec2(1, -1),',
              '0,',
              '1',
            ');',

            // Extract the color:
            'float c = a_color;',
            'color.b = mod(c, 256.0); c = floor(c / 256.0);',
            'color.g = mod(c, 256.0); c = floor(c / 256.0);',
            'color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;',
            'color.a = 1.0;',
          '}'
        ].join('\n'),
        gl.VERTEX_SHADER
      );

      fragmentShader = sigma.utils.loadShader(
        gl,
        [
          'precision mediump float;',

          'varying vec4 color;',

          'void main(void) {',
            'gl_FragColor = color;',
          '}'
        ].join('\n'),
        gl.FRAGMENT_SHADER
      );

      program = sigma.utils.loadProgram(gl, [vertexShader, fragmentShader]);

      return program;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.webgl.edges');

  /**
   * This edge renderer will display edges as arrows going from the source node
   * to the target node. To deal with edge thicknesses, the lines are made of
   * three triangles: two forming rectangles, with the gl.TRIANGLES drawing
   * mode.
   *
   * It is expensive, since drawing a single edge requires 9 points, each
   * having a lot of attributes.
   */
  sigma.webgl.edges.arrow = {
    POINTS: 9,
    ATTRIBUTES: 11,
    addEdge: function(edge, source, target, data, i, prefix, settings) {
      var w = (edge[prefix + 'size'] || 1) / 2,
          x1 = source[prefix + 'x'],
          y1 = source[prefix + 'y'],
          x2 = target[prefix + 'x'],
          y2 = target[prefix + 'y'],
          targetSize = target[prefix + 'size'],
          color = edge.color;

      if (!color)
        switch (settings('edgeColor')) {
          case 'source':
            color = source.color || settings('defaultNodeColor');
            break;
          case 'target':
            color = target.color || settings('defaultNodeColor');
            break;
          default:
            color = settings('defaultEdgeColor');
            break;
        }

      // Normalize color:
      color = sigma.utils.floatColor(color);

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 1.0;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 0.0;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = color;

      // Arrow head:
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 1.0;
      data[i++] = -1.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = color;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = targetSize;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 1.0;
      data[i++] = 1.0;
      data[i++] = color;
    },
    render: function(gl, program, data, params) {
      var buffer;

      // Define attributes:
      var positionLocation1 =
            gl.getAttribLocation(program, 'a_pos1'),
          positionLocation2 =
            gl.getAttribLocation(program, 'a_pos2'),
          thicknessLocation =
            gl.getAttribLocation(program, 'a_thickness'),
          targetSizeLocation =
            gl.getAttribLocation(program, 'a_tSize'),
          delayLocation =
            gl.getAttribLocation(program, 'a_delay'),
          minusLocation =
            gl.getAttribLocation(program, 'a_minus'),
          headLocation =
            gl.getAttribLocation(program, 'a_head'),
          headPositionLocation =
            gl.getAttribLocation(program, 'a_headPosition'),
          colorLocation =
            gl.getAttribLocation(program, 'a_color'),
          resolutionLocation =
            gl.getUniformLocation(program, 'u_resolution'),
          matrixLocation =
            gl.getUniformLocation(program, 'u_matrix'),
          matrixHalfPiLocation =
            gl.getUniformLocation(program, 'u_matrixHalfPi'),
          matrixHalfPiMinusLocation =
            gl.getUniformLocation(program, 'u_matrixHalfPiMinus'),
          ratioLocation =
            gl.getUniformLocation(program, 'u_ratio'),
          nodeRatioLocation =
            gl.getUniformLocation(program, 'u_nodeRatio'),
          arrowHeadLocation =
            gl.getUniformLocation(program, 'u_arrowHead'),
          scaleLocation =
            gl.getUniformLocation(program, 'u_scale');

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

      gl.uniform2f(resolutionLocation, params.width, params.height);
      gl.uniform1f(
        ratioLocation,
        params.ratio / Math.pow(params.ratio, params.settings('edgesPowRatio'))
      );
      gl.uniform1f(
        nodeRatioLocation,
        Math.pow(params.ratio, params.settings('nodesPowRatio')) /
        params.ratio
      );
      gl.uniform1f(arrowHeadLocation, 5.0);
      gl.uniform1f(scaleLocation, params.scalingRatio);
      gl.uniformMatrix3fv(matrixLocation, false, params.matrix);
      gl.uniformMatrix2fv(
        matrixHalfPiLocation,
        false,
        sigma.utils.matrices.rotation(Math.PI / 2, true)
      );
      gl.uniformMatrix2fv(
        matrixHalfPiMinusLocation,
        false,
        sigma.utils.matrices.rotation(-Math.PI / 2, true)
      );

      gl.enableVertexAttribArray(positionLocation1);
      gl.enableVertexAttribArray(positionLocation2);
      gl.enableVertexAttribArray(thicknessLocation);
      gl.enableVertexAttribArray(targetSizeLocation);
      gl.enableVertexAttribArray(delayLocation);
      gl.enableVertexAttribArray(minusLocation);
      gl.enableVertexAttribArray(headLocation);
      gl.enableVertexAttribArray(headPositionLocation);
      gl.enableVertexAttribArray(colorLocation);

      gl.vertexAttribPointer(positionLocation1,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.vertexAttribPointer(positionLocation2,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        8
      );
      gl.vertexAttribPointer(thicknessLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        16
      );
      gl.vertexAttribPointer(targetSizeLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        20
      );
      gl.vertexAttribPointer(delayLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        24
      );
      gl.vertexAttribPointer(minusLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        28
      );
      gl.vertexAttribPointer(headLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        32
      );
      gl.vertexAttribPointer(headPositionLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        36
      );
      gl.vertexAttribPointer(colorLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        40
      );

      gl.drawArrays(
        gl.TRIANGLES,
        params.start || 0,
        params.count || (data.length / this.ATTRIBUTES)
      );
    },
    initProgram: function(gl) {
      var vertexShader,
          fragmentShader,
          program;

      vertexShader = sigma.utils.loadShader(
        gl,
        [
          'attribute vec2 a_pos1;',
          'attribute vec2 a_pos2;',
          'attribute float a_thickness;',
          'attribute float a_tSize;',
          'attribute float a_delay;',
          'attribute float a_minus;',
          'attribute float a_head;',
          'attribute float a_headPosition;',
          'attribute float a_color;',

          'uniform vec2 u_resolution;',
          'uniform float u_ratio;',
          'uniform float u_nodeRatio;',
          'uniform float u_arrowHead;',
          'uniform float u_scale;',
          'uniform mat3 u_matrix;',
          'uniform mat2 u_matrixHalfPi;',
          'uniform mat2 u_matrixHalfPiMinus;',

          'varying vec4 color;',

          'void main() {',
            // Find the good point:
            'vec2 pos = normalize(a_pos2 - a_pos1);',

            'mat2 matrix = (1.0 - a_head) *',
              '(',
                'a_minus * u_matrixHalfPiMinus +',
                '(1.0 - a_minus) * u_matrixHalfPi',
              ') + a_head * (',
                'a_headPosition * u_matrixHalfPiMinus * 0.6 +',
                '(a_headPosition * a_headPosition - 1.0) * mat2(1.0)',
              ');',

            'pos = a_pos1 + (',
              // Deal with body:
              '(1.0 - a_head) * a_thickness * u_ratio * matrix * pos +',
              // Deal with head:
              'a_head * u_arrowHead * a_thickness * u_ratio * matrix * pos +',
              // Deal with delay:
              'a_delay * pos * (',
                'a_tSize / u_nodeRatio +',
                'u_arrowHead * a_thickness * u_ratio',
              ')',
            ');',

            // Scale from [[-1 1] [-1 1]] to the container:
            'gl_Position = vec4(',
              '((u_matrix * vec3(pos, 1)).xy /',
                'u_resolution * 2.0 - 1.0) * vec2(1, -1),',
              '0,',
              '1',
            ');',

            // Extract the color:
            'float c = a_color;',
            'color.b = mod(c, 256.0); c = floor(c / 256.0);',
            'color.g = mod(c, 256.0); c = floor(c / 256.0);',
            'color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;',
            'color.a = 1.0;',
          '}'
        ].join('\n'),
        gl.VERTEX_SHADER
      );

      fragmentShader = sigma.utils.loadShader(
        gl,
        [
          'precision mediump float;',

          'varying vec4 color;',

          'void main(void) {',
            'gl_FragColor = color;',
          '}'
        ].join('\n'),
        gl.FRAGMENT_SHADER
      );

      program = sigma.utils.loadProgram(gl, [vertexShader, fragmentShader]);

      return program;
    }
  };
})();

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.canvas.labels');

  /**
   * This label renderer will just display the label on the right of the node.
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   */
  sigma.canvas.labels.def = function(node, context, settings) {
    var fontSize,
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'];

    if (size < settings('labelThreshold'))
      return;

    if (!node.label || typeof node.label !== 'string')
      return;

    fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
      settings('labelSizeRatio') * size;

    context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
      fontSize + 'px ' + settings('font');
    context.fillStyle = (settings('labelColor') === 'node') ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultLabelColor');

    context.fillText(
      node.label,
      Math.round(node[prefix + 'x'] + size + 3),
      Math.round(node[prefix + 'y'] + fontSize / 3)
    );
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.canvas.hovers');

  /**
   * This hover renderer will basically display the label with a background.
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   */
  sigma.canvas.hovers.def = function(node, context, settings) {
    var x,
        y,
        w,
        h,
        e,
        fontStyle = settings('hoverFontStyle') || settings('fontStyle'),
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'],
        fontSize = (settings('labelSize') === 'fixed') ?
          settings('defaultLabelSize') :
          settings('labelSizeRatio') * size;

    // Label background:
    context.font = (fontStyle ? fontStyle + ' ' : '') +
      fontSize + 'px ' + (settings('hoverFont') || settings('font'));

    context.beginPath();
    context.fillStyle = settings('labelHoverBGColor') === 'node' ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultHoverLabelBGColor');

    if (node.label && settings('labelHoverShadow')) {
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 8;
      context.shadowColor = settings('labelHoverShadowColor');
    }

    if (node.label && typeof node.label === 'string') {
      x = Math.round(node[prefix + 'x'] - fontSize / 2 - 2);
      y = Math.round(node[prefix + 'y'] - fontSize / 2 - 2);
      w = Math.round(
        context.measureText(node.label).width + fontSize / 2 + size + 7
      );
      h = Math.round(fontSize + 4);
      e = Math.round(fontSize / 2 + 2);

      context.moveTo(x, y + e);
      context.arcTo(x, y, x + e, y, e);
      context.lineTo(x + w, y);
      context.lineTo(x + w, y + h);
      context.lineTo(x + e, y + h);
      context.arcTo(x, y + h, x, y + h - e, e);
      context.lineTo(x, y + e);

      context.closePath();
      context.fill();

      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 0;
    }

    // Node border:
    if (settings('borderSize') > 0) {
      context.beginPath();
      context.fillStyle = settings('nodeBorderColor') === 'node' ?
        (node.color || settings('defaultNodeColor')) :
        settings('defaultNodeBorderColor');
      context.arc(
        node[prefix + 'x'],
        node[prefix + 'y'],
        size + settings('borderSize'),
        0,
        Math.PI * 2,
        true
      );
      context.closePath();
      context.fill();
    }

    // Node:
    var nodeRenderer = sigma.canvas.nodes[node.type] || sigma.canvas.nodes.def;
    nodeRenderer(node, context, settings);

    // Display the label:
    if (node.label && typeof node.label === 'string') {
      context.fillStyle = (settings('labelHoverColor') === 'node') ?
        (node.color || settings('defaultNodeColor')) :
        settings('defaultLabelHoverColor');

      context.fillText(
        node.label,
        Math.round(node[prefix + 'x'] + size + 3),
        Math.round(node[prefix + 'y'] + fontSize / 3)
      );
    }
  };
}).call(this);

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.nodes');

  /**
   * The default node renderer. It renders the node as a simple disc.
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   */
  sigma.canvas.nodes.def = function(node, context, settings) {
    var prefix = settings('prefix') || '';

    context.fillStyle = node.color || settings('defaultNodeColor');
    context.beginPath();
    context.arc(
      node[prefix + 'x'],
      node[prefix + 'y'],
      node[prefix + 'size'],
      0,
      Math.PI * 2,
      true
    );

    context.closePath();
    context.fill();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edges');

  /**
   * The default edge renderer. It renders the edge as a simple line.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edges.def = function(edge, source, target, context, settings) {
    var color = edge.color,
        prefix = settings('prefix') || '',
        size = edge[prefix + 'size'] || 1,
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor');

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(
      source[prefix + 'x'],
      source[prefix + 'y']
    );
    context.lineTo(
      target[prefix + 'x'],
      target[prefix + 'y']
    );
    context.stroke();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edges');

  /**
   * This edge renderer will display edges as arrows going from the source node
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edges.arrow = function(edge, source, target, context, settings) {
    var color = edge.color,
        prefix = settings('prefix') || '',
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor'),
        size = edge[prefix + 'size'] || 1,
        tSize = target[prefix + 'size'],
        sX = source[prefix + 'x'],
        sY = source[prefix + 'y'],
        tX = target[prefix + 'x'],
        tY = target[prefix + 'y'],
        aSize = Math.max(size * 2.5, settings('minArrowSize')),
        d = Math.sqrt(Math.pow(tX - sX, 2) + Math.pow(tY - sY, 2)),
        aX = sX + (tX - sX) * (d - aSize - tSize) / d,
        aY = sY + (tY - sY) * (d - aSize - tSize) / d,
        vX = (tX - sX) * aSize / d,
        vY = (tY - sY) * aSize / d;

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(sX, sY);
    context.lineTo(
      aX,
      aY
    );
    context.stroke();

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(aX + vX, aY + vY);
    context.lineTo(aX + vY * 0.6, aY - vX * 0.6);
    context.lineTo(aX - vY * 0.6, aY + vX * 0.6);
    context.lineTo(aX + vX, aY + vY);
    context.closePath();
    context.fill();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edgehovers');

  /**
   * This hover renderer will display the edge with a different color or size.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edgehovers.def =
    function(edge, source, target, context, settings) {
      var color = edge.color,
        prefix = settings('prefix') || '',
        size = edge[prefix + 'size'] || 1,
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor');

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    if (settings('edgeHoverColor') === 'edge') {
      color = edge.hover_color || color;
    } else {
      color = edge.hover_color || settings('defaultEdgeHoverColor') || color;
    }
    size *= settings('edgeHoverSizeRatio');

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(
      source[prefix + 'x'],
      source[prefix + 'y']
    );
    context.lineTo(
      target[prefix + 'x'],
      target[prefix + 'y']
    );
    context.stroke();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edgehovers');

  /**
   * This hover renderer will display the edge with a different color or size.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edgehovers.curve =
    function(edge, source, target, context, settings) {
    var color = edge.color,
        prefix = settings('prefix') || '',
        size = settings('edgeHoverSizeRatio') * (edge[prefix + 'size'] || 1),
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor'),
        cp = {},
        sSize = source[prefix + 'size'],
        sX = source[prefix + 'x'],
        sY = source[prefix + 'y'],
        tX = target[prefix + 'x'],
        tY = target[prefix + 'y'];

    cp = (source.id === target.id) ?
      sigma.utils.getSelfLoopControlPoints(sX, sY, sSize) :
      sigma.utils.getQuadraticControlPoint(sX, sY, tX, tY);

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    if (settings('edgeHoverColor') === 'edge') {
      color = edge.hover_color || color;
    } else {
      color = edge.hover_color || settings('defaultEdgeHoverColor') || color;
    }

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(sX, sY);
    if (source.id === target.id) {
      context.bezierCurveTo(cp.x1, cp.y1, cp.x2, cp.y2, tX, tY);
    } else {
      context.quadraticCurveTo(cp.x, cp.y, tX, tY);
    }
    context.stroke();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edgehovers');

  /**
   * This hover renderer will display the edge with a different color or size.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edgehovers.arrow =
    function(edge, source, target, context, settings) {
    var color = edge.color,
        prefix = settings('prefix') || '',
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor'),
        size = edge[prefix + 'size'] || 1,
        tSize = target[prefix + 'size'],
        sX = source[prefix + 'x'],
        sY = source[prefix + 'y'],
        tX = target[prefix + 'x'],
        tY = target[prefix + 'y'];

    size = (edge.hover) ?
      settings('edgeHoverSizeRatio') * size : size;
    var aSize = size * 2.5,
        d = Math.sqrt(Math.pow(tX - sX, 2) + Math.pow(tY - sY, 2)),
        aX = sX + (tX - sX) * (d - aSize - tSize) / d,
        aY = sY + (tY - sY) * (d - aSize - tSize) / d,
        vX = (tX - sX) * aSize / d,
        vY = (tY - sY) * aSize / d;

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    if (settings('edgeHoverColor') === 'edge') {
      color = edge.hover_color || color;
    } else {
      color = edge.hover_color || settings('defaultEdgeHoverColor') || color;
    }

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(sX, sY);
    context.lineTo(
      aX,
      aY
    );
    context.stroke();

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(aX + vX, aY + vY);
    context.lineTo(aX + vY * 0.6, aY - vX * 0.6);
    context.lineTo(aX - vY * 0.6, aY + vX * 0.6);
    context.lineTo(aX + vX, aY + vY);
    context.closePath();
    context.fill();
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edgehovers');

  /**
   * This hover renderer will display the edge with a different color or size.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edgehovers.curvedArrow =
    function(edge, source, target, context, settings) {
    var color = edge.color,
        prefix = settings('prefix') || '',
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor'),
        cp = {},
        size = settings('edgeHoverSizeRatio') * (edge[prefix + 'size'] || 1),
        tSize = target[prefix + 'size'],
        sX = source[prefix + 'x'],
        sY = source[prefix + 'y'],
        tX = target[prefix + 'x'],
        tY = target[prefix + 'y'],
        d,
        aSize,
        aX,
        aY,
        vX,
        vY;

    cp = (source.id === target.id) ?
      sigma.utils.getSelfLoopControlPoints(sX, sY, tSize) :
      sigma.utils.getQuadraticControlPoint(sX, sY, tX, tY);

    if (source.id === target.id) {
      d = Math.sqrt(Math.pow(tX - cp.x1, 2) + Math.pow(tY - cp.y1, 2));
      aSize = size * 2.5;
      aX = cp.x1 + (tX - cp.x1) * (d - aSize - tSize) / d;
      aY = cp.y1 + (tY - cp.y1) * (d - aSize - tSize) / d;
      vX = (tX - cp.x1) * aSize / d;
      vY = (tY - cp.y1) * aSize / d;
    }
    else {
      d = Math.sqrt(Math.pow(tX - cp.x, 2) + Math.pow(tY - cp.y, 2));
      aSize = size * 2.5;
      aX = cp.x + (tX - cp.x) * (d - aSize - tSize) / d;
      aY = cp.y + (tY - cp.y) * (d - aSize - tSize) / d;
      vX = (tX - cp.x) * aSize / d;
      vY = (tY - cp.y) * aSize / d;
    }

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    if (settings('edgeHoverColor') === 'edge') {
      color = edge.hover_color || color;
    } else {
      color = edge.hover_color || settings('defaultEdgeHoverColor') || color;
    }

    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(sX, sY);
    if (source.id === target.id) {
      context.bezierCurveTo(cp.x2, cp.y2, cp.x1, cp.y1, aX, aY);
    } else {
      context.quadraticCurveTo(cp.x, cp.y, aX, aY);
    }
    context.stroke();

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(aX + vX, aY + vY);
    context.lineTo(aX + vY * 0.6, aY - vX * 0.6);
    context.lineTo(aX - vY * 0.6, aY + vX * 0.6);
    context.lineTo(aX + vX, aY + vY);
    context.closePath();
    context.fill();
  };
})();

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.canvas.extremities');

  /**
   * The default renderer for hovered edge extremities. It renders the edge
   * extremities as hovered.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.extremities.def =
    function(edge, source, target, context, settings) {
    // Source Node:
    (
      sigma.canvas.hovers[source.type] ||
      sigma.canvas.hovers.def
    ) (
      source, context, settings
    );

    // Target Node:
    (
      sigma.canvas.hovers[target.type] ||
      sigma.canvas.hovers.def
    ) (
      target, context, settings
    );
  };
}).call(this);

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.svg.utils');

  /**
   * Some useful functions used by sigma's SVG renderer.
   */
  sigma.svg.utils = {

    /**
     * SVG Element show.
     *
     * @param  {DOMElement}               element   The DOM element to show.
     */
    show: function(element) {
      element.style.display = '';
      return this;
    },

    /**
     * SVG Element hide.
     *
     * @param  {DOMElement}               element   The DOM element to hide.
     */
    hide: function(element) {
      element.style.display = 'none';
      return this;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.svg.nodes');

  /**
   * The default node renderer. It renders the node as a simple disc.
   */
  sigma.svg.nodes.def = {

    /**
     * SVG Element creation.
     *
     * @param  {object}                   node     The node object.
     * @param  {configurable}             settings The settings function.
     */
    create: function(node, settings) {
      var prefix = settings('prefix') || '',
          circle = document.createElementNS(settings('xmlns'), 'circle');

      // Defining the node's circle
      circle.setAttributeNS(null, 'data-node-id', node.id);
      circle.setAttributeNS(null, 'class', settings('classPrefix') + '-node');
      circle.setAttributeNS(
        null, 'fill', node.color || settings('defaultNodeColor'));

      // Returning the DOM Element
      return circle;
    },

    /**
     * SVG Element update.
     *
     * @param  {object}                   node     The node object.
     * @param  {DOMElement}               circle   The node DOM element.
     * @param  {configurable}             settings The settings function.
     */
    update: function(node, circle, settings) {
      var prefix = settings('prefix') || '';

      // Applying changes
      // TODO: optimize - check if necessary
      circle.setAttributeNS(null, 'cx', node[prefix + 'x']);
      circle.setAttributeNS(null, 'cy', node[prefix + 'y']);
      circle.setAttributeNS(null, 'r', node[prefix + 'size']);

      // Updating only if not freestyle
      if (!settings('freeStyle'))
        circle.setAttributeNS(
          null, 'fill', node.color || settings('defaultNodeColor'));

      // Showing
      circle.style.display = '';

      return this;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.svg.edges');

  /**
   * The default edge renderer. It renders the node as a simple line.
   */
  sigma.svg.edges.def = {

    /**
     * SVG Element creation.
     *
     * @param  {object}                   edge       The edge object.
     * @param  {object}                   source     The source node object.
     * @param  {object}                   target     The target node object.
     * @param  {configurable}             settings   The settings function.
     */
    create: function(edge, source, target, settings) {
      var color = edge.color,
          prefix = settings('prefix') || '',
          edgeColor = settings('edgeColor'),
          defaultNodeColor = settings('defaultNodeColor'),
          defaultEdgeColor = settings('defaultEdgeColor');

      if (!color)
        switch (edgeColor) {
          case 'source':
            color = source.color || defaultNodeColor;
            break;
          case 'target':
            color = target.color || defaultNodeColor;
            break;
          default:
            color = defaultEdgeColor;
            break;
        }

      var line = document.createElementNS(settings('xmlns'), 'line');

      // Attributes
      line.setAttributeNS(null, 'data-edge-id', edge.id);
      line.setAttributeNS(null, 'class', settings('classPrefix') + '-edge');
      line.setAttributeNS(null, 'stroke', color);

      return line;
    },

    /**
     * SVG Element update.
     *
     * @param  {object}                   edge       The edge object.
     * @param  {DOMElement}               line       The line DOM Element.
     * @param  {object}                   source     The source node object.
     * @param  {object}                   target     The target node object.
     * @param  {configurable}             settings   The settings function.
     */
    update: function(edge, line, source, target, settings) {
      var prefix = settings('prefix') || '';

      line.setAttributeNS(null, 'stroke-width', edge[prefix + 'size'] || 1);
      line.setAttributeNS(null, 'x1', source[prefix + 'x']);
      line.setAttributeNS(null, 'y1', source[prefix + 'y']);
      line.setAttributeNS(null, 'x2', target[prefix + 'x']);
      line.setAttributeNS(null, 'y2', target[prefix + 'y']);

      // Showing
      line.style.display = '';

      return this;
    }
  };
})();

;(function() {
  'use strict';

  sigma.utils.pkg('sigma.svg.edges');

  /**
   * The curve edge renderer. It renders the node as a bezier curve.
   */
  sigma.svg.edges.curve = {

    /**
     * SVG Element creation.
     *
     * @param  {object}                   edge       The edge object.
     * @param  {object}                   source     The source node object.
     * @param  {object}                   target     The target node object.
     * @param  {configurable}             settings   The settings function.
     */
    create: function(edge, source, target, settings) {
      var color = edge.color,
          prefix = settings('prefix') || '',
          edgeColor = settings('edgeColor'),
          defaultNodeColor = settings('defaultNodeColor'),
          defaultEdgeColor = settings('defaultEdgeColor');

      if (!color)
        switch (edgeColor) {
          case 'source':
            color = source.color || defaultNodeColor;
            break;
          case 'target':
            color = target.color || defaultNodeColor;
            break;
          default:
            color = defaultEdgeColor;
            break;
        }

      var path = document.createElementNS(settings('xmlns'), 'path');

      // Attributes
      path.setAttributeNS(null, 'data-edge-id', edge.id);
      path.setAttributeNS(null, 'class', settings('classPrefix') + '-edge');
      path.setAttributeNS(null, 'stroke', color);

      return path;
    },

    /**
     * SVG Element update.
     *
     * @param  {object}                   edge       The edge object.
     * @param  {DOMElement}               line       The line DOM Element.
     * @param  {object}                   source     The source node object.
     * @param  {object}                   target     The target node object.
     * @param  {configurable}             settings   The settings function.
     */
    update: function(edge, path, source, target, settings) {
      var prefix = settings('prefix') || '';

      path.setAttributeNS(null, 'stroke-width', edge[prefix + 'size'] || 1);

      // Control point
      var cx = (source[prefix + 'x'] + target[prefix + 'x']) / 2 +
        (target[prefix + 'y'] - source[prefix + 'y']) / 4,
          cy = (source[prefix + 'y'] + target[prefix + 'y']) / 2 +
        (source[prefix + 'x'] - target[prefix + 'x']) / 4;

      // Path
      var p = 'M' + source[prefix + 'x'] + ',' + source[prefix + 'y'] + ' ' +
              'Q' + cx + ',' + cy + ' ' +
              target[prefix + 'x'] + ',' + target[prefix + 'y'];

      // Updating attributes
      path.setAttributeNS(null, 'd', p);
      path.setAttributeNS(null, 'fill', 'none');

      // Showing
      path.style.display = '';

      return this;
    }
  };
})();

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.svg.labels');

  /**
   * The default label renderer. It renders the label as a simple text.
   */
  sigma.svg.labels.def = {

    /**
     * SVG Element creation.
     *
     * @param  {object}                   node       The node object.
     * @param  {configurable}             settings   The settings function.
     */
    create: function(node, settings) {
      var prefix = settings('prefix') || '',
          size = node[prefix + 'size'],
          text = document.createElementNS(settings('xmlns'), 'text');

      var fontSize = (settings('labelSize') === 'fixed') ?
        settings('defaultLabelSize') :
        settings('labelSizeRatio') * size;

      var fontColor = (settings('labelColor') === 'node') ?
        (node.color || settings('defaultNodeColor')) :
        settings('defaultLabelColor');

      text.setAttributeNS(null, 'data-label-target', node.id);
      text.setAttributeNS(null, 'class', settings('classPrefix') + '-label');
      text.setAttributeNS(null, 'font-size', fontSize);
      text.setAttributeNS(null, 'font-family', settings('font'));
      text.setAttributeNS(null, 'fill', fontColor);

      text.innerHTML = node.label;
      text.textContent = node.label;

      return text;
    },

    /**
     * SVG Element update.
     *
     * @param  {object}                   node     The node object.
     * @param  {DOMElement}               text     The label DOM element.
     * @param  {configurable}             settings The settings function.
     */
    update: function(node, text, settings) {
      var prefix = settings('prefix') || '',
          size = node[prefix + 'size'];

      var fontSize = (settings('labelSize') === 'fixed') ?
        settings('defaultLabelSize') :
        settings('labelSizeRatio') * size;

      // Case when we don't want to display the label
      if (!settings('forceLabels') && size < settings('labelThreshold'))
        return;

      if (typeof node.label !== 'string')
        return;

      // Updating
      text.setAttributeNS(null, 'x',
        Math.round(node[prefix + 'x'] + size + 3));
      text.setAttributeNS(null, 'y',
        Math.round(node[prefix + 'y'] + fontSize / 3));

      // Showing
      text.style.display = '';

      return this;
    }
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.svg.hovers');

  /**
   * The default hover renderer.
   */
  sigma.svg.hovers.def = {

    /**
     * SVG Element creation.
     *
     * @param  {object}           node               The node object.
     * @param  {CanvasElement}    measurementCanvas  A fake canvas handled by
     *                            the svg to perform some measurements and
     *                            passed by the renderer.
     * @param  {DOMElement}       nodeCircle         The node DOM Element.
     * @param  {configurable}     settings           The settings function.
     */
    create: function(node, nodeCircle, measurementCanvas, settings) {

      // Defining visual properties
      var x,
          y,
          w,
          h,
          e,
          d,
          fontStyle = settings('hoverFontStyle') || settings('fontStyle'),
          prefix = settings('prefix') || '',
          size = node[prefix + 'size'],
          fontSize = (settings('labelSize') === 'fixed') ?
            settings('defaultLabelSize') :
            settings('labelSizeRatio') * size,
          fontColor = (settings('labelHoverColor') === 'node') ?
                        (node.color || settings('defaultNodeColor')) :
                        settings('defaultLabelHoverColor');

      // Creating elements
      var group = document.createElementNS(settings('xmlns'), 'g'),
          rectangle = document.createElementNS(settings('xmlns'), 'rect'),
          circle = document.createElementNS(settings('xmlns'), 'circle'),
          text = document.createElementNS(settings('xmlns'), 'text');

      // Defining properties
      group.setAttributeNS(null, 'class', settings('classPrefix') + '-hover');
      group.setAttributeNS(null, 'data-node-id', node.id);

      if (typeof node.label === 'string') {

        // Text
        text.innerHTML = node.label;
        text.textContent = node.label;
        text.setAttributeNS(
            null,
            'class',
            settings('classPrefix') + '-hover-label');
        text.setAttributeNS(null, 'font-size', fontSize);
        text.setAttributeNS(null, 'font-family', settings('font'));
        text.setAttributeNS(null, 'fill', fontColor);
        text.setAttributeNS(null, 'x',
          Math.round(node[prefix + 'x'] + size + 3));
        text.setAttributeNS(null, 'y',
          Math.round(node[prefix + 'y'] + fontSize / 3));

        // Measures
        // OPTIMIZE: Find a better way than a measurement canvas
        x = Math.round(node[prefix + 'x'] - fontSize / 2 - 2);
        y = Math.round(node[prefix + 'y'] - fontSize / 2 - 2);
        w = Math.round(
          measurementCanvas.measureText(node.label).width +
            fontSize / 2 + size + 9
        );
        h = Math.round(fontSize + 4);
        e = Math.round(fontSize / 2 + 2);

        // Circle
        circle.setAttributeNS(
            null,
            'class',
            settings('classPrefix') + '-hover-area');
        circle.setAttributeNS(null, 'fill', '#fff');
        circle.setAttributeNS(null, 'cx', node[prefix + 'x']);
        circle.setAttributeNS(null, 'cy', node[prefix + 'y']);
        circle.setAttributeNS(null, 'r', e);

        // Rectangle
        rectangle.setAttributeNS(
            null,
            'class',
            settings('classPrefix') + '-hover-area');
        rectangle.setAttributeNS(null, 'fill', '#fff');
        rectangle.setAttributeNS(null, 'x', node[prefix + 'x'] + e / 4);
        rectangle.setAttributeNS(null, 'y', node[prefix + 'y'] - e);
        rectangle.setAttributeNS(null, 'width', w);
        rectangle.setAttributeNS(null, 'height', h);
      }

      // Appending childs
      group.appendChild(circle);
      group.appendChild(rectangle);
      group.appendChild(text);
      group.appendChild(nodeCircle);

      return group;
    }
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.middlewares');
  sigma.utils.pkg('sigma.utils');

  /**
   * This middleware will rescale the graph such that it takes an optimal space
   * on the renderer.
   *
   * As each middleware, this function is executed in the scope of the sigma
   * instance.
   *
   * @param {?string} readPrefix  The read prefix.
   * @param {?string} writePrefix The write prefix.
   * @param {object}  options     The parameters.
   */
  sigma.middlewares.rescale = function(readPrefix, writePrefix, options) {
    var i,
        l,
        a,
        b,
        c,
        d,
        scale,
        margin,
        n = this.graph.nodes(),
        e = this.graph.edges(),
        settings = this.settings.embedObjects(options || {}),
        bounds = settings('bounds') || sigma.utils.getBoundaries(
          this.graph,
          readPrefix,
          true
        ),
        minX = bounds.minX,
        minY = bounds.minY,
        maxX = bounds.maxX,
        maxY = bounds.maxY,
        sizeMax = bounds.sizeMax,
        weightMax = bounds.weightMax,
        w = settings('width') || 1,
        h = settings('height') || 1,
        rescaleSettings = settings('autoRescale'),
        validSettings = {
          nodePosition: 1,
          nodeSize: 1,
          edgeSize: 1
        };

    /**
     * What elements should we rescale?
     */
    if (!(rescaleSettings instanceof Array))
      rescaleSettings = ['nodePosition', 'nodeSize', 'edgeSize'];

    for (i = 0, l = rescaleSettings.length; i < l; i++)
      if (!validSettings[rescaleSettings[i]])
        throw new Error(
          'The rescale setting "' + rescaleSettings[i] + '" is not recognized.'
        );

    var np = ~rescaleSettings.indexOf('nodePosition'),
        ns = ~rescaleSettings.indexOf('nodeSize'),
        es = ~rescaleSettings.indexOf('edgeSize');

    /**
     * First, we compute the scaling ratio, without considering the sizes
     * of the nodes : Each node will have its center in the canvas, but might
     * be partially out of it.
     */
    scale = settings('scalingMode') === 'outside' ?
      Math.max(
        w / Math.max(maxX - minX, 1),
        h / Math.max(maxY - minY, 1)
      ) :
      Math.min(
        w / Math.max(maxX - minX, 1),
        h / Math.max(maxY - minY, 1)
      );

    /**
     * Then, we correct that scaling ratio considering a margin, which is
     * basically the size of the biggest node.
     * This has to be done as a correction since to compare the size of the
     * biggest node to the X and Y values, we have to first get an
     * approximation of the scaling ratio.
     **/
    margin =
      (
        settings('rescaleIgnoreSize') ?
          0 :
          (settings('maxNodeSize') || sizeMax) / scale
      ) +
      (settings('sideMargin') || 0);
    maxX += margin;
    minX -= margin;
    maxY += margin;
    minY -= margin;

    // Fix the scaling with the new extrema:
    scale = settings('scalingMode') === 'outside' ?
      Math.max(
        w / Math.max(maxX - minX, 1),
        h / Math.max(maxY - minY, 1)
      ) :
      Math.min(
        w / Math.max(maxX - minX, 1),
        h / Math.max(maxY - minY, 1)
      );

    // Size homothetic parameters:
    if (!settings('maxNodeSize') && !settings('minNodeSize')) {
      a = 1;
      b = 0;
    } else if (settings('maxNodeSize') === settings('minNodeSize')) {
      a = 0;
      b = +settings('maxNodeSize');
    } else {
      a = (settings('maxNodeSize') - settings('minNodeSize')) / sizeMax;
      b = +settings('minNodeSize');
    }

    if (!settings('maxEdgeSize') && !settings('minEdgeSize')) {
      c = 1;
      d = 0;
    } else if (settings('maxEdgeSize') === settings('minEdgeSize')) {
      c = 0;
      d = +settings('minEdgeSize');
    } else {
      c = (settings('maxEdgeSize') - settings('minEdgeSize')) / weightMax;
      d = +settings('minEdgeSize');
    }

    // Rescale the nodes and edges:
    for (i = 0, l = e.length; i < l; i++)
      e[i][writePrefix + 'size'] =
        e[i][readPrefix + 'size'] * (es ? c : 1) + (es ? d : 0);

    for (i = 0, l = n.length; i < l; i++) {
      n[i][writePrefix + 'size'] =
        n[i][readPrefix + 'size'] * (ns ? a : 1) + (ns ? b : 0);
      n[i][writePrefix + 'x'] =
        (n[i][readPrefix + 'x'] - (maxX + minX) / 2) * (np ? scale : 1);
      n[i][writePrefix + 'y'] =
        (n[i][readPrefix + 'y'] - (maxY + minY) / 2) * (np ? scale : 1);
    }
  };

  sigma.utils.getBoundaries = function(graph, prefix, doEdges) {
    var i,
        l,
        e = graph.edges(),
        n = graph.nodes(),
        weightMax = -Infinity,
        sizeMax = -Infinity,
        minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

    if (doEdges)
      for (i = 0, l = e.length; i < l; i++)
        weightMax = Math.max(e[i][prefix + 'size'], weightMax);

    for (i = 0, l = n.length; i < l; i++) {
      sizeMax = Math.max(n[i][prefix + 'size'], sizeMax);
      maxX = Math.max(n[i][prefix + 'x'], maxX);
      minX = Math.min(n[i][prefix + 'x'], minX);
      maxY = Math.max(n[i][prefix + 'y'], maxY);
      minY = Math.min(n[i][prefix + 'y'], minY);
    }

    weightMax = weightMax || 1;
    sizeMax = sizeMax || 1;

    return {
      weightMax: weightMax,
      sizeMax: sizeMax,
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY
    };
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.middlewares');

  /**
   * This middleware will just copy the graphic properties.
   *
   * @param {?string} readPrefix  The read prefix.
   * @param {?string} writePrefix The write prefix.
   */
  sigma.middlewares.copy = function(readPrefix, writePrefix) {
    var i,
        l,
        a;

    if (writePrefix + '' === readPrefix + '')
      return;

    a = this.graph.nodes();
    for (i = 0, l = a.length; i < l; i++) {
      a[i][writePrefix + 'x'] = a[i][readPrefix + 'x'];
      a[i][writePrefix + 'y'] = a[i][readPrefix + 'y'];
      a[i][writePrefix + 'size'] = a[i][readPrefix + 'size'];
    }

    a = this.graph.edges();
    for (i = 0, l = a.length; i < l; i++)
      a[i][writePrefix + 'size'] = a[i][readPrefix + 'size'];
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.misc.animation.running');

  /**
   * Generates a unique ID for the animation.
   *
   * @return {string} Returns the new ID.
   */
  var _getID = (function() {
    var id = 0;
    return function() {
      return '' + (++id);
    };
  })();

  /**
   * This function animates a camera. It has to be called with the camera to
   * animate, the values of the coordinates to reach and eventually some
   * options. It returns a number id, that you can use to kill the animation,
   * with the method sigma.misc.animation.kill(id).
   *
   * The available options are:
   *
   *   {?number}            duration   The duration of the animation.
   *   {?function}          onNewFrame A callback to execute when the animation
   *                                   enter a new frame.
   *   {?function}          onComplete A callback to execute when the animation
   *                                   is completed or killed.
   *   {?(string|function)} easing     The name of a function from the package
   *                                   sigma.utils.easings, or a custom easing
   *                                   function.
   *
   * @param  {camera}  camera  The camera to animate.
   * @param  {object}  target  The coordinates to reach.
   * @param  {?object} options Eventually an object to specify some options to
   *                           the function. The available options are
   *                           presented in the description of the function.
   * @return {number}          The animation id, to make it easy to kill
   *                           through the method "sigma.misc.animation.kill".
   */
  sigma.misc.animation.camera = function(camera, val, options) {
    if (
      !(camera instanceof sigma.classes.camera) ||
      typeof val !== 'object' ||
      !val
    )
      throw 'animation.camera: Wrong arguments.';

    if (
      typeof val.x !== 'number' &&
      typeof val.y !== 'number' &&
      typeof val.ratio !== 'number' &&
      typeof val.angle !== 'number'
    )
      throw 'There must be at least one valid coordinate in the given val.';

    var fn,
        id,
        anim,
        easing,
        duration,
        initialVal,
        o = options || {},
        start = sigma.utils.dateNow();

    // Store initial values:
    initialVal = {
      x: camera.x,
      y: camera.y,
      ratio: camera.ratio,
      angle: camera.angle
    };

    duration = o.duration;
    easing = typeof o.easing !== 'function' ?
      sigma.utils.easings[o.easing || 'quadraticInOut'] :
      o.easing;

    fn = function() {
      var coef,
          t = o.duration ? (sigma.utils.dateNow() - start) / o.duration : 1;

      // If the animation is over:
      if (t >= 1) {
        camera.isAnimated = false;
        camera.goTo({
          x: val.x !== undefined ? val.x : initialVal.x,
          y: val.y !== undefined ? val.y : initialVal.y,
          ratio: val.ratio !== undefined ? val.ratio : initialVal.ratio,
          angle: val.angle !== undefined ? val.angle : initialVal.angle
        });

        cancelAnimationFrame(id);
        delete sigma.misc.animation.running[id];

        // Check callbacks:
        if (typeof o.onComplete === 'function')
          o.onComplete();

      // Else, let's keep going:
      } else {
        coef = easing(t);
        camera.isAnimated = true;
        camera.goTo({
          x: val.x !== undefined ?
            initialVal.x + (val.x - initialVal.x) * coef :
            initialVal.x,
          y: val.y !== undefined ?
            initialVal.y + (val.y - initialVal.y) * coef :
            initialVal.y,
          ratio: val.ratio !== undefined ?
            initialVal.ratio + (val.ratio - initialVal.ratio) * coef :
            initialVal.ratio,
          angle: val.angle !== undefined ?
            initialVal.angle + (val.angle - initialVal.angle) * coef :
            initialVal.angle
        });

        // Check callbacks:
        if (typeof o.onNewFrame === 'function')
          o.onNewFrame();

        anim.frameId = requestAnimationFrame(fn);
      }
    };

    id = _getID();
    anim = {
      frameId: requestAnimationFrame(fn),
      target: camera,
      type: 'camera',
      options: o,
      fn: fn
    };
    sigma.misc.animation.running[id] = anim;

    return id;
  };

  /**
   * Kills a running animation. It triggers the eventual onComplete callback.
   *
   * @param  {number} id  The id of the animation to kill.
   * @return {object}     Returns the sigma.misc.animation package.
   */
  sigma.misc.animation.kill = function(id) {
    if (arguments.length !== 1 || typeof id !== 'number')
      throw 'animation.kill: Wrong arguments.';

    var o = sigma.misc.animation.running[id];

    if (o) {
      cancelAnimationFrame(id);
      delete sigma.misc.animation.running[o.frameId];

      if (o.type === 'camera')
        o.target.isAnimated = false;

      // Check callbacks:
      if (typeof (o.options || {}).onComplete === 'function')
        o.options.onComplete();
    }

    return this;
  };

  /**
   * Kills every running animations, or only the one with the specified type,
   * if a string parameter is given.
   *
   * @param  {?(string|object)} filter A string to filter the animations to kill
   *                                   on their type (example: "camera"), or an
   *                                   object to filter on their target.
   * @return {number}                  Returns the number of animations killed
   *                                   that way.
   */
  sigma.misc.animation.killAll = function(filter) {
    var o,
        id,
        count = 0,
        type = typeof filter === 'string' ? filter : null,
        target = typeof filter === 'object' ? filter : null,
        running = sigma.misc.animation.running;

    for (id in running)
      if (
        (!type || running[id].type === type) &&
        (!target || running[id].target === target)
      ) {
        o = sigma.misc.animation.running[id];
        cancelAnimationFrame(o.frameId);
        delete sigma.misc.animation.running[id];

        if (o.type === 'camera')
          o.target.isAnimated = false;

        // Increment counter:
        count++;

        // Check callbacks:
        if (typeof (o.options || {}).onComplete === 'function')
          o.options.onComplete();
      }

    return count;
  };

  /**
   * Returns "true" if any animation that is currently still running matches
   * the filter given to the function.
   *
   * @param  {string|object} filter A string to filter the animations to kill
   *                                on their type (example: "camera"), or an
   *                                object to filter on their target.
   * @return {boolean}              Returns true if any running animation
   *                                matches.
   */
  sigma.misc.animation.has = function(filter) {
    var id,
        type = typeof filter === 'string' ? filter : null,
        target = typeof filter === 'object' ? filter : null,
        running = sigma.misc.animation.running;

    for (id in running)
      if (
        (!type || running[id].type === type) &&
        (!target || running[id].target === target)
      )
        return true;

    return false;
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.misc');

  /**
   * This helper will bind any no-DOM renderer (for instance canvas or WebGL)
   * to its captors, to properly dispatch the good events to the sigma instance
   * to manage clicking, hovering etc...
   *
   * It has to be called in the scope of the related renderer.
   */
  sigma.misc.bindEvents = function(prefix) {
    var i,
        l,
        mX,
        mY,
        captor,
        self = this;

    function getNodes(e) {
      if (e) {
        mX = 'x' in e.data ? e.data.x : mX;
        mY = 'y' in e.data ? e.data.y : mY;
      }

      var i,
          j,
          l,
          n,
          x,
          y,
          s,
          inserted,
          selected = [],
          modifiedX = mX + self.width / 2,
          modifiedY = mY + self.height / 2,
          point = self.camera.cameraPosition(
            mX,
            mY
          ),
          nodes = self.camera.quadtree.point(
            point.x,
            point.y
          );

      if (nodes.length)
        for (i = 0, l = nodes.length; i < l; i++) {
          n = nodes[i];
          x = n[prefix + 'x'];
          y = n[prefix + 'y'];
          s = n[prefix + 'size'];

          if (
            !n.hidden &&
            modifiedX > x - s &&
            modifiedX < x + s &&
            modifiedY > y - s &&
            modifiedY < y + s &&
            Math.sqrt(
              Math.pow(modifiedX - x, 2) +
              Math.pow(modifiedY - y, 2)
            ) < s
          ) {
            // Insert the node:
            inserted = false;

            for (j = 0; j < selected.length; j++)
              if (n.size > selected[j].size) {
                selected.splice(j, 0, n);
                inserted = true;
                break;
              }

            if (!inserted)
              selected.push(n);
          }
        }

      return selected;
    }


    function getEdges(e) {
      if (!self.settings('enableEdgeHovering')) {
        // No event if the setting is off:
        return [];
      }

      var isCanvas = (
        sigma.renderers.canvas && self instanceof sigma.renderers.canvas);

      if (!isCanvas) {
        // A quick hardcoded rule to prevent people from using this feature
        // with the WebGL renderer (which is not good enough at the moment):
        throw new Error(
          'The edge events feature is not compatible with the WebGL renderer'
        );
      }

      if (e) {
        mX = 'x' in e.data ? e.data.x : mX;
        mY = 'y' in e.data ? e.data.y : mY;
      }

      var i,
          j,
          l,
          a,
          edge,
          s,
          maxEpsilon = self.settings('edgeHoverPrecision'),
          source,
          target,
          cp,
          nodeIndex = {},
          inserted,
          selected = [],
          modifiedX = mX + self.width / 2,
          modifiedY = mY + self.height / 2,
          point = self.camera.cameraPosition(
            mX,
            mY
          ),
          edges = [];

      if (isCanvas) {
        var nodesOnScreen = self.camera.quadtree.area(
          self.camera.getRectangle(self.width, self.height)
        );
        for (a = nodesOnScreen, i = 0, l = a.length; i < l; i++)
          nodeIndex[a[i].id] = a[i];
      }

      if (self.camera.edgequadtree !== undefined) {
        edges = self.camera.edgequadtree.point(
          point.x,
          point.y
        );
      }

      function insertEdge(selected, edge) {
        inserted = false;

        for (j = 0; j < selected.length; j++)
          if (edge.size > selected[j].size) {
            selected.splice(j, 0, edge);
            inserted = true;
            break;
          }

        if (!inserted)
          selected.push(edge);
      }

      if (edges.length)
        for (i = 0, l = edges.length; i < l; i++) {
          edge = edges[i];
          source = self.graph.nodes(edge.source);
          target = self.graph.nodes(edge.target);
          // (HACK) we can't get edge[prefix + 'size'] on WebGL renderer:
          s = edge[prefix + 'size'] ||
              edge['read_' + prefix + 'size'];

          // First, let's identify which edges are drawn. To do this, we keep
          // every edges that have at least one extremity displayed according to
          // the quadtree and the "hidden" attribute. We also do not keep hidden
          // edges.
          // Then, let's check if the mouse is on the edge (we suppose that it
          // is a line segment).

          if (
            !edge.hidden &&
            !source.hidden && !target.hidden &&
            (!isCanvas ||
              (nodeIndex[edge.source] || nodeIndex[edge.target])) &&
            sigma.utils.getDistance(
              source[prefix + 'x'],
              source[prefix + 'y'],
              modifiedX,
              modifiedY) > source[prefix + 'size'] &&
            sigma.utils.getDistance(
              target[prefix + 'x'],
              target[prefix + 'y'],
              modifiedX,
              modifiedY) > target[prefix + 'size']
          ) {
            if (edge.type == 'curve' || edge.type == 'curvedArrow') {
              if (source.id === target.id) {
                cp = sigma.utils.getSelfLoopControlPoints(
                  source[prefix + 'x'],
                  source[prefix + 'y'],
                  source[prefix + 'size']
                );
                if (
                  sigma.utils.isPointOnBezierCurve(
                  modifiedX,
                  modifiedY,
                  source[prefix + 'x'],
                  source[prefix + 'y'],
                  target[prefix + 'x'],
                  target[prefix + 'y'],
                  cp.x1,
                  cp.y1,
                  cp.x2,
                  cp.y2,
                  Math.max(s, maxEpsilon)
                )) {
                  insertEdge(selected, edge);
                }
              }
              else {
                cp = sigma.utils.getQuadraticControlPoint(
                  source[prefix + 'x'],
                  source[prefix + 'y'],
                  target[prefix + 'x'],
                  target[prefix + 'y']);
                if (
                  sigma.utils.isPointOnQuadraticCurve(
                  modifiedX,
                  modifiedY,
                  source[prefix + 'x'],
                  source[prefix + 'y'],
                  target[prefix + 'x'],
                  target[prefix + 'y'],
                  cp.x,
                  cp.y,
                  Math.max(s, maxEpsilon)
                )) {
                  insertEdge(selected, edge);
                }
              }
            } else if (
                sigma.utils.isPointOnSegment(
                modifiedX,
                modifiedY,
                source[prefix + 'x'],
                source[prefix + 'y'],
                target[prefix + 'x'],
                target[prefix + 'y'],
                Math.max(s, maxEpsilon)
              )) {
              insertEdge(selected, edge);
            }
          }
        }

      return selected;
    }


    function bindCaptor(captor) {
      var nodes,
          edges,
          overNodes = {},
          overEdges = {};

      function onClick(e) {
        if (!self.settings('eventsEnabled'))
          return;

        self.dispatchEvent('click', e.data);

        nodes = getNodes(e);
        edges = getEdges(e);

        if (nodes.length) {
          self.dispatchEvent('clickNode', {
            node: nodes[0],
            captor: e.data
          });
          self.dispatchEvent('clickNodes', {
            node: nodes,
            captor: e.data
          });
        } else if (edges.length) {
          self.dispatchEvent('clickEdge', {
            edge: edges[0],
            captor: e.data
          });
          self.dispatchEvent('clickEdges', {
            edge: edges,
            captor: e.data
          });
        } else
          self.dispatchEvent('clickStage', {captor: e.data});
      }

      function onDoubleClick(e) {
        if (!self.settings('eventsEnabled'))
          return;

        self.dispatchEvent('doubleClick', e.data);

        nodes = getNodes(e);
        edges = getEdges(e);

        if (nodes.length) {
          self.dispatchEvent('doubleClickNode', {
            node: nodes[0],
            captor: e.data
          });
          self.dispatchEvent('doubleClickNodes', {
            node: nodes,
            captor: e.data
          });
        } else if (edges.length) {
          self.dispatchEvent('doubleClickEdge', {
            edge: edges[0],
            captor: e.data
          });
          self.dispatchEvent('doubleClickEdges', {
            edge: edges,
            captor: e.data
          });
        } else
          self.dispatchEvent('doubleClickStage', {captor: e.data});
      }

      function onRightClick(e) {
        if (!self.settings('eventsEnabled'))
          return;

        self.dispatchEvent('rightClick', e.data);

        nodes = getNodes(e);
        edges = getEdges(e);

        if (nodes.length) {
          self.dispatchEvent('rightClickNode', {
            node: nodes[0],
            captor: e.data
          });
          self.dispatchEvent('rightClickNodes', {
            node: nodes,
            captor: e.data
          });
        } else if (edges.length) {
          self.dispatchEvent('rightClickEdge', {
            edge: edges[0],
            captor: e.data
          });
          self.dispatchEvent('rightClickEdges', {
            edge: edges,
            captor: e.data
          });
        } else
          self.dispatchEvent('rightClickStage', {captor: e.data});
      }

      function onOut(e) {
        if (!self.settings('eventsEnabled'))
          return;

        var k,
            i,
            l,
            le,
            outNodes = [],
            outEdges = [];

        for (k in overNodes)
          outNodes.push(overNodes[k]);

        overNodes = {};
        // Dispatch both single and multi events:
        for (i = 0, l = outNodes.length; i < l; i++)
          self.dispatchEvent('outNode', {
            node: outNodes[i],
            captor: e.data
          });
        if (outNodes.length)
          self.dispatchEvent('outNodes', {
            nodes: outNodes,
            captor: e.data
          });

        overEdges = {};
        // Dispatch both single and multi events:
        for (i = 0, le = outEdges.length; i < le; i++)
          self.dispatchEvent('outEdge', {
            edge: outEdges[i],
            captor: e.data
          });
        if (outEdges.length)
          self.dispatchEvent('outEdges', {
            edges: outEdges,
            captor: e.data
          });
      }

      function onMove(e) {
        if (!self.settings('eventsEnabled'))
          return;

        nodes = getNodes(e);
        edges = getEdges(e);

        var i,
            k,
            node,
            edge,
            newOutNodes = [],
            newOverNodes = [],
            currentOverNodes = {},
            l = nodes.length,
            newOutEdges = [],
            newOverEdges = [],
            currentOverEdges = {},
            le = edges.length;

        // Check newly overred nodes:
        for (i = 0; i < l; i++) {
          node = nodes[i];
          currentOverNodes[node.id] = node;
          if (!overNodes[node.id]) {
            newOverNodes.push(node);
            overNodes[node.id] = node;
          }
        }

        // Check no more overred nodes:
        for (k in overNodes)
          if (!currentOverNodes[k]) {
            newOutNodes.push(overNodes[k]);
            delete overNodes[k];
          }

        // Dispatch both single and multi events:
        for (i = 0, l = newOverNodes.length; i < l; i++)
          self.dispatchEvent('overNode', {
            node: newOverNodes[i],
            captor: e.data
          });
        for (i = 0, l = newOutNodes.length; i < l; i++)
          self.dispatchEvent('outNode', {
            node: newOutNodes[i],
            captor: e.data
          });
        if (newOverNodes.length)
          self.dispatchEvent('overNodes', {
            nodes: newOverNodes,
            captor: e.data
          });
        if (newOutNodes.length)
          self.dispatchEvent('outNodes', {
            nodes: newOutNodes,
            captor: e.data
          });

        // Check newly overred edges:
        for (i = 0; i < le; i++) {
          edge = edges[i];
          currentOverEdges[edge.id] = edge;
          if (!overEdges[edge.id]) {
            newOverEdges.push(edge);
            overEdges[edge.id] = edge;
          }
        }

        // Check no more overred edges:
        for (k in overEdges)
          if (!currentOverEdges[k]) {
            newOutEdges.push(overEdges[k]);
            delete overEdges[k];
          }

        // Dispatch both single and multi events:
        for (i = 0, le = newOverEdges.length; i < le; i++)
          self.dispatchEvent('overEdge', {
            edge: newOverEdges[i],
            captor: e.data
          });
        for (i = 0, le = newOutEdges.length; i < le; i++)
          self.dispatchEvent('outEdge', {
            edge: newOutEdges[i],
            captor: e.data
          });
        if (newOverEdges.length)
          self.dispatchEvent('overEdges', {
            edges: newOverEdges,
            captor: e.data
          });
        if (newOutEdges.length)
          self.dispatchEvent('outEdges', {
            edges: newOutEdges,
            captor: e.data
          });
      }

      // Bind events:
      captor.bind('click', onClick);
      captor.bind('mousedown', onMove);
      captor.bind('mouseup', onMove);
      captor.bind('mousemove', onMove);
      captor.bind('mouseout', onOut);
      captor.bind('doubleclick', onDoubleClick);
      captor.bind('rightclick', onRightClick);
      self.bind('render', onMove);
    }

    for (i = 0, l = this.captors.length; i < l; i++)
      bindCaptor(this.captors[i]);
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.misc');

  /**
   * This helper will bind any DOM renderer (for instance svg)
   * to its captors, to properly dispatch the good events to the sigma instance
   * to manage clicking, hovering etc...
   *
   * It has to be called in the scope of the related renderer.
   */
  sigma.misc.bindDOMEvents = function(container) {
    var self = this,
        graph = this.graph;

    // DOMElement abstraction
    function Element(domElement) {

      // Helpers
      this.attr = function(attrName) {
        return domElement.getAttributeNS(null, attrName);
      };

      // Properties
      this.tag = domElement.tagName;
      this.class = this.attr('class');
      this.id = this.attr('id');

      // Methods
      this.isNode = function() {
        return !!~this.class.indexOf(self.settings('classPrefix') + '-node');
      };

      this.isEdge = function() {
        return !!~this.class.indexOf(self.settings('classPrefix') + '-edge');
      };

      this.isHover = function() {
        return !!~this.class.indexOf(self.settings('classPrefix') + '-hover');
      };
    }

    // Click
    function click(e) {
      if (!self.settings('eventsEnabled'))
        return;

      // Generic event
      self.dispatchEvent('click', e);

      // Are we on a node?
      var element = new Element(e.target);

      if (element.isNode())
        self.dispatchEvent('clickNode', {
          node: graph.nodes(element.attr('data-node-id'))
        });
      else
        self.dispatchEvent('clickStage');

      e.preventDefault();
      e.stopPropagation();
    }

    // Double click
    function doubleClick(e) {
      if (!self.settings('eventsEnabled'))
        return;

      // Generic event
      self.dispatchEvent('doubleClick', e);

      // Are we on a node?
      var element = new Element(e.target);

      if (element.isNode())
        self.dispatchEvent('doubleClickNode', {
          node: graph.nodes(element.attr('data-node-id'))
        });
      else
        self.dispatchEvent('doubleClickStage');

      e.preventDefault();
      e.stopPropagation();
    }

    // On over
    function onOver(e) {
      var target = e.toElement || e.target;

      if (!self.settings('eventsEnabled') || !target)
        return;

      var el = new Element(target);

      if (el.isNode()) {
        self.dispatchEvent('overNode', {
          node: graph.nodes(el.attr('data-node-id'))
        });
      }
      else if (el.isEdge()) {
        var edge = graph.edges(el.attr('data-edge-id'));
        self.dispatchEvent('overEdge', {
          edge: edge,
          source: graph.nodes(edge.source),
          target: graph.nodes(edge.target)
        });
      }
    }

    // On out
    function onOut(e) {
      var target = e.fromElement || e.originalTarget;

      if (!self.settings('eventsEnabled'))
        return;

      var el = new Element(target);

      if (el.isNode()) {
        self.dispatchEvent('outNode', {
          node: graph.nodes(el.attr('data-node-id'))
        });
      }
      else if (el.isEdge()) {
        var edge = graph.edges(el.attr('data-edge-id'));
        self.dispatchEvent('outEdge', {
          edge: edge,
          source: graph.nodes(edge.source),
          target: graph.nodes(edge.target)
        });
      }
    }

    // Registering Events:

    // Click
    container.addEventListener('click', click, false);
    sigma.utils.doubleClick(container, 'click', doubleClick);

    // Touch counterparts
    container.addEventListener('touchstart', click, false);
    sigma.utils.doubleClick(container, 'touchstart', doubleClick);

    // Mouseover
    container.addEventListener('mouseover', onOver, true);

    // Mouseout
    container.addEventListener('mouseout', onOut, true);
  };
}).call(this);

;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.misc');

  /**
   * This method listens to "overNode", "outNode", "overEdge" and "outEdge"
   * events from a renderer and renders the nodes differently on the top layer.
   * The goal is to make any node label readable with the mouse, and to
   * highlight hovered nodes and edges.
   *
   * It has to be called in the scope of the related renderer.
   */
  sigma.misc.drawHovers = function(prefix) {
    var self = this,
        hoveredNodes = {},
        hoveredEdges = {};

    this.bind('overNode', function(event) {
      var node = event.data.node;
      if (!node.hidden) {
        hoveredNodes[node.id] = node;
        draw();
      }
    });

    this.bind('outNode', function(event) {
      delete hoveredNodes[event.data.node.id];
      draw();
    });

    this.bind('overEdge', function(event) {
      var edge = event.data.edge;
      if (!edge.hidden) {
        hoveredEdges[edge.id] = edge;
        draw();
      }
    });

    this.bind('outEdge', function(event) {
      delete hoveredEdges[event.data.edge.id];
      draw();
    });

    this.bind('render', function(event) {
      draw();
    });

    function draw() {

      var k,
          source,
          target,
          hoveredNode,
          hoveredEdge,
          c = self.contexts.hover.canvas,
          defaultNodeType = self.settings('defaultNodeType'),
          defaultEdgeType = self.settings('defaultEdgeType'),
          nodeRenderers = sigma.canvas.hovers,
          edgeRenderers = sigma.canvas.edgehovers,
          extremitiesRenderers = sigma.canvas.extremities,
          embedSettings = self.settings.embedObjects({
            prefix: prefix
          });

      // Clear self.contexts.hover:
      self.contexts.hover.clearRect(0, 0, c.width, c.height);

      // Node render: single hover
      if (
        embedSettings('enableHovering') &&
        embedSettings('singleHover') &&
        Object.keys(hoveredNodes).length
      ) {
        hoveredNode = hoveredNodes[Object.keys(hoveredNodes)[0]];
        (
          nodeRenderers[hoveredNode.type] ||
          nodeRenderers[defaultNodeType] ||
          nodeRenderers.def
        )(
          hoveredNode,
          self.contexts.hover,
          embedSettings
        );
      }

      // Node render: multiple hover
      if (
        embedSettings('enableHovering') &&
        !embedSettings('singleHover')
      )
        for (k in hoveredNodes)
          (
            nodeRenderers[hoveredNodes[k].type] ||
            nodeRenderers[defaultNodeType] ||
            nodeRenderers.def
          )(
            hoveredNodes[k],
            self.contexts.hover,
            embedSettings
          );

      // Edge render: single hover
      if (
        embedSettings('enableEdgeHovering') &&
        embedSettings('singleHover') &&
        Object.keys(hoveredEdges).length
      ) {
        hoveredEdge = hoveredEdges[Object.keys(hoveredEdges)[0]];
        source = self.graph.nodes(hoveredEdge.source);
        target = self.graph.nodes(hoveredEdge.target);

        if (! hoveredEdge.hidden) {
          (
            edgeRenderers[hoveredEdge.type] ||
            edgeRenderers[defaultEdgeType] ||
            edgeRenderers.def
          ) (
            hoveredEdge,
            source,
            target,
            self.contexts.hover,
            embedSettings
          );

          if (embedSettings('edgeHoverExtremities')) {
            (
              extremitiesRenderers[hoveredEdge.type] ||
              extremitiesRenderers.def
            )(
              hoveredEdge,
              source,
              target,
              self.contexts.hover,
              embedSettings
            );

          } else {
            // Avoid edges rendered over nodes:
            (
              sigma.canvas.nodes[source.type] ||
              sigma.canvas.nodes.def
            ) (
              source,
              self.contexts.hover,
              embedSettings
            );
            (
              sigma.canvas.nodes[target.type] ||
              sigma.canvas.nodes.def
            ) (
              target,
              self.contexts.hover,
              embedSettings
            );
          }
        }
      }

      // Edge render: multiple hover
      if (
        embedSettings('enableEdgeHovering') &&
        !embedSettings('singleHover')
      ) {
        for (k in hoveredEdges) {
          hoveredEdge = hoveredEdges[k];
          source = self.graph.nodes(hoveredEdge.source);
          target = self.graph.nodes(hoveredEdge.target);

          if (!hoveredEdge.hidden) {
            (
              edgeRenderers[hoveredEdge.type] ||
              edgeRenderers[defaultEdgeType] ||
              edgeRenderers.def
            ) (
              hoveredEdge,
              source,
              target,
              self.contexts.hover,
              embedSettings
            );

            if (embedSettings('edgeHoverExtremities')) {
              (
                extremitiesRenderers[hoveredEdge.type] ||
                extremitiesRenderers.def
              )(
                hoveredEdge,
                source,
                target,
                self.contexts.hover,
                embedSettings
              );
            } else {
              // Avoid edges rendered over nodes:
              (
                sigma.canvas.nodes[source.type] ||
                sigma.canvas.nodes.def
              ) (
                source,
                self.contexts.hover,
                embedSettings
              );
              (
                sigma.canvas.nodes[target.type] ||
                sigma.canvas.nodes.def
              ) (
                target,
                self.contexts.hover,
                embedSettings
              );
            }
          }
        }
      }
    }
  };
}).call(this);

},{}],9:[function(require,module,exports){
;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw new Error('sigma is not declared');

  // Initialize package:
  sigma.utils.pkg('sigma.layout.noverlap');

  /**
   * Noverlap Layout
   * ===============================
   *
   * Author: @apitts / Andrew Pitts
   * Algorithm: @jacomyma / Mathieu Jacomy (originally contributed to Gephi and ported to sigma.js under the MIT license by @andpitts with permission)
   * Acknowledgement: @sheyman / Sébastien Heymann (some inspiration has been taken from other MIT licensed layout algorithms authored by @sheyman)
   * Version: 0.1
   */

  var settings = {
    speed: 3,
    scaleNodes: 1.2,
    nodeMargin: 5.0,
    gridSize: 20,
    permittedExpansion: 1.1,
    rendererIndex: 0,
    maxIterations: 500
  };

  var _instance = {};

  /**
   * Event emitter Object
   * ------------------
   */
  var _eventEmitter = {};

   /**
   * Noverlap Object
   * ------------------
   */
  function Noverlap() {
    var self = this;

    this.init = function (sigInst, options) {
      options = options || {};

      // Properties
      this.sigInst = sigInst;
      this.config = sigma.utils.extend(options, settings);
      this.easing = options.easing;
      this.duration = options.duration;

      if (options.nodes) {
        this.nodes = options.nodes;
        delete options.nodes;
      }

      if (!sigma.plugins || typeof sigma.plugins.animate === 'undefined') {
        throw new Error('sigma.plugins.animate is not declared');
      }

      // State
      this.running = false;
    };

    /**
     * Single layout iteration.
     */
    this.atomicGo = function () {
      if (!this.running || this.iterCount < 1) return false;

      var nodes = this.nodes || this.sigInst.graph.nodes(),
          nodesCount = nodes.length,
          i,
          n,
          n1,
          n2,
          xmin = Infinity,
          xmax = -Infinity,
          ymin = Infinity,
          ymax = -Infinity,
          xwidth,
          yheight,
          xcenter,
          ycenter,
          grid,
          row,
          col,
          minXBox,
          maxXBox,
          minYBox,
          maxYBox,
          adjacentNodes,
          subRow,
          subCol,
          nxmin,
          nxmax,
          nymin,
          nymax;

      this.iterCount--;
      this.running = false;

      for (i=0; i < nodesCount; i++) {
        n = nodes[i];
        n.dn.dx = 0;
        n.dn.dy = 0;

        //Find the min and max for both x and y across all nodes
        xmin = Math.min(xmin, n.dn_x - (n.dn_size*self.config.scaleNodes + self.config.nodeMargin) );
        xmax = Math.max(xmax, n.dn_x + (n.dn_size*self.config.scaleNodes + self.config.nodeMargin) );
        ymin = Math.min(ymin, n.dn_y - (n.dn_size*self.config.scaleNodes + self.config.nodeMargin) );
        ymax = Math.max(ymax, n.dn_y + (n.dn_size*self.config.scaleNodes + self.config.nodeMargin) );

      }

      xwidth = xmax - xmin;
      yheight = ymax - ymin;
      xcenter = (xmin + xmax) / 2;
      ycenter = (ymin + ymax) / 2;
      xmin = xcenter - self.config.permittedExpansion*xwidth / 2;
      xmax = xcenter + self.config.permittedExpansion*xwidth / 2;
      ymin = ycenter - self.config.permittedExpansion*yheight / 2;
      ymax = ycenter + self.config.permittedExpansion*yheight / 2;

      grid = {}; //An object of objects where grid[row][col] is an array of node ids representing nodes that fall in that grid. Nodes can fall in more than one grid

      for(row = 0; row < self.config.gridSize; row++) {
        grid[row] = {};
        for(col = 0; col < self.config.gridSize; col++) {
          grid[row][col] = [];
        }
      }

      //Place nodes in grid
      for (i=0; i < nodesCount; i++) {
        n = nodes[i];

        nxmin = n.dn_x - (n.dn_size*self.config.scaleNodes + self.config.nodeMargin);
        nxmax = n.dn_x + (n.dn_size*self.config.scaleNodes + self.config.nodeMargin);
        nymin = n.dn_y - (n.dn_size*self.config.scaleNodes + self.config.nodeMargin);
        nymax = n.dn_y + (n.dn_size*self.config.scaleNodes + self.config.nodeMargin);

        minXBox = Math.floor(self.config.gridSize* (nxmin - xmin) / (xmax - xmin) );
        maxXBox = Math.floor(self.config.gridSize* (nxmax - xmin) / (xmax - xmin) );
        minYBox = Math.floor(self.config.gridSize* (nymin - ymin) / (ymax - ymin) );
        maxYBox = Math.floor(self.config.gridSize* (nymax - ymin) / (ymax - ymin) );
        for(col = minXBox; col <= maxXBox; col++) {
          for(row = minYBox; row <= maxYBox; row++) {
            grid[row][col].push(n.id);
          }
        }
      }


      adjacentNodes = {}; //An object that stores the node ids of adjacent nodes (either in same grid box or adjacent grid box) for all nodes

      for(row = 0; row < self.config.gridSize; row++) {
        for(col = 0; col < self.config.gridSize; col++) {
          grid[row][col].forEach(function(nodeId) {
            if(!adjacentNodes[nodeId]) {
              adjacentNodes[nodeId] = [];
            }
            for(subRow = Math.max(0, row - 1); subRow <= Math.min(row + 1, self.config.gridSize - 1); subRow++) {
              for(subCol = Math.max(0, col - 1); subCol <= Math.min(col + 1,  self.config.gridSize - 1); subCol++) {
                grid[subRow][subCol].forEach(function(subNodeId) {
                  if(subNodeId !== nodeId && adjacentNodes[nodeId].indexOf(subNodeId) === -1) {
                    adjacentNodes[nodeId].push(subNodeId);
                  }
                });
              }
            }
          });
        }
      }

      //If two nodes overlap then repulse them
      for (i=0; i < nodesCount; i++) {
        n1 = nodes[i];
        adjacentNodes[n1.id].forEach(function(nodeId) {
          var n2 = self.sigInst.graph.nodes(nodeId);
          var xDist = n2.dn_x - n1.dn_x;
          var yDist = n2.dn_y - n1.dn_y;
          var dist = Math.sqrt(xDist*xDist + yDist*yDist);
          var collision = (dist < ((n1.dn_size*self.config.scaleNodes + self.config.nodeMargin) + (n2.dn_size*self.config.scaleNodes + self.config.nodeMargin)));
          if(collision) {
            self.running = true;
            if(dist > 0) {
              n2.dn.dx += xDist / dist * (1 + n1.dn_size);
              n2.dn.dy += yDist / dist * (1 + n1.dn_size);
            } else {
              n2.dn.dx += xwidth * 0.01 * (0.5 - Math.random());
              n2.dn.dy += yheight * 0.01 * (0.5 - Math.random());
            }
          }
        });
      }

      for (i=0; i < nodesCount; i++) {
        n = nodes[i];
        if(!n.fixed) {
          n.dn_x = n.dn_x + n.dn.dx * 0.1 * self.config.speed;
          n.dn_y = n.dn_y + n.dn.dy * 0.1 * self.config.speed;
        }
      }

      if(this.running && this.iterCount < 1) {
        this.running = false;
      }

      return this.running;
    };

    this.go = function () {
      this.iterCount = this.config.maxIterations;

      while (this.running) {
        this.atomicGo();
      };

      this.stop();
    };

    this.start = function() {
      if (this.running) return;

      var nodes = this.sigInst.graph.nodes();

      var prefix = this.sigInst.renderers[self.config.rendererIndex].options.prefix;

      this.running = true;

      // Init nodes
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].dn_x = nodes[i][prefix + 'x'];
        nodes[i].dn_y = nodes[i][prefix + 'y'];
        nodes[i].dn_size = nodes[i][prefix + 'size'];
        nodes[i].dn = {
          dx: 0,
          dy: 0
        };
      }
      _eventEmitter[self.sigInst.id].dispatchEvent('start');
      this.go();
    };

    this.stop = function() {
      var nodes = this.sigInst.graph.nodes();

      this.running = false;

      if (this.easing) {
        _eventEmitter[self.sigInst.id].dispatchEvent('interpolate');
        sigma.plugins.animate(
          self.sigInst,
          {
            x: 'dn_x',
            y: 'dn_y'
          },
          {
            easing: self.easing,
            onComplete: function() {
              self.sigInst.refresh();
              for (var i = 0; i < nodes.length; i++) {
                nodes[i].dn = null;
                nodes[i].dn_x = null;
                nodes[i].dn_y = null;
              }
              _eventEmitter[self.sigInst.id].dispatchEvent('stop');
            },
            duration: self.duration
          }
        );
      }
      else {
        // Apply changes
        for (var i = 0; i < nodes.length; i++) {
          nodes[i].x = nodes[i].dn_x;
          nodes[i].y = nodes[i].dn_y;
        }

        this.sigInst.refresh();

        for (var i = 0; i < nodes.length; i++) {
          nodes[i].dn = null;
          nodes[i].dn_x = null;
          nodes[i].dn_y = null;
        }
        _eventEmitter[self.sigInst.id].dispatchEvent('stop');
      }
    };

    this.kill = function() {
      this.sigInst = null;
      this.config = null;
      this.easing = null;
    };
  };

  /**
   * Interface
   * ----------
   */

  /**
   * Configure the layout algorithm.

   * Recognized options:
   * **********************
   * Here is the exhaustive list of every accepted parameter in the settings
   * object:
   *
   *   {?number}            speed               A larger value increases the convergence speed at the cost of precision
   *   {?number}            scaleNodes          The ratio to scale nodes by - a larger ratio will lead to more space around larger nodes
   *   {?number}            nodeMargin          A fixed margin to apply around nodes regardless of size
   *   {?number}            maxIterations       The maximum number of iterations to perform before the layout completes.
   *   {?integer}           gridSize            The number of rows and columns to use when partioning nodes into a grid for efficient computation
   *   {?number}            permittedExpansion  A permitted expansion factor to the overall size of the network applied at each iteration
   *   {?integer}           rendererIndex       The index of the renderer to use for node co-ordinates. Defaults to zero.
   *   {?(function|string)} easing              Either the name of an easing in the sigma.utils.easings package or a function. If not specified, the
   *                                            quadraticInOut easing from this package will be used instead.
   *   {?number}            duration            The duration of the animation. If not specified, the "animationsTime" setting value of the sigma instance will be used instead.
   *
   *
   * @param  {object} config  The optional configuration object.
   *
   * @return {sigma.classes.dispatcher} Returns an event emitter.
   */
  sigma.prototype.configNoverlap = function(config) {

    var sigInst = this;

    if (!config) throw new Error('Missing argument: "config"');

    // Create instance if undefined
    if (!_instance[sigInst.id]) {
      _instance[sigInst.id] = new Noverlap();

      _eventEmitter[sigInst.id] = {};
      sigma.classes.dispatcher.extend(_eventEmitter[sigInst.id]);

      // Binding on kill to clear the references
      sigInst.bind('kill', function() {
        _instance[sigInst.id].kill();
        _instance[sigInst.id] = null;
        _eventEmitter[sigInst.id] = null;
      });
    }

    _instance[sigInst.id].init(sigInst, config);

    return _eventEmitter[sigInst.id];
  };

  /**
   * Start the layout algorithm. It will use the existing configuration if no
   * new configuration is passed.

   * Recognized options:
   * **********************
   * Here is the exhaustive list of every accepted parameter in the settings
   * object
   *
   *   {?number}            speed               A larger value increases the convergence speed at the cost of precision
   *   {?number}            scaleNodes          The ratio to scale nodes by - a larger ratio will lead to more space around larger nodes
   *   {?number}            nodeMargin          A fixed margin to apply around nodes regardless of size
   *   {?number}            maxIterations       The maximum number of iterations to perform before the layout completes.
   *   {?integer}           gridSize            The number of rows and columns to use when partioning nodes into a grid for efficient computation
   *   {?number}            permittedExpansion  A permitted expansion factor to the overall size of the network applied at each iteration
   *   {?integer}           rendererIndex       The index of the renderer to use for node co-ordinates. Defaults to zero.
   *   {?(function|string)} easing              Either the name of an easing in the sigma.utils.easings package or a function. If not specified, the
   *                                            quadraticInOut easing from this package will be used instead.
   *   {?number}            duration            The duration of the animation. If not specified, the "animationsTime" setting value of the sigma instance will be used instead.
   *
   *
   *
   * @param  {object} config  The optional configuration object.
   *
   * @return {sigma.classes.dispatcher} Returns an event emitter.
   */

  sigma.prototype.startNoverlap = function(config) {

    var sigInst = this;

    if (config) {
      this.configNoverlap(sigInst, config);
    }

    _instance[sigInst.id].start();

    return _eventEmitter[sigInst.id];
  };

  /**
   * Returns true if the layout has started and is not completed.
   *
   * @return {boolean}
   */
  sigma.prototype.isNoverlapRunning = function() {

    var sigInst = this;

    return !!_instance[sigInst.id] && _instance[sigInst.id].running;
  };

}).call(this);
},{}],10:[function(require,module,exports){
/**
 * This plugin provides a method to animate a sigma instance by interpolating
 * some node properties. Check the sigma.plugins.animate function doc or the
 * examples/animate.html code sample to know more.
 */
(function() {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  sigma.utils.pkg('sigma.plugins');

  var _id = 0,
      _cache = {};

  // TOOLING FUNCTIONS:
  // ******************
  function parseColor(val) {
    if (_cache[val])
      return _cache[val];

    var result = [0, 0, 0];

    if (val.match(/^#/)) {
      val = (val || '').replace(/^#/, '');
      result = (val.length === 3) ?
        [
          parseInt(val.charAt(0) + val.charAt(0), 16),
          parseInt(val.charAt(1) + val.charAt(1), 16),
          parseInt(val.charAt(2) + val.charAt(2), 16)
        ] :
        [
          parseInt(val.charAt(0) + val.charAt(1), 16),
          parseInt(val.charAt(2) + val.charAt(3), 16),
          parseInt(val.charAt(4) + val.charAt(5), 16)
        ];
    } else if (val.match(/^ *rgba? *\(/)) {
      val = val.match(
        /^ *rgba? *\( *([0-9]*) *, *([0-9]*) *, *([0-9]*) *(,.*)?\) *$/
      );
      result = [
        +val[1],
        +val[2],
        +val[3]
      ];
    }

    _cache[val] = {
      r: result[0],
      g: result[1],
      b: result[2]
    };

    return _cache[val];
  }

  function interpolateColors(c1, c2, p) {
    c1 = parseColor(c1);
    c2 = parseColor(c2);

    var c = {
      r: c1.r * (1 - p) + c2.r * p,
      g: c1.g * (1 - p) + c2.g * p,
      b: c1.b * (1 - p) + c2.b * p
    };

    return 'rgb(' + [c.r | 0, c.g | 0, c.b | 0].join(',') + ')';
  }

  /**
   * This function will animate some specified node properties. It will
   * basically call requestAnimationFrame, interpolate the values and call the
   * refresh method during a specified duration.
   *
   * Recognized parameters:
   * **********************
   * Here is the exhaustive list of every accepted parameters in the settings
   * object:
   *
   *   {?array}             nodes      An array of node objects or node ids. If
   *                                   not specified, all nodes of the graph
   *                                   will be animated.
   *   {?(function|string)} easing     Either the name of an easing in the
   *                                   sigma.utils.easings package or a
   *                                   function. If not specified, the
   *                                   quadraticInOut easing from this package
   *                                   will be used instead.
   *   {?number}            duration   The duration of the animation. If not
   *                                   specified, the "animationsTime" setting
   *                                   value of the sigma instance will be used
   *                                   instead.
   *   {?function}          onComplete Eventually a function to call when the
   *                                   animation is ended.
   *
   * @param  {sigma}   s       The related sigma instance.
   * @param  {object}  animate An hash with the keys being the node properties
   *                           to interpolate, and the values being the related
   *                           target values.
   * @param  {?object} options Eventually an object with options.
   */
  sigma.plugins.animate = function(s, animate, options) {
    var o = options || {},
        id = ++_id,
        duration = o.duration || s.settings('animationsTime'),
        easing = typeof o.easing === 'string' ?
          sigma.utils.easings[o.easing] :
          typeof o.easing === 'function' ?
          o.easing :
          sigma.utils.easings.quadraticInOut,
        start = sigma.utils.dateNow(),
        nodes,
        startPositions;

    if (o.nodes && o.nodes.length) {
      if (typeof o.nodes[0] === 'object')
        nodes = o.nodes;
      else
        nodes = s.graph.nodes(o.nodes); // argument is an array of IDs
    }
    else
      nodes = s.graph.nodes();

    // Store initial positions:
    startPositions = nodes.reduce(function(res, node) {
      var k;
      res[node.id] = {};
      for (k in animate)
        if (k in node)
          res[node.id][k] = node[k];
      return res;
    }, {});

    s.animations = s.animations || Object.create({});
    sigma.plugins.kill(s);

    // Do not refresh edgequadtree during drag:
    var k,
        c;
    for (k in s.cameras) {
      c = s.cameras[k];
      c.edgequadtree._enabled = false;
    }

    function step() {
      var p = (sigma.utils.dateNow() - start) / duration;

      if (p >= 1) {
        nodes.forEach(function(node) {
          for (var k in animate)
            if (k in animate)
              node[k] = node[animate[k]];
        });

        // Allow to refresh edgequadtree:
        var k,
            c;
        for (k in s.cameras) {
          c = s.cameras[k];
          c.edgequadtree._enabled = true;
        }

        s.refresh();
        if (typeof o.onComplete === 'function')
          o.onComplete();
      } else {
        p = easing(p);
        nodes.forEach(function(node) {
          for (var k in animate)
            if (k in animate) {
              if (k.match(/color$/))
                node[k] = interpolateColors(
                  startPositions[node.id][k],
                  node[animate[k]],
                  p
                );
              else
                node[k] =
                  node[animate[k]] * p +
                  startPositions[node.id][k] * (1 - p);
            }
        });

        s.refresh();
        s.animations[id] = requestAnimationFrame(step);
      }
    }

    step();
  };

  sigma.plugins.kill = function(s) {
    for (var k in (s.animations || {}))
      cancelAnimationFrame(s.animations[k]);

    // Allow to refresh edgequadtree:
    var k,
        c;
    for (k in s.cameras) {
      c = s.cameras[k];
      c.edgequadtree._enabled = true;
    }
  };
}).call(window);

},{}],11:[function(require,module,exports){
/**
 * This plugin provides a method to drag & drop nodes. Check the
 * sigma.plugins.dragNodes function doc or the examples/basic.html &
 * examples/api-candy.html code samples to know more.
 */
(function() {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  sigma.utils.pkg('sigma.plugins');


  /**
   * This function will add `mousedown`, `mouseup` & `mousemove` events to the
   * nodes in the `overNode`event to perform drag & drop operations. It uses
   * `linear interpolation` [http://en.wikipedia.org/wiki/Linear_interpolation]
   * and `rotation matrix` [http://en.wikipedia.org/wiki/Rotation_matrix] to
   * calculate the X and Y coordinates from the `cam` or `renderer` node
   * attributes. These attributes represent the coordinates of the nodes in
   * the real container, not in canvas.
   *
   * Fired events:
   * *************
   * startdrag  Fired at the beginning of the drag.
   * drag       Fired while the node is dragged.
   * drop       Fired at the end of the drag if the node has been dragged.
   * dragend    Fired at the end of the drag.
   *
   * Recognized parameters:
   * **********************
   * @param  {sigma}    s        The related sigma instance.
   * @param  {renderer} renderer The related renderer instance.
   */
  function DragNodes(s, renderer) {
    sigma.classes.dispatcher.extend(this);

    // A quick hardcoded rule to prevent people from using this plugin with the
    // WebGL renderer (which is impossible at the moment):
    // if (
    //   sigma.renderers.webgl &&
    //   renderer instanceof sigma.renderers.webgl
    // )
    //   throw new Error(
    //     'The sigma.plugins.dragNodes is not compatible with the WebGL renderer'
    //   );

    // Init variables:
    var _self = this,
      _s = s,
      _body = document.body,
      _renderer = renderer,
      _mouse = renderer.container.lastChild,
      _camera = renderer.camera,
      _node = null,
      _prefix = '',
      _hoverStack = [],
      _hoverIndex = {},
      _isMouseDown = false,
      _isMouseOverCanvas = false,
      _drag = false;

    if (renderer instanceof sigma.renderers.svg) {
        _mouse = renderer.container.firstChild;
    }

    // It removes the initial substring ('read_') if it's a WegGL renderer.
    if (renderer instanceof sigma.renderers.webgl) {
      _prefix = renderer.options.prefix.substr(5);
    } else {
      _prefix = renderer.options.prefix;
    }

    renderer.bind('overNode', nodeMouseOver);
    renderer.bind('outNode', treatOutNode);
    renderer.bind('click', click);

    _s.bind('kill', function() {
      _self.unbindAll();
    });

    /**
     * Unbind all event listeners.
     */
    this.unbindAll = function() {
      _mouse.removeEventListener('mousedown', nodeMouseDown);
      _body.removeEventListener('mousemove', nodeMouseMove);
      _body.removeEventListener('mouseup', nodeMouseUp);
      _renderer.unbind('overNode', nodeMouseOver);
      _renderer.unbind('outNode', treatOutNode);
    }

    // Calculates the global offset of the given element more accurately than
    // element.offsetTop and element.offsetLeft.
    function calculateOffset(element) {
      var style = window.getComputedStyle(element);
      var getCssProperty = function(prop) {
        return parseInt(style.getPropertyValue(prop).replace('px', '')) || 0;
      };
      return {
        left: element.getBoundingClientRect().left + getCssProperty('padding-left'),
        top: element.getBoundingClientRect().top + getCssProperty('padding-top')
      };
    };

    function click(event) {
      // event triggered at the end of the click
      _isMouseDown = false;
      _body.removeEventListener('mousemove', nodeMouseMove);
      _body.removeEventListener('mouseup', nodeMouseUp);

      if (!_hoverStack.length) {
        _node = null;
      }
    };

    function nodeMouseOver(event) {
      // Don't treat the node if it is already registered
      if (_hoverIndex[event.data.node.id]) {
        return;
      }

      // Add node to array of current nodes over
      _hoverStack.push(event.data.node);
      _hoverIndex[event.data.node.id] = true;

      if(_hoverStack.length && ! _isMouseDown) {
        // Set the current node to be the last one in the array
        _node = _hoverStack[_hoverStack.length - 1];
        _mouse.addEventListener('mousedown', nodeMouseDown);
      }
    };

    function treatOutNode(event) {
      // Remove the node from the array
      var indexCheck = _hoverStack.map(function(e) { return e; }).indexOf(event.data.node);
      _hoverStack.splice(indexCheck, 1);
      delete _hoverIndex[event.data.node.id];

      if(_hoverStack.length && ! _isMouseDown) {
        // On out, set the current node to be the next stated in array
        _node = _hoverStack[_hoverStack.length - 1];
      } else {
        _mouse.removeEventListener('mousedown', nodeMouseDown);
      }
    };

    function nodeMouseDown(event) {
      _isMouseDown = true;
      var size = _s.graph.nodes().length;

      // when there is only node in the graph, the plugin cannot apply
      // linear interpolation. So treat it as if a user is dragging
      // the graph
      if (_node && size > 1) {
        _mouse.removeEventListener('mousedown', nodeMouseDown);
        _body.addEventListener('mousemove', nodeMouseMove);
        _body.addEventListener('mouseup', nodeMouseUp);

        // Do not refresh edgequadtree during drag:
        var k,
            c;
        for (k in _s.cameras) {
          c = _s.cameras[k];
          if (c.edgequadtree !== undefined) {
            c.edgequadtree._enabled = false;
          }
        }

        // Deactivate drag graph.
        _renderer.settings({mouseEnabled: false, enableHovering: false});
        _s.refresh();

        _self.dispatchEvent('startdrag', {
          node: _node,
          captor: event,
          renderer: _renderer
        });
      }
    };

    function nodeMouseUp(event) {
      _isMouseDown = false;
      _mouse.addEventListener('mousedown', nodeMouseDown);
      _body.removeEventListener('mousemove', nodeMouseMove);
      _body.removeEventListener('mouseup', nodeMouseUp);

      // Allow to refresh edgequadtree:
      var k,
          c;
      for (k in _s.cameras) {
        c = _s.cameras[k];
        if (c.edgequadtree !== undefined) {
          c.edgequadtree._enabled = true;
        }
      }

      // Activate drag graph.
      _renderer.settings({mouseEnabled: true, enableHovering: true});
      _s.refresh();

      if (_drag) {
        _self.dispatchEvent('drop', {
          node: _node,
          captor: event,
          renderer: _renderer
        });
      }
      _self.dispatchEvent('dragend', {
        node: _node,
        captor: event,
        renderer: _renderer
      });

      _drag = false;
      _node = null;
    };

    function nodeMouseMove(event) {
      if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        clearTimeout(timeOut);
        var timeOut = setTimeout(executeNodeMouseMove, 0);
      } else {
        executeNodeMouseMove();
      }

      function executeNodeMouseMove() {
        var offset = calculateOffset(_renderer.container),
            x = event.clientX - offset.left,
            y = event.clientY - offset.top,
            cos = Math.cos(_camera.angle),
            sin = Math.sin(_camera.angle),
            nodes = _s.graph.nodes(),
            ref = [];

        // Getting and derotating the reference coordinates.
        for (var i = 0; i < 2; i++) {
          var n = nodes[i];
          var aux = {
            x: n.x * cos + n.y * sin,
            y: n.y * cos - n.x * sin,
            renX: n[_prefix + 'x'],
            renY: n[_prefix + 'y'],
          };
          ref.push(aux);
        }

        // Applying linear interpolation.
        // if the nodes are on top of each other, we use the camera ratio to interpolate
        if (ref[0].x === ref[1].x && ref[0].y === ref[1].y) {
          var xRatio = (ref[0].renX === 0) ? 1 : ref[0].renX;
          var yRatio = (ref[0].renY === 0) ? 1 : ref[0].renY;
          x = (ref[0].x / xRatio) * (x - ref[0].renX) + ref[0].x;
          y = (ref[0].y / yRatio) * (y - ref[0].renY) + ref[0].y;
        } else {
          var xRatio = (ref[1].renX - ref[0].renX) / (ref[1].x - ref[0].x);
          var yRatio = (ref[1].renY - ref[0].renY) / (ref[1].y - ref[0].y);

          // if the coordinates are the same, we use the other ratio to interpolate
          if (ref[1].x === ref[0].x) {
            xRatio = yRatio;
          }

          if (ref[1].y === ref[0].y) {
            yRatio = xRatio;
          }

          x = (x - ref[0].renX) / xRatio + ref[0].x;
          y = (y - ref[0].renY) / yRatio + ref[0].y;
        }

        // Rotating the coordinates.
        _node.x = x * cos - y * sin;
        _node.y = y * cos + x * sin;

        _s.refresh();

        _drag = true;
        _self.dispatchEvent('drag', {
          node: _node,
          captor: event,
          renderer: _renderer
        });
      }
    };
  };

  /**
   * Interface
   * ------------------
   *
   * > var dragNodesListener = sigma.plugins.dragNodes(s, s.renderers[0]);
   */
  var _instance = {};

  /**
   * @param  {sigma} s The related sigma instance.
   * @param  {renderer} renderer The related renderer instance.
   */
  sigma.plugins.dragNodes = function(s, renderer) {
    // Create object if undefined
    if (!_instance[s.id]) {
      _instance[s.id] = new DragNodes(s, renderer);
    }

    s.bind('kill', function() {
      sigma.plugins.killDragNodes(s);
    });

    return _instance[s.id];
  };

  /**
   * This method removes the event listeners and kills the dragNodes instance.
   *
   * @param  {sigma} s The related sigma instance.
   */
  sigma.plugins.killDragNodes = function(s) {
    if (_instance[s.id] instanceof DragNodes) {
      _instance[s.id].unbindAll();
      delete _instance[s.id];
    }
  };

}).call(window);

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
var arrays = require("./arrays");
var LinkedList = /** @class */ (function () {
    /**
    * Creates an empty Linked List.
    * @class A linked list is a data structure consisting of a group of nodes
    * which together represent a sequence.
    * @constructor
    */
    function LinkedList() {
        /**
        * First node in the list
        * @type {Object}
        * @private
        */
        this.firstNode = null;
        /**
        * Last node in the list
        * @type {Object}
        * @private
        */
        this.lastNode = null;
        /**
        * Number of elements in the list
        * @type {number}
        * @private
        */
        this.nElements = 0;
    }
    /**
    * Adds an element to this list.
    * @param {Object} item element to be added.
    * @param {number=} index optional index to add the element. If no index is specified
    * the element is added to the end of this list.
    * @return {boolean} true if the element was added or false if the index is invalid
    * or if the element is undefined.
    */
    LinkedList.prototype.add = function (item, index) {
        if (util.isUndefined(index)) {
            index = this.nElements;
        }
        if (index < 0 || index > this.nElements || util.isUndefined(item)) {
            return false;
        }
        var newNode = this.createNode(item);
        if (this.nElements === 0 || this.lastNode === null) {
            // First node in the list.
            this.firstNode = newNode;
            this.lastNode = newNode;
        }
        else if (index === this.nElements) {
            // Insert at the end.
            this.lastNode.next = newNode;
            this.lastNode = newNode;
        }
        else if (index === 0) {
            // Change first node.
            newNode.next = this.firstNode;
            this.firstNode = newNode;
        }
        else {
            var prev = this.nodeAtIndex(index - 1);
            if (prev == null) {
                return false;
            }
            newNode.next = prev.next;
            prev.next = newNode;
        }
        this.nElements++;
        return true;
    };
    /**
    * Returns the first element in this list.
    * @return {*} the first element of the list or undefined if the list is
    * empty.
    */
    LinkedList.prototype.first = function () {
        if (this.firstNode !== null) {
            return this.firstNode.element;
        }
        return undefined;
    };
    /**
    * Returns the last element in this list.
    * @return {*} the last element in the list or undefined if the list is
    * empty.
    */
    LinkedList.prototype.last = function () {
        if (this.lastNode !== null) {
            return this.lastNode.element;
        }
        return undefined;
    };
    /**
     * Returns the element at the specified position in this list.
     * @param {number} index desired index.
     * @return {*} the element at the given index or undefined if the index is
     * out of bounds.
     */
    LinkedList.prototype.elementAtIndex = function (index) {
        var node = this.nodeAtIndex(index);
        if (node === null) {
            return undefined;
        }
        return node.element;
    };
    /**
     * Returns the index in this list of the first occurrence of the
     * specified element, or -1 if the List does not contain this element.
     * <p>If the elements inside this list are
     * not comparable with the === operator a custom equals function should be
     * provided to perform searches, the function must receive two arguments and
     * return true if they are equal, false otherwise. Example:</p>
     *
     * <pre>
     * const petsAreEqualByName = function(pet1, pet2) {
     *  return pet1.name === pet2.name;
     * }
     * </pre>
     * @param {Object} item element to search for.
     * @param {function(Object,Object):boolean=} equalsFunction Optional
     * function used to check if two elements are equal.
     * @return {number} the index in this list of the first occurrence
     * of the specified element, or -1 if this list does not contain the
     * element.
     */
    LinkedList.prototype.indexOf = function (item, equalsFunction) {
        var equalsF = equalsFunction || util.defaultEquals;
        if (util.isUndefined(item)) {
            return -1;
        }
        var currentNode = this.firstNode;
        var index = 0;
        while (currentNode !== null) {
            if (equalsF(currentNode.element, item)) {
                return index;
            }
            index++;
            currentNode = currentNode.next;
        }
        return -1;
    };
    /**
       * Returns true if this list contains the specified element.
       * <p>If the elements inside the list are
       * not comparable with the === operator a custom equals function should be
       * provided to perform searches, the function must receive two arguments and
       * return true if they are equal, false otherwise. Example:</p>
       *
       * <pre>
       * const petsAreEqualByName = function(pet1, pet2) {
       *  return pet1.name === pet2.name;
       * }
       * </pre>
       * @param {Object} item element to search for.
       * @param {function(Object,Object):boolean=} equalsFunction Optional
       * function used to check if two elements are equal.
       * @return {boolean} true if this list contains the specified element, false
       * otherwise.
       */
    LinkedList.prototype.contains = function (item, equalsFunction) {
        return (this.indexOf(item, equalsFunction) >= 0);
    };
    /**
     * Removes the first occurrence of the specified element in this list.
     * <p>If the elements inside the list are
     * not comparable with the === operator a custom equals function should be
     * provided to perform searches, the function must receive two arguments and
     * return true if they are equal, false otherwise. Example:</p>
     *
     * <pre>
     * const petsAreEqualByName = function(pet1, pet2) {
     *  return pet1.name === pet2.name;
     * }
     * </pre>
     * @param {Object} item element to be removed from this list, if present.
     * @return {boolean} true if the list contained the specified element.
     */
    LinkedList.prototype.remove = function (item, equalsFunction) {
        var equalsF = equalsFunction || util.defaultEquals;
        if (this.nElements < 1 || util.isUndefined(item)) {
            return false;
        }
        var previous = null;
        var currentNode = this.firstNode;
        while (currentNode !== null) {
            if (equalsF(currentNode.element, item)) {
                if (previous == null) {
                    this.firstNode = currentNode.next;
                    if (currentNode === this.lastNode) {
                        this.lastNode = null;
                    }
                }
                else if (currentNode === this.lastNode) {
                    this.lastNode = previous;
                    previous.next = currentNode.next;
                    currentNode.next = null;
                }
                else {
                    previous.next = currentNode.next;
                    currentNode.next = null;
                }
                this.nElements--;
                return true;
            }
            previous = currentNode;
            currentNode = currentNode.next;
        }
        return false;
    };
    /**
     * Removes all of the elements from this list.
     */
    LinkedList.prototype.clear = function () {
        this.firstNode = null;
        this.lastNode = null;
        this.nElements = 0;
    };
    /**
     * Returns true if this list is equal to the given list.
     * Two lists are equal if they have the same elements in the same order.
     * @param {LinkedList} other the other list.
     * @param {function(Object,Object):boolean=} equalsFunction optional
     * function used to check if two elements are equal. If the elements in the lists
     * are custom objects you should provide a function, otherwise
     * the === operator is used to check equality between elements.
     * @return {boolean} true if this list is equal to the given list.
     */
    LinkedList.prototype.equals = function (other, equalsFunction) {
        var eqF = equalsFunction || util.defaultEquals;
        if (!(other instanceof LinkedList)) {
            return false;
        }
        if (this.size() !== other.size()) {
            return false;
        }
        return this.equalsAux(this.firstNode, other.firstNode, eqF);
    };
    /**
    * @private
    */
    LinkedList.prototype.equalsAux = function (n1, n2, eqF) {
        while (n1 !== null && n2 !== null) {
            if (!eqF(n1.element, n2.element)) {
                return false;
            }
            n1 = n1.next;
            n2 = n2.next;
        }
        return true;
    };
    /**
     * Removes the element at the specified position in this list.
     * @param {number} index given index.
     * @return {*} removed element or undefined if the index is out of bounds.
     */
    LinkedList.prototype.removeElementAtIndex = function (index) {
        if (index < 0 || index >= this.nElements || this.firstNode === null || this.lastNode === null) {
            return undefined;
        }
        var element;
        if (this.nElements === 1) {
            //First node in the list.
            element = this.firstNode.element;
            this.firstNode = null;
            this.lastNode = null;
        }
        else {
            var previous = this.nodeAtIndex(index - 1);
            if (previous === null) {
                element = this.firstNode.element;
                this.firstNode = this.firstNode.next;
            }
            else if (previous.next === this.lastNode) {
                element = this.lastNode.element;
                this.lastNode = previous;
            }
            if (previous !== null && previous.next !== null) {
                element = previous.next.element;
                previous.next = previous.next.next;
            }
        }
        this.nElements--;
        return element;
    };
    /**
     * Executes the provided function once for each element present in this list in order.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    LinkedList.prototype.forEach = function (callback) {
        var currentNode = this.firstNode;
        while (currentNode !== null) {
            if (callback(currentNode.element) === false) {
                break;
            }
            currentNode = currentNode.next;
        }
    };
    /**
     * Reverses the order of the elements in this linked list (makes the last
     * element first, and the first element last).
     */
    LinkedList.prototype.reverse = function () {
        var previous = null;
        var current = this.firstNode;
        var temp = null;
        while (current !== null) {
            temp = current.next;
            current.next = previous;
            previous = current;
            current = temp;
        }
        temp = this.firstNode;
        this.firstNode = this.lastNode;
        this.lastNode = temp;
    };
    /**
     * Returns an array containing all of the elements in this list in proper
     * sequence.
     * @return {Array.<*>} an array containing all of the elements in this list,
     * in proper sequence.
     */
    LinkedList.prototype.toArray = function () {
        var array = [];
        var currentNode = this.firstNode;
        while (currentNode !== null) {
            array.push(currentNode.element);
            currentNode = currentNode.next;
        }
        return array;
    };
    /**
     * Returns the number of elements in this list.
     * @return {number} the number of elements in this list.
     */
    LinkedList.prototype.size = function () {
        return this.nElements;
    };
    /**
     * Returns true if this list contains no elements.
     * @return {boolean} true if this list contains no elements.
     */
    LinkedList.prototype.isEmpty = function () {
        return this.nElements <= 0;
    };
    LinkedList.prototype.toString = function () {
        return arrays.toString(this.toArray());
    };
    /**
     * @private
     */
    LinkedList.prototype.nodeAtIndex = function (index) {
        if (index < 0 || index >= this.nElements) {
            return null;
        }
        if (index === (this.nElements - 1)) {
            return this.lastNode;
        }
        var node = this.firstNode;
        for (var i = 0; i < index && node != null; i++) {
            node = node.next;
        }
        return node;
    };
    /**
     * @private
     */
    LinkedList.prototype.createNode = function (item) {
        return {
            element: item,
            next: null
        };
    };
    return LinkedList;
}()); // End of linked list
exports.default = LinkedList;

},{"./arrays":14,"./util":15}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LinkedList_1 = require("./LinkedList");
var Queue = /** @class */ (function () {
    /**
     * Creates an empty queue.
     * @class A queue is a First-In-First-Out (FIFO) data structure, the first
     * element added to the queue will be the first one to be removed. This
     * implementation uses a linked list as a container.
     * @constructor
     */
    function Queue() {
        this.list = new LinkedList_1.default();
    }
    /**
     * Inserts the specified element into the end of this queue.
     * @param {Object} elem the element to insert.
     * @return {boolean} true if the element was inserted, or false if it is undefined.
     */
    Queue.prototype.enqueue = function (elem) {
        return this.list.add(elem);
    };
    /**
     * Inserts the specified element into the end of this queue.
     * @param {Object} elem the element to insert.
     * @return {boolean} true if the element was inserted, or false if it is undefined.
     */
    Queue.prototype.add = function (elem) {
        return this.list.add(elem);
    };
    /**
     * Retrieves and removes the head of this queue.
     * @return {*} the head of this queue, or undefined if this queue is empty.
     */
    Queue.prototype.dequeue = function () {
        if (this.list.size() !== 0) {
            var el = this.list.first();
            this.list.removeElementAtIndex(0);
            return el;
        }
        return undefined;
    };
    /**
     * Retrieves, but does not remove, the head of this queue.
     * @return {*} the head of this queue, or undefined if this queue is empty.
     */
    Queue.prototype.peek = function () {
        if (this.list.size() !== 0) {
            return this.list.first();
        }
        return undefined;
    };
    /**
     * Returns the number of elements in this queue.
     * @return {number} the number of elements in this queue.
     */
    Queue.prototype.size = function () {
        return this.list.size();
    };
    /**
     * Returns true if this queue contains the specified element.
     * <p>If the elements inside this stack are
     * not comparable with the === operator, a custom equals function should be
     * provided to perform searches, the function must receive two arguments and
     * return true if they are equal, false otherwise. Example:</p>
     *
     * <pre>
     * const petsAreEqualByName (pet1, pet2) {
     *  return pet1.name === pet2.name;
     * }
     * </pre>
     * @param {Object} elem element to search for.
     * @param {function(Object,Object):boolean=} equalsFunction optional
     * function to check if two elements are equal.
     * @return {boolean} true if this queue contains the specified element,
     * false otherwise.
     */
    Queue.prototype.contains = function (elem, equalsFunction) {
        return this.list.contains(elem, equalsFunction);
    };
    /**
     * Checks if this queue is empty.
     * @return {boolean} true if and only if this queue contains no items; false
     * otherwise.
     */
    Queue.prototype.isEmpty = function () {
        return this.list.size() <= 0;
    };
    /**
     * Removes all of the elements from this queue.
     */
    Queue.prototype.clear = function () {
        this.list.clear();
    };
    /**
     * Executes the provided function once for each element present in this queue in
     * FIFO order.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    Queue.prototype.forEach = function (callback) {
        this.list.forEach(callback);
    };
    return Queue;
}()); // End of queue
exports.default = Queue;

},{"./LinkedList":12}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
/**
 * Returns the position of the first occurrence of the specified item
 * within the specified array.4
 * @param {*} array the array in which to search the element.
 * @param {Object} item the element to search.
 * @param {function(Object,Object):boolean=} equalsFunction optional function used to
 * check equality between 2 elements.
 * @return {number} the position of the first occurrence of the specified element
 * within the specified array, or -1 if not found.
 */
function indexOf(array, item, equalsFunction) {
    var equals = equalsFunction || util.defaultEquals;
    var length = array.length;
    for (var i = 0; i < length; i++) {
        if (equals(array[i], item)) {
            return i;
        }
    }
    return -1;
}
exports.indexOf = indexOf;
/**
 * Returns the position of the last occurrence of the specified element
 * within the specified array.
 * @param {*} array the array in which to search the element.
 * @param {Object} item the element to search.
 * @param {function(Object,Object):boolean=} equalsFunction optional function used to
 * check equality between 2 elements.
 * @return {number} the position of the last occurrence of the specified element
 * within the specified array or -1 if not found.
 */
function lastIndexOf(array, item, equalsFunction) {
    var equals = equalsFunction || util.defaultEquals;
    var length = array.length;
    for (var i = length - 1; i >= 0; i--) {
        if (equals(array[i], item)) {
            return i;
        }
    }
    return -1;
}
exports.lastIndexOf = lastIndexOf;
/**
 * Returns true if the specified array contains the specified element.
 * @param {*} array the array in which to search the element.
 * @param {Object} item the element to search.
 * @param {function(Object,Object):boolean=} equalsFunction optional function to
 * check equality between 2 elements.
 * @return {boolean} true if the specified array contains the specified element.
 */
function contains(array, item, equalsFunction) {
    return indexOf(array, item, equalsFunction) >= 0;
}
exports.contains = contains;
/**
 * Removes the first ocurrence of the specified element from the specified array.
 * @param {*} array the array in which to search element.
 * @param {Object} item the element to search.
 * @param {function(Object,Object):boolean=} equalsFunction optional function to
 * check equality between 2 elements.
 * @return {boolean} true if the array changed after this call.
 */
function remove(array, item, equalsFunction) {
    var index = indexOf(array, item, equalsFunction);
    if (index < 0) {
        return false;
    }
    array.splice(index, 1);
    return true;
}
exports.remove = remove;
/**
 * Returns the number of elements in the specified array equal
 * to the specified object.
 * @param {Array} array the array in which to determine the frequency of the element.
 * @param {Object} item the element whose frequency is to be determined.
 * @param {function(Object,Object):boolean=} equalsFunction optional function used to
 * check equality between 2 elements.
 * @return {number} the number of elements in the specified array
 * equal to the specified object.
 */
function frequency(array, item, equalsFunction) {
    var equals = equalsFunction || util.defaultEquals;
    var length = array.length;
    var freq = 0;
    for (var i = 0; i < length; i++) {
        if (equals(array[i], item)) {
            freq++;
        }
    }
    return freq;
}
exports.frequency = frequency;
/**
 * Returns true if the two specified arrays are equal to one another.
 * Two arrays are considered equal if both arrays contain the same number
 * of elements, and all corresponding pairs of elements in the two
 * arrays are equal and are in the same order.
 * @param {Array} array1 one array to be tested for equality.
 * @param {Array} array2 the other array to be tested for equality.
 * @param {function(Object,Object):boolean=} equalsFunction optional function used to
 * check equality between elemements in the arrays.
 * @return {boolean} true if the two arrays are equal
 */
function equals(array1, array2, equalsFunction) {
    var equals = equalsFunction || util.defaultEquals;
    if (array1.length !== array2.length) {
        return false;
    }
    var length = array1.length;
    for (var i = 0; i < length; i++) {
        if (!equals(array1[i], array2[i])) {
            return false;
        }
    }
    return true;
}
exports.equals = equals;
/**
 * Returns shallow a copy of the specified array.
 * @param {*} array the array to copy.
 * @return {Array} a copy of the specified array
 */
function copy(array) {
    return array.concat();
}
exports.copy = copy;
/**
 * Swaps the elements at the specified positions in the specified array.
 * @param {Array} array The array in which to swap elements.
 * @param {number} i the index of one element to be swapped.
 * @param {number} j the index of the other element to be swapped.
 * @return {boolean} true if the array is defined and the indexes are valid.
 */
function swap(array, i, j) {
    if (i < 0 || i >= array.length || j < 0 || j >= array.length) {
        return false;
    }
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
    return true;
}
exports.swap = swap;
function toString(array) {
    return '[' + array.toString() + ']';
}
exports.toString = toString;
/**
 * Executes the provided function once for each element present in this array
 * starting from index 0 to length - 1.
 * @param {Array} array The array in which to iterate.
 * @param {function(Object):*} callback function to execute, it is
 * invoked with one argument: the element value, to break the iteration you can
 * optionally return false.
 */
function forEach(array, callback) {
    for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
        var ele = array_1[_i];
        if (callback(ele) === false) {
            return;
        }
    }
}
exports.forEach = forEach;

},{"./util":15}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _hasOwnProperty = Object.prototype.hasOwnProperty;
exports.has = function (obj, prop) {
    return _hasOwnProperty.call(obj, prop);
};
/**
 * Default function to compare element order.
 * @function
 */
function defaultCompare(a, b) {
    if (a < b) {
        return -1;
    }
    else if (a === b) {
        return 0;
    }
    else {
        return 1;
    }
}
exports.defaultCompare = defaultCompare;
/**
 * Default function to test equality.
 * @function
 */
function defaultEquals(a, b) {
    return a === b;
}
exports.defaultEquals = defaultEquals;
/**
 * Default function to convert an object to a string.
 * @function
 */
function defaultToString(item) {
    if (item === null) {
        return 'COLLECTION_NULL';
    }
    else if (isUndefined(item)) {
        return 'COLLECTION_UNDEFINED';
    }
    else if (isString(item)) {
        return '$s' + item;
    }
    else {
        return '$o' + item.toString();
    }
}
exports.defaultToString = defaultToString;
/**
* Joins all the properies of the object using the provided join string
*/
function makeString(item, join) {
    if (join === void 0) { join = ','; }
    if (item === null) {
        return 'COLLECTION_NULL';
    }
    else if (isUndefined(item)) {
        return 'COLLECTION_UNDEFINED';
    }
    else if (isString(item)) {
        return item.toString();
    }
    else {
        var toret = '{';
        var first = true;
        for (var prop in item) {
            if (exports.has(item, prop)) {
                if (first) {
                    first = false;
                }
                else {
                    toret = toret + join;
                }
                toret = toret + prop + ':' + item[prop];
            }
        }
        return toret + '}';
    }
}
exports.makeString = makeString;
/**
 * Checks if the given argument is a function.
 * @function
 */
function isFunction(func) {
    return (typeof func) === 'function';
}
exports.isFunction = isFunction;
/**
 * Checks if the given argument is undefined.
 * @function
 */
function isUndefined(obj) {
    return (typeof obj) === 'undefined';
}
exports.isUndefined = isUndefined;
/**
 * Checks if the given argument is a string.
 * @function
 */
function isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
}
exports.isString = isString;
/**
 * Reverses a compare function.
 * @function
 */
function reverseCompareFunction(compareFunction) {
    if (isUndefined(compareFunction) || !isFunction(compareFunction)) {
        return function (a, b) {
            if (a < b) {
                return 1;
            }
            else if (a === b) {
                return 0;
            }
            else {
                return -1;
            }
        };
    }
    else {
        return function (d, v) {
            return compareFunction(d, v) * -1;
        };
    }
}
exports.reverseCompareFunction = reverseCompareFunction;
/**
 * Returns an equal function given a compare function.
 * @function
 */
function compareToEquals(compareFunction) {
    return function (a, b) {
        return compareFunction(a, b) === 0;
    };
}
exports.compareToEquals = compareToEquals;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Queue_1 = require("typescript-collections/dist/lib/Queue");
const util_1 = require("typescript-collections/dist/lib/util");
let sigma = require('sigma');
window.sigma = sigma;
require('sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('sigma/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('sigma/plugins/sigma.layout.noverlap/sigma.layout.noverlap');
var Status;
(function (Status) {
    Status[Status["RUNNING"] = 0] = "RUNNING";
    Status[Status["SUCCESS"] = 1] = "SUCCESS";
    Status[Status["FAILURE"] = 2] = "FAILURE";
})(Status = exports.Status || (exports.Status = {}));
function terminateAndReturn(id, blackboard, status) {
    delete blackboard[id];
    return status;
}
var blackboard = {};
function getActionTick(id) {
    return (precondition, effect, ticksRequired = 1) => {
        return () => {
            if (precondition()) {
                if (!blackboard[id]) {
                    blackboard[id] = {};
                    blackboard[id].ticksDone = ticksRequired;
                }
                if (blackboard[id].ticksDone > 0) {
                    blackboard[id].ticksDone--;
                    return Status.RUNNING;
                }
                else {
                    effect();
                    return terminateAndReturn(id, blackboard, Status.SUCCESS);
                }
            }
            else {
                return Status.FAILURE;
            }
        };
    };
}
function getGuardTick() {
    return (precondition, astTick, negate = false) => {
        return () => {
            let proceed = negate ? !precondition() : precondition();
            return proceed ? execute(astTick) : Status.FAILURE;
        };
    };
}
function getSequenceTick(id) {
    return (astTicks) => {
        return () => {
            if (!blackboard[id]) {
                blackboard[id] = {};
                blackboard[id].currentIndex = 0;
            }
            while (blackboard[id].currentIndex < astTicks.length) {
                var childStatus = execute(astTicks[blackboard[id].currentIndex]);
                if (childStatus == Status.RUNNING)
                    return Status.RUNNING;
                else if (childStatus == Status.FAILURE)
                    return terminateAndReturn(id, blackboard, Status.FAILURE);
                else if (childStatus == Status.SUCCESS)
                    blackboard[id].currentIndex += 1;
            }
            return terminateAndReturn(id, blackboard, Status.SUCCESS);
        };
    };
}
function getSelectorTick(id) {
    return (astTicks) => {
        return () => {
            if (!blackboard[id]) {
                blackboard[id] = {};
                blackboard[id].currentIndex = 0;
            }
            while (blackboard[id].currentIndex < astTicks.length) {
                var childStatus = execute(astTicks[blackboard[id].currentIndex]);
                if (childStatus == Status.RUNNING)
                    return Status.RUNNING;
                else if (childStatus == Status.SUCCESS)
                    return terminateAndReturn(id, blackboard, Status.SUCCESS);
                else if (childStatus == Status.FAILURE)
                    blackboard[id].currentIndex += 1;
            }
            return terminateAndReturn(id, blackboard, Status.FAILURE);
        };
    };
}
function execute(astTick) {
    return astTick();
}
exports.execute = execute;
var globalIdCounter = 0;
function action(precondition, effect, ticksRequired) {
    return getActionTick(globalIdCounter++)(precondition, effect, ticksRequired);
}
exports.action = action;
function guard(precondition, astTick) {
    return getGuardTick()(precondition, astTick);
}
exports.guard = guard;
function neg_guard(precondition, astTick) {
    return getGuardTick()(precondition, astTick, true);
}
exports.neg_guard = neg_guard;
/**
 * Cycles over its children: iterates to the next child on success of a child
 * Succeeds if all succeed, else fails
 * @param {Tick[]} astTicks
 * @returns {Tick}
 */
function sequence(astTicks) {
    return getSequenceTick(globalIdCounter++)(astTicks);
}
exports.sequence = sequence;
/**
 * Cycles over its children: iterates to the next child on failure of a child(think of it as if-else blocks)
 * Succeeds if even one succeeds, else fails
 * @param {Tick[]} astTicks
 * @returns {Tick}
 */
function selector(astTicks) {
    return getSelectorTick(globalIdCounter++)(astTicks);
}
exports.selector = selector;
/*--------------- APIs --------------- */
//0. utilities
// min and max are inclusive
function getRandNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.getRandNumber = getRandNumber;
//1. story instance
//1.1 locations
exports.locationGraph = {};
//add to both sides
function addLocation(locationName, adjacentLocations) {
    if (exports.locationGraph[locationName] == undefined) {
        exports.locationGraph[locationName] = [];
    }
    exports.locationGraph[locationName] = exports.locationGraph[locationName].concat(adjacentLocations);
    for (var i = 0; i < adjacentLocations.length; i++) {
        if (exports.locationGraph[adjacentLocations[i]] == undefined) {
            exports.locationGraph[adjacentLocations[i]] = [];
        }
        exports.locationGraph[adjacentLocations[i]].push(locationName);
    }
}
exports.addLocation = addLocation;
function areAdjacent(location1, location2) {
    console.log("Are adjacent: " + location1 + ", " + location2);
    if (exports.locationGraph[location1] == undefined || exports.locationGraph[location2] == undefined) {
        console.log("Either one/both locations undefined");
        return false;
    }
    for (var i = 0; i < exports.locationGraph[location1].length; i++) {
        if (exports.locationGraph[location1][i] == location2) {
            return true;
        }
    }
    return false;
}
exports.areAdjacent = areAdjacent;
//pathfinding primitives
function getNextLocation(start, destination) {
    var visited = {};
    var previous = {};
    for (var key in exports.locationGraph) {
        visited[key] = false;
    }
    visited[start] = true;
    var myQueue = new Queue_1.default();
    myQueue.enqueue(start);
    while (!myQueue.isEmpty()) {
        var current = myQueue.dequeue();
        if (current === destination) {
            break;
        }
        var neighbors = exports.locationGraph[current];
        for (var i = 0; i < neighbors.length; i++) {
            if (!visited[neighbors[i]]) {
                myQueue.enqueue(neighbors[i]);
                visited[neighbors[i]] = true;
                previous[neighbors[i]] = current;
            }
        }
    }
    var current = destination;
    if (current == start)
        return current;
    while (previous[current] != start) {
        current = previous[current];
    }
    return current;
}
exports.getNextLocation = getNextLocation;
//1.2 agents
exports.agents = [];
function addAgent(agentName) {
    exports.agents.push(agentName);
    return agentName;
}
exports.addAgent = addAgent;
//1.3 items
exports.items = [];
function addItem(itemName) {
    exports.items.push(itemName);
    return itemName;
}
exports.addItem = addItem;
//1.4 variables
var variables = {};
var agentVariables = {};
var itemVariables = {};
function setVariable(varName, value) {
    variables[varName] = value;
    return varName;
}
exports.setVariable = setVariable;
function setAgentVariable(agent, varName, value) {
    if (util_1.isUndefined(agentVariables[agent]))
        agentVariables[agent] = {};
    agentVariables[agent][varName] = value;
    return value;
}
exports.setAgentVariable = setAgentVariable;
function getVariable(varName) {
    if (util_1.isUndefined(variables[varName])) {
        console.log("Variable " + varName + " not set!");
        return;
    }
    return variables[varName];
}
exports.getVariable = getVariable;
function getAgentVariable(agent, varName) {
    if (util_1.isUndefined(agentVariables[agent]) || util_1.isUndefined(agentVariables[agent][varName])) {
        console.log("Variable " + varName + " for agent " + agent + " not set!");
        return;
    }
    return agentVariables[agent][varName];
}
exports.getAgentVariable = getAgentVariable;
function isVariableNotSet(varName) {
    return util_1.isUndefined(variables[varName]);
}
exports.isVariableNotSet = isVariableNotSet;
function isAgentVariableNotSet(agent, varName) {
    return util_1.isUndefined(agentVariables[agent]) || util_1.isUndefined(agentVariables[agent][varName]);
}
exports.isAgentVariableNotSet = isAgentVariableNotSet;
function setItemVariable(item, varName, value) {
    if (util_1.isUndefined(itemVariables[item]))
        itemVariables[item] = {};
    itemVariables[item][varName] = value;
    return value;
}
exports.setItemVariable = setItemVariable;
function getItemVariable(item, varName) {
    if (util_1.isUndefined(itemVariables[item]) || util_1.isUndefined(itemVariables[item][varName])) {
        console.log("Variable " + varName + " for item " + item + " not set!");
        return;
    }
    return itemVariables[item][varName];
}
exports.getItemVariable = getItemVariable;
//2
//agent-behavior tree mapping
var agentTrees = {};
function attachTreeToAgent(agent, tree) {
    agentTrees[agent] = tree;
}
exports.attachTreeToAgent = attachTreeToAgent;
//3.1
//user actions
//TODO add variables to user action texts
var userInteractionObject = {
    text: "",
    userActionsText: [],
    actionEffectsText: ""
};
var userInteractionTrees = [];
var userActions = {};
function runUserInteractionTrees() {
    userInteractionObject.text = "";
    userInteractionObject.userActionsText = [];
    userActions = {}; //{"Go to location X" : effect
    for (var i = 0; i < userInteractionTrees.length; i++) {
        execute(userInteractionTrees[i]);
    }
}
exports.displayDescriptionAction = (text) => action(() => true, () => userInteractionObject.text += "\n" + text, 0);
exports.displayActionEffectText = (text) => userInteractionObject.actionEffectsText += "\n" + text;
exports.addUserActionTree = (text, effectTree) => action(() => true, () => mapUserActionToTree(text, effectTree), 0);
exports.addUserAction = (text, effect) => action(() => true, () => mapUserActionToTree(text, action(() => true, effect, 0)), 0);
function mapUserActionToTree(text, tree) {
    userActions[text] = tree;
    userInteractionObject.userActionsText.push(text);
}
function addUserInteractionTree(tick) {
    userInteractionTrees.push(tick);
}
exports.addUserInteractionTree = addUserInteractionTree;
function executeUserAction(text) {
    //execute the user action
    userInteractionObject.actionEffectsText = "";
    var userActionEffectTree = userActions[text];
    execute(userActionEffectTree);
}
exports.executeUserAction = executeUserAction;
//4.
function initialize() {
    runUserInteractionTrees();
}
exports.initialize = initialize;
function getUserInteractionObject() {
    return userInteractionObject;
}
exports.getUserInteractionObject = getUserInteractionObject;
function worldTick() {
    //all agent ticks
    for (var i = 0; i < exports.agents.length; i++) {
        var tree = agentTrees[exports.agents[i]];
        if (!util_1.isUndefined(tree)) {
            setVariable("executingAgent", exports.agents[i]);
            execute(tree);
        }
    }
    runUserInteractionTrees();
}
exports.worldTick = worldTick;

},{"sigma":8,"sigma/plugins/sigma.layout.noverlap/sigma.layout.noverlap":9,"sigma/plugins/sigma.plugins.animate/sigma.plugins.animate":10,"sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes":11,"typescript-collections/dist/lib/Queue":13,"typescript-collections/dist/lib/util":15}],17:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const scripting_1 = require("./scripting");
const util_1 = require("typescript-collections/dist/lib/util");
//require all the library needed
let sigma = require('linkurious');
window.sigma = sigma;
require('linkurious/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('linkurious/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('linkurious/plugins/sigma.layouts.noverlap/sigma.layouts.noverlap');
require('linkurious/plugins/sigma.renderers.linkurious/canvas/sigma.canvas.nodes.def');
require('linkurious/plugins/sigma.plugins.tooltips/sigma.plugins.tooltips');
require('linkurious/plugins/sigma.plugins.design/sigma.plugins.design');
//File names
let filePrefix = "../data/university/";
let files = ["cfgGramma.csv", "Prefix.csv", "NPCconstraint.txt"];
//A structure for hierarchical generation
class cfgTrees {
    constructor(name, rule, prefix, prevName) {
        let cleanName;
        let idpre = '';
        let labelpre = '';
        this.branches = null;
        this.idLabel = {};
        this.assortedDict = {};
        this.items = null;
        //* means the names remain unchanged
        //$ means the names has a prefix as previous name
        //# means the location is expandable
        if (name.endsWith('*')) {
            cleanName = name.substring(0, name.length - 1);
        }
        else if (name.endsWith('$')) {
            cleanName = name.substring(0, name.length - 1);
            idpre = prevName + " ";
        }
        else {
            cleanName = name;
            idpre = retRand(prefix) + ' ';
            labelpre = idpre;
        }
        if (name.startsWith('#')) {
            this.branches = [];
            if (name.startsWith('#!')) {
                this.items = [];
                cleanName = cleanName.substring(2, cleanName.length);
                let rawitems = processRand(rule[cleanName]);
                for (let item of rawitems) {
                    this.items.push(prevName + " " + item);
                    this.idLabel[prevName + " " + item] = item;
                }
            }
            else {
                cleanName = cleanName.substring(1, cleanName.length);
            }
            let children = processRand(rule[cleanName]);
            for (let value of children) {
                let newBranch = new cfgTrees(value, rule, prefix, idpre + cleanName);
                combine(this.idLabel, newBranch.idLabel);
                combine(this.assortedDict, newBranch.assortedDict);
                this.branches.push(newBranch);
            }
        }
        else if (name.startsWith('!')) {
            cleanName = cleanName.substring(1, cleanName.length);
            this.items = [];
            let rawitems = processRand(rule[cleanName]);
            for (let item of rawitems) {
                this.items.push(prevName + " " + item);
                this.idLabel[prevName + " " + item] = item;
            }
        }
        this.val = idpre + cleanName;
        this.idLabel[this.val] = labelpre + cleanName;
        if (util_1.isUndefined(this.assortedDict[cleanName.toLowerCase()])) {
            this.assortedDict[cleanName.toLowerCase()] = [];
        }
        this.assortedDict[cleanName.toLowerCase()].push(this.val);
    }
    getValue() {
        return this.val;
    }
    getBranches() {
        return this.branches;
    }
    getIdLabelPair() {
        return this.idLabel;
    }
    // return the children's location names
    getBranchValues() {
        let ret = [];
        if (this.branches != null) {
            for (let value of this.branches) {
                ret.push(value.val);
            }
        }
        return ret;
    }
    //return a dict for expandable locations and their children
    getExpandList() {
        let expandList = {};
        if (this.branches != null) {
            expandList[this.val] = this.getBranchValues();
            for (let tree of this.branches) {
                combine(expandList, tree.getExpandList());
            }
        }
        return expandList;
    }
    //return a pair of each location and their parents' location
    getPrevnameList() {
        let PrevnameList = {};
        for (let name of this.getBranchValues()) {
            PrevnameList[name] = this.val;
        }
        if (this.branches != null) {
            for (let tree of this.branches) {
                combine(PrevnameList, tree.getPrevnameList());
            }
        }
        return PrevnameList;
    }
    //return a dict for assorted types
    getAssortedDict() {
        return this.assortedDict;
    }
    //return a dict for the location and items corresponding to each location.
    getItemsList() {
        let ret = {};
        if (this.items != null) {
            ret[this.val] = this.items;
        }
        if (this.branches != null) {
            for (let tree of this.branches) {
                combine(ret, tree.getItemsList());
            }
        }
        return ret;
    }
    //return a list of all locations in the map
    getAlllocations() {
        let ret = [];
        ret.push(this.getValue());
        if (this.branches != null) {
            for (let child of this.branches) {
                ret = ret.concat(child.getAlllocations());
            }
        }
        return ret;
    }
}
//A structure for NPC constraint
class constrain {
    constructor(data) {
        this.item = [];
        this.location = [];
        this.agent = [];
        this.locationItem = {};
        //read the value inside of a parenthesis.
        let regExp = /\(([^)]+)\)/;
        for (let val of data) {
            let parentheses = val.match(regExp)[1];
            let input = parentheses.split(',');
            //identify the motions of each goals.
            if (val.toLowerCase().startsWith('pickup')) {
                for (let i = 0; i < input.length; i++) {
                    while (input[i].startsWith(' ')) {
                        input[i] = input[i].substring(1);
                    }
                    while (input[i].endsWith(' ')) {
                        input[i] = input[i].substring(0, input[i].length - 1);
                    }
                }
                this.agent.push(input[0]);
                this.item.push(input[1]);
                this.location.push(input[2]);
                if (util_1.isUndefined(this.locationItem[input[2]])) {
                    this.locationItem[input[2]] = [];
                }
                this.locationItem[input[2]].push(input[1]);
            }
            else if (val.toLowerCase().startsWith('move')) {
                for (let i = 0; i < input.length; i++) {
                    while (input[i].startsWith(' ')) {
                        input[i] = input[i].substring(1);
                    }
                    while (input[i].endsWith(' ')) {
                        input[i] = input[i].substring(0, input[i].length - 1);
                    }
                }
                this.agent.push(input[0]);
                this.location.push(input[1]);
            }
        }
    }
}
//A function for combining to dictionary
function combine(dict1, dict2) {
    for (let val of Object.keys(dict2)) {
        if (util_1.isUndefined(dict1[val])) {
            dict1[val] = dict2[val];
        }
        else {
            dict1[val] = dict1[val].concat(dict2[val]);
        }
    }
    return dict1;
}
//A function for return and delete a random number from a list
function retRand(list) {
    let index = scripting_1.getRandNumber(0, list.length - 1);
    let ret = list[index];
    list.splice(index, 1);
    return ret;
}
//Reading the files
function readFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        let data = {};
        for (let file of files) {
            let value = yield new Promise(function (resolve, reject) {
                let req = new XMLHttpRequest();
                req.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            let lines = this.responseText.split(/\n|\r\n/);
                            data[file] = lines;
                            resolve(lines);
                        }
                        else {
                            reject(Error(req.statusText));
                        }
                    }
                };
                req.open("GET", filePrefix + file, true);
                req.responseType = "text";
                req.send(null);
            });
        }
        return Promise.resolve(data);
    });
}
//call all the functions needed
readFiles().then(function (value) {
    let tree = generateTree(value);
    let condition = processCondition(value);
    InitializeVilillane(tree, condition);
});
//From the raw data to generate the context-free grammar trees for the map
function generateTree(data) {
    let Prefix = data['Prefix.csv'];
    let newRule = {};
    let rawRule = data['cfgGramma.csv'];
    for (let i = 0; i < rawRule.length; i++) {
        let rows = rawRule[i].split(',');
        newRule[rows[0]] = rows[1];
    }
    return new cfgTrees('#University', newRule, Prefix, '');
}
//From the raw data to generate the constraints
function processCondition(data) {
    return new constrain(data["NPCconstraint.txt"]);
}
//For each elements of context free grammar, generate a random number of certain type
// of buildings according to the minimum and maximum
function processRand(data) {
    let children = data.split(';');
    let result = [];
    for (let j = 0; j < children.length; j++) {
        let elements = children[j].split('.');
        let num = scripting_1.getRandNumber(Number(elements[1]), Number(elements[2]));
        for (let k = 0; k < num; k++) {
            result.push(elements[0]);
        }
    }
    return result;
}
//Randomly generate a connected graphs from a list of nodes
function connectNodes(location) {
    let nodes = {};
    let visited = {};
    for (let i = 0; i < location.length; i++) {
        visited[location[i]] = false;
    }
    let stack = [];
    let rest = [];
    //randomly generate a graph
    for (let i = 0; i < location.length; i++) {
        if (util_1.isUndefined(nodes[location[i]])) {
            nodes[location[i]] = [];
        }
        for (let j = i + 1; j < location.length; j++) {
            if (util_1.isUndefined(nodes[location[j]])) {
                nodes[location[j]] = [];
            }
            if (Math.random() < (2 / location.length)) {
                nodes[location[i]].push(location[j]);
            }
        }
    }
    //making sure it is connected
    for (let i = 0; i < location.length; i++) {
        if (visited[location[i]] == false) {
            let item = location[i];
            stack.push(location[i]);
            while (stack.length > 0) {
                let cur = stack.pop();
                if (cur !== undefined) {
                    if (visited[cur] == false) {
                        visited[cur] = true;
                        if (Math.random() < 0.3) {
                            item = cur;
                        }
                        for (let val of nodes[cur]) {
                            stack.push(val);
                        }
                    }
                }
            }
            rest.push(item);
        }
    }
    for (let i = 0; i < rest.length - 1; i++) {
        nodes[rest[i]].push(rest[i + 1]);
    }
    return nodes;
}
function InitializeVilillane(Tree, condition) {
    //get assortDict for NPC constraint
    let assortDict = Tree.getAssortedDict();
    //get itemList for display items
    let itemsList = Tree.getItemsList();
    //get expandList to generate a expand graph
    let expandList = Tree.getExpandList();
    //get all initialized locations
    let originlocations = Tree.getAlllocations();
    //get the initialized id pair
    let idLabelPair = Tree.getIdLabelPair();
    //get the initialized prevname pairs
    let PrevnameList = Tree.getPrevnameList();
    // agents
    let alien = scripting_1.addAgent("Alien");
    // items
    let crewCard1 = scripting_1.addItem("Crew card1");
    let crewCard2 = scripting_1.addItem("Crew card2");
    // new constraint agents, locations and items
    let conditionAgent = condition.agent;
    let conditionlocation = condition.location;
    let conditionlocationItem = condition.locationItem;
    //Apply the constraint to change the initialized data.
    for (let agent of conditionAgent) {
        if (!scripting_1.agents.includes(agent)) {
            scripting_1.addAgent(agent);
        }
    }
    for (let loc of conditionlocation) {
        if (!Object.keys(assortDict).includes(loc.toLowerCase()) && !originlocations.includes(loc)) {
            expandList[Tree.getValue()].push(loc);
            PrevnameList[loc] = Tree.getValue();
            idLabelPair[loc] = loc;
        }
    }
    for (let loc of Object.keys(conditionlocationItem)) {
        if (!Object.keys(assortDict).includes(loc.toLowerCase()) && !originlocations.includes(loc)) {
            itemsList[loc] = conditionlocationItem[loc];
        }
        else if (Object.keys(assortDict).includes(loc.toLowerCase())) {
            if (util_1.isUndefined(itemsList[assortDict[loc][0]])) {
                itemsList[assortDict[loc][0]] = [];
            }
            itemsList[assortDict[loc][0]] = itemsList[assortDict[loc][0]].concat(conditionlocationItem[loc]);
        }
        else if (originlocations.includes(loc)) {
            if (util_1.isUndefined(itemsList[loc])) {
                itemsList[loc] = [];
            }
            else {
                itemsList[loc] = itemsList[loc].concat(conditionlocationItem[loc]);
            }
        }
    }
    for (let key of Object.keys(itemsList)) {
        for (let i = 0; i < itemsList[key].length; i++) {
            scripting_1.addItem(itemsList[key][i]);
            scripting_1.setItemVariable(itemsList[key][i], "currentLocation", key);
        }
    }
    //Generate the expandGraph from the modified expandList
    //For each expandable location, the dictionary contains a randomly connected graph for all its children
    let expandGraph = {};
    for (let keys of Object.keys(expandList)) {
        expandGraph[keys] = connectNodes(expandList[keys]);
    }
    console.log(itemsList);
    //Add locations to villanelle
    function addLocationGraph(graph) {
        for (let key in graph) {
            if (key !== Tree.getValue()) {
                scripting_1.addLocation(key, graph[key]);
            }
        }
    }
    addLocationGraph(expandList);
    for (let key in expandGraph) {
        addLocationGraph(expandGraph[key]);
    }
    let locations = Object.keys(scripting_1.locationGraph);
    //items variable
    scripting_1.setItemVariable(crewCard1, "currentLocation", retRand(locations));
    scripting_1.setItemVariable(crewCard2, "currentLocation", retRand(locations));
    let itemDisplay = scripting_1.setVariable("itemDisplay", false);
    // variables
    //alien
    scripting_1.setAgentVariable(alien, "currentLocation", retRand(locations));
    //player
    let playerLocation = scripting_1.setVariable("playerLocation", retRand(locations));
    let crewCardsCollected = scripting_1.setVariable("crewCardsCollected", 0);
    let inventory = scripting_1.setVariable("inventory", []);
    // 2. Define BTs
    // create ground actions
    //     itemsList[getVariable(playerLocation)] = [];
    //
    //     allItems.push("card");
    //     addItem("card");
    //     setItemVariable("card", "currentLocation", getVariable(playerLocation));
    //     itemsList[getVariable(playerLocation)].push("card");
    //     allItems.push("book");
    //     addItem("book");
    //     setItemVariable("book", "currentLocation", getVariable(playerLocation));
    //     itemsList[getVariable(playerLocation)].push("book");
    //     allItems.push("key");
    //     addItem("key");
    //     setItemVariable("key", "currentLocation", getVariable(playerLocation));
    //     itemsList[getVariable(playerLocation)].push("key");
    //Recover location array
    locations = Object.keys(scripting_1.locationGraph);
    let setRandNumber = scripting_1.action(() => true, () => {
        scripting_1.setVariable("randNumber", scripting_1.getRandNumber(1, locations.length));
    }, 0);
    //Initialize behavior tree for aliens
    let BTlist = [];
    let id = 0;
    for (let i = 0; i < locations.length; i++) {
        //console.log(locations[i]);
        let actions = scripting_1.action(() => scripting_1.getVariable("randNumber") == i + 1, () => scripting_1.setVariable("destination", locations[i]), 0);
        BTlist.push(actions);
    }
    let atDestination = () => scripting_1.getVariable("destination") == scripting_1.getAgentVariable(alien, "currentLocation");
    let setDestinationPrecond = () => scripting_1.isVariableNotSet("destination") || atDestination();
    // create behavior trees
    let setNextDestination = scripting_1.sequence([
        setRandNumber,
        scripting_1.selector(BTlist),
    ]);
    let gotoNextLocation = scripting_1.action(() => true, () => {
        scripting_1.setAgentVariable(alien, "currentLocation", scripting_1.getNextLocation(scripting_1.getAgentVariable(alien, "currentLocation"), scripting_1.getVariable("destination")));
        console.log("Alien is at: " + scripting_1.getAgentVariable(alien, "currentLocation"));
    }, 0);
    let eatPlayer = scripting_1.action(() => scripting_1.getAgentVariable(alien, "currentLocation") == scripting_1.getVariable(playerLocation), () => {
        scripting_1.setVariable("endGame", "lose");
        scripting_1.setVariable(playerLocation, "NA");
    }, 0);
    let search = scripting_1.sequence([
        scripting_1.selector([
            scripting_1.guard(setDestinationPrecond, setNextDestination),
            scripting_1.action(() => true, () => {
            }, 0)
        ]),
        gotoNextLocation,
    ]);
    let alienBT = scripting_1.selector([
        eatPlayer,
        scripting_1.sequence([
            search, eatPlayer
        ])
    ]);
    //attach behaviour trees to agents
    scripting_1.attachTreeToAgent(alien, alienBT);
    // 3. Construct story
    // create user actions from the graphs
    for (let key in scripting_1.locationGraph) {
        let seq = [];
        seq.push(scripting_1.displayDescriptionAction("You enter the " + idLabelPair[key] + "."));
        seq.push(scripting_1.addUserAction("Stay where you are.", () => {
        }));
        //Check whether it's in a lower layer
        if (Object.keys(scripting_1.locationGraph).includes(PrevnameList[key])) {
            seq.push(scripting_1.addUserAction("Go outside to " + idLabelPair[PrevnameList[key]] + ".", () => {
                scripting_1.setVariable(playerLocation, PrevnameList[key]);
            }));
        }
        //Check whether it's has a children
        if (Object.keys(expandList).includes(key)) {
            seq.push(scripting_1.addUserAction("Go inside " + idLabelPair[key] + " to enter " + idLabelPair[expandList[key][0]] + ".", () => scripting_1.setVariable(playerLocation, expandList[key][0])));
        }
        let graph = completeGraph(expandGraph[PrevnameList[key]]);
        for (let adj of graph[key]) {
            seq.push(scripting_1.addUserAction("Enter the " + idLabelPair[adj] + ".", () => scripting_1.setVariable(playerLocation, adj)));
        }
        let StateBT = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == key && scripting_1.getVariable(itemDisplay) == false, scripting_1.sequence(seq));
        scripting_1.addUserInteractionTree(StateBT);
    }
    //Behavior tree for items
    let itemBT = scripting_1.guard(() => !util_1.isUndefined(itemsList[scripting_1.getVariable(playerLocation)]) && itemsList[scripting_1.getVariable(playerLocation)].length != 0 && scripting_1.getVariable(itemDisplay) == false, scripting_1.sequence([
        scripting_1.displayDescriptionAction("You notice items lying around."),
        scripting_1.addUserAction("show all the items", () => scripting_1.setVariable(itemDisplay, true))
    ]));
    //attach the bt to thr tree
    scripting_1.addUserInteractionTree(itemBT);
    //Create behavior trees for every items
    for (let i = 0; i < scripting_1.items.length; i++) {
        let showitemBT = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == scripting_1.getItemVariable(scripting_1.items[i], "currentLocation") && scripting_1.getVariable(itemDisplay) == true, scripting_1.sequence([
            scripting_1.addUserAction("Pick up the " + scripting_1.items[i] + ".", () => {
                scripting_1.setVariable(itemDisplay, false);
                let curInv = scripting_1.getVariable("inventory");
                curInv.push(scripting_1.items[i]);
                itemsList[scripting_1.getVariable(playerLocation)].splice(itemsList[scripting_1.getVariable(playerLocation)].indexOf(scripting_1.items[i]), 1);
                scripting_1.displayActionEffectText("You pick up the " + scripting_1.items[i] + ".");
                scripting_1.setItemVariable(scripting_1.items[i], "currentLocation", "player");
                scripting_1.setVariable("inventory", curInv);
            })
        ]));
        scripting_1.addUserInteractionTree(showitemBT);
    }
    //crewcard BT
    let crewCard1BT = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == scripting_1.getItemVariable(crewCard1, "currentLocation"), scripting_1.sequence([
        scripting_1.displayDescriptionAction("You notice a crew card lying around."),
        scripting_1.addUserActionTree("Pick up the crew card", scripting_1.sequence([
            scripting_1.action(() => true, () => {
                scripting_1.displayActionEffectText("You pick up the crew card.");
                scripting_1.setItemVariable(crewCard1, "currentLocation", "player");
                scripting_1.setVariable(crewCardsCollected, scripting_1.getVariable(crewCardsCollected) + 1);
            }, 0),
            scripting_1.action(() => true, () => {
                scripting_1.displayActionEffectText("Wow you know how to pick up things.");
            }, 0)
        ]))
    ]));
    let crewCard2BT = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == scripting_1.getItemVariable(crewCard2, "currentLocation"), scripting_1.sequence([
        scripting_1.displayDescriptionAction("You notice a crew card lying around."),
        scripting_1.addUserAction("Pick up the crew card", () => {
            scripting_1.displayActionEffectText("You pick up the crew card.");
            scripting_1.setItemVariable(crewCard2, "currentLocation", "player");
            scripting_1.setVariable(crewCardsCollected, scripting_1.getVariable(crewCardsCollected) + 1);
        })
    ]));
    //A BT for the exit
    let ExitBT = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == "Exit", scripting_1.selector([
        scripting_1.guard(() => scripting_1.getVariable(crewCardsCollected) >= 2, scripting_1.sequence([
            scripting_1.displayDescriptionAction("You can now activate the exit and flee!"),
            scripting_1.addUserAction("Activate and get out!", () => {
                scripting_1.setVariable("endGame", "win");
                scripting_1.setVariable(playerLocation, "NA");
            })
        ])),
        scripting_1.displayDescriptionAction("You need 2 crew cards to activate the exit elevator system.")
    ]));
    scripting_1.addUserInteractionTree(crewCard1BT);
    scripting_1.addUserInteractionTree(crewCard2BT);
    scripting_1.addUserInteractionTree(ExitBT);
    let alienNearby = scripting_1.guard(() => scripting_1.areAdjacent(scripting_1.getVariable(playerLocation), scripting_1.getAgentVariable(alien, "currentLocation")), scripting_1.displayDescriptionAction("You hear a thumping sound. The alien is nearby."));
    scripting_1.addUserInteractionTree(alienNearby);
    let gameOver = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == "NA", scripting_1.selector([
        scripting_1.guard(() => scripting_1.getVariable("endGame") == "win", scripting_1.displayDescriptionAction("You have managed to escape!")),
        scripting_1.guard(() => scripting_1.getVariable("endGame") == "lose", scripting_1.displayDescriptionAction("The creature grabs you before you can react! You struggle for a bit before realising it's all over.."))
    ]));
    scripting_1.addUserInteractionTree(gameOver);
    //Initialize sigma for player and alien
    let sigmaPlayer = new sigma({
        graph: {
            nodes: [],
            edges: []
        },
        renderer: {
            type: 'canvas',
            container: 'player-container'
        },
        settings: {
            nodeBorderSize: 5,
            defaultNodeBorderColor: '#fff',
            defaultNodeHoverBorderColor: '#fff',
            defaultNodeColor: '#000',
            defaultLabelColor: '#fff',
            defaultEdgeColor: '#fff',
            edgeColor: 'default',
            maxNodeSize: 20,
            sideMargin: 15
        }
    });
    // var tooltipPlayer = sigma.plugins.tooltips(
    //     sigmaPlayer,
    //     sigmaPlayer.renderers[0],
    //     {
    //         node: [{
    //             show: 'clickNode',
    //             template: 'Hello node!'
    //         }]
    //     }
    // );
    let sigmaAlien = new sigma({
        graph: {
            nodes: [],
            edges: []
        },
        renderer: {
            type: 'canvas',
            container: 'alien-container'
        },
        settings: {
            nodeBorderSize: 5,
            defaultNodeBorderColor: '#fff',
            defaultNodeColor: '#000',
            defaultLabelColor: '#fff',
            defaultEdgeColor: '#fff',
            edgeColor: 'default',
            maxNodeSize: 20,
            sideMargin: 15
        }
    });
    // var tooltipAlien = sigma.plugins.tooltips(
    //     sigmaAlien,
    //     sigmaAlien.renderers[0],
    //     {
    //         node: [{
    //             show: 'clickNode',
    //             template: 'Hello node!'
    //         }]
    //     }
    // );
    //A unique ID for each edge.
    let edgeID = 0;
    //Clear the graph.
    function clear(sigma) {
        let nodes = sigma.graph.nodes();
        for (let node of nodes) {
            sigma.graph.dropNode(node.id);
        }
    }
    //The graph generate by connect-node is one direction
    //This function make it two-direction
    function completeGraph(graph) {
        let retGraph = {};
        for (let key in graph) {
            if (util_1.isUndefined(retGraph[key])) {
                retGraph[key] = [];
            }
            retGraph[key] = retGraph[key].concat(graph[key]);
            for (let loc of graph[key]) {
                if (util_1.isUndefined(retGraph[loc])) {
                    retGraph[loc] = [];
                }
                retGraph[loc].push(key);
            }
        }
        return retGraph;
    }
    //Show the adjacent node of the input node
    function showAround(input, sigmaInstance) {
        let graph = completeGraph(expandGraph[PrevnameList[input]]);
        let adjacent = graph[input];
        let numberLayer = adjacent.length;
        if (util_1.isUndefined(sigmaInstance.graph.nodes(input))) {
            sigmaInstance.graph.addNode({
                // Main attributes:
                id: input,
                label: idLabelPair[input],
                x: 0,
                y: 0,
                size: 15,
            });
        }
        for (let i = 0; i < numberLayer; i++) {
            if (util_1.isUndefined(sigmaInstance.graph.nodes(adjacent[i]))) {
                sigmaInstance.graph.addNode({
                    // Main attributes:
                    id: adjacent[i],
                    label: idLabelPair[adjacent[i]],
                    x: Math.cos(Math.PI * 2 * (i - 1 / 3) / numberLayer) * 40 + sigmaInstance.graph.nodes(input).x,
                    y: Math.sin(Math.PI * 2 * (i - 1 / 3) / numberLayer) * 40 + sigmaInstance.graph.nodes(input).y,
                    size: 15,
                });
            }
            sigmaInstance.graph.addEdge({
                id: 'edge' + (edgeID++).toString(),
                source: adjacent[i],
                target: sigmaInstance.graph.nodes(input).id,
                size: 1,
                color: "#fff"
            });
        }
    }
    function show(inputid, sigmaInstance) {
        let graph = completeGraph(expandGraph[PrevnameList[inputid]]);
        let adjacent = graph[inputid];
        let numberLayer = adjacent.length;
        showAround(inputid, sigmaInstance);
        //Show additional nodes if all the node in this layer is small enough
        if (Object.keys(graph).length < 10) {
            for (let layer1 of adjacent) {
                showAround(layer1, sigmaInstance);
                let newAdjacent = graph[layer1];
                for (let layer2 of newAdjacent) {
                    showAround(layer2, sigmaInstance);
                }
            }
        }
    }
    //for dragging the nodes.
    let dragListener1 = sigma.plugins.dragNodes(sigmaPlayer, sigmaPlayer.renderers[0]);
    dragListener1.bind('startdrag', function (event) {
        console.log(event);
    });
    dragListener1.bind('drag', function (event) {
        console.log(event);
    });
    dragListener1.bind('drop', function (event) {
        console.log(event);
    });
    dragListener1.bind('dragend', function (event) {
        console.log(event);
    });
    let dragListener2 = sigma.plugins.dragNodes(sigmaAlien, sigmaAlien.renderers[0]);
    dragListener2.bind('startdrag', function (event) {
        console.log(event);
    });
    dragListener2.bind('drag', function (event) {
        console.log(event);
    });
    dragListener2.bind('drop', function (event) {
        console.log(event);
    });
    dragListener2.bind('dragend', function (event) {
        console.log(event);
    });
    //4. Run the world
    scripting_1.initialize();
    let userInteractionObject = scripting_1.getUserInteractionObject();
    //RENDERING-----
    //let displayPanel = {x: 500, y: 0};
    let textPanel = { x: 450, y: 350 };
    let actionsPanel = { x: 470, y: 375 };
    function render() {
        //for all the parents locations of the agents
        let alienPrevs = [];
        let playerPrevs = [];
        let AlienPrevLocs;
        let PlayerPrevLocs;
        //get agents' current location
        let alienLocation = scripting_1.getAgentVariable(alien, "currentLocation");
        let playerL = scripting_1.getVariable(playerLocation);
        //generate all the parents locations of the alien
        AlienPrevLocs = PrevnameList[alienLocation];
        while (AlienPrevLocs != Tree.getValue()) {
            alienPrevs.push(AlienPrevLocs);
            AlienPrevLocs = PrevnameList[AlienPrevLocs];
        }
        //make sure the game is not ended.
        if (Object.keys(scripting_1.locationGraph).includes(playerL)) {
            //generate all the parents locations of the player
            PlayerPrevLocs = PrevnameList[playerL];
            while (PlayerPrevLocs != Tree.getValue()) {
                playerPrevs.push(PlayerPrevLocs);
                PlayerPrevLocs = PrevnameList[PlayerPrevLocs];
            }
            clear(sigmaPlayer);
            clear(sigmaAlien);
            show(playerL, sigmaPlayer);
            show(alienLocation, sigmaAlien);
            var playerText = document.getElementsByClassName("lefttext");
            playerText[0].innerHTML = "level: " + playerPrevs.length.toString() + ", currently inside " + PrevnameList[playerL];
            var AgentText = document.getElementsByClassName("righttext");
            AgentText[0].innerHTML = "level: " + alienPrevs.length.toString() + ", currently inside " + PrevnameList[alienLocation];
        }
        else {
            clear(sigmaAlien);
            clear(sigmaPlayer);
            sigmaPlayer.refresh();
            sigmaAlien.refresh();
            //show(alienLocation, sigmaAlien);
        }
        //show the locations of player and agents on the graph
        for (let node of sigmaPlayer.graph.nodes()) {
            if (node.id == alienLocation) {
                node.image = { url: '../images/xenomorph.png' };
            }
            if (node.id == playerL) {
                node.image = { url: '../images/player2.png' };
            }
            if (alienPrevs.includes(node.id)) {
                node.border_color = '#ff0000';
            }
            if (!util_1.isUndefined(itemsList[node.id]) && itemsList[node.id].length != 0) {
                node.border_color = '#0000FF';
            }
        }
        for (let node of sigmaAlien.graph.nodes()) {
            if (node.id == alienLocation) {
                node.image = { url: '../images/xenomorph.png' };
            }
            if (node.id == playerL) {
                node.image = { url: '../images/player2.png' };
            }
            if (playerPrevs.includes(node.id)) {
                node.border_color = '#ADFF2F';
            }
        }
        sigmaPlayer.refresh();
        sigmaAlien.refresh();
        let config = {
            nodeMargin: 50,
            gridSize: 5,
        };
        //algorithm for no lapping layout.
        //Configure the algorithm
        let listener1 = sigmaPlayer.configNoverlap(config);
        let listener2 = sigmaAlien.configNoverlap(config);
        //Bind all events:
        listener1.bind('start stop interpolate', function (event) {
            console.log(event.type);
        });
        listener2.bind('start stop interpolate', function (event) {
            console.log(event.type);
        });
        //Start the algorithm:
        sigmaPlayer.startNoverlap();
        sigmaAlien.startNoverlap();
        displayTextAndActions();
    }
    let canvas = document.getElementById('display');
    let context = canvas.getContext('2d');
    let currentSelection;
    let yOffset = actionsPanel.y + 25;
    let yOffsetIncrement = 30;
    function displayTextAndActions() {
        context.clearRect(textPanel.x, textPanel.y, 1000, 1000);
        yOffset = actionsPanel.y + 25;
        context.font = "15pt Calibri";
        context.fillStyle = 'white';
        console.log("Actions effect text: " + userInteractionObject.actionEffectsText);
        let textToDisplay = userInteractionObject.actionEffectsText.length != 0 ? userInteractionObject.actionEffectsText : userInteractionObject.text;
        context.fillText(textToDisplay, textPanel.x, textPanel.y + 20);
        context.font = "15pt Calibri";
        context.fillStyle = 'white';
        for (let i = 0; i < userInteractionObject.userActionsText.length; i++) {
            let userActionText = userInteractionObject.userActionsText[i];
            context.fillText(userActionText, actionsPanel.x + 20, yOffset);
            if (i == 0) {
                currentSelection = i;
            }
            yOffset += yOffsetIncrement;
        }
        displayArrow();
        console.log("Crew cards: " + scripting_1.getVariable(crewCardsCollected));
    }
    function displayArrow() {
        if (userInteractionObject.userActionsText.length != 0) {
            context.clearRect(actionsPanel.x, actionsPanel.y, 20, 1000);
            context.fillText("> ", 470, actionsPanel.y + 25 + (currentSelection * yOffsetIncrement));
        }
    }
    //User input
    function keyPress(e) {
        if (e.keyCode == 13) {
            let selectedAction = userInteractionObject.userActionsText[currentSelection];
            if (!util_1.isUndefined(selectedAction)) {
                scripting_1.executeUserAction(selectedAction);
                scripting_1.worldTick();
                render();
            }
        }
    }
    function keyDown(e) {
        if (e.keyCode == 40) { //down
            if (userInteractionObject.userActionsText.length != 0) {
                currentSelection++;
                currentSelection = currentSelection % userInteractionObject.userActionsText.length;
                displayArrow();
            }
        }
        else if (e.keyCode == 38) { //up
            if (userInteractionObject.userActionsText.length != 0) {
                currentSelection--;
                if (currentSelection < 0)
                    currentSelection = userInteractionObject.userActionsText.length - 1;
                displayArrow();
            }
        }
    }
    render();
    document.addEventListener("keypress", keyPress, false);
    document.addEventListener("keydown", keyDown, false);
}

},{"./scripting":16,"linkurious":1,"linkurious/plugins/sigma.layouts.noverlap/sigma.layouts.noverlap":2,"linkurious/plugins/sigma.plugins.animate/sigma.plugins.animate":3,"linkurious/plugins/sigma.plugins.design/sigma.plugins.design":4,"linkurious/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes":5,"linkurious/plugins/sigma.plugins.tooltips/sigma.plugins.tooltips":6,"linkurious/plugins/sigma.renderers.linkurious/canvas/sigma.canvas.nodes.def":7,"typescript-collections/dist/lib/util":15}]},{},[17])