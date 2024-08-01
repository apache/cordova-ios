#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

@interface WkWebViewCacheClear : NSObject

// Method to clear a specific cache type
- (void)clearCacheOfType:(NSString *)cacheType completion:(void (^)(void))completion;

// Method to clear multiple cache types
- (void)clearCaches:(NSArray<NSString *> *)cacheTypes completion:(void (^)(void))completion;

// Method to display cached files, domain, etc.
- (void)displayCacheInfo;

@end