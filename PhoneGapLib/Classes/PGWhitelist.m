//
//  PGWhitelist.m
//  PhoneGapLib
//
//  Created by Shazron Abdullah on 11-08-25.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "PGWhitelist.h"

@implementation PGWhitelist

@synthesize whitelist;

- (id) initWithArray:(NSArray*)array
{
    self = [super init];
    if (self) {
        self.whitelist = array;
    }
    
    return self;
}

- (BOOL) schemeIsAllowed:(NSString*)scheme
{
    return ([scheme isEqualToString:@"http"] || 
            [scheme isEqualToString:@"https"] || 
            [scheme isEqualToString:@"ftp"] || 
            [scheme isEqualToString:@"ftps"] );
}

- (BOOL) URLIsAllowed:(NSURL*)url
{
    if (self.whitelist == nil) {
        NSLog(@"ERROR: PGWhitelist was not initialized properly, all urls will be disallowed.");
        return NO;
    }

    // iterate through settings ExternalHosts, check for equality
    NSEnumerator* enumerator = [self.whitelist  objectEnumerator];
    id externalHost = nil;
    NSString* urlHost = [url host];
    
    // only allow known TLDs (since Aug 23rd 2011), and two character country codes
    // does not match internationalized domain names with non-ASCII characters
    NSString* tld_match = @"(aero|asia|arpa|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|xxx|[a-z][a-z])";
    
    // if the url host IS found in the whitelist, load it in the app (however UIWebViewNavigationTypeOther kicks it out to Safari)
    // if the url host IS NOT found in the whitelist, we do nothing
    while (externalHost = [enumerator nextObject])
    {
        NSString* regex = [[externalHost copy] autorelease];
        
        // starts with wildcard match - we make the first '.' optional (so '*.phonegap.com' will match 'phonegap.com')
        if ([regex hasPrefix:@"*."]) { 
            // replace the first two characters '*.' with our regex
            regex = [regex stringByReplacingCharactersInRange:NSMakeRange(0, 2) withString:@"(\\s{0}|*.)"]; // the '*' and '.' will be substituted later
        }
        
        // ends with wildcard match for TLD
        if ([regex hasSuffix:@".*"]) { 
            // replace * with tld_match
            regex = [regex stringByReplacingCharactersInRange:NSMakeRange([regex length]-1, 1) withString:tld_match];
        }
        // escape periods - since '.' means any character in regex
        regex = [regex stringByReplacingOccurrencesOfString:@"." withString:@"\\."];
        // wildcard is match 1 or more characters (to make it simple, since we are not doing verification whether the hostname is valid)
        regex = [regex stringByReplacingOccurrencesOfString:@"*" withString:@".*"];  
        
        NSPredicate* regex_test = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", regex];
        
        if ([regex_test evaluateWithObject:urlHost] == YES)
        {
            // if it matches at least one rule, return 
            return YES;
        }
    }
    
    NSLog([self errorStringForURL:url], @"");
    // if we got here, the url host is not in the white-list, do nothing
    return NO;
}

- (NSString*) errorStringForURL:(NSURL*)url
{
    return [NSString stringWithFormat:@"ERROR whitelist rejection: url='%@'", [url absoluteString]];
}

@end
