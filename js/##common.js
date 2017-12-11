( function( $ ) {

	/* Ajax requests */

	var $mainList = $( "#main-list" ),
			$searchForm = $( '#search-form' ),
			$search = $( '#search' ),
			
			apiKey = 'Fv9vt97HVlMizqjnYOcWlB0rJlVtUKZp',
			limit = 16,
			offset = 0,
			searchValue,
			timer;


	// Get random posts

	$.get( 'http://api.giphy.com/v1/gifs/trending?api_key=' + apiKey + '&limit=' + limit + '&offset=' + offset )
	.done( function( data ) {
		$mainList.html( renderHTML( data.data ) );
	} );


	// Get more posts on click button

	$( 'body' ).on( 'click', '#show-more', function( event ) {
		event.preventDefault();
		offset += limit;
		loadMorePosts( limit, offset, searchValue );
	} );


	// Load on form submit

	$searchForm.on( 'submit', function( event ) {
		event.preventDefault();
		searchNewPosts();
	} );

	// Load on search fill in
	
	$search.on( 'keyup', function( e ) {
		searchNewPosts();
	} );

	

	// Get more posts on scroll ( "infinite" scroll )

	$( window ).on( 'scroll', function() {
		if( timer ) {
			window.clearTimeout(timer);
		}
		timer = window.setTimeout( function() {
			offset += limit;
			loadMorePostsOnScroll( limit, offset, searchValue );
		}, 100 );
	} );

	
	// Load More Posts on Scroll

	function loadMorePostsOnScroll( limit, offset, search ) {
		if ( $( window ).scrollTop() + $( window ).height() >= ( $( document ).height() - 100 ) ) {
			loadMorePosts( limit, offset, searchValue );
		}
	}


	// Load More Posts

	function loadMorePosts( limit, offset, search ) {
		var searchEx = search ? 'search?q=' + search + '&' : '',
				offersRend = 'trending?';

		offersRend = searchEx ? searchEx : offersRend;

		$.ajax( {
			url: 'http://api.giphy.com/v1/gifs/' + offersRend + 'api_key=' + apiKey + '&limit=' + limit + '&offset=' + offset,
			beforeSend: function() {
				$mainList.addClass( 'main-list--loading' );
			},
			success: function( data ) {
				$mainList.removeClass( 'main-list--loading' );
			},
		} )
		.done( function( data ) {
			$mainList.append( renderHTML( data.data ) );
		} );
	}

	// Search and Load New Posts

	function searchNewPosts() {
		var typeTimer;
		if ( typeTimer ) {
			clearTimeout( typeTimer );
		} else {
			typeTimer = setTimeout( function() {
				if ( searchValue == $search[0].value ) {
					return;
				}
				offset = 0;
				searchValue = $search[0].value;
				searchValueEnc = encodeSpacesURL( searchValue );
				if ( searchValue ) {
					$.get( 'http://api.giphy.com/v1/gifs/search?q=' + searchValueEnc + '&api_key=' + apiKey + '&limit=' + limit + '&offset=' + offset )
					.done( function( data ) {
						if ( data.pagination.total_count != 0 ) {
							$mainList.html( renderHTML( data.data ) );
						} else {
							$.get( 'http://api.giphy.com/v1/gifs/random?api_key=' + apiKey + '&tag=404' )
							.done( function( data ) {
								$mainList.html( renderHTML( data.data ) );
							} );
						}
					} );
				} else {
					$.get( 'http://api.giphy.com/v1/gifs/trending?api_key=' + apiKey + '&limit=' + limit + '&offset=' + offset )
					.done( function( data ) {
						$mainList.html( renderHTML( data.data ) );
					} );
				}
			}, 2000 );
		}
	}


	// Encode URI compomnent

	function encodeSpacesURL ( value ) {
		return encodeURIComponent( value ).replace( /%20/g, '+' );
	}


	// Generate HTML code

	function renderHTML( data ) {
		var htmlstring = '';
		if ( data.length ) {
			for ( var i = 0; i < data.length; i++ ) {
				htmlstring += '<div class="columns__column columns__column--xs-1-2 columns__column--sm-1-4">';
					htmlstring += '<figure class="main-list__item">';
						htmlstring += '<img class="main-list__item-img" src="' + data[i].images.fixed_height_small.url + '" alt="" />';
					htmlstring += '</div>';
				htmlstring += '</div>';
			}
		} else {
			htmlstring += '<div class="columns__column columns__column--sm-1-4">';
				htmlstring += '<figure class="main-list__item">';
					htmlstring += '<img class="main-list__item-img" src="' + data.image_original_url + '" alt="" />';
				htmlstring += '</div>';
			htmlstring += '</div>';
		}
		return htmlstring;
	}




	/*	To Top */
	
	if ( $( '#to-top' ).length ) {
		
		var $toTop = $( "#to-top" ),
				scrollTrigger = 400,
				scrollSpeed = 800,
				toTopActiveClass = "to-top--active",
				timerScroll;


		// Show button on window scroll

		$( window ).on( 'scroll', function() {
			if( timerScroll ) {
				window.clearTimeout(timerScroll);
			}
			timerScroll = window.setTimeout( function() {
				showToTopButton( scrollTrigger );
			}, 100 );
		} );
		

		// Scroll to top on button click	

		$toTop.on( 'click', function( e ) {
			e.preventDefault();
			scrollToPageTop( scrollSpeed );
			return false;
		} );

		function showToTopButton( scrollTrigger ) {
			var scrollTop = $( window ).scrollTop();
			if ( scrollTop > scrollTrigger ) {
				$toTop.addClass( toTopActiveClass );
			} else {
				$toTop.removeClass( toTopActiveClass );
			}
		}

		function scrollToPageTop( scrollSpeed ) {
			$( 'html' ).animate( {
				scrollTop: 0
			}, scrollSpeed );
		}
	}

} ) ( jQuery );
