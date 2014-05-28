#!/usr/bin/perl
print "Content-type: text/html\n\n";

print '<!doctype html>';
print '  <html>';
print '    <head>';

# These 3 scripts (unquoted) are what would be included to add GN to a web page in a real deploy
 
print '      <script type="text/javascript" src="http://', $ENV{'SERVER_NAME'}, '/scripts/jquery-1.8.1.js"></script>';
print '      <script type="text/javascript" src="http://', $ENV{'SERVER_NAME'}, '/scripts/GlobalNav2.js"></script>';
print '      <script type="text/javascript">';
print '         globalNavServer ="http://', $ENV{'SERVER_NAME'}, '";';
print '      </script>';
print '    </head>';
print '    <body>';


my @paramStrings = split(/\?/,$ENV{QUERY_STRING});

if( scalar @paramStrings eq 1){

	# read the page

	$url = @paramStrings[0];
	$url =~ s/url=/\.\.\//;
	my @pageUrlParts = split(/\&/, $url);
	$url = @pageUrlParts[0];
	
	
	open(INF, $url);
	@pageData = <INF>;
	close(INF);
	print @pageData;

	# load the page config
	#  - in a real deploy the location of a page's config file would not be derived from paths & params in this way


	# - this assumes the path will always be the same across a given site
	#   an specialised myeuropeana page would may require different
	#   this has to work by parameter

	$confLoc = undef;
	print '$ENV{QUERY_STRING} = ', $ENV{QUERY_STRING};

	my @extraParams = split(/\&/, $ENV{QUERY_STRING});

	foreach (@extraParams) {
		print '<br/>', $_;
		my @extraParam = split(/=/, $_);
		if(scalar @extraParam eq 2){
			if(@extraParam[0] eq 'conf'){
				$confLoc = @extraParam[1];
			}
		}
	}

	print '<br/> $confLoc = ', $confLoc;

	# load default config
	if(not defined($confLoc)){
		my @paths = split(/\//,@paramStrings[0]);
		$confLoc = @paths[1] . '/config2.json';
	}

	print '<br/> $confLoc = ', $confLoc;


	print '      <script type="text/javascript">';
	print '        globalNav.load("http://global-nav/conf/', $confLoc, '");';	
	print '      </script>';

}
print '    </body>';
print '</html>';

