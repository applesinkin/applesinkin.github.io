( function( $ ) {

	/* Ajax */

	var $search = $( '#search' ),
			$mainList = $( "#main-list" ),
			$searchForm = $( '#search-form' ),
			$listLoader = $( '.main-list__loader' ),
			
			apiKey = 'Fv9vt97HVlMizqjnYOcWlB0rJlVtUKZp',
			infiniteScroll = true,
			limit = 16,
			offset = 0,
			searchValue,
			totalCount,
			imageSrc,
			GIFTimeout,
			timer;


	// Get random posts
	$.get( '//api.giphy.com/v1/gifs/trending?api_key=' + apiKey + '&limit=' + limit + '&offset=' + offset )
	.done( function( data ) {
		$mainList.html( renderHTML( data.data ) );
	} );

	// Get More Posts on Button Click
	$( 'body' ).on( 'click', '#show-more', function( event ) {
		event.preventDefault();
		loadMorePosts( searchValue );
	} );	

	// Get More Posts on Scroll ( "infinite" scroll )
	$( window ).on( 'scroll', function() {
		if( timer ) {
			window.clearTimeout(timer);
		}
		timer = window.setTimeout( function() {
			loadMorePostsOnScroll( searchValue );
		}, 100 );
	} );

	// Load New Posts on Form Submit
	$searchForm.on( 'submit', function( event ) {
		event.preventDefault();
		loadNewPosts();
	} );

	// Load New Posts on Live Search
		$search.on( 'keyup', function( e ) {
		loadNewPosts();
	} );


	// Load Gif on MouseOver
	$( 'body' )
	.on( 'mouseenter', '.main-list__item-img', function() {
		$this = $( this );
		imageSrc = $this.attr( 'src' );

		GIFTimeout = window.setTimeout( function() {
			showGIF( $this );
		}, 500 );
	} )
	.on( 'mouseleave', '.main-list__item-img', function() {
		clearTimeout( GIFTimeout );
		hideGIF( $this );
	} );

	function showGIF( image ) {
		image.attr( 'src', function( img, src ) {
			return imageSrc.replace( '200w_s.gif', '200w.gif' );
		} );
	};

	function hideGIF( image ) {
		image.attr( 'src', function( img, src ) {
			return imageSrc;
		} );
	};

	// Search and Load New Posts
	function loadNewPosts() {
		var typeTimer;
		if ( typeTimer ) {
			clearTimeout( typeTimer );
		} else {
			typeTimer = setTimeout( function() {

				if ( searchValue == $search[0].value ) {
					return;
				}

				$mainList.addClass( 'main-list--loading' );

				resetOffset();
				
				searchValue = $search[0].value;
				searchValueEnc = encodeSpacesURL( searchValue );

				if ( searchValue ) {

					$.get( '//api.giphy.com/v1/gifs/search?q=' + searchValueEnc + '&api_key=' + apiKey + '&limit=' + limit + '&offset=' + offset )
					.done( function( data ) {
						totalCount = data.pagination.total_count;
						if ( totalCount != 0 ) {
							( totalCount > limit ) ? showPagination() : hidePagination();
							$mainList.html( renderHTML( data.data ) );
						} else {
							loadSinglePost404();
						}
					} )
					.fail( function() {
						console.log( 'error' );
					} );

				} else {

					$.get( '//api.giphy.com/v1/gifs/trending?api_key=' + apiKey + '&limit=' + limit + '&offset=' + offset )
					.done( function( data ) {
						showPagination();
						$mainList.html( renderHTML( data.data ) );
					} );

				}


			}, 2000 );
		}
	}

	// Load More Posts on Scroll
	function loadMorePostsOnScroll( search ) {
		if ( $( window ).scrollTop() + $( window ).height() >= ( $( document ).height() - 100 ) ) {
			loadMorePosts( searchValue );
		}
	}

	// Load More Posts
	function loadMorePosts( search ) {
		if ( search && totalCount < ( limit + offset ) ) {
			return;
		}

		increaseOffset();

		var searchVal = search ? 'search?q=' + search + '&' : '',
				offersRend = 'trending?';

		offersRend = searchVal ? searchVal : offersRend;

		$.ajax( {
			url: '//api.giphy.com/v1/gifs/' + offersRend + 'api_key=' + apiKey + '&limit=' + limit + '&offset=' + offset,
			beforeSend: function() {
				$listLoader.addClass( 'main-list__loader--active' );
			},
			success: function( data ) {
				$listLoader.removeClass( 'main-list__loader--active' );
			},
		} )
		.done( function( data ) {
			$mainList.append( renderHTML( data.data ) );
		} );
	};

	// Load Single Post
	function loadSinglePost404() {
		$.get( '//api.giphy.com/v1/gifs/random?api_key=' + apiKey + '&tag=404' )
		.done( function( data ) {
			hidePagination();
			$mainList.html( 'Not Found' + renderHTML( data.data ) );
		} );
	}

	// Generate HTML code
	function renderHTML( data ) {
		var desctopWidthStillSrc;
		var htmlstring = '';
		console.log( data );
		if ( data.length ) {
			for ( var i = 0; i < data.length; i++ ) {
				desctopWidthStillSrc = data[i].images.fixed_width_still.url;

				htmlstring += '<div class="columns__column columns__column--xs-1-2 columns__column--sm-1-4">';
					htmlstring += '<figure class="main-list__item">';
						htmlstring += '<img class="main-list__item-img" src="' + desctopWidthStillSrc + '" alt="" />';
					htmlstring += '</div>';
				htmlstring += '</div>';
			}
		} else {
			htmlstring += '<div class="columns__column columns__column--sm-3-4 text-center">';
				htmlstring += '<figure class="main-list__item">';
					htmlstring += '<img class="main-list__item-img" src="' + data.image_original_url + '" alt="" />';
				htmlstring += '</div>';
			htmlstring += '</div>';
		}
		return htmlstring;
	}

	// Increase Offset
	function increaseOffset() {
		offset += limit;
	}

	// Reset Offset
	function resetOffset() {
		offset = 0;
	}

	// Encode URI compomnent
	function encodeSpacesURL ( value ) {
		return encodeURIComponent( value ).replace( /%20/g, '+' );
	}

	// Hide Pagination
	function hidePagination() {
		if ( $( '.pagination' ).hasClass( 'pagination--hidden' ) ) {
			return;
		} else {
			$( '.pagination' ).addClass( 'pagination--hidden' );
		}
	}

	// Show Pagination
	function showPagination() {
		if ( $( '.pagination' ).hasClass( 'pagination--hidden' ) ) {
			$( '.pagination' ).removeClass( 'pagination--hidden' );
		}
	}

	$( document ).ajaxComplete( function() {
		if ( $mainList.hasClass( 'main-list--loading' ) ) {
			$mainList.removeClass( 'main-list--loading' );
		}

		if ( infiniteScroll && ( ( $( document ).height() ) > $( window ).height() ) ) {
			hidePagination();
		}
	} );


	/*	To Top */
	
	if ( $( '#to-top' ).length ) {
		
		var $toTop = $( "#to-top" ),
				scrollSpeed = 800;
		
		// Scroll to top on button click	

		$toTop.on( 'click', function( e ) {
			e.preventDefault();
			scrollToPageTop( scrollSpeed );
			return false;
		} );

		function scrollToPageTop( scrollSpeed ) {
			$( 'html' ).animate( {
				scrollTop: 0
			}, scrollSpeed );
		}
	}

} ) ( jQuery );