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

$(document).ready( function() {

    // http://stackoverflow.com/questions/5601431/spellcheck-false-on-contenteditable-elements
    document.body.setAttribute('spellcheck', false);

    $('#save-button').click(function(){

        // http://stackoverflow.com/questions/26689876/how-to-save-html-that-was-modified-on-the-browser-the-dom-with-javascript-jque

        // Clone the DOM to extract the alignment information.
        var clona = document.cloneNode(true);
        // get segments
        var source_strings = clona.getElementById(
          'source-col').getElementsByClassName('celltext');
        source_strings = $.map(source_strings, function(item) {
          return item.innerHTML;
        });
        var target_strings = clona.getElementById(
          'target-col').getElementsByClassName('celltext');
        target_strings = $.map(target_strings, function(item) {
          return item.innerHTML;
        });

        //check for equal length of source and target segments
        if (source_strings.length === target_strings.length) {
          // get info from meta
          // http://stackoverflow.com/questions/13451559/get-meta-attribute-content-by-selecting-property-attribute
          var s_lang = $("meta[name='source-language']").attr("content");
          var t_lang = $("meta[name='target-language']").attr("content");
          var doccode = $("meta[name='doc-code']").attr("content");
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
    });
});

// using code from http://jsfiddle.net/X33px/2/
$(document).on('click', 'a.add', function() {
  var val = $(this).parent().parent().next().html();
  $(this).parent().parent().next().replaceWith('<div class="cell">' +
    '<span class="buttons"><a class="button add" href="#">+ ↓</a>' +
    '<a class="button delete" href="#">Del</a>' +
    //'<a href="#" class="button edit">Edit</a>' +
    '<a class="button merge" href="#">⛓ ↓</a></span>' +
    '<a class="button split" href="#">⛌⛌</a></span>' +
    '<span class="celltext"></span></div>' +
    '<div class="cell">' + val + '</div>');
  return false;
});

function createSpan () {
  var firstSpan = document.createElement("SPAN");
  firstSpan.className = "buttons";

  var addButton = document.createElement("A");
  var linkText = document.createTextNode("+ ↓");
  addButton.appendChild(linkText);
  addButton.href = "#";
  addButton.className = "button add";
  addButton.addEventListener('click', addFunction);

  var delButton = document.createElement("A");
  linkText = document.createTextNode("Del");
  delButton.appendChild(linkText);
  delButton.href = "#";
  delButton.className = "button delete";
  delButton.addEventListener('click', deleteFunction, false);

  var mergeButton = document.createElement("A");
  linkText = document.createTextNode("⛓ ↓");
  mergeButton.appendChild(linkText);
  mergeButton.href = "#";
  mergeButton.className = "button merge";
  mergeButton.addEventListener('click', mergeFunction, false);

  var splitButton = document.createElement("A");
  linkText = document.createTextNode("⛌⛌");
  splitButton.appendChild(linkText);
  splitButton.href = "#";
  splitButton.className = "button split";
  splitButton.addEventListener('click', splitFunction, false);

  firstSpan.appendChild(addButton);
  firstSpan.appendChild(delButton);
  firstSpan.appendChild(mergeButton);
  firstSpan.appendChild(splitButton);

  return firstSpan;
}

$(document).on('click', 'a.delete', function() {
  if (window.confirm("Are you sure you want to delete this segment?")) {
    $(this).parent().parent().remove();
  }
  return false;
});

$(document).on('click', 'a.split', function() {
  if ($(this).html() === '⛌⛌') {
    $(this).parent().parent().attr('id', 'active');
    $(this).parent().parent().attr('onmouseup', 'splitParaAtCaret()');
    $(this).css('background', 'yellow');
    $(this).html('Split');
    //$(this).parent().parent().css('height', 'auto');
    //$(this).parent().parent().css('min-height', '70px');
    return false;
  } else {
    $(this).css('background', 'white');
    $(this).html('⛌⛌');
    //$(this).parent().parent().css('height', '70px');
    $(this).parent().parent().removeAttr('id');
    $(this).parent().parent().removeAttr('onmouseup');
  }
  return false;
});

$(document).on('click', 'a.merge', function() {
  if (window.confirm(
    "Are you sure you want to merge it with the following segment?")) {
    var val = $(this).parent().parent().next().children('span')[1].innerHTML;
    $(this).parent().parent().children('span')[1].innerHTML += " " + val;
    $(this).parent().parent().next().remove();
  }
  return false;
});

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



$(window).load(function(){
$('div.cell').each(function() {
  $(this).prepend('<span class="buttons">' +
    '<a class="button add" href="#">+ ↓</a>' +
    '<a class="button delete" href="#">Del</a>' +
    //' <a href="#" class="button edit">Edit</a>' +
    '<a class="button merge" href="#">⛓ ↓</a>' +
    '<a class="button split" href="#">⛌⛌</a></span>');
});

});//]]>
