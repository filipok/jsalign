//<![CDATA[

var colHeight = '70px';

// http://stackoverflow.com/questions/11111704/rangy-js-jquery-split-node
function splitParaAtCaret() {
  var sel = rangy.getSelection();
  if (sel.rangeCount > 0) {
    // Create a copy of the selection range to work with
    var range = sel.getRangeAt(0).cloneRange();
    // Get the containing paragraph
    var p = range.commonAncestorContainer;
    while (p && (p.nodeType != 1 || p.id != "active") ) {
      p = p.parentNode;
    }
    if (p) {
      // Place the end of the range after the paragraph
      range.setEndAfter(p);
      // Extract the contents of the paragraph after the caret into a fragment
      var contentAfterRangeStart = range.extractContents();
      // Collapse the range immediately after the paragraph
      range.collapseAfter(p);
      // Insert the content
      range.insertNode(contentAfterRangeStart);
      // Move the caret to the insertion point
      range.collapseAfter(p);
      sel.setSingleRange(range);

      // add span and disable function (additional code)
      var span = createSpan();
      var first = p.nextSibling.firstChild;
      p.nextSibling.insertBefore(span, first);
      p.removeAttribute("id");
      p.removeAttribute("onmouseup");
      p.style.height=colHeight;
      p.style.color='black';
      p.nextSibling.removeAttribute("id");
      p.nextSibling.removeAttribute("onmouseup");
      p.nextSibling.style.height=colHeight;
      p.nextSibling.style.color='black';
      var split_button = p.getElementsByClassName('split');
      split_button[0].firstChild.className = 'glyphicon glyphicon-flash';
      split_button[0].firstChild.innerHTML = '';
    }
  }
}

function createStrings(colname, docobject) {
  var col_strings = docobject.getElementById(
      colname).getElementsByClassName('celltext');
    col_strings = Array.prototype.map.call(col_strings, function(item){
      return item.innerHTML;
    });
    return col_strings;
}

function getMeta() {
    // get info from meta
    // http://stackoverflow.com/questions/13451559/get-meta-attribute-content-by-selecting-property-attribute
    var metaTags=document.getElementsByTagName("meta");
    var s_lang = '';
    var t_lang = '';
    var doccode= '';
    for (var i = 0; i < metaTags.length; i++) {
      if (metaTags[i].getAttribute("name") == "source-language") {
          s_lang = metaTags[i].getAttribute("content");
      } else {
        if (metaTags[i].getAttribute("name") == "target-language") {
          t_lang = metaTags[i].getAttribute("content");
        } else {
          if (metaTags[i].getAttribute("name") == "doc-code") {
            doccode = metaTags[i].getAttribute("content");
          }
        }
      }
    }
    return [doccode, s_lang, t_lang];
}

function saveAlignment() {
  // http://stackoverflow.com/questions/26689876/how-to-save-html-that-was-modified-on-the-browser-the-dom-with-javascript-jque

  // Clone the DOM to extract the alignment information.
  var clona = document.cloneNode(true);

  // get segments
  var source_strings = createStrings('source-col', clona);
  var target_strings = createStrings('target-col', clona);

  //check for equal length of source and target segments
  if (source_strings.length === target_strings.length) {
    var metas = getMeta();
    var doccode = metas[0];
    var s_lang = metas[1];
    var t_lang = metas[2];
    var tmx = '';
    // add tmx header
    tmx += '<?xml version="1.0" encoding="utf-8" ?>\n';
    tmx += '<!DOCTYPE tmx SYSTEM "tmx14.dtd">\n';
    tmx += '<tmx version="1.4">\n';
    tmx += '  <header\n';
    tmx += '    creationtool="eunlp"\n';
    tmx += '    creationtoolversion="0.01"\n';
    tmx += '    datatype="unknown"\n';
    tmx += '    segtype="sentence"\n';
    tmx += '    adminlang="' + s_lang + '"\n';
    tmx += '    srclang="' + s_lang + '"\n';
    tmx += '    o-tmf="TW4Win 2.0 Format"\n';
    tmx += '  >\n';
    tmx += '  </header>\n';
    tmx += '  <body>\n';
    // add tmx contents
    // prepare "now" and "tag" variables
    // http://stackoverflow.com/questions/1531093/how-to-get-current-date-in-javascript
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10) {
        dd='0'+dd;
    }
    if(mm<10) {
        mm='0'+mm;
    }
    var hours = today.getHours();
    var minutes = today.getMinutes();
    var seconds = today.getSeconds();
    if(hours<10) {
        hours='0'+hours;
    }
    if(minutes<10) {
        minutes='0'+minutes;
    }
    if(seconds<10) {
        seconds='0'+seconds;
    }
    var now = yyyy +  '' +  mm + '' + dd + "T" +
      hours + minutes + seconds + "Z";
    var tag = '<prop type="Txt::Alignment">Jsalign</prop>';
    // use loop to add aligned segments to tmx
    var items = source_strings.length;
    for (i = 0; i < items; i++) {
      var tru = ''.concat('<tu creationdate="', now,
                 '" creationid="jsalign"><prop type="Txt::Note">',
                 doccode, '</prop>', tag, '\n');
      var tuv_source = ''.concat('<tuv xml:lang="', s_lang, '"><seg>',
        source_strings[i], '</seg></tuv>\n');

      var tuv_target = ''.concat('<tuv xml:lang="', t_lang, '"><seg>',
        target_strings[i], '</seg></tuv> </tu>\n\n');
      var oneline = ''.concat(tru, tuv_source, tuv_target);
      tmx += oneline;
    }
    // add footer
    tmx += '\n';
    tmx += '</body>\n';
    tmx += '</tmx>';

    // create blob
    var file = new window.Blob(
      [tmx], { type: "text/html" });
    var URL = window.webkitURL || window.URL;
    // This is the URL that will download the data.
    var downloadUrl = URL.createObjectURL(file);
    var a = document.createElement("a");
    // This sets the file name.
    a.download = "bi_" + "_" + doccode + "_" + s_lang + "_" + t_lang +
      ".tmx";
    a.href = downloadUrl;
    // Actually perform the download.
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    alert("Please align the document before saving the tmx file!");
  }
}

function saveBackup() {
  // Clone the DOM to extract the alignment information.
  var clona = document.cloneNode(true);
  var docContents = '<!DOCTYPE html>\n';
  docContents += clona.documentElement.outerHTML;
  // create blob
  var file = new window.Blob(
    [docContents], { type: "text/html" });
  var URL = window.webkitURL || window.URL;
  // This is the URL that will download the data.
  var downloadUrl = URL.createObjectURL(file);
  var a = document.createElement("a");
  // This sets the file name.
  var metas = getMeta();
  var doccode = metas[0];
  var s_lang = metas[1];
  var t_lang = metas[2];
  a.download = "backup_" + doccode + "_" + s_lang + "_" + t_lang +
    ".html";
  a.href = downloadUrl;
  // Actually perform the download.
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function deleteFunction(item) {
  var yesButton = document.createElement("A");
  var linkText = document.createTextNode("Delete!");
  yesButton.appendChild(linkText);
  yesButton.href = "#";
  yesButton.className = "btn btn-danger btn-xs yes";
  yesButton.addEventListener('click', yesDeleteFunction, false);

  var noButton = document.createElement("A");
  linkText = document.createTextNode("Cancel");
  noButton.appendChild(linkText);
  noButton.href = "#";
  noButton.className = "btn btn-success btn-xs no";
  noButton.addEventListener('click', noFunction, false);

  item.parentNode.insertBefore(yesButton, item.parentNode.getElementsByClassName('merge')[0]);
  item.parentNode.insertBefore(noButton, item.parentNode.getElementsByClassName('merge')[0]);
  item.style.display = 'none';
  item.parentNode.getElementsByClassName('add')[0].style.display = 'none';
  item.parentNode.getElementsByClassName('merge')[0].style.display = 'none';
  item.parentNode.getElementsByClassName('split')[0].style.display = 'none';

  event.preventDefault();
}

function mergeFunction(item) {
  var yesButton = document.createElement("A");
  var linkText = document.createTextNode("Merge!");
  yesButton.appendChild(linkText);
  yesButton.href = "#";
  yesButton.className = "btn btn-info btn-xs yes";
  yesButton.addEventListener('click', yesMergeFunction, false);

  var noButton = document.createElement("A");
  linkText = document.createTextNode("Cancel");
  noButton.appendChild(linkText);
  noButton.href = "#";
  noButton.className = "btn btn-success btn-xs no";
  noButton.addEventListener('click', noFunction, false);

  item.parentNode.insertBefore(yesButton, item.parentNode.getElementsByClassName('split')[0]);
  item.parentNode.insertBefore(noButton, item.parentNode.getElementsByClassName('split')[0]);
  item.style.display = 'none';
  item.parentNode.getElementsByClassName('add')[0].style.display = 'none';
  item.parentNode.getElementsByClassName('delete')[0].style.display = 'none';
  item.parentNode.getElementsByClassName('split')[0].style.display = 'none';

  event.preventDefault();
}

function yesDeleteFunction() {
  this.parentNode.parentNode.remove();

  event.preventDefault();
}

function yesMergeFunction() {
  var v = this.parentNode.parentNode.nextElementSibling.children[1].innerHTML;
  this.parentNode.parentNode.children[1].innerHTML += " " + v;
  this.parentNode.parentNode.nextElementSibling.remove();

  Array.prototype.map.call(this.parentNode.getElementsByClassName('btn'),
    function(button) {button.style.display = 'inline';});
  this.parentNode.getElementsByClassName('no')[0].remove();
  this.parentNode.getElementsByClassName('yes')[0].remove();

  event.preventDefault();
}

function noFunction() {
  Array.prototype.map.call(this.parentNode.getElementsByClassName('btn'),
    function(button) {button.style.display = 'inline';});
  this.parentNode.getElementsByClassName('yes')[0].remove();
  this.parentNode.getElementsByClassName('no')[0].remove();

  event.preventDefault();
}

function createSpan () {
  var firstSpan = document.createElement("SPAN");
  firstSpan.className = "buttons";

  var addButton = document.createElement("A");
  var linkText = document.createElement('span');
  linkText.className = "glyphicon glyphicon-plus";
  addButton.appendChild(linkText);
  addButton.href = "#";
  addButton.className = "btn btn-success btn-xs add";
  addButton.setAttribute("onclick", "addFunction(this)");

  var delButton = document.createElement("A");
  linkText = document.createElement('span');
  linkText.className = "glyphicon glyphicon-remove";
  delButton.appendChild(linkText);
  delButton.href = "#";
  delButton.className = "btn btn-danger btn-xs delete";
  delButton.setAttribute("onclick", "deleteFunction(this)");

  var mergeButton = document.createElement("A");
  linkText = document.createElement('span');
  linkText.className = "glyphicon glyphicon-arrow-down";
  mergeButton.appendChild(linkText);
  mergeButton.href = "#";
  mergeButton.className = "btn btn-info btn-xs merge";
  mergeButton.setAttribute("onclick", "mergeFunction(this)");

  var splitButton = document.createElement("A");
  linkText = document.createElement('span');
  linkText.className = "glyphicon glyphicon-flash";
  splitButton.appendChild(linkText);
  splitButton.href = "#";
  splitButton.className = "btn btn-warning btn-xs split";
  splitButton.setAttribute("onclick", "splitFunction(this)");

  firstSpan.appendChild(addButton);
  firstSpan.appendChild(document.createTextNode("\n"));
  firstSpan.appendChild(delButton);
  firstSpan.appendChild(document.createTextNode("\n"));
  firstSpan.appendChild(mergeButton);
  firstSpan.appendChild(document.createTextNode("\n"));
  firstSpan.appendChild(splitButton);

  return firstSpan;
}

function createNewCell() {
  var newCell = document.createElement("DIV");
  newCell.className = "cell";
  newCell.setAttribute('draggable', 'true');
  newCell.setAttribute('ondragstart', 'drag(event)');
  newCell.setAttribute('onmouseover', 'addId(this)');
  newCell.setAttribute('onmouseout', 'removeId(this)');

  var firstSpan = createSpan();

  var secSpan =document.createElement("SPAN");
  secSpan.className = "celltext";
  linkText = document.createTextNode("<Add text here.>");
  secSpan.appendChild(linkText);
  secSpan.contentEditable = "true";

  newCell.appendChild(firstSpan);
  newCell.appendChild(secSpan);
  return newCell;
}

function addFunction(item) {
  //a..span.......div........td......
  item.parentNode.parentNode.parentNode.insertBefore(
    createNewCell(),item.parentNode.parentNode.nextSibling);
  event.preventDefault();
}

function moveCursor() {
  // this function makes sure the cursor is not in the cell
  // source: http://jsfiddle.net/xgz6L/8/
  var node = document.getElementById('doc-info');
  node.focus();
  var textNode = node.firstChild;
  var caret = 0;
  var range = document.createRange();
  range.setStart(textNode, caret);
  range.setEnd(textNode, caret);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function splitFunction (item) {
  if (item.firstChild.className === 'glyphicon glyphicon-flash') {
    item.parentNode.parentNode.getElementsByClassName('buttons')[0].onmousedown = function(){return false;};
    moveCursor();
    item.parentNode.parentNode.setAttribute('id', 'active');
    item.parentNode.parentNode.setAttribute('onmouseup', 'splitParaAtCaret()');
    item.parentNode.parentNode.style.height='auto';
    item.firstChild.className = '';
    item.firstChild.innerHTML = 'Split';
    item.parentNode.parentNode.style.color='red';
  } else {
    item.firstChild.className = 'glyphicon glyphicon-flash';
    item.firstChild.innerHTML = '';
    item.parentNode.parentNode.style.height=colHeight;
    item.parentNode.parentNode.removeAttribute('id');
    item.parentNode.parentNode.removeAttribute('onmouseup');
    item.parentNode.parentNode.style.color='black';
  }
  event.preventDefault();
}

function allowDrop(ev) {
      ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    if (ev.target.tagName === 'DIV') {
      ev.target.parentNode.insertBefore(document.getElementById(data), ev.target.nextSibling);
    }
}

function addId(x) {
    x.setAttribute("id", "active");
}

function removeId(x) {
    x.removeAttribute("id");
}

function populateTable() {
  // http://stackoverflow.com/questions/5601431/spellcheck-false-on-contenteditable-elements
  document.body.setAttribute('spellcheck', false);
  document.getElementById('save-button').addEventListener('click', saveAlignment, false);
  document.getElementById('backup-button').addEventListener('click', saveBackup, false);
}

onload = populateTable;

//]]>

