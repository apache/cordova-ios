#import <Foundation/Foundation.h>

@protocol CDVPluginResultDelegate <NSObject>

-(NSString*)mungePluginResult: (NSString*)result;

@end
