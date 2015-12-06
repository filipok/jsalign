//<![CDATA[
<!-- using code from http://jsfiddle.net/X33px/2/-->
$(window).load(function(){
$('div').each(function() {
  $(this).prepend('<a class="button delete" href="#">Delete</a>  <a href="#" class="button edit">Edit</a> <a class="button merge" href="#">Merge with next</a>')
});

$('div a.delete').on('click', function() {
  if (window.confirm("Are you sure you want to delete this segment?")) {
    $(this).parent().remove();
  };
  return false;
});

$('div a.merge').on('click', function() {
  if (window.confirm("Are you sure you want to merge this segment?")) {
    var val = $(this).parent().next().children('span').html();
    $(this).parent().children('span').append(" " + val);
    $(this).parent().next().remove();
  };
  return false;
});


$('div a.edit').on('click', function() {
  var val = $(this).siblings('span').html();
  if (val === "") {
    val = "No text.";
  };
  if (val) {
    $(this).parent().append('<textarea class="txt">' + val + '</textarea>');
    $(this).siblings('span').remove();
    $(this).html('Update');
  } else {
    var $txt = $(this).siblings().filter(function() {
      return $(this).hasClass('txt')
    });
    $(this).parent().append('<span class="celltext">' + $txt.val() + '</span>');
    $txt.remove();
    $(this).html('Edit');
  }
  return false;
});
});//]]> 
