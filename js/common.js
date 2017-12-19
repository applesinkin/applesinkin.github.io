( function( $ ) {

	var headerSlider = new Swiper( '#header-slider', {
		effect: 'fade',
		speed: 800,
		autoplay: {
			delay: 10000,
		},
		pagination: {
			el: '.swiper__pagination',
			type: 'bullets',
			bulletClass: 'swiper__bullet',
			bulletActiveClass: 'swiper__bullet--active',
			clickable: true,
		},
	} );

	$( '.page-block__scroll-button' ).on( "click", function( e ) {
		if ( "" !== this.hash ) {
			e.preventDefault();
			var i = this.hash;
			$( 'html, body' ).animate( {
				scrollTop: $( i ).offset().top
			}, 400 )
		}
	});

} )( jQuery )