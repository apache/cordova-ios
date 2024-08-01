#import "WkWebViewCacheClear.h"

@implementation WkWebViewCacheClear

- (NSArray *)getDomains {
    NSString *bundleID = [[NSBundle mainBundle] bundleIdentifier];

    // Extract the domain from the bundle identifier
    NSArray *bundleComponents = [bundleID componentsSeparatedByString:@"."];
    NSString *domain = [NSString stringWithFormat:@"%@.%@", bundleComponents[1], bundleComponents[0]];

    // Create the domains array with the dynamically determined domain and localhost
    NSArray *domains = @[domain, @"localhost"];
    
    return domains;
}

- (void)clearCacheOfType:(NSString *)cacheType completion:(void (^)(void))completion {
    NSArray *domains = [self getDomains];

    WKWebsiteDataStore *dataStore = [WKWebsiteDataStore defaultDataStore];
    NSSet *dataTypes = [NSSet setWithObject:cacheType];
    
    [dataStore fetchDataRecordsOfTypes:dataTypes completionHandler:^(NSArray<WKWebsiteDataRecord *> *records) {
        NSMutableArray<WKWebsiteDataRecord *> *filteredRecords = [NSMutableArray array];
        for (WKWebsiteDataRecord *record in records) {
            for (NSString *domain in domains) {
                if ([record.displayName containsString:domain]) {
                    [filteredRecords addObject:record];
                    break;
                }
            }
        }
        
        [dataStore removeDataOfTypes:dataTypes forDataRecords:filteredRecords completionHandler:^{
            NSLog(@"Cache of type %@ for domains %@ cleared", cacheType, domains);
            if (completion) {
                completion();
            }
        }];
    }];
}

- (void)clearCaches:(NSArray<NSString *> *)cacheTypes completion:(void (^)(void))completion {
    NSArray *domains = [self getDomains];

    WKWebsiteDataStore *dataStore = [WKWebsiteDataStore defaultDataStore];
    NSSet *dataTypes = [NSSet setWithArray:cacheTypes];
    
    [dataStore fetchDataRecordsOfTypes:dataTypes completionHandler:^(NSArray<WKWebsiteDataRecord *> *records) {
        NSMutableArray<WKWebsiteDataRecord *> *filteredRecords = [NSMutableArray array];
        for (WKWebsiteDataRecord *record in records) {
            for (NSString *domain in domains) {
                if ([record.displayName containsString:domain]) {
                    [filteredRecords addObject:record];
                    break;
                }
            }
        }
        
        [dataStore removeDataOfTypes:dataTypes forDataRecords:filteredRecords completionHandler:^{
            NSLog(@"Caches of types %@ for domains %@ cleared", cacheTypes, domains);
            if (completion) {
                completion();
            }
        }];
    }];
}

- (void)displayCacheInfo {
    NSString *bundleID = [[NSBundle mainBundle] bundleIdentifier];
    WKWebsiteDataStore *dataStore = [WKWebsiteDataStore defaultDataStore];
    NSSet *diskCacheType = [NSSet setWithObject:WKWebsiteDataTypeDiskCache];
    
    [dataStore fetchDataRecordsOfTypes:diskCacheType completionHandler:^(NSArray<WKWebsiteDataRecord *> *records) {
        if (records.count > 0) {
            NSLog(@"Disk cache is available:");
            for (WKWebsiteDataRecord *record in records) {
                NSLog(@"Record: %@", record.displayName);
            }
        } else {
            NSLog(@"No disk cache available.");
        }
    }];
}

@end