//<![CDATA[

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
      p.nextSibling.removeAttribute("id");
      var split_button = p.getElementsByClassName('split');
      split_button[0].style.background = "white";
      split_button[0].innerHTML = "⛌⛌";
    }
  }
}

function createStrings(colname, docobject) {
  var col_strings = docobject.getElementById(
      'source-col').getElementsByClassName('celltext');
    col_strings = Array.prototype.map.call(col_strings, function(item){
      return item.innerHTML;
    });
    return col_strings;
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
    // var s_lang = $("meta[name='source-language']").attr("content");
    // var t_lang = $("meta[name='target-language']").attr("content");
    // var doccode = $("meta[name='doc-code']").attr("content");
    // create new string variable
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

function createSpan () {
  var firstSpan = document.createElement("SPAN");
  firstSpan.className = "buttons";

  var addButton = document.createElement("A");
  var linkText = document.createTextNode("+ ↓");
  addButton.appendChild(linkText);
  addButton.href = "#";
  addButton.className = "button add";
  addButton.addEventListener('click', addFunctionWithListener, false);

  var delButton = document.createElement("A");
  linkText = document.createTextNode("Del");
  delButton.appendChild(linkText);
  delButton.href = "#";
  delButton.className = "button delete";
  delButton.addEventListener('click', deleteFunctionWithListener, false);

  var mergeButton = document.createElement("A");
  linkText = document.createTextNode("⛓ ↓");
  mergeButton.appendChild(linkText);
  mergeButton.href = "#";
  mergeButton.className = "button merge";
  mergeButton.addEventListener('click', mergeFunctionWithListener, false);

  var splitButton = document.createElement("A");
  linkText = document.createTextNode("⛌⛌");
  splitButton.appendChild(linkText);
  splitButton.href = "#";
  splitButton.className = "button split";
  splitButton.addEventListener('click', splitFunctionWithListener, false);

  firstSpan.appendChild(addButton);
  firstSpan.appendChild(delButton);
  firstSpan.appendChild(mergeButton);
  firstSpan.appendChild(splitButton);

  return firstSpan;
}

function createNewCell() {
  var newCell = document.createElement("DIV");
  newCell.className = "cell";

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

function addFunctionWithListener() {
  //a..span.......div........td......
  this.parentNode.parentNode.parentNode.insertBefore(
    createNewCell(),this.parentNode.parentNode.nextSibling);
  event.preventDefault();
}


function deleteFunction(item) {
  if (window.confirm("Are you sure you want to delete this segment?")) {
    console.log(item);
    item.parentNode.parentNode.remove();
  }
  event.preventDefault();
}

function deleteFunctionWithListener() {
  if (window.confirm("Are you sure you want to delete this segment?")) {
    console.log(this);
    this.parentNode.parentNode.remove();
  }
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
  if (item.innerHTML === '⛌⛌') {
    item.parentNode.parentNode.getElementsByClassName('buttons')[0].onmousedown = function(){return false;};
    moveCursor();
    item.parentNode.parentNode.setAttribute('id', 'active');
    item.parentNode.parentNode.setAttribute('onmouseup', 'splitParaAtCaret()');
    item.style.background='yellow';
    item.innerHTML = 'Split';
  } else {
    item.style.background='white';
    item.innerHTML = '⛌⛌';
    item.parentNode.parentNode.removeAttribute('id');
    item.parentNode.parentNode.removeAttribute('onmouseup');
  }
  event.preventDefault();
}

function splitFunctionWithListener () {
  if (this.innerHTML === '⛌⛌') {
    this.parentNode.parentNode.getElementsByClassName('buttons')[0].onmousedown = function(){return false;};
    moveCursor();
    this.parentNode.parentNode.setAttribute('id', 'active');
    this.parentNode.parentNode.setAttribute('onmouseup', 'splitParaAtCaret()');
    this.style.background='yellow';
    this.innerHTML = 'Split';
  } else {
    this.style.background='white';
    this.innerHTML = '⛌⛌';
    this.parentNode.parentNode.removeAttribute('id');
    this.parentNode.parentNode.removeAttribute('onmouseup');
  }
  event.preventDefault();
}

function mergeFunction (item) {
  if (window.confirm(
    "Are you sure you want to merge it with the following segment?")) {
    var v = item.parentNode.parentNode.nextElementSibling.children[1].innerHTML;
    item.parentNode.parentNode.children[1].innerHTML += " " + v;
    item.parentNode.parentNode.nextElementSibling.remove();
  }
  event.preventDefault();
}

function mergeFunctionWithListener () {
  if (window.confirm(
    "Are you sure you want to merge it with the following segment?")) {
    var v = this.parentNode.parentNode.nextElementSibling.children[1].innerHTML;
    this.parentNode.parentNode.children[1].innerHTML += " " + v;
    this.parentNode.parentNode.nextElementSibling.remove();
  }
  event.preventDefault();
}

function populateTable() {
  // var cells = document.getElementsByClassName("cell");
  // Array.prototype.map.call(cells, function(cell){
  //   cell.insertBefore(createSpan(), cell.firstChild);
  // });

  // http://stackoverflow.com/questions/5601431/spellcheck-false-on-contenteditable-elements
  document.body.setAttribute('spellcheck', false);
  document.getElementById('save-button').addEventListener('click', saveAlignment, false);
}

onload = populateTable;

// $(document).ready( function() {
//     $('#save-button').click(saveAlignment);
// });

// $(window).load(function(){
// $('div.cell').each(function() {
//   $(this).prepend(createSpan());
// });

// using code from http://jsfiddle.net/X33px/2/
// $(document).on('click', 'a.add', function() {
//   var val = $(this).parent().parent().next().html();
//   $(this).parent().parent().next().replaceWith('<div class="cell">' +
//     '<span class="buttons"><a class="button add" href="#">+ ↓</a>' +
//     '<a class="button delete" href="#">Del</a>' +
//     //'<a href="#" class="button edit">Edit</a>' +
//     '<a class="button merge" href="#">⛓ ↓</a></span>' +
//     '<a class="button split" href="#">⛌⛌</a></span>' +
//     '<span class="celltext"></span></div>' +
//     '<div class="cell">' + val + '</div>');
//   return false;
// });

// $(document).on('click', 'a.delete', function() {
//   if (window.confirm("Are you sure you want to delete this segment?")) {
//     $(this).parent().parent().re#move();
//   }
//   return false;
// });

// $(document).on('click', 'a.split', function() {
//   if ($(this).html() === '⛌⛌') {
//     $(this).parent().parent().attr('id', 'active');
//     $(this).parent().parent().attr('onmouseup', 'splitParaAtCaret()');
//     $(this).css('background', 'yellow');
//     $(this).html('Split');
//     //$(this).parent().parent().css('height', 'auto');
//     //$(this).parent().parent().css('min-height', '70px');
//     return false;
//   } else {
//     $(this).css('background', 'white');
//     $(this).html('⛌⛌');
//     //$(this).parent().parent().css('height', '70px');
//     $(this).parent().parent().removeAttr('id');
//     $(this).parent().parent().removeAttr('onmouseup');
//   }
//   return false;
// });

// $(document).on('click', 'a.merge', function() {
//   if (window.confirm(
//     "Are you sure you want to merge it with the following segment?")) {
//     var val = $(this).parent().parent().next().children('span')[1].innerHTML;
//     $(this).parent().parent().children('span')[1].innerHTML += " " + val;
//     $(this).parent().parent().next().remove();
//   }
//   return false;
// });

// $(document).on('click', 'a.edit', function() {
//   var val = $(this).parent().siblings('span').html();
//   console.log(val);
//   if (val === "") {
//     val = "No text.";
//   }
//   if (val) {
//     $(this).parent().parent().css('height', 'auto');
//     $(this).parent().parent().append(
//       '<textarea rows="4" class="txt">' + val + '</textarea>');
//     $(this).parent().siblings('span').remove();
//     $(this).html('Save');
//   } else {
//     var $txt = $(this).parent().siblings().filter(function() {
//       return $(this).hasClass('txt');
//     });
//     $(this).parent().parent().append(
//       '<span class="celltext">' + $txt.val() + '</span>');
//     $txt.remove();
//     $(this).html('Edit');
//     $(this).parent().parent().css('height', '70px');
//   }
//   return false;
// });


//});


//]]>

