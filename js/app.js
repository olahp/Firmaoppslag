//define "constant"
var CONFIG = (function() {
     var private = {
         'URL': 'http://hotell.difi.no/api/json/brreg/enhetsregisteret',
         'ORGFORM_URL' : 'http://hotell.difi.no/api/json/brreg/organisasjonsform',
         'NKODE_URL' : 'http://hotell.difi.no/api/json/brreg/naeringskode'

     };

     return {
        get: function(name) { return private[name]; }
    };
})();

(function( $ ){
	var form = $( "#company-form" );
	var template = $("#template-company").html();

	if ( form.length > 0 )
	{
		var button = form.children( "button[type='submit']" );
		if ( button.length > 0 )
		{
			//check if url has query
			var query_var = getQueryVariable( 'query' );
			if ( query_var )
			{
				//put text in input field
				query_var = query_var.replace( "+", " " );
				$( "input[name='query']" ).val( query_var );
			}

			button.click( function( event ){
				event.preventDefault();

				//get search-results container
				var sr = $( ".search-results" );
				sr.empty();

				//get query
				var query = $( "input[name='query']" ).val();
				if ( query.length > 0 )
				{
					// display loader
					var loader = $( "<div class='loader'></div>" );
					loader.appendTo( sr );

					//ajax
					var search_url = CONFIG.get('URL');
					$.getJSON( search_url, {
						query: query,
					})
						.done(function( data ) {
							//remove loader
							loader.remove();
							if ( data.posts > 0 )
							{
								//sort entries
								data.entries.sort( function ( a, b ) {
									if (a.navn > b.navn)
										return 1;
									if (a.navn < b.navn)
										return -1;
									// a must be equal to b
									return 0;
								});

								$.each( data.entries, function( i, item ) {
									//build addresses
									item.has_businessadr = false;
									if ( item.forretningsadr && item.forradrpostnr )
									{
										item.has_businessadr = true;
									}

									item.has_postadr = false
									if ( item.postadresse && item.ppostnr )
									{
										item.has_postadr = true;
									}
									console.log( item );
									sr.append( Mustache.render( template, item ) );
								});
							}
							else
							{
								sr.append( "<div class='alert'>Nothing found</div>" );
							}
						})
						.fail(function() {
							console.log( "error" );
						});
				}
			} );
		}

		var clear_button = form.children( ".btn-danger" );
		clear_button.click( function( event ){
			//empty search results
			$( ".search-results" ).empty();
			$( "input[name='query']" ).val('');
		} );
	}


})( jQuery );

// Hide/show companies
$( ".search-results" ).on( "click", "h2", function() {
	$( this ).toggleClass( 'open' );
	$( this ).siblings( '.info' ).toggle( 300 );
});

$( ".search-results" ).on( "mouseover", "abbr", function() {
	var abbr = $( this );
	var abbr_title = abbr.attr( 'title' );
	var abbr_class = abbr.attr( 'class' );
	if ( abbr_title == "" )
	{
		//title is empty, get description from api
		var api_query = $( this ).text();
		if ( api_query )
		{
			//check class to see which api to call
			if ( abbr_class == "orgform_abbr" )
			{
				var orgform_url = CONFIG.get('ORGFORM_URL');
				$.getJSON( orgform_url, {
					query: api_query,
				})
					.done( function( json ) {
						//console.log( json.entries[ 0 ].enhetstype_tekst );
						abbr.attr( 'title', json.entries[ 0 ].enhetstype_tekst );
					} );
			}
			else if ( abbr_class == "nkode_abbr" )
			{
				var nkode_url = CONFIG.get('NKODE_URL');
				$.getJSON( nkode_url, {
					query: api_query,
				})
					.done( function( json ) {
						//console.log( json.entries[ 0 ].naerk_tekst );
						abbr.attr( 'title', json.entries[ 0 ].naerk_tekst );
					} );
			}
		}
	}
} );

//query functions
function getQueryVariable( variable )
{
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++)
	{
		var pair = vars[i].split("=");
		if ( pair[0] == variable )
		{
			return pair[1];
		}
	}
	return(false);
}
