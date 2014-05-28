var EuGlobalMenu = function(cmpIn, options){
	
	var self		= this;
	self.cmp		= cmpIn;
	self.ops		= self.cmp.children("ul").children(".item");
	self.label		= self.cmp.children(".menu-label").html();
	self.options	= options;
	self.val		= null;
	self.href		= null;
	
	self.cmp.click(function(e){
		
		//alert("self.cmp.click  " + e.target.nodeName + '   ' + $(e.target).hasClass('eu-global-menu') + '  ' + $(e.target).parent().attr('class')  );

		//$('.eu-global-menu' ).not(self.cmp).removeClass("active");
		self.cmp.toggleClass("active");
		//self.cmp.addClass("active");
		
		e.stopPropagation();
	});
	

	self.cmp.keypress(function(e){
		if(e.keyCode == 13){
			alert("13");
			self.cmp.find(".item:focus a").click();
		}
	});

	
	self.setLabel = function(val){
		if(self.cmp.hasClass('hMenu')){
			return;
		}
		self.cmp.children(".menu-label").html(val);
	};
	
	self.getActiveItem = function(){
		var res = null;
		self.ops.each(function(i, ob){
			if($(ob).hasClass("active")){
				res = $(ob);						
			}
		});
		return res;
	};
	
	self.getActive = function(){
		return self.val;
	};
	
	self.getActiveHref = function(){
		return self.href;
	};
	
	self.setActive = function(val){
		self.cmp.removeClass("selected");
		self.ops.children("a").each(function(i, ob){
			if($(ob).attr("class") == val){
				$(ob).parent().addClass("active");
				if(typeof val != 'undefined'){
					self.cmp.addClass("selected");
					self.val = val;
					
					if(val == ''){
						self.cmp.find('.icon-arrow-3').removeClass('open-menu');
					}
					else{
						self.cmp.find('.icon-arrow-3').addClass('open-menu');
					}
				}
				self.setLabel( $(ob).html() );
			}
			else{						
				$(ob).parent().removeClass("active");						
			}
		});

		
		if(!self.cmp.hasClass('hMenu')){
			self.cmp.removeClass("active");
		}

	};

	
	self.ops.children("a").click(
		function(e){
			
alert("CLICK")	
			var selected = $(this).attr("class");
			self.href = $(this).attr("href");
			
			var href = $(this).attr("href");
			if( href && href.length && href != '#' ){
				window.location = $(this).attr("href");
			}
				
			self.setActive(selected);
			e.stopPropagation();
			return false;

			/*
			if(self.options.fn_item){
				self.options.fn_item(self, selected);
				e.stopPropagation();
				return false;
			}
			*/
		}
	);

	
	/* accessibility */
	
	var keyHandler = new EuAccessibility(
			self.cmp,			
			function(){
				return self.ops.children("a");
			},
			true
	);
	
	self.ops.children("a").add(self.cmp).bind('keydown', keyHandler.keyPress);


	/* exposed functionality */
	return {
		"init" : function(){
			if(self.options.fn_init){
				self.options.fn_init(self);
			}
		},
		"submit":function(){
			if(self.options.fn_submit){
				self.options.fn_submit(self);
			}
		},
		"setActive":function(val, highlight){
			self.setActive(val);
		},
		"getActive":function(){
			return self.getActive();
		}
	};
};
