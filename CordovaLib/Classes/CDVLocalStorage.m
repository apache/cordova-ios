/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import "CDVLocalStorage.h"
#import "CDV.h"

@interface CDVLocalStorage ()

@property (nonatomic, readwrite, strong) NSMutableArray* backupInfo;  // array of CDVBackupInfo objects
@property (nonatomic, readwrite, unsafe_unretained) id<UIWebViewDelegate> webviewDelegate;

@end


@implementation CDVLocalStorage

@synthesize backupInfo, webviewDelegate;


- (CDVPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (CDVLocalStorage*)[super initWithWebView:theWebView];
    if (self) 
    {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onResignActive) 
                                                     name:UIApplicationWillResignActiveNotification object:nil];
        
        self.backupInfo = [[self class] createBackupInfo];
        
        // over-ride current webview delegate (for restore reasons)
        self.webviewDelegate = theWebView.delegate;
        theWebView.delegate = self;
        
        // verify the and fix the iOS 5.1 database locations once
        [[self class] __verifyAndFixDatabaseLocations];
    }
    
    return self;
}

#pragma mark -
#pragma mark Plugin interface methods

+ (NSMutableArray*) createBackupInfo
{
    NSMutableArray* backupInfo = [NSMutableArray arrayWithCapacity:3];
    
    // set up common folders
    NSString* appLibraryFolder = [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES)objectAtIndex:0];
    NSString* appDocumentsFolder = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    NSString* backupsFolder = [appDocumentsFolder stringByAppendingPathComponent:@"Backups"];
    
    // create the backups folder
    [[NSFileManager defaultManager] createDirectoryAtPath:backupsFolder withIntermediateDirectories:YES attributes:nil error:nil];
    
    //////////// LOCALSTORAGE
    
    NSString *original = [[appLibraryFolder stringByAppendingPathComponent:
                           (IsAtLeastiOSVersion(@"5.1") && !IsAtLeastiOSVersion(@"6.0")) ? @"Caches" : @"WebKit/LocalStorage"]
                          stringByAppendingPathComponent:@"file__0.localstorage"];
    
    NSString *backup = [backupsFolder stringByAppendingPathComponent:@"localstorage.appdata.db"];
    
    CDVBackupInfo* backupItem = [[CDVBackupInfo alloc] init];
    backupItem.backup = backup;
    backupItem.original = original;
    backupItem.label = @"localStorage database";
    
    [backupInfo addObject:backupItem];
    
    //////////// WEBSQL MAIN DB
    
    original = [[appLibraryFolder stringByAppendingPathComponent:
                 (IsAtLeastiOSVersion(@"5.1") && !IsAtLeastiOSVersion(@"6.0")) ? @"Caches" : @"WebKit/Databases"]
                stringByAppendingPathComponent:@"Databases.db"];
    
    backup = [backupsFolder stringByAppendingPathComponent:@"websqlmain.appdata.db"];
    
    backupItem = [[CDVBackupInfo alloc] init];
    backupItem.backup = backup;
    backupItem.original = original;
    backupItem.label = @"websql main database";
    
    [backupInfo addObject:backupItem];
    
    //////////// WEBSQL DATABASES
    
    original = [[appLibraryFolder stringByAppendingPathComponent:
                 (IsAtLeastiOSVersion(@"5.1") && !IsAtLeastiOSVersion(@"6.0")) ? @"Caches" : @"WebKit/Databases"]
                stringByAppendingPathComponent:@"file__0"];
    
    backup = [backupsFolder stringByAppendingPathComponent:@"websqldbs.appdata.db"];
    
    backupItem = [[CDVBackupInfo alloc] init];
    backupItem.backup = backup;
    backupItem.original = original;
    backupItem.label = @"websql databases";
    
    [backupInfo addObject:backupItem];
    
    return backupInfo;
}

+ (BOOL) copyFrom:(NSString*)src to:(NSString*)dest error:(NSError* __autoreleasing*)error
{
    NSFileManager* fileManager = [NSFileManager defaultManager];
    
    if (![fileManager fileExistsAtPath:src]) {

        NSString* errorString = [NSString stringWithFormat:@"%@ file does not exist.", src];
        if (error != NULL) {
            (*error) = [NSError errorWithDomain:kCDVLocalStorageErrorDomain 
                                           code:kCDVLocalStorageFileOperationError 
                                       userInfo:[NSDictionary dictionaryWithObject:errorString 
                                                 forKey:NSLocalizedDescriptionKey]];
        }
        return NO;
    }
    
    // generate unique filepath in temp directory
    CFUUIDRef uuidRef = CFUUIDCreate(kCFAllocatorDefault);
    CFStringRef uuidString = CFUUIDCreateString(kCFAllocatorDefault, uuidRef);
    NSString* tempBackup = [[NSTemporaryDirectory() stringByAppendingPathComponent:(__bridge NSString*)uuidString]stringByAppendingPathExtension:@"bak"];
    CFRelease(uuidString);
    CFRelease(uuidRef);
    
    BOOL destExists = [fileManager fileExistsAtPath:dest];
    
    // backup the dest
    if (destExists && ![fileManager copyItemAtPath:dest toPath:tempBackup error:error]) {
        return NO;
    } 
    
    // remove the dest
    if (destExists && ![fileManager removeItemAtPath:dest error:error]) { 
        return NO;
    }
    
    // create path to dest
    if (!destExists && ![fileManager createDirectoryAtPath:[dest stringByDeletingLastPathComponent] withIntermediateDirectories:YES attributes:nil error:error]) {
        return NO;
    }
    
    // copy src to dest
    if ([fileManager copyItemAtPath:src toPath:dest error:error]) {
        // success - cleanup - delete the backup to the dest
        if ([fileManager fileExistsAtPath:tempBackup]) {
            [fileManager removeItemAtPath:tempBackup error:error]; 
        }
        return YES;

    } else {
        // failure - we restore the temp backup file to dest
        [fileManager copyItemAtPath:tempBackup toPath:dest error:error];
        // cleanup - delete the backup to the dest
        if ([fileManager fileExistsAtPath:tempBackup]) {
            [fileManager removeItemAtPath:tempBackup error:error]; 
        }
        return NO;
    }
}

- (BOOL) shouldBackup
{
    for (CDVBackupInfo* info in self.backupInfo) {
        if ([info shouldBackup]) {
            return YES;
        }
    }
    return NO;
}

- (BOOL) shouldRestore
{
    for (CDVBackupInfo* info in self.backupInfo) {
        if ([info shouldRestore]) {
            return YES;
        }
    }
    return NO;
}
                
/* copy from webkitDbLocation to persistentDbLocation */
- (void) backup:(CDVInvokedUrlCommand*)command
{
    NSString* callbackId = command.callbackId;

    NSError* __autoreleasing error = nil;
    CDVPluginResult* result = nil;
    NSString* message = nil;
    
    for (CDVBackupInfo* info in self.backupInfo)
    {
        if ([info shouldBackup])
        {
            [[self class] copyFrom:info.original to:info.backup error:&error];
            
            if (callbackId) {
                if (error == nil) {
                    message = [NSString stringWithFormat:@"Backed up: %@", info.label];
                    NSLog(@"%@", message);

                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:message];
                    [self performSelectorOnMainThread:@selector(writeJavascript:) withObject:[result toSuccessCallbackString:callbackId] waitUntilDone:NO];

                } else {
                    message = [NSString stringWithFormat:@"Error in CDVLocalStorage (%@) backup: %@", info.label, [error localizedDescription]];
                    NSLog(@"%@", message);

                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:message];
                    [self performSelectorOnMainThread:@selector(writeJavascript:) withObject:[result toErrorCallbackString:callbackId] waitUntilDone:NO];
                }
            }
        }
    }
}

/* copy from persistentDbLocation to webkitDbLocation */
- (void) restore:(CDVInvokedUrlCommand*)command
{
    NSString* callbackId = command.callbackId;
    
    NSError* __autoreleasing error = nil;
    CDVPluginResult* result = nil;
    NSString* message = nil;
    
    for (CDVBackupInfo* info in self.backupInfo)
    {
        if ([info shouldRestore])
        {
            [[self class] copyFrom:info.backup to:info.original error:&error];
            
            if (error == nil) {
                message = [NSString stringWithFormat:@"Restored: %@", info.label];
                NSLog(@"%@", message);
                
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:message];
                [self performSelectorOnMainThread:@selector(writeJavascript:) withObject:[result toSuccessCallbackString:callbackId] waitUntilDone:NO];
                
            } else {
                message = [NSString stringWithFormat:@"Error in CDVLocalStorage (%@) restore: %@", info.label, [error localizedDescription]];
                NSLog(@"%@", message);
                
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:message];
                [self performSelectorOnMainThread:@selector(writeJavascript:) withObject:[result toErrorCallbackString:callbackId] waitUntilDone:NO];
            }
        }
    }
}

+ (void) __verifyAndFixDatabaseLocations
{
    NSBundle* mainBundle = [NSBundle mainBundle];
    NSString* bundlePath = [[mainBundle bundlePath] stringByDeletingLastPathComponent];
    NSString* bundleIdentifier = [[mainBundle infoDictionary] objectForKey:@"CFBundleIdentifier"];
    NSString* appPlistPath = [bundlePath stringByAppendingPathComponent:[NSString stringWithFormat:@"Library/Preferences/%@.plist", bundleIdentifier]];
    
    NSMutableDictionary* appPlistDict = [NSMutableDictionary dictionaryWithContentsOfFile:appPlistPath];
    BOOL modified = [[self class] __verifyAndFixDatabaseLocationsWithAppPlistDict:appPlistDict
                                                                       bundlePath:bundlePath
                                                                      fileManager:[NSFileManager defaultManager]];

    if (modified) {
        BOOL ok = [appPlistDict writeToFile:appPlistPath atomically:YES];
        [[NSUserDefaults standardUserDefaults] synchronize];
        NSLog(@"Fix applied for database locations?: %@", ok? @"YES":@"NO");    
    }
}

+ (BOOL) __verifyAndFixDatabaseLocationsWithAppPlistDict:(NSMutableDictionary*)appPlistDict
                                              bundlePath:(NSString*)bundlePath
                                             fileManager:(NSFileManager*)fileManager
{
    NSString* libraryCaches = @"Library/Caches";
    NSString* libraryWebKit = @"Library/WebKit";
    
    NSArray* keysToCheck = [NSArray arrayWithObjects:
                            @"WebKitLocalStorageDatabasePathPreferenceKey", 
                            @"WebDatabaseDirectory", 
                            nil];
    
    BOOL dirty = NO;
    
    for (NSString* key in keysToCheck) 
    {
        NSString* value = [appPlistDict objectForKey:key];
        // verify key exists, and path is in app bundle, if not - fix
        if (value != nil && ![value hasPrefix:bundlePath]) 
        {
            // the pathSuffix to use may be wrong - OTA upgrades from < 5.1 to 5.1 do keep the old path Library/WebKit, 
            // while Xcode synced ones do change the storage location to Library/Caches
            NSString* newBundlePath = [bundlePath stringByAppendingPathComponent:libraryCaches];
            if (![fileManager fileExistsAtPath:newBundlePath]) {
                newBundlePath = [bundlePath stringByAppendingPathComponent:libraryWebKit];
            }
            [appPlistDict setValue:newBundlePath forKey:key];
            dirty = YES;
        }
    }
    return dirty;    
}

+ (void) __restoreThenRemoveBackupLocations
{
    NSMutableArray* backupInfo = [CDVLocalStorage createBackupInfo];
    NSFileManager* manager = [NSFileManager defaultManager];
    
    for (CDVBackupInfo* info in backupInfo)
    {
        if ([manager fileExistsAtPath:info.backup]) {
            [self copyFrom:info.backup to:info.original error:nil];
            [manager removeItemAtPath:info.backup error:nil];
            NSLog(@"Restoring, then removing old webstorage backup. From: '%@' To: '%@'.", info.backup, info.original);
        }
    }
}

#pragma mark -
#pragma mark Notification handlers

- (void) onResignActive
{
    UIDevice* device = [UIDevice currentDevice];
    NSNumber* exitsOnSuspend = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"UIApplicationExitsOnSuspend"];

    BOOL isMultitaskingSupported = [device respondsToSelector:@selector(isMultitaskingSupported)] && [device isMultitaskingSupported];
    if (exitsOnSuspend == nil) { // if it's missing, it should be NO (i.e. multi-tasking on by default)
        exitsOnSuspend = [NSNumber numberWithBool:NO];
    }
    
    if (exitsOnSuspend)
    {
        [self backup:nil];
    } 
    else if (isMultitaskingSupported) 
    {
        __block UIBackgroundTaskIdentifier backgroundTaskID = UIBackgroundTaskInvalid;
        
        backgroundTaskID = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^{
            [[UIApplication sharedApplication] endBackgroundTask: backgroundTaskID];
            backgroundTaskID = UIBackgroundTaskInvalid;
            NSLog(@"Background task to backup WebSQL/LocalStorage expired.");
        }];
        CDVLocalStorage __unsafe_unretained *weakSelf = self;
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            
            [weakSelf backup:nil];
            
            [[UIApplication sharedApplication] endBackgroundTask: backgroundTaskID];
            backgroundTaskID = UIBackgroundTaskInvalid;
        });
    }
}

- (void) onAppTerminate
{
    [self onResignActive];    
}

#pragma mark -
#pragma mark UIWebviewDelegate implementation and forwarding

- (void) webViewDidStartLoad:(UIWebView*)theWebView
{
    [self restore:nil];
    
    return [self.webviewDelegate webViewDidStartLoad:theWebView];
}

- (void) webViewDidFinishLoad:(UIWebView*)theWebView 
{
    return [self.webviewDelegate webViewDidFinishLoad:theWebView];
}

- (void) webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error 
{
    return [self.webviewDelegate webView:theWebView didFailLoadWithError:error];
}

- (BOOL) webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    return [self.webviewDelegate webView:theWebView shouldStartLoadWithRequest:request navigationType:navigationType];
}

#pragma mark -
#pragma mark Over-rides


@end


#pragma mark -
#pragma mark CDVBackupInfo implementation

@implementation CDVBackupInfo

@synthesize original, backup, label;

- (BOOL) file:(NSString*)aPath isNewerThanFile:(NSString*)bPath
{
    NSFileManager* fileManager = [NSFileManager defaultManager];
    NSError* __autoreleasing error = nil;

    NSDictionary* aPathAttribs = [fileManager attributesOfItemAtPath:aPath error:&error];
    NSDictionary* bPathAttribs = [fileManager attributesOfItemAtPath:bPath error:&error];
    
    NSDate* aPathModDate = [aPathAttribs objectForKey:NSFileModificationDate];
    NSDate* bPathModDate = [bPathAttribs objectForKey:NSFileModificationDate];
    
    if (nil == aPathModDate && nil == bPathModDate) {
        return NO;
    }
    
    return ([aPathModDate compare:bPathModDate] == NSOrderedDescending || bPathModDate == nil);
}

- (BOOL) item:(NSString*)aPath isNewerThanItem:(NSString*)bPath
{
    NSFileManager* fileManager = [NSFileManager defaultManager];
    
    BOOL aPathIsDir = NO, bPathIsDir = NO;
    BOOL aPathExists = [fileManager fileExistsAtPath:aPath isDirectory:&aPathIsDir];
    [fileManager fileExistsAtPath:bPath isDirectory:&bPathIsDir];
    
    if (!aPathExists) { 
        return NO;
    }
    
    if (!(aPathIsDir && bPathIsDir)){ // just a file
        return [self file:aPath isNewerThanFile:bPath];
    }
    
    // essentially we want rsync here, but have to settle for our poor man's implementation
    // we get the files in aPath, and see if it is newer than the file in bPath 
    // (it is newer if it doesn't exist in bPath) if we encounter the FIRST file that is newer,
    // we return YES
    NSDirectoryEnumerator* directoryEnumerator = [fileManager enumeratorAtPath:aPath];
    NSString* path;
    
    while ((path = [directoryEnumerator nextObject])) {
        NSString* aPathFile = [aPath stringByAppendingPathComponent:path];
        NSString* bPathFile = [bPath stringByAppendingPathComponent:path];
        
        BOOL isNewer = [self file:aPathFile isNewerThanFile:bPathFile];
        if (isNewer) {
            return YES;
        }
    }
    
    return NO;
}

- (BOOL) shouldBackup
{
    return [self item:self.original isNewerThanItem:self.backup];
}

- (BOOL) shouldRestore
{
    return [self item:self.backup isNewerThanItem:self.original];
}

@end
