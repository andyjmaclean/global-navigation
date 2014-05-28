var MenuItem = function (elIn, parentIn) {
	var self          = this;
	self.a            = elIn;
	self.el           = elIn.next('.section');
	self.parent       = parentIn;
	
	self.doOpen = function () {

		var alreadyOpen = self.a.hasClass('active');
		
		self.parent.el.find('.menu-item').removeClass('active');
		self.parent.el.find('.section')  .removeClass('active');

		if(alreadyOpen){
			self.a .removeClass('active');
			self.el.removeClass('active');
		}
		else{
			self.a .addClass('active');
			self.el.addClass('active');
			self.parent.selectionMade();
		}
	};
	
	self.setActive = function () {
		self.doOpen();
	}

	self.doClose = function () {
		self.a .removeClass('active');
		self.el.removeClass('active');	
	}
	
	self.a.on('click', function (e) {
		if(typeof self.a.attr('href') == 'undefined'){
			e.preventDefault();
			self.doOpen();
		}
	});

	self.getSelf = function(){
		return self;
	}
	
	self.getParent = function(){
		return self.parent;
	}
	
	self.getHref= function(){
		var href =  self.a.attr('href');
		//var href =  self.href;
		return typeof href == 'undefined' ? false : href;
	}
	
	// debug fn
	self.getEl = function(){
		return self.el;
	}
	
	return {
		
		open : function (){
			self.doOpen();
		},
		setActive : function (){
			self.doOpen();
		},
		close :  function (){
			self.doClose();
		},
		getLabel : function(){
			return self.a.html();
		},
		getHref : function(){
			return self.getHref();
		},
		getSelf : function(){
			return self;
		},
		getParent : function(){
			return self.getParent();
		},
		click : function(){
			self.doOpen();
		}
		
	};
};
	

var EuMenuBar = function(elIn, recLevel, parent, callbackIn, hash){
	var self		 = this;
	self.parent      = parent;
	self.recLevel    = recLevel ? recLevel : 0;
	self.isRoot      = self.recLevel == 0;
	self.itemObjects = [];
	self.el			 = elIn;
		
	self.callback	 = callbackIn;
	self.subMenus    = [];	
	self.initialised = false;
	
	/* On desktops, the minimum number that will be shown before triggering pseudoPhoneMode.
	 * 
	 * - if true then phone layout is used
	 * 
	 * - if a top level menu can't fit but a child menu can fit we should remain in pseudoPhoneMode
	 * 
	 * - conversely, if a top level menu can fit but a child menu can't we switch to phone mode if 
	 *   the user goes into that submenu, and exit it when they come back up
	 *   
	 *  */
	
	self.minItemsInline  = 1;	
	self.pseudoPhoneMode = false;
	
	
	self.el.addClass('global-nav-menu-bar');

	/* when we don't want to have to provide a page to match */
	//self.dataUrl = self.el.attr('data-url');
	//if(dataUrl.length){
	//	self.catchUrls   =  '';		
	//}
	//self.catchUrls = self.el.attr('data-url');
	
	
	
	// functions

	self.selectionMade = function(){
		self.showLess();
	};
	
	
	self.isPhone = function(){
		//if(self.pseudoPhoneMode){
		//	return true;
		//}
		var phoneDiv = $('#phone-detect').length ? $('#phone-detect') : $('<div id="phone-detect" style="position:absolute;top:-1000px">').appendTo('body');
		var res = phoneDiv.width() == 1;
		//console.log('isPhone = ' + res);
		return res;		
	};

	self.isPseudoPhoneMode = function(){
		var parent = self.getParent();
		if(parent && parent.isPseudoPhoneMode()){
		//	console.log('Parent - returning ps TRUE')
			return true;
		}
		//console.log('no parent - returning ps ' + self.pseudoPhoneMode)
		return self.pseudoPhoneMode;
	};

	self.rowFits = function(){
		// get ref to active section
		
		var result       = true;

		var menuBar       = self.el;
		var menuBarInner  = menuBar.children('.menu-bar-inner');
		var active        = menuBarInner.children('.section.active');
		var paddingHeight = 2 * parseInt(menuBarInner.find('.menu-item').first().css('padding-top'));
		
		// limit row height to one 
		menuBar.addClass('measure-mode');
		active.removeClass('active');

		//console.log(	menuBarInner[0].offsetHeight + " > " +  (menuBar.height() + borderHeight)   );
		
		if(	menuBarInner[0].offsetHeight > menuBar.height() + paddingHeight ){
			
			if(self.isRoot){	
				
				console.log('fitsFalse:  ' + menuBarInner[0].offsetHeight + ' > ' +  menuBar.height() + ' +  '  + paddingHeight );
			}
			
			result = false;
		}

		// restore active and remove row height limit
		active.addClass('active');
		menuBar.removeClass('measure-mode');	
			
		return result;
	};
	
	self.getItems = function(){
		return self.el.children('.menu-bar-inner').children('.menu-item');
	};
	
	self.getMoreItem = function(){
		return self.el.children('.menu-bar-inner').children('.more-item');
	};

	self.getBackItem = function(){
		return self.el.children('.menu-bar-inner').children('.back-item');
	};

	self.getMoreMenu = function(){
		return self.el.children('.menu-bar-inner').children('.more');
	};
	
	self.getSections = function(){
		return self.el.children('.menu-bar-inner').children('.section');
	};
	
	self.getParent = function(){
		return self.parent;			
	};
		
	self.getWidestItem = function(items){
		var max = 0;
		$.each(items, function(i, ob){
			var w = self.isRoot ? $(ob).width() : $(ob).outerWidth();
			w > max ? max = w : false;
		})
		console.log('widest item is ' + max);
		return max;
	}
	
	self.closeItems = function(){

		$.each(self.itemObjects, function(i, ob){
			ob.close();
		});
		
		$.each(self.subMenus, function(i, ob){
			ob.closeItems();
		});
	};
	
	self.showMore = function(e){
		// close other open menus
		self.closeItems();

		self.getBackItem().css('display', (self.isPhone() || self.isPseudoPhoneMode()) ? 'block' : 'none');
		self.getMoreItem().css('display', 'none');

		self.buildMore();
		self.getItems().css('display', 'none');
	};

	self.showLess = function(isRecurse){
		
		/*
		  Called by click on an item or a proxy item:
		   - hides more menu
		   - hides back item
		   - shows items
		   - calls resize, which as well as hiding boundary exceeding divs 
		     divs also serves to show only the lowest (deepest) active menu
		     items
		*/
		
		var displayClassItems = (self.isPhone() || self.isPseudoPhoneMode()) ? 'block' : 'inline-block';//'table-cell';
		
		console.log('showLess (r=' + recLevel + ') will use class ' + displayClassItems )
		
		self.getMoreMenu().css('display', 'none');
		self.getBackItem().css('display', 'none');
		self.getItems()   .css('display', displayClassItems);
				
		/* perhaps only at root level - consider moving into the next block: */
		$.each(self.subMenus, function(i, ob){
			ob.showLess(true);
		});
		
		if(typeof isRecurse == 'undefined'){	
			// transition on phones / pseudoPhone mode
			if(self.initialised && (self.isPhone() || self.isPseudoPhoneMode())  ){
				self.transitionForward(true);
				setTimeout(self.transitionForward, 1);
			}
		}
		self.resize();
	};

	self.transitionBack = function(setup){
		setup ?	self.el.addClass('pre-transition-back') : self.el.removeClass('pre-transition-back');		
	};

	self.transitionForward = function(setup){
		if(setup){
			self.el.addClass('pre-transition-fwd');
		}
		else{
			self.el.removeClass('pre-transition-fwd');			
		}		
	};
	
	/* Mobile / pseudoPhone */
	
	self.goBack = function(e){
		if(typeof $(e.target).attr('href') == 'undefined'){
			self.parent.closeItems();
			self.parent.transitionBack(true);
			self.parent.resize();
			self.parent.transitionBack();			
		}
		else{
			console.log('back does nothing');
		}
	};
	
	/* THE MORE MENU */
	self.buildMore = function(){
		
		var maxRows     = 3;
		var items       = self.getItems();
		
		// TODO hardcoded numbers???
		var colW        = self.getWidestItem(items) + 24 ; // should include more button in this test
		var cmpW        = self.el.width()           - 24;
		
		console.log("will build more menu assuming width of " + cmpW + " px, widest is " + colW );
		
		var cols        = Math.max(parseInt(cmpW / colW), 1);
		var rows        = Math.ceil(items.length / cols); 
		var evenMore    = rows > maxRows;
		
		console.log("Make " + rows + " rows / " + cols + " cols from " + items.length + " items,  evenMore = " + evenMore);
		
		var moreMenu = self.getMoreMenu();
		
		moreMenu.css('display', 'block').empty();
		
		var itemsAdded = 0;
		
		var spacersNeeded  = cols-1;
		var spacerPct      = 5;
		var spacerTotalPct = spacersNeeded * spacerPct;
		var maxOnRow       = rows; 
		    
		/**
		 * maxOnRow: used to avoid the situation where 6 items over 4 cols appears like this:
		 * 
		 * [x][x][x][ ]
		 * [x][x][x][ ]
		 * 
		 * instead of this:
		 * 
 		 * [x][x][x][x]
		 * [x][x][ ][ ]
		 * 
		 * */
		
		for(var i=0; i<cols; i++){
			
			var col = $('<div class="more-col" style="' + (((i+1)<cols) ? 'margin-right:' + spacerPct + '%; ' : '') + 'width:' + parseInt(  (100 - spacerTotalPct) /cols) + '%">').appendTo(moreMenu);
			
			for(var j=0; j<rows; j++){
				if(j < maxOnRow){
					if(itemsAdded<items.length){
						var proxyItem = $('<a class="more-menu-item">' + self.itemObjects[itemsAdded].getLabel() + '</a>').appendTo(col);
						var context = function(){
							var index = itemsAdded;
							proxyItem.click(function(e){
								//moreMenu.css('display', 'none');
								

								
								// menu action or follow link
								var href = self.itemObjects[index].getHref();
								if( href.length ){
									// this is a relative path
									document.location.href = href;
								}
								else{
									self.itemObjects[index].click(e);									
								}
							});						
						}();
						itemsAdded++;
					}
				}
				else{
					// TODO: set aria hidden for these non-functional spacer links
					$('<a class="more-menu-item">&nbsp;</a>').appendTo(col);				
				}
			}
			
			if(i<cols-1){
				maxOnRow = Math.ceil((items.length - itemsAdded) / (cols - (i+1)));				
			}
		}
	};
	
	// end functions

	self.getMoreItem().click(self.showMore);
	self.getBackItem().click(self.goBack);
	
	
	self.getItems().each(function (i, ob) {
		self.itemObjects[self.itemObjects.length] = new MenuItem($(ob), self);
	});

	self.getSections().each(function (i, ob) {
		var subMenu = $(ob).children('.global-nav-menu-bar');
		if(subMenu.length){
			self.subMenus.push(new EuMenuBar(subMenu, self.recLevel + 1, self));
		}
	});

	self.hideInactive = function(){
			
		var show = ( self.isRoot || self.el.closest('.section').hasClass('active') ) && self.el.find('.section.active').length == 0;
		if(!show){
			self.getItems().css('display', 'none');
		}
		$.each(self.subMenus, function(i, ob){
			ob.hideInactive();
		});
	};
	
	self.getActivatingLink = function(){
		return self.el.closest('.section').prev('a');
	};
	
	self.findActiveLeaf = function(href, topScore, matches){
		
		var url      = href.split('/').pop();
		var topScore = topScore ? topScore : 0;
		var matches  = matches ? matches : [];

		var compareUrls = function(url1, url2){
			
			//console.log("compareUrls-orig " + url1 + " and " + url2);
			
			if(url2.replace('../', '').split('/').length==1){
				var stem = url1.split('/');
				stem.pop();
				if(url2.indexOf('../')>-1){
					stem.pop();					
				}
				stem = stem.join('/');
				url2 = stem + '/' + url2;
			}
			
			var score = 0;
			var segments1 = url1.split('/');
			var segments2 = url2.split('/');
			
			while(segments1.length && segments2.length && segments1.pop() == segments2.pop()){
				score++;
			}
			
			//console.log("compareUrls-final " + url1 + " and " + url2 + ", score = " + score);
			
			return score;
		};

		var getMatch = function(ob, href, itemHref, isMenu){
			
			var test = compareUrls(href, itemHref);
			
			if(test > topScore){
				topScore = test;
				while(matches.length){
					matches.pop();
				}
				matches.push(ob.getSelf());
				console.log("set matches (2) to " + ( isMenu ? ob.getHref() + "--menu--" : ob.getHref()  + "--item--" + ob.getLabel()    ) + ", score was " + test)
			}
			else if(test == topScore){
				matches.push( ob.getSelf() );
				console.log("append to matches " + ( isMenu ? ob.getHref() + "--menu--" : ob.getHref()  + "--item--" + ob.getLabel()    ) + ", score was " + test)
			} 			
		};
		
		var getMatches = function(menu){
			var menuHref = self.el.attr('href');
			if(typeof menuHref != 'undefined'){
				getMatch(self, href, menuHref, true);
			}
			$.each(menu.getItemObjects(), function(i, ob){
				var itemHref = ob.getHref();
				if(itemHref){
					getMatch(ob, href, itemHref);
				}
			});
			
			$.each(self.subMenus, function(i, ob){
				var recurseVal = ob.findActiveLeaf(href, topScore, matches);
				matches  = recurseVal['matches'];
				topScore = recurseVal['topScore'];
			});
			
		};
		
		getMatches(self);
		
		
		if(self.isRoot){
			
			console.log("matches: " + matches.length + ", topScore = " + topScore);
			
			var active = matches[0];
			active.doOpen();
			while(active &&  typeof active.getParent != 'undefined' ){
				active = active.getParent();
				if(active){
					active.setActive();
					active.getActivatingLink().addClass('active');
				}
			};
		}
		else{			
			return { "matches" : matches, "topScore" : topScore};
		}
		
	};
	
	self.getItemObjects = function(){
		return self.itemObjects;
	};
	
	self.getHref = function(){
		return self.el.attr('href');
	};
	
	self.getSelf = function(){
		return self;
	};
	
	self.setActive = function(){
		self.el.addClass('active');
		if(self.el.parent().hasClass('section')){
			self.el.parent().addClass('active')
		}
	};
	
	self.resize = function(){
		
		if(!self.el.is(':visible')){
			return;
		}
		
		var isPhone      = self.isPhone();
		var pseudoPhone  = self.isPseudoPhoneMode();
		var displayClass = (isPhone || pseudoPhone) ? 'block' : 'inline-block';
		var menuBack     = self.getBackItem();
		var moreItem     = self.getMoreItem();
		var menuBarItems = self.getItems();
		var moreMenu     = self.getMoreMenu()			
		var showingMore  = isPhone ? false : moreMenu.is(":visible");
		
		var phoneBehaviour = function(){
			var dataDepth = parseInt(menuBack.data('depth'));
			var showBack =  dataDepth>0;
			
			if(showBack){
				$('.global-nav-menu-bar .back-item').each(function(i, ob){
					ob = $(ob);
					if( parseInt(ob.data('depth')) < dataDepth ){
						ob.css('display', 'none');
					}
				});
				menuBack.css('display', 'block');
			}			

			menuBarItems.addClass('can-wrap');

			menuBarItems.css('display', displayClass);
			moreMenu    .css('display', 'none');
			moreItem    .css('display', 'none');

			// hide everything that isn't at the bottom of the active chain
			self.hideInactive();
		};
		
		if(isPhone || pseudoPhone){
			phoneBehaviour();
		}
		else{
			menuBarItems.removeClass('can-wrap');
			moreMenu    .css('display', 'none');
			moreItem    .css('display', 'none');
			menuBack    .css('display', 'none');
			menuBarItems.css('display', displayClass);

			self.pseudoPhoneMode = false;
			
			if(!self.rowFits()){
				
				// show what we can, or trigger pseudo-phone mode if that's not enoguh
				moreItem.css('display', displayClass);
				menuBarItems.css('display', 'none');
				
				$.each(menuBarItems, function(i, ob){
					
					// try and fit one item at a time
					$(ob).css('display', displayClass);
					var fits = self.rowFits();
					
					if(!fits){
						// if it doesn't fit hide it - assuming we haven't yet shown the minimum trigger the phone layout
						if(self.minItemsInline > i){
							self.pseudoPhoneMode = true;
						}
						else{
							$(ob).css('display', 'none');
						}
						return false;							
					}
				});
				
				if(! pseudoPhone ){
					if(showingMore){
						self.showMore();
					}
					else{
						moreItem.css('display', displayClass);
						menuBack   .css('display', 'none');
					}
				}
				else{
					displayClass = 'block';
					phoneBehaviour();
				}
			}
		}
		
		$.each(self.subMenus, function(i, ob){
			ob.resize();
		});	

		/* if showing more item make it fill all remaining width */
		/*
		if(menuBarMore.css('display') == displayClass ){
			self.resetMoreItem(menuBarMore);
			var totalWidth = 0;
			$.each(menuBarItems, function(i, ob){
				ob = $(ob);
				if( ob.css('display') != 'none' ){
					console.log( ob.html()  ) 
					console.log( " w = " + ob.outerWidth()  ) 
					totalWidth += ob.outerWidth();
					
				}
			});
			var moreItemWidth = self.el.width() - totalWidth;
			console.log('self.el.width() = ' + self.el.width() + ', moreItemWidth = ' + moreItemWidth);
			menuBarMore.css('width', moreItemWidth + 'px');
		}
		 */
	};
	
	// timeout needed since recursive functions use the return
	setTimeout(function(){
		self.initialised = true;
		self.resize()	
	}, 1);
	
	return {
		getItemObjects : function(){
			return self.itemObjects;
		},
		closeItems : function(){
			self.closeItems();
		},
		showLess : function(isRecurse){
			self.showLess(isRecurse);
		},
		hideInactive : function(){
			self.hideInactive();
		},
		getParent : function(){
			return self.getParent();
		},
		getActivatingLink : function(){
			return self.getActivatingLink();
	    },
		findActiveLeaf : function(href, topScore, matches){
			return self.findActiveLeaf(href, topScore, matches);
	    },
		getSelf : function(){
			return self;
	    },
		setActive : function(){
			self.setActive();
	    },

		getHref : function(){
			self.getHref();
		},
/*
		close : function(){
			self.close() 	
		},
*/
		transitionBack : function(setup){
			self.transitionBack(setup);
		},
		
		transitionFwd : function(setup){
			self.transitionFwd(setup);
		},
		
		isPseudoPhoneMode : function(){
			return self.isPseudoPhoneMode();
		},
		
		resize : function(){
			self.resize();
		}
	};
};		
