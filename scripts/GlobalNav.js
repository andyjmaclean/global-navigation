var globalNav = function(){

	var origConfig = false;
	var href   = window.location.href;
	
	// set locale
	var locale = href.match(/([?&])locale=[a-z]{2}/);
	locale = locale && locale.length ? locale[0].split('=')[1] : 'en';
	
	// clean href
	href = href.match(/[?]/) ? href.split('?')[0] : href;
	

    var topBar         = false;
    var topBarSections = [];

    // load all css
    var initCSS = function(config){
    	$.each(config.stylesheets, function(i, stylesheet){
        	$('head').append('<link rel="stylesheet" href="' + stylesheet + '"/>');    		
    	});
    };
    
    var initHtml = function(config){

    	var url = href.split('/').pop();
    	var nav = $('<nav class="eu-global-nav container">').prependTo('body');

    	var divider = function(){return '<li class="divider">&nbsp;</li>'};
        var topBar  = $('<section class="top-bar-section">').appendTo(nav);
       
        
    	// Left - Right floats

        var topBarLeft  = $('<ul class="left">').appendTo(topBar);
        var topBarRight = $('<ul class="right">').appendTo(topBar);

        
        
       
        // TODO: remove type and use conf.type
        
		var buildMenu = function(cmp, conf, type, recursions){
			
			var menu = cmp;
	        menu = $('<li class="eu-global-menu ' + (type == 'globalmenu' ? type + ' hMenu' : type) + (recursions==0 ? '' : ' item submenu') + '">').appendTo(cmp);
			
	        if(type == "globalmenu"){
	      	 	menu.append(
      	 			'<span class="icon-logo" style="color:white;"></span>' +
      	 			'<ul title="Europeana"></ul>'
	      	 	);
	        }
	        else if(conf.title){
	      	 	menu.append('<span class="menu-label hide-on-phones"> ' + conf.title[locale] + '</span>'
	      	 			+	'<span class="icon-arrow-3 open-menu hide-on-phones"></span>'
	      	 			+	'<span id="mobile-menu" class="icon-mobilemenu show-on-phones"></span>'
	      	 			+	'<ul title="' + conf.title[locale] + '"></ul>');
	        }
        	else{
	      	 	menu.append('<ul></ul>');
	      	 	menu.addClass('active');
	        }
      	 	menu = menu.children('ul');
      	 	
        	$(conf.items).each(function(i, ob){
        		if(ob.type == "item"){
        			
        			// set active items on page load
        			var active = url == ob.url ? ' active' : '';
	        		menu.append('<li class="item' + active + '"><a href="' + (ob.url ? ob.url : '#') + '" class="' + ob.value + '">' + ob.label[locale] + '</a></li>');
	        		if(active.length){
	        			menu.parents('.eu-global-menu').addClass('active');
	        		}
        		}
        		else if(ob.type == "submenu" || ob.type == "globalmenu" || ob.type == "hMenu"){
//        			buildMenu(menu, ob, ob.type == "globalmenu" ? "globalmenu" : type, recursions +1 );
        			buildMenu(menu, ob, ob.type, recursions +1 );
        		}
        		
        	});			
		};

		// Left
		
		$.each(config.row1.left, function(key, val) {
			
	        if(typeof val == 'object'){
	        	if(val.type == "hMenu"){
	        		buildMenu(topBarLeft, val, "hMenu", 0);
	        	}
	        }
	        
	    //    topBarLeft.append(divider());
		});

		// Right
		
		$.each(config.row1.right, function(key, val){
			
			topBarRight.append(divider());
			
	        if(typeof val == 'string'){
	        	topBarRight.append('<li><a href="#">' + val + '</a></li>');		        	
	        }
	        else if(typeof val == 'object'){
	        	buildMenu(topBarRight, val, "vMenu", 0);
	        }
		});
		
    };
    
    var initJS = function(config){
    	
    	var recursiveLoad = function(index){
    		    		
 		   if(config.scripts[index]){
 	          $.getScript(config.scripts[index], function(){
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
       		    })
       	   }
    	};
    	recursiveLoad(0);   	
    }
    
    return {
    	init: function(data){
    	  origConfig = data;
  		  initCSS(data.css);
          initHtml(data.html);
          initJS(data.js);
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

