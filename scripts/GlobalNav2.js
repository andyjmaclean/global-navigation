var globalNav = function(){

	var origConfig  = false;
	var href        = window.location.href;
	var initialised = false;

	// set locale
	var locale = href.match(/([?&])locale=[a-z]{2}/);
	locale = locale && locale.length ? locale[0].split('=')[1] : 'en';
	
	// clean href
	href = href.match(/[?]/) ? href.split('?')[0] : href;
	

    var topBarSections = [];

    // load all css
    var initCSS = function(config){
    	$.each(config.stylesheets, function(i, stylesheet){
        	$('head').append('<link rel="stylesheet" href="' + globalNavServer + stylesheet + '"/>');    		
    	});
    };
    
    var initHtml = function(config){
    	
    	var nav    = $('<nav class="eu-global-nav">').prependTo('body');
    	
    	// Left - Right cells

        var topBarMain  = $('<div class="main">').appendTo(nav);
        //var topBarRight = $('<div class="right">').appendTo(nav);
        
        var buildMenu = function(cmp, conf, recLevel){
        	var menu = $(''
        	+ '<div class="global-nav-menu-bar"'
        	+ 	(conf.url     ? ' href="'     + conf.url     + '"' : '')
        	+ 	(conf.dataUrl ? ' data-url="' + conf.dataUrl + '"' : '')
        	+ '>'
        	+   '<div class="menu-bar-inner">'
        	+     '<a title="Go up" class="back-item" data-depth="' + recLevel + '" ' + (conf.backUrl ? ' href="' + conf.backUrl + '" ' : '') + '>Back...</a>'
        	+     '<div class="more" style=""></div>'
        	+     '<a title="Show more" class="more-item">More...</a>'
        	+     '</div>'
        	+   '</div>'
    	    + '</div>'
        	).appendTo(cmp);
        	menu = menu.children('.menu-bar-inner');
        	menu = menu.children('.more');
        	
        	 
        	$(conf.items).each(function(i, ob){        		
        		
        		var itemClass   = 'menu-item';
        		var itemContent = '<span class="link-label">' + ob.label[locale] + '</span>';
        		/*
        		if(!isRecurse && i==0){
            		itemClass   = 'menu-item home-item';
            		itemContent = '';
        		}
        		else 
        		*/
        		if(ob.menu){
        			itemContent += '&nbsp; <span class="arrow"></span>';
        		}
    			//itemContent = '<span style="position:relative; white-space:nowrap;">' + itemContent + '</span>';
        		
        		menu.before('<a title="' + ob.label[locale] + '" '
        			+ (ob.url ? 'href="' + ob.url + '"' : '')
 //       			+ ' class="menu-item' + (ob.menu && true ? ' arrow-down' : '') + '"'
//        			+ ' class="menu-item"'
        			+ ' class="' + itemClass + '"'
        			+ '>'
//        			+ ob.label[locale]
        			+ itemContent //'<span class="link-label">' + ob.label[locale] + '</span>'
//        			+ (ob.menu ? '&nbsp; <span class="arrow"></span>' : '')
        			+ '</a>');
        		if(ob.menu){
        			menu.before('<div class="section"></div>');
        			buildMenu(menu.prev('.section'), ob, recLevel+1);
        		}
        	});
        	
        	  
        	 
        	
        };
        
        
		// Main
		$.each(config.left, function(key, val) {
	        if(typeof val == 'object' && val.menu){
        		buildMenu(topBarMain, val, 0);
	        }
	        // topBarLeft.append(divider());
		});


		var topBarRight = $('<div class="global-search"><div><input></div></div>').appendTo(nav);
		var cmpHome   = '<h4 id="global-home">a</h4>';

		nav.prepend(cmpHome);

		$('#global-home').click(function(){
			document.location = config.home;
		});

		

		if(config.breadcrumbs){
			
			nav.after('<div class="breadcrumbs"></div>');
			
        	$(config.breadcrumbs).each(function(i, ob){
        		
        		
        		
        		if( typeof ob.page != 'undefined' && typeof ob.crumbs != 'undefined'){
        	
        			var regex = new RegExp('[\S]*' + ob.page + '[\S]*');
        			if(regex.test(href)){

            			$(ob.crumbs).each(function(j, crumb){

                    		var breadcrumb = '<a class="breadcrumb" style="margin-right:1em;" href="' + crumb.url + '">' + crumb.label[locale] + '</a>';
                    		$('.breadcrumbs').append(breadcrumb);

            			});

        			}
        			
        			
        		}
        		
        	});
			
		}

		
		
    };
    
    var initJS = function(config){


    	var recursiveLoad = function(index){
    		    		
 		   if(config.scripts[index]){
 	          $.getScript(globalNavServer + config.scripts[index], function(){
            	recursiveLoad(index + 1);        		   
 	          }).fail(function(jqxhr, settings, exception) {
 	        	console.log( "Error: " + exception );
 	          });
 		   }
       	   else{
       		   var menuConfig = {
       				/*
					"fn_init": function(self){
					}
					,"fn_item":function(self, selected){
						//alert("fn_item");
					}
					*/
				};
       		   
       		    $('.eu-global-menu').each(function(){
       		    	new EuGlobalMenu($(this), menuConfig).init();
       		    });
       		    
       		    // new stuff
       		    
       			/* event debouncing () */
   		 		(function($,sr){

   		 			var debounce = function (func, threshold, execAsap) {
   		 				var timeout;
   		 				return function debounced () {
   		 					var obj = this, args = arguments;
   		 					function delayed () {
   		 						if (!execAsap)
   		 							func.apply(obj, args);
   		 							timeout = null;
   		 						};
   		 			
   		 						if (timeout){
   		 							clearTimeout(timeout);
   		 						}
   		 						else if (execAsap){
   		 							func.apply(obj, args);
   		 						}
   		 			
   		 						timeout = setTimeout(delayed, threshold || 100);
   		 					};
   		 				};
   		 		
   		 				// smartresize 
   		 				jQuery.fn[sr] = function(fn){	return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
   		 				jQuery.fn['euScroll'] = function(fn){	return fn ? this.bind('scroll', debounce(fn)) : this.trigger(sr); };

   		 		})(jQuery,'euRsz');
   		 		
   		 		
       			var rootMenu = new EuMenuBar( $('.main > .global-nav-menu-bar'));
       			rootMenu.resize();

   		 		$(window).euRsz(function(){
   		 			rootMenu.resize();
   		 		});
   		 		
   		 		// set the active
   		    	rootMenu.findActiveLeaf(href);
       	   }
    	};
    	recursiveLoad(0);   	
    }
    
    var initPulldown = function(config){
    	
    	var pullUp = 0;//1;
    	
		var pullDown       = $('<div class="pull-down closed"><ul></ul></div>');
		
		pullDown = pullUp ? pullDown.appendTo('body') : pullDown.prependTo('body');	// doesn't matter

		//var pullDown       = $('<div class="pull-down closed"><ul></ul></div>').prependTo('body');
		
		pullUp ? pullDown.before('<div class="opener-wrapper"><a class="opener">a</a></a>') : pullDown.after('<div class="opener-wrapper"><a class="opener">a</a></a>');
		
    	var pullDownList = pullDown.children('ul');

    	if(config.pulldown.items){
        	$.each(config.pulldown.items, function(i, ob){
        		pullDownList.append('<li><a ' + (ob.url ? 'href="' + globalNavServer + ob.url + '" ' : '') + '>' + ob.label[locale] + '</a></li>')
        	});        		
    	}
    	
		$('.opener-wrapper>.opener').click(function(){
			var pullDown = $('.pull-down');
			if(pullDown.hasClass('closed')){
				pullDown.removeClass('closed');
				pullDown.addClass('opened');
			}
			else{
				pullDown.removeClass('opened');
				pullDown.addClass('closed');					
			}			
		});
    	
		// test utility
		if( $('#conf-local').length == 0 ){
			var boxSizing = '-webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;'
				
			$('body').append('<div id="dev" style="' + boxSizing + ' padding-left:1em; padding-right: 1em;"></div>');
		
			$('#dev').append('<textarea id="conf-local" rows="15" style="width:100%;"></textarea>');
			$('#dev').append('<a id="reload-conf-local">reload</a>');
			
			$('#conf-local').val(JSON.stringify(origConfig, null, 4));
			
			$('#reload-conf-local').click(function(){
				
				$('.pull-down').remove();
				$('.opener-wrapper').remove();
				$('.eu-global-nav').remove();
				globalNav.init(  $.parseJSON(  $('#conf-local').val() )   );		
			});
		
	 	}
    

    };
    
    return {
    	init: function(data){
    	  
    	  if(initialised){
    		  return;
    	  }
    	  initialised = true;
    	  
    	  origConfig = data;
  		  initCSS(data.css);
     	  initHtml(data.html);
          initJS(data.js);
          
          if(data.pulldownConf){
  	  		$.getJSON(globalNavServer + data.pulldownConf + "?callback=?")
			.fail(
			    function(e){
			    	//alert("Error " + JSON.stringify(e));
	      		   // console.log( "Config error [" + configUrl + "]: " + e.statusText + "  " + JSON.stringify(e) );
			    }
			);        	  
          }
    	},
    	initPulldown: function(data){
    		initPulldown(data);
    	},
        load:function(configUrl){
        	$(document).ready(function(){

        		$.getJSON(configUrl + "?callback=?")
	        		.fail(
	        		    function(e){
	              		   // console.log( "Config error [" + configUrl + "]: " + e.statusText + "  " + JSON.stringify(e) );
	        		    }
	        		);
        	});
        },
        getConf:function(){
        	return origConfig;
        }
    }
}();

