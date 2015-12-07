//<![CDATA[
// using code from http://jsfiddle.net/X33px/2/

$(document).ready( function() {
    $('#save-button').click(function(){

        // http://stackoverflow.com/questions/26689876/how-to-save-html-that-was-modified-on-the-browser-the-dom-with-javascript-jque

        // Save the page's HTML to a file that is automatically downloaded.

        // We make a Blob that contains the data to download.
        var clona = document.cloneNode(true);

        // some cleanup
        var buttons = clona.getElementsByClassName('buttons');
        while (buttons.length > 0) {
          buttons[0].parentNode.removeChild(buttons[0]);
        }
        var divbutton = clona.getElementById('div-button');
        divbutton.parentNode.removeChild(divbutton);
        var links = clona.getElementsByClassName('links');
        while (links.length > 0) {
          links[0].parentNode.removeChild(links[0]);
        }

        var file = new window.Blob(
          [clona.documentElement.innerHTML], { type: "text/html" });
        var URL = window.webkitURL || window.URL;

        // This is the URL that will download the data.
        var downloadUrl = URL.createObjectURL(file);

        var a = document.createElement("a");
        // This sets the file name.
        a.download = "source.htm";
        a.href = downloadUrl;

        // Actually perform the download.
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    })
});

$(document).on('click', 'a.add', function() {
  var val = $(this).parent().parent().next().html();
  $(this).parent().parent().next().replaceWith('<div class="cell">' +
    '<span class="buttons"><a class="button add" href="#">Add new</a>' + 
    '<a class="button delete" href="#">Delete</a>' + 
    '<a href="#" class="button edit">Edit</a>' + 
    '<a class="button merge" href="#">Merge with next</a></span>' + 
    '<span class="celltext"></span></div>' +
    '<div class="cell">' + val + '</div>');
  return false;
});


$(document).on('click', 'a.delete', function() {
  if (window.confirm("Are you sure you want to delete this segment?")) {
    $(this).parent().parent().remove();
  };
  return false;
});

$(document).on('click', 'a.merge', function() {
  if (window.confirm("Are you sure you want to merge this segment?")) {
    var val = $(this).parent().parent().next().children('span')[1].innerHTML;
    $(this).parent().parent().children('span')[1].innerHTML += " " + val;
    $(this).parent().parent().next().remove();
  };
  return false;
});

$(document).on('click', 'a.edit', function() {
  var val = $(this).parent().siblings('span').html();
  if (val === "") {
    val = "No text.";
  };
  if (val) {
    $(this).parent().parent().append(
      '<textarea class="txt">' + val + '</textarea>');
    $(this).parent().siblings('span').remove();
    $(this).html('Update');
  } else {
    var $txt = $(this).parent().siblings().filter(function() {
      return $(this).hasClass('txt')
    });
    $(this).parent().parent().append(
      '<span class="celltext">' + $txt.val() + '</span>');
    $txt.remove();
    $(this).html('Edit');
  }
  return false;
});

$(window).load(function(){
$('div.cell').each(function() {
  $(this).prepend('<span class="buttons">' + 
    '<a class="button add" href="#">Add new</a>' + 
    '<a class="button delete" href="#">Delete</a>' +
    ' <a href="#" class="button edit">Edit</a>' +
    '<a class="button merge" href="#">Merge with next</a></span>');
});

});//]]> 
