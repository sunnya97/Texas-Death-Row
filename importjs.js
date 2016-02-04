function include(filename)
{
  var head = document.getElementsByTagName('head')[0];
  
  script = document.createElement('script');
  script.src = filename;
  script.type = 'text/javascript';
  
  head.appendChild(script)
}

include("https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js");
include("https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js");
include("https://jardindesconnaissances.googlecode.com/svn-history/r82/trunk/public/js/d3.layout.cloud.js");
include("stopwords.js");
include("main.js");