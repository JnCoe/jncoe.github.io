// Define Functions

function contentDiv() {
    $('.added').remove();
    $('article').removeClass('current');
    var docWidth = +$('.container').width();
    var articleWidth = +$('article').width();
    articleWidth = articleWidth + 20;
    var ratio = docWidth / articleWidth;
    ratio = Math.floor(ratio);
    if(ratio == 0) {
      ratio = 1;
    }
    ratio = ratio + 'n';
    $('article.show:nth-of-type(' + ratio + ')').after('<div class="content added"></div>');
}


$('article').addClass('show');
contentDiv();


// RESIZE -   
$(window).resize(function() {
    contentDiv();
  });



var articles = $('article');

$('.filters a').click(function(e){
  $('.filters a').removeClass('active-filter');
  $(this).addClass('active-filter');
  e.preventDefault();
  var filter = $(this).data('filter');
  $('.container').empty();
  if( filter == "all") {
    $('.container').hide().html(articles).fadeIn(1000).append('<div class="content"></div>');
  } else {
    filter = '.'+filter;
    filter_articles = $(articles).filter(filter);
    $('.container').hide().html(filter_articles).fadeIn(1000).append('<div class="content"></div>');
  }
  
  contentDiv();
  
  });


// ARTICLE CLICK
$('.container').on('click', 'article',function(e){
  e.preventDefault();
  content = $(this).find('div').html();
  box = $(this).nextAll('.content').first();
  if($(this).hasClass('current')) {
  
     $(this).removeClass('current');
     $(box).removeClass('open').empty();
     $(this).parent().find('.content').empty(); 
 
  } else {
 
    $('article').removeClass('current');
    $(this).addClass('current');
    $(this).parent().find('.content').empty(); 
    $('.open').removeClass('open').empty();
    $(box).addClass('open').html(content);
  
  }
 
 });