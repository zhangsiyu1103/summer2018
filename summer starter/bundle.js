(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* linkurious.js - A Javascript toolkit to speed up the development of graph visualization and interaction applications. - Version: 1.5.2 - Author: Linkurious SAS - License: GPLv3 */

(function(a){"use strict";if("undefined"==typeof sigma)throw new Error("sigma is not declared");var b=new sigma.utils.map;sigma.classes.graph.attach("addNode","sigma.helpers.graph.addNode",function(a){a.fixed&&b.set(a.id,this.nodesIndex.get(a.id))}),sigma.classes.graph.attachBefore("dropNode","sigma.helpers.graph.dropNode",function(a){b["delete"](a)}),sigma.classes.graph.attachBefore("clear","sigma.helpers.graph.clear",function(){b.clear(),b=new sigma.utils.map}),sigma.classes.graph.hasMethod("fixNode")||sigma.classes.graph.addMethod("fixNode",function(a){return this.nodesIndex.get(a)&&(this.nodesIndex.get(a).fixed=!0,b.set(a,this.nodesIndex.get(a))),this}),sigma.classes.graph.hasMethod("unfixNode")||sigma.classes.graph.addMethod("unfixNode",function(c){return this.nodesIndex.get(c)&&(this.nodesIndex.get(c).fixed=a,b["delete"](c)),this}),sigma.classes.graph.hasMethod("getFixedNodes")||sigma.classes.graph.addMethod("getFixedNodes",function(){var a=[];return b.forEach(function(b,c){a.push(b)}),a}),sigma.classes.graph.hasMethod("hasFixedNodes")||sigma.classes.graph.addMethod("hasFixedNodes",function(){return 0!=b.size}),sigma.classes.graph.hasMethod("dropNodes")||sigma.classes.graph.addMethod("dropNodes",function(a){if(arguments.length>1)throw new Error("Too many arguments. Use an array instead.");if("string"==typeof a||"number"==typeof a)this.dropNode(a);else{if(!Array.isArray(a))throw new TypeError('Invalid argument: "v" is not a string, a number, or an array, was '+a);var b,c;for(b=0,c=a.length;c>b;b++){if("string"!=typeof a[b]&&"number"!=typeof a[b])throw new TypeError("Invalid argument: a node id is not a string or a number, was "+a[b]);this.dropNode(a[b])}}return this}),sigma.classes.graph.hasMethod("dropEdges")||sigma.classes.graph.addMethod("dropEdges",function(a){if(arguments.length>1)throw new Error("Too many arguments. Use an array instead.");if("string"==typeof a||"number"==typeof a)this.dropEdge(a);else{if(!Array.isArray(a))throw new TypeError("Invalid argument: it is not a string, a number, or an array, was "+a);var b,c;for(b=0,c=a.length;c>b;b++){if("string"!=typeof a[b]&&"number"!=typeof a[b])throw new TypeError("Invalid argument: an edge id is not a string or a number, was "+a[b]);this.dropEdge(a[b])}}return this}),sigma.classes.graph.hasMethod("adjacentNodes")||sigma.classes.graph.addMethod("adjacentNodes",function(a,b){if(b=b||{},b.withHidden=2==arguments.length?b.withHidden:!0,"string"!=typeof a&&"number"!=typeof a)throw new TypeError("The node id is not a string or a number, was "+a);var c,d=this,e=[];return(this.allNeighborsIndex.get(a)||[]).forEach(function(f,g){b.withHidden?e.push(d.nodesIndex.get(g)):d.nodes(g).hidden||(c=0!=d.allNeighborsIndex.get(a).get(g).keyList().map(function(a){return d.edges(a)}).filter(function(a){return!a.hidden}).length,c&&e.push(d.nodesIndex.get(g)))}),e}),sigma.classes.graph.hasMethod("adjacentEdges")||sigma.classes.graph.addMethod("adjacentEdges",function(a,b){if(b=b||{},b.withHidden=2==arguments.length?b.withHidden:!0,"string"!=typeof a&&"number"!=typeof a)throw new TypeError("The node id is not a string or a number, was "+a);var c=this,d=this.allNeighborsIndex.get(a)||[],e=[];return d.forEach(function(a,f){d.get(f).forEach(function(a,d){(b.withHidden||!c.edges(d).hidden)&&e.push(c.edges(d))})}),e})}).call(this),function(a){"use strict";function b(a,b,c){var d=null,e=null,f=null;if(window.Blob?(d=new Blob([a],{type:"text/xml"}),e=window.URL.createObjectURL(d)):f="data:text/xml;charset=UTF-8,"+encodeURIComponent('<?xml version="1.0" encoding="UTF-8"?>')+encodeURIComponent(a),navigator.msSaveBlob)navigator.msSaveBlob(d,c);else if(navigator.msSaveOrOpenBlob)navigator.msSaveOrOpenBlob(d,c);else{var g=document.createElement("a");g.setAttribute("href",window.Blob?e:f),g.setAttribute("download",c||"graph."+b),document.body.appendChild(g),g.click(),document.body.removeChild(g)}e&&setTimeout(function(){window.URL.revokeObjectURL(e)},0)}function c(a,b){return null===b?null:b.split(".").reduce(function(a,b){return a[b]},a)}function d(a){var b=/^#?([a-f\d])([a-f\d])([a-f\d])$/i;a=a.replace(b,function(a,b,c,d){return b+b+c+c+d+d});var c=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);return c?[parseInt(c[1],16),parseInt(c[2],16),parseInt(c[3],16)]:null}function e(){var a=new Date,b=a.getDate(),c=a.getMonth()+1,d=a.getFullYear();return 10>b&&(b="0"+b),10>c&&(c="0"+c),d+"-"+c+"-"+b}function f(a){return a===+a&&a===(0|a)}function g(a,b){return"integer"===b&&"number"==typeof a?f(a)||(b="float"):"number"!=typeof a&&(b="string","boolean"==typeof a&&(b="boolean")),b}if("undefined"==typeof sigma)throw"sigma.exporters.gexf: sigma is not declared";sigma.prototype.toGEXF=function(a){a=a||{};var f,h=document.implementation.createDocument("","",null),i=new XMLSerializer,j="",k=!0,l=this.graph.nodes(),m=this.graph.edges();a.renderer&&(k=a.renderer instanceof sigma.renderers.webgl,f=k?a.renderer.camera.prefix:a.renderer.camera.readPrefix);var n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H={},I=0,J={},K=0;D=h.createElement("gexf"),D.setAttribute("xmlns","http://www.gexf.net/1.2draft"),D.setAttribute("xmlns:viz","http://www.gexf.net/1.2draft/viz"),D.setAttribute("xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance"),D.setAttribute("xsi:schemaLocation","http://www.gexf.net/1.2draft http://www.gexf.net/1.2draft/gexf.xsd"),D.setAttribute("version","1.2"),A=h.createElement("meta"),A.setAttribute("lastmodifieddate",e()),a.creator&&(v=h.createElement("creator"),G=h.createTextNode(""+a.creator),v.appendChild(G),A.appendChild(v)),a.description&&(w=h.createElement("description"),G=h.createTextNode(""+a.description),w.appendChild(G),A.appendChild(w)),z=h.createElement("graph"),z.setAttribute("mode","static"),B=h.createElement("nodes");for(var L=0;L<l.length;L++){if(n=l[L],C=h.createElement("node"),C.setAttribute("id",n.id),n.label&&C.setAttribute("label",n.label),o=c(n,a.nodeAttributes),o&&(q=h.createElement("attvalues"),Object.keys(o).forEach(function(a){a in H||(H[a]={id:I,type:"integer"},I++);var b=o[a];H[a].type=g(b,H[a].type),r=h.createElement("attvalue"),r.setAttribute("for",H[a].id),r.setAttribute("value",b),q.appendChild(r)}),C.appendChild(q)),a.renderer){if(n.color){var M;M="#"===n.color[0]?d(n.color):n.color.match(/\d+/g),M.length>2&&(u=h.createElement("viz:color"),u.setAttribute("r",M[0]),u.setAttribute("g",M[1]),u.setAttribute("b",M[2]),M.length>3&&(5===M.length?u.setAttribute("a",M[3]+"."+M[4]):u.setAttribute("a",M[3])),C.appendChild(u))}E=h.createElement("viz:position"),E.setAttribute("x",n[f+"x"]),E.setAttribute("y",-parseInt(n[f+"y"],10)),C.appendChild(E),n.size&&(F=h.createElement("viz:size"),F.setAttribute("value",n[f+"size"]),C.appendChild(F))}B.appendChild(C)}s=h.createElement("attributes"),s.setAttribute("class","node"),Object.keys(H).forEach(function(a){p=h.createElement("attribute"),p.setAttribute("id",H[a].id),p.setAttribute("title",a),p.setAttribute("type",H[a].type),s.appendChild(p)}),x=h.createElement("edges");for(var L=0;L<m.length;L++){if(n=m[L],y=h.createElement("edge"),y.setAttribute("id",n.id),y.setAttribute("source",n.source),y.setAttribute("target",n.target),n.size&&y.setAttribute("weight",n.size),n.label&&y.setAttribute("label",n.label),o=c(n,a.edgeAttributes),o&&(q=h.createElement("attvalues"),Object.keys(o).forEach(function(a){a in J||(J[a]={id:K,type:"integer"},K++);var b=o[a];J[a].type=g(b,J[a].type),r=h.createElement("attvalue"),r.setAttribute("for",J[a].id),r.setAttribute("value",b),q.appendChild(r)}),y.appendChild(q)),a.renderer){if(n.color){var M;M="#"===n.color[0]?d(n.color):n.color.match(/\d+/g),M.length>2&&M.length<=5&&(u=h.createElement("viz:color"),u.setAttribute("r",M[0]),u.setAttribute("g",M[1]),u.setAttribute("b",M[2]),y.appendChild(u))}n.size&&(F=h.createElement("viz:size"),F.setAttribute("value",n.size),y.appendChild(F))}x.appendChild(y)}return t=h.createElement("attributes"),t.setAttribute("class","edge"),Object.keys(J).forEach(function(a){p=h.createElement("attribute"),p.setAttribute("id",J[a].id),p.setAttribute("title",a),p.setAttribute("type",J[a].type),t.appendChild(p)}),z.appendChild(s),z.appendChild(t),z.appendChild(B),z.appendChild(x),D.appendChild(A),D.appendChild(z),h.appendChild(D),j=i.serializeToString(h),a.download&&b(j,"gexf",a.filename),p&&p.parentNode.removeChild(p),q&&q.parentNode.removeChild(q),r&&r.parentNode.removeChild(r),u&&u.parentNode.removeChild(u),v&&v.parentNode.removeChild(v),w&&w.parentNode.removeChild(w),G&&G.parentNode.removeChild(G),E&&E.parentNode.removeChild(E),F&&F.parentNode.removeChild(F),C&&C.parentNode.removeChild(C),y&&y.parentNode.removeChild(y),s&&s.parentNode.removeChild(s),t&&t.parentNode.removeChild(t),B&&B.parentNode.removeChild(B),x&&x.parentNode.removeChild(x),z&&z.parentNode.removeChild(z),A&&A.parentNode.removeChild(A),D&&D.parentNode.removeChild(D),h=null,j}}.call(this),function(a){"use strict";function b(a,b,c){var d=null,e=null,f=null;if(window.Blob?(d=new Blob([a],{type:"text/xml"}),e=window.URL.createObjectURL(d)):f="data:text/xml;charset=UTF-8,"+encodeURIComponent('<?xml version="1.0" encoding="UTF-8"?>')+encodeURIComponent(a),navigator.msSaveBlob)navigator.msSaveBlob(d,c);else if(navigator.msSaveOrOpenBlob)navigator.msSaveOrOpenBlob(d,c);else{var g=document.createElement("a");g.setAttribute("href",window.Blob?e:f),g.setAttribute("download",c||"graph."+b),document.body.appendChild(g),g.click(),document.body.removeChild(g)}e&&setTimeout(function(){window.URL.revokeObjectURL(e)},0)}function c(a,b){for(var c in a)a.hasOwnProperty(c)&&b(a[c],c)}function d(a,b){return null==b?null:b.split(".").reduce(function(a,b){return a[b]},a)}function e(a){var b=/^#?([a-f\d])([a-f\d])([a-f\d])$/i;a=a.replace(b,function(a,b,c,d){return b+b+c+c+d+d});var c=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);return c?[parseInt(c[1],16),parseInt(c[2],16),parseInt(c[3],16)]:null}if("undefined"==typeof sigma)throw"sigma.exporters.graphML: sigma is not declared";sigma.prototype.toGraphML=function(f){function g(a,b){var c;c="#"===b[0]?e(b):b.match(/\d+(\.\d+)?/g),a.r=c[0],a.g=c[1],a.b=c[2],a.a&&(a.a=c[3])}function h(b,c,d,e,f){d=d||{};var g=n.createElement(c);for(var h in d)if(d.hasOwnProperty(h)){var i=d[h];i!==a&&g.setAttribute(h,i)}if(e!==a||f){"[object Object]"===Object.prototype.toString.call(e)&&(e=JSON.stringify(e));var j=document.createTextNode(e);g.appendChild(j)}return b.appendChild(g),g}function i(b,e,f){var h=d(b,f),i={id:b.id};t.forEach(function(c){var d="x"===c||"y"===c?b[m+c]:b[c];"y"===c&&d&&(d=-parseFloat(d)),d!==a&&(i[("edge"===e?"edge_":"")+c]=d,"color"===c&&g(i,d))}),c(h,function(a,b){-1===t.indexOf(b)&&-1===s.indexOf(b)&&(u[b]?u[b]["for"]!==e&&(u[b]["for"]="all"):u[b]={"for":e,type:"string"},i[b]=a)}),"edge"===e?(i.source=b.source,i.target=b.target,w.push(i)):v.push(i)}function j(a,b){var c=h(a,"data",{key:"nodegraphics"}),d=h(c,"y:ShapeNode");h(d,"y:Geometry",{x:b.x,y:b.y,width:b.size,height:b.size}),h(d,"y:Fill",{color:b.color?b.color:"#000000",transparent:!1}),h(d,"y:NodeLabel",null,b.label?b.label:""),h(d,"y:Shape",{type:b.type?b.type:"circle"})}function k(a,b){var c=h(a,"data",{key:"edgegraphics"}),d=h(c,"y:PolyLineEdge");h(d,"y:LineStyle",{type:b.edge_type?b.edge_type:"line",color:b.edge_color?b.edge_color:"#0000FF",width:b.edge_size?b.edge_size:1}),h(d,"y:EdgeLabel",null,b.edge_label?b.edge_label:"")}f=f||{};var l,m,n=document.implementation.createDocument("","",null),o=new XMLSerializer,p=!0,q=this.graph.nodes(),r=this.graph.edges();f.renderer?(p=f.renderer instanceof sigma.renderers.webgl,m=p?f.renderer.camera.prefix:f.renderer.camera.readPrefix):m="";var s=["id","source","target"],t=["size","x","y","type","color","label","fixed","hidden","active"],u={size:{"for":"all",type:"double"},x:{"for":"node",type:"double"},y:{"for":"node",type:"double"},type:{"for":"all",type:"string"},color:{"for":"all",type:"string"},r:{"for":"all",type:"int"},g:{"for":"all",type:"int"},b:{"for":"all",type:"int"},a:{"for":"all",type:"double"},label:{"for":"all",type:"string"},fixed:{"for":"node",type:"boolean"},hidden:{"for":"all",type:"boolean"},active:{"for":"all",type:"boolean"}},v=[],w=[];q.forEach(function(a){i(a,"node",f.nodesAttributes)}),r.forEach(function(a){i(a,"edge",f.edgesAttributes)});var x=h(n,"graphml",{xmlns:"http://graphml.graphdrawing.org/xmlns","xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance","xsi:schemaLocation":"http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd","xmlns:y":"http://www.yworks.com/xml/graphml","xmlns:java":"http://www.yworks.com/xml/yfiles-common/1.0/java","xmlns:sys":"http://www.yworks.com/xml/yfiles-common/markup/primitives/2.0","xmlns:x":"http://ww.yworks.com/xml/yfiles-common/markup/2.0"});c(u,function(a,b){("node"===a["for"]||"all"===a["for"])&&h(x,"key",{"attr.name":b,"attr.type":a.type,"for":"node",id:b}),("edge"===a["for"]||"all"===a["for"])&&h(x,"key",{"attr.name":b,"attr.type":a.type,"for":"edge",id:"edge_"+b})}),h(x,"key",{id:"nodegraphics","for":"node","yfiles.type":"nodegraphics","attr.type":"string"}),h(x,"key",{id:"edgegraphics","for":"edge","yfiles.type":"edgegraphics","attr.type":"string"});var y=h(x,"graph",{edgedefault:f.undirectedEdges?"undirected":"directed",id:f.graphId?f.graphId:"G","parse.nodes":q.length,"parse.edges":r.length,"parse.order":"nodesfirst"});v.forEach(function(a){var b=h(y,"node",{id:a.id});j(b,a),c(a,function(a,c){-1===s.indexOf(c)&&h(b,"data",{key:c},a,!0)})}),w.forEach(function(a){var b=h(y,"edge",{id:a.id,source:a.source,target:a.target});k(b,a),c(a,function(a,c){-1===s.indexOf(c)&&h(b,"data",{key:c},a,!0)})}),l='<?xml version="1.0" encoding="UTF-8"?>'+o.serializeToString(n),f.download&&b(l,"graphml",f.filename)}}.call(this),function(undefined){"use strict";function download(a,b,c){var d=null,e=null,f=null;if(window.Blob?(d=new Blob([a],{type:"text/json"}),e=window.URL.createObjectURL(d)):f="data:text/json;charset=UTF-8,"+encodeURIComponent(a),navigator.msSaveBlob)navigator.msSaveBlob(d,c);else if(navigator.msSaveOrOpenBlob)navigator.msSaveOrOpenBlob(d,c);else{var g=document.createElement("a");g.setAttribute("href",window.Blob?e:f),g.setAttribute("download",c||"graph."+b),document.body.appendChild(g),g.click(),document.body.removeChild(g)}e&&setTimeout(function(){window.URL.revokeObjectURL(e)},0)}function deepCopy(o){var copy=Object.create(null);for(var i in o)"object"==typeof o[i]&&null!==o[i]?copy[i]=deepCopy(o[i]):"function"==typeof o[i]&&null!==o[i]?eval(" copy[i] = "+o[i].toString()):copy[i]=o[i];return copy}function startsWith(a,b){return b.slice(0,a.length)==a}function cleanup(a){for(var b in a)(startsWith("read_cam",b)||startsWith("cam",b)||startsWith("renderer",""+b))&&(a[b]=undefined);return a}if("undefined"==typeof sigma)throw"sigma.exporters.json: sigma is not declared";sigma.prototype.toJSON=function(a){a=a||{};var b={nodes:this.graph.nodes().map(deepCopy).map(cleanup),edges:this.graph.edges().map(deepCopy).map(cleanup)};if(a.pretty)var c=JSON.stringify(b,null," ");else var c=JSON.stringify(b);return a.download&&download(c,"json",a.filename),c}}.call(this),function(a){"use strict";function b(a,b,c){var d=null,e=null,f=null;if(window.Blob?(d=new Blob([a],{type:"text/xml"}),e=window.URL.createObjectURL(d)):f="data:text/csv;charset=UTF-8,"+encodeURIComponent(a),navigator.msSaveBlob)navigator.msSaveBlob(d,c);else if(navigator.msSaveOrOpenBlob)navigator.msSaveOrOpenBlob(d,c);else{var g=document.createElement("a");g.setAttribute("href",window.Blob?e:f),g.setAttribute("download",c||"graph."+b),document.body.appendChild(g),g.click(),document.body.removeChild(g)}e&&setTimeout(function(){window.URL.revokeObjectURL(e)},0)}function c(b,c){return null===b||b===a?c+c:"function"==typeof b?b.toString():(b="string"==typeof b?b:JSON.stringify(b),b=b.replace(/\s+/g," "),c&&c.length?c+b.replace(c,'"'===c?"'":'"')+c:b)}function d(b,c){return null===c||c===a?null:c.split(".").reduce(function(a,b){return a[b]},b)}if("undefined"==typeof sigma)throw new Error("sigma is not declared");sigma.prototype.toSpreadsheet=function(a){if(a=a||{},a.separator=a.separator||",",a.textSeparator=a.textSeparator||"",a.textSeparator&&'"'!==a.textSeparator&&"'"!==a.textSeparator)throw new TypeError('Invalid argument :"textSeparator" is not single-quote or double-quote, was '+a.textSeparator);var e,f,g,h,i,j,k=[],l={},m=[],n=0,o=a.categoriesName||"categories";if(!a.what)throw new TypeError('Missing argument: "what".');if("nodes"===a.what)e=a.which?this.graph.nodes(a.which):this.graph.nodes();else{if("edges"!==a.what)throw new TypeError('Invalid argument: "what" is not "nodes" or "edges", was '+a.what);e=a.which?this.graph.edges(a.which):this.graph.edges()}l.id=n++,m.push(c("id",a.textSeparator)),"edges"===a.what&&(l.source=n++,m.push(c("source",a.textSeparator)),l.target=n++,m.push(c("target",a.textSeparator))),j=a.categories&&a.categories.length,j&&(l.categories=n++,m.push(c(o,a.textSeparator)));for(var p=0;p<e.length;p++)h=e[p],f=d(h,a.attributes)||{},Object.keys(f).forEach(function(b){b in l||(l[b]=n++,m.push(c(b,a.textSeparator)))});k.push(m);for(var p=0;p<e.length;p++)h=e[p],i=[],i.length=n,i[0]=c(h.id,a.textSeparator),"edges"===a.what&&(i[1]=c(h.source,a.textSeparator),i[2]=c(h.target,a.textSeparator)),j&&(g=d(h,a.categories),Array.isArray(g)&&(g=g.join(",")),i[l.categories]=c(g,a.textSeparator)),f=d(h,a.attributes)||{},Object.keys(f).forEach(function(b){i[l[b]]=c(f[b],a.textSeparator)}),k.push(i);var q=k.map(function(b){return b.join(a.separator)}).join("\n");return a.download&&b(q,"csv",a.filename),q}}.call(this),function(a){"use strict";function b(a){return new Blob([a],{type:"image/svg+xml;charset=utf-8"})}function c(a,c){if("undefined"!=typeof safari){var d="File download does not work in Safari. Please use a modern web browser such as Firefox, Chrome, or Internet Explorer 11.";throw alert(d),new Error(d)}var e=b(a),f=window.URL.createObjectURL(e);if(navigator.msSaveBlob)navigator.msSaveBlob(e,c);else if(navigator.msSaveOrOpenBlob)navigator.msSaveOrOpenBlob(e,c);else{var g=document.createElement("a");g.setAttribute("href",f),g.setAttribute("download",c),document.body.appendChild(g),g.click(),document.body.removeChild(g)}setTimeout(function(){window.URL.revokeObjectURL(f)},0)}function d(a,b,c){var d,e,g,h,i,j={},k={},l=0,m="";c.classes&&(e=document.createElementNS(f,"style"),a.insertBefore(e,a.firstChild));var n=a.querySelectorAll('[id="'+b+'-group-nodes"] > [class="'+b+'-node"]');for(h=0,i=n.length,g=!0;i>h;h++)d=n[h].getAttribute("fill"),c.data||n[h].removeAttribute("data-node-id"),c.classes&&(d in j||(j[d]=g?b+"-node":"c-"+l++,m+="."+j[d]+"{fill: "+d+"}"),j[d]!==b+"-node"&&n[h].setAttribute("class",n[h].getAttribute("class")+" "+j[d]),n[h].removeAttribute("fill")),g=!1;var o=a.querySelectorAll('[id="'+b+'-group-edges"] > [class="'+b+'-edge"]');for(h=0,i=o.length,g=!0;i>h;h++)d=o[h].getAttribute("stroke"),c.data||o[h].removeAttribute("data-edge-id"),c.classes&&(d in k||(k[d]=g?b+"-edge":"c-"+l++,m+="."+k[d]+"{stroke: "+d+"}"),k[d]!==b+"-edge"&&o[h].setAttribute("class",o[h].getAttribute("class")+" "+k[d]),o[h].removeAttribute("stroke")),g=!1;c.classes&&e.appendChild(document.createTextNode(m))}if("undefined"==typeof sigma)throw"sigma.renderers.snapshot: sigma not in scope.";var e=(this.URL||this.webkitURL||this,{size:"1000",width:"1000",height:"1000",margin:.05,classes:!0,labels:!0,data:!1,download:!1,filename:"graph.svg"}),f="http://www.w3.org/2000/svg";sigma.prototype.toSVG=function(a){a=a||{};var b=this.settings("classPrefix"),f=a.size||a.width||e.size,g=a.size||a.height||e.size,h=a.margin||e.margin,i=document.createElement("div");i.setAttribute("width",f),i.setAttribute("height",g),i.setAttribute("style","position:absolute; top: 0px; left:0px; width: "+f+"px; height: "+g+"px;");var j=this.settings("sideMargin");this.settings("sideMargin",h);var k=this.settings("autoRescale");this.settings("autoRescale",!0);var l=this.addCamera(),m=this.addRenderer({camera:l,container:i,type:"svg",forceLabels:!!a.labels});m.resize(f,g),this.refresh(),this.killRenderer(m),this.killCamera(l),this.settings("sideMargin",j),this.settings("autoRescale",k);var n=i.querySelector("svg");if(n.removeAttribute("style"),n.setAttribute("width",f+"px"),n.setAttribute("height",g+"px"),n.setAttribute("x","0px"),n.setAttribute("y","0px"),!a.labels){var o=n.querySelector('[id="'+b+'-group-labels"]');n.removeChild(o)}var p=n.querySelector('[id="'+b+'-group-hovers"]');n.removeChild(p),a.classes=a.classes!==!1,(!a.data||a.classes)&&d(n,b,a);var q=n.outerHTML;i=null;var r='<?xml version="1.0" encoding="utf-8"?>\n';return r+='<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n',r+=q,a.download&&c(r,a.filename||e.filename),r}}.call(this),function(a){"use strict";function b(a,b,c){var d=window.URL.createObjectURL(a);if(navigator.msSaveBlob)navigator.msSaveBlob(a,c);else if(navigator.msSaveOrOpenBlob)navigator.msSaveOrOpenBlob(a,c);else{var e=document.createElement("a");e.setAttribute("href",d),e.setAttribute("download",c||"graph."+b),document.body.appendChild(e),e.click(),document.body.removeChild(e)}setTimeout(function(){window.URL.revokeObjectURL(d)},0)}function c(a){for(var b=new ArrayBuffer(a.length),c=new Uint8Array(b),d=0;d!=a.length;++d)c[d]=255&a.charCodeAt(d);return b}function d(b){return null===b||b===a?"":"string"==typeof b||"number"==typeof b?b:"function"==typeof b?b.toString():JSON.stringify(b)}function e(b){return null===b||b===a?"":"string"==typeof b||"number"==typeof b?b:Array.isArray(b)?b.join(","):"function"==typeof b?b.toString():JSON.stringify(b)}function f(b,c){return null===c||c===a?null:c.split(".").reduce(function(a,b){return a[b]},b)}function g(){return this instanceof g?(this.SheetNames=[],void(this.Sheets={})):new g}function h(a,b){b&&(a+=1462);var c=Date.parse(a);return(c-new Date(Date.UTC(1899,11,30)))/864e5}function i(a,b){for(var c={},d={s:{c:1e7,r:1e7},e:{c:0,r:0}},e=0;e!=a.length;++e)for(var f=0;f!=a[e].length;++f){d.s.r>e&&(d.s.r=e),d.s.c>f&&(d.s.c=f),d.e.r<e&&(d.e.r=e),d.e.c<f&&(d.e.c=f);var g={v:a[e][f]};if(null!=g.v){var i=XLSX.utils.encode_cell({c:f,r:e});"number"==typeof g.v?g.t="n":"boolean"==typeof g.v?g.t="b":g.v instanceof Date?(g.t="n",g.z=XLSX.SSF._table[14],g.v=h(g.v)):g.t="s",c[i]=g}}return d.s.c<1e7&&(c["!ref"]=XLSX.utils.encode_range(d)),c}function j(a,b){var c,g,h,i=0,j={},k=[],l=b.nodesAttributes,m=b.nodesCategories,n=b.nodesCategoriesName||"categories",o=0,p=[];"edges"===b.what&&(l=b.edgesAttributes,m=b.edgesCategories,n=b.edgesCategoriesName||"categories"),o=m&&m.length?1:0,j.id=i++,k.push("id"),"edges"===b.what&&(j.source=i++,k.push("source"),j.target=i++,k.push("target")),o&&(i++,k.push(n));for(var q=0;q<a.length;q++)g=a[q],c=f(g,l)||{},Object.keys(c).forEach(function(a){a in j||(j[a]=i++,k.push(d(a)))});p.push(k);for(var q=0;q<a.length;q++)g=a[q],h=[],h.length=i,h[0]=d(g.id),"edges"===b.what?(h[1]=d(g.source),h[2]=d(g.target),o&&(h[3]=e(f(g,m)))):o&&(h[1]=e(f(g,m))),c=f(g,l)||{},Object.keys(c).forEach(function(a){h[j[a]]=d(c[a])}),p.push(h);return p}if("undefined"==typeof sigma)throw new Error("sigma is not declared");("undefined"==typeof dagre||"undefined"==typeof dagre.graphlib)&&console.warn("to use the xlx plugin, you have to include the XLSX library"),sigma.prototype.toXLSX=function(a){if("undefined"==typeof XLSX)throw new Error("XLSX is not declared");a=a||{};var d,e,f,h=new g;if(a.what)if("nodes"===a.what)f=a.which?this.graph.nodes(a.which):this.graph.nodes(),d=i(j(f,a));else{if("edges"!==a.what)throw new TypeError('Invalid argument: "what" is not "nodes" or "edges", was '+a.what);f=a.which?this.graph.edges(a.which):this.graph.edges(),e=i(j(f,a))}else a.what="nodes",d=i(j(this.graph.nodes(),a)),a.what="edges",e=i(j(this.graph.edges(),a));d&&(h.SheetNames.push("Nodes"),h.Sheets.Nodes=d),e&&(h.SheetNames.push("Edges"),h.Sheets.Edges=e);var k=XLSX.write(h,{bookType:"xlsx",bookSST:!1,type:"binary"}),l=new Blob([c(k)],{type:""});b(l,"xlsx",a.filename)}}.call(this),function(a){"use strict";function b(a){var b=";base64,";if(-1==a.indexOf(b)){var c=a.split(","),d=c[0].split(":")[1],e=decodeURIComponent(c[1]);return new Blob([e],{type:d})}for(var c=a.split(b),d=c[0].split(":")[1],e=window.atob(c[1]),f=e.length,g=new Uint8Array(f),h=0;f>h;++h)g[h]=e.charCodeAt(h);return new Blob([g],{type:d})}function c(a,c,d){if(d=d||"graph."+c,navigator.msSaveOrOpenBlob)navigator.msSaveOrOpenBlob(b(a),d);else if(navigator.msSaveBlob)navigator.msSaveBlob(b(a),d);else{var e=document.createElement("a");e.setAttribute("href",a),e.setAttribute("download",d),document.body.appendChild(e),e.click(),document.body.removeChild(e)}}function d(a,b,c){var d=Math.min(c/a,c/b);return{width:a*d,height:b*d}}function e(a,b,c){var d;return d=sigma.utils.getBoundaries(a.graph,b.camera.readPrefix),d.minX/=c.zoomRatio,d.minY/=c.zoomRatio,d.maxX/=c.zoomRatio,d.maxY/=c.zoomRatio,d}function f(a,b,c){var f,g=c.margin||0,h={width:b.width,height:b.height};return c.clips||c.size?c.size&&c.size>=1&&(h=d(b.width,b.height,c.size)):(f=e(a,b,c),h={width:f.maxX-f.minX+2*f.sizeMax,height:f.maxY-f.minY+2*f.sizeMax}),h.width+=g,h.height+=g,h}function g(a,b,d){if(d=d||{},d.format&&!(d.format in i))throw Error('sigma.renderers.image: unsupported format "'+d.format+'".');var e=f(a,b,d),g=a.settings("batchEdgesDrawing");g&&a.settings("batchEdgesDrawing",!1),d.clip||this.clone(a,d,e);var h=this.draw(b,d,e);a.settings("batchEdgesDrawing",g);var j=h.toDataURL(i[d.format||"png"]);return d.download&&c(j,d.format||"png",d.filename),j}if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.plugins");var h,i,j,k;h=["scene","edges","nodes","labels"],i={png:"image/png",jpg:"image/jpeg",gif:"image/gif",tiff:"image/tiff"},g.prototype.clone=function(a,b,c){b.tmpContainer=b.tmpContainer||"image-container";var d=sigma.utils.getPixelRatio(),e=a.settings("webglOversamplingRatio"),f=document.getElementById(b.tmpContainer);f||(f=document.createElement("div"),f.id=b.tmpContainer,document.body.appendChild(f)),f.setAttribute("style","width:"+Math.round(c.width/d)+"px;height:"+Math.round(c.height/d)+"px;");var g=a.addRenderer({container:document.getElementById(b.tmpContainer),type:"canvas",settings:{batchEdgesDrawing:!0,drawLabels:!!b.labels}});g.camera.ratio=b.zoomRatio>0?b.zoomRatio:1,b.size||(g.camera.ratio*=d);var i=g instanceof sigma.renderers.webgl,l=!1,m=[];j=document.createElement("canvas"),k=j.getContext("2d"),a.refresh(),h.forEach(function(a){if(g.contexts[a]&&(b.labels!==!1||"labels"!==a)){var d=g.domElements[a]||g.domElements.scene,f=g.contexts[a];l||(j.width=c.width,j.height=c.height,i&&f instanceof WebGLRenderingContext&&(j.width/=e,j.height/=e),l=!0),f instanceof WebGLRenderingContext?k.drawImage(d,0,0,d.width/e,d.height/e):k.drawImage(d,0,0),~m.indexOf(f)||m.push(f)}}),m=[],a.killRenderer(g),f.parentNode.removeChild(f)},g.prototype.draw=function(a,b,c){var e=a instanceof sigma.renderers.webgl,f=!1,g=[],i=document.createElement("canvas"),k=i.getContext("2d");return h.forEach(function(h){if(a.contexts[h]&&(b.labels!==!1||"labels"!==h)){var l=a.domElements[h]||a.domElements.scene,m=a.contexts[h];if(!~g.indexOf(m)){if(!f){var n,o;if(b.clip){var p=!b.size||b.size<1?window.innerWidth:b.size;n=l.width,o=l.height,c=d(n,o,p)}else n=j.width,o=j.height;if(i.width=c.width,i.height=c.height,!e&&!m instanceof WebGLRenderingContext){var q=s.settings("webglOversamplingRatio");i.width*=q,i.height*=q}f=!0,b.background&&(k.rect(0,0,i.width,i.height),k.fillStyle=b.background,k.fill())}k.drawImage(b.clip?l:j,0,0,i.width,i.height),g.push(m)}}}),g=[],i};var l=null;sigma.plugins.image=function(a,b,c){return sigma.plugins.killImage(),l||(l=new g(a,b,c)),l},sigma.plugins.killImage=function(){l instanceof g&&(l=null,j=null,k=null)}}.call(this),function(a){"use strict";function b(a,b){var c,d,b=b||"",e=-(1/0),f=1/0,g=1/0,h=-(1/0),i=-(1/0);for(c=0,d=a.length;d>c;c++)e=Math.max(a[c][b+"size"],e),h=Math.max(a[c][b+"x"],h),f=Math.min(a[c][b+"x"],f),i=Math.max(a[c][b+"y"],i),g=Math.min(a[c][b+"y"],g);return e=e||1,{sizeMax:e,minX:f,minY:g,maxX:h,maxY:i}}function c(a,b,c,d,e){return(e-d)*(a-b)/(c-b)+d}function d(a,b,d){return{x:c(a.x,b.minX,b.maxX,d.minX,d.maxX),y:c(a.y,b.minY,b.maxY,d.minY,d.maxY)}}function e(){if("undefined"==typeof dagre)throw new Error("dagre is not declared");if("undefined"==typeof dagre.graphlib)throw new Error("dagre.graphlib is not declared");var a,c=this;this.init=function(a,b){if(b=b||{},b.nodes&&(this.nodes=b.nodes,delete b.nodes),b.boundingBox&&(this.boundingBox=b.boundingBox,delete b.boundingBox),this.sigInst=a,this.config=sigma.utils.extend(b,f),this.easing=b.easing,this.duration=b.duration,this.easing&&(!sigma.plugins||"undefined"==typeof sigma.plugins.animate))throw new Error("sigma.plugins.animate is not declared");this.running=!1},this.start=function(){if(!this.running){this.running=!0,a=new dagre.graphlib.Graph({directed:this.config.directed,multigraph:this.config.multigraph,compound:this.config.compound}),a.setGraph(this.config);for(var d=this.nodes||this.sigInst.graph.nodes(),e=0;e<d.length;e++)d[e].fixed||a.setNode(d[e].id,{});this.boundingBox===!0&&(this.boundingBox=b(d));for(var f=this.sigInst.graph.edges(),e=0;e<f.length;e++)null!=a.node(f[e].source)&&null!=a.node(f[e].target)&&a.setEdge(f[e].source,f[e].target,{id:f[e].id});h[c.sigInst.id].dispatchEvent("start"),dagre.layout(a);var g;a.edges().map(function(b){g=c.sigInst.graph.edges(a.edge(b).id),g.points=a.edge(b).points}),this.stop()}},this.stop=function(){if(a){var e,f=a.nodes().map(function(a){return c.sigInst.graph.nodes(a)||c.sigInst.graph.nodes(Number(a))});if(this.boundingBox)var g=b(a.nodes().map(function(b){return a.node(b)}));if(this.running=!1,this.easing){for(var i=0;i<f.length;i++)this.boundingBox?(e=d(a.node(f[i].id),g,c.boundingBox),f[i].dagre_x=e.x,f[i].dagre_y=e.y):(f[i].dagre_x=a.node(f[i].id).x,f[i].dagre_y=a.node(f[i].id).y);h[c.sigInst.id].dispatchEvent("interpolate"),sigma.plugins.animate(c.sigInst,{x:"dagre_x",y:"dagre_y"},{nodes:f,easing:c.easing,onComplete:function(){for(var a=0;a<f.length;a++)f[a].dagre_x=null,f[a].dagre_y=null;h[c.sigInst.id].dispatchEvent("stop"),c.sigInst.refresh()},duration:c.duration})}else{var j;a.nodes().forEach(function(b){j=c.sigInst.graph.nodes(b),j.x=a.node(b).x,j.y=a.node(b).y}),h[c.sigInst.id].dispatchEvent("stop"),this.sigInst.refresh()}}},this.kill=function(){this.sigInst=null,this.config=null,this.easing=null}}if("undefined"==typeof sigma)throw new Error("sigma is not declared");("undefined"==typeof dagre||"undefined"==typeof dagre.graphlib)&&console.warn("to use the dagre plugin, you have to include dagre and dagre.graphlib"),sigma.utils.pkg("sigma.layouts.dagre");var f={directed:!0,multigraph:!0,compound:!1,rankDir:"TB"},g={},h={};sigma.layouts.dagre.configure=function(a,b){if(!a)throw new Error('Missing argument: "sigInst"');if(!b)throw new Error('Missing argument: "config"');return g[a.id]||(g[a.id]=new e,h[a.id]={},sigma.classes.dispatcher.extend(h[a.id]),a.bind("kill",function(){g[a.id].kill(),g[a.id]=null,h[a.id]=null})),g[a.id].init(a,b),h[a.id]},sigma.layouts.dagre.start=function(a,b){if(!a)throw new Error('Missing argument: "sigInst"');return b&&this.configure(a,b),g[a.id].start(),h[a.id]},sigma.layouts.dagre.isRunning=function(a){if(!a)throw new Error('Missing argument: "sigInst"');return!!g[a.id]&&g[a.id].running}}.call(this),function(undefined){"use strict";function crush(a){var b,c,d,e=["x","y","dx","dy","old_dx","old_dy","mass","convergence","size","fixed"],f=["source","target","weight"],g=["node","centerX","centerY","size","nextSibling","firstChild","mass","massCenterX","massCenterY"];for(c=0,d=g.length;d>c;c++)b=new RegExp("rp\\(([^,]*), '"+g[c]+"'\\)","g"),a=a.replace(b,0===c?"$1":"$1 + "+c);for(c=0,d=e.length;d>c;c++)b=new RegExp("np\\(([^,]*), '"+e[c]+"'\\)","g"),a=a.replace(b,0===c?"$1":"$1 + "+c);for(c=0,d=f.length;d>c;c++)b=new RegExp("ep\\(([^,]*), '"+f[c]+"'\\)","g"),a=a.replace(b,0===c?"$1":"$1 + "+c);return a;
}function getWorkerFn(){var a=crush?crush(Worker.toString()):Worker.toString();return";("+a+").call(this);"}var _root=this,inWebWorker=!("document"in _root),Worker=function(a){function b(){var a,b,c={},d=arguments.length;for(a=d-1;a>=0;a--)for(b in arguments[a])c[b]=arguments[a][b];return c}function c(a){var b;for(b in a)"hasOwnProperty"in a&&!a.hasOwnProperty(b)||delete a[b];return a}function d(a,b){if(a%o.ppn!==0)throw"np: non correct ("+a+").";if(a!==parseInt(a))throw"np: non int.";if(b in p)return a+p[b];throw"ForceAtlas2.Worker - Inexistant node property given ("+b+")."}function e(a,b){if(a%o.ppe!==0)throw"ep: non correct ("+a+").";if(a!==parseInt(a))throw"ep: non int.";if(b in q)return a+q[b];throw"ForceAtlas2.Worker - Inexistant edge property given ("+b+")."}function f(a,b){if(a%o.ppr!==0)throw"rp: non correct ("+a+").";if(a!==parseInt(a))throw"rp: non int.";if(b in r)return a+r[b];throw"ForceAtlas2.Worker - Inexistant region property given ("+b+")."}function g(a,b,c){c=c||{};k=a,l=b,o.nodesLength=k.length,o.edgesLength=l.length,h(c)}function h(a){o.settings=b(a,o.settings)}function i(){var a,b,c,g,h,i,j,n,p,q,r,s,t,u,v;for(c=0;c<o.nodesLength;c+=o.ppn)k[d(c,"old_dx")]=k[d(c,"dx")],k[d(c,"old_dy")]=k[d(c,"dy")],k[d(c,"dx")]=0,k[d(c,"dy")]=0;if(o.settings.outboundAttractionDistribution){for(p=0,c=0;c<o.nodesLength;c+=o.ppn)p+=k[d(c,"mass")];p/=o.nodesLength}if(o.settings.barnesHutOptimize){var w,x,y=1/0,z=-(1/0),A=1/0,B=-(1/0);for(m=[],c=0;c<o.nodesLength;c+=o.ppn)y=Math.min(y,k[d(c,"x")]),z=Math.max(z,k[d(c,"x")]),A=Math.min(A,k[d(c,"y")]),B=Math.max(B,k[d(c,"y")]);for(m[f(0,"node")]=-1,m[f(0,"centerX")]=(y+z)/2,m[f(0,"centerY")]=(A+B)/2,m[f(0,"size")]=Math.max(z-y,B-A),m[f(0,"nextSibling")]=-1,m[f(0,"firstChild")]=-1,m[f(0,"mass")]=0,m[f(0,"massCenterX")]=0,m[f(0,"massCenterY")]=0,a=1,c=0;c<o.nodesLength;c+=o.ppn)for(b=0;;)if(m[f(b,"firstChild")]>=0)w=k[d(c,"x")]<m[f(b,"centerX")]?k[d(c,"y")]<m[f(b,"centerY")]?m[f(b,"firstChild")]:m[f(b,"firstChild")]+o.ppr:k[d(c,"y")]<m[f(b,"centerY")]?m[f(b,"firstChild")]+2*o.ppr:m[f(b,"firstChild")]+3*o.ppr,m[f(b,"massCenterX")]=(m[f(b,"massCenterX")]*m[f(b,"mass")]+k[d(c,"x")]*k[d(c,"mass")])/(m[f(b,"mass")]+k[d(c,"mass")]),m[f(b,"massCenterY")]=(m[f(b,"massCenterY")]*m[f(b,"mass")]+k[d(c,"y")]*k[d(c,"mass")])/(m[f(b,"mass")]+k[d(c,"mass")]),m[f(b,"mass")]+=k[d(c,"mass")],b=w;else{if(m[f(b,"node")]<0){m[f(b,"node")]=c;break}if(m[f(b,"firstChild")]=a*o.ppr,j=m[f(b,"size")]/2,n=m[f(b,"firstChild")],m[f(n,"node")]=-1,m[f(n,"centerX")]=m[f(b,"centerX")]-j,m[f(n,"centerY")]=m[f(b,"centerY")]-j,m[f(n,"size")]=j,m[f(n,"nextSibling")]=n+o.ppr,m[f(n,"firstChild")]=-1,m[f(n,"mass")]=0,m[f(n,"massCenterX")]=0,m[f(n,"massCenterY")]=0,n+=o.ppr,m[f(n,"node")]=-1,m[f(n,"centerX")]=m[f(b,"centerX")]-j,m[f(n,"centerY")]=m[f(b,"centerY")]+j,m[f(n,"size")]=j,m[f(n,"nextSibling")]=n+o.ppr,m[f(n,"firstChild")]=-1,m[f(n,"mass")]=0,m[f(n,"massCenterX")]=0,m[f(n,"massCenterY")]=0,n+=o.ppr,m[f(n,"node")]=-1,m[f(n,"centerX")]=m[f(b,"centerX")]+j,m[f(n,"centerY")]=m[f(b,"centerY")]-j,m[f(n,"size")]=j,m[f(n,"nextSibling")]=n+o.ppr,m[f(n,"firstChild")]=-1,m[f(n,"mass")]=0,m[f(n,"massCenterX")]=0,m[f(n,"massCenterY")]=0,n+=o.ppr,m[f(n,"node")]=-1,m[f(n,"centerX")]=m[f(b,"centerX")]+j,m[f(n,"centerY")]=m[f(b,"centerY")]+j,m[f(n,"size")]=j,m[f(n,"nextSibling")]=m[f(b,"nextSibling")],m[f(n,"firstChild")]=-1,m[f(n,"mass")]=0,m[f(n,"massCenterX")]=0,m[f(n,"massCenterY")]=0,a+=4,w=k[d(m[f(b,"node")],"x")]<m[f(b,"centerX")]?k[d(m[f(b,"node")],"y")]<m[f(b,"centerY")]?m[f(b,"firstChild")]:m[f(b,"firstChild")]+o.ppr:k[d(m[f(b,"node")],"y")]<m[f(b,"centerY")]?m[f(b,"firstChild")]+2*o.ppr:m[f(b,"firstChild")]+3*o.ppr,m[f(b,"mass")]=k[d(m[f(b,"node")],"mass")],m[f(b,"massCenterX")]=k[d(m[f(b,"node")],"x")],m[f(b,"massCenterY")]=k[d(m[f(b,"node")],"y")],m[f(w,"node")]=m[f(b,"node")],m[f(b,"node")]=-1,x=k[d(c,"x")]<m[f(b,"centerX")]?k[d(c,"y")]<m[f(b,"centerY")]?m[f(b,"firstChild")]:m[f(b,"firstChild")]+o.ppr:k[d(c,"y")]<m[f(b,"centerY")]?m[f(b,"firstChild")]+2*o.ppr:m[f(b,"firstChild")]+3*o.ppr,w!==x){m[f(x,"node")]=c;break}b=w}}if(o.settings.barnesHutOptimize)for(q=o.settings.scalingRatio,c=0;c<o.nodesLength;c+=o.ppn)for(b=0;;)if(m[f(b,"firstChild")]>=0){if(u=Math.sqrt(Math.pow(k[d(c,"x")]-m[f(b,"massCenterX")],2)+Math.pow(k[d(c,"y")]-m[f(b,"massCenterY")],2)),2*m[f(b,"size")]/u<o.settings.barnesHutTheta){if(r=k[d(c,"x")]-m[f(b,"massCenterX")],s=k[d(c,"y")]-m[f(b,"massCenterY")],o.settings.adjustSizes?u>0?(v=q*k[d(c,"mass")]*m[f(b,"mass")]/u/u,k[d(c,"dx")]+=r*v,k[d(c,"dy")]+=s*v):0>u&&(v=-q*k[d(c,"mass")]*m[f(b,"mass")]/u,k[d(c,"dx")]+=r*v,k[d(c,"dy")]+=s*v):u>0&&(v=q*k[d(c,"mass")]*m[f(b,"mass")]/u/u,k[d(c,"dx")]+=r*v,k[d(c,"dy")]+=s*v),m[f(b,"nextSibling")]<0)break;b=m[f(b,"nextSibling")];continue}b=m[f(b,"firstChild")]}else{if(m[f(b,"node")]>=0&&m[f(b,"node")]!==c&&(r=k[d(c,"x")]-k[d(m[f(b,"node")],"x")],s=k[d(c,"y")]-k[d(m[f(b,"node")],"y")],u=Math.sqrt(r*r+s*s),o.settings.adjustSizes?u>0?(v=q*k[d(c,"mass")]*k[d(m[f(b,"node")],"mass")]/u/u,k[d(c,"dx")]+=r*v,k[d(c,"dy")]+=s*v):0>u&&(v=-q*k[d(c,"mass")]*k[d(m[f(b,"node")],"mass")]/u,k[d(c,"dx")]+=r*v,k[d(c,"dy")]+=s*v):u>0&&(v=q*k[d(c,"mass")]*k[d(m[f(b,"node")],"mass")]/u/u,k[d(c,"dx")]+=r*v,k[d(c,"dy")]+=s*v)),m[f(b,"nextSibling")]<0)break;b=m[f(b,"nextSibling")]}else for(q=o.settings.scalingRatio,g=0;g<o.nodesLength;g+=o.ppn)for(h=0;g>h;h+=o.ppn)r=k[d(g,"x")]-k[d(h,"x")],s=k[d(g,"y")]-k[d(h,"y")],o.settings.adjustSizes?(u=Math.sqrt(r*r+s*s)-k[d(g,"size")]-k[d(h,"size")],u>0?(v=q*k[d(g,"mass")]*k[d(h,"mass")]/u/u,k[d(g,"dx")]+=r*v,k[d(g,"dy")]+=s*v,k[d(h,"dx")]+=r*v,k[d(h,"dy")]+=s*v):0>u&&(v=100*q*k[d(g,"mass")]*k[d(h,"mass")],k[d(g,"dx")]+=r*v,k[d(g,"dy")]+=s*v,k[d(h,"dx")]-=r*v,k[d(h,"dy")]-=s*v)):(u=Math.sqrt(r*r+s*s),u>0&&(v=q*k[d(g,"mass")]*k[d(h,"mass")]/u/u,k[d(g,"dx")]+=r*v,k[d(g,"dy")]+=s*v,k[d(h,"dx")]-=r*v,k[d(h,"dy")]-=s*v));for(n=o.settings.gravity/o.settings.scalingRatio,q=o.settings.scalingRatio,c=0;c<o.nodesLength;c+=o.ppn)v=0,r=k[d(c,"x")],s=k[d(c,"y")],u=Math.sqrt(Math.pow(r,2)+Math.pow(s,2)),o.settings.strongGravityMode?u>0&&(v=q*k[d(c,"mass")]*n):u>0&&(v=q*k[d(c,"mass")]*n/u),k[d(c,"dx")]-=r*v,k[d(c,"dy")]-=s*v;for(q=1*(o.settings.outboundAttractionDistribution?p:1),i=0;i<o.edgesLength;i+=o.ppe)g=l[e(i,"source")],h=l[e(i,"target")],j=l[e(i,"weight")],t=Math.pow(j,o.settings.edgeWeightInfluence),r=k[d(g,"x")]-k[d(h,"x")],s=k[d(g,"y")]-k[d(h,"y")],o.settings.adjustSizes?(u=Math.sqrt(Math.pow(r,2)+Math.pow(s,2)-k[d(g,"size")]-k[d(h,"size")]),o.settings.linLogMode?o.settings.outboundAttractionDistribution?u>0&&(v=-q*t*Math.log(1+u)/u/k[d(g,"mass")]):u>0&&(v=-q*t*Math.log(1+u)/u):o.settings.outboundAttractionDistribution?u>0&&(v=-q*t/k[d(g,"mass")]):u>0&&(v=-q*t)):(u=Math.sqrt(Math.pow(r,2)+Math.pow(s,2)),o.settings.linLogMode?o.settings.outboundAttractionDistribution?u>0&&(v=-q*t*Math.log(1+u)/u/k[d(g,"mass")]):u>0&&(v=-q*t*Math.log(1+u)/u):o.settings.outboundAttractionDistribution?(u=1,v=-q*t/k[d(g,"mass")]):(u=1,v=-q*t)),u>0&&(k[d(g,"dx")]+=r*v,k[d(g,"dy")]+=s*v,k[d(h,"dx")]-=r*v,k[d(h,"dy")]-=s*v);var C,D,E,F;if(o.settings.adjustSizes)for(c=0;c<o.nodesLength;c+=o.ppn)k[d(c,"fixed")]||(C=Math.sqrt(Math.pow(k[d(c,"dx")],2)+Math.pow(k[d(c,"dy")],2)),C>o.maxForce&&(k[d(c,"dx")]=k[d(c,"dx")]*o.maxForce/C,k[d(c,"dy")]=k[d(c,"dy")]*o.maxForce/C),D=k[d(c,"mass")]*Math.sqrt((k[d(c,"old_dx")]-k[d(c,"dx")])*(k[d(c,"old_dx")]-k[d(c,"dx")])+(k[d(c,"old_dy")]-k[d(c,"dy")])*(k[d(c,"old_dy")]-k[d(c,"dy")])),E=Math.sqrt((k[d(c,"old_dx")]+k[d(c,"dx")])*(k[d(c,"old_dx")]+k[d(c,"dx")])+(k[d(c,"old_dy")]+k[d(c,"dy")])*(k[d(c,"old_dy")]+k[d(c,"dy")]))/2,F=.1*Math.log(1+E)/(1+Math.sqrt(D)),k[d(c,"x")]=k[d(c,"x")]+k[d(c,"dx")]*(F/o.settings.slowDown),k[d(c,"y")]=k[d(c,"y")]+k[d(c,"dy")]*(F/o.settings.slowDown));else for(c=0;c<o.nodesLength;c+=o.ppn)k[d(c,"fixed")]||(D=k[d(c,"mass")]*Math.sqrt((k[d(c,"old_dx")]-k[d(c,"dx")])*(k[d(c,"old_dx")]-k[d(c,"dx")])+(k[d(c,"old_dy")]-k[d(c,"dy")])*(k[d(c,"old_dy")]-k[d(c,"dy")])),E=Math.sqrt((k[d(c,"old_dx")]+k[d(c,"dx")])*(k[d(c,"old_dx")]+k[d(c,"dx")])+(k[d(c,"old_dy")]+k[d(c,"dy")])*(k[d(c,"old_dy")]+k[d(c,"dy")]))/2,F=k[d(c,"convergence")]*Math.log(1+E)/(1+Math.sqrt(D)),k[d(c,"convergence")]=Math.min(1,Math.sqrt(F*(Math.pow(k[d(c,"dx")],2)+Math.pow(k[d(c,"dy")],2))/(1+Math.sqrt(D)))),k[d(c,"x")]=k[d(c,"x")]+k[d(c,"dx")]*(F/o.settings.slowDown),k[d(c,"y")]=k[d(c,"y")]+k[d(c,"dy")]*(F/o.settings.slowDown));o.iterations++}function j(a){for(var b=0;a>b;b++)i();n()}var k,l,m,n,o={ppn:10,ppe:3,ppr:9,maxForce:10,iterations:0,converged:!1,settings:{linLogMode:!1,outboundAttractionDistribution:!1,adjustSizes:!1,edgeWeightInfluence:0,scalingRatio:1,strongGravityMode:!1,gravity:1,slowDown:1,barnesHutOptimize:!1,barnesHutTheta:.5,startingIterations:1,iterationsPerRender:1}},p={x:0,y:1,dx:2,dy:3,old_dx:4,old_dy:5,mass:6,convergence:7,size:8,fixed:9},q={source:0,target:1,weight:2},r={node:0,centerX:1,centerY:2,size:3,nextSibling:4,firstChild:5,mass:6,massCenterX:7,massCenterY:8};n="undefined"!=typeof window&&window.document?function(){var a;document.createEvent?(a=document.createEvent("Event"),a.initEvent("newCoords",!0,!1)):(a=document.createEventObject(),a.eventType="newCoords"),a.eventName="newCoords",a.data={nodes:k.buffer},requestAnimationFrame(function(){document.dispatchEvent(a)})}:function(){self.postMessage({nodes:k.buffer},[k.buffer])};var s=function(a){switch(a.data.action){case"start":g(new Float32Array(a.data.nodes),new Float32Array(a.data.edges),a.data.config),j(o.settings.startingIterations);break;case"loop":k=new Float32Array(a.data.nodes),j(o.settings.iterationsPerRender);break;case"config":h(a.data.config);break;case"kill":c(o),k=null,l=null,m=null,self.removeEventListener("message",s)}};self.addEventListener("message",s)};if(inWebWorker)eval(getWorkerFn());else{if("undefined"==typeof sigma)throw"sigma is not declared";sigma.prototype.getForceAtlas2Worker=getWorkerFn}}.call(this),function(undefined){"use strict";function Supervisor(sigInst,options){var _this=this,workerFn=sigInst.getForceAtlas2Worker&&sigInst.getForceAtlas2Worker();if(options=options||{},_root.URL=_root.URL||_root.webkitURL,this.sigInst=sigInst,this.graph=this.sigInst.graph,this.ppn=10,this.ppe=3,this.config={},this.shouldUseWorker=options.worker===!1?!1:webWorkers,this.workerUrl=options.workerUrl,this.started=!1,this.running=!1,this.shouldUseWorker){if(this.workerUrl)this.worker=new Worker(this.workerUrl);else{var blob=this.makeBlob(workerFn);this.worker=new Worker(URL.createObjectURL(blob))}this.worker.postMessage=this.worker.webkitPostMessage||this.worker.postMessage}else eval(workerFn);this.msgName=this.worker?"message":"newCoords",this.listener=function(a){_this.nodesByteArray=new Float32Array(a.data.nodes),_this.running&&(_this.applyLayoutChanges(),_this.sendByteArrayToWorker(),_this.sigInst.refresh())},(this.worker||document).addEventListener(this.msgName,this.listener),this.graphToByteArrays(),sigInst.bind("kill",function(){sigInst.killForceAtlas2()})}if("undefined"==typeof sigma)throw"sigma is not declared";var _root=this,webWorkers="Worker"in _root;Supervisor.prototype.makeBlob=function(a){var b;try{b=new Blob([a],{type:"application/javascript"})}catch(c){_root.BlobBuilder=_root.BlobBuilder||_root.WebKitBlobBuilder||_root.MozBlobBuilder,b=new BlobBuilder,b.append(a),b=b.getBlob()}return b},Supervisor.prototype.graphToByteArrays=function(){var a,b,c,d=this.graph.nodes(),e=this.graph.edges(),f=d.length*this.ppn,g=e.length*this.ppe,h={};for(this.nodesByteArray=new Float32Array(f),this.edgesByteArray=new Float32Array(g),a=b=0,c=d.length;c>a;a++)h[d[a].id]=b,this.nodesByteArray[b]=d[a].x,this.nodesByteArray[b+1]=d[a].y,this.nodesByteArray[b+2]=0,this.nodesByteArray[b+3]=0,this.nodesByteArray[b+4]=0,this.nodesByteArray[b+5]=0,this.nodesByteArray[b+6]=1+this.graph.degree(d[a].id),this.nodesByteArray[b+7]=1,this.nodesByteArray[b+8]=d[a].size,this.nodesByteArray[b+9]=0,b+=this.ppn;for(a=b=0,c=e.length;c>a;a++)this.edgesByteArray[b]=h[e[a].source],this.edgesByteArray[b+1]=h[e[a].target],this.edgesByteArray[b+2]=e[a].weight||0,b+=this.ppe},Supervisor.prototype.applyLayoutChanges=function(){for(var a=this.graph.nodes(),b=0,c=0,d=this.nodesByteArray.length;d>c;c+=this.ppn)a[b].x=this.nodesByteArray[c],a[b].y=this.nodesByteArray[c+1],b++},Supervisor.prototype.sendByteArrayToWorker=function(a){var b={action:a||"loop",nodes:this.nodesByteArray.buffer},c=[this.nodesByteArray.buffer];"start"===a&&(b.config=this.config||{},b.edges=this.edgesByteArray.buffer,c.push(this.edgesByteArray.buffer)),this.shouldUseWorker?this.worker.postMessage(b,c):_root.postMessage(b,"*")},Supervisor.prototype.start=function(){if(!this.running){this.running=!0;var a,b;for(a in this.sigInst.cameras)b=this.sigInst.cameras[a],b.edgequadtree._enabled=!1;this.started?this.sendByteArrayToWorker():(this.sendByteArrayToWorker("start"),this.started=!0)}},Supervisor.prototype.stop=function(){if(this.running){var a,b,c;for(a in this.sigInst.cameras)b=this.sigInst.cameras[a],b.edgequadtree._enabled=!0,c=sigma.utils.getBoundaries(this.graph,b.readPrefix),b.settings("drawEdges")&&b.settings("enableEdgeHovering")&&b.edgequadtree.index(this.sigInst.graph,{prefix:b.readPrefix,bounds:{x:c.minX,y:c.minY,width:c.maxX-c.minX,height:c.maxY-c.minY}});this.running=!1}},Supervisor.prototype.killWorker=function(){this.worker?this.worker.terminate():(_root.postMessage({action:"kill"},"*"),document.removeEventListener(this.msgName,this.listener))},Supervisor.prototype.configure=function(a){if(this.config=a,this.started){var b={action:"config",config:this.config};this.shouldUseWorker?this.worker.postMessage(b):_root.postMessage(b,"*")}},sigma.prototype.startForceAtlas2=function(a){return this.supervisor||(this.supervisor=new Supervisor(this,a)),a&&this.supervisor.configure(a),this.supervisor.start(),this},sigma.prototype.stopForceAtlas2=function(){return this.supervisor?(this.supervisor.stop(),this):this},sigma.prototype.killForceAtlas2=function(){return this.supervisor?(this.supervisor.stop(),this.supervisor.killWorker(),this.supervisor=null,this):this},sigma.prototype.configForceAtlas2=function(a){return this.supervisor||(this.supervisor=new Supervisor(this,a)),this.supervisor.configure(a),this},sigma.prototype.isForceAtlas2Running=function(a){return!!this.supervisor&&this.supervisor.running}}.call(this),function(undefined){"use strict";function crush(a){var b,c,d,e=["x","y","dx","dy","old_dx","old_dy","mass","convergence","size","fixed"],f=["source","target","weight"],g=["node","centerX","centerY","size","nextSibling","firstChild","mass","massCenterX","massCenterY"];for(c=0,d=g.length;d>c;c++)b=new RegExp("rp\\(([^,]*), '"+g[c]+"'\\)","g"),a=a.replace(b,0===c?"$1":"$1 + "+c);for(c=0,d=e.length;d>c;c++)b=new RegExp("np\\(([^,]*), '"+e[c]+"'\\)","g"),a=a.replace(b,0===c?"$1":"$1 + "+c);for(c=0,d=f.length;d>c;c++)b=new RegExp("ep\\(([^,]*), '"+f[c]+"'\\)","g"),a=a.replace(b,0===c?"$1":"$1 + "+c);return a}function getWorkerFn(){var a=crush?crush(Worker.toString()):Worker.toString();return";("+a+").call(this);"}if("undefined"==typeof sigma)throw new Error("sigma is not declared");sigma.utils.pkg("sigma.layouts");var _root=this,inWebWorker=!("document"in _root),Worker=function(a){function b(){var a,b,c={},d=arguments.length;for(a=d-1;a>=0;a--)for(b in arguments[a])c[b]=arguments[a][b];return c}function c(a){var b;for(b in a)"hasOwnProperty"in a&&!a.hasOwnProperty(b)||delete a[b];return a}function d(a,b,c,d){return Math.sqrt((c-a)*(c-a)+(d-b)*(d-b))}function e(a,b,c,d,e){return(e-d)*(a-b)/(c-b)+d}function f(a){return Math.acos(a.x/Math.sqrt(a.x*a.x+a.y*a.y))}function g(a,b,c,d){return{xi:-(d-b),yi:c-a,xi_prime:d-b,yi_prime:-(c-a)}}function h(a,b){return{x:(a.xi_prime-a.xi)/b,y:(a.yi_prime-a.yi)/b}}function i(a,b,c,d,e){return{x:a+(c-a)*e,y:b+(d-b)*e}}function j(a,b){if(a%u.ppn!==0)throw new Error('Invalid argument in np: "i" is not correct ('+a+").");if(a!==parseInt(a))throw new TypeError('Invalid argument in np: "i" is not an integer.');if(b in v)return a+v[b];throw new Error("ForceLink.Worker - Inexistant node property given ("+b+").")}function k(a,b){if(a%u.ppe!==0)throw new Error('Invalid argument in ep: "i" is not correct ('+a+").");if(a!==parseInt(a))throw new TypeError('Invalid argument in ep: "i" is not an integer.');if(b in w)return a+w[b];throw new Error("ForceLink.Worker - Inexistant edge property given ("+b+").")}function l(a,b){if(a%u.ppr!==0)throw new Error('Invalid argument in rp: "i" is not correct ('+a+").");if(a!==parseInt(a))throw new TypeError('Invalid argument in rp: "i" is not an integer.');if(b in x)return a+x[b];throw new Error("ForceLink.Worker - Inexistant region property given ("+b+").")}function m(a,b,c){c=c||{};q=a,r=b,u.nodesLength=q.length,u.edgesLength=r.length,n(c)}function n(a){u.settings=b(a,u.settings)}function o(){var a,b,c,m,n,o,p,t,v,w,x,y,z,A,B,C,D,E=u.settings.minNodeDistance;for(c=0;c<u.nodesLength;c+=u.ppn)q[j(c,"old_dx")]=q[j(c,"dx")],q[j(c,"old_dy")]=q[j(c,"dy")],q[j(c,"dx")]=0,q[j(c,"dy")]=0;if(u.settings.outboundAttractionDistribution){for(v=0,c=0;c<u.nodesLength;c+=u.ppn)v+=q[j(c,"mass")];v/=u.nodesLength}if(u.settings.barnesHutOptimize){var F,G,H=1/0,I=-(1/0),J=1/0,K=-(1/0);for(s=[],c=0;c<u.nodesLength;c+=u.ppn)H=Math.min(H,q[j(c,"x")]),I=Math.max(I,q[j(c,"x")]),J=Math.min(J,q[j(c,"y")]),K=Math.max(K,q[j(c,"y")]);for(s[l(0,"node")]=-1,s[l(0,"centerX")]=(H+I)/2,s[l(0,"centerY")]=(J+K)/2,s[l(0,"size")]=Math.max(I-H,K-J),s[l(0,"nextSibling")]=-1,s[l(0,"firstChild")]=-1,s[l(0,"mass")]=0,s[l(0,"massCenterX")]=0,s[l(0,"massCenterY")]=0,a=1,c=0;c<u.nodesLength;c+=u.ppn)for(b=0;;)if(s[l(b,"firstChild")]>=0)F=q[j(c,"x")]<s[l(b,"centerX")]?q[j(c,"y")]<s[l(b,"centerY")]?s[l(b,"firstChild")]:s[l(b,"firstChild")]+u.ppr:q[j(c,"y")]<s[l(b,"centerY")]?s[l(b,"firstChild")]+2*u.ppr:s[l(b,"firstChild")]+3*u.ppr,s[l(b,"massCenterX")]=(s[l(b,"massCenterX")]*s[l(b,"mass")]+q[j(c,"x")]*q[j(c,"mass")])/(s[l(b,"mass")]+q[j(c,"mass")]),s[l(b,"massCenterY")]=(s[l(b,"massCenterY")]*s[l(b,"mass")]+q[j(c,"y")]*q[j(c,"mass")])/(s[l(b,"mass")]+q[j(c,"mass")]),s[l(b,"mass")]+=q[j(c,"mass")],b=F;else{if(s[l(b,"node")]<0){s[l(b,"node")]=c;break}if(s[l(b,"firstChild")]=a*u.ppr,p=s[l(b,"size")]/2,t=s[l(b,"firstChild")],s[l(t,"node")]=-1,s[l(t,"centerX")]=s[l(b,"centerX")]-p,s[l(t,"centerY")]=s[l(b,"centerY")]-p,s[l(t,"size")]=p,s[l(t,"nextSibling")]=t+u.ppr,s[l(t,"firstChild")]=-1,s[l(t,"mass")]=0,s[l(t,"massCenterX")]=0,s[l(t,"massCenterY")]=0,t+=u.ppr,s[l(t,"node")]=-1,s[l(t,"centerX")]=s[l(b,"centerX")]-p,s[l(t,"centerY")]=s[l(b,"centerY")]+p,s[l(t,"size")]=p,s[l(t,"nextSibling")]=t+u.ppr,s[l(t,"firstChild")]=-1,s[l(t,"mass")]=0,s[l(t,"massCenterX")]=0,s[l(t,"massCenterY")]=0,t+=u.ppr,s[l(t,"node")]=-1,s[l(t,"centerX")]=s[l(b,"centerX")]+p,s[l(t,"centerY")]=s[l(b,"centerY")]-p,s[l(t,"size")]=p,s[l(t,"nextSibling")]=t+u.ppr,s[l(t,"firstChild")]=-1,s[l(t,"mass")]=0,s[l(t,"massCenterX")]=0,s[l(t,"massCenterY")]=0,t+=u.ppr,s[l(t,"node")]=-1,s[l(t,"centerX")]=s[l(b,"centerX")]+p,s[l(t,"centerY")]=s[l(b,"centerY")]+p,s[l(t,"size")]=p,s[l(t,"nextSibling")]=s[l(b,"nextSibling")],s[l(t,"firstChild")]=-1,s[l(t,"mass")]=0,s[l(t,"massCenterX")]=0,s[l(t,"massCenterY")]=0,a+=4,F=q[j(s[l(b,"node")],"x")]<s[l(b,"centerX")]?q[j(s[l(b,"node")],"y")]<s[l(b,"centerY")]?s[l(b,"firstChild")]:s[l(b,"firstChild")]+u.ppr:q[j(s[l(b,"node")],"y")]<s[l(b,"centerY")]?s[l(b,"firstChild")]+2*u.ppr:s[l(b,"firstChild")]+3*u.ppr,s[l(b,"mass")]=q[j(s[l(b,"node")],"mass")],s[l(b,"massCenterX")]=q[j(s[l(b,"node")],"x")],s[l(b,"massCenterY")]=q[j(s[l(b,"node")],"y")],s[l(F,"node")]=s[l(b,"node")],s[l(b,"node")]=-1,G=q[j(c,"x")]<s[l(b,"centerX")]?q[j(c,"y")]<s[l(b,"centerY")]?s[l(b,"firstChild")]:s[l(b,"firstChild")]+u.ppr:q[j(c,"y")]<s[l(b,"centerY")]?s[l(b,"firstChild")]+2*u.ppr:s[l(b,"firstChild")]+3*u.ppr,F!==G){s[l(G,"node")]=c;break}b=F}}if(u.settings.barnesHutOptimize)for(w=u.settings.scalingRatio,c=0;c<u.nodesLength;c+=u.ppn)for(b=0;;)if(s[l(b,"firstChild")]>=0){if(C=Math.sqrt((q[j(c,"x")]-s[l(b,"massCenterX")])*(q[j(c,"x")]-s[l(b,"massCenterX")])+(q[j(c,"y")]-s[l(b,"massCenterY")])*(q[j(c,"y")]-s[l(b,"massCenterY")])),2*s[l(b,"size")]/C<u.settings.barnesHutTheta){if(x=q[j(c,"x")]-s[l(b,"massCenterX")],y=q[j(c,"y")]-s[l(b,"massCenterY")],u.settings.adjustSizes?C>0?(D=w*q[j(c,"mass")]*s[l(b,"mass")]/C/C,q[j(c,"dx")]+=x*D,q[j(c,"dy")]+=y*D):0>C&&(D=-w*q[j(c,"mass")]*s[l(b,"mass")]/C,q[j(c,"dx")]+=x*D,q[j(c,"dy")]+=y*D):C>0&&(D=w*q[j(c,"mass")]*s[l(b,"mass")]/C/C,q[j(c,"dx")]+=x*D,q[j(c,"dy")]+=y*D),s[l(b,"nextSibling")]<0)break;b=s[l(b,"nextSibling")];continue}b=s[l(b,"firstChild")]}else{if(s[l(b,"node")]>=0&&s[l(b,"node")]!==c&&(x=q[j(c,"x")]-q[j(s[l(b,"node")],"x")],y=q[j(c,"y")]-q[j(s[l(b,"node")],"y")],C=Math.sqrt(x*x+y*y),u.settings.adjustSizes?C>0?(D=w*q[j(c,"mass")]*q[j(s[l(b,"node")],"mass")]/C/C,q[j(c,"dx")]+=x*D,q[j(c,"dy")]+=y*D):0>C&&(D=-w*q[j(c,"mass")]*q[j(s[l(b,"node")],"mass")]/C,q[j(c,"dx")]+=x*D,q[j(c,"dy")]+=y*D):C>0&&(D=w*q[j(c,"mass")]*q[j(s[l(b,"node")],"mass")]/C/C,q[j(c,"dx")]+=x*D,q[j(c,"dy")]+=y*D)),s[l(b,"nextSibling")]<0)break;b=s[l(b,"nextSibling")]}else for(w=u.settings.scalingRatio,m=0;m<u.nodesLength;m+=u.ppn)for(n=0;m>n;n+=u.ppn)x=q[j(m,"x")]-q[j(n,"x")],y=q[j(m,"y")]-q[j(n,"y")],u.settings.adjustSizes?(C=Math.sqrt(x*x+y*y)-q[j(m,"size")]-q[j(n,"size")],C>0?(D=w*q[j(m,"mass")]*q[j(n,"mass")]/C/C,q[j(m,"dx")]+=x*D,q[j(m,"dy")]+=y*D,q[j(n,"dx")]+=x*D,q[j(n,"dy")]+=y*D):0>C&&(D=100*w*q[j(m,"mass")]*q[j(n,"mass")],q[j(m,"dx")]+=x*D,q[j(m,"dy")]+=y*D,q[j(n,"dx")]-=x*D,q[j(n,"dy")]-=y*D)):(C=Math.sqrt(x*x+y*y),C>0&&(D=w*q[j(m,"mass")]*q[j(n,"mass")]/C/C,q[j(m,"dx")]+=x*D,q[j(m,"dy")]+=y*D,q[j(n,"dx")]-=x*D,q[j(n,"dy")]-=y*D));for(t=u.settings.gravity/u.settings.scalingRatio,w=u.settings.scalingRatio,c=0;c<u.nodesLength;c+=u.ppn)D=0,x=q[j(c,"x")],y=q[j(c,"y")],C=Math.sqrt(x*x+y*y),u.settings.strongGravityMode?C>0&&(D=w*q[j(c,"mass")]*t):C>0&&(D=w*q[j(c,"mass")]*t/C),q[j(c,"dx")]-=x*D,q[j(c,"dy")]-=y*D;for(w=1*(u.settings.outboundAttractionDistribution?v:1),o=0;o<u.edgesLength;o+=u.ppe)m=r[k(o,"source")],n=r[k(o,"target")],p=r[k(o,"weight")],B=Math.pow(p,u.settings.edgeWeightInfluence),x=q[j(m,"x")]-q[j(n,"x")],y=q[j(m,"y")]-q[j(n,"y")],u.settings.adjustSizes?(C=Math.sqrt(x*x+y*y-q[j(m,"size")]-q[j(n,"size")])-E,u.settings.linLogMode?u.settings.outboundAttractionDistribution?C>0&&(D=-w*B*Math.log(1+C)/C/q[j(m,"mass")]):C>0&&(D=-w*B*Math.log(1+C)/C):u.settings.outboundAttractionDistribution?C>0&&(D=-w*B/q[j(m,"mass")]):C>0&&(D=-w*B)):(C=Math.sqrt(x*x+y*y)-E,u.settings.linLogMode?u.settings.outboundAttractionDistribution?C>0&&(D=-w*B*Math.log(1+C)/C/q[j(m,"mass")]):C>0&&(D=-w*B*Math.log(1+C)/C):u.settings.outboundAttractionDistribution?(C=1,D=-w*B/q[j(m,"mass")]):(C=1,D=-w*B)),C>0&&(q[j(m,"dx")]+=x*D,q[j(m,"dy")]+=y*D,q[j(n,"dx")]-=x*D,q[j(n,"dy")]-=y*D);var L,M,N,O,P=0;if(u.settings.adjustSizes)for(c=0;c<u.nodesLength;c+=u.ppn)q[j(c,"fixed")]||(L=Math.sqrt(q[j(c,"dx")]*q[j(c,"dx")]+q[j(c,"dy")]*q[j(c,"dy")]),L>u.maxForce&&(q[j(c,"dx")]=q[j(c,"dx")]*u.maxForce/L,q[j(c,"dy")]=q[j(c,"dy")]*u.maxForce/L),M=q[j(c,"mass")]*Math.sqrt((q[j(c,"old_dx")]-q[j(c,"dx")])*(q[j(c,"old_dx")]-q[j(c,"dx")])+(q[j(c,"old_dy")]-q[j(c,"dy")])*(q[j(c,"old_dy")]-q[j(c,"dy")])),N=Math.sqrt((q[j(c,"old_dx")]+q[j(c,"dx")])*(q[j(c,"old_dx")]+q[j(c,"dx")])+(q[j(c,"old_dy")]+q[j(c,"dy")])*(q[j(c,"old_dy")]+q[j(c,"dy")]))/2,O=.1*Math.log(1+N)/(1+Math.sqrt(M)),z=q[j(c,"x")],A=q[j(c,"y")],q[j(c,"x")]=q[j(c,"x")]+q[j(c,"dx")]*(O/u.settings.slowDown),q[j(c,"y")]=q[j(c,"y")]+q[j(c,"dy")]*(O/u.settings.slowDown),x=q[j(c,"x")],y=q[j(c,"y")],C=Math.sqrt((x-z)*(x-z)+(y-A)*(y-A)),P+=C);else for(c=0;c<u.nodesLength;c+=u.ppn)q[j(c,"fixed")]||(M=q[j(c,"mass")]*Math.sqrt((q[j(c,"old_dx")]-q[j(c,"dx")])*(q[j(c,"old_dx")]-q[j(c,"dx")])+(q[j(c,"old_dy")]-q[j(c,"dy")])*(q[j(c,"old_dy")]-q[j(c,"dy")])),N=Math.sqrt((q[j(c,"old_dx")]+q[j(c,"dx")])*(q[j(c,"old_dx")]+q[j(c,"dx")])+(q[j(c,"old_dy")]+q[j(c,"dy")])*(q[j(c,"old_dy")]+q[j(c,"dy")]))/2,O=q[j(c,"convergence")]*Math.log(1+N)/(1+Math.sqrt(M)),q[j(c,"convergence")]=Math.min(1,Math.sqrt(O*(q[j(c,"dx")]*q[j(c,"dx")]+q[j(c,"dy")]*q[j(c,"dy")])/(1+Math.sqrt(M)))),z=q[j(c,"x")],A=q[j(c,"y")],q[j(c,"x")]=q[j(c,"x")]+q[j(c,"dx")]*(O/u.settings.slowDown),q[j(c,"y")]=q[j(c,"y")]+q[j(c,"dy")]*(O/u.settings.slowDown),x=q[j(c,"x")],y=q[j(c,"y")],C=Math.sqrt((x-z)*(x-z)+(y-A)*(y-A)),P+=C);if(u.iterations++,u.settings.autoStop&&(u.converged=u.iterations>u.settings.maxIterations||P/u.nodesLength<u.settings.avgDistanceThreshold,u.converged&&u.settings.alignNodeSiblings)){var Q,R,S={},T={};for(o=0;o<u.edgesLength;o+=u.ppe)m=r[k(o,"source")],n=r[k(o,"target")],m!==n&&(S[m]=S[m]||{},S[n]=S[n]||{},S[m][n]=!0,S[n][m]=!0);Object.keys(S).forEach(function(a){a=~~a,R=Object.keys(S[a]),2==R.length&&(Q=R[0]+";"+R[1],Q in T?T[Q].push(a):(Q=R[1]+";"+R[0],T[Q]||(T[Q]=[~~R[1],~~R[0]]),T[Q].push(a)))});var U,V,W,X,Y,Z,$,_,aa,ba,ca,da,ea,fa,ga,ha=u.settings.nodeSiblingsAngleMin;Object.keys(T).forEach(function(a){if(V=T[a].shift(),W=T[a].shift(),U=T[a].filter(function(a){return!q[j(a,"fixed")]}),1!=U.length){if(Z=q[j(V,"x")],$=q[j(V,"y")],_=q[j(W,"x")],aa=q[j(W,"y")],X=Object.keys(S[V]).length,Y=Object.keys(S[W]).length,ba=e(X/(X+Y),0,1,.25,.75),da=i(Z,$,_,aa,ba),ea=g(Z,$,_,aa),ca=d(Z,$,_,aa),fa=h(ea,ca),ga=f(fa),2*ha>Math.PI)throw new Error("ForceLink.Worker - Invalid parameter: angleMin must be smaller than 2 PI.");ha>0&&(ha>ga||ga>Math.PI-ha&&ga<=Math.PI?fa={x:2*Math.cos(Math.PI-ha),y:2*Math.sin(Math.PI-ha)}:(ga>2*Math.PI-ha||ga>=Math.PI&&ga<Math.PI+ha)&&(fa={x:2*Math.cos(ha),y:2*Math.sin(ha)}));var b=0,c=1,k=1;U.length%2==1&&(k=0,b=1);for(var l=0;l<U.length;l++)q[j(U[l],"x")]=da.x+c*fa.x*k*(b||l>=2?u.settings.nodeSiblingsScale:2*u.settings.nodeSiblingsScale/3),q[j(U[l],"y")]=da.y+c*fa.y*k*(b||l>=2?u.settings.nodeSiblingsScale:2*u.settings.nodeSiblingsScale/3),c=-c,k+=(l+b)%2}})}}function p(a){for(var b=0;a>b;b++)o();t()}var q,r,s,t,u={ppn:10,ppe:3,ppr:9,maxForce:10,iterations:0,converged:!1,settings:{linLogMode:!1,outboundAttractionDistribution:!1,adjustSizes:!1,edgeWeightInfluence:0,scalingRatio:1,strongGravityMode:!1,gravity:1,slowDown:1,barnesHutOptimize:!1,barnesHutTheta:.5,startingIterations:1,iterationsPerRender:1,maxIterations:1e3,avgDistanceThreshold:.01,autoStop:!1,alignNodeSiblings:!1,nodeSiblingsScale:1,nodeSiblingsAngleMin:0,minNodeDistance:0}},v={x:0,y:1,dx:2,dy:3,old_dx:4,old_dy:5,mass:6,convergence:7,size:8,fixed:9},w={source:0,target:1,weight:2},x={node:0,centerX:1,centerY:2,size:3,nextSibling:4,firstChild:5,mass:6,massCenterX:7,massCenterY:8};t="undefined"!=typeof window&&window.document?function(){if(!u.autoStop||u.converged){var a;document.createEvent?(a=document.createEvent("Event"),a.initEvent("newCoords",!0,!1)):(a=document.createEventObject(),a.eventType="newCoords"),a.eventName="newCoords",a.data={nodes:q.buffer,converged:u.converged},requestAnimationFrame(function(){document.dispatchEvent(a)})}}:function(){(!u.autoStop||u.converged)&&self.postMessage({nodes:q.buffer,converged:u.converged},[q.buffer])};var y=function(a){switch(a.data.action){case"start":m(new Float32Array(a.data.nodes),new Float32Array(a.data.edges),a.data.config),p(u.settings.startingIterations);break;case"loop":q=new Float32Array(a.data.nodes),p(u.settings.iterationsPerRender);break;case"config":n(a.data.config);break;case"kill":c(u),q=null,r=null,s=null,self.removeEventListener("message",y)}};self.addEventListener("message",y)};if(inWebWorker)eval(getWorkerFn());else{if("undefined"==typeof sigma)throw new Error("sigma is not declared");sigma.layouts.getForceLinkWorker=getWorkerFn}}.call(this),function(undefined){"use strict";function Supervisor(a,b){_root.URL=_root.URL||_root.webkitURL,b=b||{},this.sigInst=a,this.graph=this.sigInst.graph,this.ppn=10,this.ppe=3,this.config={},this.worker=null,this.shouldUseWorker=null,this.workerUrl=null,this.runOnBackground=null,this.easing=null,this.randomize=null,this.configure(b),this.started=!1,this.running=!1,this.initWorker()}if("undefined"==typeof sigma)throw new Error("sigma is not declared");sigma.utils.pkg("sigma.layouts");var _root=this,webWorkers="Worker"in _root,eventEmitter={};sigma.classes.dispatcher.extend(eventEmitter),Supervisor.prototype.makeBlob=function(a){var b;try{b=new Blob([a],{type:"application/javascript"})}catch(c){_root.BlobBuilder=_root.BlobBuilder||_root.WebKitBlobBuilder||_root.MozBlobBuilder,b=new BlobBuilder,b.append(a),b=b.getBlob()}return b},Supervisor.prototype.graphToByteArrays=function(){var a,b,c,d=this.graph.nodes(),e=this.graph.edges(),f=d.length*this.ppn,g=e.length*this.ppe,h={};for(this.nodesByteArray=new Float32Array(f),this.edgesByteArray=new Float32Array(g),a=b=0,c=d.length;c>a;a++)h[d[a].id]=b,this.nodesByteArray[b]=this.randomize(d[a].x),this.nodesByteArray[b+1]=this.randomize(d[a].y),this.nodesByteArray[b+2]=0,this.nodesByteArray[b+3]=0,this.nodesByteArray[b+4]=0,this.nodesByteArray[b+5]=0,this.nodesByteArray[b+6]=1+this.graph.degree(d[a].id),this.nodesByteArray[b+7]=1,this.nodesByteArray[b+8]=d[a].size,this.nodesByteArray[b+9]=d[a].fixed||0,b+=this.ppn;for(a=b=0,c=e.length;c>a;a++)this.edgesByteArray[b]=h[e[a].source],this.edgesByteArray[b+1]=h[e[a].target],this.edgesByteArray[b+2]=e[a].weight||0,b+=this.ppe},Supervisor.prototype.applyLayoutChanges=function(a){for(var b=this.graph.nodes(),c=0,d=0,e=this.nodesByteArray.length;e>d;d+=this.ppn)b[c].fixed||(a?(b[c].fa2_x=this.nodesByteArray[d],b[c].fa2_y=this.nodesByteArray[d+1]):(b[c].x=this.nodesByteArray[d],b[c].y=this.nodesByteArray[d+1])),c++},Supervisor.prototype.sendByteArrayToWorker=function(a){var b={action:a||"loop",nodes:this.nodesByteArray.buffer},c=[this.nodesByteArray.buffer];"start"===a&&(b.config=this.config||{},b.edges=this.edgesByteArray.buffer,c.push(this.edgesByteArray.buffer)),this.shouldUseWorker?this.worker.postMessage(b,c):_root.postMessage(b,"*")},Supervisor.prototype.start=function(){this.running||(this.running=!0,this.started?this.sendByteArrayToWorker():(this.sendByteArrayToWorker("start"),this.started=!0,eventEmitter.dispatchEvent("start")))},Supervisor.prototype.stop=function(){this.running&&(this.running=!1,eventEmitter.dispatchEvent("stop"))},Supervisor.prototype.initWorker=function(){var _this=this,workerFn=sigma.layouts.getForceLinkWorker();if(this.shouldUseWorker){if(this.workerUrl)this.worker=new Worker(this.workerUrl);else{var blob=this.makeBlob(workerFn);this.worker=new Worker(URL.createObjectURL(blob))}this.worker.postMessage=this.worker.webkitPostMessage||this.worker.postMessage}else eval(workerFn);this.msgName=this.worker?"message":"newCoords",this.listener=function(a){_this.nodesByteArray=new Float32Array(a.data.nodes),_this.running&&(_this.applyLayoutChanges(_this.runOnBackground),_this.sendByteArrayToWorker(),_this.runOnBackground||_this.sigInst.refresh({skipIndexation:!0})),a.data.converged&&(_this.running=!1),_this.running||(_this.killWorker(),_this.runOnBackground&&_this.easing?(_this.applyLayoutChanges(!0),eventEmitter.dispatchEvent("interpolate"),_this.graph.nodes().filter(function(a){return a.fixed}).forEach(function(a){a.fa2_x=a.x,a.fa2_y=a.y}),sigma.plugins.animate(_this.sigInst,{x:"fa2_x",y:"fa2_y"},{easing:_this.easing,onComplete:function(){_this.sigInst.refresh(),eventEmitter.dispatchEvent("stop")}})):(_this.applyLayoutChanges(!1),_this.sigInst.refresh(),eventEmitter.dispatchEvent("stop")))},(this.worker||document).addEventListener(this.msgName,this.listener),this.graphToByteArrays(),_this.sigInst.bind("kill",function(){sigma.layouts.killForceLink()})},Supervisor.prototype.killWorker=function(){this.worker?this.worker.terminate():(_root.postMessage({action:"kill"},"*"),document.removeEventListener(this.msgName,this.listener))},Supervisor.prototype.configure=function(a){switch(this.config=a,this.shouldUseWorker=a.worker===!1?!1:webWorkers,this.workerUrl=a.workerUrl,this.runOnBackground=a.background?!0:!1,this.easing=a.easing,
a.randomize){case"globally":this.randomize=function(b){return Math.random()*(a.randomizeFactor||1)};break;case"locally":this.randomize=function(b){return b+Math.random()*(a.randomizeFactor||1)};break;default:this.randomize=function(a){return a}}if(this.started){var b={action:"config",config:this.config};this.shouldUseWorker?this.worker.postMessage(b):_root.postMessage(b,"*")}};var supervisor=null;sigma.layouts.startForceLink=function(a,b){return supervisor?supervisor.running||(supervisor.killWorker(),supervisor.initWorker(),supervisor.started=!1):supervisor=new Supervisor(a,b),b&&supervisor.configure(b),supervisor.start(),eventEmitter},sigma.layouts.stopForceLink=function(){return supervisor?(supervisor.stop(),supervisor):void 0},sigma.layouts.killForceLink=function(){supervisor&&(supervisor.stop(),supervisor.killWorker(),supervisor=null,eventEmitter={},sigma.classes.dispatcher.extend(eventEmitter))},sigma.layouts.configForceLink=function(a,b){return supervisor?supervisor.running||(supervisor.killWorker(),supervisor.initWorker(),supervisor.started=!1):supervisor=new Supervisor(a,b),supervisor.configure(b),eventEmitter},sigma.layouts.isForceLinkRunning=function(){return!!supervisor&&supervisor.running}}.call(this),function(a){"use strict";function b(){var a=this;this.init=function(a,b){if(b=b||{},this.sigInst=a,this.config=sigma.utils.extend(b,c),this.easing=b.easing,this.duration=b.duration,!sigma.plugins||"undefined"==typeof sigma.plugins.animate)throw new Error("sigma.plugins.animate is not declared");this.running=!1},this.atomicGo=function(){if(!this.running||this.iterCount<1)return!1;var b,c,d,e,f,g,h,i,j,k=this.sigInst.graph.nodes(),l=this.sigInst.graph.edges(),m=k.length,n=l.length;this.config.area=this.config.autoArea?m*m:this.config.area,this.iterCount--,this.running=this.iterCount>0;var o=Math.sqrt(this.config.area)/10,p=Math.sqrt(this.config.area/(1+m));for(b=0;m>b;b++)for(d=k[b],d.fr||(d.fr_x=d.x,d.fr_y=d.y,d.fr={dx:0,dy:0}),c=0;m>c;c++)e=k[c],d.id!=e.id&&(g=d.fr_x-e.fr_x,h=d.fr_y-e.fr_y,i=Math.sqrt(g*g+h*h)+.01,i>0&&(j=p*p/i,d.fr.dx+=g/i*j,d.fr.dy+=h/i*j));var q,r,s;for(b=0;n>b;b++)f=l[b],q=a.sigInst.graph.nodes(f.source),r=a.sigInst.graph.nodes(f.target),g=q.fr_x-r.fr_x,h=q.fr_y-r.fr_y,i=Math.sqrt(g*g+h*h)+.01,s=i*i/p,i>0&&(q.fr.dx-=g/i*s,q.fr.dy-=h/i*s,r.fr.dx+=g/i*s,r.fr.dy+=h/i*s);var t,u,v;for(b=0;m>b;b++)d=k[b],t=Math.sqrt(d.fr_x*d.fr_x+d.fr_y*d.fr_y),u=.01*p*a.config.gravity*t,d.fr.dx-=u*d.fr_x/t,d.fr.dy-=u*d.fr_y/t,d.fr.dx*=a.config.speed,d.fr.dy*=a.config.speed,d.fixed||(g=d.fr.dx,h=d.fr.dy,i=Math.sqrt(g*g+h*h),i>0&&(v=Math.min(o*a.config.speed,i),d.fr_x+=g/i*v,d.fr_y+=h/i*v));return this.running},this.go=function(){for(this.iterCount=this.config.iterations;this.running;)this.atomicGo();this.stop()},this.start=function(){if(!this.running){var b=this.sigInst.graph.nodes();this.running=!0;for(var c=0;c<b.length;c++)b[c].fr_x=b[c].x,b[c].fr_y=b[c].y,b[c].fr={dx:0,dy:0};e[a.sigInst.id].dispatchEvent("start"),this.go()}},this.stop=function(){var b=this.sigInst.graph.nodes();if(this.running=!1,this.easing)e[a.sigInst.id].dispatchEvent("interpolate"),sigma.plugins.animate(a.sigInst,{x:"fr_x",y:"fr_y"},{easing:a.easing,onComplete:function(){a.sigInst.refresh();for(var c=0;c<b.length;c++)b[c].fr=null,b[c].fr_x=null,b[c].fr_y=null;e[a.sigInst.id].dispatchEvent("stop")},duration:a.duration});else{for(var c=0;c<b.length;c++)b[c].x=b[c].fr_x,b[c].y=b[c].fr_y;this.sigInst.refresh();for(var c=0;c<b.length;c++)b[c].fr=null,b[c].fr_x=null,b[c].fr_y=null;e[a.sigInst.id].dispatchEvent("stop")}},this.kill=function(){this.sigInst=null,this.config=null,this.easing=null}}if("undefined"==typeof sigma)throw new Error("sigma is not declared");sigma.utils.pkg("sigma.layouts.fruchtermanReingold");var c={autoArea:!0,area:1,gravity:10,speed:.1,iterations:1e3},d={},e={};sigma.layouts.fruchtermanReingold.configure=function(a,c){if(!a)throw new Error('Missing argument: "sigInst"');if(!c)throw new Error('Missing argument: "config"');return d[a.id]||(d[a.id]=new b,e[a.id]={},sigma.classes.dispatcher.extend(e[a.id]),a.bind("kill",function(){d[a.id].kill(),d[a.id]=null,e[a.id]=null})),d[a.id].init(a,c),e[a.id]},sigma.layouts.fruchtermanReingold.start=function(a,b){if(!a)throw new Error('Missing argument: "sigInst"');return b&&this.configure(a,b),d[a.id].start(),e[a.id]},sigma.layouts.fruchtermanReingold.isRunning=function(a){if(!a)throw new Error('Missing argument: "sigInst"');return!!d[a.id]&&d[a.id].running},sigma.layouts.fruchtermanReingold.progress=function(a){if(!a)throw new Error('Missing argument: "sigInst"');return(d[a.id].config.iterations-d[a.id].iterCount)/d[a.id].config.iterations}}.call(this),function(a){"use strict";function b(){var a=this;this.init=function(a,b){if(b=b||{},this.sigInst=a,this.config=sigma.utils.extend(b,c),this.easing=b.easing,this.duration=b.duration,b.nodes&&(this.nodes=b.nodes,delete b.nodes),!sigma.plugins||"undefined"==typeof sigma.plugins.animate)throw new Error("sigma.plugins.animate is not declared");this.running=!1},this.atomicGo=function(){if(!this.running||this.iterCount<1)return!1;var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w=this.nodes||this.sigInst.graph.nodes(),x=w.length,y=1/0,z=-(1/0),A=1/0,B=-(1/0);for(this.iterCount--,this.running=!1,b=0;x>b;b++)c=w[b],c.dn.dx=0,c.dn.dy=0,y=Math.min(y,c.dn_x-(c.dn_size*a.config.scaleNodes+a.config.nodeMargin)),z=Math.max(z,c.dn_x+(c.dn_size*a.config.scaleNodes+a.config.nodeMargin)),A=Math.min(A,c.dn_y-(c.dn_size*a.config.scaleNodes+a.config.nodeMargin)),B=Math.max(B,c.dn_y+(c.dn_size*a.config.scaleNodes+a.config.nodeMargin));for(e=z-y,f=B-A,g=(y+z)/2,h=(A+B)/2,y=g-a.config.permittedExpansion*e/2,z=g+a.config.permittedExpansion*e/2,A=h-a.config.permittedExpansion*f/2,B=h+a.config.permittedExpansion*f/2,i={},j=0;j<a.config.gridSize;j++)for(i[j]={},k=0;k<a.config.gridSize;k++)i[j][k]=[];for(b=0;x>b;b++)for(c=w[b],s=c.dn_x-(c.dn_size*a.config.scaleNodes+a.config.nodeMargin),t=c.dn_x+(c.dn_size*a.config.scaleNodes+a.config.nodeMargin),u=c.dn_y-(c.dn_size*a.config.scaleNodes+a.config.nodeMargin),v=c.dn_y+(c.dn_size*a.config.scaleNodes+a.config.nodeMargin),l=Math.floor(a.config.gridSize*(s-y)/(z-y)),m=Math.floor(a.config.gridSize*(t-y)/(z-y)),n=Math.floor(a.config.gridSize*(u-A)/(B-A)),o=Math.floor(a.config.gridSize*(v-A)/(B-A)),k=l;m>=k;k++)for(j=n;o>=j;j++)i[j][k].push(c.id);for(p={},j=0;j<a.config.gridSize;j++)for(k=0;k<a.config.gridSize;k++)i[j][k].forEach(function(b){for(p[b]||(p[b]=[]),q=Math.max(0,j-1);q<=Math.min(j+1,a.config.gridSize-1);q++)for(r=Math.max(0,k-1);r<=Math.min(k+1,a.config.gridSize-1);r++)i[q][r].forEach(function(a){a!==b&&-1===p[b].indexOf(a)&&p[b].push(a)})});for(b=0;x>b;b++)d=w[b],p[d.id].forEach(function(b){var c=a.sigInst.graph.nodes(b),g=c.dn_x-d.dn_x,h=c.dn_y-d.dn_y,i=Math.sqrt(g*g+h*h),j=i<d.dn_size*a.config.scaleNodes+a.config.nodeMargin+(c.dn_size*a.config.scaleNodes+a.config.nodeMargin);j&&(a.running=!0,i>0?(c.dn.dx+=g/i*(1+d.dn_size),c.dn.dy+=h/i*(1+d.dn_size)):(c.dn.dx+=.01*e*(.5-Math.random()),c.dn.dy+=.01*f*(.5-Math.random())))});for(b=0;x>b;b++)c=w[b],c.fixed||(c.dn_x=c.dn_x+.1*c.dn.dx*a.config.speed,c.dn_y=c.dn_y+.1*c.dn.dy*a.config.speed);return this.running&&this.iterCount<1&&(this.running=!1),this.running},this.go=function(){for(this.iterCount=this.config.maxIterations;this.running;)this.atomicGo();this.stop()},this.start=function(){if(!this.running){var b=this.sigInst.graph.nodes(),c=this.sigInst.renderers[a.config.rendererIndex].options.prefix;this.running=!0;for(var d=0;d<b.length;d++)b[d].dn_x=b[d][c+"x"],b[d].dn_y=b[d][c+"y"],b[d].dn_size=b[d][c+"size"],b[d].dn={dx:0,dy:0};e[a.sigInst.id].dispatchEvent("start"),this.go()}},this.stop=function(){var b=this.sigInst.graph.nodes();if(this.running=!1,this.easing)e[a.sigInst.id].dispatchEvent("interpolate"),sigma.plugins.animate(a.sigInst,{x:"dn_x",y:"dn_y"},{easing:a.easing,onComplete:function(){a.sigInst.refresh();for(var c=0;c<b.length;c++)b[c].dn=null,b[c].dn_x=null,b[c].dn_y=null;e[a.sigInst.id].dispatchEvent("stop")},duration:a.duration});else{for(var c=0;c<b.length;c++)b[c].x=b[c].dn_x,b[c].y=b[c].dn_y;this.sigInst.refresh();for(var c=0;c<b.length;c++)b[c].dn=null,b[c].dn_x=null,b[c].dn_y=null;e[a.sigInst.id].dispatchEvent("stop")}},this.kill=function(){this.sigInst=null,this.config=null,this.easing=null}}if("undefined"==typeof sigma)throw new Error("sigma is not declared");sigma.utils.pkg("sigma.layouts.noverlap");var c={speed:3,scaleNodes:1.2,nodeMargin:5,gridSize:20,permittedExpansion:1.1,rendererIndex:0,maxIterations:500},d={},e={};sigma.prototype.configNoverlap=function(a){var c=this;if(!a)throw new Error('Missing argument: "config"');return d[c.id]||(d[c.id]=new b,e[c.id]={},sigma.classes.dispatcher.extend(e[c.id]),c.bind("kill",function(){d[c.id].kill(),d[c.id]=null,e[c.id]=null})),d[c.id].init(c,a),e[c.id]},sigma.prototype.startNoverlap=function(a){var b=this;return a&&this.configNoverlap(b,a),d[b.id].start(),e[b.id]},sigma.prototype.isNoverlapRunning=function(){var a=this;return!!d[a.id]&&d[a.id].running}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.neo4j"),sigma.utils.pkg("sigma.utils"),sigma.utils.pkg("sigma.parsers"),sigma.neo4j.send=function(a,b,c,d,e,f){var g,h,i,j=sigma.utils.xhr(),f=f||-1;if(g=a,"object"==typeof a&&(g=a.url,h=a.user,i=a.password),!j)throw"XMLHttpRequest not supported, cannot load the file.";g+=b,j.open(c,g,!0),h&&i&&j.setRequestHeader("Authorization","Basic "+btoa(h+":"+i)),j.setRequestHeader("Accept","application/json"),j.setRequestHeader("Content-type","application/json; charset=utf-8"),f>0&&j.setRequestHeader("max-execution-time",f),j.onreadystatechange=function(){4===j.readyState&&e(JSON.parse(j.responseText))},j.send(d)},sigma.neo4j.cypher_parse=function(a){var b,c={nodes:[],edges:[]},d={},e={};Array.isArray(a)||(a=a.results[0].data),a.forEach(function(a){a.graph.nodes.forEach(function(a){var b={id:a.id,label:a.id,x:Math.random(),y:Math.random(),size:1,neo4j_labels:a.labels,neo4j_data:a.properties};b.id in d||(d[b.id]=b)}),a.graph.relationships.forEach(function(a){var b={id:a.id,label:a.type,source:a.startNode,target:a.endNode,neo4j_type:a.type,neo4j_data:a.properties};b.id in e||(e[b.id]=b)})});for(b in d)c.nodes.push(d[b]);for(b in e)c.edges.push(e[b]);return c},sigma.neo4j.cypher=function(a,b,c,d,e){var f,g,h="/db/data/transaction/commit",e=e||-1;f=JSON.stringify({statements:[{statement:b,resultDataContents:["graph"],includeStats:!1}]}),g=function(a){return function(b){if(b.errors.length>0)return a(null,b.errors);var d={nodes:[],edges:[]};d=sigma.neo4j.cypher_parse(b),c instanceof sigma?(c.graph.clear(),c.graph.read(d)):"object"==typeof c?(c=new sigma(c),c.graph.read(d),c.refresh()):"function"==typeof c&&(a=c,c=null),a&&a(c||d)}},sigma.neo4j.send(a,h,"POST",f,g(d),e)},sigma.neo4j.getLabels=function(a,b){sigma.neo4j.send(a,"/db/data/labels","GET",null,b)},sigma.neo4j.getTypes=function(a,b){sigma.neo4j.send(a,"/db/data/relationship/types","GET",null,b)}}.call(this),function(a){"use strict";function b(a){var b={id:a.id,label:a.label};return a.viz&&(b.viz=a.viz),a.attributes&&(b.attributes=a.attributes),b}function c(a){var b={id:a.id,type:a.type||"undirected",label:a.label||"",source:a.source,target:a.target,weight:+a.weight||1};return a.viz&&(b.viz=a.viz),a.attributes&&(b.attributes=a.attributes),b}function d(a){function d(){var a={};return l.els.meta?(a.lastmodifieddate=l.els.meta.getAttribute("lastmodifieddate"),h.nodeListEach(l.els.meta.childNodes,function(b){a[b.tagName.toLowerCase()]=b.textContent}),a):a}function e(a){var b=[];return l.els.model[a]&&h.nodeListEach(l.els.model[a],function(a){var c={id:a.getAttribute("id")||a.getAttribute("for"),type:a.getAttribute("type")||"string",title:a.getAttribute("title")||""},d=h.nodeListToArray(a.childNodes);d.length>0&&(c.defaultValue=d[0].textContent),b.push(c)}),b.length>0?b:!1}function f(a,b){var c={},d=b.getElementsByTagName("attvalue"),e=h.nodeListToHash(d,function(a){var b=h.namedNodeMapToObject(a.attributes),c=b.id||b["for"];return{key:c,value:b.value}});return a.map(function(a){c[a.id]=!(a.id in e)&&"defaultValue"in a?h.enforceType(a.type,a.defaultValue):h.enforceType(a.type,e[a.id])}),c}function g(a){var c=[];return h.nodeListEach(l.els.nodes,function(d){var e={id:d.getAttribute("id"),label:d.getAttribute("label")||""};a&&(e.attributes=f(a,d)),l.hasViz&&(e.viz=i(d)),c.push(b(e))}),c}function i(a){var b={},c=h.getFirstElementByTagNS(a,"viz","color");if(c){var d=["r","g","b","a"].map(function(a){return c.getAttribute(a)});b.color=h.getRGB(d)}var e=h.getFirstElementByTagNS(a,"viz","position");e&&(b.position={},["x","y","z"].map(function(a){b.position[a]=+e.getAttribute(a)}));var f=h.getFirstElementByTagNS(a,"viz","size");f&&(b.size=+f.getAttribute("value"));var g=h.getFirstElementByTagNS(a,"viz","shape");return g&&(b.shape=g.getAttribute("value")),b}function j(a,b){var d=[];return h.nodeListEach(l.els.edges,function(e){var g=h.namedNodeMapToObject(e.attributes);"type"in g||(g.type=b),a&&(g.attributes=f(a,e)),l.hasViz&&(g.viz=k(e)),d.push(c(g))}),d}function k(a){var b={},c=h.getFirstElementByTagNS(a,"viz","color");if(c){var d=["r","g","b","a"].map(function(a){return c.getAttribute(a)});b.color=h.getRGB(d)}var e=h.getFirstElementByTagNS(a,"viz","shape");e&&(b.shape=e.getAttribute("value"));var f=h.getFirstElementByTagNS(a,"viz","thickness");return f&&(b.thickness=+f.getAttribute("value")),b}var l={};l.els={root:a.getElementsByTagName("gexf")[0],graph:a.getElementsByTagName("graph")[0],meta:a.getElementsByTagName("meta")[0],nodes:a.getElementsByTagName("node"),edges:a.getElementsByTagName("edge"),model:h.getModelTags(a)},l.hasViz=!!h.getAttributeNS(l.els.root,"xmlns","viz"),l.version=l.els.root.getAttribute("version")||"1.0",l.mode=l.els.graph.getAttribute("mode")||"static";var m=l.els.graph.getAttribute("defaultedgetype");l.defaultEdgetype=m||"undirected";var n=e("node"),o=e("edge"),p={version:l.version,mode:l.mode,defaultEdgeType:l.defaultEdgetype,meta:d(),model:{},nodes:g(n),edges:j(o,l.defaultEdgetype)};return n&&(p.model.node=n),o&&(p.model.edge=o),p}function e(a,b){var c=function(){if(window.XMLHttpRequest)return new XMLHttpRequest;var a,b;if(window.ActiveXObject){a=["Msxml2.XMLHTTP.6.0","Msxml2.XMLHTTP.3.0","Msxml2.XMLHTTP","Microsoft.XMLHTTP"];for(b in a)try{return new ActiveXObject(a[b])}catch(c){}}return null}();if(!c)throw"XMLHttpRequest not supported, cannot load the file.";var d,e="function"==typeof b;return c.overrideMimeType?(c.overrideMimeType("text/xml"),d=function(a){return a.responseXML}):d=function(a){var b=new DOMParser;return b.parseFromString(a.responseText,"application/xml")},c.open("GET",a,e),e&&(c.onreadystatechange=function(){4===c.readyState&&b(d(c))}),c.send(),e?c:d(c)}function f(a){return d(a)}function g(a,b){return"function"==typeof b?e(a,function(a){b(d(a))}):d(e(a))}var h={getModelTags:function(a){var b,c=a.getElementsByTagName("attributes"),d={},e=c.length;for(b=0;e>b;b++)d[c[b].getAttribute("class")]=c[b].childNodes;return d},nodeListToArray:function(a){for(var b=[],c=0,d=a.length;d>c;++c)"#text"!==a[c].nodeName&&b.push(a[c]);return b},nodeListEach:function(a,b){for(var c=0,d=a.length;d>c;++c)"#text"!==a[c].nodeName&&b(a[c])},nodeListToHash:function(a,b){for(var c={},d=0;d<a.length;d++)if("#text"!==a[d].nodeName){var e=b(a[d]);c[e.key]=e.value}return c},namedNodeMapToObject:function(a){for(var b={},c=0;c<a.length;c++)b[a[c].name]=a[c].value;return b},getFirstElementByTagNS:function(a,b,c){var d=a.getElementsByTagName(b+":"+c)[0];return d||(d=a.getElementsByTagNameNS(b,c)[0]),d||(d=a.getElementsByTagName(c)[0]),d},getAttributeNS:function(b,c,d){var e=b.getAttribute(c+":"+d);return e===a&&(e=b.getAttributeNS(c,d)),e===a&&(e=b.getAttribute(d)),e},enforceType:function(a,b){switch(a){case"boolean":b="true"===b;break;case"integer":case"long":case"float":case"double":b=+b;break;case"liststring":b=b?b.split("|"):[]}return b},getRGB:function(a){return a[3]?"rgba("+a.join(",")+")":"rgb("+a.slice(0,-1).join(",")+")"}};if("undefined"!=typeof this.gexf)throw'gexf: error - a variable called "gexf" already exists in the global scope';this.gexf={parse:f,fetch:g,version:"0.1.1"},"undefined"!=typeof exports&&this.exports!==exports&&(module.exports=this.gexf)}.call(this),function(a){"use strict";function b(){return"e"+c++}if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.parsers");var c=0;sigma.parsers.gexf=function(a,c,d){function e(a){for(h=a.nodes,f=0,g=h.length;g>f;f++)i=h[f],i.id=i.id,i.viz&&"object"==typeof i.viz&&(i.viz.position&&"object"==typeof i.viz.position&&(i.x=i.viz.position.x,i.y=-i.viz.position.y),i.size=i.viz.size,i.color=i.viz.color),i.attributes&&(i.attributes.latitude&&(i.lat=i.attributes.latitude),i.attributes.longitude&&(i.lng=i.attributes.longitude));for(h=a.edges,f=0,g=h.length;g>f;f++)i=h[f],i.id="string"==typeof i.id?i.id:b(),i.source=""+i.source,i.target=""+i.target,i.viz&&"object"==typeof i.viz&&(i.color=i.viz.color,i.size=i.viz.thickness),i.size=i.weight,i.direction=i.type,delete i.type;if(c instanceof sigma){for(c.graph.clear(),h=a.nodes,f=0,g=h.length;g>f;f++)c.graph.addNode(h[f]);for(h=a.edges,f=0,g=h.length;g>f;f++)c.graph.addEdge(h[f])}else"object"==typeof c?(c.graph=a,c=new sigma(c)):"function"==typeof c&&(d=c,c=null);return d?void d(c||a):a}var f,g,h,i;if("string"==typeof a)gexf.fetch(a,e);else if("object"==typeof a)return e(gexf.parse(a))}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.parsers"),sigma.utils.pkg("sigma.utils"),sigma.utils.xhr=function(){if(window.XMLHttpRequest)return new XMLHttpRequest;var a,b;if(window.ActiveXObject){a=["Msxml2.XMLHTTP.6.0","Msxml2.XMLHTTP.3.0","Msxml2.XMLHTTP","Microsoft.XMLHTTP"];for(b in a)try{return new ActiveXObject(a[b])}catch(c){}}return null},sigma.parsers.json=function(a,b,c){var d,e=sigma.utils.xhr();if(!e)throw"XMLHttpRequest not supported, cannot load the file.";e.open("GET",a,!0),e.onreadystatechange=function(){4===e.readyState&&(d=JSON.parse(e.responseText),b instanceof sigma?(b.graph.clear(),b.graph.read(d)):"object"==typeof b?(b.graph=d,b=new sigma(b)):"function"==typeof b&&(c=b,b=null),c&&c(b||d))},e.send()}}.call(this),function(){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";var a=function(a,b,c){var d=void 0!=a&&void 0!=b&&void 0!=a.x&&void 0!=a.y&&void 0!=b.x&&void 0!=b.y;if(d)return(c||0)+Math.sqrt(Math.pow(b.y-a.y,2)+Math.pow(b.x-a.x,2))};sigma.classes.graph.addMethod("astar",function(b,c,d){var e=new sigma.classes.configurable({undirected:!1,pathLengthFunction:a,heuristicLengthFunction:void 0},d||{}),f=e("pathLengthFunction"),g=e("heuristicLengthFunction")||f,h=this.nodes(b),i=this.nodes(c),j={},k=[],l=function(a,b,c,d){var e=a.id,f={pathLength:c,heuristicLength:d,node:a,nodeId:e,previousNode:b};if(void 0==j[e]||j[e].pathLenth>c){j[e]=f;var g,h;for(h=0;h<k.length&&(g=k[h],!(g.heuristicLength>d));h++);k.splice(h,0,f)}};l(h,null,0,0);var m,n=!1;m=e("undirected")?this.allNeighborsIndex:this.outNeighborsIndex;for(var o,p,q,r,s,t;k.length>0;){if(o=k.shift(),o.nodeId==c){n=!0;break}for(p=Object.keys(m[o.nodeId]),t=0;t<p.length;t++)q=this.nodes(p[t]),r=f(o.node,q,o.pathLength),s=g(q,i,r),l(q,o.node,r,s)}if(n){for(var u=[],v=i;v;)u.unshift(v),v=j[v.id].previousNode;return u}})}.call(window),function(a){"use strict";function b(){f=new sigma.utils.map,g=new sigma.utils.map}function c(){null!==h&&j&&h.dispatchEvent("activeNodes")}function d(){null!==h&&j&&h.dispatchEvent("activeEdges")}function e(a){h=this,i=a.graph,null===f&&(f=new sigma.utils.map,i.nodes().forEach(function(a){a.active&&f.set(a.id,a)})),null===g&&(g=new sigma.utils.map,i.edges().forEach(function(a){a.active&&g.set(a.id,a)})),sigma.classes.dispatcher.extend(this),a.bind("kill",function(){h.kill()})}if("undefined"==typeof sigma)throw new Error("sigma is not declared");sigma.utils.pkg("sigma.plugins");var f,g,h=null,i=null,j=!0;b(),sigma.classes.graph.attach("addNode","sigma.plugins.activeState.addNode",function(a){a.active&&(f.set(a.id,this.nodesIndex.get(a.id)),c())}),sigma.classes.graph.attach("addEdge","sigma.plugins.activeState.addEdge",function(a){a.active&&(g.set(a.id,this.edgesIndex.get(a.id)),d())}),sigma.classes.graph.attachBefore("dropNode","sigma.plugins.activeState.dropNode",function(b){this.nodesIndex.get(b)!==a&&this.nodesIndex.get(b).active&&(f["delete"](b),c())}),sigma.classes.graph.attachBefore("dropEdge","sigma.plugins.activeState.dropEdge",function(b){this.edgesIndex.get(b)!==a&&this.edgesIndex.get(b).active&&(g["delete"](b),d())}),sigma.classes.graph.attachBefore("clear","sigma.plugins.activeState.clear",b),e.prototype.kill=function(){this.unbind(),f=null,g=null,i=null,h=null},e.prototype.addNodes=function(a){var b,d=f.size;if(arguments.length||i.nodes().forEach(function(a){a.hidden||(a.active=!0,f.set(a.id,a))}),arguments.length>1)throw new TypeError("Too many arguments. Use an array instead.");if("string"==typeof a||"number"==typeof a)b=i.nodes(a),b.hidden||(b.active=!0,f.set(a,b));else if(Array.isArray(a)){var e,g;for(e=0,g=a.length;g>e;e++){if("string"!=typeof a[e]&&"number"!=typeof a[e])throw new TypeError("Invalid argument: a node id is not a string or a number, was "+a[e]);b=i.nodes(a[e]),b.hidden||(b.active=!0,f.set(a[e],b))}}return d!=f.size&&c(),this},e.prototype.addEdges=function(a){var b,c=g.size;if(arguments.length||i.edges().forEach(function(a){a.hidden||(a.active=!0,g.set(a.id,a))}),arguments.length>1)throw new TypeError("Too many arguments. Use an array instead.");if("string"==typeof a||"number"==typeof a)b=i.edges(a),b.hidden||(b.active=!0,g.set(a,b));else if(Array.isArray(a)){var e,f;for(e=0,f=a.length;f>e;e++){if("string"!=typeof a[e]&&"number"!=typeof a[e])throw new TypeError("Invalid argument: an edge id is not a string or a number, was "+a[e]);b=i.edges(a[e]),b.hidden||(b.active=!0,g.set(a[e],b))}}return c!=g.size&&d(),this},e.prototype.dropNodes=function(a){var b=f.size;if(arguments.length||i.nodes().forEach(function(a){a.active=!1,f["delete"](a.id)}),arguments.length>1)throw new TypeError("Too many arguments. Use an array instead.");if("string"==typeof a||"number"==typeof a)i.nodes(a).active=!1,f["delete"](a);else if(Array.isArray(a)){var d,e;for(d=0,e=a.length;e>d;d++){if("string"!=typeof a[d]&&"number"!=typeof a[d])throw new TypeError("Invalid argument: a node id is not a string or a number, was "+a[d]);i.nodes(a[d]).active=!1,f["delete"](a[d])}}return b!=f.size&&c(),this},e.prototype.dropEdges=function(a){var b=g.size;if(arguments.length||i.edges().forEach(function(a){a.active=!1,g["delete"](a.id)}),arguments.length>1)throw new TypeError("Too many arguments. Use an array instead.");if("string"==typeof a||"number"==typeof a)i.edges(a).active=!1,g["delete"](a);else if(Array.isArray(a)){var c,e;for(c=0,e=a.length;e>c;c++){if("string"!=typeof a[c]&&"number"!=typeof a[c])throw new TypeError("Invalid argument: an edge id is not a string or a number, was "+a[c]);i.edges(a[c]).active=!1,g["delete"](a[c])}}return b!=g.size&&d(),this},e.prototype.addNeighbors=function(){if(!("adjacentNodes"in i))throw new Error("Missing method graph.adjacentNodes");var a=f.keyList();return f.forEach(function(b,c){i.adjacentNodes(c).forEach(function(b){b.hidden||a.push(b.id)})}),j=!1,this.dropNodes().dropEdges(),j=!0,this.addNodes(a),this},e.prototype.setNodesBy=function(a){var b=[];return i.nodes().forEach(function(c){a.call(i,c)&&(c.hidden||b.push(c.id))}),j=!1,this.dropNodes(),j=!0,this.addNodes(b),this},e.prototype.setEdgesBy=function(a){var b=[];return i.edges().forEach(function(c){a.call(i,c)&&(c.hidden||b.push(c.id))}),j=!1,this.dropEdges(),j=!0,this.addEdges(b),this},e.prototype.invertNodes=function(){var a=i.nodes().filter(function(a){return!a.hidden&&!a.active}).map(function(a){return a.id});return j=!1,this.dropNodes(),j=!0,a.length?this.addNodes(a):c(),this},e.prototype.invertEdges=function(){var a=i.edges().filter(function(a){return!a.hidden&&!a.active}).map(function(a){return a.id});return j=!1,this.dropEdges(),j=!0,a.length?this.addEdges(a):d(),this},e.prototype.nodes=function(){if(!f)return[];if(!sigma.forceES5)return f.valueList();var a=[];return f.forEach(function(b,c){a.push(b)}),a},e.prototype.edges=function(){if(!g)return[];if(!sigma.forceES5)return g.valueList();var a=[];return g.forEach(function(b,c){a.push(b)}),a},e.prototype.nbNodes=function(){return f?f.size:0},e.prototype.nbEdges=function(){return g?g.size:0},sigma.plugins.activeState=function(a){return h||(h=new e(a)),h},sigma.plugins.killActiveState=function(){h instanceof e&&(h.kill(),h=null)}}.call(this),function(){"use strict";function a(a){if(d[a])return d[a];var b=[0,0,0];return a.match(/^#/)?(a=(a||"").replace(/^#/,""),b=3===a.length?[parseInt(a.charAt(0)+a.charAt(0),16),parseInt(a.charAt(1)+a.charAt(1),16),parseInt(a.charAt(2)+a.charAt(2),16)]:[parseInt(a.charAt(0)+a.charAt(1),16),parseInt(a.charAt(2)+a.charAt(3),16),parseInt(a.charAt(4)+a.charAt(5),16)]):a.match(/^ *rgba? *\(/)&&(a=a.match(/^ *rgba? *\( *([0-9]*) *, *([0-9]*) *, *([0-9]*) *(,.*)?\) *$/),b=[+a[1],+a[2],+a[3]]),d[a]={r:b[0],g:b[1],b:b[2]},d[a]}function b(b,c,d){b=a(b),c=a(c);var e={r:b.r*(1-d)+c.r*d,g:b.g*(1-d)+c.g*d,b:b.b*(1-d)+c.b*d};return"rgb("+[0|e.r,0|e.g,0|e.b].join(",")+")"}if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.plugins");var c=0,d={};sigma.plugins.animate=function(a,d,e){function f(){var c=(sigma.utils.dateNow()-m)/k;c>=1?(g.forEach(function(a){for(var b in d)b in d&&d[b]in a&&(a[b]=a[d[b]])}),a.refresh({skipIndexation:!0}),"function"==typeof i.onComplete&&i.onComplete(),a.dispatchEvent("animate.end")):(c=l(c),g.forEach(function(a){for(var e in d)e in d&&d[e]in a&&(e.match(/color$/)?a[e]=b(h[a.id][e],a[d[e]],c):a[e]=a[d[e]]*c+h[a.id][e]*(1-c))}),a.refresh({skipIndexation:!0}),a.animations[j]=requestAnimationFrame(f))}var g,h,i=e||{},j=++c,k=i.duration||a.settings("animationsTime"),l="string"==typeof i.easing?sigma.utils.easings[i.easing]:"function"==typeof i.easing?i.easing:sigma.utils.easings.quadraticInOut,m=sigma.utils.dateNow();g=i.nodes&&i.nodes.length?"object"==typeof i.nodes[0]?i.nodes:a.graph.nodes(i.nodes):a.graph.nodes(),h=g.reduce(function(a,b){var c;a[b.id]={};for(c in d)c in b&&(a[b.id][c]=b[c]);return a},{}),a.animations=a.animations||Object.create({}),sigma.plugins.killAnimate(a),a.dispatchEvent("animate.start"),f()},sigma.plugins.killAnimate=function(a){for(var b in a.animations||{})cancelAnimationFrame(a.animations[b])}}.call(window),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.plugins"),sigma.plugins.colorbrewer={YlGn:{3:["#f7fcb9","#addd8e","#31a354"],4:["#ffffcc","#c2e699","#78c679","#238443"],5:["#ffffcc","#c2e699","#78c679","#31a354","#006837"],6:["#ffffcc","#d9f0a3","#addd8e","#78c679","#31a354","#006837"],7:["#ffffcc","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"],8:["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"],9:["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"]},YlGnBu:{3:["#edf8b1","#7fcdbb","#2c7fb8"],4:["#ffffcc","#a1dab4","#41b6c4","#225ea8"],5:["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"],6:["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"],7:["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],8:["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],9:["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]},GnBu:{3:["#e0f3db","#a8ddb5","#43a2ca"],4:["#f0f9e8","#bae4bc","#7bccc4","#2b8cbe"],5:["#f0f9e8","#bae4bc","#7bccc4","#43a2ca","#0868ac"],6:["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#43a2ca","#0868ac"],7:["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"],8:["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"],9:["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"]},BuGn:{3:["#e5f5f9","#99d8c9","#2ca25f"],4:["#edf8fb","#b2e2e2","#66c2a4","#238b45"],5:["#edf8fb","#b2e2e2","#66c2a4","#2ca25f","#006d2c"],6:["#edf8fb","#ccece6","#99d8c9","#66c2a4","#2ca25f","#006d2c"],7:["#edf8fb","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],8:["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],9:["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"]},PuBuGn:{3:["#ece2f0","#a6bddb","#1c9099"],4:["#f6eff7","#bdc9e1","#67a9cf","#02818a"],5:["#f6eff7","#bdc9e1","#67a9cf","#1c9099","#016c59"],6:["#f6eff7","#d0d1e6","#a6bddb","#67a9cf","#1c9099","#016c59"],7:["#f6eff7","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016450"],8:["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016450"],9:["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016c59","#014636"]},PuBu:{3:["#ece7f2","#a6bddb","#2b8cbe"],4:["#f1eef6","#bdc9e1","#74a9cf","#0570b0"],5:["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"],6:["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#2b8cbe","#045a8d"],7:["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],8:["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],9:["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]},BuPu:{3:["#e0ecf4","#9ebcda","#8856a7"],4:["#edf8fb","#b3cde3","#8c96c6","#88419d"],5:["#edf8fb","#b3cde3","#8c96c6","#8856a7","#810f7c"],6:["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8856a7","#810f7c"],7:["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],8:["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],9:["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#810f7c","#4d004b"]},RdPu:{3:["#fde0dd","#fa9fb5","#c51b8a"],4:["#feebe2","#fbb4b9","#f768a1","#ae017e"],5:["#feebe2","#fbb4b9","#f768a1","#c51b8a","#7a0177"],6:["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#c51b8a","#7a0177"],7:["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],8:["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],9:["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"]},PuRd:{3:["#e7e1ef","#c994c7","#dd1c77"],4:["#f1eef6","#d7b5d8","#df65b0","#ce1256"],5:["#f1eef6","#d7b5d8","#df65b0","#dd1c77","#980043"],6:["#f1eef6","#d4b9da","#c994c7","#df65b0","#dd1c77","#980043"],7:["#f1eef6","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],8:["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],9:["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#980043","#67001f"]},OrRd:{3:["#fee8c8","#fdbb84","#e34a33"],4:["#fef0d9","#fdcc8a","#fc8d59","#d7301f"],5:["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"],6:["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#e34a33","#b30000"],7:["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],8:["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],9:["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"]},YlOrRd:{3:["#ffeda0","#feb24c","#f03b20"],4:["#ffffb2","#fecc5c","#fd8d3c","#e31a1c"],5:["#ffffb2","#fecc5c","#fd8d3c","#f03b20","#bd0026"],6:["#ffffb2","#fed976","#feb24c","#fd8d3c","#f03b20","#bd0026"],7:["#ffffb2","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],8:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],9:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]},YlOrBr:{3:["#fff7bc","#fec44f","#d95f0e"],4:["#ffffd4","#fed98e","#fe9929","#cc4c02"],5:["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"],6:["#ffffd4","#fee391","#fec44f","#fe9929","#d95f0e","#993404"],7:["#ffffd4","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
8:["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],9:["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]},Purples:{3:["#efedf5","#bcbddc","#756bb1"],4:["#f2f0f7","#cbc9e2","#9e9ac8","#6a51a3"],5:["#f2f0f7","#cbc9e2","#9e9ac8","#756bb1","#54278f"],6:["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#756bb1","#54278f"],7:["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"],8:["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"],9:["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"]},Blues:{3:["#deebf7","#9ecae1","#3182bd"],4:["#eff3ff","#bdd7e7","#6baed6","#2171b5"],5:["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"],6:["#eff3ff","#c6dbef","#9ecae1","#6baed6","#3182bd","#08519c"],7:["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],8:["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],9:["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"]},Greens:{3:["#e5f5e0","#a1d99b","#31a354"],4:["#edf8e9","#bae4b3","#74c476","#238b45"],5:["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"],6:["#edf8e9","#c7e9c0","#a1d99b","#74c476","#31a354","#006d2c"],7:["#edf8e9","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],8:["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],9:["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"]},Oranges:{3:["#fee6ce","#fdae6b","#e6550d"],4:["#feedde","#fdbe85","#fd8d3c","#d94701"],5:["#feedde","#fdbe85","#fd8d3c","#e6550d","#a63603"],6:["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#e6550d","#a63603"],7:["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],8:["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],9:["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#a63603","#7f2704"]},Reds:{3:["#fee0d2","#fc9272","#de2d26"],4:["#fee5d9","#fcae91","#fb6a4a","#cb181d"],5:["#fee5d9","#fcae91","#fb6a4a","#de2d26","#a50f15"],6:["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#de2d26","#a50f15"],7:["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],8:["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],9:["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]},Greys:{3:["#f0f0f0","#bdbdbd","#636363"],4:["#f7f7f7","#cccccc","#969696","#525252"],5:["#f7f7f7","#cccccc","#969696","#636363","#252525"],6:["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#636363","#252525"],7:["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],8:["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],9:["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"]},PuOr:{3:["#f1a340","#f7f7f7","#998ec3"],4:["#e66101","#fdb863","#b2abd2","#5e3c99"],5:["#e66101","#fdb863","#f7f7f7","#b2abd2","#5e3c99"],6:["#b35806","#f1a340","#fee0b6","#d8daeb","#998ec3","#542788"],7:["#b35806","#f1a340","#fee0b6","#f7f7f7","#d8daeb","#998ec3","#542788"],8:["#b35806","#e08214","#fdb863","#fee0b6","#d8daeb","#b2abd2","#8073ac","#542788"],9:["#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788"],10:["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"],11:["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"]},BrBG:{3:["#d8b365","#f5f5f5","#5ab4ac"],4:["#a6611a","#dfc27d","#80cdc1","#018571"],5:["#a6611a","#dfc27d","#f5f5f5","#80cdc1","#018571"],6:["#8c510a","#d8b365","#f6e8c3","#c7eae5","#5ab4ac","#01665e"],7:["#8c510a","#d8b365","#f6e8c3","#f5f5f5","#c7eae5","#5ab4ac","#01665e"],8:["#8c510a","#bf812d","#dfc27d","#f6e8c3","#c7eae5","#80cdc1","#35978f","#01665e"],9:["#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e"],10:["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"],11:["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"]},PRGn:{3:["#af8dc3","#f7f7f7","#7fbf7b"],4:["#7b3294","#c2a5cf","#a6dba0","#008837"],5:["#7b3294","#c2a5cf","#f7f7f7","#a6dba0","#008837"],6:["#762a83","#af8dc3","#e7d4e8","#d9f0d3","#7fbf7b","#1b7837"],7:["#762a83","#af8dc3","#e7d4e8","#f7f7f7","#d9f0d3","#7fbf7b","#1b7837"],8:["#762a83","#9970ab","#c2a5cf","#e7d4e8","#d9f0d3","#a6dba0","#5aae61","#1b7837"],9:["#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837"],10:["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"],11:["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"]},PiYG:{3:["#e9a3c9","#f7f7f7","#a1d76a"],4:["#d01c8b","#f1b6da","#b8e186","#4dac26"],5:["#d01c8b","#f1b6da","#f7f7f7","#b8e186","#4dac26"],6:["#c51b7d","#e9a3c9","#fde0ef","#e6f5d0","#a1d76a","#4d9221"],7:["#c51b7d","#e9a3c9","#fde0ef","#f7f7f7","#e6f5d0","#a1d76a","#4d9221"],8:["#c51b7d","#de77ae","#f1b6da","#fde0ef","#e6f5d0","#b8e186","#7fbc41","#4d9221"],9:["#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221"],10:["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"],11:["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"]},RdBu:{3:["#ef8a62","#f7f7f7","#67a9cf"],4:["#ca0020","#f4a582","#92c5de","#0571b0"],5:["#ca0020","#f4a582","#f7f7f7","#92c5de","#0571b0"],6:["#b2182b","#ef8a62","#fddbc7","#d1e5f0","#67a9cf","#2166ac"],7:["#b2182b","#ef8a62","#fddbc7","#f7f7f7","#d1e5f0","#67a9cf","#2166ac"],8:["#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac"],9:["#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac"],10:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"],11:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"]},RdGy:{3:["#ef8a62","#ffffff","#999999"],4:["#ca0020","#f4a582","#bababa","#404040"],5:["#ca0020","#f4a582","#ffffff","#bababa","#404040"],6:["#b2182b","#ef8a62","#fddbc7","#e0e0e0","#999999","#4d4d4d"],7:["#b2182b","#ef8a62","#fddbc7","#ffffff","#e0e0e0","#999999","#4d4d4d"],8:["#b2182b","#d6604d","#f4a582","#fddbc7","#e0e0e0","#bababa","#878787","#4d4d4d"],9:["#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d"],10:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"],11:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"]},RdYlBu:{3:["#fc8d59","#ffffbf","#91bfdb"],4:["#d7191c","#fdae61","#abd9e9","#2c7bb6"],5:["#d7191c","#fdae61","#ffffbf","#abd9e9","#2c7bb6"],6:["#d73027","#fc8d59","#fee090","#e0f3f8","#91bfdb","#4575b4"],7:["#d73027","#fc8d59","#fee090","#ffffbf","#e0f3f8","#91bfdb","#4575b4"],8:["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"],9:["#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"],10:["#a50026","#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"],11:["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"]},Spectral:{3:["#fc8d59","#ffffbf","#99d594"],4:["#d7191c","#fdae61","#abdda4","#2b83ba"],5:["#d7191c","#fdae61","#ffffbf","#abdda4","#2b83ba"],6:["#d53e4f","#fc8d59","#fee08b","#e6f598","#99d594","#3288bd"],7:["#d53e4f","#fc8d59","#fee08b","#ffffbf","#e6f598","#99d594","#3288bd"],8:["#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd"],9:["#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd"],10:["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"],11:["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]},RdYlGn:{3:["#fc8d59","#ffffbf","#91cf60"],4:["#d7191c","#fdae61","#a6d96a","#1a9641"],5:["#d7191c","#fdae61","#ffffbf","#a6d96a","#1a9641"],6:["#d73027","#fc8d59","#fee08b","#d9ef8b","#91cf60","#1a9850"],7:["#d73027","#fc8d59","#fee08b","#ffffbf","#d9ef8b","#91cf60","#1a9850"],8:["#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850"],9:["#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850"],10:["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"],11:["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"]},Accent:{3:["#7fc97f","#beaed4","#fdc086"],4:["#7fc97f","#beaed4","#fdc086","#ffff99"],5:["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0"],6:["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f"],7:["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17"],8:["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666"]},Dark2:{3:["#1b9e77","#d95f02","#7570b3"],4:["#1b9e77","#d95f02","#7570b3","#e7298a"],5:["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e"],6:["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02"],7:["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d"],8:["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"]},Paired:{3:["#a6cee3","#1f78b4","#b2df8a"],4:["#a6cee3","#1f78b4","#b2df8a","#33a02c"],5:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99"],6:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c"],7:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f"],8:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00"],9:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6"],10:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a"],11:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99"],12:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]},Pastel1:{3:["#fbb4ae","#b3cde3","#ccebc5"],4:["#fbb4ae","#b3cde3","#ccebc5","#decbe4"],5:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6"],6:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc"],7:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd"],8:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec"],9:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"]},Pastel2:{3:["#b3e2cd","#fdcdac","#cbd5e8"],4:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4"],5:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9"],6:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae"],7:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc"],8:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#cccccc"]},Set1:{3:["#e41a1c","#377eb8","#4daf4a"],4:["#e41a1c","#377eb8","#4daf4a","#984ea3"],5:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00"],6:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33"],7:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628"],8:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf"],9:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]},Set2:{3:["#66c2a5","#fc8d62","#8da0cb"],4:["#66c2a5","#fc8d62","#8da0cb","#e78ac3"],5:["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"],6:["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f"],7:["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494"],8:["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"]},Set3:{3:["#8dd3c7","#ffffb3","#bebada"],4:["#8dd3c7","#ffffb3","#bebada","#fb8072"],5:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3"],6:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462"],7:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69"],8:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5"],9:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9"],10:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd"],11:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5"],12:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]}}}.call(this),function(undefined){"use strict";function strToObjectRef(a,b){return b.split(".").reduce(function(a,b){return a[b]},a)}function emptyObject(a){var b;for(b in a)"hasOwnProperty"in a&&!a.hasOwnProperty(b)||delete a[b];return a}function deepCopy(o){var copy=Object.create(null);for(var i in o)"object"==typeof o[i]&&null!==o[i]?copy[i]=deepCopy(o[i]):"function"==typeof o[i]&&null!==o[i]?eval(" copy[i] = "+o[i].toString()):copy[i]=o[i];return copy}function baseHistogram(a,b){var c,d,e,f,g={};return a.length?(c=a.map(function(a){return parseFloat(a)}).sort(function(a,b){return a-b}),d=c[0],e=c[c.length-1],e-d!==0?c.forEach(function(a){f=Math.floor(b*Math.abs(a-d)/Math.abs(e-d)),f-=f==b?1:0,g[a]=f}):c.forEach(function(a){g[a]=0}),g):g}function histogram(a,b){var c,d=[],e=0;if(a&&a[b]){Object.keys(a[b]).forEach(function(c){var e=a[b][c];d[e]=d[e]||[],d[e].push(+c)}),c=1!==d.length?d.length:7;for(var f=0;c>f;f++)d[f]&&(e=e>d[f].length?e:d[f].length);for(var f=0;c>f;f++)d[f]===undefined&&(d[f]=[]),d[f]={bin:f,values:d[f],ratio:d[f].length/e},d[f].values.length&&(d[f].min=Math.min.apply(null,d[f].values),d[f].max=Math.max.apply(null,d[f].values))}return d}function resolveHistogram(a,b,c){for(var d,e=b.get(c),f=a.length,g=0,h=0;f>h;h++)a[h].items=[];Object.keys(e).forEach(function(b){for(var f=0;f<e[b].items.length;f++){d=e[b].items[f],b=strToObjectRef(d,c);for(var g=0;g<a.length;g++)!1 in a[g]||!1 in a[g]||a[g].min<=b&&b<=a[g].max&&a[g].items.push(d)}});for(var h=0;f>h;h++)a[h].items&&(g=g>a[h].items.length?g:a[h].items.length);for(var h=0;f>h;h++)a[h].itemsRatio=a[h].items.length/g;return a}function download(a,b,c){var d=null,e=null,f=null;if(window.Blob?(d=new Blob([a],{type:"text/json"}),e=window.URL.createObjectURL(d)):f="data:text/json;charset=UTF-8,"+encodeURIComponent(a),navigator.msSaveBlob)navigator.msSaveBlob(d,c);else if(navigator.msSaveOrOpenBlob)navigator.msSaveOrOpenBlob(d,c);else{var g=document.createElement("a");g.setAttribute("href",window.Blob?e:f),g.setAttribute("download",c||"graph."+b),document.body.appendChild(g),g.click(),document.body.removeChild(g)}e&&setTimeout(function(){window.URL.revokeObjectURL(e)},0)}function Vision(a,b,c,d){var e=this;if(this.visualVars=null,this.mappings=null,this.palette=d,this.idx=Object.create(null),this.histograms=Object.create(null),this.deprecated=Object.create(null),this.sigmaSettings=Object.create(null),this.dataTypes=Object.create(null),this.originalVisualVariable=Object.create(null),"nodes"===b)this.visualVars=["color","size","label","type","icon","image"],this.mappings=c.nodes,this.dataset=function(){return a.graph.nodes()};else{if("edges"!==b)throw new Error('Invalid argument: "datasetName" is not "nodes" or "edges", was '+b);this.visualVars=["color","size","label","type"],this.mappings=c.edges,this.dataset=function(){return a.graph.edges()}}return this.update=function(a){function b(b,d){c.idx[a][b]===undefined&&(c.idx[a][b]={key:b,items:[],styles:Object.create(null)}),c.idx[a][b].items.push(d),(h||h===undefined)&&(h="number"==typeof b)}var c=this;if(a===undefined)throw new Error('Missing argument: "key".');if("string"!=typeof a)throw new Error('Invalid argument: "key" is not a string, was '+a);var d,f,g,h=undefined,i=!0;f=function(a,b){return strToObjectRef(a,b)},g=function(a,b){return strToObjectRef(a,b)},this.idx[a]={},this.dataset().forEach(function(c){d=f(c,a),d!==undefined&&(i&&(i=Array.isArray(d)?i:!1),i?1===d.length?b(d[0],c):d.forEach(function(a){b(a,c)}):b(d,c))}),this.dataTypes[a]={sequential:h,array:i},this.deprecated[a]=!1;var j=0;for(d in this.idx[a])j=j<this.idx[a][d].items.length?this.idx[a][d].items.length:j;Object.keys(this.idx[a]).forEach(function(b){c.idx[a][b].ratio=parseFloat(c.idx[a][b].items.length/j)});var k,l,m,n,o,p,q,r=0;q=Object.keys(e.mappings).filter(function(b){return e.mappings[b]&&e.mappings[b].by!==undefined&&e.mappings[b].by.toString()==a}),q.forEach(function(b){switch(b){case"color":if(l=e.mappings.color.scheme,"string"!=typeof l)throw new Error('color.scheme "'+l+'" is not a string.');h&&(p=e.mappings.color.bins||7,c.histograms.color=c.histograms.color||{},c.histograms.color[a]=baseHistogram(Object.keys(c.idx[a]),p));break;case"label":if(k=e.mappings.label.format||function(a){return"string"==typeof a?a:a.label},"function"!=typeof k)throw new Error('label.format "'+k+'" is not a function.');break;case"size":if(h===undefined)break;if(!h)throw new Error('One value of the property "'+a+'" is not a number.');c.histograms.size=c.histograms.size||{},c.histograms.size[a]=baseHistogram(Object.keys(c.idx[a]),e.mappings.size.bins||7);break;case"type":if(m=e.mappings.type.scheme,"string"!=typeof m)throw new Error('type.scheme "'+m+'" is not a string.');break;case"icon":if(n=e.mappings.icon.scheme,"string"!=typeof n)throw new Error('icon.scheme "'+n+'" is not a string.');break;case"image":if(o=e.mappings.image.scheme,"string"!=typeof o)throw new Error('type.scheme "'+o+'" is not a string.')}}),Object.keys(this.idx[a]).forEach(function(b){q.forEach(function(d){switch(d){case"color":h?c.idx[a][b].styles.color=function(){var d=c.histograms.color[a][b];return g(e.palette,l)[p][d]}:c.idx[a][b].styles.color=function(){if(g(e.palette,l)===undefined)throw new Error("Wrong or undefined color scheme.");if(e.mappings.color.set>0){var a=g(e.palette,l)[e.mappings.color.set][r];return r=(r+1)%e.mappings.color.set,a}return g(e.palette,l)[b]};break;case"label":c.idx[a][b].styles.label=function(b){return k(f(b,a))};break;case"size":c.idx[a][b].styles.size=function(){return 1+c.histograms.size[a][b]};break;case"type":c.idx[a][b].styles.type=function(){if(g(e.palette,m)===undefined)throw new Error("Wrong or undefined type scheme.");return g(e.palette,m)[b]};break;case"icon":c.idx[a][b].styles.icon=function(){if(g(e.palette,n)===undefined)throw new Error("Wrong or undefined icon scheme.");return g(e.palette,n)[b]};break;case"image":c.idx[a][b].styles.image=function(){if(g(e.palette,o)===undefined)throw new Error("Wrong or undefined image scheme.");return g(e.palette,o)[b]}}})})},this.get=function(a){if(a===undefined)throw new TypeError('Missing argument: "key".');if("string"!=typeof a)throw new TypeError('Invalid argument: "key" is not a string, was '+a);return this.deprecated[a]&&this.update(a),this.idx[a]===undefined&&this.update(a),this.idx[a]},this.applyStyle=function(c,d){if(d===undefined)throw new TypeError('Missing argument: "key"');if("string"!=typeof d)throw new TypeError('Invalid argument: "key" is not a string, was '+d);if(-1==this.visualVars.indexOf(c))throw new Error('Unknown style "'+c+'"');var e=this,f=this.get(d);if("color"===c&&e.dataTypes[d].array&&(this.dataset().forEach(function(a){delete a.colors}),Object.keys(f).forEach(function(a){var b=f[a];b.items.forEach(function(a){a.colors=[]})})),Object.keys(f).forEach(function(a){var b=f[a];b.items.forEach(function(a){if(a!==undefined&&b.styles!==undefined&&"function"==typeof b.styles[c]){e.originalVisualVariable[a.id]||(e.originalVisualVariable[a.id]={}),c in e.originalVisualVariable[a.id]||Object.defineProperty(e.originalVisualVariable[a.id],c,{enumerable:!0,value:a[c]});var f=b.styles[c](a);"color"===c&&e.dataTypes[d].array?f!==undefined&&(a.color=f,a.colors.push(f)):f!==undefined&&(a[c]=f)}else if("function"==typeof b.styles[c])throw new TypeError(b.styles+"."+c+"is not a function, was "+b.styles[c])})}),"size"===c)if("nodes"===b){if(this.mappings.size.min>this.mappings.size.max)throw new RangeError("nodes.size.min must be lower or equal than nodes.size.max");this.mappings.size.min&&(this.sigmaSettings.minNodeSize||(this.sigmaSettings.minNodeSize=a.settings("minNodeSize")),a.settings("minNodeSize",this.mappings.size.min)),this.mappings.size.max&&(this.sigmaSettings.maxNodeSize||(this.sigmaSettings.maxNodeSize=a.settings("maxNodeSize")),a.settings("maxNodeSize",this.mappings.size.max))}else if("edges"===b){if(this.mappings.size.min>this.mappings.size.max)throw new RangeError("edges.size.min must be lower or equal than edges.size.max");this.mappings.size.min&&(this.sigmaSettings.minEdgeSize||(this.sigmaSettings.minEdgeSize=a.settings("minEdgeSize")),a.settings("minEdgeSize",this.mappings.size.min)),this.mappings.size.max&&(this.sigmaSettings.maxEdgeSize||(this.sigmaSettings.maxEdgeSize=a.settings("maxEdgeSize")),a.settings("maxEdgeSize",this.mappings.size.max))}},this.resetStyle=function(c,d){if(d===undefined)throw new TypeError('Missing argument: "key"');if("string"!=typeof d)throw new TypeError('Invalid argument: "key" is not a string, was '+d);if(-1==this.visualVars.indexOf(c))throw new Error('Unknown style "'+c+'".');if(this.idx[d]!==undefined){var e=this,f=this.get(d);"color"===c&&e.dataTypes[d].array&&Object.keys(f).forEach(function(a){var b=f[a];b.items.forEach(function(a){delete a.colors})}),Object.keys(f).forEach(function(a){var b=f[a];b.items.forEach(function(a){a!==undefined&&a[c]!==undefined&&(e.originalVisualVariable[a.id]===undefined||e.originalVisualVariable[a.id][c]===undefined?"edges"===e.key&&"size"===c?a.size=1:delete a[c]:a[c]=e.originalVisualVariable[a.id][c])})}),"size"===c&&("nodes"===b?(this.sigmaSettings.minNodeSize&&a.settings("minNodeSize",this.sigmaSettings.minNodeSize),this.sigmaSettings.maxNodeSize&&a.settings("maxNodeSize",this.sigmaSettings.maxNodeSize)):"edges"===b&&(this.sigmaSettings.minEdgeSize&&a.settings("minEdgeSize",this.sigmaSettings.minEdgeSize),this.sigmaSettings.maxEdgeSize&&a.settings("maxEdgeSize",this.sigmaSettings.maxEdgeSize)))}},this.clear=function(){this.visualVars.length=0,emptyObject(this.idx),emptyObject(this.histograms),emptyObject(this.deprecated),emptyObject(this.sigmaSettings),emptyObject(this.dataTypes),emptyObject(this.originalVisualVariable)},this}function design(a,b){function c(b,c,d){d?b[d]&&b[d].by&&(c.applyStyle(d,b[d].by),b[d].active=!0):Object.keys(b).forEach(function(a){b[a].active=!1,b[a]&&b[a].by&&(c.applyStyle(a,b[a].by),b[a].active=!0)}),a&&a.refresh({skipIndexation:!0})}function d(b,c,d){d?b[d]&&b[d].active&&(c.resetStyle(d,b[d].by),b[d].active=!1):Object.keys(b).forEach(function(a){b[a].active&&(c.resetStyle(a,b[a].by),b[a].active=!1)}),a&&a.refresh({skipIndexation:!0})}this.palette=(b||{}).palette||{},this.styles=sigma.utils.extend((b||{}).styles||{},{nodes:{},edges:{}});var e=this,f=new Vision(a,"nodes",this.styles,this.palette),g=new Vision(a,"edges",this.styles,this.palette);a.bind("kill",function(){sigma.plugins.killDesign(a)}),this.setStyles=function(a){return this.styles=sigma.utils.extend(a||{},{nodes:{},edges:{}}),f.mappings=this.styles.nodes,g.mappings=this.styles.edges,this.deprecate(),this},this.nodesBy=function(a,b){return this.styles=sigma.utils.extend(this.styles||{},{nodes:{},edges:{}}),this.styles.nodes[a]=b,f.mappings=this.styles.nodes,b.by&&this.deprecate("nodes",b.by),this},this.edgesBy=function(a,b){return this.styles=sigma.utils.extend(this.styles||{},{nodes:{},edges:{}}),this.styles.edges[a]=b,g.mappings=this.styles.edges,b.by&&this.deprecate("edges",b.by),this},this.setPalette=function(a){return this.palette=a,f.palette=this.palette,g.palette=this.palette,this.deprecate(),this},this.nodes=function(a){return f.get(a)},this.edges=function(a){return g.get(a)},this.inspect=function(){return{nodes:deepCopy(f),edges:deepCopy(g)}},this.apply=function(a,b){if(this.styles){if(!a)return c(this.styles.nodes,f,b),c(this.styles.edges,g,b),this;switch(a){case"nodes":c(this.styles.nodes,f,b);break;case"edges":c(this.styles.edges,g,b);break;default:throw new Error('Invalid argument: "target" is not "nodes" or "edges", was '+a)}return this}},this.reset=function(a,b){if(this.styles){if(!a)return d(this.styles.nodes,f,b),d(this.styles.edges,g,b),this;switch(a){case"nodes":d(this.styles.nodes,f,b);break;case"edges":d(this.styles.edges,g,b);break;default:throw new Error('Invalid argument: "target" is not "nodes" or "edges", was '+a)}return this}},this.deprecate=function(a,b){if(a){if("nodes"!==a&&"edges"!==a)throw new Error('Invalid argument: "target" is not "nodes" or "edges", was '+a);b?"nodes"===a?f.deprecated[b]=!0:"edges"===a&&(g.deprecated[b]=!0):"nodes"===a?Object.keys(f.deprecated).forEach(function(a){f.deprecated[a]=!0}):"edges"===a&&Object.keys(g.deprecated).forEach(function(a){g.deprecated[a]=!0})}else Object.keys(f.deprecated).forEach(function(a){f.deprecated[a]=!0}),Object.keys(g.deprecated).forEach(function(a){g.deprecated[a]=!0});return this},this.deletePropertyStylesFrom=function(a,b,c){if(null==b)throw new TypeError('Missing argument: "id".');if("nodes"!==a&&"edges"!==a)throw new Error('Invalid argument: "target" is not "nodes" or "edges", was '+a);if(null==c)throw new TypeError('Missing argument: "key".');var d,e,h,i;d="nodes"===a?f.get(c):g.get(c);for(var j=Object.keys(d),k=0;k<j.length;k++){e=d[j[k]],h=Object.keys(e.styles);for(var l=0;l<e.items.length;l++)if(i=e.items[l],i.id===b){for(var m=0;m<h.length;m++)"label"!==h[m]&&"size"!==h[m]?delete i[h[m]]:"size"===h[m]&&(i.size=1);return this.deprecate(a,c),this}}return this},this.clear=function(){return this.reset(),this.styles={nodes:{},edges:{}},this.palette={},f.clear(),g.clear(),f=new Vision(a,"nodes",this.styles,this.palette),g=new Vision(a,"edges",this.styles,this.palette),a&&a.refresh({skipIndexation:!0}),this},this.kill=function(){delete this.styles,delete this.palette,f.clear(),g.clear()},this.toJSON=function(a){a=a||{};var b={styles:this.styles,palette:this.palette};if(a.pretty)var c=JSON.stringify(b,null," ");else var c=JSON.stringify(b);return a.download&&download(c,"json",a.filename),c},this.utils={},this.utils.isSequential=function(a,b){if(!a)throw new TypeError('Missing argument: "target"');var c;switch(a){case"nodes":c=f;break;case"edges":c=g;break;default:throw new Error('Invalid argument: "target" is not "nodes" or "edges", was '+a)}if(b===undefined)throw new TypeError('Missing argument: "property"');if("string"!=typeof b)throw new TypeError('Invalid argument: "property" is not a string, was '+b);if(!(b in c.dataTypes)||c.dataTypes[b].sequential===undefined){var d,e=!1,h=!0;c.dataset().forEach(function(a){d=strToObjectRef(a,b),d!==undefined&&(e=!0,h="number"==typeof d?h:!1)}),e?c.dataTypes[b]={sequential:h}:c.dataTypes[b]&&(c.dataTypes[b].sequential=undefined)}return(c.dataTypes[b]||{}).sequential},this.utils.histogram=function(a,b,c){if(!a)throw new TypeError('Missing argument: "target"');var d;switch(a){case"nodes":d=f;break;case"edges":d=g;break;default:throw new Error('Invalid argument: "target" is not "nodes" or "edges", was '+a)}if(-1==d.visualVars.indexOf(b))throw new Error('Unknown visual variable "'+b+'".');if(c===undefined)throw new TypeError('Missing argument: "property".');if("string"!=typeof c)throw new TypeError('Invalid argument: "property" is not a string, was'+c);var h=e.utils.isSequential(a,c);if(!h)throw new Error('The property "'+c+'" is not sequential.');var i=histogram(d.histograms[b],c);if(i=resolveHistogram(i,d,c),"color"===b){if(!e.styles[a].color)throw new Error('Missing key "color" in '+a+" palette.");var j=i.length,k=strToObjectRef(e.palette,e.styles[a].color.scheme);if(!k)throw new Error('Color scheme "'+e.styles[a].color.scheme+'" not in '+a+" palette.");if(h)for(var l=0;j>l;l++){if(!k[j])throw new Error('Missing key "'+j+'" in '+a+' palette " of color scheme '+e.styles[a].color.scheme+'".');i[l][b]=k[j][l]}}return i}}if("undefined"==typeof sigma)throw new Error("sigma is not declared");sigma.utils.pkg("sigma.plugins");var _instance={};sigma.plugins.design=function(a,b){return _instance[a.id]||(_instance[a.id]=new design(a,b)),_instance[a.id]},sigma.plugins.killDesign=function(a){_instance[a.id]instanceof design&&_instance[a.id].kill(),delete _instance[a.id]}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw new Error("sigma not in scope.");sigma.utils.pkg("sigma.settings");var b={legendWidth:130,legendFontFamily:"Arial",legendFontSize:10,legendFontColor:"black",legendTitleFontFamily:"Arial",legendTitleFontSize:15,legendTitleFontColor:"black",legendTitleMaxLength:"30",legendTitleTextAlign:"left",legendShapeColor:"grey",legendBackgroundColor:"white",legendBorderColor:"black",legendBorderRadius:10,legendBorderWidth:1,legendInnerMargin:10,legendOuterMargin:5};sigma.settings=sigma.utils.extend(sigma.settings||{},b)}.call(this),function(a){"use strict";function b(a){var b=this,c=a.settings,e=window.devicePixelRatio||1;this._sigmaInstance=a,this._designPlugin=sigma.plugins.design(a),this._visualSettings={pixelRatio:e,legendWidth:c("legendWidth"),legendFontFamily:c("legendFontFamily"),legendFontSize:c("legendFontSize"),legendFontColor:c("legendFontColor"),legendTitleFontFamily:c("legendTitleFontFamily"),legendTitleFontSize:c("legendTitleFontSize"),legendTitleFontColor:c("legendTitleFontColor"),legendShapeColor:c("legendShapeColor"),legendBackgroundColor:c("legendBackgroundColor"),legendBorderColor:c("legendBorderColor"),legendBorderWidth:c("legendBorderWidth"),legendInnerMargin:c("legendInnerMargin"),legendOuterMargin:c("legendOuterMargin"),legendTitleMaxLength:c("legendTitleMaxLength"),legendTitleTextAlign:c("legendTitleTextAlign"),legendBorderRadius:c("legendBorderRadius")},h(this._visualSettings,function(a,c){"number"==typeof a&&(b._visualSettings[c]=a*e)}),k(this._visualSettings);var f=a.renderers[0];this._canvas=document.createElement("canvas"),this._canvas.style.position="absolute",this._canvas.style.pointerEvents="none",this._renderer=f,f.container.appendChild(this._canvas),window.addEventListener("resize",function(){d(b._canvas,f.container.offsetWidth,f.container.offsetHeight,e),m(b)}),this.textWidgetCounter=1,this.enoughSpace=!0,this.placement="bottom",this.visible=!0,this.widgets={},this.boundingBox={x:0,y:0,w:0,h:0},this.externalCSS=[],this.addWidget("node","size"),this.addWidget("node","color"),this.addWidget("node","icon"),this.addWidget("node","type"),this.addWidget("edge","size"),this.addWidget("edge","color"),this.addWidget("edge","type");var g=function(){f.container.offsetWidth?(d(this._canvas,f.container.offsetWidth,f.container.offsetHeight,e),this.draw()):setTimeout(g,200)}.bind(this);g()}function c(a,b,c,d,e,f){this._canvas=a,this._sigmaInstance=b,this._designPlugin=c,this._legendPlugin=d,this.visualVar=f,this.elementType=e,this.x=0,this.y=0,this.text="",this.unit=null,this.img=new Image,this.pinned=!1}function d(a,b,c,d){a.setAttribute("width",b*d),a.setAttribute("height",c*d),a.style.width=b+"px",a.style.height=c+"px"}function e(a,b){return null==b?null:b.split(".").reduce(function(a,b){return a[b]},a)}function f(a){var b=";base64,";if(-1==a.indexOf(b)){var c=a.split(","),d=c[0].split(":")[1],e=decodeURIComponent(c[1]);return new Blob([e],{type:d})}for(var c=a.split(b),d=c[0].split(":")[1],e=window.atob(c[1]),f=e.length,g=new Uint8Array(f),h=0;f>h;++h)g[h]=e.charCodeAt(h);return new Blob([g],{type:d})}function g(a,b,c){var d=null,e=null,g=null;if(window.Blob?(d=c?f(a):new Blob([a],{type:"text/xml"}),e=window.URL.createObjectURL(d)):g="data:text/xml;charset=UTF-8,"+encodeURIComponent('<?xml version="1.0" encoding="UTF-8"?>')+encodeURIComponent(a),
navigator.msSaveBlob)navigator.msSaveBlob(d,b);else if(navigator.msSaveOrOpenBlob)navigator.msSaveOrOpenBlob(d,b);else{var h=document.createElement("a");h.setAttribute("href",window.Blob?e:g),h.setAttribute("download",b),document.body.appendChild(h),h.click(),document.body.removeChild(h)}e&&setTimeout(function(){window.URL.revokeObjectURL(e)},0)}function h(b,c){for(var d in b)b.hasOwnProperty(d)&&b[d]!==a&&c(b[d],d)}function i(b,c,d,e,f){d=d||{};var g=document.createElement(c);for(var h in d)if(d.hasOwnProperty(h)){var i=d[h];i!==a&&g.setAttribute(h,i)}if(e!==a||f){"[object Object]"===Object.prototype.toString.call(e)&&(e=JSON.stringify(e));var j=document.createTextNode(e);g.appendChild(j)}return b.appendChild(g),g}function j(a,b){if(!a.svg)return void b();var c="";c+='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="'+a.svg.width+'px" height="'+a.svg.height+'px">',c+=a.svg.innerHTML+"</svg>";var d="data:image/svg+xml;base64,"+btoa(unescape(encodeURIComponent(c)));a.img.src!==d?(a.img.onload=b,a.img.src=d):b()}function k(a){a.totalWidgetWidth=a.legendWidth+2*(a.legendBorderWidth+a.legendOuterMargin)}function l(a,b){var c=0,d=Object.keys(a.widgets).length;h(a.widgets,function(a,e){x(a,function(){++c,b&&c===d&&b()})})}function m(a){var b=a._visualSettings,c=a.placement,d="top"===c||"bottom"===c,e=a._canvas.height,f=a._canvas.width,g=r(a.widgets,"text"),i=r(a.widgets,"node"),j=r(a.widgets,"edge"),k=[g,i,j],l=d?s(a.widgets)+2*b.legendOuterMargin:e,m=Math.floor(f/b.totalWidgetWidth),p=n(d?m:1,2*b.legendOuterMargin),q=0,t=!0,u=!1;if(0!==p.length){for(;t&&!u;)t=!1,q=0,h(k,function(a){var c,e,f=[];if(!t&&!u)for(a.forEach(function(a){f.push(a)});;){c=l-(p[q]?p[q].height:0),e=o(f,c),e.forEach(function(a){p[q].widgets.push(f[a]),p[q].height+=f[a].svg.height});for(var g=e.length-1;g>=0;--g)f.splice(e[g],1);if(!(f.length>0))break;if(d){if(q===m-1){p=n(m,2*b.legendOuterMargin),l+=30,t=!0;break}++q}else{if(p.length===m){u=!0;break}p.push({widgets:[],height:2*b.legendOuterMargin}),++q}}});if(u)a.boundingBox={x:0,y:0,w:0,h:0};else{"right"===c&&p.reverse();for(var w=0;w<p.length;++w)for(var x="bottom"===c?l-p[w].height:0,y=0;y<p[w].widgets.length;++y)p[w].widgets[y].x=b.totalWidgetWidth*w+("right"===c?f-p.length*b.totalWidgetWidth:b.legendOuterMargin),"bottom"===c?p[w].widgets[y].y=e-l+x+2*b.legendOuterMargin:p[w].widgets[y].y=x+b.legendOuterMargin,x+=p[w].widgets[y].svg.height;var z=p.reduce(function(a,c){return a+(c.height>2*b.legendOuterMargin?1:0)},0),A=z*(b.totalWidgetWidth+b.legendOuterMargin)+b.legendOuterMargin,B=p.reduce(function(a,b){return a>b.height?a:b.height},0);a.boundingBox={w:A,h:B,x:"right"===a.placement?f-A:0,y:"bottom"===a.placement?e-B:0}}v(a),a.enoughSpace=!u}}function n(a,b){for(var c=[],d=0;a>d;++d)c.push({widgets:[],height:b});return c}function o(a,b){var c={indexes:[],height:0},d=p(a.length,0);return d.forEach(function(d){var e=q(a,d);e>c.height&&b>=e&&(c.indexes=d,c.height=e)}),c.indexes}function p(a,b){if(b===a)return[];var c=[[b]],d=p(a,b+1);return d.forEach(function(a){c.push([b].concat(a))}),c=c.concat(d)}function q(a,b){var c=0;return b.forEach(function(b){c+=a[b].svg.height}),c}function r(a,b){var c=[];return h(a,function(a){a.svg&&!a.pinned&&a.elementType===b&&c.push(a)}),c}function s(a){var b=0;return h(a,function(a){a.svg&&a.svg.height>b&&(b=a.svg.height)}),b}function t(a,b){return a+"_"+b}function u(a){var b=a._canvas.getContext("2d");b.clearRect(0,0,a._canvas.width,a._canvas.height)}function v(a){u(a),h(a.widgets,function(b){w(a,b)&&B(b)})}function w(b,c){return b.visible&&(b.enoughSpace||c.pinned)&&b.widgets[c.id]!==a&&null!==c.svg}function x(a,b){var c=a._legendPlugin._visualSettings;if("size"===a.visualVar)a.svg=G(c,a._sigmaInstance.graph,a._designPlugin,a.elementType,a.unit);else if("text"!==a.elementType)a.svg=H(c,a._sigmaInstance.graph,a._designPlugin,a.elementType,a.visualVar,a.unit);else{var d=z(c,a.text,c.legendWidth-2*c.legendInnerMargin),e=c.legendFontSize+1,f=d.length*e+2*c.legendInnerMargin,g=c.legendInnerMargin+e;a.svg=document.createElement("svg"),L(a.svg,c,f);for(var h=0;h<d.length;++h)J(c,a.svg,d[h],c.legendInnerMargin,g),g+=e;a.svg.width=c.totalWidgetWidth,a.svg.height=f+2*(c.legendBorderWidth+c.legendOuterMargin)}j(a,b)}function y(a){x(a,function(){m(a._legendPlugin)})}function z(a,b,c){for(var d=!1,e=V(" ",a.legendFontFamily,a.legendFontSize,d),f=b.split(" "),g=[{width:-e,words:[]}],h=0,i=[],j=0;j<f.length;++j){var k=V(f[j]+" ",a.legendFontFamily,a.legendFontSize,d);g[h].width+k<=c?(g[h].words.push(f[j]+" "),g[h].width+=k):(g.push({width:k-e,words:[f[j]+" "]}),h++)}for(j=0;j<g.length;++j){for(var l="",m=0;m<g[j].words.length;++m)l+=g[j].words[m];i.push(l)}return i}function A(a){var b=a.split(".");return b.length>2&&"categories"===b[b.length-2]||b.length>=1&&"categories"===b[1]?"Category":T(b[b.length-1])}function B(a){if(a.img){var b=a._canvas.getContext("2d");b.drawImage(a.img,a.x,a.y),"node"===a.elementType&&"icon"===a.visualVar&&(b.textBaseline="middle",a.svg.icons.forEach(function(c){b.fillStyle=c.color,b.font=c.fontSize+"px "+c.font,b.fillText(c.content,a.x+c.x,a.y+c.y)}))}}function C(a,b){for(var c=null,d=null,f=1;f<a.length;++f){var g=e(a[f],b);"number"==typeof g&&((!c||c>g)&&(c=g),(!d||g>d)&&(d=g))}return{min:c?c:0,max:d?d:0}}function D(a,b){for(var c=[],d=a.max-a.min,e=0;b+1>e;++e)c.push(a.min+d*(e/b));return c}function E(a,b){for(var c={},d=0;d<a.length;++d){var f=e(a[d],b);f&&"object"==typeof f?h(f,function(a){c[a]=!0}):c[f]=!0}return c}function F(a,b){var c=0;return h(a,function(a,d){b[d]&&++c}),c}function G(a,b,c,d,e){var f=a,g=document.createElement("svg"),h="node"===d?b.nodes():b.edges(),i="node"===d?c.styles.nodes:c.styles.edges,j=f.legendTitleFontSize+f.legendInnerMargin+1.5*f.legendFontSize;if(!i.size)return null;var k,l=i.size.by,m=C(h,l),n=m.min,o=m.max,p=n%1===0&&o%1===0,q=p?Math.round((n+o)/2):(n+o)/2,r=i.size.max/i.size.min,s=1.5*f.legendFontSize,t=s/r,u=(s+t)/2;if("node"===d){var v=2;k=j+2*s+10,L(g,f,k),S(f,g,A(i.size.by),e);var w=2*s+v+2*f.legendInnerMargin;J(f,g,W(o,p),w,j+f.legendFontSize),J(f,g,W(q,p),w,j+2*f.legendFontSize),J(f,g,W(n,p),w,j+3*f.legendFontSize),K(g,s+f.legendInnerMargin,j+s,s,f.legendBackgroundColor,f.legendShapeColor,v),K(g,s+f.legendInnerMargin,j+2*s-u,u,f.legendBackgroundColor,f.legendShapeColor,v),K(g,s+f.legendInnerMargin,j+2*s-t,t,f.legendBackgroundColor,f.legendShapeColor,v)}else if("edge"===d){var x=j+1.7*s,y=(f.legendWidth-2*f.legendInnerMargin)/3;k=x+f.legendFontSize,L(g,f,k),S(f,g,A(i.size.by),e),R(g,"rect",{x:f.legendInnerMargin,y:j+5,width:y,height:s/2,fill:f.legendShapeColor}),R(g,"rect",{x:f.legendInnerMargin+y,y:j+5+(s-u)/4,width:y,height:u/2,fill:f.legendShapeColor}),R(g,"rect",{x:f.legendInnerMargin+2*y,y:j+5+(s-t)/4,width:y,height:t/2,fill:f.legendShapeColor}),J(f,g,W(o,p),f.legendInnerMargin+.5*y,x,"middle"),J(f,g,W(q,p),f.legendInnerMargin+1.5*y,x,"middle"),J(f,g,W(n,p),f.legendInnerMargin+2.5*y,x,"middle")}return g.width=f.totalWidgetWidth,g.height=k+2*(f.legendBorderWidth+f.legendOuterMargin),g}function H(a,b,c,d,f,g){var i=a,j=document.createElement("svg"),k="node"===d?b.nodes():b.edges(),l="node"===d?c.styles.nodes:c.styles.edges;if(!l[f])return null;var m,n,o,p,q,r=c.palette,s=1.5*i.legendFontSize,t=i.legendTitleFontSize+i.legendInnerMargin+.8*s,u="color"===f&&l.color.bins,v="edge"===d&&"type"===f,w=u?e(r,l.color.scheme)[l.color.bins]:e(r,l[f].scheme),x=E(k,l[f].by),y=u?Object.keys(w).length:F(w,x),z=s*y+t+(v?s:0),B=i.legendWidth/3,G=t,H="edge"===d?B:1.5*i.legendFontSize+i.legendInnerMargin;return u&&(m=C(k,l.color.by),n=D(m,l.color.bins),o=m.min%1==0&&m.max%1==0),j.icons=[],L(j,i,z),S(i,j,A(l[f].by),g),"edge"===d&&"type"===f&&(p="source node to target node",q=U(p,i.legendFontFamily,i.legendFontSize,i.legendWidth-2*i.legendInnerMargin),J(i,j,p,i.legendInnerMargin,G,"left",i.legendFontColor,i.legendFontFamily,q),G+=s),h(w,function(a,b){if(u||x[b]){"color"===f?(u&&(a=w[w.length-b-1]),"edge"===d?R(j,"rect",{x:i.legendInnerMargin,y:G-s/8,width:B-2*i.legendInnerMargin,height:s/4,fill:a}):K(j,i.legendInnerMargin+i.legendFontSize/2,G,i.legendFontSize/2,a)):"icon"===f?j.icons.push({content:a.content,font:a.font,fontSize:i.legendFontSize,color:i.legendFontColor,x:i.legendInnerMargin,y:G}):"type"===f&&("edge"===d?M(i,j,a,i.legendInnerMargin,B-i.legendInnerMargin,G,i.legendFontSize/3):O(i,j,a,i.legendInnerMargin+i.legendFontSize/2,G,i.legendFontSize/2));var c=2;if(u)p=W(n[y-b-1],o)+" - "+W(n[y-parseInt(b)],o),J(i,j,p,B,G+c,"left",null,null,null,"middle");else{var e=I(T(b),i.legendWidth-i.legendInnerMargin-H,i.legendFontFamily,i.legendFontSize);J(i,j,e,H,G+c,"left",null,null,null,"middle")}G+=s}}),j.width=i.totalWidgetWidth,j.height=z+2*(i.legendBorderWidth+i.legendOuterMargin),j}function I(a,b,c,d){for(var e=V(a,c,d,!1),f=!1;e>b;){f=!0;var g=b/e,a=a.substr(0,a.length*g);e=V(a,c,d,!1)}return f&&(a+="..."),a}function J(a,b,c,d,e,f,g,h,j,k){i(b,"text",{x:d,y:e,"text-anchor":f?f:"left",fill:g?g:a.legendFontColor,"font-size":j?j:a.legendFontSize,"font-family":h?h:a.legendFontFamily,"alignment-baseline":k?k:"auto"},c)}function K(a,b,c,d,e,f,g){i(a,"circle",{cx:b,cy:c,r:d,fill:e,stroke:f,"stroke-width":g})}function L(a,b,c){R(a,"rect",{x:b.legendBorderWidth,y:b.legendBorderWidth,width:b.legendWidth,height:c,stroke:b.legendBorderColor,"stroke-width":b.legendBorderWidth,fill:b.legendBackgroundColor,rx:b.legendBorderRadius,ry:b.legendBorderRadius})}function M(a,b,c,d,e,f,g){var h=2.5*g,i=3*g,j=Math.sqrt(3)/2*h;if("arrow"===c)Q(b,d,f,e-j+1,f,a.legendShapeColor,g),P(b,[e,f,e-j,f-h/2,e-j,f+h/2],a.legendShapeColor);else if("parallel"===c)g*=.8,Q(b,d,f-g,e,f-g,a.legendShapeColor,g),Q(b,d,f+g,e,f+g,a.legendShapeColor,g);else if("curve"===c)N(b,d,f,(d+e)/2,f-i,e,f,a.legendShapeColor,g);else if("curvedArrow"===c){var k,l=e-d;k=40>l?35:60>l?33:30,N(b,d,f,(d+e)/2,f-i,e-h/2,f-g,a.legendShapeColor,g),P(b,[e,f,e-j,f-h/2,e-j,f+h/2],a.legendShapeColor,{angle:k,cx:e,cy:f})}else if("dashed"===c){var m="8 3";Q(b,d,f,e,f,a.legendShapeColor,g,m)}else if("dotted"===c){var n="2";Q(b,d,f,e,f,a.legendShapeColor,g,n)}else"tapered"===c&&P(b,[d,f+g,d,f-g,e,f],a.legendShapeColor)}function N(a,b,c,d,e,f,g,h,j){var k="M "+b+" "+c+" Q "+d+" "+e+" "+f+" "+g;i(a,"path",{d:k,stroke:h,"stroke-width":j,fill:"none"})}function O(a,b,c,d,e,f){var g,h=[];if("diamond"===c)f*=1.3,h=[d-f,e,d,e-f,d+f,e,d,e+f];else if("star"===c){f*=1.7,g=-Math.PI/2;for(var i=0;5>i;++i)h[2*i]=Math.cos(g),h[2*i+1]=Math.sin(g),g+=4*Math.PI/5}else if("equilateral"===c){f*=1.3;var j=5;g=-Math.PI/2;for(var i=0;j>i;++i)h[2*i]=Math.cos(g),h[2*i+1]=Math.sin(g),g+=2*Math.PI/j}else"square"===c&&(h=[d-f,e-f,d+f,e-f,d+f,e+f,d-f,e+f]);if("star"===c||"equilateral"===c)for(var i=0;i<h.length;i+=2)h[i]=d+h[i]*f,h[i+1]=e+h[i+1]*f;if("cross"!==c)P(b,h,a.legendShapeColor);else{f*=1.2;var k=2*window.devicePixelRatio;Q(b,d-f,e,d+f,e,a.legendShapeColor,k),Q(b,d,e-f,d,e+f,a.legendShapeColor,k)}}function P(a,b,c,d){for(var e=b[0]+","+b[1],f=2;f<b.length;f+=2)e+=" "+b[f]+","+b[f+1];var g={points:e,fill:c};d&&(g.transform="rotate("+d.angle+", "+d.cx+", "+d.cy+")"),i(a,"polygon",g)}function Q(a,b,c,d,e,f,g,h){i(a,"line",{x1:b,y1:c,x2:d,y2:e,stroke:f,"stroke-width":g,"stroke-dasharray":h})}function R(a,b,c){i(a,b,c)}function S(a,b,c,d){var e=(c.length>a.legendTitleMaxLength?c.substring(0,a.legendTitleMaxLength):c)+(d?" ("+d+")":""),f=U(e,a.legendTitleFontFamily,a.legendTitleFontSize,a.legendWidth-a.legendInnerMargin),g="middle"===a.legendTitleTextAlign?a.legendWidth/2:a.legendInnerMargin;J(a,b,e,g,a.legendFontSize+a.legendInnerMargin,a.legendTitleTextAlign,a.legendTitleFontColor,a.legendTitleFontFamily,f)}function T(a){return a.charAt(0).toUpperCase()+a.slice(1).replace(/_/g," ")}function U(a,b,c,d){for(;V(a,b,c,!1)>d;)c-=c>15?2:1;return c}function V(a,b,c,d){return d?.45*c*a.length:(X.font=c+"px "+b,X.measureText(a).width)}function W(a,b){var c=["K","M","G","T","P","E","Z","Y"];if(a>9999){for(var d=0;d<c.length&&a>999;)a/=1e3,++d;return Math.ceil(a)+c[d-1]}return b?Math.round(a).toString():10>a?(Math.round(1e3*a)/1e3).toString():100>a?(Math.round(100*a)/100).toString():1e3>a?(Math.round(10*a)/10).toString():Math.round(a).toString()}if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.plugins");var X=document.createElement("canvas").getContext("2d"),Y={};sigma.plugins.legend=function(a){return Y[a.id]||(Y[a.id]=new b(a),a.bind("kill",function(){sigma.plugins.killLegend(a)})),Y[a.id]},sigma.plugins.killLegend=function(b){var c=Y[b.id];c&&(h(c.widgets,function(b,d){c.widgets[d]=a}),Y[b.id]=a)},b.prototype.draw=function(a){var b=this;l(this,function(){m(b),a&&a()})},b.prototype.setVisibility=function(a){this.visible=a,m(this)},b.prototype.setPlacement=function(a){-1!==["top","bottom","right","left"].indexOf(a)&&(this.placement=a,m(this))},b.prototype.addWidget=function(a,b,d){var e=this.widgets[t(a,b)];return e||(e=new c(this._canvas,this._sigmaInstance,this._designPlugin,this,a,b),e.id=t(a,b),this.widgets[e.id]=e),e.unit=d,y(e),e},b.prototype.getWidget=function(a,b){return this.widgets[t(a,b)]},b.prototype.addTextWidget=function(a){var b=new c(this._canvas,this._sigmaInstance,this._designPlugin,this,"text");return b.text=a,b.id="text"+this.textWidgetCounter++,this.widgets[b.id]=b,y(b),b},b.prototype.removeWidget=function(b,d){var e=b instanceof c?b.id:t(b,d);this.widgets[e]&&(this.widgets[e]=a,m(this))},b.prototype.removeAllWidgets=function(){this.widgets={},m(this)},c.prototype.unpin=function(){this.pinned=!1,m(this._legendPlugin)},c.prototype.setPosition=function(a,b){this.pinned=!0,this.x=a,this.y=b,m(this._legendPlugin)},c.prototype.setText=function(a){this.text=a,y(this)},c.prototype.setUnit=function(a){this.unit=a,y(this)},b.prototype.setExternalCSS=function(a){this.externalCSS=a},b.prototype.exportPng=function(a){var b=this.visible,c=this;c.visible=!0,c.draw(function(){var d=document.createElement("canvas"),e=d.getContext("2d"),f=c.boundingBox;d.width=f.w,d.height=f.h,e.drawImage(c._canvas,f.x,f.y,f.w,f.h,0,0,f.w,f.h),c.setVisibility(b),g(d.toDataURL(),a?a:"legend.png",!0)})},b.prototype.exportSvg=function(a){var b=this;this.draw(function(){var c=b._visualSettings,d=b.boundingBox,e="";(b.externalCSS||[]).forEach(function(a){e+='<?xml-stylesheet type="text/css" href="'+a+'" ?>\n'}),e+='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="'+d.w+'px" height="'+d.h+'px">',h(b.widgets,function(a){if(null!==a.svg){if(e+='<g transform="translate('+(a.x+-d.x)+" "+(a.y-d.y)+')">',e+=a.svg.innerHTML,"icon"===a.visualVar){var b=document.createElement("svg");a.svg.icons.forEach(function(a){J(c,b,a.content,a.x,a.y,"left",c.legendFontColor,a.font,c.legendFontSize,"central")}),e+=b.innerHTML}e+="</g>"}}),e+="</svg>",g(e,a?a:"legend.svg")})}}.call(this),function(){"use strict";function a(a,b,c){function d(a){var b=window.getComputedStyle(a),c=function(a){return parseInt(b.getPropertyValue(a).replace("px",""))||0};return{left:a.getBoundingClientRect().left+c("padding-left"),top:a.getBoundingClientRect().top+c("padding-top")}}function e(a){u=!1,n.removeEventListener("mousemove",j),n.removeEventListener("mouseup",i),t?setTimeout(function(){r=t,p.addEventListener("mousedown",h)},0):r=null}function f(a){if(0!=a.data.enter.nodes.length){var b=a.data.enter.nodes[0];t&&t.id===b.id||(t=b,u||(r=t,p.addEventListener("mousedown",h)))}}function g(a){if(0!=a.data.leave.nodes.length){var b=a.data.leave.nodes[0];t&&t.id===b.id?(t=null,r=null):t||p.removeEventListener("mousedown",h)}}function h(a){y&&3!=a.which&&(u=!0,r&&l.graph.nodes().length>0&&(x=!0,p.removeEventListener("mousedown",h),n.addEventListener("mousemove",j),n.addEventListener("mouseup",i),o.settings({mouseEnabled:!1,enableHovering:!1}),k.dispatchEvent("startdrag",{node:r,captor:a,renderer:o})))}function i(a){if(u=!1,p.addEventListener("mousedown",h),n.removeEventListener("mousemove",j),n.removeEventListener("mouseup",i),o.settings({mouseEnabled:!0,enableHovering:!0}),w){if(k.dispatchEvent("drop",{node:s,captor:a,renderer:o}),m)for(var b=m.nodes(),c=0;c<b.length;c++)b[c].alphaX=void 0,b[c].alphaY=void 0;l.refresh()}k.dispatchEvent("dragend",{node:r,captor:a,renderer:o}),w=!1,s=null}function j(a){function b(){var b,c,e,f,g,h,i,j=d(o.container),n=a.clientX-j.left,p=a.clientY-j.top,t=Math.cos(o.camera.angle),u=Math.sin(o.camera.angle),v=l.graph.nodes(),z=[];if((!m||m.nbNodes()!==v.length)&&y&&!(v.length<2)&&(i=sigma.utils.getDistance(n,p,r[q+"x"],r[q+"y"]),!(x&&i<r[q+"size"]))){x=!1;for(var A=0;y&&(f=v[A],f&&(g={x:f.x*t+f.y*u,y:f.y*t-f.x*u,renX:f[q+"x"],renY:f[q+"y"]},z.push(g)),A!=v.length-1);A++)if(A>0){if(z[0].x!=z[1].x&&z[0].y!=z[1].y)break;z.pop()}var B=z[0],C=z[1],D=C.renX-B.renX;0===D&&(D=1);var E=C.renY-B.renY;if(0===E&&(E=1),n=(n-B.renX)/D*(C.x-B.x)+B.x,p=(p-B.renY)/E*(C.y-B.y)+B.y,b=n*t-p*u,c=p*t+n*u,m&&(e=m.nodes(),h=-1<e.map(function(a){return a.id}).indexOf(r.id)))for(var A=0;A<e.length;A++)s!=r&&(e[A].alphaX=void 0,e[A].alphaY=void 0),e[A].alphaX&&e[A].alphaY||(e[A].alphaX=e[A].x-n,e[A].alphaY=e[A].y-p),e[A].x=r.x+e[A].alphaX,e[A].y=r.y+e[A].alphaY;r.x=b,r.y=c,l.refresh({skipIndexation:!0}),w=!0,s=r,k.dispatchEvent("drag",{node:s,captor:a,renderer:o})}}if(navigator.userAgent.toLowerCase().indexOf("firefox")>-1){clearTimeout(c);var c=setTimeout(b,0)}else b()}if(sigma.classes.dispatcher.extend(this),sigma.renderers.webgl&&b instanceof sigma.renderers.webgl)throw new Error("The sigma.plugins.dragNodes is not compatible with the WebGL renderer");var k=this,l=a,m=c,n=document.body,o=b,p=b.container.getElementsByClassName("sigma-mouse")[0],q=b.options.prefix,r=null,s=null,t=null,u=!1,v=!1,w=!1,x=!0,y=!0;b instanceof sigma.renderers.svg&&(p=b.container.firstChild),b.bind("hovers",f),b.bind("hovers",g),b.bind("click",e),this.enable=function(){y=!0},this.disable=function(){y=!1,r=null,s=null,t=null,u=!1,v=!1,w=!1,x=!0},this.unbindAll=function(){p.removeEventListener("mousedown",h),n.removeEventListener("mousemove",j),n.removeEventListener("mouseup",i),o.unbind("hovers",f),o.unbind("hovers",g)}}if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.plugins");var b={};sigma.plugins.dragNodes=function(c,d,e){return b[c.id]||(b[c.id]=new a(c,d,e)),c.bind("kill",function(){sigma.plugins.killDragNodes(c)}),c.bind("animate.start",function(){b[c.id].disable()}),c.bind("animate.end",function(){b[c.id].enable()}),b[c.id]},sigma.plugins.killDragNodes=function(c){b[c.id]instanceof a&&(b[c.id].unbindAll(),delete b[c.id])}}.call(window),function(undefined){"use strict";function deepCopy(o){var copy=Object.create(null);for(var i in o)"object"==typeof o[i]&&null!==o[i]?copy[i]=deepCopy(o[i]):"function"==typeof o[i]&&null!==o[i]?eval(" copy[i] = "+o[i].toString()):copy[i]=o[i];return copy}function find(a){var b,c,d;if(b=this.siblingEdgesIndex[a]){if(c=this.allNeighborsIndex.get(b.source).get(b.target),1===c.size){if(d=this.edges(c.keyList()[0]),"parallel"!==d.type)throw new Error('The sibling container must be of type "parallel", was '+d.type);if(d.siblings===undefined)throw new Error('The sibling container has no "siblings" key.');if(Object.keys(d.siblings).length<2)throw new Error("The sibling container must have more than one sibling, had "+Object.keys(d.siblings).length);if(d.siblings[a]===undefined)throw new Error("Sibling container found but the edge sibling is missing.");return d}if(c.size>1){var e;if(c.forEach(function(b,c){if("parallel"===b.type&&b.siblings!==undefined){if(!Object.keys(b.siblings).length)throw new Error("Edge sibling found but its container is missing.");b.siblings[a]!==undefined&&(e=b)}}),e!==undefined)return e;throw new Error("Edge sibling found but its container is missing.")}throw new Error("Edge sibling found but its container is missing.")}return this.edgesIndex.get(a)}function get(a){if(!arguments.length||a===undefined)return this.edgesArray.slice(0);if(arguments.length>1)throw new Error("Too many arguments. Use an array instead.");if("number"==typeof a||"string"==typeof a)return find.call(this,a);if(Array.isArray(a)){var b,c,d=[];for(b=0,c=a.length;c>b;b++){if("number"!=typeof a[b]&&"string"!=typeof a[b])throw new Error("Invalid argument: an edge id is not a string or a number, was "+a[b]);d.push(find.call(this,a[b]))}return d}throw new Error('Invalid argument: "v" is not a string or an array, was '+a)}function add(a,b){if(!a.siblings){var c=deepCopy(a);a.siblings={},a.siblings[a.id]=c,delete a.color,delete a.label,a.size=1,a.type="parallel",this.siblingEdgesIndex[c.id]=c}a.siblings[b.id]=b,this.siblingEdgesIndex[b.id]=b}function drop(a,b){if(delete a.siblings[b],delete this.siblingEdgesIndex[b],1===Object.keys(a.siblings).length){var c=a.siblings[Object.keys(a.siblings)[0]];this.dropEdge(a.id),this.addEdge(c),delete this.siblingEdgesIndex[a.id],delete this.siblingEdgesIndex[c.id]}}if("undefined"==typeof sigma)throw new Error("sigma is not declared");sigma.utils.pkg("sigma.plugins"),sigma.classes.graph.hasMethod("edgeSiblings")||sigma.classes.graph.addMethod("edgeSiblings",function(a){return get.call(this,a)}),sigma.classes.graph.hasMethod("addEdgeSibling")||sigma.classes.graph.addMethod("addEdgeSibling",function(a){if(0==arguments.length)throw new TypeError("Missing argument.");if(Object(a)!==a)throw new TypeError('Invalid argument: "edge" is not an object, was '+a);if("number"!=typeof a.id&&"string"!=typeof a.id)throw new TypeError('Invalid argument key: "edge.id" is not a string or a number, was '+a.id);if("number"!=typeof a.source&&"string"!=typeof a.source||!this.nodesIndex.get(a.source))throw new Error('Invalid argument key: "edge.source" is not an existing node id, was '+a.source);if("number"!=typeof a.target&&"string"!=typeof a.target||!this.nodesIndex.get(a.target))throw new Error('Invalid argument key: "edge.target" is not an existing node id, was '+a.target);if(this.edgesIndex.get(a.id))throw new Error('Invalid argument: an edge of id "'+a.id+'" already exists.');if(this.siblingEdgesIndex[a.id])throw new Error('Invalid argument: an edge sibling of id "'+a.id+'" already exists.');var b=this.allNeighborsIndex.get(a.source).get(a.target);if(b!==undefined&&b.size){var c=this.edges(b.get(b.keyList()[0]).id);add.call(this,c,a)}else this.addEdge(a);return this}),sigma.classes.graph.hasMethod("dropEdgeSibling")||sigma.classes.graph.addMethod("dropEdgeSibling",function(a){if(0==arguments.length)throw new TypeError("Missing argument.");if("number"!=typeof a&&"string"!=typeof a)throw new TypeError('Invalid argument: "id" is not a string or a number, was '+a);if(this.siblingEdgesIndex[a]){var b=find.call(this,a);drop.call(this,b,a)}else this.dropEdge(a);return this}),sigma.classes.graph.hasMethod("readWithSiblings")||sigma.classes.graph.addMethod("readWithSiblings",function(a){var b,c,d;for(c=a.nodes||[],b=0,d=c.length;d>b;b++)this.addNode(c[b]);for(c=a.edges||[],b=0,d=c.length;d>b;b++)this.addEdgeSibling(c[b]);return this}),sigma.classes.graph.addIndex("siblingEdgesIndex",{constructor:function(){this.siblingEdgesIndex=Object.create(null)}})}.call(this),function(undefined){"use strict";function deepCopy(o){var copy=Object.create(null);for(var i in o)"object"==typeof o[i]&&null!==o[i]?copy[i]=deepCopy(o[i]):"function"==typeof o[i]&&null!==o[i]?eval(" copy[i] = "+o[i].toString()):copy[i]=o[i];return copy}function cloneChain(a){for(var b=a.slice(0),c=0,d=b.length;d>c;c++)b[c]=deepCopy(b[c]);return b}function strToObjectRef(a,b){return b.split(".").reduce(function(a,b){return a[b]},a)}function Filter(s){function register(a,b,c,d){if(arguments[3]===undefined&&"object"!=typeof arguments[2]&&(d=c,c=null),d!==undefined&&"number"!=typeof d&&"string"!=typeof d)throw new TypeError('Invalid argument: "key" is not a number or a string, was '+d);if(d!==undefined&&"string"==typeof d&&!d.length)throw new TypeError('Invalid argument: "key" is an empty string.');if("string"!=typeof a)throw new TypeError('Invalid argument: "processor" is not a string, was '+a);if("undo"===d)throw new Error('Invalid argument: "key" has value "undo", which is a reserved keyword.');if(_keysIndex[d])throw new Error('Invalid argument: the filter of key "'+d+'" already exists.');d&&(_keysIndex[d]=!0),_chain.push({key:d,processor:a,predicate:b,options:c||{}})}function unregister(a){_chain=_chain.filter(function(b){return!(b.key in a)});for(var b in a)delete _keysIndex[b]}var _self=this,_s=s,_g=s.graph,_chain=[],_keysIndex=Object.create(null);this.has=function(a){return _keysIndex[a]},this.nodesBy=function(a,b,c){return register("nodes",a,b,c),this},this.edgesBy=function(a,b,c){return register("edges",a,b,c),this},this.neighborsOf=function(a,b,c){if("number"!=typeof a&&"string"!=typeof a)throw new TypeError("Invalid argument: id is not a string or a number, was "+a);if("string"==typeof a&&!a.length)throw new TypeError("Invalid argument: id is an empty string.");return register("neighbors",a,b,c),this},this.apply=function(){for(var a=0,b=_chain.length;b>a;++a)switch(_chain[a].processor){case"nodes":Processors.nodes(_g,_chain[a].predicate,_chain[a].options);break;case"edges":Processors.edges(_g,_chain[a].predicate,_chain[a].options);break;case"neighbors":Processors.neighbors(_g,_chain[a].predicate);break;case"undo":Processors.undo(_g,_chain[a].predicate);break;default:throw new Error("Unknown processor "+_chain[a].processor)}return _chain[0]&&"undo"===_chain[0].key&&_chain.shift(),_s&&_s.refresh(),this},this.undo=function(a){var b=Object.create(null),c=arguments.length;if(1===c)if("[object Array]"===Object.prototype.toString.call(a))for(var d=0,e=a.length;e>d;d++)b[a[d]]=!0;else b[a]=!0;else if(c>1)for(var d=0;c>d;d++)b[arguments[d]]=!0;else this.clear();return unregister(b),_chain.unshift({key:"undo",processor:"undo"}),this},this.clear=function(){return _chain.length=0,_keysIndex=Object.create(null),this},this.kill=function(){return this.clear(),delete _instance[_s.id],_g=null,_s=null,this},this.serialize=function(){for(var a=cloneChain(_chain),b=0,c=a.length;c>b;b++)a[b].predicate=a[b].predicate.toString().replace(/\s+/g," ").replace(/"use strict"; /,"");return a},this.load=function(chain){if(chain===undefined)throw new TypeError("Missing argument.");if(!Array.isArray(chain))throw new TypeError('Invalid argument: "chain" is not an array, was '+chain);this.clear();for(var copy=cloneChain(chain),i=0,len=copy.length;len>i;i++){if(copy[i].predicate===undefined)throw new TypeError('Missing filter key: "predicate".');if(copy[i].processor===undefined)throw new TypeError('Missing filter key: "processor".');if(copy[i].key!=undefined&&"string"!=typeof copy[i].key)throw new TypeError('Invalid filter key: "key" is not a string, was '+copy[i].key.toString());if("string"==typeof copy[i].predicate&&eval(" copy[i].predicate = "+copy[i].predicate),"function"!=typeof copy[i].predicate)throw new TypeError('Invalid filter key: "predicate" of key "'+copy[i].key+'" is not a function.');if("string"!=typeof copy[i].processor)throw new TypeError('Invalid filter key: "processor" of key "'+copy[i].key+'" is not a string.');copy[i].key&&(_keysIndex[copy[i].key]=!0)}return _chain=copy,this}}if("undefined"==typeof sigma)throw new Error("sigma is not declared");sigma.utils.pkg("sigma.plugins");var _instance={};sigma.classes.graph.hasMethod("adjacentNodes")||sigma.classes.graph.addMethod("adjacentNodes",function(a,b){if(b=b||{},b.withHidden=2==arguments.length?b.withHidden:!0,"string"!=typeof a&&"number"!=typeof a)throw new TypeError("The node id is not a string or a number, was "+a);var c,d=this,e=[];return(this.allNeighborsIndex.get(a)||[]).forEach(function(f,g){b.withHidden?e.push(d.nodesIndex.get(g)):d.nodes(g).hidden||(c=0!=d.allNeighborsIndex.get(a).get(g).keyList().map(function(a){return d.edges(a)}).filter(function(a){return!a.hidden}).length,c&&e.push(d.nodesIndex.get(g)))}),e}),sigma.classes.graph.hasMethod("adjacentEdges")||sigma.classes.graph.addMethod("adjacentEdges",function(a,b){if(b=b||{},b.withHidden=2==arguments.length?b.withHidden:!0,"string"!=typeof a&&"number"!=typeof a)throw new TypeError("The node id is not a string or a number, was "+a);var c=this,d=this.allNeighborsIndex.get(a)||[],e=[];return d.forEach(function(a,f){d.get(f).forEach(function(a,d){(b.withHidden||!c.edges(d).hidden)&&e.push(c.edges(d))})}),e});var Processors={};Processors.nodes=function(a,b,c){if(a){for(var d=a.nodes(),e=d.length,f=a.edges(),g=f.length;e--;)d[e].hidden=!b.call({graph:a,get:strToObjectRef},d[e],c)||d[e].hidden;for(;g--;)(a.nodes(f[g].source).hidden||a.nodes(f[g].target).hidden)&&(f[g].hidden=!0)}},Processors.edges=function(a,b,c){if(a)for(var d=a.edges(),e=d.length;e--;)d[e].hidden=!b.call({graph:a,get:strToObjectRef},d[e],c)||d[e].hidden},Processors.neighbors=function(a,b){if(a){for(var c=a.nodes(),d=c.length,e=a.edges(),f=e.length,g=a.adjacentNodes(b),h=g.length,i={};h--;)i[g[h].id]=!0;for(;d--;)c[d].id===b||c[d].id in i||(c[d].hidden=!0);for(;f--;)(a.nodes(e[f].source).hidden||a.nodes(e[f].target).hidden)&&(e[f].hidden=!0)}},Processors.undo=function(a){if(a){for(var b=a.nodes(),c=b.length,d=a.edges(),e=d.length;c--;)b[c].hidden=!1;for(;e--;)d[e].hidden=!1}},sigma.plugins.filter=function(a){return _instance[a.id]||(_instance[a.id]=new Filter(a),a.bind("kill",function(){sigma.plugins.killFilter(a)})),_instance[a.id]},sigma.plugins.killFilter=function(a){_instance[a.id]instanceof Filter&&_instance[a.id].kill(),delete _instance[a.id]}}.call(this),function(a){"use strict";function b(){document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement||document.msFullscreenElement?document.exitFullscreen?document.exitFullscreen():document.msExitFullscreen?document.msExitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitExitFullscreen&&document.webkitExitFullscreen():d.requestFullscreen?d.requestFullscreen():d.msRequestFullscreen?d.msRequestFullscreen():d.mozRequestFullScreen?d.mozRequestFullScreen():d.webkitRequestFullscreen&&d.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)}function c(a){var c=a||{};d=c.container?"object"==typeof c.container?c.container:document.getElementById(c.container):this.container,e=null,c.btnId?(e=document.getElementById(c.btnId),e.removeEventListener("click",b),e.addEventListener("click",b)):b()}if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.plugins.fullScreen");var d=null,e=null;sigma.plugins.fullScreen=c}.call(this),function(a){"use strict";function b(a){return a===a&&"[object Number]"===Object.prototype.toString.call(a)}function c(a){return"object"==typeof a&&!!a}if("undefined"==typeof sigma)throw new Error("sigma is not declared");sigma.utils.pkg("sigma.plugins"),sigma.plugins.generators={},sigma.plugins.generators.random=function(a){if(!a)throw new Error("Missing argument: options");if(!c(a))throw new TypeError("Invalid argument: options is not an object, was "+a);if(!b(a.nbNodes)||a.nbNodes<1)throw new TypeError("Invalid argument: options.nbNodes is not a positive number, was "+a.nbNodes);if(!b(a.nbEdges)||a.nbEdges<1)throw new TypeError("Invalid argument: options.nbEdges is not a number, was "+a.nbEdges);var d,e=a.nbNodes,f=a.nbEdges,g={nodes:[],edges:[]};for(d=0;e>d;d++)g.nodes.push({id:"n"+d,label:"Node "+d,x:Math.random(),y:Math.random(),size:1});for(d=0;f>d;d++)g.edges.push({id:"e"+d,label:"Edge "+d,source:"n"+(Math.random()*e|0),target:"n"+(Math.random()*e|0)});return g},sigma.plugins.generators.balancedTree=function(a){if(!a)throw new Error("Missing argument: options");if(!c(a))throw new TypeError("Invalid argument: options is not an object, was "+a);if(!b(a.nbChildren)||a.nbChildren<1)throw new TypeError("Invalid argument: options.nbChildren is not a positive number, was "+a.nbChildren);if(!b(a.height)||a.height<1)throw new TypeError("Invalid argument: options.height is not a positive number, was "+a.height);var d,e,f,g,h,i=0,j=0,k=a.nbChildren,l=a.height,m={nodes:[{id:"n0",label:"Node 0",x:Math.random(),
y:Math.random(),size:1,index:0}],edges:[]},n=[];for(d=0;k>d;d++)g={id:"n"+ ++i,label:"Node "+i,x:Math.random(),y:Math.random(),size:1,index:i-1},m.nodes.push(g),n.push(g),m.edges.push({id:"e"+j++,label:"Edge "+j,source:"n0",target:"n"+i});for(f=1;l>f;f++)for(h=n,n=[],e=0;e<h.length;e++)for(d=0;k>d;d++)g={id:"n"+ ++i,label:"Node "+i,x:Math.random(),y:Math.random(),size:1,index:i-1},n.push(g),m.nodes.push(g),m.edges.push({id:"e"+j++,label:"Edge "+j,source:"n"+h[e].index,target:"n"+i});return m},sigma.plugins.generators.erdosRenyi=function(a){if(!a)throw new Error("Missing argument: options");if(!c(a))throw new TypeError("Invalid argument: options is not an object, was "+a);if(!b(a.nbNodes)||a.nbNodes<1)throw new TypeError("Invalid argument: options.nbNodes is not a positive number, was "+a.nbNodes);if(a.nbNodes<3)throw new TypeError("Invalid argument: options.nbNodes is smaller than 3, was "+a.nbNodes);if("nbEdges"in a&&"p"in a)throw new TypeError("Invalid argument: choose between options.nbEdges and options.p");var d,e,f,g={nodes:[],edges:[]},h=0,i=a.nbNodes,j=a.p;if(a.p>=0){if(!b(a.p)||a.p<0)throw new TypeError("Invalid argument: options.p is not a positive number, was "+a.p);for(e=0;i>e;e++)for(g.nodes.push({id:"n"+e,label:"Node "+e,x:Math.random(),y:Math.random(),size:1}),f=0;e>f;f++)Math.random()<j&&g.edges.push({id:"e"+h++,label:"Edge "+h,source:"n"+e,target:"n"+f})}else{if(!b(a.nbEdges)||a.nbEdges<1)throw new TypeError("Invalid argument: options.nbEdges is not a positive number, was "+a.nbEdges);var h,k=[],l=a.nbEdges;for(e=0;i>e;e++)for(g.nodes.push({id:"n"+e,label:"Node "+e,x:Math.random(),y:Math.random(),size:1}),f=e+1;i>f;f++)k.push({source:"n"+e,target:"n"+f});for(h=k.length-1,e=0;l>e;e++)d=k.splice(Math.floor(Math.random()*h),1)[0],d.id="e"+e,d.label="Edge "+e,g.edges.push(d),h--}return g},sigma.plugins.generators.barabasiAlbert=function(a){if(!a)throw new Error("Missing argument: options");if(!c(a))throw new TypeError("Invalid argument: options is not an object, was "+a);if(!b(a.nbNodes)||a.nbNodes<1)throw new TypeError("Invalid argument: options.nbNodes is not a positive number, was "+a.nbNodes);if(a.nbNodes<3)throw new TypeError("Invalid argument: options.nbNodes is smaller than 3, was "+a.nbNodes);if(!b(a.m0)||a.m0<=0)throw new TypeError("Invalid argument: options.m0 is not a positive number, was "+a.m0);if(!b(a.m)||a.m<=0)throw new TypeError("Invalid argument: options.m is not a positive number, was "+a.m);if(a.m0>=a.nbNode)throw new TypeError("Invalid argument: options.m0 is greater than options.nbNodes, was "+a.m0);if(a.m>a.m0)throw new TypeError("Invalid argument: options.m is strictly greater than options.m0, was "+a.m);var d,e,f,g,h,i,j,k,l={nodes:[],edges:[]},m={},n=[],o=0,p=a.nbNodes,q=a.m0,r=a.m;for(d=0;q>d;d++)l.nodes.push({id:"n"+d,label:"node "+d,x:Math.random(),y:Math.random(),size:1}),n[d]=0;for(d=0;q>d;d++)for(e=d+1;q>e;e++)f={id:"e"+o++,label:"Edge "+o,source:"n"+d,target:"n"+e},m[f.source+"-"+f.target]=f,l.edges.push(f),n[d]++,n[e]++;for(d=q;p>d;d++){for(l.nodes.push({id:"n"+d,label:"node "+d,x:Math.random(),y:Math.random(),size:1}),n[d]=0,g=0,e=0;d>e;e++)g+=n[e];for(h=0,i=0;r>i;i++)for(j=Math.random(),k=0,e=0;d>e;e++)if(!m[d+"-"+e]&&!m[e+"-"+d]&&(1==d?k=1:k+=n[e]/g+h/(d-i),k>=j)){h+=n[e]/g,f={id:"e"+o++,label:"Edge "+o,source:"n"+d,target:"n"+e},m[f.source+"-"+f.target]=f,l.edges.push(f),n[d]++,n[e]++;break}}return l},sigma.plugins.generators.wattsStrogatz=function(a){function d(b,c){if(b==c||k[b+"-"+c])return 0;var d=e(b,c);return d>=m?1:0===d?r:Math.pow(d/m,a.alpha)*(1-r)+r}function e(a,b){var c,d=0;for(c=0;l>c;c++)c!=a&&c!=b&&k[a+"-"+c]&&k[b+"-"+c]&&d++;return d}if(!a)throw new Error("Missing argument: options");if(!c(a))throw new TypeError("Invalid argument: options is not an object, was "+a);if(!b(a.nbNodes)||a.nbNodes<1)throw new TypeError("Invalid argument: options.nbNodes is not a positive number, was "+a.nbNodes);if(a.nbNodes<3)throw new TypeError("Invalid argument: options.nbNodes is smaller than 3, was "+a.nbNodes);if(!b(a.k)||a.k%2!=0)throw new TypeError("Invalid argument: options.k is not an even integer, was "+a.k);var f,g,h,i={nodes:[],edges:[]},j=0,k={},l=a.nbNodes,m=a.k;if("alpha"in a){if(!b(a.alpha)||a.alpha<0||a.alpha>1)throw new TypeError("Invalid argument: options.alpha is not a number between [0,1], was "+a.alpha);var n,o,p,q,r=Math.pow(10,-10),s=0,t=[],u=l*m/2;for(f=0;l>f;f++)i.nodes.push({id:"n"+f,label:"Node "+f,x:Math.random(),y:Math.random(),size:1}),h={id:"e"+j++,label:"Edge "+j,source:"n"+f,target:"n"+(f+1)%l},k[h.source+"-"+h.target]=h,i.edges.push(h),s++;for(;u>s;){for(f=0;l>f;f++)t.push(f);for(;u>s&&t.length>0;){for(f=t.splice(Math.floor(Math.random()*t.length),1)[0],n=[],o=0,g=0;l>g;g++)n[g]=d(f,g),o+=n[g];for(p=Math.random(),q=0,g=0;l>g;g++)f!=g&&(q+=n[g]/o,q>=p&&(h={id:"e"+j++,label:"Edge "+j,source:"n"+f,target:"n"+g},i.edges.push(h),s++,k[h.source+"-"+h.target]=h))}}}else{if(!b(a.beta)||a.beta<0||a.beta>1)throw new TypeError("Invalid argument: options.beta is not a number between [0,1], was "+a.beta);var v;for(m>>=1,f=0;l>f;f++)for(i.nodes.push({id:"n"+f,label:"node "+f,x:Math.random(),y:Math.random(),size:1}),g=1;m>=g;g++)h={id:"e"+j++,label:"Edge "+j,source:"n"+f,target:"n"+(f+g)%l},k[h.source+"-"+h.target]=h,i.edges.push(h);for(f=0;l>f;f++)for(g=1;m>=g;g++)if(Math.random()<=a.beta){do v=Math.floor(Math.random()*(l-1));while(v==f||k["n"+f+"-n"+v]);var w=(f+g)%l;k["n"+f+"-n"+w].target="n"+v,k["n"+f+"-n"+v]=k["n"+f+"-n"+w],delete k["n"+f+"-n"+w]}}return i},sigma.plugins.generators.path=function(a){if(!a||0>a)throw new TypeError('Invalid argument: "length" is not a positive number, was '+a);for(var b={nodes:[{id:"n0",label:"Node 0",x:Math.random(),y:Math.random(),size:1}],edges:[]},c=1;a>c;++c)b.nodes.push({id:"n"+c,label:"Node "+c,x:Math.random(),y:Math.random(),size:1}),b.edges.push({id:"e"+c,label:"Edge "+c,source:"n"+(c-1),target:"n"+c});return b},sigma.plugins.generators.grid=function(a,b){if(1>a)throw new TypeError('Invalid argument: "n" is not a positive integer, was '+a);if(1>b)throw new TypeError('Invalid argument: "m" is not a positive integer, was '+b);var c,d,e,f,g={nodes:[],edges:[]},h=0,i=[];if(i.length=a*b,1===a&&1===b)return g.nodes.push({id:"n0",label:"Node 0",x:Math.random(),y:Math.random(),size:1}),g;for(c=0;a>c;++c)for(d=0;b>d;++d)e=c+d*a,i[e]||(g.nodes.push({id:"n"+e,label:"Node "+e,x:Math.random(),y:Math.random(),size:1}),i[e]=!0),c>0&&(f=c-1+d*a,i[f]||(g.nodes.push({id:"n"+f,label:"Node "+f,x:Math.random(),y:Math.random(),size:1}),i[f]=!0),g.edges.push({id:"e"+h++,label:"Edge "+h,source:"n"+e,target:"n"+f})),d>0&&(f=c+(d-1)*a,i[f]||(g.nodes.push({id:"n"+f,label:"Node "+f,x:Math.random(),y:Math.random(),size:1}),i[f]=!0),g.edges.push({id:"e"+h++,label:"Edge "+h,source:"n"+e,target:"n"+f}));return g}}.call(this),function(a){"use strict";function b(a,b,d){function e(b){var c=Math.max(a.settings("zoomMin"),Math.min(a.settings("zoomMax"),a.camera.ratio*(b.ratio||1)));sigma.misc.animation.camera(a.camera,{x:a.camera.x+(b.x||0),y:a.camera.y+(b.y||0),ratio:c},{duration:b.duration})}function f(){e({x:-d.displacement,duration:d.duration})}function g(){e({y:-d.displacement,duration:d.duration})}function h(){e({x:d.displacement,duration:d.duration})}function i(){e({y:d.displacement,duration:d.duration})}function j(){e({ratio:1/d.zoomingRatio,duration:d.duration})}function k(){e({ratio:d.zoomingRatio,duration:d.duration})}function l(){n.domElt.addEventListener("keydown",n.keyDown),n.domElt.addEventListener("keyup",n.keyUp),n.bind("37 18+37",f),n.bind("38 18+38",g),n.bind("39 18+39",h),n.bind("40 18+40",i),n.bind("32+38 18+32+38",j),n.bind("32+40 18+32+40",k)}function m(){n.domElt.removeEventListener("keydown",n.keyDown),n.domElt.removeEventListener("keyup",n.keyUp),n.unbind()}d=sigma.utils.extend(d,c),d.zoomingRatio=d.zoomingRatio||a.settings("zoomingRatio"),d.duration=d.duration||a.settings("mouseZoomDuration"),this.domElt=b.container,this.keys={},this.currentEvents=null;var n=this;sigma.classes.dispatcher.extend(this),this.domElt.tabIndex=d.tabIndex,this.keyDown=function(a){9===a.which||18===a.which||20===a.which||n.keys[a.which]||(n.keys[a.which]=!0,n.currentEvents=Object.keys(n.keys).join("+"),n.dispatchEvent(n.currentEvents))},this.keyUp=function(a){delete n.keys[a.which],n.currentEvents=null},this.focus=function(a){return n.domElt.focus(),!0},this.blur=function(a){return n.domElt.blur(),n.keys={},n.currentEvents=null,!0},this.kill=function(){m(),n.domElt=null,n.keys={},n.currentEvents=null},l()}if("undefined"==typeof sigma)throw"sigma.plugins.keyboard: sigma is not declared";sigma.utils.pkg("sigma.plugins");var c={displacement:100,duration:200,zoomingRatio:1.7,tabIndex:-1},d={};sigma.plugins.keyboard=function(a,c,e){return d[a.id]||(d[a.id]=new b(a,c,e),a.bind("kill",function(){sigma.plugins.killKeyboard(a)})),d[a.id]},sigma.plugins.killKeyboard=function(a){d[a.id]instanceof b&&(d[a.id].kill(),delete d[a.id])}}.call(this),function(a){"use strict";function b(b,c,d){if(sigma.classes.dispatcher.extend(this),sigma.renderers.webgl&&c instanceof sigma.renderers.webgl)throw new Error("The sigma.plugins.lasso is not compatible with the WebGL renderer");this.sigmaInstance=b,this.renderer=c,this.drawingCanvas=a,this.drawingContext=a,this.drewPoints=[],this.selectedNodes=[],this.isActive=!1,this.isDrawing=!1,f=document.body,this.settings=new sigma.classes.configurable({strokeStyle:"black",lineWidth:2,fillWhileDrawing:!1,fillStyle:"rgba(200, 200, 200, 0.25)",cursor:"crosshair"},d||{})}function c(a){var b=this.drawingCanvas.getBoundingClientRect();this.isActive&&(this.isDrawing=!0,this.drewPoints=[],this.selectedNodes=[],this.sigmaInstance.refresh(),this.drewPoints.push({x:a.clientX-b.left,y:a.clientY-b.top}),this.drawingCanvas.style.cursor=this.settings("cursor"),a.stopPropagation())}function d(a){if(this.isActive&&this.isDrawing){var b=0,c=0,d=this.drawingCanvas.getBoundingClientRect();switch(a.type){case"touchmove":b=a.touches[0].clientX,c=a.touches[0].clientY;break;default:b=a.clientX,c=a.clientY}this.drewPoints.push({x:b-d.left,y:c-d.top}),this.drawingContext.lineWidth=this.settings("lineWidth"),this.drawingContext.strokeStyle=this.settings("strokeStyle"),this.drawingContext.fillStyle=this.settings("fillStyle"),this.drawingContext.lineJoin="round",this.drawingContext.lineCap="round",this.drawingContext.clearRect(0,0,this.drawingContext.canvas.width,this.drawingContext.canvas.height);var e=this.drewPoints[0],f=this.drewPoints[1],g=this.drewPoints.length,h=function(a,b){return{x:a.x+(b.x-a.x)/2,y:a.y+(b.y-a.y)/2}};this.drawingContext.beginPath(),this.drawingContext.moveTo(e.x,e.y);for(var i=1;g>i;i++){var j=h(e,f);this.drawingContext.quadraticCurveTo(e.x,e.y,j.x,j.y),e=this.drewPoints[i],f=this.drewPoints[i+1]}this.drawingContext.lineTo(e.x,e.y),this.drawingContext.stroke(),this.settings("fillWhileDrawing")&&this.drawingContext.fill(),a.stopPropagation()}}function e(a){if(this.isActive&&this.isDrawing){this.isDrawing=!1;for(var b=this.renderer.nodesOnScreen,c=b.length,d=this.renderer.options.prefix||"";c--;){var e=b[c],f=e[d+"x"],g=e[d+"y"];this.drawingContext.isPointInPath(f,g)&&!e.hidden&&this.selectedNodes.push(e)}this.dispatchEvent("selectedNodes",this.selectedNodes),this.drawingContext.clearRect(0,0,this.drawingCanvas.width,this.drawingCanvas.height),this.drawingCanvas.style.cursor=this.settings("cursor"),a.stopPropagation()}}if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.plugins");var f=a,g={};b.prototype.clear=function(){return this.deactivate(),this.sigmaInstance=a,this.renderer=a,this},b.prototype.activate=function(){return this.sigmaInstance&&!this.isActive&&(this.isActive=!0,this.renderer.domElements.lasso||(this.renderer.initDOM("canvas","lasso"),this.drawingCanvas=this.renderer.domElements.lasso,this.drawingCanvas.width=this.renderer.container.offsetWidth,this.drawingCanvas.height=this.renderer.container.offsetHeight,this.renderer.container.appendChild(this.drawingCanvas),this.drawingContext=this.drawingCanvas.getContext("2d"),this.drawingCanvas.style.cursor=this.settings("cursor")),h.apply(this)),this},b.prototype.deactivate=function(){return this.sigmaInstance&&this.isActive&&(this.isActive=!1,this.isDrawing=!1,i.apply(this),this.renderer.domElements.lasso&&(this.renderer.container.removeChild(this.renderer.domElements.lasso),delete this.renderer.domElements.lasso,this.drawingCanvas.style.cursor="",this.drawingCanvas=a,this.drawingContext=a,this.drewPoints=[])),this};var h=function(){this.drawingCanvas.addEventListener("mousedown",c.bind(this)),f.addEventListener("mousemove",d.bind(this)),f.addEventListener("mouseup",e.bind(this)),this.drawingCanvas.addEventListener("touchstart",c.bind(this)),f.addEventListener("touchmove",d.bind(this)),f.addEventListener("touchcancel",e.bind(this)),f.addEventListener("touchleave",e.bind(this)),f.addEventListener("touchend",e.bind(this))},i=function(){this.drawingCanvas.removeEventListener("mousedown",c.bind(this)),f.removeEventListener("mousemove",d.bind(this)),f.removeEventListener("mouseup",e.bind(this)),this.drawingCanvas.removeEventListener("touchstart",c.bind(this)),this.drawingCanvas.removeEventListener("touchmove",d.bind(this)),f.removeEventListener("touchcancel",e.bind(this)),f.removeEventListener("touchleave",e.bind(this)),f.removeEventListener("touchend",e.bind(this))};b.prototype.getSelectedNodes=function(){return this.selectedNodes},sigma.plugins.lasso=function(a,c,d){return g[a.id]||(g[a.id]=new b(a,c,d)),a.bind("kill",function(){g[a.id]instanceof b&&(g[a.id].clear(),delete g[a.id])}),g[a.id]}}.call(this),function(a){"use strict";function b(a){var b=document.createEvent("MouseEvent");return b.initMouseEvent(a.type,a.canBubble,a.cancelable,a.view,a.detail,a.screenX,a.screenY,a.clientX,a.clientY,a.ctrlKey,a.altKey,a.shiftKey,a.metaKey,a.button,a.relatedTarget),b}function c(a){return"undefined"!=typeof a.lat&&"undefined"!=typeof a.lng&&"number"==typeof a.lat&&"number"==typeof a.lng}function d(d,h,i){function j(b){if(C){for(var c,d=C.graph.nodes(),e=0;e<d.length;e++)c=d[e],A||c.leaflet_hidden===a||(c.hidden=c.leaflet_hidden,c.leaflet_hidden=a),c.leaflet_x!==a&&c.leaflet_y!==a&&(H?(c.x=c["read_cam0:x"]||c.x,c.y=c["read_cam0:y"]||c.y,c.leaflet_x_easing=c.leaflet_x,c.leaflet_y_easing=c.leaflet_y):(c.x=c.leaflet_x,c.y=c.leaflet_y),c.leaflet_x=a,c.leaflet_y=a);H?m(d,b):(C.refresh(),b&&b())}}function k(){A&&(A.has("geo-coordinates")?A.apply():A.nodesBy(c,"geo-coordinates").apply())}function l(){K=!K}function m(a,b){sigma.plugins.animate(C,{x:"leaflet_x_easing",y:"leaflet_y_easing"},{easing:I,onComplete:function(){C.refresh();for(var c=0;c<a.length;c++)a[c].leaflet_x_easing=null,a[c].leaflet_y_easing=null;b&&b()},duration:J})}function n(a){for(var b,c,d=a.data.nodes||[a.data.node],e=0,f=d.length;f>e;e++)b=d[e],c=B.utils.sigmaPointToLatLng(b),b.lat_init=b.lat,b.lng_init=b.lng,b.lat=c.lat,b.lng=c.lng}function o(){O||(O=!0,Object.keys(f).forEach(function(a){F[a]=C.settings(a),C.settings(a,f[a])}),C.camera.ratio=1)}function p(){O&&(O=!1,Object.keys(f).forEach(function(a){C.settings(a,F[a])}))}function q(){if(!P&&"undefined"!=typeof sigma.plugins.locate&&(P=!0,C)){var a=sigma.plugins.locate(C).settings.animation;G.nodeDuration=a.node.duration,G.edgeDuration=a.edge.duration,G.centerDuration=a.center.duration,a.node.duration=0,a.edge.duration=0,a.center.duration=0}}function r(){if(P&&"undefined"!=typeof sigma.plugins.locate&&(P=!1,C)){var a=sigma.plugins.locate(C).settings.animation;a.node.duration=G.nodeDuration,a.edge.duration=G.edgeDuration,a.center.duration=G.centerDuration}}function s(){g.forEach(function(a){E.container.addEventListener(a,u,!0)})}function t(){g.forEach(function(a){E.container.removeEventListener(a,u,!0)})}function u(a){D.getContainer().dispatchEvent(b(a))}function v(){C.settings("enableCamera",!1),E.container.style.visibility="hidden"}function w(){C.settings("enableCamera",!0),E.container.style.visibility="",B.syncNodes()}function x(){D&&(D.getContainer().style.opacity=0,D.getContainer().style.visibility="hidden")}function y(){D&&(D.getContainer().style.opacity=1,D.getContainer().style.visibility="")}if(sigma.classes.dispatcher.extend(this),"undefined"==typeof L)throw new Error("leaflet is not declared");i=i||{};var z,A,B=this,C=d,D=h,E=i.renderer||C.renderers[0],F=Object.create(null),G=Object.create(null),H=!1,I=i.easing,J=i.duration,K=!1,M=!1,N=!1,O=!1,P=!1,Q={x:C.camera.x,y:C.camera.y,ratio:C.camera.ratio};if(I&&(!sigma.plugins||"undefined"==typeof sigma.plugins.animate))throw new Error("sigma.plugins.animate is not declared");this.isApplicable=function(){for(var a=C.graph.nodes(),b=0,d=a.length;d>b;b++)if(c(a[b]))return!0;return!1},this.isEnabled=function(){return M},this.enable=function(){return y(),o(),q(),Q={x:C.camera.x,y:C.camera.y,ratio:C.camera.ratio},B.bindAll(),H=!!I,B.syncNodes(function(){B.dispatchEvent("enabled")}),H=!1,M=!0,B},this.disable=function(){return x(),p(),r(),H=!!I,A&&A.undo("geo-coordinates").apply(),j(function(){B.dispatchEvent("disabled")}),H=!1,M=!1,B.unbindAll(),B},this.syncNodes=function(b,d){var f,g,h;f="string"==typeof b||"number"==typeof b||Array.isArray(b)?C.graph.nodes(b):C.graph.nodes(),"function"==typeof b&&(d=b),Array.isArray(f)||(f=[f]);for(var i=0,j=f.length;j>i;i++)g=f[i],g.leaflet_x===a&&(g.leaflet_x=g.x),g.leaflet_y===a&&(g.leaflet_y=g.y),c(g)?(e.set(g.id,C.graph.nodes(g.id)),h=B.utils.latLngToSigmaPoint(g),H?(g.x=g["read_cam0:x"]||g.x,g.y=g["read_cam0:y"]||g.y,g.leaflet_x_easing=h.x,g.leaflet_y_easing=h.y):(g.x=h.x,g.y=h.y)):(e["delete"](g.id),A||(g.leaflet_hidden===a&&(g.leaflet_hidden=!!g.hidden),g.hidden=!0));return k(),H?m(f,d):(C.refresh(),d&&d()),B},this.syncMap=function(){if(Q.ratio!==C.camera.ratio)Q.ratio<C.camera.ratio?D.zoomIn():D.zoomOut(),C.camera.ratio=1;else{var a=C.camera.x-Q.x,b=C.camera.y-Q.y;Q.x=C.camera.x,Q.y=C.camera.y,D.panBy([a,b],{animate:!1})}return B},this.fitBounds=function(a){function b(){if(c.edgeIds){Array.isArray(c.edgeIds)||(c.edgeIds=[c.edgeIds]),c.nodeIds=[];for(var a=C.graph.edges(c.edgeIds),e=0,f=a.length;f>e;e++)c.nodeIds.push(a[e].source),c.nodeIds.push(a[e].target)}c.nodeIds&&!Array.isArray(c.nodeIds)&&(c.nodeIds=[c.nodeIds]);var g=c.nodeIds?C.graph.nodes(c.nodeIds):C.graph.nodes();D.fitBounds(B.utils.geoBoundaries(g),{animate:!1}),D.getZoom()===d?(H=!!c.animate,c.onComplete?B.syncNodes(c.onComplete):B.syncNodes(),H=!1):c.onComplete&&c.onComplete(),setTimeout(function(){C.unbind("animate.end",b)},0)}var c=a||{},d=D.getZoom();return K?C.bind("animate.end",b):b(),B},this.zoomIn=function(){D.zoomIn()},this.zoomOut=function(){D.zoomOut()},this.bindDragListener=function(a){return z=z||a,z.bind("drop",n),B},this.unbindDragListener=function(){return z!==a?(z.unbind("drop",n),z=a,B):void 0},this.bindFilter=function(a){return A=a,k(),B},this.unbindFilter=function(){return A=a,B},this.resetDraggedNodesLatLng=function(){for(var b,c=C.graph.nodes(),d=0,e=c.length;e>d;d++)b=c[d],b.lat_init!==a&&b.lng_init!==a&&(b.lat=b.lat_init,b.lng=b.lng_init,b.lat_init=a,b.lng_init=a);return B},this.bindAll=function(){return N?void 0:(N=!0,s(),C.bind("coordinatesUpdated",B.syncMap),D.on("zoomstart",v).on("zoomend",w),C.bind("animate.start",l),C.bind("animate.end",l),B)},this.unbindAll=function(){return N?(N=!1,t(),C.unbind("coordinatesUpdated",B.syncMap),D.off("zoomstart",v).off("zoomend",w),C.unbind("animate.start",l),C.unbind("animate.end",l),B.unbindDragListener(),B.unbindFilter(),B):void 0},this.kill=function(){B.unbindAll(),x(),p(),M=!1,C=a,E=a,D=a,Q=a},this.utils={},this.utils.sigmaPointToLatLng=function(a){var b=D.project(D.getCenter());return D.unproject([a.x+b.x-C.camera.x,a.y+b.y-C.camera.y])},this.utils.latLngToSigmaPoint=function(a){var b=D.project(D.getCenter()),c=D.project(a);return{x:c.x-b.x+C.camera.x,y:c.y-b.y+C.camera.y}},this.utils.geoBoundaries=function(a){for(var b,d=1/0,e=1/0,f=-(1/0),g=-(1/0),h=0,i=a.length;i>h;h++)b=a[h],!b.hidden&&c(b)&&(f=Math.max(b.lat,f),d=Math.min(b.lat,d),g=Math.max(b.lng,g),e=Math.min(b.lng,e));return L.latLngBounds(L.latLng(d,e),L.latLng(f,g))}}if("undefined"==typeof sigma)throw new Error("sigma is not declared");"undefined"==typeof L&&console.warn("Include leaflet to use the leaflet plugin for sigma."),sigma.utils.pkg("sigma.plugins.leaflet");var e=new sigma.utils.map;sigma.classes.graph.attach("addNode","sigma.plugins.leaflet.addNode",function(a){c(a)&&e.set(a.id,this.nodesIndex.get(a.id))}),sigma.classes.graph.attachBefore("dropNode","sigma.plugins.leaflet.dropNode",function(a){e["delete"](a)}),sigma.classes.graph.attachBefore("clear","sigma.plugins.leaflet.clear",function(){e.clear(),e=new sigma.utils.map}),sigma.classes.graph.hasMethod("hasLatLngCoordinates")||sigma.classes.graph.addMethod("hasLatLngCoordinates",function(b){if(b!==a){var d=this.nodesIndex.get(b);if(d)return c(d)}return 0!=e.size});var f={zoomingRatio:.999999999,doubleClickZoomingRatio:.999999999,mouseZoomDuration:0,doubleClickZoomDuration:0,autoRescale:["nodeSize","edgeSize"],zoomOnLocation:!1,mouseInertiaDuration:0,mouseInertiaRatio:1,touchInertiaDuration:0,touchInertiaRatio:1},g=["click","mouseup","mouseover","mouseout","mousemove","focus","blur"],h={};sigma.plugins.leaflet=function(b,c,e){if(!b)throw new Error('Missing argument: "sigInst"');if(!c)throw new Error('Missing argument: "leafletMap"');return h[b.id]||(h[b.id]=new d(b,c,e),b.bind("kill",function(){h[b.id].kill(),h[b.id]=a})),h[b.id]},sigma.plugins.killLeafletPlugin=function(b){if(!b)throw new Error('Missing argument: "sigInst"');h[b.id]instanceof d&&(h[b.id].kill(),h[b.id]=a)}}.call(this),function(){"use strict";function a(a){var b=a.settings("autoRescale");return b?Array.isArray(b)?-1!==b.indexOf("nodePosition"):!0:!1}function b(a,b){var c,d,e=-(1/0),f=1/0,g=1/0,h=-(1/0),i=-(1/0);for(c=0,d=a.length;d>c;c++)e=Math.max(a[c][b+"size"],e),h=Math.max(a[c][b+"x"],h),f=Math.min(a[c][b+"x"],f),i=Math.max(a[c][b+"y"],i),g=Math.min(a[c][b+"y"],g);return e=e||1,{sizeMax:e,minX:f,minY:g,maxX:h,maxY:i}}function c(c,e){function f(b){var c,d,e,f,h,i,j;if(c=.5*(b.minX+b.maxX),d=.5*(b.minY+b.maxY),a(g.s)){var k,l,m,n,o;o=g.s.camera.getRectangle(b.maxX-b.minX,b.maxY-b.minY),f=o.x2-o.x1||1,h=o.height||1,k=sigma.utils.getBoundaries(g.s.graph,g.s.camera.readPrefix),l=g.s.camera.getRectangle(k.maxX-k.minX,k.maxY-k.minY),m=l.x2-l.x1||1,n=l.height||1,i=m-g.settings.padding.left-g.settings.padding.right,j=n-g.settings.padding.top-g.settings.padding.bottom,e=Math.max(f/i,h/j)}else f=b.maxX-b.minX+2*b.sizeMax,h=b.maxY-b.minY+2*b.sizeMax,i=g.s.renderers[0].width-g.settings.padding.left-g.settings.padding.right,j=g.s.renderers[0].height-g.settings.padding.top-g.settings.padding.bottom,e=Math.max(f/i,h/j);return e=Math.max(g.s.settings("zoomMin"),Math.min(g.s.settings("zoomMax"),e)),c+=(g.settings.padding.right-g.settings.padding.left)*e*.5,d+=(g.settings.padding.bottom-g.settings.padding.top)*e*.5,{x:c,y:d,ratio:e}}var g=this;this.s=c,this.settings=sigma.utils.extend(e,d),this.settings.zoomDef=this.settings.zoomDef||this.s.settings("zoomMax"),this.s.bind("kill",function(){sigma.plugins.killLocate(g.s)}),this.nodes=function(d,e){if(arguments.length<1)throw new TypeError("Too few arguments.");if(3===arguments.length&&"object"!=typeof e)throw new TypeError('Invalid argument: "options" is not an object, was '+e);var h,i,j=sigma.utils.extend(e,g.settings.animation.node),k=(g.s.camera.ratio,a(g.s));if("string"==typeof d||"number"==typeof d){if(i=g.s.graph.nodes(d),void 0===i)throw new Error('Invalid argument: the node of id "'+d+'" does not exist.');h={x:i[g.s.camera.readPrefix+"x"],y:i[g.s.camera.readPrefix+"y"],ratio:k?g.s.settings("zoomMin"):g.settings.zoomDef}}else{if(!Array.isArray(d))throw new TypeError('Invalid argument: "v" is not a string, a number, or an array, was '+d);var l=b(d.map(function(a){return g.s.graph.nodes(a)}),g.s.camera.readPrefix);h=f(l)}return g.settings.focusOut&&k?sigma.misc.animation.camera(c.camera,{x:.5*(g.s.camera.x+h.x),y:.5*(g.s.camera.y+h.y),ratio:g.settings.zoomDef},{duration:j.duration,onComplete:function(){sigma.misc.animation.camera(g.s.camera,h,j)}}):sigma.misc.animation.camera(g.s.camera,h,j),g},this.edges=function(d,e){if(arguments.length<1)throw new TypeError("Too few arguments.");if(3===arguments.length&&"object"!=typeof e)throw new TypeError('Invalid argument: "options" is not an object, was '+e);var h,i,j,k=sigma.utils.extend(e,g.settings.animation.edge),l=(g.s.camera.ratio,a(g.s));if("string"==typeof d||"number"==typeof d){if(i=g.s.graph.edges(d),void 0===i)throw new Error('Invalid argument: the edge of id "'+d+'" does not exist.');j=b([g.s.graph.nodes(i.source),g.s.graph.nodes(i.target)],g.s.camera.readPrefix),h=f(j)}else{if(!Array.isArray(d))throw new TypeError('Invalid argument: "v" is not a string or a number, or an array, was '+d);var m,n,o=[];for(m=0,n=d.length;n>m;m++)i=g.s.graph.edges(d[m]),o.push(g.s.graph.nodes(i.source)),o.push(g.s.graph.nodes(i.target));j=b(o,g.s.camera.readPrefix),h=f(j)}return g.settings.focusOut&&l?sigma.misc.animation.camera(c.camera,{x:.5*(g.s.camera.x+h.x),y:.5*(g.s.camera.y+h.y),ratio:g.settings.zoomDef},{duration:k.duration,onComplete:function(){sigma.misc.animation.camera(g.s.camera,h,k)}}):sigma.misc.animation.camera(g.s.camera,h,k),g},this.center=function(a,b){var c=sigma.utils.extend(b,g.settings.animation.center);return g.s.graph.nodes().length?g.nodes(g.s.graph.nodes().map(function(a){return a.id}),c):sigma.misc.animation.camera(g.s.camera,{x:0,y:0,ratio:a},c),g},this.setPadding=function(a){return g.settings.padding=sigma.utils.extend(a,g.settings.padding),g},this.kill=function(){g.settings=null,g.s=null}}if("undefined"==typeof sigma)throw new Error("sigma is not declared");sigma.utils.pkg("sigma.plugins");var d={animation:{node:{duration:300},edge:{duration:300},center:{duration:300}},padding:{top:0,right:0,bottom:0,left:0},focusOut:!1,zoomDef:null},e={};sigma.plugins.locate=function(a,b){return e[a.id]||(e[a.id]=new c(a,b)),e[a.id]},sigma.plugins.killLocate=function(a){e[a.id]instanceof c&&e[a.id].kill(),delete e[a.id]}}.call(window),function(){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.classes.graph.addMethod("neighborhood",function(a){var b,c,d,e,f,g={},h={},i={nodes:[],edges:[]};if(!this.nodes(a))return i;e=this.nodes(a),f={},f.center=!0;for(b in e)f[b]=e[b];g[a]=!0,i.nodes.push(f);for(b in this.allNeighborsIndex[a]){g[b]||(g[b]=!0,i.nodes.push(this.nodesIndex[b]));for(c in this.allNeighborsIndex[a][b])h[c]||(h[c]=!0,i.edges.push(this.edgesIndex[c]))}for(b in g)if(b!==a)for(c in g)if(c!==a&&b!==c&&this.allNeighborsIndex[b][c])for(d in this.allNeighborsIndex[b][c])h[d]||(h[d]=!0,i.edges.push(this.edgesIndex[d]));return i}),sigma.utils.pkg("sigma.plugins"),sigma.plugins.neighborhoods=function(){var a=new sigma.classes.graph;this.neighborhood=function(b){return a.neighborhood(b)},this.load=function(b,c){var d=function(){if(window.XMLHttpRequest)return new XMLHttpRequest;var a,b;if(window.ActiveXObject){a=["Msxml2.XMLHTTP.6.0","Msxml2.XMLHTTP.3.0","Msxml2.XMLHTTP","Microsoft.XMLHTTP"];for(b in a)try{return new ActiveXObject(a[b])}catch(c){}}return null}();if(!d)throw"XMLHttpRequest not supported, cannot load the data.";return d.open("GET",b,!0),d.onreadystatechange=function(){4===d.readyState&&(a.clear().read(JSON.parse(d.responseText)),c&&c())},d.send(),this},this.read=function(b){a.clear().read(b)}}}.call(window),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma.plugins.poweredBy: sigma not in scope.";sigma.utils.pkg("sigma.settings");var b={poweredByHTML:"Linkurious.js",poweredByURL:"https://github.com/Linkurious/linkurious.js",poweredByPingURL:""};sigma.settings=sigma.utils.extend(sigma.settings||{},b)}.call(this),function(a){function b(a){a=a||{};var b,c=a.html||this.settings("poweredByHTML"),d=a.url||this.settings("poweredByURL"),e=a.pingURL||this.settings("poweredByPingURL");if(!document.getElementsByClassName("sigma-poweredby").length){if(b=d?['<a href="'+d+'" target="_blank" style="font-family:\'Helvetica Neue\',Arial,Helvetica,sans-serif; font-size:11px">'+c+"</a>"]:[c],e){var f=new Image;f.src=e}var g=document.createElement("div");g.setAttribute("class","sigma-poweredby"),g.innerHTML=b.join(""),g.style.position="absolute",g.style.padding="0 5px",g.style.bottom="2px",g.style.right="1px",g.style.zIndex="1000",g.style.background="rgba(255, 255, 255, 0.7)",this.container.appendChild(g)}}sigma.renderers.canvas.prototype.poweredBy=b,sigma.renderers.webgl.prototype.poweredBy=b}.call(this),function(a){"use strict";function b(a){h=32===a.which,f.removeEventListener("keydown",b,!1),f.addEventListener("keyup",c,!1)}function c(a){h=!1,f.addEventListener("keydown",b,!1),f.removeEventListener("keyup",c,!1)}function d(c,d,e){function j(){d.dropEdges(),d.nbNodes()===c.graph.nodes().length?d.dropNodes():d.addNodes(),c.refresh({skipIndexation:!0})}function k(){v++}function l(){v=0,u.container.lastChild.addEventListener("mousemove",k)}function m(){setTimeout(function(){v=0;var a=d.nodes()[0];a&&null===g&&(g=a.id)},1),u.container.lastChild.removeEventListener("mousemove",k)}function n(){d.dropEdges(),d.dropNodes(),c.refresh({skipIndexation:!0})}function o(){var a=d.nodes().map(function(a){return a.id}),b=d.edges().map(function(a){return a.id});d.dropEdges(b),d.dropNodes(a),a.length==c.graph.nodes().length?c.graph.clear():(c.graph.dropEdges(b),c.graph.dropNodes(a)),c.refresh()}function p(){d.addNeighbors(),c.refresh({skipIndexation:!0})}function q(){d.dropEdges(),d.setNodesBy(function(a){return 0===c.graph.degree(a.id)}),c.refresh({skipIndexation:!0})}function r(){d.dropEdges(),d.setNodesBy(function(a){return 1===c.graph.adjacentNodes(a.id).length}),c.refresh({skipIndexation:!0})}function s(a){var b=a.data;b.length?(d.dropEdges(),d.addNodes(b.map(function(a){return a.id})),g=d.nodes()[0].id):(d.dropNodes(),g=null)}var t=this,u=e||c.renderers[0],v=0,w=null,x=null;f=f||document.getElementsByTagName("body")[0],u.container.lastChild.addEventListener("mousedown",l),u.container.lastChild.addEventListener("mouseup",m),this.init=function(){d.nbNodes()&&(g=d.nodes()[0].id)},this.clickNodesHandler=function(b){if(!(v>1)){var e=b.data.node[0].id,f=d.nodes().map(function(a){return a.id}),j=f.indexOf(e)>-1?a:e;if(d.dropEdges(),h){var k=j===e?a:e;d.dropNodes(k),c.refresh({skipIndexation:!0})}else{f.length>1&&d.addNodes(e);var l=d.nodes()[0];null!=l?g===l.id?null!=j?(d.dropNodes(),g=null):setTimeout(function(){i||(d.dropNodes(),g=null,c.refresh({skipIndexation:!0}))},c.settings("doubleClickTimeout")):g=l.id:g=j}null!=j&&(d.addNodes(j),c.refresh({skipIndexation:!0}))}},this.doubleClickNodesHandler=function(a){i=!0,setTimeout(function(){i=!1},100+c.settings("doubleClickTimeout"))},this.clickEdgesHandler=function(b){if(!(v>1)){var e=b.data.edge[0].id,f=d.edges().map(function(a){return a.id}),i=f.indexOf(e)>-1?a:e;if(d.dropNodes(),g=null,h){var j=i===e?a:e;d.dropEdges(j),c.refresh({skipIndexation:!0})}else d.dropEdges();null!=i&&(d.addEdges(i),c.refresh({skipIndexation:!0}))}},c.bind("clickNodes",this.clickNodesHandler),c.bind("doubleClickNodes",this.doubleClickNodesHandler),c.bind("clickEdges",this.clickEdgesHandler),f.addEventListener("keydown",b,!1),this.bindKeyboard=function(a){if(!a)throw new Error('Missing argument: "keyboard"');return w=a,w.bind("32+65 18+32+65",j),w.bind("32+85 18+32+85",n),w.bind("32+46 18+32+46",o),w.bind("32+69 18+32+69",p),w.bind("32+73 18+32+73",q),w.bind("32+76 18+32+76",r),this},this.unbindKeyboard=function(){return w&&(w.unbind("32+65 18+32+65",j),w.unbind("32+85 18+32+85",n),w.unbind("32+46 18+32+46",o),w.unbind("32+69 18+32+69",p),w.unbind("32+73 18+32+73",q),w.unbind("32+76 18+32+76",r),w=null),this},this.bindLasso=function(a){if(!a)throw new Error('Missing argument: "lassoInstance"');x=a,x.bind("selectedNodes",s)},this.unbindLasso=function(){x&&x.unbind("selectedNodes",s)},this.clear=function(){c.unbind("clickNodes",t.clickNodesHandler),c.unbind("doubleClickNodes",t.doubleClickNodesHandler),
c.unbind("clickEdges",t.clickEdgesHandler),t.unbindKeyboard(),t.unbindLasso(),u.container.lastChild.removeEventListener("mousedown",l),u.container.lastChild.removeEventListener("mouseup",m),u.container.lastChild.removeEventListener("mousemove",k),u=null,w=null}}if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.plugins");var e={},f=null,g=null,h=!1,i=!1;sigma.plugins.select=function(a,b,c){return e[a.id]||(e[a.id]=new d(a,b),a.bind("kill",function(){sigma.plugins.killSelect(a)})),e[a.id]},sigma.plugins.killSelect=function(a){e[a.id]instanceof d&&(e[a.id].clear(),delete e[a.id]),!e.length&&f&&(f.removeEventListener("keydown",b,!1),f.removeEventListener("keyup",c,!1),f=null)}}.call(this),function(){"use strict";function a(a,c,d){function e(a){a.preventDefault()}function f(){i&&i.parentNode&&(i.parentNode.removeChild(i),i=null)}function g(){clearTimeout(j),clearTimeout(k),j=!1,k=!1,f()}function h(a){clearTimeout(j),clearTimeout(k),j=!1,k=setTimeout(function(){p||f()},a)}var i,j,k,l=this,m=[],n=[],o=[],p=!1,q=!1;if(Array.isArray(d.stage))for(var r=0;r<d.stage.length;r++)m.push(sigma.utils.extend(d.stage[r],b.stage));else m.push(sigma.utils.extend(d.stage,b.stage));if(Array.isArray(d.node))for(var r=0;r<d.node.length;r++)n.push(sigma.utils.extend(d.node[r],b.node));else n.push(sigma.utils.extend(d.node,b.node));if(Array.isArray(d.edge))for(var r=0;r<d.edge.length;r++)o.push(sigma.utils.extend(d.edge[r],b.edge));else o.push(sigma.utils.extend(d.edge,b.edge));if(sigma.classes.dispatcher.extend(this),a.bind("kill",function(){sigma.plugins.killTooltips(a)}),this.open=function(b,d,e,g,h){if(f(),i=document.createElement("div"),d.renderer){var j,k,l,m=Object.create(null);for(l in b)m[l]=b[l];if(j=d.renderer.call(a.graph,m,d.template),k=typeof j,"undefined"===k)return;"string"===k?i.innerHTML=j:i.appendChild(j)}else i.innerHTML=d.template;var n=window.getComputedStyle(c.container).position;if("static"!==n){i.style.position="absolute";var o=c.container.getBoundingClientRect();e=~~(e-o.left),g=~~(g-o.top)}i.className=d.cssClass,"css"!==d.position&&("static"===n&&(i.style.position="absolute"),i.style.left=e+"px",i.style.top=g+"px"),i.addEventListener("mouseenter",function(){p=!0},!1),i.addEventListener("mouseleave",function(){p=!1},!1),setTimeout(function(){if(i){c.container.appendChild(i);var a=document.body.getBoundingClientRect(),b=i.getBoundingClientRect(),f=b.top-a.top,j=a.bottom-b.bottom,k=b.left-a.left,l=a.right-b.right;"top"===d.position?(i.className=d.cssClass+" top",i.style.left=e-b.width/2+"px",i.style.top=g-b.height+"px"):"bottom"===d.position?(i.className=d.cssClass+" bottom",i.style.left=e-b.width/2+"px",i.style.top=g+"px"):"left"===d.position?(i.className=d.cssClass+" left",i.style.left=e-b.width+"px",i.style.top=g-b.height/2+"px"):"right"===d.position&&(i.className=d.cssClass+" right",i.style.left=e+"px",i.style.top=g-b.height/2+"px"),d.autoadjust&&(b=i.getBoundingClientRect(),f=b.top-a.top,j=a.bottom-b.bottom,k=b.left-a.left,l=a.right-b.right,0>j?(i.className=d.cssClass,("top"===d.position||"bottom"===d.position)&&(i.className=d.cssClass+" top"),i.style.top=g-b.height+"px"):0>f&&(i.className=d.cssClass,("top"===d.position||"bottom"===d.position)&&(i.className=d.cssClass+" bottom"),i.style.top=g+"px"),0>l?(i.className=d.cssClass,("left"===d.position||"right"===d.position)&&(i.className=d.cssClass+" left"),i.style.left=e-b.width+"px"):0>k&&(i.className=d.cssClass,("left"===d.position||"right"===d.position)&&(i.className=d.cssClass+" right"),i.style.left=e+"px")),h&&h()}},0)},this.close=function(){return g(),this.dispatchEvent("hidden"),this},this.kill=function(){this.unbindEvents(),clearTimeout(j),clearTimeout(k),i=null,j=null,k=null,q=!1,m=[],n=[],o=[]},this.unbindEvents=function(){for(var b=m.concat(n).concat(o),d=0;d<b.length;d++)a.unbind(b[d].show),a.unbind(b[d].hide),("rightClickNode"===b[d].show||"rightClickEdge"===b[d].show)&&c.container.removeEventListener("contextmenu",e);a.unbind("doubleClickStage"),a.unbind("doubleClickNode"),a.unbind("doubleClickEdge")},this.bindStageEvents=function(c){a.bind(c.show,function(a){if("doubleClickStage"===c.show||!q){var b=a.data.captor.clientX,d=a.data.captor.clientY;clearTimeout(j),j=setTimeout(function(){l.open(null,c,b,d,l.dispatchEvent.bind(l,"shown",a.data))},c.delay)}}),a.bind(c.hide,function(a){var c=i;h(b.stage.hideDelay),c&&l.dispatchEvent("hidden",a.data)})},this.bindNodeEvents=function(c){a.bind(c.show,function(a){if("doubleClickNode"===c.show||!q){var b=a.data.node;if(!b&&a.data.enter&&(b=a.data.enter.nodes[0]),void 0!=b){var d=a.data.captor.clientX,e=a.data.captor.clientY;clearTimeout(j),j=setTimeout(function(){l.open(b,c,d,e,l.dispatchEvent.bind(l,"shown",a.data))},c.delay)}}}),a.bind(c.hide,function(a){if(!a.data.leave||0!=a.data.leave.nodes.length){var c=i;h(b.node.hideDelay),c&&l.dispatchEvent("hidden",a.data)}})},this.bindEdgeEvents=function(c){a.bind(c.show,function(a){if("doubleClickEdge"===c.show||!q){var b=a.data.edge;if(!b&&a.data.enter&&(b=a.data.enter.edges[0]),void 0!=b){var d=a.data.captor.clientX,e=a.data.captor.clientY;clearTimeout(j),j=setTimeout(function(){l.open(b,c,d,e,l.dispatchEvent.bind(l,"shown",a.data))},c.delay)}}}),a.bind(c.hide,function(a){if(!a.data.leave||0!=a.data.leave.edges.length){var c=i;h(b.edge.hideDelay),c&&l.dispatchEvent("hidden",a.data)}})},d.stage){for(var s=!1,r=0;r<m.length;r++){if(null!==m[r].renderer&&"function"!=typeof m[r].renderer)throw new TypeError('"options.stage.renderer" is not a function, was '+m[r].renderer);if(void 0!==m[r].position&&"top"!==m[r].position&&"bottom"!==m[r].position&&"left"!==m[r].position&&"right"!==m[r].position&&"css"!==m[r].position)throw new Error('"options.position" is not "top", "bottom", "left", "right", or "css", was '+m[r].position);"doubleClickStage"===m[r].show&&(s=!0)}for(var r=0;r<m.length;r++)this.bindStageEvents(m[r]);s||a.bind("doubleClickStage",function(a){g(),q=!0,l.dispatchEvent("hidden",a.data),setTimeout(function(){q=!1},b.doubleClickDelay)})}if(d.node){for(var t=!1,u=!1,r=0;r<n.length;r++){if(null!==n[r].renderer&&"function"!=typeof n[r].renderer)throw new TypeError('"options.node.renderer" is not a function, was '+n[r].renderer);if(void 0!==n[r].position&&"top"!==n[r].position&&"bottom"!==n[r].position&&"left"!==n[r].position&&"right"!==n[r].position&&"css"!==n[r].position)throw new Error('"options.position" is not "top", "bottom", "left", "right", or "css", was '+n[r].position);"doubleClickNode"===n[r].show?u=!0:"rightClickNode"===n[r].show&&(t=!0)}for(var r=0;r<n.length;r++)this.bindNodeEvents(n[r]);u||a.bind("doubleClickNode",function(a){g(),q=!0,l.dispatchEvent("hidden",a.data),setTimeout(function(){q=!1},b.doubleClickDelay)})}if(d.edge){for(var v=!1,w=!1,r=0;r<o.length;r++){if(null!==o[r].renderer&&"function"!=typeof o[r].renderer)throw new TypeError('"options.edge.renderer" is not a function, was '+o[r].renderer);if(void 0!==o[r].position&&"top"!==o[r].position&&"bottom"!==o[r].position&&"left"!==o[r].position&&"right"!==o[r].position&&"css"!==o[r].position)throw new Error('"options.position" is not "top", "bottom", "left", "right", or "css", was '+o[r].position);"doubleClickEdge"===o[r].show?w=!0:"rightClickEdge"===o[r].show&&(v=!0)}for(var r=0;r<o.length;r++)this.bindEdgeEvents(o[r]);w||a.bind("doubleClickEdge",function(a){g(),q=!0,l.dispatchEvent("hidden",a.data),setTimeout(function(){q=!1},b.doubleClickDelay)})}(t||v)&&c.container.addEventListener("contextmenu",e)}if("undefined"==typeof sigma)throw new Error("sigma is not declared");sigma.utils.pkg("sigma.plugins");var b={stage:{show:"rightClickStage",hide:"clickStage",cssClass:"sigma-tooltip",position:"top",autoadjust:!1,delay:0,hideDelay:0,template:"",renderer:null},node:{show:"clickNode",hide:"clickStage",cssClass:"sigma-tooltip",position:"top",autoadjust:!1,delay:0,hideDelay:0,template:"",renderer:null},edge:{show:"clickEdge",hide:"clickStage",cssClass:"sigma-tooltip",position:"top",autoadjust:!1,delay:0,hideDelay:0,template:"",renderer:null},doubleClickDelay:800},c={};sigma.plugins.tooltips=function(b,d,e){return c[b.id]||(c[b.id]=new a(b,d,e)),c[b.id]},sigma.plugins.killTooltips=function(b){c[b.id]instanceof a&&c[b.id].kill(),delete c[b.id]}}.call(window),function(){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.plugins");sigma.plugins.relativeSize=function(a,b){for(var c=a.graph.nodes(),d=0;d<c.length;d++){var e=a.graph.degree(c[d].id);c[d].size=b*Math.sqrt(e)}a.refresh()}}.call(window),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.dashed=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=e("edgeHoverLevel");if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}if(f="edge"===e("edgeHoverColor")?a.hover_color||f:a.hover_color||e("defaultEdgeHoverColor")||f,h*=e("edgeHoverSizeRatio"),d.save(),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}d.setLineDash([8,3]),d.strokeStyle=f,d.lineWidth=h,d.beginPath(),d.moveTo(b[g+"x"],b[g+"y"]),d.lineTo(c[g+"x"],c[g+"y"]),d.stroke(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore(),sigma.canvas.edges.labels&&(a.hover=!0,sigma.canvas.edges.labels.def(a,b,c,d,e),a.hover=!1)}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.dotted=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=e("edgeHoverLevel");if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}if(f="edge"===e("edgeHoverColor")?a.hover_color||f:a.hover_color||e("defaultEdgeHoverColor")||f,h*=e("edgeHoverSizeRatio"),d.save(),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}d.setLineDash([2]),d.strokeStyle=f,d.lineWidth=h,d.beginPath(),d.moveTo(b[g+"x"],b[g+"y"]),d.lineTo(c[g+"x"],c[g+"y"]),d.stroke(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore(),sigma.canvas.edges.labels&&(a.hover=!0,sigma.canvas.edges.labels.def(a,b,c,d,e),a.hover=!1)}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.parallel=function(a,b,c,d,e){var f,g,h=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,i=e("prefix")||"",j=a[i+"size"]||1,k=e("edgeColor"),l=e("defaultNodeColor"),m=e("defaultEdgeColor"),n=e("edgeHoverLevel"),o=b[i+"x"],p=b[i+"y"],q=c[i+"x"],r=c[i+"y"],s=sigma.utils.getDistance(o,p,q,r);if(!h)switch(k){case"source":h=b.color||l;break;case"target":h=c.color||l;break;default:h=m}if(h="edge"===e("edgeHoverColor")?a.hover_color||h:a.hover_color||e("defaultEdgeHoverColor")||h,j*=e("edgeHoverSizeRatio"),f=sigma.utils.getCircleIntersection(o,p,j,q,r,s),g=sigma.utils.getCircleIntersection(q,r,j,o,p,s),d.save(),n)switch(d.shadowOffsetX=0,n){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}d.strokeStyle=h,d.lineWidth=j,d.beginPath(),d.moveTo(f.xi,f.yi),d.lineTo(g.xi_prime,g.yi_prime),d.closePath(),d.stroke(),d.beginPath(),d.moveTo(f.xi_prime,f.yi_prime),d.lineTo(g.xi,g.yi),d.closePath(),d.stroke(),n&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore(),sigma.canvas.edges.labels&&(a.hover=!0,sigma.canvas.edges.labels.def(a,b,c,d,e),a.hover=!1)}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.tapered=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),g=e("prefix")||"",j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=e("edgeHoverLevel"),m=b[g+"x"],n=b[g+"y"],o=c[g+"x"],p=c[g+"y"],q=sigma.utils.getDistance(m,n,o,p);if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}f="edge"===e("edgeHoverColor")?a.hover_color||f:a.hover_color||e("defaultEdgeHoverColor")||f,h*=e("edgeHoverSizeRatio");var r=sigma.utils.getCircleIntersection(m,n,h,o,p,q);if(d.save(),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}d.globalAlpha=.65,d.fillStyle=f,d.beginPath(),d.moveTo(o,p),d.lineTo(r.xi,r.yi),d.lineTo(r.xi_prime,r.yi_prime),d.closePath(),d.fill(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore(),sigma.canvas.edges.labels&&(a.hover=!0,sigma.canvas.edges.labels.def(a,b,c,d,e),a.hover=!1)}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.dashed=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=a.active?e("edgeActiveLevel"):a.level;if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}if(d.save(),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}a.active?d.strokeStyle="edge"===e("edgeActiveColor")?f||k:e("defaultEdgeActiveColor"):d.strokeStyle=f,d.setLineDash([8,3]),d.lineWidth=h,d.beginPath(),d.moveTo(b[g+"x"],b[g+"y"]),d.lineTo(c[g+"x"],c[g+"y"]),d.stroke(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.dotted=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=a.active?e("edgeActiveLevel"):a.level;if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}if(d.save(),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}a.active?d.strokeStyle="edge"===e("edgeActiveColor")?f||k:e("defaultEdgeActiveColor"):d.strokeStyle=f,d.setLineDash([2]),d.lineWidth=h,d.beginPath(),d.moveTo(b[g+"x"],b[g+"y"]),d.lineTo(c[g+"x"],c[g+"y"]),d.stroke(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.parallel=function(a,b,c,d,e){var f,g,h=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,i=e("prefix")||"",j=a[i+"size"]||1,k=e("edgeColor"),l=e("defaultNodeColor"),m=e("defaultEdgeColor"),n=a.active?e("edgeActiveLevel"):a.level,o=b[i+"x"],p=b[i+"y"],q=c[i+"x"],r=c[i+"y"],s=sigma.utils.getDistance(o,p,q,r);if(!h)switch(k){case"source":h=b.color||l;break;case"target":h=c.color||l;break;default:h=m}if(f=sigma.utils.getCircleIntersection(o,p,j,q,r,s),g=sigma.utils.getCircleIntersection(q,r,j,o,p,s),d.save(),n)switch(d.shadowOffsetX=0,n){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}a.active?d.strokeStyle="edge"===e("edgeActiveColor")?h||m:e("defaultEdgeActiveColor"):d.strokeStyle=h,d.lineWidth=j,d.beginPath(),d.moveTo(f.xi,f.yi),d.lineTo(g.xi_prime,g.yi_prime),d.closePath(),d.stroke(),d.beginPath(),d.moveTo(f.xi_prime,f.yi_prime),d.lineTo(g.xi,g.yi),d.closePath(),d.stroke(),n&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.tapered=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),g=e("prefix")||"",j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=a.active?e("edgeActiveLevel"):a.level,m=b[g+"x"],n=b[g+"y"],o=c[g+"x"],p=c[g+"y"],q=sigma.utils.getDistance(m,n,o,p);if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}var r=sigma.utils.getCircleIntersection(m,n,h,o,p,q);if(d.save(),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}a.active?d.fillStyle="edge"===e("edgeActiveColor")?f||k:e("defaultEdgeActiveColor"):d.fillStyle=f,d.globalAlpha=.65,d.beginPath(),d.moveTo(o,p),d.lineTo(r.xi,r.yi),d.lineTo(r.xi_prime,r.yi_prime),d.closePath(),d.fill(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore()}}(),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.settings");var b={edgelabelColor:"default",defaultEdgeLabelColor:"#000",defaultEdgeLabelActiveColor:"#000",defaultEdgeLabelSize:10,edgeLabelSize:"fixed",edgeLabelAlignment:"auto",edgeLabelSizePowRatio:1,edgeLabelThreshold:1,defaultEdgeHoverLabelBGColor:"#fff",edgeLabelHoverBGColor:"default",edgeLabelHoverShadow:"default",edgeLabelHoverShadowColor:"#000"};sigma.settings=sigma.utils.extend(sigma.settings||{},b),sigma.settings.drawEdgeLabels=!0}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.canvas.edges.labels"),sigma.canvas.edges.labels.curve=function(a,b,c,d,e){function f(a,b,c,d,f,g,h){var i=Math.round(sigma.utils.canvas.getTextWidth(b,e("approximateLabelWidth"),c,f)+d+1.5+c/3),j=c+4;b.save(),b.beginPath(),b.translate(g,h),b.rotate(a),b.rect(-i/2,-j-d/2,i,j),b.closePath(),b.fill(),b.restore()}if("string"==typeof a.label){var g=e("prefix")||"",h=a[g+"size"]||1;if(!(h<e("edgeLabelThreshold"))||a.hover){if(0===e("edgeLabelSizePowRatio"))throw new Error('Invalid setting: "edgeLabelSizePowRatio" is equal to 0.');var i,j,k=b[g+"size"],l=b[g+"x"],m=b[g+"y"],n=c[g+"x"],o=c[g+"y"],p=n-l,q=o-m,r=n>l?1:-1,s={},t=0,u=.5,v=a.hover?e("hoverFontStyle")||e("fontStyle"):e("fontStyle");if(b.id===c.id?(s=sigma.utils.getSelfLoopControlPoints(l,m,k),j=sigma.utils.getPointOnBezierCurve(u,l,m,n,o,s.x1,s.y1,s.x2,s.y2)):(s=sigma.utils.getQuadraticControlPoint(l,m,n,o,a.cc),j=sigma.utils.getPointOnQuadraticCurve(u,l,m,n,o,s.x,s.y)),i="fixed"===e("edgeLabelSize")?e("defaultEdgeLabelSize"):e("defaultEdgeLabelSize")*h*Math.pow(h,-1/e("edgeLabelSizePowRatio")),d.save(),a.active?d.font=[e("activeFontStyle")||e("fontStyle"),i+"px",e("activeFont")||e("font")].join(" "):d.font=[v,i+"px",e("font")].join(" "),d.textAlign="center",d.textBaseline="alphabetic","auto"===e("edgeLabelAlignment"))if(b.id===c.id)t=Math.atan2(1,1);else{var w=sigma.utils.canvas.getTextWidth(d,e("approximateLabelWidth"),i,a.label),x=sigma.utils.getDistance(b[g+"x"],b[g+"y"],c[g+"x"],c[g+"y"]);x=x-b[g+"size"]-c[g+"size"]-10,x>w&&(t=Math.atan2(q*r,p*r))}a.hover&&(d.fillStyle="edge"===e("edgeLabelHoverBGColor")?a.color||e("defaultEdgeColor"):e("defaultEdgeHoverLabelBGColor"),e("edgeLabelHoverShadow")&&(d.shadowOffsetX=0,d.shadowOffsetY=0,d.shadowBlur=8,d.shadowColor=e("edgeLabelHoverShadowColor")),f(t,d,i,h,a.label,j.x,j.y),e("edgeLabelHoverShadow")&&(d.shadowBlur=0,d.shadowColor="#000")),a.active?d.fillStyle="edge"===e("edgeActiveColor")?a.active_color||e("defaultEdgeActiveColor"):e("defaultEdgeLabelActiveColor"):d.fillStyle="edge"===e("edgeLabelColor")?a.color||e("defaultEdgeColor"):e("defaultEdgeLabelColor"),d.translate(j.x,j.y),d.rotate(t),d.fillText(a.label,0,-h/2-3),d.restore()}}}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.canvas.edges.labels"),sigma.canvas.edges.labels.curvedArrow=function(a,b,c,d,e){sigma.canvas.edges.labels.curve(a,b,c,d,e)}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.canvas.edges.labels"),sigma.canvas.edges.labels.def=function(a,b,c,d,e,f){function g(a,b,c,d,f,g,h){var i=Math.round(sigma.utils.canvas.getTextWidth(b,e("approximateLabelWidth"),c,f)+d+1.5+c/3),j=c+4;b.save(),b.beginPath(),b.translate(g,h),b.rotate(a),b.rect(-i/2,-j-d/2,i,j),b.closePath(),b.fill(),b.restore()}if("string"==typeof a.label&&b!=c){var h=e("prefix")||"",i=a[h+"size"]||1;if(!(i<e("edgeLabelThreshold"))||a.hover){if(0===e("edgeLabelSizePowRatio"))throw new Error('Invalid setting: "edgeLabelSizePowRatio" is equal to 0.');var j,k,l,m,n=0,o=a.hover?e("hoverFontStyle")||e("fontStyle"):e("fontStyle"),p=(b[h+"x"]+c[h+"x"])/2,q=(b[h+"y"]+c[h+"y"])/2;j="fixed"===e("edgeLabelSize")?e("defaultEdgeLabelSize"):e("defaultEdgeLabelSize")*i*Math.pow(i,-1/e("edgeLabelSizePowRatio"));var r=[o,j+"px",e("font")].join(" ");if(a.active&&(r=[e("activeFontStyle")||e("fontStyle"),j+"px",e("activeFont")||e("font")].join(" ")),f&&f.ctx.font!=r?(d.font=r,f.ctx.font=r):d.font=r,d.textAlign="center",d.textBaseline="alphabetic","auto"===e("edgeLabelAlignment")){var s=sigma.utils.canvas.getTextWidth(d,e("approximateLabelWidth"),j,a.label),t=sigma.utils.getDistance(b[h+"x"],b[h+"y"],c[h+"x"],c[h+"y"]);t=t-b[h+"size"]-c[h+"size"]-10,t>s&&(k=c[h+"x"]-b[h+"x"],l=c[h+"y"]-b[h+"y"],m=b[h+"x"]<c[h+"x"]?1:-1,n=Math.atan2(l*m,k*m))}a.hover&&(d.fillStyle="edge"===e("edgeLabelHoverBGColor")?a.color||e("defaultEdgeColor"):e("defaultEdgeHoverLabelBGColor"),e("edgeLabelHoverShadow")&&(d.shadowOffsetX=0,d.shadowOffsetY=0,d.shadowBlur=8,d.shadowColor=e("edgeLabelHoverShadowColor")),g(n,d,j,i,a.label,p,q),e("edgeLabelHoverShadow")&&(d.shadowBlur=0,d.shadowColor="#000")),a.active?d.fillStyle="edge"===e("edgeActiveColor")?a.active_color||e("defaultEdgeActiveColor"):e("defaultEdgeLabelActiveColor"):d.fillStyle="edge"===e("edgeLabelColor")?a.color||e("defaultEdgeColor"):e("defaultEdgeLabelColor"),d.translate(p,q),d.rotate(n),d.fillText(a.label,0,-i/2-3),d.rotate(-n),d.translate(-p,-q)}}}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.svg.edges.labels"),sigma.svg.edges.labels.curve={create:function(a,b){var c=b("prefix")||"",d=a[c+"size"],e=document.createElementNS(b("xmlns"),"text"),f="fixed"===b("labelSize")?b("defaultLabelSize"):b("labelSizeRatio")*d,g="edge"===b("edgeLabelColor")?a.color||b("defaultEdgeColor"):b("defaultEdgeLabelColor");return e.setAttributeNS(null,"data-label-target",a.id),e.setAttributeNS(null,"class",b("classPrefix")+"-label"),e.setAttributeNS(null,"font-size",f),e.setAttributeNS(null,"font-family",b("font")),e.setAttributeNS(null,"fill",g),e.innerHTML=a.label,e.textContent=a.label,e},update:function(a,b,c,d,e){var f,g=e("prefix")||"",h=a[g+"size"],i=b[g+"size"],j=(Math.round((b[g+"x"]+c[g+"x"])/2),Math.round((b[g+"y"]+c[g+"y"])/2),b[g+"x"]),k=b[g+"y"],l=c[g+"x"],m=c[g+"y"],n=l-j,o=m-k,p=0,q=l>j?1:-1,r=0,s=.5,t={};"fixed"===e("labelSize")?e("defaultLabelSize"):e("labelSizeRatio")*h;if((e("forceLabels")||!(h<e("edgeLabelThreshold")))&&"string"==typeof a.label)return b.id===c.id?(t=sigma.utils.getSelfLoopControlPoints(j,k,i),f=sigma.utils.getPointOnBezierCurve(s,j,k,l,m,t.x1,t.y1,t.x2,t.y2)):(t=sigma.utils.getQuadraticControlPoint(j,k,l,m,a.cc),f=sigma.utils.getPointOnQuadraticCurve(s,j,k,l,m,t.x,t.y)),"auto"===e("edgeLabelAlignment")&&(p=-1-h,r=b.id===c.id?45:Math.atan2(o*q,n*q)*(180/Math.PI)),d.setAttributeNS(null,"x",f.x),d.setAttributeNS(null,"y",f.y),d.setAttributeNS(null,"transform","rotate("+r+" "+f.x+" "+f.y+") translate(0 "+p+")"),d.style.display="",this}}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.svg.edges.labels"),sigma.svg.edges.labels.curvedArrow=sigma.svg.edges.labels.curve}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.svg.edges.labels"),sigma.svg.edges.labels.def={create:function(a,b){var c=b("prefix")||"",d=a[c+"size"],e=document.createElementNS(b("xmlns"),"text"),f="fixed"===b("labelSize")?b("defaultLabelSize"):b("labelSizeRatio")*d,g="edge"===b("edgeLabelColor")?a.color||b("defaultEdgeColor"):b("defaultEdgeLabelColor");return e.setAttributeNS(null,"data-label-target",a.id),e.setAttributeNS(null,"class",b("classPrefix")+"-label"),e.setAttributeNS(null,"font-size",f),e.setAttributeNS(null,"font-family",b("font")),e.setAttributeNS(null,"fill",g),e.innerHTML=a.label,e.textContent=a.label,e},update:function(a,b,c,d,e){var f,g,h,i=e("prefix")||"",j=a[i+"size"],k=Math.round((b[i+"x"]+c[i+"x"])/2),l=Math.round((b[i+"y"]+c[i+"y"])/2),m=0,n=0;"fixed"===e("labelSize")?e("defaultLabelSize"):e("labelSizeRatio")*j;if(b.id!==c.id&&(e("forceLabels")||!(j<e("edgeLabelThreshold")))&&"string"==typeof a.label)return"auto"===e("edgeLabelAlignment")&&(f=c[i+"x"]-b[i+"x"],g=c[i+"y"]-b[i+"y"],h=b[i+"x"]<c[i+"x"]?1:-1,n=Math.atan2(g*h,f*h)*(180/Math.PI),m=Math.round(-1-j)),d.setAttributeNS(null,"x",k),d.setAttributeNS(null,"y",l),d.setAttributeNS(null,"transform","rotate("+n+" "+k+" "+l+") translate(0 "+m+")"),d.style.display="",this}}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma.renderers.glyphs: sigma not in scope.";sigma.utils.pkg("sigma.settings");var b={glyphScale:.5,glyphFillColor:"white",glyphTextColor:"black",glyphStrokeColor:"black",glyphLineWidth:2,glyphFont:"Arial",glyphFontStyle:"normal",glyphFontScale:1,glyphTextThreshold:7,glyphStrokeIfText:!1,glyphThreshold:1,drawGlyphs:!0};sigma.settings=sigma.utils.extend(sigma.settings||{},b)}.call(this),function(a){"use strict";function b(a){return a*Math.PI/180}function c(a,b){return"function"==typeof a?a.call(b):a}function d(a){function d(a,b){if(a.draw&&a.x&&a.y&&a.radius>a.threshold){var c=a.x,d=a.y;switch(a.position){case"top-right":c+=a.nodeSize*A,d+=a.nodeSize*B;break;case"top-left":c+=a.nodeSize*y,d+=a.nodeSize*z;break;case"bottom-left":c+=a.nodeSize*w,d+=a.nodeSize*x;break;case"bottom-right":c+=a.nodeSize*u,d+=a.nodeSize*v}if(b.fillStyle=a.fillColor,a.strokeColor!==b.strokeStyle&&(b.strokeStyle=a.strokeColor),b.beginPath(),b.arc(c,d,a.radius,2*Math.PI,!1),b.closePath(),(!a.strokeIfText||a.radius>a.textThreshold)&&b.stroke(),b.fill(),a.radius>a.textThreshold){var e=Math.round(a.fontScale*a.radius),f=a.fontStyle+" "+e+"px "+a.font;f!==b.font&&(b.font=f),b.fillStyle=a.textColor,b.fillText(a.content,c,d)}}}a=a||{};var e=a.font||this.settings("glyphFont"),f=a.fontStyle||this.settings("glyphFontStyle"),g=a.fontScale||this.settings("glyphFontScale"),h=a.strokeColor||this.settings("glyphStrokeColor"),i=a.lineWidth||this.settings("glyphLineWidth"),j=a.fillColor||this.settings("glyphFillColor"),k=a.scale||this.settings("glyphScale"),l=a.textColor||this.settings("glyphTextColor"),m=a.textThreshold||this.settings("glyphTextThreshold"),n="strokeIfText"in a?a.strokeIfText:this.settings("glyphStrokeIfText"),o=a.threshold||this.settings("glyphThreshold"),p="draw"in a?a.draw:this.settings("drawGlyphs");if(p){this.domElements.glyphs||(this.initDOM("canvas","glyphs"),this.domElements.glyphs.width=this.container.offsetWidth,this.domElements.glyphs.height=this.container.offsetHeight,this.container.insertBefore(this.domElements.glyphs,this.domElements.mouse)),this.drawingContext=this.domElements.glyphs.getContext("2d"),this.drawingContext.textAlign="center",this.drawingContext.textBaseline="middle",this.drawingContext.lineWidth=i,this.drawingContext.strokeStyle=h;var q,r=this,s=this.nodesOnScreen||[],t=this.options.prefix||"",u=Math.cos(b(45)),v=Math.sin(b(45)),w=Math.cos(b(135)),x=Math.sin(b(135)),y=Math.cos(b(225)),z=Math.sin(b(225)),A=Math.cos(b(315)),B=Math.sin(b(315));s.forEach(function(a){a.glyphs&&a.glyphs.forEach(function(b){q=!a.hidden,q&&"draw"in b&&(q=b.draw),d({x:a[t+"x"],y:a[t+"y"],nodeSize:a[t+"size"]||0,position:b.position,radius:b.size||a[t+"size"]*k,content:(b.content||"").toString()||"",lineWidth:b.lineWidth||i,fillColor:c(b.fillColor,a)||j,textColor:c(b.textColor,a)||l,strokeColor:c(b.strokeColor,a)||h,strokeIfText:"strokeIfText"in b?b.strokeIfText:n,fontStyle:b.fontStyle||f,font:b.font||e,fontScale:b.fontScale||g,threshold:b.threshold||o,textThreshold:b.textThreshold||m,draw:q},r.drawingContext)})})}}if("undefined"==typeof sigma)throw"sigma is not declared";sigma.renderers.canvas.prototype.glyphs=d}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw new Error("sigma not in scope.");sigma.utils.pkg("sigma.settings");var b={nodeHaloColor:"#fff",nodeHaloStroke:!1,nodeHaloStrokeColor:"#000",nodeHaloStrokeWidth:.5,nodeHaloSize:50,nodeHaloClustering:!1,nodeHaloClusteringMaxRadius:1e3,edgeHaloColor:"#fff",edgeHaloSize:10,drawHalo:!0};sigma.settings=sigma.utils.extend(sigma.settings||{},b)}.call(this),function(a){"use strict";function b(){for(var a=[],b=-1,c=arguments.length;++b<c;){var d=arguments[b];a.push(d)}var e=a[0],f=-1,g=e?e.length:0,h=[];a:for(;++f<g;)if(d=e[f],h.indexOf(d)<0){for(var b=c;--b;)if(a[b].indexOf(d)<0)continue a;h.push(d)}return h}function c(a,b,c){for(var d=0;d<a.length;d++)null!=a[d]&&(b.beginPath(),b.arc(a[d].x,a[d].y,a[d].radius,0,2*Math.PI,!0),b.closePath(),c?b.stroke():b.fill())}function d(a,b,c){if(c=c||Number.POSITIVE_INFINITY,a.length>1)for(var d,e,f,g=!0;g;){g=!1;for(var h=0;h<a.length;h++)if(null!==a[h])for(var i=h+1;i<a.length;i++)if(null!==a[i]&&(e=sigma.utils.getDistance(a[h].x,a[h].y,a[i].x,a[i].y),c>e&&e<a[h].radius+a[i].radius)){g=!0,f=[{x:a[h].x,y:a[h].y,radius:a[h].radius},{x:a[i].x,y:a[i].y,radius:a[i].radius}],a[h].points&&(f=f.concat(a[h].points)),a[i].points&&(f=f.concat(a[i].points)),d={x:0,y:0};for(var j=0;j<f.length;j++)d.x+=f[j].x,d.y+=f[j].y;d.x/=f.length,d.y/=f.length,d.radius=Math.max.apply(null,f.map(function(a){return b+sigma.utils.getDistance(d.x,d.y,a.x,a.y)})),a.push({x:d.x,y:d.y,radius:d.radius,
points:f}),a[h]=a[i]=null;break}}return a}function e(a){a=a||{},this.domElements.background||(this.initDOM("canvas","background"),this.domElements.background.width=this.container.offsetWidth,this.domElements.background.height=this.container.offsetHeight,this.container.insertBefore(this.domElements.background,this.container.firstChild));var e,f,g,h,i,j,k,l,m,n,o=this,p=o.contexts.background,q=this instanceof sigma.renderers.webgl,r=o.options.prefix,s=q?r.substr(5):r,t=a.nodeHaloClustering||o.settings("nodeHaloClustering"),u=a.nodeHaloClusteringMaxRadius||o.settings("nodeHaloClusteringMaxRadius"),v=a.nodeHaloColor||o.settings("nodeHaloColor"),w=a.nodeHaloSize||o.settings("nodeHaloSize"),x=a.nodeHaloStroke||o.settings("nodeHaloStroke"),y=a.nodeHaloStrokeColor||o.settings("nodeHaloStrokeColor"),z=a.nodeHaloStrokeWidth||o.settings("nodeHaloStrokeWidth"),A=o.settings("nodeBorderSize")||0,B=o.settings("nodeOuterBorderSize")||0,C=a.edgeHaloColor||o.settings("edgeHaloColor"),D=a.edgeHaloSize||o.settings("edgeHaloSize"),E=a.drawHalo||o.settings("drawHalo"),F=a.nodes||[],G=a.edges||[];E&&(F=q?F:b(a.nodes,o.nodesOnScreen),G=q?G:b(a.edges,o.edgesOnScreen),p.clearRect(0,0,p.canvas.width,p.canvas.height),p.save(),p.strokeStyle=C,G.forEach(function(a){e=o.graph.nodes(a.source),f=o.graph.nodes(a.target),p.lineWidth=(a[r+"size"]||1)+D,p.beginPath(),g={},h=e[s+"size"],i=e[s+"x"],j=e[s+"y"],k=f[s+"x"],l=f[s+"y"],p.moveTo(i,j),"curve"===a.type||"curvedArrow"===a.type?a.source===a.target?(g=sigma.utils.getSelfLoopControlPoints(i,j,h),p.bezierCurveTo(g.x1,g.y1,g.x2,g.y2,k,l)):(g=sigma.utils.getQuadraticControlPoint(i,j,k,l,a.cc),p.quadraticCurveTo(g.x,g.y,k,l)):(p.moveTo(i,j),p.lineTo(k,l)),p.stroke(),p.closePath()}),p.fillStyle=v,x&&(p.lineWidth=z,p.strokeStyle=y),m=A+B+w,n=F.filter(function(a){return!a.hidden}).map(function(a){return{x:a[s+"x"],y:a[s+"y"],radius:a[s+"size"]+m}}),t&&(n=d(n,m,u)),x&&c(n,p,!0),c(n,p),p.restore())}if("undefined"==typeof sigma)throw new Error("sigma not in scope.");sigma.renderers.canvas.prototype.halo=e,sigma.renderers.webgl.prototype.halo=e}.call(this),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.arrow=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=e("edgeColor"),i=e("defaultNodeColor"),j=e("defaultEdgeColor"),k=e("edgeHoverLevel"),l=a[g+"size"]||1,m=c[g+"size"],n=b[g+"x"],o=b[g+"y"],p=c[g+"x"],q=c[g+"y"];l=a.hover?e("edgeHoverSizeRatio")*l:l;var r=Math.max(2.5*l,e("minArrowSize")),s=Math.sqrt(Math.pow(p-n,2)+Math.pow(q-o,2)),t=n+(p-n)*(s-r-m)/s,u=o+(q-o)*(s-r-m)/s,v=(p-n)*r/s,w=(q-o)*r/s;if(k)switch(d.shadowOffsetX=0,k){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}if(!f)switch(h){case"source":f=b.color||i;break;case"target":f=c.color||i;break;default:f=j}f="edge"===e("edgeHoverColor")?a.hover_color||f:a.hover_color||e("defaultEdgeHoverColor")||f,d.strokeStyle=f,d.lineWidth=l,d.beginPath(),d.moveTo(n,o),d.lineTo(t,u),d.stroke(),d.fillStyle=f,d.beginPath(),d.moveTo(t+v,u+w),d.lineTo(t+.6*w,u-.6*v),d.lineTo(t-.6*w,u+.6*v),d.lineTo(t+v,u+w),d.closePath(),d.fill(),k&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),sigma.canvas.edges.labels&&sigma.canvas.edges.labels.arrow&&(a.hover=!0,sigma.canvas.edges.labels.arrow(a,b,c,d,e),a.hover=!1)}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.curve=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=e("edgeHoverSizeRatio")*(a[g+"size"]||1),i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=e("edgeHoverLevel"),m={},n=b[g+"size"],o=b[g+"x"],p=b[g+"y"],q=c[g+"x"],r=c[g+"y"];if(m=b.id===c.id?sigma.utils.getSelfLoopControlPoints(o,p,n):sigma.utils.getQuadraticControlPoint(o,p,q,r,a.cc),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}f="edge"===e("edgeHoverColor")?a.hover_color||f:a.hover_color||e("defaultEdgeHoverColor")||f,d.strokeStyle=f,d.lineWidth=h,d.beginPath(),d.moveTo(o,p),b.id===c.id?d.bezierCurveTo(m.x1,m.y1,m.x2,m.y2,q,r):d.quadraticCurveTo(m.x,m.y,q,r),d.stroke(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),sigma.canvas.edges.labels&&sigma.canvas.edges.labels.curve&&(a.hover=!0,sigma.canvas.edges.labels.curve(a,b,c,d,e),a.hover=!1)}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.curvedArrow=function(a,b,c,d,e){var f,g,h,i,j,k,l=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,m=e("prefix")||"",n=e("edgeColor"),o=e("defaultNodeColor"),p=e("defaultEdgeColor"),q=e("edgeHoverLevel"),r={},s=e("edgeHoverSizeRatio")*(a[m+"size"]||1),t=c[m+"size"],u=b[m+"x"],v=b[m+"y"],w=c[m+"x"],x=c[m+"y"];if(r=b.id===c.id?sigma.utils.getSelfLoopControlPoints(u,v,t):sigma.utils.getQuadraticControlPoint(u,v,w,x,a.cc),b.id===c.id?(f=Math.sqrt(Math.pow(w-r.x1,2)+Math.pow(x-r.y1,2)),g=2.5*s,h=r.x1+(w-r.x1)*(f-g-t)/f,i=r.y1+(x-r.y1)*(f-g-t)/f,j=(w-r.x1)*g/f,k=(x-r.y1)*g/f):(f=Math.sqrt(Math.pow(w-r.x,2)+Math.pow(x-r.y,2)),g=Math.max(2.5*s,e("minArrowSize")),h=r.x+(w-r.x)*(f-g-t)/f,i=r.y+(x-r.y)*(f-g-t)/f,j=(w-r.x)*g/f,k=(x-r.y)*g/f),q)switch(d.shadowOffsetX=0,q){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}if(!l)switch(n){case"source":l=b.color||o;break;case"target":l=c.color||o;break;default:l=p}if(l="edge"===e("edgeHoverColor")?a.hover_color||l:a.hover_color||e("defaultEdgeHoverColor")||l,d.strokeStyle=l,d.lineWidth=s,d.beginPath(),d.moveTo(u,v),b.id===c.id?d.bezierCurveTo(r.x2,r.y2,r.x1,r.y1,h,i):d.quadraticCurveTo(r.x,r.y,h,i),d.stroke(),d.fillStyle=l,d.beginPath(),d.moveTo(h+j,i+k),d.lineTo(h+.6*k,i-.6*j),d.lineTo(h-.6*k,i+.6*j),d.lineTo(h+j,i+k),d.closePath(),d.fill(),q&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),sigma.canvas.edges.labels&&sigma.canvas.edges.labels.curvedArrow){a.hover=!0;var y=sigma.canvas.edges.labels.curvedArrow;(y.render||y)(a,b,c,d,e),a.hover=!1}}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.dashed=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=e("edgeHoverLevel");if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}if(f="edge"===e("edgeHoverColor")?a.hover_color||f:a.hover_color||e("defaultEdgeHoverColor")||f,h*=e("edgeHoverSizeRatio"),d.save(),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}d.setLineDash([8,3]),d.strokeStyle=f,d.lineWidth=h,d.beginPath(),d.moveTo(b[g+"x"],b[g+"y"]),d.lineTo(c[g+"x"],c[g+"y"]),d.stroke(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore(),sigma.canvas.edges.labels&&sigma.canvas.edges.labels.def&&(a.hover=!0,sigma.canvas.edges.labels.def(a,b,c,d,e),a.hover=!1)}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.def=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=e("edgeHoverLevel");if(l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}f="edge"===e("edgeHoverColor")?a.hover_color||f:a.hover_color||e("defaultEdgeHoverColor")||f,h*=e("edgeHoverSizeRatio"),d.strokeStyle=f,d.lineWidth=h,d.beginPath(),d.moveTo(b[g+"x"],b[g+"y"]),d.lineTo(c[g+"x"],c[g+"y"]),d.stroke(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),sigma.canvas.edges.labels&&sigma.canvas.edges.labels.def&&(a.hover=!0,sigma.canvas.edges.labels.def(a,b,c,d,e),a.hover=!1)}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.dotted=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=e("edgeHoverLevel");if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}if(f="edge"===e("edgeHoverColor")?a.hover_color||f:a.hover_color||e("defaultEdgeHoverColor")||f,h*=e("edgeHoverSizeRatio"),d.save(),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}if(d.setLineDash([2]),d.strokeStyle=f,d.lineWidth=h,d.beginPath(),d.moveTo(b[g+"x"],b[g+"y"]),d.lineTo(c[g+"x"],c[g+"y"]),d.stroke(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore(),sigma.canvas.edges.labels&&sigma.canvas.edges.labels.def){a.hover=!0;var m=sigma.canvas.edges.labels.def;(m.render||m)(a,b,c,d,e),a.hover=!1}}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.parallel=function(a,b,c,d,e){var f,g,h=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,i=e("prefix")||"",j=a[i+"size"]||1,k=e("edgeColor"),l=e("defaultNodeColor"),m=e("defaultEdgeColor"),n=e("edgeHoverLevel"),o=b[i+"x"],p=b[i+"y"],q=c[i+"x"],r=c[i+"y"],s=sigma.utils.getDistance(o,p,q,r);if(!h)switch(k){case"source":h=b.color||l;break;case"target":h=c.color||l;break;default:h=m}if(h="edge"===e("edgeHoverColor")?a.hover_color||h:a.hover_color||e("defaultEdgeHoverColor")||h,j*=e("edgeHoverSizeRatio"),f=sigma.utils.getCircleIntersection(o,p,j,q,r,s),g=sigma.utils.getCircleIntersection(q,r,j,o,p,s),d.save(),n)switch(d.shadowOffsetX=0,n){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}d.strokeStyle=h,d.lineWidth=j,d.beginPath(),d.moveTo(f.xi,f.yi),d.lineTo(g.xi_prime,g.yi_prime),d.closePath(),d.stroke(),d.beginPath(),d.moveTo(f.xi_prime,f.yi_prime),d.lineTo(g.xi,g.yi),d.closePath(),d.stroke(),n&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore(),sigma.canvas.edges.labels&&sigma.canvas.edges.labels.def&&(a.hover=!0,sigma.canvas.edges.labels.def(a,b,c,d,e),a.hover=!1)}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.tapered=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),g=e("prefix")||"",j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=e("edgeHoverLevel"),m=b[g+"x"],n=b[g+"y"],o=c[g+"x"],p=c[g+"y"],q=sigma.utils.getDistance(m,n,o,p);if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}f="edge"===e("edgeHoverColor")?a.hover_color||f:a.hover_color||e("defaultEdgeHoverColor")||f,h*=e("edgeHoverSizeRatio");var r=sigma.utils.getCircleIntersection(m,n,h,o,p,q);if(d.save(),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}d.globalAlpha=.65,d.fillStyle=f,d.beginPath(),d.moveTo(o,p),d.lineTo(r.xi,r.yi),d.lineTo(r.xi_prime,r.yi_prime),d.closePath(),d.fill(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore(),sigma.canvas.edges.labels&&sigma.canvas.edges.labels.def&&(a.hover=!0,sigma.canvas.edges.labels.def(a,b,c,d,e),a.hover=!1)}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.arrow=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=e("edgeColor"),i=e("defaultNodeColor"),j=e("defaultEdgeColor"),k=a.active?e("edgeActiveLevel"):a.level,l=a[g+"size"]||1,m=c[g+"size"],n=b[g+"x"],o=b[g+"y"],p=c[g+"x"],q=c[g+"y"],r=Math.max(2.5*l,e("minArrowSize")),s=Math.sqrt(Math.pow(p-n,2)+Math.pow(q-o,2)),t=n+(p-n)*(s-r-m)/s,u=o+(q-o)*(s-r-m)/s,v=(p-n)*r/s,w=(q-o)*r/s;if(k)switch(d.shadowOffsetX=0,k){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}if(!f)switch(h){case"source":f=b.color||i;break;case"target":f=c.color||i;break;default:f=j}a.active?d.strokeStyle="edge"===e("edgeActiveColor")?f||j:e("defaultEdgeActiveColor"):d.strokeStyle=f,d.lineWidth=l,d.beginPath(),d.moveTo(n,o),d.lineTo(t,u),d.stroke(),d.fillStyle=f,d.beginPath(),d.moveTo(t+v,u+w),d.lineTo(t+.6*w,u-.6*v),d.lineTo(t-.6*w,u+.6*v),d.lineTo(t+v,u+w),d.closePath(),d.fill(),k&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000")}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges");var a=function(a,b,c,d){if(d){var e=a*b/c;return{y:e?e:Number.POSITIVE_INFINITY}}var f=a/(b/2),e=a-f*c;return{y:e?1/e:b}};sigma.canvas.edges.autoCurve=function(b){var c,d=b.settings("autoCurveRatio"),e=b.settings("autoCurveSortByDirection"),f=b.settings("defaultEdgeType"),g=b.graph.edges(),h={key:function(a){var b=a.source+","+a.target;return this[b]?b:!e&&(b=a.target+","+a.source,this[b])?b:(e&&this[a.target+","+a.source]?this[b]={i:1,n:1}:this[b]={i:0,n:0},b)},inc:function(a){this[this.key(a)].n++}};g.forEach(function(a){h.inc(a)}),g.forEach(function(b){c=h.key(b),h[c].n>1||h[c].i>0?(b.cc||("arrow"===b.type||"tapered"===b.type||"arrow"===f||"tapered"===f?(b.cc_prev_type||(b.cc_prev_type=b.type),b.type="curvedArrow"):(b.cc_prev_type||(b.cc_prev_type=b.type),b.type="curve")),b.cc=a(d,h[c].n,h[c].i++,e)):b.cc&&(b.type=b.cc_prev_type,b.cc_prev_type=void 0,b.cc=void 0)})}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.curve=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=a.active?e("edgeActiveLevel"):a.level,m={},n=b[g+"size"],o=b[g+"x"],p=b[g+"y"],q=c[g+"x"],r=c[g+"y"];if(m=b.id===c.id?sigma.utils.getSelfLoopControlPoints(o,p,n):sigma.utils.getQuadraticControlPoint(o,p,q,r,a.cc),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}a.active?d.strokeStyle="edge"===e("edgeActiveColor")?f||k:e("defaultEdgeActiveColor"):d.strokeStyle=f,d.lineWidth=h,d.beginPath(),d.moveTo(o,p),b.id===c.id?d.bezierCurveTo(m.x1,m.y1,m.x2,m.y2,q,r):d.quadraticCurveTo(m.x,m.y,q,r),d.stroke(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000")}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.curvedArrow=function(a,b,c,d,e){var f,g,h,i,j,k,l=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,m=e("prefix")||"",n=e("edgeColor"),o=e("defaultNodeColor"),p=e("defaultEdgeColor"),q=a.active?e("edgeActiveLevel"):a.level,r={},s=a[m+"size"]||1,t=c[m+"size"],u=b[m+"x"],v=b[m+"y"],w=c[m+"x"],x=c[m+"y"];if(r=b.id===c.id?sigma.utils.getSelfLoopControlPoints(u,v,t):sigma.utils.getQuadraticControlPoint(u,v,w,x,a.cc),b.id===c.id?(f=Math.sqrt(Math.pow(w-r.x1,2)+Math.pow(x-r.y1,2)),g=2.5*s,h=r.x1+(w-r.x1)*(f-g-t)/f,i=r.y1+(x-r.y1)*(f-g-t)/f,j=(w-r.x1)*g/f,k=(x-r.y1)*g/f):(f=Math.sqrt(Math.pow(w-r.x,2)+Math.pow(x-r.y,2)),g=Math.max(2.5*s,e("minArrowSize")),h=r.x+(w-r.x)*(f-g-t)/f,i=r.y+(x-r.y)*(f-g-t)/f,j=(w-r.x)*g/f,k=(x-r.y)*g/f),q)switch(d.shadowOffsetX=0,q){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}if(!l)switch(n){case"source":l=b.color||o;break;case"target":l=c.color||o;break;default:l=p}a.active?d.strokeStyle="edge"===e("edgeActiveColor")?l||p:e("defaultEdgeActiveColor"):d.strokeStyle=l,d.lineWidth=s,d.beginPath(),d.moveTo(u,v),b.id===c.id?d.bezierCurveTo(r.x2,r.y2,r.x1,r.y1,h,i):d.quadraticCurveTo(r.x,r.y,h,i),d.stroke(),d.fillStyle=l,d.beginPath(),d.moveTo(h+j,i+k),d.lineTo(h+.6*k,i-.6*j),d.lineTo(h-.6*k,i+.6*j),d.lineTo(h+j,i+k),d.closePath(),d.fill(),q&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000")}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.dashed=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=a.active?e("edgeActiveLevel"):a.level;if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}if(d.save(),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}a.active?d.strokeStyle="edge"===e("edgeActiveColor")?f||k:e("defaultEdgeActiveColor"):d.strokeStyle=f,d.setLineDash([8,3]),d.lineWidth=h,d.beginPath(),d.moveTo(b[g+"x"],b[g+"y"]),d.lineTo(c[g+"x"],c[g+"y"]),d.stroke(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.def=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=a.active?e("edgeActiveLevel"):a.level;if(l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}a.active?d.strokeStyle="edge"===e("edgeActiveColor")?f||k:e("defaultEdgeActiveColor"):d.strokeStyle=f,d.lineWidth=h,d.beginPath(),d.moveTo(b[g+"x"],b[g+"y"]),d.lineTo(c[g+"x"],c[g+"y"]),d.stroke(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000")}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.dotted=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=a.active?e("edgeActiveLevel"):a.level;if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}if(d.save(),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}a.active?d.strokeStyle="edge"===e("edgeActiveColor")?f||k:e("defaultEdgeActiveColor"):d.strokeStyle=f,d.setLineDash([2]),d.lineWidth=h,d.beginPath(),d.moveTo(b[g+"x"],b[g+"y"]),d.lineTo(c[g+"x"],c[g+"y"]),d.stroke(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.parallel=function(a,b,c,d,e){var f,g,h=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,i=e("prefix")||"",j=a[i+"size"]||1,k=e("edgeColor"),l=e("defaultNodeColor"),m=e("defaultEdgeColor"),n=a.active?e("edgeActiveLevel"):a.level,o=b[i+"x"],p=b[i+"y"],q=c[i+"x"],r=c[i+"y"],s=sigma.utils.getDistance(o,p,q,r);if(!h)switch(k){case"source":h=b.color||l;break;case"target":h=c.color||l;break;default:h=m}if(f=sigma.utils.getCircleIntersection(o,p,j,q,r,s),g=sigma.utils.getCircleIntersection(q,r,j,o,p,s),d.save(),n)switch(d.shadowOffsetX=0,n){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}a.active?d.strokeStyle="edge"===e("edgeActiveColor")?h||m:e("defaultEdgeActiveColor"):d.strokeStyle=h,d.lineWidth=j,d.beginPath(),d.moveTo(f.xi,f.yi),d.lineTo(g.xi_prime,g.yi_prime),d.closePath(),d.stroke(),d.beginPath(),d.moveTo(f.xi_prime,f.yi_prime),d.lineTo(g.xi,g.yi),d.closePath(),d.stroke(),n&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.tapered=function(a,b,c,d,e){var f=a.active?a.active_color||e("defaultEdgeActiveColor"):a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),g=e("prefix")||"",j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l=a.active?e("edgeActiveLevel"):a.level,m=b[g+"x"],n=b[g+"y"],o=c[g+"x"],p=c[g+"y"],q=sigma.utils.getDistance(m,n,o,p);if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}var r=sigma.utils.getCircleIntersection(m,n,h,o,p,q);if(d.save(),l)switch(d.shadowOffsetX=0,l){case 1:d.shadowOffsetY=1.5,d.shadowBlur=4,d.shadowColor="rgba(0,0,0,0.36)";break;case 2:d.shadowOffsetY=3,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.39)";break;case 3:d.shadowOffsetY=6,d.shadowBlur=12,d.shadowColor="rgba(0,0,0,0.42)";break;case 4:d.shadowOffsetY=10,d.shadowBlur=20,d.shadowColor="rgba(0,0,0,0.47)";break;case 5:d.shadowOffsetY=15,d.shadowBlur=24,d.shadowColor="rgba(0,0,0,0.52)"}a.active?d.fillStyle="edge"===e("edgeActiveColor")?f||k:e("defaultEdgeActiveColor"):d.fillStyle=f,d.globalAlpha=.65,d.beginPath(),d.moveTo(o,p),d.lineTo(r.xi,r.yi),d.lineTo(r.xi_prime,r.yi_prime),d.closePath(),d.fill(),l&&(d.shadowOffsetY=0,d.shadowBlur=0,d.shadowColor="#000000"),d.restore()}}(),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.canvas.extremities"),sigma.canvas.extremities.def=function(a,b,c,d,e){(sigma.canvas.hovers[b.type]||sigma.canvas.hovers.def)(b,d,e),(sigma.canvas.hovers[c.type]||sigma.canvas.hovers.def)(c,d,e)}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.canvas.hovers"),sigma.canvas.hovers.def=function(a,b,c){function d(b){b.font=(h?h+" ":"")+o+"px "+(c("hoverFont")||c("font")),b.beginPath(),b.fillStyle="node"===c("labelHoverBGColor")?a.color||k:c("defaultHoverLabelBGColor"),a.label&&c("labelHoverShadow")&&(b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=8,b.shadowColor=c("labelHoverShadowColor"))}function e(a,b,d,e,f,g){var h=g>1&&f.length>1?.6*g*d:sigma.utils.canvas.getTextWidth(b,c("approximateLabelWidth"),d,f[0]),k=Math.round(e[i+"x"]),n=Math.round(e[i+"y"]),o=Math.round(h+4),p=p=(d+1)*f.length+4,q=Math.round(j+.25*d);if(e.label&&"string"==typeof e.label)switch(a){case"constrained":case"center":n=Math.round(e[i+"y"]-.5*d-2),b.rect(k-.5*o,n,o,p);break;case"left":k=Math.round(e[i+"x"]+.5*d+2),n=Math.round(e[i+"y"]-.5*d-2),o+=.5*j+.5*d,b.moveTo(k,n+q),b.arcTo(k,n,k-q,n,q),b.lineTo(k-o-l-m-q,n),b.lineTo(k-o-l-m-q,n+p),b.lineTo(k-q,n+p),b.arcTo(k,n+p,k,n+p-q,q),b.lineTo(k,n+q);break;case"top":b.rect(k-.5*o,n-q-p,o,p);break;case"bottom":b.rect(k-.5*o,n+q,o,p);break;case"inside":if(2*q>=h)break;case"right":default:k=Math.round(e[i+"x"]-.5*d-2),n=Math.round(e[i+"y"]-.5*d-2),o+=.5*j+.5*d,b.moveTo(k,n+q),b.arcTo(k,n,k+q,n,q),b.lineTo(k+o+l+m+q,n),b.lineTo(k+o+l+m+q,n+p),b.lineTo(k+q,n+p),b.arcTo(k,n+p,k,n+p-q,q),b.lineTo(k,n+q)}b.closePath(),b.fill(),b.shadowOffsetY=0,b.shadowBlur=0}function f(a,b){if(null==a)return[];if(1>=b)return[a];for(var c=a.split(" "),d=[],e=0,f=-1,h=[],i=!0,j=0;j<c.length;++j)if(i){if(c[j].length>b){for(var k=g(c[j],b),l=0;l<k.length;++l)d.push([k[l]]),++f;e=k[k.length-1].length}else d.push([c[j]]),++f,e=c[j].length+1;i=!1}else e+c[j].length<=b?(d[f].push(c[j]),e+=c[j].length+1):(i=!0,--j);for(j=0;j<d.length;++j)h.push(d[j].join(" "));return h}function g(a,b){for(var c=[],d=0;d<a.length;d+=b-1)c.push(a.substr(d,b-1)+"-");var e=c[c.length-1].length;return c[c.length-1]=c[c.length-1].substr(0,e-1)+" ",c}var h=c("hoverFontStyle")||c("fontStyle"),i=c("prefix")||"",j=a[i+"size"]||1,k=c("defaultNodeColor"),l=a.active?a.border_size||c("nodeActiveBorderSize")||c("nodeBorderSize"):a.border_size||c("nodeHoverBorderSize")||c("nodeBorderSize"),m=a.active?c("nodeActiveOuterBorderSize")||c("nodeOuterBorderSize"):c("nodeOuterBorderSize"),n=c("labelAlignment"),o="fixed"===c("labelSize")?c("defaultLabelSize"):c("labelSizeRatio")*j,p="node"===c("nodeHoverColor")?a.color||k:c("defaultNodeHoverColor"),q="default"===c("nodeHoverBorderColor")?c("defaultNodeHoverBorderColor")||c("defaultNodeBorderColor"):a.border_color||k,r=c("maxNodeLabelLineLength")||0,s=c("nodeHoverLevel"),t=f(a.label,r);if("center"!==n&&(d(b),e(n,b,o,a,t,r)),s)switch(b.shadowOffsetX=0,s){case 1:b.shadowOffsetY=1.5,b.shadowBlur=4,b.shadowColor="rgba(0,0,0,0.36)";break;case 2:b.shadowOffsetY=3,b.shadowBlur=12,b.shadowColor="rgba(0,0,0,0.39)";break;case 3:b.shadowOffsetY=6,b.shadowBlur=12,b.shadowColor="rgba(0,0,0,0.42)";break;case 4:b.shadowOffsetY=10,b.shadowBlur=20,b.shadowColor="rgba(0,0,0,0.47)";break;case 5:b.shadowOffsetY=15,b.shadowBlur=24,b.shadowColor="rgba(0,0,0,0.52)"}l>0&&(b.beginPath(),b.fillStyle="node"===c("nodeHoverBorderColor")?q:c("defaultNodeHoverBorderColor")||c("defaultNodeBorderColor"),b.arc(a[i+"x"],a[i+"y"],j+l,0,2*Math.PI,!0),b.closePath(),b.fill());var u=sigma.canvas.nodes[a.type]||sigma.canvas.nodes.def;if(u(a,b,c,{color:p}),s&&(b.shadowOffsetY=0,b.shadowBlur=0),"center"===n&&(d(b),e(n,b,o,a,t,r)),"string"==typeof a.label){b.fillStyle="node"===c("labelHoverColor")?a.color||k:c("defaultLabelHoverColor");var v,w=0,x=o/3,y=!0;switch(b.textAlign="center",n){case"bottom":x=+j+4*o/3;break;case"center":break;case"left":b.textAlign="right",w=-j-l-m-3;break;case"top":x=-j-2*o/3;break;case"constrained":v=sigma.utils.canvas.getTextWidth(a.label),v>2*(j+o/3)&&(y=!1);break;case"inside":if(v=sigma.utils.canvas.getTextWidth(a.label),2*(j+o/3)>=v)break;case"right":default:w=j+l+m+3,b.textAlign="left"}if(y)for(var z=a[i+"x"]+w,A=Math.round(a[i+"y"]+x),B=0;B<t.length;++B)b.fillText(t[B],z,A+B*(o+1))}}}.call(this),function(a){"use strict";function b(a,b){if(1>=b)return[a];for(var d=a.split(" "),e=[],f=0,g=-1,h=[],i=!0,j=0;j<d.length;++j)if(i){if(d[j].length>b){for(var k=c(d[j],b),l=0;l<k.length;++l)e.push([k[l]]),++g;f=k[k.length-1].length}else e.push([d[j]]),++g,f=d[j].length+1;i=!1}else f+d[j].length<=b?(e[g].push(d[j]),f+=d[j].length+1):(i=!0,--j);for(j=0;j<e.length;++j)h.push(e[j].join(" "));return h}function c(a,b){for(var c=[],d=0;d<a.length;d+=b-1)c.push(a.substr(d,b-1)+"-");var e=c[c.length-1].length;return c[c.length-1]=c[c.length-1].substr(0,e-1)+" ",c}if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.canvas.labels"),sigma.canvas.labels.def=function(a,c,d,e){var f,g,h,i,j=d("prefix")||"",k=a[j+"size"]||1,l=d(a.active?"activeFontStyle":"fontStyle"),m=a.active?(a.border_size||d("nodeActiveBorderSize")||d("nodeBorderSize"))+(d("nodeActiveOuterBorderSize")||d("nodeOuterBorderSize")):d("nodeBorderSize")+d("nodeOuterBorderSize"),n=d("maxNodeLabelLineLength")||0,o=!0,p=d("labelAlignment");if(!(k<=d("labelThreshold"))&&a.label&&"string"==typeof a.label){f="fixed"===d("labelSize")?d("defaultLabelSize"):d("labelSizeRatio")*k;var q=(l?l+" ":"")+f+"px "+(a.active?d("activeFont")||d("font"):d("font"));switch(e&&e.ctx.font!=q?(c.font=q,e.ctx.font=q):c.font=q,a.active?c.fillStyle="node"===d("labelActiveColor")?a.active_color||d("defaultNodeActiveColor"):d("defaultLabelActiveColor"):c.fillStyle="node"===d("labelColor")?a.color||d("defaultNodeColor"):d("defaultLabelColor"),h=0,i=f/3,c.textAlign="center",p){case"bottom":i=+k+4*f/3;break;case"center":break;case"left":c.textAlign="right",h=-k-m-3;break;case"top":i=-k-2*f/3;break;case"constrained":g=sigma.utils.canvas.getTextWidth(c,d("approximateLabelWidth"),f,a.label),g>2*(k+f/3)&&(o=!1);break;case"inside":if(g=sigma.utils.canvas.getTextWidth(c,d("approximateLabelWidth"),f,a.label),2*(k+f/3)>=g)break;case"right":default:h=k+m+3,c.textAlign="left"}if(o)for(var r=b(a.label,n),s=a[j+"x"]+h,t=Math.round(a[j+"y"]+i),u=0;u<r.length;++u)c.fillText(r[u],s,t+u*(f+1))}}}.call(this),function(){
"use strict";sigma.utils.pkg("sigma.canvas.nodes");var a=function(a,b,c,d,e){var f=a.cross&&a.cross.lineWeight||1;e.moveTo(b-d,c-f),e.lineTo(b-d,c+f),e.lineTo(b-f,c+f),e.lineTo(b-f,c+d),e.lineTo(b+f,c+d),e.lineTo(b+f,c+f),e.lineTo(b+d,c+f),e.lineTo(b+d,c-f),e.lineTo(b+f,c-f),e.lineTo(b+f,c-d),e.lineTo(b-f,c-d),e.lineTo(b-f,c-f)};sigma.canvas.nodes.cross=function(b,c,d,e){var f=e||{},g=d("prefix")||"",h=b[g+"size"]||1,i=b[g+"x"],j=b[g+"y"],k=d("defaultNodeColor"),l=d("imgCrossOrigin")||"anonymous",m=b.border_size||d("nodeBorderSize"),n=d("nodeOuterBorderSize"),o=b.border_size||d("nodeActiveBorderSize"),p=d("nodeActiveOuterBorderSize"),q=f.color||b.color||k,r="default"===d("nodeBorderColor")?d("defaultNodeBorderColor"):f.borderColor||b.border_color||k,s=b.active?d("nodeActiveLevel"):b.level;sigma.utils.canvas.setLevel(s,c),b.active?(q="node"===d("nodeActiveColor")?b.active_color||q:d("defaultNodeActiveColor")||q,p>0&&(c.beginPath(),c.fillStyle="node"===d("nodeActiveOuterBorderColor")?q||k:d("defaultNodeActiveOuterBorderColor"),c.arc(i,j,h+o+p,0,2*Math.PI,!0),c.closePath(),c.fill()),o>0&&(c.beginPath(),c.fillStyle="node"===d("nodeActiveBorderColor")?r:d("defaultNodeActiveBorderColor"),c.arc(i,j,h+o,0,2*Math.PI,!0),c.closePath(),c.fill())):(n>0&&(c.beginPath(),c.fillStyle="node"===d("nodeOuterBorderColor")?q||k:d("defaultNodeOuterBorderColor"),c.arc(i,j,h+m+n,0,2*Math.PI,!0),c.closePath(),c.fill()),m>0&&(c.beginPath(),c.fillStyle="node"===d("nodeBorderColor")?r:d("defaultNodeBorderColor"),c.arc(i,j,h+m,0,2*Math.PI,!0),c.closePath(),c.fill())),c.fillStyle=q,c.beginPath(),a(b,i,j,h,c),c.closePath(),c.fill(),sigma.utils.canvas.setLevel(s,c),b.image&&sigma.utils.canvas.drawImage(b,i,j,h,c,l,d("imageThreshold",a)),b.icon&&sigma.utils.canvas.drawIcon(b,i,j,h,c,d("iconThreshold"))}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.nodes");var a=function(a,b,c,d,e,f){a.beginPath(),a.strokeStyle=e,a.lineWidth=f,a.arc(b,c,d,0,2*Math.PI,!0),a.closePath(),a.stroke()};sigma.canvas.nodes.def=function(b,c,d,e){var f=e||{},g=d("prefix")||"",h=b[g+"size"]||1,i=b[g+"x"],j=b[g+"y"],k=d("defaultNodeColor"),l=d("imgCrossOrigin")||"anonymous",m=b.border_size||d("nodeBorderSize"),n=d("nodeOuterBorderSize"),o=b.border_size||d("nodeActiveBorderSize"),p=d("nodeActiveOuterBorderSize"),q=f.color||b.color||k,r="default"===d("nodeBorderColor")?d("defaultNodeBorderColor"):f.borderColor||b.border_color||b.color||k,s=b.active?d("nodeActiveLevel"):b.level;if(sigma.utils.canvas.setLevel(s,c),b.active?(q="node"===d("nodeActiveColor")?b.active_color||q:d("defaultNodeActiveColor")||q,p>0&&(c.beginPath(),c.fillStyle="node"===d("nodeActiveOuterBorderColor")?q||k:d("defaultNodeActiveOuterBorderColor"),c.arc(i,j,h+o+p,0,2*Math.PI,!0),c.closePath(),c.fill()),o>0&&(c.beginPath(),c.fillStyle="node"===d("nodeActiveBorderColor")?r:d("defaultNodeActiveBorderColor"),c.arc(i,j,h+o,0,2*Math.PI,!0),c.closePath(),c.fill())):(n>0&&(c.beginPath(),c.fillStyle="node"===d("nodeOuterBorderColor")?q||k:d("defaultNodeOuterBorderColor"),c.arc(i,j,h+m+n,0,2*Math.PI,!0),c.closePath(),c.fill()),m>0&&(c.beginPath(),c.fillStyle="node"===d("nodeBorderColor")?r:d("defaultNodeBorderColor"),c.arc(i,j,h+m,0,2*Math.PI,!0),c.closePath(),c.fill())),(!b.active||b.active&&"node"===d("nodeActiveColor"))&&b.colors&&b.colors.length){var t,u=b.colors.length,v=1/u,w=0;for(t=0;u>t;t++)c.fillStyle=b.colors[t],c.beginPath(),c.moveTo(i,j),c.arc(i,j,h,w,w+2*Math.PI*v,!1),c.lineTo(i,j),c.closePath(),c.fill(),w+=2*Math.PI*v;sigma.utils.canvas.resetLevel(c)}else c.fillStyle=q,c.beginPath(),c.arc(i,j,h,0,2*Math.PI,!0),c.closePath(),c.fill(),sigma.utils.canvas.resetLevel(c),!b.active&&m>0&&h>2*m&&a(c,i,j,h,r,m);b.image&&sigma.utils.canvas.drawImage(b,i,j,h,c,l,d("imageThreshold")),b.icon&&sigma.utils.canvas.drawIcon(b,i,j,h,c,d("iconThreshold"))}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.nodes");var a=function(a,b,c,d,e){e.moveTo(b-d,c),e.lineTo(b,c-d),e.lineTo(b+d,c),e.lineTo(b,c+d)};sigma.canvas.nodes.diamond=function(b,c,d,e){var f=e||{},g=d("prefix")||"",h=b[g+"size"]||1,i=b[g+"x"],j=b[g+"y"],k=d("defaultNodeColor"),l=d("imgCrossOrigin")||"anonymous",m=b.border_size||d("nodeBorderSize"),n=d("nodeOuterBorderSize"),o=b.border_size||d("nodeActiveBorderSize"),p=d("nodeActiveOuterBorderSize"),q=f.color||b.color||k,r="default"===d("nodeBorderColor")?d("defaultNodeBorderColor"):f.borderColor||b.border_color||k,s=b.active?d("nodeActiveLevel"):b.level;sigma.utils.canvas.setLevel(s,c),b.active?(q="node"===d("nodeActiveColor")?b.active_color||q:d("defaultNodeActiveColor")||q,p>0&&(c.beginPath(),c.fillStyle="node"===d("nodeActiveOuterBorderColor")?q||k:d("defaultNodeActiveOuterBorderColor"),c.arc(i,j,h+o+p,0,2*Math.PI,!0),c.closePath(),c.fill()),o>0&&(c.beginPath(),c.fillStyle="node"===d("nodeActiveBorderColor")?r:d("defaultNodeActiveBorderColor"),c.arc(i,j,h+o,0,2*Math.PI,!0),c.closePath(),c.fill())):(n>0&&(c.beginPath(),c.fillStyle="node"===d("nodeOuterBorderColor")?q||k:d("defaultNodeOuterBorderColor"),c.arc(i,j,h+m+n,0,2*Math.PI,!0),c.closePath(),c.fill()),m>0&&(c.beginPath(),c.fillStyle="node"===d("nodeBorderColor")?r:d("defaultNodeBorderColor"),c.arc(i,j,h+m,0,2*Math.PI,!0),c.closePath(),c.fill())),c.fillStyle=q,c.beginPath(),a(b,i,j,h,c),c.closePath(),c.fill(),s&&sigma.utils.canvas.resetLevel(c),b.image&&sigma.utils.canvas.drawImage(b,i,j,h,c,l,d("imageThreshold"),a),b.icon&&sigma.utils.canvas.drawIcon(b,i,j,h,c,d("iconThreshold"))}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.nodes");var a=function(a,b,c,d,e){var f=a.equilateral&&a.equilateral.numPoints||5,g=a.equilateral&&a.equilateral.rotate||0,h=d;g+=Math.PI/f,e.moveTo(b+h*Math.sin(g),c-h*Math.cos(g));for(var i=1;f>i;i++)e.lineTo(b+Math.sin(g+2*Math.PI*i/f)*h,c-Math.cos(g+2*Math.PI*i/f)*h)};sigma.canvas.nodes.equilateral=function(b,c,d,e){var f=e||{},g=d("prefix")||"",h=b[g+"size"]||1,i=b[g+"x"],j=b[g+"y"],k=d("defaultNodeColor"),l=d("imgCrossOrigin")||"anonymous",m=b.border_size||d("nodeBorderSize"),n=d("nodeOuterBorderSize"),o=b.border_size||d("nodeActiveBorderSize"),p=d("nodeActiveOuterBorderSize"),q=f.color||b.color||k,r="default"===d("nodeBorderColor")?d("defaultNodeBorderColor"):f.borderColor||b.border_color||k,s=b.active?d("nodeActiveLevel"):b.level;sigma.utils.canvas.setLevel(s,c),b.active?(q="node"===d("nodeActiveColor")?b.active_color||q:d("defaultNodeActiveColor")||q,p>0&&(c.beginPath(),c.fillStyle="node"===d("nodeActiveOuterBorderColor")?q||k:d("defaultNodeActiveOuterBorderColor"),c.arc(i,j,h+o+p,0,2*Math.PI,!0),c.closePath(),c.fill()),o>0&&(c.beginPath(),c.fillStyle="node"===d("nodeActiveBorderColor")?r:d("defaultNodeActiveBorderColor"),c.arc(i,j,h+o,0,2*Math.PI,!0),c.closePath(),c.fill())):(n>0&&(c.beginPath(),c.fillStyle="node"===d("nodeOuterBorderColor")?q||k:d("defaultNodeOuterBorderColor"),c.arc(i,j,h+m+n,0,2*Math.PI,!0),c.closePath(),c.fill()),m>0&&(c.beginPath(),c.fillStyle="node"===d("nodeBorderColor")?r:d("defaultNodeBorderColor"),c.arc(i,j,h+m,0,2*Math.PI,!0),c.closePath(),c.fill())),c.fillStyle=q,c.beginPath(),a(b,i,j,h,c),c.closePath(),c.fill(),s&&sigma.utils.canvas.resetLevel(c),b.image&&sigma.utils.canvas.drawImage(b,i,j,h,c,l,d("imageThreshold"),a),b.icon&&sigma.utils.canvas.drawIcon(b,i,j,h,c,d("iconThreshold"))}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.nodes");var a=function(a,b,c,d,e){var f=45*Math.PI/180;e.moveTo(b+d*Math.sin(f),c-d*Math.cos(f));for(var g=1;4>g;g++)e.lineTo(b+Math.sin(f+2*Math.PI*g/4)*d,c-Math.cos(f+2*Math.PI*g/4)*d)};sigma.canvas.nodes.square=function(b,c,d,e){var f=e||{},g=d("prefix")||"",h=b[g+"size"]||1,i=b[g+"x"],j=b[g+"y"],k=d("defaultNodeColor"),l=d("imgCrossOrigin")||"anonymous",m=b.border_size||d("nodeBorderSize"),n=d("nodeOuterBorderSize"),o=b.border_size||d("nodeActiveBorderSize"),p=d("nodeActiveOuterBorderSize"),q=f.color||b.color||k,r="default"===d("nodeBorderColor")?d("defaultNodeBorderColor"):f.borderColor||b.border_color||k,s=b.active?d("nodeActiveLevel"):b.level;sigma.utils.canvas.setLevel(s,c),b.active?(q="node"===d("nodeActiveColor")?b.active_color||q:d("defaultNodeActiveColor")||q,p>0&&(c.beginPath(),c.fillStyle="node"===d("nodeActiveOuterBorderColor")?q||k:d("defaultNodeActiveOuterBorderColor"),c.arc(i,j,h+o+p,0,2*Math.PI,!0),c.closePath(),c.fill()),o>0&&(c.beginPath(),c.fillStyle="node"===d("nodeActiveBorderColor")?r:d("defaultNodeActiveBorderColor"),c.arc(i,j,h+o,0,2*Math.PI,!0),c.closePath(),c.fill())):(n>0&&(c.beginPath(),c.fillStyle="node"===d("nodeOuterBorderColor")?q||k:d("defaultNodeOuterBorderColor"),c.arc(i,j,h+m+n,0,2*Math.PI,!0),c.closePath(),c.fill()),m>0&&(c.beginPath(),c.fillStyle="node"===d("nodeBorderColor")?r:d("defaultNodeBorderColor"),c.arc(i,j,h+m,0,2*Math.PI,!0),c.closePath(),c.fill())),c.fillStyle=q,c.beginPath(),a(b,i,j,h,c),c.closePath(),c.fill(),s&&sigma.utils.canvas.resetLevel(c),b.image&&sigma.utils.canvas.drawImage(b,i,j,h,c,l,d("imageThreshold"),a),b.icon&&sigma.utils.canvas.drawIcon(b,i,j,h,c,d("iconThreshold"))}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.nodes");var a=function(a,b,c,d,e){var f=a.star&&a.star.numPoints||5,g=a.star&&a.star.innerRatio||.5,h=d,i=d*g,j=Math.PI/f;e.moveTo(b,c-d);for(var k=0;f>k;k++)e.lineTo(b+Math.sin(j+2*Math.PI*k/f)*i,c-Math.cos(j+2*Math.PI*k/f)*i),e.lineTo(b+Math.sin(2*Math.PI*(k+1)/f)*h,c-Math.cos(2*Math.PI*(k+1)/f)*h)};sigma.canvas.nodes.star=function(b,c,d,e){var f=e||{},g=d("prefix")||"",h=b[g+"size"]||1,i=b[g+"x"],j=b[g+"y"],k=d("defaultNodeColor"),l=d("imgCrossOrigin")||"anonymous",m=b.border_size||d("nodeBorderSize"),n=d("nodeOuterBorderSize"),o=b.border_size||d("nodeActiveBorderSize"),p=d("nodeActiveOuterBorderSize"),q=f.color||b.color||k,r="default"===d("nodeBorderColor")?d("defaultNodeBorderColor"):f.borderColor||b.border_color||k,s=b.active?d("nodeActiveLevel"):b.level;sigma.utils.canvas.setLevel(s,c),b.active?(q="node"===d("nodeActiveColor")?b.active_color||q:d("defaultNodeActiveColor")||q,p>0&&(c.beginPath(),c.fillStyle="node"===d("nodeActiveOuterBorderColor")?q||k:d("defaultNodeActiveOuterBorderColor"),c.arc(i,j,h+o+p,0,2*Math.PI,!0),c.closePath(),c.fill()),o>0&&(c.beginPath(),c.fillStyle="node"===d("nodeActiveBorderColor")?r:d("defaultNodeActiveBorderColor"),c.arc(i,j,h+o,0,2*Math.PI,!0),c.closePath(),c.fill())):(n>0&&(c.beginPath(),c.fillStyle="node"===d("nodeOuterBorderColor")?q||k:d("defaultNodeOuterBorderColor"),c.arc(i,j,h+m+n,0,2*Math.PI,!0),c.closePath(),c.fill()),m>0&&(c.beginPath(),c.fillStyle="node"===d("nodeBorderColor")?r:d("defaultNodeBorderColor"),c.arc(i,j,h+m,0,2*Math.PI,!0),c.closePath(),c.fill())),c.fillStyle=q,c.beginPath(),a(b,i,j,h,c),c.closePath(),c.fill(),s&&sigma.utils.canvas.resetLevel(c),b.image&&sigma.utils.canvas.drawImage(b,i,j,h,c,l,d("imageThreshold"),a),b.icon&&sigma.utils.canvas.drawIcon(b,i,j,h,c,d("iconThreshold"))}}(),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.settings");var b={nodeBorderColor:"node,",nodeOuterBorderColor:"",nodeOuterBorderSize:0,defaultNodeOuterBorderColor:"#000",nodeHoverBorderSize:0,nodeHoverBorderColor:"node,",defaultNodeHoverBorderColor:"#000",nodeActiveBorderSize:0,nodeActiveBorderColor:"node,",defaultNodeActiveBorderColor:"#000",nodeActiveOuterBorderColor:"",nodeActiveOuterBorderSize:0,defaultNodeActiveOuterBorderColor:"#000",defaultLabelActiveColor:"#000",activeFont:"",activeFontStyle:"",labelActiveColor:"default",nodeActiveColor:"node",defaultNodeActiveColor:"rgb(236, 81, 72)",edgeActiveColor:"edge",defaultEdgeActiveColor:"rgb(236, 81, 72)",nodeActiveLevel:0,nodeHoverLevel:0,edgeActiveLevel:0,edgeHoverLevel:0,iconThreshold:8,imageThreshold:8,imgCrossOrigin:"anonymous"};sigma.settings=sigma.utils.extend(sigma.settings||{},b)}.call(this),function(){"use strict";sigma.utils.pkg("sigma.svg.edges"),sigma.svg.edges.tapered={create:function(a,b,c,d){var e=a.color,f=(d("prefix")||"",d("edgeColor")),g=d("defaultNodeColor"),h=d("defaultEdgeColor");if(!e)switch(f){case"source":e=b.color||g;break;case"target":e=c.color||g;break;default:e=h}var i=document.createElementNS(d("xmlns"),"polygon");return i.setAttributeNS(null,"data-edge-id",a.id),i.setAttributeNS(null,"class",d("classPrefix")+"-edge"),i.setAttributeNS(null,"fill",e),i.setAttributeNS(null,"fill-opacity",.6),i.setAttributeNS(null,"stroke-width",0),i},update:function(a,b,c,d,e){var f,g,h=e("prefix")||"",i=c[h+"x"],j=c[h+"y"],k=d[h+"x"],l=d[h+"y"],m=a[h+"size"]||1,n=sigma.utils.getDistance(i,j,k,l);if(n)return f=sigma.utils.getCircleIntersection(i,j,m,k,l,n),g=k+","+l+" "+f.xi+","+f.yi+" "+f.xi_prime+","+f.yi_prime,b.setAttributeNS(null,"points",g),b.style.display="",this}}}(),function(){"use strict";sigma.utils.pkg("sigma.webgl.edges"),sigma.webgl.edges.arrow={POINTS:9,ATTRIBUTES:11,addEdge:function(a,b,c,d,e,f,g){var h=(a[f+"size"]||1)/2,i=b[f+"x"],j=b[f+"y"],k=c[f+"x"],l=c[f+"y"],m=c[f+"size"],n=a.active?a.active_color||g("defaultEdgeActiveColor"):a.color;if(!n)switch(g("edgeColor")){case"source":n=b.color||g("defaultNodeColor");break;case"target":n=c.color||g("defaultNodeColor");break;default:n=g("defaultEdgeColor")}a.active&&(n="edge"===g("edgeActiveColor")?n||defaultEdgeColor:g("defaultEdgeActiveColor")),n=sigma.utils.floatColor(n),d[e++]=i,d[e++]=j,d[e++]=k,d[e++]=l,d[e++]=h,d[e++]=m,d[e++]=0,d[e++]=0,d[e++]=0,d[e++]=0,d[e++]=n,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=m,d[e++]=1,d[e++]=1,d[e++]=0,d[e++]=0,d[e++]=n,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=m,d[e++]=1,d[e++]=0,d[e++]=0,d[e++]=0,d[e++]=n,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=m,d[e++]=1,d[e++]=0,d[e++]=0,d[e++]=0,d[e++]=n,d[e++]=i,d[e++]=j,d[e++]=k,d[e++]=l,d[e++]=h,d[e++]=m,d[e++]=0,d[e++]=1,d[e++]=0,d[e++]=0,d[e++]=n,d[e++]=i,d[e++]=j,d[e++]=k,d[e++]=l,d[e++]=h,d[e++]=m,d[e++]=0,d[e++]=0,d[e++]=0,d[e++]=0,d[e++]=n,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=m,d[e++]=1,d[e++]=0,d[e++]=1,d[e++]=-1,d[e++]=n,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=m,d[e++]=1,d[e++]=0,d[e++]=1,d[e++]=0,d[e++]=n,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=m,d[e++]=1,d[e++]=0,d[e++]=1,d[e++]=1,d[e++]=n},render:function(a,b,c,d){var e,f=a.getAttribLocation(b,"a_pos1"),g=a.getAttribLocation(b,"a_pos2"),h=a.getAttribLocation(b,"a_thickness"),i=a.getAttribLocation(b,"a_tSize"),j=a.getAttribLocation(b,"a_delay"),k=a.getAttribLocation(b,"a_minus"),l=a.getAttribLocation(b,"a_head"),m=a.getAttribLocation(b,"a_headPosition"),n=a.getAttribLocation(b,"a_color"),o=a.getUniformLocation(b,"u_resolution"),p=a.getUniformLocation(b,"u_matrix"),q=a.getUniformLocation(b,"u_matrixHalfPi"),r=a.getUniformLocation(b,"u_matrixHalfPiMinus"),s=a.getUniformLocation(b,"u_ratio"),t=a.getUniformLocation(b,"u_nodeRatio"),u=a.getUniformLocation(b,"u_arrowHead"),v=a.getUniformLocation(b,"u_scale");e=a.createBuffer(),a.bindBuffer(a.ARRAY_BUFFER,e),a.bufferData(a.ARRAY_BUFFER,c,a.STATIC_DRAW),a.uniform2f(o,d.width,d.height),a.uniform1f(s,d.ratio/Math.pow(d.ratio,d.settings("edgesPowRatio"))),a.uniform1f(t,Math.pow(d.ratio,d.settings("nodesPowRatio"))/d.ratio),a.uniform1f(u,5),a.uniform1f(v,d.scalingRatio),a.uniformMatrix3fv(p,!1,d.matrix),a.uniformMatrix2fv(q,!1,sigma.utils.matrices.rotation(Math.PI/2,!0)),a.uniformMatrix2fv(r,!1,sigma.utils.matrices.rotation(-Math.PI/2,!0)),a.enableVertexAttribArray(f),a.enableVertexAttribArray(g),a.enableVertexAttribArray(h),a.enableVertexAttribArray(i),a.enableVertexAttribArray(j),a.enableVertexAttribArray(k),a.enableVertexAttribArray(l),a.enableVertexAttribArray(m),a.enableVertexAttribArray(n),a.vertexAttribPointer(f,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,0),a.vertexAttribPointer(g,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,8),a.vertexAttribPointer(h,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,16),a.vertexAttribPointer(i,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,20),a.vertexAttribPointer(j,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,24),a.vertexAttribPointer(k,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,28),a.vertexAttribPointer(l,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,32),a.vertexAttribPointer(m,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,36),a.vertexAttribPointer(n,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,40),a.drawArrays(a.TRIANGLES,d.start||0,d.count||c.length/this.ATTRIBUTES)},initProgram:function(a){var b,c,d;return b=sigma.utils.loadShader(a,["attribute vec2 a_pos1;","attribute vec2 a_pos2;","attribute float a_thickness;","attribute float a_tSize;","attribute float a_delay;","attribute float a_minus;","attribute float a_head;","attribute float a_headPosition;","attribute float a_color;","uniform vec2 u_resolution;","uniform float u_ratio;","uniform float u_nodeRatio;","uniform float u_arrowHead;","uniform float u_scale;","uniform mat3 u_matrix;","uniform mat2 u_matrixHalfPi;","uniform mat2 u_matrixHalfPiMinus;","varying vec4 color;","void main() {","vec2 pos = normalize(a_pos2 - a_pos1);","mat2 matrix = (1.0 - a_head) *","(","a_minus * u_matrixHalfPiMinus +","(1.0 - a_minus) * u_matrixHalfPi",") + a_head * (","a_headPosition * u_matrixHalfPiMinus * 0.6 +","(a_headPosition * a_headPosition - 1.0) * mat2(1.0)",");","pos = a_pos1 + (","(1.0 - a_head) * a_thickness * u_ratio * matrix * pos +","a_head * u_arrowHead * a_thickness * u_ratio * matrix * pos +","a_delay * pos * (","a_tSize / u_nodeRatio +","u_arrowHead * a_thickness * u_ratio",")",");","gl_Position = vec4(","((u_matrix * vec3(pos, 1)).xy /","u_resolution * 2.0 - 1.0) * vec2(1, -1),","0,","1",");","float c = a_color;","color.b = mod(c, 256.0); c = floor(c / 256.0);","color.g = mod(c, 256.0); c = floor(c / 256.0);","color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;","color.a = 1.0;","}"].join("\n"),a.VERTEX_SHADER),c=sigma.utils.loadShader(a,["precision mediump float;","varying vec4 color;","void main(void) {","gl_FragColor = color;","}"].join("\n"),a.FRAGMENT_SHADER),d=sigma.utils.loadProgram(a,[b,c])}}}(),function(){"use strict";sigma.utils.pkg("sigma.webgl.edges"),sigma.webgl.edges.def={POINTS:6,ATTRIBUTES:7,addEdge:function(a,b,c,d,e,f,g){var h=(a[f+"size"]||1)/2,i=b[f+"x"],j=b[f+"y"],k=c[f+"x"],l=c[f+"y"],m=a.active?a.active_color||g("defaultEdgeActiveColor"):a.color;if(!m)switch(g("edgeColor")){case"source":m=b.color||g("defaultNodeColor");break;case"target":m=c.color||g("defaultNodeColor");break;default:m=g("defaultEdgeColor")}a.active&&(m="edge"===g("edgeActiveColor")?m||defaultEdgeColor:g("defaultEdgeActiveColor")),m=sigma.utils.floatColor(m),d[e++]=i,d[e++]=j,d[e++]=k,d[e++]=l,d[e++]=h,d[e++]=0,d[e++]=m,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=1,d[e++]=m,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=0,d[e++]=m,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=0,d[e++]=m,d[e++]=i,d[e++]=j,d[e++]=k,d[e++]=l,d[e++]=h,d[e++]=1,d[e++]=m,d[e++]=i,d[e++]=j,d[e++]=k,d[e++]=l,d[e++]=h,d[e++]=0,d[e++]=m},render:function(a,b,c,d){var e,f=a.getAttribLocation(b,"a_color"),g=a.getAttribLocation(b,"a_position1"),h=a.getAttribLocation(b,"a_position2"),i=a.getAttribLocation(b,"a_thickness"),j=a.getAttribLocation(b,"a_minus"),k=a.getUniformLocation(b,"u_resolution"),l=a.getUniformLocation(b,"u_matrix"),m=a.getUniformLocation(b,"u_matrixHalfPi"),n=a.getUniformLocation(b,"u_matrixHalfPiMinus"),o=a.getUniformLocation(b,"u_ratio"),p=a.getUniformLocation(b,"u_scale");e=a.createBuffer(),a.bindBuffer(a.ARRAY_BUFFER,e),a.bufferData(a.ARRAY_BUFFER,c,a.STATIC_DRAW),a.uniform2f(k,d.width,d.height),a.uniform1f(o,d.ratio/Math.pow(d.ratio,d.settings("edgesPowRatio"))),a.uniform1f(p,d.scalingRatio),a.uniformMatrix3fv(l,!1,d.matrix),a.uniformMatrix2fv(m,!1,sigma.utils.matrices.rotation(Math.PI/2,!0)),a.uniformMatrix2fv(n,!1,sigma.utils.matrices.rotation(-Math.PI/2,!0)),a.enableVertexAttribArray(f),a.enableVertexAttribArray(g),a.enableVertexAttribArray(h),a.enableVertexAttribArray(i),a.enableVertexAttribArray(j),a.vertexAttribPointer(g,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,0),a.vertexAttribPointer(h,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,8),a.vertexAttribPointer(i,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,16),a.vertexAttribPointer(j,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,20),a.vertexAttribPointer(f,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,24),a.drawArrays(a.TRIANGLES,d.start||0,d.count||c.length/this.ATTRIBUTES)},initProgram:function(a){var b,c,d;return b=sigma.utils.loadShader(a,["attribute vec2 a_position1;","attribute vec2 a_position2;","attribute float a_thickness;","attribute float a_minus;","attribute float a_color;","uniform vec2 u_resolution;","uniform float u_ratio;","uniform float u_scale;","uniform mat3 u_matrix;","uniform mat2 u_matrixHalfPi;","uniform mat2 u_matrixHalfPiMinus;","varying vec4 color;","void main() {","vec2 position = a_thickness * u_ratio *","normalize(a_position2 - a_position1);","mat2 matrix = a_minus * u_matrixHalfPiMinus +","(1.0 - a_minus) * u_matrixHalfPi;","position = matrix * position + a_position1;","gl_Position = vec4(","((u_matrix * vec3(position, 1)).xy /","u_resolution * 2.0 - 1.0) * vec2(1, -1),","0,","1",");","float c = a_color;","color.b = mod(c, 256.0); c = floor(c / 256.0);","color.g = mod(c, 256.0); c = floor(c / 256.0);","color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;","color.a = 1.0;","}"].join("\n"),a.VERTEX_SHADER),c=sigma.utils.loadShader(a,["precision mediump float;","varying vec4 color;","void main(void) {","gl_FragColor = color;","}"].join("\n"),a.FRAGMENT_SHADER),d=sigma.utils.loadProgram(a,[b,c])}}}(),function(){"use strict";sigma.utils.pkg("sigma.webgl.edges"),sigma.webgl.edges.fast={POINTS:2,ATTRIBUTES:3,addEdge:function(a,b,c,d,e,f,g){var h=((a[f+"size"]||1)/2,b[f+"x"]),i=b[f+"y"],j=c[f+"x"],k=c[f+"y"],l=a.active?a.active_color||g("defaultEdgeActiveColor"):a.color;if(!l)switch(g("edgeColor")){case"source":l=b.color||g("defaultNodeColor");break;case"target":l=c.color||g("defaultNodeColor");break;default:l=g("defaultEdgeColor")}a.active&&(l="edge"===g("edgeActiveColor")?l||defaultEdgeColor:g("defaultEdgeActiveColor")),l=sigma.utils.floatColor(l),d[e++]=h,d[e++]=i,d[e++]=l,d[e++]=j,d[e++]=k,d[e++]=l},render:function(a,b,c,d){var e,f=a.getAttribLocation(b,"a_color"),g=a.getAttribLocation(b,"a_position"),h=a.getUniformLocation(b,"u_resolution"),i=a.getUniformLocation(b,"u_matrix");e=a.createBuffer(),a.bindBuffer(a.ARRAY_BUFFER,e),a.bufferData(a.ARRAY_BUFFER,c,a.DYNAMIC_DRAW),a.uniform2f(h,d.width,d.height),a.uniformMatrix3fv(i,!1,d.matrix),a.enableVertexAttribArray(g),a.enableVertexAttribArray(f),a.vertexAttribPointer(g,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,0),a.vertexAttribPointer(f,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,8),a.lineWidth(3),a.drawArrays(a.LINES,d.start||0,d.count||c.length/this.ATTRIBUTES)},initProgram:function(a){var b,c,d;return b=sigma.utils.loadShader(a,["attribute vec2 a_position;","attribute float a_color;","uniform vec2 u_resolution;","uniform mat3 u_matrix;","varying vec4 color;","void main() {","gl_Position = vec4(","((u_matrix * vec3(a_position, 1)).xy /","u_resolution * 2.0 - 1.0) * vec2(1, -1),","0,","1",");","float c = a_color;","color.b = mod(c, 256.0); c = floor(c / 256.0);","color.g = mod(c, 256.0); c = floor(c / 256.0);","color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;","color.a = 1.0;","}"].join("\n"),a.VERTEX_SHADER),c=sigma.utils.loadShader(a,["precision mediump float;","varying vec4 color;","void main(void) {","gl_FragColor = color;","}"].join("\n"),a.FRAGMENT_SHADER),d=sigma.utils.loadProgram(a,[b,c])}}}(),function(){"use strict";sigma.utils.pkg("sigma.webgl.nodes"),sigma.webgl.nodes.def={POINTS:3,ATTRIBUTES:12,addNode:function(a,b,c,d,e){var f=this,g=a.color||e("defaultNodeColor"),h=e("imgCrossOrigin")||"anonymous";a.active&&(g="node"===e("nodeActiveColor")?a.active_color||g:e("defaultNodeActiveColor")||g);var i=sigma.utils.floatColor(g||e("defaultNodeColor"));"undefined"==typeof f.spriteSheet&&f.createSpriteSheet(e);var j=-1,k=.7,l=999,m=1,n=1,o=1,p=0;switch(a.type||"circle"){case"circle":case"disc":case"disk":o=1,l=999,k=1;break;case"square":o=0,l=4,k=.7,"undefined"!=typeof a.square&&"number"==typeof a.square.rotate&&(p=a.square.rotate);break;case"diamond":o=0,l=4,k=.7,p=45*Math.PI/180,"undefined"!=typeof a.diamond&&"number"==typeof a.diamond.rotate&&(p=a.diamond.rotate);break;case"triangle":o=0,l=3,k=.5,p=Math.PI,"undefined"!=typeof a.triangle&&"number"==typeof a.triangle.rotate&&(p=a.triangle.rotate);break;case"star":o=1,k=.7,l=5,"undefined"!=typeof a.star&&("number"==typeof a.star.numPoints&&(l=a.star.numPoints),"number"==typeof a.star.rotate&&(p=a.star.rotate));break;case"seastar":o=2,k=.5,l=5,"undefined"!=typeof a.seastar&&("number"==typeof a.seastar.numPoints&&(l=a.seastar.numPoints),"number"==typeof a.seastar.rotate&&(p=a.seastar.rotate));break;case"equilateral":o=0,l=7,k=.7,p=0,"undefined"!=typeof a.equilateral&&("number"==typeof a.equilateral.numPoints&&(l=a.equilateral.numPoints),"number"==typeof a.equilateral.rotate&&(p=a.equilateral.rotate));break;case"hexagon":o=0,l=6,k=.7,"undefined"!=typeof a.hexagon&&"number"==typeof a.hexagon.rotate&&(p=a.hexagon.rotate);break;case"polygon":o=1,l=5,k=.5,p=0,"undefined"!=typeof a.polygon&&("string"==typeof a.polygon.type&&(o="convex"==a.polygon.type?1:0),"number"==typeof a.polygon.angles&&(l=Math.round(Math.max(3,Math.min(8,a.polygon.angles)))),"number"==typeof a.polygon.scale&&(k=a.polygon.scale||(o?.5:.7)),"number"==typeof a.polygon.rotate&&(p=a.polygon.rotate));break;case"cross":o=0,l=9,k=.1,"undefined"!=typeof a.cross&&("number"==typeof a.cross.lineWeight&&(k=Math.max(.1,Math.min(.5,.1*a.cross.lineWeight))),"number"==typeof a.rotate&&(p=a.cross.rotate))}if("undefined"!=typeof a.image){var q=a.image.url||"";q.length>0&&(j=f.getImage(q,h),m=a.image.w||1,n=a.image.h||1)}if("undefined"!=typeof a.icon){var r="Arial";"string"==typeof a.icon.font&&(r=a.icon.font);var s="";"string"==typeof a.icon.content&&(s=a.icon.content);var t=.7;"number"==typeof a.icon.scale&&(t=.5*Math.abs(Math.max(.01,a.icon.scale)));var u=a.icon.color||g,v=a.color||g,w=.5,x=.5;"number"==typeof a.icon.x&&(w=a.icon.x),"number"==typeof a.icon.y&&(x=a.icon.y),j=f.getText(r,v,u,t,w,x,s)}b[c++]=a[d+"x"],b[c++]=a[d+"y"],b[c++]=a[d+"size"],b[c++]=i,b[c++]=0,b[c++]=o,b[c++]=l,b[c++]=k,b[c++]=p,b[c++]=j,b[c++]=m,b[c++]=n,b[c++]=a[d+"x"],b[c++]=a[d+"y"],b[c++]=a[d+"size"],b[c++]=i,b[c++]=2*Math.PI/3,b[c++]=o,b[c++]=l,b[c++]=k,b[c++]=p,b[c++]=j,b[c++]=m,b[c++]=n,b[c++]=a[d+"x"],b[c++]=a[d+"y"],b[c++]=a[d+"size"],b[c++]=i,b[c++]=4*Math.PI/3,b[c++]=o,b[c++]=l,b[c++]=k,b[c++]=p,b[c++]=j,b[c++]=m,b[c++]=n},render:function(a,b,c,d){var e,f=this;arguments;"undefined"==typeof f.spriteSheet&&f.createSpriteSheet();var g=a.getAttribLocation(b,"a_position"),h=a.getAttribLocation(b,"a_size"),i=a.getAttribLocation(b,"a_color"),j=a.getAttribLocation(b,"a_angle"),k=a.getAttribLocation(b,"a_image"),l=a.getAttribLocation(b,"a_shape"),m=a.getUniformLocation(b,"u_resolution"),n=a.getUniformLocation(b,"u_matrix"),o=a.getUniformLocation(b,"u_ratio"),p=a.getUniformLocation(b,"u_scale"),q=a.getUniformLocation(b,"u_sprite_dim"),r=a.getUniformLocation(b,"u_texture_dim");a.getUniformLocation(b,"u_sampler");e=a.createBuffer(),a.bindBuffer(a.ARRAY_BUFFER,e),a.bufferData(a.ARRAY_BUFFER,c,a.DYNAMIC_DRAW),a.uniform2f(m,d.width,d.height),a.uniform1f(o,1/Math.pow(d.ratio,d.settings("nodesPowRatio"))),a.uniform1f(p,d.scalingRatio),a.uniformMatrix3fv(n,!1,d.matrix),a.uniform2f(q,f.spriteSheet.spriteWidth,f.spriteSheet.spriteHeight),a.uniform2f(r,f.spriteSheet.maxWidth,f.spriteSheet.maxHeight),a.enableVertexAttribArray(g),a.enableVertexAttribArray(h),a.enableVertexAttribArray(i),a.enableVertexAttribArray(j),a.enableVertexAttribArray(l),a.enableVertexAttribArray(k),a.vertexAttribPointer(g,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,0),a.vertexAttribPointer(h,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,8),a.vertexAttribPointer(i,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,12),a.vertexAttribPointer(j,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,16),a.vertexAttribPointer(l,4,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,20),a.vertexAttribPointer(k,3,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,36),"undefined"==typeof f.texture&&(f.texture=a.createTexture(),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,f.texture),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,f.spriteSheet.canvas),a.blendFunc(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA),a.enable(a.BLEND),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.generateMipmap(a.TEXTURE_2D)),"undefined"!=typeof f.texture&&(a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,f.texture),f.updateNeeded&&(f.updateNeeded=!1,a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,!1),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,f.spriteSheet.canvas)),a.uniform1i(a.getUniformLocation(b,"u_sampler"),0)),a.drawArrays(a.TRIANGLES,d.start||0,d.count||c.length/this.ATTRIBUTES)},initProgram:function(a){var b,c,d;return b=sigma.utils.loadShader(a,["attribute vec2 a_position;","attribute float a_size;","attribute float a_color;","attribute float a_angle;","attribute vec4 a_shape;","attribute vec3 a_image;","uniform vec2 u_resolution;","uniform float u_ratio;","uniform float u_scale;","uniform mat3 u_matrix;","uniform vec2 u_sprite_dim;","uniform vec2 u_texture_dim;","varying vec4 shape;","varying highp vec4 v_sprite;","varying vec4 color;","varying vec2 center;","varying float radius;","varying vec3 image;","void main() {","radius = a_size * u_ratio;","vec2 position = (u_matrix * vec3(a_position, 1)).xy;","center = position * u_scale;","center = vec2(center.x, u_scale * u_resolution.y - center.y);","position = position +","2.0 * radius * vec2(cos(a_angle), sin(a_angle));","position = (position / u_resolution * 2.0 - 1.0) * vec2(1, -1);","radius = radius * u_scale;","shape = a_shape;","image = a_image;","highp vec2 sp = ","vec2(mod((a_image.s * u_sprite_dim.x), u_texture_dim.x),","floor((a_image.s * u_sprite_dim.x) / u_texture_dim.y) * u_sprite_dim.y);","sp = vec2(sp.x + (u_sprite_dim.x * 0.5),"," sp.y + (u_sprite_dim.y * 0.5));","v_sprite = vec4(","sp.x / u_texture_dim.x,","sp.y / u_texture_dim.y,","u_sprite_dim.x / u_texture_dim.x,","- u_sprite_dim.y / u_texture_dim.y",");","gl_Position = vec4(position, 0, 1);","float c = a_color;","color.b = mod(c, 256.0); c = floor(c / 256.0);","color.g = mod(c, 256.0); c = floor(c / 256.0);","color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;","color.a = 1.0;","}"].join("\n"),a.VERTEX_SHADER),c=sigma.utils.loadShader(a,["#ifdef GL_ES","precision mediump float;","#endif","#define PI_2 6.283185307179586","#define MAX_ANGLES 8","varying vec4 shape;","varying highp vec4 v_sprite;","varying vec4 color;","varying vec2 center;","varying float radius;","varying vec3 image;","uniform sampler2D u_sampler;","void main(void) {","int angles = int(shape.t);","int convex = int(shape.s);","vec2 m = gl_FragCoord.xy - center;","vec2 p = m.xy/radius;","float theta = atan(p.y,p.x);","vec4 color0 = vec4(0.0, 0.0, 0.0, 0.0);","vec4 color1 = (image.s >= 0.0) ?"," texture2D(u_sampler, ","vec2(","(v_sprite.s + v_sprite.p * p.x * 0.5 * image.t),","(v_sprite.t + v_sprite.q * p.y * 0.5 * image.p)","))"," : color",";","mat2 shapeRot = mat2(cos(shape.q),sin(shape.q),-sin(shape.q),cos(shape.q));","p = p * shapeRot;","if (angles > 9) {","gl_FragColor = ","((radius - sqrt(m.x * m.x + m.y * m.y)) > 0.0)","? color1 : color0;","} else if (angles > 8){","gl_FragColor = (","(abs(p.x) > 0.0 && abs(p.x) < (1.0 - sin(shape.p)) && abs(p.y) < shape.p)","|| (abs(p.y) > 0.0 && abs(p.y) < (1.0 - sin(shape.p)) && abs(p.x) < shape.p)",") ? color1 : color0;","} else {","float scale = (convex > 0) ? shape.p * 0.5 : shape.p;","float angle = PI_2 / shape.t;","mat2 t = mat2(cos(angle),sin(angle),-sin(angle),cos(angle));","int q = 0;","for (int i=0;i<MAX_ANGLES;i++) {","if (i >= angles) break;","if (p.y < scale) q++;","p *= t;","}","gl_FragColor =","((convex > 0)","? (q > angles - (angles - 1) / 2)",": (q > angles - 1))","? color1 : color0;","}","}"].join("\n"),a.FRAGMENT_SHADER),
d=sigma.utils.loadProgram(a,[b,c])},createSpriteSheet:function(a){var b=this,c={maxWidth:a("spriteSheetResolution")||2048,maxHeight:a("spriteSheetResolution")||2048,maxSprites:a("spriteSheetMaxSprites")||256},d=c.maxWidth/Math.sqrt(c.maxSprites),e=c.maxHeight/Math.sqrt(c.maxSprites),f=document.createElement("canvas");f.width=c.maxWidth,f.height=c.maxHeight;f.getContext("2d");b.spriteSheet={canvas:f,maxWidth:c.maxWidth,maxHeight:c.maxHeight,maxSprites:c.maxSprite,spriteWidth:d,spriteHeight:e,currentIndex:1,urlToIndex:{}}},getText:function(a,b,c,d,e,f,g){var h=this,i=Math.round(d*h.spriteSheet.spriteHeight),j=e*h.spriteSheet.spriteWidth,k=f*h.spriteSheet.spriteHeight,l=a+":"+b+":"+c+":"+i+":"+g+":"+j+":"+k;if(l in h.spriteSheet.urlToIndex)return h.spriteSheet.urlToIndex[l];var m=h.spriteSheet.currentIndex;h.spriteSheet.currentIndex+=1,h.spriteSheet.urlToIndex[l]=m;var n=m*h.spriteSheet.spriteWidth%h.spriteSheet.maxWidth,o=Math.floor(m*h.spriteSheet.spriteWidth/h.spriteSheet.maxWidth)*h.spriteSheet.spriteHeight,p=h.spriteSheet.canvas.getContext("2d");return p.beginPath(),p.rect(n,o,h.spriteSheet.spriteWidth,h.spriteSheet.spriteHeight),p.fillStyle=b,p.fill(),p.beginPath(),p.fillStyle=c,p.font=""+i+"px "+a,p.textAlign="center",p.textBaseline="middle",p.fillText(g,n+j,o+k),h.updateNeeded=!0,m},getImage:function(a,b){var c=this,d=c.spriteSheet.canvas.getContext("2d");if(a.length<1)return-1;if(a in c.spriteSheet.urlToIndex)return c.spriteSheet.urlToIndex[a];var e=c.spriteSheet.currentIndex;if(e>c.spriteSheet.maxSprites)return-1;c.spriteSheet.currentIndex+=1,c.spriteSheet.urlToIndex[a]=e;var f=new Image;return f.setAttribute("crossOrigin",b),f.onload=function(){var a=e*c.spriteSheet.spriteWidth%c.spriteSheet.maxWidth,b=Math.floor(e*c.spriteSheet.spriteWidth/c.spriteSheet.maxWidth)*c.spriteSheet.spriteHeight;d.drawImage(f,0,0,f.width,f.height,a,b,c.spriteSheet.spriteWidth,c.spriteSheet.spriteHeight),c.updateNeeded=!0},f.src=a,e}}}(),function(){"use strict";sigma.utils.pkg("sigma.webgl.nodes"),sigma.webgl.nodes.fast={POINTS:1,ATTRIBUTES:4,addNode:function(a,b,c,d,e){var f=a.color||e("defaultNodeColor");a.active&&(f="node"===e("nodeActiveColor")?a.active_color||f:e("defaultNodeActiveColor")||f),f=sigma.utils.floatColor(f||e("defaultNodeColor")),b[c++]=a[d+"x"],b[c++]=a[d+"y"],b[c++]=a[d+"size"]||1,b[c++]=sigma.utils.floatColor(f||e("defaultNodeColor"))},render:function(a,b,c,d){var e,f=a.getAttribLocation(b,"a_position"),g=a.getAttribLocation(b,"a_size"),h=a.getAttribLocation(b,"a_color"),i=a.getUniformLocation(b,"u_resolution"),j=a.getUniformLocation(b,"u_matrix"),k=a.getUniformLocation(b,"u_ratio"),l=a.getUniformLocation(b,"u_scale");e=a.createBuffer(),a.bindBuffer(a.ARRAY_BUFFER,e),a.bufferData(a.ARRAY_BUFFER,c,a.DYNAMIC_DRAW),a.uniform2f(i,d.width,d.height),a.uniform1f(k,1/Math.pow(d.ratio,d.settings("nodesPowRatio"))),a.uniform1f(l,d.scalingRatio),a.uniformMatrix3fv(j,!1,d.matrix),a.enableVertexAttribArray(f),a.enableVertexAttribArray(g),a.enableVertexAttribArray(h),a.vertexAttribPointer(f,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,0),a.vertexAttribPointer(g,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,8),a.vertexAttribPointer(h,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,12),a.drawArrays(a.POINTS,d.start||0,d.count||c.length/this.ATTRIBUTES)},initProgram:function(a){var b,c,d;return b=sigma.utils.loadShader(a,["attribute vec2 a_position;","attribute float a_size;","attribute float a_color;","uniform vec2 u_resolution;","uniform float u_ratio;","uniform float u_scale;","uniform mat3 u_matrix;","varying vec4 color;","void main() {","gl_Position = vec4(","((u_matrix * vec3(a_position, 1)).xy /","u_resolution * 2.0 - 1.0) * vec2(1, -1),","0,","1",");","gl_PointSize = a_size * u_ratio * u_scale * 2.0;","float c = a_color;","color.b = mod(c, 256.0); c = floor(c / 256.0);","color.g = mod(c, 256.0); c = floor(c / 256.0);","color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;","color.a = 1.0;","}"].join("\n"),a.VERTEX_SHADER),c=sigma.utils.loadShader(a,["precision mediump float;","varying vec4 color;","void main(void) {","gl_FragColor = color;","}"].join("\n"),a.FRAGMENT_SHADER),d=sigma.utils.loadProgram(a,[b,c])}}}(),function(){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.classes.graph.addMethod("HITS",function(a){var b={},c=1e-4,d=[],e=[],f=this.nodes(),g=(f.length,{});a||(a=!1);for(var h in f)a?(d.push(f[h]),e.push(f[h])):(this.degree(f[h].id,"out")>0&&d.push(f[h]),this.degree(f[h].id,"in")>0&&e.push(f[h])),b[f[h].id]={authority:1,hub:1};for(var i;;){i=!0;var j=0,k=0;for(var h in e){g[e[h].id]={authority:1,hub:0};var l=[];l=a?this.allNeighborsIndex.get(e[h].id).keyList():this.inNeighborsIndex.get(e[h].id).keyList();for(var m in l)m!=e[h].id&&(g[e[h].id].authority+=b[l[m]].hub);j+=g[e[h].id].authority}for(var h in d){g[d[h].id]?g[d[h].id].hub=1:g[d[h].id]={authority:0,hub:1};var l=[];l=a?this.allNeighborsIndex.get(d[h].id).keyList():this.outNeighborsIndex.get(d[h].id).keyList();for(var m in l)m!=d[h].id&&(g[d[h].id].hub+=b[l[m]].authority);k+=g[d[h].id].hub}for(var h in e)g[e[h].id].authority/=j,Math.abs((g[e[h].id].authority-b[e[h].id].authority)/b[e[h].id].authority)>=c&&(i=!1);for(var h in d)g[d[h].id].hub/=k,Math.abs((g[d[h].id].hub-b[d[h].id].hub)/b[d[h].id].hub)>=c&&(i=!1);if(b=g,g={},i)break}return b})}.call(window),function(a){"use strict";if("undefined"==typeof sigma)throw new Error("sigma not in scope.");sigma.utils.pkg("sigma.plugins");var b=function(b,c){function d(a){var b={};return a.forEach(function(a,c){b[a]=!0}),Object.keys(b)}function e(a){var b=[];for(var c in a)a.hasOwnProperty(c)&&b.push(a[c]);return b}function f(a,b){var c=a._assoc_mat[b]?Object.keys(a._assoc_mat[b]):[],d=0;return c.forEach(function(c,e){var f=a._assoc_mat[b][c]||1;b==c&&(f*=2),d+=f}),d}function g(a,b){if("undefined"==typeof a._assoc_mat[b])return[];var c=Object.keys(a._assoc_mat[b]);return c}function h(b,c,d){return b._assoc_mat[c]?b._assoc_mat[c][d]:a}function i(a){var b=0;return a.edges.forEach(function(a){b+=a.weight}),b}function j(a,b){l(a,b);var c=a.edges.map(function(a){return a.source+"_"+a.target}).indexOf(b.source+"_"+b.target);-1!=c?a.edges[c].weight=b.weight:a.edges.push(b)}function k(a){var b={};return a.forEach(function(a,c){b[a.source]=b[a.source]||{},b[a.source][a.target]=a.weight,b[a.target]=b[a.target]||{},b[a.target][a.source]=a.weight}),b}function l(a,b){a._assoc_mat[b.source]=a._assoc_mat[b.source]||{},a._assoc_mat[b.source][b.target]=b.weight,a._assoc_mat[b.target]=a._assoc_mat[b.target]||{},a._assoc_mat[b.target][b.source]=b.weight}function m(a){if(null==a||"object"!=typeof a)return a;var b=a.constructor();for(var c in a)b[c]=m(a[c]);return b}function n(a,b,c){b.nodes_to_com={},b.total_weight=0,b.internals={},b.degrees={},b.gdegrees={},b.loops={},b.total_weight=i(a),"undefined"==typeof c?a.nodes.forEach(function(c,d){b.nodes_to_com[c]=d;var e=f(a,c);if(0>e)throw new Error("A node has a negative degree. Use positive weights.");b.degrees[d]=e,b.gdegrees[c]=e,b.loops[c]=h(a,c,c)||0,b.internals[d]=b.loops[c]}):a.nodes.forEach(function(d,e){var h=c[d];b.nodes_to_com[d]=h;var i=f(a,d);b.degrees[h]=(b.degrees[h]||0)+i,b.gdegrees[d]=i;var j=0,k=g(a,d);k.forEach(function(b,e){var f=a._assoc_mat[d][b];if(0>=f)throw new Error("A node has a negative degree. Use positive weights.");c[b]==h&&(j+=b==d?f:f/2)}),b.internals[h]=(b.internals[h]||0)+j})}function o(a){var b=a.total_weight,c=0,f=d(e(a.nodes_to_com));return f.forEach(function(d,e){var f=a.internals[d]||0,g=a.degrees[d]||0;b>0&&(c=c+f/b-Math.pow(g/(2*b),2))}),c}function p(a,b,c){var d={},e=g(b,a);return e.forEach(function(e,f){if(e!=a){var g=b._assoc_mat[a][e]||1,h=c.nodes_to_com[e];d[h]=(d[h]||0)+g}}),d}function q(a,b,c,d){d.nodes_to_com[a]=+b,d.degrees[b]=(d.degrees[b]||0)+(d.gdegrees[a]||0),d.internals[b]=(d.internals[b]||0)+c+(d.loops[a]||0)}function r(a,b,c,d){d.degrees[b]=(d.degrees[b]||0)-(d.gdegrees[a]||0),d.internals[b]=(d.internals[b]||0)-c-(d.loops[a]||0),d.nodes_to_com[a]=-1}function s(a){var b=0,c=m(a),d={},e=Object.keys(a);return e.forEach(function(e){var f=a[e],g="undefined"==typeof d[f]?-1:d[f];-1==g&&(d[f]=b,g=b,b+=1),c[e]=g}),c}function t(a,b){for(var c=!0,d=0,e=o(b),f=e;c&&d!=z&&(e=f,c=!1,d+=1,a.nodes.forEach(function(d,e){var f=b.nodes_to_com[d],g=(b.gdegrees[d]||0)/(2*b.total_weight),h=p(d,a,b);r(d,f,h[f]||0,b);var i=f,j=0,k=Object.keys(h);k.forEach(function(a,c){var d=h[a]-(b.degrees[a]||0)*g;d>j&&(j=d,i=a)}),q(d,i,h[i]||0,b),i!=f&&(c=!0)}),f=o(b),!(A>f-e)););}function u(a,b){var c,f,g={nodes:[],edges:[],_assoc_mat:{}},i=e(a);return g.nodes=g.nodes.concat(d(i)),b.edges.forEach(function(b,d){f=b.weight||1;var e=a[b.source],i=a[b.target];c=h(g,e,i)||0;var k=c+f;j(g,{source:e,target:i,weight:k})}),g}function v(a,b){for(var c=m(a[0]),d=1;b+1>d;d++)Object.keys(c).forEach(function(b,e){var f=b,g=c[b];c[f]=a[d][g]});return c}function w(a,b){if(0==a.edges.length){var c={};return a.nodes.forEach(function(a,b){c[a]=a}),c}var d={};n(x,d,b);var e=o(d),f=[];t(x,d);var g=o(d),h=s(d.nodes_to_com);f.push(h),e=g;var i=u(h,x);for(n(i,d);;){if(t(i,d),g=o(d),A>g-e)break;h=s(d.nodes_to_com),f.push(h),e=g,i=u(h,i),n(i,d)}return f}var x,y,z=-1,A=1e-7,B={},C=[];x={nodes:b.nodes().map(function(a){return a.id}),edges:b.edges(),_assoc_mat:k(b.edges())},y=c;var D={};return D.run=function(a){return y=a||y,B={},C=w(x,y),this},D.countLevels=function(){return C.length-1},D.getPartitions=function(b){if(b!==a&&(0>b||b>C.length-1))throw new RangeError('Invalid argument: "level" is not between 0 and '+C.length-1+" included.");return v(C,b||C.length-1)},D.countPartitions=function(a){return 1+Math.max.apply(null,Object.keys(a).map(function(b){return a[b]}))},D.setResults=function(a){var c=this,d=a||{},e=this.getPartitions(d.level);return b.nodes().forEach(function(a){"function"==typeof d.setter?(c.setter=d.setter,c.setter.call(a,e[a.id])):"function"==typeof c.setter?c.setter.call(a,e[a.id]):a._louvain=e[a.id]}),this},D};sigma.plugins.louvain=function(a,c){var d=c||{},e=b(a,d.partitions).run();return e.setResults({level:e.countLevels(),setter:d.setter}),e}}.call(this);

},{}],2:[function(require,module,exports){
/* linkurious.js - A Javascript toolkit to speed up the development of graph visualization and interaction applications. - Version: 1.5.2 - Author: Linkurious SAS - License: GPLv3 */

(function(a){"use strict";var b={};"undefined"!=typeof window&&window.addEventListener("resize",function(){for(var a in b)if(b.hasOwnProperty(a)){var c=b[a];c.refresh()}});var c=function(a){var d,e,f,g,h;c.classes.dispatcher.extend(this);var i=a||{};if("string"==typeof i||i instanceof HTMLElement?i={renderers:[i]}:"[object Array]"===Object.prototype.toString.call(i)&&(i={renderers:i}),g=i.renderers||i.renderer||i.container,i.renderers&&0!==i.renderers.length||("string"==typeof g||g instanceof HTMLElement||"object"==typeof g&&"container"in g)&&(i.renderers=[g]),i.id){if(b[i.id])throw'sigma: Instance "'+i.id+'" already exists.';Object.defineProperty(this,"id",{value:i.id})}else{for(h=0;b[h];)h++;Object.defineProperty(this,"id",{value:""+h})}for(b[this.id]=this,this.settings=new c.classes.configurable(c.settings,i.settings||{}),Object.defineProperty(this,"graph",{value:new c.classes.graph(this.settings),configurable:!0}),Object.defineProperty(this,"middlewares",{value:[],configurable:!0}),Object.defineProperty(this,"cameras",{value:{},configurable:!0}),Object.defineProperty(this,"renderers",{value:{},configurable:!0}),Object.defineProperty(this,"renderersPerCamera",{value:{},configurable:!0}),Object.defineProperty(this,"cameraFrames",{value:{},configurable:!0}),Object.defineProperty(this,"camera",{get:function(){return this.cameras[0]}}),Object.defineProperty(this,"events",{value:["click","rightClick","clickStage","doubleClickStage","rightClickStage","clickNode","clickNodes","doubleClickNode","doubleClickNodes","rightClickNode","rightClickNodes","hovers","downNode","downNodes","upNode","upNodes"],configurable:!0}),this._handler=function(a){var b,c={};for(b in a.data)c[b]=a.data[b];c.renderer=a.target,this.dispatchEvent(a.type,c)}.bind(this),f=i.renderers||[],d=0,e=f.length;e>d;d++)this.addRenderer(f[d]);for(f=i.middlewares||[],d=0,e=f.length;e>d;d++)this.middlewares.push("string"==typeof f[d]?c.middlewares[f[d]]:f[d]);"object"==typeof i.graph&&i.graph&&(this.graph.read(i.graph),this.refresh())};if(c.prototype.addCamera=function(b){var d,e=this;if(!arguments.length){for(b=0;this.cameras[""+b];)b++;b=""+b}if(this.cameras[b])throw'sigma.addCamera: The camera "'+b+'" already exists.';return d=new c.classes.camera(b,this.graph,this.settings),this.cameras[b]=d,d.quadtree=new c.classes.quad,c.classes.edgequad!==a&&(d.edgequadtree=new c.classes.edgequad),d.bind("coordinatesUpdated",function(a){e.dispatchEvent("coordinatesUpdated"),e.renderCamera(d)}),this.renderersPerCamera[b]=[],d},c.prototype.killCamera=function(a){if(a="string"==typeof a?this.cameras[a]:a,!a)throw"sigma.killCamera: The camera is undefined.";var b,c,d=this.renderersPerCamera[a.id];for(c=d.length,b=c-1;b>=0;b--)this.killRenderer(d[b]);return delete this.renderersPerCamera[a.id],delete this.cameraFrames[a.id],delete this.cameras[a.id],a.kill&&a.kill(),this},c.prototype.addRenderer=function(a){var b,d,e,f,g=a||{};if("string"==typeof g?g={container:document.getElementById(g)}:g instanceof HTMLElement&&(g={container:g}),"string"==typeof g.container&&(g.container=document.getElementById(g.container)),"id"in g)b=g.id;else{for(b=0;this.renderers[""+b];)b++;b=""+b}if(this.renderers[b])throw'sigma.addRenderer: The renderer "'+b+'" already exists.';if(d="function"==typeof g.type?g.type:c.renderers[g.type],d=d||c.renderers.def,e="camera"in g?g.camera instanceof c.classes.camera?g.camera:this.cameras[g.camera]||this.addCamera(g.camera):this.addCamera(),this.cameras[e.id]!==e)throw"sigma.addRenderer: The camera is not properly referenced.";return f=new d(this.graph,e,this.settings,g),this.renderers[b]=f,Object.defineProperty(f,"id",{value:b}),f.bind&&f.bind(["click","rightClick","clickStage","doubleClickStage","rightClickStage","clickNode","clickNodes","clickEdge","clickEdges","doubleClickNode","doubleClickNodes","doubleClickEdge","doubleClickEdges","rightClickNode","rightClickNodes","rightClickEdge","rightClickEdges","hovers","downNode","downNodes","downEdge","downEdges","upNode","upNodes","upEdge","upEdges"],this._handler),this.renderersPerCamera[e.id].push(f),f},c.prototype.killRenderer=function(a){if(a="string"==typeof a?this.renderers[a]:a,!a)throw"sigma.killRenderer: The renderer is undefined.";var b=this.renderersPerCamera[a.camera.id],c=b.indexOf(a);return c>=0&&b.splice(c,1),a.kill&&a.kill(),delete this.renderers[a.id],this},c.prototype.refresh=function(b){var d,e,f,g,h,i,j=0;for(b=b||{},g=this.middlewares||[],d=0,e=g.length;e>d;d++)g[d].call(this,0===d?"":"tmp"+j+":",d===e-1?"ready:":"tmp"+ ++j+":");for(f in this.cameras)h=this.cameras[f],h.settings("autoRescale")&&this.renderersPerCamera[h.id]&&this.renderersPerCamera[h.id].length?c.middlewares.rescale.call(this,g.length?"ready:":"",h.readPrefix,{width:this.renderersPerCamera[h.id][0].width,height:this.renderersPerCamera[h.id][0].height}):c.middlewares.copy.call(this,g.length?"ready:":"",h.readPrefix),b.skipIndexation||(i=c.utils.getBoundaries(this.graph,h.readPrefix),h.quadtree.index(this.graph,{prefix:h.readPrefix,maxLevel:h.settings("nodeQuadtreeMaxLevel"),bounds:{x:i.minX,y:i.minY,width:i.maxX-i.minX,height:i.maxY-i.minY}}),h.edgequadtree!==a&&h.settings("drawEdges")&&(h.settings("enableEdgeHovering")||h.settings("edgesClippingWithNodes"))&&h.edgequadtree.index(this.graph,{prefix:h.readPrefix,maxLevel:h.settings("edgeQuadtreeMaxLevel"),bounds:{x:i.minX,y:i.minY,width:i.maxX-i.minX,height:i.maxY-i.minY}}));for(g=Object.keys(this.renderers),d=0,e=g.length;e>d;d++)if(this.renderers[g[d]].process)if(this.settings("skipErrors"))try{this.renderers[g[d]].process()}catch(k){console.log('Warning: The renderer "'+g[d]+'" crashed on ".process()"')}else this.renderers[g[d]].process();return this.render(),this},c.prototype.render=function(){var a;for(a in this.renderers)if(this.settings("skipErrors"))try{this.renderers[a].render()}catch(b){this.settings("verbose")&&console.log('Warning: The renderer "'+this.renderers[a]+'" crashed on ".render()"')}else this.renderers[a].render();return this},c.prototype.renderCamera=function(a,b){var c,d,e,f=this;if(b)for(e=this.renderersPerCamera[a.id],c=0,d=e.length;d>c;c++)if(this.settings("skipErrors"))try{e[c].render()}catch(g){this.settings("verbose")&&console.log('Warning: The renderer "'+e[c].id+'" crashed on ".render()"')}else e[c].render();else if(!this.cameraFrames[a.id]){for(e=this.renderersPerCamera[a.id],c=0,d=e.length;d>c;c++)if(this.settings("skipErrors"))try{e[c].render()}catch(g){this.settings("verbose")&&console.log('Warning: The renderer "'+e[c].id+'" crashed on ".render()"')}else e[c].render();this.cameraFrames[a.id]=requestAnimationFrame(function(){delete f.cameraFrames[a.id]})}return this},c.prototype.kill=function(){var a;this.dispatchEvent("kill"),this.graph.kill(),delete this.middlewares;for(a in this.renderers)this.killRenderer(this.renderers[a]);for(a in this.cameras)this.killCamera(this.cameras[a]);delete this.renderers,delete this.cameras;for(a in this)this.hasOwnProperty(a)&&delete this[a];delete b[this.id]},c.instances=function(a){return arguments.length?b[a]:c.utils.extend({},b)},c.version="1.5.2",c.forceES5=!1,"undefined"!=typeof this.sigma)throw"An object called sigma is already in the global scope.";this.sigma=c}).call(this),function(a){"use strict";function b(a,c){var d,e,f,g;if(arguments.length)if(1===arguments.length&&Object(arguments[0])===arguments[0])for(a in arguments[0])b(a,arguments[0][a]);else if(arguments.length>1)for(g=Array.isArray(a)?a:a.split(/ /),d=0,e=g.length;d!==e;d+=1)f=g[d],C[f]||(C[f]=[]),C[f].push({handler:c})}function c(a,b){var c,d,e,f,g,h,i=Array.isArray(a)?a:a.split(/ /);if(arguments.length)if(b)for(c=0,d=i.length;c!==d;c+=1){if(h=i[c],C[h]){for(g=[],e=0,f=C[h].length;e!==f;e+=1)C[h][e].handler!==b&&g.push(C[h][e]);C[h]=g}C[h]&&0===C[h].length&&delete C[h]}else for(c=0,d=i.length;c!==d;c+=1)delete C[i[c]];else C=Object.create(null)}function d(a,b){var c,d,e,f,g,h,i=Array.isArray(a)?a:a.split(/ /);for(b=void 0===b?{}:b,c=0,e=i.length;c!==e;c+=1)if(h=i[c],C[h])for(g={type:h,data:b||{}},d=0,f=C[h].length;d!==f;d+=1)try{C[h][d].handler(g)}catch(j){}}function e(){var a,b,c,d,e=!1,f=s(),g=x.shift();if(c=g.job(),f=s()-f,g.done++,g.time+=f,g.currentTime+=f,g.weightTime=g.currentTime/(g.weight||1),g.averageTime=g.time/g.done,d=g.count?g.count<=g.done:!c,!d){for(a=0,b=x.length;b>a;a++)if(x[a].weightTime>g.weightTime){x.splice(a,0,g),e=!0;break}e||x.push(g)}return d?g:null}function f(a){var b=x.length;w[a.id]=a,a.status="running",b&&(a.weightTime=x[b-1].weightTime,a.currentTime=a.weightTime*(a.weight||1)),a.startTime=s(),d("jobStarted",q(a)),x.push(a)}function g(){var a,b,c;for(a in v)b=v[a],b.after?y[a]=b:f(b),delete v[a];for(u=!!x.length;x.length&&s()-t<B.frameDuration;)if(c=e()){i(c.id);for(a in y)y[a].after===c.id&&(f(y[a]),delete y[a])}u?(t=s(),d("enterFrame"),setTimeout(g,0)):d("stop")}function h(a,b){var c,e,f;if(Array.isArray(a)){for(A=!0,c=0,e=a.length;e>c;c++)h(a[c].id,p(a[c],b));A=!1,u||(t=s(),d("start"),g())}else if("object"==typeof a)if("string"==typeof a.id)h(a.id,a);else{A=!0;for(c in a)"function"==typeof a[c]?h(c,p({job:a[c]},b)):h(c,p(a[c],b));A=!1,u||(t=s(),d("start"),g())}else{if("string"!=typeof a)throw new Error("[conrad.addJob] Wrong arguments.");if(k(a))throw new Error('[conrad.addJob] Job with id "'+a+'" already exists.');if("function"==typeof b)f={id:a,done:0,time:0,status:"waiting",currentTime:0,averageTime:0,weightTime:0,job:b};else{if("object"!=typeof b)throw new Error("[conrad.addJob] Wrong arguments.");f=p({id:a,done:0,time:0,status:"waiting",currentTime:0,averageTime:0,weightTime:0},b)}v[a]=f,d("jobAdded",q(f)),u||A||(t=s(),d("start"),g())}return this}function i(a){var b,c,e,f,g=!1;if(Array.isArray(a))for(b=0,c=a.length;c>b;b++)i(a[b]);else{if("string"!=typeof a)throw new Error("[conrad.killJob] Wrong arguments.");for(e=[w,y,v],b=0,c=e.length;c>b;b++)a in e[b]&&(f=e[b][a],B.history&&(f.status="done",z.push(f)),d("jobEnded",q(f)),delete e[b][a],"function"==typeof f.end&&f.end(),g=!0);for(e=x,b=0,c=e.length;c>b;b++)if(e[b].id===a){e.splice(b,1);break}if(!g)throw new Error('[conrad.killJob] Job "'+a+'" not found.')}return this}function j(){var a,b=p(v,w,y);if(B.history)for(a in b)b[a].status="done",z.push(b[a]),"function"==typeof b[a].end&&b[a].end();return v={},y={},w={},x=[],u=!1,this}function k(a){var b=v[a]||w[a]||y[a];return b?p(b):null}function l(a,b){var c;if("string"==typeof a1&&1===arguments.length)return B[a1];c="object"==typeof a1&&1===arguments.length?a1||{}:{},"string"==typeof a1&&(c[a1]=a2);for(var d in c)void 0!==c[d]?B[d]=c[d]:delete B[d];return this}function m(){return u}function n(){return z=[],this}function o(a,b){var c,d,e,f,g,h,i;if(!arguments.length){g=[];for(d in v)g.push(v[d]);for(d in y)g.push(y[d]);for(d in w)g.push(w[d]);g=g.concat(z)}if("string"==typeof a)switch(a){case"waiting":g=r(y);break;case"running":g=r(w);break;case"done":g=z;break;default:h=a}if(a instanceof RegExp&&(h=a),!h&&("string"==typeof b||b instanceof RegExp)&&(h=b),h){if(i="string"==typeof h,g instanceof Array)c=g;else if("object"==typeof g){c=[];for(d in g)c=c.concat(g[d])}else{c=[];for(d in v)c.push(v[d]);for(d in y)c.push(y[d]);for(d in w)c.push(w[d]);c=c.concat(z)}for(g=[],e=0,f=c.length;f>e;e++)(i?c[e].id===h:c[e].id.match(h))&&g.push(c[e])}return q(g)}function p(){var a,b,c={},d=arguments.length;for(a=d-1;a>=0;a--)for(b in arguments[a])c[b]=arguments[a][b];return c}function q(a){var b,c,d;if(!a)return a;if(Array.isArray(a))for(b=[],c=0,d=a.length;d>c;c++)b.push(q(a[c]));else if("object"==typeof a){b={};for(c in a)b[c]=q(a[c])}else b=a;return b}function r(a){var b,c=[];for(b in a)c.push(a[b]);return c}function s(){return Date.now?Date.now():(new Date).getTime()}if(a.conrad)throw new Error("conrad already exists");var t,u=!1,v={},w={},x=[],y={},z=[],A=!1,B={frameDuration:20,history:!0},C=Object.create(null);Array.isArray||(Array.isArray=function(a){return"[object Array]"===Object.prototype.toString.call(a)});var D={hasJob:k,addJob:h,killJob:i,killAll:j,settings:l,getStats:o,isRunning:m,clearHistory:n,bind:b,unbind:c,version:"0.1.0"};"undefined"!=typeof exports&&("undefined"!=typeof module&&module.exports&&(exports=module.exports=D),exports.conrad=D),a.conrad=D}(this),function(a){"use strict";function b(){var b,c=this;sigma.forceES5||"undefined"==typeof Map||Map.prototype.keys===a||Map.prototype.forEach===a||Array.from===a?(b=Object.create(null),this.size=0,this.keyList=function(){return Object.keys(b).filter(function(c){return b[c]!==a})},this.valueList=function(){for(var c=Object.keys(b),d=[],e=0;e<c.length;e++){var f=b[c[e]];f!==a&&d.push(f)}return d},this.set=function(d,e){b[d]===a&&c.size++,b[d]=e},this.get=function(a){return b[a]},this.has=function(c){return b[c]!==a},this.forEach=function(a){for(var c=Object.keys(b),d=0;d<c.length;++d){var e=c[d],f=b[e];"undefined"!=typeof f&&a(f,e)}},this["delete"]=function(d){var e=b[d];return b[d]=a,e!==a&&c.size--,e},this.clear=function(){for(var a in b)"hasOwnProperty"in b&&!b.hasOwnProperty(a)||delete b[a];b=Object.create(null),c.size=0}):(b=new Map,Object.defineProperty(this,"size",{get:function(){return b.size},set:a,enumerable:!0}),this.set=function(a,c){b.set(""+a,c)},this.get=function(a){return b.get(""+a)},this.has=function(a){return b.has(""+a)},this.forEach=function(a){return b.forEach(a)},this["delete"]=function(a){return b["delete"](""+a)},this.clear=function(){b.clear()},this.keyList=function(){return Array.from(b.keys())},this.valueList=function(){var a=[];return b.forEach(function(b){a.push(b)}),a})}if("undefined"==typeof sigma)throw"sigma is not declared";var c=this;sigma.utils=sigma.utils||{},sigma.utils.map=b,sigma.utils.extend=function(){var a,b,c={},d=arguments.length;for(a=d-1;a>=0;a--)for(b in arguments[a])c[b]=arguments[a][b];return c},sigma.utils.dateNow=function(){return Date.now?Date.now():(new Date).getTime()},sigma.utils.pkg=function(a){return(a||"").split(".").reduce(function(a,b){return b in a?a[b]:a[b]={}},c)},sigma.utils.id=function(){var a=0;return function(){return++a}}();var d={};sigma.utils.floatColor=function(a){if(d[a])return d[a];var b=a,c=0,e=0,f=0;"#"===a[0]?(a=a.slice(1),3===a.length?(c=parseInt(a.charAt(0)+a.charAt(0),16),e=parseInt(a.charAt(1)+a.charAt(1),16),f=parseInt(a.charAt(2)+a.charAt(2),16)):(c=parseInt(a.charAt(0)+a.charAt(1),16),e=parseInt(a.charAt(2)+a.charAt(3),16),f=parseInt(a.charAt(4)+a.charAt(5),16))):a.match(/^ *rgba? *\(/)&&(a=a.match(/^ *rgba? *\( *([0-9]*) *, *([0-9]*) *, *([0-9]*) *(,.*)?\) *$/),c=+a[1],e=+a[2],f=+a[3]);var g=256*c*256+256*e+f;return d[b]=g,g},sigma.utils.zoomTo=function(a,b,c,d,e){var f,g,h,i=a.settings;g=Math.max(i("zoomMin"),Math.min(i("zoomMax"),a.ratio*d)),g!==a.ratio&&(d=g/a.ratio,h={x:b*(1-d)+a.x,y:c*(1-d)+a.y,ratio:g},e&&e.duration?(f=sigma.misc.animation.killAll(a),e=sigma.utils.extend(e,{easing:f?"quadraticOut":"quadraticInOut"}),sigma.misc.animation.camera(a,h,e)):(a.goTo(h),e&&e.onComplete&&e.onComplete()))},sigma.utils.getQuadraticControlPoint=function(a,b,c,d,e){return e=this.extend(e,{x:2,y:4}),{x:(a+c)/e.x+(d-b)/e.y,y:(b+d)/e.x+(a-c)/e.y}},sigma.utils.getPointOnQuadraticCurve=function(a,b,c,d,e,f,g){return{x:(1-a)*(1-a)*b+2*(1-a)*a*f+a*a*d,y:(1-a)*(1-a)*c+2*(1-a)*a*g+a*a*e}},sigma.utils.getPointOnBezierCurve=function(a,b,c,d,e,f,g,h,i){var j=(1-a)*(1-a)*(1-a),k=3*a*(1-a)*(1-a),l=3*a*a*(1-a),m=a*a*a;return{x:j*b+k*f+l*h+m*d,y:j*c+k*g+l*i+m*e}},sigma.utils.getSelfLoopControlPoints=function(a,b,c){return{x1:a-7*c,y1:b,x2:a,y2:b+7*c}},sigma.utils.getDistance=function(a,b,c,d){return Math.sqrt((c-a)*(c-a)+(d-b)*(d-b))},sigma.utils.getCircleIntersection=function(a,b,c,d,e,f){var g,h,i,j,k,l,m,n,o;if(h=d-a,i=e-b,j=Math.sqrt(i*i+h*h),j>c+f)return!1;if(j<Math.abs(c-f))return!1;g=(c*c-f*f+j*j)/(2*j),n=a+h*g/j,o=b+i*g/j,k=Math.sqrt(c*c-g*g),l=-i*(k/j),m=h*(k/j);var p=n+l,q=n-l,r=o+m,s=o-m;return{xi:p,xi_prime:q,yi:r,yi_prime:s}},sigma.utils.isPointOnSegment=function(a,b,c,d,e,f,g){return sigma.utils.distancePointToSegment(a,b,c,d,e,f)<g},sigma.utils.distancePointToSegment=function(a,b,c,d,e,f){var g,h,i=a-c,j=b-d,k=e-c,l=f-d,m=i*k+j*l,n=k*k+l*l,o=-1;0!==n&&(o=m/n),0>o?(g=c,h=d):o>1?(g=e,h=f):(g=c+o*k,h=d+o*l);var p=a-g,q=b-h;return Math.sqrt(p*p+q*q)},sigma.utils.isPointOnQuadraticCurve=function(a,b,c,d,e,f,g,h,i){var j=sigma.utils.getDistance(c,d,e,f);if(Math.abs(a-c)>j||Math.abs(b-d)>j)return!1;for(var k,l=sigma.utils.getDistance(a,b,c,d),m=sigma.utils.getDistance(a,b,e,f),n=.5,o=m>l?-.01:.01,p=.001,q=100,r=sigma.utils.getPointOnQuadraticCurve(n,c,d,e,f,g,h),s=sigma.utils.getDistance(a,b,r.x,r.y);q-- >0&&n>=0&&1>=n&&s>i&&(o>p||-p>o);)k=s,r=sigma.utils.getPointOnQuadraticCurve(n,c,d,e,f,g,h),s=sigma.utils.getDistance(a,b,r.x,r.y),s>k?(o=-o/2,n+=o):0>n+o||n+o>1?(o/=2,s=k):n+=o;return i>s},sigma.utils.isPointOnBezierCurve=function(a,b,c,d,e,f,g,h,i,j,k){var l=sigma.utils.getDistance(c,d,g,h);if(Math.abs(a-c)>l||Math.abs(b-d)>l)return!1;for(var m,n=sigma.utils.getDistance(a,b,c,d),o=sigma.utils.getDistance(a,b,e,f),p=.5,q=o>n?-.01:.01,r=.001,s=100,t=sigma.utils.getPointOnBezierCurve(p,c,d,e,f,g,h,i,j),u=sigma.utils.getDistance(a,b,t.x,t.y);s-- >0&&p>=0&&1>=p&&u>k&&(q>r||-r>q);)m=u,t=sigma.utils.getPointOnBezierCurve(p,c,d,e,f,g,h,i,j),u=sigma.utils.getDistance(a,b,t.x,t.y),u>m?(q=-q/2,p+=q):0>p+q||p+q>1?(q/=2,u=m):p+=q;return k>u},sigma.utils.getX=function(b){return b.offsetX!==a&&b.offsetX||b.layerX!==a&&b.layerX||b.clientX!==a&&b.clientX},sigma.utils.getY=function(b){return b.offsetY!==a&&b.offsetY||b.layerY!==a&&b.layerY||b.clientY!==a&&b.clientY},sigma.utils.getPixelRatio=function(){var b=1;return window.screen.deviceXDPI!==a&&window.screen.logicalXDPI!==a&&window.screen.deviceXDPI>window.screen.logicalXDPI?b=window.screen.systemXDPI/window.screen.logicalXDPI:window.devicePixelRatio!==a&&(b=window.devicePixelRatio),b},sigma.utils.getWidth=function(b){var c=b.target.ownerSVGElement?b.target.ownerSVGElement.width:b.target.width;return"number"==typeof c&&c||c!==a&&c.baseVal!==a&&c.baseVal.value},sigma.utils.getCenter=function(a){var b=-1!==a.target.namespaceURI.indexOf("svg")?1:sigma.utils.getPixelRatio();return{x:sigma.utils.getWidth(a)/(2*b),y:sigma.utils.getHeight(a)/(2*b)}},sigma.utils.mouseCoords=function(a,b,c){return b=b||sigma.utils.getX(a),c=c||sigma.utils.getY(a),{x:b-sigma.utils.getCenter(a).x,y:c-sigma.utils.getCenter(a).y,clientX:a.clientX,clientY:a.clientY,ctrlKey:a.ctrlKey,metaKey:a.metaKey,altKey:a.altKey,shiftKey:a.shiftKey}},sigma.utils.getHeight=function(b){var c=b.target.ownerSVGElement?b.target.ownerSVGElement.height:b.target.height;return"number"==typeof c&&c||c!==a&&c.baseVal!==a&&c.baseVal.value},sigma.utils.getDelta=function(b){return b.wheelDelta!==a&&b.wheelDelta||b.detail!==a&&-b.detail},sigma.utils.getOffset=function(a){for(var b=0,c=0;a;)c+=parseInt(a.offsetTop),b+=parseInt(a.offsetLeft),a=a.offsetParent;return{top:c,left:b}},sigma.utils.doubleClick=function(a,b,c){var d,e=0;a._doubleClickHandler=a._doubleClickHandler||{},a._doubleClickHandler[b]=a._doubleClickHandler[b]||[],d=a._doubleClickHandler[b],d.push(function(a){return e++,2===e?(e=0,c(a)):void(1===e&&setTimeout(function(){e=0},sigma.settings.doubleClickTimeout))}),a.addEventListener(b,d[d.length-1],!1)},sigma.utils.unbindDoubleClick=function(a,b){for(var c,d=(a._doubleClickHandler||{})[b]||[];c=d.pop();)a.removeEventListener(b,c);delete(a._doubleClickHandler||{})[b]},sigma.utils.easings=sigma.utils.easings||{},sigma.utils.easings.linearNone=function(a){return a},sigma.utils.easings.quadraticIn=function(a){return a*a},sigma.utils.easings.quadraticOut=function(a){return a*(2-a)},sigma.utils.easings.quadraticInOut=function(a){return(a*=2)<1?.5*a*a:-.5*(--a*(a-2)-1)},sigma.utils.easings.cubicIn=function(a){return a*a*a},sigma.utils.easings.cubicOut=function(a){return--a*a*a+1},sigma.utils.easings.cubicInOut=function(a){return(a*=2)<1?.5*a*a*a:.5*((a-=2)*a*a+2)},sigma.utils.isWebGLSupported=function(){var a,b=!!window.WebGLRenderingContext;if(b){a=document.createElement("canvas");try{return!(!a.getContext("webgl")&&!a.getContext("experimental-webgl"))}catch(c){}}return!1},sigma.utils.loadShader=function(a,b,c,d){var e,f=a.createShader(c);return a.shaderSource(f,b),a.compileShader(f),e=a.getShaderParameter(f,a.COMPILE_STATUS),e?f:(d&&d('Error compiling shader "'+f+'":'+a.getShaderInfoLog(f)),a.deleteShader(f),null)},sigma.utils.loadProgram=function(a,b,c,d,e){var f,g,h=a.createProgram();for(f=0;f<b.length;++f)a.attachShader(h,b[f]);if(c)for(f=0;f<c.length;++f)a.bindAttribLocation(h,locations?locations[f]:f,opt_attribs[f]);return a.linkProgram(h),g=a.getProgramParameter(h,a.LINK_STATUS),g?h:(e&&e("Error in program linking: "+a.getProgramInfoLog(h)),a.deleteProgram(h),null)},sigma.utils.pkg("sigma.utils.matrices"),sigma.utils.matrices.translation=function(a,b){return[1,0,0,0,1,0,a,b,1]},sigma.utils.matrices.rotation=function(a,b){var c=Math.cos(a),d=Math.sin(a);return b?[c,-d,d,c]:[c,-d,0,d,c,0,0,0,1]},sigma.utils.matrices.scale=function(a,b){return b?[a,0,0,a]:[a,0,0,0,a,0,0,0,1]},sigma.utils.matrices.multiply=function(a,b,c){var d=c?2:3,e=a[0*d+0],f=a[0*d+1],g=a[0*d+2],h=a[1*d+0],i=a[1*d+1],j=a[1*d+2],k=a[2*d+0],l=a[2*d+1],m=a[2*d+2],n=b[0*d+0],o=b[0*d+1],p=b[0*d+2],q=b[1*d+0],r=b[1*d+1],s=b[1*d+2],t=b[2*d+0],u=b[2*d+1],v=b[2*d+2];return c?[e*n+f*q,e*o+f*r,h*n+i*q,h*o+i*r]:[e*n+f*q+g*t,e*o+f*r+g*u,e*p+f*s+g*v,h*n+i*q+j*t,h*o+i*r+j*u,h*p+i*s+j*v,k*n+l*q+m*t,k*o+l*r+m*u,k*p+l*s+m*v]},sigma.utils.canvas={},sigma.utils.canvas.getTextWidth=function(a,b,c,d){return d?b?.6*d.length*c:a.measureText(d).width:0},sigma.utils.canvas.setLevel=function(a,b){if(a)switch(b.shadowOffsetX=0,a){case 1:b.shadowOffsetY=1.5,b.shadowBlur=4,b.shadowColor="rgba(0,0,0,0.36)";break;case 2:b.shadowOffsetY=3,b.shadowBlur=12,b.shadowColor="rgba(0,0,0,0.39)";break;case 3:b.shadowOffsetY=6,b.shadowBlur=12,b.shadowColor="rgba(0,0,0,0.42)";break;case 4:b.shadowOffsetY=10,b.shadowBlur=20,b.shadowColor="rgba(0,0,0,0.47)";break;case 5:b.shadowOffsetY=15,b.shadowBlur=24,b.shadowColor="rgba(0,0,0,0.52)"}},sigma.utils.canvas.resetLevel=function(a){a.shadowOffsetY=0,a.shadowBlur=0,a.shadowColor="#000000"};var e={};sigma.utils.canvas.drawImage=function(a,b,c,d,f,g,h,i){if(a.image&&a.image.url&&!(h>d)){var j=a.image.url,k=a.image.h||1,l=a.image.w||1,m=a.image.scale||1,n=a.image.clip||1,o=e[j];o||(o=document.createElement("IMG"),o.setAttribute("crossOrigin",g),o.src=j,o.onload=function(){window.dispatchEvent(new Event("resize"))},e[j]=o);var p=k>l?l/k:1,q=l>k?k/l:1,r=d*m;f.save(),f.beginPath(),"function"==typeof i?i(a,b,c,d,f,n):f.arc(b,c,d*n,0,2*Math.PI,!0),f.closePath(),f.clip(),f.drawImage(o,b+Math.sin(-0.7855)*r*p,c-Math.cos(-0.7855)*r*q,r*p*2*Math.sin(-0.7855)*-1,r*q*2*Math.cos(-0.7855)),f.restore()}},sigma.utils.canvas.drawIcon=function(a,b,c,d,e,f){if(a.icon&&!(f>d)){var g=a.icon.font||"Arial",h=a.icon.color||"#F00",i=a.icon.content||"?",j=(a.icon.x||.5,a.icon.y||.5,d),k=.7;"number"==typeof a.icon.scale&&(k=Math.abs(Math.max(.01,a.icon.scale)));var l=Math.round(k*j);e.save(),e.fillStyle=h,e.font=""+l+"px "+g,e.textAlign="center",e.textBaseline="middle",e.fillText(i,b,c),e.restore()}}}.call(this),function(a){"use strict";var b,c=0,d=["ms","moz","webkit","o"];for(b=0;b<d.length&&!a.requestAnimationFrame;b++)a.requestAnimationFrame=a[d[b]+"RequestAnimationFrame"],a.cancelAnimationFrame=a[d[b]+"CancelAnimationFrame"]||a[d[b]+"CancelRequestAnimationFrame"];a.requestAnimationFrame||(a.requestAnimationFrame=function(b,d){var e=(new Date).getTime(),f=Math.max(0,16-(e-c)),g=a.setTimeout(function(){b(e+f)},f);return c=e+f,g}),a.cancelAnimationFrame||(a.cancelAnimationFrame=function(a){clearTimeout(a)}),Function.prototype.bind||(Function.prototype.bind=function(a){if("function"!=typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var b,c,d=Array.prototype.slice.call(arguments,1),e=this;return b=function(){},c=function(){return e.apply(this instanceof b&&a?this:a,d.concat(Array.prototype.slice.call(arguments)))},b.prototype=this.prototype,c.prototype=new b,c})}(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.settings");var b={clone:!1,immutable:!0,verbose:!1,classPrefix:"sigma",defaultNodeType:"def",defaultEdgeType:"def",defaultLabelColor:"#000",defaultEdgeColor:"#000",defaultNodeColor:"#000",defaultLabelSize:14,labelAlignment:"right",edgeColor:"source",minArrowSize:0,font:"arial",fontStyle:"",labelColor:"default",labelSize:"fixed",labelSizeRatio:1,labelThreshold:8,maxNodeLabelLineLength:0,webglOversamplingRatio:2,nodeBorderSize:0,defaultNodeBorderColor:"#000",hoverFont:"",singleHover:!0,hoverFontStyle:"",labelHoverShadow:"default",labelHoverShadowColor:"#000",nodeHoverColor:"node",defaultNodeHoverColor:"#000",labelHoverBGColor:"default",defaultHoverLabelBGColor:"#fff",labelHoverColor:"default",defaultLabelHoverColor:"#000",edgeHoverColor:"edge",edgeHoverSizeRatio:1,defaultEdgeHoverColor:"#000",edgeHoverExtremities:!1,drawEdges:!0,drawNodes:!0,drawLabels:!0,drawEdgeLabels:!1,batchEdgesDrawing:!1,hideEdgesOnMove:!1,canvasEdgesBatchSize:500,webglEdgesBatchSize:1e3,approximateLabelWidth:!0,edgesClippingWithNodes:!0,autoCurveRatio:1,autoCurveSortByDirection:!0,scalingMode:"inside",sideMargin:0,minEdgeSize:.5,maxEdgeSize:1,minNodeSize:1,maxNodeSize:8,clickToFocus:!1,touchEnabled:!0,mouseEnabled:!0,mouseWheelEnabled:!0,doubleClickEnabled:!0,eventsEnabled:!0,zoomingRatio:1.7,doubleClickZoomingRatio:2.2,zoomMin:.0625,zoomMax:2,zoomOnLocation:!0,mouseZoomDuration:200,doubleClickZoomDuration:200,mouseInertiaDuration:200,mouseInertiaRatio:3,touchInertiaDuration:200,touchInertiaRatio:3,doubleClickTimeout:300,doubleTapTimeout:300,dragTimeout:200,autoRescale:!0,enableCamera:!0,enableHovering:!0,enableEdgeHovering:!1,edgeHoverPrecision:5,rescaleIgnoreSize:!1,skipErrors:!1,nodeQuadtreeMaxLevel:4,edgeQuadtreeMaxLevel:4,nodesPowRatio:.5,edgesPowRatio:.5,animationsTime:200};sigma.settings=sigma.utils.extend(sigma.settings||{},b)}.call(this),function(){"use strict";var a=function(){Object.defineProperty(this,"_handlers",{value:{}})};a.prototype.bind=function(a,b){var c,d,e,f;if(1===arguments.length&&"object"==typeof arguments[0])for(a in arguments[0])this.bind(a,arguments[0][a]);else{if(2!==arguments.length||"function"!=typeof arguments[1])throw"bind: Wrong arguments.";for(f="string"==typeof a?a.split(" "):a,c=0,d=f.length;c!==d;c+=1)e=f[c],e&&(this._handlers[e]||(this._handlers[e]=[]),this._handlers[e].push({handler:b}))}return this},a.prototype.unbind=function(a,b){var c,d,e,f,g,h,i,j="string"==typeof a?a.split(" "):a;if(!arguments.length){for(g in this._handlers)delete this._handlers[g];return this}if(b)for(c=0,d=j.length;c!==d;c+=1){if(i=j[c],this._handlers[i]){for(h=[],e=0,f=this._handlers[i].length;e!==f;e+=1)this._handlers[i][e].handler!==b&&h.push(this._handlers[i][e]);this._handlers[i]=h}this._handlers[i]&&0===this._handlers[i].length&&delete this._handlers[i]}else for(c=0,d=j.length;c!==d;c+=1)delete this._handlers[j[c]];return this},a.prototype.dispatchEvent=function(a,b){var c,d,e,f,g,h,i,j=this,k="string"==typeof a?a.split(" "):a;for(b=void 0===b?{}:b,c=0,d=k.length;c!==d;c+=1)if(i=k[c],this._handlers[i]){for(h=j.getEvent(i,b),g=[],e=0,f=this._handlers[i].length;e!==f;e+=1)this._handlers[i][e].handler(h),this._handlers[i][e].one||g.push(this._handlers[i][e]);this._handlers[i]=g}return this},a.prototype.getEvent=function(a,b){return{type:a,data:b||{},target:this}},a.extend=function(b,c){var d;for(d in a.prototype)a.prototype.hasOwnProperty(d)&&(b[d]=a.prototype[d]);a.apply(b,c)},"undefined"!=typeof this.sigma?(this.sigma.classes=this.sigma.classes||{},this.sigma.classes.dispatcher=a):"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=a),exports.dispatcher=a):this.dispatcher=a}.call(this),function(){"use strict";var a=function(){var b,c,d={},e=Array.prototype.slice.call(arguments,0),f=function(a,b){var c,g,h,i;{if(1!==arguments.length||"string"!=typeof a){if("object"==typeof a&&"string"==typeof b)return void 0!==(a||{})[b]?a[b]:f(b);for(c="object"==typeof a&&void 0===b?a:{},"string"==typeof a&&(c[a]=b),g=0,i=Object.keys(c),h=i.length;h>g;g++)d[i[g]]=c[i[g]];return this}if(void 0!==d[a])return d[a];for(g=0,h=e.length;h>g;g++)if(void 0!==e[g][a])return e[g][a]}};for(f.embedObjects=function(){var b=e.concat(d).concat(Array.prototype.splice.call(arguments,0));return a.apply({},b)},b=0,c=arguments.length;c>b;b++)f(arguments[b]);return f};"undefined"!=typeof this.sigma?(this.sigma.classes=this.sigma.classes||{},this.sigma.classes.configurable=a):"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=a),exports.configurable=a):this.configurable=a}.call(this),function(a){"use strict";function b(a,b,c){var d=function(){var d,e;for(d in g[a])g[a][d].apply(b,arguments);e=c.apply(b,arguments);for(d in f[a])f[a][d].apply(b,arguments);return e};return d}var c=Object.create(null),d=Object.create(null),e=Object.create(null),f=Object.create(null),g=Object.create(null),h={immutable:!0,clone:!0},i=function(a){return h[a]},j=function(a){var d,f,g;g={settings:a||i,nodesArray:[],edgesArray:[],nodesIndex:new sigma.utils.map,edgesIndex:new sigma.utils.map,inNeighborsIndex:new sigma.utils.map,outNeighborsIndex:new sigma.utils.map,allNeighborsIndex:new sigma.utils.map};for(d in e)e[d].call(g);for(d in c)f=b(d,g,c[d]),this[d]=f,g[d]=f};j.addMethod=function(a,b){if("string"!=typeof a||"function"!=typeof b||2!==arguments.length)throw"addMethod: Wrong arguments.";if(c[a]||j[a])throw'The method "'+a+'" already exists.';return c[a]=b,f[a]=Object.create(null),g[a]=Object.create(null),this},j.hasMethod=function(a){return!(!c[a]&&!j[a])},j.attach=function(a,b,c,d){if("string"!=typeof a||"string"!=typeof b||"function"!=typeof c||arguments.length<3||arguments.length>4)throw"attach: Wrong arguments.";var h;if("constructor"===a)h=e;else if(d){if(!g[a])throw'The method "'+a+'" does not exist.';h=g[a]}else{if(!f[a])throw'The method "'+a+'" does not exist.';h=f[a]}if(h[b])throw'A function "'+b+'" is already attached to the method "'+a+'".';return h[b]=c,this},j.attachBefore=function(a,b,c){return this.attach(a,b,c,!0)},j.addIndex=function(a,b){if("string"!=typeof a||Object(b)!==b||2!==arguments.length)throw"addIndex: Wrong arguments.";if(d[a])throw'The index "'+a+'" already exists.';var c;d[a]=b;for(c in b){if("function"!=typeof b[c])throw"The bindings must be functions.";j.attach(c,a,b[c])}return this},j.addMethod("addNode",function(b){if(Object(b)!==b||1!==arguments.length)throw"addNode: Wrong arguments.";if("string"!=typeof b.id&&"number"!=typeof b.id)throw"The node must have a string or number id.";if(this.nodesIndex.get(b.id))throw'The node "'+b.id+'" already exists.';var c,d=b.id,e=Object.create(null);if(this.settings("clone"))for(c in b)"id"!==c&&(e[c]=b[c]);else e=b;return e.x!==a&&"number"!=typeof e.x&&(e.x=parseFloat(e.x)),e.y!==a&&"number"!=typeof e.y&&(e.y=parseFloat(e.y)),e.size!==a&&"number"!=typeof e.size&&(e.size=parseFloat(e.size)),(!e.size||e.size<=0)&&(e.size=1),this.settings("immutable")?Object.defineProperty(e,"id",{value:d,enumerable:!0}):e.id=d,this.inNeighborsIndex.set(d,new sigma.utils.map),this.outNeighborsIndex.set(d,new sigma.utils.map),this.allNeighborsIndex.set(d,new sigma.utils.map),this.nodesArray.push(e),this.nodesIndex.set(e.id,e),this}),j.addMethod("addEdge",function(b){if(Object(b)!==b||1!==arguments.length)throw"addEdge: Wrong arguments.";if("string"!=typeof b.id&&"number"!=typeof b.id)throw"The edge must have a string or number id.";if("string"!=typeof b.source&&"number"!=typeof b.source||!this.nodesIndex.get(b.source))throw"The edge source must have an existing node id.";if("string"!=typeof b.target&&"number"!=typeof b.target||!this.nodesIndex.get(b.target))throw"The edge target must have an existing node id.";if(this.edgesIndex.get(b.id))throw'The edge "'+b.id+'" already exists.';var c,d=Object.create(null);if(this.settings("clone"))for(c in b)"id"!==c&&"source"!==c&&"target"!==c&&(d[c]=b[c]);else d=b;
return d.size!==a&&"number"!=typeof d.size&&(d.size=parseFloat(d.size)),(!d.size||d.size<=0)&&(d.size=1),this.settings("immutable")?(Object.defineProperty(d,"id",{value:b.id,enumerable:!0}),Object.defineProperty(d,"source",{value:b.source,enumerable:!0}),Object.defineProperty(d,"target",{value:b.target,enumerable:!0})):(d.id=b.id,d.source=b.source,d.target=b.target),this.edgesArray.push(d),this.edgesIndex.set(d.id,d),this.inNeighborsIndex.get(d.target).get(d.source)||this.inNeighborsIndex.get(d.target).set(d.source,new sigma.utils.map),this.inNeighborsIndex.get(d.target).get(d.source).set(d.id,d),this.outNeighborsIndex.get(d.source).get(d.target)||this.outNeighborsIndex.get(d.source).set(d.target,new sigma.utils.map),this.outNeighborsIndex.get(d.source).get(d.target).set(d.id,d),this.allNeighborsIndex.get(d.source).get(d.target)||this.allNeighborsIndex.get(d.source).set(d.target,new sigma.utils.map),this.allNeighborsIndex.get(d.source).get(d.target).set(d.id,d),d.target!==d.source&&(this.allNeighborsIndex.get(d.target).get(d.source)||this.allNeighborsIndex.get(d.target).set(d.source,new sigma.utils.map),this.allNeighborsIndex.get(d.target).get(d.source).set(d.id,d)),this}),j.addMethod("dropNode",function(a){if("string"!=typeof a&&"number"!=typeof a||1!==arguments.length)throw"dropNode: Wrong arguments.";if(!this.nodesIndex.get(a))throw'The node "'+a+'" does not exist.';var b,c;for(this.nodesIndex["delete"](a),b=0,c=this.nodesArray.length;c>b;b++)if(this.nodesArray[b].id===a){this.nodesArray.splice(b,1);break}for(b=this.edgesArray.length-1;b>=0;b--)(this.edgesArray[b].source===a||this.edgesArray[b].target===a)&&this.dropEdge(this.edgesArray[b].id);this.inNeighborsIndex["delete"](a),this.outNeighborsIndex["delete"](a),this.allNeighborsIndex["delete"](a);var d=this;return this.nodesIndex.forEach(function(b,c){d.inNeighborsIndex.get(c)["delete"](a),d.outNeighborsIndex.get(c)["delete"](a),d.allNeighborsIndex.get(c)["delete"](a)}),this}),j.addMethod("dropEdge",function(a){if("string"!=typeof a&&"number"!=typeof a||1!==arguments.length)throw"dropEdge: Wrong arguments.";if(!this.edgesIndex.get(a))throw'The edge "'+a+'" does not exist.';var b,c,d;for(d=this.edgesIndex.get(a),this.edgesIndex["delete"](a),b=0,c=this.edgesArray.length;c>b;b++)if(this.edgesArray[b].id===a){this.edgesArray.splice(b,1);break}return this.inNeighborsIndex.get(d.target).get(d.source)["delete"](d.id),0==this.inNeighborsIndex.get(d.target).get(d.source).size&&this.inNeighborsIndex.get(d.target)["delete"](d.source),this.outNeighborsIndex.get(d.source).get(d.target)["delete"](d.id),0==this.outNeighborsIndex.get(d.source).get(d.target).size&&this.outNeighborsIndex.get(d.source)["delete"](d.target),this.allNeighborsIndex.get(d.source).get(d.target)["delete"](d.id),0==this.allNeighborsIndex.get(d.source).get(d.target).size&&this.allNeighborsIndex.get(d.source)["delete"](d.target),d.target!==d.source&&(this.allNeighborsIndex.get(d.target).get(d.source)["delete"](d.id),0==this.allNeighborsIndex.get(d.target).get(d.source).size&&this.allNeighborsIndex.get(d.target)["delete"](d.source)),this}),j.addMethod("kill",function(){this.nodesArray.length=0,this.edgesArray.length=0,delete this.nodesArray,delete this.edgesArray,delete this.nodesIndex,delete this.edgesIndex,delete this.inNeighborsIndex,delete this.outNeighborsIndex,delete this.allNeighborsIndex}),j.addMethod("clear",function(){return this.nodesArray.length=0,this.edgesArray.length=0,this.nodesIndex.clear(),this.edgesIndex.clear(),this.nodesIndex.clear(),this.inNeighborsIndex.clear(),this.outNeighborsIndex.clear(),this.allNeighborsIndex.clear(),this}),j.addMethod("read",function(a){var b,c,d;for(c=a.nodes||[],b=0,d=c.length;d>b;b++)this.addNode(c[b]);for(c=a.edges||[],b=0,d=c.length;d>b;b++)this.addEdge(c[b]);return this}),j.addMethod("nodes",function(a){if(!arguments.length)return this.nodesArray.slice(0);if(1===arguments.length&&("string"==typeof a||"number"==typeof a))return this.nodesIndex.get(a);if(1===arguments.length&&"[object Array]"===Object.prototype.toString.call(a)){var b,c,d=[];for(b=0,c=a.length;c>b;b++){if("string"!=typeof a[b]&&"number"!=typeof a[b])throw"nodes: Wrong arguments.";d.push(this.nodesIndex.get(a[b]))}return d}throw"nodes: Wrong arguments."}),j.addMethod("degree",function(a,b){if(b={"in":this.inNeighborsIndex,out:this.outNeighborsIndex}[b||""]||this.allNeighborsIndex,"string"==typeof a||"number"==typeof a)return b.get(a).size;if("[object Array]"===Object.prototype.toString.call(a)){var c,d,e=[];for(c=0,d=a.length;d>c;c++){if("string"!=typeof a[c]&&"number"!=typeof a[c])throw"degree: Wrong arguments.";e.push(b.get(a[c]).size)}return e}throw"degree: Wrong arguments."}),j.addMethod("edges",function(a){if(!arguments.length)return this.edgesArray.slice(0);if(1===arguments.length&&("string"==typeof a||"number"==typeof a))return this.edgesIndex.get(a);if(1===arguments.length&&"[object Array]"===Object.prototype.toString.call(a)){var b,c,d=[];for(b=0,c=a.length;c>b;b++){if("string"!=typeof a[b]&&"number"!=typeof a[b])throw"edges: Wrong arguments.";d.push(this.edgesIndex.get(a[b]))}return d}throw"edges: Wrong arguments."}),"undefined"!=typeof sigma?(sigma.classes=sigma.classes||Object.create(null),sigma.classes.graph=j):"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports.graph=j):this.graph=j}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.classes"),sigma.classes.camera=function(a,b,c,d){sigma.classes.dispatcher.extend(this),Object.defineProperty(this,"graph",{value:b}),Object.defineProperty(this,"id",{value:a}),Object.defineProperty(this,"readPrefix",{value:"read_cam"+a+":"}),Object.defineProperty(this,"prefix",{value:"cam"+a+":"}),this.x=0,this.y=0,this.ratio=1,this.angle=0,this.isAnimated=!1,this.settings="object"==typeof d&&d?c.embedObject(d):c},sigma.classes.camera.prototype.goTo=function(b){if(!this.settings("enableCamera"))return this;var c,d,e=b||{},f="ratio"in b&&!this.settings("zoomOnLocation")?["ratio","angle"]:["x","y","ratio","angle"];for(c=0,d=f.length;d>c;c++)if(e[f[c]]!==a){if("number"!=typeof e[f[c]]||isNaN(e[f[c]]))throw'Value for "'+f[c]+'" is not a number.';this[f[c]]=e[f[c]]}return this.dispatchEvent("coordinatesUpdated"),this},sigma.classes.camera.prototype.applyView=function(b,c,d){d=d||{},c=c!==a?c:this.prefix,b=b!==a?b:this.readPrefix;var e,f,g,h=d.nodes||this.graph.nodes(),i=d.edges||this.graph.edges(),j=Math.cos(this.angle)/this.ratio,k=Math.sin(this.angle)/this.ratio,l=Math.pow(this.ratio,this.settings("nodesPowRatio")),m=Math.pow(this.ratio,this.settings("edgesPowRatio")),n=(d.width||0)/2-this.x*j-this.y*k,o=(d.height||0)/2-this.y*j+this.x*k;for(e=0,f=h.length;f>e;e++)g=h[e],g[c+"x"]=(g[b+"x"]||0)*j+(g[b+"y"]||0)*k+n,g[c+"y"]=(g[b+"y"]||0)*j-(g[b+"x"]||0)*k+o,g[c+"size"]=(g[b+"size"]||0)/l;for(e=0,f=i.length;f>e;e++)i[e][c+"size"]=(i[e][b+"size"]||0)/m;return this},sigma.classes.camera.prototype.graphPosition=function(a,b,c){var d=0,e=0,f=Math.cos(this.angle),g=Math.sin(this.angle);return c||(d=-(this.x*f+this.y*g)/this.ratio,e=-(this.y*f-this.x*g)/this.ratio),{x:(a*f+b*g)/this.ratio+d,y:(b*f-a*g)/this.ratio+e}},sigma.classes.camera.prototype.cameraPosition=function(a,b,c){var d=0,e=0,f=Math.cos(this.angle),g=Math.sin(this.angle);return c||(d=-(this.x*f+this.y*g)/this.ratio,e=-(this.y*f-this.x*g)/this.ratio),{x:((a-d)*f-(b-e)*g)*this.ratio,y:((b-e)*f+(a-d)*g)*this.ratio}},sigma.classes.camera.prototype.getMatrix=function(){var a=sigma.utils.matrices.scale(1/this.ratio),b=sigma.utils.matrices.rotation(this.angle),c=sigma.utils.matrices.translation(-this.x,-this.y),d=sigma.utils.matrices.multiply(c,sigma.utils.matrices.multiply(b,a));return d},sigma.classes.camera.prototype.getRectangle=function(a,b){var c=this.cameraPosition(a,0,!0),d=this.cameraPosition(0,b,!0),e=this.cameraPosition(a/2,b/2,!0),f=this.cameraPosition(a/4,0,!0).x,g=this.cameraPosition(0,b/4,!0).y;return{x1:this.x-e.x-f,y1:this.y-e.y-g,x2:this.x-e.x+f+c.x,y2:this.y-e.y-g+c.y,height:Math.sqrt(Math.pow(d.x,2)+Math.pow(d.y+2*g,2))}}}.call(this),function(a){"use strict";function b(a,b){var c=b.x+b.width/2,d=b.y+b.height/2,e=a.y<d,f=a.x<c;return e?f?0:1:f?2:3}function c(a,b){for(var c=[],d=0;4>d;d++)a.x2>=b[d][0].x&&a.x1<=b[d][1].x&&a.y1+a.height>=b[d][0].y&&a.y1<=b[d][2].y&&c.push(d);return c}function d(a,b){for(var c=[],d=0;4>d;d++)j.collision(a,b[d])&&c.push(d);return c}function e(a,b){var c,d,e=b.level+1,f=Math.round(b.bounds.width/2),g=Math.round(b.bounds.height/2),h=Math.round(b.bounds.x),j=Math.round(b.bounds.y);switch(a){case 0:c=h,d=j;break;case 1:c=h+f,d=j;break;case 2:c=h,d=j+g;break;case 3:c=h+f,d=j+g}return i({x:c,y:d,width:f,height:g},e,b.maxElements,b.maxLevel)}function f(b,d,g){if(g.level<g.maxLevel)for(var h=c(d,g.corners),i=0,j=h.length;j>i;i++)g.nodes[h[i]]===a&&(g.nodes[h[i]]=e(h[i],g)),f(b,d,g.nodes[h[i]]);else g.elements.push(b)}function g(c,d){if(d.level<d.maxLevel){var e=b(c,d.bounds);return d.nodes[e]!==a?g(c,d.nodes[e]):[]}return d.elements}function h(b,c,d,e){if(e=e||{},c.level<c.maxLevel)for(var f=d(b,c.corners),g=0,i=f.length;i>g;g++)c.nodes[f[g]]!==a&&h(b,c.nodes[f[g]],d,e);else for(var j=0,k=c.elements.length;k>j;j++)e[c.elements[j].id]===a&&(e[c.elements[j].id]=c.elements[j]);return e}function i(a,b,c,d){return{level:b||0,bounds:a,corners:j.splitSquare(a),maxElements:c||20,maxLevel:d||4,elements:[],nodes:[]}}var j={pointToSquare:function(a){return{x1:a.x-a.size,y1:a.y-a.size,x2:a.x+a.size,y2:a.y-a.size,height:2*a.size}},lineToSquare:function(a){return a.y1<a.y2?a.x1<a.x2?{x1:a.x1-a.size,y1:a.y1-a.size,x2:a.x2+a.size,y2:a.y1-a.size,height:a.y2-a.y1+2*a.size}:{x1:a.x2-a.size,y1:a.y1-a.size,x2:a.x1+a.size,y2:a.y1-a.size,height:a.y2-a.y1+2*a.size}:a.x1<a.x2?{x1:a.x1-a.size,y1:a.y2-a.size,x2:a.x2+a.size,y2:a.y2-a.size,height:a.y1-a.y2+2*a.size}:{x1:a.x2-a.size,y1:a.y2-a.size,x2:a.x1+a.size,y2:a.y2-a.size,height:a.y1-a.y2+2*a.size}},quadraticCurveToSquare:function(a,b){var c=sigma.utils.getPointOnQuadraticCurve(.5,a.x1,a.y1,a.x2,a.y2,b.x,b.y),d=Math.min(a.x1,a.x2,c.x),e=Math.max(a.x1,a.x2,c.x),f=Math.min(a.y1,a.y2,c.y),g=Math.max(a.y1,a.y2,c.y);return{x1:d-a.size,y1:f-a.size,x2:e+a.size,y2:f-a.size,height:g-f+2*a.size}},selfLoopToSquare:function(a){var b=sigma.utils.getSelfLoopControlPoints(a.x,a.y,a.size),c=Math.min(a.x,b.x1,b.x2),d=Math.max(a.x,b.x1,b.x2),e=Math.min(a.y,b.y1,b.y2),f=Math.max(a.y,b.y1,b.y2);return{x1:c-a.size,y1:e-a.size,x2:d+a.size,y2:e-a.size,height:f-e+2*a.size}},isAxisAligned:function(a){return a.x1===a.x2||a.y1===a.y2},axisAlignedTopPoints:function(a){return a.y1===a.y2&&a.x1<a.x2?a:a.x1===a.x2&&a.y2>a.y1?{x1:a.x1-a.height,y1:a.y1,x2:a.x1,y2:a.y1,height:a.height}:a.x1===a.x2&&a.y2<a.y1?{x1:a.x1,y1:a.y2,x2:a.x2+a.height,y2:a.y2,height:a.height}:{x1:a.x2,y1:a.y1-a.height,x2:a.x1,y2:a.y1-a.height,height:a.height}},lowerLeftCoor:function(a){var b=Math.sqrt((a.x2-a.x1)*(a.x2-a.x1)+(a.y2-a.y1)*(a.y2-a.y1));return{x:a.x1-(a.y2-a.y1)*a.height/b,y:a.y1+(a.x2-a.x1)*a.height/b}},lowerRightCoor:function(a,b){return{x:b.x-a.x1+a.x2,y:b.y-a.y1+a.y2}},rectangleCorners:function(a){var b=this.lowerLeftCoor(a),c=this.lowerRightCoor(a,b);return[{x:a.x1,y:a.y1},{x:a.x2,y:a.y2},{x:b.x,y:b.y},{x:c.x,y:c.y}]},splitSquare:function(a){return[[{x:a.x,y:a.y},{x:a.x+a.width/2,y:a.y},{x:a.x,y:a.y+a.height/2},{x:a.x+a.width/2,y:a.y+a.height/2}],[{x:a.x+a.width/2,y:a.y},{x:a.x+a.width,y:a.y},{x:a.x+a.width/2,y:a.y+a.height/2},{x:a.x+a.width,y:a.y+a.height/2}],[{x:a.x,y:a.y+a.height/2},{x:a.x+a.width/2,y:a.y+a.height/2},{x:a.x,y:a.y+a.height},{x:a.x+a.width/2,y:a.y+a.height}],[{x:a.x+a.width/2,y:a.y+a.height/2},{x:a.x+a.width,y:a.y+a.height/2},{x:a.x+a.width/2,y:a.y+a.height},{x:a.x+a.width,y:a.y+a.height}]]},axis:function(a,b){return[{x:a[1].x-a[0].x,y:a[1].y-a[0].y},{x:a[1].x-a[3].x,y:a[1].y-a[3].y},{x:b[0].x-b[2].x,y:b[0].y-b[2].y},{x:b[0].x-b[1].x,y:b[0].y-b[1].y}]},projection:function(a,b){var c=(a.x*b.x+a.y*b.y)/(b.x*b.x+b.y*b.y);return{x:c*b.x,y:c*b.y}},axisCollision:function(a,b,c){for(var d=[],e=[],f=0;4>f;f++){var g=this.projection(b[f],a),h=this.projection(c[f],a);d.push(g.x*a.x+g.y*a.y),e.push(h.x*a.x+h.y*a.y)}var i=Math.max.apply(Math,d),j=Math.max.apply(Math,e),k=Math.min.apply(Math,d),l=Math.min.apply(Math,e);return i>=l&&j>=k},collision:function(a,b){for(var c=this.axis(a,b),d=!0,e=0;4>e;e++)d=d&&this.axisCollision(c[e],a,b);return d}},k=function(a){this._geom=j,this._tree=null,this._cache={query:!1,result:!1},this._enabled=!0,this._indexEdges=a||!1};k.prototype.index=function(a,b){if(!this._enabled)return this._tree;if(!b.bounds)throw"sigma.classes.quad.index: bounds information not given.";var c,d,e,g,h,k,l,m=b.prefix||"",n=b.curvatureCoefficients;if(this._tree=i(b.bounds,0,b.maxElements,b.maxLevel),this._indexEdges){var o=a.edges();for(g=0,h=o.length;h>g;g++)d=a.nodes(o[g].source),e=a.nodes(o[g].target),l={x1:d[m+"x"],y1:d[m+"y"],x2:e[m+"x"],y2:e[m+"y"],size:o[g][m+"size"]||0},"curve"===o[g].type||"curvedArrow"===o[g].type?d.id===e.id?(k={x:d[m+"x"],y:d[m+"y"],size:d[m+"size"]||0},f(o[g],j.selfLoopToSquare(k),this._tree)):(c=sigma.utils.getQuadraticControlPoint(l.x1,l.y1,l.x2,l.y2,o[g].cc||n),f(o[g],j.quadraticCurveToSquare(l,c),this._tree)):f(o[g],j.lineToSquare(l),this._tree)}else{var p=a.nodes();for(g=0,h=p.length;h>g;g++)f(p[g],j.pointToSquare({x:p[g][m+"x"],y:p[g][m+"y"],size:p[g][m+"size"]}),this._tree)}return this._cache={query:!1,result:!1},this._tree},k.prototype.point=function(a,b){return this._enabled&&this._tree?g({x:a,y:b},this._tree)||[]:[]},k.prototype.area=function(a){if(!this._enabled)return[];var b,e,f=JSON.stringify(a);if(this._cache.query===f)return this._cache.result;j.isAxisAligned(a)?(b=c,e=j.axisAlignedTopPoints(a)):(b=d,e=j.rectangleCorners(a));var g=this._tree?h(e,this._tree,b):[],i=[];for(var k in g)i.push(g[k]);return this._cache.query=f,this._cache.result=i,i},"undefined"!=typeof this.sigma?(this.sigma.classes=this.sigma.classes||{},this.sigma.classes.quad=k,this.sigma.classes.edgequad=k.bind(this,!0)):"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=k),exports.quad=k):this.quad=k}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.captors"),sigma.captors.mouse=function(a,b,c){function d(b){z("clickToFocus")||a.focus()}function e(a){var b,c,d;return z("mouseEnabled")&&(w.dispatchEvent("mousemove",sigma.utils.mouseCoords(a)),r)?(s=!0,t=!0,v&&clearTimeout(v),v=setTimeout(function(){s=!1},z("dragTimeout")),sigma.misc.animation.killAll(y),y.isMoving=!0,d=y.cameraPosition(sigma.utils.getX(a)-p,sigma.utils.getY(a)-q,!0),b=l-d.x,c=m-d.y,(b!==y.x||c!==y.y)&&(n=y.x,o=y.y,y.goTo({x:b,y:c})),a.preventDefault?a.preventDefault():a.returnValue=!1,a.stopPropagation(),!1):void 0}function f(a){if(z("mouseEnabled")&&r){r=!1,v&&clearTimeout(v),y.isMoving=!1;var b=sigma.utils.getX(a),c=sigma.utils.getY(a);s?(sigma.misc.animation.killAll(y),sigma.misc.animation.camera(y,{x:y.x+z("mouseInertiaRatio")*(y.x-n),y:y.y+z("mouseInertiaRatio")*(y.y-o)},{easing:"quadraticOut",duration:z("mouseInertiaDuration")})):(p!==b||q!==c)&&y.goTo({x:y.x,y:y.y}),w.dispatchEvent("mouseup",sigma.utils.mouseCoords(a)),s=!1}}function g(a){if(z("mouseEnabled"))switch(l=y.x,m=y.y,n=y.x,o=y.y,p=sigma.utils.getX(a),q=sigma.utils.getY(a),t=!1,u=(new Date).getTime(),a.which){case 2:break;case 3:w.dispatchEvent("rightclick",sigma.utils.mouseCoords(a,p,q));break;default:r=!0,w.dispatchEvent("mousedown",sigma.utils.mouseCoords(a,p,q))}}function h(b){w.eltFocused=!1,a.blur(),z("mouseEnabled")&&w.dispatchEvent("mouseout")}function i(b){if(w.eltFocused=!0,a.focus(),z("mouseEnabled")){var c=sigma.utils.mouseCoords(b);c.isDragging=(new Date).getTime()-u>100&&t,w.dispatchEvent("click",c)}return b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation(),!1}function j(a){var b,c,d;return z("mouseEnabled")?(c=1/z("doubleClickZoomingRatio"),w.dispatchEvent("doubleclick",sigma.utils.mouseCoords(a,p,q)),z("doubleClickEnabled")&&(b=y.cameraPosition(sigma.utils.getX(a)-sigma.utils.getCenter(a).x,sigma.utils.getY(a)-sigma.utils.getCenter(a).y,!0),d={duration:z("doubleClickZoomDuration")},sigma.utils.zoomTo(y,b.x,b.y,c,d)),a.preventDefault?a.preventDefault():a.returnValue=!1,a.stopPropagation(),!1):void 0}function k(a){var b,c,d;return z("mouseEnabled")&&z("mouseWheelEnabled")&&(!z("clickToFocus")||w.eltFocused)?(c=sigma.utils.getDelta(a)>0?1/z("zoomingRatio"):z("zoomingRatio"),b=y.cameraPosition(sigma.utils.getX(a)-sigma.utils.getCenter(a).x,sigma.utils.getY(a)-sigma.utils.getCenter(a).y,!0),d={duration:z("mouseZoomDuration")},sigma.utils.zoomTo(y,b.x,b.y,c,d),a.preventDefault?a.preventDefault():a.returnValue=!1,a.stopPropagation(),!1):void 0}var l,m,n,o,p,q,r,s,t,u,v,w=this,x=a,y=b,z=c;this.eltFocused=!1,sigma.classes.dispatcher.extend(this),sigma.utils.doubleClick(x,"click",j),x.addEventListener("DOMMouseScroll",k,!1),x.addEventListener("mousewheel",k,!1),x.addEventListener("mousemove",e,!1),x.addEventListener("mousedown",g,!1),x.addEventListener("click",i,!1),x.addEventListener("mouseout",h,!1),x.addEventListener("mouseenter",d,!1),document.addEventListener("mouseup",f,!1),this.kill=function(){sigma.utils.unbindDoubleClick(x,"click"),x.removeEventListener("DOMMouseScroll",k),x.removeEventListener("mousewheel",k),x.removeEventListener("mousemove",e),x.removeEventListener("mousedown",g),x.removeEventListener("click",i),x.removeEventListener("mouseout",h),document.removeEventListener("mouseup",f)}}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.captors"),sigma.captors.touch=function(a,b,c){function d(a){var b=sigma.utils.getOffset(B);return{x:a.pageX-b.left,y:a.pageY-b.top}}function e(a){if(D("touchEnabled")){var b,c,e,f,g,h;switch(E=a.touches,E.length){case 1:C.isMoving=!0,w=1,i=C.x,j=C.y,m=C.x,n=C.y,g=d(E[0]),q=g.x,r=g.y;break;case 2:return C.isMoving=!0,w=2,g=d(E[0]),h=d(E[1]),b=g.x,e=g.y,c=h.x,f=h.y,m=C.x,n=C.y,k=C.angle,l=C.ratio,i=C.x,j=C.y,q=b,r=e,s=c,t=f,u=Math.atan2(t-r,s-q),v=Math.sqrt((t-r)*(t-r)+(s-q)*(s-q)),a.preventDefault(),!1}}}function f(a){if(D("touchEnabled")){E=a.touches;var b=D("touchInertiaRatio");switch(z&&(x=!1,clearTimeout(z)),w){case 2:if(1===a.touches.length){e(a),a.preventDefault();break}case 1:C.isMoving=!1,A.dispatchEvent("stopDrag"),x&&(y=!1,sigma.misc.animation.camera(C,{x:C.x+b*(C.x-m),y:C.y+b*(C.y-n)},{easing:"quadraticOut",duration:D("touchInertiaDuration")})),x=!1,w=0}}}function g(a){if(!y&&D("touchEnabled")){var b,c,e,f,g,h,B,F,G,H,I,J,K,L,M,N,O;switch(E=a.touches,x=!0,z&&clearTimeout(z),z=setTimeout(function(){x=!1},D("dragTimeout")),w){case 1:F=d(E[0]),b=F.x,e=F.y,H=C.cameraPosition(b-q,e-r,!0),L=i-H.x,M=j-H.y,(L!==C.x||M!==C.y)&&(m=C.x,n=C.y,C.goTo({x:L,y:M}),A.dispatchEvent("mousemove",sigma.utils.mouseCoords(a,F.x,F.y)),A.dispatchEvent("drag"));break;case 2:F=d(E[0]),G=d(E[1]),b=F.x,e=F.y,c=G.x,f=G.y,I=C.cameraPosition((q+s)/2-sigma.utils.getCenter(a).x,(r+t)/2-sigma.utils.getCenter(a).y,!0),B=C.cameraPosition((b+c)/2-sigma.utils.getCenter(a).x,(e+f)/2-sigma.utils.getCenter(a).y,!0),J=Math.atan2(f-e,c-b)-u,K=Math.sqrt((f-e)*(f-e)+(c-b)*(c-b))/v,b=I.x,e=I.y,N=l/K,b*=K,e*=K,O=k-J,g=Math.cos(-J),h=Math.sin(-J),c=b*g+e*h,f=e*g-b*h,b=c,e=f,L=b-B.x+i,M=e-B.y+j,(N!==C.ratio||O!==C.angle||L!==C.x||M!==C.y)&&(m=C.x,n=C.y,o=C.angle,p=C.ratio,C.goTo({x:L,y:M,angle:O,ratio:N}),A.dispatchEvent("drag"))}return a.preventDefault(),!1}}function h(a){var b,c,e;return a.touches&&1===a.touches.length&&D("touchEnabled")?(y=!0,c=1/D("doubleClickZoomingRatio"),b=d(a.touches[0]),A.dispatchEvent("doubleclick",sigma.utils.mouseCoords(a,b.x,b.y)),D("doubleClickEnabled")&&(b=C.cameraPosition(b.x-sigma.utils.getCenter(a).x,b.y-sigma.utils.getCenter(a).y,!0),e={duration:D("doubleClickZoomDuration"),onComplete:function(){y=!1}},sigma.utils.zoomTo(C,b.x,b.y,c,e)),a.preventDefault?a.preventDefault():a.returnValue=!1,a.stopPropagation(),!1):void 0}var i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A=this,B=a,C=b,D=c,E=[];sigma.classes.dispatcher.extend(this),sigma.utils.doubleClick(B,"touchstart",h),B.addEventListener("touchstart",e,!1),B.addEventListener("touchend",f,!1),B.addEventListener("touchcancel",f,!1),B.addEventListener("touchleave",f,!1),B.addEventListener("touchmove",g,!1),this.kill=function(){sigma.utils.unbindDoubleClick(B,"touchstart"),B.addEventListener("touchstart",e),B.addEventListener("touchend",f),B.addEventListener("touchcancel",f),B.addEventListener("touchleave",f),B.addEventListener("touchmove",g)}}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";if("undefined"==typeof conrad)throw"conrad is not declared";sigma.utils.pkg("sigma.renderers"),sigma.renderers.canvas=function(a,b,c,d){if("object"!=typeof d)throw"sigma.renderers.canvas: Wrong arguments.";if(!(d.container instanceof HTMLElement))throw"Container not found.";var e,f,g,h;for(sigma.classes.dispatcher.extend(this),Object.defineProperty(this,"conradId",{value:sigma.utils.id()}),this.graph=a,this.camera=b,this.contexts={},this.domElements={},this.options=d,this.container=this.options.container,this.settings="object"==typeof d.settings&&d.settings?c.embedObjects(d.settings):c,this.nodesOnScreen=[],this.edgesOnScreen=[],this.jobs={},this.options.prefix="renderer"+this.conradId+":",this.settings("batchEdgesDrawing")?(this.initDOM("canvas","edges"),this.initDOM("canvas","scene"),this.contexts.nodes=this.contexts.scene,this.contexts.labels=this.contexts.scene):(this.initDOM("canvas","scene"),this.contexts.edges=this.contexts.scene,this.contexts.nodes=this.contexts.scene,this.contexts.labels=this.contexts.scene),this.initDOM("canvas","mouse"),this.contexts.hover=this.contexts.mouse,this.captors=[],g=this.options.captors||[sigma.captors.mouse,sigma.captors.touch],e=0,f=g.length;f>e;e++)h="function"==typeof g[e]?g[e]:sigma.captors[g[e]],this.captors.push(new h(this.domElements.mouse,this.camera,this.settings));sigma.misc.bindEvents.call(this,this.options.prefix),sigma.misc.drawHovers.call(this,this.options.prefix),this.resize(!1)},sigma.renderers.canvas.applyRenderers=function(a){var b,c,d,e=a.elements,f={font:a.ctx.font},g=a.elements||"edges"==a.type?"defaultEdgeType":"defaultNodeType";for(a.start=a.start||0,a.end=a.end||a.elements.length,a.end=Math.min(a.elements.length,a.end),a.ctx.save(),b=a.start;b<a.end;b++)e[b].hidden||(c=a.renderers[e[b].type||a.settings(g)],d=c||a.renderers.def,"edges"==a.type?d(e[b],a.graph.nodes(e[b].source),a.graph.nodes(e[b].target),a.ctx,a.settings,{ctx:f}):d(e[b],a.ctx,a.settings,{ctx:f}));a.ctx.restore()},sigma.renderers.canvas.prototype.renderEdges=function(a,b,c){var d={renderers:sigma.canvas.edges,type:"edges",elements:this.edgesOnScreen,ctx:this.contexts.edges,start:a,end:b,graph:this.graph,settings:c};sigma.renderers.canvas.applyRenderers(d),c("drawEdgeLabels")&&(d.renderers=sigma.canvas.edges.labels,d.ctx=this.contexts.labels,sigma.renderers.canvas.applyRenderers(d))},sigma.renderers.canvas.prototype.render=function(b){b=b||{},this.dispatchEvent("beforeRender");var c,d,e,f,g,h,i,j,k,l,m,n,o={},p=this.graph,q=this.graph.nodes,r=(this.options.prefix||"",this.settings(b,"drawEdges")),s=this.settings(b,"drawNodes"),t=this.settings(b,"drawLabels"),u=this.settings.embedObjects(b,{prefix:this.options.prefix});this.resize(!1),this.settings(b,"hideEdgesOnMove")&&(this.camera.isAnimated||this.camera.isMoving)&&(r=!1),this.camera.applyView(a,this.options.prefix,{width:this.width,height:this.height}),this.clear();for(e in this.jobs)conrad.hasJob(e)&&conrad.killJob(e);for(this.nodesOnScreen=this.camera.quadtree.area(this.camera.getRectangle(this.width,this.height)),c=this.nodesOnScreen,d=0,f=c.length;f>d;d++)o[c[d].id]=c[d];if(r){if(this.edgesOnScreen=[],u("edgesClippingWithNodes"))for(c=p.edges(),d=0,f=c.length;f>d;d++)g=c[d],!o[g.source]&&!o[g.target]||g.hidden||q(g.source).hidden||q(g.target).hidden||this.edgesOnScreen.push(g);else this.edgesOnScreen=this.camera.edgequadtree.area(this.camera.getRectangle(this.width,this.height));u("batchEdgesDrawing")?(h="edges_"+this.conradId,m=u("canvasEdgesBatchSize"),l=this.edgesOnScreen,f=l.length,k=0,i=Math.min(l.length,k+m),j=function(){return n=this.contexts.edges.globalCompositeOperation,this.contexts.edges.globalCompositeOperation="destination-over",this.renderEdges(k,i,u),this.contexts.edges.globalCompositeOperation=n,i===l.length?(delete this.jobs[h],!1):(k=i+1,i=Math.min(l.length,k+m),!0)},this.jobs[h]=j,conrad.addJob(h,j.bind(this))):this.renderEdges(0,this.edgesOnScreen.length,u)}return s&&sigma.renderers.canvas.applyRenderers({renderers:sigma.canvas.nodes,type:"nodes",ctx:this.contexts.nodes,elements:this.nodesOnScreen,settings:u}),t&&sigma.renderers.canvas.applyRenderers({renderers:sigma.canvas.labels,type:"nodes",ctx:this.contexts.labels,elements:this.nodesOnScreen,settings:u}),this.dispatchEvent("render"),this},sigma.renderers.canvas.prototype.initDOM=function(a,b){var c=document.createElement(a);c.style.position="absolute",c.setAttribute("class","sigma-"+b),this.domElements[b]=c,this.container.appendChild(c),"canvas"===a.toLowerCase()&&(this.contexts[b]=c.getContext("2d"))},sigma.renderers.canvas.prototype.resize=function(b,c){var d,e=this.width,f=this.height,g=sigma.utils.getPixelRatio();if(b!==a&&c!==a?(this.width=b,this.height=c):(this.width=this.container.offsetWidth,this.height=this.container.offsetHeight,b=this.width,c=this.height),e!==this.width||f!==this.height)for(d in this.domElements)this.domElements[d].style.width=b+"px",this.domElements[d].style.height=c+"px","canvas"===this.domElements[d].tagName.toLowerCase()&&(this.domElements[d].setAttribute("width",b*g+"px"),this.domElements[d].setAttribute("height",c*g+"px"),1!==g&&this.contexts[d].scale(g,g));return this},sigma.renderers.canvas.prototype.clear=function(){for(var a in this.contexts)this.contexts[a].clearRect(0,0,this.width,this.height);return this},sigma.renderers.canvas.prototype.kill=function(){for(var a,b;b=this.captors.pop();)b.kill();delete this.captors;for(a in this.domElements)this.domElements[a].parentNode.removeChild(this.domElements[a]),delete this.domElements[a],delete this.contexts[a];delete this.domElements,delete this.contexts},sigma.utils.pkg("sigma.canvas.nodes"),sigma.utils.pkg("sigma.canvas.edges"),sigma.utils.pkg("sigma.canvas.labels")}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.renderers"),sigma.renderers.webgl=function(a,b,c,d){if("object"!=typeof d)throw"sigma.renderers.webgl: Wrong arguments.";if(!(d.container instanceof HTMLElement))throw"Container not found.";var e,f,g,h;for(sigma.classes.dispatcher.extend(this),this.jobs={},Object.defineProperty(this,"conradId",{value:sigma.utils.id()}),this.graph=a,this.camera=b,this.contexts={},this.domElements={},this.options=d,this.container=this.options.container,this.settings="object"==typeof d.settings&&d.settings?c.embedObjects(d.settings):c,this.options.prefix=this.camera.readPrefix,Object.defineProperty(this,"nodePrograms",{value:{}}),Object.defineProperty(this,"edgePrograms",{value:{}}),Object.defineProperty(this,"nodeFloatArrays",{value:{}}),Object.defineProperty(this,"edgeFloatArrays",{value:{}}),Object.defineProperty(this,"edgeIndicesArrays",{value:{}}),this.settings(d,"batchEdgesDrawing")?(this.initDOM("canvas","edges",!0),this.initDOM("canvas","nodes",!0)):(this.initDOM("canvas","scene",!0),this.contexts.nodes=this.contexts.scene,this.contexts.edges=this.contexts.scene),this.initDOM("canvas","labels"),this.initDOM("canvas","mouse"),this.contexts.hover=this.contexts.mouse,this.captors=[],g=this.options.captors||[sigma.captors.mouse,sigma.captors.touch],e=0,f=g.length;f>e;e++)h="function"==typeof g[e]?g[e]:sigma.captors[g[e]],this.captors.push(new h(this.domElements.mouse,this.camera,this.settings));sigma.misc.bindEvents.call(this,this.camera.prefix),sigma.misc.drawHovers.call(this,this.camera.prefix),this.resize()},sigma.renderers.webgl.prototype.process=function(){var a,b,c,d,e,f,g=this.graph,h=sigma.utils.extend(h,this.options),i=this.settings(h,"defaultEdgeType"),j=this.settings(h,"defaultNodeType");for(d in this.nodeFloatArrays)delete this.nodeFloatArrays[d];for(d in this.edgeFloatArrays)delete this.edgeFloatArrays[d];for(d in this.edgeIndicesArrays)delete this.edgeIndicesArrays[d];for(a=g.edges(),b=0,c=a.length;c>b;b++)e=a[b].type||i,d=e&&sigma.webgl.edges[e]?e:"def",this.edgeFloatArrays[d]||(this.edgeFloatArrays[d]={edges:[]}),this.edgeFloatArrays[d].edges.push(a[b]);for(a=g.nodes(),b=0,c=a.length;c>b;b++)e=a[b].type||j,d=e&&sigma.webgl.nodes[e]?e:"def",this.nodeFloatArrays[d]||(this.nodeFloatArrays[d]={nodes:[]}),this.nodeFloatArrays[d].nodes.push(a[b]);for(d in this.edgeFloatArrays){for(f=sigma.webgl.edges[d],a=this.edgeFloatArrays[d].edges,this.edgeFloatArrays[d].array=new Float32Array(a.length*f.POINTS*f.ATTRIBUTES),b=0,c=a.length;c>b;b++)a[b].hidden||g.nodes(a[b].source).hidden||g.nodes(a[b].target).hidden||f.addEdge(a[b],g.nodes(a[b].source),g.nodes(a[b].target),this.edgeFloatArrays[d].array,b*f.POINTS*f.ATTRIBUTES,h.prefix,this.settings);"function"==typeof f.computeIndices&&(this.edgeIndicesArrays[d]=f.computeIndices(this.edgeFloatArrays[d].array))}for(d in this.nodeFloatArrays)for(f=sigma.webgl.nodes[d],a=this.nodeFloatArrays[d].nodes,this.nodeFloatArrays[d].array=new Float32Array(a.length*f.POINTS*f.ATTRIBUTES),b=0,c=a.length;c>b;b++)this.nodeFloatArrays[d].array||(this.nodeFloatArrays[d].array=new Float32Array(a.length*f.POINTS*f.ATTRIBUTES)),a[b].hidden||f.addNode(a[b],this.nodeFloatArrays[d].array,b*f.POINTS*f.ATTRIBUTES,h.prefix,this.settings);return this},sigma.renderers.webgl.prototype.render=function(b){var c,d,e,f,g,h,i=this,j=(this.graph,this.contexts.nodes),k=this.contexts.edges,l=this.camera.getMatrix(),m=sigma.utils.extend(b,this.options),n=this.settings(m,"drawLabels"),o=this.settings(m,"drawEdges"),p=this.settings(m,"drawNodes");this.resize(!1),this.settings(m,"hideEdgesOnMove")&&(this.camera.isAnimated||this.camera.isMoving)&&(o=!1),this.clear(),l=sigma.utils.matrices.multiply(l,sigma.utils.matrices.translation(this.width/2,this.height/2));for(f in this.jobs)conrad.hasJob(f)&&conrad.killJob(f);if(o)if(this.settings(m,"batchEdgesDrawing"))(function(){var a,b,c,d,e,f,g,h,i,j;c="edges_"+this.conradId,j=this.settings(m,"webglEdgesBatchSize"),a=Object.keys(this.edgeFloatArrays),a.length&&(b=0,i=sigma.webgl.edges[a[b]],e=this.edgeFloatArrays[a[b]].array,h=this.edgeIndicesArrays[a[b]],g=0,f=Math.min(g+j*i.POINTS,e.length/i.ATTRIBUTES),d=function(){return this.edgePrograms[a[b]]||(this.edgePrograms[a[b]]=i.initProgram(k)),f>g&&(k.useProgram(this.edgePrograms[a[b]]),i.render(k,this.edgePrograms[a[b]],e,{settings:this.settings,matrix:l,width:this.width,height:this.height,ratio:this.camera.ratio,scalingRatio:this.settings(m,"webglOversamplingRatio"),start:g,count:f-g,indicesData:h})),f>=e.length/i.ATTRIBUTES&&b===a.length-1?(delete this.jobs[c],!1):(f>=e.length/i.ATTRIBUTES?(b++,e=this.edgeFloatArrays[a[b]].array,i=sigma.webgl.edges[a[b]],g=0,f=Math.min(g+j*i.POINTS,e.length/i.ATTRIBUTES)):(g=f,f=Math.min(g+j*i.POINTS,e.length/i.ATTRIBUTES)),!0)},this.jobs[c]=d,conrad.addJob(c,d.bind(this)))}).call(this);else for(f in this.edgeFloatArrays)h=sigma.webgl.edges[f],this.edgePrograms[f]||(this.edgePrograms[f]=h.initProgram(k)),this.edgeFloatArrays[f]&&(k.useProgram(this.edgePrograms[f]),h.render(k,this.edgePrograms[f],this.edgeFloatArrays[f].array,{settings:this.settings,matrix:l,width:this.width,height:this.height,ratio:this.camera.ratio,scalingRatio:this.settings(m,"webglOversamplingRatio"),indicesData:this.edgeIndicesArrays[f]}));if(p){j.blendFunc(j.SRC_ALPHA,j.ONE_MINUS_SRC_ALPHA),j.enable(j.BLEND);for(f in this.nodeFloatArrays)h=sigma.webgl.nodes[f],this.nodePrograms[f]||(this.nodePrograms[f]=h.initProgram(j)),this.nodeFloatArrays[f]&&(j.useProgram(this.nodePrograms[f]),
h.render(j,this.nodePrograms[f],this.nodeFloatArrays[f].array,{settings:this.settings,matrix:l,width:this.width,height:this.height,ratio:this.camera.ratio,scalingRatio:this.settings(m,"webglOversamplingRatio")}))}if(n)for(c=this.camera.quadtree.area(this.camera.getRectangle(this.width,this.height)),this.camera.applyView(a,a,{nodes:c,edges:[],width:this.width,height:this.height}),g=function(a){return i.settings({prefix:i.camera.prefix},a)},d=0,e=c.length;e>d;d++)c[d].hidden||(sigma.canvas.labels[c[d].type||this.settings(m,"defaultNodeType")]||sigma.canvas.labels.def)(c[d],this.contexts.labels,g);return this.dispatchEvent("render"),this},sigma.renderers.webgl.prototype.initDOM=function(a,b,c){var d=document.createElement(a),e=this;d.style.position="absolute",d.setAttribute("class","sigma-"+b),this.domElements[b]=d,this.container.appendChild(d),"canvas"===a.toLowerCase()&&(this.contexts[b]=d.getContext(c?"experimental-webgl":"2d",{preserveDrawingBuffer:!0}),c&&(d.addEventListener("webglcontextlost",function(a){a.preventDefault()},!1),d.addEventListener("webglcontextrestored",function(a){e.render()},!1)))},sigma.renderers.webgl.prototype.resize=function(b,c){var d,e=this.width,f=this.height,g=sigma.utils.getPixelRatio();if(b!==a&&c!==a?(this.width=b,this.height=c):(this.width=this.container.offsetWidth,this.height=this.container.offsetHeight,b=this.width,c=this.height),e!==this.width||f!==this.height)for(d in this.domElements)this.domElements[d].style.width=b+"px",this.domElements[d].style.height=c+"px","canvas"===this.domElements[d].tagName.toLowerCase()&&(this.contexts[d]&&this.contexts[d].scale?(this.domElements[d].setAttribute("width",b*g+"px"),this.domElements[d].setAttribute("height",c*g+"px"),1!==g&&this.contexts[d].scale(g,g)):(this.domElements[d].setAttribute("width",b*this.settings("webglOversamplingRatio")+"px"),this.domElements[d].setAttribute("height",c*this.settings("webglOversamplingRatio")+"px")));for(d in this.contexts)this.contexts[d]&&this.contexts[d].viewport&&this.contexts[d].viewport(0,0,this.width*this.settings("webglOversamplingRatio"),this.height*this.settings("webglOversamplingRatio"));return this},sigma.renderers.webgl.prototype.clear=function(){return this.contexts.labels.clearRect(0,0,this.width,this.height),this.contexts.nodes.clear(this.contexts.nodes.COLOR_BUFFER_BIT),this.contexts.edges.clear(this.contexts.edges.COLOR_BUFFER_BIT),this},sigma.renderers.webgl.prototype.kill=function(){for(var a,b;b=this.captors.pop();)b.kill();delete this.captors;for(a in this.domElements)this.domElements[a].parentNode.removeChild(this.domElements[a]),delete this.domElements[a],delete this.contexts[a];delete this.domElements,delete this.contexts},sigma.utils.pkg("sigma.webgl.nodes"),sigma.utils.pkg("sigma.webgl.edges"),sigma.utils.pkg("sigma.canvas.labels")}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";if("undefined"==typeof conrad)throw"conrad is not declared";sigma.utils.pkg("sigma.renderers"),sigma.renderers.svg=function(a,b,c,d){if("object"!=typeof d)throw"sigma.renderers.svg: Wrong arguments.";if(!(d.container instanceof HTMLElement))throw"Container not found.";var e,f,g,h,i=this;for(sigma.classes.dispatcher.extend(this),this.graph=a,this.camera=b,this.domElements={graph:null,groups:{},nodes:{},edges:{},labels:{},edgelabels:{},hovers:{}},this.measurementCanvas=null,this.options=d,this.container=this.options.container,this.settings="object"==typeof d.settings&&d.settings?c.embedObjects(d.settings):c,this.settings("freeStyle",!!this.options.freeStyle),this.settings("xmlns","http://www.w3.org/2000/svg"),this.nodesOnScreen=[],this.edgesOnScreen=[],this.options.prefix="renderer"+sigma.utils.id()+":",this.initDOM("svg"),this.captors=[],g=this.options.captors||[sigma.captors.mouse,sigma.captors.touch],e=0,f=g.length;f>e;e++)h="function"==typeof g[e]?g[e]:sigma.captors[g[e]],this.captors.push(new h(this.domElements.graph,this.camera,this.settings));window.addEventListener("resize",function(){i.resize()}),sigma.misc.bindDOMEvents.call(this,this.domElements.graph),this.bindHovers(this.options.prefix),this.resize(!1)},sigma.renderers.svg.prototype.render=function(b){b=b||{},this.dispatchEvent("beforeRender");var c,d,e,f,g,h,i,j,k,l={},m=this.graph,n=this.graph.nodes,o=(this.options.prefix||"",this.settings(b,"drawEdges")),p=this.settings(b,"drawNodes"),q=this.settings(b,"drawLabels"),r=this.settings(b,"drawEdgeLabels"),s=this.settings(b,"defaultEdgeType"),t=this.settings.embedObjects(b,{prefix:this.options.prefix,forceLabels:this.options.forceLabels});for(this.settings(b,"hideEdgesOnMove")&&(this.camera.isAnimated||this.camera.isMoving)&&(o=!1),this.camera.applyView(a,this.options.prefix,{width:this.width,height:this.height}),this.hideDOMElements(this.domElements.nodes),this.hideDOMElements(this.domElements.edges),this.hideDOMElements(this.domElements.labels),this.hideDOMElements(this.domElements.edgelabels),this.edgesOnScreen=[],this.nodesOnScreen=this.camera.quadtree.area(this.camera.getRectangle(this.width,this.height)),c=this.nodesOnScreen,d=0,f=c.length;f>d;d++)l[c[d].id]=c[d];for(c=m.edges(),d=0,f=c.length;f>d;d++)g=c[d],!l[g.source]&&!l[g.target]||g.hidden||n(g.source).hidden||n(g.target).hidden||this.edgesOnScreen.push(g);if(j=sigma.svg.nodes,k=sigma.svg.labels,p)for(c=this.nodesOnScreen,d=0,f=c.length;f>d;d++)c[d].hidden||this.domElements.nodes[c[d].id]||(e=(j[c[d].type]||j.def).create(c[d],t),this.domElements.nodes[c[d].id]=e,this.domElements.groups.nodes.appendChild(e),q&&(e=(k[c[d].type]||k.def).create(c[d],t),this.domElements.labels[c[d].id]=e,this.domElements.groups.labels.appendChild(e)));if(p)for(c=this.nodesOnScreen,d=0,f=c.length;f>d;d++)c[d].hidden||((j[c[d].type]||j.def).update(c[d],this.domElements.nodes[c[d].id],t),q&&(k[c[d].type]||k.def).update(c[d],this.domElements.labels[c[d].id],t));if(j=sigma.svg.edges,k=sigma.svg.edges.labels,o)for(c=this.edgesOnScreen,d=0,f=c.length;f>d;d++)this.domElements.edges[c[d].id]||(h=n(c[d].source),i=n(c[d].target),e=(j[c[d].type]||j[s]||j.def).create(c[d],h,i,t),this.domElements.edges[c[d].id]=e,this.domElements.groups.edges.appendChild(e),r&&(e=(k[c[d].type]||k[s]||k.def).create(c[d],t),this.domElements.edgelabels[c[d].id]=e,this.domElements.groups.edgelabels.appendChild(e)));if(o)for(c=this.edgesOnScreen,d=0,f=c.length;f>d;d++)h=n(c[d].source),i=n(c[d].target),(j[c[d].type]||j[s]||j.def).update(c[d],this.domElements.edges[c[d].id],h,i,t),r&&(k[c[d].type]||k[s]||k.def).update(c[d],h,i,this.domElements.edgelabels[c[d].id],t);return this.dispatchEvent("render"),this},sigma.renderers.svg.prototype.initDOM=function(a){var b,c,d,e=document.createElementNS(this.settings("xmlns"),a),f=this.settings("classPrefix");e.style.position="absolute",e.setAttribute("class",f+"-svg"),e.setAttribute("xmlns",this.settings("xmlns")),e.setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink"),e.setAttribute("version","1.1");var g=document.createElement("canvas");g.setAttribute("class",f+"-measurement-canvas"),this.domElements.graph=this.container.appendChild(e);var h=["edges","nodes","edgelabels","labels","hovers"];for(d=0,c=h.length;c>d;d++)b=document.createElementNS(this.settings("xmlns"),"g"),b.setAttributeNS(null,"id",f+"-group-"+h[d]),b.setAttributeNS(null,"class",f+"-group"),this.domElements.groups[h[d]]=this.domElements.graph.appendChild(b);this.container.appendChild(g),this.measurementCanvas=g.getContext("2d")},sigma.renderers.svg.prototype.hideDOMElements=function(a){var b,c;for(c in a)b=a[c],sigma.svg.utils.hide(b);return this},sigma.renderers.svg.prototype.bindHovers=function(a){function b(b){var c,g=f.settings.embedObjects({prefix:a});if(g("enableHovering"))if(b.data.enter.nodes.length>0){c=b.data.enter.nodes[0];var h=(e[c.type]||e.def).create(c,f.domElements.nodes[c.id],f.measurementCanvas,g);f.domElements.hovers[c.id]=h,f.domElements.groups.hovers.appendChild(h),d=c}else b.data.leave.nodes.length>0&&(c=b.data.leave.nodes[0],f.domElements.groups.hovers.removeChild(f.domElements.hovers[c.id]),d=null,delete f.domElements.hovers[c.id],f.domElements.groups.nodes.appendChild(f.domElements.nodes[c.id]))}function c(){if(d){var b=f.settings.embedObjects({prefix:a});f.domElements.groups.hovers.removeChild(f.domElements.hovers[d.id]),delete f.domElements.hovers[d.id];var c=(e[d.type]||e.def).create(d,f.domElements.nodes[d.id],f.measurementCanvas,b);f.domElements.hovers[d.id]=c,f.domElements.groups.hovers.appendChild(c)}}var d,e=sigma.svg.hovers,f=this;this.bind("hovers",b),this.bind("render",c)},sigma.renderers.svg.prototype.resize=function(b,c){var d=this.width,e=this.height;return b!==a&&c!==a?(this.width=b,this.height=c):(this.width=this.container.offsetWidth,this.height=this.container.offsetHeight),(d!==this.width||e!==this.height)&&(this.domElements.graph.style.width=this.width+"px",this.domElements.graph.style.height=this.height+"px"),this},sigma.utils.pkg("sigma.svg.nodes"),sigma.utils.pkg("sigma.svg.edges"),sigma.utils.pkg("sigma.svg.labels"),sigma.utils.pkg("sigma.svg.edgelabels")}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.renderers"),sigma.renderers.def=sigma.utils.isWebGLSupported()?sigma.renderers.webgl:sigma.renderers.canvas}(this),function(){"use strict";sigma.utils.pkg("sigma.webgl.nodes"),sigma.webgl.nodes.def={POINTS:3,ATTRIBUTES:5,addNode:function(a,b,c,d,e){var f=sigma.utils.floatColor(a.color||e("defaultNodeColor"));b[c++]=a[d+"x"],b[c++]=a[d+"y"],b[c++]=a[d+"size"],b[c++]=f,b[c++]=0,b[c++]=a[d+"x"],b[c++]=a[d+"y"],b[c++]=a[d+"size"],b[c++]=f,b[c++]=2*Math.PI/3,b[c++]=a[d+"x"],b[c++]=a[d+"y"],b[c++]=a[d+"size"],b[c++]=f,b[c++]=4*Math.PI/3},render:function(a,b,c,d){var e,f=a.getAttribLocation(b,"a_position"),g=a.getAttribLocation(b,"a_size"),h=a.getAttribLocation(b,"a_color"),i=a.getAttribLocation(b,"a_angle"),j=a.getUniformLocation(b,"u_resolution"),k=a.getUniformLocation(b,"u_matrix"),l=a.getUniformLocation(b,"u_ratio"),m=a.getUniformLocation(b,"u_scale");e=a.createBuffer(),a.bindBuffer(a.ARRAY_BUFFER,e),a.bufferData(a.ARRAY_BUFFER,c,a.DYNAMIC_DRAW),a.uniform2f(j,d.width,d.height),a.uniform1f(l,1/Math.pow(d.ratio,d.settings("nodesPowRatio"))),a.uniform1f(m,d.scalingRatio),a.uniformMatrix3fv(k,!1,d.matrix),a.enableVertexAttribArray(f),a.enableVertexAttribArray(g),a.enableVertexAttribArray(h),a.enableVertexAttribArray(i),a.vertexAttribPointer(f,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,0),a.vertexAttribPointer(g,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,8),a.vertexAttribPointer(h,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,12),a.vertexAttribPointer(i,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,16),a.drawArrays(a.TRIANGLES,d.start||0,d.count||c.length/this.ATTRIBUTES)},initProgram:function(a){var b,c,d;return b=sigma.utils.loadShader(a,["attribute vec2 a_position;","attribute float a_size;","attribute float a_color;","attribute float a_angle;","uniform vec2 u_resolution;","uniform float u_ratio;","uniform float u_scale;","uniform mat3 u_matrix;","varying vec4 color;","varying vec2 center;","varying float radius;","void main() {","radius = a_size * u_ratio;","vec2 position = (u_matrix * vec3(a_position, 1)).xy;","center = position * u_scale;","center = vec2(center.x, u_scale * u_resolution.y - center.y);","position = position +","2.0 * radius * vec2(cos(a_angle), sin(a_angle));","position = (position / u_resolution * 2.0 - 1.0) * vec2(1, -1);","radius = radius * u_scale;","gl_Position = vec4(position, 0, 1);","float c = a_color;","color.b = mod(c, 256.0); c = floor(c / 256.0);","color.g = mod(c, 256.0); c = floor(c / 256.0);","color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;","color.a = 1.0;","}"].join("\n"),a.VERTEX_SHADER),c=sigma.utils.loadShader(a,["precision mediump float;","varying vec4 color;","varying vec2 center;","varying float radius;","void main(void) {","vec4 color0 = vec4(0.0, 0.0, 0.0, 0.0);","vec2 m = gl_FragCoord.xy - center;","float diff = radius - sqrt(m.x * m.x + m.y * m.y);","if (diff > 0.0)","gl_FragColor = color;","else","gl_FragColor = color0;","}"].join("\n"),a.FRAGMENT_SHADER),d=sigma.utils.loadProgram(a,[b,c])}}}(),function(){"use strict";sigma.utils.pkg("sigma.webgl.nodes"),sigma.webgl.nodes.fast={POINTS:1,ATTRIBUTES:4,addNode:function(a,b,c,d,e){b[c++]=a[d+"x"],b[c++]=a[d+"y"],b[c++]=a[d+"size"],b[c++]=sigma.utils.floatColor(a.color||e("defaultNodeColor"))},render:function(a,b,c,d){var e,f=a.getAttribLocation(b,"a_position"),g=a.getAttribLocation(b,"a_size"),h=a.getAttribLocation(b,"a_color"),i=a.getUniformLocation(b,"u_resolution"),j=a.getUniformLocation(b,"u_matrix"),k=a.getUniformLocation(b,"u_ratio"),l=a.getUniformLocation(b,"u_scale");e=a.createBuffer(),a.bindBuffer(a.ARRAY_BUFFER,e),a.bufferData(a.ARRAY_BUFFER,c,a.DYNAMIC_DRAW),a.uniform2f(i,d.width,d.height),a.uniform1f(k,1/Math.pow(d.ratio,d.settings("nodesPowRatio"))),a.uniform1f(l,d.scalingRatio),a.uniformMatrix3fv(j,!1,d.matrix),a.enableVertexAttribArray(f),a.enableVertexAttribArray(g),a.enableVertexAttribArray(h),a.vertexAttribPointer(f,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,0),a.vertexAttribPointer(g,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,8),a.vertexAttribPointer(h,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,12),a.drawArrays(a.POINTS,d.start||0,d.count||c.length/this.ATTRIBUTES)},initProgram:function(a){var b,c,d;return b=sigma.utils.loadShader(a,["attribute vec2 a_position;","attribute float a_size;","attribute float a_color;","uniform vec2 u_resolution;","uniform float u_ratio;","uniform float u_scale;","uniform mat3 u_matrix;","varying vec4 color;","void main() {","gl_Position = vec4(","((u_matrix * vec3(a_position, 1)).xy /","u_resolution * 2.0 - 1.0) * vec2(1, -1),","0,","1",");","gl_PointSize = a_size * u_ratio * u_scale * 2.0;","float c = a_color;","color.b = mod(c, 256.0); c = floor(c / 256.0);","color.g = mod(c, 256.0); c = floor(c / 256.0);","color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;","color.a = 1.0;","}"].join("\n"),a.VERTEX_SHADER),c=sigma.utils.loadShader(a,["precision mediump float;","varying vec4 color;","void main(void) {","float border = 0.01;","float radius = 0.5;","vec4 color0 = vec4(0.0, 0.0, 0.0, 0.0);","vec2 m = gl_PointCoord - vec2(0.5, 0.5);","float dist = radius - sqrt(m.x * m.x + m.y * m.y);","float t = 0.0;","if (dist > border)","t = 1.0;","else if (dist > 0.0)","t = dist / border;","gl_FragColor = mix(color0, color, t);","}"].join("\n"),a.FRAGMENT_SHADER),d=sigma.utils.loadProgram(a,[b,c])}}}(),function(){"use strict";sigma.utils.pkg("sigma.webgl.edges"),sigma.webgl.edges.def={POINTS:6,ATTRIBUTES:7,addEdge:function(a,b,c,d,e,f,g){var h=(a[f+"size"]||1)/2,i=b[f+"x"],j=b[f+"y"],k=c[f+"x"],l=c[f+"y"],m=a.color;if(!m)switch(g("edgeColor")){case"source":m=b.color||g("defaultNodeColor");break;case"target":m=c.color||g("defaultNodeColor");break;default:m=g("defaultEdgeColor")}m=sigma.utils.floatColor(m),d[e++]=i,d[e++]=j,d[e++]=k,d[e++]=l,d[e++]=h,d[e++]=0,d[e++]=m,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=1,d[e++]=m,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=0,d[e++]=m,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=0,d[e++]=m,d[e++]=i,d[e++]=j,d[e++]=k,d[e++]=l,d[e++]=h,d[e++]=1,d[e++]=m,d[e++]=i,d[e++]=j,d[e++]=k,d[e++]=l,d[e++]=h,d[e++]=0,d[e++]=m},render:function(a,b,c,d){var e,f=a.getAttribLocation(b,"a_color"),g=a.getAttribLocation(b,"a_position1"),h=a.getAttribLocation(b,"a_position2"),i=a.getAttribLocation(b,"a_thickness"),j=a.getAttribLocation(b,"a_minus"),k=a.getUniformLocation(b,"u_resolution"),l=a.getUniformLocation(b,"u_matrix"),m=a.getUniformLocation(b,"u_matrixHalfPi"),n=a.getUniformLocation(b,"u_matrixHalfPiMinus"),o=a.getUniformLocation(b,"u_ratio"),p=a.getUniformLocation(b,"u_scale");e=a.createBuffer(),a.bindBuffer(a.ARRAY_BUFFER,e),a.bufferData(a.ARRAY_BUFFER,c,a.STATIC_DRAW),a.uniform2f(k,d.width,d.height),a.uniform1f(o,d.ratio/Math.pow(d.ratio,d.settings("edgesPowRatio"))),a.uniform1f(p,d.scalingRatio),a.uniformMatrix3fv(l,!1,d.matrix),a.uniformMatrix2fv(m,!1,sigma.utils.matrices.rotation(Math.PI/2,!0)),a.uniformMatrix2fv(n,!1,sigma.utils.matrices.rotation(-Math.PI/2,!0)),a.enableVertexAttribArray(f),a.enableVertexAttribArray(g),a.enableVertexAttribArray(h),a.enableVertexAttribArray(i),a.enableVertexAttribArray(j),a.vertexAttribPointer(g,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,0),a.vertexAttribPointer(h,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,8),a.vertexAttribPointer(i,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,16),a.vertexAttribPointer(j,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,20),a.vertexAttribPointer(f,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,24),a.drawArrays(a.TRIANGLES,d.start||0,d.count||c.length/this.ATTRIBUTES)},initProgram:function(a){var b,c,d;return b=sigma.utils.loadShader(a,["attribute vec2 a_position1;","attribute vec2 a_position2;","attribute float a_thickness;","attribute float a_minus;","attribute float a_color;","uniform vec2 u_resolution;","uniform float u_ratio;","uniform float u_scale;","uniform mat3 u_matrix;","uniform mat2 u_matrixHalfPi;","uniform mat2 u_matrixHalfPiMinus;","varying vec4 color;","void main() {","vec2 position = a_thickness * u_ratio *","normalize(a_position2 - a_position1);","mat2 matrix = a_minus * u_matrixHalfPiMinus +","(1.0 - a_minus) * u_matrixHalfPi;","position = matrix * position + a_position1;","gl_Position = vec4(","((u_matrix * vec3(position, 1)).xy /","u_resolution * 2.0 - 1.0) * vec2(1, -1),","0,","1",");","float c = a_color;","color.b = mod(c, 256.0); c = floor(c / 256.0);","color.g = mod(c, 256.0); c = floor(c / 256.0);","color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;","color.a = 1.0;","}"].join("\n"),a.VERTEX_SHADER),c=sigma.utils.loadShader(a,["precision mediump float;","varying vec4 color;","void main(void) {","gl_FragColor = color;","}"].join("\n"),a.FRAGMENT_SHADER),d=sigma.utils.loadProgram(a,[b,c])}}}(),function(){"use strict";sigma.utils.pkg("sigma.webgl.edges"),sigma.webgl.edges.fast={POINTS:2,ATTRIBUTES:3,addEdge:function(a,b,c,d,e,f,g){var h=((a[f+"size"]||1)/2,b[f+"x"]),i=b[f+"y"],j=c[f+"x"],k=c[f+"y"],l=a.color;if(!l)switch(g("edgeColor")){case"source":l=b.color||g("defaultNodeColor");break;case"target":l=c.color||g("defaultNodeColor");break;default:l=g("defaultEdgeColor")}l=sigma.utils.floatColor(l),d[e++]=h,d[e++]=i,d[e++]=l,d[e++]=j,d[e++]=k,d[e++]=l},render:function(a,b,c,d){var e,f=a.getAttribLocation(b,"a_color"),g=a.getAttribLocation(b,"a_position"),h=a.getUniformLocation(b,"u_resolution"),i=a.getUniformLocation(b,"u_matrix");e=a.createBuffer(),a.bindBuffer(a.ARRAY_BUFFER,e),a.bufferData(a.ARRAY_BUFFER,c,a.DYNAMIC_DRAW),a.uniform2f(h,d.width,d.height),a.uniformMatrix3fv(i,!1,d.matrix),a.enableVertexAttribArray(g),a.enableVertexAttribArray(f),a.vertexAttribPointer(g,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,0),a.vertexAttribPointer(f,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,8),a.lineWidth(3),a.drawArrays(a.LINES,d.start||0,d.count||c.length/this.ATTRIBUTES)},initProgram:function(a){var b,c,d;return b=sigma.utils.loadShader(a,["attribute vec2 a_position;","attribute float a_color;","uniform vec2 u_resolution;","uniform mat3 u_matrix;","varying vec4 color;","void main() {","gl_Position = vec4(","((u_matrix * vec3(a_position, 1)).xy /","u_resolution * 2.0 - 1.0) * vec2(1, -1),","0,","1",");","float c = a_color;","color.b = mod(c, 256.0); c = floor(c / 256.0);","color.g = mod(c, 256.0); c = floor(c / 256.0);","color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;","color.a = 1.0;","}"].join("\n"),a.VERTEX_SHADER),c=sigma.utils.loadShader(a,["precision mediump float;","varying vec4 color;","void main(void) {","gl_FragColor = color;","}"].join("\n"),a.FRAGMENT_SHADER),d=sigma.utils.loadProgram(a,[b,c])}}}(),function(){"use strict";sigma.utils.pkg("sigma.webgl.edges"),sigma.webgl.edges.arrow={POINTS:9,ATTRIBUTES:11,addEdge:function(a,b,c,d,e,f,g){var h=(a[f+"size"]||1)/2,i=b[f+"x"],j=b[f+"y"],k=c[f+"x"],l=c[f+"y"],m=c[f+"size"],n=a.color;if(!n)switch(g("edgeColor")){case"source":n=b.color||g("defaultNodeColor");break;case"target":n=c.color||g("defaultNodeColor");break;default:n=g("defaultEdgeColor")}n=sigma.utils.floatColor(n),d[e++]=i,d[e++]=j,d[e++]=k,d[e++]=l,d[e++]=h,d[e++]=m,d[e++]=0,d[e++]=0,d[e++]=0,d[e++]=0,d[e++]=n,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=m,d[e++]=1,d[e++]=1,d[e++]=0,d[e++]=0,d[e++]=n,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=m,d[e++]=1,d[e++]=0,d[e++]=0,d[e++]=0,d[e++]=n,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=m,d[e++]=1,d[e++]=0,d[e++]=0,d[e++]=0,d[e++]=n,d[e++]=i,d[e++]=j,d[e++]=k,d[e++]=l,d[e++]=h,d[e++]=m,d[e++]=0,d[e++]=1,d[e++]=0,d[e++]=0,d[e++]=n,d[e++]=i,d[e++]=j,d[e++]=k,d[e++]=l,d[e++]=h,d[e++]=m,d[e++]=0,d[e++]=0,d[e++]=0,d[e++]=0,d[e++]=n,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=m,d[e++]=1,d[e++]=0,d[e++]=1,d[e++]=-1,d[e++]=n,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=m,d[e++]=1,d[e++]=0,d[e++]=1,d[e++]=0,d[e++]=n,d[e++]=k,d[e++]=l,d[e++]=i,d[e++]=j,d[e++]=h,d[e++]=m,d[e++]=1,d[e++]=0,d[e++]=1,d[e++]=1,d[e++]=n},render:function(a,b,c,d){var e,f=a.getAttribLocation(b,"a_pos1"),g=a.getAttribLocation(b,"a_pos2"),h=a.getAttribLocation(b,"a_thickness"),i=a.getAttribLocation(b,"a_tSize"),j=a.getAttribLocation(b,"a_delay"),k=a.getAttribLocation(b,"a_minus"),l=a.getAttribLocation(b,"a_head"),m=a.getAttribLocation(b,"a_headPosition"),n=a.getAttribLocation(b,"a_color"),o=a.getUniformLocation(b,"u_resolution"),p=a.getUniformLocation(b,"u_matrix"),q=a.getUniformLocation(b,"u_matrixHalfPi"),r=a.getUniformLocation(b,"u_matrixHalfPiMinus"),s=a.getUniformLocation(b,"u_ratio"),t=a.getUniformLocation(b,"u_nodeRatio"),u=a.getUniformLocation(b,"u_arrowHead"),v=a.getUniformLocation(b,"u_scale");e=a.createBuffer(),a.bindBuffer(a.ARRAY_BUFFER,e),a.bufferData(a.ARRAY_BUFFER,c,a.STATIC_DRAW),a.uniform2f(o,d.width,d.height),a.uniform1f(s,d.ratio/Math.pow(d.ratio,d.settings("edgesPowRatio"))),a.uniform1f(t,Math.pow(d.ratio,d.settings("nodesPowRatio"))/d.ratio),a.uniform1f(u,5),a.uniform1f(v,d.scalingRatio),a.uniformMatrix3fv(p,!1,d.matrix),a.uniformMatrix2fv(q,!1,sigma.utils.matrices.rotation(Math.PI/2,!0)),a.uniformMatrix2fv(r,!1,sigma.utils.matrices.rotation(-Math.PI/2,!0)),a.enableVertexAttribArray(f),a.enableVertexAttribArray(g),a.enableVertexAttribArray(h),a.enableVertexAttribArray(i),a.enableVertexAttribArray(j),a.enableVertexAttribArray(k),a.enableVertexAttribArray(l),a.enableVertexAttribArray(m),a.enableVertexAttribArray(n),a.vertexAttribPointer(f,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,0),a.vertexAttribPointer(g,2,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,8),a.vertexAttribPointer(h,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,16),a.vertexAttribPointer(i,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,20),a.vertexAttribPointer(j,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,24),a.vertexAttribPointer(k,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,28),a.vertexAttribPointer(l,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,32),a.vertexAttribPointer(m,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,36),a.vertexAttribPointer(n,1,a.FLOAT,!1,this.ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,40),a.drawArrays(a.TRIANGLES,d.start||0,d.count||c.length/this.ATTRIBUTES)},initProgram:function(a){var b,c,d;return b=sigma.utils.loadShader(a,["attribute vec2 a_pos1;","attribute vec2 a_pos2;","attribute float a_thickness;","attribute float a_tSize;","attribute float a_delay;","attribute float a_minus;","attribute float a_head;","attribute float a_headPosition;","attribute float a_color;","uniform vec2 u_resolution;","uniform float u_ratio;","uniform float u_nodeRatio;","uniform float u_arrowHead;","uniform float u_scale;","uniform mat3 u_matrix;","uniform mat2 u_matrixHalfPi;","uniform mat2 u_matrixHalfPiMinus;","varying vec4 color;","void main() {","vec2 pos = normalize(a_pos2 - a_pos1);","mat2 matrix = (1.0 - a_head) *","(","a_minus * u_matrixHalfPiMinus +","(1.0 - a_minus) * u_matrixHalfPi",") + a_head * (","a_headPosition * u_matrixHalfPiMinus * 0.6 +","(a_headPosition * a_headPosition - 1.0) * mat2(1.0)",");","pos = a_pos1 + (","(1.0 - a_head) * a_thickness * u_ratio * matrix * pos +","a_head * u_arrowHead * a_thickness * u_ratio * matrix * pos +","a_delay * pos * (","a_tSize / u_nodeRatio +","u_arrowHead * a_thickness * u_ratio",")",");","gl_Position = vec4(","((u_matrix * vec3(pos, 1)).xy /","u_resolution * 2.0 - 1.0) * vec2(1, -1),","0,","1",");","float c = a_color;","color.b = mod(c, 256.0); c = floor(c / 256.0);","color.g = mod(c, 256.0); c = floor(c / 256.0);","color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;","color.a = 1.0;","}"].join("\n"),a.VERTEX_SHADER),c=sigma.utils.loadShader(a,["precision mediump float;","varying vec4 color;","void main(void) {","gl_FragColor = color;","}"].join("\n"),a.FRAGMENT_SHADER),d=sigma.utils.loadProgram(a,[b,c])}}}(),function(a){"use strict";function b(a,b){if(1>=b)return[a];for(var d=a.split(" "),e=[],f=0,g=-1,h=[],i=!0,j=0;j<d.length;++j)if(i){if(d[j].length>b){for(var k=c(d[j],b),l=0;l<k.length;++l)e.push([k[l]]),++g;f=k[k.length-1].length}else e.push([d[j]]),++g,f=d[j].length+1;i=!1}else f+d[j].length<=b?(e[g].push(d[j]),f+=d[j].length+1):(i=!0,--j);for(j=0;j<e.length;++j)h.push(e[j].join(" "));return h}function c(a,b){for(var c=[],d=0;d<a.length;d+=b-1)c.push(a.substr(d,b-1)+"-");var e=c[c.length-1].length;return c[c.length-1]=c[c.length-1].substr(0,e-1)+" ",c}if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.canvas.labels"),sigma.canvas.labels.def=function(a,c,d,e){var f,g,h,i,j=d("prefix")||"",k=a[j+"size"]||1,l=d("fontStyle"),m=d("nodeBorderSize"),n=d("labelAlignment"),o=d("maxNodeLabelLineLength")||0;if(!(k<=d("labelThreshold"))&&a.label&&"string"==typeof a.label){f="fixed"===d("labelSize")?d("defaultLabelSize"):d("labelSizeRatio")*k;var p=(l?l+" ":"")+f+"px "+(a.active?d("activeFont")||d("font"):d("font"));switch(e&&e.ctx.font!=p?(c.font=p,e.ctx.font=p):c.font=p,c.fillStyle="node"===d("labelColor")?a.color||d("defaultNodeColor"):d("defaultLabelColor"),h=0,i=f/3,c.textAlign="center",n){case"bottom":i=+k+4*f/3;break;case"center":break;case"left":c.textAlign="right",h=-k-m-3;break;case"top":i=-k-2*f/3;break;case"inside":if(g=sigma.utils.canvas.getTextWidth(c,d("approximateLabelWidth"),f,a.label),2*(k+f/3)>=g)break;case"right":default:h=k+m+3,c.textAlign="left"}for(var q=b(a.label,o),r=a[j+"x"]+h,s=Math.round(a[j+"y"]+i),t=0;t<q.length;++t)c.fillText(q[t],r,s+t*(f+1))}}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.canvas.hovers"),sigma.canvas.hovers.def=function(a,b,c){function d(a,b,d,e,f,g){var h=g>1&&f.length>1?.6*g*d:sigma.utils.canvas.getTextWidth(b,c("approximateLabelWidth"),d,f[0]),i=Math.round(e[m+"x"]),k=Math.round(e[m+"y"]),l=(d+1)*f.length+4,o=Math.round(n+d/4),p=Math.round(h+n+1.5+d/3);if(e.label&&"string"==typeof e.label)switch(a){case"center":break;case"left":i=Math.round(e[m+"x"]+d/2+2),k=Math.round(e[m+"y"]-d/2-2),b.moveTo(i,k+o),b.arcTo(i,k,i-o,k,o),b.lineTo(i-p-j-o,k),b.lineTo(i-p-j-o,k+l),b.lineTo(i-o,k+l),b.arcTo(i,k+l,i,k+l-o,o),b.lineTo(i,k+o);break;case"top":b.rect(i-p/2,k-o-l,p,l);break;case"bottom":b.rect(i-p/2,k+o,p,l);break;case"inside":if(2*o>=h)break;case"right":default:i=Math.round(e[m+"x"]-d/2-2),k=Math.round(e[m+"y"]-d/2-2),b.moveTo(i,k+o),b.arcTo(i,k,i+o,k,o),b.lineTo(i+p+j+o,k),b.lineTo(i+p+j+o,k+l),b.lineTo(i+o,k+l),b.arcTo(i,k+l,i,k+l-o,o),b.lineTo(i,k+o)}b.closePath(),b.fill(),b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0}function e(a,b){if(1>=b)return[a];for(var c=a.split(" "),d=[],e=0,g=-1,h=[],i=!0,j=0;j<c.length;++j)if(i){if(c[j].length>b){for(var k=f(c[j],b),l=0;l<k.length;++l)d.push([k[l]]),++g;e=k[k.length-1].length}else d.push([c[j]]),++g,e=c[j].length+1;i=!1}else e+c[j].length<=b?(d[g].push(c[j]),e+=c[j].length+1):(i=!0,--j);for(j=0;j<d.length;++j)h.push(d[j].join(" "));return h}function f(a,b){for(var c=[],d=0;d<a.length;d+=b-1)c.push(a.substr(d,b-1)+"-");var e=c[c.length-1].length;return c[c.length-1]=c[c.length-1].substr(0,e-1)+" ",c}var g,h,i,j=c("nodeBorderSize"),k=c("labelAlignment"),l=c("hoverFontStyle")||c("fontStyle"),m=c("prefix")||"",n=a[m+"size"],o=c("maxNodeLabelLineLength")||0,p="fixed"===c("labelSize")?c("defaultLabelSize"):c("labelSizeRatio")*n;b.font=(l?l+" ":"")+p+"px "+(c("hoverFont")||c("font")),b.beginPath(),b.fillStyle="node"===c("labelHoverBGColor")?a.color||c("defaultNodeColor"):c("defaultHoverLabelBGColor"),c("labelHoverShadow")&&(b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=8,b.shadowColor=c("labelHoverShadowColor")),g=e(a.label,o),d(k,b,p,a,g,o),j>0&&(b.beginPath(),b.fillStyle="node"===c("nodeBorderColor")?a.color||c("defaultNodeColor"):c("defaultNodeBorderColor"),b.arc(a[m+"x"],a[m+"y"],n+j,0,2*Math.PI,!0),b.closePath(),b.fill());var q=sigma.canvas.nodes[a.type]||sigma.canvas.nodes.def;if(q(a,b,c),a.label&&"string"==typeof a.label){b.fillStyle="node"===c("labelHoverColor")?a.color||c("defaultNodeColor"):c("defaultLabelHoverColor");var r=sigma.utils.canvas.getTextWidth(b,c("approximateLabelWidth"),p,a.label),s=-r/2,t=p/3;switch(k){case"bottom":t=+n+4*p/3;break;case"center":break;case"left":s=-n-j-3-r;break;case"top":t=-n-2*p/3;break;case"inside":if(2*(n+p/3)>=r)break;case"right":default:s=n+j+3}h=a[m+"x"]+s,i=Math.round(a[m+"y"]+t);for(var u=0;u<g.length;++u)b.fillText(g[u],h,i+u*(p+1))}}}.call(this),function(){"use strict";sigma.utils.pkg("sigma.canvas.nodes"),sigma.canvas.nodes.def=function(a,b,c){var d=c("prefix")||"";b.fillStyle=a.color||c("defaultNodeColor"),b.beginPath(),b.arc(a[d+"x"],a[d+"y"],a[d+"size"],0,2*Math.PI,!0),b.closePath(),b.fill()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.def=function(a,b,c,d,e){var f=a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor");if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}d.strokeStyle=f,d.lineWidth=h,d.beginPath(),d.moveTo(b[g+"x"],b[g+"y"]),d.lineTo(c[g+"x"],c[g+"y"]),d.stroke()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.curve=function(a,b,c,d,e){var f=a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l={},m=b[g+"size"],n=b[g+"x"],o=b[g+"y"],p=c[g+"x"],q=c[g+"y"];if(l=b.id===c.id?sigma.utils.getSelfLoopControlPoints(n,o,m):sigma.utils.getQuadraticControlPoint(n,o,p,q,a.cc),!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}d.strokeStyle=f,d.lineWidth=h,d.beginPath(),d.moveTo(n,o),b.id===c.id?d.bezierCurveTo(l.x1,l.y1,l.x2,l.y2,p,q):d.quadraticCurveTo(l.x,l.y,p,q),d.stroke()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.arrow=function(a,b,c,d,e){var f=a.color,g=e("prefix")||"",h=e("edgeColor"),i=e("defaultNodeColor"),j=e("defaultEdgeColor"),k=a[g+"size"]||1,l=c[g+"size"],m=b[g+"x"],n=b[g+"y"],o=c[g+"x"],p=c[g+"y"],q=Math.max(2.5*k,e("minArrowSize")),r=Math.sqrt((o-m)*(o-m)+(p-n)*(p-n)),s=m+(o-m)*(r-q-l)/r,t=n+(p-n)*(r-q-l)/r,u=(o-m)*q/r,v=(p-n)*q/r;if(!f)switch(h){case"source":f=b.color||i;break;case"target":f=c.color||i;break;default:f=j}d.strokeStyle=f,d.lineWidth=k,d.beginPath(),d.moveTo(m,n),d.lineTo(s,t),d.stroke(),d.fillStyle=f,d.beginPath(),d.moveTo(s+u,t+v),d.lineTo(s+.6*v,t-.6*u),d.lineTo(s-.6*v,t+.6*u),d.lineTo(s+u,t+v),d.closePath(),d.fill()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edges"),sigma.canvas.edges.curvedArrow=function(a,b,c,d,e){var f,g,h,i,j,k=a.color,l=e("prefix")||"",m=e("edgeColor"),n=e("defaultNodeColor"),o=e("defaultEdgeColor"),p={},q=a[l+"size"]||1,r=c[l+"size"],s=b[l+"x"],t=b[l+"y"],u=c[l+"x"],v=c[l+"y"],w=Math.max(2.5*q,e("minArrowSize"));
if(p=b.id===c.id?sigma.utils.getSelfLoopControlPoints(s,t,r):sigma.utils.getQuadraticControlPoint(s,t,u,v,a.cc),b.id===c.id?(f=Math.sqrt((u-p.x1)*(u-p.x1)+(v-p.y1)*(v-p.y1)),g=p.x1+(u-p.x1)*(f-w-r)/f,h=p.y1+(v-p.y1)*(f-w-r)/f,i=(u-p.x1)*w/f,j=(v-p.y1)*w/f):(f=Math.sqrt((u-p.x)*(u-p.x)+(v-p.y)*(v-p.y)),g=p.x+(u-p.x)*(f-w-r)/f,h=p.y+(v-p.y)*(f-w-r)/f,i=(u-p.x)*w/f,j=(v-p.y)*w/f),!k)switch(m){case"source":k=b.color||n;break;case"target":k=c.color||n;break;default:k=o}d.strokeStyle=k,d.lineWidth=q,d.beginPath(),d.moveTo(s,t),b.id===c.id?d.bezierCurveTo(p.x2,p.y2,p.x1,p.y1,g,h):d.quadraticCurveTo(p.x,p.y,g,h),d.stroke(),d.fillStyle=k,d.beginPath(),d.moveTo(g+i,h+j),d.lineTo(g+.6*j,h-.6*i),d.lineTo(g-.6*j,h+.6*i),d.lineTo(g+i,h+j),d.closePath(),d.fill()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.def=function(a,b,c,d,e){var f=a.color,g=e("prefix")||"",h=a[g+"size"]||1,i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor");if(!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}f="edge"===e("edgeHoverColor")?a.hover_color||f:a.hover_color||e("defaultEdgeHoverColor")||f,h*=e("edgeHoverSizeRatio"),d.strokeStyle=f,d.lineWidth=h,d.beginPath(),d.moveTo(b[g+"x"],b[g+"y"]),d.lineTo(c[g+"x"],c[g+"y"]),d.stroke()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.curve=function(a,b,c,d,e){var f=a.color,g=e("prefix")||"",h=e("edgeHoverSizeRatio")*(a[g+"size"]||1),i=e("edgeColor"),j=e("defaultNodeColor"),k=e("defaultEdgeColor"),l={},m=b[g+"size"],n=b[g+"x"],o=b[g+"y"],p=c[g+"x"],q=c[g+"y"];if(l=b.id===c.id?sigma.utils.getSelfLoopControlPoints(n,o,m):sigma.utils.getQuadraticControlPoint(n,o,p,q,a.cc),!f)switch(i){case"source":f=b.color||j;break;case"target":f=c.color||j;break;default:f=k}f="edge"===e("edgeHoverColor")?a.hover_color||f:a.hover_color||e("defaultEdgeHoverColor")||f,d.strokeStyle=f,d.lineWidth=h,d.beginPath(),d.moveTo(n,o),b.id===c.id?d.bezierCurveTo(l.x1,l.y1,l.x2,l.y2,p,q):d.quadraticCurveTo(l.x,l.y,p,q),d.stroke()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.arrow=function(a,b,c,d,e){var f=a.color,g=e("prefix")||"",h=e("edgeColor"),i=e("defaultNodeColor"),j=e("defaultEdgeColor"),k=a[g+"size"]||1,l=c[g+"size"],m=b[g+"x"],n=b[g+"y"],o=c[g+"x"],p=c[g+"y"];k=a.hover?e("edgeHoverSizeRatio")*k:k;var q=Math.max(2.5*k,e("minArrowSize")),r=Math.sqrt((o-m)*(o-m)+(p-n)*(p-n)),s=m+(o-m)*(r-q-l)/r,t=n+(p-n)*(r-q-l)/r,u=(o-m)*q/r,v=(p-n)*q/r;if(!f)switch(h){case"source":f=b.color||i;break;case"target":f=c.color||i;break;default:f=j}f="edge"===e("edgeHoverColor")?a.hover_color||f:a.hover_color||e("defaultEdgeHoverColor")||f,d.strokeStyle=f,d.lineWidth=k,d.beginPath(),d.moveTo(m,n),d.lineTo(s,t),d.stroke(),d.fillStyle=f,d.beginPath(),d.moveTo(s+u,t+v),d.lineTo(s+.6*v,t-.6*u),d.lineTo(s-.6*v,t+.6*u),d.lineTo(s+u,t+v),d.closePath(),d.fill()}}(),function(){"use strict";sigma.utils.pkg("sigma.canvas.edgehovers"),sigma.canvas.edgehovers.curvedArrow=function(a,b,c,d,e){var f,g,h,i,j,k,l=a.color,m=e("prefix")||"",n=e("edgeColor"),o=e("defaultNodeColor"),p=e("defaultEdgeColor"),q={},r=e("edgeHoverSizeRatio")*(a[m+"size"]||1),s=c[m+"size"],t=b[m+"x"],u=b[m+"y"],v=c[m+"x"],w=c[m+"y"];if(q=b.id===c.id?sigma.utils.getSelfLoopControlPoints(t,u,s):sigma.utils.getQuadraticControlPoint(t,u,v,w,a.cc),b.id===c.id?(f=Math.sqrt((v-q.x1)*(v-q.x1)+(w-q.y1)*(w-q.y1)),g=Math.max(2.5*r,e("minArrowSize")),h=q.x1+(v-q.x1)*(f-g-s)/f,i=q.y1+(w-q.y1)*(f-g-s)/f,j=(v-q.x1)*g/f,k=(w-q.y1)*g/f):(f=Math.sqrt((v-q.x)*(v-q.x)+(w-q.y)*(w-q.y)),g=2.5*r,h=q.x+(v-q.x)*(f-g-s)/f,i=q.y+(w-q.y)*(f-g-s)/f,j=(v-q.x)*g/f,k=(w-q.y)*g/f),!l)switch(n){case"source":l=b.color||o;break;case"target":l=c.color||o;break;default:l=p}l="edge"===e("edgeHoverColor")?a.hover_color||l:a.hover_color||e("defaultEdgeHoverColor")||l,d.strokeStyle=l,d.lineWidth=r,d.beginPath(),d.moveTo(t,u),b.id===c.id?d.bezierCurveTo(q.x2,q.y2,q.x1,q.y1,h,i):d.quadraticCurveTo(q.x,q.y,h,i),d.stroke(),d.fillStyle=l,d.beginPath(),d.moveTo(h+j,i+k),d.lineTo(h+.6*k,i-.6*j),d.lineTo(h-.6*k,i+.6*j),d.lineTo(h+j,i+k),d.closePath(),d.fill()}}(),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.canvas.extremities"),sigma.canvas.extremities.def=function(a,b,c,d,e){(sigma.canvas.hovers[b.type]||sigma.canvas.hovers.def)(b,d,e),(sigma.canvas.hovers[c.type]||sigma.canvas.hovers.def)(c,d,e)}}.call(this),function(){"use strict";sigma.utils.pkg("sigma.svg.utils"),sigma.svg.utils={show:function(a){return a.style.display="",this},hide:function(a){return a.style.display="none",this}}}(),function(){"use strict";sigma.utils.pkg("sigma.svg.nodes"),sigma.svg.nodes.def={create:function(a,b){var c=(b("prefix")||"",document.createElementNS(b("xmlns"),"circle"));return c.setAttributeNS(null,"data-node-id",a.id),c.setAttributeNS(null,"class",b("classPrefix")+"-node"),c.setAttributeNS(null,"fill",a.color||b("defaultNodeColor")),c},update:function(a,b,c){var d=c("prefix")||"";return b.setAttributeNS(null,"cx",a[d+"x"]),b.setAttributeNS(null,"cy",a[d+"y"]),b.setAttributeNS(null,"r",a[d+"size"]),c("freeStyle")||b.setAttributeNS(null,"fill",a.color||c("defaultNodeColor")),b.style.display="",this}}}(),function(){"use strict";sigma.utils.pkg("sigma.svg.edges"),sigma.svg.edges.def={create:function(a,b,c,d){var e=a.color,f=(d("prefix")||"",d("edgeColor")),g=d("defaultNodeColor"),h=d("defaultEdgeColor");if(!e)switch(f){case"source":e=b.color||g;break;case"target":e=c.color||g;break;default:e=h}var i=document.createElementNS(d("xmlns"),"line");return i.setAttributeNS(null,"data-edge-id",a.id),i.setAttributeNS(null,"class",d("classPrefix")+"-edge"),i.setAttributeNS(null,"stroke",e),i},update:function(a,b,c,d,e){var f=e("prefix")||"";return b.setAttributeNS(null,"stroke-width",a[f+"size"]||1),b.setAttributeNS(null,"x1",c[f+"x"]),b.setAttributeNS(null,"y1",c[f+"y"]),b.setAttributeNS(null,"x2",d[f+"x"]),b.setAttributeNS(null,"y2",d[f+"y"]),b.style.display="",this}}}(),function(){"use strict";sigma.utils.pkg("sigma.svg.edges"),sigma.svg.edges.curve={create:function(a,b,c,d){var e=a.color,f=(d("prefix")||"",d("edgeColor")),g=d("defaultNodeColor"),h=d("defaultEdgeColor");if(!e)switch(f){case"source":e=b.color||g;break;case"target":e=c.color||g;break;default:e=h}var i=document.createElementNS(d("xmlns"),"path");return i.setAttributeNS(null,"data-edge-id",a.id),i.setAttributeNS(null,"class",d("classPrefix")+"-edge"),i.setAttributeNS(null,"stroke",e),i},update:function(a,b,c,d,e){var f,g,h=e("prefix")||"",i=c[h+"size"],j=c[h+"x"],k=c[h+"y"],l=d[h+"x"],m=d[h+"y"];return b.setAttributeNS(null,"stroke-width",a[h+"size"]||1),c.id===d.id?(f=sigma.utils.getSelfLoopControlPoints(j,k,i),g="M"+j+","+k+" C"+f.x1+","+f.y1+" "+f.x2+","+f.y2+" "+l+","+m):(f=sigma.utils.getQuadraticControlPoint(j,k,l,m,a.cc),g="M"+j+","+k+" Q"+f.x+","+f.y+" "+l+","+m),b.setAttributeNS(null,"d",g),b.setAttributeNS(null,"fill","none"),b.style.display="",this}}}(),function(){"use strict";sigma.utils.pkg("sigma.svg.edges"),sigma.svg.edges.curvedArrow={create:function(a,b,c,d){var e=a.color,f=(d("prefix")||"",d("edgeColor")),g=d("defaultNodeColor"),h=d("defaultEdgeColor");if(!e)switch(f){case"source":e=b.color||g;break;case"target":e=c.color||g;break;default:e=h}var i=document.createElementNS(d("xmlns"),"path");return i.setAttributeNS(null,"data-edge-id",a.id),i.setAttributeNS(null,"class",d("classPrefix")+"-edge"),i.setAttributeNS(null,"stroke",e),i},update:function(a,b,c,d,e){var f,g,h=e("prefix")||"",i=c[h+"size"],j=c[h+"x"],k=c[h+"y"],l=d[h+"x"],m=d[h+"y"];return b.setAttributeNS(null,"stroke-width",a[h+"size"]||1),c.id===d.id?(f=sigma.utils.getSelfLoopControlPoints(j,k,i),g="M"+j+","+k+" C"+f.x1+","+f.y1+" "+f.x2+","+f.y2+" "+l+","+m):(f=sigma.utils.getQuadraticControlPoint(j,k,l,m,a.cc),g="M"+j+","+k+" Q"+f.x+","+f.y+" "+l+","+m),b.setAttributeNS(null,"d",g),b.setAttributeNS(null,"fill","none"),b.style.display="",this}}}(),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.svg.labels"),sigma.svg.labels.def={create:function(a,b){var c=b("prefix")||"",d=a[c+"size"],e=document.createElementNS(b("xmlns"),"text"),f="fixed"===b("labelSize")?b("defaultLabelSize"):b("labelSizeRatio")*d,g="node"===b("labelColor")?a.color||b("defaultNodeColor"):b("defaultLabelColor");return e.setAttributeNS(null,"data-label-target",a.id),e.setAttributeNS(null,"class",b("classPrefix")+"-label"),e.setAttributeNS(null,"font-size",f),e.setAttributeNS(null,"font-family",b("font")),e.setAttributeNS(null,"fill",g),e.innerHTML=a.label,e.textContent=a.label,e},update:function(a,b,c){var d=c("prefix")||"",e=a[d+"size"],f="fixed"===c("labelSize")?c("defaultLabelSize"):c("labelSizeRatio")*e;return!c("forceLabels")&&e<c("labelThreshold")||"string"!=typeof a.label?void 0:(b.setAttributeNS(null,"x",Math.round(a[d+"x"]+e+3)),b.setAttributeNS(null,"y",Math.round(a[d+"y"]+f/3)),b.style.display="",this)}}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.svg.hovers"),sigma.svg.hovers.def={create:function(a,b,c,d){var e,f,g,h,i,j=(d("hoverFontStyle")||d("fontStyle"),d("prefix")||""),k=a[j+"size"],l="fixed"===d("labelSize")?d("defaultLabelSize"):d("labelSizeRatio")*k,m="node"===d("labelHoverColor")?a.color||d("defaultNodeColor"):d("defaultLabelHoverColor"),n=document.createElementNS(d("xmlns"),"g"),o=document.createElementNS(d("xmlns"),"rect"),p=document.createElementNS(d("xmlns"),"circle"),q=document.createElementNS(d("xmlns"),"text");return n.setAttributeNS(null,"class",d("classPrefix")+"-hover"),n.setAttributeNS(null,"data-node-id",a.id),"string"==typeof a.label&&(q.innerHTML=a.label,q.textContent=a.label,q.setAttributeNS(null,"class",d("classPrefix")+"-hover-label"),q.setAttributeNS(null,"font-size",l),q.setAttributeNS(null,"font-family",d("font")),q.setAttributeNS(null,"fill",m),q.setAttributeNS(null,"x",Math.round(a[j+"x"]+k+3)),q.setAttributeNS(null,"y",Math.round(a[j+"y"]+l/3)),e=Math.round(a[j+"x"]-l/2-2),f=Math.round(a[j+"y"]-l/2-2),g=Math.round(c.measureText(a.label).width+l/2+k+9),h=Math.round(l+4),i=Math.round(l/2+2),p.setAttributeNS(null,"class",d("classPrefix")+"-hover-area"),p.setAttributeNS(null,"fill","#fff"),p.setAttributeNS(null,"cx",a[j+"x"]),p.setAttributeNS(null,"cy",a[j+"y"]),p.setAttributeNS(null,"r",i),o.setAttributeNS(null,"class",d("classPrefix")+"-hover-area"),o.setAttributeNS(null,"fill","#fff"),o.setAttributeNS(null,"x",a[j+"x"]+i/4),o.setAttributeNS(null,"y",a[j+"y"]-i),o.setAttributeNS(null,"width",g),o.setAttributeNS(null,"height",h)),n.appendChild(p),n.appendChild(o),n.appendChild(q),n.appendChild(b),n}}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.middlewares"),sigma.utils.pkg("sigma.utils"),sigma.middlewares.rescale=function(a,b,c){var d,e,f,g,h,i,j,k,l=this.graph.nodes(),m=this.graph.edges(),n=this.settings.embedObjects(c||{}),o=n("bounds")||sigma.utils.getBoundaries(this.graph,a,!0),p=o.minX,q=o.minY,r=o.maxX,s=o.maxY,t=o.sizeMax,u=o.weightMax,v=n("width")||1,w=n("height")||1,x=n("autoRescale"),y={nodePosition:1,nodeSize:1,edgeSize:1};for(x instanceof Array||(x=["nodePosition","nodeSize","edgeSize"]),d=0,e=x.length;e>d;d++)if(!y[x[d]])throw new Error('The rescale setting "'+x[d]+'" is not recognized.');var z=~x.indexOf("nodePosition"),A=~x.indexOf("nodeSize"),B=~x.indexOf("edgeSize");for(z&&(j="outside"===n("scalingMode")?Math.max(v/Math.max(r-p,1),w/Math.max(s-q,1)):Math.min(v/Math.max(r-p,1),w/Math.max(s-q,1)),k=(n("rescaleIgnoreSize")?0:(n("maxNodeSize")||t)/j)+(n("sideMargin")||0),r+=k,p-=k,s+=k,q-=k,j="outside"===n("scalingMode")?Math.max(v/Math.max(r-p,1),w/Math.max(s-q,1)):Math.min(v/Math.max(r-p,1),w/Math.max(s-q,1))),n("maxNodeSize")||n("minNodeSize")?n("maxNodeSize")===n("minNodeSize")?(f=0,g=+n("maxNodeSize")):(f=(n("maxNodeSize")-n("minNodeSize"))/t,g=+n("minNodeSize")):(f=1,g=0),n("maxEdgeSize")||n("minEdgeSize")?n("maxEdgeSize")===n("minEdgeSize")?(h=0,i=+n("minEdgeSize")):(h=(n("maxEdgeSize")-n("minEdgeSize"))/u,i=+n("minEdgeSize")):(h=1,i=0),d=0,e=m.length;e>d;d++)m[d][b+"size"]=m[d][a+"size"]*(B?h:1)+(B?i:0);for(d=0,e=l.length;e>d;d++)l[d][b+"size"]=l[d][a+"size"]*(A?f:1)+(A?g:0),z?(l[d][b+"x"]=(l[d][a+"x"]-(r+p)/2)*j,l[d][b+"y"]=(l[d][a+"y"]-(s+q)/2)*j):(l[d][b+"x"]=l[d][a+"x"],l[d][b+"y"]=l[d][a+"y"])},sigma.utils.getBoundaries=function(a,b,c){var d,e,f=a.edges(),g=a.nodes(),h=-(1/0),i=-(1/0),j=1/0,k=1/0,l=-(1/0),m=-(1/0);if(c)for(d=0,e=f.length;e>d;d++)h=Math.max(f[d][b+"size"],h);for(d=0,e=g.length;e>d;d++)i=Math.max(g[d][b+"size"],i),l=Math.max(g[d][b+"x"],l),j=Math.min(g[d][b+"x"],j),m=Math.max(g[d][b+"y"],m),k=Math.min(g[d][b+"y"],k);return h=h||1,i=i||1,{weightMax:h,sizeMax:i,minX:j,minY:k,maxX:l,maxY:m}}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.middlewares"),sigma.middlewares.copy=function(a,b){var c,d,e;if(b+""!=a+""){for(e=this.graph.nodes(),c=0,d=e.length;d>c;c++)e[c][b+"x"]=e[c][a+"x"],e[c][b+"y"]=e[c][a+"y"],e[c][b+"size"]=e[c][a+"size"];for(e=this.graph.edges(),c=0,d=e.length;d>c;c++)e[c][b+"size"]=e[c][a+"size"]}}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.misc.animation.running");var b=function(){var a=0;return function(){return""+ ++a}}();sigma.misc.animation.camera=function(c,d,e){if(!(c instanceof sigma.classes.camera&&"object"==typeof d&&d))throw"animation.camera: Wrong arguments.";if("number"!=typeof d.x&&"number"!=typeof d.y&&"number"!=typeof d.ratio&&"number"!=typeof d.angle)throw"There must be at least one valid coordinate in the given val.";var f,g,h,i,j,k,l=e||{},m=sigma.utils.dateNow();return k={x:c.x,y:c.y,ratio:c.ratio,angle:c.angle},j=l.duration,i="function"!=typeof l.easing?sigma.utils.easings[l.easing||"quadraticInOut"]:l.easing,f=function(){var b,e=l.duration?(sigma.utils.dateNow()-m)/l.duration:1;e>=1?(c.isAnimated=!1,c.goTo({x:d.x!==a?d.x:k.x,y:d.y!==a?d.y:k.y,ratio:d.ratio!==a?d.ratio:k.ratio,angle:d.angle!==a?d.angle:k.angle}),cancelAnimationFrame(g),delete sigma.misc.animation.running[g],"function"==typeof l.onComplete&&l.onComplete()):(b=i(e),c.isAnimated=!0,c.goTo({x:d.x!==a?k.x+(d.x-k.x)*b:k.x,y:d.y!==a?k.y+(d.y-k.y)*b:k.y,ratio:d.ratio!==a?k.ratio+(d.ratio-k.ratio)*b:k.ratio,angle:d.angle!==a?k.angle+(d.angle-k.angle)*b:k.angle}),"function"==typeof l.onNewFrame&&l.onNewFrame(),h.frameId=requestAnimationFrame(f))},g=b(),h={frameId:requestAnimationFrame(f),target:c,type:"camera",options:l,fn:f},sigma.misc.animation.running[g]=h,g},sigma.misc.animation.kill=function(a){if(1!==arguments.length||"number"!=typeof a)throw"animation.kill: Wrong arguments.";var b=sigma.misc.animation.running[a];return b&&(cancelAnimationFrame(a),delete sigma.misc.animation.running[b.frameId],"camera"===b.type&&(b.target.isAnimated=!1),"function"==typeof(b.options||{}).onComplete&&b.options.onComplete()),this},sigma.misc.animation.killAll=function(a){var b,c,d=0,e="string"==typeof a?a:null,f="object"==typeof a?a:null,g=sigma.misc.animation.running;for(c in g)e&&g[c].type!==e||f&&g[c].target!==f||(b=sigma.misc.animation.running[c],cancelAnimationFrame(b.frameId),delete sigma.misc.animation.running[c],"camera"===b.type&&(b.target.isAnimated=!1),d++,"function"==typeof(b.options||{}).onComplete&&b.options.onComplete());return d},sigma.misc.animation.has=function(a){var b,c="string"==typeof a?a:null,d="object"==typeof a?a:null,e=sigma.misc.animation.running;for(b in e)if(!(c&&e[b].type!==c||d&&e[b].target!==d))return!0;return!1}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.misc"),sigma.misc.bindEvents=function(b){function c(a){a&&(h="x"in a.data?a.data.x:h,i="y"in a.data?a.data.y:i);var c,d,e,f,g,k,l,m,n=[],o=h+j.width/2,p=i+j.height/2,q=j.camera.cameraPosition(h,i),r=j.camera.quadtree.point(q.x,q.y);if(r.length)for(c=0,e=r.length;e>c;c++)if(f=r[c],g=f[b+"x"],k=f[b+"y"],l=f[b+"size"],!f.hidden&&o>g-l&&g+l>o&&p>k-l&&k+l>p&&Math.sqrt((o-g)*(o-g)+(p-k)*(p-k))<l){for(m=!1,d=0;d<n.length;d++)if(f.size>n[d].size){n.splice(d,0,f),m=!0;break}m||n.push(f)}return n}function d(c){function d(a,b){for(r=!1,g=0;g<a.length;g++)if(b.size>a[g].size){a.splice(g,0,b),r=!0;break}r||a.push(b)}if(!j.settings("enableEdgeHovering"))return[];var e=sigma.renderers.canvas&&j instanceof sigma.renderers.canvas;if(!e)throw new Error("The edge events feature is not compatible with the WebGL renderer");c&&(h="x"in c.data?c.data.x:h,i="y"in c.data?c.data.y:i);var f,g,k,l,m,n,o,p,q,r,s=j.settings("edgeHoverPrecision"),t={},u=[],v=h+j.width/2,w=i+j.height/2,x=j.camera.cameraPosition(h,i),y=[];if(e){var z=j.camera.quadtree.area(j.camera.getRectangle(j.width,j.height));for(l=z,f=0,k=l.length;k>f;f++)t[l[f].id]=l[f]}if(j.camera.edgequadtree!==a&&(y=j.camera.edgequadtree.point(x.x,x.y)),y.length)for(f=0,k=y.length;k>f;f++)m=y[f],o=j.graph.nodes(m.source),p=j.graph.nodes(m.target),n=m[b+"size"]||m["read_"+b+"size"],!m.hidden&&!o.hidden&&!p.hidden&&(!e||t[m.source]||t[m.target])&&sigma.utils.getDistance(o[b+"x"],o[b+"y"],v,w)>o[b+"size"]&&sigma.utils.getDistance(p[b+"x"],p[b+"y"],v,w)>p[b+"size"]&&("curve"==m.type||"curvedArrow"==m.type?o.id===p.id?(q=sigma.utils.getSelfLoopControlPoints(o[b+"x"],o[b+"y"],o[b+"size"]),sigma.utils.isPointOnBezierCurve(v,w,o[b+"x"],o[b+"y"],p[b+"x"],p[b+"y"],q.x1,q.y1,q.x2,q.y2,Math.max(n,s))&&d(u,m)):(q=sigma.utils.getQuadraticControlPoint(o[b+"x"],o[b+"y"],p[b+"x"],p[b+"y"],m.cc),sigma.utils.isPointOnQuadraticCurve(v,w,o[b+"x"],o[b+"y"],p[b+"x"],p[b+"y"],q.x,q.y,Math.max(n,s))&&d(u,m)):sigma.utils.isPointOnSegment(v,w,o[b+"x"],o[b+"y"],p[b+"x"],p[b+"y"],Math.max(n,s))&&d(u,m));return u}function e(a){function b(a){j.settings("eventsEnabled")&&(j.dispatchEvent("click",a.data),i=c(a),k=d(a),i.length?(j.dispatchEvent("clickNode",{node:i[0],captor:a.data}),j.dispatchEvent("clickNodes",{node:i,captor:a.data})):k.length?(j.dispatchEvent("clickEdge",{edge:k[0],captor:a.data}),j.dispatchEvent("clickEdges",{edge:k,captor:a.data})):j.dispatchEvent("clickStage",{captor:a.data}))}function e(a){j.settings("eventsEnabled")&&(j.dispatchEvent("doubleClick",a.data),i=c(a),k=d(a),i.length?(j.dispatchEvent("doubleClickNode",{node:i[0],captor:a.data}),j.dispatchEvent("doubleClickNodes",{node:i,captor:a.data})):k.length?(j.dispatchEvent("doubleClickEdge",{edge:k[0],captor:a.data}),j.dispatchEvent("doubleClickEdges",{edge:k,captor:a.data})):j.dispatchEvent("doubleClickStage",{captor:a.data}))}function f(a){j.settings("eventsEnabled")&&(j.dispatchEvent("rightClick",a.data),i=c(a),k=d(a),i.length?(j.dispatchEvent("rightClickNode",{node:i[0],captor:a.data}),j.dispatchEvent("rightClickNodes",{node:i,captor:a.data})):k.length?(j.dispatchEvent("rightClickEdge",{edge:k[0],captor:a.data}),j.dispatchEvent("rightClickEdges",{edge:k,captor:a.data})):j.dispatchEvent("rightClickStage",{captor:a.data}))}function g(a){if(j.settings("eventsEnabled")){var b,c={current:{nodes:[],edges:[]},enter:{nodes:[],edges:[]},leave:{nodes:[],edges:[]},captor:a.data},d=c.leave;for(b in l)d.nodes.push(l[b]);for(b in m)d.edges.push(m[b]);l={},m={},(d.nodes.length||d.edges.length)&&j.dispatchEvent("hovers",c)}}function h(a){if(j.settings("eventsEnabled")){i=c(a),k=d(a);var b,e,f,g,h=[],n=[],o={},p=[],q=[],r={};for(b=0;b<i.length;b++)f=i[b],o[f.id]=f,l[f.id]||(n.push(f),l[f.id]=f);for(e in l)o[e]||(h.push(l[e]),delete l[e]);for(b=0;b<k.length;b++)g=k[b],r[g.id]=g,m[g.id]||(q.push(g),m[g.id]=g);for(e in m)r[e]||(p.push(m[e]),delete m[e]);(p.length||q.length||h.length||n.length)&&j.dispatchEvent("hovers",{current:{nodes:i,edges:k},enter:{nodes:n,edges:q},leave:{nodes:h,edges:p},captor:a.data})}}var i,k,l={},m={};a.bind("click",b),a.bind("mousedown",h),a.bind("mouseup",h),a.bind("mousemove",h),a.bind("mouseout",g),a.bind("doubleclick",e),a.bind("rightclick",f)}var f,g,h,i,j=this;for(f=0,g=this.captors.length;g>f;f++)e(this.captors[f])}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.misc"),sigma.misc.bindDOMEvents=function(a){function b(a){this.attr=function(b){return a.getAttributeNS(null,b)},this.tag=a.tagName,this["class"]=this.attr("class"),this.id=this.attr("id"),this.isNode=function(){return!!~this["class"].indexOf(g.settings("classPrefix")+"-node")},this.isEdge=function(){return!!~this["class"].indexOf(g.settings("classPrefix")+"-edge")},this.isHover=function(){return!!~this["class"].indexOf(g.settings("classPrefix")+"-hover")}}function c(a){if(g.settings("eventsEnabled")){g.dispatchEvent("click",sigma.utils.mouseCoords(a));var c=new b(a.target);c.isNode()?g.dispatchEvent("clickNode",{node:h.nodes(c.attr("data-node-id"))}):g.dispatchEvent("clickStage"),a.preventDefault(),a.stopPropagation()}}function d(a){if(g.settings("eventsEnabled")){g.dispatchEvent("doubleClick",sigma.utils.mouseCoords(a));var c=new b(a.target);c.isNode()?g.dispatchEvent("doubleClickNode",{node:h.nodes(c.attr("data-node-id"))}):g.dispatchEvent("doubleClickStage"),a.preventDefault(),a.stopPropagation()}}function e(a){var c=a.toElement||a.target;if(g.settings("eventsEnabled")&&c){var d,e=new b(c),f={leave:{nodes:[],edges:[]},enter:{nodes:[],edges:[]},captor:sigma.utils.mouseCoords(a)};e.isNode()?(d=h.nodes(e.attr("data-node-id")),f.enter.nodes=[d],i.nodes.push(d)):e.isEdge()&&(d=h.edges(e.attr("data-edge-id")),f.enter.edges=[d],i.edges.push(d)),f.current=i,g.dispatchEvent("hovers",f)}}function f(a){var c=a.fromElement||a.originalTarget;if(g.settings("eventsEnabled")){var d,e=new b(c),f={leave:{nodes:[],edges:[]},enter:{nodes:[],edges:[]},captor:sigma.utils.mouseCoords(a)};if(e.isNode())d=h.nodes(e.attr("data-node-id")),f.leave.nodes=[d],i.nodes.push(d);else{if(!e.isEdge())return;d=h.edges(e.attr("data-edge-id")),f.leave.edges=[d],i.edges.push(d)}f.current=i,g.dispatchEvent("hovers",f)}}var g=this,h=this.graph,i={nodes:[],edges:[]};a.addEventListener("click",c,!1),sigma.utils.doubleClick(a,"click",d),a.addEventListener("touchstart",c,!1),sigma.utils.doubleClick(a,"touchstart",d),a.addEventListener("mouseover",e,!0),a.addEventListener("mouseout",f,!0)}}.call(this),function(a){"use strict";if("undefined"==typeof sigma)throw"sigma is not declared";sigma.utils.pkg("sigma.misc"),sigma.misc.drawHovers=function(b){function c(){var c=d.contexts.hover.canvas,f=d.settings.embedObjects({prefix:b}),g=f("singleHover")?1:a,h={elements:e.nodes,renderers:sigma.canvas.hovers,type:"nodes",ctx:d.contexts.hover,end:g,graph:d.graph,settings:f};d.contexts.hover.clearRect(0,0,c.width,c.height),e.nodes.length>0&&f("enableHovering")&&sigma.renderers.canvas.applyRenderers(h),e.edges.length>0&&f("enableEdgeHovering")&&(h.renderers=sigma.canvas.edgehovers,h.elements=e.edges,h.type="edges",sigma.renderers.canvas.applyRenderers(h),f("edgeHoverExtremities")?(h.renderers=sigma.canvas.extremities,sigma.renderers.canvas.applyRenderers(h)):(h.ctx=d.contexts.nodes,h.type="nodes",h.renderers=sigma.canvas.nodes,h.elements=e.nodes,sigma.renderers.canvas.applyRenderers(h)))}var d=this,e={nodes:[],edges:[]};this.bind("hovers",function(a){e=a.data.current,c()}),this.bind("render",function(a){c()})}}.call(this);

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
"use strict";
//function for random color
//Taken from https://stackoverflow.com/questions/1484506/random-color-generator
var sigma = require('linkurious');
window.sigma = sigma;
// require('sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
// require('sigma/plugins/sigma.plugins.animate/sigma.plugins.animate');
// require('sigma/plugins/sigma.layout.noverlap/sigma.layout.noverlap');
//require('sigma/build/plugins/sigma.renderers.customShapes.min');
require('linkurious/dist/sigma.min');
require('linkurious/dist/plugins.min');
require('linkurious/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('linkurious/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('linkurious/plugins/sigma.layouts.noverlap/sigma.layouts.noverlap');
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
//generate function
function generate(n) {
    var i, j;
    var nodes = {};
    var edges = [];
    var visited = {};
    for (i = 1; i <= n; i++) {
        visited["n" + i.toString()] = false;
    }
    var stack = [];
    var rest = [];
    //randomly generate a graph
    for (i = 1; i <= n; i++) {
        if ((typeof nodes["n" + i.toString()]) === 'undefined') {
            nodes["n" + i.toString()] = [];
        }
        for (j = i + 1; j <= n; j++) {
            if ((typeof nodes["n" + j.toString()]) === 'undefined') {
                nodes["n" + j.toString()] = [];
            }
            if (Math.random() < 0.2) {
                nodes["n" + i.toString()].push("n" + j.toString());
                nodes["n" + j.toString()].push("n" + i.toString());
                edges.push(["n" + j.toString(), "n" + i.toString()]);
            }
        }
    }
    //making sure it is connected
    for (i = 1; i <= n; i++) {
        if (visited["n" + i.toString()] == false) {
            var item = "n" + i.toString();
            stack.push("n" + i.toString());
            while (stack.length > 0) {
                var cur = stack.pop();
                if (cur !== undefined) {
                    if (visited[cur] == false) {
                        visited[cur] = true;
                        if (Math.random() < 0.3) {
                            item = cur;
                        }
                        for (var _i = 0, _a = nodes[cur]; _i < _a.length; _i++) {
                            var val = _a[_i];
                            stack.push(val);
                        }
                    }
                }
            }
            rest.push(item);
        }
    }
    for (i = 0; i < rest.length - 1; i++) {
        nodes[rest[i]].push(rest[i + 1]);
        nodes[rest[i + 1]].push(rest[i]);
        edges.push([rest[i], rest[i + 1]]);
    }
    //function for random color
    //Taken from https://stackoverflow.com/questions/1484506/random-color-generator
    sigma.canvas.nodes.border = function (node, context, settings) {
        var prefix = settings('prefix') || '';
        context.fillStyle = node.color || settings('defaultNodeColor');
        context.beginPath();
        context.arc(node[prefix + 'x'], node[prefix + 'y'], node[prefix + 'size'], 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
        // Adding a border
        context.lineWidth = node.borderWidth || 2;
        context.strokeStyle = node.borderColor || '#fff';
        context.stroke();
    };
    var sigmaInstance = new sigma({
        settings: {
            defaultNodeType: "border",
        }
    });
    sigmaInstance.addRenderer({
        container: document.getElementById('graph-container'),
        type: 'canvas'
    });
    for (i = 1; i <= n; i++) {
        sigmaInstance.graph.addNode({
            // Main attributes:
            id: "n" + i.toString(),
            label: 'node ' + i.toString(),
            Type: 'border',
            x: Math.random(),
            y: Math.random(),
            size: 1,
            color: '#fff',
            borderColor: getRandomColor()
        });
    }
    //sigmaInstance.graph.nodes('n1').type='diamond';
    //add edge
    for (i = 0; i < edges.length; i++) {
        sigmaInstance.graph.addEdge({
            id: 'e' + i.toString(),
            // Reference extremities:
            source: edges[i][0],
            target: edges[i][1],
            color: '#000',
            size: Math.random()
        });
    }
    //CustomShapes.init(sigmaInstance);
    sigmaInstance.refresh();
    var config = {
        nodeMargin: 40.0,
        scaleNodes: 1.3
    };
    // Configure the algorithm
    var listener = sigmaInstance.configNoverlap(config);
    // Bind all events:
    listener.bind('start stop interpolate', function (event) {
        console.log(event.type);
    });
    // Start the algorithm:
    sigmaInstance.startNoverlap();
    var dragListener = sigma.plugins.dragNodes(sigmaInstance, sigmaInstance.renderers[0]);
    dragListener.bind('startdrag', function (event) {
        console.log(event);
    });
    dragListener.bind('drag', function (event) {
        console.log(event);
    });
    dragListener.bind('drop', function (event) {
        console.log(event);
    });
    dragListener.bind('dragend', function (event) {
        console.log(event);
    });
}
generate(10);

},{"linkurious":3,"linkurious/dist/plugins.min":1,"linkurious/dist/sigma.min":2,"linkurious/plugins/sigma.layouts.noverlap/sigma.layouts.noverlap":4,"linkurious/plugins/sigma.plugins.animate/sigma.plugins.animate":5,"linkurious/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes":6}]},{},[7]);
